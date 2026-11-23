# Arma index.html a partir de las piezas. Uso: python3 src/build.py  (desde la raíz del proyecto)
import json,os
D=os.path.dirname(os.path.abspath(__file__))+'/'
ORDEN=['app1.js','app2.js','app3.js','app5.js','app6.js','app7.js','app8.js','app9.js','app10.js','app11.js','app12.js','app13.js','app14.js','app15.js','app16.js','app17.js','app18.js','app19.js','app20.js','app21.js','app22.js','app4.js']
js=''.join(open(D+f).read()+'\n' for f in ORDEN)
# diccionario: tr.txt (es|en|pt) manda sobre dict.json
dic=json.load(open(D+'dict.json')) if os.path.exists(D+'dict.json') else {'en':{},'pt':{}}
for l in open(D+'tr.txt',encoding='utf8'):
    p=l.rstrip('\n').split('|')
    if len(p)==3: dic['en'][p[0]]=p[1]; dic['pt'][p[0]]=p[2]
js=js.replace('__DICT__',json.dumps(dic,ensure_ascii=False))
out=open(D+'shell.html').read().replace('__CSS__',open(D+'style.css').read()).replace('__JS__',js)
open(os.path.join(D,'..','index.html'),'w').write(out);print(len(out)//1024,'KB')
