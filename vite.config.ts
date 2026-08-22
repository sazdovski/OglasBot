import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

function searchProxyPlugin(): Plugin {
  return {
    name: 'search-proxy',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        '/api/search',
        async (req: IncomingMessage, res: ServerResponse) => {
          const qs = req.url?.includes('?') ? req.url.split('?')[1] : ''
          const target = `https://reklama5.mk/Search?${qs}`
          try {
            const upstream = await fetch(target, {
              headers: { Accept: 'text/html,application/xhtml+xml' },
            })
            const html = await upstream.text()
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(html)
          } catch (err) {
            res.statusCode = 502
            res.end(String(err))
          }
        }
      )
      server.middlewares.use(
        '/api/pazar3',
        async (req: IncomingMessage, res: ServerResponse) => {
          const qs = req.url?.includes('?') ? req.url.split('?')[1] : ''
          const target = `https://www.pazar3.mk/Search/AjaxSearch?${qs}`
          try {
            const upstream = await fetch(target, {
              headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
              },
            })
            const json = await upstream.text()
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(json)
          } catch (err) {
            res.statusCode = 502
            res.end(String(err))
          }
        }
      )
      server.middlewares.use(
        '/api/itmk',
        async (req: IncomingMessage, res: ServerResponse) => {
          const requestUrl = new URL(req.url ?? '/', 'http://localhost')
          const page = Math.max(1, Number.parseInt(requestUrl.searchParams.get('page') ?? '1', 10) || 1)
          const target = `https://forum.it.mk/oglasnik/categories/prodavam.1/${page > 1 ? `?page=${page}` : ''}`
          try {
            const upstream = await fetch(target, {
              headers: {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'mk,en-US;q=0.9,en;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
                Referer: 'https://forum.it.mk/oglasnik/categories/prodavam.1/',
              },
            })
            if (!upstream.ok) {
              res.statusCode = upstream.status
              res.end(`Upstream error: ${upstream.status}`)
              return
            }
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(await upstream.text())
          } catch (err) {
            res.statusCode = 502
            res.end(String(err))
          }
        }
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), searchProxyPlugin()],
})
