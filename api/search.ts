import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const qs = req.url?.includes('?') ? req.url.split('?')[1] : '';
  const target = `https://reklama5.mk/Search?${qs}`;
  try {
    const upstream = await fetch(target, {
      headers: { Accept: 'text/html,application/xhtml+xml' },
    });
    const html = await upstream.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(502).send(String(err));
  }
}
