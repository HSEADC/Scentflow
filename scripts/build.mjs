import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { Script } from 'node:vm'
import postcss from 'postcss'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Собираем файлы папки, включая вложенные папки.
function getFiles(directory) {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...getFiles(file))
    else files.push(file)
  }
  return files
}

function checkLink(file, reference) {
  if (!reference || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) return
  const local = decodeURIComponent(reference.split(/[?#]/)[0])
  const target = local.startsWith('/') ? path.join(root, local) : path.resolve(path.dirname(file), local)
  if (!existsSync(target)) throw new Error(`Нет файла: ${path.relative(root, file)} → ${reference}`)
}

const pages = [path.join(root, 'index.html'), path.join(root, '404.html'), ...getFiles(path.join(root, 'pages'))]
for (const file of pages) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(/(?:src|href)="([^"]+)"/g)) checkLink(file, match[1])
}
for (const file of getFiles(path.join(root, 'javascripts'))) {
  if (file.endsWith('.js')) new Script(readFileSync(file, 'utf8'), { filename: file })
}
for (const file of getFiles(path.join(root, 'Stylesheets'))) {
  if (!file.endsWith('.css')) continue
  const source = readFileSync(file, 'utf8')
  postcss.parse(source, { from: file })
  for (const match of source.matchAll(/url\(\s*['"]?([^'"\s)]+)/g)) checkLink(file, match[1])
}
console.log(`Готово: ${pages.length} страниц, JavaScript, CSS и локальные ссылки проверены.`)
