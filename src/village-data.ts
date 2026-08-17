import type { Language } from './data'
import { assertLocalizationTree, type Localized } from './i18n'

export type VillageExhibitKind = 'image' | 'model'

export type VillageExhibit = {
  id: string
  kind: VillageExhibitKind
  title: Localized
  introduction: Localized
  note: Localized
  asset: string
  fallback: string
  modelAsset?: string
  modelPoster?: string
}

export const villageReferenceImage = '/assets/3d/countryside/美丽乡村参考图.png'

const supplied = (id: string, title: Localized, asset: string, introduction: Localized, note: Localized): VillageExhibit => ({
  id, kind: 'image', title: { ...title,
    id: ({ 'Village Threshold': 'Ambang Desa', 'Volcanic Village Table': 'Meja Desa Vulkanik', 'Market Stalls': 'Kios Pasar', 'Terrace Viewing Platform': 'Anjungan Pandang Teras' } as Record<string, string>)[title.en] ?? title.en,
    ja: ({ 'Village Threshold': '村の入口', 'Volcanic Village Table': '火山村の卓上模型', 'Market Stalls': '村の市場の屋台', 'Terrace Viewing Platform': '棚田の展望台' } as Record<string, string>)[title.en] ?? title.en,
    ko: ({ 'Village Threshold': '마을의 문턱', 'Volcanic Village Table': '화산 마을 테이블', 'Market Stalls': '마을 시장 노점', 'Terrace Viewing Platform': '계단식 논 전망대' } as Record<string, string>)[title.en] ?? title.en,
    ru: ({ 'Village Threshold': 'Порог деревни', 'Volcanic Village Table': 'Стол вулканической деревни', 'Market Stalls': 'Рыночные прилавки', 'Terrace Viewing Platform': 'Смотровая площадка террас' } as Record<string, string>)[title.en] ?? title.en,
    ar: ({ 'Village Threshold': 'عتبة القرية', 'Volcanic Village Table': 'طاولة القرية البركانية', 'Market Stalls': 'أكشاك السوق', 'Terrace Viewing Platform': 'منصة مشاهدة المدرجات' } as Record<string, string>)[title.en] ?? title.en,
  }, asset, fallback: villageReferenceImage, introduction, note,
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
    title: { en: `Village Concept Object ${String(index + 1).padStart(2, '0')}`, zh: `乡村概念展品 ${String(index + 1).padStart(2, '0')}`, id: `Objek Konsep Desa ${String(index + 1).padStart(2, '0')}`, ja: `農村コンセプト作品 ${String(index + 1).padStart(2, '0')}`, ko: `농촌 콘셉트 작품 ${String(index + 1).padStart(2, '0')}`, ru: `Сельский концепт-объект ${String(index + 1).padStart(2, '0')}`, ar: `عمل ريفي مفاهيمي ${String(index + 1).padStart(2, '0')}` },
    introduction: { en: 'An AIGC concept exhibit for exploring scale, shelter and shared rural space inside this digital hall.', zh: '为本数字展厅准备的 AIGC 策展概念展品，用于探索尺度、庇护与共享乡村空间。' },
    note: { en: 'Needs review. This model is not a real building, heritage object, architectural plan, property listing or commercial product.', zh: '待审核。该模型不是真实建筑、遗产物件、建筑图纸、房产信息或商业商品。' },
    asset: `/assets/3d/products/village/product-village-${number}-poster.webp`,
    fallback: villageReferenceImage,
    modelPoster: `/assets/3d/products/village/product-village-${number}-poster.webp`,
    modelAsset: `/assets/3d/products/village/product-village-${number}-web.glb`,
  })),
]

