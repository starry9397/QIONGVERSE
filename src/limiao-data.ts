import type { Language } from './data'
import { assertLocalizationTree, localize, type Localized } from './i18n'

export type SourceStatus = 'verified_source' | 'project_asset' | 'aigc_concept'

export type LimiaoExhibit = {
  id: string
  kind: 'image' | 'video' | 'model'
  title: Localized
  introduction: Localized
  note: Localized
  asset: string
  poster?: string
  fallback?: string
  sourceLabel: Localized
  sourceStatus: SourceStatus
  sourceUrl?: string
  modelAsset?: string
}

const unescoUrl = 'https://ich.unesco.org/en/RL/traditional-textile-techniques-of-the-li-ethnic-group-spinning-dyeing-weaving-and-embroidering-00238'

export const limiaoExhibits: LimiaoExhibit[] = [
  {
    id: 'pattern', kind: 'image',
    title: { en: 'Pattern Field', zh: '纹样场', id: 'Ladang Pola', ja: '文様の場', ko: '무늬의 장', ru: 'Поле узоров', ar: 'حقل الأنماط' },
    introduction: { en: 'A project-supplied reading image for slowing down with colour, rhythm and geometry. It is an entry into looking, not a catalogue record for an historic object.', zh: '项目提供的阅读图像，邀请观者从色彩、节奏与几何关系开始观看；它不是历史器物的目录记录。' },
    note: { en: 'For broad orientation to Li traditional textile techniques, read the reviewed UNESCO source. This image is project-provided curatorial context.', zh: '黎族传统纺织技艺的概览请查阅已核验的 UNESCO 来源；本图像为项目提供的策展语境。' },
    asset: '/assets/zones/lijin/zone-lijin-wide.webp', fallback: '/assets/user-media2/limiao-pattern-poster.jpg', sourceLabel: { en: 'Project-provided curatorial context', zh: '项目提供的策展语境' }, sourceStatus: 'project_asset', sourceUrl: unescoUrl,
  },
  {
    id: 'weaving', kind: 'image',
    title: { en: 'Weaving Reading Room', zh: '织造阅读室', id: 'Ruang Baca Tenun', ja: '織りの読書室', ko: '직조 열람실', ru: 'Зал чтения ткачества', ar: 'غرفة قراءة النسيج' },
    introduction: { en: 'A second supplied image offers a close visual reading of pattern and material. It does not identify a maker, date, provenance or commercial availability.', zh: '第二张项目提供的图像用于近距离阅读纹样与材质；它不标识制作者、年代、来源或商业可得性。' },
    note: { en: 'Li traditional textile techniques are introduced here only through the linked UNESCO source. Miao references in this room remain project-provided curatorial context.', zh: '本展厅关于黎族传统纺织技艺的介绍仅以链接的 UNESCO 来源为准；苗族相关表述仍为项目提供的策展语境。' },
    asset: '/assets/zones/lijin/zone-lijin-portrait.webp', fallback: '/assets/user-media2/brocade-pattern.jpg', sourceLabel: { en: 'Project-provided curatorial context', zh: '项目提供的策展语境' }, sourceStatus: 'project_asset', sourceUrl: unescoUrl,
  },
  {
    id: 'hall-view', kind: 'image',
    title: { en: 'Hall View: Woven Light', zh: '展厅一景：织光', id: 'Pemandangan Aula: Cahaya Tenun', ja: '展示室風景：織られた光', ko: '전시관 풍경: 짜인 빛', ru: 'Вид зала: тканый свет', ar: 'مشهد القاعة: ضوء منسوج' },
    introduction: { en: 'A supplied view of the Li & Miao room anchors the digital visit in a Hainan Province exhibition setting. It is a project asset, not an official museum photograph.', zh: '项目提供的展厅图像，把数字访问锚定在海南省的展览语境中；它不是官方博物馆摄影。' },
    note: { en: 'Use this image as a calm orientation point before moving back into the 3D world.', zh: '可将这张图像作为安静的方向提示，再返回 3D 世界继续探索。' },
    asset: '/assets/user-media2/limiao-hall-banner-01.jpg', fallback: '/assets/user-media2/limiao-pattern-poster.jpg', sourceLabel: { en: 'Project-supplied asset', zh: '项目提供素材' }, sourceStatus: 'project_asset',
  },
  ...(['001', '002', '003'] as const).flatMap((number, index): LimiaoExhibit[] => [{
    id: `object-${number}`, kind: 'model',
    title: { en: `Brocade Concept Object ${String(index + 1).padStart(2, '0')}`, zh: `黎锦概念展品 ${String(index + 1).padStart(2, '0')}`, id: `Objek Konsep Brokat ${String(index + 1).padStart(2, '0')}`, ja: `錦織りコンセプト作品 ${String(index + 1).padStart(2, '0')}`, ko: `비단 콘셉트 작품 ${String(index + 1).padStart(2, '0')}`, ru: `Концепт-объект парчи ${String(index + 1).padStart(2, '0')}`, ar: `عمل بروكار مفاهيمي ${String(index + 1).padStart(2, '0')}` },
    introduction: { en: 'An AIGC concept exhibit for this digital room. It is not a historical object, authentic textile, retail product or evidence of a traditional technique.', zh: '为本数字展厅创作的 AIGC 策展概念展品；它不是历史文物、真实纺织品、零售商品或传统技艺的证据。' },
    note: { en: 'Open the companion moving study by choice. The associated GLB is loaded only when you open this exhibit.', zh: '可自主打开配套动态研究；关联 GLB 仅在打开本展项时加载。' },
    asset: `/assets/video/products/product-lijin-${number}-loop.mp4`, poster: `/assets/3d/products/lijin/product-lijin-${number}-poster.webp`, fallback: `/assets/video/products/product-lijin-${number}-loop-reduced.webp`, modelAsset: `/assets/3d/products/lijin/product-lijin-${number}-web.glb`, sourceLabel: { en: 'AIGC concept exhibit', zh: 'AIGC 策展概念展品' }, sourceStatus: 'aigc_concept',
  }]),
]

