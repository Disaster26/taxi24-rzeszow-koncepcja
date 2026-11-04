# -*- coding: utf-8 -*-
"""Generator strony Taxi Rzeszow 24H (podglad GitHub Pages = wersja zrodlowa dla build.py).

    python _src/narzedzia/generuj.py

Zrodla (edytowac TU, nie w wygenerowanych plikach):
  _src/szablon/glowna.html        tresc strony glownej (PL, z kluczami data-i18n)
  _src/szablon/lotnisko.html      podstrona /taxi-rzeszow-lotnisko-jasionka-24h/ (PL)
  _src/szablon/lotnisko-en.html   podstrona /en/taxi-rzeszow-jasionka-airport/ (EN)
  _src/szablon/dzielnica.html     wzor podstron /oferta/taxi-rzeszow-*/  + _src/szablon/dzielnice.json
  _src/szablon/polityka.html      polityka prywatnosci, _src/szablon/404.html
  _src/i18n.js                    tlumaczenia EN/DE/UK (+ teksty skryptu PL)
Wynik: index.html, en/ de/ ua/, podstrony, polityka-prywatnosci.html, 404.html, sitemap.xml, robots.txt, llms.txt,
site.webmanifest. Wszystkie strony maja noindex (podglad); build.py zamienia na index w wersji produkcyjnej.
"""
import os, re, json, hashlib, subprocess, html
from bs4 import BeautifulSoup, Comment

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SZ = os.path.join(ROOT, '_src', 'szablon')
DOM = 'https://taxi24-rzeszow.pl'
GH_ROOT = '/taxi24-rzeszow-koncepcja/'          # sciezka podgladu (404.html); build.py zamienia na /
ENDPOINT = '/wp-content/plugins/taxi24-zamowienia/wyslij.php'
LANGS = ['pl', 'en', 'de', 'uk']
LDIR = {'pl': '', 'en': 'en/', 'de': 'de/', 'uk': 'ua/'}            # katalogi wersji jezykowych (UA w adresie, hreflang uk)
KOD = {'pl': 'PL', 'en': 'EN', 'de': 'DE', 'uk': 'UA'}
NAZWA = {'pl': 'Polski', 'en': 'English', 'de': 'Deutsch', 'uk': 'Українська'}
OGLOC = {'pl': 'pl_PL', 'en': 'en_GB', 'de': 'de_DE', 'uk': 'uk_UA'}
LASTMOD = '2026-11-05'
NL = chr(10)
GSC = ['fh4C235At3ijNSuYKbXmWwbyzVD2CjiC5RFuvlmtBic', '6lmRLaqhv76ITL5QcqPoo5-Wk3fbJ5SebnhJ2_olwW0']

LOT_PL = 'taxi-rzeszow-lotnisko-jasionka-24h/'
LOT_EN = 'en/taxi-rzeszow-jasionka-airport/'

# klucze tekstow potrzebne skryptowi app.js (prefiksy)
T_PREF = ('lab.', 'ph.', 'opc.', 'k.', 'v.', 'brak', 'msg.', 'err.', 'miss.', 'qp.', 'qps.', 'ok.', 'wysyl', 'typ.', 'ck.',
          'male.', 'lang.', 'zam.na', 'zam.z')


