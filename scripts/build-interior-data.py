#!/usr/bin/env python3
"""Derive safe, structured interior content from src/data/site.json (requires beautifulsoup4)."""
from bs4 import BeautifulSoup
from pathlib import Path
from urllib.parse import urlsplit
from collections import Counter
import json,re

root=Path(__file__).resolve().parent.parent
source=json.loads((root/'src/data/site.json').read_text())
pack={}
fallback='product-placeholder.svg'
public=root/'public'
def path(p): return p if p=='/' else '/'+p.strip('/')
def canonical(p):
    if not p.startswith('/'): return ''
    p=urlsplit(p).path
    return path(p)
def title(t): return re.sub(r'\s+', ' ', t or '').strip()
def label(p):
    return p.strip('/').rsplit('/',1)[-1].removesuffix('.html').replace('-',' ').title()
def asset_image(src):
    if not src or not src.startswith(('/assets/','/hero/')) or src.endswith((fallback,'brand-placeholder.svg')): return ''
    sub=src.lstrip('/')
    if '..' in Path(sub).parts or not (public/sub).is_file(): return ''
    return src

def get_images(b):
    if not b: return []
    return list(dict.fromkeys(u for a in b.find_all('img') if (u:=asset_image(a.get('src')))))[:10]
def plain(b): return title(b.get_text(' ',strip=True)) if b else ''
def links(b, allowed=None):
    if not b: return []
    return list(dict.fromkeys(h for a in b.select('a[href]') if (h:=canonical(a['href'])) in source_paths and h!='/' and (allowed is None or h.startswith(allowed))))
def clean(b):
    if not b: return ''
    b=BeautifulSoup(str(b),'html.parser')
    for x in b.select('script,style,iframe,video,audio,object,embed,form,button,svg,link,input,meta,.fenxiang,.share,.related,.more,.text-link,.addthis_sharing_toolbox'):
        if x.parent: x.decompose()
    allowed=set('h1 h2 h3 h4 h5 h6 p br hr ul ol li strong b em i small sup sub blockquote figure figcaption img table thead tbody tfoot tr td th a'.split())
    for x in b.find_all():
        if x.name not in allowed: x.unwrap(); continue
        attrs=x.attrs; x.attrs={}
        if x.name=='img':
            if not (u:=asset_image(attrs.get('src'))): x.decompose(); continue
            x.attrs={'src':u,'alt':title(attrs.get('alt')),'loading':'lazy'}
        if x.name in {'td','th'}:
            for k in ('rowspan','colspan'):
                v=attrs.get(k,'')
                if str(v).isdigit(): x[k]=v
        if x.name=='a':
            h=canonical(attrs.get('href',''))
            if h not in source_paths or h=='/': x.unwrap()
            else: x['href']=h
    for heading in b.select('h1,h2,h3,h4,h5,h6'):
        if not heading.get_text(strip=True) and not heading.find('img'): heading.decompose()
    return re.sub(r'\btab_boxEnding\b','',str(b)).strip()

