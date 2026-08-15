import { type Language, localize, numberLocale, type Localized } from './i18n'

export type { Localized } from './i18n'

export type DemoProduct = {
  id: string
  collection: 'culture' | 'ip'
  category: Localized
  title: Localized
  summary: Localized
  price: number
  stock: number
  image: string
  imageAlt: Localized
  story?: { src: string; alt: Localized }
  demo: true
}

export type DemoService = {
  id: string
  title: Localized
  summary: Localized
  deliverables: Localized[]
  demo: true
}

export type DemoCartLine = { productId: string; quantity: number }

export type DemoReceipt = {
  reference: string
  kind: 'order' | 'service'
  createdAt: string
  productIds?: string[]
  serviceId?: string
  projectDirection?: string
}

const product = (
  id: string, collection: DemoProduct['collection'], category: Localized, title: Localized,
  summary: Localized, price: number, stock: number, image: string, imageAlt: Localized,
  story?: DemoProduct['story'],
): DemoProduct => ({ id, collection, category, title, summary, price, stock, image, imageAlt, story, demo: true })

const media = '/assets/demo-market/products'

export const demoProducts: DemoProduct[] = [
  product('huali-craft-tray', 'culture', { en: 'Huali craft', zh: '花梨工艺' }, { en: 'Huali Grain Desk Tray', zh: '花梨纹理桌面托盘' }, { en: 'A Hainan-inspired desk object for a considered work ritual.', zh: '以海南花梨纹理为灵感的桌面器物，适合日常工作仪式。' }, 36, 18, `${media}/huali/product-huali-001-spec-placeholder.webp`, { en: 'Huali craft demo product visual', zh: '花梨工艺演示商品图' }, { src: '/assets/3d/products/huali/product-huali-001-poster.webp', alt: { en: 'Project 3D Huali study, not sales evidence', zh: '项目花梨 3D 研究图，不是销售凭证' } }),
  product('huali-scent-token', 'culture', { en: 'Huali craft', zh: '花梨工艺' }, { en: 'Huali Scent Token Set', zh: '花梨香气信物套装' }, { en: 'A small collectible concept that turns material memory into a travel keepsake.', zh: '将材质记忆转化为旅行纪念的轻量收藏概念。' }, 24, 26, `${media}/huali/product-huali-002-spec-placeholder.webp`, { en: 'Huali scent token demo product visual', zh: '花梨香气信物演示商品图' }),
  product('huali-postcard-case', 'culture', { en: 'Huali craft', zh: '花梨工艺' }, { en: 'Huali Postcard Case', zh: '花梨明信片收纳夹' }, { en: 'A presentation case concept for letters, tickets and Hainan visual fragments.', zh: '用于收纳书信、票根与海南视觉碎片的展示夹概念。' }, 29, 12, `${media}/huali/product-huali-003-spec-placeholder.webp`, { en: 'Huali postcard case demo product visual', zh: '花梨明信片收纳夹演示商品图' }),
  product('lijin-pattern-scarf', 'culture', { en: 'Li brocade', zh: '黎锦' }, { en: 'Li Pattern Travel Scarf', zh: '黎纹旅行围巾' }, { en: 'A bilingual pattern-study accessory inspired by the rhythm of Li textiles.', zh: '以黎锦节奏为灵感的双语纹样研究配饰。' }, 42, 21, `${media}/lijin/product-lijin-001-spec-placeholder.webp`, { en: 'Li pattern scarf demo product visual', zh: '黎纹围巾演示商品图' }, { src: '/assets/3d/products/lijin/product-lijin-001-poster.webp', alt: { en: 'Project 3D Li textile study, not sales evidence', zh: '项目黎锦 3D 研究图，不是销售凭证' } }),
  product('lijin-notebook', 'culture', { en: 'Li brocade', zh: '黎锦' }, { en: 'Li Pattern Field Notebook', zh: '黎纹田野笔记本' }, { en: 'A field-notes concept pairing travel writing with visual pattern references.', zh: '将旅行书写与纹样参考结合的田野笔记概念。' }, 16, 40, `${media}/lijin/product-lijin-002-spec-placeholder.webp`, { en: 'Li pattern notebook demo product visual', zh: '黎纹笔记本演示商品图' }),
  product('lijin-patch-set', 'culture', { en: 'Li brocade', zh: '黎锦' }, { en: 'Li Pattern Patch Set', zh: '黎纹布贴套装' }, { en: 'A collectible set designed for journals, travel bags and cultural exchange.', zh: '为手账、旅行包与文化交流设计的收藏布贴套装。' }, 12, 34, `${media}/lijin/product-lijin-003-spec-placeholder.webp`, { en: 'Li pattern patch set demo product visual', zh: '黎纹布贴套装演示商品图' }),
  product('tropical-atlas', 'culture', { en: 'Island ecology', zh: '海岛生态' }, { en: 'Tropical Island Field Atlas', zh: '热带海岛田野图册' }, { en: 'A visual travel atlas concept for reading coast, reef and rain forest together.', zh: '用于同时阅读海岸、珊瑚礁与雨林的视觉旅行图册概念。' }, 22, 30, `${media}/tropical/product-tropical-001-spec-placeholder.webp`, { en: 'Tropical island atlas demo product visual', zh: '热带海岛图册演示商品图' }, { src: '/assets/3d/products/village/product-village-001-poster.webp', alt: { en: 'Project 3D environment study, not sales evidence', zh: '项目 3D 环境研究图，不是销售凭证' } }),
  product('reef-light', 'culture', { en: 'Island ecology', zh: '海岛生态' }, { en: 'Reef Light Desk Object', zh: '珊瑚礁光影桌面摆件' }, { en: 'A small illuminated-object concept inspired by Hainan reef ecologies.', zh: '以海南珊瑚礁生态为灵感的小型光影摆件概念。' }, 34, 16, `${media}/tropical/product-tropical-002-spec-placeholder.webp`, { en: 'Reef light demo product visual', zh: '珊瑚礁光影摆件演示商品图' }),
  product('coast-card-set', 'culture', { en: 'Island ecology', zh: '海岛生态' }, { en: 'Hainan Coast Card Set', zh: '海南海岸明信片组' }, { en: 'A travel correspondence set shaped around the colours and edges of the island.', zh: '围绕海岛色彩与轮廓设计的旅行书信套装。' }, 14, 38, `${media}/tropical/product-tropical-003-spec-placeholder.webp`, { en: 'Hainan coast card set demo product visual', zh: '海南海岸明信片组演示商品图' }),
  product('village-tea-kit', 'culture', { en: 'Village journeys', zh: '乡村旅居' }, { en: 'Village Tea Pause Kit', zh: '乡村茶歇套装' }, { en: 'A slow-travel ritual kit concept for mapping a pause into a cultural journey.', zh: '将片刻休憩放入文化旅程的慢旅行仪式套装概念。' }, 28, 24, `${media}/village/product-village-001-spec-placeholder.webp`, { en: 'Village tea kit demo product visual', zh: '乡村茶歇套装演示商品图' }),
  product('village-map-print', 'culture', { en: 'Village journeys', zh: '乡村旅居' }, { en: 'Village Route Art Print', zh: '乡村路线艺术版画' }, { en: 'An illustrated route concept connecting local texture, seasons and walking pace.', zh: '连接地方质感、季节与步行节奏的插画路线概念。' }, 19, 20, `${media}/village/product-village-002-spec-placeholder.webp`, { en: 'Village route print demo product visual', zh: '乡村路线版画演示商品图' }),
  product('village-sound-kit', 'culture', { en: 'Village journeys', zh: '乡村旅居' }, { en: 'Village Sound Postcard Kit', zh: '乡音明信片套装' }, { en: 'A postcard concept for collecting the atmosphere of a place without claiming a recording.', zh: '收集地方氛围的明信片概念，不代表任何真实录音内容。' }, 18, 27, `${media}/village/product-village-003-spec-placeholder.webp`, { en: 'Village sound postcard kit demo product visual', zh: '乡音明信片套装演示商品图' }),
  product('luoyin-figure', 'ip', { en: 'Luoyin IP', zh: '螺音 IP' }, { en: 'Luoyin Explorer Figure', zh: '螺音探索者手办' }, { en: 'A project character collectible for the QIONGVERSE story world.', zh: '为琼境故事世界设计的项目角色收藏品。' }, 48, 15, '/assets/demo-market/ip/luoyin.png', { en: 'Luoyin project character demo product visual', zh: '螺音项目角色演示商品图' }),
  product('guardian-blind-box', 'ip', { en: 'Luoyin IP', zh: '螺音 IP' }, { en: 'Hidden Guardian Blind Box', zh: '守护灵隐藏款盲盒' }, { en: 'A concept blind-box edition from the Luoyin companion collection.', zh: '螺音伙伴系列的概念隐藏款盲盒。' }, 22, 9, '/assets/demo-market/ip/hidden-guardian.png', { en: 'Hidden Guardian demo product visual', zh: '守护灵演示商品图' }),
  product('luoyin-animation-license', 'ip', { en: 'Luoyin IP licensing', zh: '螺音 IP 授权' }, { en: 'Luoyin IP Copyright Licence', zh: '螺音 IP 版权授权' }, { en: 'A project demonstration of a copyright licence for the QIONGVERSE character system.', zh: '面向琼境角色系统的版权授权项目演示。' }, 200, 32, '/assets/demo-market/ip/luoyin-animation-library.jpg', { en: 'Luoyin IP copyright licensing demo visual', zh: '螺音 IP 版权授权演示图' }),
]

