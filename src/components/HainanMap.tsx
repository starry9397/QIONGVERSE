import { useEffect, useRef, useState } from 'react'
import { hainanMapCopy, hainanMapRegions, type HainanMapRegionId } from '../hainan-map-data'
import { completeLocalizationTree, type Language } from '../i18n'

type HainanMapProps = { language: Language; sectionId?: string }

const provinceSource = {
  publisher: 'Hainan Provincial People’s Government international portal',
  url: 'https://en.hainan.gov.cn/',
  checkedAt: '2026-08-16',
}
completeLocalizationTree(hainanMapRegions)

export default function HainanMap({ language, sectionId }: HainanMapProps) {
  const copy = hainanMapCopy[language]
  const [selectedId, setSelectedId] = useState<HainanMapRegionId | null>(null)
  const [mapImageFailed, setMapImageFailed] = useState(false)
  const [isReadingOpen, setIsReadingOpen] = useState(true)
  const cardHeadingRef = useRef<HTMLHeadingElement>(null)
  const focusCardAfterSelection = useRef(false)
  const selected = selectedId ? hainanMapRegions.find((region) => region.id === selectedId) ?? null : null
  // The supplied administrative artwork uses Chinese place labels. Retaining
  // that published label on non-English variants avoids an English fallback.
  const mapLabel = (value: { en: string; zh: string }) => language === 'en' ? value.en : value.zh

  useEffect(() => {
    if (focusCardAfterSelection.current) {
      focusCardAfterSelection.current = false
      cardHeadingRef.current?.focus()
    }
  }, [selectedId])

  useEffect(() => {
    if (window.location.hash !== '#hainan-map') return
    const alignToAnchor = () => {
      const target = document.getElementById('hainan-map')
      if (!target) return
      window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - 78), behavior: 'auto' })
    }
    window.addEventListener('load', alignToAnchor, { once: true })
    const timer = window.setTimeout(alignToAnchor, 1200)
    return () => {
      window.removeEventListener('load', alignToAnchor)
      window.clearTimeout(timer)
    }
  }, [])

  const selectRegion = (id: HainanMapRegionId) => {
    setSelectedId(id)
    setIsReadingOpen(true)
  }

  return (
    <section id={sectionId} className="hainan-map-section" aria-labelledby="hainan-map-title">
      <div className="hainan-map-layout">
        <h2 id="hainan-map-title" className="hainan-map-accessible-title">{copy.title}</h2>

        <div className="hainan-map-image-stage">
          <img
            className={`hainan-map-asset${mapImageFailed ? ' is-hidden' : ''}`}
            src="/assets/hainan-map/hainan-administrative-map-user-provided.png"
            loading="lazy"
            decoding="async"
            alt=""
            aria-hidden="true"
            onError={() => setMapImageFailed(true)}
          />
          {mapImageFailed && <span className="hainan-map-image-fallback" aria-hidden="true">{copy.mapLabel}</span>}
          <div className="hainan-map-markers">
            {hainanMapRegions.map((region) => {
              const isSelected = region.id === selectedId
              return <button key={region.id} type="button" className={`hainan-map-marker${isSelected ? ' is-selected' : ''}${region.position.inset ? ' is-inset' : ''}`} style={{ left: region.position.left, top: region.position.top }} aria-label={`${mapLabel(region.name)} — ${copy.instruction}`} aria-pressed={isSelected} onClick={() => selectRegion(region.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); focusCardAfterSelection.current = true; selectRegion(region.id) } }}>
                <span className="hainan-map-marker-dot" aria-hidden="true" />
                <span className="hainan-map-marker-label">{mapLabel(region.name)}</span>
              </button>
            })}
          </div>
          <span className="hainan-map-note">{copy.instruction}</span>
        </div>

        {isReadingOpen && <article className="hainan-map-reading" aria-live="polite">
          <button className="hainan-map-reading-close" type="button" aria-label={copy.closeReading} title={copy.closeReading} onClick={() => setIsReadingOpen(false)}>
            <span aria-hidden="true">×</span>
          </button>
          <span className="hainan-map-reading-index">{selected ? 'REGION / 19' : 'PROVINCE / HAINAN'}</span>
          <h3 ref={cardHeadingRef} tabIndex={-1}>{selected ? mapLabel(selected.name) : copy.overviewTitle}</h3>
          {!selected && <p className="hainan-map-reading-body">{copy.overviewBody}</p>}
          <div className="hainan-map-focus">
            <span>{copy.focus}</span>
            <div className="hainan-map-focus-list">
              {(selected ? selected.focus : ['coast', 'heritage', 'space', 'rural'] as const).map((focus) => <span key={focus}>{copy.focusLabels[focus]}</span>)}
            </div>
          </div>
          {selected && <div className="hainan-map-recommendations">
            <span>{copy.recommendations}</span>
            <ul>
              {selected.places.map((place) => <li key={place.en}>{mapLabel(place)}</li>)}
            </ul>
          </div>}
          <div className="hainan-map-source">
            <div><span>{copy.source}</span><strong>{selected?.source.publisher ?? provinceSource.publisher}</strong><small>{copy.checked}: {selected?.source.checkedAt ?? provinceSource.checkedAt}</small></div>
            <a href={selected?.source.url ?? provinceSource.url} target="_blank" rel="noopener noreferrer">{copy.openSource}<span aria-hidden="true">↗</span></a>
          </div>
          <p className="hainan-map-limitation">{copy.limitation}</p>
        </article>}
      </div>
    </section>
  )
}
