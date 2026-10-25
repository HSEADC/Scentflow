import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { defineConfig } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))
function htmlPages(directory) {
  const pages = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) pages.push(...htmlPages(file))
    else if (entry.name.endsWith('.html')) pages.push(file)
  }
  return pages
}

export default defineConfig({
  root,
  base: './',
  optimizeDeps: { noDiscovery: true },
  plugins: [{
    name: 'missing-page',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url || '/', 'http://localhost').pathname
        const isPage = req.headers.accept?.includes('text/html')
        const isHtmlPath = !path.extname(pathname) || pathname.endsWith('.html')
        if (!isPage || !isHtmlPath || pathname === '/' ||
            existsSync(path.resolve(root, '.' + pathname))) return next()
        try {
          let html = readFileSync(path.join(root, '404.html'), 'utf8')
          // Чтобы ссылки на странице 404 работали и для вложенных адресов.
          html = html.replace('<head>', '<head><base href="/" />')
          html = await server.transformIndexHtml('/404.html', html)
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(html)
        } catch (error) {
          next(error)
        }
      })
    }
  }],
  build: {
    rollupOptions: {
      input: [path.join(root, 'index.html'), path.join(root, '404.html'), ...htmlPages(path.join(root, 'pages'))]
    }
  },
  server: { open: true, port: 5173, strictPort: true }
})
