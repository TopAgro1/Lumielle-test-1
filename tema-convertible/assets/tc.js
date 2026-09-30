/* Tema Convertible · interacciones de la tienda (sin dependencias).
   - Carrito lateral único (sección tc-carrito, refrescado con la Section Rendering API).
   - Compra: galería, selector de packs o variantes, barra fija, despacho y oferta con hora real.
   - Opiniones: carrusel de videos y fotos de reseñas en grande.
   La configuración global llega en <script id="tc-settings"> (layout/theme.liquid). */
(function () {
  'use strict';

  var S = {};
  try { S = JSON.parse(document.getElementById('tc-settings').textContent); } catch (e) {}
  var ROOT = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Utilidades ---------- */
  function formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    cents = parseInt(cents, 10) || 0;
    var fmt = String(format || S.moneyFormat || '${{amount}}').replace(/<[^>]*>/g, '');
    var rx = /\{\{\s*(\w+)\s*\}\}/;
    function delim(num, precision, thousands, decimal) {
      thousands = thousands == null ? ',' : thousands; decimal = decimal || '.';
      var n = (num / 100).toFixed(precision).split('.');
      return n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands) + (n[1] ? decimal + n[1] : '');
    }
    var m = fmt.match(rx), v;
    switch (m ? m[1] : 'amount') {
      case 'amount_no_decimals': v = delim(cents, 0); break;
      case 'amount_with_comma_separator': v = delim(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': v = delim(cents, 0, '.', ','); break;
      case 'amount_with_apostrophe_separator': v = delim(cents, 2, "'", '.'); break;
      case 'amount_no_decimals_with_space_separator': v = delim(cents, 0, ' '); break;
      case 'amount_with_space_separator': v = delim(cents, 2, ' ', ','); break;
      case 'amount_with_period_and_space_separator': v = delim(cents, 2, ' ', '.'); break;
      default: v = delim(cents, 2);
    }
    return fmt.replace(rx, v);
  }
  var money = function (c) { return formatMoney(c); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function postJSON(url, body) {
    return fetch(ROOT + url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); });
  }
  function pad(n) { return String(n).padStart(2, '0'); }

  /* ---------- Días hábiles con huso y feriados de la configuración ---------- */
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var DCORTO = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var TZ = (typeof S.tz === 'number' ? S.tz : -3) * 3600000;
  var FERIADOS = (S.feriados || []).reduce(function (o, d) { o[String(d).trim()] = true; return o; }, {});
  function key(d) { return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function isBiz(d) { var w = d.getUTCDay(); return w >= 1 && w <= 5 && !FERIADOS[key(d)]; }
  function nowLocal() { return new Date(Date.now() + TZ); } /* fecha "de pared" del depósito en campos UTC */

  /* ---------- Encabezado: alto real para los elementos fijos ---------- */
  function measureHeader() {
    var h = document.querySelector('[data-tc-header]');
    var v = h ? h.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--tc-header-h', Math.round(v) + 'px');
  }
  measureHeader();
  window.addEventListener('resize', measureHeader);
  if ('ResizeObserver' in window) { var hdr = document.querySelector('[data-tc-header]'); if (hdr) new ResizeObserver(measureHeader).observe(hdr); }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var m = document.querySelector('[data-tc-menu][open]');
    if (m) { m.open = false; var s = m.querySelector('summary'); if (s) s.focus(); }
  });

  /* ---------- Carrito lateral ---------- */
  var Cart = {
    el: function () { return document.querySelector('[data-tc-drawer]'); },
    lastFocus: null,
    focusables: function () {
      var d = Cart.el(); if (!d) return [];
      return Array.prototype.filter.call(d.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'), function (x) { return x.offsetParent !== null; });
    },
    open: function (added) {
      var d = Cart.el();
      if (!d) { window.location.href = ROOT + 'cart'; return; }
      var ok = d.querySelector('[data-tc-drawer-ok]'); if (ok) ok.hidden = !added;
      Cart.lastFocus = document.activeElement;
      d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      var c = d.querySelector('[data-tc-drawer-close].tc-iconbtn'); if (c) setTimeout(function () { c.focus(); }, 50);
    },
    close: function () {
      var d = Cart.el(); if (!d) return;
      d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      if (Cart.lastFocus && Cart.lastFocus.focus) Cart.lastFocus.focus();
    },
    isOpen: function () { var d = Cart.el(); return d && d.classList.contains('is-open'); },
    apply: function (html) {
      var d = Cart.el(); if (!d || !html) return;
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var next = doc.querySelector('[data-tc-drawer-content]');
      var here = d.querySelector('[data-tc-drawer-content]');
      if (next && here) here.innerHTML = next.innerHTML;
      var er = d.querySelector('[data-tc-drawer-err]'); if (er) er.hidden = true;
      var src = doc.querySelector('[data-tc-count-src]');
      if (src) Cart.count(src.textContent.trim());
    },
    count: function (n) {
      document.querySelectorAll('[data-tc-count]').forEach(function (el) { el.textContent = n; el.hidden = String(n) === '0'; });
    },
    refresh: function () {
      if (document.querySelector('[data-tc-cart-page]')) { window.location.reload(); return Promise.resolve(); }
      return fetch(ROOT + '?sections=' + (S.cartSection || 'tc-carrito'), { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (j) { Cart.apply(j[S.cartSection || 'tc-carrito']); });
    },
    error: function (msg) {
      var d = Cart.el(); var el = d && d.querySelector('[data-tc-drawer-err]');
      if (el) { el.hidden = false; el.textContent = msg; }
    }
  };
  window.TCCart = Cart;

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null; if (!t) return;
    if (t.closest('[data-tc-cart-open]')) { e.preventDefault(); Cart.open(false); return; }
    if (t.closest('[data-tc-drawer-close]')) { e.preventDefault(); Cart.close(); return; }
    var line = t.closest('[data-tc-line]');
    if (line) {
      e.preventDefault(); line.disabled = true;
      postJSON('cart/change.js', { line: +line.getAttribute('data-tc-line'), quantity: +line.getAttribute('data-tc-qty') })
        .then(Cart.refresh)
        .catch(function (err) { line.disabled = false; Cart.error((err && err.description) || 'No pudimos actualizar el carrito. Probá de nuevo.'); });
      return;
    }
    var sw = t.closest('[data-tc-swap-id]');
    if (sw) {
      e.preventDefault(); sw.disabled = true;
      postJSON('cart/change.js', { line: +sw.getAttribute('data-tc-swap-line'), quantity: 0 })
        .then(function () { return postJSON('cart/add.js', { items: [{ id: +sw.getAttribute('data-tc-swap-id'), quantity: 1 }] }); })
        .then(Cart.refresh)
        .catch(function (err) { sw.disabled = false; Cart.refresh().then(function () { Cart.error((err && err.description) || 'No pudimos cambiar el pack.'); }); });
      return;
    }
    var add = t.closest('[data-tc-add]');
    if (add) {
      e.preventDefault(); add.disabled = true;
      postJSON('cart/add.js', { items: [{ id: +add.getAttribute('data-tc-add'), quantity: 1 }] })
        .then(Cart.refresh)
        .catch(function (err) { add.disabled = false; Cart.error((err && err.description) || 'No pudimos sumarlo.'); });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!Cart.isOpen()) return;
    if (e.key === 'Escape') { Cart.close(); return; }
    if (e.key !== 'Tab') return;
    var f = Cart.focusables(); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- Formularios de compra (cualquier form[data-tc-form]) ---------- */
  function bindForm(form, onDone) {
    if (onDone) form.__tcDone = onDone;
    if (form.__tc) return; form.__tc = true;
    form.addEventListener('submit', function (e) {
      if (!window.fetch || !Cart.el()) return; /* sin carrito lateral: envío normal a /cart */
      e.preventDefault();
      var scope = form.closest('[data-tc-root]') || form;
      var btns = scope.querySelectorAll('[data-tc-submit],[data-lm-add]');
      var err = scope.querySelector('[data-tc-error]');
      btns.forEach(function (b) { b.disabled = true; b.classList.add('is-loading'); });
      if (err) err.hidden = true;
      var fd = new FormData(form);
      fd.append('sections', S.cartSection || 'tc-carrito');
      fd.append('sections_url', window.location.pathname);
      fetch(ROOT + 'cart/add.js', { method: 'POST', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: fd })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); })
        .then(function (j) {
          if (j.sections) Cart.apply(j.sections[S.cartSection || 'tc-carrito']); else return Cart.refresh();
        })
        .then(function () { Cart.open(true); })
        .catch(function (x) {
          var msg = (x && (x.description || x.message)) || 'No pudimos agregarlo. Probá de nuevo.';
          if (err) { err.hidden = false; err.textContent = msg; if (err.scrollIntoView) err.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }); }
          else { Cart.refresh().then(function () { Cart.error(msg); Cart.open(false); }); }
        })
        .then(function () {
          btns.forEach(function (b) { b.disabled = false; b.classList.remove('is-loading'); });
          if (form.__tcDone) form.__tcDone();
        });
    });
  }
  /* ---------- Compra (sección tc-compra) ---------- */
  function initBuy(root) {
    var cfg = {};
    try { cfg = JSON.parse(root.querySelector('[data-tc-config]').textContent); } catch (e) {}
    var q = function (sel) { return root.querySelector(sel) || document.querySelector(sel); };
    var qa = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
    var form = root.querySelector('form[data-tc-form]');
    if (!form) return;
    var radios = Array.prototype.slice.call(form.querySelectorAll('input[name="id"][type="radio"]'));
    var submitBtn = root.querySelector('[data-tc-submit]');

    /* Galería */
    var track = root.querySelector('[data-lm-track]');
    if (track) {
      var slides = Array.prototype.slice.call(track.children);
      var goBtns = Array.prototype.slice.call(root.querySelectorAll('[data-lm-go]'));
      var count = root.querySelector('[data-lm-count]');
      var current = 0, t;
      var go = function (i) {
        i = (i + slides.length) % slides.length;
        track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft - (parseFloat(getComputedStyle(track).paddingLeft) || 0), behavior: reduceMotion ? 'auto' : 'smooth' });
      };
      var mark = function (i) {
        current = i;
        goBtns.forEach(function (b) { var on = +b.getAttribute('data-lm-go') === i; b.classList.toggle('is-on', on); b.setAttribute('aria-current', on ? 'true' : 'false'); });
        if (count) count.textContent = (i + 1) + ' / ' + slides.length;
      };
      track.addEventListener('scroll', function () {
        clearTimeout(t);
        t = setTimeout(function () {
          var best = 0, dist = Infinity, left = track.getBoundingClientRect().left;
          slides.forEach(function (s, i) { var d = Math.abs(s.getBoundingClientRect().left - left); if (d < dist) { dist = d; best = i; } });
          mark(best);
        }, 60);
      }, { passive: true });
      goBtns.forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-lm-go')); }); });
      var prev = root.querySelector('[data-lm-prev]'), next = root.querySelector('[data-lm-next]');
      if (prev) prev.addEventListener('click', function () { go(current - 1); });
      if (next) next.addEventListener('click', function () { go(current + 1); });
    }

    /* Pack o variante elegida */
    function selected() { return radios.filter(function (r) { return r.checked; })[0] || radios[0]; }
    function radioByN(n) { return radios.filter(function (r) { return +r.dataset.n === n; })[0]; }
    function shipState(cents) {
      if (!S.threshold) return null;
      var ok = cents >= S.threshold;
      return { ok: ok, msg: ok ? 'Este pedido tiene envío gratis' : 'Te faltan ' + money(S.threshold - cents) + ' para el envío gratis', pct: Math.min(100, Math.round(cents / S.threshold * 100)) + '%' };
    }
    function paintBar(el, st) {
      if (!el) return;
      if (!st) { el.hidden = true; return; }
      el.hidden = false; el.classList.toggle('is-ok', st.ok);
      el.querySelector('[data-bar-msg]').textContent = st.msg;
      var fill = el.querySelector('[data-bar-fill]');
      requestAnimationFrame(function () { fill.style.width = st.pct; });
    }
    function update(fromUser) {
      var r = selected(); if (!r) return;
      var price = +r.dataset.price, save = +r.dataset.save, was = +r.dataset.was || 0, n = +r.dataset.n || 1;
      var qty = 1, qf = form.querySelector('input[name="quantity"]'); if (qf && qf.type !== 'hidden') qty = Math.max(1, +qf.value || 1);
      var total = price * qty;
      var label = (r.disabled ? 'Sin stock' : 'Agregar al carrito · ' + money(total));
      var el;
      if ((el = root.querySelector('[data-lm-price]'))) el.textContent = money(total);
      if ((el = root.querySelector('[data-lm-was]'))) { el.hidden = !(was > price); el.textContent = money(was * qty); }
      if ((el = root.querySelector('[data-lm-save]'))) { el.hidden = !(save > 0); el.textContent = 'Ahorrás ' + money(save * qty); }
      if ((el = root.querySelector('[data-lm-day]'))) { var dd = +r.dataset.day; el.hidden = !(cfg.porDia && dd > 0); el.textContent = '≈ ' + money(dd) + ' por día'; }
      qa('[data-lm-btn-label]').forEach(function (x) { x.textContent = label; });
      if (S.transferPct > 0) { var tp = Math.round(total - total * S.transferPct / 100); qa('[data-tc-transfer]').forEach(function (x) { x.textContent = money(tp); }); }
      if ((el = q('[data-lm-sticky-price]'))) el.textContent = money(total);
      if ((el = q('[data-lm-sticky-name]'))) el.textContent = r.dataset.name + (cfg.porciones > 0 ? ' · ' + (cfg.porciones * n) + ' ' + (cfg.porcionLabel || 'porciones') : '');
      qa('[data-lm-pick]').forEach(function (b) { var on = b.getAttribute('data-lm-pick') === r.value; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      qa('[data-tc-submit],[data-lm-add]').forEach(function (b) { b.disabled = r.disabled; });
      var nudge = root.querySelector('[data-lm-nudge]');
      var r2 = cfg.packs ? radioByN(2) : null;
      if (nudge) {
        if (cfg.packs && n === 1 && r2 && !r2.disabled) {
          nudge.hidden = false;
          var extra = +r2.dataset.price - price, s2 = +r2.dataset.save;
          nudge.querySelector('[data-lm-nudge-title]').textContent = 'Por ' + money(extra) + ' más, llevás 2 ' + (cfg.unidades || 'unidades') + (s2 > 0 ? ' y ahorrás ' + money(s2) : '');
          nudge.onclick = function () { r2.checked = true; r2.dispatchEvent(new Event('change', { bubbles: true })); };
        } else nudge.hidden = true;
      }
      paintBar(root.querySelector('[data-lm-bar]'), shipState(total));
      var stock = root.querySelector('[data-lm-stock]');
      var inv = r.dataset.inv === '' ? null : +r.dataset.inv;
      if (stock) {
        if (cfg.stockUmbral > 0 && inv !== null && inv > 0 && inv <= cfg.stockUmbral) {
          stock.hidden = false;
          stock.querySelector('[data-lm-stock-txt]').textContent = 'Quedan ' + inv + (inv === 1 ? ' unidad' : ' unidades') + ' en stock';
          stock.querySelector('[data-bar-fill]').style.width = Math.max(8, Math.round(inv / cfg.stockUmbral * 100)) + '%';
        } else stock.hidden = true;
      }
      if (fromUser && window.history && window.history.replaceState) {
        var u = new URL(window.location.href); u.searchParams.set('variant', r.value); window.history.replaceState({}, '', u.toString());
      }
    }
    radios.forEach(function (r) { r.addEventListener('change', function () { update(true); }); });
    var qf2 = form.querySelector('input[name="quantity"]:not([type="hidden"])');
    if (qf2) qf2.addEventListener('input', function () { update(false); });
    root.querySelectorAll('[data-tc-step]').forEach(function (b) {
      b.addEventListener('click', function () { var f = form.querySelector('input[name="quantity"]'); f.value = Math.max(1, Math.min(99, (+f.value || 1) + +b.getAttribute('data-tc-step'))); update(false); });
    });
    qa('[data-lm-pick]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = radios.filter(function (x) { return x.value === b.getAttribute('data-lm-pick'); })[0];
        if (r && !r.disabled) { r.checked = true; update(true); }
      });
    });
    update(false);

    /* Despacho y oferta con hora real del depósito */
    var ship = root.querySelector('[data-lm-ship]');
    var promo = root.querySelector('[data-lm-promo]');
    var pm = String(cfg.ofertaFin || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?$/);
    var needTick = (S.mostrarDespacho && ship) || (promo && cfg.ofertaTexto && pm);
    function tick() {
      var now = Date.now(), loc = nowLocal();
      if (S.mostrarDespacho && ship) {
        var mins = loc.getUTCHours() * 60 + loc.getUTCMinutes();
        var corte = Math.max(0, Math.min(23, +S.corte || 14));
        var html, short, off = 0;
        if (isBiz(loc) && mins < corte * 60) {
          var rem = corte * 60 - mins;
          var tt = (rem >= 60 ? Math.floor(rem / 60) + ' h ' : '') + (rem % 60) + ' min';
          html = 'Pedí en las próximas <b>' + tt + '</b> y lo despachamos hoy.';
          short = 'Despacho hoy si pedís en ' + tt;
        } else {
          var d = new Date(loc.getTime());
          do { d = new Date(d.getTime() + 86400000); off++; } while (!isBiz(d) && off < 20);
          var lbl = off === 1 ? 'mañana' : 'el ' + DIAS[d.getUTCDay()];
          html = 'Pedí ahora y lo despachamos <b>' + lbl + '</b>.';
          short = 'Pedí ahora: despacho ' + lbl;
        }
        ship.hidden = false;
        ship.querySelector('[data-lm-ship-txt]').innerHTML = html;
        var eta = ship.querySelector('[data-lm-eta]');
        var emin = +S.entregaMin || 0, emax = +S.entregaMax || 0;
        if (eta && emin > 0 && emax >= emin) {
          var addBiz = function (n) { var t2 = loc.getTime() + off * 86400000, k = 0; while (k < n) { t2 += 86400000; if (isBiz(new Date(t2))) k++; } return new Date(t2); };
          var f = function (dt) { return DCORTO[dt.getUTCDay()] + ' ' + dt.getUTCDate() + ' de ' + MESES[dt.getUTCMonth()]; };
          eta.hidden = false;
          eta.textContent = 'Llega entre el ' + f(addBiz(emin)) + ' y el ' + f(addBiz(emax)) + '.';
        }
        var ss = q('[data-lm-sticky-ship]');
        if (ss) { ss.hidden = false; ss.querySelector('[data-lm-sticky-ship-txt]').textContent = short; }
      }
      if (promo && cfg.ofertaTexto && pm) {
        var end = Date.UTC(+pm[1], +pm[2] - 1, +pm[3], pm[4] ? +pm[4] : 23, pm[5] ? +pm[5] : 59) - TZ;
        var left = end - now;
        if (left > 0) {
          var sec = Math.floor(left / 1000);
          promo.hidden = false;
          promo.querySelector('[data-lm-d]').textContent = Math.floor(sec / 86400);
          promo.querySelector('[data-lm-h]').textContent = pad(Math.floor(sec % 86400 / 3600));
          promo.querySelector('[data-lm-m]').textContent = pad(Math.floor(sec % 3600 / 60));
          promo.querySelector('[data-lm-s]').textContent = pad(sec % 60);
        } else promo.hidden = true;
      }
    }
    if (needTick) { tick(); setInterval(tick, 1000); }

    /* Barra fija */
    var sticky = q('[data-lm-sticky]');
    if (sticky && submitBtn && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        var mobile = window.matchMedia('(max-width: 989px)').matches;
        var show = !e.isIntersecting && (e.boundingClientRect.top < 0 || (cfg.stickySiempre && mobile));
        sticky.classList.toggle('is-visible', show);
        sticky.toggleAttribute('inert', !show);
        document.body.classList.toggle('tc-has-sticky', show);
      }).observe(submitBtn);
    }
    qa('[data-lm-add]').forEach(function (b) {
      b.addEventListener('click', function () { if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true })); });
    });
    if (submitBtn) submitBtn.addEventListener('click', function () { if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true })); });
    bindForm(form, function () { update(false); });
  }

  /* ---------- Opiniones: carrusel de videos ---------- */
  function initVids(el) {
    if (el.hasAttribute('data-ready')) return; el.setAttribute('data-ready', '');
    var auto = el.getAttribute('data-auto') !== 'false' && !reduceMotion;
    var speed = parseFloat(el.getAttribute('data-speed')) || 28;
    var originals = Array.prototype.slice.call(el.children);
    if (!originals.length) return;
    if (auto && originals.length > 1) {
      originals.forEach(function (f) {
        var c = f.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.setAttribute('data-clone', ''); c.removeAttribute('data-shopify-editor-block');
        c.querySelectorAll('button').forEach(function (b) { b.tabIndex = -1; });
        el.appendChild(c);
      });
      el.classList.add('is-auto');
    }
    var vids = el.querySelectorAll('video');
    var soundHold = false;
    function setSnd(v, on) { var b = v.parentNode.querySelector('[data-snd]'); if (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? 'Silenciar' : 'Activar sonido'); } }
    vids.forEach(function (v) { v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.removeAttribute('controls'); if (reduceMotion) v.removeAttribute('autoplay'); });
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && (!reduceMotion || !v.muted)) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (!e.isIntersecting) { v.pause(); if (!v.muted) { v.muted = true; setSnd(v, false); soundHold = false; } }
      });
    }, { threshold: .35 }) : null;
    vids.forEach(function (v) { if (io) io.observe(v); else if (!reduceMotion) v.play(); });
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-snd]'); if (!b) return;
      var v = b.parentNode.querySelector('video'); if (!v) return;
      var on = v.muted;
      vids.forEach(function (o) { if (o !== v && !o.muted) { o.muted = true; setSnd(o, false); } });
      v.muted = !on; setSnd(v, on);
      if (on) { v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      soundHold = on;
    });
    if (!auto || originals.length < 2) return;
    var pos = el.scrollLeft, last = 0, userHold = false, resumeT = null, visible = true, running = false, mouseIn = false;
    function loopW() { var first = el.querySelector('[data-clone]'); return first ? first.offsetLeft - originals[0].offsetLeft : 0; }
    function hold() { userHold = true; clearTimeout(resumeT); }
    function release() { clearTimeout(resumeT); resumeT = setTimeout(function () { userHold = false; pos = el.scrollLeft; }, 2500); }
    el.addEventListener('pointerdown', hold, { passive: true });
    el.addEventListener('touchstart', hold, { passive: true });
    el.addEventListener('wheel', function () { hold(); release(); }, { passive: true });
    el.addEventListener('pointerup', function () { if (!mouseIn) release(); }, { passive: true });
    el.addEventListener('touchend', release, { passive: true });
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { mouseIn = true; hold(); } });
    el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { mouseIn = false; release(); } });
    el.addEventListener('scroll', function () { if (userHold) { var w = loopW(); if (w > 0 && el.scrollLeft >= w) el.scrollLeft -= w; if (mouseIn) clearTimeout(resumeT); else release(); } }, { passive: true });
    el.addEventListener('focusin', hold); el.addEventListener('focusout', release);
    function frame(t) {
      if (!visible) { running = false; return; }
      var dt = last ? Math.min(t - last, 64) / 1000 : 0; last = t;
      if (!userHold && !soundHold) { var w = loopW(); pos += speed * dt; if (w > 0 && pos >= w) pos -= w; el.scrollLeft = pos; }
      requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; last = 0; pos = el.scrollLeft; requestAnimationFrame(frame); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(el);
    else start();
  }

  /* ---------- Opiniones: fotos en grande ---------- */
  function initLightbox(d) {
    if (d.hasAttribute('data-ready') || typeof d.showModal !== 'function') return; d.setAttribute('data-ready', '');
    var root = d.closest('.tc') || document;
    var img = d.querySelector('.tc-lb__img'), count = d.querySelector('[data-lb-count]');
    var prev = d.querySelector('[data-lb-prev]'), next = d.querySelector('[data-lb-next]');
    var list = [], i = 0;
    function show(n) {
      i = (n + list.length) % list.length;
      var a = list[i], t = a.querySelector('img');
      img.src = a.href; img.alt = t ? t.alt : '';
      var multi = list.length > 1;
      prev.hidden = next.hidden = count.hidden = !multi;
      count.textContent = (i + 1) + ' / ' + list.length;
    }
    root.addEventListener('click', function (e) {
      var a = e.target.closest('[data-lm-pic]'); if (!a || d.open) return;
      e.preventDefault();
      list = Array.prototype.slice.call(a.closest('[data-lm-pics]').querySelectorAll('[data-lm-pic]'));
      show(list.indexOf(a)); d.showModal();
    });
    prev.addEventListener('click', function () { show(i - 1); });
    next.addEventListener('click', function () { show(i + 1); });
    d.querySelector('[data-lb-close]').addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.addEventListener('keydown', function (e) { if (list.length < 2) return; if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
    d.addEventListener('close', function () { img.removeAttribute('src'); });
  }

  function boot() {
    document.querySelectorAll('[data-tc-root]').forEach(function (r) { if (!r.__tc) { r.__tc = true; initBuy(r); } });
    document.querySelectorAll('[data-tc-vids]').forEach(initVids);
    document.querySelectorAll('[data-tc-lb]').forEach(initLightbox);
    document.querySelectorAll('form[data-tc-form]').forEach(function (f) { bindForm(f); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('shopify:section:load', function () { boot(); measureHeader(); });
})();