source_paths={path(p) for p in source}|{'/search','/panorama','/404'}
for raw,x in source.items():
    p=path(raw)
    if p=='/': continue
    t=x['type']; h=x['html']; name=title(x['title'])
    pagination=re.fullmatch(r'(.+)/index_(\d+)\.html',p)
    if pagination:
        base=pagination.group(1)
        base_entry=source.get(base+'/') or source.get(base)
        if base_entry and base_entry['type'] in {'product-list','faq-list','news-list'}:
            t=base_entry['type']
        else: pagination=None
    pending='identity-content-pending' in h or t=='placeholder'
    d={'p':p,'t':t,'name':name if name and not name.startswith('/') else label(p)}
    if pagination: d.update(base=base, page=int(pagination.group(2)))
    if p in pack: continue
    pack[p]=d
    if pending: d['pending']=True
    if p=='/contact.html': d['t']='contact';d['name']='Contact us';continue
    if p in {'/certificate','/certificate/domestic','/certificate/international'}: d['t']='certificate';continue
    if p in {'/service.html','/service-guarantee.html','/shopping-guide.html','/method-of-payment.html','/the-contract-sample'}: d['t']='service';continue
    if p in {'/video','/test-video','/factory-show','/customer-witness'} or p.startswith('/social-media'): d['t']='media';continue
    if p in {'/company-profile.html','/history'}: d['t']='company';continue
    if pending: continue
    b=BeautifulSoup(h,'html.parser')
    if t=='product' or p.startswith('/yincang/'):
        d['t']='product'; d['name']=plain(b.select_one('.protop_right h1') or b.h1) or d['name'].split('|')[0].strip()
        if p.startswith('/yincang/'):d['hidden']=True
        imgs=get_images(b.select_one('.protop_left'))
        if imgs:d['photos']=imgs
        specs=[]
        for row in b.select('.protop_right > p:not(.help)'):
            k=row.find('span')
            if k and (key:=plain(k).rstrip(':：')):
                k.extract(); v=plain(row)
                if 0<len(v)<165:specs.append([key,v])
        if specs:d['specs']=specs
        pane=b.select_one('.tab_box')
        labels=[plain(i) for i in b.select('.tab_menu li')]
        if pane:
            sections=[]
            technical=[]
            for idx,div in enumerate(pane.select('.mainbox')):
                section_name=labels[idx] if idx<len(labels) and labels[idx] else ['Overview','Structure','Applications','Technical data'][min(idx,3)]
                if re.search(r'overview|introduction',section_name,re.I):
                    for table in div.find_all('table'):
                        first=plain(table.find('tr')).lower()
                        if len(table.find_all('tr'))>=3 and sum(k in first for k in ['flow','head','power','speed','model'])>=3:
                            technical.append(clean(table))
                            table.decompose()
                body=clean(div)
                if body:sections.append([section_name,body])
            if not sections:
                body=clean(pane)
                if body:sections=[['Overview',body]]
            if technical:
                data=next((item for item in sections if re.search(r'technical|specifications',item[0],re.I)),None)
                tables=''.join(technical)
                if data:data[1]='<h2>Model specifications</h2>'+tables+data[1]
                else:sections.append(['Technical data','<h2>Model specifications</h2>'+tables])
            d['sections']=sections
        d['related']=links(b.select_one('.sub_right'),'/'+'/'.join(p.strip('/').split('/')[:-1])+'/')[:14]
    elif t in ('article','faq','case'):
        wrap=b.select_one('.sub_infor') or b
        d['name']=plain(wrap.select_one('.title')) or d['name']
        date=plain(wrap.select_one('.shijian'))
        if re.fullmatch(r'\d{4}-\d{1,2}-\d{1,2}',date):d['date']=date
        body=wrap.select_one('.text') or wrap
        d['body']=clean(body)
        if (imgs:=get_images(body)):d['photos']=imgs[:3]
        d['related']=links(wrap.select_one('.fenxiang'))
        d['excerpt']=plain(body)[:180]
    elif t in ('case-list','product-list','news-list','faq-list'):
        wrap=b.select_one('.sub_appli' if t=='case-list' else '.pro_left' if t=='product-list' else '.sub_right') or b
        d['links']=links(wrap)
        top={'/products':'Product catalog','/fire-pump-system':'Fire Pump Systems','/industry-news':'Industry News','/faq':'Technical FAQ','/application':'Applications'}
        d['name']=top.get(d.get('base',p),d['name'])
        if pagination:d['name']+=' · Page '+pagination.group(2)
        thumbs={}
        for a in wrap.select('a[href]'):
            u=canonical(a['href']); img=a.find('img')
            if u in d['links'] and img:
                if (pic:=asset_image(img.get('src'))):thumbs[u]=pic
        if thumbs:d['thumbs']=thumbs
    elif p in {'/product-index.html','/site-index.html'}:
        d['t']='index';d['links']=links(b)
        d['name']='Product index' if p=='/product-index.html' else 'Site index'
    elif p.startswith('/gellary'):
        d['t']='gallery';d['links']=links(b)
        if p=='/gellary':
            d['name']='Equipment gallery'
        else:
            photos=[a for a in b.select('img[alt]') if title(a.get('alt')).lower() not in {'','pre','next','previous'} and asset_image(a.get('src'))]
            d['name']=title(photos[0].get('alt')) if photos else label(p)
            d['photos']=list(dict.fromkeys(asset_image(a.get('src')) for a in photos))[:10]
    else:
        d['body']=clean(b)
        d['links']=links(b)
# Per-page title fixes and additional original listing thumbnails.
for d in pack.values():
    if d['t'] in ('product-list','case-list','news-list','faq-list'):
        for dest,pic in d.get('thumbs',{}).items():
            entry=pack.get(dest,{})
            if entry and not entry.get('photos') and not entry.get('pending'):entry['photos']=[pic]
with (root/'src/data/interior.json').open('w',encoding='utf-8') as f:
    f.write('{\n')
    f.write(',\n'.join(json.dumps(p,ensure_ascii=False)+':'+json.dumps(d,ensure_ascii=False,separators=(',',':')) for p,d in pack.items()))
    f.write('\n}\n')
print('Canonical interior routes:',len(pack))
print('Original pagination routes:',sum('page' in d for d in pack.values()))
print(Counter(d['t'] for d in pack.values()))
