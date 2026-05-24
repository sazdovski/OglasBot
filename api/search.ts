import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const qs = req.url?.includes('?') ? req.url.split('?')[1] : '';
  const target = `https://reklama5.mk/Search?${qs}`;
  try {
    const upstream = await fetch(target, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://reklama5.mk/',
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
