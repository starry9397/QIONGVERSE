import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const base = (process.env.VITE_BASE_PATH || '/').trim() === '/'
  ? '/'
  : `/${String(process.env.VITE_BASE_PATH).trim().replace(/^\/+|\/+$/g, '')}/`

const textExtensions = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.webmanifest'])
const rootAssetPattern = /(["'`(= :]|url\()\/(assets|shellsong|luoyin|draco)(?=\/|["'`)])/g
const pagesFileLimit = 24 * 1024 * 1024
const removedLargeAssets = []

async function visit(directory) {
  for (const name of await readdir(directory)) {
    const file = join(directory, name)
    const info = await stat(file)
    if (info.isDirectory()) {
      await visit(file)
      continue
    }
    // Cloudflare Pages rejects any individual asset at 25 MiB or larger.
    // Keep the source media in Git, but omit optional immersive media from
    // the static deployment; the UI already exposes poster/static fallbacks.
    if (info.size > pagesFileLimit) {
      removedLargeAssets.push({ file: file.slice(dist.length + 1), size: info.size })
      await rm(file)
      continue
    }
    if (!textExtensions.has(extname(name).toLowerCase())) continue
    const source = await readFile(file, 'utf8')
    const rewritten = source.replace(rootAssetPattern, `$1${base}$2`)
    if (rewritten !== source) await writeFile(file, rewritten)
  }
}

await visit(dist)
if (removedLargeAssets.length > 0) {
  for (const asset of removedLargeAssets) {
    console.log(`Omitted ${asset.file} (${(asset.size / 1024 / 1024).toFixed(1)} MiB) from Pages output; static fallback remains available.`)
  }
}
console.log(`Prepared static deployment assets with base ${base}`)
