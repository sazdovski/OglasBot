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
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), searchProxyPlugin()],
})
