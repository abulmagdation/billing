const express = require('express');
const path = require('node:path');

function mountWebsite(app, dist = path.join(__dirname, '../website/dist')) {
  app.disable('x-powered-by');
  // Unknown API routes must never return the React HTML fallback.
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));
  app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
  app.use(express.static(dist, {
    index: false,
    setHeaders(res, filePath) {
      res.setHeader('Cache-Control', filePath.includes(`${path.sep}assets${path.sep}`)
        ? 'public, max-age=31536000, immutable' : 'no-cache');
    },
  }));
  // Express 5 requires a named wildcard. Skip missing files, including JS assets.
  app.get('/{*route}', (req, res, next) => {
    if (req.path.split('/').some(part => part.startsWith('.')) || path.extname(req.path) || !req.accepts('html')) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(dist, 'index.html'));
  });
}

module.exports = { mountWebsite };
