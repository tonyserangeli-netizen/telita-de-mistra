import json,re,glob,yaml,html,sys
sys.path.insert(0,'/tmp/claude-0/w/build')
ES='/tmp/claude-0/w/es/'
TR=json.load(open(ES+'translate-dnd5e-sdr2-es/compendium/dnd5e.actors24.json'))['entries']
REF={'blinded':'Cegado','charmed':'Hechizado','deafened':'Ensordecido','frightened':'Asustado','grappled':'Agarrado','incapacitated':'Incapacitado','invisible':'Invisible','paralyzed':'Paralizado','petrified':'Petrificado','poisoned':'Envenenado','prone':'Derribado','restrained':'Apresado','stunned':'Aturdido','unconscious':'Inconsciente','exhaustion':'Agotamiento','difficultterrain':'Terreno difícil','dimlight':'Luz tenue','brightlight':'Luz brillante','darkness':'Oscuridad','heavilyobscured':'Muy oscuro','lightlyobscured':'Ligeramente oscuro','concentration':'Concentración','truesight':'Visión verdadera','darkvision':'Visión en la oscuridad','blindsight':'Vista ciega','tremorsense':'Sentido de la vibración','telepathy':'Telepatía','hide':'Esconderse','dash':'Correr','disengage':'Retirarse','dodge':'Esquivar','help':'Ayudar','magic':'Magia','reaction':'Reacción','bonusaction':'Acción adicional','temporaryhitpoints':'Puntos de golpe temporales','damageresistance':'Resistencia','damageimmunity':'Inmunidad','damagevulnerability':'Vulnerabilidad','surprise':'Sorpresa','cover':'Cobertura','halfcover':'Cobertura media','threequarterscover':'Cobertura de tres cuartos','totalcover':'Cobertura total','emanation':'Emanación','cone':'Cono','sphere':'Esfera','cube':'Cubo','line':'Línea','cylinder':'Cilindro','teleportation':'Teletransporte','speed':'Velocidad','flying':'Volar','swimming':'Nadar','climbing':'Trepar','burrowing':'Excavar','shortrest':'Descanso corto','longrest':'Descanso largo','dehydration':'Deshidratación','malnutrition':'Desnutrición','suffocation':'Asfixia','falling':'Caída','hover':'Flotar','unarmedstrike':'Golpe sin armas','grapple':'Agarre','shove':'Empujón','influence':'Influir','search':'Buscar','study':'Estudiar','utilize':'Utilizar','attack':'Atacar','ready':'Preparar','initiative':'Iniciativa','advantage':'Ventaja','disadvantage':'Desventaja','resistance':'Resistencia','vulnerability':'Vulnerabilidad','immunity':'Inmunidad'}
AB={'str':'Fuerza','dex':'Destreza','con':'Constitución','int':'Inteligencia','wis':'Sabiduría','cha':'Carisma'}
DT2={'acid':'de ácido','bludgeoning':'contundente','cold':'de frío','fire':'de fuego','force':'de fuerza','lightning':'de relámpago','necrotic':'necrótico','piercing':'perforante','poison':'de veneno','psychic':'psíquico','radiant':'radiante','slashing':'cortante','thunder':'de trueno'}
DT={'acid':'ácido','bludgeoning':'contundente','cold':'frío','fire':'fuego','force':'fuerza','lightning':'relámpago','necrotic':'necrótico','piercing':'perforante','poison':'veneno','psychic':'psíquico','radiant':'radiante','slashing':'cortante','thunder':'trueno','healing':'curación'}
SK={'inv':'Investigación','ath':'Atletismo','arc':'Arcanos','prc':'Percepción','ste':'Sigilo','itm':'Intimidación','ins':'Perspicacia','dec':'Engaño','per':'Persuasión','acr':'Acrobacias','his':'Historia','med':'Medicina','nat':'Naturaleza','rel':'Religión','slt':'Juego de manos','sur':'Supervivencia','ani':'Trato con animales','prf':'Interpretación'}
SIZE={'tiny':'Diminuto','sm':'Pequeño','med':'Mediano','lg':'Grande','huge':'Enorme','grg':'Gargantuesco'}
TYPE={'aberration':'Aberración','beast':'Bestia','celestial':'Celestial','construct':'Constructo','dragon':'Dragón','elemental':'Elemental','fey':'Feérico','fiend':'Infernal','giant':'Gigante','humanoid':'Humanoide','monstrosity':'Monstruosidad','ooze':'Cieno','plant':'Planta','undead':'Muerto viviente','swarm':'Enjambre'}
AFF={'creature':'criatura','enemy':'enemigo','ally':'aliado','object':'objeto','creatureOrObject':'criatura u objeto','willing':'criatura voluntaria','any':'objetivo','space':'espacio'}
ALIGN={'Lawful Good':'Legal bueno','Neutral Good':'Neutral bueno','Chaotic Good':'Caótico bueno','Lawful Neutral':'Legal neutral','Neutral':'Neutral','Chaotic Neutral':'Caótico neutral','Lawful Evil':'Legal malvado','Neutral Evil':'Neutral malvado','Chaotic Evil':'Caótico malvado','Unaligned':'Sin alineamiento'}
def mod(v):return (int(v)-10)//2
def prof(cr):cr=float(cr or 0);return 2 if cr<5 else 3 if cr<9 else 4 if cr<13 else 5 if cr<17 else 6 if cr<21 else 7 if cr<25 else 8 if cr<29 else 9
def avg(n,d):return n*(d+1)/2
def sg(n):return f"+{n}" if n>=0 else str(n)
def crs(c):
    c=float(c or 0);return {0.125:'1/8',0.25:'1/4',0.5:'1/2'}.get(c,str(int(c)) if c==int(c) else str(c))
