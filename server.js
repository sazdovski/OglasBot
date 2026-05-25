import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const BROWSER_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'mk,en-US;q=0.9,en;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Referer: 'https://reklama5.mk/',
  'Upgrade-Insecure-Requests': '1',
};

// Proxy: /api/search → reklama5.mk (HTML scrape)
app.get('/api/search', async (req, res) => {
  const qs = req.originalUrl.includes('?') ? req.originalUrl.split('?')[1] : '';
  const target = `https://reklama5.mk/Search?${qs}`;
  try {
    const homeRes = await fetch('https://reklama5.mk/', { headers: BROWSER_HEADERS });
    const setCookie = homeRes.headers.get('set-cookie') ?? '';
    const cookieValue = setCookie.split(';')[0];

    const upstream = await fetch(target, {
      headers: {
        ...BROWSER_HEADERS,
        ...(cookieValue ? { Cookie: cookieValue } : {}),
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send(`Upstream error: ${upstream.status} ${upstream.statusText}`);
    }

    const html = await upstream.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(502).send(String(err));
  }
});

// Proxy: /api/pazar3 → pazar3.mk (JSON API)
app.get('/api/pazar3', async (req, res) => {
  const qs = req.originalUrl.includes('?') ? req.originalUrl.split('?')[1] : '';
  const target = `https://www.pazar3.mk/Search/AjaxSearch?${qs}`;
  try {
    const upstream = await fetch(target, {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send(`Upstream error: ${upstream.status} ${upstream.statusText}`);
    }

    const json = await upstream.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(json);
  } catch (err) {
    res.status(502).send(String(err));
  }
});

// Serve static files from dist/
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`OglasBot running on http://0.0.0.0:${PORT}`);
});
