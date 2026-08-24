import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { copy, zones } from './data'
import { assertLocalizationTree, completeLocalizationTree, inline, isLanguage, languageMeta, localize, readLanguagePreference, runtimeCopy, saveLanguagePreference, type Language, type Localized, type RuntimeLocalized } from './i18n'
import BrandLockup from './components/BrandLockup'
import LanguageSelector from './components/LanguageSelector'
import LuoyinDesktopPet from './components/LuoyinDesktopPet'
import SocialShare from './components/SocialShare'
import HomeHeroOverview from './components/HomeHeroOverview'
import HomeIntroVideoModal from './components/HomeIntroVideoModal'
import HomeExperienceRail, { type HomeExperienceCard } from './components/HomeExperienceRail'
import { findTourCue, tourCueText, type LuoyinTourContext } from './luoyin-tour'
import { createWorldGuideMatcher, luoyinWorldCues, worldGuideQuestion, worldGuideTitle, worldGuideZoneId, type Direction, type LuoyinWorldMoveDetail, type WorldGuideMatch } from './luoyin-world-guide'
import sourceDeskData from '../knowledge/source-desk.json'
import sourceRegistryData from '../knowledge/source-registry.json'

const LiMiaoImmersiveHall = lazy(() => import('./components/LiMiaoImmersiveHall'))
const AerospaceImmersiveHall = lazy(() => import('./components/AerospaceImmersiveHall'))
const HualiImmersiveHall = lazy(() => import('./components/HualiImmersiveHall'))
const VillageImmersiveHall = lazy(() => import('./components/VillageImmersiveHall'))
const TropicalImmersiveHall = lazy(() => import('./components/TropicalImmersiveHall'))
const FreeTradePortImmersiveHall = lazy(() => import('./components/FreeTradePortImmersiveHall'))
const HainanMap = lazy(() => import('./components/HainanMap'))
const LuoyinTidePage = lazy(() => import('./components/LuoyinTidePage'))
const TravelAtlas = lazy(() => import('./components/TravelAtlas'))
const TradePage = lazy(() => import('./components/TradePage'))

type ExperienceRoute = 'luoyin-tide' | 'travel-atlas' | 'market'

const tourCuePreferenceStorageKey = 'qiongverse.luoyin-tour-prompts'

function readTourCuePreference() {
  try {
    return window.localStorage.getItem(tourCuePreferenceStorageKey) !== 'disabled'
  } catch {
    return true
  }
}

function saveTourCuePreference(enabled: boolean) {
  try {
    if (enabled) window.localStorage.removeItem(tourCuePreferenceStorageKey)
    else window.localStorage.setItem(tourCuePreferenceStorageKey, 'disabled')
  } catch {
    // A blocked storage area must not prevent the current visit from working.
  }
}

function DeferredHainanMap({ language }: { language: Language }) {
  const slotRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(() => window.location.hash === '#hainan-map')

  useEffect(() => {
    if (shouldLoad) return
    const slot = slotRef.current
    if (!slot) return
    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      setShouldLoad(true)
      observer.disconnect()
    }, { rootMargin: '900px 0px' })
    observer.observe(slot)
    return () => observer.disconnect()
  }, [shouldLoad])

  return <div id={shouldLoad ? undefined : 'hainan-map'} ref={slotRef} className="hainan-map-deferred home-museum-map-slot" data-museum-target="hainan-map" data-luoyin-tour-cue="map-reading" data-luoyin-tour-page="map">
    {shouldLoad
      ? <Suspense fallback={<p className="hainan-map-loading" role="status">{localize(appLoadingCopy.hainanMap, language)}</p>}><HainanMap language={language} sectionId="hainan-map" /></Suspense>
      : <p className="hainan-map-loading" aria-hidden="true" />}
  </div>
}

