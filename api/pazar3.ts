import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const qs = req.url?.includes('?') ? req.url.split('?')[1] : '';
  const target = `https://www.pazar3.mk/Search/AjaxSearch?${qs}`;
  try {
    const upstream = await fetch(target, {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    const json = await upstream.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(json);
  } catch (err) {
    res.statusCode = 502;
    res.end(String(err));
  }
}
