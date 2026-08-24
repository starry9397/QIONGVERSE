import { assertLocalizationTree, localize, type Language, type Localized } from '../i18n'

export type HomeHallIndexItem = {
  id: 'free-trade-port' | 'tropical' | 'lijin' | 'aerospace' | 'huali' | 'village'
  index: '01' | '02' | '03' | '04' | '05' | '06'
  title: Localized
  zoneIndex?: number
  target: 'portal' | 'wheel'
}

export type HomeMapHallIndexProps = {
  language: Language
  items: HomeHallIndexItem[]
  activeZone: number
  onSelect: (item: HomeHallIndexItem) => void
}

const copy = {
  label: {
    en: 'Six halls / one island',
    zh: '六厅一岛',
    id: 'Enam aula / satu pulau',
    ja: '六つの展示室 / ひとつの島',
    ko: '여섯 전시관 / 하나의 섬',
    ru: 'Шесть залов / один остров',
    ar: 'ست قاعات / جزيرة واحدة',
  },
  instruction: {
    en: 'Choose a perspective to return to the main exhibition path.',
    zh: '选择一种观看角度，回到首页主展线。',
    id: 'Pilih sudut pandang untuk kembali ke jalur pameran utama.',
    ja: '視点を選び、メイン展示ルートへ戻ります。',
    ko: '관점을 선택해 주요 전시 경로로 돌아갑니다.',
    ru: 'Выберите взгляд, чтобы вернуться к главному маршруту выставки.',
    ar: 'اختر زاوية للعودة إلى مسار المعرض الرئيسي.',
  },
} satisfies Record<string, Localized>

assertLocalizationTree(copy, 'home map hall index copy')

export default function HomeMapHallIndex({ language, items, activeZone, onSelect }: HomeMapHallIndexProps) {
  return <div className="home-restructured-map-index" aria-label={localize(copy.instruction, language)}>
    <div className="home-restructured-map-index-heading">
      <span>{localize(copy.label, language)}</span>
      <i aria-hidden="true" />
      <small>{localize(copy.instruction, language)}</small>
    </div>
    <div className="home-restructured-map-index-list" role="list">
      {items.map((item) => {
        const active = item.target === 'wheel' && item.zoneIndex === activeZone
        return <div className="home-restructured-map-index-list-item" role="listitem" key={item.id}>
          <button
            type="button"
            className={`home-restructured-map-index-item${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onSelect(item)}
          >
            <span>{item.index}</span>
            <strong>{localize(item.title, language)}</strong>
            <b aria-hidden="true">↗</b>
          </button>
        </div>
      })}
    </div>
  </div>
}
