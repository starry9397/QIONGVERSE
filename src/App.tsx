import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { copy, zones } from './data'
import { assertLocalizationTree, completeLocalizationTree, inline, isLanguage, languageMeta, localize, readLanguagePreference, runtimeCopy, saveLanguagePreference, type Language, type RuntimeLocalized } from './i18n'
import BrandLockup from './components/BrandLockup'
import LanguageSelector from './components/LanguageSelector'
import LuoyinDesktopPet from './components/LuoyinDesktopPet'
import SocialShare from './components/SocialShare'
import sourceDeskData from '../knowledge/source-desk.json'
import sourceRegistryData from '../knowledge/source-registry.json'

const LiMiaoImmersiveHall = lazy(() => import('./components/LiMiaoImmersiveHall'))
const AerospaceImmersiveHall = lazy(() => import('./components/AerospaceImmersiveHall'))
const HualiImmersiveHall = lazy(() => import('./components/HualiImmersiveHall'))
const VillageImmersiveHall = lazy(() => import('./components/VillageImmersiveHall'))
const TropicalImmersiveHall = lazy(() => import('./components/TropicalImmersiveHall'))
const FreeTradePortImmersiveHall = lazy(() => import('./components/FreeTradePortImmersiveHall'))
const HainanMap = lazy(() => import('./components/HainanMap'))
const LuoyinTidePage = lazy(() => import('./components/LuoyinTidePage'))
const TravelAtlas = lazy(() => import('./components/TravelAtlas'))
const TradePage = lazy(() => import('./components/TradePage'))

type ExperienceRoute = 'luoyin-tide' | 'travel-atlas' | 'market'

function DeferredHainanMap({ language }: { language: Language }) {
  const slotRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(() => window.location.hash === '#hainan-map')

  useEffect(() => {
    if (shouldLoad) return
    const slot = slotRef.current
    if (!slot) return
    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      setShouldLoad(true)
      observer.disconnect()
    }, { rootMargin: '900px 0px' })
    observer.observe(slot)
    return () => observer.disconnect()
  }, [shouldLoad])

  return <div id={shouldLoad ? undefined : 'hainan-map'} ref={slotRef} className="hainan-map-deferred">
    {shouldLoad
      ? <Suspense fallback={<p className="hainan-map-loading" role="status">{inline(language, 'Opening the regional reading map…', '正在打开区域阅读地图……')}</p>}><HainanMap language={language} sectionId="hainan-map" /></Suspense>
      : <p className="hainan-map-loading" aria-hidden="true" />}
  </div>
}

