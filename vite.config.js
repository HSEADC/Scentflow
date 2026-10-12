import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, 'src')
const outDir = path.resolve(__dirname, 'docs')

const commonChunks = ['/javascripts/allStyles.js', '/javascripts/index.js']

const pages = {
  main: { file: 'index.html', chunks: commonChunks },
  concept: { file: 'pages/concept.html', chunks: commonChunks },
  plug: { file: 'pages/plug.html', chunks: commonChunks },
  tool_search: { file: 'pages/tool_search.html', chunks: commonChunks },
  articles_all: { file: 'pages/articles_all.html', chunks: commonChunks },
  aroma: { file: 'pages/articles_all/aroma.html', chunks: commonChunks },
  articles: { file: 'pages/articles_all/articles.html', chunks: commonChunks },
  compilations: { file: 'pages/articles_all/compilations.html', chunks: commonChunks },
  guides: { file: 'pages/articles_all/guides.html', chunks: commonChunks },
  trends: { file: 'pages/articles_all/trends.html', chunks: commonChunks }
}

const chunksByFile = Object.fromEntries(
  Object.values(pages).map(({ file, chunks }) => [file, chunks])
)

function pageChunksPlugin() {
  return {
    name: 'page-chunks',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const relFile = path
          .relative(root, ctx.filename)
          .split(path.sep)
          .join('/')
        const chunks = chunksByFile[relFile]
        if (!chunks) return html

        return {
          html,
          tags: chunks.map((src) => ({
            tag: 'script',
            attrs: { type: 'module', src },
            injectTo: 'body'
          }))
        }
      }
    }
  }
}

export default defineConfig(({ command }) => ({
  root,
  base: command === 'build' ? '/Scentflow/' : '/',
  plugins: [pageChunksPlugin()],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(pages).map(([name, { file }]) => [
          name,
          path.resolve(root, file)
        ])
      )
    }
  },
  server: {
    open: true
  }
}))
