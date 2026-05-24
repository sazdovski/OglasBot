import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    res.send(json);
  } catch (err) {
    res.status(502).send(String(err));
  }
}
