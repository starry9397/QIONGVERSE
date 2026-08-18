import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const locales = ['en', 'zh', 'id', 'ja', 'ko', 'ru', 'ar']
const staticSevenLanguageFiles = [
  'knowledge/luoyin-offline-knowledge.json',
  'knowledge/source-desk.json',
]
const hydratedKnowledgeFiles = [
  ['knowledge/travel-atlas.json', 'src/components/TravelAtlas.tsx'],
]
const strictLocaleModules = [
  'src/components/TravelAtlas.tsx',
  'src/components/TropicalImmersiveHall.tsx',
  'src/components/LiMiaoImmersiveHall.tsx',
  'src/components/AerospaceImmersiveHall.tsx',
  'src/components/HualiImmersiveHall.tsx',
  'src/components/VillageImmersiveHall.tsx',
  'src/components/FreeTradePortImmersiveHall.tsx',
  'src/components/LuoyinTidePage.tsx',
  'src/components/ShellSongModel.tsx',
]
const runtimeModules = [
  'src/App.tsx',
  'src/components/TravelAtlas.tsx',
  'src/components/TradePage.tsx',
  'src/components/TropicalImmersiveHall.tsx',
  'src/components/LiMiaoImmersiveHall.tsx',
  'src/components/AerospaceImmersiveHall.tsx',
  'src/components/HualiImmersiveHall.tsx',
  'src/components/VillageImmersiveHall.tsx',
  'src/components/FreeTradePortImmersiveHall.tsx',
  'src/components/LuoyinTidePage.tsx',
  'src/components/ShellSongModel.tsx',
  'src/tropical-data.ts',
  'src/limiao-data.ts',
  'src/aerospace-data.ts',
  'src/huali-data.ts',
  'src/village-data.ts',
  'src/luoyin-tour.ts',
]

const failures = []

function checkTree(value, label) {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkTree(item, `${label}[${index}]`))
    return
  }
  const record = value
  if (typeof record.en === 'string' || typeof record.zh === 'string') {
    const missing = locales.filter((locale) => typeof record[locale] !== 'string' || !record[locale].trim())
    if (missing.length) failures.push(`${label}: missing ${missing.join(', ')}`)
  }
  for (const [key, child] of Object.entries(record)) checkTree(child, `${label}.${key}`)
}

for (const file of staticSevenLanguageFiles) {
  try {
    checkTree(JSON.parse(readFileSync(resolve(root, file), 'utf8')), file)
  } catch (error) {
    failures.push(`${file}: ${error instanceof Error ? error.message : 'cannot parse JSON'}`)
  }
}

for (const [knowledgeFile, consumer] of hydratedKnowledgeFiles) {
  try {
    const knowledge = JSON.parse(readFileSync(resolve(root, knowledgeFile), 'utf8'))
    checkTree(knowledge, knowledgeFile)
    const source = readFileSync(resolve(root, consumer), 'utf8')
    if (!source.includes('completeLocalizationTree(') || !source.includes('assertLocalizationTree(')) {
      failures.push(`${consumer}: ${knowledgeFile} must be completed and asserted before rendering`)
    }
  } catch (error) {
    failures.push(`${knowledgeFile}: ${error instanceof Error ? error.message : 'cannot parse JSON'}`)
  }
}

for (const file of strictLocaleModules) {
  const source = readFileSync(resolve(root, file), 'utf8')
  if (/language\s*!==?\s*['"](?:en|zh)['"]|language\s*===\s*['"](?:en|zh)['"]/.test(source)) {
    failures.push(`${file}: direct English/Chinese locale branching is forbidden; use a complete localized record`)
  }
}

for (const file of runtimeModules) {
  const source = readFileSync(resolve(root, file), 'utf8')
  if (!source.includes('assertLocalizationTree(')) failures.push(`${file}: runtime localization assertion is required`)
  if (/translateProjectText\([^,]+,\s*language\s*\)/.test(source)) failures.push(`${file}: translateProjectText must receive an authored Chinese peer`)
}

const sourceDeskConsumer = readFileSync(resolve(root, 'src/App.tsx'), 'utf8')
if (sourceDeskConsumer.includes('completeLocalizationTree(sourceDeskEntries)')) {
  failures.push('src/App.tsx: source desk must not be completed at runtime')
}

const i18nSource = readFileSync(resolve(root, 'src/i18n.ts'), 'utf8')
if (i18nSource.includes('return english\n}')) failures.push('src/i18n.ts: English fallback is forbidden for non-English locales')

if (failures.length) {
  console.error('Runtime localization check failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`Runtime localization check passed: ${staticSevenLanguageFiles.length} static seven-language knowledge file, ${hydratedKnowledgeFiles.length} guarded knowledge inputs, and ${runtimeModules.length} runtime modules.`)
