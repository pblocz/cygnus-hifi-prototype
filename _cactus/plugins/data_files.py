#coding:utf-8

import os,codecs,json, subprocess, unicodedata, yaml
from django.utils.safestring import mark_safe


'''
# creating a custom tag
from cactus.template_tags import register
@register.filter()
def simple_filter(value):
    return "%s!" % value
'''


DATA_PATH = "data/"
DATA = {}
#setattr(DATA,'json', lambda: json.dumps(DATA))

def csonparser(file):
    com = subprocess.Popen(['cson2json',file],stdout=subprocess.PIPE)
    return json.loads(com.communicate()[0].strip())

PARSERS = [
    (['.json'],lambda f: json.load(codecs.open(f,"r")),),
    (['.yaml','.yml'], lambda f: yaml.load(codecs.open(f,'r')),),
    (['.cson'],csonparser),
]

def preBuild(site):
    global DATA
    local = [DATA]
    data_folder= os.path.join(site.path,DATA_PATH)

    # parse data files in folder
    for root,dirs,files in os.walk(data_folder):
        relroot = os.path.relpath(root,data_folder)
        relroot = (relroot if relroot!="." else "")

        # generator for path parts
        def splitgen(path):
            (h,t) = os.path.split(path)
            while h:
                yield h
                (h,t) = os.path.split(t)
            if t: yield t

        # get the dict to modify
        data_chunck = DATA
        for chunk in splitgen(relroot):
            data_chunck = data_chunck[chunk]

        # add subdirectory dictionaries
        for d in dirs: data_chunck[d] = {}

        # for each file, parse its content
        for f in files:
            name,ext = os.path.splitext(f)

            # transform accents and others to similar ascii
            name = unicodedata.normalize('NFKD',name.decode('utf-8'))
            name = name.encode('ascii','ignore').replace("-","_")

            parser_ = [p[1] for p in PARSERS if ext in p[0]]
            if len(parser_):
                parser = parser_[0]

                file_path = os.path.join(root,f)
                data_chunck[name] = parser(file_path)

    DATA['json'] = mark_safe(json.dumps(DATA))#(lambda gen: lambda: json.dumps(gen))(DATA)

def preBuildPage(site, page, context, data):
    context['data'] = DATA
    return context, data
