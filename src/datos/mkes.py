import json,re,os,glob,html,sys
import yaml
ES='/tmp/claude-0/w/es/'
EN=json.load(open('/home/claude/telita-de-mistra/compendio-srd-en.json'))
REF={'blinded':'Cegado','blindsight':'Vista ciega','brightlight':'Luz brillante','charmed':'Hechizado','concentration':'Concentración','controllingamount':'cantidad','damageresistance':'Resistencia','damagevulnerability':'Vulnerabilidad','darkness':'Oscuridad','darkvision':'Visión en la oscuridad','dash':'Correr','deafened':'Ensordecido','difficultterrain':'Terreno difícil','dimlight':'Luz tenue','disengage':'Retirarse','dodge':'Esquivar','exhaustion':'Agotamiento','frightened':'Asustado','grappled':'Agarrado','heavilyobscured':'Muy oscuro','incapacitated':'Incapacitado','invisible':'Invisible','lightlyobscured':'Ligeramente oscuro','paralyzed':'Paralizado','petrified':'Petrificado','poisoned':'Envenenado','prone':'Derribado','reaction':'Reacción','restrained':'Apresado','shortrest':'Descanso corto','study':'Estudiar','stunned':'Aturdido','truesight':'Visión verdadera','unconscious':'Inconsciente','longrest':'Descanso largo','hide':'Esconderse','help':'Ayudar','search':'Buscar','magic':'Magia','attack':'Atacar','ready':'Preparar','influence':'Influir','utilize':'Utilizar','surprise':'Sorpresa','cover':'Cobertura','temporaryhitpoints':'Puntos de golpe temporales','hitpoints':'Puntos de golpe','tremorsense':'Sentido de la vibración','telepathy':'Telepatía','speed':'Velocidad','flying':'Volar','swimming':'Nadar','climbing':'Trepar','jumping':'Saltar','teleportation':'Teletransporte'}
AB={'str':'Fuerza','dex':'Destreza','con':'Constitución','int':'Inteligencia','wis':'Sabiduría','cha':'Carisma'}
SK={'inv':'Investigación','ath':'Atletismo','arc':'Arcanos','prc':'Percepción','ste':'Sigilo','itm':'Intimidación','ins':'Perspicacia','dec':'Engaño','per':'Persuasión','acr':'Acrobacias','his':'Historia','med':'Medicina','nat':'Naturaleza','rel':'Religión','slt':'Juego de manos','sur':'Supervivencia','ani':'Trato con animales','prf':'Interpretación'}
DT={'acid':'ácido','bludgeoning':'contundente','cold':'frío','fire':'fuego','force':'fuerza','lightning':'relámpago','necrotic':'necrótico','piercing':'perforante','poison':'veneno','psychic':'psíquico','radiant':'radiante','slashing':'cortante','thunder':'trueno','healing':'curación','temphp':'puntos de golpe temporales'}
miss=set()
def inline(m):
    s=m.group(1).strip()
    if s.startswith('/check') or s.startswith('/skill'):
        a=re.search(r'ability=(\w+)',s);k=re.search(r'skill=(\w+)',s);dc=re.search(r'dc=(\d+)',s)
        t='prueba de '+AB.get(a.group(1) if a else '','característica')+(f' ({SK.get(k.group(1),k.group(1))})' if k else '')
        return t+(f' CD {dc.group(1)}' if dc else '')
    if s.startswith('/save'):
        a=re.search(r'ability=(\w+)',s);dc=re.search(r'dc=(\d+)',s)
        return 'tirada de salvación de '+AB.get(a.group(1) if a else '','característica')+(f' CD {dc.group(1)}' if dc else '')
    if s.startswith('/damage') or s.startswith('/healing'):
        body=re.sub(r'^/\w+\s*','',s);ty=re.search(r'type=(\w+)',body);f=re.sub(r'\s*(type|average|format)=\S+','',body).strip()
        f=f.replace('@item.level','nivel del espacio').replace('(','').replace(')','') if '@' in f else f
        return f+(' de daño de '+DT.get(ty.group(1),ty.group(1)) if ty and ty.group(1) not in('healing','temphp') else (' de '+DT[ty.group(1)] if ty else ''))
    if s.startswith('/r') or s.startswith('/gmr'):
        return re.sub(r'^/\w+\s*','',s).split('#')[0].strip()
    if s.startswith('lookup'):return ''
    miss.add(s);return re.sub(r'^/\w+\s*','',s)