const villageBodyTranslations: Record<string, Localized> = {
  'A project-supplied scene for beginning a slower reading of Hainan village life, pathways and shared edges.': { en: 'A project-supplied scene for beginning a slower reading of Hainan village life, pathways and shared edges.', zh: '项目提供的场景图，从村路、边界与共享空间开始阅读海南乡村生活。', id: 'Adegan dari proyek untuk mulai membaca kehidupan desa Hainan, jalur, dan ruang bersama dengan lebih lambat.', ja: '海南の村の暮らし、道、共有の縁をゆっくり読むためのプロジェクト提供の情景です。', ko: '하이난 농촌의 삶과 길, 공유 경계를 천천히 읽기 시작하는 프로젝트 제공 장면입니다.', ru: 'Сцена проекта для медленного чтения жизни деревни Хайнаня, троп и общих границ.', ar: 'مشهد قدمه المشروع لبدء قراءة أبطأ لحياة قرى هاينان ومساراتها وحوافها المشتركة.' },
  'This image is a curatorial atmosphere, not an official village survey, tourism guarantee or current site condition.': { en: 'This image is a curatorial atmosphere, not an official village survey, tourism guarantee or current site condition.', zh: '这是一张策展语境图，不是官方村落调查、旅游保证或当前现场状况说明。', id: 'Gambar ini suasana kuratorial, bukan survei desa resmi, jaminan wisata, atau kondisi lokasi saat ini.', ja: 'キュレーションの雰囲気を示す画像であり、公式の村落調査、旅行保証、現在の現地状況ではありません。', ko: '이 이미지는 큐레이션 분위기이며 공식 마을 조사, 여행 보장 또는 현재 현장 상태가 아닙니다.', ru: 'Это кураторская атмосфера, а не официальный обзор деревни, туристическая гарантия или описание текущего места.', ar: 'هذه الصورة أجواء تنسيقية وليست مسحاً رسمياً للقرية أو ضماناً سياحياً أو وصفاً للحالة الحالية.' },
  'A project-supplied tabletop study of clustered roofs, paths and a shared center for spatial imagination.': { en: 'A project-supplied tabletop study of clustered roofs, paths and a shared center for spatial imagination.', zh: '项目提供的桌面模型图，用于想象屋顶、路径与共享中心组成的聚落空间。', id: 'Studi meja dari proyek tentang atap berkelompok, jalur, dan pusat bersama untuk membayangkan ruang.', ja: '集まる屋根、道、共有の中心から空間を想像するプロジェクト提供の卓上研究です。', ko: '모여 있는 지붕과 길, 공유 중심을 통해 공간을 상상하는 프로젝트 제공 테이블 연구입니다.', ru: 'Настольное исследование проекта о сгруппированных крышах, тропах и общем центре для пространственного воображения.', ar: 'دراسة سطحية قدمها المشروع للأسقف المتجمعة والمسارات والمركز المشترك لتخيل المكان.' },
  'It does not identify a real settlement, construction date, geological record, ownership or route recommendation.': { en: 'It does not identify a real settlement, construction date, geological record, ownership or route recommendation.', zh: '它不用于确认真实聚落、建造年代、地质记录、权属或路线推荐。', id: 'Tidak mengidentifikasi permukiman nyata, tanggal pembangunan, catatan geologi, kepemilikan, atau rekomendasi rute.', ja: '実在の集落、建設時期、地質記録、所有権、ルート案内を特定するものではありません。', ko: '실제 정착지, 건설 시기, 지질 기록, 소유권 또는 경로 추천을 확인하지 않습니다.', ru: 'Он не указывает реальное поселение, дату строительства, геологические записи, владение или маршрут.', ar: 'لا يحدد تجمعاً حقيقياً أو تاريخ بناء أو سجلاً جيولوجياً أو ملكية أو توصية مسار.' },
  'A project-supplied visual study of temporary stalls, shade and the social rhythm of a village market.': { en: 'A project-supplied visual study of temporary stalls, shade and the social rhythm of a village market.', zh: '项目提供的视觉研究图，观察临时摊位、遮阴与乡村集市的社交节奏。', id: 'Studi visual proyek tentang kios sementara, keteduhan, dan irama sosial pasar desa.', ja: '仮設の屋台、日陰、村の市場の社会的リズムを観察するプロジェクト提供の視覚研究です。', ko: '임시 노점과 그늘, 농촌 시장의 사회적 리듬을 관찰하는 프로젝트 제공 시각 연구입니다.', ru: 'Визуальное исследование проекта о временных прилавках, тени и социальном ритме деревенского рынка.', ar: 'دراسة بصرية قدمها المشروع للأكشاك المؤقتة والظل والإيقاع الاجتماعي لسوق القرية.' },
  'The scene does not establish vendor identity, operating hours, products, prices, inventory or an active market listing.': { en: 'The scene does not establish vendor identity, operating hours, products, prices, inventory or an active market listing.', zh: '画面不代表摊主身份、营业时间、商品、价格、库存或正在营业的集市信息。', id: 'Adegan ini tidak menetapkan identitas pedagang, jam operasi, produk, harga, stok, atau daftar pasar aktif.', ja: '出店者、営業時間、商品、価格、在庫、営業中の市場情報を示すものではありません。', ko: '이 장면은 판매자 신원, 운영 시간, 상품, 가격, 재고 또는 운영 중인 시장 목록을 확정하지 않습니다.', ru: 'Сцена не подтверждает личность продавца, часы работы, товары, цены, запасы или действующее объявление рынка.', ar: 'لا تثبت الصورة هوية البائع أو ساعات العمل أو المنتجات أو الأسعار أو المخزون أو سوقاً نشطة.' },
  'A project-supplied viewpoint for reading layers of palms, terraces and distance across a composed landscape.': { en: 'A project-supplied viewpoint for reading layers of palms, terraces and distance across a composed landscape.', zh: '项目提供的观景语境图，用于观看椰林、梯田与远景组成的层次。', id: 'Sudut pandang dari proyek untuk membaca lapisan palem, teras, dan jarak dalam lanskap tersusun.', ja: 'ヤシ、棚田、遠景がつくる層を読むためのプロジェクト提供の視点です。', ko: '야자나무와 계단식 논, 원경이 만드는 층위를 읽는 프로젝트 제공 관찰 지점입니다.', ru: 'Точка обзора проекта для чтения слоёв пальм, террас и дальних планов в составленном пейзаже.', ar: 'منظور قدمه المشروع لقراءة طبقات النخيل والمدرجات والمسافة في منظر مركب.' },
  'It is not a map, safety notice, accessibility statement, opening schedule or promise of a real viewpoint.': { en: 'It is not a map, safety notice, accessibility statement, opening schedule or promise of a real viewpoint.', zh: '它不是地图、安全提示、无障碍说明、开放时间或真实观景台承诺。', id: 'Bukan peta, pemberitahuan keselamatan, pernyataan aksesibilitas, jadwal buka, atau janji titik pandang nyata.', ja: '地図、安全通知、アクセシビリティ案内、開場予定、実在の展望台の約束ではありません。', ko: '지도, 안전 안내, 접근성 설명, 운영 일정 또는 실제 전망대 약속이 아닙니다.', ru: 'Это не карта, уведомление о безопасности, заявление о доступности, расписание или обещание реальной площадки.', ar: 'ليست خريطة أو إشعار سلامة أو بيان وصول أو جدول فتح أو وعداً بمنصة حقيقية.' },
  'An AIGC concept exhibit for exploring scale, shelter and shared rural space inside this digital hall.': { en: 'An AIGC concept exhibit for exploring scale, shelter and shared rural space inside this digital hall.', zh: '为本数字展厅准备的 AIGC 策展概念展品，用于探索尺度、庇护与共享乡村空间。', id: 'Pameran konsep AIGC untuk mengeksplorasi skala, naungan, dan ruang desa bersama di aula digital ini.', ja: 'このデジタル展示室でスケール、庇護、共有農村空間を探る AIGC コンセプト作品です。', ko: '이 디지털 전시관에서 규모와 쉼터, 공유 농촌 공간을 탐색하는 AIGC 콘셉트 전시입니다.', ru: 'Концептуальный экспонат AIGC для исследования масштаба, укрытия и общего сельского пространства в цифровом зале.', ar: 'معروض مفاهيمي من AIGC لاستكشاف المقياس والمأوى والفضاء الريفي المشترك في هذه القاعة الرقمية.' },
  'Needs review. This model is not a real building, heritage object, architectural plan, property listing or commercial product.': { en: 'Needs review. This model is not a real building, heritage object, architectural plan, property listing or commercial product.', zh: '待审核。该模型不是真实建筑、遗产物件、建筑图纸、房产信息或商业商品。', id: 'Perlu ditinjau. Model ini bukan bangunan nyata, benda warisan, rencana arsitektur, daftar properti, atau produk komersial.', ja: '要確認です。実在の建物、遺産物、建築図面、不動産情報、商業製品ではありません。', ko: '검토가 필요합니다. 실제 건물, 유산 물건, 건축 도면, 부동산 목록 또는 상업 제품이 아닙니다.', ru: 'Требует проверки. Это не реальное здание, объект наследия, архитектурный план, объявление о недвижимости или товар.', ar: 'يحتاج إلى مراجعة. النموذج ليس مبنى حقيقياً أو قطعة تراثية أو مخططاً معمارياً أو عقاراً أو منتجاً تجارياً.' },
}
villageExhibits.forEach((exhibit) => {
  const intro = villageBodyTranslations[exhibit.introduction.en as string]
  const note = villageBodyTranslations[exhibit.note.en as string]
  if (intro) exhibit.introduction = intro
  if (note) exhibit.note = note
})
assertLocalizationTree(villageExhibits, 'village hall data')

export const villageStatusLabel = (exhibit: VillageExhibit, language: Language) => exhibit.kind === 'model'
  ? ({ en: 'AIGC concept exhibit - needs review', zh: 'AIGC 策展概念展品 - 待审核', id: 'Pameran konsep AIGC - perlu ditinjau', ja: 'AIGC コンセプト展示 - 要確認', ko: 'AIGC 콘셉트 전시 - 검토 필요', ru: 'Концептуальный экспонат AIGC - требует проверки', ar: 'معروض مفاهيمي من AIGC - يحتاج إلى مراجعة' } as const)[language]
  : ({ en: 'Project-supplied curatorial asset', zh: '项目提供的策展素材', id: 'Aset kuratorial dari proyek', ja: 'プロジェクト提供のキュレーション素材', ko: '프로젝트 제공 큐레이션 자산', ru: 'Кураторский материал проекта', ar: 'مادة تنسيق مقدمة من المشروع' } as const)[language]
