import type { Language } from './data'
import { assertLocalizationTree, type Localized } from './i18n'

export type HualiExhibitKind = 'image' | 'model'

export type HualiExhibit = {
  id: string
  kind: HualiExhibitKind
  title: Localized
  introduction: Localized
  note: Localized
  asset: string
  fallback: string
  modelAsset?: string
  modelPoster?: string
}

export const hualiReferenceImage = '/assets/3d/huali/东方花梨展厅参考图.png'

const supplied = (id: string, en: string, zh: string, asset: string, introduction: Localized, note: Localized): HualiExhibit => ({
  id, kind: 'image', title: { en, zh,
    id: ({ 'Wood Ring Study': 'Studi Cincin Kayu', 'Carving Gallery': 'Galeri Ukiran', 'Furniture Scale Study': 'Studi Skala Furnitur', 'Incense and Surface': 'Dupa dan Permukaan' } as Record<string, string>)[en] ?? en,
    ja: ({ 'Wood Ring Study': '木の年輪研究', 'Carving Gallery': '彫刻ギャラリー', 'Furniture Scale Study': '家具スケール研究', 'Incense and Surface': '香と表面' } as Record<string, string>)[en] ?? en,
    ko: ({ 'Wood Ring Study': '나뭇결 연구', 'Carving Gallery': '조각 갤러리', 'Furniture Scale Study': '가구 규모 연구', 'Incense and Surface': '향과 표면' } as Record<string, string>)[en] ?? en,
    ru: ({ 'Wood Ring Study': 'Исследование древесных колец', 'Carving Gallery': 'Галерея резьбы', 'Furniture Scale Study': 'Исследование масштаба мебели', 'Incense and Surface': 'Аромат и поверхность' } as Record<string, string>)[en] ?? en,
    ar: ({ 'Wood Ring Study': 'دراسة حلقات الخشب', 'Carving Gallery': 'معرض النحت', 'Furniture Scale Study': 'دراسة مقياس الأثاث', 'Incense and Surface': 'البخور والسطح' } as Record<string, string>)[en] ?? en,
  }, asset, fallback: hualiReferenceImage, introduction, note,
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
    title: { en: `Concept Object ${String(index + 1).padStart(2, '0')}`, zh: `概念展品 ${String(index + 1).padStart(2, '0')}`, id: `Objek Konsep ${String(index + 1).padStart(2, '0')}`, ja: `コンセプト作品 ${String(index + 1).padStart(2, '0')}`, ko: `콘셉트 작품 ${String(index + 1).padStart(2, '0')}`, ru: `Концепт-объект ${String(index + 1).padStart(2, '0')}`, ar: `عمل مفاهيمي ${String(index + 1).padStart(2, '0')}` },
    introduction: { en: 'An AIGC concept exhibit for this digital room, provided as an exploratory model rather than an authentic object or commercial product.', zh: '为本数字展厅准备的 AIGC 策展概念展品，用于探索性观看，不是实际器物或商业商品。' },
    note: { en: 'This model remains needs review. It does not identify a real furniture form, wood species, maker, collection, provenance, price, or availability.', zh: '该模型仍待审核；它不用于识别真实家具形制、木材种类、制作者、馆藏、来源、价格或可得性。' },
    asset: `/assets/3d/products/huali/product-huali-${number}-poster.webp`,
    fallback: hualiReferenceImage,
    modelPoster: `/assets/3d/products/huali/product-huali-${number}-poster.webp`,
    modelAsset: `/assets/3d/products/huali/product-huali-${number}-web.glb`,
  })),
]

