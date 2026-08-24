import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type RefObject } from 'react'
import { assertLocalizationTree, localize, type Language, type RuntimeLocalized } from '../i18n'
import { publicMedia } from '../public-media'

export type HomeIntroVideoModalProps = {
  open: boolean
  language: Language
  prefersReducedMotion: boolean
  triggerRef?: RefObject<HTMLButtonElement | null>
  onClose: () => void
}

type VideoSource = 'h264' | 'hevc'

const copy = {
  close: { en: 'Close project film', zh: '关闭项目影片', id: 'Tutup film proyek', ja: 'プロジェクト映像を閉じる', ko: '프로젝트 영상 닫기', ru: 'Закрыть фильм проекта', ar: 'إغلاق فيلم المشروع' },
  controls: { en: 'Project film controls', zh: '项目影片控制', id: 'Kontrol film proyek', ja: 'プロジェクト映像の操作', ko: '프로젝트 영상 제어', ru: 'Управление фильмом проекта', ar: 'عناصر تحكم فيلم المشروع' },
  play: { en: 'Play film', zh: '播放影片', id: 'Putar film', ja: '映像を再生', ko: '영상 재생', ru: 'Воспроизвести фильм', ar: 'تشغيل الفيلم' },
  pause: { en: 'Pause film', zh: '暂停影片', id: 'Jeda film', ja: '映像を一時停止', ko: '영상 일시정지', ru: 'Поставить фильм на паузу', ar: 'إيقاف الفيلم مؤقتاً' },
  replay: { en: 'Replay film from the beginning', zh: '从头重播影片', id: 'Putar ulang film dari awal', ja: '映像を最初から再生', ko: '영상 처음부터 다시 재생', ru: 'Повторить фильм с начала', ar: 'إعادة تشغيل الفيلم من البداية' },
  progress: { en: 'Film progress', zh: '影片进度', id: 'Kemajuan film', ja: '映像の進行状況', ko: '영상 진행률', ru: 'Прогресс фильма', ar: 'تقدم الفيلم' },
  showControls: { en: 'Show film controls', zh: '显示影片控制', id: 'Tampilkan kontrol film', ja: '映像の操作を表示', ko: '영상 제어 표시', ru: 'Показать элементы управления фильмом', ar: 'إظهار عناصر تحكم الفيلم' },
  hideControls: { en: 'Hide film controls', zh: '隐藏影片控制', id: 'Sembunyikan kontrol film', ja: '映像の操作を隠す', ko: '영상 제어 숨기기', ru: 'Скрыть элементы управления фильмом', ar: 'إخفاء عناصر تحكم الفيلم' },
  showTimeline: { en: 'Show film timeline', zh: '显示影片进度条', id: 'Tampilkan linimasa film', ja: '映像のタイムラインを表示', ko: '영상 타임라인 표시', ru: 'Показать шкалу фильма', ar: 'إظهار الخط الزمني للفيلم' },
  hideTimeline: { en: 'Hide film timeline', zh: '隐藏影片进度条', id: 'Sembunyikan linimasa film', ja: '映像のタイムラインを隠す', ko: '영상 타임라인 숨기기', ru: 'Скрыть шкалу фильма', ar: 'إخفاء الخط الزمني للفيلم' },
  volume: { en: 'Film volume', zh: '影片音量', id: 'Volume film', ja: '映像の音量', ko: '영상 음량', ru: 'Громкость фильма', ar: 'مستوى صوت الفيلم' },
  mute: { en: 'Mute film', zh: '静音影片', id: 'Bisukan film', ja: '映像をミュート', ko: '영상 음소거', ru: 'Выключить звук фильма', ar: 'كتم صوت الفيلم' },
  unmute: { en: 'Unmute film', zh: '取消影片静音', id: 'Nyalakan suara film', ja: '映像のミュートを解除', ko: '영상 음소거 해제', ru: 'Включить звук фильма', ar: 'إلغاء كتم صوت الفيلم' },
  speed: { en: 'Playback speed', zh: '播放倍速', id: 'Kecepatan pemutaran', ja: '再生速度', ko: '재생 속도', ru: 'Скорость воспроизведения', ar: 'سرعة التشغيل' },
  speedHalf: { en: '0.5 times', zh: '0.5 倍', id: '0,5 kali', ja: '0.5 倍速', ko: '0.5배속', ru: '0,5×', ar: '0.5×' },
  speedThreeQuarter: { en: '0.75 times', zh: '0.75 倍', id: '0,75 kali', ja: '0.75 倍速', ko: '0.75배속', ru: '0,75×', ar: '0.75×' },
  speedNormal: { en: 'Normal speed', zh: '正常速度', id: 'Kecepatan normal', ja: '標準速度', ko: '보통 속도', ru: 'Обычная скорость', ar: 'السرعة العادية' },
  speedOneQuarter: { en: '1.25 times', zh: '1.25 倍', id: '1,25 kali', ja: '1.25 倍速', ko: '1.25배속', ru: '1,25×', ar: '1.25×' },
  speedOneHalf: { en: '1.5 times', zh: '1.5 倍', id: '1,5 kali', ja: '1.5 倍速', ko: '1.5배속', ru: '1,5×', ar: '1.5×' },
  speedDouble: { en: '2 times', zh: '2 倍', id: '2 kali', ja: '2 倍速', ko: '2배속', ru: '2×', ar: '2×' },
  unavailable: { en: 'This project film is unavailable in the current browser.', zh: '当前浏览器无法播放项目影片。', id: 'Film proyek ini tidak tersedia di peramban saat ini.', ja: 'このブラウザーではプロジェクト映像を利用できません。', ko: '현재 브라우저에서 이 프로젝트 영상을 사용할 수 없습니다.', ru: 'Этот фильм проекта недоступен в текущем браузере.', ar: 'فيلم المشروع هذا غير متاح في المتصفح الحالي.' },
  retry: { en: 'Try loading again', zh: '重新加载', id: 'Coba muat lagi', ja: 'もう一度読み込む', ko: '다시 불러오기', ru: 'Загрузить снова', ar: 'حاول التحميل مرة أخرى' },
  videoLabel: { en: 'HAINAN∞QIONGVERSE project introduction film', zh: 'HAINAN∞QIONGVERSE 项目介绍影片', id: 'Film pengantar proyek HAINAN∞QIONGVERSE', ja: 'HAINAN∞QIONGVERSE プロジェクト紹介映像', ko: 'HAINAN∞QIONGVERSE 프로젝트 소개 영상', ru: 'Фильм-презентация проекта HAINAN∞QIONGVERSE', ar: 'فيلم تعريف مشروع HAINAN∞QIONGVERSE' },
} satisfies Record<string, RuntimeLocalized>