limiaoExhibits[0].title = { en: 'Boat-House Form', zh: '船型屋形制', id: 'Bentuk Rumah Perahu', ja: '船形屋の形', ko: '배집 형태', ru: 'Форма дома-лодки', ar: 'شكل بيت القارب' }
limiaoExhibits[0].introduction = { en: 'A project-supplied reconstruction image of a boat-house form, inviting visitors to read roof lines, timber rhythm and the relationship between shelter and movement.', zh: '项目提供的船型屋复原模型图像，邀请观者观察屋顶线条、木构节奏，以及庇护与移动之间的关系。' }
limiaoExhibits[0].asset = '/assets/user-media2/limiao-boat-house/船型屋复原模型（中央镇馆之宝）.png'
limiaoExhibits[1].title = { en: 'Wind Instrument Study', zh: '鼻箫与叮咚乐器', id: 'Studi Alat Musik Tiup', ja: '管楽器研究', ko: '관악기 연구', ru: 'Исследование духовых инструментов', ar: 'دراسة آلات النفخ' }
limiaoExhibits[1].introduction = { en: 'A project-supplied study of nose flute and ding-dong instrument forms, inviting a close reading of shape, resonance and the gestures implied by each object.', zh: '项目提供的鼻箫与叮咚乐器模型图像，邀请观者近距离阅读形态、共鸣与器物暗示的动作。' }
limiaoExhibits[1].asset = '/assets/user-media2/limiao-instruments/鼻箫、叮咚等乐器模型.png'
limiaoExhibits[2].title = { en: 'Li Brocade Loom', zh: '黎锦织机', id: 'Alat Tenun Brokat Li', ja: 'リー族錦織り機', ko: '리족 비단 직기', ru: 'Ткацкий станок ли', ar: 'نول بروكار لي' }
limiaoExhibits[2].introduction = { en: 'A project-supplied loom model for reading the frame, tension and hand-to-material relationship behind a weaving process.', zh: '项目提供的黎锦织机模型图像，用于阅读织造过程中的框架、张力与手工和材料之间的关系。' }

