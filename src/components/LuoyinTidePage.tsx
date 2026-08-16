import { useEffect, useRef, useState } from 'react'
import type { Language } from '../data'
import { inline, translateProjectText } from '../i18n'
import LanguageSelector from './LanguageSelector'
import { ShellSongModel } from './ShellSongModel'
import { publicMedia } from '../public-media'
import './luoyin-tide.css'

type PosterRatio = 'square' | 'portrait' | 'story'
type Props = { language: Language; onChangeLanguage: (language: Language) => void; onExit: () => void; onOpenHall?: (themeId: string) => void; onAskLuoyin?: (themeId: string) => void }

type Copy = {
  nav: string[]
  soundOn: string
  soundOff: string
  pause: string
  play: string
  replay: string
  fiction: string
  originKicker: string
  originTitle: string
  origin: { title: string; body: string }[]
  signalsKicker: string
  signalsTitle: string
  signalsBody: string
  signals: { term: string; body: string }[]
  diaryKicker: string
  diaryTitle: string
  diary: { title: string; body: string; image: string }[]
  shareKicker: string
  shareTitle: string
  shareBody: string
  chooseLine: string
  choosePose: string
  chooseRatio: string
  download: string
  share: string
  copy: string
  shareStatus: string
  footer: string
}

const copy: Partial<Record<Language, Copy>> = {
  en: {
    nav: ['Origin', 'Signals', 'Tide Diary', 'Cast a Bubble'], soundOn: 'Sound on', soundOff: 'Sound off', pause: 'Pause CG', play: 'Play CG', replay: 'Replay CG', fiction: 'ShellSong is an original fictional character. Her world is a story, not a historical or official account.',
    originKicker: '01 / ORIGIN OF A SONG', originTitle: 'Three memories became one small voice.',
    origin: [
      { title: 'The light', body: 'When an ancient rosewood spirit broke apart, one quiet thread of light chose not to become a tree again.' },
      { title: 'The conch', body: 'At a tide pool on Hainan’s east coast, a pink conch had held sea songs, fishing calls and monsoon rain for a thousand years.' },
      { title: 'The first dawn', body: 'Moonlight, saltwater and the small remaining light met in the spiral. At dawn, ShellSong looked out and began to listen.' },
    ],
    signalsKicker: '02 / CHARACTER SIGNALS', signalsTitle: 'Read the details that make her ShellSong.', signalsBody: 'She is tiny by design, but every detail carries a different kind of listening.',
    signals: [
      { term: 'Wave hair', body: 'Blue tide hair holds a thread of amber rosewood light.' }, { term: 'Conch ears', body: 'Small spiral ears turn toward the farthest water-borne sound.' }, { term: 'Rosewood sprout', body: 'A tiny sprout bends with the tide and stands tall when resonance is near.' }, { term: 'Pink conch', body: 'Her conch is both home and instrument: it listens, then carries a song onward.' }, { term: 'Foam base', body: 'She has no wings. A soft piece of sea foam keeps her aloft.' },
    ],
    diaryKicker: '03 / TIDE DIARY', diaryTitle: 'One small guide, six ways to listen.',
    diary: [
      { title: 'Curious', body: 'Every new sound makes her lean closer.', image: '/shellsong/images/curious.webp' }, { title: 'Listening', body: 'She holds the conch near and lets the tide speak first.', image: '/shellsong/images/listening.webp' }, { title: 'Resonance', body: 'Near a fragment of memory, sea foam takes on a quiet amber glow.', image: '/shellsong/images/resonance.webp' }, { title: 'Celebration', body: 'When a voice is found, she spins and leaves a bright trail of bubbles.', image: '/shellsong/images/celebration.webp' }, { title: 'Dreaming', body: 'After a long tide, she folds into her shell and lets the coast keep watch.', image: '/shellsong/images/sleeping.webp' }, { title: 'Flying', body: 'A little foam is enough to carry a very large heart.', image: '/shellsong/images/flying.webp' },
    ],
    shareKicker: '04 / BUBBLE CASTING STATION', shareTitle: 'Send one small song outward.', shareBody: 'Compose an original ShellSong image in this browser. Nothing is uploaded, saved or linked to an account.', chooseLine: 'Choose a line', choosePose: 'Choose a pose', chooseRatio: 'Choose a format', download: 'Download image', share: 'Share image', copy: 'Copy caption', shareStatus: 'Your bubble is made here, on this device.', footer: 'ShellSong / 螺音 — an original fictional digital character.',
  },
  zh: {
    nav: ['诞生', '形象信号', '潮汐日记', '吹出泡沫'], soundOn: '打开声音', soundOff: '关闭声音', pause: '暂停 CG', play: '播放 CG', replay: '重播 CG', fiction: '螺音是原创虚构角色。她的世界观是角色叙事，不是历史事实或官方说明。',
    originKicker: '01 / 声音的诞生', originTitle: '三段记忆，变成一个小小的声音。',
    origin: [
      { title: '那缕光', body: '花梨神木崩解时，一缕灵光没有重新成为树木，它选择去寻找一位能带它回来的伙伴。' }, { title: '那枚螺', body: '海南东海岸的潮间带里，一枚粉色海螺收藏了潮声、渔歌与季风雨。' }, { title: '第一次黎明', body: '月光、海水和那缕灵光在螺旋深处相遇。第一束晨光抵达时，螺音探出了头。' },
    ],
    signalsKicker: '02 / 角色信号', signalsTitle: '认识让她成为螺音的每一处细节。', signalsBody: '她的身体很小，但每一件细节都在聆听不同的声音。',
    signals: [
      { term: '浪花长发', body: '潮蓝色的发丝中，藏着几缕花梨琥珀色的灵光。' }, { term: '海螺耳朵', body: '小小的螺旋耳会转向来自远海的声音。' }, { term: '花梨芽苞', body: '她头顶的嫩枝会随潮摆动，也会在共振到来时竖起。' }, { term: '粉色海螺', body: '海螺既是她的家，也是她用来聆听和传音的法器。' }, { term: '海沫底座', body: '她没有翅膀，一小团柔软的海沫托着她飞行。' },
    ],
    diaryKicker: '03 / 潮汐日记', diaryTitle: '一位小向导，六种聆听方式。',
    diary: [
      { title: '好奇', body: '每一种陌生的声音，都会让她再靠近一点。', image: '/shellsong/images/curious.webp' }, { title: '聆听', body: '她把海螺贴近耳边，让潮声先说话。', image: '/shellsong/images/listening.webp' }, { title: '共振', body: '靠近记忆碎片时，海沫会染上一层安静的琥珀光。', image: '/shellsong/images/resonance.webp' }, { title: '庆祝', body: '找到一段声音后，她会旋转，留下明亮的泡沫轨迹。', image: '/shellsong/images/celebration.webp' }, { title: '打盹', body: '漫长潮汐过后，她缩回螺壳，让海岸替她守望。', image: '/shellsong/images/sleeping.webp' }, { title: '飞行', body: '一小团海沫，足够托起一颗很大的心。', image: '/shellsong/images/flying.webp' },
    ],
    shareKicker: '04 / 泡沫信使站', shareTitle: '把一段小小的声音吹向远方。', shareBody: '在此浏览器中组合一张原创螺音海报。不会上传、保存或关联任何账号。', chooseLine: '选择一句话', choosePose: '选择姿态', chooseRatio: '选择比例', download: '下载图片', share: '分享图片', copy: '复制文案', shareStatus: '你的泡沫只在这台设备上生成。', footer: 'ShellSong / 螺音 — 原创虚构数字角色。',
  },
}

