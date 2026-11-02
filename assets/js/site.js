/* Sisteme Dauer — interacțiuni site de prezentare */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Antet care se micșorează la derulare
  var head = d.querySelector('.site-header');
  function onScroll() { if (head) head.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Meniu mobil
  var burger = d.querySelector('.burger'), mnav = d.querySelector('.mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = mnav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mnav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mnav.classList.remove('open'); }); });
  }

  // Apariții la derulare (verificare după poziție: sigur și la derulări rapide)
  var els = Array.prototype.slice.call(d.querySelectorAll('.reveal, .reveal-img'));
  function check() {
    var h = window.innerHeight || root.clientHeight;
    els = els.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < h * 0.94 && r.bottom > -h) { el.classList.add('is-in'); return false; }
      if (r.bottom <= -h) { el.classList.add('is-in'); return false; }
      return true;
    });
  }
  if (reduce) { els.forEach(function (el) { el.classList.add('is-in'); }); els = []; }
  else {
    var ticking = false;
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; check(); }); } }, { passive: true });
    window.addEventListener('resize', check);
    window.addEventListener('load', check);
    check();
  }

  // Film din prima pagină: se încarcă după pagină (până atunci rămâne poza de copertă)
  var vlazy = d.querySelector('.hero-media iframe[data-src]');
  var saveData = navigator.connection && navigator.connection.saveData;
  if (vlazy && !reduce && !saveData) {
    var loadVideo = function () { setTimeout(function () { vlazy.src = vlazy.getAttribute('data-src'); }, 600); };
    if (d.readyState === 'complete') loadVideo(); else window.addEventListener('load', loadVideo);
  }

  // Film din prima pagină: oprire / pornire
  var pause = d.querySelector('.hero-pause'), vframe = d.querySelector('.hero-media iframe');
  if (pause && vframe) {
    var playing = true;
    pause.addEventListener('click', function () {
      playing = !playing;
      try { vframe.contentWindow.postMessage(JSON.stringify({ method: playing ? 'play' : 'pause' }), '*'); } catch (e) {}
      pause.setAttribute('aria-label', playing ? 'Oprește filmul' : 'Pornește filmul');
      pause.innerHTML = playing
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
    });
    if (reduce) pause.click();
  }

  // Ghid „Ce ți se potrivește?"
  var quiz = d.getElementById('quiz');
  if (quiz) {
    var Q = [
      { q: 'Ce fel de proiect ai?', o: ['Casă nouă', 'Renovare', 'Spațiu comercial sau birouri', 'Bloc sau ansamblu rezidențial'] },
      { q: 'Ce vrei să rezolvi?', o: ['Ferestre și uși de terasă', 'Ușa de intrare', 'Balcon, terasă sau scară', 'Umbrire și protecție solară'] },
      { q: 'Ce contează cel mai mult?', o: ['Să țină căldura în casă', 'Suprafețe mari de sticlă, aspect modern', 'Un preț bun', 'Liniște în casă'] },
      { q: 'Când vrei să începi?', o: ['Cât mai repede', 'În 1–3 luni', 'Peste 3 luni', 'Doar mă informez'] }
    ];
    var R = {
      usa: { t: 'Ușă de intrare Inotherm', x: 'Pornește din configurator: alegi modelul, culoarea și sticla, iar noi îți facem oferta pentru varianta aleasă, cu montaj inclus.', i: 'assets/img/barbat-usa.webp', u: 'configurator-usi.html' },
      bal: { t: 'Balustrade din sticlă', x: 'Sisteme cu fixare în pardoseală, laterală sau în puncte, pentru balcoane, terase și scări. Stabilim varianta potrivită la măsurători.', i: 'assets/img/balustrada-scara.webp', u: 'balustrade-din-sticla.html' },
      umb: { t: 'Sisteme de umbrire', x: 'Rulouri exterioare, copertine și storuri care țin căldura afară vara și protejează intimitatea.', i: 'assets/img/umbrire.webp', u: 'sisteme-de-umbrire.html' },
      al: { t: 'Tâmplărie din aluminiu', x: 'Profile subțiri și rezistente, potrivite pentru ferestre mari, uși culisante și fațade. Lucrăm cu Schüco, Reynaers, Alumil și Aluprof.', i: 'assets/img/casa-moderna.webp', u: 'tamplarie-aluminiu.html' },
      pvc: { t: 'Tâmplărie PVC', x: 'Izolare termică bună la un preț accesibil, ușor de întreținut. Lucrăm cu Salamander, Rehau și Veka.', i: 'assets/img/interior-glisanta.webp', u: 'tamplarie-pvc.html' }
    };
    var step = 0, ans = [];
    var panel = quiz.querySelector('.quiz-panel'), prog = quiz.querySelectorAll('.prog span'), lab = quiz.querySelector('.step-label');
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function render() {
      prog.forEach(function (s, i) { s.classList.toggle('on', i < step); });
      if (step < Q.length) {
        lab.textContent = 'Pasul ' + (step + 1) + ' din ' + Q.length;
        var h = '<div class="stack g24 in"><h3 class="h h-s" style="font-size:28px;font-weight:700">' + esc(Q[step].q) + '</h3><div class="opts">';
        Q[step].o.forEach(function (o) { h += '<button type="button" class="opt" aria-pressed="' + (ans[step] === o) + '">' + esc(o) + '</button>'; });
        h += '</div><div class="row between g12"><button type="button" class="btn btn-w back" style="visibility:' + (step ? 'visible' : 'hidden') + '">← Înapoi</button><span style="font-size:14px;color:var(--onk2)">Alege o variantă ca să treci mai departe</span></div></div>';
        panel.innerHTML = h;
        panel.querySelectorAll('.opt').forEach(function (b) {
          b.addEventListener('click', function () { ans = ans.slice(0, step); ans[step] = b.textContent; step++; render(); });
        });
        panel.querySelector('.back').addEventListener('click', function () { step = Math.max(0, step - 1); render(); });
      } else {
        lab.textContent = 'Gata — iată recomandarea';
        var r = ans[1] === 'Ușa de intrare' ? R.usa : ans[1] === 'Balcon, terasă sau scară' ? R.bal : ans[1] === 'Umbrire și protecție solară' ? R.umb
          : (ans[2] === 'Suprafețe mari de sticlă, aspect modern' || ans[0] === 'Spațiu comercial sau birouri') ? R.al : R.pvc;
        panel.innerHTML = '<div class="stack g20 in"><span class="eyebrow y">Recomandarea noastră</span>' +
          '<div class="grid2" style="grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:24px;align-items:start"><img src="' + r.i + '" alt="' + esc(r.t) + '" style="width:100%;aspect-ratio:4/3;object-fit:cover">' +
          '<div class="stack g12"><h3 class="h h-m" style="color:var(--y)">' + esc(r.t) + '</h3><p style="margin:0;font-size:17px;line-height:1.6;color:#e8e3de">' + esc(r.x) + '</p>' +
          '<p style="margin:0;font-size:15px;color:var(--onk2)">Răspunsurile tale: ' + esc(ans.join(' · ')) + '</p></div></div>' +
          '<div class="row g12"><a href="contact.html#oferta" class="btn btn-y">Cere oferta pentru această soluție</a><a href="' + r.u + '" class="btn btn-w">Vezi detalii</a><button type="button" class="btn btn-w again">Ia-o de la capăt</button></div></div>';
        panel.querySelector('.again').addEventListener('click', function () { step = 0; ans = []; render(); });
        try { sessionStorage.setItem('dauer-ghid', r.t + ' (' + ans.join(', ') + ')'); } catch (e) {}
      }
    }
    render();
  }

  // Comparator PVC / aluminiu
  var cmp = d.getElementById('cmp');
  if (cmp) {
    cmp.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        cmp.querySelectorAll('.tab').forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        cmp.querySelectorAll('[data-mat]').forEach(function (p) { p.hidden = p.getAttribute('data-mat') !== t.getAttribute('data-for'); });
      });
    });
  }

  // Pași „Cum lucrăm"
  var steps = d.getElementById('steps');
  if (steps) {
    var btns = steps.querySelectorAll('.step'), imgs = steps.querySelectorAll('.steps-media img');
    var bNo = steps.querySelector('.steps-badge b'), bT = steps.querySelector('.steps-badge span');
    var cur = 0, timer;
    function show(i) {
      cur = i;
      btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      bNo.textContent = String(i + 1); bT.textContent = btns[i].querySelector('strong').textContent;
    }
    function auto() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show((cur + 1) % btns.length); }, 6000); }
    btns.forEach(function (b, k) { b.addEventListener('click', function () { show(k); auto(); }); });
    show(0); auto();
  }

  // Filtre (proiecte, balustrade)
  d.querySelectorAll('[data-filter]').forEach(function (group) {
    var target = d.getElementById(group.getAttribute('data-filter'));
    group.querySelectorAll('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        var v = c.getAttribute('data-v');
        group.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        target.querySelectorAll('[data-cat]').forEach(function (it) { it.hidden = v !== 'toate' && it.getAttribute('data-cat').split(' ').indexOf(v) < 0; });
      });
    });
  });

  // Formulare: trimise pe e-mail prin FormSubmit
  var etichete = { nume: 'Nume', telefon: 'Telefon', email: 'E-mail', 'f-news': 'E-mail', tip: 'Interes', mesaj: 'Detalii' };
  d.querySelectorAll('form.demo').forEach(function (f) {
    var g = null;
    try { g = sessionStorage.getItem('dauer-ghid'); } catch (e) {}
    var msg = f.querySelector('textarea');
    if (g && msg && !msg.value) msg.value = 'Recomandarea din ghid: ' + g;
    var hp = d.createElement('input');
    hp.type = 'text'; hp.name = '_honey'; hp.tabIndex = -1; hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true'); hp.style.cssText = 'position:absolute;left:-9999px';
    f.appendChild(hp);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('[type=submit]');
      var cerere = !!f.querySelector('textarea');
      var data = {
        _subject: cerere ? 'Cerere nouă de pe sistemedauer.ro' : 'Abonare newsletter – sistemedauer.ro',
        _template: 'table', _captcha: 'false', _honey: hp.value
      };
      f.querySelectorAll('input,select,textarea').forEach(function (el) {
        if (el.type === 'checkbox' || el.type === 'submit' || el === hp) return;
        var k = el.name || el.id;
        if (!k || !el.value) return;
        data[etichete[k] || k.replace(/^f-/, '')] = el.value;
        if (el.type === 'email') data._replyto = el.value;
      });
      data.Pagina = d.title;
      if (btn) btn.disabled = true;
      fetch('https://formsubmit.co/ajax/vanzari@sistemedauer.ro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (String(j.success) !== 'true') throw j; })
        .then(function () {
          var ok = f.querySelector('.ok');
          if (ok) { ok.hidden = false; ok.focus && ok.focus(); }
          f.reset();
        })
        .catch(function () {
          alert('Mesajul nu a putut fi trimis. Te rugăm să ne suni la 0740 300 122 sau să scrii la vanzari@sistemedauer.ro.');
        })
        .then(function () { if (btn) btn.disabled = false; });
    });
  });

  // Banner cookie
  var ck = d.querySelector('.cookie');
  if (ck) {
    var seen = false;
    try { seen = localStorage.getItem('dauer-cookie') === '1'; } catch (e) {}
    ck.hidden = seen;
    ck.querySelector('button').addEventListener('click', function () { ck.hidden = true; try { localStorage.setItem('dauer-cookie', '1'); } catch (e) {} });
  }
})();
