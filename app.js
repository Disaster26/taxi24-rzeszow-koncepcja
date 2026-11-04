/* Taxi Rzeszow 24H - skrypt strony. Teksty w window.T (wstawiane przez generator w kazdej wersji jezykowej). */
(function () {
  'use strict';
  var TEL = '48536805851';
  // Pomiar Google - laduje sie TYLKO po zgodzie (baner cookies). Po wdrozeniu sprawdzic w GA4 (DebugView),
  // czy page_view nie liczy sie podwojnie; jesli tak, usunac 'GT-WPTC5QLP' z listy.
  var TAGI = ['G-NKBVT5JN9D', 'AW-16837990630', 'GT-WPTC5QLP'];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var T = window.T || {};
  var lang = T._lang || document.documentElement.lang || 'pl';
  function t(k) { return T[k] !== undefined ? T[k] : k; }
  var PODGLAD = /(^|\.)github\.io$/i.test(location.hostname) || location.protocol === 'file:' || /[?&]demo=1(&|$)/.test(location.search);
  var body = document.body;
  var top = $('#top');

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function zdarzenie(n, p) { if (window.gtag && zaladowano) window.gtag('event', n, p || {}); }

  /* ---------- przelacznik jezyka (linki do /en/ /de/ /ua/) ---------- */
  var langBox = $('#lang'), langBtn = $('#langBtn');
  function zamknijLang() { if (!langBox) return; langBox.classList.remove('otwarte'); langBtn.setAttribute('aria-expanded', 'false'); }
  if (langBtn) {
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = langBox.classList.toggle('otwarte');
      langBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
      if (o) zamknijMenu();
    });
    document.addEventListener('click', function (e) { if (!langBox.contains(e.target)) zamknijLang(); });
  }

  /* ---------- menu mobilne z przyciemnieniem ---------- */
  var burger = $('#burger'), menu = $('#menu'), tlo = $('#menuTlo');
  function zamknijMenu() {
    if (!menu) return;
    menu.classList.remove('otwarte'); burger.setAttribute('aria-expanded', 'false');
    if (tlo) tlo.hidden = true;
    body.classList.remove('menu-otwarte');
    plywStan();
  }
  if (burger) {
    burger.addEventListener('click', function () {
      var o = menu.classList.toggle('otwarte');
      burger.setAttribute('aria-expanded', o ? 'true' : 'false');
      if (tlo) tlo.hidden = !o;
      body.classList.toggle('menu-otwarte', o);
      zamknijLang(); plywStan();
    });
    if (tlo) tlo.addEventListener('click', zamknijMenu);
    $$('#menu a').forEach(function (a) { a.addEventListener('click', zamknijMenu); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { zamknijLang(); zamknijMenu(); } });

  /* ---------- naglowek i plywajace przyciski: dopiero po minieciu duzych przyciskow w hero ---------- */
  var plyw = $('#plyw'), heroCta = $('#heroCta'), wForm = false, wCta = !!heroCta;
  function plywStan() {
    if (plyw) plyw.classList.toggle('widac', !wForm && !wCta && !(menu && menu.classList.contains('otwarte')));
    if (top) top.classList.toggle('hero-cta-widac', wCta);
    if (!wCta) pokazBanerZgod();
  }
  if ('IntersectionObserver' in window) {
    var formy = $('#zamow') || $('#szybki');
    if (formy) new IntersectionObserver(function (e) { wForm = e[0].isIntersecting; plywStan(); }, { rootMargin: '-15% 0px -15% 0px' }).observe(formy);
    if (heroCta) new IntersectionObserver(function (e) { wCta = e[0].isIntersecting; plywStan(); }).observe(heroCta);
  } else { wCta = false; }

  /* ---------- zgody na cookies (Consent Mode v2, domyslnie odmowa) ---------- */
  var ZG = 'taxi24-zgody', zaladowano = false, baner = null, banerPokazany = false;
  function zgodyOdczyt() { try { var z = JSON.parse(localStorage.getItem(ZG)); return z && z.v === 1 ? z : null; } catch (e) { return null; } }
  function zgodyStosuj(z) {
    if (!window.gtag) return;
    window.gtag('consent', 'update', {
      analytics_storage: z.a ? 'granted' : 'denied',
      ad_storage: z.m ? 'granted' : 'denied', ad_user_data: z.m ? 'granted' : 'denied', ad_personalization: z.m ? 'granted' : 'denied'
    });
    if ((z.a || z.m) && !zaladowano && !PODGLAD) {
      zaladowano = true;
      var s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + TAGI[0];
      document.head.appendChild(s);
      window.gtag('js', new Date());
      TAGI.forEach(function (id) { window.gtag('config', id); });
    }
    if (!z.a || !z.m) usunCookiesGoogle(z);
  }
  function usunCookiesGoogle(z) {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      var stat = /^(_ga|_gid|_gat)/.test(n), mark = /^(_gcl|_gac|IDE|test_cookie)/.test(n);
      if ((stat && !z.a) || (mark && !z.m)) {
        ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) { document.cookie = n + '=; Max-Age=0; path=/' + d; });
      }
    });
  }
  function zgodyZapisz(a, m) {
    var z = { v: 1, a: !!a, m: !!m, t: Date.now() };
    try { localStorage.setItem(ZG, JSON.stringify(z)); } catch (e) {}
    zgodyStosuj(z);
    zamknijBaner();
  }
  function zamknijBaner() {
    if (!baner) return;
    baner.hidden = true;
    body.classList.remove('zgody-widac');
    document.documentElement.style.removeProperty('--zg-h');
  }
  function zbudujBaner() {
    if (baner) return baner;
    baner = document.createElement('section');
    baner.className = 'zgody';
    baner.setAttribute('aria-labelledby', 'zgH');
    baner.innerHTML = '<div class="zg-in"><p class="zg-h" id="zgH">' + esc(t('ck.h')) + '</p>'
      + '<p class="zg-p">' + esc(t('ck.p')) + ' <a href="' + esc(body.getAttribute('data-pp') || 'polityka-prywatnosci.html') + '#cookies">' + esc(t('ck.wiecej')) + '</a></p>'
      + '<div class="zg-opcje" hidden>'
      + '<label class="zg-op"><input type="checkbox" checked disabled><span><b>' + esc(t('ck.niezb')) + '</b><small>' + esc(t('ck.niezbs')) + '</small></span></label>'
      + '<label class="zg-op"><input type="checkbox" id="zgA"><span><b>' + esc(t('ck.stat')) + '</b><small>' + esc(t('ck.stats')) + '</small></span></label>'
      + '<label class="zg-op"><input type="checkbox" id="zgM"><span><b>' + esc(t('ck.mark')) + '</b><small>' + esc(t('ck.marks')) + '</small></span></label>'
      + '</div>'
      + '<div class="zg-btn"><button type="button" class="btn zg-nie">' + esc(t('ck.nie')) + '</button>'
      + '<button type="button" class="btn zg-ust">' + esc(t('ck.ust')) + '</button>'
      + '<button type="button" class="btn zg-zapisz" hidden>' + esc(t('ck.zapisz')) + '</button>'
      + '<button type="button" class="btn btn-y zg-tak">' + esc(t('ck.tak')) + '</button></div></div>';
    body.appendChild(baner);
    $('.zg-tak', baner).addEventListener('click', function () { zgodyZapisz(true, true); });
    $('.zg-nie', baner).addEventListener('click', function () { zgodyZapisz(false, false); });
    $('.zg-ust', baner).addEventListener('click', function () { ustawienia(true); });
    $('.zg-zapisz', baner).addEventListener('click', function () { zgodyZapisz($('#zgA').checked, $('#zgM').checked); });
    return baner;
  }
  function ustawienia(otworz) {
    var z = zgodyOdczyt() || { a: false, m: false };
    $('.zg-opcje', baner).hidden = !otworz;
    $('.zg-ust', baner).hidden = otworz;
    $('.zg-zapisz', baner).hidden = !otworz;
    $('#zgA').checked = !!z.a; $('#zgM').checked = !!z.m;
    wysokoscBanera();
  }
  function wysokoscBanera() {
    if (!baner || baner.hidden) return;
    document.documentElement.style.setProperty('--zg-h', baner.offsetHeight + 'px');
  }
  function otworzBaner(zUstawieniami) {
    zbudujBaner();
    baner.hidden = false;
    body.classList.add('zgody-widac');
    ustawienia(!!zUstawieniami);
    if (zUstawieniami) $('.zg-tak', baner).focus({ preventScroll: true });
  }
  function pokazBanerZgod() {
    if (banerPokazany || zgodyOdczyt()) return;
    banerPokazany = true;
    otworzBaner(false);
  }
  window.addEventListener('resize', wysokoscBanera);
  $$('[data-cookies]').forEach(function (b) { b.addEventListener('click', function () { banerPokazany = true; otworzBaner(true); }); });
  var zp = zgodyOdczyt();
  if (zp) zgodyStosuj(zp);
  if (!heroCta || document.documentElement.scrollHeight < innerHeight * 1.4) setTimeout(pokazBanerZgod, heroCta ? 1500 : 400);   // krotka strona (np. 404): bez przewijania
  plywStan();

  // zdarzenia (wysylane tylko po zgodzie, gdy gtag jest wczytany)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (/^tel:/.test(h)) zdarzenie('click_tel', { link_text: '536805851' });
    else if (/wa\.me\//.test(h)) zdarzenie('click_whatsapp');
    else if (/^sms:/.test(h)) zdarzenie('click_sms');
  });

  /* ---------- lista uslug: na telefonie 5 pierwszych, reszta pod przyciskiem ---------- */
  var male = $('#male'), maleBtn = $('#maleWiecej');
  if (male && maleBtn) {
    male.classList.add('zwiniete');
    maleBtn.hidden = false;
    maleBtn.addEventListener('click', function () { male.classList.remove('zwiniete'); maleBtn.hidden = true; var n = male.children[5]; if (n) n.querySelector('button').focus({ preventScroll: true }); });
  }

  /* ---------- wspolne: telefon, e-mail, data ---------- */
  var p2 = function (x) { return String(x).padStart(2, '0'); };
  function telOk(v) { var c = v.replace(/[\s()+.\-]/g, ''); return /^\d{9,13}$/.test(c) && /^[\d\s()+.\-]+$/.test(v); }
  function mailOk(v) { return /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]{2,}$/.test(v); }
  function dataPL(v) { if (!v) return ''; var a = v.split('-'); return a[2] + '.' + a[1] + '.' + a[0]; }
  function wPrzeszlosci(d, g) {
    if (!d || !g) return false;
    var x = new Date(d + 'T' + g);
    return !isNaN(x) && x.getTime() < Date.now() - 10 * 60e3;
  }
  function tresc(pary) {
    var s = t('msg.start') + '\n';
    pary.forEach(function (p) { if (p[1]) s += p[0] + ': ' + p[1] + '\n'; });
    s += t('msg.end');
    if (lang !== 'pl') s += '\n(Język klienta: ' + (lang === 'uk' ? 'UA' : lang.toUpperCase()) + ')';
    return s;
  }
  function waHref(tx) { return 'https://wa.me/' + TEL + '?text=' + encodeURIComponent(tx); }
  function smsHref(tx) { return 'sms:+' + TEL + '?&body=' + encodeURIComponent(tx); }
  function czekaj(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- wysylka (wyslij.php); na podgladzie GitHub Pages tryb pokazowy ---------- */
  var ENDPOINT = body.getAttribute('data-zamowienia') || 'wyslij.php';
  var znak = null, znakT = 0, znakP = null;
  function pobierzZnacznik() {
    if (PODGLAD) return Promise.resolve(null);
    if (znak) return Promise.resolve(znak);
    if (znakP) return znakP;
    znakP = fetch(ENDPOINT + '?znacznik=1', { headers: { Accept: 'application/json' }, cache: 'no-store', credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { znakP = null; if (j && j.z) { znak = j.z; znakT = Date.now(); } return znak; })
      .catch(function () { znakP = null; return null; });
    return znakP;
  }
  function naSerwer(fd, ponow) {
    return pobierzZnacznik().then(function (z) {
      if (!z) throw { kod: 0 };
      var w = 3300 - (Date.now() - znakT);   // serwer przyjmuje znacznik najwczesniej po 3 s
      return w > 0 ? czekaj(w) : null;
    }).then(function () {
      fd.set('_z', znak);
      znak = null;                            // znacznik jest jednorazowy
      return fetch(ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' }, credentials: 'same-origin' });
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { j.kod = r.status; return j; });
    }).then(function (j) {
      pobierzZnacznik();
      if (j.success) return j;
      if (j.kod === 403 && !ponow && (j.blad === 'znacznik' || j.blad === 'szybko')) return naSerwer(fd, true);
      throw j;
    });
  }
  function wyslij(dane, cel) {
    var fd = new FormData();
    Object.keys(dane).forEach(function (k) { fd.append(k, dane[k]); });
    fd.append('jezyk', lang);
    var hp = cel.form.querySelector('.hp'); fd.append('_honey', hp ? hp.value : '');
    var btn = cel.btn, lab = btn.querySelector('span'), stary = lab.textContent;
    btn.disabled = true; btn.classList.add('wysyla'); lab.textContent = t('wysyl');
    var p = PODGLAD ? czekaj(700).then(function () { return { success: true, demo: true, potwierdzenie: !!dane.email }; }) : naSerwer(fd);
    return p.then(function (j) {
      btn.disabled = false; btn.classList.remove('wysyla'); lab.textContent = stary;
      zdarzenie('generate_lead', { form_name: dane.zrodlo, ride_type: dane.typ });
      cel.ok({ spam: !!(dane.email && j.potwierdzenie), demo: !!j.demo });
    }, function (j) {
      btn.disabled = false; btn.classList.remove('wysyla'); lab.textContent = stary;
      var m = j && j.kod === 429 ? t('err.limit') : t('err.wys');
      if (j && j.kod === 422 && j.pola) {
        var n = { telefon: t('miss.tel'), trasa: t('miss.skad'), email: t('miss.email'), termin: t('miss.termin') };
        m = t('err.start') + ' ' + j.pola.map(function (k) { return n[k] || k; }).join(', ') + '.';
      }
      cel.blad(m);
    });
  }

  /* panel "zamowienie przyjete": krotkie podsumowanie tego, co wyslano (bez ponownej wysylki przez WA/SMS) */
  function rysujOk(el, st) {
    var lista = st.pary.filter(function (p) { return p[1]; }).map(function (p) { return '<dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd>'; }).join('');
    el.innerHTML = '<div class="ok-gora"><span class="ok-ikona"><svg class="ic"><use href="#i-check"/></svg></span><h3 class="ok-h">' + esc(t('ok.h')) + '</h3></div>'
      + '<p class="ok-p">' + esc(t('ok.p2')) + ' <a href="tel:+48536805851">536&nbsp;805&nbsp;851</a>.</p>'
      + '<p class="ok-sum">' + esc(t('ok.sum')) + '</p><dl class="ok-lista">' + lista + '</dl>'
      + (st.spam ? '<p class="ok-spam">' + esc(t('ok.spam')) + '</p>' : '')
      + (st.demo && T['ok.demo'] ? '<p class="ok-demo">' + esc(t('ok.demo')) + '</p>' : '')
      + '<button class="ok-nowe" type="button">' + esc(t('ok.nowe')) + '</button>';
    $('.ok-nowe', el).addEventListener('click', st.nowe);
    el.hidden = false;
  }
  function pokazBlad(pola, el, komunikat) {
    pola.forEach(function (i) { i.setAttribute('aria-invalid', 'true'); i.setAttribute('aria-describedby', el.id); });
    el.textContent = komunikat; el.hidden = false;
  }
  function czyscBledy(form) {
    $$('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); });
    $$('.blad', form).forEach(function (p) { p.classList.remove('blad'); });
  }

  /* ---------- szybki formularz (hero) ---------- */
  var szybki = $('#szybki');
  if (szybki) (function () {
    var qSkad = $('#qSkad'), qDokad = $('#qDokad'), qKiedy = $('#qKiedy'), qTel = $('#qTel'), qOk = $('#qOk'), qBlad = $('#qBlad');
    var waski = window.matchMedia('(max-width:900px)');
    function qTyp() { var r = $('input[name="qtyp"]:checked', szybki); return r ? r.value : 'miasto'; }
    function qPlaceholder() {
      var q = qTyp(), s = waski.matches ? 'qps.' : 'qp.';
      qSkad.placeholder = q === 'inne' ? t(s + 'inneSkad') : t(s + 'skad');
      qDokad.placeholder = q === 'inne' ? t(s + 'inneDokad') : t(s + 'dokad');
      if (q === 'lotnisko') qDokad.setAttribute('list', 'lotniskaLista');
      else if (q === 'trasa') qDokad.setAttribute('list', 'trasyLista');
      else qDokad.removeAttribute('list');
    }
    if (waski.addEventListener) waski.addEventListener('change', qPlaceholder);
    $$('input[name="qtyp"]', szybki).forEach(function (r) { r.addEventListener('change', qPlaceholder); });
    qPlaceholder();
    var dzis = new Date();
    qKiedy.min = dzis.getFullYear() + '-' + p2(dzis.getMonth() + 1) + '-' + p2(dzis.getDate()) + 'T00:00';
    var qKiedyPole = qKiedy.closest('.q-kiedy');
    function kiedyStan() { qKiedyPole.classList.toggle('pusty', !qKiedy.value && document.activeElement !== qKiedy); }
    ['input', 'change', 'focus', 'blur'].forEach(function (ev) { qKiedy.addEventListener(ev, kiedyStan); });
    // klik w cale pole otwiera kalendarz (jedna ikona - nasza)
    qKiedyPole.addEventListener('click', function () { try { if (qKiedy.showPicker) qKiedy.showPicker(); } catch (e) {} });
    szybki.addEventListener('input', function (e) {
      var p = e.target.closest('.pole'); if (p && e.target.value.trim()) { p.classList.remove('blad'); e.target.removeAttribute('aria-invalid'); }
    });
    ['focusin', 'input'].forEach(function (ev) { szybki.addEventListener(ev, pobierzZnacznik); });

    function kiedyHero() {
      if (!qKiedy.value) return t('v.teraz');
      var a = qKiedy.value.split('T');
      return dataPL(a[0]) + (a[1] ? ', ' + t('v.godz') + ' ' + a[1].slice(0, 5) : '');
    }
    szybki.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = qTyp(), s = qSkad.value.trim(), d = qDokad.value.trim(), tel = qTel.value.trim();
      czyscBledy(szybki); qBlad.hidden = true;
      var zle = [];
      if (!s) zle.push(qSkad);
      if (!telOk(tel)) zle.push(qTel);
      var kv = qKiedy.value.split('T');
      if (qKiedy.value && wPrzeszlosci(kv[0], kv[1])) zle.push(qKiedy);
      if (zle.length) {
        zle.forEach(function (i) { i.closest('.pole').classList.add('blad'); });
        var k = zle.indexOf(qKiedy) >= 0 && zle.length === 1 ? 'err.przeszly' : (!s && !telOk(tel)) ? 'err.qoba' : !s ? 'err.qskad' : !telOk(tel) ? 'err.qtel' : 'err.przeszly';
        pokazBlad(zle, qBlad, t(k));
        zle[0].focus();
        return;
      }
      var pary = [[t('k.usluga'), t('typ.' + q)], [q === 'inne' ? t('k.adres') : t('k.skad'), s], [t('k.dokad'), d], [t('k.kiedy'), kiedyHero()], [t('k.tel'), tel]];
      wyslij({ zrodlo: 'szybki', typ: q, skad: s, dokad: d, kiedy: qKiedy.value || 'teraz', telefon: tel }, {
        form: szybki, btn: $('.q-btn', szybki),
        ok: function (o) {
          szybki.classList.add('wyslane');
          rysujOk(qOk, { pary: pary, spam: false, demo: o.demo, nowe: function () {
            szybki.classList.remove('wyslane'); qOk.hidden = true;
            qSkad.value = ''; qDokad.value = ''; qKiedy.value = ''; kiedyStan();
            qSkad.focus();
          } });
          qOk.focus({ preventScroll: true });
        },
        blad: function (m) {
          qBlad.innerHTML = esc(m) + ' <a href="' + esc(waHref(tresc(pary))) + '" target="_blank" rel="noopener">WhatsApp</a> · <a href="' + esc(smsHref(tresc(pary))) + '">SMS</a>';
          qBlad.hidden = false;
        }
      });
    });
    window.taxiSzybki = function (typ) {
      var r = $('input[name="qtyp"][value="' + typ + '"]', szybki); if (r) { r.checked = true; qPlaceholder(); }
      var y = szybki.getBoundingClientRect().top + window.scrollY - (top ? top.offsetHeight : 0) - 12;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(function () { qSkad.focus({ preventScroll: true }); }, 500);
    };
  })();

  /* ---------- pelny formularz zamowienia ---------- */
  var zam = $('#zam');
  var doFormularza = function (fokus) {
    if (!zam) { if (window.taxiSzybki) window.taxiSzybki('miasto'); return; }
    widok();
    var sek = $('#zamow');
    var y = sek.getBoundingClientRect().top + window.scrollY - (top ? top.offsetHeight : 0);
    window.scrollTo({ top: y, behavior: 'smooth' });
    if (!fokus) return;
    var zrobione = false;
    var ustaw = function () { if (zrobione) return; zrobione = true; window.removeEventListener('scrollend', ustaw); fokus.focus({ preventScroll: true }); };
    if ('onscrollend' in window) { window.addEventListener('scrollend', ustaw); setTimeout(ustaw, 1500); } else setTimeout(ustaw, 900);
  };
  var widok = function () {};
  if (zam) (function () {
    var osoby = 1;
    var pola = { skad: $('#skad'), dokad: $('#dokad'), data: $('#data'), godz: $('#godz'), lot: $('#lot'), imie: $('#imie'), tel: $('#tel'),
      email: $('#email'), uwagi: $('#uwagi'), lotnisko: $('#lotSel'), usluga: $('#usluga'), bagaz: $('#bagaz') };
    function wart(n) { var el = zam.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; }
    function ustawRadio(n, v) { var el = zam.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (el) el.checked = true; }
    function tekstOpcji(sel) { var o = sel.options[sel.selectedIndex]; return o ? o.textContent : ''; }

    (function () {
      var d = new Date(Date.now() + 2 * 3600e3);
      d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
      var dzis = new Date();
      pola.data.min = dzis.getFullYear() + '-' + p2(dzis.getMonth() + 1) + '-' + p2(dzis.getDate());
      pola.data.value = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
      pola.godz.value = p2(d.getHours()) + ':' + p2(d.getMinutes());
    })();

    widok = function () {
      var typ = wart('typ'), kier = wart('kierunek'), kiedy = wart('kiedy');
      $$('.tylko-lot', zam).forEach(function (el) { el.classList.toggle('ukryte', typ !== 'lotnisko'); });
      $$('.tylko-inne', zam).forEach(function (el) { el.classList.toggle('ukryte', typ !== 'inne'); });
      $$('.tylko-termin', zam).forEach(function (el) { el.classList.toggle('ukryte', kiedy !== 'termin'); });
      var labS = $('#labSkad'), labD = $('#labDokad'), pS = $('#poleSkad'), pD = $('#poleDokad');
      pS.classList.remove('ukryte'); pD.classList.remove('ukryte');
      pola.uwagi.placeholder = t('ph.uwagi');
      if (typ === 'lotnisko') {
        if (kier === 'na') { labS.textContent = t('lab.odbior'); pD.classList.add('ukryte'); pola.skad.placeholder = t('ph.adres'); }
        else { labD.textContent = t('lab.docel'); pS.classList.add('ukryte'); pola.dokad.placeholder = t('ph.adres'); }
        $('#lotOpc').textContent = kier === 'z' ? t('opc.z') : t('opc.opc');
      } else if (typ === 'inne') {
        labS.textContent = t('lab.inneSkad'); labD.textContent = t('lab.inneDokad');
        pola.skad.placeholder = t('ph.adres'); pola.dokad.placeholder = t('ph.dostawa');
        var u = pola.usluga.value;
        pola.uwagi.placeholder = u === 'Zakupy na zlecenie' ? t('ph.zakupy') : u === 'Drobna pomoc drogowa' ? t('ph.pomoc') : t('ph.opisz');
      } else {
        labS.textContent = t('lab.skad'); labD.textContent = t('lab.dokad');
        pola.skad.placeholder = t('ph.adres');
        pola.dokad.placeholder = typ === 'trasa' ? t('ph.trasa') : t('ph.dworzec');
      }
      $('#rzadTrasa').classList.toggle('jedno', typ === 'lotnisko');
      if (typ === 'trasa') pola.dokad.setAttribute('list', 'trasyLista'); else pola.dokad.removeAttribute('list');
      podsumuj();
    };

    function zOsobami() {
      var u = pola.usluga.value;
      return wart('typ') !== 'inne' || u === 'Transport dzieci lub seniorów' || u === 'Obsługa imprezy lub wydarzenia' || u === 'Transport dla firmy (faktura)';
    }
    function kiedyTxt() {
      return wart('kiedy') === 'teraz' ? t('v.teraz') : (pola.data.value ? dataPL(pola.data.value) + (pola.godz.value ? ', ' + t('v.godz') + ' ' + pola.godz.value : '') : '');
    }
    // [etykieta, wartosc, wymagane]
    function dane() {
      var typ = wart('typ'), kier = wart('kierunek');
      var skad = pola.skad.value.trim(), dokad = pola.dokad.value.trim(), lot = tekstOpcji(pola.lotnisko);
      var w = [];
      var usl = typ === 'lotnisko' ? (kier === 'na' ? t('v.na') : t('v.z')) : typ === 'inne' ? tekstOpcji(pola.usluga) : t('typ.' + typ);
      w.push([t('k.usluga'), usl, true]);
      if (typ === 'lotnisko') {
        if (kier === 'na') { w.push([t('k.skad'), skad, true]); w.push([t('k.dokad'), lot, true]); }
        else { w.push([t('k.skad'), lot, true]); w.push([t('k.dokad'), dokad, true]); }
      } else if (typ === 'inne') {
        w.push([t('k.adres'), skad, true]);
        w.push([t('k.dokad'), dokad, false]);
      } else { w.push([t('k.skad'), skad, true]); w.push([t('k.dokad'), dokad, true]); }
      w.push([t('k.kiedy'), kiedyTxt(), true]);
      if (zOsobami()) { w.push([t('k.osoby'), String(osoby), false]); w.push([t('k.bagaz'), tekstOpcji(pola.bagaz), false]); }
      if (typ === 'lotnisko') w.push([t('k.lot'), pola.lot.value.trim().toUpperCase(), false]);
      w.push([t('k.imie'), pola.imie.value.trim(), false]);
      w.push([t('k.tel'), pola.tel.value.trim(), true]);
      w.push([t('k.email'), pola.email.value.trim(), false]);
      w.push([t('k.uwagi'), pola.uwagi.value.trim(), false]);
      return w;
    }
    var lista = $('#psLista');
    function podsumuj() {
      $('#psTyp').textContent = t('typ.' + wart('typ'));
      var h = '';
      dane().forEach(function (p) {
        if (!p[1] && !p[2]) return;           // puste pola opcjonalne pomijamy
        h += '<dt>' + esc(p[0]) + '</dt><dd' + (!p[1] ? ' class="brak"' : '') + '>' + esc(p[1] || t('brak')) + '</dd>';
      });
      lista.innerHTML = h;
      var tx = tresc(dane());
      $('#wyslijWa').href = waHref(tx);
      $('#wyslijSms').href = smsHref(tx);
    }

    function braki(zTel) {
      var typ = wart('typ'), kier = wart('kierunek'), kiedy = wart('kiedy'), b = [], wym = [];
      if (typ === 'lotnisko') wym.push(kier === 'na' ? 'skad' : 'dokad');
      else if (typ === 'inne') wym.push('skad');
      else wym.push('skad', 'dokad');
      if (kiedy === 'termin') wym.push('data', 'godz');
      var nazwy = { skad: t('miss.skad'), dokad: typ === 'lotnisko' ? t('miss.docel') : t('miss.cel'), data: t('miss.data'), godz: t('miss.godz'),
        tel: t('miss.tel'), email: t('miss.email'), termin: t('miss.termin') };
      wym.forEach(function (k) { if (!pola[k].value.trim()) b.push(k); });
      if (kiedy === 'termin' && pola.data.value && pola.godz.value && wPrzeszlosci(pola.data.value, pola.godz.value)) b.push('godz');
      if (zTel) {
        if (!telOk(pola.tel.value.trim())) b.push('tel');
        if (pola.email.value.trim() && !mailOk(pola.email.value.trim())) b.push('email');
      }
      var przeszly = kiedy === 'termin' && wPrzeszlosci(pola.data.value, pola.godz.value);
      return { pola: b, tekst: b.map(function (k) { return k === 'godz' && przeszly ? t('miss.termin') : nazwy[k]; }), przeszly: przeszly };
    }
    var blad = $('#psBlad');
    function sprawdz(e, zTel) {
      var b = braki(zTel);
      czyscBledy(zam);
      if (b.pola.length) {
        if (e) e.preventDefault();
        if (b.pola.indexOf('email') >= 0) $('#zWiecej').open = true;
        b.pola.forEach(function (k) { pola[k].closest('.z-pole').classList.add('blad'); });
        pokazBlad(b.pola.map(function (k) { return pola[k]; }), blad, t('err.start') + ' ' + b.tekst.filter(function (x, i, a) { return a.indexOf(x) === i; }).join(', ') + '.');
        pola[b.pola[0]].focus({ preventScroll: true });
        pola[b.pola[0]].scrollIntoView({ block: 'center', behavior: 'smooth' });
        return false;
      }
      blad.hidden = true;
      return true;
    }
    zam.addEventListener('input', podsumuj);
    zam.addEventListener('change', function (e) {
      if (e.target.name === 'typ' || e.target.name === 'kierunek' || e.target.name === 'kiedy' || e.target.id === 'usluga') widok(); else podsumuj();
      $$('.z-pole.blad', zam).forEach(function (p) { var i = p.querySelector('input'); if (i && i.value.trim()) { p.classList.remove('blad'); i.removeAttribute('aria-invalid'); } });
    });
    ['focusin', 'input'].forEach(function (ev) { zam.addEventListener(ev, pobierzZnacznik); });
    $$('.licznik button', zam).forEach(function (b) {
      b.addEventListener('click', function () {
        osoby = Math.min(8, Math.max(1, osoby + Number(b.dataset.d)));
        $('#osoby').textContent = osoby; $('#osobyPole').value = osoby; podsumuj();
      });
    });
    $('#wyslijWa').addEventListener('click', function (e) { sprawdz(e, false); });
    $('#wyslijSms').addEventListener('click', function (e) { sprawdz(e, false); });

    var podsum = $('#podsum'), psOk = $('#psOk');
    var waski = window.matchMedia('(max-width:900px)');
    zam.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!sprawdz(null, true)) return;
      var typ = wart('typ'), kiedy = wart('kiedy');
      var d = { zrodlo: 'pelny', typ: typ, skad: pola.skad.value.trim(), dokad: pola.dokad.value.trim(), kiedy: kiedy,
        imie: pola.imie.value.trim(), telefon: pola.tel.value.trim(), email: pola.email.value.trim(), uwagi: pola.uwagi.value.trim() };
      if (kiedy === 'termin') { d.data = pola.data.value; d.godz = pola.godz.value; }
      if (typ === 'lotnisko') { d.kierunek = wart('kierunek'); d.lotnisko = pola.lotnisko.value; d.lot = pola.lot.value.trim(); }
      if (typ === 'inne') d.usluga = pola.usluga.value;
      if (zOsobami()) { d.osoby = String(osoby); d.bagaz = pola.bagaz.value; }
      var pary = dane();
      wyslij(d, {
        form: zam, btn: $('#wyslijMail'),
        ok: function (o) {
          podsum.classList.add('wyslane');
          rysujOk(psOk, { pary: pary, spam: o.spam, demo: o.demo, nowe: function () {
            podsum.classList.remove('wyslane'); psOk.hidden = true; podsumuj();
            pola.skad.focus({ preventScroll: true }); doFormularza(null);
          } });
          psOk.focus({ preventScroll: true });
          if (waski.matches) psOk.scrollIntoView({ block: 'center', behavior: 'smooth' });
        },
        blad: function (m) { blad.textContent = m; blad.hidden = false; }
      });
    });

    /* przyciski lotnisk i uslug ustawiaja formularz */
    $$('[data-lotnisko]').forEach(function (b) {
      b.addEventListener('click', function () { ustawRadio('typ', 'lotnisko'); pola.lotnisko.value = b.dataset.lotnisko; doFormularza(wart('kierunek') === 'z' ? pola.dokad : pola.skad); });
    });
    $$('[data-usluga]').forEach(function (b) {
      b.addEventListener('click', function () {
        ustawRadio('typ', 'inne'); pola.usluga.value = b.dataset.usluga;
        if (b.dataset.uwagi && !pola.uwagi.value.trim()) { pola.uwagi.value = b.dataset.uwagi; $('#zWiecej').open = true; }
        doFormularza(pola.skad);
      });
    });
    $$('[data-trasa]').forEach(function (b) {
      b.addEventListener('click', function () { ustawRadio('typ', 'trasa'); pola.dokad.value = b.dataset.trasa; doFormularza(pola.skad); });
    });
    $$('[data-typ]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); ustawRadio('typ', b.dataset.typ); doFormularza(pola.skad); });
    });
    widok();
  })();

  // "Zamow taxi" w naglowku: do formularza na tej stronie
  $$('a.top-cta').forEach(function (a) {
    var h = a.getAttribute('href');
    if (h === '#zamow' || h === '#szybki') a.addEventListener('click', function (e) { e.preventDefault(); if (zam) doFormularza(null); else if (window.taxiSzybki) window.taxiSzybki('miasto'); });
  });
})();
