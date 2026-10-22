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
    if (typeof widok === 'function' && zam) { widok(); qPlaceholder(); }
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

  /* ---------- formularz ---------- */
  var zam = $('#zam');
  var osoby = 1;
  var pola = { skad: $('#skad'), dokad: $('#dokad'), data: $('#data'), godz: $('#godz'), lot: $('#lot'), imie: $('#imie'), uwagi: $('#uwagi'), lotnisko: $('#lotSel'), usluga: $('#usluga'), bagaz: $('#bagaz') };

  function wart(n) { var el = zam.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; }
  function ustawRadio(n, v) { var el = zam.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (el) el.checked = true; }
  function tekstOpcji(sel) { var o = sel.options[sel.selectedIndex]; return o ? o.textContent : ''; }
  var p2 = function (x) { return String(x).padStart(2, '0'); };

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
    podsumuj();
  }

  function dataPL(v) { if (!v) return ''; var a = v.split('-'); return a[2] + '.' + a[1] + '.' + a[0]; }

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
    var u = pola.usluga.value;
    if (typ !== 'inne' || u === 'Transport dzieci lub seniorów' || u === 'Obsługa imprezy lub wydarzenia' || u === 'Transport dla firmy (faktura)') {
      w.push([t('k.osoby'), String(osoby)]);
      w.push([t('k.bagaz'), tekstOpcji(pola.bagaz)]);
    }
    if (typ === 'lotnisko') w.push([t('k.lot'), pola.lot.value.trim().toUpperCase()]);
    w.push([t('k.imie'), pola.imie.value.trim()]);
    if (pola.uwagi.value.trim()) w.push([t('k.uwagi'), pola.uwagi.value.trim()]);
    return w;
  }

  function braki() {
    var typ = wart('typ'), kier = wart('kier'), kiedy = wart('kiedy'), b = [], wym = [];
    if (typ === 'lotnisko') wym.push(kier === 'na' ? 'skad' : 'dokad');
    else if (typ === 'inne') wym.push('skad');
    else wym.push('skad', 'dokad');
    if (kiedy === 'termin') wym.push('data', 'godz');
    var nazwy = { skad: t('miss.skad'), dokad: typ === 'lotnisko' ? t('miss.docel') : t('miss.cel'), data: t('miss.data'), godz: t('miss.godz') };
    wym.forEach(function (k) { if (!pola[k].value.trim()) b.push(k); });
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
    var tx = encodeURIComponent(tresc());
    $('#wyslijWa').href = 'https://wa.me/' + TEL + '?text=' + tx;
    $('#wyslijSms').href = 'sms:+' + TEL + '?&body=' + tx;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tresc() {
    var s = t('msg.start') + '\n';
    dane().forEach(function (p) { if (p[1]) s += p[0] + ': ' + p[1] + '\n'; });
    s += t('msg.end');
    if (lang !== 'pl') s += '\n(Język klienta: ' + KOD[lang] + ')';
    return s;
  }

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
  function sprawdz(e) {
    var b = braki();
    $$('.z-pole', zam).forEach(function (p) { p.classList.remove('blad'); });
    if (b.pola.length) {
      e.preventDefault();
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
  $('#wyslijWa').addEventListener('click', sprawdz);
  $('#wyslijSms').addEventListener('click', sprawdz);
  $('#kopiuj').addEventListener('click', function () {
    var s = tresc();
    if (navigator.clipboard) navigator.clipboard.writeText(s).then(function () { toast(t('toast.ok')); }, function () { toast(t('toast.err')); });
    else toast(t('toast.err'));
  });

  var tt;
  function toast(m) { var el = $('#toast'); el.textContent = m; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove('on'); }, 2200); }

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

  /* ---------- szybki formularz w hero ---------- */
  var qSkad = $('#qSkad'), qDokad = $('#qDokad'), qKiedy = $('#qKiedy');
  var LOT_RE = /lotnisk|jasionk|airport|flughafen|аеропорт|ясьонк|\b(RZE|KRK|KTW|LUZ|WAW)\b/i;
  var ALIAS = { RZE: ['jasionk', 'rzesz', 'ясьонк', 'жешув'], KRK: ['krak', 'balice', 'краків', 'кракiв'], KTW: ['katow', 'kattow', 'pyrzow', 'катовіц'], LUZ: ['lublin', 'люблін'], WAW: ['warsz', 'warsaw', 'warschau', 'варшав'] };
  var waski = window.matchMedia('(max-width:900px)');
  function qPlaceholder() {
    var q = $('input[name="qtyp"]:checked').value, s = waski.matches ? 'qps.' : 'qp.';
    qSkad.placeholder = q === 'inne' ? t(s + 'inneSkad') : t(s + 'skad');
    qDokad.placeholder = q === 'inne' ? t(s + 'inneDokad') : t(s + 'dokad');
    if (q === 'lotnisko') qDokad.setAttribute('list', 'lotniskaLista'); else qDokad.removeAttribute('list');
  }
  if (waski.addEventListener) waski.addEventListener('change', qPlaceholder);
  $$('input[name="qtyp"]').forEach(function (r) { r.addEventListener('change', qPlaceholder); });

  function kodLotniska(txt) {
    var s = (txt || '').toLowerCase(), m = (txt || '').match(/\b(RZE|KRK|KTW|LUZ|WAW)\b/i);
    if (m) return m[1].toUpperCase();
    for (var k in ALIAS) { if (ALIAS[k].some(function (a) { return s.indexOf(a) > -1; })) return k; }
    return '';
  }

  $('#szybki').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = $('input[name="qtyp"]:checked').value;
    var s = qSkad.value.trim(), d = qDokad.value.trim();
    ustawRadio('typ', q);
    if (q === 'lotnisko') {
      var zLot = LOT_RE.test(s) && !LOT_RE.test(d);
      ustawRadio('kier', zLot ? 'z' : 'na');
      var kod = kodLotniska(zLot ? s : d);
      if (kod) $$('option', pola.lotnisko).forEach(function (o) { if (o.value.indexOf('(' + kod + ')') > -1) pola.lotnisko.value = o.value; });
      if (zLot) pola.dokad.value = d; else pola.skad.value = s;
    } else if (q === 'inne') {
      pola.skad.value = s;
      if (d) pola.uwagi.value = d;
    } else { pola.skad.value = s; pola.dokad.value = d; }
    if (qKiedy.value) {
      ustawRadio('kiedy', 'termin');
      var a = qKiedy.value.split('T'); pola.data.value = a[0]; if (a[1]) pola.godz.value = a[1].slice(0, 5);
    }
    var zLot2 = q === 'lotnisko' && LOT_RE.test(s) && !LOT_RE.test(d);
    var fokus = null;
    if (zLot2) { if (!d) fokus = pola.dokad; }
    else if (!s) fokus = pola.skad;
    else if (q !== 'lotnisko' && q !== 'inne' && !d) fokus = pola.dokad;
    doFormularza(fokus);
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