def czytaj(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def zapisz(rel, tresc):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(tresc)


def skrot(rel):
    with open(os.path.join(ROOT, rel), 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()[:8]


I18N = json.loads(subprocess.check_output(
    ['node', '-e', "global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.I18N))",
     os.path.join(ROOT, '_src', 'i18n.js')]).decode('utf-8'))

# ------------------------------------------------------------------ znak Wylinka (kod z Wylinka/strona/public/znak/badge.html)
BADGE_SRC = os.path.join(os.path.expanduser('~'), 'Downloads', 'Wylinka', 'strona', 'public', 'znak', 'badge.html')
_b = czytaj(BADGE_SRC)
BADGE_CSS = re.findall(r'<style>(.*?)</style>', _b, re.S)[1].strip()
BADGE_A = re.search(r'<a class="wylinka-badge".*?</a>', _b, re.S).group(0)
BADGE_A = BADGE_A.replace('utm_source=przykladowa-firma.pl', 'utm_source=taxi24-rzeszow.pl')
BADGE_A = BADGE_A.replace('<span>wykonanie: <b>Wylinka</b></span>', '<span><span data-i18n="st.wyk">wykonanie:</span> <b>Wylinka</b></span>')

# ------------------------------------------------------------------ ikony (sprite)
SPRITE = czytaj(os.path.join(SZ, 'ikony.svg')).strip()


# ------------------------------------------------------------------ tlumaczenie fragmentu HTML
def zbierz_pl(fragment, slownik):
    """Polskie teksty z atrybutow data-i18n* (do slownika PL skryptu)."""
    s = BeautifulSoup(fragment, 'html.parser')
    for el in s.select('[data-i18n]'):
        slownik.setdefault(el['data-i18n'], el.get_text())
    for el in s.select('[data-i18n-html]'):
        slownik.setdefault(el['data-i18n-html'], el.decode_contents())


def tlumacz(fragment, lang, brak):
    """Podmienia teksty wg slownika i usuwa atrybuty data-i18n*. brak: zbior kluczy bez tlumaczenia."""
    s = BeautifulSoup(fragment, 'html.parser')
    d = I18N.get(lang, {}) if lang != 'pl' else {}
    for atr, cel in (('data-i18n', 'text'), ('data-i18n-html', 'html'), ('data-i18n-ph', 'placeholder'),
                     ('data-i18n-aria', 'aria-label'), ('data-i18n-alt', 'alt')):
        for el in s.select('[' + atr + ']'):
            k = el[atr]
            del el[atr]
            if lang == 'pl':
                continue
            if k not in d:
                brak.add(k)
                continue
            v = d[k]
            if cel == 'text':
                el.string = v
            elif cel == 'html':
                el.clear()
                el.append(BeautifulSoup(v, 'html.parser'))
            else:
                el[cel] = v
    sierotki(s, lang)
    for c in s.find_all(string=lambda x: isinstance(x, Comment)):
        c.extract()
    return str(s)


SIEROTKI = {'pl': re.compile(r'(?<![\w\-])([aiouwzAIOUWZ]|na|do|od|po|we|ze|za|ku) (?=\S)'),
            'uk': re.compile(r'(?<![\w\-])([аіоуйвзяАІОУЙВЗЯ]|на|до|по|за|та|не) (?=\S)')}


def sierotki(s, lang):
    """Twarda spacja po jednoliterowych spojnikach/przyimkach (i, w, z, a...), zeby nie zostawaly na koncu wiersza."""
    rx = SIEROTKI.get(lang)
    if not rx:
        return
    for t in s.find_all(string=True):
        if isinstance(t, Comment):
            continue
        if t.parent and t.parent.name in ('script', 'style', 'title', 'option', 'textarea'):
            continue
        n = rx.sub(lambda m: m.group(1) + ' ', str(t))
        if n != str(t):
            t.replace_with(n)


# ------------------------------------------------------------------ elementy wspolne
def szybki(typ, R):
    """Formularz szybkiego zamowienia (hero). typ: zaznaczona zakladka."""
    tabs = [('lotnisko', 'i-plane', 'Transfer lotniskowy', 'Lotnisko'), ('miasto', 'i-car', 'Taxi w mieście', 'Miasto'),
            ('trasa', 'i-route', 'Dłuższa trasa', 'Trasa'), ('inne', 'i-dots', 'Inne usługi', 'Inne')]
    t = ''.join(
        f'<label><input type="radio" name="qtyp" value="{v}"{" checked" if v == typ else ""}><span><svg class="ic"><use href="#{ic}"/></svg>'
        f'<b class="dl" data-i18n="typ.{v}">{dl}</b><b class="ds" data-i18n="typs.{v}">{ds}</b></span></label>'
        for v, ic, dl, ds in tabs)
    return f'''    <form class="szybki" id="szybki" action="{ENDPOINT}" method="post" novalidate aria-label="Zamówienie taxi" data-i18n-aria="a.szybki">
      <input type="hidden" name="zrodlo" value="szybki"><input type="hidden" name="jezyk" value="{{{{LANG}}}}">
      <div class="tabs" role="radiogroup" aria-label="Rodzaj przejazdu" data-i18n-aria="a.rodzaj">{t}</div>
      <div class="q-pola">
        <label class="pole"><svg class="ic"><use href="#i-pin"/></svg><input id="qSkad" name="skad" maxlength="200" autocomplete="street-address" placeholder="Skąd jedziemy?" data-i18n-ph="qp.skad" aria-label="Skąd jedziemy?" data-i18n-aria="q.skad"></label>
        <label class="pole"><svg class="ic"><use href="#i-pin"/></svg><input id="qDokad" name="dokad" maxlength="200" placeholder="Dokąd?" data-i18n-ph="qp.dokad" aria-label="Dokąd?" data-i18n-aria="q.dokad" list="lotniskaLista"></label>
        <label class="pole q-kiedy pusty"><svg class="ic"><use href="#i-cal"/></svg><input id="qKiedy" name="kiedy" type="datetime-local" step="300" aria-label="Kiedy? Puste pole: jak najszybciej" data-i18n-aria="q.kiedy"><span class="q-teraz" aria-hidden="true"><span class="dl" data-i18n="q.teraz">Teraz lub wybierz termin</span><span class="ds" data-i18n="qs.teraz">Teraz / termin</span></span></label>
        <label class="pole q-tel"><svg class="ic"><use href="#i-tel"/></svg><input id="qTel" name="telefon" type="tel" inputmode="tel" autocomplete="tel" maxlength="25" placeholder="Twój telefon" data-i18n-ph="q.telph" aria-label="Twój telefon (do potwierdzenia)" data-i18n-aria="q.tel"></label>
        <p class="q-blad" id="qBlad" role="alert" hidden></p>
        <button class="btn btn-y q-btn" type="submit"><span data-i18n="q.btn">Zamów taxi</span> <svg class="ic"><use href="#i-arrow"/></svg></button>
        <p class="rodo q-rodo" data-i18n-html="rodo.krotko">Wysyłając, akceptujesz <a href="{R}polityka-prywatnosci.html">politykę prywatności</a>.</p>
        <input class="hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
      </div>
      <div class="q-ok" id="qOk" hidden tabindex="-1"></div>
    </form>
    <datalist id="lotniskaLista"><option value="Lotnisko Rzeszów-Jasionka (RZE)"><option value="Lotnisko Kraków (KRK)"><option value="Lotnisko Katowice (KTW)"><option value="Lotnisko Lublin (LUZ)"><option value="Lotnisko Warszawa (WAW)"></datalist>
    <datalist id="trasyLista"><option value="Przemyśl"><option value="Medyka - przejście graniczne z Ukrainą"><option value="Kraków"><option value="Katowice"><option value="Lublin"><option value="Warszawa"></datalist>'''


DZ = json.loads(czytaj(os.path.join(SZ, 'dzielnice.json')))


def dzielnice_linki(R, bez=None, klasa='dz-lista'):
    li = ''.join(f'<li><a href="{R}oferta/taxi-rzeszow-{d["slug"]}/">{d["nazwa"]}</a></li>' for d in DZ if d['slug'] != bez)
    return f'<ul class="{klasa}">{li}</ul>'


def naglowek(lang, R, H, alt, cta_href):
    """alt: {lang: url wzgledny do biezacej strony w tym jezyku}"""
    def lnk(l):
        cur = ' aria-current="true"' if l == lang else ''
        return f'<a href="{alt[l]}" hreflang="{"uk" if l == "uk" else l}" lang="{l}" title="{NAZWA[l]}"{cur}>{KOD[l]}</a>'
    lista = ''.join(lnk(l) for l in LANGS)
    logo = '#start' if H == '' else H
    return f'''<a class="skip" href="#tresc" data-i18n="a.skip">Przejdź do treści</a>
<header class="top" id="top">
  <div class="top-in">
    <a class="logo" href="{logo}"><img src="{R}img/logo-kogut.webp" alt="" width="240" height="103"><span class="logo-txt"><b>TAXI RZESZÓW</b><i>24H</i></span></a>
    <nav class="menu" id="menu" aria-label="Menu" data-i18n-aria="a.menu">
      <a href="{H}#uslugi" data-i18n="nav.uslugi">Usługi</a>
      <a href="{H}#lotnisko" data-i18n="nav.lotnisko">Lotnisko</a>
      <a href="{H}#taxi" data-i18n="nav.taxi2">Rzeszów i okolice</a>
      <a href="{H}#flota" data-i18n="nav.flota">Samochody</a>
      <a href="{H}#faq" data-i18n="nav.faq">Pytania</a>
      <a href="#kontakt" data-i18n="nav.kontakt">Kontakt</a>
      <a class="menu-tel" href="tel:+48536805851"><svg class="ic"><use href="#i-tel"/></svg><span><b>536 805 851</b><small data-i18n="top.dobe">całą dobę</small></span></a>
    </nav>
    <div class="lang" id="lang">
      <button class="lang-btn" id="langBtn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="langList" aria-label="{KOD[lang]} - Język: polski" data-i18n-aria="lang.przycisk"><span>{KOD[lang]}</span><svg class="ic"><use href="#i-chev"/></svg></button>
      <div class="lang-list" id="langList">{lista}</div>
    </div>
    <a class="top-tel" href="tel:+48536805851"><svg class="ic"><use href="#i-tel"/></svg><span><b>536 805 851</b><small data-i18n="top.dobe">całą dobę</small></span></a>
    <a class="btn btn-y top-cta" href="{cta_href}" data-i18n="top.cta">Zamów taxi</a>
    <button class="burger" id="burger" type="button" aria-label="Menu" data-i18n-aria="a.menu" aria-expanded="false" aria-controls="menu"><span></span><span></span><span></span></button>
  </div>
</header>
<div class="menu-tlo" id="menuTlo" hidden></div>'''


def stopka(lang, R, H, lot_url):
    return f'''<footer class="stopka" id="kontakt">
  <div class="wrap stopka-grid">
    <div class="st-firma">
      <a class="logo logo-st" href="{H or '#start'}"><img src="{R}img/logo-kogut.webp" alt="" width="240" height="103" loading="lazy"><span class="logo-txt"><b>TAXI RZESZÓW</b><i>24H</i></span></a>
      <p class="st-opis" data-i18n="st.opis">Całodobowe taxi w Rzeszowie i okolicy, transfery na lotnisko Rzeszów-Jasionka i dalsze lotniska.</p>
    </div>
    <div class="st-kontakt">
      <h2 class="st-h" data-i18n="st.kontakt">Kontakt 24/7</h2>
      <a class="st-tel" href="tel:+48536805851"><svg class="ic"><use href="#i-tel"/></svg><span>+48 536 805 851<small data-i18n="top.dobe">całą dobę</small></span></a>
      <a href="https://wa.me/48536805851" target="_blank" rel="noopener"><svg class="ic"><use href="#i-wa"/></svg><span>WhatsApp</span></a>
      <a href="mailto:taxi@taxi24-rzeszow.pl"><svg class="ic"><use href="#i-msg"/></svg><span>taxi@taxi24-rzeszow.pl</span></a>
      <p class="st-nap"><svg class="ic"><use href="#i-pin"/></svg><span>Grzegorz Kędzierski TAXI RZESZÓW 24H<br>ul. Iwonicka 34J/1, 35-505 Rzeszów<br>NIP 795-231-56-48</span></p>
    </div>
    <div class="st-uslugi">
      <h2 class="st-h" data-i18n="st.uslugi">Usługi</h2>
      <a href="{lot_url}" data-i18n="st.u1">Lotnisko Jasionka</a>
      <a href="{H}#taxi" data-i18n="st.u2">Taxi Rzeszów 24h</a>
      <a href="{H}#przemysl-medyka" data-i18n="st.u6">Przemyśl i Medyka</a>
      <a href="{H}#uslugi" data-i18n="st.u7">Obsługa hoteli i firm</a>
      <a href="{H}#zamow" data-i18n="st.u8">Zamówienie online</a>
    </div>
    <div class="st-social">
      <h2 class="st-h" data-i18n="st.social">Znajdziesz nas</h2>
      <a href="https://www.facebook.com/TaxiRzeszow24H" target="_blank" rel="noopener">Facebook</a>
      <a href="https://www.instagram.com/taxirzeszow24h" target="_blank" rel="noopener">Instagram</a>
      <a href="https://www.tiktok.com/@taxi.rzeszow.24h" target="_blank" rel="noopener">TikTok</a>
      <a href="https://www.tripadvisor.com/Attraction_Review-g274785-d33097322-Reviews-Taxi_Rzeszow_24h-Rzeszow_Subcarpathian_Province_Southern_Poland.html" target="_blank" rel="noopener">Tripadvisor</a>
      <a href="https://t.me/taxi_rzeszow_24h" target="_blank" rel="noopener">Telegram</a>
    </div>
  </div>
  <div class="wrap st-dol"><span>© 2026 Taxi Rzeszów 24H</span><a href="{R}polityka-prywatnosci.html" data-i18n="st.pp">Polityka prywatności</a><button class="st-ck" type="button" data-cookies data-i18n="ck.link">Ustawienia cookies</button>{BADGE_A}</div>
</footer>
<div class="plyw" id="plyw">
  <a class="plyw-wa" href="https://wa.me/48536805851" target="_blank" rel="noopener" aria-label="WhatsApp"><svg class="ic"><use href="#i-wa"/></svg></a>
  <a class="plyw-tel" href="tel:+48536805851" aria-label="+48 536 805 851"><svg class="ic"><use href="#i-tel"/></svg></a>
</div>'''


# ------------------------------------------------------------------ JSON-LD
FIRMA_ID = DOM + '/#firma'


def firma(lang):
    d = I18N[lang] if lang != 'pl' else {}
    return {
        "@type": ["LocalBusiness", "AutomotiveBusiness"], "@id": FIRMA_ID,
        "name": "Taxi Rzeszów 24H", "legalName": "Grzegorz Kędzierski TAXI RZESZÓW 24H", "taxID": "7952315648",
        "url": DOM + "/", "logo": DOM + "/img/logo-kogut.png", "image": DOM + "/img/og-taxi-rzeszow-24h.jpg",
        "telephone": "+48536805851", "email": "taxi@taxi24-rzeszow.pl", "priceRange": "$$", "currenciesAccepted": "PLN",
        "paymentAccepted": "Gotówka, karta płatnicza, BLIK, przelew (faktura)",
        "address": {"@type": "PostalAddress", "streetAddress": "ul. Iwonicka 34J/1", "postalCode": "35-505",
                    "addressLocality": "Rzeszów", "addressRegion": "podkarpackie", "addressCountry": "PL"},
        "geo": {"@type": "GeoCoordinates", "latitude": 50.050298, "longitude": 21.952444},
        "openingHoursSpecification": [{"@type": "OpeningHoursSpecification",
                                       "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                                       "opens": "00:00", "closes": "23:59"}],
        "areaServed": [{"@type": "City", "name": "Rzeszów"},
                       {"@type": "Airport", "name": "Port Lotniczy Rzeszów-Jasionka", "iataCode": "RZE"},
                       {"@type": "City", "name": "Przemyśl"}, {"@type": "Place", "name": "Przejście graniczne Medyka-Szeginie"},
                       {"@type": "City", "name": "Łańcut"}, {"@type": "City", "name": "Boguchwała"}, {"@type": "City", "name": "Tyczyn"},
                       {"@type": "City", "name": "Głogów Małopolski"}, {"@type": "City", "name": "Strzyżów"}],
        "knowsLanguage": ["pl", "en", "de", "uk"],
        "sameAs": ["https://www.facebook.com/TaxiRzeszow24H", "https://www.instagram.com/taxirzeszow24h",
                   "https://www.tiktok.com/@taxi.rzeszow.24h", "https://www.youtube.com/@TaxiRzeszow24H-24H",
                   "https://www.tripadvisor.com/Attraction_Review-g274785-d33097322-Reviews-Taxi_Rzeszow_24h-Rzeszow_Subcarpathian_Province_Southern_Poland.html",
                   "https://t.me/taxi_rzeszow_24h"],
        "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Usługi Taxi Rzeszów 24H", "itemListElement": [
            {"@type": "Offer", "itemOffered": {"@type": "TaxiService", "name": "Taxi Rzeszów 24h", "description": "Kursy po Rzeszowie i okolicy całą dobę, także w weekendy i święta."}},
            {"@type": "Offer", "itemOffered": {"@type": "TaxiService", "name": "Transfer Rzeszów - lotnisko Jasionka", "description": "Przejazdy na Port Lotniczy Rzeszów-Jasionka i odbiór z samolotu, także przy opóźnieniu lotu; lotniska Kraków, Katowice, Lublin, Warszawa."}},
            {"@type": "Offer", "itemOffered": {"@type": "TaxiService", "name": "Taxi Rzeszów - Przemyśl i granica w Medyce", "description": "Kursy do Przemyśla i na przejście graniczne z Ukrainą w Medyce, o każdej porze."}},
            {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Obsługa hoteli i firm (faktura)"}},
            {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Zakupy na zlecenie, taxi kurierskie, drobna pomoc drogowa, odprowadzenie pojazdu"}}]},
    }


def faq_ld(pary, url):
    return {"@type": "FAQPage", "@id": url + "#faq", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pary]}


def ld(graf):
    return '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": graf},
                                                              ensure_ascii=False, separators=(',', ':')) + '</script>'


# ------------------------------------------------------------------ szkielet strony
STYLE_V = None
APP_V = None


def strona(*, lang, rel, R, H, title, desc, main, alt=None, hreflang=None, typ='glowna', cta='#zamow', jsonld='',
           preload_img=None, og_title=None, og_desc=None, robots_prod='index, follow, max-image-preview:large', lot_url=None,
           brak=None, tpl=None):
    """rel: sciezka pliku wzgledem ROOT (np. 'en/index.html'); R: prefiks do katalogu glownego; H: link do strony glownej jezyka."""
    url = DOM + '/' + (rel[:-10] if rel.endswith('index.html') else rel)
    if alt is None:
        alt = {l: (H or './') for l in LANGS}
    if lot_url is None:
        lot_url = R + LOT_PL if lang == 'pl' else R + LOT_EN if lang == 'en' else (H or '') + '#lotnisko'
    tpl = tpl or {}
    tresc = (naglowek(lang, R, H, alt, cta) + '\n<main id="tresc">\n' + main + '\n</main>\n' + stopka(lang, R, H, lot_url))
    for k, v in {'{{R}}': R, '{{H}}': H, '{{LANG}}': lang, '{{LOT}}': lot_url, **tpl}.items():
        tresc = tresc.replace(k, v)
    tresc = tlumacz(tresc, lang, brak if brak is not None else set())
    for k, v in {'{{R}}': R, '{{H}}': H, '{{LANG}}': lang}.items():   # placeholdery z tlumaczen
        tresc = tresc.replace(k, v)
    hl = ''
    if hreflang:
        hl = ''.join(f'<link rel="alternate" hreflang="{h}" href="{u}">' for h, u in hreflang)
    og_title = og_title or title.split(' | ')[0]
    og_desc = og_desc or desc
    pre = ''
    if preload_img:
        pre = f'<link rel="preload" as="image" type="image/webp" imagesrcset="{preload_img[0]}" imagesizes="{preload_img[1]}" fetchpriority="high">'
    font_pre = (f'<link rel="preload" href="{R}fonts/montserrat-{"cyrillic" if lang == "uk" else "latin"}.woff2" as="font" type="font/woff2" crossorigin>'
                f'<link rel="preload" href="{R}fonts/manrope-{"cyrillic" if lang == "uk" else "latin"}.woff2" as="font" type="font/woff2" crossorigin>')
    zgody = ("<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}"
             "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',"
             "functionality_storage:'granted',security_storage:'granted',wait_for_update:500});</script>")
    T = {k: v for k, v in TSL[lang].items()}
    tjs = '<script>window.T=' + json.dumps(T, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + ';</script>'
    doc = f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{html.escape(title, quote=False)}</title>
<meta name="description" content="{html.escape(desc)}">
<meta name="robots" content="noindex" data-prod="{robots_prod}">
<link rel="canonical" href="{url}">
{hl}
{''.join(f'<meta name="google-site-verification" content="{g}">' for g in GSC)}
<meta name="theme-color" content="#0f1d33">
<link rel="icon" href="{R}favicon.ico" sizes="48x48"><link rel="icon" type="image/png" sizes="192x192" href="{R}img/icon-192.png"><link rel="apple-touch-icon" href="{R}img/apple-touch-icon.png"><link rel="manifest" href="{R}site.webmanifest">
<meta property="og:type" content="website"><meta property="og:site_name" content="Taxi Rzeszów 24H"><meta property="og:locale" content="{OGLOC[lang]}">
<meta property="og:url" content="{url}"><meta property="og:title" content="{html.escape(og_title)}"><meta property="og:description" content="{html.escape(og_desc)}">
<meta property="og:image" content="{DOM}/img/og-taxi-rzeszow-24h.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{html.escape(T.get('og.alt', 'Taxi Rzeszów 24H'))}">
<meta name="twitter:card" content="summary_large_image">
{font_pre}{pre}
<link rel="stylesheet" href="{R}style.css?v={STYLE_V}">
{zgody}
{jsonld}
</head>
<body data-strona="{typ}" data-zamowienia="{ENDPOINT}" data-pp="{R}polityka-prywatnosci.html">
{SPRITE}
{tresc}
{tjs}
<script src="{R}app.js?v={APP_V}" defer></script>
</body>
</html>
'''
    doc = re.sub(r'\n{2,}', '\n', doc)
    zapisz(rel, doc)
    return url


# ------------------------------------------------------------------ slowniki skryptu
TSL = {}


def przygotuj_slowniki():
    pl = dict(I18N['pl'])
    for f in ('glowna.html',):
        zbierz_pl(czytaj(os.path.join(SZ, f)), pl)
    zbierz_pl(szybki('lotnisko', ''), pl)
    zbierz_pl(naglowek('pl', '', '', {l: '' for l in LANGS}, '#'), pl)
    zbierz_pl(stopka('pl', '', '', ''), pl)
    for l in LANGS:
        src = pl if l == 'pl' else {**pl, **I18N[l]}
        TSL[l] = {k: v for k, v in src.items() if k.startswith(T_PREF) or k in ('og.alt',)}
        TSL[l]['_lang'] = l


# ------------------------------------------------------------------ strony
def glowna():
    src = czytaj(os.path.join(SZ, 'glowna.html'))
    pl = dict(I18N['pl'])
    zbierz_pl(src, pl)
    hreflang = [('pl', DOM + '/'), ('en', DOM + '/en/'), ('de', DOM + '/de/'), ('uk', DOM + '/ua/'), ('x-default', DOM + '/')]
    faq_kol = ['1', '2', '8', '3', '4', '5', '6', '7']
    brak_all = {}
    for lang in LANGS:
        R = '' if lang == 'pl' else '../'
        d = pl if lang == 'pl' else {**pl, **I18N[lang]}
        rel = LDIR[lang] + 'index.html'
        url = DOM + '/' + LDIR[lang]
        alt = {l: R + LDIR[l] if R + LDIR[l] else './' for l in LANGS}
        if lang == 'pl':
            alt = {l: (LDIR[l] or './') for l in LANGS}
        graf = [firma(lang),
                {"@type": "WebSite", "@id": DOM + "/#www", "url": DOM + "/", "name": "Taxi Rzeszów 24H", "inLanguage": ["pl", "en", "de", "uk"],
                 "publisher": {"@id": FIRMA_ID}},
                {"@type": "WebPage", "@id": url + "#strona", "url": url, "name": d['meta.title2'], "isPartOf": {"@id": DOM + "/#www"},
                 "about": {"@id": FIRMA_ID}, "inLanguage": lang},
                faq_ld([(BeautifulSoup(d['q' + i], 'html.parser').get_text(), BeautifulSoup(d['a' + i], 'html.parser').get_text()) for i in faq_kol], url)]
        brak = set()
        sz = szybki('lotnisko', R)
        main = src.replace('{{SZYBKI}}', sz).replace('{{DZIELNICE}}', dzielnice_linki(R))
        tpl = {'{{LOT}}': R + (LOT_PL if lang == 'pl' else LOT_EN)}
        strona(lang=lang, rel=rel, R=R, H='', title=d['meta.title2'], desc=d['meta.desc2'], main=main, alt=alt,
               hreflang=hreflang, typ='glowna', cta='#zamow', jsonld=ld(graf), brak=brak, tpl=tpl,
               og_title=d.get('og.title', None), og_desc=d.get('og.desc', None),
               preload_img=(f'{R}img/taxi-rzeszow-24h-most-640.webp 640w, {R}img/taxi-rzeszow-24h-most-768.webp 768w, {R}img/taxi-rzeszow-24h-most-960.webp 960w, {R}img/taxi-rzeszow-24h-most-1280.webp 1280w, {R}img/taxi-rzeszow-24h-most-1600.webp 1600w',
                            '(max-width:900px) 100vw, 68vw'))
        if brak:
            brak_all[lang] = sorted(brak)
    return brak_all


def hero_pod(R, foto, alt_txt, h1, lead, typ):
    return f'''<section class="hero hero-pod" id="start">
  <div class="hero-ekran">
  <div class="hero-foto">
    <picture>
      <source type="image/webp" srcset="{R}img/{foto}-640.webp 640w, {R}img/{foto}-960.webp 960w, {R}img/{foto}-1196.webp 1196w" sizes="(max-width:900px) 100vw, 60vw">
      <img src="{R}img/{foto}-960.webp" alt="{alt_txt}" width="1196" height="862" fetchpriority="high" decoding="async">
    </picture>
  </div>
  <div class="hero-srodek"><div class="hero-in wrap">
    <h1>{h1}</h1>
    <p class="lead">{lead}</p>
    <div class="hero-cta" id="heroCta">
      <a class="cta-tel" href="tel:+48536805851"><span class="cta-kolo"><svg class="ic"><use href="#i-tel"/></svg></span><span class="cta-txt"><small data-i18n="cta.tel">Zadzwoń teraz</small><b>536&nbsp;805&nbsp;851</b></span></a>
      <a class="cta-wa" href="https://wa.me/48536805851" target="_blank" rel="noopener"><svg class="ic"><use href="#i-wa"/></svg><span data-i18n="cta.wa">Zamów przez WhatsApp</span></a>
    </div>
    <p class="fakty-tel" data-i18n="hero.fakty">Całą dobę, także w święta. Karta, gotówka lub BLIK.</p>
  </div></div>
  </div>
  <div class="hero-form wrap">
{szybki(typ, R)}
  </div>
</section>'''


def okruszki_ld(lista):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(lista)]}


def lotnisko():
    for lang, plik, rel, url_rel in (('pl', 'lotnisko.html', LOT_PL, LOT_PL), ('en', 'lotnisko-en.html', LOT_EN, LOT_EN)):
        src = czytaj(os.path.join(SZ, plik))
        meta = json.loads(re.search(r'<!--META(.*?)-->', src, re.S).group(1))
        src = re.sub(r'<!--META.*?-->\s*', '', src, flags=re.S)
        R = '../../' if lang == 'en' else '../'
        H = '../' if lang == 'en' else '../'
        url = DOM + '/' + url_rel
        hero = hero_pod(R, 'taxi-toyota-camry-jasionka', meta['alt'], meta['h1'], meta['lead'], 'lotnisko')
        main = src.replace('{{HERO}}', hero)
        faq = re.findall(r'<details[^>]*><summary>(.*?)</summary>\s*<p>(.*?)</p></details>', main, re.S)
        faq = [(BeautifulSoup(q, 'html.parser').get_text(), BeautifulSoup(a, 'html.parser').get_text()) for q, a in faq]
        graf = [{"@type": "WebPage", "@id": url + "#strona", "url": url, "name": meta['title'], "inLanguage": lang,
                 "isPartOf": {"@id": DOM + "/#www"}, "about": {"@id": FIRMA_ID}, "breadcrumb": {"@id": url + "#okruszki"}},
                {"@type": "TaxiService", "@id": url + "#usluga", "name": meta['usluga'], "provider": {"@type": "LocalBusiness", "@id": FIRMA_ID, "name": "Taxi Rzeszów 24H", "telephone": "+48536805851", "url": DOM + "/"},
                 "areaServed": [{"@type": "City", "name": "Rzeszów"}, {"@type": "Airport", "name": "Port Lotniczy Rzeszów-Jasionka", "iataCode": "RZE"}],
                 "availableChannel": {"@type": "ServiceChannel", "servicePhone": {"@type": "ContactPoint", "telephone": "+48536805851", "contactType": "reservations"}}},
                dict(okruszki_ld([(meta['crumb0'], DOM + '/' + ('en/' if lang == 'en' else '')), (meta['crumb1'], url)]), **{"@id": url + "#okruszki"}),
                faq_ld(faq, url)]
        alt = {'pl': (R + LOT_PL), 'en': (R + LOT_EN), 'de': R + 'de/', 'uk': R + 'ua/'}
        hreflang = [('pl', DOM + '/' + LOT_PL), ('en', DOM + '/' + LOT_EN), ('x-default', DOM + '/' + LOT_PL)]
        brak = set()
        strona(lang=lang, rel=rel + 'index.html', R=R, H=H, title=meta['title'], desc=meta['desc'], main=main, alt=alt,
               hreflang=hreflang, typ='lotnisko', cta='#szybki', jsonld=ld(graf), brak=brak, lot_url='#start',
               tpl={'{{DZIELNICE}}': dzielnice_linki(R, klasa='dz-lista dz-lista-jasna')},
               preload_img=(f'{R}img/taxi-toyota-camry-jasionka-640.webp 640w, {R}img/taxi-toyota-camry-jasionka-960.webp 960w, {R}img/taxi-toyota-camry-jasionka-1196.webp 1196w', '(max-width:900px) 100vw, 60vw'))
        if brak:
            print('BRAK tlumaczen', lang, sorted(brak))


def dzielnice():
    wz = czytaj(os.path.join(SZ, 'dzielnica.html'))
    urls = []
    for d in DZ:
        R = '../../'
        rel = f'oferta/taxi-rzeszow-{d["slug"]}/'
        url = DOM + '/' + rel
        lista = lambda xs: ''.join(f'<li>{x}</li>' for x in xs)
        extra = ''
        for blok in d.get('extra', []):
            extra += f'<h2>{blok["h"]}</h2>'
            if blok.get('p'):
                extra += f'<p>{blok["p"]}</p>'
            if blok.get('li'):
                extra += f'<ul class="lista-ok">{lista(blok["li"])}</ul>'
        h1 = f'Taxi {d["nazwa"]} Rzeszów&nbsp;24h'
        lead = (f'Odbierzemy Cię {d["loc"]} o każdej porze dnia i nocy: kursy po mieście, na dworzec i na lotnisko Jasionka. '
                f'Zadzwoń, napisz na WhatsApp albo zamów online.')
        hero = hero_pod(R, 'taxi-toyota-camry-jasionka', 'Toyota Camry Taxi Rzeszów 24H', h1, lead, 'miasto')
        rep = {'{{HERO}}': hero, '{{NAZWA}}': d['nazwa'], '{{LOC}}': d['loc'], '{{GEN}}': d['gen'], '{{OPIS}}': d['opis'],
               '{{ULICE}}': lista(d['ulice']), '{{KURSY}}': d['kursy'], '{{CELE}}': lista(d['cele']), '{{ZALETY}}': lista(d['zalety']),
               '{{EXTRA}}': extra, '{{INNE}}': dzielnice_linki(R, bez=d['slug'])}
        main = wz
        for k, v in rep.items():
            main = main.replace(k, v)
        title = f'Taxi {d["nazwa"]} Rzeszów 24h | Taxi Rzeszów 24H'
        u = d['ulice']
        desc = (f'Taxi {d["loc"]} w Rzeszowie całą dobę. Odbiór m.in. z ulic {u[0]}, {u[1]} i {u[2]}. '
                f'Kursy do centrum, na dworzec i lotnisko Jasionka. Tel. 536 805 851.')
        if len(desc) > 160:
            desc = f'Taxi {d["loc"]} w Rzeszowie całą dobę: odbiór m.in. z ulic {u[0]} i {u[1]}, kursy do centrum, na dworzec i lotnisko. Tel. 536 805 851.'
        graf = [{"@type": "WebPage", "@id": url + "#strona", "url": url, "name": title, "inLanguage": "pl",
                 "isPartOf": {"@id": DOM + "/#www"}, "about": {"@id": FIRMA_ID}, "breadcrumb": {"@id": url + "#okruszki"}},
                {"@type": "TaxiService", "@id": url + "#usluga", "name": f'Taxi {d["nazwa"]} Rzeszów 24h',
                 "provider": {"@type": "LocalBusiness", "@id": FIRMA_ID, "name": "Taxi Rzeszów 24H", "telephone": "+48536805851", "url": DOM + "/"},
                 "areaServed": {"@type": "Place", "name": f'{d["nazwa"]}, Rzeszów'}},
                dict(okruszki_ld([('Taxi Rzeszów 24H', DOM + '/'), ('Taxi w dzielnicach Rzeszowa', DOM + '/#taxi'), (d['nazwa'], url)]), **{"@id": url + "#okruszki"})]
        alt = {'pl': './', 'en': R + 'en/', 'de': R + 'de/', 'uk': R + 'ua/'}
        brak = set()
        strona(lang='pl', rel=rel + 'index.html', R=R, H=R, title=title, desc=desc, main=main, alt=alt, typ='dzielnica',
               cta='#szybki', jsonld=ld(graf), brak=brak,
               preload_img=(f'{R}img/taxi-toyota-camry-jasionka-640.webp 640w, {R}img/taxi-toyota-camry-jasionka-960.webp 960w, {R}img/taxi-toyota-camry-jasionka-1196.webp 1196w', '(max-width:900px) 100vw, 60vw'))
        urls.append(url)
        if len(desc) > 160 or len(title) > 62:
            print('UWAGA dlugosc', d['slug'], len(title), len(desc))
    return urls


def polityka():
    src = czytaj(os.path.join(SZ, 'polityka.html'))
    strona(lang='pl', rel='polityka-prywatnosci.html', R='', H='./', title='Polityka prywatności i cookies | Taxi Rzeszów 24H',
           desc='Polityka prywatności Taxi Rzeszów 24H: administrator danych, formularz zamówienia, pliki cookies (Google Analytics i Google Ads za zgodą), Twoje prawa.',
           main=src, alt={'pl': 'polityka-prywatnosci.html', 'en': 'polityka-prywatnosci.html#en', 'de': 'polityka-prywatnosci.html#de', 'uk': 'polityka-prywatnosci.html#ua'},
           typ='polityka', cta='./#zamow', robots_prod='noindex, follow')


def strona404():
    src = czytaj(os.path.join(SZ, '404.html'))
    R = GH_ROOT
    strona(lang='pl', rel='404.html', R=R, H=R, title='Nie ma takiej strony | Taxi Rzeszów 24H', desc='Nie znaleźliśmy tej strony. Zamów taxi w Rzeszowie: 536 805 851.',
           main=src.replace('{{R}}', R), alt={'pl': R, 'en': R + 'en/', 'de': R + 'de/', 'uk': R + 'ua/'}, typ='404', cta=R + '#zamow',
           robots_prod='noindex, follow')


def pliki_pomocnicze(dz_urls):
    # sitemap z hreflang
    def blok(loc, alts):
        x = ''.join(f'\n    <xhtml:link rel="alternate" hreflang="{h}" href="{u}"/>' for h, u in alts)
        return f'  <url><loc>{loc}</loc><lastmod>{LASTMOD}</lastmod>{x}</url>\n'
    home_alts = [('pl', DOM + '/'), ('en', DOM + '/en/'), ('de', DOM + '/de/'), ('uk', DOM + '/ua/'), ('x-default', DOM + '/')]
    lot_alts = [('pl', DOM + '/' + LOT_PL), ('en', DOM + '/' + LOT_EN), ('x-default', DOM + '/' + LOT_PL)]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    for l in LANGS:
        sm += blok(DOM + '/' + LDIR[l], home_alts)
    sm += blok(DOM + '/' + LOT_PL, lot_alts) + blok(DOM + '/' + LOT_EN, lot_alts)
    for u in dz_urls:
        sm += blok(u, [])
    sm += '</urlset>\n'
    zapisz('sitemap.xml', sm)
    zapisz('robots.txt', czytaj(os.path.join(SZ, 'robots.txt')))
    zapisz('llms.txt', czytaj(os.path.join(SZ, 'llms.txt')))
    zapisz('site.webmanifest', json.dumps({
        "name": "Taxi Rzeszów 24H", "short_name": "Taxi 24H", "lang": "pl", "start_url": "/", "scope": "/", "display": "browser",
        "background_color": "#ffffff", "theme_color": "#0f1d33",
        "icons": [{"src": "/img/icon-192.png", "sizes": "192x192", "type": "image/png"},
                  {"src": "/img/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]},
        ensure_ascii=False, indent=1) + '\n')


def znak_css():
    """Wstawia do style.css blok CSS znaku Wylinka 1:1 z badge.html (miedzy znacznikami)."""
    p = os.path.join(ROOT, 'style.css')
    css = czytaj(p)
    a, b = '/* wylinka-badge: START', '/* wylinka-badge: KONIEC */'
    i, j = css.index(a), css.index(b)
    poczatek = css[i:css.index('*/', i) + 2]
    nowy = css[:i] + poczatek + NL + BADGE_CSS + NL + css[j:]
    if nowy != css:
        with open(p, 'w', encoding='utf-8', newline=NL) as f:
            f.write(nowy)


def main():
    global STYLE_V, APP_V
    znak_css()
    STYLE_V, APP_V = skrot('style.css'), skrot('app.js')
    przygotuj_slowniki()
    brak = glowna()
    for l, b in brak.items():
        print('BRAK tlumaczen', l, b)
    lotnisko()
    dz = dzielnice()
    polityka()
    strona404()
    pliki_pomocnicze(dz)
    print('OK: strony wygenerowane')


if __name__ == '__main__':
    main()
