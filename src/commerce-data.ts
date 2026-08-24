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

const cultureMedia = '/assets/demo-market/products/culture'
const islandCultureCategory: Localized = {
  en: 'Island culture concept', zh: '海岛文化概念', id: 'Konsep budaya pulau', ja: '島の文化コンセプト',
  ko: '섬 문화 콘셉트', ru: 'Концепция островной культуры', ar: 'مفهوم ثقافة الجزيرة',
}
const islandCultureSummary: Localized = {
  en: 'A QIONGVERSE project concept visual for cultural storytelling. Product availability, pricing and fulfilment require separate verification.',
  zh: '用于琼境文化叙事的项目概念商品图；商品可得性、价格与履约需另行核验。',
  id: 'Visual konsep proyek QIONGVERSE untuk penceritaan budaya. Ketersediaan, harga, dan pemenuhan produk perlu diverifikasi secara terpisah.',
  ja: '文化ストーリーテリングのためのQIONGVERSEプロジェクトコンセプト画像です。商品の提供、価格、履行は別途確認が必要です。',
  ko: '문화 스토리텔링을 위한 QIONGVERSE 프로젝트 콘셉트 이미지입니다. 상품 제공 여부, 가격 및 이행은 별도 확인이 필요합니다.',
  ru: 'Концептуальный визуал проекта QIONGVERSE для культурного повествования. Наличие, цена и исполнение требуют отдельной проверки.',
  ar: 'صورة مفاهيمية من مشروع QIONGVERSE للسرد الثقافي. يجب التحقق بصورة منفصلة من التوافر والسعر والتنفيذ.',
}
const cultureProduct = (id: string, title: Localized, price: number, stock: number, filename: string) => product(
  id, 'culture', islandCultureCategory, title, islandCultureSummary, price, stock,
  `${cultureMedia}/${filename}`, title,
)

export const demoProducts: DemoProduct[] = [
  cultureProduct('hainan-free-trade-port-gift-set', { en: 'Hainan Free Trade Port Premium Government and Business Gift Set', zh: '海南自贸港高端政商务礼品套装', id: 'Set Hadiah Premium Pemerintahan dan Bisnis Pelabuhan Perdagangan Bebas Hainan', ja: '海南自由貿易港プレミアム政務・ビジネスギフトセット', ko: '하이난 자유무역항 프리미엄 정·비즈니스 선물 세트', ru: 'Премиальный деловой и официальный подарочный набор Хайнаньского порта свободной торговли', ar: 'طقم هدايا فاخر للأعمال والجهات الرسمية في ميناء هاينان للتجارة الحرة' }, 36, 18, 'hainan-free-trade-port-premium-business-gift-set.jpg'),
  cultureProduct('tropical-island-holiday-gift-box', { en: 'Tropical Island Holiday Gift Box', zh: '热带海岛度假精美礼盒', id: 'Kotak Hadiah Liburan Pulau Tropis', ja: '熱帯島リゾートギフトボックス', ko: '열대 섬 휴양 기프트 박스', ru: 'Подарочная коробка для отдыха на тропическом острове', ar: 'صندوق هدايا لعطلة في جزيرة استوائية' }, 24, 26, 'tropical-island-holiday-gift-box.png'),
  cultureProduct('island-sunset-travel-gift-set', { en: 'Island Sunset Premium Travel Gift Set', zh: '海岛日落高端旅行礼品套装', id: 'Set Hadiah Perjalanan Premium Senja Pulau', ja: '島の夕景プレミアムトラベルギフトセット', ko: '섬 노을 프리미엄 여행 선물 세트', ru: 'Премиальный дорожный подарочный набор «Закат острова»', ar: 'طقم هدايا سفر فاخر لغروب الجزيرة' }, 29, 12, 'island-sunset-premium-travel-gift-set.png'),
  cultureProduct('li-premium-souvenir-gift-set', { en: 'Li Cultural Premium Souvenir Gift Set', zh: '黎族高端伴手礼套装', id: 'Set Suvenir Premium Budaya Li', ja: 'リー族文化プレミアム手土産セット', ko: '리족 문화 프리미엄 기념품 세트', ru: 'Премиальный сувенирный набор культуры ли', ar: 'طقم تذكارات فاخر من ثقافة لي' }, 42, 21, 'li-premium-souvenir-gift-set.png'),
  cultureProduct('miao-silver-collector-gift-box', { en: "Miao Silver Jewellery Collector's Gift Box", zh: '苗族银饰收藏级礼盒', id: 'Kotak Hadiah Kolektor Perhiasan Perak Miao', ja: 'ミャオ族銀飾コレクターズギフトボックス', ko: '먀오족 은장식 컬렉터 기프트 박스', ru: 'Коллекционная подарочная коробка серебряных украшений мяо', ar: 'صندوق هدايا لهواة جمع حلي مياو الفضية' }, 16, 40, 'miao-silver-collector-gift-box.png'),
  cultureProduct('qiongverse-huali-aroma-gift-box', { en: 'QIONGVERSE Huali Aroma Gift Box', zh: '琼境花梨香薰礼盒', id: 'Kotak Hadiah Aroma Huali QIONGVERSE', ja: 'QIONGVERSE 花梨アロマギフトボックス', ko: 'QIONGVERSE 화리 향기 기프트 박스', ru: 'Ароматический подарочный набор QIONGVERSE с мотивом хуа-ли', ar: 'صندوق هدايا عطري QIONGVERSE بطابع هُوالي' }, 12, 34, 'qiongverse-huali-aroma-gift-box.jpg'),
  cultureProduct('wenchang-aerospace-city-gift-set', { en: 'Wenchang Aerospace Premium City Gift Set', zh: '文昌航天高端城市礼品套装', id: 'Set Hadiah Kota Premium Dirgantara Wenchang', ja: '文昌宇宙開発プレミアムシティギフトセット', ko: '원창 우주항공 프리미엄 도시 선물 세트', ru: 'Премиальный городской подарочный набор «Космический Вэньчан»', ar: 'طقم هدايا مدينة فاخر لفضاء ونتشانغ' }, 22, 30, 'wenchang-aerospace-premium-city-gift-set.png'),
  cultureProduct('tropical-coastal-space-city-souvenir', { en: 'China Tropical Coastal Space City Premium Souvenir', zh: '中国热带滨海航天城精品伴手礼', id: 'Suvenir Premium Kota Antariksa Pesisir Tropis Tiongkok', ja: '中国熱帯海浜宇宙都市プレミアム手土産', ko: '중국 열대 해안 우주도시 프리미엄 기념품', ru: 'Премиальный сувенир тропического прибрежного космического города Китая', ar: 'تذكار فاخر لمدينة الفضاء الساحلية الاستوائية في الصين' }, 34, 16, 'china-tropical-coastal-space-city-souvenir.png'),
  cultureProduct('beautiful-countryside-agritourism-gift-box', { en: 'China Beautiful Countryside Premium Agri-Cultural Tourism Gift Box', zh: '中国美丽乡村高端农文旅礼盒', id: 'Kotak Hadiah Premium Agrowisata Budaya Pedesaan Indah Tiongkok', ja: '中国美しい農村プレミアム農文旅ギフトボックス', ko: '중국 아름다운 농촌 프리미엄 농업·문화관광 기프트 박스', ru: 'Премиальная подарочная коробка агрокультурного туризма красивой китайской деревни', ar: 'صندوق هدايا فاخر للسياحة الزراعية والثقافية في الريف الصيني الجميل' }, 14, 38, 'china-beautiful-countryside-agritourism-gift-box.png'),
  cultureProduct('ecological-agriculture-gift', { en: 'Eco-Agriculture Gift', zh: '生态农业精美礼品', id: 'Hadiah Pertanian Ekologis', ja: 'エコ農業ギフト', ko: '생태 농업 기프트', ru: 'Подарок экологического сельского хозяйства', ar: 'هدية الزراعة البيئية' }, 28, 24, 'ecological-agriculture-gift.png'),
  cultureProduct('fushan-coffee-beans', { en: 'Fushan Coffee Beans', zh: '福山咖啡豆', id: 'Biji Kopi Fushan', ja: '福山コーヒー豆', ko: '푸산 커피 원두', ru: 'Кофейные зерна Фушань', ar: 'حبوب قهوة فوشان' }, 19, 20, 'fushan-coffee-beans.webp'),
  cultureProduct('tropical-fruit', { en: 'Tropical Fruit', zh: '热带水果', id: 'Buah Tropis', ja: 'トロピカルフルーツ', ko: '열대 과일', ru: 'Тропические фрукты', ar: 'فواكه استوائية' }, 18, 27, 'tropical-fruit.webp'),
  product('luoyin-figure', 'ip', { en: 'Luoyin IP', zh: '螺音 IP' }, { en: 'Luoyin Explorer Figure', zh: '螺音探索者手办' }, { en: 'A project character collectible for the QIONGVERSE story world.', zh: '为琼境故事世界设计的项目角色收藏品。' }, 48, 15, '/assets/demo-market/ip/luoyin.png', { en: 'Luoyin project character demo product visual', zh: '螺音项目角色演示商品图' }),
  product('guardian-blind-box', 'ip', { en: 'Luoyin IP', zh: '螺音 IP' }, { en: 'Hidden Guardian Blind Box', zh: '守护灵隐藏款盲盒' }, { en: 'A concept blind-box edition from the Luoyin companion collection.', zh: '螺音伙伴系列的概念隐藏款盲盒。' }, 22, 9, '/assets/demo-market/ip/hidden-guardian.png', { en: 'Hidden Guardian demo product visual', zh: '守护灵演示商品图' }),
  product('luoyin-animation-license', 'ip', { en: 'Luoyin IP licensing', zh: '螺音 IP 授权' }, { en: 'Luoyin IP Copyright Licence', zh: '螺音 IP 版权授权' }, { en: 'A project demonstration of a copyright licence for the QIONGVERSE character system.', zh: '面向琼境角色系统的版权授权项目演示。' }, 200, 32, '/assets/demo-market/ip/luoyin-animation-library.jpg', { en: 'Luoyin IP copyright licensing demo visual', zh: '螺音 IP 版权授权演示图' }),
]

