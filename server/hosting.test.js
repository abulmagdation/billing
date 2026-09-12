const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { mountWebsite } = require('./hosting');

test('production website, SPA routes, assets and API isolation', async () => {
  const app = express();
  app.get('/api/test', (_req, res) => res.json({ working: true }));
  mountWebsite(app);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const root = await fetch(base);
    assert.equal(root.status, 200);
    assert.equal(root.headers.get('cache-control'), 'no-cache');
    const html = await root.text();
    assert.match(html, /<div id="root"/);
    const asset = html.match(/src="([^"]+\.js)"/)[1];
    const js = await fetch(base + asset);
    assert.equal(js.status, 200);
    assert.match(js.headers.get('cache-control'), /immutable/);
    assert.equal((await fetch(base + '/patients/example')).status, 200);
    assert.deepEqual(await (await fetch(base + '/api/test')).json(), { working: true });
    assert.equal((await fetch(base + '/api/missing')).status, 404);
    assert.equal((await fetch(base + '/assets/missing.js')).status, 404);
    assert.equal((await fetch(base + '/.env')).status, 404);
    assert.deepEqual(await (await fetch(base + '/healthz')).json(), { status: 'ok' });
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