assertLocalizationTree(copy, 'home intro video copy')

const VIDEO_SOURCES: Record<VideoSource, string> = {
  h264: publicMedia('/assets/video/homepage-intro.mp4'),
  hevc: publicMedia('/assets/video/homepage-intro-hevc.mp4'),
}
const POSTER = publicMedia('/assets/video/homepage-intro-poster.jpg')
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

function localized(language: Language, value: RuntimeLocalized) {
  return localize(value, language)
}

export default function HomeIntroVideoModal({ open, language, prefersReducedMotion, triggerRef, onClose }: HomeIntroVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(false)
  const autoplayAttemptedRef = useRef(false)
  const [source, setSource] = useState<VideoSource>('h264')
  const [reloadKey, setReloadKey] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState<number>(1)
  const [videoError, setVideoError] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [timelineVisible, setTimelineVisible] = useState(false)

  // Reset viewer-only state before the next paint. This preserves the pure
  // image-first opening even after a visitor previously revealed its controls.
  useLayoutEffect(() => {
    if (!open) {
      if (wasOpenRef.current) triggerRef?.current?.focus()
      wasOpenRef.current = false
      return
    }
    wasOpenRef.current = true
    setSource('h264')
    setReloadKey((value) => value + 1)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setVolume(0.8)
    setMuted(false)
    setPlaybackRate(1)
    setVideoError(false)
    setControlsVisible(false)
    setTimelineVisible(false)
    autoplayAttemptedRef.current = false
    const activeElement = document.activeElement
    if (activeElement instanceof HTMLElement && activeElement.matches('[data-luoyin-pet-toggle], .luoyin-pet-surface')) activeElement.blur()
    const bodyOverflow = document.body.style.overflow
    const documentOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus())
    return () => {
      window.cancelAnimationFrame(focusFrame)
      if (videoRef.current) videoRef.current.pause()
      document.body.style.overflow = bodyOverflow
      document.documentElement.style.overflow = documentOverflow
    }
  }, [open, triggerRef])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    const video = videoRef.current
    if (!open || !video) return
    video.volume = volume
    video.muted = muted
    video.playbackRate = playbackRate
  }, [open, source, reloadKey, volume, muted, playbackRate])

  if (!open) return null

  const playVideo = () => {
    const video = videoRef.current
    if (!video || videoError) return
    if (video.ended) video.currentTime = 0
    const result = video.play()
    if (result && typeof result.catch === 'function') {
      void result.catch(() => {
        setIsPlaying(false)
        // A browser may block audible autoplay. Keep the film view clean and
        // reveal the icon controls instead of placing a text notice over it.
        setControlsVisible(true)
      })
    }
  }

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused || video.ended) playVideo()
    else video.pause()
  }

  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return
    setDuration(Number.isFinite(video.duration) ? video.duration : 0)
    video.volume = volume
    video.muted = muted
    video.playbackRate = playbackRate
    if (!prefersReducedMotion && !autoplayAttemptedRef.current) {
      autoplayAttemptedRef.current = true
      playVideo()
    }
  }

  const handleVideoError = () => {
    if (source === 'h264') {
      autoplayAttemptedRef.current = false
      setVideoError(false)
      setSource('hevc')
      return
    }
    setVideoError(true)
    setIsPlaying(false)
  }

  const retryVideo = () => {
    autoplayAttemptedRef.current = false
    setVideoError(false)
    setSource('h264')
    setReloadKey((value) => value + 1)
  }

  const handleProgress = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value)
    if (!Number.isFinite(nextTime) || !videoRef.current) return
    videoRef.current.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const handleVolume = (event: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value)
    if (!Number.isFinite(nextVolume)) return
    setVolume(nextVolume)
    setMuted(nextVolume === 0)
    if (videoRef.current) {
      videoRef.current.volume = nextVolume
      videoRef.current.muted = nextVolume === 0
    }
  }

  const handleSpeed = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextRate = Number(event.target.value)
    if (!SPEEDS.includes(nextRate as (typeof SPEEDS)[number])) return
    setPlaybackRate(nextRate)
    if (videoRef.current) videoRef.current.playbackRate = nextRate
  }

  const playLabel = localized(language, isPlaying ? copy.pause : copy.play)
  const progressMax = duration > 0 ? duration : 0
  const progressValue = Math.min(Math.max(currentTime, 0), progressMax || 0)
  const direction = language === 'ar' ? 'rtl' : 'ltr'

  return <div className={`home-intro-video-modal${prefersReducedMotion ? ' is-reduced-motion' : ''}`} dir={direction}>
    <section
      ref={dialogRef}
      id="home-intro-video-dialog"
      className="home-intro-video-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={localized(language, copy.videoLabel)}
      tabIndex={-1}
    >
      <div className="home-intro-video-stage" onPointerUp={(event) => {
        if (event.target === event.currentTarget || event.target === videoRef.current) setControlsVisible(true)
      }}>
        <video
          key={`${source}-${reloadKey}`}
          ref={videoRef}
          className="home-intro-video-player"
          poster={POSTER}
          preload="metadata"
          playsInline
          tabIndex={0}
          aria-label={localized(language, copy.videoLabel)}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => { setIsPlaying(false); setControlsVisible(true) }}
          onError={handleVideoError}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setControlsVisible(true)
              togglePlayback()
            }
          }}
        >
          <source src={VIDEO_SOURCES[source]} type="video/mp4" />
        </video>
        {videoError && <div className="home-intro-video-status home-intro-video-error is-error" role="alert" aria-live="polite">
          <p>{localized(language, copy.unavailable)}</p>
          <button type="button" className="home-intro-video-retry" onClick={retryVideo}>{localized(language, copy.retry)}</button>
        </div>}
      </div>

      <button
        type="button"
        className="home-intro-video-controls-toggle"
        onClick={() => setControlsVisible((visible) => !visible)}
        aria-expanded={controlsVisible}
        aria-controls={controlsVisible ? 'home-intro-video-controls' : undefined}
        aria-label={localized(language, controlsVisible ? copy.hideControls : copy.showControls)}
      >
        <span aria-hidden="true">{controlsVisible ? '×' : '•••'}</span>
      </button>
      <button ref={closeRef} type="button" className="home-intro-video-close" onClick={onClose} aria-label={localized(language, copy.close)}>×</button>

      {controlsVisible && <div id="home-intro-video-controls" className="home-intro-video-controls" role="group" aria-label={localized(language, copy.controls)}>
        <div className="home-intro-video-control-row home-intro-video-control-row--main">
          <button type="button" className="home-intro-video-play" onClick={togglePlayback} disabled={videoError} aria-label={playLabel} title={playLabel}>
            <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
          </button>
          <button type="button" className="home-intro-video-replay" onClick={() => { if (videoRef.current) videoRef.current.currentTime = 0; playVideo() }} disabled={videoError} aria-label={localized(language, copy.replay)} title={localized(language, copy.replay)}>
            <span aria-hidden="true">↺</span>
          </button>
          <button type="button" className="home-intro-video-mute" onClick={() => { const nextMuted = !muted; setMuted(nextMuted); if (videoRef.current) videoRef.current.muted = nextMuted }} disabled={videoError} aria-label={localized(language, muted ? copy.unmute : copy.mute)} title={localized(language, muted ? copy.unmute : copy.mute)}>
            <span aria-hidden="true">{muted || volume === 0 ? '⌁' : '◖'}</span>
          </button>
          <input className="home-intro-video-volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolume} disabled={videoError} aria-label={localized(language, copy.volume)} />
          <select className="home-intro-video-speed" value={playbackRate} onChange={handleSpeed} disabled={videoError} aria-label={localized(language, copy.speed)}>
            <option value="0.5">0.5×</option>
            <option value="0.75">0.75×</option>
            <option value="1">1×</option>
            <option value="1.25">1.25×</option>
            <option value="1.5">1.5×</option>
            <option value="2">2×</option>
          </select>
          <button type="button" className={`home-intro-video-timeline-toggle${timelineVisible ? ' is-active' : ''}`} onClick={() => setTimelineVisible((visible) => !visible)} disabled={videoError || progressMax === 0} aria-pressed={timelineVisible} aria-label={localized(language, timelineVisible ? copy.hideTimeline : copy.showTimeline)}>
            <span aria-hidden="true">⌁</span>
          </button>
        </div>
        {timelineVisible && <input className="home-intro-video-progress" type="range" min="0" max={progressMax} step="0.01" value={progressValue} onChange={handleProgress} disabled={videoError || progressMax === 0} aria-label={localized(language, copy.progress)} />}
      </div>}
    </section>
  </div>
}
