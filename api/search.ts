import type { VercelRequest, VercelResponse } from '@vercel/node';

const BROWSER_HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'mk,en-US;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Referer': 'https://reklama5.mk/',
  'Origin': 'https://reklama5.mk',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const qs = req.url?.includes('?') ? req.url.split('?')[1] : '';
  const target = `https://reklama5.mk/Search?${qs}`;
  try {
    // Step 1: hit the homepage to obtain a session cookie
    const homeRes = await fetch('https://reklama5.mk/', { headers: BROWSER_HEADERS });
    const setCookie = homeRes.headers.get('set-cookie') ?? '';
    const cookieValue = setCookie.split(';')[0];

    // Step 2: use the session cookie on the actual search request
    const upstream = await fetch(target, {
      headers: {
        ...BROWSER_HEADERS,
        ...(cookieValue ? { Cookie: cookieValue } : {}),
      },
    });
    if (!upstream.ok) {
      res.status(upstream.status).send(`Upstream error: ${upstream.status} ${upstream.statusText}`);
      return;
    }
    const html = await upstream.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(502).send(String(err));
  }
}

