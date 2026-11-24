"""Write coordinates into widgets/dags.js. python3 src/apply-layout.py <dagname> '<json {id:[x,y]}>' [height]"""
import json, re, sys
name, coords = sys.argv[1], json.loads(sys.argv[2]); height = sys.argv[3] if len(sys.argv) > 3 else None
p = 'widgets/dags.js'; s = open(p).read()
if name == 'capstone':
    start = s.index('window.CAPSTONE = {'); end = s.index('candidates:', start)
else:
    m = re.search(r'\n  ' + re.escape(name) + r': \{', s); start = m.start(); end = s.index('edges:', start)
block = s[start:end]
for nid, (x, y) in coords.items():
    block, n = re.subn(r"(\{ id: '" + re.escape(nid) + r"',[^}]*?x: )\d+(, y: )\d+", lambda mm: f"{mm.group(1)}{x}{mm.group(2)}{y}", block)
    assert n == 1, (name, nid, n)
if height:
    block = re.sub(r'height: \d+', f'height: {height}', block, count=1)
s = s[:start] + block + s[end:]
open(p, 'w').write(s); print('updated', name)
