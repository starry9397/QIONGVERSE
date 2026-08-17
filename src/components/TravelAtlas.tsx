import { useEffect, useMemo, useRef, useState } from 'react'
import type { Language } from '../data'
import { assertLocalizationTree, completeLocalizationTree, inline, localize, type Localized } from '../i18n'
import atlasRaw from '../../knowledge/travel-atlas.json'
import BrandLockup from './BrandLockup'
import LanguageSelector from './LanguageSelector'
import './travel-atlas.css'

type Theme = 'coast' | 'culture' | 'village' | 'nature' | 'city'
type Pace = 'slow' | 'balanced' | 'deep'
type Bilingual = Localized
type AtlasStop = { id: string; themes: string[]; sourceId: string; title: Bilingual; summary: Bilingual; note: Bilingual; asset: string }
type AtlasSource = { id: string; classification: 'project_supplied_visual_context' | 'reviewed_primary_source'; title: Bilingual; publisher: string; checkedAt: string; canonicalUrl: string | null; scope: Bilingual; limitation: Bilingual }
type AtlasData = { themes: Theme[]; paces: Pace[]; stops: AtlasStop[] }
type PlannerMode = 'local_fallback' | 'ai_curated'
type SourceFilter = 'all' | 'reviewed_primary_source' | 'project_supplied_visual_context' | 'ai'

const atlas = atlasRaw as AtlasData
completeLocalizationTree(atlas)
assertLocalizationTree(atlas, 'travel atlas')
const sourceEntries: AtlasSource[] = [
  { id: 'project-supplied-six-hall-archive', classification: 'project_supplied_visual_context', title: { en: 'Supplied island image archive', zh: '项目提供的海岛影像档案' }, publisher: 'HAINAN QIONGVERSE project team', checkedAt: '2026-08-15', canonicalUrl: null, scope: { en: 'Project-provided visual context for the Hainan Unfolded travel column.', zh: '为 Hainan Unfolded 旅行专栏提供的项目视觉语境。' }, limitation: { en: 'It does not verify a named destination, route, service, or current condition.', zh: '不核验具体目的地、路线、服务或当前状况。' } },
  { id: 'unesco-li-traditional-textile-techniques', classification: 'reviewed_primary_source', title: { en: 'Li traditional textile techniques', zh: '黎族传统纺织技艺' }, publisher: 'UNESCO Intangible Cultural Heritage', checkedAt: '2026-08-16', canonicalUrl: 'https://ich.unesco.org/en/RL/traditional-textile-techniques-of-the-li-ethnic-group-spinning-dyeing-weaving-and-embroidering-00238', scope: { en: 'Orientation to the UNESCO-listed page on Li traditional textile techniques.', zh: '介绍 UNESCO 列载的黎族传统纺织技艺页面。' }, limitation: { en: 'It does not verify individual makers, products, prices, or availability.', zh: '不核验个体传承人、产品、价格或可得性。' } },
  { id: 'hainan-free-trade-port-english-portal', classification: 'reviewed_primary_source', title: { en: 'Hainan Free Trade Port official English portal', zh: '海南自由贸易港英文官方门户' }, publisher: 'Hainan Free Trade Port official English portal', checkedAt: '2026-08-14', canonicalUrl: 'https://en.hnftp.gov.cn/', scope: { en: 'A starting point for current public Free Trade Port notices and policy materials.', zh: '核查海南自由贸易港当前公开通知和政策资料的入口。' }, limitation: { en: 'It does not determine individual eligibility, tax, customs, visa, or commercial outcomes.', zh: '不用于确认个人资格、税务、海关、签证或商业结果。' } },
  { id: 'hainan-government-international-portal', classification: 'reviewed_primary_source', title: { en: 'Hainan provincial international portal', zh: '海南省国际门户' }, publisher: "Hainan Provincial People's Government international portal", checkedAt: '2026-08-15', canonicalUrl: 'https://en.hainan.gov.cn/', scope: { en: 'A public English-language entry point for current Hainan Province materials.', zh: '用于查阅海南省当前公开资料的英文入口。' }, limitation: { en: 'It is an orientation link, not a travel booking, schedule, or service decision.', zh: '这是信息导览链接，不构成旅行预订、时刻或服务判断。' } },
  { id: 'cnsa-english-portal', classification: 'reviewed_primary_source', title: { en: 'China National Space Administration English portal', zh: '中国国家航天局英文门户' }, publisher: 'China National Space Administration', checkedAt: '2026-08-14', canonicalUrl: 'https://www.cnsa.gov.cn/english/', scope: { en: 'A public entry point for aerospace information published by the national space administration.', zh: '查阅国家航天局公开航天信息的入口。' }, limitation: { en: 'It does not verify the project visual archive or make a current operational claim.', zh: '它不核验本项目的视觉档案，也不构成当前运行声明。' } },
]
completeLocalizationTree(sourceEntries)
assertLocalizationTree(sourceEntries, 'travel source entries')
const sourceById = new Map(sourceEntries.map((source) => [source.id, source]))
const unescoTextileSource = sourceById.get('unesco-li-traditional-textile-techniques')
const themeCopy: Record<Theme, Bilingual> = { coast: { en: 'Coast', zh: '海岸' }, culture: { en: 'Culture', zh: '文化' }, village: { en: 'Village', zh: '乡村' }, nature: { en: 'Nature', zh: '自然' }, city: { en: 'City rhythm', zh: '城市节奏' } }
const paceCopy: Record<Pace, Bilingual> = { slow: { en: 'Slow looking', zh: '慢行细看' }, balanced: { en: 'Balanced tide', zh: '平衡节奏' }, deep: { en: 'Deep dive', zh: '深度探索' } }

