(function () {
  'use strict';
  var TEL = '48536805851';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- menu ---------- */
  var burger = $('#burger'), menu = $('#menu');
  function zamknijMenu() { menu.classList.remove('otwarte'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var o = menu.classList.toggle('otwarte');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', zamknijMenu); });

  /* ---------- plywajace przyciski: dopiero po przewinieciu za hero ---------- */
  var plyw = $('#plyw'), cel = $('.q-btn');
  // ukryte tez przy formularzu zamowienia (ma wlasne przyciski WhatsApp/SMS/telefon i nie zaslaniamy pol)
  var zaHero = false, wForm = false;
  function plywStan() { plyw.classList.toggle('widac', zaHero && !wForm); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      zaHero = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; plywStan();
    }).observe(cel);
    new IntersectionObserver(function (e) {
      wForm = e[0].isIntersecting; plywStan();
    }, { rootMargin: '-20% 0px -20% 0px' }).observe(document.getElementById('zamow'));
  } else { plyw.classList.add('widac'); }

  /* ---------- formularz ---------- */
  var zam = $('#zam');
  var NAZWY = { lotnisko: 'Transfer lotniskowy', miasto: 'Taxi w Rzeszowie', trasa: 'Dłuższa trasa', inne: 'Inna usługa' };
  var osoby = 1;
  var pola = { skad: $('#skad'), dokad: $('#dokad'), data: $('#data'), godz: $('#godz'), lot: $('#lot'), imie: $('#imie'), uwagi: $('#uwagi'), lotnisko: $('#lotSel'), usluga: $('#usluga'), bagaz: $('#bagaz') };

  function wart(n) { var el = zam.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; }
  function ustawRadio(n, v) { var el = zam.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (el) el.checked = true; }

  // domyslny termin: dzis + 2 h, zaokraglone do 5 min
  (function () {
    var d = new Date(Date.now() + 2 * 3600e3);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
    var p = function (x) { return String(x).padStart(2, '0'); };
    var dzis = new Date();
    pola.data.min = dzis.getFullYear() + '-' + p(dzis.getMonth() + 1) + '-' + p(dzis.getDate());
    pola.data.value = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    pola.godz.value = p(d.getHours()) + ':' + p(d.getMinutes());
  })();

  function widok() {
    var typ = wart('typ'), kier = wart('kier'), kiedy = wart('kiedy');
    $$('.tylko-lot', zam).forEach(function (el) { el.classList.toggle('ukryte', typ !== 'lotnisko'); });
    $$('.tylko-inne', zam).forEach(function (el) { el.classList.toggle('ukryte', typ !== 'inne'); });
    $$('.tylko-termin', zam).forEach(function (el) { el.classList.toggle('ukryte', kiedy !== 'termin'); });
    var labS = $('#labSkad'), labD = $('#labDokad');
    var pS = $('#poleSkad'), pD = $('#poleDokad');
    pS.classList.remove('ukryte'); pD.classList.remove('ukryte');
    if (typ === 'lotnisko') {
      if (kier === 'na') { labS.textContent = 'Adres odbioru'; pD.classList.add('ukryte'); pola.skad.placeholder = 'np. ul. Iwonicka 10, Rzeszów'; }
      else { labD.textContent = 'Adres docelowy'; pS.classList.add('ukryte'); pola.dokad.placeholder = 'np. ul. Iwonicka 10, Rzeszów'; }
      $('#lotOpc').textContent = kier === 'z' ? '(pomoże śledzić przylot)' : '(opcjonalnie)';
    } else if (typ === 'inne') {
      labS.textContent = 'Adres (gdzie przyjechać)'; labD.textContent = 'Dokąd (jeśli dotyczy)';
      pola.skad.placeholder = 'np. ul. Iwonicka 10, Rzeszów'; pola.dokad.placeholder = 'np. adres dostawy';
      var u = pola.usluga.value;
      if (u === 'Zakupy na zlecenie') pola.uwagi.placeholder = 'np. lista zakupów, sklep';
      else if (u === 'Drobna pomoc drogowa') pola.uwagi.placeholder = 'np. akumulator, brak paliwa';
      else pola.uwagi.placeholder = 'Opisz krótko, czego potrzebujesz';
    } else {
      labS.textContent = 'Skąd (adres odbioru)'; labD.textContent = 'Dokąd';
      pola.skad.placeholder = 'np. ul. Iwonicka 10, Rzeszów';
      pola.dokad.placeholder = typ === 'trasa' ? 'np. Kraków, Warszawa' : 'np. Dworzec PKP Rzeszów';
      pola.uwagi.placeholder = 'np. fotelik dla dziecka, faktura';
    }
    if (typ !== 'inne' && typ !== 'lotnisko') pola.uwagi.placeholder = 'np. fotelik dla dziecka, faktura';
    if (typ === 'lotnisko') pola.uwagi.placeholder = 'np. fotelik dla dziecka, faktura';
    podsumuj();
  }

  function dataPL(v) { if (!v) return ''; var a = v.split('-'); return a[2] + '.' + a[1] + '.' + a[0]; }

  function dane() {
    var typ = wart('typ'), kier = wart('kier'), kiedy = wart('kiedy');
    var skad = pola.skad.value.trim(), dokad = pola.dokad.value.trim(), lot = pola.lotnisko.value;
    var w = [];
    var usl = typ === 'lotnisko' ? (kier === 'na' ? 'Transfer na lotnisko' : 'Transfer z lotniska') : typ === 'inne' ? pola.usluga.value : NAZWY[typ];
    w.push(['Usługa', usl]);
    if (typ === 'lotnisko') {
      if (kier === 'na') { w.push(['Skąd', skad]); w.push(['Dokąd', lot]); }
      else { w.push(['Skąd', lot]); w.push(['Dokąd', dokad]); }
    } else if (typ === 'inne') {
      w.push(['Adres', skad]);
      if (dokad) w.push(['Dokąd', dokad]);
    } else { w.push(['Skąd', skad]); w.push(['Dokąd', dokad]); }
    w.push(['Kiedy', kiedy === 'teraz' ? 'jak najszybciej' : (dataPL(pola.data.value) + (pola.godz.value ? ', godz. ' + pola.godz.value : ''))]);
    if (typ !== 'inne' || pola.usluga.value === 'Transport dzieci lub seniorów' || pola.usluga.value === 'Obsługa imprezy lub wydarzenia' || pola.usluga.value === 'Transport dla firmy (faktura)') {
      w.push(['Osoby', String(osoby)]);
      w.push(['Bagaż', pola.bagaz.value]);
    }
    if (typ === 'lotnisko') w.push(['Nr lotu', pola.lot.value.trim().toUpperCase()]);
    w.push(['Imię', pola.imie.value.trim()]);
    if (pola.uwagi.value.trim()) w.push(['Uwagi', pola.uwagi.value.trim()]);
    return w;
  }

  function braki() {
    var typ = wart('typ'), kier = wart('kier'), kiedy = wart('kiedy'), b = [];
    var wym = [];
    if (typ === 'lotnisko') wym.push(kier === 'na' ? 'skad' : 'dokad');
    else if (typ === 'inne') wym.push('skad');
    else wym.push('skad', 'dokad');
    if (kiedy === 'termin') wym.push('data', 'godz');
    var nazwy = { skad: 'adres odbioru', dokad: typ === 'lotnisko' ? 'adres docelowy' : 'cel podróży', data: 'datę', godz: 'godzinę' };
    wym.forEach(function (k) { if (!pola[k].value.trim()) b.push(k); });
    return { pola: b, tekst: b.map(function (k) { return nazwy[k]; }) };
  }

  var lista = $('#psLista');
  function podsumuj() {
    $('#psTyp').textContent = NAZWY[wart('typ')];
    var html = '';
    dane().forEach(function (p) {
      var pusto = !p[1] || /^,? ?godz\. $/.test(p[1]);
      html += '<dt>' + p[0] + '</dt><dd' + (pusto ? ' class="brak"' : '') + '>' + (pusto ? 'uzupełnij' : esc(p[1])) + '</dd>';
    });
    lista.innerHTML = html;
    var t = encodeURIComponent(tresc());
    $('#wyslijWa').href = 'https://wa.me/' + TEL + '?text=' + t;
    $('#wyslijSms').href = 'sms:+' + TEL + '?&body=' + t;
  }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tresc() {
    var t = 'Dzień dobry, chcę zamówić kurs (Taxi Rzeszów 24H):\n';
    dane().forEach(function (p) { if (p[1]) t += p[0] + ': ' + p[1] + '\n'; });
    return t + 'Proszę o potwierdzenie i cenę.';
  }

  zam.addEventListener('input', podsumuj);
  zam.addEventListener('change', function (e) {
    if (e.target.name === 'typ' || e.target.name === 'kier' || e.target.name === 'kiedy' || e.target.id === 'usluga') widok(); else podsumuj();
    $$('.z-pole.blad', zam).forEach(function (p) { if (p.querySelector('input') && p.querySelector('input').value.trim()) p.classList.remove('blad'); });
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
      blad.textContent = 'Uzupełnij jeszcze: ' + b.tekst.join(', ') + '.';
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
    var t = tresc();
    var ok = function () { toast('Skopiowano treść zamówienia'); };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, function () { toast('Nie udało się skopiować'); });
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
  var qSkad = $('#qSkad'), qDokad = $('#qDokad');
  var LOT_RE = /lotnisk|jasionk|airport|\b(RZE|KRK|KTW|LUZ|WAW)\b/i;
  function qPlaceholder() {
    var t = document.querySelector('input[name="qtyp"]:checked').value;
    qSkad.placeholder = t === 'inne' ? 'Gdzie przyjechać?' : 'Skąd jedziemy?';
    qDokad.placeholder = t === 'lotnisko' ? 'Dokąd? np. Jasionka' : t === 'trasa' ? 'Dokąd? np. Kraków' : t === 'inne' ? 'Czego potrzebujesz?' : 'Dokąd?';
    if (t === 'lotnisko') qDokad.setAttribute('list', 'lotniskaLista'); else qDokad.removeAttribute('list');
  }
  $$('input[name="qtyp"]').forEach(function (r) { r.addEventListener('change', qPlaceholder); });
  qPlaceholder();

  $('#szybki').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = document.querySelector('input[name="qtyp"]:checked').value;
    var s = qSkad.value.trim(), d = qDokad.value.trim();
    ustawRadio('typ', t);
    if (t === 'lotnisko') {
      var opcje = $$('option', pola.lotnisko).map(function (o) { return o.value; });
      var zLot = LOT_RE.test(s) && !LOT_RE.test(d);
      ustawRadio('kier', zLot ? 'z' : 'na');
      var nazwaLot = zLot ? s : d;
      var dop = opcje.filter(function (o) { var k = o.match(/\((\w+)\)/); var miasto = o.replace('Lotnisko ', '').split(/[ -(]/)[0]; return nazwaLot && (nazwaLot.toLowerCase().indexOf(miasto.toLowerCase()) > -1 || (k && nazwaLot.toUpperCase().indexOf(k[1]) > -1)); })[0];
      if (/jasionk/i.test(nazwaLot)) dop = opcje[0];
      if (dop) pola.lotnisko.value = dop;
      if (zLot) { pola.dokad.value = d; } else { pola.skad.value = s; }
    } else if (t === 'inne') {
      pola.skad.value = s;
      if (d) pola.uwagi.value = d;
    } else { pola.skad.value = s; pola.dokad.value = d; }
    doFormularza(!s && !(t === 'lotnisko' && LOT_RE.test(s)) ? pola.skad : (t !== 'lotnisko' && t !== 'inne' && !d ? pola.dokad : null));
  });

  /* ---------- karty lotnisk i uslug ---------- */
  $$('[data-lotnisko]').forEach(function (b) {
    b.addEventListener('click', function () {
      ustawRadio('typ', 'lotnisko'); pola.lotnisko.value = b.dataset.lotnisko;
      doFormularza(pola.skad);
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

  widok();
})();
