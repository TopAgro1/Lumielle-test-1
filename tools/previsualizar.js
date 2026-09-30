/* Render local aproximado del tema con liquidjs + stubs de Shopify, para previsualizar y cazar errores de Liquid. */
const { Liquid, Tag, Hash } = require('liquidjs');
const fs = require('fs'), path = require('path');
const T = path.resolve(__dirname, '../tema-convertible');
const OUT = process.argv[2] || path.resolve(__dirname, 'vista-previa');
fs.mkdirSync(OUT, { recursive: true });

const num = v => { const n = Number(typeof v === 'string' ? v.trim() : v); return isNaN(n) ? 0 : n; };
const engine = new Liquid({ root: [path.join(T, 'snippets')], extname: '.liquid', strictFilters: true, jsTruthy: false, lenientIf: true });
const strip = s => s.replace(/\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/, '').replace(/\{%-?\s*stylesheet\s*-?%\}[\s\S]*?\{%-?\s*endstylesheet\s*-?%\}/, '');
const schemaOf = s => { const m = s.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/); return m ? JSON.parse(m[1]) : {}; };
const fmt = c => '$' + Math.round(num(c) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const svgPh = (label, hue) => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><rect width="100%" height="100%" fill="hsl(${hue},35%,86%)"/><text x="50%" y="50%" font-family="sans-serif" font-size="42" fill="hsl(${hue},30%,35%)" text-anchor="middle">${label}</text></svg>`);

// filtros de Shopify (aproximados)
const F = {
  money: fmt, money_without_trailing_zeros: fmt, money_without_currency: c => fmt(c).slice(1),
  asset_url: f => 'file://' + path.join(T, 'assets', f),
  stylesheet_tag: u => `<link rel="stylesheet" href="${u}">`,
  image_url: (img) => (img && img.src) || svgPh('foto', 30),
  image_tag: function (url, ...args) { const h = {}; for (const a of args) if (Array.isArray(a)) h[a[0]] = a[1]; return `<img src="${url}" alt="${h.alt || ''}"${h.class ? ` class="${h.class}"` : ''}${h.style ? ` style="${h.style}"` : ''} loading="${h.loading || 'lazy'}"${h.width ? ` width="${h.width}"` : ''}${h.height ? ` height="${h.height}"` : ''}>`; },
  structured_data: () => '{}', video_tag: () => '<video muted></video>', payment_type_svg_tag: t => `<svg width="38" height="24"><rect width="38" height="24" rx="3" fill="#eee"/><text x="4" y="16" font-size="9">${t}</text></svg>`,
  default_errors: () => 'Error', format_code: c => c, color_modify: (c) => c, t: (k) => k, handleize: s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  json: v => JSON.stringify(v === undefined ? null : v),
  plus: (a, b) => num(a) + num(b), minus: (a, b) => num(a) - num(b), times: (a, b) => num(a) * num(b),
  divided_by: (a, b) => { const x = num(a), y = num(b); if (y === 0) throw new Error('divided_by 0'); return Number.isInteger(y) ? Math.floor(x / y) : x / y; },
  newline_to_br: s => String(s || '').replace(/\n/g, '<br />\n'),
};
for (const k in F) engine.registerFilter(k, F[k]);

class FormTag extends Tag {
  constructor(t, r, l, p) { super(t, r, l); this.args = t.args; this.tpls = []; const s = p.parseStream(r); s.on('tag:endform', () => s.stop()).on('template', x => this.tpls.push(x)).on('end', () => { throw new Error('form'); }); s.start(); }
  *render(ctx, emitter) {
    const attrs = []; const re = /([\w-]+):\s*('[^']*'|[\w.]+)/g; let m;
    while ((m = re.exec(this.args))) { let v = m[2].startsWith("'") ? m[2].slice(1, -1) : yield this.liquid.evalValue(m[2], ctx); attrs.push(`${m[1]}="${v == null ? '' : v}"`); }
    ctx.push({ form: { 'posted_successfully?': false, errors: null } });
    emitter.write(`<form method="post" action="/cart/add" ${attrs.join(' ')}>`);
    yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter);
    emitter.write('</form>'); ctx.pop();
  }
}
engine.registerTag('form', FormTag);
class PagTag extends Tag {
  constructor(t, r, l, p) { super(t, r, l); this.tpls = []; const s = p.parseStream(r); s.on('tag:endpaginate', () => s.stop()).on('template', x => this.tpls.push(x)).on('end', () => { throw new Error('paginate'); }); s.start(); }
  *render(ctx, emitter) { ctx.push({ paginate: { pages: 1, parts: [] } }); yield this.liquid.renderer.renderTemplates(this.tpls, ctx, emitter); ctx.pop(); }
}
engine.registerTag('paginate', PagTag);

const settingsDefaults = {};
for (const g of JSON.parse(fs.readFileSync(path.join(T, 'config/settings_schema.json')))) for (const s of (g.settings || [])) if (s.id) settingsDefaults[s.id] = s.default === undefined ? '' : s.default;
const settings = Object.assign({}, settingsDefaults, {
  free_shipping_threshold: 50000, ship_flat_rate: 5000, garantia_corta: '30 días de garantía', riesgo_texto: 'Si no te convence, tenés 30 días para devolverlo.',
  despacho_texto: 'Despacho en 24-48 h hábiles', pay_mp: true, pay_transfer: true, transfer_code: 'TRANSFER10', whatsapp_url: 'https://wa.me/5491100000000',
  contact_hours: 'Lunes a sábado de 9 a 19 h', legal_name: 'Marca Nueva S.A.', legal_tax_id: 'CUIT 30-00000000-0', accent_preset: process.env.ACCENT || 'salvia', font_display: process.env.FONT || 'dm_serif', entrega_min: 2, entrega_max: 7, mostrar_despacho: true
});
const img = (label, hue) => ({ src: svgPh(label, hue), alt: label, aspect_ratio: 0.8 });
const variants = [['Pack x1', 4490000, null], ['Pack x2', 5490000, 8980000], ['Pack x3', 6990000, 13470000]].map((v, i) => ({ id: 100 + i, title: v[0], price: v[1], compare_at_price: v[2], available: true, inventory_management: 'shopify', inventory_policy: 'deny', inventory_quantity: 40 }));
if (process.env.MODE === 'opciones') { variants.forEach((v, i) => { v.title = ['Rojo / S', 'Rojo / M', 'Azul / M'][i]; v.compare_at_price = i === 1 ? 6000000 : null; }); }
if (process.env.MODE === 'single') { variants.splice(1); variants[0].title = 'Default Title'; variants[0].available = false; }
const product = { id: 1, title: 'Producto de ejemplo', url: '/products/ejemplo', handle: 'ejemplo', description: '<p>Descripción cargada en Shopify.</p>', has_only_default_variant: process.env.MODE === 'single', variants, images: [img('Foto 1', 150), img('Foto 2', 20), img('Foto 3', 200)], featured_image: img('Producto', 150), options: process.env.MODE === 'opciones' ? ['Color', 'Talle'] : ['Pack'], price: 4490000, price_min: 4490000, price_varies: true, available: true, type: 'Cuidado', tags: [], selected_variant: null, selected_or_first_available_variant: variants[0] };
const cartEmpty = { item_count: 0, total_price: 0, items: [], currency: { iso_code: 'ARS' } };
const cartFull = { item_count: 1, total_price: 4490000, currency: { iso_code: 'ARS' }, items: [{ product_id: 1, variant_id: 100, quantity: 1, url: '/products/ejemplo', image: img('P', 150), product, variant: variants[0], final_line_price: 4490000, original_line_price: 4490000, line_level_discount_allocations: [] }] };
const menu = { links: [{ title: 'Inicio', url: '/', links: [] }, { title: 'Productos', url: '/collections/all', links: [] }, { title: 'Preguntas', url: '/pages/preguntas', links: [] }] };
const globals = (cart) => ({ settings, product, cart, shop: { name: 'Marca Nueva', email: 'hola@marca.test', money_format: '${{amount_no_decimals_with_comma_separator}}', enabled_payment_types: ['visa', 'master'] }, routes: { root_url: '/', cart_url: '/cart', search_url: '/search', all_products_collection_url: '/collections/all', cart_add_url: '/cart/add' }, request: { design_mode: false, locale: { iso_code: 'es' }, page_type: 'product' }, collections: { all: { products: [product, product, product] } }, collection: { title: 'Todos los productos', description: '', products: [product, product, product, product] }, template: { name: 'product', suffix: null }, page_title: 'Producto de ejemplo', canonical_url: 'https://marca.test/products/ejemplo' });

let sid = 0;
async function renderSection(type, data, g) {
  const src = fs.readFileSync(path.join(T, 'sections', type + '.liquid'), 'utf8');
  const sch = schemaOf(src);
  const st = {}; for (const s of (sch.settings || [])) if (s.id) st[s.id] = s.default === undefined ? '' : s.default;
  Object.assign(st, (data && data.settings) || {});
  if (st.menu === 'main-menu' || st.menu === 'footer') st.menu = menu;
  const blocks = ((data && data.block_order) || []).map(id => { const b = data.blocks[id]; const def = (sch.blocks || []).find(x => x.type === b.type) || {}; const bs = {}; for (const s of (def.settings || [])) if (s.id) bs[s.id] = s.default === undefined ? '' : s.default; if (b.settings && b.settings.menu) b.settings.menu = menu; return { id, type: b.type, settings: Object.assign(bs, b.settings || {}), shopify_attributes: '' }; });
  const section = { id: type + '-' + (++sid), settings: st, blocks };
  return `<div id="shopify-section-${section.id}">` + await engine.parseAndRender(strip(src), Object.assign({}, g, { section }), { globals: g }) + '</div>';
}
async function renderGroup(name, g) { const j = JSON.parse(fs.readFileSync(path.join(T, 'sections', name + '.json'))); let h = ''; for (const k of j.order) h += await renderSection(j.sections[k].type, j.sections[k], g); return h; }
async function page(templateFile, cart, file) {
  const g = globals(cart);
  const tj = JSON.parse(fs.readFileSync(path.join(T, 'templates', templateFile)));
  let body = ''; for (const k of tj.order) body += await renderSection(tj.sections[k].type, tj.sections[k], g);
  let layout = fs.readFileSync(path.join(T, 'layout/theme.liquid'), 'utf8');
  layout = layout.replace("{% sections 'header-group' %}", await renderGroup('header-group', g)).replace("{% sections 'footer-group' %}", await renderGroup('footer-group', g)).replace("{% section 'tc-carrito' %}", await renderSection('tc-carrito', {}, g)).replace('{{ content_for_header }}', '').replace('{{ content_for_layout }}', '___BODY___');
  let html = await engine.parseAndRender(layout, g, { globals: g });
  html = html.replace('___BODY___', body).replace(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>/, '');
  html = html.replace(`<script src="file://${T}/assets/tc.js" defer></script>`, `<script>${fs.readFileSync(path.join(T, 'assets/tc.js'), 'utf8').replace(/<\/script/g, '<\\/script')}</script>`.replace('<script>', '<script defer src="data:text/javascript;base64,' + Buffer.from(fs.readFileSync(path.join(T, 'assets/tc.js'))).toString('base64') + '"></script><!--') + '-->');
  fs.writeFileSync(path.join(OUT, file), html);
  return html;
}
(async () => {
  await page('product.json', cartEmpty, 'product.html');
  await page('product.json', cartFull, 'product-cart.html');
  await page('index.json', cartEmpty, 'index.html');
  await page('collection.json', cartEmpty, 'collection.html').catch(e => console.log('collection:', e.message));
  console.log('ok');
})().catch(e => { console.error('RENDER ERROR', e.message); process.exit(1); });
