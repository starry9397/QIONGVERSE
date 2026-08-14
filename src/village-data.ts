import type { Language } from './data'

export type VillageExhibitKind = 'image' | 'model'

export type VillageExhibit = {
  id: string
  kind: VillageExhibitKind
  title: Record<Language, string>
  introduction: Record<Language, string>
  note: Record<Language, string>
  asset: string
  fallback: string
  modelAsset?: string
  modelPoster?: string
}

export const villageReferenceImage = '/assets/3d/countryside/美丽乡村参考图.png'

const supplied = (id: string, title: Record<Language, string>, asset: string, introduction: Record<Language, string>, note: Record<Language, string>): VillageExhibit => ({
  id, kind: 'image', title, asset, fallback: villageReferenceImage, introduction, note,
})

export const villageExhibits: VillageExhibit[] = [
  supplied('village-entry', { en: 'Village Threshold', zh: '乡村入口' }, '/assets/user-media2/media2/图片素材新/village-hall-banner-01.jpg',
    { en: 'A project-supplied scene for beginning a slower reading of Hainan village life, pathways and shared edges.', zh: '项目提供的场景图，从村路、边界与共享空间开始阅读海南乡村生活。' },
    { en: 'This image is a curatorial atmosphere, not an official village survey, tourism guarantee or current site condition.', zh: '这是一张策展语境图，不是官方村落调查、旅游保证或当前现场状况说明。' }),
  supplied('volcanic-village', { en: 'Volcanic Village Table', zh: '火山古村落沙盘' }, '/assets/user-media2/village-sand-table/火山古村落沙盘（中央模型）.png',
    { en: 'A project-supplied tabletop study of clustered roofs, paths and a shared center for spatial imagination.', zh: '项目提供的桌面模型图，用于想象屋顶、路径与共享中心组成的聚落空间。' },
    { en: 'It does not identify a real settlement, construction date, geological record, ownership or route recommendation.', zh: '它不用于确认真实聚落、建造年代、地质记录、权属或路线推荐。' }),
  supplied('market-stalls', { en: 'Market Stalls', zh: '乡村集市摊位' }, '/assets/user-media2/village-market-stalls/乡村集市摊位.png',
    { en: 'A project-supplied visual study of temporary stalls, shade and the social rhythm of a village market.', zh: '项目提供的视觉研究图，观察临时摊位、遮阴与乡村集市的社交节奏。' },
    { en: 'The scene does not establish vendor identity, operating hours, products, prices, inventory or an active market listing.', zh: '画面不代表摊主身份、营业时间、商品、价格、库存或正在营业的集市信息。' }),
  supplied('terrace-platform', { en: 'Terrace Viewing Platform', zh: '椰林梯田观景台' }, '/assets/user-media2/village-viewing-platform/椰林梯田观景台.png',
    { en: 'A project-supplied viewpoint for reading layers of palms, terraces and distance across a composed landscape.', zh: '项目提供的观景语境图，用于观看椰林、梯田与远景组成的层次。' },
    { en: 'It is not a map, safety notice, accessibility statement, opening schedule or promise of a real viewpoint.', zh: '它不是地图、安全提示、无障碍说明、开放时间或真实观景台承诺。' }),
  ...(['001', '002', '003'] as const).map((number, index): VillageExhibit => ({
    id: `village-concept-${number}`,
    kind: 'model',
    title: { en: `Village Concept Object ${String(index + 1).padStart(2, '0')}`, zh: `乡村概念展品 ${String(index + 1).padStart(2, '0')}` },
    introduction: { en: 'An AIGC concept exhibit for exploring scale, shelter and shared rural space inside this digital hall.', zh: '为本数字展厅准备的 AIGC 策展概念展品，用于探索尺度、庇护与共享乡村空间。' },
    note: { en: 'Needs review. This model is not a real building, heritage object, architectural plan, property listing or commercial product.', zh: '待审核。该模型不是真实建筑、遗产物件、建筑图纸、房产信息或商业商品。' },
    asset: `/assets/3d/products/village/product-village-${number}-poster.webp`,
    fallback: villageReferenceImage,
    modelPoster: `/assets/3d/products/village/product-village-${number}-poster.webp`,
    modelAsset: `/assets/3d/products/village/product-village-${number}-web.glb`,
  })),
]

export const villageStatusLabel = (exhibit: VillageExhibit, language: Language) => exhibit.kind === 'model'
  ? language === 'en' ? 'AIGC concept exhibit - needs review' : 'AIGC 策展概念展品 - 待审核'
  : language === 'en' ? 'Project-supplied curatorial asset' : '项目提供的策展素材'