export const demoServices: DemoService[] = [
  { id: 'immersive-world', title: { en: 'Immersive Open-World Destinations', zh: '实景开放大世界' }, summary: { en: 'Turn a scenic area, cultural district or village route into a navigable space that visitors can explore in first- or third-person view.', zh: '将景区、文化街区或乡村线路组织成可漫游的空间，用户可用第一人称或第三人称自由探索。' }, deliverables: [{ en: 'First / third-person navigation', zh: '第一 / 第三人称探索' }, { en: 'Scene + exhibit points', zh: '场景与展项点位' }, { en: 'Web MVP → game-ready plan', zh: '网页 MVP → 游戏化开发规划' }], demo: true },
  { id: 'virtual-exhibition', title: { en: 'Virtual Digital Exhibition', zh: '虚拟数字展厅' }, summary: { en: 'Build a source-aware exhibition layer for museums, tourism institutions, merchants and cultural brands—collections, maps, stories and multilingual reading in one place.', zh: '为博物馆、文旅机构、商家与文化品牌搭建有来源边界的数字展厅，将展项、地图、故事与多语阅读放在同一条路径中。' }, deliverables: [{ en: 'Exhibition narrative system', zh: '展览叙事系统' }, { en: 'Source + rights labels', zh: '来源与授权标记' }, { en: 'Multilingual visitor flow', zh: '多语种访客流程' }], demo: true },
  { id: 'digital-human-ip', title: { en: 'Resident AI Guide', zh: '常驻 AI 数字人导览' }, summary: { en: 'Keep an AI companion available throughout exploration to introduce scenery, exhibits and cultural context in the visitor’s language.', zh: '让 AI 数字人常驻屏幕，在用户探索过程中介绍景观、展项与文化语境，并根据当前环境提供导览。' }, deliverables: [{ en: 'Contextual exhibit guidance', zh: '基于语境的展项讲解' }, { en: 'Seven-language dialogue', zh: '七语种对话' }, { en: 'Voice / text fallback', zh: '语音 / 文字降级' }], demo: true },
  { id: 'operations-promotion', title: { en: '3D Product & Cultural Commerce Extension', zh: '3D 商品与文化消费延展' }, summary: { en: 'Place an authorized product zone inside the world; visitors inspect 3D product concepts while the AI guide explains the story before a human-confirmed sales path.', zh: '在开放大世界中设置经过授权的商品区，用户可查看 3D 商品概念，AI 数字人辅助讲解产品故事，再由人工或官方渠道完成确认。' }, deliverables: [{ en: 'In-world product zone', zh: '大世界商品售卖区' }, { en: '3D product preview', zh: '3D 商品预览' }, { en: 'Interest → official sales handoff', zh: '购买意向 → 官方销售承接' }], demo: true },
]

