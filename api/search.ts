export const config = { runtime: 'edge' };

const BROWSER_HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'mk,en-US;q=0.9,en;q=0.8',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Referer': 'https://reklama5.mk/',
  'Upgrade-Insecure-Requests': '1',
};

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  const target = `https://reklama5.mk/Search?${qs}`;
  try {
    // Get session cookie from homepage first
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
      return new Response(`Upstream error: ${upstream.status} ${upstream.statusText}`, { status: upstream.status });
    }
    const html = await upstream.text();
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    return new Response(String(err), { status: 502 });
  }
}


