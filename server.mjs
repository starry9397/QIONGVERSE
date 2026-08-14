import http from 'node:http'
import { readFileSync } from 'node:fs'

const port = Number(process.env.LUOYIN_SERVER_PORT || 8787)
const host = process.env.LUOYIN_SERVER_HOST || '127.0.0.1'
const upstreamUrl = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const model = 'GLM-4.6V-Flash'
const maxBodyBytes = 8 * 1024
const requests = new Map()
const leadIntents = new Set(['culture-collaboration', 'responsible-travel', 'craft-material', 'media-partnership', 'free-trade-port'])
const acceptedLeadReferences = new Map()
let upstreamRequestCount = 0
const selfTestMode = process.argv.includes('--self-test') || process.env.LUOYIN_SELF_TEST === '1'
const allowedOrigins = new Set((process.env.LUOYIN_ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter((origin) => origin.startsWith('https://') || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')))
const trustProxy = process.env.LUOYIN_TRUST_PROXY === '1'

function glmConfigured() {
  return !selfTestMode && typeof process.env.GLM_API_KEY === 'string' && process.env.GLM_API_KEY.trim().length > 0
}

function loadSourceRegistry() {
  try {
    const raw = JSON.parse(readFileSync(new URL('./knowledge/source-registry.json', import.meta.url), 'utf8'))
    const records = Array.isArray(raw?.records) ? raw.records : []
    return records.filter((record) => typeof record?.id === 'string' && typeof record?.sourceClass === 'string' && typeof record?.status === 'string' && typeof record?.publisher === 'string' && typeof record?.checkedAt === 'string' && Array.isArray(record?.zoneIds) && Array.isArray(record?.topicTags) && typeof record?.title?.en === 'string' && typeof record?.title?.zh === 'string' && typeof record?.scope?.en === 'string' && typeof record?.scope?.zh === 'string' && typeof record?.permittedUse === 'string' && (record.canonicalUrl === null || (typeof record.canonicalUrl === 'string' && record.canonicalUrl.startsWith('https://'))))
  } catch {
    return []
  }
}

const sourceRecords = loadSourceRegistry()

function isBilingualText(value) {
  return typeof value?.en === 'string' && typeof value?.zh === 'string'
}

function loadSourceDesk() {
  try {
    const raw = JSON.parse(readFileSync(new URL('./knowledge/source-desk.json', import.meta.url), 'utf8'))
    const entries = Array.isArray(raw?.entries) ? raw.entries : []
    return entries.filter((entry) => {
      const source = sourceRecords.find((record) => record.id === entry?.sourceRecordId)
      return typeof entry?.id === 'string'
        && typeof entry?.sourceRecordId === 'string'
        && (entry.displayKind === 'verified_source' || entry.displayKind === 'service_orientation')
        && ['reviewed', 'needs_review', 'expired', 'blocked'].includes(entry.status)
        && isBilingualText(entry.title)
        && typeof entry.publisher === 'string'
        && typeof entry.canonicalUrl === 'string'
        && entry.canonicalUrl.startsWith('https://')
        && Array.isArray(entry.topics)
        && entry.topics.every((topic) => typeof topic === 'string')
        && isBilingualText(entry.scope)
        && isBilingualText(entry.limitation)
        && entry.collaborationStatus === 'no_partnership_claim'
        && source?.sourceClass === 'verified_primary_source'
        && source.status === 'reviewed'
        && source.publisher === entry.publisher
        && source.canonicalUrl === entry.canonicalUrl
    })
  } catch {
    return []
  }
}

const sourceDeskEntries = loadSourceDesk()

function sourceDeskPayload() {
  return sourceDeskEntries.map((entry) => {
    const source = sourceRecords.find((record) => record.id === entry.sourceRecordId)
    return { ...entry, checkedAt: source?.checkedAt || null }
  })
}

function sourceForQuestion(zoneId, question) {
  const normalized = question.toLocaleLowerCase()
  return sourceRecords.find((record) => record.status === 'reviewed' && record.sourceClass === 'verified_primary_source' && record.zoneIds.includes(zoneId) && record.topicTags.some((tag) => normalized.includes(tag.toLocaleLowerCase())))
}

function sourceMetadata(record, language) {
  return { sourceLabel: record.title[language], sourceUrl: record.canonicalUrl, sourceClass: record.sourceClass, sourceStatus: record.status, sourcePublisher: record.publisher, sourceCheckedAt: record.checkedAt }
}

function leadReference() {
  const reference = `QVG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  acceptedLeadReferences.set(reference, Date.now())
  return reference
}

function simulationReference() {
  return `SIM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

function validateSimulationHandoff(body) {
  const allowed = new Set(['sourceId', 'intentId', 'language', 'consent'])
  if (!body || typeof body !== 'object' || Object.keys(body).some((key) => !allowed.has(key))) return 'unknown_field'
  const sourceId = typeof body.sourceId === 'string' ? body.sourceId.trim() : ''
  const intentId = typeof body.intentId === 'string' ? body.intentId.trim() : ''
  if (!sourceDeskEntries.some((entry) => entry.id === sourceId && entry.status === 'reviewed')) return 'invalid_source'
  if (!leadIntents.has(intentId)) return 'invalid_intent'
  if (body.language !== 'en' && body.language !== 'zh') return 'invalid_language'
  if (body.consent !== true) return 'consent_required'
  return null
}

function validateLead(body) {
  const allowed = new Set(['intentId', 'email', 'message', 'name', 'organization', 'consent', 'language'])
  if (Object.keys(body).some((key) => !allowed.has(key))) return 'unknown_field'
  const intentId = typeof body.intentId === 'string' ? body.intentId.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const organization = typeof body.organization === 'string' ? body.organization.trim() : ''
  if (!leadIntents.has(intentId)) return 'invalid_intent'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return 'invalid_email'
  if (!message) return 'empty_message'
  if (message.length > 1200) return 'message_too_long'
  if (name.length > 120 || organization.length > 160) return 'field_too_long'
  if (body.consent !== true) return 'consent_required'
  return null
}

const zones = {
  tropical: {
    title: 'Tropical Coast',
    sourceLabel: 'Supplied project asset / 项目提供素材',
    context: 'A supplied visual archive about a tropical shoreline, mangrove shadows, salt air, and the slow rhythm of an island edge.',
    mock: { en: 'I can hear the shoreline changing. Start with the coast, then follow the light.', zh: '我听见海岸正在变化。先从海边出发，再沿着光走。' },
  },
  lijin: {
    title: 'Li & Miao Heritage',
    sourceLabel: 'Supplied project asset / 项目提供素材',
    context: 'A supplied visual archive about Li brocade as color, geometry, touch, and continuing making. Avoid unsupported historical claims.',
    mock: { en: 'This pattern is not a decoration to rush past. Let us look at its structure first, then ask what has been carried through it.', zh: '这不是一眼掠过的装饰。让我们先看它的结构，再问它承载了什么。' },
  },
  huali: {
    title: 'Dongfang Rosewood',
    sourceLabel: 'Supplied project asset / 项目提供素材',
    context: 'A supplied visual archive about grain, carving, and material intelligence. ShellSong around it is fictional world-building, not history.',
    mock: { en: 'Quiet here. The wood remembers through its grain. The ShellSong story around it is a fictional layer, not a historical claim.', zh: '这里需要安静。木头通过纹理记忆。围绕它的螺音故事是虚构叙事，不是历史断言。' },
  },
  village: {
    title: 'Beautiful Villages',
    sourceLabel: 'Supplied project asset / 项目提供素材',
    context: 'A supplied visual archive about volcanic stone, fields, pathways, and everyday gestures. Do not invent a named village, visitor metric, or testimonial.',
    mock: { en: 'A village is not a backdrop. Listen for the small routines that make a place feel held.', zh: '乡村不是背景。听一听那些让地方被好好守护的日常。' },
  },
}

function corsHeadersForOrigin(origin) {
  if (typeof origin !== 'string' || !allowedOrigins.has(origin)) return {}
  return {
    'access-control-allow-origin': origin,
    vary: 'Origin',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '600',
  }
}

function setCorsHeaders(req, res) {
  const headers = corsHeadersForOrigin(req.headers.origin)
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value)
}

function clientKey(req, category = 'guide') {
  const forwarded = trustProxy && typeof req.headers['x-forwarded-for'] === 'string'
    ? req.headers['x-forwarded-for'].split(',')[0].trim()
    : ''
  return `${category}:${forwarded || req.socket.remoteAddress || 'local'}`
}

function json(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(value))
}

function reviewedSource(id) {
  return sourceRecords.find((record) => record.id === id && record.status === 'reviewed' && record.sourceClass === 'verified_primary_source') || null
}

function hasAny(normalized, patterns) {
  return patterns.some((pattern) => pattern.test(normalized))
}

function localResponse(zone, language, question, reason = 'mock') {
  const normalized = question.toLocaleLowerCase()
  const chinese = language === 'zh'
  const sourceLabels = {
    local: chinese ? '\u672c\u5730\u8bed\u5883\u5bfc\u89c8' : 'Local contextual guide',
    offline: chinese ? '\u672c\u5730\u8bed\u5883\u5bfc\u89c8 / \u8fde\u63a5\u56de\u9000' : 'Local contextual guide / connection fallback',
    ai: chinese ? 'AI \u5efa\u8bae\uff0c\u672a\u68c0\u7d22\u5230\u5df2\u6838\u9a8c\u6765\u6e90' : 'AI suggestion; no reviewed source retrieved',
  }
  let source = null
  let answer = chinese
    ? '\u4f60\u53ef\u4ee5\u4ece\u5f53\u524d\u5c55\u533a\u7684\u753b\u9762\u5f00\u59cb\uff1a\u89c2\u5bdf\u6750\u6599\u3001\u5149\u7ebf\u548c\u573a\u6240\u4e4b\u95f4\u7684\u5173\u7cfb\u3002\u5982\u679c\u4f60\u544a\u8bc9\u6211\u60f3\u4e86\u89e3\u6d77\u5cb8\u3001\u7ec7\u9020\u3001\u82b1\u68a8\u6216\u4e61\u6751\uff0c\u6211\u4f1a\u4ece\u76f8\u5e94\u7684\u5c55\u533a\u7ee7\u7eed\u5bfc\u89c8\u3002'
    : `You are in ${zone.title}. Start with the material, light, and spatial rhythm in front of you. Ask me about the coast, textile practice, rosewood, or village life and I will continue from the relevant room.`

  if (hasAny(normalized, [/\b(hello|hi|hey|who are you)\b/i, /\u4f60\u597d|\u4f60\u662f\u8c01|\u55e8/iu])) {
    answer = chinese
      ? '\u4f60\u597d\uff0c\u6211\u662f\u87ba\u97f3\uff0cHAINAN QIONGVERSE \u7684\u865a\u6784\u6570\u5b57\u5bfc\u89c8\u5458\u3002\u4f60\u53ef\u4ee5\u8ba9\u6211\u4ece\u5f53\u524d\u5c55\u533a\u3001\u4e00\u79cd\u6750\u6599\u6216\u4e00\u4e2a\u95ee\u9898\u5f00\u59cb\u3002'
      : 'Hello, I am Luoyin, the fictional digital guide for HAINAN QIONGVERSE. Ask me to begin with this room, a material, or a question you want to carry through the archive.'
  } else if (hasAny(normalized, [/\b(aerospace|spaceflight|rocket|satellite|space program|launch)\b/i, /\u822a\u5929|\u592a\u7a7a|\u706b\u7bad|\u536b\u661f/iu])) {
    answer = chinese
      ? '\u53ef\u4ee5\u8ba8\u8bba\u822a\u5929\u4e3b\u9898\u3002\u4f46\u5f53\u524d\u56db\u57df\u5c55\u5385\u6ca1\u6709\u5df2\u6838\u9a8c\u7684\u822a\u5929\u6765\u6e90\uff0c\u56e0\u6b64\u8fd9\u662f AI \u5bfc\u89c8\u5efa\u8bae\uff0c\u4e0d\u66ff\u4ee3\u5b98\u65b9\u53d1\u5e03\u3001\u6280\u672f\u8d44\u6599\u6216\u653f\u7b56\u4fe1\u606f\u3002\u4f60\u53ef\u4ee5\u95ee\u4e00\u4e2a\u66f4\u5177\u4f53\u7684\u901a\u8bc6\u95ee\u9898\u3002'
      : 'We can discuss aerospace. This four-zone archive has no reviewed aerospace source, so I can only offer general AI orientation here, not an official, technical, or policy conclusion. Ask a more specific general question to continue.'
  } else if (hasAny(normalized, [/\b(free trade port|ftp|customs|tax|investment|visa|policy|business)\b/i, /\u81ea\u8d38\u6e2f|\u653f\u7b56|\u6d77\u5173|\u7a0e|\u6295\u8d44|\u5546\u52a1|\u7b7e\u8bc1/iu])) {
    source = reviewedSource('hainan-free-trade-port-english-portal')
    answer = chinese
      ? '\u81ea\u8d38\u6e2f\u76f8\u5173\u95ee\u9898\u6700\u597d\u4ece\u6d77\u5357\u81ea\u7531\u8d38\u6613\u6e2f\u82f1\u6587\u5b98\u65b9\u95e8\u6237\u5f00\u59cb\u6838\u9a8c\u5f53\u524d\u516c\u5f00\u901a\u77e5\u3002\u5b83\u53ef\u7528\u4e8e\u67e5\u627e\u4fe1\u606f\uff0c\u4e0d\u7528\u4e8e\u786e\u8ba4\u4e2a\u4eba\u8d44\u683c\u3001\u7a0e\u52a1\u5f85\u9047\u3001\u901a\u5173\u3001\u7b7e\u8bc1\u6216\u6295\u8d44\u7ed3\u679c\u3002'
      : 'For Free Trade Port questions, begin with the Hainan Free Trade Port official English portal and check the current public notice that matches your situation. It is an orientation source, not a decision on eligibility, tax treatment, customs, visas, or investment approval.'
  } else if (zone.id === 'lijin' || hasAny(normalized, [/\b(li|miao|brocade|textile|weav|spin|dye|embroider|heritage)\b/i, /\u9ece|\u82d7|\u9ece\u9526|\u7eba\u7ec7|\u7eba\u7eb1|\u67d3\u8272|\u523a\u7ee3|\u975e\u9057/iu])) {
    source = reviewedSource('unesco-li-traditional-textile-techniques')
    answer = chinese
      ? '\u5728\u9ece\u82d7\u6587\u5316\u5c55\u533a\uff0c\u53ef\u4ee5\u5148\u4ece\u8272\u5f69\u3001\u51e0\u4f55\u4e0e\u624b\u611f\u53bb\u89c2\u5bdf\u7ec7\u7269\u3002UNESCO \u9875\u9762\u53ef\u4f5c\u4e3a\u9ece\u65cf\u4f20\u7edf\u7eba\u7ec7\u6280\u827a\u7684\u5165\u95e8\uff0c\u4f46\u4e0d\u8db3\u4ee5\u5224\u65ad\u5177\u4f53\u4f5c\u54c1\u7684\u771f\u4f2a\u3001\u4ef7\u683c\u6216\u5728\u5730\u4f9b\u5e94\u3002'
      : 'In the Li and Miao room, begin with color, geometry, and touch rather than treating pattern as decoration. The UNESCO page is a starting point for Li traditional textile techniques, not evidence for a particular maker, object, price, or local availability.'
  } else if (zone.id === 'huali' || hasAny(normalized, [/\b(rosewood|wood|grain|carv|material)\b/i, /\u82b1\u68a8|\u6728|\u6728\u7eb9|\u96d5\u523b|\u6750\u6599/iu])) {
    answer = chinese
      ? '\u8fdb\u5165\u82b1\u68a8\u5c55\u533a\u65f6\uff0c\u53ef\u4ee5\u770b\u7eb9\u7406\u5982\u4f55\u7ec4\u7ec7\u5149\u7ebf\u3001\u8fb9\u7f18\u4e0e\u89e6\u611f\u3002\u56f4\u7ed5\u87ba\u97f3\u7684\u53d9\u4e8b\u662f\u865a\u6784\u5bfc\u89c8\u5c42\uff0c\u4e0d\u662f\u5173\u4e8e\u6728\u6750\u5386\u53f2\u6216\u6750\u6599\u9274\u5b9a\u7684\u4e8b\u5b9e\u65ad\u8a00\u3002'
      : 'In the rosewood room, follow how grain, edge, carving, and reflected light change the object as you move. The ShellSong narrative around it is fictional guide material, not a historical claim or a material-authentication opinion.'
  } else if (zone.id === 'village' || hasAny(normalized, [/\b(village|rural|stone|field|pathway|community)\b/i, /\u4e61\u6751|\u6751|\u77f3|\u7530\u91ce|\u8def\u5f84/iu])) {
    answer = chinese
      ? '\u4e61\u6751\u5c55\u533a\u4e0d\u628a\u5730\u65b9\u53ea\u770b\u6210\u98ce\u666f\u3002\u4f60\u53ef\u4ee5\u4ece\u77f3\u6750\u3001\u7530\u91ce\u3001\u8def\u5f84\u4e0e\u65e5\u5e38\u52a8\u4f5c\u7684\u5173\u7cfb\u53bb\u7406\u89e3\u8fd9\u4e2a\u7a7a\u95f4\u3002\u5f53\u524d\u6863\u6848\u6ca1\u6709\u4e3a\u5177\u4f53\u6751\u5e84\u6216\u65c5\u6e38\u6570\u636e\u4f5c\u51fa\u58f0\u660e\u3002'
      : 'The village room does not treat place as scenery alone. Look at how stone, fields, paths, and small routines hold a lived environment together. This archive does not make claims about a named village or visitor data.'
  } else if (zone.id === 'tropical' || hasAny(normalized, [/\b(coast|shore|sea|tide|mangrove|beach)\b/i, /\u6d77\u5cb8|\u6d77\u6d0b|\u6f6e|\u7ea2\u6811\u6797|\u6c99\u6ee9/iu])) {
    answer = chinese
      ? '\u5728\u70ed\u5e26\u6d77\u5cb8\u5c55\u533a\uff0c\u8bd5\u7740\u6ce8\u610f\u6f6e\u6c50\u7ebf\u3001\u5149\u7ebf\u4e0e\u6d77\u5cb8\u8fb9\u7f18\u7684\u8282\u594f\u3002\u8fd9\u662f\u9879\u76ee\u63d0\u4f9b\u7684\u89c6\u89c9\u5bfc\u89c8\uff0c\u4e0d\u5bf9\u5177\u4f53\u751f\u6001\u6570\u636e\u6216\u666f\u70b9\u670d\u52a1\u4f5c\u51fa\u65ad\u8a00\u3002'
      : 'In the tropical coast room, notice the tide line, light, and the slow rhythm at the island edge. This is supplied visual orientation, not a claim about ecological measurements or a specific tourism service.'
  }

  const fallback = reason === 'fallback'
  return {
    answer,
    layer: source ? 'reviewed_source_orientation' : 'local_contextual_guide',
    ...(source ? sourceMetadata(source, language) : { sourceLabel: fallback ? sourceLabels.offline : sourceLabels.local, sourceUrl: null, sourceClass: 'local_contextual_guide', sourceStatus: 'local' }),
    handoff: false,
    mode: fallback ? 'fallback' : 'local',
  }
}

function systemPrompt(zone, language, source) {
  return [
    'You are Luoyin (螺音), a calm bilingual guide inside HAINAN∞QIONGVERSE.',
    `Answer in ${language === 'zh' ? 'Simplified Chinese' : 'English'} only.`,
    'Use only the supplied project context below plus clearly labeled ShellSong fiction.',
    'You may answer broad questions about policy, pricing, travel, business, culture, aerospace, spaceflight, and general knowledge when useful. Aerospace is an allowed open conversation topic, not an existing fifth exhibition zone or a reviewed source domain.',
    'For current or regulated facts, state uncertainty clearly and recommend checking an official or primary source. Never invent a number, endorsement, partnership, legal conclusion, visa guarantee, price, inventory, order, review, visitor metric, or commercial result.',
    'Keep the answer under 120 words, name whether it is supplied reality, ShellSong fiction, or an AI suggestion, and do not invent citations.',
    `Current zone: ${zone.title}. Context: ${zone.context}`,
    source ? `Reviewed source: ${source.publisher}; ${source.title[language]}; ${source.canonicalUrl}. Use it only within this scope: ${source.scope[language]}` : 'No reviewed source is supplied. Do not imply a factual source exists.',
  ].join('\n')
}

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let size = 0
    let body = ''
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > maxBodyBytes) {
        reject(Object.assign(new Error('body_too_large'), { statusCode: 413 }))
        req.destroy()
        return
      }
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

async function upstreamResponse(zone, language, question) {
  upstreamRequestCount += 1
  const source = sourceForQuestion(zone.id, question)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 9000)
  try {
    const response = await fetch(upstreamUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: { authorization: `Bearer ${process.env.GLM_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model, temperature: 0.4, max_tokens: 220, messages: [{ role: 'system', content: systemPrompt(zone, language, source) }, { role: 'user', content: question }] }),
    })
    if (!response.ok) throw new Error(`upstream_${response.status}`)
    const data = await response.json()
    const answer = data?.choices?.[0]?.message?.content?.trim()
    if (!answer) throw new Error('upstream_empty')
    return { answer, layer: source ? 'verified_primary_source' : 'ai_suggestion', ...(source ? sourceMetadata(source, language) : { sourceLabel: language === 'zh' ? 'AI 建议，未检索到已核验来源' : 'AI suggestion; no verified source retrieved', sourceUrl: null, sourceClass: 'ai_suggestion', sourceStatus: 'needs_review', sourcePublisher: null, sourceCheckedAt: null }), handoff: false, mode: 'glm' }
  } finally {
    clearTimeout(timeout)
  }
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (req.method === 'GET' && req.url === '/api/luoyin/status') {
    return json(res, 200, { model, mode: glmConfigured() ? 'glm_configured' : 'local_fallback', upstreamConfigured: glmConfigured() })
  }
  if (req.method === 'GET' && req.url === '/api/source-desk') {
    return json(res, 200, { entries: sourceDeskPayload(), mode: 'reviewed_source_directory' })
  }
  if (req.method === 'POST' && req.url === '/api/operations/handoff') {
    try {
      const body = JSON.parse(await readBody(req))
      const validationError = validateSimulationHandoff(body)
      if (validationError) return json(res, 400, { accepted: false, mode: 'simulation', error: validationError })
      return json(res, 200, { accepted: true, mode: 'simulation', reference: simulationReference(), sourceId: body.sourceId })
    } catch (error) {
      return json(res, error.statusCode || 503, { accepted: false, mode: 'simulation', error: error.statusCode === 413 ? 'body_too_large' : 'handoff_unavailable' })
    }
  }
  if (req.method === 'POST' && req.url === '/api/leads') {
    const ip = clientKey(req, 'lead')
    const now = Date.now()
    const recent = (requests.get(ip) || []).filter((stamp) => now - stamp < 60_000)
    if (recent.length >= 5) return json(res, 429, { accepted: false, error: 'rate_limited' })
    recent.push(now)
    requests.set(ip, recent)
    try {
      const body = JSON.parse(await readBody(req))
      const validationError = validateLead(body)
      if (validationError) return json(res, 400, { accepted: false, error: validationError })
      const reference = leadReference()
      return json(res, 200, { accepted: true, reference, intentId: body.intentId, mode: 'memory_mvp' })
    } catch (error) {
      return json(res, error.statusCode || 503, { accepted: false, error: error.statusCode === 413 ? 'body_too_large' : 'lead_unavailable' })
    }
  }
  if (req.method !== 'POST' || req.url !== '/api/luoyin') return json(res, 404, { error: 'not_found' })
  const ip = clientKey(req)
  const now = Date.now()
  const recent = (requests.get(ip) || []).filter((stamp) => now - stamp < 60_000)
  if (recent.length >= 20) return json(res, 429, { error: 'rate_limited' })
  recent.push(now)
  requests.set(ip, recent)

  let responseLanguage = 'en'
  let responseZone = zones.tropical
  try {
    const body = JSON.parse(await readBody(req))
    const question = typeof body.question === 'string' ? body.question.trim() : ''
    const language = body.language === 'zh' ? 'zh' : 'en'
    const zone = zones[body.zoneId]
    responseLanguage = language
    responseZone = zone || zones.tropical
    if (!question) return json(res, 400, { error: 'empty_question', ...localResponse(zones.tropical, language, '', 'mock') })
    if (!zone) return json(res, 400, { error: 'unsupported_zone', ...localResponse(zones.tropical, language, question, 'mock') })
    if (question.length > 500) return json(res, 413, { error: 'question_too_long', ...localResponse(zone, language, question.slice(0, 500), 'mock') })
    const result = glmConfigured() ? await upstreamResponse(zone, language, question) : localResponse(zone, language, question, 'mock')
    if (result.mode === 'glm') {
      const source = sourceForQuestion(body.zoneId, question)
      Object.assign(result, source ? { ...sourceMetadata(source, language), layer: 'verified_primary_source' } : { sourceLabel: language === 'zh' ? 'AI 建议，未检索到已核验来源' : 'AI suggestion; no verified source retrieved', sourceUrl: null, sourceClass: 'ai_suggestion', sourceStatus: 'needs_review', sourcePublisher: null, sourceCheckedAt: null, layer: 'ai_suggestion' })
    }
    return json(res, 200, { ...result, zoneId: body.zoneId })
  } catch (error) {
    const status = error.statusCode || 200
    const reason = error.name === 'AbortError' ? 'upstream_timeout' : 'service_unavailable'
    return json(res, status, {
      error: reason,
      ...localResponse(responseZone, responseLanguage, 'offline', 'fallback'),
    })
  }
})

function requestJson(url, body) {
  return fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(async (response) => ({ status: response.status, body: await response.json() }))
}

function requestGet(url) {
  return fetch(url).then(async (response) => ({ status: response.status, body: await response.json() }))
}

async function runSelfTest() {
  const testPort = Number(process.env.LUOYIN_SELF_TEST_PORT || 0)
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(testPort, '127.0.0.1', resolve)
  })
  const address = server.address()
  const baseUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : testPort}`
  const checks = []
  let listenerClosed = false
  const check = (name, condition) => {
    checks.push({ name, passed: Boolean(condition) })
  }
  try {
    check('CORS has no wildcard policy by default', Object.keys(corsHeadersForOrigin('https://untrusted.example')).length === 0)
    const configuredOrigin = [...allowedOrigins][0]
    if (configuredOrigin) {
      const headers = corsHeadersForOrigin(configuredOrigin)
      check('configured CORS origin is allowed exactly', headers['access-control-allow-origin'] === configuredOrigin && headers.vary === 'Origin')
      check('unconfigured CORS origin is rejected', Object.keys(corsHeadersForOrigin('https://untrusted.example')).length === 0)
    }
    const desk = await requestGet(`${baseUrl}/api/source-desk`)
    const deskEntries = Array.isArray(desk.body.entries) ? desk.body.entries : []
    check('reviewed UNESCO source can be displayed', desk.status === 200 && deskEntries.some((entry) => entry.id === 'unesco-li-textile-source-desk' && entry.status === 'reviewed' && entry.publisher === 'UNESCO Intangible Cultural Heritage'))
    check('reviewed Free Trade Port source can be displayed', desk.status === 200 && deskEntries.some((entry) => entry.id === 'hainan-free-trade-port-source-desk' && entry.status === 'reviewed' && entry.canonicalUrl === 'https://en.hnftp.gov.cn/'))
    const guideStatus = await requestGet(`${baseUrl}/api/luoyin/status`)
    check('guide status does not expose a secret', guideStatus.status === 200 && guideStatus.body.model === 'GLM-4.6V-Flash' && guideStatus.body.upstreamConfigured === false && !Object.hasOwn(guideStatus.body, 'apiKey'))
    const normal = await requestJson(`${baseUrl}/api/luoyin`, { question: 'What can I explore in this exhibition?', language: 'en', zoneId: 'tropical' })
    check('english normal question', normal.status === 200 && typeof normal.body.answer === 'string' && normal.body.answer.length > 0)
    const policyBasic = await requestJson(`${baseUrl}/api/luoyin`, { question: 'What should I verify on the Free Trade Port official portal before planning a business visit?', language: 'en', zoneId: 'tropical' })
    check('english policy question', policyBasic.status === 200 && typeof policyBasic.body.answer === 'string' && policyBasic.body.answer.length > 0)
    const culture = await requestJson(`${baseUrl}/api/luoyin`, { question: '黎锦相关内容应以什么来源为准？', language: 'zh', zoneId: 'lijin' })
    check('chinese culture question', culture.status === 200 && typeof culture.body.answer === 'string' && culture.body.answer.length > 0)
    const greeting = await requestJson(`${baseUrl}/api/luoyin`, { question: 'Hello', language: 'en', zoneId: 'tropical' })
    const policy = await requestJson(`${baseUrl}/api/luoyin`, { question: 'What should I verify on the Free Trade Port official portal before planning a business visit?', language: 'en', zoneId: 'tropical' })
    const heritage = await requestJson(`${baseUrl}/api/luoyin`, { question: 'How is Li textile verified?', language: 'en', zoneId: 'lijin' })
    check('contextual local replies are not identical', greeting.status === 200 && policy.status === 200 && heritage.status === 200 && greeting.body.answer !== policy.body.answer && policy.body.answer !== heritage.body.answer)
    check('policy orientation uses the reviewed official source', policy.body.sourceClass === 'verified_primary_source' && policy.body.sourceUrl === 'https://en.hnftp.gov.cn/')
    check('heritage orientation uses the reviewed UNESCO source', heritage.body.sourceClass === 'verified_primary_source' && heritage.body.sourceUrl?.startsWith('https://ich.unesco.org/'))
    const aerospace = await requestJson(`${baseUrl}/api/luoyin`, { question: 'Can Luoyin discuss aerospace and spaceflight?', language: 'en', zoneId: 'tropical' })
    check('english aerospace question gets contextual guidance', aerospace.status === 200 && aerospace.body.mode === 'local' && aerospace.body.sourceClass === 'local_contextual_guide' && aerospace.body.sourceUrl === null && /aerospace/i.test(aerospace.body.answer))
    const chineseAerospace = await requestJson(`${baseUrl}/api/luoyin`, { question: '螺音可以讨论航天吗？', language: 'zh', zoneId: 'tropical' })
    check('chinese aerospace question gets contextual guidance', chineseAerospace.status === 200 && chineseAerospace.body.mode === 'local' && chineseAerospace.body.sourceClass === 'local_contextual_guide' && chineseAerospace.body.sourceUrl === null && typeof chineseAerospace.body.answer === 'string' && chineseAerospace.body.answer.length > 0)
    const upstreamBeforeLead = upstreamRequestCount
    const validLead = await requestJson(`${baseUrl}/api/leads`, { intentId: 'culture-collaboration', email: 'visitor@example.com', message: 'I would like to discuss a cultural collaboration.', consent: true, language: 'en' })
    check('valid lead accepted in memory', validLead.status === 200 && validLead.body.accepted === true && typeof validLead.body.reference === 'string')
    check('lead route does not call GLM', upstreamRequestCount === upstreamBeforeLead)
    const invalidLead = await requestJson(`${baseUrl}/api/leads`, { intentId: 'culture-collaboration', email: 'bad', message: 'Follow up', consent: false, language: 'en' })
    check('invalid lead rejected', invalidLead.status === 400 && invalidLead.body.accepted === false && typeof invalidLead.body.error === 'string')
    const noConsent = await requestJson(`${baseUrl}/api/operations/handoff`, { sourceId: 'unesco-li-textile-source-desk', intentId: 'culture-collaboration', language: 'en', consent: false })
    check('simulation without consent rejected', noConsent.status === 400 && noConsent.body.accepted === false && noConsent.body.error === 'consent_required')
    const invalidSource = await requestJson(`${baseUrl}/api/operations/handoff`, { sourceId: 'source-not-reviewed', intentId: 'culture-collaboration', language: 'en', consent: true })
    check('unreviewed source simulation rejected', invalidSource.status === 400 && invalidSource.body.accepted === false && invalidSource.body.error === 'invalid_source')
    const validSimulation = await requestJson(`${baseUrl}/api/operations/handoff`, { sourceId: 'hainan-free-trade-port-source-desk', intentId: 'free-trade-port', language: 'en', consent: true })
    check('valid simulation returns local reference', validSimulation.status === 200 && validSimulation.body.accepted === true && validSimulation.body.mode === 'simulation' && typeof validSimulation.body.reference === 'string' && validSimulation.body.sourceId === 'hainan-free-trade-port-source-desk')
    const chineseSimulation = await requestJson(`${baseUrl}/api/operations/handoff`, { sourceId: 'unesco-li-textile-source-desk', intentId: 'culture-collaboration', language: 'zh', consent: true })
    check('english and chinese simulation response structure matches', chineseSimulation.status === 200 && Object.keys(chineseSimulation.body).sort().join(',') === Object.keys(validSimulation.body).sort().join(','))
  } finally {
    await new Promise((resolve) => server.close(resolve))
    listenerClosed = !server.listening
  }
  check('self-test listener closes automatically', listenerClosed)
  const failed = checks.filter((item) => !item.passed)
  for (const item of checks) console.log(`${item.passed ? 'PASS' : 'FAIL'} ${item.name}`)
  if (failed.length) {
    console.error(`Self-test failed: ${failed.length} check(s)`)
    process.exitCode = 1
  } else {
    console.log('Self-test passed: HTTP routes, fallback/GLM response shape, and lead validation are working.')
  }
}

if (selfTestMode) {
  runSelfTest().catch((error) => {
    console.error(`Self-test failed: ${error instanceof Error ? error.message : 'unknown error'}`)
    process.exitCode = 1
  })
} else {
  server.listen(port, host, () => console.log(`Luoyin guide server listening on http://${host}:${port}`))
}
