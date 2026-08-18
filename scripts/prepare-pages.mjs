import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const base = (process.env.VITE_BASE_PATH || '/').trim() === '/'
  ? '/'
  : `/${String(process.env.VITE_BASE_PATH).trim().replace(/^\/+|\/+$/g, '')}/`

const textExtensions = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.webmanifest'])
const rootAssetPattern = /(["'`(= :]|url\()\/(assets|shellsong|luoyin|draco)(?=\/|["'`)])/g
// Keep the Pages artifact small enough for reliable deployment. Large models
// and videos remain available from the repository's read-only Raw CDN.
const pagesFileLimit = 8 * 1024 * 1024
const largeMediaBase = (process.env.VITE_LARGE_MEDIA_BASE_URL || '').trim().replace(/\/+$/, '')
const removedLargeAssets = []
const allFiles = []

async function collect(directory) {
  for (const name of await readdir(directory)) {
    const file = join(directory, name)
    const info = await stat(file)
    if (info.isDirectory()) await collect(file)
    else allFiles.push({ file, info })
  }
}

await collect(dist)

for (const entry of allFiles) {
  if (entry.info.size <= pagesFileLimit) continue
  const assetPath = relative(dist, entry.file).replaceAll('\\', '/')
  removedLargeAssets.push({ file: assetPath, size: entry.info.size })
  await rm(entry.file)
}

// The Vite Pages plugin rewrites source literals before chunk hashes are
// generated. Avoid touching those absolute CDN URLs a second time here.
const largeMediaRewrites = largeMediaBase ? [] : removedLargeAssets.flatMap(({ file }) => {
  const route = `/${file}`
  const encodedRoute = `/${encodeURI(file)}`
  const target = largeMediaBase ? `${largeMediaBase}/${file}` : null
  if (!target) return []
  return encodedRoute === route
    ? [[route, target]]
    : [[route, target], [encodedRoute, `${largeMediaBase}/${encodedRoute.slice(1)}`]]
})

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

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
    let rewritten = source.replace(rootAssetPattern, `$1${base}$2`)
    for (const [from, to] of largeMediaRewrites) {
      // Match the Pages-prefixed and root forms in one pass so the inserted
      // CDN URL is never processed a second time.
      const pagesPrefixed = `${base.replace(/\/+$/, '')}${from}`
      const pattern = new RegExp(`${escapeRegExp(pagesPrefixed)}|${escapeRegExp(from)}`, 'g')
      rewritten = rewritten.replace(pattern, to)
    }
    if (rewritten !== source) await writeFile(file, rewritten)
  }
}

await visit(dist)
if (removedLargeAssets.length > 0) {
  for (const asset of removedLargeAssets) {
    const source = largeMediaBase ? `; CDN reference ${largeMediaBase}/${asset.file}` : ''
    console.log(`Omitted ${asset.file} (${(asset.size / 1024 / 1024).toFixed(1)} MiB) from Pages output${source}.`)
  }
}
console.log(`Prepared static deployment assets with base ${base}`)