def build(y,T):
    s=y['system'];ab={k:int(s['abilities'][k]['value']) for k in AB};cr=s['details'].get('cr') or 0;P=prof(cr)
    items={i['_id']:i for i in y.get('items',[])};trI=(T or {}).get('items',{})
    nameES=(T or {}).get('name') or y['name']
    def iname(iid):return (trI.get(iid) or {}).get('name') or (items.get(iid) or {}).get('name','')
    def actv(it,aid=None):
        A=(it['system'].get('activities') or {})
        if aid and aid in A:return A[aid]
        return next(iter(A.values()),None) if A else None
    def dmgstr(parts,bonusmod=0):
        out=[];tot=0
        for p in parts:
            if (p.get('custom') or {}).get('enabled'):
                f=p['custom'].get('formula','');out.append(f);continue
            n=p.get('number') or 0;d=p.get('denomination') or 0;b=str(p.get('bonus') or '').strip()
            if not n or not d:continue
            bb=bonusmod+(int(b) if re.fullmatch(r'[+-]?\d+',b or '') else 0);a=int(avg(n,d))+bb;tot+=a
            ty=" o ".join(DT2.get(t,t) for t in (p.get('types') or []))
            out.append(f"{a} ({n}d{d}{(' '+sg(bb).replace('+','+ ').replace('-','- ')) if bb else ''}) de daño {ty}".strip());bonusmod=0
        return " más ".join(out)
    def atk(it,aid=None):
        A=actv(it,aid) or {};S=it['system'];rng=S.get('range') or {};props=S.get('properties') or []
        abl=((A.get('attack') or {}).get('ability')) or S.get('ability') or ''
        ranged=bool(rng.get('value')) and not rng.get('reach') and (S.get('type') or {}).get('value') not in ('natural',) and 'thr' not in props
        if not abl:abl='dex' if ranged else ('dex' if 'fin' in props and ab['dex']>ab['str'] else 'str')
        m=mod(ab.get(abl,10));bonus=str((A.get('attack') or {}).get('bonus') or '');mb=S.get('magicalBonus') or 0
        tohit=m+P+(int(bonus) if re.fullmatch(r'[+-]?\d+',bonus) else 0)+(int(mb) if mb else 0)
        reach=rng.get('reach') or 5
        kind="Tirada de ataque a distancia" if ranged else "Tirada de ataque cuerpo a cuerpo"
        where=f"alcance {rng.get('value')}{('/'+str(rng.get('long'))) if rng.get('long') else ''} pies" if ranged else f"alcance {reach} pies"
        D=A.get('damage') or {};parts=[]
        if D.get('includeBase',True) and S.get('damage') and (S['damage'].get('base') or {}).get('number'):
            parts.append(S['damage']['base'])
        parts+=D.get('parts') or []
        dm=dmgstr(parts,m+(int(mb) if mb else 0))
        return tohit,f"{kind}: {sg(tohit)}, {where}",dm
    def lookup(expr,it):
        aid=None;m=re.search(r'activity=(\S+)',expr);aid=m.group(1) if m else None
        if '@name' in expr:return nameES.lower() if 'lowercase' in expr else nameES
        A=actv(it,aid) if it else None
        if '@save.dc' in expr and A:
            dc=((A.get('save') or {}).get('dc') or {});f=str(dc.get('formula') or '')
            if re.fullmatch(r'\d+',f):return f
            c=dc.get('calculation') or 'con';return str(8+P+mod(ab.get(c,10)))
        if '@target.affects.type' in expr and A:return AFF.get(((A.get('target') or {}).get('affects') or {}).get('type') or 'creature','criatura')
        if '@target.affects.count' in expr and A:return str(((A.get('target') or {}).get('affects') or {}).get('count') or '')
        if '@target.template.size' in expr and A:return str(((A.get('target') or {}).get('template') or {}).get('size') or '')
        if '@target.template' in expr and A:return str(((A.get('target') or {}).get('template') or {}).get('size') or '')
        if '@range' in expr and A:return str((it['system'].get('range') or {}).get('value') or '')
        return ''
    def clean(h,it):
        if not h:return ''
        h=html.unescape(h)
        def inl(mm):
            s=mm.group(1).strip();lab=mm.group(2)
            if s.startswith('lookup'):return lookup(s,it)
            if s.startswith('/attack') and it:
                return atk(it)[1]
            if s.startswith('/damage') and it:
                A=actv(it);
                if A and A.get('type')=='attack':return "Impacto: "+atk(it)[2]
                D=(A or {}).get('damage') or {};return dmgstr(D.get('parts') or [])
            if s.startswith('/item'):
                m2=re.search(r'\.(\w+)',s);return iname(m2.group(1)) if m2 else (lab or '')
            if s.startswith('/save'):
                a=re.search(r'ability=(\w+)',s);dc=re.search(r'dc=(\d+)',s);return 'tirada de salvación de '+AB.get(a.group(1) if a else '','característica')+(f' CD {dc.group(1)}' if dc else '')
            if s.startswith('/check') or s.startswith('/skill'):
                a=re.search(r'ability=(\w+)',s);k=re.search(r'skill=(\w+)',s);return 'prueba de '+AB.get(a.group(1) if a else '','característica')+(f' ({SK.get(k.group(1),k.group(1))})' if k else '')
            if s.startswith('/r') or s.startswith('/gmr'):return re.sub(r'^/\w+\s*','',s).split('#')[0].strip()
            return lab or ''
        h=re.sub(r'\[\[(.*?)\]\](?:\{([^}]*)\})?',inl,h)
        h=re.sub(r'&Reference\[([^\]\s]+)[^\]]*\](?:\{([^}]*)\})?',lambda m:m.group(2) or REF.get(m.group(1).lower(),m.group(1)),h)
        h=re.sub(r'@UUID\[[^\]]*\]\{([^}]*)\}',r'\1',h);h=re.sub(r'@\w+\[[^\]]*\](?:\{[^}]*\})?','',h)
        h=re.sub(r'</(p|div|h\d)>','\n',h);h=re.sub(r'<br\s*/?>','\n',h);h=re.sub(r'<li[^>]*>','\n- ',h);h=re.sub(r'<[^>]+>','',h)
        h=re.sub(r'[ \t]+',' ',h);h=re.sub(r' ?\n ?','\n',h);h=re.sub(r'\n{2,}','\n',h)
        h=re.sub(r'(de daño [^.\n]*?) de daño',r'\1',h);h=h.replace('más Impacto: ','más ').replace(', más Impacto: ',', más ')
        h=re.sub(r'@[\w.]+','',h)
        h=re.sub(r'(\d+ \(\d+d\d+(?: [+-] \d+)?\)) (cortante|perforante|contundente|necrótico|psíquico|radiante|de [a-zá-ú]+) de daño',r'\1 de daño \2',h)
        return h.strip()
    acts=[]
    for iid,it in items.items():
        if it.get('type') in ('weapon','feat','spell','equipment','consumable','loot'):
            if it['type'] in ('equipment','consumable','loot'):continue
            A=actv(it);at=((A or {}).get('activation') or {}).get('type') or ''
            if it['type']=='spell':at='spell'
            cat={'action':'accion','bonus':'bonus','reaction':'reaccion','legendary':'legendaria','spell':'conjuro'}.get(at,'rasgo')
            if it['type']=='weapon':cat='accion'
            nm=iname(iid);u=(it['system'].get('uses') or {});rec=[r for r in (u.get('recovery') or []) if r.get('period')=='recharge']
            if rec:nm+=f" (Recarga {rec[0].get('formula')}–6)" if str(rec[0].get('formula'))!='6' else " (Recarga 6)"
            elif u.get('max') and any(r.get('period') in ('day','lr','sr') for r in (u.get('recovery') or [])):nm+=f" ({u.get('max')}/día)"
            d=clean((trI.get(iid) or {}).get('description') or (it['system'].get('description') or {}).get('value',''),it)
            e={'n':nm,'t':cat,'d':d}
            if it['type']=='weapon' or ((A or {}).get('type')=='attack'):
                th,_,dm=atk(it);e['b']=sg(th);e['dmg']=dm
            acts.append(e)
    order={'rasgo':0,'accion':1,'bonus':2,'reaccion':3,'legendaria':4,'conjuro':5}
    acts.sort(key=lambda x:order.get(x['t'],9))
    at=s['attributes'];hp=at['hp'];ac=(at.get('ac') or {}).get('flat') or (10+mod(ab['dex']))
    mv=at.get('movement') or {};vel=", ".join(f"{('' if k=='walk' else {'fly':'volar','swim':'nadar','climb':'trepar','burrow':'excavar'}.get(k,k)+' ')}{v} pies" for k,v in mv.items() if k in('walk','fly','swim','climb','burrow') and v)
    sen=at.get('senses') or {};rg=sen.get('ranges') or {};sens=", ".join(f"{REF.get(k,k).lower() if k in REF else k} {v} pies" for k,v in rg.items() if v)
    pp=10+mod(ab['wis'])+(P*(s.get('skills',{}).get('prc',{}).get('value') or 0))
    tr=s.get('traits') or {}
    def dl(k):return ", ".join(DT.get(x,x) for x in ((tr.get(k) or {}).get('value') or []))
    typ=(s['details'].get('type') or {}).get('value') or ''
    ty=f"{SIZE.get(tr.get('size'),'')} {TYPE.get(typ,typ).lower()}, {ALIGN.get(s['details'].get('alignment') or '',(s['details'].get('alignment') or '').lower())}".strip()
    saves=", ".join(f"{AB[k][:3]} {sg(mod(ab[k])+P)}" for k in AB if s['abilities'][k].get('proficient'))
    skills=", ".join(f"{SK.get(k,k)} {sg(mod(ab[v['ability']])+P*int(v.get('value') or 0))}" for k,v in (s.get('skills') or {}).items() if v.get('value'))
    leg=((s.get('resources') or {}).get('legact') or {}).get('max') or 0
    return {'n':nameES,'en':y['name'],'ty':ty,'cr':crs(cr),'crn':float(cr),'xp':0,'hp':hp.get('max') or hp.get('value'),'hpf':hp.get('formula') or '','ca':ac,'ab':[ab[k] for k in AB],'vel':vel,'sen':(sens+(', ' if sens else '')+f"Percepción pasiva {pp}"),'sv':saves,'sk':skills,'res':dl('dr'),'inm':dl('di'),'vul':dl('dv'),'ci':", ".join(REF.get(x,x) for x in ((tr.get('ci') or {}).get('value') or [])),'leg':leg,'a':acts}
