import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const qs = req.url?.includes('?') ? req.url.split('?')[1] : '';
  const target = `https://reklama5.mk/Search?${qs}`;
  try {
    const upstream = await fetch(target, {
      headers: { Accept: 'text/html,application/xhtml+xml' },
    });
    const html = await upstream.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
  } catch (err) {
    res.statusCode = 502;
    res.end(String(err));
  }
}
