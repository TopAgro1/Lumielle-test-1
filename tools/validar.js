const { check } = require('@shopify/theme-check-node');
(async () => {
  const root = process.argv[2] || require('path').resolve(__dirname, '../tema-convertible');
  const offenses = await check(root);
  const sev = ['ERROR', 'WARNING', 'INFO'];
  const rows = offenses.map(o => `${sev[o.severity] || o.severity}\t${o.check}\t${o.uri.replace(/^.*tema-convertible\//, '')}:${o.start ? o.start.line + 1 : ''}\t${o.message}`);
  rows.sort();
  console.log(rows.join('\n'));
  const c = offenses.reduce((a, o) => { a[sev[o.severity]] = (a[sev[o.severity]] || 0) + 1; return a; }, {});
  console.log('\nTOTAL', JSON.stringify(c));
})().catch(e => { console.error('FAILED', e); process.exit(1); });