const limiaoBodyTranslations: Record<string, Localized> = {
  'For broad orientation to Li traditional textile techniques, read the reviewed UNESCO source. This image is project-provided curatorial context.': { en: 'For broad orientation to Li traditional textile techniques, read the reviewed UNESCO source. This image is project-provided curatorial context.', zh: '黎族传统纺织技艺的概览请查阅已核验的 UNESCO 来源；本图像为项目提供的策展语境。', id: 'Untuk orientasi umum tentang teknik tekstil tradisional Li, baca sumber UNESCO yang ditinjau. Gambar ini adalah konteks kuratorial dari proyek.', ja: '黎族の伝統的な織物技法の概要は、確認済みの UNESCO 出典をご覧ください。この画像はプロジェクト提供のキュレーション文脈です。', ko: '리족 전통 섬유 기술의 전반적인 안내는 검토된 UNESCO 출처를 읽어 주세요. 이 이미지는 프로젝트 제공 큐레이션 맥락입니다.', ru: 'Для общего знакомства с традиционными текстильными техниками народа ли прочитайте проверенный источник UNESCO. Это изображение — кураторский контекст проекта.', ar: 'للتعرّف العام إلى تقنيات النسيج التقليدية لشعب لي، اقرأ مصدر اليونسكو المُراجع. هذه الصورة سياق تنسيقي يقدمه المشروع.' },
  'Li traditional textile techniques are introduced here only through the linked UNESCO source. Miao references in this room remain project-provided curatorial context.': { en: 'Li traditional textile techniques are introduced here only through the linked UNESCO source. Miao references in this room remain project-provided curatorial context.', zh: '本展厅关于黎族传统纺织技艺的介绍仅以链接的 UNESCO 来源为准；苗族相关表述仍为项目提供的策展语境。', id: 'Teknik tekstil tradisional Li di sini diperkenalkan hanya melalui sumber UNESCO yang ditautkan. Rujukan Miao di ruang ini tetap merupakan konteks kuratorial proyek.', ja: 'この展示室での黎族伝統織物技法の紹介は、リンク先の UNESCO 出典に限ります。この展示室の苗族への言及はプロジェクト提供の文脈です。', ko: '이 전시관의 리족 전통 섬유 기술 소개는 연결된 UNESCO 출처를 통해서만 제공됩니다. 이 공간의 먀오족 언급은 프로젝트 큐레이션 맥락입니다.', ru: 'Здесь традиционные текстильные техники народа ли представлены только через связанную страницу UNESCO. Упоминания мяо в этом зале остаются кураторским контекстом проекта.', ar: 'تُعرَض تقنيات النسيج التقليدية لشعب لي هنا من خلال مصدر اليونسكو المرتبط فقط. وتبقى الإشارات إلى مياو في هذه القاعة سياقاً تنسيقياً للمشروع.' },
  'Use this image as a calm orientation point before moving back into the 3D world.': { en: 'Use this image as a calm orientation point before moving back into the 3D world.', zh: '可将这张图像作为安静的方向提示，再返回 3D 世界继续探索。', id: 'Gunakan gambar ini sebagai titik orientasi yang tenang sebelum kembali ke dunia 3D.', ja: '3D の世界へ戻る前の静かな案内点として、この画像をご覧ください。', ko: '3D 세계로 돌아가기 전에 이 이미지를 차분한 방향 안내점으로 활용하세요.', ru: 'Используйте это изображение как спокойную точку ориентира перед возвращением в 3D-мир.', ar: 'استخدم هذه الصورة كنقطة توجيه هادئة قبل العودة إلى العالم الثلاثي الأبعاد.' },
  'A project-supplied reconstruction image of a boat-house form, inviting visitors to read roof lines, timber rhythm and the relationship between shelter and movement.': { en: 'A project-supplied reconstruction image of a boat-house form, inviting visitors to read roof lines, timber rhythm and the relationship between shelter and movement.', zh: '项目提供的船型屋复原模型图像，邀请观者观察屋顶线条、木构节奏，以及庇护与移动之间的关系。', id: 'Gambar rekonstruksi rumah perahu dari proyek untuk membaca garis atap, ritme kayu, dan hubungan tempat berlindung dengan gerak.', ja: '屋根の線、木のリズム、庇護と移動の関係を読むプロジェクト提供の船形屋復元画像です。', ko: '지붕 선과 목재 리듬, 쉼터와 이동의 관계를 읽는 프로젝트 제공 배집 복원 이미지입니다.', ru: 'Реконструкция дома-лодки проекта для чтения линий крыши, ритма дерева и связи укрытия с движением.', ar: 'صورة إعادة بناء قدمها المشروع لبيت القارب، لقراءة خطوط السقف وإيقاع الخشب وعلاقة المأوى بالحركة.' },
  'A project-supplied study of nose flute and ding-dong instrument forms, inviting a close reading of shape, resonance and the gestures implied by each object.': { en: 'A project-supplied study of nose flute and ding-dong instrument forms, inviting a close reading of shape, resonance and the gestures implied by each object.', zh: '项目提供的鼻箫与叮咚乐器模型图像，邀请观者近距离阅读形态、共鸣与器物暗示的动作。', id: 'Studi bentuk seruling hidung dan alat ding-dong dari proyek untuk membaca bentuk, resonansi, dan gerak yang disiratkan.', ja: '鼻笛とディンドン楽器の形、共鳴、それぞれが示す身振りを近くで読むプロジェクト提供の研究です。', ko: '코 피리와 딩동 악기의 형태, 울림, 물건이 암시하는 동작을 가까이 읽는 프로젝트 제공 연구입니다.', ru: 'Исследование проекта о формах носовой флейты и инструмента дин-дон для чтения формы, резонанса и жестов.', ar: 'دراسة قدمها المشروع لأشكال الناي الأنفي وآلة دينغ دونغ لقراءة الشكل والرنين والإيماءات.' },
  'A project-supplied loom model for reading the frame, tension and hand-to-material relationship behind a weaving process.': { en: 'A project-supplied loom model for reading the frame, tension and hand-to-material relationship behind a weaving process.', zh: '项目提供的黎锦织机模型图像，用于阅读织造过程中的框架、张力与手工和材料之间的关系。', id: 'Model alat tenun Li dari proyek untuk membaca rangka, tegangan, dan hubungan tangan dengan bahan.', ja: '織りの背後にある枠、張力、手と素材の関係を読むプロジェクト提供の機織り機モデルです。', ko: '직조 과정의 틀과 장력, 손과 재료의 관계를 읽는 프로젝트 제공 직기 모델입니다.', ru: 'Модель ткацкого станка проекта для чтения рамы, натяжения и связи руки с материалом.', ar: 'نموذج نول قدمه المشروع لقراءة الإطار والتوتر وعلاقة اليد بالمادة خلف عملية النسيج.' },
  'An AIGC concept exhibit for this digital room. It is not a historical object, authentic textile, retail product or evidence of a traditional technique.': { en: 'An AIGC concept exhibit for this digital room. It is not a historical object, authentic textile, retail product or evidence of a traditional technique.', zh: '为本数字展厅创作的 AIGC 策展概念展品；它不是历史文物、真实纺织品、零售商品或传统技艺的证据。', id: 'Pameran konsep AIGC untuk ruang ini; bukan benda sejarah, tekstil asli, produk ritel, atau bukti teknik tradisional.', ja: 'このデジタル展示室の AIGC コンセプト作品です。歴史資料、実物の織物、商品、伝統技法の証拠ではありません。', ko: '이 디지털 전시관의 AIGC 콘셉트 전시입니다. 역사 유물, 실제 직물, 소매 상품 또는 전통 기법의 증거가 아닙니다.', ru: 'Концептуальный экспонат AIGC для цифрового зала; не исторический объект, подлинный текстиль, товар или доказательство традиционной техники.', ar: 'معروض مفاهيمي من AIGC لهذه القاعة؛ ليس قطعة تاريخية أو نسيجاً أصلياً أو منتجاً أو دليلاً على تقنية تقليدية.' },
  'Open the companion moving study by choice. The associated GLB is loaded only when you open this exhibit.': { en: 'Open the companion moving study by choice. The associated GLB is loaded only when you open this exhibit.', zh: '可自主打开配套动态研究；关联 GLB 仅在打开本展项时加载。', id: 'Buka studi bergerak pendamping bila ingin; GLB terkait dimuat hanya saat pameran ini dibuka.', ja: '付属の動く研究は任意で開けます。関連 GLB はこの展示を開いたときだけ読み込みます。', ko: '연결된 움직이는 연구는 선택해서 열 수 있습니다. GLB는 이 전시를 열 때만 불러옵니다.', ru: 'Сопутствующее динамическое исследование открывается по желанию; GLB загружается только при открытии экспоната.', ar: 'افتح الدراسة المتحركة المصاحبة باختيارك؛ لا يُحمّل GLB المرتبط إلا عند فتح المعروض.' },
}
limiaoExhibits.forEach((exhibit) => {
  const intro = limiaoBodyTranslations[exhibit.introduction.en as string]
  const note = limiaoBodyTranslations[exhibit.note.en as string]
  if (intro) exhibit.introduction = intro
  if (note) exhibit.note = note
  if (exhibit.sourceStatus === 'project_asset') exhibit.sourceLabel = { en: 'Project-provided curatorial context', zh: '项目提供的策展语境', id: 'Konteks kuratorial dari proyek', ja: 'プロジェクト提供のキュレーション文脈', ko: '프로젝트 제공 큐레이션 맥락', ru: 'Кураторский контекст проекта', ar: 'سياق تنسيقي من المشروع' }
  if (exhibit.sourceStatus === 'aigc_concept') exhibit.sourceLabel = { en: 'AIGC concept exhibit', zh: 'AIGC 策展概念展品', id: 'Pameran konsep AIGC', ja: 'AIGC コンセプト展示', ko: 'AIGC 콘셉트 전시', ru: 'Концептуальный экспонат AIGC', ar: 'معروض مفاهيمي من AIGC' }
})
assertLocalizationTree(limiaoExhibits, 'Li and Miao hall data')
limiaoExhibits[2].asset = '/assets/user-media2/limiao-loom/黎锦织机（粒子展台基础模型）.png'

export const sourceStatusLabel = (status: SourceStatus, language: Language) => {
  const labels: Record<SourceStatus, Localized> = {
    verified_source: { en: 'Verified source', zh: '已核验来源', id: 'Sumber terverifikasi', ja: '確認済み出典', ko: '검증된 출처', ru: 'Проверенный источник', ar: 'مصدر متحقق' },
    project_asset: { en: 'Project-supplied asset', zh: '项目提供素材', id: 'Aset dari proyek', ja: 'プロジェクト提供素材', ko: '프로젝트 제공 자산', ru: 'Материал проекта', ar: 'مادة مقدمة من المشروع' },
    aigc_concept: { en: 'AIGC concept exhibit', zh: 'AIGC 策展概念展品', id: 'Pameran konsep AIGC', ja: 'AIGC コンセプト展示', ko: 'AIGC 콘셉트 전시', ru: 'Концептуальный экспонат AIGC', ar: 'معروض مفاهيمي من AIGC' },
  }
  return localize(labels[status], language)
}
