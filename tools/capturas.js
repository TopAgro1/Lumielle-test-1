const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ }).catch(() => chromium.launch({ executablePath: process.env.CHROMIUM_PATH }));
  const dir = process.argv[2] || require('path').resolve(__dirname, 'vista-previa');
  const shot = async (file, w, h, name, fn, full) => {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + dir + '/' + file); await p.waitForTimeout(600);
    if (fn) await fn(p);
    await p.screenshot({ path: dir + '/' + name + '.png', fullPage: !!full });
    if (errs.length) console.log(name, 'ERRORES:', errs.filter(e => !/net::ERR|Failed to load/.test(e)).join(' | '));
    await p.close();
  };
  await shot('product.html', 390, 844, 'm-product-fold');
  await shot('product.html', 390, 844, 'm-product-full', null, true);
  await shot('product.html', 1280, 860, 'd-product-fold');
  await shot('product-cart.html', 390, 844, 'm-cart', async p => { await p.click('[data-tc-cart-open]'); await p.waitForTimeout(700); });
  await shot('product-cart.html', 1280, 860, 'd-cart', async p => { await p.click('[data-tc-cart-open]'); await p.waitForTimeout(700); });
  await shot('index.html', 390, 844, 'm-index-full', null, true);
  await shot('index.html', 1280, 860, 'd-index-fold');
  await shot('collection.html', 1280, 860, 'd-collection');
  await b.close(); console.log('shots ok');
})();