export const demoServices: DemoService[] = [
  { id: 'virtual-exhibition', title: { en: 'Virtual Exhibition Website', zh: '虚拟展厅网页制作' }, summary: { en: 'A bilingual exhibition destination for museums, venues and cultural businesses.', zh: '面向博物馆、场馆与文化企业的双语展厅网页。' }, deliverables: [{ en: 'Information architecture', zh: '信息架构' }, { en: 'Exhibition visual system', zh: '展厅视觉系统' }, { en: 'Bilingual visitor flow', zh: '双语访客流程' }], demo: true },
  { id: 'immersive-world', title: { en: 'Immersive Destination World', zh: '沉浸式景区大世界制作' }, summary: { en: 'A navigable spatial story for destinations, cultural districts and scenic routes.', zh: '面向景区、文旅街区与线路的可漫游空间叙事。' }, deliverables: [{ en: 'World concept', zh: '大世界概念' }, { en: 'Interactive journey', zh: '交互旅程' }, { en: 'Scene prototype', zh: '场景原型' }], demo: true },
  { id: 'digital-human-ip', title: { en: 'AI Digital Human and IP', zh: 'AI 数字人及 IP 形象制作' }, summary: { en: 'A character system connecting multilingual guidance, identity and content presence.', zh: '连接多语种导览、品牌身份与内容表达的角色系统。' }, deliverables: [{ en: 'Character direction', zh: '角色方向' }, { en: 'Interaction script', zh: '交互脚本' }, { en: 'Visual prototype', zh: '视觉原型' }], demo: true },
  { id: 'operations-promotion', title: { en: 'Operations and Cross-border Promotion', zh: '运营与跨境宣传' }, summary: { en: 'A practical content and campaign route for cultural reach across markets.', zh: '面向跨区域文化传播的内容与活动执行路径。' }, deliverables: [{ en: 'Audience route', zh: '受众路径' }, { en: 'Content calendar', zh: '内容节奏' }, { en: 'Campaign concept', zh: '传播活动概念' }], demo: true },
]

export const tx = (language: Language, value: Localized) => localize(value, language)
export const formatDemoPrice = (language: Language, amount: number) => new Intl.NumberFormat(numberLocale(language), { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
