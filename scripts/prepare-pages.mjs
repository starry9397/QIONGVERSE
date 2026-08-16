import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const base = (process.env.VITE_BASE_PATH || '/').trim() === '/'
  ? '/'
  : `/${String(process.env.VITE_BASE_PATH).trim().replace(/^\/+|\/+$/g, '')}/`

if (base === '/') process.exit(0)

const textExtensions = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.webmanifest'])
const rootAssetPattern = /(["'`(= :]|url\()\/(assets|shellsong|luoyin)(?=\/|["'`)])/g

async function visit(directory) {
  for (const name of await readdir(directory)) {
    const file = join(directory, name)
    const info = await stat(file)
    if (info.isDirectory()) {
      await visit(file)
      continue
    }
    if (!textExtensions.has(extname(name).toLowerCase())) continue
    const source = await readFile(file, 'utf8')
    const rewritten = source.replace(rootAssetPattern, `$1${base}$2`)
    if (rewritten !== source) await writeFile(file, rewritten)
  }
}

await visit(dist)
console.log(`Prepared GitHub Pages assets with base ${base}`)