const indexEntries: Array<{ id: string; number: string; theme: Bilingual; title: Bilingual; copy: Bilingual; asset: string; sourceId: string }> = [
  { id: 'waterline', number: '01', theme: { en: 'WATERLINE', zh: '海岸线' }, title: { en: 'A coast measured by light.', zh: '用光线丈量海岸。' }, copy: { en: 'Begin with the changing edge between salt air, shade, and open water.', zh: '从盐雾、树影与开阔水面交界的地方开始。' }, asset: '/assets/3d/tropical/tropical-island-reference.png', sourceId: 'project-supplied-six-hall-archive' },
  { id: 'canopy', number: '02', theme: { en: 'CANOPY', zh: '热带雨林' }, title: { en: 'A greener interior.', zh: '更葱茏的岛屿腹地。' }, copy: { en: 'Look inland for a slower rhythm of palms, paths, and humid green.', zh: '向岛屿腹地走去，看棕榈、路径与湿润绿意构成的慢节奏。' }, asset: '/assets/exhibits/tropical/canopy-path.png', sourceId: 'project-supplied-six-hall-archive' },
  { id: 'thread', number: '03', theme: { en: 'THREAD', zh: '纹理' }, title: { en: 'Culture, carried by hand.', zh: '被双手延续的文化。' }, copy: { en: 'Let colour, pattern, and close looking lead the cultural chapter.', zh: '让色彩、纹样与细致观看带领文化章节。' }, asset: '/assets/3d/limiao/黎苗展厅参考图.png', sourceId: 'unesco-li-traditional-textile-techniques' },
  { id: 'horizon', number: '04', theme: { en: 'HORIZON', zh: '航天海岸' }, title: { en: 'A horizon that looks outward.', zh: '向外眺望的海岸。' }, copy: { en: 'A visual pause for the aerospace-facing horizon of the island and its public sources.', zh: '停下来，观看这座岛屿面向航天的地平线与公共信息入口。' }, asset: '/assets/3d/aerospace/文昌航天展厅参考图.png', sourceId: 'cnsa-english-portal' },
  { id: 'rhythm', number: '05', theme: { en: 'RHYTHM', zh: '乡野节奏' }, title: { en: 'Stone, field, everyday.', zh: '石头、田野与日常。' }, copy: { en: 'Move at the pace of paths, seasonal colour, and held landscapes.', zh: '沿着路径、季节色彩与被悉心守护的风景慢慢前行。' }, asset: '/assets/3d/countryside/美丽乡村参考图.png', sourceId: 'project-supplied-six-hall-archive' },
  { id: 'exchange', number: '06', theme: { en: 'EXCHANGE', zh: '海港交换' }, title: { en: 'An island in exchange.', zh: '一座与世界交换的岛。' }, copy: { en: 'A visual index of ports, public information, and an outward-looking coastline.', zh: '以港口、公共信息与面向世界的海岸为索引。' }, asset: '/assets/user-media2/zimaogang-pictures/port-connection.jpg', sourceId: 'hainan-free-trade-port-english-portal' },
]
const indexStudies: Array<{ id: string; title: Bilingual; label: Bilingual; asset: string }> = [
  { id: 'water-study', title: { en: 'A living map of Hainan.', zh: '一座正在生长的海南地图。' }, label: { en: 'HAINAN PROVINCE / MAP STUDY', zh: '海南省 / 地图观察' }, asset: '/assets/user-media2/interactive-map-overview/海南岛浮空微缩地图.png' },
  { id: 'table-study', title: { en: 'Island table', zh: '海岛餐桌' }, label: { en: 'PROJECT VISUAL CONTEXT', zh: '项目视觉语境' }, asset: '/assets/exhibits/tropical/tropical-table.png' },
]
const fieldNotes: Array<{ id: string; label: Bilingual; asset: string }> = [
  { id: 'shore', label: { en: 'SHORE REST', zh: '海岸停留' }, asset: '/assets/exhibits/tropical/shore-rest.png' },
  { id: 'table', label: { en: 'ISLAND TABLE', zh: '海岛餐桌' }, asset: '/assets/exhibits/tropical/tropical-table.png' },
  { id: 'waterplay', label: { en: 'WATERLINE', zh: '水岸边界' }, asset: '/assets/exhibits/tropical/waterline-play.png' },
  { id: 'tide', label: { en: 'TIDE ATLAS', zh: '潮汐图谱' }, asset: '/assets/3d/products/village/product-village-002-poster.webp' },
  { id: 'thread', label: { en: 'THREAD STUDY', zh: '织线观察' }, asset: '/assets/3d/products/lijin/product-lijin-002-poster.webp' },
  { id: 'port', label: { en: 'PORT STUDY', zh: '港口观察' }, asset: '/assets/3d/zimaogang/zimaogang.jpg' },
]
const deskEntries: Array<{ id: string; number: string; title: Bilingual; copy: Bilingual; sourceId: string; asset: string }> = [
  { id: 'before', number: 'A', title: { en: 'Before you go', zh: '出发之前' }, copy: { en: 'Start with the provincial international portal for current public visitor materials.', zh: '从海南省国际门户开始查阅当前公开访客资料。' }, sourceId: 'hainan-government-international-portal', asset: '/assets/user-media2/zimaogang-pictures/open-exchange.jpg' },
  { id: 'while', number: 'B', title: { en: 'While you are here', zh: '抵达之后' }, copy: { en: 'Keep official public material close when a question needs a current answer.', zh: '当问题需要最新答案时，请以官方公开资料为准。' }, sourceId: 'hainan-government-international-portal', asset: '/assets/user-media2/zimaogang-pictures/bonded-logistics.jpg' },
  { id: 'port', number: 'C', title: { en: 'Free Trade Port gateway', zh: '自贸港资讯入口' }, copy: { en: 'Read the official English portal directly for notices and public policy material.', zh: '请直接阅读英文官方门户中的通知与公开政策资料。' }, sourceId: 'hainan-free-trade-port-english-portal', asset: '/assets/user-media2/zimaogang-pictures/smart-customs.jpg' },
]