const hualiBodyTranslations: Record<string, Localized> = {
  'A project-supplied view of concentric grain, scale and reflected amber light. It invites slow looking rather than material identification.': { en: 'A project-supplied view of concentric grain, scale and reflected amber light. It invites slow looking rather than material identification.', zh: '一张项目提供的同心木纹、尺度与琥珀色反光研究图，邀请观者慢慢观看，而非进行材质鉴定。', id: 'Tampilan serat melingkar, skala, dan cahaya amber dari proyek untuk diamati perlahan, bukan mengidentifikasi bahan.', ja: '同心の木目、スケール、琥珀色の反射光をゆっくり見るためのプロジェクト提供画像です。素材鑑定ではありません。', ko: '동심 나뭇결과 규모, 호박빛 반사를 천천히 바라보는 프로젝트 제공 이미지이며 재료 감정이 아닙니다.', ru: 'Изображение проекта с концентрической текстурой, масштабом и янтарным светом для медленного взгляда, а не экспертизы материала.', ar: 'مشهد قدمه المشروع لعروق متحدة المركز والمقياس والضوء الكهرماني، للتأمل البطيء لا لتحديد المادة.' },
  'This curatorial image does not establish wood species, age, origin, authenticity, ownership, or commercial value.': { en: 'This curatorial image does not establish wood species, age, origin, authenticity, ownership, or commercial value.', zh: '这张策展图像不用于确认木材种类、年代、产地、真伪、权属或商业价值。', id: 'Gambar kuratorial ini tidak menetapkan jenis, usia, asal, keaslian, kepemilikan, atau nilai komersial kayu.', ja: '樹種、年代、産地、真贋、所有権、商業価値を確定する画像ではありません。', ko: '이 큐레이션 이미지는 목재 종류, 연대, 산지, 진위, 소유권 또는 상업적 가치를 확정하지 않습니다.', ru: 'Это изображение не подтверждает породу, возраст, происхождение, подлинность, владение или коммерческую ценность дерева.', ar: 'لا تثبت هذه الصورة نوع الخشب أو عمره أو أصله أو أصالته أو ملكيته أو قيمته التجارية.' },
  'A project-supplied composition for reading silhouette, negative space and repeated carved surfaces across a group of objects.': { en: 'A project-supplied composition for reading silhouette, negative space and repeated carved surfaces across a group of objects.', zh: '项目提供的组合图像，用于观看一组物件中的轮廓、留白与重复的雕刻表面。', id: 'Komposisi proyek untuk membaca siluet, ruang kosong, dan permukaan ukiran berulang pada sekelompok objek.', ja: '複数の物のシルエット、余白、反復する彫刻面を読むプロジェクト提供の構成です。', ko: '여러 물체의 실루엣과 여백, 반복되는 조각 표면을 읽는 프로젝트 제공 구성입니다.', ru: 'Композиция проекта для чтения силуэта, пустого пространства и повторяющихся резных поверхностей группы объектов.', ar: 'تكوين قدمه المشروع لقراءة الصورة والفراغ والأسطح المنحوتة المتكررة بين مجموعة من الأشياء.' },
  'It is a visual curatorial asset, not a catalogue of authentic objects, makers, dates, or collection records.': { en: 'It is a visual curatorial asset, not a catalogue of authentic objects, makers, dates, or collection records.', zh: '它是视觉策展素材，不是对真实器物、制作者、年代或馆藏记录的目录说明。', id: 'Ini aset kuratorial visual, bukan katalog objek asli, pembuat, tanggal, atau catatan koleksi.', ja: '視覚的なキュレーション素材であり、実物、制作者、年代、収蔵記録のカタログではありません。', ko: '시각 큐레이션 자산이며 실제 물건, 제작자, 연대 또는 소장 기록의 목록이 아닙니다.', ru: 'Это визуальный кураторский материал, а не каталог подлинных предметов, мастеров, дат или коллекций.', ar: 'إنها مادة تنسيقية بصرية وليست فهرساً لأشياء أصلية أو صانعين أو تواريخ أو سجلات مجموعات.' },
  'A project-supplied miniature-room study of proportion, enclosure and how furniture organizes a shared interior.': { en: 'A project-supplied miniature-room study of proportion, enclosure and how furniture organizes a shared interior.', zh: '项目提供的微缩室内研究图，用于观看比例、围合关系，以及家具如何组织共享空间。', id: 'Studi ruang mini dari proyek tentang proporsi, batas, dan cara furnitur menata ruang bersama.', ja: 'プロポーション、囲い、家具が共有空間を組織する方法を読むプロジェクト提供の小部屋研究です。', ko: '비례와 둘러싸임, 가구가 공유 실내를 조직하는 방식을 읽는 프로젝트 제공 미니어처 연구입니다.', ru: 'Миниатюрное исследование проекта о пропорции, замкнутости и том, как мебель организует общее пространство.', ar: 'دراسة غرفة مصغرة قدمها المشروع للنظر في النسب والاحتواء وكيف ينظم الأثاث مكاناً مشتركاً.' },
  'This is not an authentic furniture inventory, period attribution, construction record, or sale listing.': { en: 'This is not an authentic furniture inventory, period attribution, construction record, or sale listing.', zh: '这不是对真实家具库存、年代归属、制作记录或销售信息的说明。', id: 'Ini bukan inventaris furnitur asli, penetapan periode, catatan konstruksi, atau daftar penjualan.', ja: '実物家具の在庫、年代帰属、制作記録、販売案内ではありません。', ko: '실제 가구 재고, 시대 귀속, 제작 기록 또는 판매 목록이 아닙니다.', ru: 'Это не опись подлинной мебели, датировка, строительная запись или объявление о продаже.', ar: 'ليست جرداً لأثاث أصلي أو نسبة زمنية أو سجلاً للبناء أو قائمة بيع.' },
  'A project-supplied still life for noticing circular arrangement, surface finish and the atmosphere created around a small object.': { en: 'A project-supplied still life for noticing circular arrangement, surface finish and the atmosphere created around a small object.', zh: '项目提供的静物图，邀请观者关注圆形布置、表面处理，以及小型物件周围形成的氛围。', id: 'Benda mati dari proyek untuk memperhatikan susunan melingkar, hasil permukaan, dan suasana di sekitar benda kecil.', ja: '円形の配置、表面仕上げ、小さな物の周りに生まれる空気を感じるためのプロジェクト提供静物です。', ko: '원형 배치와 표면 마감, 작은 물체 주변의 분위기를 살피는 프로젝트 제공 정물입니다.', ru: 'Натюрморт проекта для наблюдения за круговой композицией, отделкой поверхности и атмосферой вокруг малого предмета.', ar: 'مشهد ثابت قدمه المشروع لملاحظة الترتيب الدائري وتشطيب السطح والأجواء حول جسم صغير.' },
  'It does not state a ritual, tradition, material origin, product availability, or price.': { en: 'It does not state a ritual, tradition, material origin, product availability, or price.', zh: '它不陈述任何仪式、传统、材质来源、商品可得性或价格。', id: 'Ini tidak menyatakan ritual, tradisi, asal bahan, ketersediaan produk, atau harga.', ja: '儀礼、伝統、素材の産地、商品の可用性、価格を示すものではありません。', ko: '의례, 전통, 재료 원산지, 상품 이용 가능성 또는 가격을 말하지 않습니다.', ru: 'Он не сообщает о ритуале, традиции, происхождении материала, наличии товара или цене.', ar: 'لا يقرر طقساً أو تقليداً أو أصل مادة أو توافر منتج أو سعراً.' },
  'An AIGC concept exhibit for this digital room, provided as an exploratory model rather than an authentic object or commercial product.': { en: 'An AIGC concept exhibit for this digital room, provided as an exploratory model rather than an authentic object or commercial product.', zh: '为本数字展厅准备的 AIGC 策展概念展品，用于探索性观看，不是实际器物或商业商品。', id: 'Pameran konsep AIGC untuk ruang digital ini sebagai model eksplorasi, bukan benda asli atau produk komersial.', ja: 'このデジタル展示室のための AIGC コンセプト作品です。実物や商業製品ではなく探索用モデルです。', ko: '이 디지털 전시관을 위한 AIGC 콘셉트 전시로, 실제 물건이나 상업 제품이 아닌 탐색 모델입니다.', ru: 'Концептуальный экспонат AIGC для цифрового зала, исследовательская модель, а не подлинный объект или товар.', ar: 'معروض مفاهيمي من AIGC لهذه القاعة الرقمية، نموذج استكشافي لا قطعة أصلية أو منتج تجاري.' },
  'This model remains needs review. It does not identify a real furniture form, wood species, maker, collection, provenance, price, or availability.': { en: 'This model remains needs review. It does not identify a real furniture form, wood species, maker, collection, provenance, price, or availability.', zh: '该模型仍待审核；它不用于识别真实家具形制、木材种类、制作者、馆藏、来源、价格或可得性。', id: 'Model ini masih perlu ditinjau. Tidak mengidentifikasi bentuk furnitur nyata, jenis kayu, pembuat, koleksi, asal, harga, atau ketersediaan.', ja: 'このモデルは要確認です。実在の家具形、樹種、制作者、収蔵、来歴、価格、可用性を示しません。', ko: '이 모델은 검토가 필요합니다. 실제 가구 형태, 목재 종류, 제작자, 소장, 출처, 가격 또는 이용 가능성을 특정하지 않습니다.', ru: 'Модель требует проверки. Она не указывает реальную форму мебели, породу дерева, мастера, коллекцию, происхождение, цену или наличие.', ar: 'يحتاج هذا النموذج إلى مراجعة. لا يحدد شكلاً حقيقياً للأثاث أو نوع خشب أو صانعاً أو مجموعة أو أصلاً أو سعراً أو توافراً.' },
}
hualiExhibits.forEach((exhibit) => {
  const intro = hualiBodyTranslations[exhibit.introduction.en as string]
  const note = hualiBodyTranslations[exhibit.note.en as string]
  if (intro) exhibit.introduction = intro
  if (note) exhibit.note = note
})
assertLocalizationTree(hualiExhibits, 'rosewood hall data')

export const hualiStatusLabel = (exhibit: HualiExhibit, language: Language) => exhibit.kind === 'model'
  ? ({ en: 'AIGC concept exhibit - needs review', zh: 'AIGC 策展概念展品 - 待审核', id: 'Pameran konsep AIGC - perlu ditinjau', ja: 'AIGC コンセプト展示 - 要確認', ko: 'AIGC 콘셉트 전시 - 검토 필요', ru: 'Концептуальный экспонат AIGC - требует проверки', ar: 'معروض مفاهيمي من AIGC - يحتاج إلى مراجعة' } as const)[language]
  : ({ en: 'Project-supplied curatorial asset', zh: '项目提供的策展素材', id: 'Aset kuratorial dari proyek', ja: 'プロジェクト提供のキュレーション素材', ko: '프로젝트 제공 큐레이션 자산', ru: 'Кураторский материал проекта', ar: 'مادة تنسيق مقدمة من المشروع' } as const)[language]
