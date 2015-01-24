/*
  Mini-módulo para renderizar de manera dinámica algunos datos
  Preguntar a pablo por funcionamiento

  Manera de funcionar es:

  - drender.getvar(dot-string) devuelve el valor de la variable
  - drender.setver(dot-string,valor) pone la variable al valor y
                                     actualiza los elementos

  - en /underscore se añaden de templates, su nombre (sin extensión)
    se usa como el id del template
*/

var drender = (function(doc,win,$){

    // configure underscore templates
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g,
        evaluate: /\{%([\s\S]+?)%\}/g
    };

    var ret = {}
    var templates;
    var DATA_J = "APP_DATA" in win.localStorage ? win.localStorage.APP_DATA : null,
        DATA = DATA_J ? JSON.parse(DATA_J) : win.APP_DATA;


    /**
       Retrieves a value from o from a dot-string, an element as you would access it.
       - prop1.prop2 --> usual access with .
       - prop1[integer] --> array access
       - prop1[{dot-string}] --> uses dot-string as an index (fetch its value first) for prop1
     */
    function byString(o, s) {
        // transfor, {var} to its var, for example array[{var}] to access array indirectly
        s = s.replace(/\{([^}]+)\}/g, function(match, gr1, offset, string) {
            return byString(o,gr1)[0];
        });

        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        var a = s.split('.'), prev_o = null, prev_idx= null;
        while (a.length) {
            var n = a.shift();
            if (n in o) {
                prev_o = o;
                prev_idx = n;
                o = o[n];
            } else {
                return;
            }
        }
        return [o,prev_o,prev_idx];
    }


    // Data getters and setters for global app data
    ret.getvar = function(s){ return byString(DATA,s)[0]; }
    ret.setvar = function(s,v) {
        var c = _.isFunction(v) ? v : function() { return v; }
        var vars = byString(DATA,s);

        vars[1][vars[2]] = c(vars[0]); // update actual value of

        // update localStorage, it is only text, so first json it
        DATA_J = JSON.stringify(DATA);
        win.localStorage.APP_DATA = DATA_J;


        // rerender any element with the variable
        ret.drender("[data-var='"+s+"']");

        return ret;
    }


    /** update templates var */
    ret.repopulate_templates = function() {
        templates = $("script[type='text/template']");
    }

    /** renders a template (given by its id) using variable data **/
    ret.render_template = function(template,variable) {
        var template = templates.filter('#'+template).eq(0).text();
        return _.template(template)({"data":ret.getvar(variable)});
    }



    /** renders all templates */
    ret.drender_all = function() {
        $('.dynamic-render,.drender').each(function(){ ret.drender(this); });
    }

    /** renders an element that can be passed to jquery factory */
    ret.drender = function(el) { el = $(el); if(!el.length) return;
        var template = el.data('template'), variable =el.data('var');

        if(template) el.html( ret.render_template(template,variable) );
        else el.html( ret.getvar(variable) );
    }

    ret.drender_if_possible = function(el) {
	el = $(el);
	if(el.hasClass('dynamic-render') || el.hasClass('drender')) 
	    return ret.drender(el);
    }


    $(function(){
        ret.repopulate_templates();
        ret.drender_all();
    });

    return ret;
})(document,window,jQuery);


// Definición del calendario
$(function(){
    function myDateFunction(id) {
        var date = $("#" + id).data("date");
        var hasEvent = $("#" + id).data("hasEvent");
        return true;
    }

    $("#app-calendar").zabuto_calendar({
        language: "es",
        data: APP_DATA.notifications.calendar,
        action: function() { return myDateFunction(this.id); }
    });
})

$(function(){
    // Definición del selectpicker de la busqueda en la barra superior
    $('.search-select').selectpicker({'showSubtext': true});


    // downcount
    $('.countdown').each(function(){
        var date=$(this).data('date').split(' ');
        date[0] = date[0].substr(3, 2)+"/"+date[0].substr(0, 2)+"/"+date[0].substr(6, 4);

        $(this).downCount({date: date.join(' '), offset: +1});
    });

    
    // editable setup
    $('.editable').editable({
	mode: 'inline',
	success: function(resp,val) { 
	    var v = $(this).data('var');
	    drender.setvar(v,val);
	}
    });


    // set filter for entregas perfil
    $('.filterable').btsListFilter(
	'.search-input input',  // input element
	{itemChild: '.media-heading,.text-muted', // childrens where to look
	 itemEl: '.media',
	 initial: false,
	 resetOnBlur: false,
	});


    // apuntes like and unlike
    $('.media.apuntes .btn-save').click(function(){
	var v = $(this).closest('.media').data('var');
	$(this).toggleClass('saved');
	var save = $(this).hasClass('saved');

	if(save) {
	    drender.setvar('notifications.usuario.perfil.apuntes', 
			   function(a){ a.push(v); return a; });
	} else {
	    drender.setvar('notifications.usuario.perfil.apuntes', 
			   function(a){ return a.filter(
			       function(el) { return el!=v;}); });
	}
	
	// notify the changes
	var text=(save ? 
	 "Guardado <a href='#'>{0}</a> en tu perfil" : 
	 "Eliminado <a href='#'>{0}</a> de tu perfil")
	    .replace('{0}', drender.getvar(v+".nombre"));
	$.growl(text);
    }).each(function() {
	var saved = drender.getvar('notifications.usuario.perfil.apuntes');
	$(this).toggleClass('saved',
                  _.contains( saved,$(this).closest('.media').data('var')));
    });

 // dudas like and unlike
    $('.media.dudas .btn-save').click(function(){
	var v = $(this).closest('.media').data('var');
	$(this).toggleClass('saved');
	var save = $(this).hasClass('saved');

	if(save) {
	    drender.setvar('notifications.usuario.perfil.dudas', 
			   function(a){ a.push(v); return a; });
	} else {
	    drender.setvar('notifications.usuario.perfil.dudas', 
			   function(a){ return a.filter(
			       function(el) { return el!=v;}); });
	}
	
	// notify the changes
	var text=(save ? 
	 "Guardado <a href='#'>{0}</a> en tu perfil" : 
	 "Eliminado <a href='#'>{0}</a> de tu perfil")
	    .replace('{0}', drender.getvar(v+".titulo"));
	$.growl(text);
    }).each(function() {
	var saved = drender.getvar('notifications.usuario.perfil.dudas');
	$(this).toggleClass('saved',
                  _.contains( saved,$(this).closest('.media').data('var')));
    });



    // slimscroll para eventos
    $('.dropdown-menu .event-list').each(function(){
	$(this).slimScroll({
	    height: "auto",
	});
    });
});


// Configure growl notifications
$.growl(false, {
    type: "warning",
    placement: { from: "bottom", align: "left" },
    allow_dismiss: false,
});