type CommerceLocale = Exclude<Language, 'en' | 'zh'>
type CommerceLocaleValues = Partial<Record<CommerceLocale, string>>
type CommerceHydration = {
  category?: CommerceLocaleValues
  title?: CommerceLocaleValues
  summary?: CommerceLocaleValues
  imageAlt?: CommerceLocaleValues
  storyAlt?: CommerceLocaleValues
  deliverables?: CommerceLocaleValues[]
}

/* These authored values complete the catalogue before any UI renders it. They
 * are explicit translations, so the generic legacy vocabulary never becomes a
 * public fallback for the market routes. */
const commerceHydration: Record<string, CommerceHydration> = {
  'huali-craft-tray': { category: { id: 'Kerajinan huali', ja: '花梨工芸', ko: '화리 공예', ru: 'Ремесло хуа-ли', ar: 'حِرف هُوالي' }, title: { id: 'Nampan meja serat huali', ja: '花梨木目のデスクトレー', ko: '화리 나뭇결 데스크 트레이', ru: 'Настольный поднос с узором хуа-ли', ar: 'صينية مكتبية بنقشة هُوالي' }, summary: { id: 'Benda meja berinspirasi serat huali Hainan untuk ritual kerja yang penuh perhatian.', ja: '海南の花梨の木目に着想を得た、丁寧な仕事の時間のためのデスクオブジェ。', ko: '하이난 화리 나뭇결에서 영감을 받은 사려 깊은 업무 의식용 책상 소품입니다.', ru: 'Настольный предмет с мотивом хайнаньского хуа-ли для вдумчивого рабочего ритуала.', ar: 'قطعة مكتبية مستوحاة من عروق خشب هُوالي في هاينان لطقس عمل متأنٍ.' }, imageAlt: { id: 'Visual demo produk kerajinan huali', ja: '花梨工芸のデモ商品ビジュアル', ko: '화리 공예 데모 상품 이미지', ru: 'Визуал демонстрационного изделия из хуа-ли', ar: 'صورة منتج تجريبي من حِرف هُوالي' }, storyAlt: { id: 'Kajian 3D huali proyek, bukan bukti penjualan', ja: 'プロジェクトの花梨3D研究、販売証拠ではありません', ko: '프로젝트 화리 3D 연구, 판매 증거 아님', ru: 'Проектное 3D-исследование хуа-ли, не подтверждение продажи', ar: 'دراسة ثلاثية الأبعاد لهُوالي من المشروع وليست دليلاً على البيع' } },
  'huali-scent-token': { category: { id: 'Kerajinan huali', ja: '花梨工芸', ko: '화리 공예', ru: 'Ремесло хуа-ли', ar: 'حِرف هُوالي' }, title: { id: 'Set kenang-kenangan aroma huali', ja: '花梨の香りのトークンセット', ko: '화리 향기 토큰 세트', ru: 'Набор ароматических талисманов хуа-ли', ar: 'مجموعة تذكارات برائحة هُوالي' }, summary: { id: 'Konsep koleksi kecil yang mengubah ingatan material menjadi kenang-kenangan perjalanan.', ja: '素材の記憶を旅の記念品に変える、小さなコレクションのコンセプト。', ko: '재료의 기억을 여행 기념품으로 바꾸는 작은 컬렉션 콘셉트입니다.', ru: 'Небольшая коллекционная концепция, превращающая память о материале в дорожный сувенир.', ar: 'مفهوم مقتنى صغير يحوّل ذاكرة الخامة إلى تذكار سفر.' }, imageAlt: { id: 'Visual demo token aroma huali', ja: '花梨の香りトークンのデモ商品ビジュアル', ko: '화리 향기 토큰 데모 상품 이미지', ru: 'Визуал демонстрационного ароматического талисмана хуа-ли', ar: 'صورة تذكار عطري تجريبي من هُوالي' } },
  'huali-postcard-case': { category: { id: 'Kerajinan huali', ja: '花梨工芸', ko: '화리 공예', ru: 'Ремесло хуа-ли', ar: 'حِرف هُوالي' }, title: { id: 'Kotak kartu pos huali', ja: '花梨のポストカードケース', ko: '화리 엽서 케이스', ru: 'Футляр для открыток из хуа-ли', ar: 'حافظة بطاقات بريدية من هُوالي' }, summary: { id: 'Konsep wadah untuk surat, tiket, dan fragmen visual Hainan.', ja: '手紙、チケット、海南の視覚的な断片を収めるプレゼンテーションケースのコンセプト。', ko: '편지, 티켓, 하이난의 시각적 조각을 담는 전시 케이스 콘셉트입니다.', ru: 'Концепция футляра для писем, билетов и визуальных фрагментов Хайнаня.', ar: 'مفهوم حافظة لعرض الرسائل والتذاكر والشذرات البصرية من هاينان.' }, imageAlt: { id: 'Visual demo kotak kartu pos huali', ja: '花梨のポストカードケースのデモビジュアル', ko: '화리 엽서 케이스 데모 이미지', ru: 'Визуал демонстрационного футляра для открыток из хуа-ли', ar: 'صورة حافظة بطاقات بريدية تجريبية من هُوالي' } },
  'lijin-pattern-scarf': { category: { id: 'Brocade Li', ja: '黎錦', ko: '리 브로케이드', ru: 'Ли-цзинь', ar: 'بروكار لي' }, title: { id: 'Syal perjalanan bermotif Li', ja: '黎族文様のトラベルスカーフ', ko: '리 문양 여행 스카프', ru: 'Дорожный шарф с узором ли', ar: 'وشاح سفر بنقوش لي' }, summary: { id: 'Aksesori studi pola dwibahasa yang terinspirasi ritme tekstil Li.', ja: '黎族織物のリズムに着想を得た、二言語の文様研究アクセサリー。', ko: '리족 직물의 리듬에서 영감을 받은 이중 언어 문양 연구 액세서리입니다.', ru: 'Двуязычный аксессуар-исследование узора, вдохновлённый ритмом тканей ли.', ar: 'إكسسوار لدراسة نقوش ثنائي اللغة مستوحى من إيقاع منسوجات لي.' }, imageAlt: { id: 'Visual demo syal bermotif Li', ja: '黎族文様スカーフのデモ商品ビジュアル', ko: '리 문양 스카프 데모 상품 이미지', ru: 'Визуал демонстрационного шарфа с узором ли', ar: 'صورة وشاح تجريبي بنقوش لي' }, storyAlt: { id: 'Kajian 3D tekstil Li proyek, bukan bukti penjualan', ja: 'プロジェクトの黎族織物3D研究、販売証拠ではありません', ko: '프로젝트 리족 직물 3D 연구, 판매 증거 아님', ru: 'Проектное 3D-исследование ткани ли, не подтверждение продажи', ar: 'دراسة ثلاثية الأبعاد لمنسوجات لي وليست دليلاً على البيع' } },
  'lijin-notebook': { category: { id: 'Brocade Li', ja: '黎錦', ko: '리 브로케이드', ru: 'Ли-цзинь', ar: 'بروكار لي' }, title: { id: 'Buku catatan lapangan bermotif Li', ja: '黎族文様のフィールドノート', ko: '리 문양 현장 노트', ru: 'Полевой блокнот с узором ли', ar: 'دفتر ملاحظات ميداني بنقوش لي' }, summary: { id: 'Konsep catatan lapangan yang memadukan tulisan perjalanan dengan referensi pola visual.', ja: '旅の文章と視覚的な文様資料を組み合わせるフィールドノートのコンセプト。', ko: '여행 기록과 시각적 문양 자료를 짝지은 현장 노트 콘셉트입니다.', ru: 'Концепция полевого блокнота, соединяющая дорожные записи и визуальные мотивы.', ar: 'مفهوم دفتر ميداني يجمع كتابة السفر مع مراجع النقوش البصرية.' }, imageAlt: { id: 'Visual demo buku catatan bermotif Li', ja: '黎族文様フィールドノートのデモビジュアル', ko: '리 문양 현장 노트 데모 이미지', ru: 'Визуал демонстрационного полевого блокнота с узором ли', ar: 'صورة دفتر ميداني تجريبي بنقوش لي' } },
  'lijin-patch-set': { category: { id: 'Brocade Li', ja: '黎錦', ko: '리 브로케이드', ru: 'Ли-цзинь', ar: 'بروكار لي' }, title: { id: 'Set patch bermotif Li', ja: '黎族文様ワッペンセット', ko: '리 문양 패치 세트', ru: 'Набор нашивок с узорами ли', ar: 'مجموعة رقع بنقوش لي' }, summary: { id: 'Set koleksi untuk jurnal, tas perjalanan, dan pertukaran budaya.', ja: '手帳、トラベルバッグ、文化交流のためにデザインしたコレクションワッペン。', ko: '다이어리, 여행 가방, 문화 교류를 위해 디자인한 컬렉션 패치 세트입니다.', ru: 'Коллекционный набор для дневников, дорожных сумок и культурного обмена.', ar: 'مجموعة مقتنيات صُممت للمذكرات وحقائب السفر والتبادل الثقافي.' }, imageAlt: { id: 'Visual demo set patch bermotif Li', ja: '黎族文様ワッペンセットのデモビジュアル', ko: '리 문양 패치 세트 데모 이미지', ru: 'Визуал демонстрационного набора нашивок с узорами ли', ar: 'صورة مجموعة رقع تجريبية بنقوش لي' } },
  'tropical-atlas': { category: { id: 'Ekologi pulau', ja: '島の生態', ko: '섬 생태', ru: 'Островная экология', ar: 'بيئة الجزيرة' }, title: { id: 'Atlas lapangan pulau tropis', ja: '熱帯島フィールドアトラス', ko: '열대 섬 현장 아틀라스', ru: 'Полевой атлас тропического острова', ar: 'أطلس ميداني للجزيرة الاستوائية' }, summary: { id: 'Konsep atlas visual untuk membaca pantai, terumbu, dan hutan hujan bersama.', ja: '海岸、サンゴ礁、熱帯雨林を一緒に読むためのビジュアル旅行アトラス。', ko: '해안, 산호초, 열대우림을 함께 읽는 시각 여행 아틀라스 콘셉트입니다.', ru: 'Концепция визуального атласа для совместного чтения побережья, рифа и дождевого леса.', ar: 'مفهوم أطلس سفر بصري لقراءة الساحل والشعاب والغابة المطيرة معاً.' }, imageAlt: { id: 'Visual demo atlas pulau tropis', ja: '熱帯島フィールドアトラスのデモビジュアル', ko: '열대 섬 현장 아틀라스 데모 이미지', ru: 'Визуал демонстрационного атласа тропического острова', ar: 'صورة أطلس ميداني تجريبي للجزيرة الاستوائية' }, storyAlt: { id: 'Kajian lingkungan 3D proyek, bukan bukti penjualan', ja: 'プロジェクトの3D環境研究、販売証拠ではありません', ko: '프로젝트 3D 환경 연구, 판매 증거 아님', ru: 'Проектное 3D-исследование среды, не подтверждение продажи', ar: 'دراسة ثلاثية الأبعاد لبيئة المشروع وليست دليلاً على البيع' } },
  'reef-light': { category: { id: 'Ekologi pulau', ja: '島の生態', ko: '섬 생태', ru: 'Островная экология', ar: 'بيئة الجزيرة' }, title: { id: 'Objek meja cahaya terumbu', ja: 'リーフライトのデスクオブジェ', ko: '산호초 빛 데스크 오브제', ru: 'Настольный объект «Свет рифа»', ar: 'قطعة مكتبية بضوء الشعاب' }, summary: { id: 'Konsep objek bercahaya kecil yang terinspirasi ekologi terumbu Hainan.', ja: '海南のサンゴ礁生態に着想を得た、小さな光るオブジェのコンセプト。', ko: '하이난 산호초 생태계에서 영감을 받은 작은 조명 오브제 콘셉트입니다.', ru: 'Концепция небольшого светового объекта, вдохновлённая рифовыми экосистемами Хайнаня.', ar: 'مفهوم قطعة مضيئة صغيرة مستوحاة من بيئات الشعاب في هاينان.' }, imageAlt: { id: 'Visual demo objek cahaya terumbu', ja: 'リーフライトのデモ商品ビジュアル', ko: '산호초 빛 데모 상품 이미지', ru: 'Визуал демонстрационного объекта «Свет рифа»', ar: 'صورة قطعة ضوء شعاب تجريبية' } },
  'coast-card-set': { category: { id: 'Ekologi pulau', ja: '島の生態', ko: '섬 생태', ru: 'Островная экология', ar: 'بيئة الجزيرة' }, title: { id: 'Set kartu pos pesisir Hainan', ja: '海南海岸ポストカードセット', ko: '하이난 해안 엽서 세트', ru: 'Набор открыток побережья Хайнаня', ar: 'مجموعة بطاقات بريدية لساحل هاينان' }, summary: { id: 'Set surat perjalanan yang dibentuk oleh warna dan tepian pulau.', ja: '島の色と輪郭を軸にデザインした、旅の手紙セット。', ko: '섬의 색과 가장자리에서 형태를 얻은 여행 편지 세트입니다.', ru: 'Набор дорожной переписки, созданный вокруг цветов и очертаний острова.', ar: 'مجموعة مراسلات سفر تشكلت حول ألوان الجزيرة وحوافها.' }, imageAlt: { id: 'Visual demo set kartu pos pesisir Hainan', ja: '海南海岸ポストカードセットのデモビジュアル', ko: '하이난 해안 엽서 세트 데모 이미지', ru: 'Визуал демонстрационного набора открыток побережья Хайнаня', ar: 'صورة مجموعة بطاقات ساحل هاينان التجريبية' } },
  'village-tea-kit': { category: { id: 'Perjalanan desa', ja: '農村の旅', ko: '농촌 여행', ru: 'Путешествия по деревням', ar: 'رحلات القرى' }, title: { id: 'Kit jeda teh desa', ja: '村のティーブレイクキット', ko: '마을 차 휴식 키트', ru: 'Набор для чайной паузы в деревне', ar: 'طقم استراحة شاي ريفية' }, summary: { id: 'Konsep ritual perjalanan lambat untuk menandai jeda dalam perjalanan budaya.', ja: '文化の旅にひと休みを描く、スロートラベルの儀式キット。', ko: '문화 여행 속 쉼표를 그려 보는 느린 여행 의식 키트 콘셉트입니다.', ru: 'Концепция ритуального набора медленного путешествия для обозначения паузы в культурном маршруте.', ar: 'مفهوم طقم طقس للسفر البطيء يرسم استراحة داخل رحلة ثقافية.' }, imageAlt: { id: 'Visual demo kit jeda teh desa', ja: '村のティーブレイクキットのデモビジュアル', ko: '마을 차 휴식 키트 데모 이미지', ru: 'Визуал демонстрационного набора для чайной паузы', ar: 'صورة طقم استراحة شاي ريفية تجريبية' } },
  'village-map-print': { category: { id: 'Perjalanan desa', ja: '農村の旅', ko: '농촌 여행', ru: 'Путешествия по деревням', ar: 'رحلات القرى' }, title: { id: 'Cetak seni rute desa', ja: '村のルートアートプリント', ko: '마을 경로 아트 프린트', ru: 'Арт-принт маршрута по деревне', ar: 'طبعة فنية لمسار ريفي' }, summary: { id: 'Konsep rute bergambar yang menghubungkan tekstur setempat, musim, dan ritme berjalan.', ja: '土地の質感、季節、歩く速度をつなぐイラストルートのコンセプト。', ko: '지역의 질감, 계절, 걷는 속도를 잇는 일러스트 경로 콘셉트입니다.', ru: 'Концепция иллюстрированного маршрута, соединяющего местную фактуру, сезоны и темп прогулки.', ar: 'مفهوم مسار مصوّر يصل بين ملمس المكان والفصول وإيقاع المشي.' }, imageAlt: { id: 'Visual demo cetak seni rute desa', ja: '村のルートアートプリントのデモビジュアル', ko: '마을 경로 아트 프린트 데모 이미지', ru: 'Визуал демонстрационного арт-принта деревенского маршрута', ar: 'صورة طبعة فنية لمسار ريفي تجريبية' } },
  'village-sound-kit': { category: { id: 'Perjalanan desa', ja: '農村の旅', ko: '농촌 여행', ru: 'Путешествия по деревням', ar: 'رحلات القرى' }, title: { id: 'Kit kartu pos suara desa', ja: '村の音ポストカードキット', ko: '마을 소리 엽서 키트', ru: 'Набор звуковых открыток деревни', ar: 'طقم بطاقات بريدية لأصوات القرية' }, summary: { id: 'Konsep kartu pos untuk mengumpulkan suasana tempat tanpa mengklaim rekaman nyata.', ja: '録音内容を主張せず、場所の空気を集めるポストカードのコンセプト。', ko: '실제 녹음이라고 주장하지 않고 장소의 분위기를 모으는 엽서 콘셉트입니다.', ru: 'Концепция открытки для сбора атмосферы места без заявления о реальной записи.', ar: 'مفهوم بطاقة بريدية لجمع أجواء المكان دون الادعاء بوجود تسجيل حقيقي.' }, imageAlt: { id: 'Visual demo kit kartu pos suara desa', ja: '村の音ポストカードキットのデモビジュアル', ko: '마을 소리 엽서 키트 데모 이미지', ru: 'Визуал демонстрационного набора звуковых открыток', ar: 'صورة طقم بطاقات أصوات القرية التجريبية' } },
  'luoyin-figure': { category: { id: 'IP Luoyin', ja: '螺音 IP', ko: '뤄인 IP', ru: 'IP Луоинь', ar: 'ملكية لويين' }, title: { id: 'Figur penjelajah Luoyin', ja: '螺音の探検者フィギュア', ko: '뤄인 탐험자 피규어', ru: 'Фигурка исследовательницы Луоинь', ar: 'مجسم مستكشفة لويين' }, summary: { id: 'Koleksi karakter proyek untuk dunia cerita QIONGVERSE.', ja: 'QIONGVERSEの物語世界のためのプロジェクトキャラクターコレクション。', ko: 'QIONGVERSE 이야기 세계를 위한 프로젝트 캐릭터 컬렉션입니다.', ru: 'Коллекционный персонаж проекта для сюжетного мира QIONGVERSE.', ar: 'مجسم شخصية من المشروع لعالم قصة QIONGVERSE.' }, imageAlt: { id: 'Visual demo karakter proyek Luoyin', ja: '螺音プロジェクトキャラクターのデモ商品ビジュアル', ko: '뤄인 프로젝트 캐릭터 데모 상품 이미지', ru: 'Визуал демонстрационной фигурки персонажа Луоинь', ar: 'صورة مجسم شخصية لويين التجريبي' } },
  'guardian-blind-box': { category: { id: 'IP Luoyin', ja: '螺音 IP', ko: '뤄인 IP', ru: 'IP Луоинь', ar: 'ملكية لويين' }, title: { id: 'Blind box Penjaga Tersembunyi', ja: '隠された守護者のブラインドボックス', ko: '숨은 수호자 블라인드 박스', ru: 'Слепая коробка «Скрытый хранитель»', ar: 'صندوق الحارس الخفي المفاجئ' }, summary: { id: 'Edisi blind box konseptual dari koleksi pendamping Luoyin.', ja: '螺音の仲間コレクションから生まれたブラインドボックスのコンセプト。', ko: '뤄인 동반자 컬렉션의 콘셉트 블라인드 박스 에디션입니다.', ru: 'Концептуальное издание слепой коробки из коллекции спутников Луоинь.', ar: 'إصدار مفاهيمي من صندوق المفاجآت ضمن مجموعة رفيقة لويين.' }, imageAlt: { id: 'Visual demo blind box Penjaga Tersembunyi', ja: '隠された守護者ブラインドボックスのデモビジュアル', ko: '숨은 수호자 블라인드 박스 데모 이미지', ru: 'Визуал демонстрационной слепой коробки «Скрытый хранитель»', ar: 'صورة صندوق الحارس الخفي التجريبية' } },
  'luoyin-animation-license': { category: { id: 'Lisensi IP Luoyin', ja: '螺音 IP ライセンス', ko: '뤄인 IP 라이선스', ru: 'Лицензирование IP Луоинь', ar: 'ترخيص ملكية لويين' }, title: { id: 'Lisensi hak cipta IP Luoyin', ja: '螺音 IP著作権ライセンス', ko: '뤄인 IP 저작권 라이선스', ru: 'Лицензия на авторские права IP Луоинь', ar: 'ترخيص حقوق نشر ملكية لويين' }, summary: { id: 'Demo proyek lisensi hak cipta untuk sistem karakter QIONGVERSE.', ja: 'QIONGVERSEキャラクターシステムの著作権ライセンスを示すプロジェクトデモ。', ko: 'QIONGVERSE 캐릭터 시스템을 위한 저작권 라이선스 프로젝트 데모입니다.', ru: 'Демонстрация проектной лицензии авторских прав для системы персонажей QIONGVERSE.', ar: 'عرض مشروع لترخيص حقوق نشر نظام شخصيات QIONGVERSE.' }, imageAlt: { id: 'Visual demo lisensi hak cipta IP Luoyin', ja: '螺音 IP著作権ライセンスのデモビジュアル', ko: '뤄인 IP 저작권 라이선스 데모 이미지', ru: 'Визуал демонстрации лицензии на авторские права IP Луоинь', ar: 'صورة عرض ترخيص حقوق نشر ملكية لويين' } },
  'virtual-exhibition': { title: { id: 'Situs pameran virtual', ja: 'バーチャル展示ウェブサイト', ko: '가상 전시 웹사이트', ru: 'Сайт виртуальной выставки', ar: 'موقع معرض افتراضي' }, summary: { id: 'Destinasi pameran dwibahasa untuk museum, ruang pamer, dan bisnis budaya.', ja: '美術館、会場、文化事業者向けのバイリンガル展示体験。', ko: '박물관, 전시장, 문화 기업을 위한 이중 언어 전시 공간입니다.', ru: 'Двуязычное выставочное пространство для музеев, площадок и культурного бизнеса.', ar: 'وجهة معرض ثنائية اللغة للمتاحف والقاعات والأعمال الثقافية.' }, deliverables: [{ id: 'Arsitektur informasi', ja: '情報アーキテクチャ', ko: '정보 구조', ru: 'Информационная архитектура', ar: 'هندسة المعلومات' }, { id: 'Sistem visual pameran', ja: '展示ビジュアルシステム', ko: '전시 시각 시스템', ru: 'Визуальная система выставки', ar: 'النظام البصري للمعرض' }, { id: 'Alur pengunjung dwibahasa', ja: 'バイリンガル来場者フロー', ko: '이중 언어 방문자 흐름', ru: 'Двуязычный путь посетителя', ar: 'مسار زائر ثنائي اللغة' }] },
  'immersive-world': { title: { id: 'Dunia destinasi imersif', ja: '没入型デスティネーションワールド', ko: '몰입형 목적지 월드', ru: 'Иммерсивный мир направления', ar: 'عالم وجهة غامر' }, summary: { id: 'Cerita ruang yang dapat dijelajahi untuk destinasi, distrik budaya, dan rute wisata.', ja: '目的地、文化地区、観光ルートのための歩いて巡れる空間ストーリー。', ko: '목적지, 문화 지구, 관광 경로를 위한 탐색 가능한 공간 이야기입니다.', ru: 'Пространственная история для направлений, культурных кварталов и туристических маршрутов.', ar: 'قصة مكانية قابلة للاستكشاف للوجهات والأحياء الثقافية والمسارات السياحية.' }, deliverables: [{ id: 'Konsep dunia', ja: 'ワールドコンセプト', ko: '월드 콘셉트', ru: 'Концепция мира', ar: 'مفهوم العالم' }, { id: 'Perjalanan interaktif', ja: 'インタラクティブな旅', ko: '인터랙티브 여정', ru: 'Интерактивное путешествие', ar: 'رحلة تفاعلية' }, { id: 'Prototipe adegan', ja: 'シーンプロトタイプ', ko: '장면 프로토타입', ru: 'Прототип сцены', ar: 'نموذج مشهد' }] },
  'digital-human-ip': { title: { id: 'Manusia digital AI dan IP', ja: 'AIデジタルヒューマンとIP', ko: 'AI 디지털 휴먼 및 IP', ru: 'ИИ-цифровой человек и IP', ar: 'إنسان رقمي وملكية بالذكاء الاصطناعي' }, summary: { id: 'Sistem karakter yang menghubungkan panduan multibahasa, identitas, dan kehadiran konten.', ja: '多言語ガイド、アイデンティティ、コンテンツ表現をつなぐキャラクターシステム。', ko: '다국어 안내, 정체성, 콘텐츠 표현을 연결하는 캐릭터 시스템입니다.', ru: 'Система персонажа, объединяющая многоязычный гид, идентичность и присутствие в контенте.', ar: 'نظام شخصية يصل بين الإرشاد متعدد اللغات والهوية وحضور المحتوى.' }, deliverables: [{ id: 'Arah karakter', ja: 'キャラクターディレクション', ko: '캐릭터 방향', ru: 'Направление персонажа', ar: 'توجيه الشخصية' }, { id: 'Skrip interaksi', ja: 'インタラクション台本', ko: '상호작용 스크립트', ru: 'Сценарий взаимодействия', ar: 'سيناريو التفاعل' }, { id: 'Prototipe visual', ja: 'ビジュアルプロトタイプ', ko: '비주얼 프로토타입', ru: 'Визуальный прототип', ar: 'نموذج بصري' }] },
  'operations-promotion': { title: { id: 'Operasi dan promosi lintas batas', ja: '運営と越境プロモーション', ko: '운영 및 국경 간 홍보', ru: 'Операции и трансграничное продвижение', ar: 'التشغيل والترويج عبر الحدود' }, summary: { id: 'Rute konten dan kampanye praktis untuk jangkauan budaya di berbagai pasar.', ja: '複数市場に文化を届けるための実践的なコンテンツとキャンペーンの道筋。', ko: '여러 시장에 문화를 전하기 위한 실용적 콘텐츠와 캠페인 경로입니다.', ru: 'Практический маршрут контента и кампаний для культурного охвата разных рынков.', ar: 'مسار عملي للمحتوى والحملات للوصول الثقافي عبر الأسواق.' }, deliverables: [{ id: 'Rute audiens', ja: 'オーディエンスルート', ko: '오디언스 경로', ru: 'Путь аудитории', ar: 'مسار الجمهور' }, { id: 'Kalender konten', ja: 'コンテンツカレンダー', ko: '콘텐츠 캘린더', ru: 'Контент-календарь', ar: 'تقويم المحتوى' }, { id: 'Konsep kampanye', ja: 'キャンペーンコンセプト', ko: '캠페인 콘셉트', ru: 'Концепция кампании', ar: 'مفهوم الحملة' }] },
}