def clean(h):
    if not h:return ''
    h=html.unescape(h)
    h=re.sub(r'\[\[(.*?)\]\](?:\{([^}]*)\})?',lambda m:m.group(2) or inline(m),h)
    h=re.sub(r'&Reference\[([^\]\s]+)[^\]]*\](?:\{([^}]*)\})?',lambda m:m.group(2) or REF.get(m.group(1).lower(),m.group(1)),h)
    h=re.sub(r'@UUID\[[^\]]*\]\{([^}]*)\}',r'\1',h)
    h=re.sub(r'@Embed\[[^\]]*\](?:\{[^}]*\})?','',h)
    h=re.sub(r'@UUID\[[^\]]*\]','',h)
    h=re.sub(r'<\s*br\s*/?>','\n',h)
    h=re.sub(r'</(p|div|h\d)>','\n\n',h);h=re.sub(r'</(tr|li)>','\n',h)
    h=re.sub(r'<li[^>]*>','\n- ',h)
    h=re.sub(r'</t[dh]>',' · ',h)
    h=re.sub(r'<[^>]+>','',h)
    h=re.sub(r'[ \t]+',' ',h);h=re.sub(r' ?\n ?','\n',h);h=re.sub(r'\n{2,}','\n\n',h);h=re.sub(r' · \n','\n',h)
    h='\n'.join(l for l in h.split('\n') if '[[lookup' not in l);h=h.replace('murcié - lago','murciélago');h=re.sub(r'@item\.level','el nivel del espacio',h);h=re.sub(r'@[\w.]+','',h)
    return h.strip()
# ---------- conjuros (SRD 5.2.1) ----------
tr=json.load(open(ES+'translate-dnd5e-sdr2-es/compendium/dnd5e.spells24.json'))['entries']
SC={'abj':'abjuration','con':'conjuration','div':'divination','enc':'enchantment','evo':'evocation','ill':'illusion','nec':'necromancy','trs':'transmutation'}
encl={x['n'].lower():x for x in EN['spells']}
def pl(n,s,p):return f'{n} {s if str(n)=="1" else p}'
def ctime(a):
    t=a.get('type');v=a.get('value') or 1
    return {'action':'1 acción','bonus':'1 acción adicional','reaction':'1 reacción','minute':pl(v,'minuto','minutos'),'hour':pl(v,'hora','horas'),'day':pl(v,'día','días'),'special':'Especial'}.get(t,t or '')
TPL={'cone':'cono','cube':'cubo','cylinder':'cilindro','line':'línea','radius':'radio','sphere':'esfera','square':'cuadrado','wall':'muro','emanation':'emanación'}
def rng(r,tg):
    u=r.get('units');v=r.get('value')
    base={'self':'Personal','touch':'Toque','spec':'Especial','any':'Ilimitado','ft':f'{v} pies','mi':pl(v,'milla','millas'),'':''}.get(u or '',str(v or ''))
    tp=(tg or {}).get('template') or {}
    if u=='self' and tp.get('type'):
        base+=f" ({TPL.get(tp['type'],tp['type'])} de {tp.get('size')} pies)"
    return base