function localizedShellSongCopy(language: Language): Copy {
  const selected = copy[language]
  if (selected) return selected
  const english = copy.en!
  const translate = (value: string) => translateProjectText(value, language)
  return {
    ...english,
    nav: english.nav.map(translate),
    soundOn: translate(english.soundOn), soundOff: translate(english.soundOff), pause: translate(english.pause), play: translate(english.play), replay: translate(english.replay), fiction: translate(english.fiction),
    originKicker: translate(english.originKicker), originTitle: translate(english.originTitle), origin: english.origin.map((item) => ({ ...item, title: translate(item.title), body: translate(item.body) })),
    signalsKicker: translate(english.signalsKicker), signalsTitle: translate(english.signalsTitle), signalsBody: translate(english.signalsBody), signals: english.signals.map((item) => ({ term: translate(item.term), body: translate(item.body) })),
    diaryKicker: translate(english.diaryKicker), diaryTitle: translate(english.diaryTitle), diary: english.diary.map((item) => ({ ...item, title: translate(item.title), body: translate(item.body) })),
    shareKicker: translate(english.shareKicker), shareTitle: translate(english.shareTitle), shareBody: translate(english.shareBody), chooseLine: translate(english.chooseLine), choosePose: translate(english.choosePose), chooseRatio: translate(english.chooseRatio), download: translate(english.download), share: translate(english.share), copy: translate(english.copy), shareStatus: translate(english.shareStatus), footer: translate(english.footer),
  }
}

