import type { Language } from './data'
import { assertLocalizationTree, type Localized } from './i18n'

export type AerospaceExhibit = {
  id: string
  title: Localized
  introduction: Localized
  note: Localized
  asset: string
  fallback: string
}

export const cnsaUrl = 'https://www.cnsa.gov.cn/english/'
export const aerospaceReferenceImage = '/assets/3d/aerospace/文昌航天展厅参考图.png'
export const aerospaceConsoleImage = '/assets/user-media2/space-console/发射体验控制台.png'

export const aerospaceExhibits: AerospaceExhibit[] = [
  {
    id: 'launch-horizon',
    title: { en: 'Launch Horizon', zh: '发射地平线', id: 'Cakrawala Peluncuran', ja: '打ち上げの地平線', ko: '발사 지평선', ru: 'Горизонт запуска', ar: 'أفق الإطلاق' },
    introduction: { en: 'A project-supplied orientation image for reading vertical scale, coastal light and the threshold between ground and sky.', zh: '一张项目提供的导览图像，用于观看垂直尺度、海岸光线以及地面与天空之间的临界感。', id: 'Gambar orientasi dari proyek untuk membaca skala vertikal, cahaya pesisir, dan ambang antara tanah dan langit.', ja: '垂直のスケール、海岸の光、地面と空の境界を読むためのプロジェクト提供の案内画像です。', ko: '수직 규모와 해안의 빛, 땅과 하늘 사이의 경계를 읽는 프로젝트 제공 안내 이미지입니다.', ru: 'Ориентирующее изображение проекта для чтения вертикального масштаба, прибрежного света и границы земли и неба.', ar: 'صورة إرشادية قدمها المشروع لقراءة المقياس الرأسي وضوء الساحل والعتبة بين الأرض والسماء.' },
    note: { en: 'This curatorial image is not an official launch record, schedule or facility photograph.', zh: '这张策展图像不是官方发射记录、发射时间表或设施摄影。', id: 'Gambar kuratorial ini bukan catatan peluncuran resmi, jadwal, atau foto fasilitas.', ja: 'このキュレーション画像は公式の打ち上げ記録、予定表、施設写真ではありません。', ko: '이 큐레이션 이미지는 공식 발사 기록, 일정 또는 시설 사진이 아닙니다.', ru: 'Это кураторское изображение, а не официальный протокол запуска, расписание или фото объекта.', ar: 'هذه صورة تنسيقية وليست سجلاً رسمياً للإطلاق أو جدولاً أو صورة لمنشأة.' },
    asset: '/assets/user-media2/media2/图片素材新/wenchang-hall-banner-01.jpg', fallback: aerospaceReferenceImage,
  },
  {
    id: 'launch-vehicle-study',
    title: { en: 'Launch Vehicle Study', zh: '发射载具形态研究', id: 'Studi Kendaraan Peluncur', ja: '打ち上げ機の形態研究', ko: '발사체 형태 연구', ru: 'Исследование формы ракеты-носителя', ar: 'دراسة شكل مركبة الإطلاق' },
    introduction: { en: 'A project-supplied visual study of a suspended launch-vehicle form, composed for looking at silhouette, structure and upward movement.', zh: '一件项目提供的垂挂式发射载具形态研究，用于观看轮廓、结构与向上运动感。', id: 'Studi visual kendaraan peluncur tergantung dari proyek, untuk melihat siluet, struktur, dan gerak ke atas.', ja: 'シルエット、構造、上昇の動きを見るために構成した、プロジェクト提供の吊り下げ型打ち上げ機研究です。', ko: '실루엣과 구조, 상승 움직임을 살피는 프로젝트 제공 매달린 발사체 형태 연구입니다.', ru: 'Визуальное исследование подвешенной формы ракеты проекта, составленное для взгляда на силуэт, структуру и движение вверх.', ar: 'دراسة بصرية قدمها المشروع لشكل مركبة إطلاق معلقة، للنظر في الصورة والبنية والحركة إلى أعلى.' },
    note: { en: 'The image is a curatorial asset, not a technical diagram or a claim about a current vehicle configuration.', zh: '该图像为策展素材，不是技术图纸，也不对当前载具构型作出主张。', id: 'Gambar ini adalah aset kuratorial, bukan diagram teknis atau klaim tentang konfigurasi kendaraan saat ini.', ja: 'キュレーション素材であり、技術図面や現在の機体構成を示すものではありません。', ko: '큐레이션 자산이며 기술 도면이나 현재 발사체 구성에 대한 주장이 아닙니다.', ru: 'Это кураторский материал, а не техническая схема и не утверждение о текущей конфигурации ракеты.', ar: 'الصورة مادة تنسيقية وليست مخططاً تقنياً أو ادعاءً بشأن تشكيل المركبة الحالي.' },
    asset: '/assets/user-media2/space-rocket/长征五号B火箭模型（中央垂挂）.png', fallback: aerospaceReferenceImage,
  },
  {
    id: 'orbital-constellation',
    title: { en: 'Orbital Constellation Study', zh: '轨道星座研究', id: 'Studi Konstelasi Orbit', ja: '軌道コンステレーション研究', ko: '궤도 위성군 연구', ru: 'Исследование орбитальной группировки', ar: 'دراسة الكوكبة المدارية' },
    introduction: { en: 'A project-supplied image that invites visitors to read orbital rhythm, distance and communication as visual relationships.', zh: '一张项目提供的图像，邀请访客从视觉关系出发阅读轨道节奏、距离与通信。', id: 'Gambar proyek yang mengajak membaca irama orbit, jarak, dan komunikasi sebagai hubungan visual.', ja: '軌道のリズム、距離、通信を視覚的な関係として読むためのプロジェクト提供画像です。', ko: '궤도의 리듬과 거리, 통신을 시각적 관계로 읽도록 초대하는 프로젝트 제공 이미지입니다.', ru: 'Изображение проекта, предлагающее прочитать орбитальный ритм, расстояние и связь как визуальные отношения.', ar: 'صورة قدمها المشروع تدعو إلى قراءة إيقاع المدار والمسافة والاتصال كعلاقات بصرية.' },
    note: { en: 'This is not an operational constellation map, service promise or source for current satellite information.', zh: '这不是在轨星座地图、服务承诺或当前卫星信息来源。', id: 'Ini bukan peta konstelasi operasional, janji layanan, atau sumber informasi satelit terkini.', ja: '運用中のコンステレーション地図、サービス保証、現在の衛星情報源ではありません。', ko: '운영 중인 위성군 지도, 서비스 약속 또는 현재 위성 정보 출처가 아닙니다.', ru: 'Это не рабочая карта группировки, не обещание услуги и не источник текущих спутниковых сведений.', ar: 'ليست خريطة تشغيلية لكوكبة أو وعد خدمة أو مصدراً لمعلومات الأقمار الحالية.' },
    asset: '/assets/user-media2/space-satellite/卫星星座模型（海南卫星）.png', fallback: aerospaceReferenceImage,
  },
  {
    id: 'lunar-mobility',
    title: { en: 'Lunar Mobility Study', zh: '月面移动研究', id: 'Studi Mobilitas Bulan', ja: '月面移動研究', ko: '달 표면 이동 연구', ru: 'Исследование лунной мобильности', ar: 'دراسة الحركة على سطح القمر' },
    introduction: { en: 'A project-supplied rover image used to consider surface, mobility and the small scale of exploration against a larger field.', zh: '一张项目提供的月球车图像，用于思考表面、移动性与探索者在更大场域中的尺度。', id: 'Gambar rover dari proyek untuk memikirkan permukaan, mobilitas, dan skala kecil eksplorasi dalam medan yang lebih besar.', ja: '広い場に対する表面、移動性、探査の小さなスケールを考えるためのプロジェクト提供の月面車画像です。', ko: '더 넓은 장에서 표면과 이동성, 탐사의 작은 규모를 생각하게 하는 프로젝트 제공 로버 이미지입니다.', ru: 'Изображение лунохода проекта для размышления о поверхности, мобильности и малом масштабе исследования на большом поле.', ar: 'صورة عربة جوالة قدمها المشروع للتفكير في السطح والحركة وصغر مقياس الاستكشاف أمام مجال أوسع.' },
    note: { en: 'It is not a documentary record, a current mission update or a claim of technical accuracy.', zh: '它不是纪实记录、当前任务动态或技术准确性声明。', id: 'Bukan catatan dokumenter, pembaruan misi terkini, atau klaim akurasi teknis.', ja: '記録映像、現在のミッション更新、技術的正確さの主張ではありません。', ko: '다큐멘터리 기록, 현재 임무 업데이트 또는 기술적 정확성 주장이 아닙니다.', ru: 'Это не документальная запись, не обновление текущей миссии и не заявление о технической точности.', ar: 'ليست سجلاً وثائقياً أو تحديثاً لمهمة حالية أو ادعاءً بالدقة التقنية.' },
    asset: '/assets/user-media2/space-lunar-rover/嫦娥五号玉兔月球车模型.png', fallback: aerospaceReferenceImage,
  },
  {
    id: 'crew-environment',
    title: { en: 'Crew Environment Study', zh: '舱内环境研究', id: 'Studi Lingkungan Awak', ja: '船内環境研究', ko: '승무원 환경 연구', ru: 'Исследование среды экипажа', ar: 'دراسة بيئة الطاقم' },
    introduction: { en: 'A project-supplied display image for considering enclosure, protection and the human scale inside an aerospace narrative.', zh: '一张项目提供的展柜图像，用于思考航天叙事中的舱体、保护与人的尺度。', id: 'Gambar pajangan dari proyek untuk mempertimbangkan ruang tertutup, perlindungan, dan skala manusia dalam kisah kedirgantaraan.', ja: '宇宙開発の物語における囲い、保護、人のスケールを考えるためのプロジェクト提供展示画像です。', ko: '우주항공 서사 속 격납과 보호, 인간의 규모를 생각하는 프로젝트 제공 전시 이미지입니다.', ru: 'Экспозиционное изображение проекта для размышления об оболочке, защите и человеческом масштабе в аэрокосмической истории.', ar: 'صورة عرض قدمها المشروع للتفكير في الاحتواء والحماية والمقياس الإنساني داخل قصة الفضاء.' },
    note: { en: 'This curatorial asset does not identify authentic equipment, current standards or operational conditions.', zh: '这项策展素材不用于识别真实装备、当前标准或运行条件。', id: 'Aset kuratorial ini tidak mengidentifikasi peralatan asli, standar terkini, atau kondisi operasional.', ja: 'このキュレーション素材は実物装備、現行基準、運用条件を特定しません。', ko: '이 큐레이션 자산은 실제 장비, 현재 기준 또는 운용 조건을 특정하지 않습니다.', ru: 'Этот кураторский материал не идентифицирует подлинное оборудование, действующие стандарты или условия эксплуатации.', ar: 'لا تحدد هذه المادة التنسيقية معدات أصلية أو معايير حالية أو ظروف تشغيل.' },
    asset: '/assets/user-media2/space-spacesuit/舱内航天服展柜.png', fallback: aerospaceReferenceImage,
  },
]
assertLocalizationTree(aerospaceExhibits, 'aerospace hall data')
