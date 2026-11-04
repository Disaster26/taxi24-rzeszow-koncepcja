(function () {
  'use strict';
  var TEL = '48536805851';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var I18N = window.I18N || { pl: {} };
  var LANGS = ['pl', 'en', 'de', 'uk'];
  var KOD = { pl: 'PL', en: 'EN', de: 'DE', uk: 'UA' };
  var lang = 'pl';

  /* ---------- tlumaczenia: polski tekst pobierany z HTML ---------- */
  var ATR = [['data-i18n', 'text'], ['data-i18n-html', 'html'], ['data-i18n-ph', 'placeholder'], ['data-i18n-aria', 'aria-label'], ['data-i18n-alt', 'alt']];
  ATR.forEach(function (a) {
    $$('[' + a[0] + ']').forEach(function (el) {
      var k = el.getAttribute(a[0]);
      if (I18N.pl[k] !== undefined) return;
      I18N.pl[k] = a[1] === 'text' ? el.textContent : a[1] === 'html' ? el.innerHTML : el.getAttribute(a[1]);
    });
  });
  function t(k) { var d = I18N[lang] || {}; return d[k] !== undefined ? d[k] : (I18N.pl[k] !== undefined ? I18N.pl[k] : k); }

  function zastosuj() {
    ATR.forEach(function (a) {
      $$('[' + a[0] + ']').forEach(function (el) {
        var v = t(el.getAttribute(a[0]));
        if (a[1] === 'text') el.textContent = v;
        else if (a[1] === 'html') el.innerHTML = v;
        else el.setAttribute(a[1], v);
      });
    });
    document.documentElement.lang = lang;
    document.title = t('meta.title');
    var md = $('meta[name="description"]'); if (md) md.setAttribute('content', t('meta.desc'));
    var ol = $('meta[property="og:locale"]'); if (ol) ol.setAttribute('content', t('og.locale'));
    $$('#langList a').forEach(function (a) { a.setAttribute('aria-current', a.dataset.lang === lang ? 'true' : 'false'); });
    $('#langCur').textContent = KOD[lang];
    $('#langBtn').setAttribute('aria-label', t('lang.nazwa'));
  }

  function ustawJezyk(l, zapisz) {
    if (LANGS.indexOf(l) < 0) l = 'pl';
    lang = l;
    zastosuj();
    if (typeof widok === 'function' && zam) { widok(); qPlaceholder(); przerysujPanele(); }
    if (zapisz) {
      try { localStorage.setItem('taxi24-lang', l); } catch (e) {}
      try {
        var u = new URL(location.href);
        if (l === 'pl') u.searchParams.delete('lang'); else u.searchParams.set('lang', l);
        history.replaceState(null, '', u.pathname + u.search + u.hash);
      } catch (e) {}
    }
  }

  /* ---------- przelacznik jezyka ---------- */
  var langBox = $('#lang'), langBtn = $('#langBtn');
  function zamknijLang() { langBox.classList.remove('otwarte'); langBtn.setAttribute('aria-expanded', 'false'); }
  langBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var o = langBox.classList.toggle('otwarte');
    langBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
    if (o) zamknijMenu();
  });
  $$('#langList a').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); ustawJezyk(a.dataset.lang, true); zamknijLang(); });
  });
  document.addEventListener('click', function (e) { if (!langBox.contains(e.target)) zamknijLang(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { zamknijLang(); zamknijMenu(); } });

  /* ---------- menu ---------- */
  var burger = $('#burger'), menu = $('#menu');
  function zamknijMenu() { menu.classList.remove('otwarte'); burger.setAttribute('aria-expanded', 'false'); plywStan(); }
  burger.addEventListener('click', function () {
    var o = menu.classList.toggle('otwarte');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    zamknijLang(); plywStan();
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', zamknijMenu); });

  /* ---------- plywajace przyciski: od wejscia; chowane przy formularzu (ma wlasne przyciski) i przy otwartym menu ---------- */
  var plyw = $('#plyw'), wForm = false;
  function plywStan() { if (plyw) plyw.classList.toggle('widac', !wForm && !(menu && menu.classList.contains('otwarte'))); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { wForm = e[0].isIntersecting; plywStan(); }, { rootMargin: '-15% 0px -15% 0px' }).observe($('#zamow'));
  }

  /* ---------- formularz zamowienia ---------- */
  var zam = $('#zam');
  var osoby = 1;
  var pola = { skad: $('#skad'), dokad: $('#dokad'), data: $('#data'), godz: $('#godz'), lot: $('#lot'), imie: $('#imie'), tel: $('#tel'), email: $('#email'), uwagi: $('#uwagi'), lotnisko: $('#lotSel'), usluga: $('#usluga'), bagaz: $('#bagaz') };

  function wart(n) { var el = zam.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; }
  function ustawRadio(n, v) { var el = zam.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (el) el.checked = true; }
  function tekstOpcji(sel) { var o = sel.options[sel.selectedIndex]; return o ? o.textContent : ''; }
  var p2 = function (x) { return String(x).padStart(2, '0'); };
  function telOk(v) { var c = v.replace(/[\s()+.\-]/g, ''); return /^\d{9,13}$/.test(c) && /^[\d\s()+.\-]+$/.test(v); }
  function mailOk(v) { return /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]{2,}$/.test(v); }

  // domyslny termin: dzis + 2 h, zaokraglone do 5 min
  (function () {
    var d = new Date(Date.now() + 2 * 3600e3);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
    var dzis = new Date();
    pola.data.min = dzis.getFullYear() + '-' + p2(dzis.getMonth() + 1) + '-' + p2(dzis.getDate());
    pola.data.value = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
    pola.godz.value = p2(d.getHours()) + ':' + p2(d.getMinutes());
    $('#qKiedy').min = pola.data.min + 'T00:00';
  })();

  function widok() {
    var typ = wart('typ'), kier = wart('kier'), kiedy = wart('kiedy');
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
    if (typ === 'trasa') pola.dokad.setAttribute('list', 'trasyLista'); else pola.dokad.removeAttribute('list');
    podsumuj();
  }

  function dataPL(v) { if (!v) return ''; var a = v.split('-'); return a[2] + '.' + a[1] + '.' + a[0]; }
  function zOsobami() {
    var u = pola.usluga.value;
    return wart('typ') !== 'inne' || u === 'Transport dzieci lub seniorów' || u === 'Obsługa imprezy lub wydarzenia' || u === 'Transport dla firmy (faktura)';
  }

  function dane() {
    var typ = wart('typ'), kier = wart('kier'), kiedy = wart('kiedy');
    var skad = pola.skad.value.trim(), dokad = pola.dokad.value.trim(), lot = tekstOpcji(pola.lotnisko);
    var w = [];
    var usl = typ === 'lotnisko' ? (kier === 'na' ? t('v.na') : t('v.z')) : typ === 'inne' ? tekstOpcji(pola.usluga) : t('typ.' + typ);
    w.push([t('k.usluga'), usl]);
    if (typ === 'lotnisko') {
      if (kier === 'na') { w.push([t('k.skad'), skad]); w.push([t('k.dokad'), lot]); }
      else { w.push([t('k.skad'), lot]); w.push([t('k.dokad'), dokad]); }
    } else if (typ === 'inne') {
      w.push([t('k.adres'), skad]);
      if (dokad) w.push([t('k.dokad'), dokad]);
    } else { w.push([t('k.skad'), skad]); w.push([t('k.dokad'), dokad]); }
    var kiedyTxt = kiedy === 'teraz' ? t('v.teraz') : (pola.data.value ? dataPL(pola.data.value) + (pola.godz.value ? ', ' + t('v.godz') + ' ' + pola.godz.value : '') : '');
    w.push([t('k.kiedy'), kiedyTxt]);
    if (zOsobami()) {
      w.push([t('k.osoby'), String(osoby)]);
      w.push([t('k.bagaz'), tekstOpcji(pola.bagaz)]);
    }
    if (typ === 'lotnisko') w.push([t('k.lot'), pola.lot.value.trim().toUpperCase()]);
    w.push([t('k.imie'), pola.imie.value.trim()]);
    w.push([t('k.tel'), pola.tel.value.trim()]);
    if (pola.email.value.trim()) w.push([t('k.email'), pola.email.value.trim()]);
    if (pola.uwagi.value.trim()) w.push([t('k.uwagi'), pola.uwagi.value.trim()]);
    return w;
  }

  // zTel: wysylka mailem (telefon wymagany, e-mail sprawdzany); WhatsApp / SMS - bez telefonu
  function braki(zTel) {
    var typ = wart('typ'), kier = wart('kier'), kiedy = wart('kiedy'), b = [], wym = [];
    if (typ === 'lotnisko') wym.push(kier === 'na' ? 'skad' : 'dokad');
    else if (typ === 'inne') wym.push('skad');
    else wym.push('skad', 'dokad');
    if (kiedy === 'termin') wym.push('data', 'godz');
    var nazwy = { skad: t('miss.skad'), dokad: typ === 'lotnisko' ? t('miss.docel') : t('miss.cel'), data: t('miss.data'), godz: t('miss.godz'), tel: t('miss.tel'), email: t('miss.email') };
    wym.forEach(function (k) { if (!pola[k].value.trim()) b.push(k); });
    if (zTel) {
      if (!telOk(pola.tel.value.trim())) b.push('tel');
      if (pola.email.value.trim() && !mailOk(pola.email.value.trim())) b.push('email');
    }
    return { pola: b, tekst: b.map(function (k) { return nazwy[k]; }) };
  }

  var lista = $('#psLista');
  function podsumuj() {
    $('#psTyp').textContent = t('typ.' + wart('typ'));
    var html = '';
    dane().forEach(function (p) {
      var pusto = !p[1];
      html += '<dt>' + esc(p[0]) + '</dt><dd' + (pusto ? ' class="brak"' : '') + '>' + (pusto ? esc(t('brak')) : esc(p[1])) + '</dd>';
    });
    lista.innerHTML = html;
    var tx = tresc(dane());
    $('#wyslijWa').href = waHref(tx);
    $('#wyslijSms').href = smsHref(tx);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tresc(pary) {
    var s = t('msg.start') + '\n';
    pary.forEach(function (p) { if (p[1]) s += p[0] + ': ' + p[1] + '\n'; });
    s += t('msg.end');
    if (lang !== 'pl') s += '\n(Język klienta: ' + KOD[lang] + ')';
    return s;
  }
  function waHref(tx) { return 'https://wa.me/' + TEL + '?text=' + encodeURIComponent(tx); }
  function smsHref(tx) { return 'sms:+' + TEL + '?&body=' + encodeURIComponent(tx); }

  zam.addEventListener('input', podsumuj);
  zam.addEventListener('change', function (e) {
    if (e.target.name === 'typ' || e.target.name === 'kier' || e.target.name === 'kiedy' || e.target.id === 'usluga') widok(); else podsumuj();
    $$('.z-pole.blad', zam).forEach(function (p) { var i = p.querySelector('input'); if (i && i.value.trim()) p.classList.remove('blad'); });
  });
  $$('.licznik button').forEach(function (b) {
    b.addEventListener('click', function () {
      osoby = Math.min(8, Math.max(1, osoby + Number(b.dataset.d)));
      $('#osoby').textContent = osoby; podsumuj();
    });
  });

  var blad = $('#psBlad');
  function sprawdz(e, zTel) {
    var b = braki(zTel);
    $$('.z-pole', zam).forEach(function (p) { p.classList.remove('blad'); });
    if (b.pola.length) {
      if (e) e.preventDefault();
      b.pola.forEach(function (k) { pola[k].closest('.z-pole').classList.add('blad'); });
      blad.textContent = t('err.start') + ' ' + b.tekst.join(', ') + '.';
      blad.hidden = false;
      pola[b.pola[0]].focus({ preventScroll: true });
      pola[b.pola[0]].scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }
    blad.hidden = true;
    return true;
  }
  $('#wyslijWa').addEventListener('click', function (e) { sprawdz(e, false); });
  $('#wyslijSms').addEventListener('click', function (e) { sprawdz(e, false); });

  var tt;
  function toast(m) { var el = $('#toast'); el.textContent = m; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove('on'); }, 2200); }

  /* ---------- wysylka zamowienia mailem (wyslij.php); na GitHub Pages tryb pokazowy ---------- */
  var DEMO = /(^|\.)github\.io$/i.test(location.hostname) || location.protocol === 'file:' || /[?&]demo=1(&|$)/.test(location.search);
  var ENDPOINT = document.body.getAttribute('data-zamowienia') || 'wyslij.php';
  var znak = null, znakT = 0, znakP = null;
  function pobierzZnacznik() {
    if (DEMO) return Promise.resolve(null);
    if (znak) return Promise.resolve(znak);
    if (znakP) return znakP;
    znakP = fetch(ENDPOINT + '?znacznik=1', { headers: { Accept: 'application/json' }, cache: 'no-store', credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { znakP = null; if (j && j.z) { znak = j.z; znakT = Date.now(); } return znak; })
      .catch(function () { znakP = null; return null; });
    return znakP;
  }
  ['focusin', 'input'].forEach(function (ev) {
    $('#szybki').addEventListener(ev, pobierzZnacznik);
    zam.addEventListener(ev, pobierzZnacznik);
  });
  function czekaj(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
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
      pobierzZnacznik();                      // nowy znacznik na kolejne zamowienie
      if (j.success) return j;
      if (j.kod === 403 && !ponow && (j.blad === 'znacznik' || j.blad === 'szybko')) return naSerwer(fd, true);
      throw j;
    });
  }

  // panel "zamowienie przyjete" (w naglowku albo obok formularza); przy zmianie jezyka rysowany od nowa
  var panele = [];
  function rysujOk(st) {
    var tx = tresc(st.pary());
    st.el.innerHTML = '<div class="ok-gora"><span class="ok-ikona"><svg class="ic"><use href="#i-check"/></svg></span><h3 class="ok-h">' + esc(t('ok.h')) + '</h3></div>'
      + '<p class="ok-p">' + esc(t('ok.p')) + ' ' + esc(t('ok.pilne')) + ' <a href="tel:+48536805851">536&nbsp;805&nbsp;851</a>.</p>'
      + (st.spam ? '<p class="ok-spam">' + esc(t('ok.spam')) + '</p>' : '')
      + (st.demo ? '<p class="ok-demo">' + esc(t('ok.demo')) + '</p>' : '')
      + (st.demo ? '<p class="ok-alt">' + esc(t('ok.alt')) + '</p>'
      + '<div class="ok-dwa"><a class="btn btn-wa" href="' + esc(waHref(tx)) + '" target="_blank" rel="noopener"><svg class="ic"><use href="#i-wa"/></svg><span>WhatsApp</span></a>'
      + '<a class="btn btn-ghost" href="' + esc(smsHref(tx)) + '"><svg class="ic"><use href="#i-msg"/></svg><span>SMS</span></a></div>' : '')
      + '<button class="ok-nowe" type="button">' + esc(t('ok.nowe')) + '</button>';
    st.el.querySelector('.ok-nowe').addEventListener('click', st.nowe);
  }
  function pokazOk(st) {
    panele = panele.filter(function (p) { return p.el !== st.el; });
    panele.push(st);
    rysujOk(st);
    st.el.hidden = false;
  }
  function przerysujPanele() { panele.forEach(function (p) { if (!p.el.hidden) rysujOk(p); }); }

  function wyslij(dane, cel) {
    var fd = new FormData();
    Object.keys(dane).forEach(function (k) { fd.append(k, dane[k]); });
    fd.append('jezyk', lang);
    var hp = cel.form.querySelector('.hp'); fd.append('_honey', hp ? hp.value : '');
    var btn = cel.btn, lab = btn.querySelector('span'), stary = lab.textContent;
    btn.disabled = true; btn.classList.add('wysyla'); lab.textContent = t('wysyl');
    var p = DEMO ? czekaj(700).then(function () { return { success: true, demo: true, potwierdzenie: !!dane.email }; }) : naSerwer(fd);
    return p.then(function (j) {
      btn.disabled = false; btn.classList.remove('wysyla'); lab.textContent = stary;
      cel.ok({ spam: !!(dane.email && j.potwierdzenie), demo: !!j.demo });
    }, function (j) {
      btn.disabled = false; btn.classList.remove('wysyla'); lab.textContent = stary;
      var m = j && j.kod === 429 ? t('err.limit') : t('err.wys');
      if (j && j.kod === 422 && j.pola) {
        var n = { telefon: t('miss.tel'), trasa: t('miss.skad'), email: t('miss.email'), termin: t('miss.data') + ', ' + t('miss.godz') };
        m = t('err.start') + ' ' + j.pola.map(function (k) { return n[k] || k; }).join(', ') + '.';
      }
      cel.blad(m);
    });
  }

  /* pelny formularz: przycisk "Zamow taxi" (form="zam") albo Enter w polu */
  var podsum = $('#podsum'), psOk = $('#psOk');
  zam.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!sprawdz(null, true)) return;
    var typ = wart('typ'), kiedy = wart('kiedy');
    var d = { zrodlo: 'pelny', typ: typ, skad: pola.skad.value.trim(), dokad: pola.dokad.value.trim(), kiedy: kiedy,
      imie: pola.imie.value.trim(), telefon: pola.tel.value.trim(), email: pola.email.value.trim(), uwagi: pola.uwagi.value.trim() };
    if (kiedy === 'termin') { d.data = pola.data.value; d.godz = pola.godz.value; }
    if (typ === 'lotnisko') { d.kierunek = wart('kier'); d.lotnisko = pola.lotnisko.value; d.lot = pola.lot.value.trim(); }
    if (typ === 'inne') d.usluga = pola.usluga.value;
    if (zOsobami()) { d.osoby = String(osoby); d.bagaz = pola.bagaz.value; }
    var pary = dane();
    wyslij(d, {
      form: zam, btn: $('#wyslijMail'),
      ok: function (o) {
        podsum.classList.add('wyslane');
        pokazOk({ el: psOk, spam: o.spam, demo: o.demo, pary: function () { return pary; }, nowe: function () {
          podsum.classList.remove('wyslane'); psOk.hidden = true; podsumuj();
          pola.skad.focus({ preventScroll: true }); doFormularza(null);
        } });
        psOk.focus({ preventScroll: true });
        if (waski.matches) psOk.scrollIntoView({ block: 'center', behavior: 'smooth' });
      },
      blad: function (m) { blad.textContent = m; blad.hidden = false; }
    });
  });

  function doFormularza(fokus) {
    widok();
    var sek = $('#zamow');
    var y = sek.getBoundingClientRect().top + window.scrollY - $('#top').offsetHeight;
    window.scrollTo({ top: y, behavior: 'smooth' });
    if (!fokus) return;
    var zrobione = false;
    var ustaw = function () { if (zrobione) return; zrobione = true; window.removeEventListener('scrollend', ustaw); fokus.focus({ preventScroll: true }); };
    if ('onscrollend' in window) { window.addEventListener('scrollend', ustaw); setTimeout(ustaw, 1500); } else setTimeout(ustaw, 900);
  }

  /* ---------- formularz zamowienia w hero ---------- */
  var szybki = $('#szybki'), qSkad = $('#qSkad'), qDokad = $('#qDokad'), qKiedy = $('#qKiedy'), qTel = $('#qTel'), qOk = $('#qOk');
  var waski = window.matchMedia('(max-width:900px)');
  function qPlaceholder() {
    var q = $('input[name="qtyp"]:checked').value, s = waski.matches ? 'qps.' : 'qp.';
    qSkad.placeholder = q === 'inne' ? t(s + 'inneSkad') : t(s + 'skad');
    qDokad.placeholder = q === 'inne' ? t(s + 'inneDokad') : t(s + 'dokad');
    if (q === 'lotnisko') qDokad.setAttribute('list', 'lotniskaLista');
    else if (q === 'trasa') qDokad.setAttribute('list', 'trasyLista');
    else qDokad.removeAttribute('list');
  }
  if (waski.addEventListener) waski.addEventListener('change', qPlaceholder);
  $$('input[name="qtyp"]').forEach(function (r) { r.addEventListener('change', qPlaceholder); });

  // pole "kiedy": puste = jak najszybciej (napis zamiast pustego dd.mm.rrrr)
  var qKiedyPole = qKiedy.closest('.q-kiedy');
  function kiedyStan() { qKiedyPole.classList.toggle('pusty', !qKiedy.value && document.activeElement !== qKiedy); }
  ['input', 'change', 'focus', 'blur'].forEach(function (ev) { qKiedy.addEventListener(ev, kiedyStan); });

  var qBlad = document.createElement('p');
  qBlad.className = 'q-blad'; qBlad.hidden = true; qBlad.setAttribute('role', 'alert');
  szybki.querySelector('.q-pola').appendChild(qBlad);
  szybki.addEventListener('input', function (e) {
    var p = e.target.closest('.pole'); if (p && e.target.value.trim()) p.classList.remove('blad');
  });

  function kiedyHero() {
    if (!qKiedy.value) return t('v.teraz');
    var a = qKiedy.value.split('T');
    return dataPL(a[0]) + (a[1] ? ', ' + t('v.godz') + ' ' + a[1].slice(0, 5) : '');
  }
  szybki.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = $('input[name="qtyp"]:checked').value;
    var s = qSkad.value.trim(), d = qDokad.value.trim(), tel = qTel.value.trim();
    var zle = [], nazwy = [];
    $$('.pole', szybki).forEach(function (p) { p.classList.remove('blad'); });
    if (!s) { zle.push(qSkad); nazwy.push(t('miss.skad')); }
    if (!telOk(tel)) { zle.push(qTel); nazwy.push(t('miss.tel')); }
    if (zle.length) {
      zle.forEach(function (i) { i.closest('.pole').classList.add('blad'); });
      qBlad.textContent = t('err.start') + ' ' + nazwy.join(', ') + '.';
      qBlad.hidden = false;
      zle[0].focus();
      return;
    }
    qBlad.hidden = true;
    var pary = function () {
      return [[t('k.usluga'), t('typ.' + q)], [q === 'inne' ? t('k.adres') : t('k.skad'), s], [t('k.dokad'), d], [t('k.kiedy'), kiedyHero()], [t('k.tel'), tel]];
    };
    wyslij({ zrodlo: 'szybki', typ: q, skad: s, dokad: d, kiedy: qKiedy.value || 'teraz', telefon: tel }, {
      form: szybki, btn: szybki.querySelector('.q-btn'),
      ok: function (o) {
        szybki.classList.add('wyslane');
        pokazOk({ el: qOk, spam: false, demo: o.demo, pary: pary, nowe: function () {
          szybki.classList.remove('wyslane'); qOk.hidden = true;
          qSkad.value = ''; qDokad.value = ''; qKiedy.value = ''; kiedyStan();
          qSkad.focus();
        } });
        qOk.focus({ preventScroll: true });
      },
      blad: function (m) {
        qBlad.innerHTML = esc(m) + ' <a href="' + esc(waHref(tresc(pary()))) + '" target="_blank" rel="noopener">WhatsApp</a> · <a href="' + esc(smsHref(tresc(pary()))) + '">SMS</a>';
        qBlad.hidden = false;
      }
    });
  });

  /* ---------- przyciski lotnisk i uslug ---------- */
  $$('[data-lotnisko]').forEach(function (b) {
    b.addEventListener('click', function () {
      ustawRadio('typ', 'lotnisko'); pola.lotnisko.value = b.dataset.lotnisko;
      doFormularza(wart('kier') === 'z' ? pola.dokad : pola.skad);
    });
  });
  $$('[data-usluga]').forEach(function (b) {
    b.addEventListener('click', function () {
      ustawRadio('typ', 'inne'); pola.usluga.value = b.dataset.usluga;
      doFormularza(pola.skad);
    });
  });
  $$('[data-trasa]').forEach(function (b) {
    b.addEventListener('click', function () {
      ustawRadio('typ', 'trasa'); pola.dokad.value = b.dataset.trasa;
      doFormularza(pola.skad);
    });
  });
  $$('[data-typ]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      ustawRadio('typ', b.dataset.typ);
      doFormularza(pola.skad);
    });
  });
  $$('a.top-cta').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); doFormularza(null); }); });

  /* ---------- start: jezyk z adresu (?lang=) albo zapamietany ---------- */
  var start = 'pl';
  try { var zp = localStorage.getItem('taxi24-lang'); if (zp) start = zp; } catch (e) {}
  try { var ql = new URLSearchParams(location.search).get('lang'); if (ql) start = ql === 'ua' ? 'uk' : ql; } catch (e) {}
  ustawJezyk(start, false);
  widok(); qPlaceholder();
})();
