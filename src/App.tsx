import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { copy, Language, zones } from './data'
import sourceDeskData from '../knowledge/source-desk.json'
import sourceRegistryData from '../knowledge/source-registry.json'

const LiMiaoImmersiveHall = lazy(() => import('./components/LiMiaoImmersiveHall'))

type SourceDeskEntry = {
  id: string
  sourceRecordId: string
  displayKind: 'verified_source' | 'service_orientation'
  status: 'reviewed' | 'needs_review' | 'expired' | 'blocked'
  title: { en: string; zh: string }
  publisher: string
  canonicalUrl: string
  topics: string[]
  scope: { en: string; zh: string }
  limitation: { en: string; zh: string }
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
const sourceCheckedAt = new Map(sourceRegistryData.records.map((record) => [record.id, record.checkedAt]))
const publicApiBaseUrl = (import.meta.env.VITE_LUOYIN_API_BASE_URL || '').trim().replace(/\/+$/, '')
const apiPath = (path: string) => `${publicApiBaseUrl}${path}`

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const [activeZone, setActiveZone] = useState(0)
  const [guideOpen, setGuideOpen] = useState(false)
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
  const [activeNav, setActiveNav] = useState(1)
  const [exhibitionMenuOpen, setExhibitionMenuOpen] = useState(false)
  const [hallNotice, setHallNotice] = useState('')
  const [isLimiaoHall, setIsLimiaoHall] = useState(() => window.location.hash === '#limiao-hall')
  const exhibitionRef = useRef<HTMLElement>(null)
  const guideTranscriptRef = useRef<HTMLDivElement>(null)
  const guideInputRef = useRef<HTMLInputElement>(null)
  const t = copy[language]
  const heroSubtitle = language === 'en' ? 'Hainan, more than an island.' : '海南，不止一座岛'
  const zone = zones[activeZone]
  const guideState = loading ? 'listening' : zone.id === 'huali' ? 'resonance' : zone.id === 'lijin' ? 'focus' : 'listening'
  const leadIntents = [
    { id: 'culture-collaboration', en: 'Cultural collaboration', zh: '文化合作' },
    { id: 'responsible-travel', en: 'Responsible travel planning', zh: '负责任的旅行规划' },
    { id: 'craft-material', en: 'Craft & material inquiry', zh: '工艺与材料咨询' },
    { id: 'media-partnership', en: 'Media partnership', zh: '媒体合作' },
    { id: 'free-trade-port', en: 'Free Trade Port orientation', zh: '自贸港信息导览' },
  ]
  const sourceDeskTopics = [
    { id: 'all', en: 'All sources', zh: '全部来源' },
    { id: 'heritage', en: 'Heritage', zh: '文化与非遗' },
    { id: 'free-trade-port', en: 'Free Trade Port', zh: '自贸港' },
  ]
  const visibleSourceDeskEntries = sourceDeskEntries.filter((entry) => entry.status === 'reviewed' && (sourceDeskTopic === 'all' || entry.topics.includes(sourceDeskTopic)))

  const scrollToExhibition = () => {
    const target = exhibitionRef.current
    if (target) window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' })
  }

  const switchZone = (index: number) => {
    setActiveZone(index)
    setMediaOpen(false)
    setMediaFailed(false)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setGuideOpen(false)
        setSourceDeskOpen(false)
        setMediaOpen(false)
        setExhibitionMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const syncHallRoute = () => setIsLimiaoHall(window.location.hash === '#limiao-hall')
    window.addEventListener('hashchange', syncHallRoute)
    return () => window.removeEventListener('hashchange', syncHallRoute)
  }, [])

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
    setIsLimiaoHall(true)
  }

  const openZoneHall = (index: number) => {
    setExhibitionMenuOpen(false)
    if (zones[index]?.id === 'lijin') {
      openLimiaoHall()
      return
    }
    const message = language === 'en' ? `${zones[index]?.title.en || 'This hall'} is in development.` : `${zones[index]?.title.zh || '该展厅'}正在开发中。`
    setHallNotice(message)
    window.setTimeout(() => setHallNotice(''), 3200)
  }

  const exitLimiaoHall = () => {
    window.location.hash = 'exhibition'
    setIsLimiaoHall(false)
    window.setTimeout(() => scrollToTarget('exhibition', 1, 1), 0)
  }

  const submitQuestion = async () => {
    const trimmed = question.trim()
    if (!trimmed || loading) return
    setLoading(true)
    const visitorMessage: GuideMessage = { id: `visitor-${Date.now()}`, role: 'visitor', text: trimmed, zoneTitle: zone.title[language] }
    setGuideMessages((messages) => [...messages, visitorMessage].slice(-24))
    let completed = false
    try {
      const response = await fetch(apiPath('/api/luoyin'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question: trimmed, language, zoneId: zone.id }) })
      const payload = await response.json() as { answer?: string; layer?: string; sourceLabel?: string; sourceUrl?: string | null; sourceClass?: string; sourceStatus?: string; handoff?: boolean; mode?: 'local' | 'mock' | 'glm' | 'fallback' }
      if (!payload.answer) throw new Error('empty_response')
      const guideMessage: GuideMessage = { id: `guide-${Date.now()}`, role: 'guide', text: payload.answer || '', zoneTitle: zone.title[language], layer: payload.layer || 'local_contextual_guide', sourceLabel: payload.sourceLabel || (language === 'en' ? 'Local contextual guide' : '本地语境导览'), sourceUrl: payload.sourceUrl || null, sourceClass: payload.sourceClass || '', sourceStatus: payload.sourceStatus || '', mode: payload.mode === 'glm' ? 'glm' : payload.mode === 'fallback' ? 'fallback' : payload.mode === 'local' ? 'local' : 'mock' }
      setGuideMessages((messages) => [...messages, guideMessage].slice(-24))
      completed = true
    } catch {
      const fallbackMessage: GuideMessage = { id: `fallback-${Date.now()}`, role: 'guide', text: zone.guide[language], zoneTitle: zone.title[language], layer: language === 'en' ? 'offline fallback' : '离线本地回退', sourceLabel: language === 'en' ? 'Offline local fallback' : '离线本地回退', sourceClass: 'ai_suggestion', sourceStatus: 'blocked', mode: 'error' }
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

  return <div className="site-shell">
    {isLimiaoHall ? <Suspense fallback={<main className="limiao-loading">Opening the Li &amp; Miao Immersive Hall…</main>}><LiMiaoImmersiveHall language={language} onToggleLanguage={() => setLanguage(language === 'en' ? 'zh' : 'en')} onExit={exitLimiaoHall} onOpenGuide={(exhibit) => { setActiveZone(1); setQuestion(language === 'en' ? `Tell me about ${exhibit.title.en}.` : `请介绍${exhibit.title.zh}。`); setGuideOpen(true) }} /></Suspense> : <>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="HAINAN QIONGVERSE home">
        <img className="project-logo" src="/assets/logo.png" alt="QIONGVERSE project logo" />
        <span className="brand-name">HAINAN<br />QIONGVERSE</span>
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <a className={activeNav === 0 ? 'nav-link active' : 'nav-link'} href="#top" onClick={(event) => { event.preventDefault(); setExhibitionMenuOpen(false); scrollToTarget('top', 0) }}>{t.nav[0]}</a>
        <div className="nav-menu-wrap">
          <button className={activeNav === 1 ? 'nav-link nav-menu-trigger active' : 'nav-link nav-menu-trigger'} type="button" aria-haspopup="true" aria-expanded={exhibitionMenuOpen} aria-controls="exhibition-menu" onClick={() => setExhibitionMenuOpen((open) => !open)}>{t.nav[1]}<span className="menu-caret" aria-hidden="true">⌄</span></button>
          {exhibitionMenuOpen && <>
            <button className="nav-menu-backdrop" aria-label={t.menuLabel} onClick={() => setExhibitionMenuOpen(false)} />
            <div id="exhibition-menu" className="nav-menu" role="menu" aria-label={t.nav[1]}>
              {zones.map((item, index) => <a key={item.id} href={item.id === 'lijin' ? '#limiao-hall' : '#exhibition'} role="menuitem" onClick={(event) => { event.preventDefault(); openZoneHall(index) }}><span>{item.index}</span>{item.title[language]}</a>)}
            </div>
          </>}
        </div>
        <a className={activeNav === 2 ? 'nav-link active' : 'nav-link'} href="#free-trade-port-hall" onClick={(event) => { event.preventDefault(); setExhibitionMenuOpen(false); scrollToTarget('free-trade-port-hall', 2) }}>{t.nav[2]}</a>
      </nav>
      <div className="header-actions">
        <button className="language-toggle" onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} aria-label="Switch language">
          <span className={language === 'en' ? 'selected' : ''}>EN</span><span className="slash">/</span><span className={language === 'zh' ? 'selected' : ''}>中</span>
        </button>
        <button className="guide-trigger" onClick={() => setGuideOpen(true)} aria-label={t.open}>◎ <span>Luoyin</span></button>
      </div>
    </header>

    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <picture className="hero-media">
          <source media="(max-width: 700px)" srcSet="/assets/user-media2/interactive-map-overview/海南岛浮空微缩地图.png" />
          <img src="/assets/user-media2/interactive-map-overview/海南岛浮空微缩地图.png" alt="A floating miniature map of Hainan Province" onError={(event) => { event.currentTarget.src = '/assets/hero/hero-dongfang-showroom-loop-poster.webp' }} />
        </picture>
        <div className="hero-shade" />
        <div className="hero-archive-index" aria-hidden="true"><span>01</span><i /><small>QIONGVERSE<br />FIELD ENTRY</small></div>
        <div className="hero-shell-contour" aria-hidden="true"><span /><span /><span /></div>
        <div className="hero-content">
          <p className="eyebrow">{t.heroEyebrow}</p>
          <h1 id="hero-title"><span>HAINAN∞QIONGVERSE</span><span>琼境</span></h1>
          <p className="hero-body">{heroSubtitle}</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={scrollToExhibition}>{t.enter}<span>↗</span></button>
            <button className="text-button" onClick={() => setGuideOpen(true)}>{t.listen}<span>◌</span></button>
          </div>
        </div>
        <div className="hero-mark" aria-hidden="true"><span>01</span><i /></div>
        <div className="hero-caption"><span>Hainan Province / 海南省</span><span>Archive opens now</span></div>
      </section>

      {false && <section className="intro-band" aria-label="Exhibition introduction">
        <div className="intro-quote">“The sea has a memory,<br /><em>and wood remembers in rings.</em>”</div>
        <div className="intro-detail"><span className="mono-label">SHELLSONG / FIELD NOTE 001</span><p>Luoyin translates the island through sound, light and small acts of attention. This is a fictional guide layer inside a real, supplied visual archive.</p></div>
      </section>}

      <section className="free-trade-portal" id="free-trade-main-hall" aria-labelledby="free-trade-portal-title">
        <div className="free-trade-portal-copy">
          <p className="eyebrow">{language === 'en' ? '05 / HAINAN PROVINCE' : '05 / 海南省'}</p>
          <h2 id="free-trade-portal-title">{language === 'en' ? 'Free Trade Port Main Hall' : '自贸港主展厅'}</h2>
          <p>{language === 'en' ? 'A public reading entrance for checking current Hainan Free Trade Port information through reviewed official sources.' : '面向公众的阅读入口，通过已核验的官方来源了解当前海南自由贸易港信息。'}</p>
          <div className="free-trade-portal-actions"><a className="primary-button" href="#free-trade-port-hall" onClick={(event) => { event.preventDefault(); scrollToTarget('free-trade-port-hall', 2) }}>{language === 'en' ? 'Enter main hall' : '进入主展厅'} <span>↗</span></a><button className="outline-button" onClick={() => scrollToTarget('exhibition', 1)}>{language === 'en' ? 'Open virtual halls' : '打开虚拟展厅'} <span>↗</span></button><button className="archive-text-action" onClick={() => setGuideOpen(true)}>{language === 'en' ? 'Ask Luoyin for orientation' : '询问螺音导览'}</button></div>
          <small>{language === 'en' ? 'Public-information orientation only. Not a policy approval, eligibility check or commercial promise.' : '仅作公共信息导览，不构成政策审批、资格判断或商业承诺。'}</small>
        </div>
      </section>

      <section className="exhibition" id="exhibition" ref={exhibitionRef} aria-labelledby="exhibition-title">
        <div className="section-heading">
          <div><p className="eyebrow dark">{t.zonesEyebrow}</p><h2 id="exhibition-title">{t.zonesTitle}</h2></div>
          <p className="section-body">{t.zonesBody}</p>
        </div>
        <div className="zone-nav" role="tablist" aria-label="Exhibition zones">
          {zones.map((item, index) => <button id={`zone-tab-${index}`} key={item.id} role="tab" aria-selected={activeZone === index} tabIndex={activeZone === index ? 0 : -1} className={activeZone === index ? 'zone-tab active' : 'zone-tab'} onClick={() => switchZone(index)} onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); moveZone(1) } if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); moveZone(-1) } }}><span>{item.index}</span>{item.title[language]}</button>)}
        </div>
        <div className={`zone-stage ${zone.tone}`}>
          <div className="zone-image-wrap">
            <picture><source media="(max-width: 700px)" srcSet={zone.mobileImage} /><img src={zone.image} alt={zone.title[language]} onError={(event) => { event.currentTarget.src = zone.poster }} /></picture>
            <div className="image-caption"><span>{zoneMeta}</span><span>{t.source}</span></div>
            <button className="media-play" aria-label={`Preview ${zone.title.en}`} onClick={() => { setMediaFailed(false); setMediaOpen(true) }}>▶</button>
          </div>
          <div className="zone-copy">
            <div className="zone-copy-top"><span className="zone-tag">{zone.tag[language]}</span><span className="zone-signal" aria-label="Zone signal">◌ {zone.id === 'huali' ? 'resonance' : 'listening'}</span></div>
            <h3>{zone.title[language]}</h3>
            <p className="zone-kicker">{zone.kicker[language]}</p>
            <p className="zone-description">{zone.description[language]}</p>
            <div className="zone-detail-image"><img src={zone.banner} alt="" onError={(event) => { event.currentTarget.src = zone.poster }} /></div>
            <div className="zone-footer"><span>{language === 'en' ? 'Read the room' : '阅读展室'}</span><span className="arrow">↗</span></div>
            {zone.id === 'lijin' && <button className="limiao-entry" type="button" onClick={openLimiaoHall}>{language === 'en' ? 'Enter immersive hall' : '进入沉浸展厅'} <span>↗</span></button>}
          </div>
        </div>
        <div className="tide-line" aria-hidden="true">{zones.map((item, index) => <span key={item.id} className={activeZone === index ? 'tide-dot active' : 'tide-dot'} />)}</div>
      </section>

      <section className="archive-note" id="archive-note">
        <div className="note-image"><img src="/assets/user-media2/ocean-wave.jpg" alt="Close-up texture of an ocean wave" onError={(event) => { event.currentTarget.src = '/assets/hero/hero-dongfang-showroom-safe.webp' }} /></div>
        <div className="note-copy"><p className="eyebrow dark">{language === 'en' ? 'A NOTE ON THE ARCHIVE' : '关于这座档案馆'}</p><h2>{language === 'en' ? 'A museum can be a threshold.' : '博物馆也可以是一道门。'}</h2><p>{language === 'en' ? 'The archive is built from supplied project media and a fictional ShellSong guide layer. Every future fact, policy or partnership claim will carry a source before it enters the room.' : '档案馆由项目提供的媒体素材与虚构的螺音导览层构成。未来每一条事实、政策或合作信息，都将在进入展室前标注来源。'}</p><div className="note-actions"><button className="outline-button" onClick={openSourceDesk}>{language === 'en' ? 'Verified Source Desk' : '已核验来源服务台'} <span>↗</span></button><button className="archive-text-action" onClick={() => setGuideOpen(true)}>{t.open}</button></div></div>
      </section>

      <section className="free-trade-hall" id="free-trade-port-hall" aria-labelledby="free-trade-title">
        <div className="free-trade-intro">
          <div className="free-trade-index"><span>05</span><i /><small>HAINAN PROVINCE<br />PUBLIC READING ROOM</small></div>
          <div>
            <p className="eyebrow">{language === 'en' ? 'PROVINCE / PUBLIC INFORMATION' : '海南省 / 公共信息'}</p>
            <h2 id="free-trade-title">{language === 'en' ? 'A reading room for the Free Trade Port.' : '一间关于自贸港的阅读室。'}</h2>
            <p className="free-trade-lede">{language === 'en' ? 'Hainan is the wider field of this archive. This room points to public materials so visitors can check current information for themselves.' : '海南省是这座档案馆更大的叙事场域。本展室指向公开资料，方便访客自行核验当前信息。'}</p>
          </div>
        </div>
        <div className="free-trade-reading">
          <div className="free-trade-image"><img loading="lazy" src="/assets/user-media2/自贸港主厅/自贸港建设图.png" alt="Project-supplied visual context for a Hainan Free Trade Port main hall" onError={(event) => { event.currentTarget.src = '/assets/hero/hero-dongfang-showroom-safe.webp' }} /><span className="image-caption">{language === 'en' ? 'Project-supplied visual context / not an official policy document' : '项目提供的视觉语境 / 非官方政策文件'}</span></div>
          <div className="free-trade-copy">
            <p className="mono-label">SOURCE 02 / REVIEWED ENTRY POINT</p>
            <h3>{language === 'en' ? 'Hainan Free Trade Port official English portal' : '海南自由贸易港英文官方门户'}</h3>
            <p>{language === 'en' ? 'Use the official portal to check current public notices and policy materials. Luoyin can help you find the doorway, but cannot decide what applies to you.' : '可通过英文官方门户核查当前公开通知与政策资料。螺音可以帮助你找到入口，但不能替你判断具体规则是否适用。'}</p>
            <div className="free-trade-scope"><div><span>{language === 'en' ? 'SCOPE' : '范围'}</span><p>{language === 'en' ? 'Public notices and policy reading entry point.' : '公开通知与政策资料的阅读入口。'}</p></div><div><span>{language === 'en' ? 'LIMIT' : '限制'}</span><p>{language === 'en' ? 'Not official advice, eligibility, tax, visa, customs, investment or commercial confirmation.' : '不构成官方建议、资格、税务、签证、通关、投资或商业确认。'}</p></div></div>
            <div className="free-trade-actions"><a className="primary-button" href="https://en.hnftp.gov.cn/" target="_blank" rel="noopener noreferrer">{language === 'en' ? 'Open official portal' : '打开英文官方门户'} <span>↗</span></a><button className="outline-button" onClick={() => scrollToTarget('exhibition', 1)}>{language === 'en' ? 'Return to the five halls' : '返回五个分展厅'} <span>↗</span></button><button className="archive-text-action" onClick={() => setGuideOpen(true)}>{language === 'en' ? 'Ask Luoyin about this source' : '询问螺音关于此来源'}</button></div>
            <p className="free-trade-disclaimer">{language === 'en' ? 'Reviewed source metadata: Hainan Free Trade Port official English portal / checked 2026-08-14. This project does not claim government affiliation.' : '已核验来源元数据：海南自由贸易港英文官方门户 / 核验日期 2026-08-14。本项目不宣称政府关联。'}</p>
          </div>
        </div>
      </section>
    </main>
    {hallNotice && <div className="hall-notice" role="status" aria-live="polite">{hallNotice}</div>}

    <footer className="site-footer"><img src="/assets/brand/qiongverse-wordmark-en.svg" alt="HAINAN QIONGVERSE" /><span>{t.footer}</span><span className="footer-code">TIDE ARCHIVE / 2026</span></footer>
    </>}

    <div className={guideOpen ? 'guide-drawer open' : 'guide-drawer'} role="dialog" aria-modal="true" aria-labelledby="guide-title">
      <div className="guide-top"><div className="guide-identity"><div className="guide-orb">◎</div><div><p className="mono-label">SHELLSONG / 螺音</p><h2 id="guide-title">{t.guideTitle}</h2></div></div><button className="close-button" onClick={() => setGuideOpen(false)} aria-label={t.close}>×</button></div>
      <div className="guide-character"><img src="/luoyin/luoyin.png" alt="Luoyin, the ShellSong digital guide" onError={(event) => { event.currentTarget.src = '/assets/luoyin/luoyin-guide-focus.webp' }} /><div className="guide-state"><span className="state-dot" /> {guideState} / {zone.title[language]}</div></div>
      <p className="guide-body">{t.guideBody}</p>
      <button className="source-desk-trigger" type="button" onClick={openSourceDesk}>{language === 'en' ? 'Verified Source Desk' : '已核验来源服务台'} <span>↗</span></button>
      <button className="lead-trigger" type="button" onClick={() => { resetLead(); setLeadOpen(true) }}>{language === 'en' ? 'Request human follow-up' : '请求人工跟进'} <span>↗</span></button>
      <div className="guide-answer-area" ref={guideTranscriptRef} aria-live="polite" aria-busy={loading} aria-label={language === 'en' ? 'Conversation with Luoyin' : '与螺音的对话'}>{guideMessages.length === 0 && <p className="guide-welcome">{language === 'en' ? 'Begin anywhere. I will keep this conversation here while the drawer stays open.' : '从任何问题开始。抽屉保持打开时，我会在这里保留这段对话。'}</p>}{guideMessages.map((message) => message.role === 'visitor' ? <div className="guide-message visitor-message" key={message.id}><span className="message-label">{language === 'en' ? 'YOU' : '你'} / {message.zoneTitle}</span><p>{message.text}</p></div> : <div className="guide-message guide-message-reply" key={message.id}><div className="answer-meta"><span className="answer-label">{message.mode === 'fallback' || message.mode === 'error' ? (language === 'en' ? 'offline fallback' : '离线本地回退') : message.mode === 'local' ? (language === 'en' ? 'local contextual guide' : '本地语境导览') : message.mode === 'glm' ? (language === 'en' ? 'GLM guide response' : 'GLM 导览回答') : message.layer || t.mock}</span>{message.sourceLabel && !(message.mode === 'local' && (message.sourceLabel === 'Local contextual guide' || message.sourceLabel === '本地语境导览')) && <span className="answer-source">{message.sourceLabel}</span>}{message.sourceUrl && <a className="answer-source answer-source-link" href={message.sourceUrl} target="_blank" rel="noopener noreferrer">{language === 'en' ? 'Open reviewed source' : '打开已核验来源'}</a>}{message.sourceClass && message.sourceClass !== 'local_contextual_guide' && <span className="answer-source-class">{message.sourceClass.replaceAll('_', ' ')}</span>}{message.sourceStatus && message.sourceStatus !== 'local' && <span className="answer-source-status">{message.sourceStatus}</span>}</div><p className="guide-answer">{message.text}</p></div>)}{loading && <p className="guide-answer loading">{language === 'en' ? 'Listening to the tide...' : '正在听潮声……'}</p>}</div>
      <div className="guide-input"><input ref={guideInputRef} value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitQuestion() }} placeholder={t.guideInput} aria-label={t.guideInput} /><button onClick={submitQuestion} disabled={loading || !question.trim()} aria-label={t.send}>↗</button></div>
      <p className="guide-disclaimer">{guideServiceMode === 'checking' ? (language === 'en' ? 'Checking guide service...' : '正在检查导览服务……') : guideServiceMode === 'glm' ? (language === 'en' ? 'Live GLM guide is connected. Current or regulated details should be checked against a primary source.' : '实时 GLM 导览已连接。涉及当前或受监管的详情，请以权威一手来源为准。') : guideServiceMode === 'local' ? (language === 'en' ? 'Local contextual guide is active. Live GLM needs a service-process API key.' : '本地语境导览正在运行。实时 GLM 需要在服务进程中配置 API 密钥。') : (language === 'en' ? 'Guide service status is unavailable. Local replies remain available.' : '导览服务状态暂不可用，本地回答仍可使用。')}</p>
    </div>
    {guideOpen && <button className="drawer-backdrop" onClick={() => setGuideOpen(false)} aria-label={t.close} />}
    {sourceDeskOpen && <div className="source-desk-modal" role="dialog" aria-modal="true" aria-labelledby="source-desk-title">
      <div className="source-desk-sheet">
        <div className="lead-sheet-head"><div><p className="mono-label">SOURCE DESK / REVIEWED ENTRY POINTS</p><h2 id="source-desk-title">{language === 'en' ? 'Verified Source Desk' : '已核验来源服务台'}</h2></div><button className="close-button" type="button" onClick={() => setSourceDeskOpen(false)} aria-label={language === 'en' ? 'Close source desk' : '关闭来源服务台'}>×</button></div>
        <p className="source-desk-intro">{language === 'en' ? 'Reviewed public source and service entry points, not project partners. Read each scope and limitation before opening its official page. If the original page is currently unavailable, this publisher, scope, and limitation note remains the usable record.' : '已核验的公开来源与服务入口，不代表项目合作关系。打开官方页面前，请阅读每条来源的范围与限制。若原始页面当前不可用，这里的机构、范围与限制说明仍然保留。'}</p>
        <div className="source-topic-filter" role="group" aria-label={language === 'en' ? 'Filter source topics' : '筛选来源主题'}>{sourceDeskTopics.map((topic) => <button key={topic.id} type="button" className={sourceDeskTopic === topic.id ? 'source-topic active' : 'source-topic'} aria-pressed={sourceDeskTopic === topic.id} onClick={() => setSourceDeskTopic(topic.id)}>{language === 'en' ? topic.en : topic.zh}</button>)}</div>
        <div className="source-desk-list">{visibleSourceDeskEntries.map((entry) => <article className="source-entry" key={entry.id}><div className="source-entry-meta"><span>{entry.displayKind.replaceAll('_', ' ')}</span><span>{language === 'en' ? 'Reviewed' : '已核验'} / {sourceCheckedAt.get(entry.sourceRecordId) || '—'}</span><span>{language === 'en' ? 'No partnership claim' : '不宣称合作关系'}</span></div><div className="source-entry-copy"><h3>{entry.title[language]}</h3><p className="source-publisher">{entry.publisher}</p><dl><div><dt>{language === 'en' ? 'Scope' : '范围'}</dt><dd>{entry.scope[language]}</dd></div><div><dt>{language === 'en' ? 'Limitation' : '限制'}</dt><dd>{entry.limitation[language]}</dd></div></dl><a className="source-official-link" href={entry.canonicalUrl} target="_blank" rel="noopener noreferrer">{language === 'en' ? 'Open official HTTPS source' : '打开官方 HTTPS 来源'} <span aria-hidden="true">↗</span></a><button className={sourceDeskSourceId === entry.id ? 'source-select active' : 'source-select'} type="button" aria-pressed={sourceDeskSourceId === entry.id} onClick={() => { setSourceDeskSourceId(entry.id); setSourceDeskStatus('idle'); setSourceDeskError(''); setSourceDeskReference('') }}>{sourceDeskSourceId === entry.id ? (language === 'en' ? 'Selected for simulation' : '已选作模拟交接来源') : (language === 'en' ? 'Use for simulation' : '用于模拟交接')}</button></div></article>)}</div>
        {visibleSourceDeskEntries.length === 0 && <p className="source-desk-empty" role="status">{language === 'en' ? 'No reviewed source matches this topic. Choose All sources to continue.' : '没有与此主题匹配的已核验来源。请选择“全部来源”继续。'}</p>}
        {sourceDeskStatus === 'success' ? <div className="source-desk-receipt" aria-live="polite"><span className="mono-label">LOCAL SIMULATION RECEIPT</span><h3>{language === 'en' ? 'The simulation completed locally.' : '本地模拟交接已完成。'}</h3><p>{language === 'en' ? 'Reference' : '参考编号'}: <code>{sourceDeskReference}</code></p><p>{language === 'en' ? 'No real institution was contacted. No partnership, booking, order, quote, eligibility decision, or commercial outcome was created.' : '未联系任何真实机构；未建立合作，未产生预订、订单、报价、资格决定或商业结果。'}</p><button className="outline-button" type="button" onClick={() => setSourceDeskOpen(false)}>{language === 'en' ? 'Return to the exhibition' : '返回展厅'}</button></div> : <form className="source-simulation-form" onSubmit={(event) => { event.preventDefault(); submitSourceDeskHandoff() }}><fieldset><legend>{language === 'en' ? 'Simulation purpose' : '模拟交接目的'}</legend><div className="source-intents">{leadIntents.map((intent) => <button type="button" key={intent.id} className={sourceDeskIntent === intent.id ? 'source-intent active' : 'source-intent'} aria-pressed={sourceDeskIntent === intent.id} onClick={() => setSourceDeskIntent(intent.id)}>{language === 'en' ? intent.en : intent.zh}</button>)}</div></fieldset><label className="lead-consent"><input type="checkbox" checked={sourceDeskConsent} onChange={(event) => setSourceDeskConsent(event.target.checked)} /><span>{language === 'en' ? 'I understand this is a local simulation only. No identity, enquiry, or institutional contact will be stored or sent.' : '我理解这仅为本地模拟；不会存储或发送身份、咨询内容或机构联系信息。'}</span></label>{sourceDeskError && <p className="lead-error" role="alert">{sourceDeskError}</p>}<button className="lead-submit" type="submit" disabled={!sourceDeskConsent || sourceDeskStatus === 'sending' || !sourceDeskSourceId}>{sourceDeskStatus === 'sending' ? (language === 'en' ? 'Preparing local simulation…' : '正在准备本地模拟…') : (language === 'en' ? 'Simulate operational handoff' : '模拟运营交接')}</button></form>}
      </div>
    </div>}
    {leadOpen && <div className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-title">
      <div className="lead-sheet">
        <div className="lead-sheet-head"><div><p className="mono-label">HUMAN HANDOFF / LOCAL MVP</p><h2 id="lead-title">{language === 'en' ? 'Continue with a person' : '与真人继续沟通'}</h2></div><button className="close-button" type="button" onClick={() => setLeadOpen(false)} aria-label={language === 'en' ? 'Close handoff form' : '关闭交接表单'}>×</button></div>
        {leadStatus === 'success' ? <div className="lead-receipt" aria-live="polite"><span className="mono-label">LOCAL RECEIPT</span><h3>{language === 'en' ? 'Your request was accepted locally.' : '你的请求已在本地接收。'}</h3><p>{language === 'en' ? 'Reference' : '参考编号'}: <code>{leadReference}</code></p><p>{language === 'en' ? 'This is not a booking, quote, official service, or response guarantee. No commercial outcome has been confirmed.' : '这不是预订、报价、官方服务或响应保证，尚未确认任何商业结果。'}</p><button className="outline-button" type="button" onClick={() => setLeadOpen(false)}>{language === 'en' ? 'Return to the exhibition' : '返回展厅'}</button></div> : <form className="lead-form" onSubmit={(event) => { event.preventDefault(); submitLead() }}>
          <p className="lead-intro">{language === 'en' ? 'Choose one reason for a human follow-up. This form is not an order, booking, visa application, legal consultation, investment approval, or government service.' : '请选择一个需要人工跟进的原因。本表单不是订单、预订、签证申请、法律咨询、投资审批或政府服务。'}</p>
          <fieldset><legend>{language === 'en' ? 'Your purpose' : '你的目的'}</legend><div className="lead-intents">{leadIntents.map((intent) => <button type="button" key={intent.id} className={leadIntent === intent.id ? 'lead-intent active' : 'lead-intent'} aria-pressed={leadIntent === intent.id} onClick={() => setLeadIntent(intent.id)}><span>{intent.id.slice(0, 2).toUpperCase()}</span>{language === 'en' ? intent.en : intent.zh}</button>)}</div></fieldset>
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
        {mediaFailed ? <div className="media-fallback"><p>{language === 'en' ? 'The motion file is unavailable. The still image remains available for reading.' : '动态媒体暂时不可用，静态图像仍可继续阅读。'}</p><img src={zone.poster} alt={zone.title[language]} /></div> : <video controls autoPlay playsInline preload="metadata" poster={zone.poster} onError={() => setMediaFailed(true)}><source src={zone.video} type="video/mp4" /><p>{language === 'en' ? 'Your browser does not support video.' : '你的浏览器不支持视频。'}</p></video>}
      </div>
    </div>}
  </div>
}

export default App
