export const config = { runtime: 'edge' };

const HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'mk,en-US;q=0.9,en;q=0.8',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
  Referer: 'https://forum.it.mk/oglasnik/categories/prodavam.1/',
};

export default async function handler(req: Request): Promise<Response> {
  const page = Math.max(1, Number.parseInt(new URL(req.url).searchParams.get('page') ?? '1', 10) || 1);
  const target = `https://forum.it.mk/oglasnik/categories/prodavam.1/${page > 1 ? `?page=${page}` : ''}`;
  try {
    const upstream = await fetch(target, { headers: HEADERS });
    if (!upstream.ok) return new Response(`Upstream error: ${upstream.status}`, { status: upstream.status });
    return new Response(await upstream.text(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (err) {
    return new Response(String(err), { status: 502 });
  }
}