def dur(d,conc):
    u=d.get('units');v=d.get('value')
    t={'inst':'Instantánea','round':pl(v,'asalto','asaltos'),'minute':pl(v,'minuto','minutos'),'hour':pl(v,'hora','horas'),'day':pl(v,'día','días'),'perm':'Hasta que se disipe','disp':'Hasta que se disipe','spec':'Especial','turn':pl(v,'turno','turnos'),'month':pl(v,'mes','meses'),'year':pl(v,'año','años')}.get(u,u or '')
    return ('Concentración, hasta '+t[0].lower()+t[1:]) if conc and t else t
NEWCL={"Dragon's Breath":['Sorcerer','Wizard'],'Aura of Life':['Cleric','Paladin'],'Searing Smite':['Paladin'],'Ensnaring Strike':['Ranger'],'Shining Smite':['Paladin'],'Divine Smite':['Paladin'],'Mind Spike':['Sorcerer','Warlock','Wizard'],'Ice Knife':['Druid','Sorcerer','Wizard'],'Elementalism':['Druid','Sorcerer','Wizard'],'Vitriolic Sphere':['Sorcerer','Wizard'],'Sorcerous Burst':['Sorcerer'],'Phantasmal Force':['Bard','Sorcerer','Wizard'],'Charm Monster':['Bard','Druid','Sorcerer','Warlock','Wizard'],'Summon Dragon':['Wizard'],'Hex':['Warlock'],'Befuddlement':['Bard','Druid','Warlock','Wizard'],'Chromatic Orb':['Sorcerer','Wizard'],'Power Word Heal':['Bard','Cleric'],'Ray of Sickness':['Sorcerer','Wizard'],'Dissonant Whispers':['Bard'],'Tsunami':['Druid'],'Arcane Vigor':['Sorcerer','Wizard'],'Starry Wisp':['Bard','Druid']}
spells=[];nomatch=[]
for f in sorted(glob.glob(ES+'dnd5e/packs/_source/spells24/**/*.yml',recursive=True)):
    y=yaml.safe_load(open(f));
    if y.get('type')!='spell':continue
    sid=y['_id'];T=tr.get(sid)
    if not T:nomatch.append(y['name']);continue
    s=y['system'];props=s.get('properties') or []
    co=', '.join([c for c,p in (('V','vocal'),('S','somatic'),('M','material')) if p in props])
    mat=clean(T.get('materials') or '')
    if 'M' in co and mat:co+=f' ({mat})'
    e=encl.get(y['name'].lower()) or {'cl':NEWCL.get(y['name'],[])}
    spells.append({'n':T['name'],'en':y['name'],'lv':s.get('level',0),'sc':SC.get(s.get('school'),s.get('school')),'ri':'ritual' in props,'ct':ctime(s.get('activation') or {}),'rg':rng(s.get('range') or {},s.get('target')),'co':co,'du':dur(s.get('duration') or {},'concentration' in props),'cn':'concentration' in props,'cl':(e or {}).get('cl',[]),'d':clean(T.get('description',''))})
spells.sort(key=lambda x:(x['n'].lower()))
print('spells',len(spells),'notr',nomatch[:10],file=sys.stderr)
# ---------- dotes (SRD 5.2.1) ----------
ftr=json.load(open(ES+'translate-dnd5e-sdr2-es/compendium/dnd5e.feats24.json'))['entries']
CAT={'origin':'Dote de origen','general':'Dote general','fightingStyle':'Dote de estilo de combate','epicBoon':'Don épico'}
feats=[]
for f in sorted(glob.glob(ES+'dnd5e/packs/_source/feats24/**/*.yml',recursive=True)):
    y=yaml.safe_load(open(f));T=ftr.get(y.get('_id'))
    if not T or y.get('type')!='feat':continue
    s=y['system'];st=(s.get('type') or {}).get('subtype','');req=(s.get('requirements') or '')
    ty=CAT.get(st,'Dote')
    lv=(s.get('prerequisites') or {}).get('level')
    if lv:ty+=f' · Requisito: nivel {lv}+'
    feats.append({'n':T['name'],'ty':ty,'d':clean(T.get('description',''))})
