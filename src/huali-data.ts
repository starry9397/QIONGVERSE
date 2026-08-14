import type { Language } from './data'

export type HualiExhibitKind = 'image' | 'model'

export type HualiExhibit = {
  id: string
  kind: HualiExhibitKind
  title: Record<Language, string>
  introduction: Record<Language, string>
  note: Record<Language, string>
  asset: string
  fallback: string
  modelAsset?: string
  modelPoster?: string
}

export const hualiReferenceImage = '/assets/3d/countryside/东方花梨展厅参考图.png'

const supplied = (id: string, en: string, zh: string, asset: string, introduction: Record<Language, string>, note: Record<Language, string>): HualiExhibit => ({
  id, kind: 'image', title: { en, zh }, asset, fallback: hualiReferenceImage, introduction, note,
})

export const hualiExhibits: HualiExhibit[] = [
  supplied(
    'wood-ring',
    'Wood Ring Study',
    '花梨木纹研究',
    '/assets/user-media2/huali-tree-slice/花梨木王原木截面（中央展品）.png',
    { en: 'A project-supplied view of concentric grain, scale and reflected amber light. It invites slow looking rather than material identification.', zh: '一张项目提供的同心木纹、尺度与琥珀色反光研究图，邀请观者慢慢观看，而非进行材质鉴定。' },
    { en: 'This curatorial image does not establish wood species, age, origin, authenticity, ownership, or commercial value.', zh: '这张策展图像不用于确认木材种类、年代、产地、真伪、权属或商业价值。' },
  ),
  supplied(
    'carving-gallery',
    'Carving Gallery',
    '木雕陈列',
    '/assets/user-media2/huali-carvings/花梨木雕精品（多件）.png',
    { en: 'A project-supplied composition for reading silhouette, negative space and repeated carved surfaces across a group of objects.', zh: '项目提供的组合图像，用于观看一组物件中的轮廓、留白与重复的雕刻表面。' },
    { en: 'It is a visual curatorial asset, not a catalogue of authentic objects, makers, dates, or collection records.', zh: '它是视觉策展素材，不是对真实器物、制作者、年代或馆藏记录的目录说明。' },
  ),
  supplied(
    'furniture-scale',
    'Furniture Scale Study',
    '家具尺度研究',
    '/assets/user-media2/huali-furniture/花梨木家具微缩模型.png',
    { en: 'A project-supplied miniature-room study of proportion, enclosure and how furniture organizes a shared interior.', zh: '项目提供的微缩室内研究图，用于观看比例、围合关系，以及家具如何组织共享空间。' },
    { en: 'This is not an authentic furniture inventory, period attribution, construction record, or sale listing.', zh: '这不是对真实家具库存、年代归属、制作记录或销售信息的说明。' },
  ),
  supplied(
    'incense-surface',
    'Incense and Surface',
    '香器与表面',
    '/assets/user-media2/huali-incense/香道体验区圆垫与香炉.png',
    { en: 'A project-supplied still life for noticing circular arrangement, surface finish and the atmosphere created around a small object.', zh: '项目提供的静物图，邀请观者关注圆形布置、表面处理，以及小型物件周围形成的氛围。' },
    { en: 'It does not state a ritual, tradition, material origin, product availability, or price.', zh: '它不陈述任何仪式、传统、材质来源、商品可得性或价格。' },
  ),
  ...(['001', '002', '003'] as const).map((number, index): HualiExhibit => ({
    id: `concept-object-${number}`,
    kind: 'model',
    title: { en: `Concept Object ${String(index + 1).padStart(2, '0')}`, zh: `概念展品 ${String(index + 1).padStart(2, '0')}` },
    introduction: { en: 'An AIGC concept exhibit for this digital room, provided as an exploratory model rather than an authentic object or commercial product.', zh: '为本数字展厅准备的 AIGC 策展概念展品，用于探索性观看，不是实际器物或商业商品。' },
    note: { en: 'This model remains needs review. It does not identify a real furniture form, wood species, maker, collection, provenance, price, or availability.', zh: '该模型仍待审核；它不用于识别真实家具形制、木材种类、制作者、馆藏、来源、价格或可得性。' },
    asset: `/assets/3d/products/huali/product-huali-${number}-poster.webp`,
    fallback: hualiReferenceImage,
    modelPoster: `/assets/3d/products/huali/product-huali-${number}-poster.webp`,
    modelAsset: `/assets/3d/products/huali/product-huali-${number}-web.glb`,
  })),
]

export const hualiStatusLabel = (exhibit: HualiExhibit, language: Language) => exhibit.kind === 'model'
  ? language === 'en' ? 'AIGC concept exhibit - needs review' : 'AIGC 策展概念展品 - 待审核'
  : language === 'en' ? 'Project-supplied curatorial asset' : '项目提供的策展素材'