function experienceFromHash(hash: string): ExperienceRoute | null {
  const route = hash.replace(/^#/, '').split('?')[0]
  if (route === 'luoyin-tide' || route === 'travel-atlas') return route
  return route === 'market' || route.startsWith('market/') || route === 'market-operator' ? 'market' : null
}

type SourceDeskEntry = {
  id: string
  sourceRecordId: string
  displayKind: 'verified_source' | 'service_orientation' | 'project_context' | 'ai_curation'
  status: 'reviewed' | 'needs_review' | 'expired' | 'blocked'
  title: RuntimeLocalized
  publisher: string
  canonicalUrl: string | null
  topics: string[]
  zoneIds: string[]
  scope: RuntimeLocalized
  limitation: RuntimeLocalized
  collaborationStatus: 'no_partnership_claim'
}

type GuideMessage = {
  id: string
  role: 'visitor' | 'guide'
  text: string
  zoneTitle: string
  layer?: string
  sourceLabel?: string
  sourceUrl?: string | null
  sourceClass?: string
  sourceStatus?: string
  answerMode?: string
  mode?: 'local' | 'mock' | 'glm' | 'fallback' | 'error'
  speech?: { status: 'ready' | 'unavailable'; voice: string; segments?: Array<{ mimeType: string; data: string }> }
}

type AutoGuideView = {
  cueId: string
  zoneId: string
  question: string
  title: string
  text: string
  direction: Direction
  sourceLabel?: string
  sourceStatus?: string
  answer?: string
}

type SpeechSegment = { mimeType: string; data: string }

const sourceRegistryById = new Map(sourceRegistryData.records.map((record) => [record.id, record]))
const sourceDeskEntries = sourceDeskData.entries.map((entry) => ({
  ...entry,
  zoneIds: sourceRegistryById.get(entry.sourceRecordId)?.zoneIds || [],
})) as SourceDeskEntry[]
completeLocalizationTree(zones)
assertLocalizationTree(zones, 'home zone records')
assertLocalizationTree(sourceDeskEntries, 'source desk entries')
const sourceCheckedAt = new Map(sourceRegistryData.records.map((record) => [record.id, record.checkedAt]))
const publicApiBaseUrl = (import.meta.env.VITE_LUOYIN_API_BASE_URL || '').trim().replace(/\/+$/, '')
const apiPath = (path: string) => `${publicApiBaseUrl}${path}`
const deliveryImage = (path: string) => path.replace(/\.(jpe?g|png)$/i, '.webp')
const freeTradeOfflineReply: Record<Language, string> = {
  en: 'This Free Trade Port room is a project-curated visual orientation. Check the official Hainan Free Trade Port English portal for current public information.',
  zh: '自贸港展厅提供项目策展的视觉导览。当前公共信息请查阅海南自由贸易港英文官方门户。',
  id: 'Ruang Free Trade Port ini adalah orientasi visual yang dikurasi proyek. Periksa portal resmi berbahasa Inggris Hainan Free Trade Port untuk informasi publik terkini.',
  ja: 'この自由貿易港の展示室は、プロジェクトが編んだ視覚案内です。最新の公開情報は海南自由貿易港の英語公式ポータルで確認してください。',
  ko: '이 자유무역항 전시실은 프로젝트가 큐레이션한 시각 안내입니다. 최신 공개 정보는 하이난 자유무역항 영문 공식 포털에서 확인해 주세요.',
  ru: 'Этот зал Свободного торгового порта представляет собой визуальную ориентацию, подготовленную проектом. Актуальную публичную информацию проверяйте на официальном англоязычном портале Hainan Free Trade Port.',
  ar: 'هذه القاعة الخاصة بميناء التجارة الحرة هي توجيه بصري من إعداد المشروع. تحقّق من المعلومات العامة الحالية عبر البوابة الإنجليزية الرسمية لميناء هاينان للتجارة الحرة.',
}
const homeExperienceCopy = {
  travelTitle: { en: 'Read Hainan by the light.', zh: '沿着光，读海南。', id: 'Baca Hainan melalui cahaya.', ja: '光をたどって海南を読む。', ko: '빛을 따라 하이난을 읽다.', ru: 'Читать Хайнань в направлении света.', ar: 'اقرأ هاينان على درب الضوء.' },
  travelBody: { en: 'A visual island atlas where reviewed-source notes stay beside every invitation.', zh: '一部让已核验来源始终与每次视觉邀请并置的海岛图鉴。', id: 'Atlas pulau visual dengan catatan sumber yang ditinjau di samping setiap undangan.', ja: '確認済みの出典ノートを、すべての視覚的な誘いのそばに置く島のアトラス。', ko: '검토된 출처 메모를 모든 시각적 초대와 함께 보여 주는 섬의 아틀라스입니다.', ru: 'Визуальный атлас острова, где проверенные источники сопровождают каждое приглашение.', ar: 'أطلس بصري للجزيرة ترافق فيه ملاحظات المصادر المراجعة كل دعوة.' },
  travelAction: { en: 'Open Hainan Unfolded', zh: '打开海南图鉴', id: 'Buka Hainan Unfolded', ja: 'Hainan Unfolded を開く', ko: 'Hainan Unfolded 열기', ru: 'Открыть Hainan Unfolded', ar: 'افتح Hainan Unfolded' },
  travelLabel: { en: 'REVIEWED-SOURCE ATLAS', zh: '已核验来源图鉴', id: 'ATLAS SUMBER TINJAUAN', ja: '確認済み出典アトラス', ko: '검토된 출처 아틀라스', ru: 'АТЛАС ПРОВЕРЕННЫХ ИСТОЧНИКОВ', ar: 'أطلس المصادر المراجعة' },
  shellsongTitle: { en: 'Hear the tide answer.', zh: '听见潮汐的回声。', id: 'Dengarkan jawaban pasang.', ja: '潮の答えを聴く。', ko: '조수의 응답을 듣다.', ru: 'Услышать ответ прилива.', ar: 'استمع إلى جواب المد.' },
  shellsongBody: { en: 'Enter an original fictional guide layer shaped by tides, images, and small acts of listening.', zh: '进入由潮汐、影像与聆听构成的原创虚构导览叙事。', id: 'Masuki lapisan pemandu fiksi orisinal yang dibentuk oleh pasang, gambar, dan tindakan kecil untuk mendengarkan.', ja: '潮、映像、耳を澄ます小さな行為が形づくる、オリジナルの架空ガイド層へ。', ko: '조수와 이미지, 작은 경청의 행위가 빚은 오리지널 가상 안내 서사로 들어가 보세요.', ru: 'Войдите в оригинальный вымышленный слой гида, созданный приливами, образами и маленькими актами слушания.', ar: 'ادخل إلى طبقة دليل خيالية أصلية تشكلها الأمواج والصور ولحظات الإصغاء الصغيرة.' },
  shellsongAction: { en: 'Enter ShellSong', zh: '进入 ShellSong', id: 'Masuk ShellSong', ja: 'ShellSong に入る', ko: 'ShellSong 입장', ru: 'Войти в ShellSong', ar: 'دخول ShellSong' },
  shellsongMeta: { en: 'ORIGINAL FICTION', zh: '原创虚构叙事', id: 'FIKSI ORISINAL', ja: 'オリジナルフィクション', ko: '오리지널 픽션', ru: 'ОРИГИНАЛЬНАЯ ФИКЦИЯ', ar: 'خيال أصلي' },
  marketTitle: { en: 'Let the story travel on.', zh: '让故事，继续生长。', id: 'Biarkan cerita terus berjalan.', ja: '物語を旅立たせる。', ko: '이야기가 계속 여행하게 하세요.', ru: 'Пусть история продолжит путь.', ar: 'دع الحكاية تواصل رحلتها.' },
  marketBody: { en: 'Browse cultural concepts, Luoyin IP studies, and studio services in a session-only interface demonstration.', zh: '在仅限当前会话的界面演示中浏览文化概念、螺音 IP 研究与工作室服务。', id: 'Jelajahi konsep budaya, kajian IP Luoyin, dan layanan studio dalam demo antarmuka yang hanya berlaku selama sesi ini.', ja: 'このセッション限定のインターフェースデモで、文化的コンセプト、螺音 IP 研究、スタジオサービスをご覧ください。', ko: '이번 세션에만 제공되는 인터페이스 데모에서 문화적 콘셉트, 뤄인 IP 연구, 스튜디오 서비스를 살펴보세요.', ru: 'Изучите культурные концепции, исследования IP Луоинь и услуги студии в интерфейсной демонстрации только для этой сессии.', ar: 'استكشف المفاهيم الثقافية ودراسات IP الخاصة بلويين وخدمات الاستوديو في عرض واجهة متاح خلال هذه الجلسة فقط.' },
  marketAction: { en: 'Open project market', zh: '打开项目商城', id: 'Buka pasar proyek', ja: 'プロジェクトマーケットを開く', ko: '프로젝트 마켓 열기', ru: 'Открыть маркет проекта', ar: 'فتح سوق المشروع' },
  marketMeta: { en: 'SESSION-ONLY PROJECT DEMO', zh: '仅限当前会话的项目演示', id: 'DEMO PROYEK KHUSUS SESI', ja: 'セッション限定プロジェクトデモ', ko: '세션 전용 프로젝트 데모', ru: 'ДЕМО ПРОЕКТА ТОЛЬКО ДЛЯ СЕАНСА', ar: 'عرض المشروع لهذه الجلسة فقط' },
} satisfies Record<string, RuntimeLocalized>
assertLocalizationTree(homeExperienceCopy, 'home experience copy')

const homeMuseumChapterCopy = {
  railLabel: { en: 'Homepage museum chapters', zh: '首页博物馆章节', id: 'Bab museum beranda', ja: 'ホーム博物館の章', ko: '홈 박물관 장', ru: 'Главы музейной главной страницы', ar: 'فصول متحف الصفحة الرئيسية' },
  backToTop: { en: 'Return to the top of the archive', zh: '返回档案顶部', id: 'Kembali ke atas arsip', ja: 'アーカイブの先頭へ戻る', ko: '아카이브 상단으로 돌아가기', ru: 'Вернуться к началу архива', ar: 'العودة إلى أعلى الأرشيف' },
  portal: { en: 'Free Trade Port Main Hall', zh: '自贸港主厅', id: 'Aula Utama Pelabuhan Perdagangan Bebas', ja: '自由貿易港メインホール', ko: '자유무역항 메인 홀', ru: 'Главный зал порта свободной торговли', ar: 'القاعة الرئيسية لميناء التجارة الحرة' },
  halls: { en: 'Five Hall Archive', zh: '五厅展览档案', id: 'Arsip lima aula', ja: '五つの展示室アーカイブ', ko: '다섯 전시관 아카이브', ru: 'Архив пяти залов', ar: 'أرشيف القاعات الخمس' },
  map: { en: 'Hainan Regional Map', zh: '海南区域地图', id: 'Peta wilayah Hainan', ja: '海南地域マップ', ko: '하이난 지역 지도', ru: 'Региональная карта Хайнаня', ar: 'خريطة منطقة هاينان' },
  travel: { en: 'Hainan Unfolded', zh: '海南图鉴', id: 'Hainan Unfolded', ja: 'Hainan Unfolded', ko: 'Hainan Unfolded', ru: 'Hainan Unfolded', ar: 'Hainan Unfolded' },
  shellsong: { en: 'ShellSong / Luoyin', zh: '螺音故事', id: 'ShellSong / Luoyin', ja: 'ShellSong / 螺音', ko: 'ShellSong / 뤄인', ru: 'ShellSong / Луоинь', ar: 'ShellSong / لويين' },
  market: { en: 'Project Collection', zh: '项目概念集合', id: 'Koleksi proyek', ja: 'プロジェクトコレクション', ko: '프로젝트 컬렉션', ru: 'Коллекция проекта', ar: 'مجموعة المشروع' },
} satisfies Record<string, RuntimeLocalized>
assertLocalizationTree(homeMuseumChapterCopy, 'home museum chapter copy')

const appLoadingCopy = {
  hainanMap: { en: 'Opening the regional reading map…', zh: '正在打开区域阅读地图……', id: 'Membuka peta bacaan wilayah…', ja: '地域リーディングマップを開いています…', ko: '지역 읽기 지도를 여는 중…', ru: 'Открываем карту регионального чтения…', ar: 'جارٍ فتح خريطة القراءة الإقليمية…' },
  shellsong: { en: 'Opening ShellSong…', zh: '正在打开螺音……', id: 'Membuka ShellSong…', ja: 'ShellSong を開いています…', ko: 'ShellSong을 여는 중…', ru: 'Открываем ShellSong…', ar: 'جارٍ فتح ShellSong…' },
  travel: { en: 'Opening Hainan Unfolded…', zh: '正在打开海南展开……', id: 'Membuka Hainan Unfolded…', ja: 'Hainan Unfolded を開いています…', ko: 'Hainan Unfolded를 여는 중…', ru: 'Открываем Hainan Unfolded…', ar: 'جارٍ فتح Hainan Unfolded…' },
  market: { en: 'Opening the project demo market…', zh: '正在打开项目商城演示……', id: 'Membuka demo pasar proyek…', ja: 'プロジェクトマーケットのデモを開いています…', ko: '프로젝트 마켓 데모를 여는 중…', ru: 'Открываем демонстрационный маркет проекта…', ar: 'جارٍ فتح عرض سوق المشروع…' },
  tropical: { en: 'Opening the Tropical Island Hall…', zh: '正在打开热带海岛展厅……', id: 'Membuka Aula Pulau Tropis…', ja: '熱帯島展示室を開いています…', ko: '열대 섬 전시관을 여는 중…', ru: 'Открываем зал тропического острова…', ar: 'جارٍ فتح قاعة الجزيرة الاستوائية…' },
  limiao: { en: 'Opening the Li & Miao Immersive Hall…', zh: '正在打开黎苗沉浸展厅……', id: 'Membuka aula imersif Li dan Miao…', ja: 'リー族・ミャオ族の没入型展示室を開いています…', ko: '리·먀오 몰입형 전시관을 여는 중…', ru: 'Открываем иммерсивный зал ли и мяо…', ar: 'جارٍ فتح القاعة الغامرة للي ومياو…' },
  aerospace: { en: 'Opening the Wenchang Aerospace Hall…', zh: '正在打开文昌航天展厅……', id: 'Membuka Aula Kedirgantaraan Wenchang…', ja: '文昌宇宙開発展示室を開いています…', ko: '원창 우주항공 전시관을 여는 중…', ru: 'Открываем аэрокосмический зал Вэньчана…', ar: 'جارٍ فتح قاعة ونتشانغ للفضاء…' },
  huali: { en: 'Opening the Dongfang Rosewood Hall…', zh: '正在打开东方花梨厅……', id: 'Membuka Aula Kayu Mawar Dongfang…', ja: '東方ローズウッド展示室を開いています…', ko: '둥팡 화리목 전시관을 여는 중…', ru: 'Открываем зал палисандра Дунфан…', ar: 'جارٍ فتح قاعة خشب الورد في دونغفانغ…' },
  village: { en: 'Opening the Beautiful Villages Hall…', zh: '正在打开美丽乡村展厅……', id: 'Membuka Aula Desa Indah…', ja: '美しい農村展示室を開いています…', ko: '아름다운 농촌 전시관을 여는 중…', ru: 'Открываем зал красивых деревень…', ar: 'جارٍ فتح قاعة القرى الجميلة…' },
  freeTradePort: { en: 'Opening the Free Trade Port Hall…', zh: '正在打开自贸港展厅……', id: 'Membuka Aula Pelabuhan Perdagangan Bebas…', ja: '自由貿易港展示室を開いています…', ko: '자유무역항 전시관을 여는 중…', ru: 'Открываем зал порта свободной торговли…', ar: 'جارٍ فتح قاعة ميناء التجارة الحرة…' },
} satisfies Record<string, RuntimeLocalized>
assertLocalizationTree(appLoadingCopy, 'app loading copy')

const guideUiCopy = {
  listening: { en: 'listening', zh: '正在聆听', id: 'mendengarkan', ja: '聴いています', ko: '듣는 중', ru: 'слушает', ar: 'تصغي' },
  resonance: { en: 'resonance', zh: '共振', id: 'resonansi', ja: '共鳴', ko: '공명', ru: 'резонанс', ar: 'رنين' },
  focus: { en: 'focus', zh: '专注', id: 'fokus', ja: '集中', ko: '집중', ru: 'фокус', ar: 'تركيز' },
  conversation: { en: 'Conversation with Luoyin', zh: '与螺音的对话', id: 'Percakapan dengan Luoyin', ja: '螺音との会話', ko: '뤄인과의 대화', ru: 'Разговор с Луоинь', ar: 'محادثة مع لويين' },
  you: { en: 'YOU', zh: '你', id: 'ANDA', ja: 'あなた', ko: '당신', ru: 'ВЫ', ar: 'أنت' },
  offlineFallback: { en: 'offline fallback', zh: '离线本地回退', id: 'fallback lokal offline', ja: 'オフラインのローカル回答', ko: '오프라인 로컬 대체 답변', ru: 'локальный офлайн-ответ', ar: 'رد محلي دون اتصال' },
  localContext: { en: 'local contextual guide', zh: '本地语境导览', id: 'panduan kontekstual lokal', ja: 'ローカル文脈ガイド', ko: '로컬 맥락 안내', ru: 'локальный контекстный гид', ar: 'دليل سياقي محلي' },
  glmResponse: { en: 'GLM guide response', zh: 'GLM 导览回答', id: 'respons pemandu GLM', ja: 'GLM ガイドの回答', ko: 'GLM 안내 응답', ru: 'ответ гида GLM', ar: 'رد دليل GLM' },
  glmKnowledgeResponse: { en: 'GLM knowledge answer', zh: 'GLM 科普回答', id: 'jawaban pengetahuan GLM', ja: 'GLM 知識回答', ko: 'GLM 지식 답변', ru: 'ответ GLM по знаниям', ar: 'إجابة معرفية من GLM' },
  glmProjectResponse: { en: 'GLM project guide', zh: 'GLM 项目导览', id: 'panduan proyek GLM', ja: 'GLM プロジェクトガイド', ko: 'GLM 프로젝트 안내', ru: 'проектный гид GLM', ar: 'دليل مشروع GLM' },
  glmRegulatedResponse: { en: 'GLM general orientation', zh: 'GLM 一般说明', id: 'orientasi umum GLM', ja: 'GLM 一般案内', ko: 'GLM 일반 안내', ru: 'общая ориентация GLM', ar: 'توجيه عام من GLM' },
  loading: { en: 'Listening to the tide…', zh: '正在听潮声……', id: 'Mendengarkan pasang…', ja: '潮の音を聴いています…', ko: '조수의 소리를 듣는 중…', ru: 'Слушаю прилив…', ar: 'أصغي إلى المد…' },
  checking: { en: 'Checking guide service…', zh: '正在检查导览服务……', id: 'Memeriksa layanan pemandu…', ja: 'ガイドサービスを確認中…', ko: '안내 서비스를 확인하는 중…', ru: 'Проверяем сервис гида…', ar: 'جارٍ التحقق من خدمة الدليل…' },
  glmConnected: { en: 'Live GLM guide is connected. Current or regulated details should be checked against a primary source.', zh: '实时 GLM 导览已连接。涉及当前或受监管的详情，请以权威一手来源为准。', id: 'Pemandu GLM langsung terhubung. Rincian terkini atau yang diatur perlu diperiksa pada sumber utama.', ja: 'リアルタイム GLM ガイドに接続しました。現在の情報や規制に関わる詳細は一次資料で確認してください。', ko: '실시간 GLM 안내가 연결되었습니다. 현재 정보나 규제 관련 세부 사항은 1차 출처에서 확인하세요.', ru: 'Онлайн-гид GLM подключён. Актуальные и регулируемые детали проверяйте по первичному источнику.', ar: 'اتصل دليل GLM المباشر. تحقّق من التفاصيل الحالية أو الخاضعة للتنظيم عبر مصدر أولي.' },
  localActive: { en: 'Local contextual guide is active. Live GLM needs a service-process API key.', zh: '本地语境导览正在运行。实时 GLM 需要在服务进程中配置 API 密钥。', id: 'Panduan kontekstual lokal aktif. GLM langsung memerlukan kunci API pada proses layanan.', ja: 'ローカル文脈ガイドが有効です。リアルタイム GLM にはサービスプロセスの API キーが必要です。', ko: '로컬 맥락 안내가 작동 중입니다. 실시간 GLM에는 서비스 프로세스의 API 키가 필요합니다.', ru: 'Локальный контекстный гид активен. Для онлайн-GLM нужен ключ API в сервисном процессе.', ar: 'الدليل السياقي المحلي نشط. يحتاج GLM المباشر إلى مفتاح API في عملية الخدمة.' },
  unavailable: { en: 'Guide service status is unavailable. Local replies remain available.', zh: '导览服务状态暂不可用，本地回答仍可使用。', id: 'Status layanan pemandu tidak tersedia. Jawaban lokal tetap dapat digunakan.', ja: 'ガイドサービスの状態を取得できません。ローカル回答は引き続き利用できます。', ko: '안내 서비스 상태를 확인할 수 없습니다. 로컬 답변은 계속 사용할 수 있습니다.', ru: 'Статус сервиса гида недоступен. Локальные ответы остаются доступными.', ar: 'حالة خدمة الدليل غير متاحة. تبقى الإجابات المحلية متوفرة.' },
  speechNotice: { en: 'Synthetic voice is not configured; text remains available.', zh: '尚未配置合成语音，文字回答仍可用。', id: 'Suara sintetis belum dikonfigurasi; teks tetap tersedia.', ja: '合成音声は未設定ですが、テキストは利用できます。', ko: '합성 음성이 설정되지 않았지만 텍스트는 계속 제공됩니다.', ru: 'Синтетический голос не настроен; текст остаётся доступным.', ar: 'لم يُضبط الصوت الاصطناعي؛ يبقى النص متاحاً.' },
} satisfies Record<string, RuntimeLocalized>
assertLocalizationTree(guideUiCopy, 'Luoyin guide interface copy')

const autoGuideCopy = {
  left: { en: 'on your left', zh: '左侧', id: 'di kiri', ja: '左側', ko: '왼쪽', ru: 'слева', ar: 'على اليسار' },
  front: { en: 'ahead', zh: '前方', id: 'di depan', ja: '前方', ko: '앞쪽', ru: 'впереди', ar: 'أمامك' },
  right: { en: 'on your right', zh: '右侧', id: 'di kanan', ja: '右側', ko: '오른쪽', ru: 'справа', ar: 'على اليمين' },
  enabled: { en: 'Automatic guide', zh: '自动导览', id: 'Panduan otomatis', ja: '自動ガイド', ko: '자동 안내', ru: 'Автогид', ar: 'الدليل التلقائي' },
  pause: { en: 'Automatic guide paused while another panel is open.', zh: '其他面板打开时，自动导览会暂停。', id: 'Panduan otomatis dijeda saat panel lain terbuka.', ja: '別のパネルを開いている間、自動ガイドは一時停止します。', ko: '다른 패널이 열려 있는 동안 자동 안내가 일시 중지됩니다.', ru: 'Автогид приостановлен, пока открыта другая панель.', ar: 'تم إيقاف الدليل التلقائي مؤقتاً أثناء فتح لوحة أخرى.' },
  tourPromptsEnabled: { en: 'Disable page tour prompts', zh: '关闭页面导览提示', id: 'Nonaktifkan petunjuk tur halaman', ja: 'ページ案内のヒントを無効化', ko: '페이지 안내 힌트 끄기', ru: 'Отключить подсказки навигации', ar: 'تعطيل تلميحات جولة الصفحات' },
  tourPromptsDisabled: { en: 'Enable page tour prompts', zh: '重新启用页面导览提示', id: 'Aktifkan petunjuk tur halaman', ja: 'ページ案内のヒントを再有効化', ko: '페이지 안내 힌트 다시 켜기', ru: 'Включить подсказки навигации', ar: 'تفعيل تلميحات جولة الصفحات' },
} satisfies Record<string, RuntimeLocalized>
assertLocalizationTree(autoGuideCopy, 'Luoyin automatic guide copy')

const sourceDeskCopy = {
  kicker: { en: 'SOURCE DESK / REVIEWED ENTRY POINTS', zh: '来源服务台 / 已核验入口', id: 'MEJA SUMBER / TITIK MASUK TINJAU', ja: '出典デスク / 確認済みエントリー', ko: '출처 데스크 / 검토된 진입점', ru: 'СТОЛ ИСТОЧНИКОВ / ПРОВЕРЕННЫЕ ТОЧКИ ВХОДА', ar: 'مكتب المصادر / نقاط الدخول المُراجعة' },
  title: { en: 'Verified Source Desk', zh: '已核验来源服务台', id: 'Meja Sumber Terverifikasi', ja: '確認済み出典デスク', ko: '검증된 출처 데스크', ru: 'Стол проверенных источников', ar: 'مكتب المصادر المتحققة' },
  allSources: { en: 'All sources', zh: '全部来源', id: 'Semua sumber', ja: 'すべての出典', ko: '모든 출처', ru: 'Все источники', ar: 'كل المصادر' },
  heritage: { en: 'Heritage', zh: '文化与非遗', id: 'Warisan', ja: '文化遺産', ko: '문화유산', ru: 'Наследие', ar: 'التراث' },
  aerospace: { en: 'Aerospace', zh: '航天', id: 'Kedirgantaraan', ja: '宇宙開発', ko: '항공우주', ru: 'Аэрокосмос', ar: 'الفضاء والطيران' },
  freeTradePort: { en: 'Free Trade Port', zh: '自贸港', id: 'Pelabuhan Perdagangan Bebas', ja: '自由貿易港', ko: '자유무역항', ru: 'Порт свободной торговли', ar: 'ميناء التجارة الحرة' },
  intro: { en: 'Reviewed public sources, project visual context, and bounded AI curation are kept visibly separate. None of these records implies a project partnership. Read each scope and limitation before opening an original source.', zh: '已核验公开来源、项目视觉语境与受限 AI 编排会清晰区分，且均不代表项目合作关系。打开原始来源前，请阅读每条记录的范围与限制。', id: 'Sumber publik yang ditinjau, konteks visual proyek, dan kurasi AI terbatas dipisahkan dengan jelas. Tidak ada catatan yang menyiratkan kemitraan proyek. Baca cakupan dan batasan sebelum membuka sumber asli.', ja: '確認済みの公開出典、プロジェクトの視覚的文脈、制限付き AI キュレーションを明確に分けています。これらの記録はプロジェクトとの提携を示すものではありません。原典を開く前に範囲と制限を確認してください。', ko: '검토된 공개 출처, 프로젝트 시각 맥락, 제한된 AI 큐레이션을 명확히 구분합니다. 어떤 기록도 프로젝트 제휴를 의미하지 않습니다. 원문 출처를 열기 전에 범위와 제한을 확인하세요.', ru: 'Проверенные публичные источники, визуальный контекст проекта и ограниченное курирование ИИ показаны отдельно. Ни одна запись не означает партнёрство с проектом. Перед открытием оригинала прочитайте область и ограничения.', ar: 'نُبقي المصادر العامة المُراجعة والسياق المرئي للمشروع وتنسيق الذكاء الاصطناعي المحدود منفصلة بوضوح. لا يشير أي سجل إلى شراكة مع المشروع. اقرأ النطاق والقيود قبل فتح المصدر الأصلي.' },
  close: { en: 'Close source desk', zh: '关闭来源服务台', id: 'Tutup meja sumber', ja: '出典デスクを閉じる', ko: '출처 데스크 닫기', ru: 'Закрыть стол источников', ar: 'إغلاق مكتب المصادر' },
  filterTopics: { en: 'Filter source topics', zh: '筛选来源主题', id: 'Saring topik sumber', ja: '出典トピックを絞り込む', ko: '출처 주제 필터', ru: 'Фильтр тем источников', ar: 'تصفية موضوعات المصادر' },
  noPartnership: { en: 'No partnership claim', zh: '不宣称合作关系', id: 'Tidak ada klaim kemitraan', ja: '提携関係を主張しません', ko: '제휴 관계를 주장하지 않음', ru: 'Партнёрство не заявляется', ar: 'لا يوجد ادعاء بالشراكة' },
  scope: { en: 'Scope', zh: '范围', id: 'Cakupan', ja: '範囲', ko: '범위', ru: 'Область', ar: 'النطاق' },
  limitation: { en: 'Limitation', zh: '限制', id: 'Batasan', ja: '制限', ko: '제한', ru: 'Ограничение', ar: 'القيود' },
  openOriginal: { en: 'Open original HTTPS source', zh: '打开原始 HTTPS 来源', id: 'Buka sumber HTTPS asli', ja: '原典 HTTPS を開く', ko: '원본 HTTPS 출처 열기', ru: 'Открыть исходный HTTPS-источник', ar: 'فتح مصدر HTTPS الأصلي' },
  selectedSimulation: { en: 'Selected for simulation', zh: '已选择模拟交接来源', id: 'Dipilih untuk simulasi', ja: 'シミュレーション用に選択済み', ko: '시뮬레이션용으로 선택됨', ru: 'Выбрано для симуляции', ar: 'محدد للمحاكاة' },
  useSimulation: { en: 'Use for simulation', zh: '用于模拟交接', id: 'Gunakan untuk simulasi', ja: 'シミュレーションに使用', ko: '시뮬레이션에 사용', ru: 'Использовать для симуляции', ar: 'استخدام للمحاكاة' },
  empty: { en: 'No reviewed source matches this topic. Choose All sources to continue.', zh: '没有与此主题匹配的已核验来源。请选择“全部来源”继续。', id: 'Tidak ada sumber yang ditinjau untuk topik ini. Pilih Semua sumber untuk melanjutkan.', ja: 'このトピックに一致する確認済み出典はありません。「すべての出典」を選んで続けてください。', ko: '이 주제와 일치하는 검토된 출처가 없습니다. 계속하려면 모든 출처를 선택하세요.', ru: 'Для этой темы нет проверенных источников. Выберите «Все источники», чтобы продолжить.', ar: 'لا يوجد مصدر مُراجع يطابق هذا الموضوع. اختر «كل المصادر» للمتابعة.' },
  receiptKicker: { en: 'LOCAL SIMULATION RECEIPT', zh: '本地模拟回执', id: 'BUKTI SIMULASI LOKAL', ja: 'ローカルシミュレーションの受付', ko: '로컬 시뮬레이션 접수', ru: 'КВИТАНЦИЯ ЛОКАЛЬНОЙ СИМУЛЯЦИИ', ar: 'إيصال المحاكاة المحلية' },
  receiptTitle: { en: 'The simulation completed locally.', zh: '本地模拟交接已完成。', id: 'Simulasi selesai secara lokal.', ja: 'シミュレーションはローカルで完了しました。', ko: '로컬 시뮬레이션이 완료되었습니다.', ru: 'Локальная симуляция завершена.', ar: 'اكتملت المحاكاة محلياً.' },
  reference: { en: 'Reference', zh: '参考编号', id: 'Referensi', ja: '参照番号', ko: '참조 번호', ru: 'Номер ссылки', ar: 'المرجع' },
  noInstitution: { en: 'No real institution was contacted. No partnership, booking, order, quote, eligibility decision, or commercial outcome was created.', zh: '未联系任何真实机构；未建立合作，未产生预订、订单、报价、资格决定或商业结果。', id: 'Tidak ada institusi nyata yang dihubungi. Tidak ada kemitraan, pemesanan, pesanan, penawaran, keputusan kelayakan, atau hasil komersial yang dibuat.', ja: '実在の機関には連絡していません。提携、予約、注文、見積もり、資格判断、商業的な結果は作成されません。', ko: '실제 기관에 연락하지 않았습니다. 제휴, 예약, 주문, 견적, 자격 판단 또는 상업적 결과가 생성되지 않았습니다.', ru: 'Реальные учреждения не связывались с проектом. Партнёрство, бронирование, заказ, предложение, решение о праве или коммерческий результат не создавались.', ar: 'لم يتم الاتصال بأي مؤسسة حقيقية. لم تُنشأ شراكة أو حجز أو طلب أو عرض سعر أو قرار أهلية أو نتيجة تجارية.' },
  return: { en: 'Return to the exhibition', zh: '返回展厅', id: 'Kembali ke pameran', ja: '展示に戻る', ko: '전시로 돌아가기', ru: 'Вернуться к выставке', ar: 'العودة إلى المعرض' },
  simulationPurpose: { en: 'Simulation purpose', zh: '模拟交接目的', id: 'Tujuan simulasi', ja: 'シミュレーションの目的', ko: '시뮬레이션 목적', ru: 'Цель симуляции', ar: 'غرض المحاكاة' },
  consent: { en: 'I understand this is a local simulation only. No identity, enquiry, or institutional contact will be stored or sent.', zh: '我理解这仅为本地模拟；不会存储或发送身份、咨询内容或机构联系信息。', id: 'Saya memahami bahwa ini hanya simulasi lokal. Identitas, pertanyaan, atau kontak institusi tidak akan disimpan atau dikirim.', ja: 'これはローカルシミュレーションのみであり、身元、問い合わせ、機関への連絡先は保存・送信されないことを理解しました。', ko: '이것은 로컬 시뮬레이션일 뿐이며 신원, 문의 내용 또는 기관 연락처가 저장되거나 전송되지 않음을 이해합니다.', ru: 'Я понимаю, что это только локальная симуляция. Личные данные, запросы и контакты учреждений не сохраняются и не отправляются.', ar: 'أفهم أن هذه محاكاة محلية فقط. لن تُحفظ الهوية أو الاستفسارات أو جهات الاتصال المؤسسية ولن تُرسل.' },
  preparing: { en: 'Preparing local simulation…', zh: '正在准备本地模拟…', id: 'Menyiapkan simulasi lokal…', ja: 'ローカルシミュレーションを準備中…', ko: '로컬 시뮬레이션을 준비하는 중…', ru: 'Подготовка локальной симуляции…', ar: 'جارٍ إعداد المحاكاة المحلية…' },
  simulate: { en: 'Simulate operational handoff', zh: '模拟运营交接', id: 'Simulasikan pengalihan operasional', ja: '運用引き継ぎをシミュレーション', ko: '운영 인계 시뮬레이션', ru: 'Симулировать операционную передачу', ar: 'محاكاة التسليم التشغيلي' },
} satisfies Record<string, RuntimeLocalized>
const sourceDeskLayerCopy = {
  verified_source: { en: 'Reviewed source', zh: '已核验来源', id: 'Sumber yang ditinjau', ja: '確認済み出典', ko: '검토된 출처', ru: 'Проверенный источник', ar: 'مصدر مُراجع' },
  service_orientation: { en: 'Public orientation', zh: '公共信息导览', id: 'Orientasi publik', ja: '公共情報案内', ko: '공공 정보 안내', ru: 'Публичная справка', ar: 'إرشاد عام' },
  project_context: { en: 'Project visual context', zh: '项目视觉语境', id: 'Konteks visual proyek', ja: 'プロジェクトの視覚的文脈', ko: '프로젝트 시각 맥락', ru: 'Визуальный контекст проекта', ar: 'سياق بصري للمشروع' },
  ai_curation: { en: 'AI curation boundary', zh: 'AI 编排边界', id: 'Batas kurasi AI', ja: 'AI キュレーションの境界', ko: 'AI 큐레이션 경계', ru: 'Граница ИИ-курирования', ar: 'حدود تنسيق الذكاء الاصطناعي' },
} satisfies Record<SourceDeskEntry['displayKind'], RuntimeLocalized>
assertLocalizationTree(sourceDeskCopy, 'source desk interface copy')
assertLocalizationTree(sourceDeskLayerCopy, 'source desk layer labels')

const sourceArchiveCopy = {
  archiveKicker: { en: 'ARCHIVE / SIX-HALL INDEX', zh: '档案馆 / 六厅索引', id: 'ARSIP / INDEKS ENAM AULA', ja: 'アーカイブ / 6ホール索引', ko: '아카이브 / 6개 홀 색인', ru: 'АРХИВ / УКАЗАТЕЛЬ ШЕСТИ ЗАЛОВ', ar: 'الأرشيف / فهرس القاعات الست' },
  archiveTitle: { en: 'A living archive of Hainan readings', zh: '持续更新的海南阅读档案', id: 'Arsip pembacaan Hainan yang hidup', ja: '海南を読むための生きたアーカイブ', ko: '하이난 읽기의 살아 있는 아카이브', ru: 'Живой архив чтения Хайнаня', ar: 'أرشيف حي لقراءات هاينان' },
  archiveIntro: { en: 'Browse the six halls through three clearly separated layers: reviewed public sources, project-curated visual context, and bounded AI curation. Every record states what it can support and what it cannot.', zh: '从三种清晰分开的资料层阅读六大展厅：已核验公开来源、项目策展视觉语境与受限 AI 编排。每条记录都会说明可支持与不可支持的范围。', id: 'Jelajahi enam aula melalui tiga lapisan yang terpisah: sumber publik yang ditinjau, konteks visual proyek, dan kurasi AI terbatas. Setiap catatan menjelaskan dukungan dan batasannya.', ja: '確認済み公開出典、プロジェクトの視覚的文脈、制限付き AI キュレーションという3つの層から、6つのホールを読み解きます。各記録は対応範囲と限界を示します。', ko: '검토된 공개 출처, 프로젝트 시각 맥락, 제한된 AI 큐레이션의 세 층으로 여섯 홀을 살펴봅니다. 각 기록에는 지원 범위와 한계가 명시됩니다.', ru: 'Исследуйте шесть залов через три отдельные границы: проверенные публичные источники, визуальный контекст проекта и ограниченное курирование ИИ. В каждой записи указаны возможности и ограничения.', ar: 'استكشف القاعات الست عبر ثلاث طبقات منفصلة بوضوح: المصادر العامة المُراجعة، والسياق المرئي للمشروع، وتنسيق الذكاء الاصطناعي المحدود. يوضح كل سجل ما يدعمه وما لا يدعمه.' },
  hallFilter: { en: 'Hall', zh: '展厅', id: 'Aula', ja: 'ホール', ko: '홀', ru: 'Зал', ar: 'القاعة' },
  layerFilter: { en: 'Layer', zh: '资料层', id: 'Lapisan', ja: 'レイヤー', ko: '레이어', ru: 'Слой', ar: 'الطبقة' },
  allHalls: { en: 'All six halls', zh: '六厅全部', id: 'Enam aula', ja: '6ホールすべて', ko: '6개 홀 전체', ru: 'Все шесть залов', ar: 'القاعات الست' },
  freeTradeHall: { en: 'Free Trade Port', zh: '自贸港主厅', id: 'Pelabuhan Perdagangan Bebas', ja: '自由貿易港', ko: '자유무역항', ru: 'Порт свободной торговли', ar: 'ميناء التجارة الحرة' },
  tropicalHall: { en: 'Tropical Island', zh: '热带海岛厅', id: 'Pulau Tropis', ja: '熱帯の島', ko: '열대 섬', ru: 'Тропический остров', ar: 'الجزيرة الاستوائية' },
  lijinHall: { en: 'Li-Miao Heritage', zh: '黎苗非遗厅', id: 'Warisan Li-Miao', ja: '黎族・苗族文化遺産', ko: '리·먀오 문화유산', ru: 'Наследие ли и мяо', ar: 'تراث لي-مياو' },
  aerospaceHall: { en: 'Wenchang Aerospace', zh: '文昌航天厅', id: 'Kedirgantaraan Wenchang', ja: '文昌宇宙', ko: '원창 항공우주', ru: 'Космонавтика Вэньчана', ar: 'فضاء ونتشانغ' },
  hualiHall: { en: 'Dongfang Rosewood', zh: '东方花梨厅', id: 'Kayu Mawar Dongfang', ja: '東方花梨', ko: '둥팡 로즈우드', ru: 'Дунфанская красная древесина', ar: 'خشب الورد في دونغفانغ' },
  villageHall: { en: 'Beautiful Villages', zh: '美丽乡村厅', id: 'Desa-desa Indah', ja: '美しい農村', ko: '아름다운 농촌', ru: 'Красивые деревни', ar: 'القرى الجميلة' },
  allLayers: { en: 'All layers', zh: '全部资料层', id: 'Semua lapisan', ja: 'すべてのレイヤー', ko: '모든 레이어', ru: 'Все слои', ar: 'كل الطبقات' },
  reviewedLayer: { en: 'Reviewed sources', zh: '已核验来源', id: 'Sumber yang ditinjau', ja: '確認済み出典', ko: '검토된 출처', ru: 'Проверенные источники', ar: 'المصادر المُراجعة' },
  projectLayer: { en: 'Project context', zh: '项目策展素材', id: 'Konteks proyek', ja: 'プロジェクト文脈', ko: '프로젝트 맥락', ru: 'Контекст проекта', ar: 'سياق المشروع' },
  aiLayer: { en: 'AI curation', zh: 'AI 编排边界', id: 'Kurasi AI', ja: 'AI キュレーション', ko: 'AI 큐레이션', ru: 'Курирование ИИ', ar: 'تنسيق الذكاء الاصطناعي' },
  searchPlaceholder: { en: 'Search title, publisher, topic or record ID', zh: '搜索标题、发布者、主题或记录编号', id: 'Cari judul, penerbit, topik, atau ID catatan', ja: 'タイトル、発行者、トピック、記録IDを検索', ko: '제목, 발행자, 주제 또는 기록 ID 검색', ru: 'Поиск по названию, издателю, теме или ID записи', ar: 'ابحث عن العنوان أو الناشر أو الموضوع أو معرّف السجل' },
  recordsShown: { en: 'records shown', zh: '条记录正在显示', id: 'catatan ditampilkan', ja: '件を表示', ko: '개 기록 표시', ru: 'записей показано', ar: 'سجلات معروضة' },
  topics: { en: 'Topics', zh: '主题', id: 'Topik', ja: 'トピック', ko: '주제', ru: 'Темы', ar: 'الموضوعات' },
  recordId: { en: 'Record ID', zh: '记录编号', id: 'ID catatan', ja: '記録ID', ko: '기록 ID', ru: 'ID записи', ar: 'معرّف السجل' },
  coveredHalls: { en: 'Covered halls', zh: '覆盖展厅', id: 'Aula tercakup', ja: '対象ホール', ko: '대상 홀', ru: 'Охваченные залы', ar: 'القاعات المشمولة' },
  noMatches: { en: 'No archive records match these filters. Try another hall, layer, or keyword.', zh: '没有符合当前筛选条件的档案记录，请更换展厅、资料层或关键词。', id: 'Tidak ada catatan arsip yang cocok. Coba aula, lapisan, atau kata kunci lain.', ja: '条件に一致するアーカイブ記録がありません。ホール、レイヤー、キーワードを変更してください。', ko: '현재 필터와 일치하는 기록이 없습니다. 홀, 레이어 또는 키워드를 바꿔 보세요.', ru: 'Нет архивных записей, соответствующих фильтрам. Попробуйте другой зал, слой или ключевое слово.', ar: 'لا توجد سجلات أرشيفية مطابقة لهذه المرشحات. جرّب قاعة أو طبقة أو كلمة مفتاحية أخرى.' },
} satisfies Record<string, RuntimeLocalized>
assertLocalizationTree(sourceArchiveCopy, 'source archive interface copy')

const sourceDeskIntentCopy = {
  culturalCollaboration: { en: 'Cultural collaboration', zh: '文化合作', id: 'Kolaborasi budaya', ja: '文化協働', ko: '문화 협력', ru: 'Культурное сотрудничество', ar: 'تعاون ثقافي' },
  responsibleTravel: { en: 'Responsible travel planning', zh: '负责任的旅行规划', id: 'Perencanaan perjalanan bertanggung jawab', ja: '責任ある旅行計画', ko: '책임 있는 여행 계획', ru: 'Ответственное планирование поездки', ar: 'تخطيط سفر مسؤول' },
  craftMaterial: { en: 'Craft & material inquiry', zh: '工艺与材料咨询', id: 'Pertanyaan kerajinan dan material', ja: '工芸・素材についての問い合わせ', ko: '공예 및 재료 문의', ru: 'Вопросы о ремесле и материалах', ar: 'استفسار عن الحرف والمواد' },
  mediaPartnership: { en: 'Media partnership', zh: '媒体合作', id: 'Kemitraan media', ja: 'メディア提携', ko: '미디어 협력', ru: 'Медийное партнёрство', ar: 'شراكة إعلامية' },
  freeTradePort: { en: 'Free Trade Port orientation', zh: '自贸港信息导览', id: 'Orientasi Pelabuhan Perdagangan Bebas', ja: '自由貿易港の情報案内', ko: '자유무역항 정보 안내', ru: 'Справка о порте свободной торговли', ar: 'إرشاد حول ميناء التجارة الحرة' },
} satisfies Record<string, RuntimeLocalized>
assertLocalizationTree(sourceDeskIntentCopy, 'source desk simulation intents')

const exhibitQuestionCopy = {
  prefix: { en: 'Tell me about ', zh: '请介绍', id: 'Ceritakan tentang ', ja: 'について教えてください：', ko: '에 대해 알려 주세요: ', ru: 'Расскажите о ', ar: 'أخبرني عن ' },
  suffix: { en: '.', zh: '。', id: '.', ja: '。', ko: '.', ru: '.', ar: '.' },
  freeTradePrefix: { en: 'Tell me about ', zh: '请介绍自贸港展厅中的', id: 'Ceritakan tentang ', ja: '自由貿易港展示室の', ko: '자유무역항 전시관의 ', ru: 'Расскажите о ', ar: 'أخبرني عن ' },
  freeTradeSuffix: { en: ' in the Free Trade Port hall.', zh: '。', id: ' di aula Pelabuhan Perdagangan Bebas.', ja: '（自由貿易港展示室）。', ko: '（자유무역항 전시관）.', ru: ' в зале порта свободной торговли.', ar: ' في قاعة ميناء التجارة الحرة.' },
} satisfies Record<string, RuntimeLocalized>
assertLocalizationTree(exhibitQuestionCopy, 'exhibit question copy')

function localizedExhibitQuestion(language: Language, title: Localized, freeTrade = false) {
  const prefix = localize(freeTrade ? exhibitQuestionCopy.freeTradePrefix : exhibitQuestionCopy.prefix, language)
  const suffix = localize(freeTrade ? exhibitQuestionCopy.freeTradeSuffix : exhibitQuestionCopy.suffix, language)
  return `${prefix}${localize(title, language)}${suffix}`
}

function App() {
  const [language, setLanguage] = useState<Language>(() => readLanguagePreference())
  const [activeZone, setActiveZone] = useState(0)
  const [guideOpen, setGuideOpen] = useState(false)
  const [petVisible, setPetVisible] = useState(true)
  const [heroImageFailed, setHeroImageFailed] = useState(false)
  const [homeMuseumImageFailed, setHomeMuseumImageFailed] = useState(false)
  const [question, setQuestion] = useState('')
  const [guideMessages, setGuideMessages] = useState<GuideMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [guideServiceMode, setGuideServiceMode] = useState<'checking' | 'glm' | 'local' | 'unavailable'>('checking')
  const [tourCue, setTourCue] = useState<LuoyinTourContext | null>(null)
  const [tourCuesEnabled, setTourCuesEnabled] = useState(readTourCuePreference)
  const [autoGuideEnabled, setAutoGuideEnabled] = useState(true)
  const [autoGuideCue, setAutoGuideCue] = useState<AutoGuideView | null>(null)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'playing' | 'unavailable'>('idle')
  const [leadOpen, setLeadOpen] = useState(false)
  const [leadIntent, setLeadIntent] = useState('culture-collaboration')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadMessage, setLeadMessage] = useState('')
  const [leadName, setLeadName] = useState('')
  const [leadOrganization, setLeadOrganization] = useState('')
  const [leadConsent, setLeadConsent] = useState(false)
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [leadError, setLeadError] = useState('')
  const [leadReference, setLeadReference] = useState('')
  const [sourceDeskOpen, setSourceDeskOpen] = useState(false)
  const [sourceDeskTopic, setSourceDeskTopic] = useState('all')
  const [sourceDeskHall, setSourceDeskHall] = useState('all')
  const [sourceDeskLayerFilter, setSourceDeskLayerFilter] = useState('all')
  const [sourceDeskQuery, setSourceDeskQuery] = useState('')
  const [sourceDeskSourceId, setSourceDeskSourceId] = useState(sourceDeskEntries[0]?.id || '')
  const [sourceDeskIntent, setSourceDeskIntent] = useState('culture-collaboration')
  const [sourceDeskConsent, setSourceDeskConsent] = useState(false)
  const [sourceDeskStatus, setSourceDeskStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [sourceDeskError, setSourceDeskError] = useState('')
  const [sourceDeskReference, setSourceDeskReference] = useState('')
  const [mediaOpen, setMediaOpen] = useState(false)
  const [mediaFailed, setMediaFailed] = useState(false)
  const [introVideoOpen, setIntroVideoOpen] = useState(false)
  const [previousZone, setPreviousZone] = useState<number | null>(null)
  const [carouselFocusPaused, setCarouselFocusPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [activeNav, setActiveNav] = useState(1)
  const [exhibitionMenuOpen, setExhibitionMenuOpen] = useState(false)
  const [exploreMenuOpen, setExploreMenuOpen] = useState(false)
  const [hallNotice, setHallNotice] = useState('')
  const [activeExperience, setActiveExperience] = useState<ExperienceRoute | null>(() => experienceFromHash(window.location.hash))
  const [activeHall, setActiveHall] = useState<'tropical' | 'limiao' | 'aerospace' | 'huali' | 'village' | 'freeTradePort' | null>(() => window.location.hash === '#tropical-hall' ? 'tropical' : window.location.hash === '#limiao-hall' ? 'limiao' : window.location.hash === '#aerospace-hall' ? 'aerospace' : window.location.hash === '#huali-hall' ? 'huali' : window.location.hash === '#village-hall' ? 'village' : window.location.hash === '#free-trade-hall' ? 'freeTradePort' : null)
  const [guideZoneId, setGuideZoneId] = useState('tropical')
  const [guideZoneTitle, setGuideZoneTitle] = useState(zones[0].title)
  const exhibitionRef = useRef<HTMLElement>(null)
  const introVideoTriggerRef = useRef<HTMLButtonElement>(null)
  const carouselPointerDownRef = useRef(false)
  const guideTranscriptRef = useRef<HTMLDivElement>(null)
  const guideInputRef = useRef<HTMLInputElement>(null)
  const tourCueRef = useRef<LuoyinTourContext | null>(null)
  const tourCuesEnabledRef = useRef(tourCuesEnabled)
  // Keep tour-cue dismissals in the current React session so scrolling cannot
  // immediately re-open the same cue through the visibility observer.
  const dismissedTourCueKeysRef = useRef(new Set<string>())
  const autoGuideMatcherRef = useRef<ReturnType<typeof createWorldGuideMatcher> | null>(null)
  const autoGuideAbortRef = useRef<AbortController | null>(null)
  const lastSpokenMessageRef = useRef('')
  const speechAudioRef = useRef<HTMLAudioElement | null>(null)
  const t = copy[language]
  const guideText = (key: keyof typeof guideUiCopy) => localize(guideUiCopy[key], language)
  const guideAnswerLabel = (message: GuideMessage) => {
    if (message.mode === 'fallback' || message.mode === 'error') return guideText('offlineFallback')
    if (message.mode === 'glm') {
      if (message.answerMode === 'project_context') return guideText('glmProjectResponse')
      if (message.answerMode === 'regulated_orientation') return guideText('glmRegulatedResponse')
      if (message.answerMode === 'open_domain' || message.answerMode === 'open_domain_fallback' || message.answerMode === 'general_knowledge') return guideText('glmKnowledgeResponse')
      return guideText('glmResponse')
    }
    if (message.answerMode === 'general_knowledge' || message.answerMode === 'open_domain_fallback') return guideText('localContext')
    if (message.mode === 'local') return guideText('localContext')
    return message.layer || t.mock
  }
  const sourceText = (key: keyof typeof sourceDeskCopy) => localize(sourceDeskCopy[key], language)
  const tx = (english: string, chinese: string) => inline(language, english, chinese)
  const directionLabel = (direction: Direction) => localize(autoGuideCopy[direction], language)
  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage)
    saveLanguagePreference(nextLanguage)
  }
  const zone = zones[activeZone]
  const guideState = loading ? guideText('listening') : zone.id === 'huali' ? guideText('resonance') : zone.id === 'lijin' ? guideText('focus') : guideText('listening')
  const darkTourCue = tourCue && [
    'home-free-trade',
    'home-exhibition-wheel',
    'home-beyond-halls',
    'travel-atlas',
    'market-demo',
  ].includes(tourCue.cueId)
  const guideSurfaceTone: 'light' | 'dark' = activeHall || Boolean(activeExperience) || darkTourCue ? 'dark' : 'light'

  const leadIntents: Array<{ id: string; label: RuntimeLocalized }> = [
    { id: 'culture-collaboration', label: sourceDeskIntentCopy.culturalCollaboration },
    { id: 'responsible-travel', label: sourceDeskIntentCopy.responsibleTravel },
    { id: 'craft-material', label: sourceDeskIntentCopy.craftMaterial },
    { id: 'media-partnership', label: sourceDeskIntentCopy.mediaPartnership },
    { id: 'free-trade-port', label: sourceDeskIntentCopy.freeTradePort },
  ]
  const sourceDeskTopics: Array<{ id: string; label: RuntimeLocalized }> = [
    { id: 'all', label: sourceDeskCopy.allSources },
    { id: 'heritage', label: sourceDeskCopy.heritage },
    { id: 'aerospace', label: sourceDeskCopy.aerospace },
    { id: 'free-trade-port', label: sourceDeskCopy.freeTradePort },
  ]
  const sourceDeskHalls: Array<{ id: string; label: RuntimeLocalized }> = [
    { id: 'all', label: sourceArchiveCopy.allHalls },
    { id: 'free-trade-port', label: sourceArchiveCopy.freeTradeHall },
    { id: 'tropical', label: sourceArchiveCopy.tropicalHall },
    { id: 'lijin', label: sourceArchiveCopy.lijinHall },
    { id: 'aerospace', label: sourceArchiveCopy.aerospaceHall },
    { id: 'huali', label: sourceArchiveCopy.hualiHall },
    { id: 'village', label: sourceArchiveCopy.villageHall },
  ]
  const sourceDeskLayers: Array<{ id: string; label: RuntimeLocalized }> = [
    { id: 'all', label: sourceArchiveCopy.allLayers },
    { id: 'verified_source', label: sourceArchiveCopy.reviewedLayer },
    { id: 'service_orientation', label: sourceDeskLayerCopy.service_orientation },
    { id: 'project_context', label: sourceArchiveCopy.projectLayer },
    { id: 'ai_curation', label: sourceArchiveCopy.aiLayer },
  ]
  const sourceDeskSearch = sourceDeskQuery.trim().toLocaleLowerCase()
  const visibleSourceDeskEntries = sourceDeskEntries.filter((entry) => {
    if (entry.status !== 'reviewed') return false
    if (sourceDeskTopic !== 'all' && !entry.topics.includes(sourceDeskTopic)) return false
    if (sourceDeskHall !== 'all' && !entry.zoneIds.includes(sourceDeskHall)) return false
    if (sourceDeskLayerFilter !== 'all' && entry.displayKind !== sourceDeskLayerFilter) return false
    if (!sourceDeskSearch) return true
    const haystack = [entry.id, entry.publisher, ...entry.topics, localize(entry.title, language), localize(entry.scope, language), localize(entry.limitation, language)].join(' ').toLocaleLowerCase()
    return haystack.includes(sourceDeskSearch)
  })
  const sourceDeskLayer = (entry: SourceDeskEntry) => localize(sourceDeskLayerCopy[entry.displayKind], language)

  const switchZone = (index: number) => {
    if (index !== activeZone) setPreviousZone(activeZone)
    setActiveZone(index)
    setGuideZoneId(zones[index]?.id || 'tropical')
    setGuideZoneTitle(zones[index]?.title || zones[0].title)
    setMediaOpen(false)
    setMediaFailed(false)
  }

  // Pointer hover should not stop the wheel's ambient rotation. Keyboard focus,
  // open media, and reduced-motion preferences still pause it deliberately.
  const carouselPaused = carouselFocusPaused || mediaOpen || introVideoOpen || prefersReducedMotion

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncReducedMotion = () => setPrefersReducedMotion(mediaQuery.matches)
    syncReducedMotion()
    mediaQuery.addEventListener('change', syncReducedMotion)
    return () => mediaQuery.removeEventListener('change', syncReducedMotion)
  }, [])

  useEffect(() => {
    const meta = languageMeta[language]
    document.documentElement.lang = meta.tag
    document.documentElement.dir = meta.direction
  }, [language])

  useEffect(() => {
    const syncStoredLanguage = (event: StorageEvent) => {
      if (event.key === 'qiongverse.language' && isLanguage(event.newValue)) setLanguage(event.newValue)
    }
    window.addEventListener('storage', syncStoredLanguage)
    return () => window.removeEventListener('storage', syncStoredLanguage)
  }, [])

  useEffect(() => {
    tourCuesEnabledRef.current = tourCuesEnabled
  }, [tourCuesEnabled])

  useEffect(() => {
    const syncTourCuePreference = (event: StorageEvent) => {
      if (event.key !== tourCuePreferenceStorageKey) return
      const enabled = event.newValue !== 'disabled'
      tourCuesEnabledRef.current = enabled
      setTourCuesEnabled(enabled)
      if (!enabled) {
        tourCueRef.current = null
        setTourCue(null)
      }
    }
    window.addEventListener('storage', syncTourCuePreference)
    return () => window.removeEventListener('storage', syncTourCuePreference)
  }, [])

  useEffect(() => {
    if (activeHall || activeExperience || carouselPaused) return
    const timeout = window.setTimeout(() => switchZone((activeZone + 1) % zones.length), 2000)
    return () => window.clearTimeout(timeout)
  }, [activeHall, activeExperience, activeZone, carouselPaused])

  useEffect(() => {
    if (activeHall || activeExperience) setIntroVideoOpen(false)
  }, [activeHall, activeExperience])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // The immersive film owns Escape while it is open so dismissing it
        // cannot also close an underlying menu or reading surface.
        if (introVideoOpen) return
        setGuideOpen(false)
        setSourceDeskOpen(false)
        setMediaOpen(false)
        setExhibitionMenuOpen(false)
        setExploreMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [introVideoOpen])

  useEffect(() => {
    const syncRoute = () => {
      const experience = experienceFromHash(window.location.hash)
      setActiveExperience(experience)
      const nextHall = experience ? null : window.location.hash === '#tropical-hall' ? 'tropical' : window.location.hash === '#limiao-hall' ? 'limiao' : window.location.hash === '#aerospace-hall' ? 'aerospace' : window.location.hash === '#huali-hall' ? 'huali' : window.location.hash === '#village-hall' ? 'village' : window.location.hash === '#free-trade-hall' ? 'freeTradePort' : null
      setActiveHall(nextHall)
      if (experience || nextHall) setIntroVideoOpen(false)
      if (experience === 'travel-atlas') window.setTimeout(() => showTourCue({ page: 'travel', sectionId: 'travel-atlas', cueId: 'travel-atlas' }), 0)
      if (experience === 'market') window.setTimeout(() => showTourCue({ page: 'market', sectionId: 'market', cueId: 'market-demo' }), 0)
      if (experience === 'luoyin-tide') window.setTimeout(() => showTourCue({ page: 'shellsong', sectionId: 'luoyin-tide', cueId: 'home-beyond-halls' }), 0)
      if (nextHall) window.setTimeout(() => showTourCue({ page: 'hall', sectionId: window.location.hash.slice(1), cueId: 'hall-orientation', zoneId: nextHall === 'freeTradePort' ? 'free-trade-port' : nextHall }), 0)
      setExhibitionMenuOpen(false)
      setExploreMenuOpen(false)
    }
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    const stops = Array.from(document.querySelectorAll<HTMLElement>('[data-luoyin-tour-cue]'))
    if (!stops.length) return
    if (!('IntersectionObserver' in window)) {
      const first = stops[0]
      const cueId = first.dataset.luoyinTourCue
      if (cueId) showTourCue({ page: (first.dataset.luoyinTourPage as LuoyinTourContext['page']) || 'home', sectionId: first.id, cueId, zoneId: first.dataset.luoyinTourZone })
      return
    }
    const syncVisibleCue = () => {
      const candidates: Array<{ context: LuoyinTourContext; ratio: number }> = []
      stops.forEach((node) => {
        const bounds = node.getBoundingClientRect()
        const visibleHeight = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0))
        const ratio = visibleHeight / Math.max(1, bounds.height)
        const cueId = node.dataset.luoyinTourCue
        if (cueId && ratio >= .35) candidates.push({ context: { page: (node.dataset.luoyinTourPage as LuoyinTourContext['page']) || 'home', sectionId: node.id, cueId, zoneId: node.dataset.luoyinTourZone }, ratio })
      })
      const next = candidates.sort((a, b) => b.ratio - a.ratio)[0]?.context || null
      if (!next) {
        if (tourCueRef.current) {
          tourCueRef.current = null
          setTourCue(null)
        }
        return
      }
      showTourCue(next)
    }
    let frame = 0
    const scheduleSync = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        syncVisibleCue()
      })
    }
    const observer = new IntersectionObserver(scheduleSync, { threshold: [0, .35, .6] })
    stops.forEach((stop) => observer.observe(stop))
    window.addEventListener('scroll', scheduleSync, { passive: true })
    window.addEventListener('resize', scheduleSync)
    scheduleSync()
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', scheduleSync)
      window.removeEventListener('resize', scheduleSync)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [activeExperience, activeHall, language])

  useEffect(() => {
    if (!activeHall) return
    showTourCue({ page: 'hall', sectionId: `${activeHall}-entry`, cueId: 'hall-orientation', zoneId: activeHall === 'freeTradePort' ? 'free-trade-port' : activeHall })
    const matcher = createWorldGuideMatcher()
    autoGuideMatcherRef.current = matcher
    const onWorldMove = (event: Event) => {
      if (!autoGuideEnabled || guideOpen || document.querySelector('[role="dialog"], [aria-modal="true"]')) return
      const detail = (event as CustomEvent<LuoyinWorldMoveDetail>).detail
      if (!detail?.position || !detail.cameraPosition || !detail.forward) return
      const match = matcher.evaluate(worldGuideZoneId(activeHall), detail)
      if (match) void requestAutoGuide(match)
    }
    window.addEventListener('luoyin-world-move', onWorldMove)
    return () => {
      window.removeEventListener('luoyin-world-move', onWorldMove)
      matcher.reset()
      if (autoGuideMatcherRef.current === matcher) autoGuideMatcherRef.current = null
      autoGuideAbortRef.current?.abort()
      setAutoGuideCue(null)
    }
  }, [activeHall, autoGuideEnabled, guideOpen])

  useEffect(() => {
    if (!activeExperience) return
    let frame = 0
    let attempts = 0
    const focusRouteHeading = () => {
      const target = document.querySelector<HTMLElement>('[data-experience-main] h1, #market-main h1')
      if (!target && attempts++ < 24) {
        frame = window.requestAnimationFrame(focusRouteHeading)
        return
      }
      if (!target) return
      target.tabIndex = -1
      target.focus({ preventScroll: true })
    }
    frame = window.requestAnimationFrame(focusRouteHeading)
    return () => window.cancelAnimationFrame(frame)
  }, [activeExperience])

  useEffect(() => {
    const transcript = guideTranscriptRef.current
    if (transcript) transcript.scrollTop = transcript.scrollHeight
  }, [guideMessages, loading])

  const stopSpeech = () => {
    speechAudioRef.current?.pause()
    speechAudioRef.current = null
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeechStatus('idle')
  }

  const speakWithBrowserFallback = (text: string) => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setSpeechStatus('unavailable')
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = languageMeta[language].tag
    utterance.onend = () => setSpeechStatus('idle')
    utterance.onerror = () => setSpeechStatus('unavailable')
    setSpeechStatus('playing')
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const playSpeechSegments = (segments: SpeechSegment[]) => {
    stopSpeech()
    if (!segments.length) {
      setSpeechStatus('unavailable')
      return
    }
    let index = 0
    setSpeechStatus('playing')
    const playNext = () => {
      const segment = segments[index]
      if (!segment) {
        setSpeechStatus('idle')
        return
      }
      const audio = new Audio(`data:${segment.mimeType};base64,${segment.data}`)
      speechAudioRef.current = audio
      audio.onended = () => { index += 1; playNext() }
      audio.onerror = () => { speechAudioRef.current = null; setSpeechStatus('unavailable') }
      void audio.play().catch(() => { speechAudioRef.current = null; setSpeechStatus('unavailable') })
    }
    playNext()
  }

  useEffect(() => {
    if (!speechEnabled) return
    const latest = [...guideMessages].reverse().find((message) => message.role === 'guide')
    if (!latest || latest.id === lastSpokenMessageRef.current) return
    lastSpokenMessageRef.current = latest.id
    const segments = latest.speech?.status === 'ready' ? latest.speech.segments || [] : []
    if (!segments.length) {
      setSpeechStatus('unavailable')
      return
    }
    playSpeechSegments(segments)
  }, [guideMessages, speechEnabled, language])

  useEffect(() => () => stopSpeech(), [activeExperience, activeHall])

  useEffect(() => {
    if (!guideOpen) return
    let active = true
    setGuideServiceMode('checking')
    fetch(apiPath('/api/luoyin/status'))
      .then(async (response) => {
        if (!response.ok) throw new Error('guide_status_unavailable')
        return response.json() as Promise<{ upstreamConfigured?: boolean; ttsConfigured?: boolean }>
      })
      .then((status) => {
        if (active) setGuideServiceMode(status.upstreamConfigured ? 'glm' : 'local')
      })
      .catch(() => {
        if (active) setGuideServiceMode('unavailable')
      })
    return () => { active = false }
  }, [guideOpen])

  const moveZone = (direction: number) => {
    const next = (activeZone + direction + zones.length) % zones.length
    switchZone(next)
    window.setTimeout(() => document.getElementById(`zone-tab-${next}`)?.focus(), 0)
  }

  const scrollToTarget = (targetId: string, navIndex: number, zoneIndex?: number) => {
    if (typeof zoneIndex === 'number') switchZone(zoneIndex)
    setActiveNav(navIndex)
    const target = document.getElementById(targetId)
    if (!target) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - 78), behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const openLimiaoHall = () => {
    setActiveZone(1)
    setExhibitionMenuOpen(false)
    window.location.hash = 'limiao-hall'
    setActiveHall('limiao')
  }

  const openTropicalHall = () => {
    setActiveZone(0)
    setExhibitionMenuOpen(false)
    window.location.hash = 'tropical-hall'
    setActiveHall('tropical')
  }

  const openAerospaceHall = () => {
    setActiveZone(2)
    setExhibitionMenuOpen(false)
    window.location.hash = 'aerospace-hall'
    setActiveHall('aerospace')
  }

  const openHualiHall = () => {
    setActiveZone(3)
    setExhibitionMenuOpen(false)
    window.location.hash = 'huali-hall'
    setActiveHall('huali')
  }

  const openVillageHall = () => {
    setActiveZone(4)
    setExhibitionMenuOpen(false)
    window.location.hash = 'village-hall'
    setActiveHall('village')
  }

  const openFreeTradePortHall = () => {
    setExhibitionMenuOpen(false)
    setGuideZoneId('free-trade-port')
    setGuideZoneTitle({ en: 'Free Trade Port', zh: '自贸港' })
    window.location.hash = 'free-trade-hall'
    setActiveHall('freeTradePort')
  }

  const openExperience = (route: ExperienceRoute) => {
    setExhibitionMenuOpen(false)
    setExploreMenuOpen(false)
    setIntroVideoOpen(false)
    setActiveExperience(route)
    window.location.hash = route
  }

  const homeExperienceCards: HomeExperienceCard[] = [
    {
      id: 'travel',
      title: homeExperienceCopy.travelTitle,
      body: homeExperienceCopy.travelBody,
      label: homeExperienceCopy.travelLabel,
      action: homeExperienceCopy.travelAction,
      image: '/assets/travel/hainan-unfolded-poster.jpg',
      onOpen: () => openExperience('travel-atlas'),
    },
    {
      id: 'shellsong',
      title: homeExperienceCopy.shellsongTitle,
      body: homeExperienceCopy.shellsongBody,
      label: homeExperienceCopy.shellsongMeta,
      action: homeExperienceCopy.shellsongAction,
      image: '/shellsong/hero-poster.jpg',
      onOpen: () => openExperience('luoyin-tide'),
    },
    {
      id: 'market',
      title: homeExperienceCopy.marketTitle,
      body: homeExperienceCopy.marketBody,
      label: homeExperienceCopy.marketMeta,
      action: homeExperienceCopy.marketAction,
      image: '/assets/demo-market/hero/blind-box-turntable.png',
      onOpen: () => openExperience('market'),
    },
  ]

  const exitExperience = () => {
    setActiveExperience(null)
    window.location.hash = 'top'
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0)
  }

  const openGuideChat = () => {
    setIntroVideoOpen(false)
    setPetVisible(true)
    setGuideOpen(true)
  }

  const openIntroVideo = () => {
    stopSpeech()
    autoGuideAbortRef.current?.abort()
    setAutoGuideCue(null)
    setGuideOpen(false)
    setSourceDeskOpen(false)
    setLeadOpen(false)
    setMediaOpen(false)
    setIntroVideoOpen(true)
  }

  const closeIntroVideo = () => {
    setIntroVideoOpen(false)
  }

  const autoGuideApiZone = (zoneId: string) => zoneId === 'freeTradePort' ? 'free-trade-port' : zoneId === 'limiao' ? 'lijin' : zoneId

  const requestAutoGuide = async (match: WorldGuideMatch) => {
    if (!autoGuideEnabled || guideOpen) return
    autoGuideAbortRef.current?.abort()
    const controller = new AbortController()
    autoGuideAbortRef.current = controller
    const apiZoneId = autoGuideApiZone(match.cue.zoneId)
    const localText = localize(match.cue.localIntro, language)
    const title = worldGuideTitle(match.cue, language)
    setAutoGuideCue({ cueId: match.cue.id, zoneId: apiZoneId, question: worldGuideQuestion(match.cue, language), title: `${title} · ${directionLabel(match.direction)}`, text: localText, direction: match.direction, sourceLabel: inline(language, 'Project context', '项目语境'), sourceStatus: 'local' })
    try {
      const response = await fetch(apiPath('/api/luoyin/auto-guide'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cueId: match.cue.id, zoneId: apiZoneId, language, speak: speechEnabled }), signal: controller.signal })
      const payload = await response.json() as { answer?: string; title?: string; sourceLabel?: string; sourceStatus?: string; speech?: GuideMessage['speech'] }
      if (!response.ok || !payload.answer) throw new Error('auto_guide_unavailable')
      setAutoGuideCue((current) => current?.cueId === match.cue.id ? { ...current, text: payload.answer || localText, answer: payload.answer, sourceLabel: payload.sourceLabel, sourceStatus: payload.sourceStatus } : current)
      if (speechEnabled) void speakTextNow(payload.answer)
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      setAutoGuideCue((current) => current?.cueId === match.cue.id ? { ...current, text: localText, sourceLabel: inline(language, 'Local project context', '本地项目语境'), sourceStatus: 'local' } : current)
    }
  }

  const openAutoGuide = (view: AutoGuideView) => {
    const cue = luoyinWorldCues.find((item) => item.id === view.cueId)
    if (!cue) return
    setGuideZoneId(view.zoneId)
    setGuideZoneTitle(cue.title)
    setQuestion(worldGuideQuestion(cue, language))
    if (view.answer) {
      setGuideMessages((messages) => [...messages, { id: `auto-guide-${Date.now()}`, role: 'guide' as const, text: view.answer || view.text, zoneTitle: worldGuideTitle(cue, language), layer: 'automatic world guide', sourceLabel: view.sourceLabel, sourceStatus: view.sourceStatus, mode: 'local' as const }].slice(-24))
    }
    setAutoGuideCue(null)
    openGuideChat()
  }

  const dismissAutoGuide = () => {
    autoGuideAbortRef.current?.abort()
    setAutoGuideCue(null)
    setAutoGuideEnabled(false)
  }

  const toggleAutoGuide = () => {
    setAutoGuideEnabled((enabled) => {
      if (enabled) {
        autoGuideAbortRef.current?.abort()
        setAutoGuideCue(null)
      }
      return !enabled
    })
  }

  const toggleTourCues = () => {
    const enabled = !tourCuesEnabledRef.current
    tourCuesEnabledRef.current = enabled
    setTourCuesEnabled(enabled)
    saveTourCuePreference(enabled)
    if (enabled) {
      dismissedTourCueKeysRef.current.clear()
      window.requestAnimationFrame(() => window.dispatchEvent(new Event('scroll')))
    } else {
      tourCueRef.current = null
      setTourCue(null)
    }
  }

  const showTourCue = (context: LuoyinTourContext) => {
    if (!tourCuesEnabledRef.current) return
    const key = `${context.page}:${context.sectionId}:${context.cueId}`
    if (dismissedTourCueKeysRef.current.has(key)) return
    const current = tourCueRef.current
    if (current?.cueId === context.cueId && current.sectionId === context.sectionId && current.page === context.page) return
    tourCueRef.current = context
    setTourCue(context)
  }

  const openTourCue = (context: LuoyinTourContext) => {
    const cue = findTourCue(context.cueId)
    if (!cue) return
    const copy = tourCueText(cue, language)
    setGuideZoneId(context.zoneId || cue.id)
    setGuideZoneTitle(cue.title)
    setQuestion(copy.question)
    setTourCue(null)
    openGuideChat()
  }

  const dismissTourCue = () => {
    const current = tourCueRef.current
    if (current) dismissedTourCueKeysRef.current.add(`${current.page}:${current.sectionId}:${current.cueId}`)
    tourCuesEnabledRef.current = false
    setTourCuesEnabled(false)
    saveTourCuePreference(false)
    tourCueRef.current = null
    setTourCue(null)
  }

  const closeGuideChat = () => {
    setGuideOpen(false)
    window.setTimeout(() => document.querySelector<HTMLButtonElement>('[data-luoyin-pet-toggle]')?.focus(), 0)
  }

  const closeGuidePet = () => {
    setGuideOpen(false)
    setPetVisible(false)
    autoGuideAbortRef.current?.abort()
    setAutoGuideCue(null)
    setAutoGuideEnabled(false)
  }

  const toggleSpeech = () => {
    setSpeechEnabled((enabled) => {
      if (enabled) {
        stopSpeech()
        return false
      }
      lastSpokenMessageRef.current = ''
      return true
    })
  }

  const speakTextNow = async (text: string) => {
    stopSpeech()
    if (!text.trim()) return
    try {
      const response = await fetch(apiPath('/api/luoyin/tts'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, locale: language }) })
      const payload = await response.json() as { status?: 'ready' | 'unavailable'; segments?: SpeechSegment[] }
      if (!response.ok || payload.status !== 'ready' || !payload.segments?.length) {
        speakWithBrowserFallback(text)
        return
      }
      playSpeechSegments(payload.segments)
    } catch {
      speakWithBrowserFallback(text)
    }
  }

  const openTideHall = (themeId: string) => {
    if (themeId === 'tropical') return openTropicalHall()
    if (themeId === 'lijin') return openLimiaoHall()
    if (themeId === 'aerospace') return openAerospaceHall()
    if (themeId === 'huali') return openHualiHall()
    if (themeId === 'village') return openVillageHall()
    openFreeTradePortHall()
  }

  const openTideGuide = (themeId: string) => {
    const matchingZone = zones.find((item) => item.id === themeId)
    setGuideZoneId(themeId)
    setGuideZoneTitle(matchingZone?.title || { en: 'Free Trade Port', zh: '自贸港' })
    setQuestion(language === 'en' ? `Tell me about ${matchingZone?.title.en || 'the Free Trade Port'}.` : `请介绍${matchingZone?.title.zh || '自贸港'}。`)
    openGuideChat()
  }

  const openZoneHall = (index: number) => {
    setExhibitionMenuOpen(false)
    if (zones[index]?.id === 'tropical') {
      openTropicalHall()
      return
    }
    if (zones[index]?.id === 'lijin') {
      openLimiaoHall()
      return
    }
    if (zones[index]?.id === 'aerospace') {
      openAerospaceHall()
      return
    }
    if (zones[index]?.id === 'huali') {
      openHualiHall()
      return
    }
    if (zones[index]?.id === 'village') {
      openVillageHall()
      return
    }
    const message = language === 'en' ? `${zones[index]?.title.en || 'This hall'} is in development.` : `${zones[index]?.title.zh || '该展厅'}正在开发中。`
    setHallNotice(message)
    window.setTimeout(() => setHallNotice(''), 3200)
  }

  const exitHall = (zoneIndex: number) => {
    window.location.hash = 'exhibition'
    setActiveHall(null)
    window.setTimeout(() => scrollToTarget('exhibition', 1, zoneIndex), 0)
  }

  const submitQuestion = async () => {
    const trimmed = question.trim()
    if (!trimmed || loading) return
    setLoading(true)
    const visitorMessage: GuideMessage = { id: `visitor-${Date.now()}`, role: 'visitor', text: trimmed, zoneTitle: localize(zone.title, language) }
    setGuideMessages((messages) => [...messages, visitorMessage].slice(-24))
    let completed = false
    try {
      const response = await fetch(apiPath('/api/luoyin'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question: trimmed, language, zoneId: guideZoneId, speak: speechEnabled }) })
      const payload = await response.json() as { answer?: string; answerMode?: string; layer?: string; sourceLabel?: string; sourceUrl?: string | null; sourceClass?: string; sourceStatus?: string; handoff?: boolean; mode?: 'local' | 'mock' | 'glm' | 'fallback'; speech?: GuideMessage['speech'] }
      if (!payload.answer) throw new Error('empty_response')
      const guideMessage: GuideMessage = { id: `guide-${Date.now()}`, role: 'guide', text: payload.answer || '', zoneTitle: localize(guideZoneTitle, language), layer: payload.layer || 'local_contextual_guide', sourceLabel: payload.sourceLabel || inline(language, 'Local contextual guide', '本地语境导览'), sourceUrl: payload.sourceUrl || null, sourceClass: payload.sourceClass || '', sourceStatus: payload.sourceStatus || '', answerMode: payload.answerMode || '', mode: payload.mode === 'glm' ? 'glm' : payload.mode === 'fallback' ? 'fallback' : payload.mode === 'local' ? 'local' : 'mock', speech: payload.speech }
      setGuideMessages((messages) => [...messages, guideMessage].slice(-24))
      completed = true
    } catch {
      const fallbackText = guideZoneId === 'free-trade-port'
        ? freeTradeOfflineReply[language]
        : localize(zone.guide, language)
      const fallbackMessage: GuideMessage = { id: `fallback-${Date.now()}`, role: 'guide', text: fallbackText, zoneTitle: localize(guideZoneTitle, language), layer: inline(language, 'offline fallback', '离线本地回退'), sourceLabel: inline(language, 'Offline local fallback', '离线本地回退'), sourceClass: 'ai_suggestion', sourceStatus: 'blocked', mode: 'error' }
      setGuideMessages((messages) => [...messages, fallbackMessage].slice(-24))
    } finally {
      setLoading(false)
      if (completed) setQuestion('')
      window.setTimeout(() => guideInputRef.current?.focus(), 0)
    }
  }

  const submitLead = async () => {
    if (leadStatus === 'sending' || !leadConsent) return
    setLeadStatus('sending')
    setLeadError('')
    try {
      const response = await fetch(apiPath('/api/leads'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ intentId: leadIntent, email: leadEmail.trim(), message: leadMessage.trim(), name: leadName.trim() || undefined, organization: leadOrganization.trim() || undefined, consent: leadConsent, language }) })
      const payload = await response.json() as { accepted?: boolean; reference?: string; error?: string }
      if (!response.ok || !payload.accepted) throw new Error(payload.error || 'lead_unavailable')
      setLeadReference(payload.reference || '')
      setLeadStatus('success')
    } catch (error) {
      setLeadError(error instanceof Error && error.message === 'invalid_email' ? (language === 'en' ? 'Enter a valid email address.' : '请输入有效的电子邮箱。') : language === 'en' ? 'No request was sent. Check the fields and try again.' : '未发送请求，请检查字段后重试。')
      setLeadStatus('error')
    }
  }

  const resetLead = () => {
    setLeadStatus('idle')
    setLeadError('')
    setLeadReference('')
    setLeadEmail('')
    setLeadMessage('')
    setLeadName('')
    setLeadOrganization('')
    setLeadConsent(false)
  }

  const openSourceDesk = () => {
    setSourceDeskStatus('idle')
    setSourceDeskError('')
    setSourceDeskReference('')
    setSourceDeskConsent(false)
    setSourceDeskOpen(true)
  }

  const submitSourceDeskHandoff = async () => {
    if (sourceDeskStatus === 'sending' || !sourceDeskConsent || !sourceDeskSourceId) return
    setSourceDeskStatus('sending')
    setSourceDeskError('')
    try {
      const response = await fetch(apiPath('/api/operations/handoff'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceId: sourceDeskSourceId, intentId: sourceDeskIntent, language, consent: sourceDeskConsent }),
      })
      const payload = await response.json() as { accepted?: boolean; mode?: string; reference?: string; error?: string }
      if (!response.ok || !payload.accepted || payload.mode !== 'simulation') throw new Error(payload.error || 'handoff_unavailable')
      setSourceDeskReference(payload.reference || '')
      setSourceDeskStatus('success')
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'handoff_unavailable'
      setSourceDeskError(reason === 'consent_required' ? (language === 'en' ? 'Consent is required before a simulation can run.' : '运行模拟交接前需要明确同意。') : language === 'en' ? 'The local simulation was not completed. No institution was contacted.' : '本地模拟未完成，未联系任何真实机构。')
      setSourceDeskStatus('error')
    }
  }

  const zoneMeta = useMemo(() => `${zone.index} / 05`, [zone.index])
  const guideBlocked = sourceDeskOpen || leadOpen || mediaOpen || introVideoOpen
  const activeTourCue = tourCue ? findTourCue(tourCue.cueId) : null
  const activeTourCopy = activeTourCue ? tourCueText(activeTourCue, language) : null

  return <div className={activeHall === 'tropical' ? 'site-shell tropical-route-active' : activeHall === null && activeExperience === null ? 'site-shell home-museum-shell home-restructured' : 'site-shell'}>
    {activeExperience === 'luoyin-tide' && <Suspense fallback={<main className="tide-route-loading">{localize(appLoadingCopy.shellsong, language)}</main>}><LuoyinTidePage language={language} onChangeLanguage={changeLanguage} onExit={exitExperience} onOpenHall={openTideHall} onAskLuoyin={openTideGuide} /></Suspense>}
    {activeExperience === 'travel-atlas' && <Suspense fallback={<main className="travel-atlas-loading">{localize(appLoadingCopy.travel, language)}</main>}><TravelAtlas language={language} onChangeLanguage={changeLanguage} onExit={exitExperience} apiPath={apiPath} /></Suspense>}
    {activeExperience === 'market' && <Suspense fallback={<main className="market-loading">{localize(appLoadingCopy.market, language)}</main>}><TradePage language={language} onChangeLanguage={changeLanguage} onExit={exitExperience} onOpenGuide={openGuideChat} /></Suspense>}
    {!activeExperience && <>
    {activeHall === 'tropical' && <Suspense fallback={<main className="tropical-loading">{localize(appLoadingCopy.tropical, language)}</main>}><TropicalImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(0)} onOpenGuide={(exhibit) => { setActiveZone(0); setQuestion(localizedExhibitQuestion(language, exhibit.title)); openGuideChat() }} /></Suspense>}
    {activeHall === 'limiao' ? <Suspense fallback={<main className="limiao-loading">{localize(appLoadingCopy.limiao, language)}</main>}><LiMiaoImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(1)} onOpenGuide={(exhibit) => { setActiveZone(1); setQuestion(localizedExhibitQuestion(language, exhibit.title)); openGuideChat() }} /></Suspense> : activeHall === 'aerospace' ? <Suspense fallback={<main className="aerospace-loading">{localize(appLoadingCopy.aerospace, language)}</main>}><AerospaceImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(2)} onOpenGuide={(exhibit) => { setActiveZone(2); setQuestion(localizedExhibitQuestion(language, exhibit.title)); openGuideChat() }} /></Suspense> : activeHall === 'huali' ? <Suspense fallback={<main className="huali-loading">{localize(appLoadingCopy.huali, language)}</main>}><HualiImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(3)} onOpenGuide={(exhibit) => { setActiveZone(3); setQuestion(localizedExhibitQuestion(language, exhibit.title)); openGuideChat() }} /></Suspense> : activeHall === 'village' ? <Suspense fallback={<main className="village-loading">{localize(appLoadingCopy.village, language)}</main>}><VillageImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(4)} onOpenGuide={(exhibit) => { setActiveZone(4); setQuestion(localizedExhibitQuestion(language, exhibit.title)); openGuideChat() }} /></Suspense> : activeHall === 'freeTradePort' ? <Suspense fallback={<main className="ftp-loading">{localize(appLoadingCopy.freeTradePort, language)}</main>}><FreeTradePortImmersiveHall language={language} onChangeLanguage={changeLanguage} onExit={() => exitHall(0)} onOpenGuide={(exhibit) => { setGuideZoneId('free-trade-port'); setGuideZoneTitle({ en: 'Free Trade Port', zh: '自贸港' }); setQuestion(localizedExhibitQuestion(language, exhibit.title, true)); openGuideChat() }} /></Suspense> : <>
    <header className="site-header">
      <BrandLockup />
      <nav className="desktop-nav" aria-label={inline(language, 'Primary navigation', '主导航')}>
        <a className={activeNav === 0 ? 'nav-link active' : 'nav-link'} href="#top" onClick={(event) => { event.preventDefault(); setExhibitionMenuOpen(false); scrollToTarget('top', 0) }}>{t.nav[0]}</a>
        <div className="nav-menu-wrap">
          <button className={activeNav === 1 ? 'nav-link nav-menu-trigger active' : 'nav-link nav-menu-trigger'} type="button" aria-haspopup="true" aria-expanded={exhibitionMenuOpen} aria-controls="exhibition-menu" onClick={() => setExhibitionMenuOpen((open) => !open)}>{t.nav[1]}<span className="menu-caret" aria-hidden="true">⌄</span></button>
          {exhibitionMenuOpen && <>
            <button className="nav-menu-backdrop" aria-label={t.menuLabel} onClick={() => setExhibitionMenuOpen(false)} />
            <div id="exhibition-menu" className="nav-menu" role="menu" aria-label={t.nav[1]}>
              <a className="nav-menu-main-hall" href="#free-trade-hall" role="menuitem" onClick={(event) => { event.preventDefault(); openFreeTradePortHall() }}><span>◎</span>{inline(language, 'Free Trade Port Main Hall', '自贸港主厅')}<b aria-hidden="true">↗</b></a>
              {zones.map((item, index) => <a key={item.id} href={item.id === 'tropical' ? '#tropical-hall' : item.id === 'lijin' ? '#limiao-hall' : item.id === 'aerospace' ? '#aerospace-hall' : item.id === 'huali' ? '#huali-hall' : item.id === 'village' ? '#village-hall' : '#exhibition'} role="menuitem" onClick={(event) => { event.preventDefault(); openZoneHall(index) }}><span>{item.index}</span>{item.title[language]}</a>)}
            </div>
          </>}
        </div>
        <a className={activeNav === 2 ? 'nav-link active' : 'nav-link'} href="#hainan-map" onClick={(event) => { event.preventDefault(); setExhibitionMenuOpen(false); window.location.hash = 'hainan-map'; scrollToTarget('hainan-map', 2) }}>{inline(language, 'Hainan Map', '海南地图')}</a>
        <button className="nav-link nav-experience-link" type="button" onClick={() => openExperience('travel-atlas')}>{inline(language, 'Travel', '旅行')}</button>
        <button className="nav-link nav-experience-link" type="button" onClick={() => openExperience('market')}>{inline(language, 'Market', '商品')}</button>
        <button className="nav-link nav-experience-link" type="button" onClick={() => openExperience('luoyin-tide')}>{inline(language, 'ShellSong', '螺音')}</button>
        <button className="nav-link nav-archive-trigger" type="button" onClick={() => { setExhibitionMenuOpen(false); openSourceDesk() }} aria-haspopup="dialog">{inline(language, 'Archive', '档案馆')}</button>
      </nav>
      <div className="header-actions">
        <button className="mobile-archive-trigger" type="button" onClick={() => { setExhibitionMenuOpen(false); openSourceDesk() }} aria-label={inline(language, 'Open verified source desk', '打开已核验来源服务台')} aria-haspopup="dialog"><span aria-hidden="true">□</span></button>
        <div className="mobile-experience-wrap">
          <button className="mobile-experience-trigger" type="button" aria-label={inline(language, 'Open experience menu', '打开体验菜单')} aria-expanded={exploreMenuOpen} aria-controls="mobile-experience-menu" onClick={() => setExploreMenuOpen((open) => !open)}><span aria-hidden="true">◇</span></button>
          {exploreMenuOpen && <div id="mobile-experience-menu" className="mobile-experience-menu" role="menu" aria-label={inline(language, 'Explore experiences', '探索体验')}>
            <button type="button" role="menuitem" onClick={() => openExperience('luoyin-tide')}>{inline(language, 'ShellSong / Luoyin', '螺音 / ShellSong')}</button>
            <button type="button" role="menuitem" onClick={() => openExperience('travel-atlas')}>{inline(language, 'Travel / Hainan Unfolded', '旅行 / 海南图鉴')}</button>
            <button type="button" role="menuitem" onClick={() => openExperience('market')}>{inline(language, 'Market / Project Demo', '商品 / 项目演示')}</button>
            <button type="button" role="menuitem" onClick={() => { setExploreMenuOpen(false); window.location.hash = 'hainan-map'; scrollToTarget('hainan-map', 2) }}>{inline(language, 'Hainan Map', '海南地图')}</button>
          </div>}
        </div>
        <LanguageSelector language={language} onChange={changeLanguage} className="language-toggle" />
        <button className="guide-trigger" onClick={openGuideChat} aria-label={t.open}>◎ <span>Luoyin</span></button>
      </div>
    </header>

    <main id="top">
      <section className={heroImageFailed ? 'hero hero-dawn is-fallback' : 'hero hero-dawn'} aria-labelledby="hero-title">
        <div className="hero-media">
          {!heroImageFailed && <picture><source type="image/webp" srcSet="/assets/hero/qiongverse-hero2.webp" /><img src="/assets/hero/qiongverse-hero2.jpg" width="1932" height="1280" fetchPriority="high" decoding="async" alt="Project-supplied QIONGVERSE brand visual with a tropical coastline, star orbit and Hainan city horizon" onError={() => setHeroImageFailed(true)} /></picture>}
        </div>
        <div className="hero-shade" />
        <div className="hero-content">
          <h1 id="hero-title" className="brand-sr-only">HAINAN QIONGVERSE</h1>
          <HomeHeroOverview language={language} onExploreHalls={() => scrollToTarget('exhibition', 1)} onAskLuoyin={openGuideChat} onOpenIntroVideo={openIntroVideo} introVideoTriggerRef={introVideoTriggerRef} />
        </div>
      </section>

      <div className="home-museum-hero-separator" aria-hidden="true">
        <span>QIONGVERSE / ARCHIVE</span>
        <i />
        <b>01</b>
      </div>

      <div className="home-museum-content">
        {!homeMuseumImageFailed && <img className="home-museum-content-art" src="/assets/home-backgrounds/museum-home-scroll.png" width="943" height="1676" decoding="async" alt="" aria-hidden="true" onError={() => setHomeMuseumImageFailed(true)} />}

        {false && <section className="intro-band" aria-label="Exhibition introduction">
        <div className="intro-quote">“The sea has a memory,<br /><em>and wood remembers in rings.</em>”</div>
        <div className="intro-detail"><span className="mono-label">SHELLSONG / FIELD NOTE 001</span><p>Luoyin translates the island through sound, light and small acts of attention. This is a fictional guide layer inside a real, supplied visual archive.</p></div>
        </section>}

      <section className="free-trade-portal home-museum-chapter home-museum-chapter--portal" id="free-trade-main-hall" aria-labelledby="free-trade-portal-title" data-museum-chapter="portal" data-luoyin-tour-cue="home-free-trade" data-luoyin-tour-page="home" data-luoyin-tour-zone="free-trade-port">
        <div className="home-restructured-chapter-heading" aria-hidden="true"><span>01 / 06</span><i /><small>{localize(homeMuseumChapterCopy.portal, language)}</small></div>
        <div className="free-trade-portal-layout">
          <div className="free-trade-portal-index" aria-hidden="true"><strong>05</strong><i /><span>HFTP<br />SOURCE<br />ROOM</span></div>
          <div className="free-trade-portal-copy">
            <p className="eyebrow">{tx('HAINAN PROVINCE / PUBLIC READING', '海南省 / 公共阅览')}</p>
            <h2 id="free-trade-portal-title"><span>{tx('Free Trade', '自贸港')}</span><span>{tx('Port Main', '主')}&nbsp;<em>{tx('Hall', '展厅')}</em></span></h2>
            <p className="free-trade-portal-deck">{tx('A public reading entrance for checking current Hainan Free Trade Port information through reviewed official sources.', '面向公众的阅读入口，通过已核验的官方来源了解当前海南自由贸易港信息。')}</p>
            <div className="free-trade-portal-actions"><a className="primary-button" href="#free-trade-hall" onClick={(event) => { event.preventDefault(); openFreeTradePortHall() }}>{tx('Enter main hall', '进入主展厅')} <span>↗</span></a><a className="free-trade-portal-source" href="https://en.hnftp.gov.cn/" target="_blank" rel="noopener noreferrer">{tx('Open official English portal', '打开英文官方门户')} <span>↗</span></a></div>
            <small>{tx('For current notices and policy materials, verify details on the official English portal. This project does not determine eligibility or commercial outcomes.', '当前通知与政策资料请以英文官方门户为准；本项目不判断资格或商业结果。')}</small>
          </div>
          <div className="free-trade-portal-coordinate" aria-hidden="true"><span>HAINAN / 19.5 N</span><i /><b>∞</b></div>
        </div>
      </section>

      <section className="exhibition home-museum-chapter home-museum-chapter--wheel" id="exhibition" ref={exhibitionRef} aria-label={inline(language, 'Five immersive halls', '五个沉浸展厅')} data-museum-chapter="halls" data-luoyin-tour-cue="home-exhibition-wheel" data-luoyin-tour-page="home" onPointerDown={() => { carouselPointerDownRef.current = true; setCarouselFocusPaused(false) }} onPointerUp={() => { carouselPointerDownRef.current = false }} onFocusCapture={() => { if (!carouselPointerDownRef.current) setCarouselFocusPaused(true) }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCarouselFocusPaused(false) }}>
        <div className="home-restructured-chapter-heading home-restructured-chapter-heading--light" aria-hidden="true"><span>02 / 06</span><i /><small>{localize(homeMuseumChapterCopy.halls, language)}</small></div>
        <div className={`hall-visual-stage ${zone.tone}`} id={`zone-panel-${activeZone}`} role="tabpanel" aria-labelledby={`zone-tab-${activeZone}`}>
          <button className="zone-visual-enter" type="button" onClick={() => openZoneHall(activeZone)} aria-label={`${inline(language, 'Enter', '进入')} ${zone.title[language]}`}>
            {previousZone !== null && previousZone !== activeZone && <picture className="zone-visual-image zone-visual-image--previous"><source type="image/webp" media="(max-width: 700px)" srcSet={deliveryImage(zones[previousZone].mobileImage)} /><source media="(max-width: 700px)" srcSet={zones[previousZone].mobileImage} /><source type="image/webp" srcSet={deliveryImage(zones[previousZone].image)} /><img src={zones[previousZone].image} loading="lazy" decoding="async" alt="" aria-hidden="true" /></picture>}
            <picture className="zone-visual-image zone-visual-image--current" key={zone.id}><source type="image/webp" media="(max-width: 700px)" srcSet={deliveryImage(zone.mobileImage)} /><source media="(max-width: 700px)" srcSet={zone.mobileImage} /><source type="image/webp" srcSet={deliveryImage(zone.image)} /><img src={zone.image} loading="lazy" decoding="async" alt="" onError={(event) => { event.currentTarget.src = zone.poster }} /></picture>
            <span className="zone-visual-shade" aria-hidden="true" />
            <span className="zone-visual-label"><span>{zone.index} / 05</span><strong>{zone.title[language]}</strong></span>
            <span className="zone-visual-arrow" aria-hidden="true">↗</span>
          </button>
          <div className="hall-wheel" role="tablist" aria-label={inline(language, 'Choose an immersive hall', '选择沉浸展厅')}>
            <div className="hall-wheel-rotor" style={{ '--wheel-turn': `${activeZone * -72}deg` } as CSSProperties}>
              {zones.map((item, index) => <button id={`zone-tab-${index}`} key={item.id} type="button" role="tab" aria-label={item.title[language]} aria-selected={activeZone === index} aria-controls={`zone-panel-${index}`} tabIndex={activeZone === index ? 0 : -1} className={'hall-wheel-item' + (activeZone === index ? ' active' : '')} style={{ '--wheel-angle': `${index * 72}deg` } as CSSProperties} onClick={() => switchZone(index)} onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); moveZone(1) } if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); moveZone(-1) } if (event.key === 'Home') { event.preventDefault(); switchZone(0); window.setTimeout(() => document.getElementById('zone-tab-0')?.focus(), 0) } if (event.key === 'End') { event.preventDefault(); switchZone(zones.length - 1); window.setTimeout(() => document.getElementById(`zone-tab-${zones.length - 1}`)?.focus(), 0) } }}><span className="hall-wheel-item-inner"><img src={item.thumbnail || item.image} loading="lazy" decoding="async" alt="" aria-hidden="true" onError={(event) => { event.currentTarget.src = item.poster }} /><span>{item.index}</span></span></button>)}
            </div>
          </div>
        </div>
        <div className="hall-carousel">
          <aside className="hall-carousel-aside">
            <div className="hall-carousel-heading"><p className="eyebrow">{t.zonesEyebrow}</p><h2 id="exhibition-title">{t.zonesTitle}</h2><p>{t.zonesBody}</p></div>
            <div className="hall-carousel-dial" role="tablist" aria-label={inline(language, 'Exhibition zones', '展区')}>
              {zones.map((item, index) => {
                const dialOffset = (index - activeZone + zones.length + 2) % zones.length - 2
                return <button id={`zone-tab-${index}`} key={item.id} type="button" role="tab" aria-label={item.title[language]} aria-selected={activeZone === index} aria-controls={`zone-panel-${index}`} tabIndex={activeZone === index ? 0 : -1} className={`hall-dial-item offset-${dialOffset}${activeZone === index ? ' active' : ''}`} onClick={() => switchZone(index)} onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); moveZone(1) } if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); moveZone(-1) } if (event.key === 'Home') { event.preventDefault(); switchZone(0); window.setTimeout(() => document.getElementById('zone-tab-0')?.focus(), 0) } if (event.key === 'End') { event.preventDefault(); switchZone(zones.length - 1); window.setTimeout(() => document.getElementById(`zone-tab-${zones.length - 1}`)?.focus(), 0) } }}><img src={item.thumbnail || item.image} loading="lazy" decoding="async" alt="" aria-hidden="true" onError={(event) => { event.currentTarget.src = item.poster }} /><span className="hall-dial-index">{item.index}</span><span className="hall-dial-title">{item.title[language]}</span></button>
              })}
            </div>
          </aside>
          <article id={`zone-panel-${activeZone}`} className={`zone-carousel-stage ${zone.tone}`} role="tabpanel" aria-labelledby={`zone-tab-${activeZone}`}>
            <div className="zone-carousel-art">
              {previousZone !== null && previousZone !== activeZone && <picture className="zone-carousel-image zone-carousel-image--previous"><source type="image/webp" media="(max-width: 700px)" srcSet={deliveryImage(zones[previousZone].mobileImage)} /><source media="(max-width: 700px)" srcSet={zones[previousZone].mobileImage} /><source type="image/webp" srcSet={deliveryImage(zones[previousZone].image)} /><img src={zones[previousZone].image} loading="lazy" decoding="async" alt="" aria-hidden="true" /></picture>}
              <picture className="zone-carousel-image zone-carousel-image--current" key={zone.id}><source type="image/webp" media="(max-width: 700px)" srcSet={deliveryImage(zone.mobileImage)} /><source media="(max-width: 700px)" srcSet={zone.mobileImage} /><source type="image/webp" srcSet={deliveryImage(zone.image)} /><img src={zone.image} loading="lazy" decoding="async" alt="" onError={(event) => { event.currentTarget.src = zone.poster }} /></picture>
              <button className="zone-carousel-media-trigger" type="button" aria-label={'Preview ' + zone.title.en} onClick={() => { setMediaFailed(false); setMediaOpen(true) }}>{zone.video ? '▶' : '◇'}</button>
            </div>
            <div className="zone-carousel-copy">
              <div className="zone-carousel-copy-top"><span>{zoneMeta} / {t.source}</span><span>{zone.tag[language]}</span></div>
              <h3>{zone.title[language]}</h3>
              <p className="zone-carousel-kicker">{zone.kicker[language]}</p>
              <p className="zone-carousel-description">{zone.description[language]}</p>
              <div className="zone-carousel-footer"><span>{tx('Open immersive hall', '进入沉浸展厅')}</span><button type="button" onClick={() => openZoneHall(activeZone)}>{tx('Enter', '进入')} <span>↗</span></button></div>
            </div>
            <div className="zone-carousel-progress" aria-label={language === 'en' ? `Slide ${activeZone + 1} of ${zones.length}` : `第 ${activeZone + 1} 张，共 ${zones.length} 张`}>{zones.map((item, index) => <span key={item.id} className={activeZone === index ? 'active' : ''} />)}</div>
          </article>
        </div>
      </section>

      <section className="home-museum-chapter home-museum-chapter--map" data-museum-chapter="map" aria-labelledby="home-map-chapter-title">
        <h2 id="home-map-chapter-title" className="brand-sr-only">{localize(homeMuseumChapterCopy.map, language)}</h2>
        <DeferredHainanMap language={language} />
      </section>
      <div id="home-beyond-halls" data-luoyin-tour-cue="home-beyond-halls" data-luoyin-tour-page="shellsong">
        <HomeExperienceRail language={language} cards={homeExperienceCards} />
      </div>
      <button className="home-museum-backtop" type="button" onClick={() => scrollToTarget('top', 0)} aria-label={localize(homeMuseumChapterCopy.backToTop, language)} title={localize(homeMuseumChapterCopy.backToTop, language)}><span aria-hidden="true">↑</span><small>{localize(homeMuseumChapterCopy.backToTop, language)}</small></button>
      </div>

    </main>
    {hallNotice && <div className="hall-notice" role="status" aria-live="polite">{hallNotice}</div>}

    <footer className="site-footer"><picture><source type="image/webp" srcSet="/assets/brand/qiongverse-logo2.webp" /><img className="footer-brand-mark" src="/assets/brand/qiongverse-logo2.jpg" loading="lazy" decoding="async" alt="QIONGVERSE brand mark" /></picture><img className="footer-wordmark" src="/assets/brand/qiongverse-wordmark-en.svg" loading="lazy" decoding="async" alt="HAINAN QIONGVERSE" /><button className="footer-archive-trigger" type="button" onClick={openSourceDesk}>{tx('Open verified source desk', '已核验来源服务台')} <span aria-hidden="true">↗</span></button><SocialShare language={language} apiPath={apiPath} /><span className="footer-code">TIDE ARCHIVE / 2026</span></footer>
    </>}</>}

    <HomeIntroVideoModal open={introVideoOpen} language={language} prefersReducedMotion={prefersReducedMotion} triggerRef={introVideoTriggerRef} onClose={closeIntroVideo} />
    <LuoyinDesktopPet language={language} visible={petVisible} chatOpen={guideOpen} suspended={guideBlocked} surfaceTone={guideSurfaceTone} onOpenChat={openGuideChat} onCloseChat={closeGuideChat} onClosePet={closeGuidePet} tourCue={activeTourCopy ? { title: activeTourCopy.title, text: activeTourCopy.text, onOpen: () => tourCue && openTourCue(tourCue), onSpeak: () => { void speakTextNow(activeTourCopy.text) }, onDismiss: dismissTourCue } : undefined} autoGuideCue={autoGuideCue ? { title: autoGuideCue.title, text: `${autoGuideCue.text}${autoGuideCue.sourceLabel ? ` · ${autoGuideCue.sourceLabel}` : ''}`, onOpen: () => openAutoGuide(autoGuideCue), onDismiss: dismissAutoGuide, onSkip: dismissAutoGuide } : undefined}>
      <div id="luoyin-chat-panel" className="luoyin-chat-panel" role="dialog" aria-labelledby="guide-title">
        <div className="guide-top"><div className="guide-identity"><div className="guide-orb">◎</div><div><p className="mono-label">SHELLSONG / 螺音</p><h2 id="guide-title">{t.guideTitle}</h2></div></div><button className="close-button" type="button" onClick={closeGuideChat} aria-label={t.close}>×</button></div>
        <p className="guide-body">{t.guideBody}</p>
        <p className="guide-state"><span className="state-dot" /> {guideState} / {localize(guideZoneTitle, language)}</p>
        <div className="guide-utility-actions"><button className="source-desk-trigger" type="button" onClick={openSourceDesk}>{inline(language, 'Verified Source Desk', '已核验来源服务台')} <span>↗</span></button><button className="lead-trigger" type="button" onClick={() => { setGuideOpen(false); resetLead(); setLeadOpen(true) }}>{inline(language, 'Request human follow-up', '请求人工跟进')} <span>↗</span></button><button className="lead-trigger" type="button" aria-pressed={autoGuideEnabled} onClick={toggleAutoGuide}>{localize(autoGuideCopy.enabled, language)} <span aria-hidden="true">{autoGuideEnabled ? '◉' : '○'}</span></button><button className="lead-trigger" type="button" aria-pressed={tourCuesEnabled} onClick={toggleTourCues}>{localize(tourCuesEnabled ? autoGuideCopy.tourPromptsEnabled : autoGuideCopy.tourPromptsDisabled, language)} <span aria-hidden="true">{tourCuesEnabled ? '◉' : '○'}</span></button><button className="lead-trigger guide-speech-toggle" type="button" aria-pressed={speechEnabled} onClick={toggleSpeech}>{speechStatus === 'unavailable' ? inline(language, 'Voice unavailable', '合成语音暂不可用') : speechEnabled ? inline(language, 'Disable voice', '关闭语音') : inline(language, 'Enable voice', '开启语音')} <span aria-hidden="true">◉</span></button></div>
        <div className="guide-answer-area" ref={guideTranscriptRef} aria-live="polite" aria-busy={loading} aria-label={guideText('conversation')}>{guideMessages.length === 0 && <p className="guide-welcome">{t.guideWelcome}</p>}{guideMessages.map((message) => message.role === 'visitor' ? <div className="guide-message visitor-message" key={message.id}><span className="message-label">{guideText('you')} / {message.zoneTitle}</span><p>{message.text}</p></div> : <div className="guide-message guide-message-reply" key={message.id}><div className="answer-meta"><span className="answer-label">{guideAnswerLabel(message)}</span>{message.sourceLabel && !(message.mode === 'local' && (message.sourceLabel === 'Local contextual guide' || message.sourceLabel === '本地语境导览')) && <span className="answer-source">{message.sourceLabel}</span>}{message.sourceUrl && <a className="answer-source answer-source-link" href={message.sourceUrl} target="_blank" rel="noopener noreferrer">{inline(language, 'Open reviewed source', '打开已核验来源')}</a>}{message.sourceClass && message.sourceClass !== 'local_contextual_guide' && <span className="answer-source-class">{message.sourceClass.replaceAll('_', ' ')}</span>}{message.sourceStatus && message.sourceStatus !== 'local' && <span className="answer-source-status">{message.sourceStatus}</span>}</div><p className="guide-answer">{message.text}</p></div>)}{loading && <p className="guide-answer loading">{guideText('loading')}</p>}</div>
        <div className="guide-input"><input ref={guideInputRef} value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitQuestion() }} placeholder={t.guideInput} aria-label={t.guideInput} /><button onClick={submitQuestion} disabled={loading || !question.trim()} aria-label={t.send}>↗</button></div>
        <p className="guide-disclaimer">{guideServiceMode === 'checking' ? guideText('checking') : guideServiceMode === 'glm' ? guideText('glmConnected') : guideServiceMode === 'local' ? guideText('localActive') : guideText('unavailable')}{speechStatus === 'unavailable' && <>{' '}{guideText('speechNotice')}</>}</p>
      </div>
    </LuoyinDesktopPet>
    {sourceDeskOpen && <div className="source-desk-modal" role="dialog" aria-modal="true" aria-labelledby="source-desk-title">
      <div className="source-desk-sheet">
        <div className="lead-sheet-head"><div><p className="mono-label">{sourceText('kicker')}</p><h2 id="source-desk-title">{localize(sourceArchiveCopy.archiveTitle, language)}</h2></div><button className="close-button" type="button" onClick={() => setSourceDeskOpen(false)} aria-label={sourceText('close')}>×</button></div>
        <p className="source-desk-intro">{sourceText('intro')} {localize(sourceArchiveCopy.archiveIntro, language)}</p>
        <div className="source-archive-summary" aria-live="polite"><strong>{visibleSourceDeskEntries.length}</strong> <span>{localize(sourceArchiveCopy.recordsShown, language)}</span><span className="source-archive-summary-divider" aria-hidden="true">/</span><span>{sourceDeskEntries.length} {localize(sourceArchiveCopy.archiveKicker, language).split(' / ')[0].toLocaleLowerCase()}</span></div>
        <label className="source-archive-search"><span className="sr-only">{localize(sourceArchiveCopy.searchPlaceholder, language)}</span><input type="search" value={sourceDeskQuery} onChange={(event) => setSourceDeskQuery(event.target.value)} placeholder={localize(sourceArchiveCopy.searchPlaceholder, language)} /></label>
        <div className="source-archive-filter-group"><span className="source-filter-label">{localize(sourceArchiveCopy.hallFilter, language)}</span><div className="source-topic-filter" role="group" aria-label={localize(sourceArchiveCopy.hallFilter, language)}>{sourceDeskHalls.map((hall) => <button key={hall.id} type="button" className={sourceDeskHall === hall.id ? 'source-topic active' : 'source-topic'} aria-pressed={sourceDeskHall === hall.id} onClick={() => setSourceDeskHall(hall.id)}>{localize(hall.label, language)}</button>)}</div></div>
        <div className="source-archive-filter-group"><span className="source-filter-label">{localize(sourceArchiveCopy.layerFilter, language)}</span><div className="source-topic-filter" role="group" aria-label={localize(sourceArchiveCopy.layerFilter, language)}>{sourceDeskLayers.map((layer) => <button key={layer.id} type="button" className={sourceDeskLayerFilter === layer.id ? 'source-topic active' : 'source-topic'} aria-pressed={sourceDeskLayerFilter === layer.id} onClick={() => setSourceDeskLayerFilter(layer.id)}>{localize(layer.label, language)}</button>)}</div></div>
        <div className="source-archive-filter-group"><span className="source-filter-label">{sourceText('filterTopics')}</span><div className="source-topic-filter" role="group" aria-label={sourceText('filterTopics')}>{sourceDeskTopics.map((topic) => <button key={topic.id} type="button" className={sourceDeskTopic === topic.id ? 'source-topic active' : 'source-topic'} aria-pressed={sourceDeskTopic === topic.id} onClick={() => setSourceDeskTopic(topic.id)}>{localize(topic.label, language)}</button>)}</div></div>
        <div className="source-desk-list">{visibleSourceDeskEntries.map((entry) => <article className="source-entry" key={entry.id}><div className="source-entry-meta"><span>{sourceDeskLayer(entry)}</span><span>{sourceCheckedAt.get(entry.sourceRecordId) || '—'}</span><span>{sourceText('noPartnership')}</span><span>{localize(sourceArchiveCopy.recordId, language)}: {entry.id}</span></div><div className="source-entry-copy"><h3>{localize(entry.title, language)}</h3><p className="source-publisher">{entry.publisher}</p><dl><div><dt>{sourceText('scope')}</dt><dd>{localize(entry.scope, language)}</dd></div><div><dt>{sourceText('limitation')}</dt><dd>{localize(entry.limitation, language)}</dd></div><div><dt>{localize(sourceArchiveCopy.coveredHalls, language)}</dt><dd>{sourceDeskHalls.filter((hall) => hall.id !== 'all' && entry.zoneIds.includes(hall.id)).map((hall) => localize(hall.label, language)).join(' · ') || '—'}</dd></div><div><dt>{localize(sourceArchiveCopy.topics, language)}</dt><dd>{entry.topics.join(' · ')}</dd></div></dl>{entry.canonicalUrl && <a className="source-official-link" href={entry.canonicalUrl} target="_blank" rel="noopener noreferrer">{sourceText('openOriginal')} <span aria-hidden="true">↗</span></a>}{entry.canonicalUrl && <button className={sourceDeskSourceId === entry.id ? 'source-select active' : 'source-select'} type="button" aria-pressed={sourceDeskSourceId === entry.id} onClick={() => { setSourceDeskSourceId(entry.id); setSourceDeskStatus('idle'); setSourceDeskError(''); setSourceDeskReference('') }}>{sourceDeskSourceId === entry.id ? sourceText('selectedSimulation') : sourceText('useSimulation')}</button>}</div></article>)}</div>
        {visibleSourceDeskEntries.length === 0 && <p className="source-desk-empty" role="status">{localize(sourceArchiveCopy.noMatches, language)} {sourceText('empty')}</p>}
        {sourceDeskStatus === 'success' ? <div className="source-desk-receipt" aria-live="polite"><span className="mono-label">{sourceText('receiptKicker')}</span><h3>{sourceText('receiptTitle')}</h3><p>{sourceText('reference')}: <code>{sourceDeskReference}</code></p><p>{sourceText('noInstitution')}</p><button className="outline-button" type="button" onClick={() => setSourceDeskOpen(false)}>{sourceText('return')}</button></div> : <form className="source-simulation-form" onSubmit={(event) => { event.preventDefault(); submitSourceDeskHandoff() }}><fieldset><legend>{sourceText('simulationPurpose')}</legend><div className="source-intents">{leadIntents.map((intent) => <button type="button" key={intent.id} className={sourceDeskIntent === intent.id ? 'source-intent active' : 'source-intent'} aria-pressed={sourceDeskIntent === intent.id} onClick={() => setSourceDeskIntent(intent.id)}>{localize(intent.label, language)}</button>)}</div></fieldset><label className="lead-consent"><input type="checkbox" checked={sourceDeskConsent} onChange={(event) => setSourceDeskConsent(event.target.checked)} /><span>{sourceText('consent')}</span></label>{sourceDeskError && <p className="lead-error" role="alert">{sourceDeskError}</p>}<button className="lead-submit" type="submit" disabled={!sourceDeskConsent || sourceDeskStatus === 'sending' || !sourceDeskSourceId}>{sourceDeskStatus === 'sending' ? sourceText('preparing') : sourceText('simulate')}</button></form>}
      </div>
    </div>}
    {leadOpen && <div className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-title">
      <div className="lead-sheet">
        <div className="lead-sheet-head"><div><p className="mono-label">HUMAN HANDOFF / LOCAL MVP</p><h2 id="lead-title">{language === 'en' ? 'Continue with a person' : '与真人继续沟通'}</h2></div><button className="close-button" type="button" onClick={() => setLeadOpen(false)} aria-label={language === 'en' ? 'Close handoff form' : '关闭交接表单'}>×</button></div>
        {leadStatus === 'success' ? <div className="lead-receipt" aria-live="polite"><span className="mono-label">LOCAL RECEIPT</span><h3>{language === 'en' ? 'Your request was accepted locally.' : '你的请求已在本地接收。'}</h3><p>{language === 'en' ? 'Reference' : '参考编号'}: <code>{leadReference}</code></p><p>{language === 'en' ? 'This is not a booking, quote, official service, or response guarantee. No commercial outcome has been confirmed.' : '这不是预订、报价、官方服务或响应保证，尚未确认任何商业结果。'}</p><button className="outline-button" type="button" onClick={() => setLeadOpen(false)}>{language === 'en' ? 'Return to the exhibition' : '返回展厅'}</button></div> : <form className="lead-form" onSubmit={(event) => { event.preventDefault(); submitLead() }}>
          <p className="lead-intro">{language === 'en' ? 'Choose one reason for a human follow-up. This form is not an order, booking, visa application, legal consultation, investment approval, or government service.' : '请选择一个需要人工跟进的原因。本表单不是订单、预订、签证申请、法律咨询、投资审批或政府服务。'}</p>
          <fieldset><legend>{inline(language, 'Your purpose', '你的目的')}</legend><div className="lead-intents">{leadIntents.map((intent) => <button type="button" key={intent.id} className={leadIntent === intent.id ? 'lead-intent active' : 'lead-intent'} aria-pressed={leadIntent === intent.id} onClick={() => setLeadIntent(intent.id)}><span>{intent.id.slice(0, 2).toUpperCase()}</span>{localize(intent.label, language)}</button>)}</div></fieldset>
          <label>{language === 'en' ? 'Email address' : '电子邮箱'}<input value={leadEmail} onChange={(event) => setLeadEmail(event.target.value)} type="email" autoComplete="email" required /></label>
          <div className="lead-optional"><label>{language === 'en' ? 'Name (optional)' : '姓名（可选）'}<input value={leadName} onChange={(event) => setLeadName(event.target.value)} autoComplete="name" maxLength={120} /></label><label>{language === 'en' ? 'Organisation (optional)' : '机构（可选）'}<input value={leadOrganization} onChange={(event) => setLeadOrganization(event.target.value)} autoComplete="organization" maxLength={160} /></label></div>
          <label>{language === 'en' ? 'Message' : '留言'}<textarea value={leadMessage} onChange={(event) => setLeadMessage(event.target.value)} required maxLength={1200} rows={5} /></label>
          <label className="lead-consent"><input type="checkbox" checked={leadConsent} onChange={(event) => setLeadConsent(event.target.checked)} /> <span>{language === 'en' ? 'I agree that this minimal enquiry may be used only for a future human follow-up. This local MVP does not store the request permanently.' : '我同意仅将此最小化咨询信息用于未来的人工跟进。本地 MVP 不会永久存储该请求。'}</span></label>
          {leadError && <p className="lead-error" role="alert">{leadError}</p>}
          <button className="lead-submit" type="submit" disabled={!leadConsent || leadStatus === 'sending'}>{leadStatus === 'sending' ? (language === 'en' ? 'Sending a handoff request…' : '正在发送交接请求…') : (language === 'en' ? 'Request human follow-up' : '请求人工跟进')}</button>
        </form>}
      </div>
    </div>}
    {mediaOpen && <div className="media-modal" role="dialog" aria-modal="true" aria-labelledby="media-title">
      <div className="media-modal-inner">
        <div className="media-modal-head"><div><span className="mono-label">{zoneMeta} / MEDIA PREVIEW</span><h2 id="media-title">{zone.title[language]}</h2></div><button className="close-button" onClick={() => setMediaOpen(false)} aria-label={t.close}>×</button></div>
        {!zone.video || mediaFailed ? <div className="media-fallback"><p>{zone.video ? (language === 'en' ? 'The motion file is unavailable. The still image remains available for reading.' : '动态媒体暂时不可用，静态图像仍可继续阅读。') : (language === 'en' ? 'This room uses a project-supplied still image for orientation. Open the immersive hall for the spatial experience.' : '本展厅使用项目提供的静态图像进行导览。请进入沉浸展厅获得空间体验。')}</p><img src={zone.poster} alt={zone.title[language]} /></div> : <video controls autoPlay playsInline preload="metadata" poster={zone.poster} onError={() => setMediaFailed(true)}><source src={zone.video} type="video/mp4" /><p>{language === 'en' ? 'Your browser does not support video.' : '你的浏览器不支持视频。'}</p></video>}
      </div>
    </div>}
  </div>
}

export default App
