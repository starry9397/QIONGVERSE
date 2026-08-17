import process from 'node:process'

const input = process.argv[2]
if (!input) {
  console.error('Usage: npm run verify:deployment -- https://your-domain.example')
  process.exit(2)
}

let origin
try {
  origin = new URL(input)
} catch {
  console.error('Invalid deployment URL')
  process.exit(2)
}

if (origin.protocol !== 'https:') {
  console.error('Deployment verification requires an HTTPS URL')
  process.exit(2)
}

if (/your-domain|your-public-domain|\.example$|PUBLIC_DOMAIN|localhost|127\.0\.0\.1/i.test(origin.hostname)) {
  console.error('Refusing to verify a placeholder or loopback domain')
  process.exit(2)
}

origin.pathname = '/'
origin.search = ''
origin.hash = ''

const failures = []
const check = (label, passed, detail = '') => {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}${detail ? `: ${detail}` : ''}`)
  if (!passed) failures.push(label)
}

async function request(path, options = {}) {
  try {
    return await fetch(new URL(path, origin), { redirect: 'manual', ...options })
  } catch (error) {
    check(path, false, error instanceof Error ? error.message : String(error))
    return null
  }
}

const page = await request('/')
if (page) {
  const html = await page.text()
  check('homepage status', page.status === 200, String(page.status))
  check('homepage content type', /text\/html/i.test(page.headers.get('content-type') || ''))
  check('no unresolved public URL placeholder', !html.includes('%PUBLIC_SITE_URL%'))

  const expected = `${origin.origin}/`
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || ''
  const ogUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)/i)?.[1] || ''
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1] || ''
  check('canonical uses HTTPS origin', canonical === expected, canonical || 'missing')
  check('og:url uses HTTPS origin', ogUrl === expected, ogUrl || 'missing')
  check('og:image is absolute HTTPS', /^https:\/\//i.test(ogImage), ogImage || 'missing')

  if (ogImage) {
    try {
      const image = await fetch(ogImage, { method: 'HEAD', redirect: 'manual' })
      check('og:image responds successfully', image.status >= 200 && image.status < 400, String(image.status))
      check('og:image has image MIME type', /^image\//i.test(image.headers.get('content-type') || ''), image.headers.get('content-type') || 'missing')
    } catch (error) {
      check('og:image request', false, error instanceof Error ? error.message : String(error))
    }
  }
}

for (const path of ['/api/luoyin/status', '/api/social/status']) {
  const response = await request(path)
  if (!response) continue
  const body = await response.text()
  check(`${path} status`, response.status === 200, String(response.status))
  check(`${path} JSON`, /application\/json/i.test(response.headers.get('content-type') || ''))
  check(`${path} redacts secrets`, !/(api[_-]?key|client[_-]?secret|access[_-]?token|authorization)/i.test(body))
}

if (failures.length) {
  console.error(`\n${failures.length} deployment check(s) failed.`)
  process.exit(1)
}

console.log('\nDeployment checks passed. Platform share previews still require final X/Facebook fetch validation.')
