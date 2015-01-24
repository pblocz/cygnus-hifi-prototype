#coding:utf-8

import os,codecs,json, subprocess, unicodedata
from django.utils.safestring import mark_safe


from cactus.template_tags import register


UNDERSCORE_PATH = "underscore/"
UNDERSCORE_TEMPLATES = {}

@register.simple_tag
def underscore_templates():
    return mark_safe(''.join([
        '<script type="text/template" id="%s"> %s</script>' % k \
        for k in UNDERSCORE_TEMPLATES.iteritems()]))

def preBuild(site):
    global UNDERSCORE_TEMPLATES


    data_folder= os.path.join(site.path,UNDERSCORE_PATH)

    # parse data files in folder
    for root,dirs,files in os.walk(data_folder):
        # for each file, read its content and add it to templates
        for f in files:
            name,ext = os.path.splitext(f)
            f = os.path.join(root,f)

            # transform accents and others to similar ascii
            name = unicodedata.normalize('NFKD',name.decode('utf-8'))
            name = name.encode('ascii','ignore')

            UNDERSCORE_TEMPLATES[name] = codecs.open(f,"r").read();