feats.sort(key=lambda x:x['n'].lower())
print('feats',len(feats),file=sys.stderr)
# ---------- ítems mágicos (SRD 5.1, ravanno) ----------
it=json.load(open(ES+'ravanno-dnd5e-es/compendium/dnd5e.items.json'))['entries']
ALIAS={'Adamantine Armor':('Armadura de adamantina','Adamantine Plate Armor'),'Ammunition, +1, +2, or +3':('Munición +1, +2 o +3','Arrow +1'),'Amulet of Proof Against Detection and Location':(None,'Amulet of Proof against Detection and Location'),
 'Armor, +1, +2, or +3':('Armadura +1, +2 o +3','Chain Mail +1'),'Armor of Resistance':('Armadura de resistencia','Plate Armor of Resistance'),'Bag of Tricks':('Bolsa de trucos','Bag of Tricks (Grey)'),'Belt of Giant Strength':('Cinturón de fuerza de gigante','Belt of Hill Giant Strength'),
 'Berserker Axe':('Hacha del berserker','Berserker Battleaxe'),'Carpet of Flying':('Alfombra voladora','Carpet of Flying (5x7)'),'Dancing Sword':('Espada danzante','Dancing Longsword'),'Defender':('Defensora','Defender Longsword'),'Dragon Slayer':('Matadragones','Dragon Slayer Longsword'),
 'Elemental Gem':('Gema elemental','Elemental Gem of Fire'),'Feather Token':('Talismán de pluma','Feather Token Fan'),'Figurine of Wondrous Power':('Figurilla de poder maravilloso','Figurine of Wondrous Power (Onyx Dog)'),'Flame Tongue':('Lengua de fuego','Flame Tongue Longsword'),
 'Frost Brand':('Marca de escarcha','Frost Brand Longsword'),'Giant Slayer':('Matagigantes','Giant Slayer Longsword'),'Holy Avenger':('Vengadora sagrada','Holy Avenger Longsword'),'Horn of Valhalla':('Cuerno de Valhalla','Brass Horn of Valhalla'),'Ioun Stone':('Piedra Ioun','Ioun Stone of Mastery'),
 'Luck Blade':('Hoja de la suerte','Luck Blade Longsword'),'Mithral Armor':('Armadura de mithral','Mithral Plate Armor'),'Nine Lives Stealer':('Robanueve vidas','Nine Lives Stealer Longsword'),'Potion of Giant Strength':('Poción de fuerza de gigante','Potion of Hill Giant Strength'),
 'Potion of Resistance':('Poción de resistencia','Potion of Fire Resistance'),'Ring of Elemental Command':('Anillo de mando elemental','Ring of Fire Elemental Command'),'Ring of Resistance':('Anillo de resistencia','Ring of Fire Resistance'),'Shield, +1, +2, or +3':('Escudo +1, +2 o +3','Shield +1'),
 'Spell Scroll':('Pergamino de conjuro','Spell Scroll 1st Level'),'Sword of Life Stealing':('Espada robavidas','Longsword of Life Stealing'),'Sword of Sharpness':('Espada afilada','Longsword of Sharpness'),'Sword of Wounding':('Espada hiriente','Longsword of Wounding'),
 'Vicious Weapon':('Arma despiadada','Vicious Longsword'),'Vorpal Sword':('Espada vorpalina','Vorpal Longsword'),'Wand of the War Mage, +1, +2, or +3':('Varita del mago de guerra +1, +2 o +3','Wand of the War Mage +1'),'Weapon, +1, +2, or +3':('Arma +1, +2 o +3','Longsword +1')}