const posterLines = {
  en: ['The sea has a memory.', 'Listen: a small conch keeps the tide.', 'A voice from Hainan, carried outward.'],
  zh: ['海是有记忆的。', '听，一枚小小的海螺收藏着潮声。', '一段从海南出发、传向远方的声音。'],
}

const posterPoses = [
  { id: 'curious', image: '/shellsong/images/curious.webp' },
  { id: 'listening', image: '/shellsong/images/listening.webp' },
  { id: 'resonance', image: '/shellsong/images/resonance.webp' },
  { id: 'celebration', image: '/shellsong/images/celebration.webp' },
  { id: 'sleeping', image: '/shellsong/images/sleeping.webp' },
  { id: 'flying', image: '/shellsong/images/flying.webp' },
]
const sectionIds = ['origin', 'signals', 'diary', 'bubble-station']

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

function wrapText(context: CanvasRenderingContext2D, text: string, width: number) {
  const units = text.includes(' ') ? text.split(' ') : Array.from(text)
  const lines: string[] = []
  let line = ''
  for (const unit of units) {
    const next = text.includes(' ') ? `${line}${line ? ' ' : ''}${unit}` : `${line}${unit}`
    if (context.measureText(next).width > width && line) { lines.push(line); line = unit } else line = next
  }
  if (line) lines.push(line)
  return lines
}

function drawCoverImage(context: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const imageWidth = image.naturalWidth * scale
  const imageHeight = image.naturalHeight * scale
  context.drawImage(image, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight)
}