const addCommerceLocales = (value: Localized, translations?: CommerceLocaleValues) => {
  if (!translations) return
  Object.assign(value, translations)
}

for (const entry of demoProducts) {
  const translation = commerceHydration[entry.id]
  if (!translation) continue
  addCommerceLocales(entry.category, translation.category)
  addCommerceLocales(entry.title, translation.title)
  addCommerceLocales(entry.summary, translation.summary)
  addCommerceLocales(entry.imageAlt, translation.imageAlt)
  if (entry.story) addCommerceLocales(entry.story.alt, translation.storyAlt)
}
for (const entry of demoServices) {
  const translation = commerceHydration[entry.id]
  if (!translation) continue
  addCommerceLocales(entry.title, translation.title)
  addCommerceLocales(entry.summary, translation.summary)
  translation.deliverables?.forEach((item, index) => addCommerceLocales(entry.deliverables[index], item))
}

/* The service page is also used as a multilingual jury-facing brief. Keep its
 * four capability cards semantically aligned across locales instead of letting
 * the older catalogue hydration overwrite them with the former commerce copy. */
const serviceLocaleOverrides: Record<string, { title: Localized; summary: Localized; deliverables: Localized[] }> = {
  'immersive-world': {
    title: { en: 'Immersive Open-World Destinations', zh: '实景开放大世界', id: 'Destinasi Dunia Terbuka Imersif', ja: '没入型オープンワールド観光地', ko: '몰입형 오픈 월드 목적지', ru: 'Иммерсивные открытые миры направлений', ar: 'وجهات عالم مفتوح غامرة' },
    summary: { en: 'Turn a scenic area, cultural district or village route into a navigable space that visitors can explore in first- or third-person view.', zh: '将景区、文化街区或乡村线路组织成可漫游的空间，用户可用第一人称或第三人称自由探索。', id: 'Ubah kawasan wisata, distrik budaya, atau rute desa menjadi ruang yang dapat dijelajahi dari sudut pandang orang pertama atau ketiga.', ja: '景勝地、文化地区、村のルートを、1人称または3人称で歩ける探索空間に変換します。', ko: '관광지·문화 지구·마을 노선을 1인칭 또는 3인칭으로 탐험할 수 있는 공간으로 구성합니다.', ru: 'Превращаем природный объект, культурный район или деревенский маршрут в пространство для исследования от первого или третьего лица.', ar: 'تحويل منطقة سياحية أو حي ثقافي أو مسار قرية إلى مساحة قابلة للاستكشاف بمنظور الشخص الأول أو الثالث.' },
    deliverables: [
      { en: 'First / third-person navigation', zh: '第一 / 第三人称探索', id: 'Navigasi orang pertama / ketiga', ja: '1人称 / 3人称ナビゲーション', ko: '1인칭 / 3인칭 탐험', ru: 'Навигация от первого / третьего лица', ar: 'استكشاف بمنظور الشخص الأول / الثالث' },
      { en: 'Scene + exhibit points', zh: '场景与展项点位', id: 'Adegan + titik pameran', ja: 'シーンと展示ポイント', ko: '장면 + 전시 포인트', ru: 'Сцены и точки экспозиции', ar: 'مشاهد ونقاط عرض' },
      { en: 'Web MVP → game-ready plan', zh: '网页 MVP → 游戏化开发规划', id: 'MVP web → rencana pengembangan gim', ja: 'Web MVP → ゲーム開発計画', ko: '웹 MVP → 게임 개발 계획', ru: 'Веб-MVP → план игровой разработки', ar: 'نسخة ويب أولية ← خطة تطوير لعبة' },
    ],
  },
  'virtual-exhibition': {
    title: { en: 'Virtual Digital Exhibition', zh: '虚拟数字展厅', id: 'Pameran Digital Virtual', ja: 'バーチャルデジタル展示', ko: '가상 디지털 전시관', ru: 'Виртуальная цифровая выставка', ar: 'معرض رقمي افتراضي' },
    summary: { en: 'Build a source-aware exhibition layer for museums, tourism institutions, merchants and cultural brands—collections, maps, stories and multilingual reading in one place.', zh: '为博物馆、文旅机构、商家与文化品牌搭建有来源边界的数字展厅，将展项、地图、故事与多语阅读放在同一条路径中。', id: 'Bangun lapisan pameran berbasis sumber untuk museum, lembaga pariwisata, pedagang, dan merek budaya—koleksi, peta, cerita, dan bacaan multibahasa dalam satu jalur.', ja: '博物館、観光機関、商店、文化ブランドのために、出典を示すコレクション・地図・物語・多言語閲覧を一つの導線にまとめます。', ko: '박물관·관광 기관·상점·문화 브랜드를 위해 출처가 표시된 컬렉션·지도·스토리·다국어 읽기를 하나의 경로로 구성합니다.', ru: 'Создаём выставочный слой с источниками для музеев, туристических организаций, продавцов и культурных брендов: коллекции, карты, истории и многоязычное чтение в одном маршруте.', ar: 'إنشاء طبقة معرض موثقة المصادر للمتاحف والمؤسسات السياحية والتجار والعلامات الثقافية، تجمع المجموعات والخرائط والقصص والقراءة متعددة اللغات.' },
    deliverables: [
      { en: 'Exhibition narrative system', zh: '展览叙事系统', id: 'Sistem narasi pameran', ja: '展示ナラティブシステム', ko: '전시 내러티브 시스템', ru: 'Система выставочного повествования', ar: 'نظام السرد المعرضي' },
      { en: 'Source + rights labels', zh: '来源与授权标记', id: 'Label sumber + hak', ja: '出典・権利ラベル', ko: '출처 + 권리 라벨', ru: 'Метки источников и прав', ar: 'وسوم المصدر والحقوق' },
      { en: 'Multilingual visitor flow', zh: '多语种访客流程', id: 'Alur pengunjung multibahasa', ja: '多言語来館者フロー', ko: '다국어 방문자 흐름', ru: 'Многоязычный путь посетителя', ar: 'مسار زائر متعدد اللغات' },
    ],
  },
  'digital-human-ip': {
    title: { en: 'Resident AI Guide', zh: '常驻 AI 数字人导览', id: 'Pemandu AI yang Selalu Hadir', ja: '常駐AIデジタルガイド', ko: '상주형 AI 디지털 가이드', ru: 'Постоянный ИИ-гид', ar: 'مرشد ذكاء اصطناعي مقيم' },
    summary: { en: 'Keep an AI companion available throughout exploration to introduce scenery, exhibits and cultural context in the visitor’s language.', zh: '让 AI 数字人常驻屏幕，在用户探索过程中介绍景观、展项与文化语境，并根据当前环境提供导览。', id: 'Sediakan pendamping AI sepanjang penjelajahan untuk menjelaskan pemandangan, pameran, dan konteks budaya dalam bahasa pengunjung.', ja: '探索中いつでも使えるAIコンパニオンが、訪問者の言語で景観・展示・文化的文脈を案内します。', ko: '탐험 내내 AI 동반자가 화면에 머물며 방문자의 언어로 풍경·전시·문화적 맥락을 설명합니다.', ru: 'ИИ-компаньон остаётся доступным во время прогулки и объясняет пейзажи, экспонаты и культурный контекст на языке посетителя.', ar: 'يبقى رفيق الذكاء الاصطناعي متاحاً أثناء الاستكشاف ليشرح المشاهد والمعروضات والسياق الثقافي بلغة الزائر.' },
    deliverables: [
      { en: 'Contextual exhibit guidance', zh: '基于语境的展项讲解', id: 'Panduan pameran kontekstual', ja: '文脈に応じた展示ガイド', ko: '맥락 기반 전시 안내', ru: 'Контекстное объяснение экспонатов', ar: 'إرشاد المعروضات حسب السياق' },
      { en: 'Seven-language dialogue', zh: '七语种对话', id: 'Dialog tujuh bahasa', ja: '7言語対話', ko: '7개 언어 대화', ru: 'Диалог на семи языках', ar: 'حوار بسبع لغات' },
      { en: 'Voice / text fallback', zh: '语音 / 文字降级', id: 'Cadangan suara / teks', ja: '音声 / テキストフォールバック', ko: '음성 / 텍스트 대체', ru: 'Резерв: голос / текст', ar: 'بديل صوتي / نصي' },
    ],
  },
  'operations-promotion': {
    title: { en: '3D Product & Cultural Commerce Extension', zh: '3D 商品与文化消费延展', id: 'Ekstensi Produk 3D dan Perdagangan Budaya', ja: '3D商品と文化消費への拡張', ko: '3D 상품 및 문화 소비 확장', ru: 'Расширение к 3D-товарам и культурной коммерции', ar: 'امتداد المنتجات ثلاثية الأبعاد والتجارة الثقافية' },
    summary: { en: 'Place an authorized product zone inside the world; visitors inspect 3D product concepts while the AI guide explains the story before a human-confirmed sales path.', zh: '在开放大世界中设置经过授权的商品区，用户可查看 3D 商品概念，AI 数字人辅助讲解产品故事，再由人工或官方渠道完成确认。', id: 'Tempatkan zona produk berizin di dalam dunia; pengunjung melihat konsep produk 3D, sementara pemandu AI menjelaskan ceritanya sebelum dikonfirmasi manusia.', ja: '許諾済み商品のゾーンを世界内に設け、訪問者が3D商品コンセプトを見ながらAIガイドの説明を聞き、担当者または公式窓口で確認します。', ko: '허가된 상품 구역을 월드 안에 배치하고, 방문자가 3D 상품 콘셉트를 살펴보며 AI 가이드의 설명을 들은 뒤 담당자 또는 공식 채널에서 확인합니다.', ru: 'Размещаем авторизованную товарную зону внутри мира: посетитель рассматривает 3D-концепты, а ИИ-гид рассказывает историю до подтверждения через сотрудника или официальный канал.', ar: 'وضع منطقة منتجات مصرح بها داخل العالم؛ يفحص الزائر مفاهيم المنتجات ثلاثية الأبعاد ويشرح المرشد قصتها قبل التأكيد عبر موظف أو قناة رسمية.' },
    deliverables: [
      { en: 'In-world product zone', zh: '大世界商品售卖区', id: 'Zona produk di dalam dunia', ja: 'ワールド内の商品ゾーン', ko: '월드 내 상품 구역', ru: 'Товарная зона внутри мира', ar: 'منطقة منتجات داخل العالم' },
      { en: '3D product preview', zh: '3D 商品预览', id: 'Pratinjau produk 3D', ja: '3D商品プレビュー', ko: '3D 상품 미리보기', ru: 'Предпросмотр 3D-товара', ar: 'معاينة منتج ثلاثي الأبعاد' },
      { en: 'Interest → official sales handoff', zh: '购买意向 → 官方销售承接', id: 'Minat → kanal penjualan resmi', ja: '関心 → 公式販売窓口へ', ko: '관심 → 공식 판매 채널 인계', ru: 'Интерес → официальный канал продаж', ar: 'الاهتمام ← إحالة إلى البيع الرسمي' },
    ],
  },
}

for (const entry of demoServices) {
  const override = serviceLocaleOverrides[entry.id]
  if (!override) continue
  Object.assign(entry.title, override.title)
  Object.assign(entry.summary, override.summary)
  override.deliverables.forEach((item, index) => Object.assign(entry.deliverables[index], item))
}

export const tx = (language: Language, value: Localized) => localize(value, language)
export const formatDemoPrice = (language: Language, amount: number) => new Intl.NumberFormat(numberLocale(language), { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