function experienceFromHash(hash: string): ExperienceRoute | null {
  const route = hash.replace(/^#/, '').split('?')[0]
  if (route === 'luoyin-tide' || route === 'travel-atlas') return route
  return route === 'market' || route.startsWith('market/') || route === 'market-operator' ? 'market' : null
}

type SourceDeskEntry = {
  id: string
  sourceRecordId: string
  displayKind: 'verified_source' | 'service_orientation' | 'project_context' | 'ai_curation'
  status: 'reviewed' | 'needs_review' | 'expired' | 'blocked'
  title: RuntimeLocalized
  publisher: string
  canonicalUrl: string | null
  topics: string[]
  scope: RuntimeLocalized
  limitation: RuntimeLocalized
  collaborationStatus: 'no_partnership_claim'
}

type GuideMessage = {
  id: string
  role: 'visitor' | 'guide'
  text: string
  zoneTitle: string
  layer?: string
  sourceLabel?: string
  sourceUrl?: string | null
  sourceClass?: string
  sourceStatus?: string
  mode?: 'local' | 'mock' | 'glm' | 'fallback' | 'error'
}

const sourceDeskEntries = sourceDeskData.entries as SourceDeskEntry[]
completeLocalizationTree(zones)
assertLocalizationTree(zones, 'home zone records')
assertLocalizationTree(sourceDeskEntries, 'source desk entries')
const sourceCheckedAt = new Map(sourceRegistryData.records.map((record) => [record.id, record.checkedAt]))
const publicApiBaseUrl = (import.meta.env.VITE_LUOYIN_API_BASE_URL || '').trim().replace(/\/+$/, '')
const apiPath = (path: string) => `${publicApiBaseUrl}${path}`
const deliveryImage = (path: string) => path.replace(/\.(jpe?g|png)$/i, '.webp')

function App() {
  const [language, setLanguage] = useState<Language>(() => readLanguagePreference())
  const [activeZone, setActiveZone] = useState(0)
  const [guideOpen, setGuideOpen] = useState(false)
  const [petVisible, setPetVisible] = useState(true)
  const [heroImageFailed, setHeroImageFailed] = useState(false)
  const [question, setQuestion] = useState('')
  const [guideMessages, setGuideMessages] = useState<GuideMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [guideServiceMode, setGuideServiceMode] = useState<'checking' | 'glm' | 'local' | 'unavailable'>('checking')
  const [leadOpen, setLeadOpen] = useState(false)
  const [leadIntent, setLeadIntent] = useState('culture-collaboration')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadMessage, setLeadMessage] = useState('')
  const [leadName, setLeadName] = useState('')
  const [leadOrganization, setLeadOrganization] = useState('')
  const [leadConsent, setLeadConsent] = useState(false)
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [leadError, setLeadError] = useState('')
  const [leadReference, setLeadReference] = useState('')
  const [sourceDeskOpen, setSourceDeskOpen] = useState(false)
  const [sourceDeskTopic, setSourceDeskTopic] = useState('all')
  const [sourceDeskSourceId, setSourceDeskSourceId] = useState(sourceDeskEntries[0]?.id || '')
  const [sourceDeskIntent, setSourceDeskIntent] = useState('culture-collaboration')
  const [sourceDeskConsent, setSourceDeskConsent] = useState(false)
  const [sourceDeskStatus, setSourceDeskStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [sourceDeskError, setSourceDeskError] = useState('')
  const [sourceDeskReference, setSourceDeskReference] = useState('')
  const [mediaOpen, setMediaOpen] = useState(false)
  const [mediaFailed, setMediaFailed] = useState(false)
  const [previousZone, setPreviousZone] = useState<number | null>(null)
  const [carouselPointerPaused, setCarouselPointerPaused] = useState(false)
  const [carouselFocusPaused, setCarouselFocusPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [activeNav, setActiveNav] = useState(1)
  const [exhibitionMenuOpen, setExhibitionMenuOpen] = useState(false)
  const [exploreMenuOpen, setExploreMenuOpen] = useState(false)
  const [hallNotice, setHallNotice] = useState('')
  const [activeExperience, setActiveExperience] = useState<ExperienceRoute | null>(() => experienceFromHash(window.location.hash))
  const [activeHall, setActiveHall] = useState<'tropical' | 'limiao' | 'aerospace' | 'huali' | 'village' | 'freeTradePort' | null>(() => window.location.hash === '#tropical-hall' ? 'tropical' : window.location.hash === '#limiao-hall' ? 'limiao' : window.location.hash === '#aerospace-hall' ? 'aerospace' : window.location.hash === '#huali-hall' ? 'huali' : window.location.hash === '#village-hall' ? 'village' : window.location.hash === '#free-trade-hall' ? 'freeTradePort' : null)
  const [guideZoneId, setGuideZoneId] = useState('tropical')
  const [guideZoneTitle, setGuideZoneTitle] = useState(zones[0].title)
  const exhibitionRef = useRef<HTMLElement>(null)
  const carouselPointerDownRef = useRef(false)
  const guideTranscriptRef = useRef<HTMLDivElement>(null)
  const guideInputRef = useRef<HTMLInputElement>(null)
  const t = copy[language]
  const tx = (english: string, chinese: string) => inline(language, english, chinese)
  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage)
    saveLanguagePreference(nextLanguage)
  }
  const heroFreeTradeLabel = inline(language, 'Explore Free Trade Port', '探索自贸港')
  const heroGuideLabel = inline(language, 'Meet Luoyin', '询问螺音')
  const zone = zones[activeZone]
  const guideState = loading ? 'listening' : zone.id === 'huali' ? 'resonance' : zone.id === 'lijin' ? 'focus' : 'listening'
  const leadIntents: Array<{ id: string; label: RuntimeLocalized }> = [
    { id: 'culture-collaboration', label: runtimeCopy('Cultural collaboration', '文化合作') },
    { id: 'responsible-travel', label: runtimeCopy('Responsible travel planning', '负责任的旅行规划') },
    { id: 'craft-material', label: runtimeCopy('Craft & material inquiry', '工艺与材料咨询') },
    { id: 'media-partnership', label: runtimeCopy('Media partnership', '媒体合作') },
    { id: 'free-trade-port', label: runtimeCopy('Free Trade Port orientation', '自贸港信息导览') },
  ]
  const sourceDeskTopics: Array<{ id: string; label: RuntimeLocalized }> = [
    { id: 'all', label: runtimeCopy('All sources', '全部来源') },
    { id: 'heritage', label: runtimeCopy('Heritage', '文化与非遗') },
    { id: 'aerospace', label: runtimeCopy('Aerospace', '航天') },
    { id: 'free-trade-port', label: runtimeCopy('Free Trade Port', '自贸港') },
  ]
  const visibleSourceDeskEntries = sourceDeskEntries.filter((entry) => entry.status === 'reviewed' && (sourceDeskTopic === 'all' || entry.topics.includes(sourceDeskTopic)))
  const sourceDeskLayer = (entry: SourceDeskEntry) => entry.displayKind === 'verified_source'
    ? tx('Reviewed source', '已核验来源')
    : entry.displayKind === 'service_orientation'
      ? tx('Public orientation', '公共信息导览')
      : entry.displayKind === 'project_context'
        ? tx('Project visual context', '项目视觉语境')
        : tx('AI curation boundary', 'AI 编排边界')

  const switchZone = (index: number) => {
    if (index !== activeZone) setPreviousZone(activeZone)
    setActiveZone(index)
    setGuideZoneId(zones[index]?.id || 'tropical')
    setGuideZoneTitle(zones[index]?.title || zones[0].title)
    setMediaOpen(false)
    setMediaFailed(false)
  }

  const carouselPaused = carouselPointerPaused || carouselFocusPaused || mediaOpen || prefersReducedMotion

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncReducedMotion = () => setPrefersReducedMotion(mediaQuery.matches)
    syncReducedMotion()
    mediaQuery.addEventListener('change', syncReducedMotion)
    return () => mediaQuery.removeEventListener('change', syncReducedMotion)
  }, [])

  useEffect(() => {
    const meta = languageMeta[language]
    document.documentElement.lang = meta.tag
    document.documentElement.dir = meta.direction
  }, [language])

  useEffect(() => {
    const syncStoredLanguage = (event: StorageEvent) => {
      if (event.key === 'qiongverse.language' && isLanguage(event.newValue)) setLanguage(event.newValue)
    }
    window.addEventListener('storage', syncStoredLanguage)
    return () => window.removeEventListener('storage', syncStoredLanguage)
  }, [])

  useEffect(() => {
    if (activeHall || activeExperience || carouselPaused) return
    const timeout = window.setTimeout(() => switchZone((activeZone + 1) % zones.length), 2000)
    return () => window.clearTimeout(timeout)
  }, [activeHall, activeExperience, activeZone, carouselPaused])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setGuideOpen(false)
        setSourceDeskOpen(false)
        setMediaOpen(false)
        setExhibitionMenuOpen(false)
        setExploreMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const syncRoute = () => {
      const experience = experienceFromHash(window.location.hash)
      setActiveExperience(experience)
      setActiveHall(experience ? null : window.location.hash === '#tropical-hall' ? 'tropical' : window.location.hash === '#limiao-hall' ? 'limiao' : window.location.hash === '#aerospace-hall' ? 'aerospace' : window.location.hash === '#huali-hall' ? 'huali' : window.location.hash === '#village-hall' ? 'village' : window.location.hash === '#free-trade-hall' ? 'freeTradePort' : null)
      setExhibitionMenuOpen(false)
      setExploreMenuOpen(false)
    }
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    if (!activeExperience) return
    let frame = 0
    let attempts = 0
    const focusRouteHeading = () => {
      const target = document.querySelector<HTMLElement>('[data-experience-main] h1, #market-main h1')
      if (!target && attempts++ < 24) {
        frame = window.requestAnimationFrame(focusRouteHeading)
        return
      }
      if (!target) return
      target.tabIndex = -1
      target.focus({ preventScroll: true })
    }
    frame = window.requestAnimationFrame(focusRouteHeading)
    return () => window.cancelAnimationFrame(frame)
  }, [activeExperience])

  useEffect(() => {
    const transcript = guideTranscriptRef.current
    if (transcript) transcript.scrollTop = transcript.scrollHeight
  }, [guideMessages, loading])

  useEffect(() => {
    if (!guideOpen) return
    let active = true
    setGuideServiceMode('checking')
    fetch(apiPath('/api/luoyin/status'))
      .then(async (response) => {
        if (!response.ok) throw new Error('guide_status_unavailable')
        return response.json() as Promise<{ upstreamConfigured?: boolean }>
      })
      .then((status) => {
        if (active) setGuideServiceMode(status.upstreamConfigured ? 'glm' : 'local')
      })
      .catch(() => {
        if (active) setGuideServiceMode('unavailable')
      })
    return () => { active = false }
  }, [guideOpen])

  const moveZone = (direction: number) => {
    const next = (activeZone + direction + zones.length) % zones.length
    switchZone(next)
    window.setTimeout(() => document.getElementById(`zone-tab-${next}`)?.focus(), 0)
  }

  const scrollToTarget = (targetId: string, navIndex: number, zoneIndex?: number) => {
    if (typeof zoneIndex === 'number') switchZone(zoneIndex)
    setActiveNav(navIndex)
    const target = document.getElementById(targetId)
    if (!target) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - 78), behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const openLimiaoHall = () => {
    setActiveZone(1)
    setExhibitionMenuOpen(false)
    window.location.hash = 'limiao-hall'
    setActiveHall('limiao')
  }

  const openTropicalHall = () => {
    setActiveZone(0)
    setExhibitionMenuOpen(false)
    window.location.hash = 'tropical-hall'
    setActiveHall('tropical')
  }

  const openAerospaceHall = () => {
    setActiveZone(2)
    setExhibitionMenuOpen(false)
    window.location.hash = 'aerospace-hall'
    setActiveHall('aerospace')
  }

  const openHualiHall = () => {
    setActiveZone(3)
    setExhibitionMenuOpen(false)
    window.location.hash = 'huali-hall'
    setActiveHall('huali')
  }

  const openVillageHall = () => {
    setActiveZone(4)
    setExhibitionMenuOpen(false)
    window.location.hash = 'village-hall'
    setActiveHall('village')
  }

  const openFreeTradePortHall = () => {
    setExhibitionMenuOpen(false)
    setGuideZoneId('free-trade-port')
    setGuideZoneTitle({ en: 'Free Trade Port', zh: '自贸港' })
    window.location.hash = 'free-trade-hall'
    setActiveHall('freeTradePort')
  }

  const openExperience = (route: ExperienceRoute) => {
    setExhibitionMenuOpen(false)
    setExploreMenuOpen(false)
    setActiveExperience(route)
    window.location.hash = route
  }

  const exitExperience = () => {
    setActiveExperience(null)
    window.location.hash = 'top'
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0)
  }

  const openGuideChat = () => {
    setPetVisible(true)
    setGuideOpen(true)
  }

  const closeGuideChat = () => {
    setGuideOpen(false)
    window.setTimeout(() => document.querySelector<HTMLButtonElement>('[data-luoyin-pet-toggle]')?.focus(), 0)
  }

  const closeGuidePet = () => {
    setGuideOpen(false)
    setPetVisible(false)
  }

  const openTideHall = (themeId: string) => {
    if (themeId === 'tropical') return openTropicalHall()
    if (themeId === 'lijin') return openLimiaoHall()
    if (themeId === 'aerospace') return openAerospaceHall()
    if (themeId === 'huali') return openHualiHall()
    if (themeId === 'village') return openVillageHall()
    openFreeTradePortHall()
  }

  const openTideGuide = (themeId: string) => {
    const matchingZone = zones.find((item) => item.id === themeId)
    setGuideZoneId(themeId)
    setGuideZoneTitle(matchingZone?.title || { en: 'Free Trade Port', zh: '自贸港' })
    setQuestion(language === 'en' ? `Tell me about ${matchingZone?.title.en || 'the Free Trade Port'}.` : `请介绍${matchingZone?.title.zh || '自贸港'}。`)
    openGuideChat()
  }

  const openZoneHall = (index: number) => {
    setExhibitionMenuOpen(false)
    if (zones[index]?.id === 'tropical') {
      openTropicalHall()
      return
    }
    if (zones[index]?.id === 'lijin') {
      openLimiaoHall()
      return
    }
    if (zones[index]?.id === 'aerospace') {
      openAerospaceHall()
      return
    }
    if (zones[index]?.id === 'huali') {
      openHualiHall()
      return
    }
    if (zones[index]?.id === 'village') {
      openVillageHall()
      return
    }
    const message = language === 'en' ? `${zones[index]?.title.en || 'This hall'} is in development.` : `${zones[index]?.title.zh || '该展厅'}正在开发中。`
    setHallNotice(message)
    window.setTimeout(() => setHallNotice(''), 3200)
  }

  const exitHall = (zoneIndex: number) => {
    window.location.hash = 'exhibition'
    setActiveHall(null)
    window.setTimeout(() => scrollToTarget('exhibition', 1, zoneIndex), 0)
  }

  const submitQuestion = async () => {
    const trimmed = question.trim()
    if (!trimmed || loading) return
    setLoading(true)
    const visitorMessage: GuideMessage = { id: `visitor-${Date.now()}`, role: 'visitor', text: trimmed, zoneTitle: localize(zone.title, language) }
    setGuideMessages((messages) => [...messages, visitorMessage].slice(-24))
    let completed = false
    try {
      const response = await fetch(apiPath('/api/luoyin'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question: trimmed, language, zoneId: guideZoneId }) })
      const payload = await response.json() as { answer?: string; layer?: string; sourceLabel?: string; sourceUrl?: string | null; sourceClass?: string; sourceStatus?: string; handoff?: boolean; mode?: 'local' | 'mock' | 'glm' | 'fallback' }
      if (!payload.answer) throw new Error('empty_response')
      const guideMessage: GuideMessage = { id: `guide-${Date.now()}`, role: 'guide', text: payload.answer || '', zoneTitle: localize(guideZoneTitle, language), layer: payload.layer || 'local_contextual_guide', sourceLabel: payload.sourceLabel || inline(language, 'Local contextual guide', '本地语境导览'), sourceUrl: payload.sourceUrl || null, sourceClass: payload.sourceClass || '', sourceStatus: payload.sourceStatus || '', mode: payload.mode === 'glm' ? 'glm' : payload.mode === 'fallback' ? 'fallback' : payload.mode === 'local' ? 'local' : 'mock' }
      setGuideMessages((messages) => [...messages, guideMessage].slice(-24))
      completed = true
    } catch {
      const fallbackText = guideZoneId === 'free-trade-port'
        ? language === 'en'
          ? 'This Free Trade Port room is a project-curated visual orientation. Check the official Hainan Free Trade Port English portal for current public information.'
          : '自贸港展厅提供项目策展的视觉导览。当前公共信息请查阅海南自由贸易港英文官方门户。'
        : localize(zone.guide, language)
      const fallbackMessage: GuideMessage = { id: `fallback-${Date.now()}`, role: 'guide', text: fallbackText, zoneTitle: localize(guideZoneTitle, language), layer: inline(language, 'offline fallback', '离线本地回退'), sourceLabel: inline(language, 'Offline local fallback', '离线本地回退'), sourceClass: 'ai_suggestion', sourceStatus: 'blocked', mode: 'error' }
      setGuideMessages((messages) => [...messages, fallbackMessage].slice(-24))
    } finally {
      setLoading(false)
      if (completed) setQuestion('')
      window.setTimeout(() => guideInputRef.current?.focus(), 0)
    }
  }

  const submitLead = async () => {
    if (leadStatus === 'sending' || !leadConsent) return
    setLeadStatus('sending')
    setLeadError('')
    try {
      const response = await fetch(apiPath('/api/leads'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ intentId: leadIntent, email: leadEmail.trim(), message: leadMessage.trim(), name: leadName.trim() || undefined, organization: leadOrganization.trim() || undefined, consent: leadConsent, language }) })
      const payload = await response.json() as { accepted?: boolean; reference?: string; error?: string }
      if (!response.ok || !payload.accepted) throw new Error(payload.error || 'lead_unavailable')
      setLeadReference(payload.reference || '')
      setLeadStatus('success')
    } catch (error) {
      setLeadError(error instanceof Error && error.message === 'invalid_email' ? (language === 'en' ? 'Enter a valid email address.' : '请输入有效的电子邮箱。') : language === 'en' ? 'No request was sent. Check the fields and try again.' : '未发送请求，请检查字段后重试。')
      setLeadStatus('error')
    }
  }

  const resetLead = () => {
    setLeadStatus('idle')
    setLeadError('')
    setLeadReference('')
    setLeadEmail('')
    setLeadMessage('')
    setLeadName('')
    setLeadOrganization('')
    setLeadConsent(false)
  }

  const openSourceDesk = () => {
    setSourceDeskStatus('idle')
    setSourceDeskError('')
    setSourceDeskReference('')
    setSourceDeskConsent(false)
    setSourceDeskOpen(true)
  }

  const submitSourceDeskHandoff = async () => {
    if (sourceDeskStatus === 'sending' || !sourceDeskConsent || !sourceDeskSourceId) return
    setSourceDeskStatus('sending')
    setSourceDeskError('')
    try {
      const response = await fetch(apiPath('/api/operations/handoff'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceId: sourceDeskSourceId, intentId: sourceDeskIntent, language, consent: sourceDeskConsent }),
      })
      const payload = await response.json() as { accepted?: boolean; mode?: string; reference?: string; error?: string }
      if (!response.ok || !payload.accepted || payload.mode !== 'simulation') throw new Error(payload.error || 'handoff_unavailable')
      setSourceDeskReference(payload.reference || '')
      setSourceDeskStatus('success')
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'handoff_unavailable'
      setSourceDeskError(reason === 'consent_required' ? (language === 'en' ? 'Consent is required before a simulation can run.' : '运行模拟交接前需要明确同意。') : language === 'en' ? 'The local simulation was not completed. No institution was contacted.' : '本地模拟未完成，未联系任何真实机构。')
      setSourceDeskStatus('error')
    }
  }

  const zoneMeta = useMemo(() => `${zone.index} / 05`, [zone.index])
  const guideBlocked = sourceDeskOpen || leadOpen || mediaOpen

  return <div className={activeHall === 'tropical' ? 'site-shell tropical-route-active' : 'site-shell'}>
    {activeExperience === 'luoyin-tide' && <Suspense fallback={<main className="tide-route-loading">Opening ShellSong…</main>}><LuoyinTidePage language={language} onChangeLanguage={changeLanguage} onExit={exitExperience} onOpenHall={openTideHall} onAskLuoyin={openTideGuide} /></Suspense>}
    {activeExperience === 'travel-atlas' && <Suspense fallback={<main className="travel-atlas-loading">Opening Hainan Unfolded…</main>}><TravelAtlas language={language} onChangeLanguage={changeLanguage} onExit={exitExperience} apiPath={apiPath} /></Suspense>}
    {activeExperience === 'market' && <Suspense fallback={<main className="market-loading">Opening the project demo market…</main>}><TradePage language={language} onChangeLanguage={changeLanguage} onExit={exitExperience} onOpenGuide={openGuideChat} /></Suspense>}
    {!activeExperience && <>
    {activeHall === 'tropical' && <Suspense fallback={<main className="tropical-loading">Opening the Tropical Island Hall…</main>}><TropicalImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(0)} onOpenGuide={(exhibit) => { setActiveZone(0); setQuestion(language !== 'en' ? exhibit.title.zh : 'Tell me about ' + localize(exhibit.title, language) + '.'); openGuideChat() }} /></Suspense>}
    {activeHall === 'limiao' ? <Suspense fallback={<main className="limiao-loading">Opening the Li &amp; Miao Immersive Hall…</main>}><LiMiaoImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(1)} onOpenGuide={(exhibit) => { setActiveZone(1); setQuestion(language !== 'en' ? '请介绍' + exhibit.title.zh + '。' : 'Tell me about ' + localize(exhibit.title, language) + '.'); openGuideChat() }} /></Suspense> : activeHall === 'aerospace' ? <Suspense fallback={<main className="aerospace-loading">Opening the Wenchang Aerospace Hall…</main>}><AerospaceImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(2)} onOpenGuide={(exhibit) => { setActiveZone(2); setQuestion(language !== 'en' ? '请介绍' + exhibit.title.zh + '。' : 'Tell me about ' + localize(exhibit.title, language) + '.'); openGuideChat() }} /></Suspense> : activeHall === 'huali' ? <Suspense fallback={<main className="huali-loading">Opening the Dongfang Rosewood Hall…</main>}><HualiImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(3)} onOpenGuide={(exhibit) => { setActiveZone(3); setQuestion(language !== 'en' ? '请介绍' + exhibit.title.zh + '。' : 'Tell me about ' + localize(exhibit.title, language) + '.'); openGuideChat() }} /></Suspense> : activeHall === 'village' ? <Suspense fallback={<main className="village-loading">Opening the Beautiful Villages Hall…</main>}><VillageImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(4)} onOpenGuide={(exhibit) => { setActiveZone(4); setQuestion(language !== 'en' ? '请介绍' + exhibit.title.zh + '。' : 'Tell me about ' + localize(exhibit.title, language) + '.'); openGuideChat() }} /></Suspense> : activeHall === 'freeTradePort' ? <Suspense fallback={<main className="ftp-loading">Opening the Free Trade Port Immersive Hall…</main>}><FreeTradePortImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(0)} onOpenGuide={(exhibit) => { setGuideZoneId('free-trade-port'); setGuideZoneTitle({ en: 'Free Trade Port', zh: '自贸港' }); setQuestion(language !== 'en' ? '请介绍自贸港展厅中的' + exhibit.title.zh + '。' : 'Tell me about ' + localize(exhibit.title, language) + ' in the Free Trade Port hall.'); openGuideChat() }} /></Suspense> : <>
    <header className="site-header">
      <BrandLockup />
      <nav className="desktop-nav" aria-label="Primary navigation">
        <a className={activeNav === 0 ? 'nav-link active' : 'nav-link'} href="#top" onClick={(event) => { event.preventDefault(); setExhibitionMenuOpen(false); scrollToTarget('top', 0) }}>{t.nav[0]}</a>
        <div className="nav-menu-wrap">
          <button className={activeNav === 1 ? 'nav-link nav-menu-trigger active' : 'nav-link nav-menu-trigger'} type="button" aria-haspopup="true" aria-expanded={exhibitionMenuOpen} aria-controls="exhibition-menu" onClick={() => setExhibitionMenuOpen((open) => !open)}>{t.nav[1]}<span className="menu-caret" aria-hidden="true">⌄</span></button>
          {exhibitionMenuOpen && <>
            <button className="nav-menu-backdrop" aria-label={t.menuLabel} onClick={() => setExhibitionMenuOpen(false)} />
            <div id="exhibition-menu" className="nav-menu" role="menu" aria-label={t.nav[1]}>
              <a className="nav-menu-main-hall" href="#free-trade-hall" role="menuitem" onClick={(event) => { event.preventDefault(); openFreeTradePortHall() }}><span>◎</span>{inline(language, 'Free Trade Port Main Hall', '自贸港主厅')}<b aria-hidden="true">↗</b></a>
              <a href="#hainan-map" role="menuitem" onClick={(event) => { event.preventDefault(); setExhibitionMenuOpen(false); window.location.hash = 'hainan-map'; scrollToTarget('hainan-map', 1) }}><span>◇</span>{inline(language, 'Hainan Map', '海南地图')}</a>
              {zones.map((item, index) => <a key={item.id} href={item.id === 'tropical' ? '#tropical-hall' : item.id === 'lijin' ? '#limiao-hall' : item.id === 'aerospace' ? '#aerospace-hall' : item.id === 'huali' ? '#huali-hall' : item.id === 'village' ? '#village-hall' : '#exhibition'} role="menuitem" onClick={(event) => { event.preventDefault(); openZoneHall(index) }}><span>{item.index}</span>{item.title[language]}</a>)}
            </div>
          </>}
        </div>
        <button className="nav-link nav-experience-link" type="button" onClick={() => openExperience('travel-atlas')}>{inline(language, 'Travel', '旅行')}</button>
        <button className="nav-link nav-experience-link" type="button" onClick={() => openExperience('market')}>{inline(language, 'Market', '商品')}</button>
        <button className="nav-link nav-experience-link" type="button" onClick={() => openExperience('luoyin-tide')}>{inline(language, 'ShellSong', '螺音')}</button>
        <button className="nav-link nav-archive-trigger" type="button" onClick={() => { setExhibitionMenuOpen(false); openSourceDesk() }} aria-haspopup="dialog">{inline(language, 'Archive', '档案馆')}</button>
      </nav>
      <div className="header-actions">
        <button className="mobile-archive-trigger" type="button" onClick={() => { setExhibitionMenuOpen(false); openSourceDesk() }} aria-label={inline(language, 'Open verified source desk', '打开已核验来源服务台')} aria-haspopup="dialog"><span aria-hidden="true">□</span></button>
        <div className="mobile-experience-wrap">
          <button className="mobile-experience-trigger" type="button" aria-label={inline(language, 'Open experience menu', '打开体验菜单')} aria-expanded={exploreMenuOpen} aria-controls="mobile-experience-menu" onClick={() => setExploreMenuOpen((open) => !open)}><span aria-hidden="true">◇</span></button>
          {exploreMenuOpen && <div id="mobile-experience-menu" className="mobile-experience-menu" role="menu" aria-label={inline(language, 'Explore experiences', '探索体验')}>
            <button type="button" role="menuitem" onClick={() => openExperience('luoyin-tide')}>{inline(language, 'ShellSong / Luoyin', '螺音 / ShellSong')}</button>
            <button type="button" role="menuitem" onClick={() => openExperience('travel-atlas')}>{inline(language, 'Travel / Hainan Unfolded', '旅行 / 海南图鉴')}</button>
            <button type="button" role="menuitem" onClick={() => openExperience('market')}>{inline(language, 'Market / Project Demo', '商品 / 项目演示')}</button>
            <button type="button" role="menuitem" onClick={() => { setExploreMenuOpen(false); window.location.hash = 'hainan-map'; scrollToTarget('hainan-map', 1) }}>{inline(language, 'Hainan Map', '海南地图')}</button>
          </div>}
        </div>
        <LanguageSelector language={language} onChange={changeLanguage} className="language-toggle" />
        <button className="guide-trigger" onClick={openGuideChat} aria-label={t.open}>◎ <span>Luoyin</span></button>
      </div>
    </header>

    <main id="top">
      <section className={heroImageFailed ? 'hero hero-dawn is-fallback' : 'hero hero-dawn'} aria-labelledby="hero-title">
        <div className="hero-media">
          {!heroImageFailed && <picture><source type="image/webp" srcSet="/assets/hero/qiongverse-hero2.webp" /><img src="/assets/hero/qiongverse-hero2.jpg" width="1932" height="1280" fetchPriority="high" decoding="async" alt="Project-supplied QIONGVERSE brand visual with a tropical coastline, star orbit and Hainan city horizon" onError={() => setHeroImageFailed(true)} /></picture>}
        </div>
        <div className="hero-shade" />
        <div className="hero-content">
          <h1 id="hero-title" className="brand-sr-only">HAINAN QIONGVERSE</h1>
          <div className="hero-actions">
            <button className="primary-button" onClick={openFreeTradePortHall}>{heroFreeTradeLabel}<span>↗</span></button>
            <button className="text-button" onClick={openGuideChat}>{heroGuideLabel}<span>◎</span></button>
          </div>
        </div>
      </section>

      {false && <section className="intro-band" aria-label="Exhibition introduction">
        <div className="intro-quote">“The sea has a memory,<br /><em>and wood remembers in rings.</em>”</div>
        <div className="intro-detail"><span className="mono-label">SHELLSONG / FIELD NOTE 001</span><p>Luoyin translates the island through sound, light and small acts of attention. This is a fictional guide layer inside a real, supplied visual archive.</p></div>
      </section>}

      <section className="free-trade-portal" id="free-trade-main-hall" aria-labelledby="free-trade-portal-title">
        <div className="free-trade-portal-layout">
          <div className="free-trade-portal-index" aria-hidden="true"><strong>05</strong><i /><span>HFTP<br />SOURCE<br />ROOM</span></div>
          <div className="free-trade-portal-copy">
            <p className="eyebrow">{tx('HAINAN PROVINCE / PUBLIC READING', '海南省 / 公共阅览')}</p>
            <h2 id="free-trade-portal-title"><span>{tx('Free Trade', '自贸港')}</span><span>{tx('Port Main', '主')}&nbsp;<em>{tx('Hall', '展厅')}</em></span></h2>
            <p className="free-trade-portal-deck">{tx('A public reading entrance for checking current Hainan Free Trade Port information through reviewed official sources.', '面向公众的阅读入口，通过已核验的官方来源了解当前海南自由贸易港信息。')}</p>
            <div className="free-trade-portal-actions"><a className="primary-button" href="#free-trade-hall" onClick={(event) => { event.preventDefault(); openFreeTradePortHall() }}>{tx('Enter main hall', '进入主展厅')} <span>↗</span></a><a className="free-trade-portal-source" href="https://en.hnftp.gov.cn/" target="_blank" rel="noopener noreferrer">{tx('Open official English portal', '打开英文官方门户')} <span>↗</span></a></div>
            <small>{tx('For current notices and policy materials, verify details on the official English portal. This project does not determine eligibility or commercial outcomes.', '当前通知与政策资料请以英文官方门户为准；本项目不判断资格或商业结果。')}</small>
          </div>
          <div className="free-trade-portal-coordinate" aria-hidden="true"><span>HAINAN / 19.5 N</span><i /><b>∞</b></div>
        </div>
      </section>

      <section className="exhibition" id="exhibition" ref={exhibitionRef} aria-label="Five immersive halls" onMouseEnter={() => setCarouselPointerPaused(true)} onMouseLeave={() => setCarouselPointerPaused(false)} onPointerDown={() => { carouselPointerDownRef.current = true; setCarouselFocusPaused(false) }} onPointerUp={() => { carouselPointerDownRef.current = false }} onFocusCapture={() => { if (!carouselPointerDownRef.current) setCarouselFocusPaused(true) }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCarouselFocusPaused(false) }}>
        <div className={`hall-visual-stage ${zone.tone}`} id={`zone-panel-${activeZone}`} role="tabpanel" aria-labelledby={`zone-tab-${activeZone}`}>
          <button className="zone-visual-enter" type="button" onClick={() => openZoneHall(activeZone)} aria-label={`Enter ${zone.title[language]}`}>
            {previousZone !== null && previousZone !== activeZone && <picture className="zone-visual-image zone-visual-image--previous"><source type="image/webp" media="(max-width: 700px)" srcSet={deliveryImage(zones[previousZone].mobileImage)} /><source media="(max-width: 700px)" srcSet={zones[previousZone].mobileImage} /><source type="image/webp" srcSet={deliveryImage(zones[previousZone].image)} /><img src={zones[previousZone].image} loading="lazy" decoding="async" alt="" aria-hidden="true" /></picture>}
            <picture className="zone-visual-image zone-visual-image--current" key={zone.id}><source type="image/webp" media="(max-width: 700px)" srcSet={deliveryImage(zone.mobileImage)} /><source media="(max-width: 700px)" srcSet={zone.mobileImage} /><source type="image/webp" srcSet={deliveryImage(zone.image)} /><img src={zone.image} loading="lazy" decoding="async" alt="" onError={(event) => { event.currentTarget.src = zone.poster }} /></picture>
            <span className="zone-visual-shade" aria-hidden="true" />
            <span className="zone-visual-label"><span>{zone.index} / 05</span><strong>{zone.title[language]}</strong></span>
            <span className="zone-visual-arrow" aria-hidden="true">↗</span>
          </button>
          <div className="hall-wheel" role="tablist" aria-label="Choose an immersive hall">
            <div className="hall-wheel-rotor" style={{ '--wheel-turn': `${activeZone * -72}deg` } as CSSProperties}>
              {zones.map((item, index) => <button id={`zone-tab-${index}`} key={item.id} type="button" role="tab" aria-label={item.title[language]} aria-selected={activeZone === index} aria-controls={`zone-panel-${index}`} tabIndex={activeZone === index ? 0 : -1} className={'hall-wheel-item' + (activeZone === index ? ' active' : '')} style={{ '--wheel-angle': `${index * 72}deg` } as CSSProperties} onClick={() => switchZone(index)} onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); moveZone(1) } if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); moveZone(-1) } if (event.key === 'Home') { event.preventDefault(); switchZone(0); window.setTimeout(() => document.getElementById('zone-tab-0')?.focus(), 0) } if (event.key === 'End') { event.preventDefault(); switchZone(zones.length - 1); window.setTimeout(() => document.getElementById(`zone-tab-${zones.length - 1}`)?.focus(), 0) } }}><span className="hall-wheel-item-inner"><img src={item.thumbnail || item.image} loading="lazy" decoding="async" alt="" aria-hidden="true" onError={(event) => { event.currentTarget.src = item.poster }} /><span>{item.index}</span></span></button>)}
            </div>
          </div>
        </div>
        <div className="hall-carousel">
          <aside className="hall-carousel-aside">
            <div className="hall-carousel-heading"><p className="eyebrow">{t.zonesEyebrow}</p><h2 id="exhibition-title">{t.zonesTitle}</h2><p>{t.zonesBody}</p></div>
            <div className="hall-carousel-dial" role="tablist" aria-label="Exhibition zones">
              {zones.map((item, index) => {
                const dialOffset = (index - activeZone + zones.length + 2) % zones.length - 2
                return <button id={`zone-tab-${index}`} key={item.id} type="button" role="tab" aria-label={item.title[language]} aria-selected={activeZone === index} aria-controls={`zone-panel-${index}`} tabIndex={activeZone === index ? 0 : -1} className={`hall-dial-item offset-${dialOffset}${activeZone === index ? ' active' : ''}`} onClick={() => switchZone(index)} onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); moveZone(1) } if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); moveZone(-1) } if (event.key === 'Home') { event.preventDefault(); switchZone(0); window.setTimeout(() => document.getElementById('zone-tab-0')?.focus(), 0) } if (event.key === 'End') { event.preventDefault(); switchZone(zones.length - 1); window.setTimeout(() => document.getElementById(`zone-tab-${zones.length - 1}`)?.focus(), 0) } }}><img src={item.thumbnail || item.image} loading="lazy" decoding="async" alt="" aria-hidden="true" onError={(event) => { event.currentTarget.src = item.poster }} /><span className="hall-dial-index">{item.index}</span><span className="hall-dial-title">{item.title[language]}</span></button>
              })}
            </div>
          </aside>
          <article id={`zone-panel-${activeZone}`} className={`zone-carousel-stage ${zone.tone}`} role="tabpanel" aria-labelledby={`zone-tab-${activeZone}`}>
            <div className="zone-carousel-art">
              {previousZone !== null && previousZone !== activeZone && <picture className="zone-carousel-image zone-carousel-image--previous"><source type="image/webp" media="(max-width: 700px)" srcSet={deliveryImage(zones[previousZone].mobileImage)} /><source media="(max-width: 700px)" srcSet={zones[previousZone].mobileImage} /><source type="image/webp" srcSet={deliveryImage(zones[previousZone].image)} /><img src={zones[previousZone].image} loading="lazy" decoding="async" alt="" aria-hidden="true" /></picture>}
              <picture className="zone-carousel-image zone-carousel-image--current" key={zone.id}><source type="image/webp" media="(max-width: 700px)" srcSet={deliveryImage(zone.mobileImage)} /><source media="(max-width: 700px)" srcSet={zone.mobileImage} /><source type="image/webp" srcSet={deliveryImage(zone.image)} /><img src={zone.image} loading="lazy" decoding="async" alt="" onError={(event) => { event.currentTarget.src = zone.poster }} /></picture>
              <button className="zone-carousel-media-trigger" type="button" aria-label={'Preview ' + zone.title.en} onClick={() => { setMediaFailed(false); setMediaOpen(true) }}>{zone.video ? '▶' : '◇'}</button>
            </div>
            <div className="zone-carousel-copy">
              <div className="zone-carousel-copy-top"><span>{zoneMeta} / {t.source}</span><span>{zone.tag[language]}</span></div>
              <h3>{zone.title[language]}</h3>
              <p className="zone-carousel-kicker">{zone.kicker[language]}</p>
              <p className="zone-carousel-description">{zone.description[language]}</p>
              <div className="zone-carousel-footer"><span>{tx('Open immersive hall', '进入沉浸展厅')}</span><button type="button" onClick={() => openZoneHall(activeZone)}>{tx('Enter', '进入')} <span>↗</span></button></div>
            </div>
            <div className="zone-carousel-progress" aria-label={language === 'en' ? `Slide ${activeZone + 1} of ${zones.length}` : `第 ${activeZone + 1} 张，共 ${zones.length} 张`}>{zones.map((item, index) => <span key={item.id} className={activeZone === index ? 'active' : ''} />)}</div>
          </article>
        </div>
      </section>

      <DeferredHainanMap language={language} />

      <section className="experience-feature experience-feature--travel" aria-labelledby="experience-travel-title">
        <img src="/assets/travel/hainan-unfolded-poster.jpg" alt={tx('Project travel film frame of the Hainan sea at sunset', '海南海上日落项目旅行影像画面')} loading="lazy" />
        <span className="experience-feature-index" aria-hidden="true">01 / 03</span>
        <div className="experience-feature-copy">
          <p>HAINAN UNFOLDED / {tx('TRAVEL', '旅行')}</p>
          <h2 id="experience-travel-title">{tx('Read Hainan by the light.', '沿着光，读海南。')}</h2>
          <span>{tx('A visual island atlas where source status remains visible beside every invitation.', '一部让来源状态始终与每次视觉邀请并置的海岛图鉴。')}</span>
          <button type="button" onClick={() => openExperience('travel-atlas')}>{tx('Open Hainan Unfolded', '打开海南图鉴')} <b aria-hidden="true">↗</b></button>
          <small>{tx('REVIEWED-SOURCE ATLAS', '已核验来源图鉴')}</small>
        </div>
      </section>
      <section className="experience-feature experience-feature--tide" aria-labelledby="experience-tide-title">
        <img src="/shellsong/hero-poster.jpg" alt={tx('ShellSong project visual featuring Luoyin at sea', '螺音立于海潮中的 ShellSong 项目视觉')} loading="lazy" />
        <span className="experience-feature-index" aria-hidden="true">02 / 03</span>
        <div className="experience-feature-copy">
          <p>SHELLSONG / {tx('LUOYIN', '螺音')}</p>
          <h2 id="experience-tide-title">{tx('Hear the tide answer.', '听见潮汐的回声。')}</h2>
          <span>{tx('Enter an original fictional guide layer shaped by tides, images, and small acts of listening.', '进入由潮汐、影像与聆听构成的原创虚构导览叙事。')}</span>
          <button type="button" onClick={() => openExperience('luoyin-tide')}>{tx('Enter ShellSong', '进入 ShellSong')} <b aria-hidden="true">↗</b></button>
          <small>{tx('ORIGINAL FICTION', '原创虚构叙事')}</small>
        </div>
      </section>
      <section className="experience-feature experience-feature--market" aria-labelledby="experience-market-title">
        <img src="/assets/demo-market/hero/blind-box-turntable.png" alt={tx('Project visual of a blind-box turntable for the project demo market', '用于项目演示商城的盲盒展示转台项目视觉')} loading="lazy" />
        <span className="experience-feature-index" aria-hidden="true">03 / 03</span>
        <div className="experience-feature-copy">
          <p>PROJECT DEMO / {tx('MARKET', '商品')}</p>
          <h2 id="experience-market-title">{tx('Let the story travel on.', '让故事，继续生长。')}</h2>
          <span>{tx('Browse cultural concepts, Luoyin IP studies, and studio services in a session-only interface demonstration.', '在仅限当前会话的界面演示中浏览文化概念、螺音 IP 研究与工作室服务。')}</span>
          <button type="button" onClick={() => openExperience('market')}>{tx('Open project market', '打开项目商城')} <b aria-hidden="true">↗</b></button>
          <small>{tx('SESSION-ONLY PROJECT DEMO', '仅限当前会话的项目演示')}</small>
        </div>
      </section>

    </main>
    {hallNotice && <div className="hall-notice" role="status" aria-live="polite">{hallNotice}</div>}

    <footer className="site-footer"><picture><source type="image/webp" srcSet="/assets/brand/qiongverse-logo2.webp" /><img className="footer-brand-mark" src="/assets/brand/qiongverse-logo2.jpg" loading="lazy" decoding="async" alt="QIONGVERSE brand mark" /></picture><img className="footer-wordmark" src="/assets/brand/qiongverse-wordmark-en.svg" loading="lazy" decoding="async" alt="HAINAN QIONGVERSE" /><button className="footer-archive-trigger" type="button" onClick={openSourceDesk}>{tx('Open verified source desk', '已核验来源服务台')} <span aria-hidden="true">↗</span></button><SocialShare language={language} apiPath={apiPath} /><span className="footer-code">TIDE ARCHIVE / 2026</span></footer>
    </>}</>}

    <LuoyinDesktopPet language={language} visible={petVisible} chatOpen={guideOpen} suspended={guideBlocked} onOpenChat={openGuideChat} onCloseChat={closeGuideChat} onClosePet={closeGuidePet}>
      <div id="luoyin-chat-panel" className="luoyin-chat-panel" role="dialog" aria-labelledby="guide-title">
        <div className="guide-top"><div className="guide-identity"><div className="guide-orb">◎</div><div><p className="mono-label">SHELLSONG / 螺音</p><h2 id="guide-title">{t.guideTitle}</h2></div></div><button className="close-button" type="button" onClick={closeGuideChat} aria-label={t.close}>×</button></div>
        <p className="guide-body">{t.guideBody}</p>
        <p className="guide-state"><span className="state-dot" /> {guideState} / {guideZoneTitle[language]}</p>
        <div className="guide-utility-actions"><button className="source-desk-trigger" type="button" onClick={openSourceDesk}>{language === 'en' ? 'Verified Source Desk' : '已核验来源服务台'} <span>↗</span></button><button className="lead-trigger" type="button" onClick={() => { setGuideOpen(false); resetLead(); setLeadOpen(true) }}>{language === 'en' ? 'Request human follow-up' : '请求人工跟进'} <span>↗</span></button></div>
        <div className="guide-answer-area" ref={guideTranscriptRef} aria-live="polite" aria-busy={loading} aria-label={language === 'en' ? 'Conversation with Luoyin' : '与螺音的对话'}>{guideMessages.length === 0 && <p className="guide-welcome">{language === 'en' ? 'Begin anywhere. I will keep this conversation here while the chat window stays open.' : '从任何问题开始。对话框保持打开时，我会在这里保留这段对话。'}</p>}{guideMessages.map((message) => message.role === 'visitor' ? <div className="guide-message visitor-message" key={message.id}><span className="message-label">{language === 'en' ? 'YOU' : '你'} / {message.zoneTitle}</span><p>{message.text}</p></div> : <div className="guide-message guide-message-reply" key={message.id}><div className="answer-meta"><span className="answer-label">{message.mode === 'fallback' || message.mode === 'error' ? (language === 'en' ? 'offline fallback' : '离线本地回退') : message.mode === 'local' ? (language === 'en' ? 'local contextual guide' : '本地语境导览') : message.mode === 'glm' ? (language === 'en' ? 'GLM guide response' : 'GLM 导览回答') : message.layer || t.mock}</span>{message.sourceLabel && !(message.mode === 'local' && (message.sourceLabel === 'Local contextual guide' || message.sourceLabel === '本地语境导览')) && <span className="answer-source">{message.sourceLabel}</span>}{message.sourceUrl && <a className="answer-source answer-source-link" href={message.sourceUrl} target="_blank" rel="noopener noreferrer">{language === 'en' ? 'Open reviewed source' : '打开已核验来源'}</a>}{message.sourceClass && message.sourceClass !== 'local_contextual_guide' && <span className="answer-source-class">{message.sourceClass.replaceAll('_', ' ')}</span>}{message.sourceStatus && message.sourceStatus !== 'local' && <span className="answer-source-status">{message.sourceStatus}</span>}</div><p className="guide-answer">{message.text}</p></div>)}{loading && <p className="guide-answer loading">{language === 'en' ? 'Listening to the tide...' : '正在听潮声……'}</p>}</div>
        <div className="guide-input"><input ref={guideInputRef} value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitQuestion() }} placeholder={t.guideInput} aria-label={t.guideInput} /><button onClick={submitQuestion} disabled={loading || !question.trim()} aria-label={t.send}>↗</button></div>
        <p className="guide-disclaimer">{guideServiceMode === 'checking' ? (language === 'en' ? 'Checking guide service...' : '正在检查导览服务……') : guideServiceMode === 'glm' ? (language === 'en' ? 'Live GLM guide is connected. Current or regulated details should be checked against a primary source.' : '实时 GLM 导览已连接。涉及当前或受监管的详情，请以权威一手来源为准。') : guideServiceMode === 'local' ? (language === 'en' ? 'Local contextual guide is active. Live GLM needs a service-process API key.' : '本地语境导览正在运行。实时 GLM 需要在服务进程中配置 API 密钥。') : (language === 'en' ? 'Guide service status is unavailable. Local replies remain available.' : '导览服务状态暂不可用，本地回答仍可使用。')}</p>
      </div>
    </LuoyinDesktopPet>
    {sourceDeskOpen && <div className="source-desk-modal" role="dialog" aria-modal="true" aria-labelledby="source-desk-title">
      <div className="source-desk-sheet">
        <div className="lead-sheet-head"><div><p className="mono-label">SOURCE DESK / REVIEWED ENTRY POINTS</p><h2 id="source-desk-title">{language === 'en' ? 'Verified Source Desk' : '已核验来源服务台'}</h2></div><button className="close-button" type="button" onClick={() => setSourceDeskOpen(false)} aria-label={language === 'en' ? 'Close source desk' : '关闭来源服务台'}>×</button></div>
        <p className="source-desk-intro">{language === 'en' ? 'Reviewed public sources, project visual context, and bounded AI curation are kept visibly separate. None of these records implies a project partnership. Read each scope and limitation before opening an original source.' : '已核验公开来源、项目视觉语境与受限 AI 编排会清晰区分，且均不代表项目合作关系。打开原始来源前，请阅读每条记录的范围与限制。'}</p>
        <div className="source-topic-filter" role="group" aria-label={inline(language, 'Filter source topics', '筛选来源主题')}>{sourceDeskTopics.map((topic) => <button key={topic.id} type="button" className={sourceDeskTopic === topic.id ? 'source-topic active' : 'source-topic'} aria-pressed={sourceDeskTopic === topic.id} onClick={() => setSourceDeskTopic(topic.id)}>{localize(topic.label, language)}</button>)}</div>
        <div className="source-desk-list">{visibleSourceDeskEntries.map((entry) => <article className="source-entry" key={entry.id}><div className="source-entry-meta"><span>{sourceDeskLayer(entry)}</span><span>{sourceCheckedAt.get(entry.sourceRecordId) || '—'}</span><span>{inline(language, 'No partnership claim', '不宣称合作关系')}</span></div><div className="source-entry-copy"><h3>{localize(entry.title, language)}</h3><p className="source-publisher">{entry.publisher}</p><dl><div><dt>{inline(language, 'Scope', '范围')}</dt><dd>{localize(entry.scope, language)}</dd></div><div><dt>{inline(language, 'Limitation', '限制')}</dt><dd>{localize(entry.limitation, language)}</dd></div></dl>{entry.canonicalUrl && <a className="source-official-link" href={entry.canonicalUrl} target="_blank" rel="noopener noreferrer">{inline(language, 'Open original HTTPS source', '打开原始 HTTPS 来源')} <span aria-hidden="true">↗</span></a>}{entry.canonicalUrl && <button className={sourceDeskSourceId === entry.id ? 'source-select active' : 'source-select'} type="button" aria-pressed={sourceDeskSourceId === entry.id} onClick={() => { setSourceDeskSourceId(entry.id); setSourceDeskStatus('idle'); setSourceDeskError(''); setSourceDeskReference('') }}>{sourceDeskSourceId === entry.id ? inline(language, 'Selected for simulation', '已选作模拟交接来源') : inline(language, 'Use for simulation', '用于模拟交接')}</button>}</div></article>)}</div>
        {visibleSourceDeskEntries.length === 0 && <p className="source-desk-empty" role="status">{language === 'en' ? 'No reviewed source matches this topic. Choose All sources to continue.' : '没有与此主题匹配的已核验来源。请选择“全部来源”继续。'}</p>}
        {sourceDeskStatus === 'success' ? <div className="source-desk-receipt" aria-live="polite"><span className="mono-label">LOCAL SIMULATION RECEIPT</span><h3>{inline(language, 'The simulation completed locally.', '本地模拟交接已完成。')}</h3><p>{inline(language, 'Reference', '参考编号')}: <code>{sourceDeskReference}</code></p><p>{inline(language, 'No real institution was contacted. No partnership, booking, order, quote, eligibility decision, or commercial outcome was created.', '未联系任何真实机构；未建立合作，未产生预订、订单、报价、资格决定或商业结果。')}</p><button className="outline-button" type="button" onClick={() => setSourceDeskOpen(false)}>{inline(language, 'Return to the exhibition', '返回展厅')}</button></div> : <form className="source-simulation-form" onSubmit={(event) => { event.preventDefault(); submitSourceDeskHandoff() }}><fieldset><legend>{inline(language, 'Simulation purpose', '模拟交接目的')}</legend><div className="source-intents">{leadIntents.map((intent) => <button type="button" key={intent.id} className={sourceDeskIntent === intent.id ? 'source-intent active' : 'source-intent'} aria-pressed={sourceDeskIntent === intent.id} onClick={() => setSourceDeskIntent(intent.id)}>{localize(intent.label, language)}</button>)}</div></fieldset><label className="lead-consent"><input type="checkbox" checked={sourceDeskConsent} onChange={(event) => setSourceDeskConsent(event.target.checked)} /><span>{inline(language, 'I understand this is a local simulation only. No identity, enquiry, or institutional contact will be stored or sent.', '我理解这仅为本地模拟；不会存储或发送身份、咨询内容或机构联系信息。')}</span></label>{sourceDeskError && <p className="lead-error" role="alert">{sourceDeskError}</p>}<button className="lead-submit" type="submit" disabled={!sourceDeskConsent || sourceDeskStatus === 'sending' || !sourceDeskSourceId}>{sourceDeskStatus === 'sending' ? inline(language, 'Preparing local simulation…', '正在准备本地模拟…') : inline(language, 'Simulate operational handoff', '模拟运营交接')}</button></form>}
      </div>
    </div>}
    {leadOpen && <div className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-title">
      <div className="lead-sheet">
        <div className="lead-sheet-head"><div><p className="mono-label">HUMAN HANDOFF / LOCAL MVP</p><h2 id="lead-title">{language === 'en' ? 'Continue with a person' : '与真人继续沟通'}</h2></div><button className="close-button" type="button" onClick={() => setLeadOpen(false)} aria-label={language === 'en' ? 'Close handoff form' : '关闭交接表单'}>×</button></div>
        {leadStatus === 'success' ? <div className="lead-receipt" aria-live="polite"><span className="mono-label">LOCAL RECEIPT</span><h3>{language === 'en' ? 'Your request was accepted locally.' : '你的请求已在本地接收。'}</h3><p>{language === 'en' ? 'Reference' : '参考编号'}: <code>{leadReference}</code></p><p>{language === 'en' ? 'This is not a booking, quote, official service, or response guarantee. No commercial outcome has been confirmed.' : '这不是预订、报价、官方服务或响应保证，尚未确认任何商业结果。'}</p><button className="outline-button" type="button" onClick={() => setLeadOpen(false)}>{language === 'en' ? 'Return to the exhibition' : '返回展厅'}</button></div> : <form className="lead-form" onSubmit={(event) => { event.preventDefault(); submitLead() }}>
          <p className="lead-intro">{language === 'en' ? 'Choose one reason for a human follow-up. This form is not an order, booking, visa application, legal consultation, investment approval, or government service.' : '请选择一个需要人工跟进的原因。本表单不是订单、预订、签证申请、法律咨询、投资审批或政府服务。'}</p>
          <fieldset><legend>{inline(language, 'Your purpose', '你的目的')}</legend><div className="lead-intents">{leadIntents.map((intent) => <button type="button" key={intent.id} className={leadIntent === intent.id ? 'lead-intent active' : 'lead-intent'} aria-pressed={leadIntent === intent.id} onClick={() => setLeadIntent(intent.id)}><span>{intent.id.slice(0, 2).toUpperCase()}</span>{localize(intent.label, language)}</button>)}</div></fieldset>
          <label>{language === 'en' ? 'Email address' : '电子邮箱'}<input value={leadEmail} onChange={(event) => setLeadEmail(event.target.value)} type="email" autoComplete="email" required /></label>
          <div className="lead-optional"><label>{language === 'en' ? 'Name (optional)' : '姓名（可选）'}<input value={leadName} onChange={(event) => setLeadName(event.target.value)} autoComplete="name" maxLength={120} /></label><label>{language === 'en' ? 'Organisation (optional)' : '机构（可选）'}<input value={leadOrganization} onChange={(event) => setLeadOrganization(event.target.value)} autoComplete="organization" maxLength={160} /></label></div>
          <label>{language === 'en' ? 'Message' : '留言'}<textarea value={leadMessage} onChange={(event) => setLeadMessage(event.target.value)} required maxLength={1200} rows={5} /></label>
          <label className="lead-consent"><input type="checkbox" checked={leadConsent} onChange={(event) => setLeadConsent(event.target.checked)} /> <span>{language === 'en' ? 'I agree that this minimal enquiry may be used only for a future human follow-up. This local MVP does not store the request permanently.' : '我同意仅将此最小化咨询信息用于未来的人工跟进。本地 MVP 不会永久存储该请求。'}</span></label>
          {leadError && <p className="lead-error" role="alert">{leadError}</p>}
          <button className="lead-submit" type="submit" disabled={!leadConsent || leadStatus === 'sending'}>{leadStatus === 'sending' ? (language === 'en' ? 'Sending a handoff request…' : '正在发送交接请求…') : (language === 'en' ? 'Request human follow-up' : '请求人工跟进')}</button>
        </form>}
      </div>
    </div>}
    {mediaOpen && <div className="media-modal" role="dialog" aria-modal="true" aria-labelledby="media-title">
      <div className="media-modal-inner">
        <div className="media-modal-head"><div><span className="mono-label">{zoneMeta} / MEDIA PREVIEW</span><h2 id="media-title">{zone.title[language]}</h2></div><button className="close-button" onClick={() => setMediaOpen(false)} aria-label={t.close}>×</button></div>
        {!zone.video || mediaFailed ? <div className="media-fallback"><p>{zone.video ? (language === 'en' ? 'The motion file is unavailable. The still image remains available for reading.' : '动态媒体暂时不可用，静态图像仍可继续阅读。') : (language === 'en' ? 'This room uses a project-supplied still image for orientation. Open the immersive hall for the spatial experience.' : '本展厅使用项目提供的静态图像进行导览。请进入沉浸展厅获得空间体验。')}</p><img src={zone.poster} alt={zone.title[language]} /></div> : <video controls autoPlay playsInline preload="metadata" poster={zone.poster} onError={() => setMediaFailed(true)}><source src={zone.video} type="video/mp4" /><p>{language === 'en' ? 'Your browser does not support video.' : '你的浏览器不支持视频。'}</p></video>}
      </div>
    </div>}
  </div>
}

export default App