function tx(language: Language, value: Bilingual) { return localize(value, language) }

function buildFallbackIds(days: number, themes: Theme[], pace: Pace) {
  const weighted = [...atlas.stops].sort((a, b) => {
    const score = (stop: AtlasStop) => stop.themes.filter((theme) => themes.includes(theme as Theme)).length + (pace === 'slow' && stop.id === 'village-rhythm' ? 1 : 0)
    return score(b) - score(a) || atlas.stops.indexOf(a) - atlas.stops.indexOf(b)
  })
  return Array.from({ length: days }, (_, index) => weighted[index % weighted.length].id)
}

function makeSignalBlob(days: number, themes: Theme[], pace: Pace, language: Language, portrait: boolean) {
  return new Promise<Blob>((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = portrait ? 1350 : 1080
    const context = canvas.getContext('2d')
    if (!context) return reject(new Error('canvas_unavailable'))
    context.fillStyle = '#071817'; context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = '#e7bb6a'; context.lineWidth = 2; context.strokeRect(52, 52, canvas.width - 104, canvas.height - 104)
    context.fillStyle = '#e7bb6a'; context.font = '26px monospace'; context.fillText('HAINAN UNFOLDED / ISLAND INDEX', 102, 128)
    context.fillStyle = '#fff5e5'; context.font = '74px Georgia'; context.fillText(language === 'en' ? 'Follow the light.' : '跟随光的方向。', 102, 278)
    context.fillStyle = '#d66f4a'; context.font = '30px monospace'; context.fillText(`${days} ${language === 'en' ? 'DAYS' : '天'}  /  ${tx(language, paceCopy[pace]).toUpperCase()}`, 102, 362)
    context.strokeStyle = '#d66f4a'; context.lineWidth = 4; context.beginPath(); context.moveTo(102, 440); context.lineTo(canvas.width - 102, 440); context.stroke()
    context.fillStyle = '#fff5e5'; context.font = '40px Georgia'; context.fillText(themes.slice(0, 3).map((theme) => tx(language, themeCopy[theme])).join('  ·  '), 102, 520)
    context.fillStyle = '#bfc9c0'; context.font = '26px Arial'; context.fillText(language === 'en' ? 'Curated from reviewed sources and project context.' : '由已审核来源与项目视觉语境共同编排。', 102, 606)
    context.fillStyle = '#e7bb6a'; context.font = '22px monospace'; context.fillText('NO PROFILE / NO TRACKING / LOCAL EXPORT', 102, canvas.height - 112)
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('canvas_failed')), 'image/png')
  })
}

type Props = { language: Language; onChangeLanguage: (language: Language) => void; onExit: () => void; apiPath: (path: string) => string }

