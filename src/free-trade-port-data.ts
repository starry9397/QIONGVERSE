import type { Language } from './data'
import type { Localized } from './i18n'

export type FreeTradePortExhibit = {
  id: string
  title: Localized
  introduction: Localized
  note: Localized
  asset: string
  fallback: string
}

export const freeTradePortSourceUrl = 'https://en.hnftp.gov.cn/'
// Bump this version whenever the authored SPZ/JPG pair is replaced so an
// updated same-name asset is requested instead of a previously cached file.
export const freeTradePortSceneVersion = '20260814-v3'
export const freeTradePortWorldUrl = `/assets/3d/zimaogang/zimaogang.spz?v=${freeTradePortSceneVersion}`
export const freeTradePortReferenceImage = `/assets/3d/zimaogang/zimaogang.jpg?v=${freeTradePortSceneVersion}`

export const freeTradePortExhibits: FreeTradePortExhibit[] = [
  {
    id: 'port-connection',
    title: { en: 'Port Connection', zh: '港口连接', id: 'Koneksi Pelabuhan', ja: '港湾のつながり', ko: '항만 연결', ru: 'Портовое соединение', ar: 'اتصال الميناء' },
    introduction: { en: 'A project-supplied image for reading vessels, equipment, water and edge conditions as a connected visual field.', zh: '一张项目提供的图像，用于观察船舶、设备、水面与岸线如何构成相互连接的视觉场域。', id: 'Gambar yang disediakan proyek untuk membaca kapal, peralatan, air, dan kondisi tepian sebagai satu medan visual yang terhubung.', ja: '船舶、設備、水面、岸辺の状態をつながった視覚の場として読むための、プロジェクト提供画像です。', ko: '선박, 장비, 물, 가장자리의 상태를 연결된 시각 영역으로 읽는 프로젝트 제공 이미지입니다.', ru: 'Изображение, предоставленное проектом, чтобы рассмотреть суда, оборудование, воду и берег как единое визуальное поле.', ar: 'صورة مقدمة من المشروع لقراءة السفن والمعدات والمياه وحالات الحافة كحقل بصري مترابط.' },
    note: { en: 'This curatorial asset is not an official port record, operating schedule, capacity statement, or service commitment.', zh: '该策展素材不是官方港口记录、运营时刻表、吞吐能力说明或服务承诺。', id: 'Materi kuratorial ini bukan catatan pelabuhan resmi, jadwal operasi, pernyataan kapasitas, atau komitmen layanan.', ja: 'このキュレーション素材は、公式の港湾記録、運用予定、能力説明、サービスの約束ではありません。', ko: '이 큐레이션 소재는 공식 항만 기록, 운영 일정, 처리 능력 설명 또는 서비스 약속이 아닙니다.', ru: 'Этот кураторский материал не является официальной записью порта, графиком работы, заявлением о мощности или обязательством по услугам.', ar: 'هذه المادة القيّمية ليست سجلاً رسمياً للميناء أو جدول تشغيل أو بياناً للسعة أو التزاماً بالخدمة.' },
    asset: '/assets/user-media2/zimaogang-pictures/port-connection.jpg', fallback: freeTradePortReferenceImage,
  },
  {
    id: 'bonded-logistics',
    title: { en: 'Bonded Logistics', zh: '保税物流', id: 'Logistik Berikat', ja: '保税物流', ko: '보세 물류', ru: 'Таможенная логистика', ar: 'الخدمات اللوجستية الجمركية' },
    introduction: { en: 'A project-supplied visual study of storage, circulation and the routes that connect a logistics landscape.', zh: '一项项目提供的视觉研究，用于观察仓储、流动与连接物流场景的路径关系。', id: 'Kajian visual yang disediakan proyek tentang penyimpanan, sirkulasi, dan rute yang menghubungkan lanskap logistik.', ja: '保管、流通、物流の風景をつなぐ道筋を見つめる、プロジェクト提供の視覚研究です。', ko: '보관, 순환, 물류 풍경을 잇는 경로를 살펴보는 프로젝트 제공 시각 연구입니다.', ru: 'Визуальное исследование, предоставленное проектом, о хранении, движении и маршрутах, связывающих логистический ландшафт.', ar: 'دراسة بصرية مقدمة من المشروع للتخزين والحركة والمسارات التي تربط مشهد الخدمات اللوجستية.' },
    note: { en: 'It does not describe an active warehouse, customs treatment, cargo availability, clearance outcome, or commercial service.', zh: '它不描述真实仓库、海关待遇、货物可得性、通关结果或商业服务。', id: 'Ini tidak menggambarkan gudang aktif, perlakuan bea cukai, ketersediaan kargo, hasil pemeriksaan, atau layanan komersial.', ja: '実際に稼働する倉庫、税関上の扱い、貨物の可用性、通関結果、商業サービスを示すものではありません。', ko: '실제 운영 창고, 통관 처리, 화물 이용 가능성, 통관 결과 또는 상업 서비스를 설명하지 않습니다.', ru: 'Он не описывает действующий склад, таможенный режим, наличие груза, результат оформления или коммерческую услугу.', ar: 'لا تصف هذه المادة مستودعاً عاملاً أو معاملة جمركية أو توافر الشحنات أو نتيجة التخليص أو خدمة تجارية.' },
    asset: '/assets/user-media2/zimaogang-pictures/bonded-logistics.jpg', fallback: freeTradePortReferenceImage,
  },
  {
    id: 'smart-customs',
    title: { en: 'Smart Customs', zh: '智慧监管', id: 'Bea Cukai Cerdas', ja: 'スマート税関', ko: '스마트 통관', ru: 'Умная таможня', ar: 'الجمارك الذكية' },
    introduction: { en: 'A project-supplied image that frames systems, screens and infrastructure as a visual prompt for considering public-information pathways.', zh: '一张项目提供的图像，将系统、屏幕与基础设施作为理解公共信息路径的视觉提示。', id: 'Gambar yang disediakan proyek, membingkai sistem, layar, dan infrastruktur sebagai ajakan visual untuk memikirkan jalur informasi publik.', ja: 'システム、画面、インフラを公共情報への道筋を考えるための視覚的な手がかりとして捉えた、プロジェクト提供画像です。', ko: '시스템, 화면, 인프라를 공공 정보 경로를 생각하게 하는 시각적 단서로 제시한 프로젝트 제공 이미지입니다.', ru: 'Изображение, предоставленное проектом, рассматривает системы, экраны и инфраструктуру как визуальный повод подумать о путях к публичной информации.', ar: 'صورة مقدمة من المشروع تعرض الأنظمة والشاشات والبنية التحتية كإشارة بصرية للتفكير في مسارات المعلومات العامة.' },
    note: { en: 'This image is not a technical description of a real regulatory system or a statement of current procedures.', zh: '这张图不是对真实监管系统的技术说明，也不代表当前办理流程。', id: 'Gambar ini bukan uraian teknis sistem regulasi nyata atau pernyataan tentang prosedur yang berlaku saat ini.', ja: 'この画像は実在する規制システムの技術説明でも、現在の手続きの声明でもありません。', ko: '이 이미지는 실제 규제 시스템의 기술 설명이나 현재 절차에 대한 진술이 아닙니다.', ru: 'Это изображение не является техническим описанием реальной регуляторной системы и не отражает текущие процедуры.', ar: 'هذه الصورة ليست وصفاً تقنياً لنظام تنظيمي حقيقي ولا بياناً بالإجراءات الحالية.' },
    asset: '/assets/user-media2/zimaogang-pictures/smart-customs.jpg', fallback: freeTradePortReferenceImage,
  },
  {
    id: 'open-exchange',
    title: { en: 'Open Exchange', zh: '开放交流', id: 'Pertukaran Terbuka', ja: '開かれた交流', ko: '열린 교류', ru: 'Открытый обмен', ar: 'التبادل المفتوح' },
    introduction: { en: 'A project-supplied scene for considering exchange, meeting and outward-looking connections within a provincial public-information narrative.', zh: '一项项目提供的场景，用于在省级公共信息叙事中思考交流、会面与对外连接。', id: 'Adegan yang disediakan proyek untuk memikirkan pertukaran, pertemuan, dan koneksi yang mengarah ke luar dalam narasi informasi publik provinsi.', ja: '省の公共情報という物語の中で、交流、出会い、外へ開くつながりを考えるためのプロジェクト提供シーンです。', ko: '성 단위 공공 정보 서사 안에서 교류, 만남, 바깥을 향한 연결을 생각하게 하는 프로젝트 제공 장면입니다.', ru: 'Сцена, предоставленная проектом, для размышления об обмене, встречах и связях с внешним миром в повествовании о публичной информации провинции.', ar: 'مشهد مقدم من المشروع للتفكير في التبادل واللقاء والروابط المنفتحة على الخارج ضمن سرد المعلومات العامة للمقاطعة.' },
    note: { en: 'It does not establish investment eligibility, a partnership, commercial opportunity, consumer offer, or policy outcome.', zh: '它不构成投资资格、合作关系、商业机会、消费优惠或政策结果。', id: 'Ini tidak menetapkan kelayakan investasi, kemitraan, peluang komersial, penawaran konsumen, atau hasil kebijakan.', ja: '投資資格、提携、商機、消費者向けの提供、政策結果を示すものではありません。', ko: '투자 자격, 파트너십, 상업적 기회, 소비자 제안 또는 정책 결과를 확정하지 않습니다.', ru: 'Он не устанавливает право на инвестиции, партнёрство, коммерческую возможность, предложение для потребителей или результат политики.', ar: 'لا تثبت هذه المادة أهلية استثمار أو شراكة أو فرصة تجارية أو عرضاً للمستهلك أو نتيجة سياسية.' },
    asset: '/assets/user-media2/zimaogang-pictures/open-exchange.jpg', fallback: freeTradePortReferenceImage,
  },
]
