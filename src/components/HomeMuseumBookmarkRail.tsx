import { localize, type Language, type Localized } from '../i18n'

export type HomeMuseumChapter = {
  id: string
  index: string
  label: Localized
  targetId: string
}

type HomeMuseumBookmarkRailProps = {
  chapters: HomeMuseumChapter[]
  activeId: string
  language: Language
  onNavigate: (targetId: string) => void
  ariaLabel: string
}

export default function HomeMuseumBookmarkRail({ chapters, activeId, language, onNavigate, ariaLabel }: HomeMuseumBookmarkRailProps) {
  return <nav className="home-museum-bookmark-rail" aria-label={ariaLabel}>
    <span className="home-museum-bookmark-rail-kicker" aria-hidden="true">ARCHIVE</span>
    <ol>
      {chapters.map((chapter) => {
        const label = localize(chapter.label, language)
        const active = activeId === chapter.id
        return <li key={chapter.id} className={active ? 'is-active' : undefined}>
          <a
            href={`#${chapter.targetId}`}
            className="home-museum-bookmark"
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            onClick={(event) => {
              event.preventDefault()
              onNavigate(chapter.targetId)
            }}
          >
            <span className="home-museum-bookmark-index">{chapter.index}</span>
            <span className="home-museum-bookmark-label">{label}</span>
          </a>
        </li>
      })}
    </ol>
  </nav>
}
