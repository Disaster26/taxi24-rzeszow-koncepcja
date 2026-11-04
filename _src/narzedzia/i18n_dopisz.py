# -*- coding: utf-8 -*-
"""Dopisuje / podmienia klucze w _src/i18n.js:  python i18n_dopisz.py plik.json  ({"en": {...}, "de": {...}})"""
import re, json, sys, os
P = os.path.join(os.path.dirname(__file__), '..', 'i18n.js')
WARTOSC = r"""("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')"""


def wstaw(s, lang, add):
    m = re.search(r"\n  " + lang + r": \{\n", s)
    start = m.end()
    end = s.index("\n  }", start)
    blok = s[start:end]
    for k, v in add.items():
        kk = "'" + k + "'"
        val = json.dumps(v, ensure_ascii=False)
        rx = re.compile(r"""(['"])""" + re.escape(k) + r"\1\s*:\s*" + WARTOSC)
        if rx.search(blok):
            blok = rx.sub(lambda mm: kk + ": " + val, blok, count=1)
        else:
            blok = blok.rstrip() + ",\n    " + kk + ": " + val
    return s[:start] + blok + s[end:]


if __name__ == '__main__':
    dane = json.load(open(sys.argv[1], encoding='utf-8'))
    s = open(P, encoding='utf-8').read()
    for lang, add in dane.items():
        s = wstaw(s, lang, add)
    open(P, 'w', encoding='utf-8', newline='\n').write(s)
    print('OK', {l: len(a) for l, a in dane.items()})