export default function LuoyinTidePage({ language, onChangeLanguage, onExit }: Props) {
  const [videoError, setVideoError] = useState(false)
  const [muted, setMuted] = useState(true)
  const [paused, setPaused] = useState(false)
  const [lineIndex, setLineIndex] = useState(0)
  const [poseId, setPoseId] = useState('curious')
  const [ratio, setRatio] = useState<PosterRatio>('portrait')
  const [shareStatus, setShareStatus] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const reducedMotion = useReducedMotion()
  const text = localizedShellSongCopy(language)
  const activePosterLines = posterLines[language as keyof typeof posterLines] ?? posterLines.zh
  const selectedPose = posterPoses.find((pose) => pose.id === poseId) || posterPoses[0]

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion) return
    video.muted = true
    video.play().then(() => setPaused(false)).catch(() => setPaused(true))
  }, [reducedMotion])

  const toggleVideo = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) { video.play().then(() => setPaused(false)).catch(() => setPaused(true)) } else { video.pause(); setPaused(true) }
  }
  const toggleSound = () => { const video = videoRef.current; if (!video) return; video.muted = !video.muted; setMuted(video.muted); if (video.paused) video.play().catch(() => undefined) }
  const replayVideo = () => { const video = videoRef.current; if (!video) return; video.currentTime = 0; video.play().then(() => setPaused(false)).catch(() => setPaused(true)) }

  const makePoster = async () => {
    const canvas = canvasRef.current || document.createElement('canvas')
    const dimensions = ratio === 'square' ? [1080, 1080] : ratio === 'portrait' ? [1080, 1350] : [1080, 1920]
    canvas.width = dimensions[0]
    canvas.height = dimensions[1]
    const context = canvas.getContext('2d')
    if (!context) return null
    const [width, height] = dimensions
    const image = new Image()
    await new Promise<void>((resolve) => { image.onload = () => resolve(); image.onerror = () => resolve(); image.src = selectedPose.image })
    if (image.naturalWidth) drawCoverImage(context, image, width, height)
    else { context.fillStyle = '#cdeef6'; context.fillRect(0, 0, width, height) }
    context.fillStyle = 'rgba(5, 37, 50, .78)'
    context.fillRect(0, 0, width, height * .41)
    context.fillStyle = 'rgba(5, 37, 50, .72)'
    context.fillRect(0, height - 116, width, 116)
    context.strokeStyle = '#8fe6ec'
    context.lineWidth = 3
    for (let index = 0; index < 3; index += 1) {
      context.globalAlpha = .74 - index * .16
      context.beginPath()
      context.moveTo(-90, height * (.63 + index * .06))
      context.bezierCurveTo(width * .24, height * (.54 + index * .05), width * .7, height * (.7 - index * .04), width + 90, height * (.58 + index * .06))
      context.stroke()
    }
    context.globalAlpha = 1
    context.fillStyle = '#f7fbfb'
    context.font = '600 28px sans-serif'
    context.fillText('SHELLSONG / 螺音', 78, 94)
    context.fillStyle = '#f5a6b6'
    context.font = '400 20px monospace'
    context.fillText('A SONG CARRIED BY THE TIDE', 78, 134)
    context.fillStyle = '#f7fbfb'
    context.font = language === 'en' ? '600 70px serif' : '600 62px serif'
    const line = activePosterLines[lineIndex]
    wrapText(context, line, width - 156).slice(0, 3).forEach((part, index) => context.fillText(part, 78, 238 + index * 76))
    context.fillStyle = '#e6fbfa'
    context.font = '400 19px sans-serif'
    context.fillText(translateProjectText('Original fictional digital character', language), 78, height - 70)
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  }

  const downloadPoster = async () => {
    const blob = await makePoster(); if (!blob) return
    const url = URL.createObjectURL(blob); const link = document.createElement('a')
    link.href = url; link.download = `shellsong-${ratio}-${language}.png`; link.click(); URL.revokeObjectURL(url)
    setShareStatus(translateProjectText('Image ready to share.', language))
  }
  const sharePoster = async () => {
    const blob = await makePoster(); if (!blob) return
    const caption = `${activePosterLines[lineIndex]} — ShellSong / 螺音`
    const file = new File([blob], `shellsong-${ratio}.png`, { type: 'image/png' })
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try { await navigator.share({ title: 'ShellSong', text: caption, files: [file] }); setShareStatus(translateProjectText('Share sheet opened.', language)); return } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return }
    }
    setShareStatus(translateProjectText('System sharing is unavailable. Download the image instead.', language))
  }
  const copyCaption = async () => {
    const caption = `${activePosterLines[lineIndex]} — ShellSong / 螺音`
    try { await navigator.clipboard.writeText(caption); setShareStatus(translateProjectText('Caption copied.', language)) } catch { setShareStatus(caption) }
  }
  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })

  return <main className="ss-page" data-experience-main>
    <canvas className="ss-export-canvas" ref={canvasRef} aria-hidden="true" />
    <header className="ss-header">
      <button type="button" className="ss-wordmark" onClick={onExit} aria-label={inline(language, 'Return to Qiongverse home', '返回琼境首页')}><span>ShellSong</span><i>螺音</i></button>
      <nav aria-label={inline(language, 'ShellSong sections', '螺音页面导航')}>{text.nav.map((item, index) => <a key={item} href={'#' + sectionIds[index]} onClick={(event) => { event.preventDefault(); scrollToSection(sectionIds[index]) }}>{item}</a>)}</nav>
      <div className="ss-header-actions">
        <LanguageSelector language={language} onChange={onChangeLanguage} className="ss-language" />
        <button className="ss-return" type="button" onClick={onExit}>
          {inline(language, 'Home', '首页')}<span aria-hidden="true">↗</span>
        </button>
      </div>
    </header>

    <section className="ss-hero" id="top" aria-label={inline(language, 'ShellSong CG film', '螺音 CG 短片')}>
      {!videoError && <video ref={videoRef} className="ss-hero-video" muted playsInline loop preload="metadata" poster="/shellsong/hero-poster.jpg" onError={() => setVideoError(true)} onPlay={() => setPaused(false)} onPause={() => setPaused(true)}>
        <source src={publicMedia('/shellsong/video/luoyin-cg.mp4')} type="video/mp4" />
      </video>}
      {videoError && <img className="ss-hero-poster" src="/shellsong/hero-poster.jpg" alt={inline(language, 'Luoyin beside a glowing sea portal', '螺音站在发光的海洋之门旁')} />}
      <div className="ss-hero-veil" />
      <h1 className="ss-sr-title" ref={titleRef} tabIndex={-1}>ShellSong / 螺音</h1>
      <div className="ss-hero-controls" aria-label={inline(language, 'CG controls', 'CG 控制')}>
        <button type="button" onClick={toggleSound}>{muted ? text.soundOn : text.soundOff}</button>
        <button type="button" onClick={toggleVideo}>{paused ? text.play : text.pause}</button>
        <button type="button" onClick={replayVideo}>{text.replay}</button>
      </div>
      <p className="ss-fiction-banner">{text.fiction}</p>
    </section>

    <section className="ss-origin" id="origin" aria-labelledby="origin-title">
      <div className="ss-section-intro"><p>{text.originKicker}</p><h2 id="origin-title">{text.originTitle}</h2></div>
      <ol className="ss-origin-sequence">{text.origin.map((chapter, index) => <li key={chapter.title}><span>0{index + 1}</span><div><h3>{chapter.title}</h3><p>{chapter.body}</p></div></li>)}</ol>
      <figure><img src="/shellsong/images/listening.webp" alt={inline(language, 'Luoyin listening through her conch', '螺音用海螺聆听')} /><figcaption>{inline(language, 'Her first act is always to listen.', '她做的第一件事，总是先聆听。')}</figcaption></figure>
    </section>

    <section className="ss-signals" id="signals" aria-labelledby="signals-title">
      <div className="ss-section-intro"><p>{text.signalsKicker}</p><h2 id="signals-title">{text.signalsTitle}</h2><span>{text.signalsBody}</span></div>
      <div className="ss-signals-layout">
        <div className="ss-model-shell">
          <ShellSongModel language={language} />
        </div>
        <dl>{text.signals.map((signal, index) => <div key={signal.term}><dt><span>0{index + 1}</span>{signal.term}</dt><dd>{signal.body}</dd></div>)}</dl>
      </div>
    </section>

    <section className="ss-diary" id="diary" aria-labelledby="diary-title">
      <div className="ss-section-intro"><p>{text.diaryKicker}</p><h2 id="diary-title">{text.diaryTitle}</h2></div>
      <div className="ss-diary-rail">{text.diary.map((entry, index) => <article key={entry.title}><span>0{index + 1}</span><img src={entry.image} alt={entry.title} /><div><h3>{entry.title}</h3><p>{entry.body}</p></div></article>)}</div>
    </section>

    <section className="ss-bubble" id="bubble-station" aria-labelledby="bubble-title">
      <div className="ss-bubble-waves" aria-hidden="true" /><img className="ss-bubble-island" src="/shellsong/images/flying.webp" alt="" aria-hidden="true" />
      <div className="ss-section-intro"><p>{text.shareKicker}</p><h2 id="bubble-title">{text.shareTitle}</h2><span>{text.shareBody}</span></div>
      <div className="ss-bubble-workspace">
        <div className={`ss-poster-preview ratio-${ratio}`}><span>SHELLSONG / 螺音</span><p>{activePosterLines[lineIndex]}</p><img src={selectedPose.image} alt="" /><small>{inline(language, 'Original fictional digital character', '原创虚构数字角色')}</small></div>
        <div className="ss-poster-controls">
          <fieldset><legend>{text.chooseLine}</legend>{activePosterLines.map((line, index) => <button type="button" key={line} className={lineIndex === index ? 'active' : ''} onClick={() => setLineIndex(index)}>{line}</button>)}</fieldset>
          <fieldset><legend>{text.choosePose}</legend><div className="ss-pose-options">{posterPoses.map((pose) => <button type="button" key={pose.id} className={pose.id === poseId ? 'active' : ''} onClick={() => setPoseId(pose.id)}><img src={pose.image} alt={pose.id} /></button>)}</div></fieldset>
          <fieldset><legend>{text.chooseRatio}</legend><div className="ss-ratio-options">{(['square', 'portrait', 'story'] as PosterRatio[]).map((item) => <button type="button" key={item} className={ratio === item ? 'active' : ''} onClick={() => setRatio(item)}>{item === 'square' ? '1:1' : item === 'portrait' ? '4:5' : '9:16'}</button>)}</div></fieldset>
          <div className="ss-share-actions"><button type="button" onClick={downloadPoster}>{text.download}<b aria-hidden="true">↓</b></button><button type="button" onClick={sharePoster}>{text.share}<b aria-hidden="true">↗</b></button><button type="button" onClick={copyCaption}>{text.copy}<b aria-hidden="true">□</b></button></div>
          <p role="status" aria-live="polite">{shareStatus || text.shareStatus}</p>
        </div>
      </div>
    </section>

    <footer className="ss-footer"><span>ShellSong / 螺音</span><p>{text.footer}</p><button type="button" onClick={onExit} aria-label={inline(language, 'Return to Qiongverse home', '返回琼境首页')}>↑</button></footer>
  </main>
}
