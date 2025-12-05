// Simple Node.js proxy for Codeforces API (CORS solution)
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Proxy endpoint: /api/*
app.get('/api/*', async (req, res) => {
  const codeforcesUrl = 'https://codeforces.com/' + req.params[0] + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
  try {
    const response = await fetch(codeforcesUrl);
    const data = await response.text();
    res.set('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
