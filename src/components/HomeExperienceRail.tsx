import { assertLocalizationTree, localize, type Language, type Localized } from '../i18n'

export type HomeExperienceCard = {
  id: 'travel' | 'shellsong' | 'market'
  title: Localized
  body: Localized
  label: Localized
  action: Localized
  image: string
  onOpen: () => void
}

export type HomeExperienceRailProps = {
  language: Language
  cards: HomeExperienceCard[]
}

const copy = {
  kicker: {
    en: '03 / BEYOND THE HALLS',
    zh: '03 / 展厅之外',
    id: '03 / DI LUAR AULA',
    ja: '03 / 展示室の外へ',
    ko: '03 / 전시관 너머',
    ru: '03 / ЗА ПРЕДЕЛАМИ ЗАЛОВ',
    ar: '03 / ما وراء القاعات',
  },
  title: {
    en: 'Keep exploring at your own pace.',
    zh: '沿着自己的节奏，继续探索。',
    id: 'Teruslah menjelajah dengan ritmemu sendiri.',
    ja: '自分のリズムで、探索を続ける。',
    ko: '나만의 속도로 계속 탐험하세요.',
    ru: 'Продолжайте исследовать в своём ритме.',
    ar: 'واصل الاستكشاف بإيقاعك الخاص.',
  },
  body: {
    en: 'Three quieter ways to carry the island story beyond the main exhibition path.',
    zh: '三种更轻盈的方式，把海岛故事带到主展线之外。',
    id: 'Tiga cara yang lebih ringan untuk membawa kisah pulau melampaui jalur pameran utama.',
    ja: 'メイン展示ルートの先へ島の物語を運ぶ、三つの静かな入口。',
    ko: '주요 전시 경로 너머로 섬의 이야기를 이어 가는 세 가지 입구입니다.',
    ru: 'Три спокойных входа, чтобы продолжить историю острова за пределами главного маршрута.',
    ar: 'ثلاثة مداخل هادئة لمواصلة قصة الجزيرة خارج مسار المعرض الرئيسي.',
  },
} satisfies Record<string, Localized>

assertLocalizationTree(copy, 'home experience rail copy')

export default function HomeExperienceRail({ language, cards }: HomeExperienceRailProps) {
  return <section className="home-restructured-experience-rail" aria-labelledby="home-restructured-experience-title">
    <div className="home-restructured-section-heading">
      <div>
        <p className="home-restructured-kicker">{localize(copy.kicker, language)}</p>
        <h2 id="home-restructured-experience-title">{localize(copy.title, language)}</h2>
      </div>
      <p>{localize(copy.body, language)}</p>
    </div>
    <div className="home-restructured-experience-list">
      {cards.map((card) => <article className={`home-restructured-experience-card home-restructured-experience-card--${card.id}`} key={card.id}>
        <img src={card.image} alt="" loading="lazy" decoding="async" />
        <div className="home-restructured-experience-card-copy">
          <p>{localize(card.label, language)}</p>
          <h3>{localize(card.title, language)}</h3>
          <span>{localize(card.body, language)}</span>
          <button type="button" onClick={card.onOpen}>{localize(card.action, language)} <b aria-hidden="true">↗</b></button>
        </div>
      </article>)}
    </div>
  </section>
}
