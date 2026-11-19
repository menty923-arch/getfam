/* GETFAM – skrypty strony. Działa lokalnie, bez zależności i bez wysyłania danych. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Gwiazdka w hero: kliknięcie odpala falę cząstek, pierścień i obrót gwiazdki. Przy ograniczonym ruchu tylko krótki rozbłysk. */
  (function () {
    var btn = $('#spark'), fx = $('#spark-fx');
    if (!btn || !fx || !btn.animate) return;
    var LIME = '#c8f31d', CREAM = '#fff3d6';
    function rnd(a, b) { return a + Math.random() * (b - a); }
    btn.addEventListener('click', function () {
      var star = $('.spark__star', btn);
      var h = fx.getBoundingClientRect(), b = btn.getBoundingClientRect();
      var ox = b.left - h.left + b.width / 2, oy = b.top - h.top + b.height / 2;
      if (reduceMotion) {
        star.animate([{ filter: 'brightness(2)' }, { filter: 'none' }], { duration: 400 });
        return;
      }
      btn.classList.remove('is-intro');
      star.animate([
        { transform: 'rotate(0) scale(1)' },
        { transform: 'rotate(360deg) scale(2)', offset: 0.35 },
        { transform: 'rotate(720deg) scale(1)' }
      ], { duration: 950, easing: 'cubic-bezier(.2,.8,.2,1)' });
      // pierścień
      var ring = document.createElement('i');
      ring.style.cssText = 'left:' + ox + 'px;top:' + oy + 'px;width:40px;height:40px;margin:-20px 0 0 -20px;border:3px solid ' + LIME + ';border-radius:50%';
      fx.appendChild(ring);
      ring.animate([{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(' + (Math.max(h.width, 900) / 40) + ')', opacity: 0 }], { duration: 1000, easing: 'cubic-bezier(.1,.7,.2,1)' }).onfinish = function () { ring.remove(); };
      // cząstki lecą we wszystkie strony, głównie w lewo, w stronę hasła
      var n = h.width < 740 ? 26 : 56;
      for (var k = 0; k < n; k++) {
        var p = document.createElement('i');
        var streak = Math.random() < 0.4;
        var size = rnd(4, 11);
        var ang = rnd(0, Math.PI * 2);
        if (Math.random() < 0.55) ang = Math.PI + rnd(-1.1, 1.1);
        var dist = rnd(180, Math.max(500, h.width * 0.85));
        var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist * 0.7;
        var color = Math.random() < 0.72 ? LIME : CREAM;
        p.style.cssText = 'left:' + ox + 'px;top:' + oy + 'px;width:' + (streak ? size * 3.5 : size) + 'px;height:' + size * (streak ? 0.55 : 1) + 'px;margin:-' + size / 2 + 'px 0 0 -' + size / 2 + 'px;background:' + color + ';box-shadow:0 0 10px ' + color + ';border-radius:' + (streak ? '4px' : '50%');
        fx.appendChild(p);
        var rot = streak ? ' rotate(' + ang + 'rad)' : '';
        var spin = rnd(-200, 200);
        p.animate([
          { transform: 'translate(0,0)' + rot + ' scale(1)', opacity: 1 },
          { transform: 'translate(' + dx * 0.7 + 'px,' + dy * 0.7 + 'px)' + rot + ' scale(1)', opacity: 1, offset: 0.6 },
          { transform: 'translate(' + dx + 'px,' + (dy + rnd(20, 90)) + 'px)' + rot + ' scale(.2)', opacity: 0 }
        ], { duration: rnd(650, 1300), delay: rnd(0, 120), easing: 'cubic-bezier(.1,.8,.25,1)', fill: 'backwards' }).onfinish = (function (el) { return function () { el.remove(); }; })(p);
      }
    });
  })();

  function scrollToEl(el) {
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- Menu ---------- */
  var toggle = $('.nav-toggle');
  var nav = $('#menu');
  if (toggle && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setMenu(false);
    });
  }

  /* ---------- Cząsteczki: pauza, gdy pierwszy ekran jest poza widokiem ---------- */
  var dust = $('#dust');
  var heroEl = $('.hero');
  if (dust && heroEl) {
    // Generator pyłu: pozycje wokół źródła światła (prawy górny róg kadru), gęściej i jaśniej blisko lampy.
    var seeded = function (a) {
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };
    var narrow = window.matchMedia('(max-width: 739px)');
    var shaft = $('#shaft');
    var buildDust = function () {
      if (!shaft) return;
      $$('i', shaft).forEach(function (n) { shaft.removeChild(n); });
      var rnd = seeded(11);
      var between = function (a, b) { return a + (b - a) * rnd(); };
      var sharp = narrow.matches ? 3 : 6;
      var frag = document.createDocumentFragment();
      var make = function (cls, x, y, s, o, dur, dx, dy, del) {
        var el = document.createElement('i');
        if (cls) el.className = cls;
        el.style.setProperty('--x', x.toFixed(1) + '%');
        el.style.setProperty('--y', y.toFixed(1) + '%');
        el.style.setProperty('--s', s.toFixed(1) + 'px');
        el.style.setProperty('--o', o.toFixed(2));
        el.style.setProperty('--dur', dur.toFixed(1) + 's');
        el.style.setProperty('--dx', dx.toFixed(0) + 'px');
        el.style.setProperty('--dy', dy.toFixed(0) + 'px');
        el.style.setProperty('--del', del.toFixed(1) + 's');
        frag.appendChild(el);
      };
      // Ostre pyłki w głębi pasa światła: powoli unoszą się wzdłuż pasa (w osi pasa "w górę").
      // Ujemne opóźnienie sprawia, że część z nich jest widoczna od pierwszej klatki.
      for (var i = 0; i < sharp; i++) {
        var dur = between(14, 22);
        var x = between(8, 92), y = between(8, 90);
        var near = (x / 100) * (1 - y / 100);              // jaśniej bliżej górnego prawego rogu, gdzie jest okno
        make('', x, y, between(1.6, 2.8), 0.45 + 0.5 * near, dur,
             -between(4, 14), -between(18, 36), -rnd() * dur);
      }
      // Jedna miękka, rozmyta drobina "bliżej obiektywu": co kilkanaście sekund przepływa przez strefę światła.
      make('soft', 88, between(35, 60), between(14, 18), 0.3, 16, -between(90, 130), -between(8, 20), -3);
      shaft.appendChild(frag);
    };
    buildDust();
    if (narrow.addEventListener) narrow.addEventListener('change', buildDust);

    // Animacja stoi, gdy pierwszy ekran jest poza widokiem.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        dust.classList.toggle('is-paused', !entries[entries.length - 1].isIntersecting);
      }, { threshold: 0 }).observe(heroEl);
    }
  }

  /* ---------- Przykład: komentarz, a chwilę później rekomendacja (raz, przy wejściu sekcji) ---------- */
  var caseEl = $('#case-audience');
  var profileSec = $('#rolka');
  if (caseEl && profileSec) {
    var reveal = function () { caseEl.classList.add('is-in'); };
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveal();
    } else {
      var revealObs = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { reveal(); revealObs.disconnect(); }
      }, { threshold: 0.35 });
      revealObs.observe(caseEl);
    }
  }

  /* ---------- Motyw jasny / ciemny ---------- */
  var themeBtn = $('#theme-toggle');
  if (themeBtn) {
    var applyTheme = function (t, save) {
      document.documentElement.setAttribute('data-theme', t);
      themeBtn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      if (save) { try { localStorage.setItem('getfam-theme', t); } catch (e) {} }
    };
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
    themeBtn.addEventListener('click', function () {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* ---------- Twój profil pod lupą: zakładki ---------- */
  var profileTabs = $$('.profile .tab');
  if (profileTabs.length) {
    var setTab = function (idx, focus) {
      profileTabs.forEach(function (t, i) {
        var on = i === idx;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        if (on && focus) t.focus();
      });
    };
    profileTabs.forEach(function (t, i) {
      t.addEventListener('click', function () { setTab(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % profileTabs.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + profileTabs.length) % profileTabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = profileTabs.length - 1;
        if (n !== null) { e.preventDefault(); setTab(n, true); }
      });
    });
  }

  /* ---------- Treści: przesunięcie ujęcia z 0:08 na 0:00 ---------- */
  var clip = $('#clip');
  if (clip) {
    var CLIP = {
      before: { caption: 'Gotowe danie pojawia się dopiero w 8. sekundzie.', label: 'Kadr otwierający: składniki rozłożone na blacie' },
      after: { caption: 'Rolka zaczyna się od przekrojonego dania, a składniki wracają zaraz potem.', label: 'Nowy kadr otwierający: przekrojone danie' }
    };
    var MOVE_MS = 620; // zgodnie z czasem przesuwania segmentów osi w CSS (.6 s)
    var moveTimer = null;
    var swBtns = $$('.switch button', clip.parentNode);
    var finishAfter = function () {
      moveTimer = null;
      clip.setAttribute('data-shot', 'b');
      clip.setAttribute('data-result', 'on');
      $('#clip-time').textContent = '0:00';
      $('#clip-frame').setAttribute('aria-label', CLIP.after.label);
    };
    var setClip = function (view) {
      // Ostatnie kliknięcie wygrywa: unieważniamy opóźnioną zmianę podglądu.
      clearTimeout(moveTimer);
      moveTimer = null;
      clip.setAttribute('data-view', view);
      swBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-view') === view ? 'true' : 'false'); });
      $('#clip-caption').textContent = CLIP[view].caption;
      if (view === 'before') {
        clip.setAttribute('data-shot', 'a');
        clip.setAttribute('data-result', 'off');
        $('#clip-time').textContent = '0:00';
        $('#clip-frame').setAttribute('aria-label', CLIP.before.label);
      } else if (reduceMotion) {
        finishAfter();
      } else {
        clip.setAttribute('data-result', 'off');
        moveTimer = setTimeout(finishAfter, MOVE_MS);
      }
    };
    swBtns.forEach(function (b) {
      b.addEventListener('click', function () { setClip(b.getAttribute('data-view')); });
    });
  }

  /* ---------- Audyt profilu ---------- */
  var PLATFORMS = {
    tiktok:    { name: 'TikTok',    two: 'dwa filmy',  three: 'trzy filmy', metric: 'średni czas oglądania' },
    instagram: { name: 'Instagram', two: 'dwie rolki', three: 'trzy rolki', metric: 'zapisy i udostępnienia' },
    youtube:   { name: 'YouTube',   two: 'dwa filmy',  three: 'trzy filmy', metric: 'średni procent obejrzenia' }
  };
  var STAGES = {
    start: 'dopiero zaczynam',
    irregular: 'publikuję nieregularnie',
    regular: 'publikuję regularnie'
  };
  var GOALS = {
    reach: 'większy zasięg',
    community: 'aktywniejsza społeczność',
    brand: 'pierwsza współpraca z marką'
  };
  var GOAL_METRIC = {
    reach: 'wyświetlenia od osób, które Cię jeszcze nie obserwują',
    community: 'liczbę komentarzy i to, ile z nich ma odpowiedź',
    brand: 'dane o odbiorcach (wiek, lokalizację i źródła ruchu)'
  };

  // Działanie główne zależy od celu i platformy (oraz etapu przy współpracy z markami).
  var MAIN = {
    reach: {
      tiktok: ['Test otwarcia filmu', 'Nagraj dwie wersje otwarcia tego samego filmu (pierwsze 3 sekundy) i opublikuj obie. Po 48 godzinach porównaj średni czas oglądania i zachowaj lepszą wersję jako wzór.'],
      instagram: ['Test dwóch otwarć rolki', 'Opublikuj dwie rolki na ten sam temat z różnym otwarciem. Porównaj zasięg oraz liczbę udostępnień i zapisz, która wersja wypadła lepiej.'],
      youtube: ['Tytuł, który obiecuje korzyść', 'Napisz trzy wersje tytułu do jednego filmu i wybierz tę, która mówi widzowi, co zyska. Po tygodniu sprawdź współczynnik klikalności.']
    },
    community: {
      tiktok: ['Pytanie na koniec filmu', 'Zakończ każdy film jednym pytaniem do widzów. Na pierwsze 10 komentarzy odpowiedz w ciągu doby, tekstem albo krótkim filmem.'],
      instagram: ['Pytanie w opisie i ankieta', 'Dodaj do opisu rolki pytanie, a w relacjach ankietę o temat kolejnej rolki. Odpowiadaj na komentarze w ciągu doby.'],
      youtube: ['Przypięty komentarz z pytaniem', 'Przypnij pod filmem komentarz z pytaniem i odpowiedz na pierwsze 10 komentarzy. Powtarzające się pytania zapisz jako tematy kolejnych filmów.']
    },
    brand: {
      tiktok: ['Zalążek media kitu', 'Wybierz z ostatnich filmów trzy najlepsze i dopisz do każdego temat, długość oraz wiek odbiorców. To baza krótkiego media kitu dla marek.'],
      instagram: ['Krótki media kit z ostatnich rolek', 'Przygotuj jednostronicowy media kit na podstawie ostatnich rolek: trzy najlepsze, wiek i lokalizacja odbiorców oraz tematy, które chcesz poruszać.'],
      youtube: ['Krótki media kit z ostatnich filmów', 'Przygotuj jednostronicowy media kit: trzy najlepsze filmy, średni procent obejrzenia, wiek i lokalizacja odbiorców oraz tematy kanału.']
    }
  };
  var BRAND_START = ['Materiał do pierwszego media kitu', 'Zanim napiszesz do marki, zbuduj materiał, który pokaże Twój styl: wybierz trzy tematy swojego profilu i opublikuj po jednym materiale na każdy. Z nich powstanie pierwszy media kit.'];

  function buildPlan(p, s, g) {
    var pl = PLATFORMS[p];
    var rhythm;
    if (s === 'start') {
      rhythm = ['Prosty rytm na start', 'Zaplanuj w kalendarzu ' + pl.three + ' na ten tydzień. Niech każdy dotyczy jednego, konkretnego problemu Twojego widza. Łatwiej wtedy planować i oceniać.'];
    } else if (s === 'irregular') {
      rhythm = ['Stałe dni publikacji', 'Wyznacz dwa stałe dni publikacji (np. wtorek i sobota) i przygotuj z wyprzedzeniem ' + pl.two + ', żeby przerwy nie wynikały z braku pomysłu.'];
    } else {
      rhythm = ['Co już u Ciebie działa', 'Zestaw ostatnie pięć publikacji według wskaźnika „' + pl.metric + '”. Zapisz, co łączy te z najlepszym wynikiem: temat, długość czy otwarcie.'];
    }

    var main = (g === 'brand' && s === 'start') ? BRAND_START : MAIN[g][p];

    var review;
    var m = GOAL_METRIC[g];
    if (s === 'start') {
      review = 'Zapisz w notatce: łączne wyświetlenia, ' + m + ' oraz najlepszy materiał tygodnia. Przy tak małej próbie nie szukaj jeszcze wniosków, sprawdź tylko, czy dane się zbierają.';
    } else if (s === 'irregular') {
      review = 'Sprawdź, czy udało się dotrzymać wyznaczonych dni, i porównaj ' + m + ' z poprzednim tygodniem. Jeśli rytm był za ciasny, zmniejsz liczbę publikacji zamiast rezygnować.';
    } else {
      review = 'Porównaj ' + m + ' ze średnią z ostatnich czterech tygodni i wybierz jedną zmianę, którą zachowasz w następnym tygodniu.';
    }

    return [
      { when: 'Dni 1–2', title: rhythm[0], text: rhythm[1] },
      { when: 'Dni 3–5', title: main[0], text: main[1] },
      { when: 'Dzień 7', title: 'Podsumowanie tygodnia', text: review }
    ];
  }

  var audit = $('#audit');
  var auditState = { step: 0, platform: '', stage: '', goal: '' };

  if (audit) {
    var form = $('#audit-form');
    var steps = $$('.audit__step', audit);
    var keys = ['platform', 'stage', 'goal'];
    var progress = $$('.audit__progress li', audit);
    var count = $('#audit-count');
    var errorEl = $('#audit-error');
    var btnBack = $('#audit-back');
    var btnNext = $('#audit-next');
    var result = $('#audit-result');

    // Nowa treść wsuwa się z prawej (dalej) albo z lewej (wstecz), ok. 200 ms.
    var slide = function (el, dir) {
      if (!dir || reduceMotion) return;
      el.classList.remove('slide-fwd', 'slide-back');
      void el.offsetWidth;
      el.classList.add(dir === 'back' ? 'slide-back' : 'slide-fwd');
    };

    var renderStep = function (focus, dir) {
      steps.forEach(function (st, i) { st.hidden = i !== auditState.step; });
      slide(steps[auditState.step], dir);
      progress.forEach(function (li, i) { li.classList.toggle('is-done', i <= auditState.step); });
      count.textContent = 'Krok ' + (auditState.step + 1) + ' z 3';
      btnBack.hidden = auditState.step === 0;
      btnNext.textContent = auditState.step === 2 ? 'Pokaż mój plan' : 'Dalej';
      errorEl.hidden = true;
      if (focus) $('legend', steps[auditState.step]).focus();
    };

    var showForm = function () {
      result.hidden = true;
      form.hidden = false;
    };

    var showResult = function () {
      var plan = buildPlan(auditState.platform, auditState.stage, auditState.goal);
      $('#audit-summary').textContent = PLATFORMS[auditState.platform].name + ' · ' + STAGES[auditState.stage] + ' · ' + GOALS[auditState.goal];
      var list = $('#audit-plan');
      list.textContent = '';
      plan.forEach(function (item, i) {
        var li = document.createElement('li');
        var when = document.createElement('span');
        when.className = 'plan__when';
        when.textContent = item.when;
        var n = document.createElement('span');
        n.className = 'plan__n';
        n.setAttribute('aria-hidden', 'true');
        n.textContent = String(i + 1);
        var body = document.createElement('div');
        var h = document.createElement('h4');
        h.textContent = item.title;
        var p = document.createElement('p');
        p.textContent = item.text;
        body.appendChild(h);
        body.appendChild(p);
        li.appendChild(when);
        li.appendChild(n);
        li.appendChild(body);
        list.appendChild(li);
      });
      form.hidden = true;
      result.hidden = false;
      slide(result, 'fwd');
      var burst = $('#audit-burst');
      if (burst && !reduceMotion) {
        burst.classList.remove('go');
        void burst.offsetWidth;
        burst.classList.add('go');
      }
      $('#audit-result-title').focus();
    };

    $$('input[type="radio"]', audit).forEach(function (r) {
      r.addEventListener('change', function () { errorEl.hidden = true; });
    });

    btnNext.addEventListener('click', function () {
      var key = keys[auditState.step];
      var checked = $('input[name="' + key + '"]:checked', audit);
      if (!checked) {
        errorEl.hidden = false;
        return;
      }
      auditState[key] = checked.value;
      if (auditState.step < 2) {
        auditState.step++;
        renderStep(true, 'fwd');
      } else {
        showResult();
      }
    });

    btnBack.addEventListener('click', function () {
      if (auditState.step > 0) {
        auditState.step--;
        renderStep(true, 'back');
      }
    });

    $('#audit-edit').addEventListener('click', function () {
      auditState.step = 2;
      showForm();
      renderStep(true, 'back');
    });

    $('#audit-restart').addEventListener('click', function () {
      $$('input[type="radio"]', audit).forEach(function (r) { r.checked = false; });
      auditState = { step: 0, platform: '', stage: '', goal: '' };
      showForm();
      renderStep(true, 'back');
    });

    // Przycisk z pierwszego ekranu: przechodzi do audytu i ustawia fokus na bieżącym kroku.
    var heroCta = $('#hero-cta');
    if (heroCta) {
      heroCta.addEventListener('click', function (e) {
        e.preventDefault();
        scrollToEl($('#audyt'));
        var target = result.hidden ? $('legend', steps[auditState.step]) : $('#audit-result-title');
        target.focus({ preventScroll: true });
      });
    }

    renderStep(false);
  }

  /* ---------- Formularz kontaktowy ---------- */
  var contact = $('#contact-form');
  if (contact) {
    var statusEl = $('#form-status');
    var summary = $('#summary');
    var roleRadios = $$('input[name="role"]', contact);
    var consent = $('#consent');

    var FIELDS = {
      creator: [
        { id: 'c_name', label: 'Nazwa profilu', check: function (v) {
            if (!v) return 'Podaj nazwę profilu.';
            if (v.length < 2) return 'Nazwa profilu powinna mieć co najmniej 2 znaki.';
            return '';
          } },
        { id: 'c_platform', label: 'Platforma', select: true, check: function (v) { return v ? '' : 'Wybierz platformę.'; } },
        { id: 'c_email', label: 'E-mail', check: emailCheck },
        { id: 'c_goal', label: 'Główny cel', select: true, check: function (v) { return v ? '' : 'Wybierz cel.'; } }
      ],
      brand: [
        { id: 'b_name', label: 'Nazwa firmy', check: function (v) {
            if (!v) return 'Podaj nazwę firmy.';
            if (v.length < 2) return 'Nazwa firmy powinna mieć co najmniej 2 znaki.';
            return '';
          } },
        { id: 'b_email', label: 'E-mail służbowy', check: emailCheck },
        { id: 'b_brief', label: 'Opis kampanii', check: function (v) {
            if (!v) return 'Opisz krótko kampanię.';
            if (v.length < 20) return 'Opis jest za krótki. Napisz co najmniej 20 znaków (teraz: ' + v.length + ').';
            return '';
          } }
      ]
    };

    function emailCheck(v) {
      if (!v) return 'Podaj adres e-mail.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Wpisz poprawny adres e-mail, np. imie@domena.pl.';
      return '';
    }

    var currentRole = function () { return $('input[name="role"]:checked', contact).value; };

    var setRole = function (role) {
      roleRadios.forEach(function (r) { r.checked = r.value === role; });
      $$('[data-role]', contact).forEach(function (el) { el.hidden = el.getAttribute('data-role') !== role; });
      statusEl.hidden = true;
    };

    var showError = function (id, msg) {
      var el = document.getElementById(id);
      var err = document.getElementById(id + '-error');
      if (msg) {
        err.textContent = msg;
        err.hidden = false;
        el.setAttribute('aria-invalid', 'true');
      } else {
        err.textContent = '';
        err.hidden = true;
        el.removeAttribute('aria-invalid');
      }
    };

    var validateField = function (f) {
      var el = document.getElementById(f.id);
      var msg = f.check(el.value.trim());
      showError(f.id, msg);
      return msg;
    };

    // Walidacja przy opuszczeniu pola i poprawianie błędu na bieżąco.
    Object.keys(FIELDS).forEach(function (role) {
      FIELDS[role].forEach(function (f) {
        var el = document.getElementById(f.id);
        el.addEventListener('blur', function () {
          if (el.value.trim() !== '' || el.hasAttribute('aria-invalid')) validateField(f);
        });
        el.addEventListener(f.select ? 'change' : 'input', function () {
          if (el.hasAttribute('aria-invalid')) validateField(f);
        });
      });
    });
    consent.addEventListener('change', function () {
      if (consent.checked) showError('consent', '');
    });

    roleRadios.forEach(function (r) {
      r.addEventListener('change', function () { setRole(currentRole()); });
    });

    var textOf = function (id) {
      var el = document.getElementById(id);
      return el.tagName === 'SELECT' ? el.options[el.selectedIndex].text : el.value.trim();
    };

    var showSummary = function (role) {
      var dl = $('#summary-list');
      dl.textContent = '';
      var rows = [['Typ zgłoszenia', role === 'creator' ? 'Twórca' : 'Marka']];
      FIELDS[role].forEach(function (f) { rows.push([f.label, textOf(f.id)]); });
      rows.forEach(function (r) {
        var dt = document.createElement('dt');
        dt.textContent = r[0];
        var dd = document.createElement('dd');
        dd.textContent = r[1];
        dl.appendChild(dt);
        dl.appendChild(dd);
      });
      contact.hidden = true;
      summary.hidden = false;
      $('#summary-title').focus();
    };

    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      var role = currentRole();
      var firstBad = null;
      var bad = 0;
      FIELDS[role].forEach(function (f) {
        if (validateField(f)) {
          bad++;
          if (!firstBad) firstBad = document.getElementById(f.id);
        }
      });
      if (!consent.checked) {
        showError('consent', 'Zaznacz zgodę na kontakt, żeby wysłać zgłoszenie.');
        bad++;
        if (!firstBad) firstBad = consent;
      } else {
        showError('consent', '');
      }
      if (bad) {
        statusEl.textContent = bad === 1 ? 'Popraw jedno pole zaznaczone poniżej.' : 'Popraw ' + bad + (bad < 5 ? ' pola' : ' pól') + ' zaznaczone poniżej.';
        statusEl.hidden = false;
        firstBad.focus();
        return;
      }
      statusEl.hidden = true;
      showSummary(role);
    });

    $('#summary-edit').addEventListener('click', function () {
      summary.hidden = true;
      contact.hidden = false;
      var first = document.getElementById(FIELDS[currentRole()][0].id);
      first.focus();
    });

    $('#summary-new').addEventListener('click', function () {
      contact.reset();
      Object.keys(FIELDS).forEach(function (role) { FIELDS[role].forEach(function (f) { showError(f.id, ''); }); });
      showError('consent', '');
      setRole('creator');
      summary.hidden = true;
      contact.hidden = false;
      $('#c_name').focus();
    });

    var goToContact = function (focusId) {
      summary.hidden = true;
      contact.hidden = false;
      scrollToEl($('#kontakt'));
      var el = document.getElementById(focusId);
      if (el) el.focus({ preventScroll: true });
    };

    // Z audytu: przenosi platformę i cel do formularza twórcy.
    var toForm = $('#audit-to-form');
    if (toForm) {
      toForm.addEventListener('click', function () {
        setRole('creator');
        $('#c_platform').value = auditState.platform;
        $('#c_goal').value = auditState.goal;
        showError('c_platform', '');
        showError('c_goal', '');
        goToContact($('#c_name').value.trim() ? 'c_email' : 'c_name');
      });
    }

    // Z przykładowego briefu: wybiera „Reprezentuję markę” i podpowiada opis kampanii.
    var BRIEF_TEXT = 'Premiera gry (przykładowy brief): twórca gamingowy, odbiorcy 16–24 lat z Polski, platformy YouTube i TikTok, film z pierwszymi wrażeniami i dwa krótkie klipy, start 4 tygodnie przed premierą.';
    var briefCta = $('#brief-cta');
    if (briefCta) {
      briefCta.addEventListener('click', function () {
        setRole('brand');
        var b = $('#b_brief');
        if (!b.value.trim()) {
          b.value = BRIEF_TEXT;
          showError('b_brief', '');
        }
        goToContact($('#b_name').value.trim() ? 'b_email' : 'b_name');
      });
    }

    setRole('creator');
  }
})();
