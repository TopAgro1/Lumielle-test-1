const { JSDOM } = require('jsdom');
const fs = require('fs');
const js = fs.readFileSync(require('path').resolve(__dirname, '../tema-convertible/assets/tc.js'), 'utf8');
const html = `<!doctype html><html><head>
<script type="application/json" id="tc-settings">{"moneyFormat":"\${{amount_no_decimals_with_comma_separator}}","threshold":5000000,"flat":500000,"transferPct":10,"mostrarDespacho":true,"corte":14,"entregaMin":2,"entregaMax":7,"tz":-3,"feriados":["2026-10-12"],"cartSection":"tc-carrito"}</script>
</head><body class="lm tc">
<header data-tc-header><a data-tc-cart-open href="/cart">Carrito <span data-tc-count hidden>0</span></a></header>
<div class="lm tc" data-tc-root>
<script type="application/json" data-tc-config>{"packs":true,"porciones":0,"porcionLabel":"porciones","porDia":false,"unidad":"crema","unidades":"cremas","stickySiempre":true,"ofertaTexto":"","ofertaFin":"","stockUmbral":5}</script>
<div class="lm-price"><span data-lm-price></span><span data-lm-was hidden></span><span data-lm-save hidden></span><span data-lm-day hidden></span></div>
<p data-tc-transfer></p>
<form data-tc-form action="/cart/add" method="post">
  <input type="radio" name="id" value="11" data-n="1" data-price="4490000" data-was="0" data-save="0" data-day="0" data-inv="3" data-name="1 crema">
  <input type="radio" name="id" value="22" checked data-n="2" data-price="5490000" data-was="8980000" data-save="3490000" data-day="0" data-inv="" data-name="2 cremas">
  <input type="radio" name="id" value="33" data-n="3" data-price="6990000" data-was="13470000" data-save="6480000" data-day="0" data-inv="" data-name="3 cremas">
  <input type="hidden" name="quantity" value="1">
  <button type="button" data-lm-nudge hidden><b data-lm-nudge-title></b></button>
  <div data-lm-bar hidden><span data-bar-msg></span><div><div data-bar-fill></div></div></div>
  <div data-lm-stock hidden><span data-lm-stock-txt></span><div data-bar-fill></div></div>
  <div data-lm-ship hidden><span data-lm-ship-txt></span><span data-lm-eta hidden></span></div>
  <p data-tc-error hidden></p>
  <button type="button" data-tc-submit><span data-lm-btn-label></span></button>
</form>
<div data-lm-sticky inert><button type="button" data-lm-add>Agregar <span data-lm-sticky-price></span></button><small data-lm-sticky-name></small><div data-lm-sticky-ship hidden><span data-lm-sticky-ship-txt></span></div></div>
</div>
<div class="tc-drawer" data-tc-drawer aria-hidden="true">
  <button data-tc-drawer-close tabindex="-1">x</button>
  <div><button class="tc-iconbtn" data-tc-drawer-close>Cerrar</button></div>
  <div data-tc-drawer-ok hidden>ok</div><p data-tc-drawer-err hidden></p>
  <div data-tc-drawer-content><p>vacío</p></div>
</div>
</body></html>`;
const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://tienda.test/products/x', pretendToBeVisual: true });
const w = dom.window;
let calls = [], nextAdd = null;
const sectionHTML = `<div id="shopify-section-tc-carrito"><div class="tc-drawer"><div data-tc-drawer-content><div class="lm-line">Crema x2</div><button data-tc-line="1" data-tc-qty="0">Quitar</button></div><span data-tc-count-src hidden>2</span></div></div>`;
w.fetch = (url, opts = {}) => {
  calls.push([url, opts.method || 'GET']);
  const res = (status, body) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });
  if (url.endsWith('cart/add.js')) return nextAdd === 'fail' ? res(422, { status: 422, message: 'Cart Error', description: 'Todos los artículos 1 crema ya están en tu carrito o se agotaron.' }) : res(200, { id: 1, sections: { 'tc-carrito': sectionHTML } });
  if (url.includes('?sections=')) return res(200, { 'tc-carrito': sectionHTML });
  if (url.endsWith('cart/change.js')) return res(200, { item_count: 0 });
  return res(404, {});
};
w.requestAnimationFrame = (f) => setTimeout(() => f(Date.now()), 0);
w.eval(js);
const $ = (s) => w.document.querySelector(s);
const tick = () => new Promise(r => setTimeout(r, 30));
(async () => {
  await tick();
  const out = [];
  out.push(['label inicial', $('[data-lm-btn-label]').textContent]);
  out.push(['precio', $('[data-lm-price]').textContent, 'tachado', $('[data-lm-was]').hidden ? '-' : $('[data-lm-was]').textContent, 'ahorro', $('[data-lm-save]').textContent]);
  out.push(['transfer', $('[data-tc-transfer]').textContent]);
  out.push(['barra envío', $('[data-lm-bar]').hidden, $('[data-bar-msg]').textContent]);
  out.push(['despacho', $('[data-lm-ship]').hidden, $('[data-lm-ship-txt]').innerHTML, $('[data-lm-eta]').textContent]);
  const r1 = $('input[value="11"]'); r1.checked = true; r1.dispatchEvent(new w.Event('change', { bubbles: true }));
  out.push(['x1 label', $('[data-lm-btn-label]').textContent, 'nudge', $('[data-lm-nudge]').hidden, $('[data-lm-nudge-title]').textContent]);
  out.push(['stock', $('[data-lm-stock]').hidden, $('[data-lm-stock-txt]').textContent, 'url', w.location.search]);
  nextAdd = 'fail';
  $('[data-tc-submit]').click();
  await tick(); await tick();
  out.push(['422 error visible', !$('[data-tc-error]').hidden, $('[data-tc-error]').textContent, 'drawer abierto', $('[data-tc-drawer]').classList.contains('is-open'), 'botón habilitado', !$('[data-tc-submit]').disabled]);
  nextAdd = 'ok';
  $('[data-lm-add]').click();
  await tick(); await tick();
  out.push(['ok: drawer abierto', $('[data-tc-drawer]').classList.contains('is-open'), 'ok banner', !$('[data-tc-drawer-ok]').hidden, 'contenido', $('[data-tc-drawer-content]').textContent.trim(), 'count', $('[data-tc-count]').textContent, 'count hidden', $('[data-tc-count]').hidden, 'error oculto', $('[data-tc-error]').hidden]);
  $('[data-tc-line]').click();
  await tick(); await tick();
  out.push(['change llamadas', calls.map(c => c[0].replace('https://tienda.test','')).join(' | ')]);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' }));
  out.push(['escape cierra', !$('[data-tc-drawer]').classList.contains('is-open')]);
  out.forEach(o => console.log(o.join(' · ')));
  process.exit(0);
})().catch(e => { console.error('ERR', e); process.exit(1); });