TYW=[('Wondrous item','Objeto maravilloso'),('Armor','Armadura'),('Weapon','Arma'),('Potion','Poción'),('Ring','Anillo'),('Rod','Cetro'),('Scroll','Pergamino'),('Staff','Bastón'),('Wand','Varita'),
 ('requires attunement by a spellcaster','requiere sintonización por un lanzador de conjuros'),('requires attunement by a ','requiere sintonización por un '),('requires attunement','requiere sintonización'),
 ('very rare','muy raro'),('uncommon','poco común'),('common','común'),('rare','raro'),('legendary','legendario'),('artifact','artefacto'),('rarity varies','rareza variable'),('rarity by figurine','rareza según la figurilla'),
 ('any','cualquiera'),(' or ',' o '),('medium or heavy','media o pesada'),('but not hide','pero no de pieles'),('light','ligera'),('medium','media'),('heavy','pesada'),('plate','de placas'),('shield','escudo'),('scale mail','cota de escamas'),('studded leather','cuero tachonado'),('chain shirt','camisote de mallas'),
 ('sword','espada'),('longsword','espada larga'),('axe','hacha'),('ammunition','munición'),('arrow','flecha'),('mace','maza'),('trident','tridente'),('dagger','daga'),('javelin','jabalina'),('scimitar','cimitarra'),('greatsword','mandoble'),('that deals slashing damage','que haga daño cortante'),
 ('bard','bardo'),('cleric','clérigo'),('druid','druida'),('paladin','paladín'),('sorcerer','hechicero'),('warlock','brujo'),('wizard','mago'),('ranger','explorador'),('fighter','guerrero'),('dwarf','enano'),('creature of good alignment','criatura de alineamiento bueno'),('creature','criatura'),('of','de'),('and','y'),('varies','variable')]
FIX=[('cualquiera ','cualquier '),(', o ',' o '),('longbow','arco largo'),('maul','mazo'),('warhammer','martillo de guerra'),('outdoors at night','al aire libre de noche'),('evil alignment','alineamiento malvado'),('un criatura','una criatura'),('silver o brass','plata o latón'),('bronze','bronce'),('iron','hierro'),('cualquier)','cualquiera)')]
def ty_es(t):
    o=t
    for a,b in TYW:o=re.sub(r'(?<![A-Za-zÁ-ú])'+re.escape(a.strip())+r'(?![A-Za-zÁ-ú])',b.strip(),o,flags=re.I) if a.strip()!='or' else o.replace(' or ',' o ')
    for a,b in FIX:o=o.replace(a,b)
    return o
HEAD=re.compile(r'^(Objeto maravilloso|\(Requiere sintonizaci[oó]n[^)]*\)|Arma|Armadura|Anillo|Poci[oó]n|Varita|Bast[oó]n|Cetro|Pergamino)[^.\n]{0,90}$',re.I)
def strip_head(d):
    ps=d.split('\n\n')
    while ps and HEAD.match(ps[0].strip()) and len(ps)>1:ps.pop(0)
    return '\n\n'.join(ps)
items=[];left=[]
for x in EN['items']:
    nm,src=ALIAS.get(x['n'],(None,x['n']))
    T=it.get(src)
    if not T:left.append(x['n']);continue
    items.append({'n':nm or T['name'],'en':x['n'],'ty':ty_es(x.get('ty','')),'at':x.get('at',False),'d':strip_head(clean(T.get('description','')))})
items.sort(key=lambda x:x['n'].lower())
print('items',len(items),'left',left,file=sys.stderr)
print('missinline',list(miss)[:10],file=sys.stderr)
out={'v':2,'lang':'es','src':'SRD 5.2.1 (conjuros y dotes) y SRD 5.1 (ítems mágicos) en español, de Wizards of the Coast, CC BY 4.0. Traducciones: foundryvtt-sinregistrar/translate-dnd5e-sdr2-es (CC BY 4.0) y ravanno/ravanno-dnd5e-es (MIT).','spells':spells,'items':items,'feats':feats}
json.dump(out,open('/tmp/claude-0/w/build/compendio-srd-es.json','w'),ensure_ascii=False,separators=(',',':'))
