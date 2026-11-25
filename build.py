#!/usr/bin/env python3
"""Builds DESk: joins src/*.js into js/desk.js, writes index.html and sw.js with fresh version stamps.
Run after editing anything in src/:   python3 build.py"""
import hashlib, pathlib
R = pathlib.Path(__file__).parent
ORDER = ['core', 'qr', 'files', 'scan', 'vault', 'sync', 'devices', 'views', 'drives', 'landing', 'shell']
js = "/* DESk — built from src/ by build.py. Edit src/, not this file. */\n(() => {\n" + "\n".join((R / 'src' / f'{n}.js').read_text() for n in ORDER) + "\n})();\n"
(R / 'js' / 'desk.js').write_text(js)
h = lambda b: hashlib.sha1(b).hexdigest()[:10]
jsv, cssv = h(js.encode()), h((R / 'css' / 'app.css').read_bytes())
html = (R / 'src' / 'index.template.html').read_text()
idx = html.replace('__JSV__', jsv).replace('__CSSV__', cssv)
(R / 'index.html').write_text(idx)
ver = h((jsv + cssv + idx).encode())
(R / 'sw.js').write_text((R / 'src' / 'sw.template.js').read_text().replace('__VERSION__', ver).replace('__JSV__', jsv).replace('__CSSV__', cssv))
print('built', ver, f'js {len(js)//1024} KB')
