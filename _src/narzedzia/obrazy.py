# -*- coding: utf-8 -*-
"""Obrazy strony Taxi Rzeszow 24H: WebP w kilku szerokosciach, retusz hero, karta OG, ikony.
Uruchamiac raz po zmianie zdjec zrodlowych:  python obrazy.py
Zrodla: KONCEPT/img (stare jpg/webp) i KONCEPT/_src/img_orig (oryginaly ze starej strony WP).
Wynik: KONCEPT/img (nowe pliki) + KONCEPT/favicon.ico."""
import os, sys
from PIL import Image, ImageFilter
import numpy as np

KONCEPT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
IMG = os.path.join(KONCEPT, 'img')
ORIG = os.path.join(KONCEPT, '_src', 'img_orig')
NAVY = (15, 29, 51)


def p(*a):
    return os.path.join(*a)


def webp(im, path, w, q=74, sharpen=False):
    im = im.convert('RGB')
    if im.width != w:
        h = round(im.height * w / im.width)
        im = im.resize((w, h), Image.LANCZOS)
        if sharpen:
            im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    im.save(path, 'WEBP', quality=q, method=6)
    print(os.path.relpath(path, KONCEPT), im.size, os.path.getsize(path) // 1024, 'KB')


def retusz_hero(src):
    """Usuwa zdublowany pasek liter pod napisem TAXI na kogucie (wiersze 436-442, x 322-446 w pliku 1024 px)."""
    im = Image.open(src).convert('RGB')
    a = np.array(im).astype(float)
    x0, x1 = 322, 446
    for y in range(436, 443):
        row = a[y, x0:x1]
        lum = row.mean(axis=1)
        thr = np.percentile(lum, 70) * 0.85
        med = np.median(row[lum >= thr], axis=0)
        for i in range(x1 - x0):
            if lum[i] < thr:
                a[y, x0 + i] = med
    b = Image.fromarray(a.clip(0, 255).astype('uint8'))
    patch = b.crop((x0, 435, x1, 444)).filter(ImageFilter.GaussianBlur(0.8))
    b.paste(patch, (x0, 435))
    return b


def main():
    # --- hero (Mercedes przed mostem) - zrodlo 1024 px; 1280/1600 to powiekszenie Lanczos + wyostrzenie
    src = p(ORIG, 'hero-mercedes-most-1024.jpg')
    if not os.path.exists(src):
        Image.open(p(IMG, 'taxi-rzeszow-mercedes-most.jpg')).save(src, quality=97)
    hero = retusz_hero(src)
    for w in (640, 768, 960, 1280, 1600):
        webp(hero, p(IMG, f'taxi-rzeszow-24h-most-{w}.webp'), w, q=70 if w >= 1280 else 64, sharpen=w > 1024)
    hero.save(p(IMG, 'taxi-rzeszow-24h-most.jpg'), quality=82, optimize=True, progressive=True)

    # --- karta OG 1200x630 (kadr z hero, auto na srodku)
    big = hero.resize((1600, round(hero.height * 1600 / hero.width)), Image.LANCZOS)  # 1600x1453
    top = 560
    og = big.crop((0, top, 1600, top + 840)).resize((1200, 630), Image.LANCZOS)
    og.save(p(IMG, 'og-taxi-rzeszow-24h.jpg'), quality=84, optimize=True, progressive=True)

    # --- sekcja Lotnisko: swiatla auta i samolot o zmierzchu (oryginal starej strony 1536 px)
    lot = Image.open(p(ORIG, 'ChatGPT-Image-3-mar-2026-13_02_02.png')).convert('RGB')
    for w in (640, 960, 1280):
        webp(lot, p(IMG, f'transfer-lotnisko-jasionka-{w}.webp'), w)

    # --- Camry przed terminalem (podstrona lotniskowa, hero podstron)
    cam = Image.open(p(IMG, 'toyota-camry-lotnisko-jasionka.jpg')).convert('RGB')
    for w in (640, 960, 1196):
        webp(cam, p(IMG, f'taxi-toyota-camry-jasionka-{w}.webp'), w)
    # flota: ciasny kadr samego auta (inne ujecie niz na podstronie)
    camf = cam.crop((0, 300, 1196, 862))
    for w in (600, 1000):
        webp(camf, p(IMG, f'flota-toyota-camry-{w}.webp'), w)

    # --- Audi A7 (flota) - zrodlo 640 px; kadr mocniej na auto
    audi = Image.open(p(IMG, 'taxi-audi-a7-rzeszow-640.jpg')).convert('RGB')
    audf = audi.crop((0, 230, 640, 584))
    webp(audf, p(IMG, 'flota-audi-a7-600.webp'), 600)
    webp(audf, p(IMG, 'flota-audi-a7-640.webp'), 640)

    # --- karty uslug (nazwy z frazami)
    karty = {
        'rzeszow.jpg': 'taxi-rzeszow-centrum.webp',
        'trasa.jpg': 'taxi-rzeszow-przemysl-trasa.webp',
        'zakupy.jpg': 'zakupy-na-zlecenie-rzeszow.webp',
    }
    for s, d in karty.items():
        im = Image.open(p(IMG, s))
        webp(im, p(IMG, d), im.width, q=72)
    # transfery: terminal Jasionka bez samochodu (kadr z grafiki starej strony)
    ter = Image.open(p(ORIG, 'jasionka-airport.png')).convert('RGB')
    terc = ter.crop((560, 120, 1536, 730))
    webp(terc, p(IMG, 'transfer-lotnisko-jasionka-terminal.webp'), 768, q=72)

    # --- logo
    logo = Image.open(p(IMG, 'logo-kogut.png')).convert('RGBA')
    logo.save(p(IMG, 'logo-kogut.webp'), 'WEBP', quality=88, method=6)
    q = logo.quantize(colors=96, method=Image.FASTOCTREE)
    q.save(p(IMG, 'logo-kogut-opt.png'), optimize=True)
    print('logo webp', os.path.getsize(p(IMG, 'logo-kogut.webp')), 'png', os.path.getsize(p(IMG, 'logo-kogut-opt.png')))

    # --- ikony: zolty kogut na granatowym kwadracie
    def ikona(size, pad=0.14, rounded=False):
        c = Image.new('RGBA', (size, size), NAVY + (255,))
        w = int(size * (1 - 2 * pad))
        l = logo.resize((w, round(logo.height * w / logo.width)), Image.LANCZOS)
        c.paste(l, ((size - l.width) // 2, (size - l.height) // 2 + int(size * .02)), l)
        return c
    ikona(180, .12).convert('RGB').save(p(IMG, 'apple-touch-icon.png'), optimize=True)
    ikona(192, .14).save(p(IMG, 'icon-192.png'), optimize=True)
    ikona(512, .2).save(p(IMG, 'icon-512.png'), optimize=True)   # maskable: bezpieczna strefa
    ikona(64, .06).save(p(IMG, 'favicon.png'), optimize=True)
    ikona(48, .04).save(p(KONCEPT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
    print('ikony OK')


if __name__ == '__main__':
    main()
