import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
const failures = []

function fail(message) {
  failures.push(message)
  console.error(`FAIL ${message}`)
}

function pass(message) {
  console.log(`PASS ${message}`)
}

if (!existsSync(dist) || !statSync(dist).isDirectory()) {
  fail('dist directory is missing; run npm run build:webify first')
} else {
  const indexPath = join(dist, 'index.html')
  if (!existsSync(indexPath)) fail('dist/index.html is missing')
  else {
    const html = readFileSync(indexPath, 'utf8')
    if (html.includes('%PUBLIC_SITE_URL%')) fail('index.html contains an unresolved public URL placeholder')
    else pass('index.html has no unresolved public URL placeholder')
    if (/(GLM_API_KEY|OPENAI_API_KEY|client_secret|access_token|Bearer\s+[A-Za-z0-9._-]{16,})/i.test(html)) fail('index.html contains a likely secret or bearer token')
    else pass('index.html contains no likely server secret')
  }

  const files = []
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) walk(path)
      else files.push(path)
    }
  }
  walk(dist)
  if (!files.length) fail('dist contains no files')
  else pass(`dist contains ${files.length} deployable files`)

  let suspicious = 0
  for (const file of files) {
    const size = statSync(file).size
    if (size > 60 * 1024 * 1024) {
      fail(`${relative(root, file)} exceeds the Webify single-file safety threshold`)
      continue
    }
    if (!/\.(?:html|js|css|json|map|txt|svg|xml)$/i.test(file)) continue
    const text = readFileSync(file, 'utf8')
    if (/(GLM_API_KEY|OPENAI_API_KEY|client_secret|access_token|Authorization:\s*Bearer\s+[A-Za-z0-9._-]{16,})/i.test(text)) {
      suspicious += 1
      fail(`${relative(root, file)} contains a likely secret or authorization token`)
    }
  }
  if (!suspicious) pass('text assets contain no likely secrets or authorization tokens')
}

if (failures.length) {
  console.error(`\n${failures.length} Webify build check(s) failed.`)
  process.exit(1)
}

console.log('\nWebify build checks passed.')