export default function TravelAtlas({ language, onChangeLanguage, onExit, apiPath }: Props) {
  const pageTitleRef = useRef<HTMLHeadingElement>(null)
  const [days, setDays] = useState(5)
  const [themes, setThemes] = useState<Theme[]>(['coast', 'culture'])
  const [pace, setPace] = useState<Pace>('balanced')
  const [itinerary, setItinerary] = useState(() => buildFallbackIds(5, ['coast', 'culture'], 'balanced'))
  const [plannerMode, setPlannerMode] = useState<PlannerMode>('local_fallback')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('ready')
  const [notice, setNotice] = useState('')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [videoFailed, setVideoFailed] = useState(false)
  const [muted, setMuted] = useState(true)
  const [audioUnavailable, setAudioUnavailable] = useState(false)
  const [audioNotice, setAudioNotice] = useState('')
  const [videoPaused, setVideoPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const routeStops = useMemo(() => itinerary.map((id) => atlas.stops.find((stop) => stop.id === id)).filter((stop): stop is AtlasStop => Boolean(stop)), [itinerary])

  useEffect(() => {
    const video = videoRef.current
    if (!video || videoFailed) return
    if (videoPaused) { video.pause(); return }
    void video.play().catch(() => {
      setVideoPaused(true)
      setAudioNotice(language === 'en' ? 'This browser could not play the film.' : '当前浏览器无法播放影片。')
    })
  }, [language, videoFailed, videoPaused])

  const scrollTo = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - 78), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  const updateThemes = (theme: Theme) => setThemes((current) => current.includes(theme) ? (current.length === 1 ? current : current.filter((item) => item !== theme)) : [...current, theme].slice(-3))
  const toggleVideoAudio = async () => {
    const video = videoRef.current
    if (!video || videoFailed || audioUnavailable) { setAudioNotice(language === 'en' ? 'Audio is unavailable for this film.' : '此影像暂时无法提供声音。'); return }
    const nextMuted = !muted
    video.muted = nextMuted; video.defaultMuted = nextMuted
    try { await video.play(); setMuted(nextMuted); setAudioNotice(nextMuted ? (language === 'en' ? 'Film sound muted.' : '影片声音已静音。') : (language === 'en' ? 'Film sound on.' : '影片声音已开启。')) } catch { video.muted = true; setMuted(true); setAudioNotice(language === 'en' ? 'Your browser kept the film muted.' : '浏览器保持了影片静音。') }
  }
  const toggleVideoPlayback = async () => {
    const video = videoRef.current
    if (!video || videoFailed) { setAudioNotice(language === 'en' ? 'This film is unavailable.' : '此影片暂不可用。'); return }
    setAudioNotice('')
    setVideoPaused((current) => !current)
  }
  const replayVideo = async () => {
    const video = videoRef.current
    if (!video || videoFailed) { setAudioNotice(language === 'en' ? 'This film is unavailable.' : '此影片暂不可用。'); return }
    video.currentTime = 0
    setVideoPaused(false)
    try { await video.play(); setAudioNotice('') } catch { setAudioNotice(language === 'en' ? 'This browser could not replay the film.' : '当前浏览器无法重新播放影片。') }
  }
  const buildJourney = async () => {
    setStatus('loading'); setNotice('')
    const local = buildFallbackIds(days, themes, pace)
    try {
      const response = await fetch(apiPath('/api/travel-atlas/plan'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ days, themes, pace, language }) })
      const payload = await response.json() as { mode?: PlannerMode; stopIds?: string[] }
      const valid = Array.isArray(payload.stopIds) && payload.stopIds.length === days && payload.stopIds.every((id) => atlas.stops.some((stop) => stop.id === id))
      setItinerary(valid ? payload.stopIds as string[] : local); setPlannerMode(payload.mode === 'ai_curated' && valid ? 'ai_curated' : 'local_fallback')
      setNotice(payload.mode === 'ai_curated' && valid ? (language === 'en' ? 'AI ordered only reviewed catalogue entries. No profile was created.' : 'AI 仅编排了已审核目录条目，未创建任何个人档案。') : (language === 'en' ? 'A local island route is ready. No personal data was sent.' : '本地海岛路线已准备完成，未发送个人数据。'))
      setStatus('ready')
    } catch { setItinerary(local); setPlannerMode('local_fallback'); setStatus('error'); setNotice(language === 'en' ? 'The planner is offline, so this route was arranged from the local reviewed catalogue.' : '规划服务暂不可用，已从本地审核目录编排路线。') }
  }
  const moveStop = (index: number, offset: number) => setItinerary((current) => { const target = index + offset; if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next })
  const removeStop = (index: number) => setItinerary((current) => current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : current)
  const downloadSignal = async (portrait: boolean, share = false) => {
    try {
      const blob = await makeSignalBlob(days, themes, pace, language, portrait)
      const file = new File([blob], `hainan-unfolded-${portrait ? 'story' : 'post'}.png`, { type: 'image/png' })
      if (share && navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) { await navigator.share({ title: 'Hainan Unfolded', files: [file] }); setNotice(language === 'en' ? 'Your local story card is ready to share.' : '本地旅行故事卡已准备分享。'); return }
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); URL.revokeObjectURL(url); setNotice(language === 'en' ? 'Your local route card has been downloaded.' : '本地路线卡已下载。')
    } catch { setNotice(language === 'en' ? 'The card could not be prepared on this device.' : '此设备暂无法生成路线卡。') }
  }
  const copyLink = async () => { try { await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#travel-atlas`); setNotice(language === 'en' ? 'Travel column link copied. It contains no traveller preferences.' : '旅行专栏链接已复制，不包含旅行者偏好。') } catch { setNotice(language === 'en' ? 'Copy is unavailable in this browser.' : '当前浏览器无法复制链接。') } }
  const navItem = (target: string, label: string) => <a href={'#' + target} onClick={(event) => { event.preventDefault(); scrollTo(target) }}>{label}</a>
  const audioLabel = audioUnavailable || videoFailed ? (language === 'en' ? 'Film audio unavailable' : '影片声音不可用') : muted ? (language === 'en' ? 'Turn film sound on' : '开启影片声音') : (language === 'en' ? 'Mute film sound' : '关闭影片声音')
  const playbackLabel = videoPaused ? (language === 'en' ? 'Resume film' : '继续播放影片') : (language === 'en' ? 'Pause film' : '暂停影片')
  const replayLabel = language === 'en' ? 'Replay film from the beginning' : '从头重播影片'

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => pageTitleRef.current?.focus({ preventScroll: true }))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return <main className="travel-atlas island-atlas" id="travel-atlas" data-experience-main tabIndex={-1}>
    <a className="travel-skip-link" href="#journey-compass">{language === 'en' ? 'Skip to Journey Compass' : '跳至旅程罗盘'}</a>
    <header className="island-header"><BrandLockup href="#top" /><nav aria-label={language !== 'en' ? '旅行专栏导航' : 'Travel column navigation'}>{navItem('island-index', language !== 'en' ? '图鉴' : 'Index')}{navItem('journey-compass', language !== 'en' ? '路线' : 'Routes')}{navItem('travel-desk', language !== 'en' ? '资讯台' : 'Desk')}{navItem('source-ledger', language !== 'en' ? '来源' : 'Sources')}</nav><div className="island-actions"><LanguageSelector language={language} onChange={onChangeLanguage} /><button type="button" onClick={onExit}>{language !== 'en' ? '首页' : 'Home'} <span aria-hidden="true">↗</span></button></div></header>
    <section className={'island-hero' + (videoFailed ? ' video-failed' : '')} id="island-hero" aria-label={language === 'en' ? 'Hainan Unfolded film' : '海南展开影像'}>
      <img className="island-hero-poster" src="/assets/travel/hainan-unfolded-poster.jpg" alt={language === 'en' ? 'Project film frame of a Hainan sea sunset' : '海南海上日落项目影像画面'} />
      <video ref={videoRef} className="island-hero-video" autoPlay muted={muted} loop playsInline preload="metadata" poster="/assets/travel/hainan-unfolded-poster.jpg" onError={() => { setVideoFailed(true); setAudioUnavailable(true) }} onPause={() => setVideoPaused(true)} onPlay={() => setVideoPaused(false)} onLoadedMetadata={(event) => { const media = event.currentTarget as HTMLVideoElement & { audioTracks?: { length: number } }; setAudioUnavailable(Boolean(media.audioTracks && media.audioTracks.length === 0)) }}><source src="/assets/travel/hainan-unfolded-hero-pages.mp4" type="video/mp4" /></video>
      <div className="island-hero-veil" />
      <div className="island-hero-copy"><p className="island-kicker">HAINAN UNFOLDED / 海南展开</p><h1 ref={pageTitleRef} tabIndex={-1} className="island-hero-title-sr-only">{language === 'en' ? 'Hainan Unfolded' : '海南，徐徐展开。'}</h1><button type="button" className="island-primary-action" onClick={() => scrollTo('island-index')}>{language === 'en' ? 'Open island index' : '打开海岛图鉴'} <span aria-hidden="true">↓</span></button></div>
      <div className="island-hero-tools" aria-label={language === 'en' ? 'Film controls' : '影片控制'}>
        <span className="island-tooltip" data-tooltip={playbackLabel}><button className="island-film-control" type="button" onClick={() => void toggleVideoPlayback()} aria-label={playbackLabel} aria-pressed={videoPaused} disabled={videoFailed}><span className={'island-pause-glyph' + (videoPaused ? ' is-play' : '')} aria-hidden="true"><i /><i /></span></button></span>
        <span className="island-tooltip" data-tooltip={replayLabel}><button className="island-film-control" type="button" onClick={() => void replayVideo()} aria-label={replayLabel} disabled={videoFailed}><span className="island-replay-glyph" aria-hidden="true" /></button></span>
        <span className="island-tooltip" data-tooltip={audioLabel}><button className={'island-audio-button' + (!muted ? ' sound-on' : '')} type="button" onClick={() => void toggleVideoAudio()} aria-label={audioLabel} aria-pressed={!muted} disabled={videoFailed || audioUnavailable}><span className="island-audio-glyph" aria-hidden="true"><i /><b /><b /><b /></span></button></span>
      </div>
      {audioNotice && <p className="island-audio-notice" role="status">{audioNotice}</p>}
    </section>
    <section className="island-statement" aria-label={language === 'en' ? 'Travel column introduction' : '旅行专栏介绍'}><p>{language === 'en' ? 'Not a list to rush through. A field guide for noticing how one island holds many climates, rhythms, and ways of looking.' : '这不是一份匆忙浏览的清单，而是一部观察指南：一座岛屿如何容纳多种气候、节奏与凝视方式。'}</p><span>{language === 'en' ? 'SIX DIRECTIONS / ONE ISLAND' : '六个方向 / 一座岛屿'}</span></section>
    <section className="island-index" id="island-index" aria-labelledby="index-title"><div className="island-section-head"><p className="island-kicker">02 / ISLAND INDEX</p><h2 id="index-title">{language === 'en' ? 'Six Hainans. Six ways of seeing.' : '六重海南，六种凝望。'}</h2><p>{language === 'en' ? 'Each frame is a visual invitation. Source status remains visible so that atmosphere never impersonates current travel information.' : '每一帧都是一次视觉邀请。来源状态始终可见，让氛围不替代真实旅行信息。'}</p></div><div className="island-index-grid">{indexEntries.map((entry) => { const source = sourceById.get(entry.sourceId); return <article className={'island-index-card index-' + entry.id} key={entry.id}><img src={entry.asset} alt={language === 'en' ? `Project visual context for ${entry.theme.en.toLowerCase()}` : `${entry.theme.zh}项目视觉语境`} /><div className="island-index-overlay"><span>{entry.number}</span><p>{tx(language, entry.theme)}</p></div><div className="island-index-copy"><span>{source?.classification === 'reviewed_primary_source' ? (language === 'en' ? 'REVIEWED ENTRY POINT' : '已审核入口') : (language === 'en' ? 'PROJECT VISUAL CONTEXT' : '项目视觉语境')}</span><h3>{tx(language, entry.title)}</h3><p>{tx(language, entry.copy)}</p></div></article> })}{indexStudies.map((study) => <figure className={'island-index-study study-' + study.id} key={study.id}><img src={study.asset} alt={language === 'en' ? `Project visual context: ${study.title.en.toLowerCase()}` : `项目视觉语境：${study.title.zh}`} /><figcaption><span>{tx(language, study.label)}</span><strong>{tx(language, study.title)}</strong></figcaption></figure>)}</div></section>
    <section className="island-fieldnotes" aria-label={language === 'en' ? 'Island image notes' : '海岛影像笔记'}><div className="island-fieldnotes-title"><span>{language === 'en' ? 'FIELD NOTES' : '田野笔记'}</span><p>{language === 'en' ? 'Texture / colour / tide / hand / shade / outward view' : '纹理 / 色彩 / 潮汐 / 双手 / 树影 / 向外眺望'}</p></div><div className="island-filmstrip">{fieldNotes.map((frame, index) => <figure key={frame.id} className={'film-frame frame-' + index}><img src={frame.asset} alt={language === 'en' ? `Project visual note: ${frame.label.en.toLowerCase()}` : `项目视觉笔记：${frame.label.zh}`} /><figcaption>{String(index + 1).padStart(2, '0')} / {tx(language, frame.label)}</figcaption></figure>)}</div></section>
    <section className="island-compass" id="journey-compass" aria-labelledby="compass-title"><div className="island-section-head"><p className="island-kicker">03 / JOURNEY COMPASS</p><h2 id="compass-title">{language === 'en' ? 'Set a rhythm, not a checklist.' : '设定节奏，而非列出清单。'}</h2><p>{language === 'en' ? 'Select only route preferences. They stay in this page and are never stored as a traveller profile.' : '仅选择路线偏好。它们只留在当前页面，绝不保存为旅行者档案。'}</p></div><form className="island-preferences" onSubmit={(event) => { event.preventDefault(); void buildJourney() }}><fieldset><legend>{language === 'en' ? 'Length' : '天数'}</legend><div className="island-segments">{[3, 5, 7].map((value) => <button key={value} className={days === value ? 'active' : ''} type="button" aria-pressed={days === value} onClick={() => setDays(value)}><b>{value}</b><span>{language === 'en' ? 'days' : '天'}</span></button>)}</div></fieldset><fieldset><legend>{language === 'en' ? 'Threads' : '旅行线索'}</legend><div className="island-themes">{atlas.themes.map((theme) => <label key={theme} className={themes.includes(theme) ? 'selected' : ''}><input type="checkbox" checked={themes.includes(theme)} onChange={() => updateThemes(theme)} /><span>{tx(language, themeCopy[theme])}</span></label>)}</div></fieldset><fieldset><legend>{language === 'en' ? 'Rhythm' : '旅行节奏'}</legend><div className="island-segments">{atlas.paces.map((value) => <button key={value} className={pace === value ? 'active' : ''} type="button" aria-pressed={pace === value} onClick={() => setPace(value)}><span>{tx(language, paceCopy[value])}</span></button>)}</div></fieldset><button className="island-generate" type="submit" disabled={status === 'loading'}>{status === 'loading' ? (language === 'en' ? 'Arranging your route...' : '正在编排旅程……') : (language === 'en' ? 'Arrange my route' : '编排我的旅程')} <span aria-hidden="true">↗</span></button></form><div className="island-route"><div className="island-route-head"><p>{language === 'en' ? 'YOUR ISLAND ROUTE' : '你的海岛路线'}</p><span className={plannerMode}>{plannerMode === 'ai_curated' ? (language === 'en' ? 'AI-CURATED / CATALOGUE-BOUNDED' : 'AI 编排 / 目录受限') : (language === 'en' ? 'LOCAL CURATION / REVIEWED CATALOGUE' : '本地策展 / 审核目录')}</span></div>{notice && <p className="island-notice" role="status">{notice}</p>}<div className="island-route-list">{routeStops.map((stop, index) => { const source = sourceById.get(stop.sourceId); return <article key={`${stop.id}-${index}`}><div className="island-day">{String(index + 1).padStart(2, '0')}</div><img src={stop.asset} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /><div><p>{language === 'en' ? `DAY ${index + 1}` : `第 ${index + 1} 天`} / {source?.classification === 'reviewed_primary_source' ? (language === 'en' ? 'REVIEWED SOURCE' : '已审核来源') : (language === 'en' ? 'PROJECT CONTEXT' : '项目语境')}</p><h3>{tx(language, stop.title)}</h3><p>{tx(language, stop.summary)}</p><small>{tx(language, stop.note)}</small><div className="island-stop-controls"><button type="button" disabled={index === 0} onClick={() => moveStop(index, -1)} aria-label={language === 'en' ? `Move day ${index + 1} earlier` : `将第 ${index + 1} 天前移`}>↑</button><button type="button" disabled={index === routeStops.length - 1} onClick={() => moveStop(index, 1)} aria-label={language === 'en' ? `Move day ${index + 1} later` : `将第 ${index + 1} 天后移`}>↓</button><button type="button" onClick={() => removeStop(index)} aria-label={language === 'en' ? `Remove day ${index + 1}` : `移除第 ${index + 1} 天`}>×</button></div></div></article> })}</div><p className="island-disclosure">{language === 'en' ? 'This is an interpretive cultural route, not real-time navigation, a booking tool, or a statement of availability.' : '这是一条文化解读路线，不是实时导航、预订工具或服务可用性声明。'}</p></div></section>
    <section className="island-culture" aria-labelledby="culture-title"><img src="/assets/user-media2/limiao-tapestry-01/黎锦挂轴（三幅）.png" alt={language === 'en' ? 'Project visual context showing three Li brocade wall hangings' : '展示三幅黎锦挂轴的项目视觉语境'} /><div><p className="island-kicker">04 / LIVING CULTURE</p><h2 id="culture-title">{language === 'en' ? 'Let one cultural question travel with you.' : '让一个文化问题陪你上路。'}</h2><p>{language === 'en' ? 'Li traditional textile techniques are introduced here through a reviewed UNESCO source. This column invites attention; it does not verify individual makers, retail products, or local availability.' : '本专栏通过已审核的 UNESCO 来源介绍黎族传统纺织技艺。它邀请细致了解，而不核验个体传承人、零售产品或在地可得性。'}</p>{unescoTextileSource?.canonicalUrl && <a href={unescoTextileSource.canonicalUrl} target="_blank" rel="noopener noreferrer">{language === 'en' ? 'Read the UNESCO source' : '阅读 UNESCO 来源'} <span aria-hidden="true">↗</span></a>}</div></section>
    <section className="island-desk" id="travel-desk" aria-labelledby="desk-title"><div className="island-section-head"><p className="island-kicker">05 / TRAVEL DESK</p><h2 id="desk-title">{language === 'en' ? 'Current information belongs at the source.' : '最新信息，应回到来源处核验。'}</h2><p>{language === 'en' ? 'These are public English-language starting points, not bookings, personal eligibility checks, or policy interpretations.' : '这些是英文公共信息的起点，不提供预订、个人资格判断或政策解读。'}</p></div><div className="island-desk-grid">{deskEntries.map((entry) => { const source = sourceById.get(entry.sourceId); return <article key={entry.id}><img src={entry.asset} alt={language === 'en' ? `Project visual context for ${entry.title.en.toLowerCase()}` : `${entry.title.zh}项目视觉语境`} /><div><span>{entry.number} / {language === 'en' ? 'PUBLIC ENTRY POINT' : '公共信息入口'}</span><h3>{tx(language, entry.title)}</h3><p>{tx(language, entry.copy)}</p><dl><div><dt>{language === 'en' ? 'Source' : '来源'}</dt><dd>{source?.publisher}</dd></div><div><dt>{language === 'en' ? 'Checked' : '核验日期'}</dt><dd>{source?.checkedAt}</dd></div></dl>{source?.canonicalUrl && <a href={source.canonicalUrl} target="_blank" rel="noopener noreferrer">{language === 'en' ? 'Open official source' : '打开官方来源'} <span aria-hidden="true">↗</span></a>}</div></article> })}</div></section>
    <section className="island-signal" aria-labelledby="signal-title"><div className="island-signal-card" aria-hidden="true"><p>HAINAN UNFOLDED</p><h2>{language === 'en' ? <>Follow<br />the light.</> : <>跟随<br />光的方向。</>}</h2><span>{days} {language === 'en' ? 'DAYS' : '天'} / {themes.map((theme) => tx(language, themeCopy[theme])).join(' · ')}</span></div><div><p className="island-kicker">06 / CARRY THE TIDE</p><h2 id="signal-title">{language === 'en' ? 'A route made to travel outward.' : '让路线向远方继续生长。'}</h2><p>{language === 'en' ? 'Create a local card for a story, post, or private share. It contains no profile, location, tracking data, or platform upload.' : '生成适合故事、帖子或私下分享的本地路线卡。其中不含个人档案、位置、追踪数据或平台上传。'}</p><div className="island-signal-actions"><button type="button" onClick={() => void downloadSignal(true, true)}>{language === 'en' ? 'Share story card' : '分享竖版路线卡'} <span aria-hidden="true">↗</span></button><button type="button" onClick={() => void downloadSignal(false)}>{language === 'en' ? 'Download square card' : '下载方形路线卡'} <span aria-hidden="true">↓</span></button><button type="button" onClick={() => void copyLink()}>{language === 'en' ? 'Copy travel link' : '复制旅行链接'} <span aria-hidden="true">⧉</span></button></div></div></section>
    <section className="island-ledger" id="source-ledger" aria-labelledby="ledger-title"><div className="island-section-head"><p className="island-kicker">07 / SOURCE LEDGER</p><h2 id="ledger-title">{language === 'en' ? 'A clear footing for every invitation.' : '让每一次邀请，都有清晰的依据。'}</h2><p>{language === 'en' ? 'Reviewed public sources, project visual context, and AI curation remain visibly separate.' : '已审核公共来源、项目视觉语境与 AI 编排始终清晰分开。'}</p></div><div className="island-filter" aria-label={language === 'en' ? 'Filter source types' : '筛选来源类型'}>{([{ id: 'all', en: 'All', zh: '全部' }, { id: 'reviewed_primary_source', en: 'Reviewed sources', zh: '已审核来源' }, { id: 'project_supplied_visual_context', en: 'Project context', zh: '项目语境' }, { id: 'ai', en: 'AI curation', zh: 'AI 编排' }] as const).map((item) => <button key={item.id} type="button" className={sourceFilter === item.id ? 'active' : ''} aria-pressed={sourceFilter === item.id} onClick={() => setSourceFilter(item.id)}>{language === 'en' ? item.en : item.zh}</button>)}</div><div className="island-ledger-list">{sourceEntries.filter((source) => sourceFilter === 'all' || sourceFilter === source.classification).map((source) => <details className="island-ledger-entry" key={source.id}><summary><div><p>{source.classification === 'reviewed_primary_source' ? 'REVIEWED PRIMARY SOURCE' : 'PROJECT-SUPPLIED VISUAL CONTEXT'} / {source.checkedAt}</p><h3>{tx(language, source.title)}</h3><span>{source.publisher}</span></div><b aria-hidden="true">+</b></summary><div className="island-ledger-detail"><dl><div><dt>{language === 'en' ? 'Scope' : '范围'}</dt><dd>{tx(language, source.scope)}</dd></div><div><dt>{language === 'en' ? 'Limit' : '限制'}</dt><dd>{tx(language, source.limitation)}</dd></div></dl>{source.canonicalUrl && <a href={source.canonicalUrl} target="_blank" rel="noopener noreferrer">{language === 'en' ? 'Open original source' : '打开原始来源'} <span aria-hidden="true">↗</span></a>}</div></details>)}{(sourceFilter === 'all' || sourceFilter === 'ai') && <details className="island-ledger-entry"><summary><div><p>AI SUGGESTION / NO FACTUAL AUTHORITY</p><h3>{language === 'en' ? 'Journey Compass route compiler' : '旅程罗盘路线编排器'}</h3><span>{language === 'en' ? 'HAINAN QIONGVERSE project system' : 'HAINAN QIONGVERSE 项目系统'}</span></div><b aria-hidden="true">+</b></summary><div className="island-ledger-detail"><dl><div><dt>{language === 'en' ? 'Scope' : '范围'}</dt><dd>{language === 'en' ? 'May order only approved local catalogue IDs from the visitor-selected themes and rhythm.' : '仅能依据访客选择的主题与节奏，对本地批准目录中的 ID 进行排序。'}</dd></div><div><dt>{language === 'en' ? 'Limit' : '限制'}</dt><dd>{language === 'en' ? 'Cannot generate destinations, policy conclusions, prices, bookings, navigation, schedules, or eligibility advice.' : '不得生成目的地、政策结论、价格、预订、导航、时刻或资格建议。'}</dd></div></dl></div></details>}</div></section>
    <footer className="island-footer"><span>HAINAN UNFOLDED / HAINAN PROVINCE</span><button type="button" onClick={onExit}>{language === 'en' ? 'Return to HAINAN QIONGVERSE' : '返回 HAINAN QIONGVERSE'} <span aria-hidden="true">↑</span></button></footer>
  </main>
}
