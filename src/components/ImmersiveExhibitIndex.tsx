import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { Language } from '../data'
import { localize, type Localized } from '../i18n'
import BrandLockup from './BrandLockup'
import LanguageSelector from './LanguageSelector'

export type ImmersiveIndexItem = {
  id: string
  title: Localized
  introduction: Localized
  status: Localized
  media: string
  fallback?: string
  accent: 'blue' | 'slate' | 'rust' | 'olive' | 'gold'
  onOpen: () => void
}

type Props = {
  language: Language
  onChangeLanguage: (language: Language) => void
  onExit: () => void
  onBack: () => void
  eyebrow: Localized
  title: Localized
  subtitle: Localized
  background: string
  items: ImmersiveIndexItem[]
}

const copy = {
  chapter: { en: 'CHAPTER', zh: '章节', id: 'BAB', ja: '章', ko: '장', ru: 'ГЛАВА', ar: 'فصل' },
  of: { en: 'OF', zh: '/', id: 'DARI', ja: '/', ko: '/', ru: 'ИЗ', ar: 'من' },
  back: { en: 'Back to immersive world', zh: '返回沉浸大世界', id: 'Kembali ke dunia imersif', ja: '没入型ワールドに戻る', ko: '몰입형 월드로 돌아가기', ru: 'Вернуться в иммерсивный мир', ar: 'العودة إلى العالم الغامر' },
  open: { en: 'Open exhibit', zh: '打开展项', id: 'Buka pameran', ja: '展示を開く', ko: '전시 열기', ru: 'Открыть экспонат', ar: 'فتح المعروض' },
  scroll: { en: 'Scroll to move through the archive', zh: '滚动浏览档案章节', id: 'Gulir untuk menjelajahi arsip', ja: 'スクロールしてアーカイブを進む', ko: '스크롤하여 아카이브 탐색', ru: 'Прокрутите, чтобы пройти архив', ar: 'مرر لاستكشاف الأرشيف' },
} satisfies Record<string, Localized>

export const immersiveIndexStatus = {
  project: { en: 'Project-supplied curatorial asset', zh: '项目提供的策展素材', id: 'Aset kuratorial dari proyek', ja: 'プロジェクト提供のキュレーション素材', ko: '프로젝트 제공 큐레이션 자산', ru: 'Кураторский материал проекта', ar: 'مادة تنسيق مقدمة من المشروع' },
  verified: { en: 'Verified public source', zh: '已核验公开来源', id: 'Sumber publik terverifikasi', ja: '確認済み公開出典', ko: '검증된 공개 출처', ru: 'Проверенный публичный источник', ar: 'مصدر عام متحقق' },
  concept: { en: 'AIGC concept exhibit · review required', zh: 'AIGC 策展概念展品 · 待审核', id: 'Pameran konsep AIGC · perlu ditinjau', ja: 'AIGC コンセプト展示 · 要確認', ko: 'AIGC 콘셉트 전시 · 검토 필요', ru: 'Концептуальный экспонат AIGC · требуется проверка', ar: 'معروض مفاهيمي من AIGC · يحتاج إلى مراجعة' },
} satisfies Record<string, Localized>

export default function ImmersiveExhibitIndex({ language, onChangeLanguage, onExit, onBack, eyebrow, title, subtitle, background, items }: Props) {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId))
  const ids = useMemo(() => items.map((item) => item.id), [items])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target.id) setActiveId(visible.target.id)
    }, { rootMargin: '-18% 0px -42% 0px', threshold: [0.2, 0.45, 0.7] })
    ids.forEach((id) => { const section = sectionRefs.current[id]; if (section) observer.observe(section) })
    return () => observer.disconnect()
  }, [ids])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onBack() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onBack])

  const jumpTo = (id: string) => {
    const section = sectionRefs.current[id]
    if (!section) return
    window.scrollTo({ top: Math.max(0, section.offsetTop - 8), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return <main className="immersive-index" dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <img className="immersive-index-backdrop" src={background} alt="" aria-hidden="true" decoding="async" />
    <header className="immersive-index-header">
      <BrandLockup onNavigate={(event) => { event.preventDefault(); onExit() }} />
      <p className="immersive-index-header-label">{localize(eyebrow, language)}</p>
      <div className="immersive-index-header-actions">
        <LanguageSelector language={language} onChange={onChangeLanguage} />
        <button type="button" aria-label={localize(copy.back, language)} onClick={onBack}><span className="immersive-index-back-label">{localize(copy.back, language)}</span> <span aria-hidden="true">↗</span></button>
      </div>
    </header>

    <section className="immersive-index-intro" aria-labelledby="immersive-index-title">
      <div className="immersive-index-intro-copy">
        <p className="immersive-index-kicker">{localize(eyebrow, language)}</p>
        <h1 id="immersive-index-title">{localize(title, language)}</h1>
        <p className="immersive-index-subtitle">{localize(subtitle, language)}</p>
      </div>
      <div className="immersive-index-intro-meta" aria-label={`${localize(copy.chapter, language)} ${activeIndex + 1} ${localize(copy.of, language)} ${items.length}`}>
        <span>{String(activeIndex + 1).padStart(2, '0')}</span>
        <i aria-hidden="true" />
        <small>{localize(copy.chapter, language)} {String(activeIndex + 1).padStart(2, '0')} {localize(copy.of, language)} {String(items.length).padStart(2, '0')}</small>
      </div>
    </section>

    <div className="immersive-index-chapters">
      {items.map((item, index) => <article
        id={item.id}
        key={item.id}
        ref={(node) => { sectionRefs.current[item.id] = node }}
        className={`immersive-index-chapter accent-${item.accent}${activeId === item.id ? ' is-active' : ''}`}
        tabIndex={0}
        aria-labelledby={`${item.id}-title`}
        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); item.onOpen() } }}
      >
        <div className="immersive-index-chapter-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
        <div className="immersive-index-media-wrap">
          <span className="immersive-index-color-block" aria-hidden="true" />
          <img className="immersive-index-media" loading={index === 0 ? 'eager' : 'lazy'} src={item.media} alt={localize(item.title, language)} onError={(event) => { if (item.fallback && event.currentTarget.src !== item.fallback) event.currentTarget.src = item.fallback }} />
        </div>
        <div className="immersive-index-chapter-copy">
          <p className="immersive-index-status">{localize(item.status, language)}</p>
          <h2 id={`${item.id}-title`}>{localize(item.title, language)}</h2>
          <p>{localize(item.introduction, language)}</p>
          <button type="button" onClick={item.onOpen}>{localize(copy.open, language)} <span aria-hidden="true">↗</span></button>
        </div>
      </article>)}
    </div>

    <nav className="immersive-index-rail" aria-label={localize(copy.chapter, language)}>
      <div className="immersive-index-rail-line" aria-hidden="true"><span style={{ '--rail-progress': `${((activeIndex + 1) / Math.max(1, items.length)) * 100}%` } as CSSProperties} /></div>
      {items.map((item, index) => <button key={item.id} type="button" className={activeId === item.id ? 'is-active' : ''} aria-current={activeId === item.id ? 'step' : undefined} aria-expanded={activeId === item.id} aria-label={`${localize(copy.chapter, language)} ${index + 1}: ${localize(item.title, language)}`} onClick={() => jumpTo(item.id)}><span>{String(index + 1).padStart(2, '0')}</span><b>{localize(item.title, language)}</b></button>)}
    </nav>
    <p className="immersive-index-scroll-cue">↓ {localize(copy.scroll, language)}</p>
  </main>
}
