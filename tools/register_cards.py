"""register_cards.py — add a <script> tag to index.html for every js/data/cards/dayNN.js that is not yet loaded.
Run after tools/import_apkg.py. Idempotent. Keeps the page's current ?v= cache version.

  python tools/register_cards.py
"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
html = open('index.html', encoding='utf-8').read()
m = re.search(r'\?v=(\d+)"', html); ver = m.group(1) if m else '1'
files = sorted(f for f in os.listdir('js/data/cards') if re.match(r'day\d+[a-z]?\.js$', f))
anchor = '<script type="text/lazy" src="js/data/cards.js?v=%s"></script>\n' % ver
if anchor not in html: sys.exit('index.html has no js/data/cards.js script tag to anchor on')
added = 0; block = ''
for f in files:
    tag = '<script type="text/lazy" src="js/data/cards/%s?v=%s"></script>\n' % (f, ver)
    if ('js/data/cards/%s' % f) in html: continue
    block += tag; added += 1
if block: html = html.replace(anchor, anchor + block); open('index.html', 'w', encoding='utf-8', newline='\n').write(html)
print('card files:', len(files), 'registered now:', added)