FOL=['aberration','beast','celestial','construct','dragon','elemental','fey','fiend','giant','humanoid','monstrosity','ooze','plant','swarm','undead']
XP={0:10,0.125:25,0.25:50,0.5:100,1:200,2:450,3:700,4:1100,5:1800,6:2300,7:2900,8:3900,9:5000,10:5900,11:7200,12:8400,13:10000,14:11500,15:13000,16:15000,17:18000,18:20000,19:22000,20:25000,21:33000,22:41000,23:50000,24:62000,25:75000,26:90000,27:105000,28:120000,29:135000,30:155000}
out=[];miss=0
for d in FOL:
    for f in sorted(glob.glob(ES+f'dnd5e/packs/_source/actors24/{d}/*.yml')):
        if f.endswith('_folder.yml'):continue
        y=yaml.safe_load(open(f))
        if y.get('type')!='npc':continue
        lic=((y['system'].get('source') or {}).get('license')) or ''
        if lic and lic!='CC-BY-4.0':continue
        T=TR.get(y['_id'])
        if not T:miss+=1
        try:m=build(y,T)
        except Exception as ex:print('ERR',f,ex,file=sys.stderr);continue
        m['xp']=XP.get(m['crn'],0);out.append(m)
out.sort(key=lambda x:x['n'].lower())
print(len(out),'sin traducción',miss,file=sys.stderr)
json.dump({'v':1,'lang':'es','src':'SRD 5.2.1 (Wizards of the Coast, CC BY 4.0); traducción foundryvtt-sinregistrar/translate-dnd5e-sdr2-es (CC BY 4.0); datos foundryvtt/dnd5e','m':out},open('/tmp/claude-0/w/build/bestiario-es.json','w'),ensure_ascii=False,separators=(',',':'))
