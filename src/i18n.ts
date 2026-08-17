export const supportedLanguages = ['en', 'zh', 'id', 'ja', 'ko', 'ru', 'ar'] as const
export type Language = (typeof supportedLanguages)[number]
/**
 * Project-owned copy should provide all seven values. Legacy records are
 * completed from the local translation catalogue before they are rendered.
 */
export type CompleteLocalized<T = string> = Record<Language, T>
export type LegacyLocalized<T = string> = { en: T; zh: T } & Partial<Record<Exclude<Language, 'en' | 'zh'>, T>>
export type Localized<T = string> = CompleteLocalized<T> | LegacyLocalized<T>
export type RuntimeLocalized<T = string> = CompleteLocalized<T>
export type OriginalLabel = { preserveOriginal: true; value: string }

export const languageMeta: Record<Language, { label: string; tag: string; direction: 'ltr' | 'rtl' }> = {
  en: { label: 'English', tag: 'en', direction: 'ltr' },
  zh: { label: '简体中文', tag: 'zh-CN', direction: 'ltr' },
  id: { label: 'Bahasa Indonesia', tag: 'id', direction: 'ltr' },
  ja: { label: '日本語', tag: 'ja', direction: 'ltr' },
  ko: { label: '한국어', tag: 'ko', direction: 'ltr' },
  ru: { label: 'Русский', tag: 'ru', direction: 'ltr' },
  ar: { label: 'العربية', tag: 'ar', direction: 'rtl' },
}

export const languageStorageKey = 'qiongverse.language'

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (supportedLanguages as readonly string[]).includes(value)
}

export function readLanguagePreference(): Language {
  try {
    const value = window.localStorage.getItem(languageStorageKey)
    return isLanguage(value) ? value : 'en'
  } catch {
    return 'en'
  }
}

export function saveLanguagePreference(language: Language) {
  try {
    window.localStorage.setItem(languageStorageKey, language)
  } catch {
    // A blocked storage area must not prevent language switching for this visit.
  }
}

export function original(value: string): OriginalLabel {
  return { preserveOriginal: true, value }
}

export function localize<T>(value: Localized<T> | OriginalLabel, language: Language): T {
  if ('preserveOriginal' in value) return value.value as T
  const direct = value[language]
  if (direct !== undefined) return direct
  if (typeof value.en === 'string' && typeof value.zh === 'string') return translateProjectText(value.en, language, value.zh) as T
  throw new Error(`Incomplete runtime localization for locale ${language}`)
}

const inlineCopy: Partial<Record<Language, Record<string, string>>> = {
  id: { 'Home': 'Beranda', 'Language': 'Bahasa', 'Switch language': 'Ganti bahasa', 'Ask Luoyin': 'Tanya Luoyin', 'Close': 'Tutup', 'Back to five halls': 'Kembali ke lima aula', 'Open exhibit index': 'Buka indeks pameran', 'Return home': 'Kembali ke beranda', 'Read the UNESCO source': 'Baca sumber UNESCO' },
  ja: { 'Home': 'ホーム', 'Language': '言語', 'Switch language': '言語を切り替える', 'Ask Luoyin': '螺音に聞く', 'Close': '閉じる', 'Back to five halls': '五つの展示室に戻る', 'Open exhibit index': '展示索引を開く', 'Return home': 'ホームに戻る', 'Read the UNESCO source': 'UNESCO の出典を読む' },
  ko: { 'Home': '홈', 'Language': '언어', 'Switch language': '언어 변경', 'Ask Luoyin': '뤄인에게 묻기', 'Close': '닫기', 'Back to five halls': '다섯 전시관으로 돌아가기', 'Open exhibit index': '전시 색인 열기', 'Return home': '홈으로 돌아가기', 'Read the UNESCO source': 'UNESCO 출처 읽기' },
  ru: { 'Home': 'Главная', 'Language': 'Язык', 'Switch language': 'Сменить язык', 'Ask Luoyin': 'Спросить Луоинь', 'Close': 'Закрыть', 'Back to five halls': 'К пяти залам', 'Open exhibit index': 'Открыть каталог экспонатов', 'Return home': 'На главную', 'Read the UNESCO source': 'Открыть источник ЮНЕСКО' },
  ar: { 'Home': 'الرئيسية', 'Language': 'اللغة', 'Switch language': 'تغيير اللغة', 'Ask Luoyin': 'اسأل لويين', 'Close': 'إغلاق', 'Back to five halls': 'العودة إلى القاعات الخمس', 'Open exhibit index': 'فتح فهرس المعروضات', 'Return home': 'العودة إلى الرئيسية', 'Read the UNESCO source': 'قراءة مصدر اليونسكو' },
}

const sharedInlineCopy: Record<string, Partial<Record<Language, string>>> = {
  'Voice unavailable': { id: 'Suara tidak tersedia', ja: '音声は利用できません', ko: '음성을 사용할 수 없습니다', ru: 'Голос недоступен', ar: 'الصوت غير متاح' },
  'Synthetic voice is not configured; text remains available.': { id: 'Suara sintetis belum dikonfigurasi; teks tetap tersedia.', ja: '合成音声は未設定ですが、テキストは利用できます。', ko: '합성 음성이 설정되지 않았지만 텍스트는 계속 제공됩니다.', ru: 'Синтетический голос не настроен; текст остаётся доступным.', ar: 'لم يُضبط الصوت الاصطناعي؛ يبقى النص متاحاً.' },
  'Ask Luoyin': { id: 'Tanya Luoyin', ja: '螺音に聞く', ko: '뤄인에게 묻기', ru: 'Спросить Луоинь', ar: 'اسأل لويين' },
  'Later': { id: 'Nanti', ja: '後で', ko: '나중에', ru: 'Позже', ar: 'لاحقاً' },
  'Dismiss tour cue': { id: 'Tutup petunjuk tur', ja: '案内を閉じる', ko: '안내 닫기', ru: 'Закрыть подсказку', ar: 'إغلاق تلميح الجولة' },
  'Enable voice': { id: 'Aktifkan suara', ja: '音声を有効にする', ko: '음성 켜기', ru: 'Включить голос', ar: 'تفعيل الصوت' },
  'Disable voice': { id: 'Matikan suara', ja: '音声をオフにする', ko: '음성 끄기', ru: 'Выключить голос', ar: 'إيقاف الصوت' },
  'Play voice': { id: 'Putar suara', ja: '音声を再生', ko: '음성 재생', ru: 'Воспроизвести голос', ar: 'تشغيل الصوت' },
  'Archive': { id: 'Arsip', ja: 'アーカイブ', ko: '아카이브', ru: 'Архив', ar: 'الأرشيف' },
  'ShellSong': { id: 'ShellSong', ja: 'ShellSong', ko: 'ShellSong', ru: 'ShellSong', ar: 'ShellSong' },
  'Travel': { id: 'Perjalanan', ja: '旅', ko: '여행', ru: 'Путешествие', ar: 'السفر' },
  'Market': { id: 'Pasar', ja: 'マーケット', ko: '마켓', ru: 'Маркет', ar: 'المتجر' },
  'Hainan Map': { id: 'Peta Hainan', ja: '海南マップ', ko: '하이난 지도', ru: 'Карта Хайнаня', ar: 'خريطة هاينان' },
  'Free Trade Port Main Hall': { id: 'Aula Utama Pelabuhan Perdagangan Bebas', ja: '自由貿易港メインホール', ko: '자유무역항 메인 홀', ru: 'Главный зал порта свободной торговли', ar: 'القاعة الرئيسية لميناء التجارة الحرة' },
  'Open verified source desk': { id: 'Buka meja sumber terverifikasi', ja: '確認済み出典デスクを開く', ko: '검증된 출처 데스크 열기', ru: 'Открыть стол проверенных источников', ar: 'فتح مكتب المصادر المتحققة' },
  'Open experience menu': { id: 'Buka menu pengalaman', ja: '体験メニューを開く', ko: '체험 메뉴 열기', ru: 'Открыть меню впечатлений', ar: 'فتح قائمة التجارب' },
  'Explore experiences': { id: 'Jelajahi pengalaman', ja: '体験を探す', ko: '체험 둘러보기', ru: 'Исследовать впечатления', ar: 'استكشف التجارب' },
  'ShellSong / Luoyin': { id: 'ShellSong / Luoyin', ja: 'ShellSong / 螺音', ko: 'ShellSong / 뤄인', ru: 'ShellSong / Луоинь', ar: 'ShellSong / لويين' },
  'Travel / Hainan Unfolded': { id: 'Perjalanan / Hainan Unfolded', ja: '旅 / Hainan Unfolded', ko: '여행 / Hainan Unfolded', ru: 'Путешествие / Hainan Unfolded', ar: 'السفر / Hainan Unfolded' },
  'Market / Project Demo': { id: 'Pasar / Demo proyek', ja: 'マーケット / プロジェクトデモ', ko: '마켓 / 프로젝트 데모', ru: 'Маркет / Демонстрация проекта', ar: 'المتجر / عرض المشروع' },
  'Enter main hall': { id: 'Masuk aula utama', ja: 'メインホールに入る', ko: '메인 홀 입장', ru: 'Войти в главный зал', ar: 'دخول القاعة الرئيسية' },
  'Open official English portal': { id: 'Buka portal resmi berbahasa Inggris', ja: '公式英語ポータルを開く', ko: '영문 공식 포털 열기', ru: 'Открыть официальный англоязычный портал', ar: 'فتح البوابة الرسمية الإنجليزية' },
  'Open immersive hall': { id: 'Buka aula imersif', ja: '没入型展示室を開く', ko: '몰입형 전시관 열기', ru: 'Открыть иммерсивный зал', ar: 'فتح القاعة الغامرة' },
  'Enter': { id: 'Masuk', ja: '入る', ko: '입장', ru: 'Войти', ar: 'دخول' },
  'Verified Source Desk': { id: 'Meja Sumber Terverifikasi', ja: '確認済み出典デスク', ko: '검증된 출처 데스크', ru: 'Стол проверенных источников', ar: 'مكتب المصادر المتحققة' },
  'Request human follow-up': { id: 'Minta tindak lanjut manusia', ja: '担当者の対応を依頼', ko: '사람의 후속 대응 요청', ru: 'Запросить ответ человека', ar: 'طلب متابعة بشرية' },
  'Open reviewed source': { id: 'Buka sumber yang ditinjau', ja: '確認済み出典を開く', ko: '검토된 출처 열기', ru: 'Открыть проверенный источник', ar: 'فتح المصدر المُراجع' },
  'Conversation with Luoyin': { id: 'Percakapan dengan Luoyin', ja: '螺音との会話', ko: '뤄인과의 대화', ru: 'Разговор с Луоинь', ar: 'محادثة مع لويين' },
  'Explore Free Trade Port': { id: 'Jelajahi Pelabuhan Perdagangan Bebas', ja: '自由貿易港を探る', ko: '자유무역항 탐색', ru: 'Исследовать порт свободной торговли', ar: 'استكشف ميناء التجارة الحرة' },
  'Meet Luoyin': { id: 'Temui Luoyin', ja: '螺音に会う', ko: '뤄인을 만나기', ru: 'Познакомиться с Луоинь', ar: 'تعرّف إلى لويين' },
  'Free Trade': { id: 'Perdagangan Bebas', ja: '自由貿易', ko: '자유무역', ru: 'Свободная торговля', ar: 'التجارة الحرة' },
  'Port Main': { id: 'Pelabuhan Utama', ja: '港のメイン', ko: '항만 메인', ru: 'Главный порт', ar: 'الميناء الرئيسي' },
  'Hall': { id: 'Aula', ja: 'ホール', ko: '홀', ru: 'Зал', ar: 'القاعة' },
  'Close publish confirmation': { id: 'Tutup konfirmasi publikasi', ja: '公開確認を閉じる', ko: '게시 확인 닫기', ru: 'Закрыть подтверждение публикации', ar: 'إغلاق تأكيد النشر' },
  'Platform': { id: 'Platform', ja: 'プラットフォーム', ko: '플랫폼', ru: 'Платформа', ar: 'المنصة' },
  'Content': { id: 'Konten', ja: 'コンテンツ', ko: '콘텐츠', ru: 'Содержание', ar: 'المحتوى' },
  'Primary navigation': { id: 'Navigasi utama', ja: 'メインナビゲーション', ko: '기본 탐색', ru: 'Основная навигация', ar: 'التنقل الرئيسي' },
  'Five immersive halls': { id: 'Lima aula imersif', ja: '五つの没入型展示室', ko: '다섯 개의 몰입형 전시관', ru: 'Пять иммерсивных залов', ar: 'خمس قاعات غامرة' },
  'Choose an immersive hall': { id: 'Pilih aula imersif', ja: '没入型展示室を選択', ko: '몰입형 전시관 선택', ru: 'Выбрать иммерсивный зал', ar: 'اختر قاعة غامرة' },
  'Exhibition zones': { id: 'Zona pameran', ja: '展示ゾーン', ko: '전시 구역', ru: 'Зоны выставки', ar: 'مناطق المعرض' },
}

const marketInlineCopy: Record<string, Partial<Record<Language, string>>> = {
  'Demo market navigation': { id: 'Navigasi pasar demo', ja: 'デモマーケットのナビゲーション', ko: '데모 마켓 탐색', ru: 'Навигация по демо-маркету', ar: 'تنقل سوق العرض' },
  'Services': { id: 'Layanan', ja: 'サービス', ko: '서비스', ru: 'Услуги', ar: 'الخدمات' },
  'Culture shop': { id: 'Toko budaya', ja: 'カルチャーショップ', ko: '문화 상점', ru: 'Магазин культуры', ar: 'متجر الثقافة' },
  'Luoyin IP': { id: 'IP Luoyin', ja: '螺音 IP', ko: '뤄인 IP', ru: 'IP Луоинь', ar: 'ملكية لويين' },
  'Cart': { id: 'Keranjang', ja: 'カート', ko: '장바구니', ru: 'Корзина', ar: 'السلة' },
  'Ask Luoyin': { id: 'Tanya Luoyin', ja: '螺音に聞く', ko: '뤄인에게 묻기', ru: 'Спросить Луоинь', ar: 'اسأل لويين' },
  'Return to the QIONGVERSE home page': { id: 'Kembali ke beranda QIONGVERSE', ja: 'QIONGVERSE ホームに戻る', ko: 'QIONGVERSE 홈으로 돌아가기', ru: 'Вернуться на главную QIONGVERSE', ar: 'العودة إلى الصفحة الرئيسية QIONGVERSE' },
  'Return home': { id: 'Kembali ke beranda', ja: 'ホームに戻る', ko: '홈으로 돌아가기', ru: 'На главную', ar: 'العودة إلى الرئيسية' },
  'Skip to main content': { id: 'Lewati ke konten utama', ja: 'メインコンテンツへスキップ', ko: '주요 콘텐츠로 건너뛰기', ru: 'Перейти к основному содержимому', ar: 'تخطَّ إلى المحتوى الرئيسي' },
  'DEMO TRANSACTION: no money is collected, and no personal, payment or order data is stored.': { id: 'TRANSAKSI DEMO: tidak ada uang yang ditagih dan data pribadi, pembayaran, atau pesanan tidak disimpan.', ja: 'デモ取引：料金は発生せず、個人・決済・注文データも保存されません。', ko: '데모 거래: 금액이 청구되지 않으며 개인·결제·주문 데이터가 저장되지 않습니다.', ru: 'ДЕМО-ТРАНЗАКЦИЯ: деньги не списываются, личные данные, данные платежей и заказов не сохраняются.', ar: 'معاملة تجريبية: لا تُحصّل أموال ولا تُحفظ بيانات شخصية أو دفع أو طلب.' },
  'PROJECT DEMO': { id: 'DEMO PROYEK', ja: 'プロジェクトデモ', ko: '프로젝트 데모', ru: 'ДЕМО ПРОЕКТА', ar: 'عرض المشروع' },
  'Project-supplied Hainan coastal exhibition context': { id: 'Konteks pameran pesisir Hainan yang disediakan proyek', ja: 'プロジェクト提供の海南沿岸展示コンテキスト', ko: '프로젝트가 제공한 하이난 해안 전시 맥락', ru: 'Выставочный контекст побережья Хайнаня от проекта', ar: 'سياق معرض ساحل هاينان المقدم من المشروع' },
  'Project context image only. The commercial interactions on this page are a local demo.': { id: 'Hanya gambar konteks proyek. Interaksi komersial di halaman ini adalah demo lokal.', ja: 'プロジェクト文脈の画像のみです。このページの商業的な操作はローカルデモです。', ko: '프로젝트 맥락 이미지일 뿐입니다. 이 페이지의 상업적 상호작용은 로컬 데모입니다.', ru: 'Только изображение проектного контекста. Коммерческие действия на странице — локальная демонстрация.', ar: 'هذه صورة لسياق المشروع فقط. التفاعلات التجارية في هذه الصفحة عرض محلي.' },
  'Three ways to turn a cultural story into a commercial journey.': { id: 'Tiga cara mengubah cerita budaya menjadi perjalanan komersial.', ja: '文化の物語を商業の旅へ変える三つの道。', ko: '문화 이야기를 상업적 여정으로 바꾸는 세 가지 길.', ru: 'Три пути, превращающие культурную историю в коммерческое путешествие.', ar: 'ثلاثة مسارات لتحويل الحكاية الثقافية إلى رحلة تجارية.' },
  'Explore a virtual-service brief, a Hainan-inspired culture shop and the Luoyin IP collection in one local, no-money transaction demo.': { id: 'Jelajahi ringkasan layanan virtual, toko budaya terinspirasi Hainan, dan koleksi IP Luoyin dalam satu demo transaksi lokal tanpa uang.', ja: '海南に着想を得たカルチャーショップ、バーチャルサービス案、螺音 IP コレクションを、料金の発生しないローカルデモで体験します。', ko: '하이난 영감 문화 상점, 가상 서비스 브리프, 뤄인 IP 컬렉션을 하나의 무자금 로컬 거래 데모에서 살펴보세요.', ru: 'Изучите виртуальное сервисное предложение, магазин культуры в духе Хайнаня и коллекцию IP Луоинь в одной локальной демо-транзакции без денег.', ar: 'استكشف موجز خدمة افتراضية ومتجر ثقافة مستوحى من هاينان ومجموعة ملكية لويين في عرض معاملة محلي بلا أموال.' },
  'Start with services': { id: 'Mulai dari layanan', ja: 'サービスから始める', ko: '서비스부터 시작', ru: 'Начать с услуг', ar: 'ابدأ بالخدمات' },
  'Explore shop': { id: 'Jelajahi toko', ja: 'ショップを見る', ko: '상점 둘러보기', ru: 'Открыть магазин', ar: 'استكشف المتجر' },
  'Build the next cultural destination.': { id: 'Bangun destinasi budaya berikutnya.', ja: '次の文化的デスティネーションをつくる。', ko: '다음 문화 목적지를 만드세요.', ru: 'Создайте следующее культурное направление.', ar: 'ابنِ الوجهة الثقافية القادمة.' },
  'For museums, tourism venues, merchants and enterprises. Select a service to simulate a project brief, not a contract.': { id: 'Untuk museum, tempat wisata, pedagang, dan perusahaan. Pilih layanan untuk mensimulasikan brief proyek, bukan kontrak.', ja: '美術館、観光施設、商店、企業向け。サービスを選んでプロジェクト案を体験します。契約ではありません。', ko: '박물관, 관광 공간, 상점, 기업을 위한 서비스입니다. 계약이 아닌 프로젝트 브리프를 시뮬레이션할 서비스를 선택하세요.', ru: 'Для музеев, туристических площадок, продавцов и компаний. Выберите услугу для демонстрации брифа, а не договора.', ar: 'للمتاحف والوجهات السياحية والتجار والشركات. اختر خدمة لمحاكاة موجز مشروع، وليس عقداً.' },
  'Configure demo brief': { id: 'Konfigurasikan brief demo', ja: 'デモ案を設定', ko: '데모 브리프 구성', ru: 'Настроить демо-бриф', ar: 'إعداد موجز العرض' },
  'Objects for carrying a Hainan-inspired story.': { id: 'Benda untuk membawa cerita yang terinspirasi Hainan.', ja: '海南に着想を得た物語を携えるオブジェ。', ko: '하이난에서 영감을 받은 이야기를 담아 가는 오브제.', ru: 'Предметы, которые несут историю в духе Хайнаня.', ar: 'أشياء تحمل حكاية مستوحاة من هاينان.' },
  'All prices, stock and checkout outcomes are project-demo data. Images are supplied placeholders, not merchant listing proof.': { id: 'Semua harga, stok, dan hasil pembayaran adalah data demo proyek. Gambar adalah placeholder yang disediakan, bukan bukti daftar penjual.', ja: '価格、在庫、決済結果はすべてプロジェクトデモのデータです。画像は提供されたプレースホルダーで、販売者の掲載証明ではありません。', ko: '모든 가격, 재고, 결제 결과는 프로젝트 데모 데이터입니다. 이미지는 제공된 자리표시자이며 판매자 상품 등록 증거가 아닙니다.', ru: 'Все цены, запасы и результаты оформления — данные демо-проекта. Изображения предоставлены как заполнители и не подтверждают объявление продавца.', ar: 'الأسعار والمخزون ونتائج الدفع كلها بيانات عرض للمشروع. الصور بدائل مقدمة وليست دليلاً على إدراج تاجر.' },
  'Take the guide beyond the exhibition.': { id: 'Bawa pemandu melampaui pameran.', ja: 'ガイドを展示の外へ連れ出す。', ko: '가이드를 전시장 밖으로 데려가세요.', ru: 'Выведите гида за пределы выставки.', ar: 'خذ الدليل إلى ما بعد المعرض.' },
  'Project IP merchandise concepts for the QIONGVERSE story world. Availability is simulated only.': { id: 'Konsep merchandise IP proyek untuk dunia cerita QIONGVERSE. Ketersediaan hanya disimulasikan.', ja: 'QIONGVERSEの物語世界のためのプロジェクト IP グッズ案。購入可能性はシミュレーションです。', ko: 'QIONGVERSE 이야기 세계를 위한 프로젝트 IP 상품 콘셉트입니다. 구매 가능 여부는 시뮬레이션일 뿐입니다.', ru: 'Концепции проектных товаров IP для сюжетного мира QIONGVERSE. Доступность только моделируется.', ar: 'مفاهيم منتجات ملكية المشروع لعالم قصة QIONGVERSE. التوافر محاكاة فقط.' },
  'Try another route through the collection.': { id: 'Coba rute lain dalam koleksi.', ja: 'コレクションの別ルートを試す。', ko: '컬렉션의 다른 경로를 둘러보세요.', ru: 'Попробуйте другой маршрут по коллекции.', ar: 'جرّب مساراً آخر في المجموعة.' },
  'Refresh demo recommendations': { id: 'Segarkan rekomendasi demo', ja: 'デモおすすめを更新', ko: '데모 추천 새로고침', ru: 'Обновить рекомендации демо', ar: 'تحديث توصيات العرض' },
  'Refresh': { id: 'Segarkan', ja: '更新', ko: '새로고침', ru: 'Обновить', ar: 'تحديث' },
  'View': { id: 'Lihat', ja: '見る', ko: '보기', ru: 'Смотреть', ar: 'عرض' },
  'Open demo cart': { id: 'Buka keranjang demo', ja: 'デモカートを開く', ko: '데모 장바구니 열기', ru: 'Открыть демо-корзину', ar: 'فتح سلة العرض' },
  'Add to demo cart': { id: 'Tambahkan ke keranjang demo', ja: 'デモカートに追加', ko: '데모 장바구니에 담기', ru: 'Добавить в демо-корзину', ar: 'إضافة إلى سلة العرض' },
  'Share item': { id: 'Bagikan item', ja: '商品を共有', ko: '상품 공유', ru: 'Поделиться товаром', ar: 'مشاركة العنصر' },
  'Project demo visual. It is not a merchant product photo or proof of availability.': { id: 'Visual demo proyek. Ini bukan foto produk penjual atau bukti ketersediaan.', ja: 'プロジェクトデモのビジュアルです。販売者の商品写真や在庫証明ではありません。', ko: '프로젝트 데모 비주얼입니다. 판매자 상품 사진이나 재고 증명이 아닙니다.', ru: 'Визуал демо-проекта. Это не фото товара продавца и не подтверждение доступности.', ar: 'صورة عرض للمشروع. ليست صورة منتج تاجر أو دليلاً على التوافر.' },
  'A project study behind the product story.': { id: 'Kajian proyek di balik cerita produk.', ja: '商品ストーリーの背景にあるプロジェクト研究。', ko: '상품 이야기 뒤에 있는 프로젝트 연구.', ru: 'Проектное исследование за историей товара.', ar: 'دراسة المشروع خلف حكاية المنتج.' },
  'This 3D study provides cultural and spatial context only. It does not describe a manufactured or shippable item.': { id: 'Studi 3D ini hanya memberi konteks budaya dan ruang. Ini bukan deskripsi barang produksi atau kiriman.', ja: 'この3D研究は文化的・空間的文脈のみを示します。製造品や発送可能な商品の説明ではありません。', ko: '이 3D 연구는 문화적·공간적 맥락만 제공합니다. 제조되거나 배송되는 상품을 설명하지 않습니다.', ru: 'Это 3D-исследование даёт только культурный и пространственный контекст. Оно не описывает изготовленный или отправляемый товар.', ar: 'تقدم هذه الدراسة ثلاثية الأبعاد سياقاً ثقافياً ومكانياً فقط. لا تصف منتجاً مصنوعاً أو قابلاً للشحن.' },
  'This demo item is currently unavailable.': { id: 'Item demo ini sedang tidak tersedia.', ja: 'このデモ商品は現在利用できません。', ko: '이 데모 상품은 현재 이용할 수 없습니다.', ru: 'Этот демо-товар сейчас недоступен.', ar: 'هذا العنصر التجريبي غير متاح حالياً.' },
  'Your demo recommendations were refreshed.': { id: 'Rekomendasi demo telah disegarkan.', ja: 'デモおすすめを更新しました。', ko: '데모 추천을 새로 고쳤습니다.', ru: 'Рекомендации демо обновлены.', ar: 'تم تحديث توصيات العرض.' },
  'Explore this QIONGVERSE demo-market item.': { id: 'Jelajahi item pasar demo QIONGVERSE ini.', ja: 'このQIONGVERSEデモマーケットの商品を見る。', ko: '이 QIONGVERSE 데모 마켓 상품을 살펴보세요.', ru: 'Изучите этот товар демо-маркета QIONGVERSE.', ar: 'استكشف هذا العنصر في سوق عرض QIONGVERSE.' },
  'Demo link copied.': { id: 'Tautan demo disalin.', ja: 'デモリンクをコピーしました。', ko: '데모 링크를 복사했습니다.', ru: 'Ссылка на демо скопирована.', ar: 'تم نسخ رابط العرض.' },
  'Sharing is unavailable in this browser.': { id: 'Berbagi tidak tersedia di peramban ini.', ja: 'このブラウザーでは共有できません。', ko: '이 브라우저에서는 공유할 수 없습니다.', ru: 'Совместное использование недоступно в этом браузере.', ar: 'المشاركة غير متاحة في هذا المتصفح.' },
  'The link was not shared. Try again in a supported browser.': { id: 'Tautan tidak dibagikan. Coba lagi di peramban yang didukung.', ja: 'リンクを共有できませんでした。対応ブラウザーで再試行してください。', ko: '링크를 공유하지 못했습니다. 지원되는 브라우저에서 다시 시도하세요.', ru: 'Не удалось поделиться ссылкой. Повторите в поддерживаемом браузере.', ar: 'لم تتم مشاركة الرابط. حاول مجدداً في متصفح مدعوم.' },
  'Operator access remains separate from this demo.': { id: 'Akses operator tetap terpisah dari demo ini.', ja: 'オペレーターアクセスはこのデモとは別です。', ko: '운영자 접근은 이 데모와 분리되어 있습니다.', ru: 'Доступ оператора отделён от этой демонстрации.', ar: 'يظل وصول المشغّل منفصلاً عن هذا العرض.' },
  'This local demo never provides operator privileges or changes the real commerce system.': { id: 'Demo lokal ini tidak memberikan hak operator atau mengubah sistem perdagangan nyata.', ja: 'このローカルデモはオペレーター権限を提供せず、実際の商取引システムも変更しません。', ko: '이 로컬 데모는 운영자 권한을 제공하거나 실제 상거래 시스템을 변경하지 않습니다.', ru: 'Эта локальная демонстрация не даёт прав оператора и не меняет реальную торговую систему.', ar: 'لا يمنح هذا العرض المحلي صلاحيات المشغّل ولا يغيّر نظام التجارة الفعلي.' },
  'Demo orders exist only in this open session.': { id: 'Pesanan demo hanya ada selama sesi ini terbuka.', ja: 'デモ注文はこの開いたセッションにのみ存在します。', ko: '데모 주문은 현재 열린 세션에만 존재합니다.', ru: 'Демо-заказы существуют только в этой открытой сессии.', ar: 'توجد طلبات العرض في هذه الجلسة المفتوحة فقط.' },
  'There is no email, order code, saved order record or real fulfilment in this demo mode.': { id: 'Mode demo ini tidak mengirim email, membuat kode pesanan, menyimpan catatan, atau memenuhi pesanan nyata.', ja: 'このデモモードではメール、注文コード、保存された注文記録、実際の履行はありません。', ko: '이 데모 모드에서는 이메일, 주문 코드, 저장된 주문 기록, 실제 이행이 발생하지 않습니다.', ru: 'В демо-режиме нет писем, кода заказа, сохранённой записи или реального исполнения.', ar: 'لا توجد في وضع العرض رسالة بريد أو رمز طلب أو سجل محفوظ أو تنفيذ فعلي.' },
  'Back to market': { id: 'Kembali ke pasar', ja: 'マーケットに戻る', ko: '마켓으로 돌아가기', ru: 'Вернуться в маркет', ar: 'العودة إلى السوق' },
  'Close service configuration': { id: 'Tutup konfigurasi layanan', ja: 'サービス設定を閉じる', ko: '서비스 구성 닫기', ru: 'Закрыть настройку услуги', ar: 'إغلاق إعداد الخدمة' },
  'This form creates a local project-demo receipt only. It sends nothing and does not request human follow-up.': { id: 'Formulir ini hanya membuat bukti demo proyek lokal. Tidak ada yang dikirim dan tidak ada tindak lanjut manusia yang diminta.', ja: 'このフォームはローカルのプロジェクトデモ受付だけを作成します。送信せず、担当者への依頼も行いません。', ko: '이 양식은 로컬 프로젝트 데모 접수만 생성합니다. 아무것도 전송하지 않으며 담당자 후속 요청도 하지 않습니다.', ru: 'Форма создаёт только локальную квитанцию демо-проекта. Ничего не отправляется и ответ человека не запрашивается.', ar: 'ينشئ هذا النموذج إيصال عرض مشروع محلياً فقط. لا يرسل شيئاً ولا يطلب متابعة بشرية.' },
  'Project direction': { id: 'Arah proyek', ja: 'プロジェクトの方向性', ko: '프로젝트 방향', ru: 'Направление проекта', ar: 'اتجاه المشروع' },
  'Describe the visitor experience you want to demonstrate.': { id: 'Jelaskan pengalaman pengunjung yang ingin Anda demonstrasikan.', ja: '実演したい来場者体験を説明してください。', ko: '시연하려는 방문자 경험을 설명하세요.', ru: 'Опишите впечатления посетителя, которые вы хотите продемонстрировать.', ar: 'صف تجربة الزائر التي تريد عرضها.' },
  'Create project demo': { id: 'Buat demo proyek', ja: 'プロジェクトデモを作成', ko: '프로젝트 데모 생성', ru: 'Создать демо-проект', ar: 'إنشاء عرض المشروع' },
  'Your demo cart': { id: 'Keranjang demo Anda', ja: 'あなたのデモカート', ko: '내 데모 장바구니', ru: 'Ваша демо-корзина', ar: 'سلة العرض الخاصة بك' },
  'Your demo cart is empty.': { id: 'Keranjang demo Anda kosong.', ja: 'デモカートは空です。', ko: '데모 장바구니가 비어 있습니다.', ru: 'Демо-корзина пуста.', ar: 'سلة العرض فارغة.' },
  'Explore a cultural concept or Luoyin IP item to test the transaction flow.': { id: 'Jelajahi konsep budaya atau item IP Luoyin untuk mencoba alur transaksi.', ja: '文化コンセプトや螺音 IP の商品を見て、取引フローを体験してください。', ko: '문화 콘셉트 상품이나 뤄인 IP 상품을 살펴보며 거래 흐름을 체험하세요.', ru: 'Изучите культурную концепцию или товар IP Луоинь, чтобы проверить путь транзакции.', ar: 'استكشف مفهوماً ثقافياً أو عنصراً من ملكية لويين لتجربة مسار المعاملة.' },
  'Explore the market': { id: 'Jelajahi pasar', ja: 'マーケットを見る', ko: '마켓 둘러보기', ru: 'Открыть маркет', ar: 'استكشف السوق' },
  'Simulate payment': { id: 'Simulasikan pembayaran', ja: '支払いをシミュレーション', ko: '결제 시뮬레이션', ru: 'Симулировать оплату', ar: 'محاكاة الدفع' },
  'Order summary': { id: 'Ringkasan pesanan', ja: '注文概要', ko: '주문 요약', ru: 'Сводка заказа', ar: 'ملخص الطلب' },
  'Demo delivery details': { id: 'Detail pengiriman demo', ja: 'デモ配送情報', ko: '데모 배송 정보', ru: 'Данные доставки демо', ar: 'تفاصيل تسليم العرض' },
  'Name': { id: 'Nama', ja: '名前', ko: '이름', ru: 'Имя', ar: 'الاسم' },
  'Email': { id: 'Email', ja: 'メール', ko: '이메일', ru: 'Электронная почта', ar: 'البريد الإلكتروني' },
  'Destination': { id: 'Tujuan', ja: '目的地', ko: '목적지', ru: 'Место назначения', ar: 'الوجهة' },
  'These fields validate the interface only and are discarded when the page changes.': { id: 'Kolom ini hanya memvalidasi antarmuka dan dibuang saat halaman berubah.', ja: 'これらの項目はインターフェース確認用で、ページが変わると破棄されます。', ko: '이 필드는 인터페이스 확인만을 위한 것이며 페이지가 바뀌면 폐기됩니다.', ru: 'Эти поля только проверяют интерфейс и удаляются при смене страницы.', ar: 'تتحقق هذه الحقول من الواجهة فقط وتُهمل عند تغيير الصفحة.' },
  'Demo payment method': { id: 'Metode pembayaran demo', ja: 'デモ決済方法', ko: '데모 결제 방법', ru: 'Способ оплаты демо', ar: 'طريقة دفع العرض' },
  'Card payment simulation': { id: 'Simulasi pembayaran kartu', ja: 'カード決済のシミュレーション', ko: '카드 결제 시뮬레이션', ru: 'Симуляция оплаты картой', ar: 'محاكاة الدفع بالبطاقة' },
  'Wallet payment simulation': { id: 'Simulasi pembayaran dompet', ja: 'ウォレット決済のシミュレーション', ko: '지갑 결제 시뮬레이션', ru: 'Симуляция оплаты кошельком', ar: 'محاكاة الدفع بالمحفظة' },
  'Complete demo payment': { id: 'Selesaikan pembayaran demo', ja: 'デモ決済を完了', ko: '데모 결제 완료', ru: 'Завершить оплату демо', ar: 'إكمال دفع العرض' },
  'Return to cart': { id: 'Kembali ke keranjang', ja: 'カートに戻る', ko: '장바구니로 돌아가기', ru: 'Вернуться в корзину', ar: 'العودة إلى السلة' },
  'There is nothing to simulate yet.': { id: 'Belum ada yang dapat disimulasikan.', ja: 'まだシミュレーションするものがありません。', ko: '아직 시뮬레이션할 항목이 없습니다.', ru: 'Пока нечего симулировать.', ar: 'لا يوجد ما يمكن محاكاته بعد.' },
  'Demo payment complete.': { id: 'Pembayaran demo selesai.', ja: 'デモ決済が完了しました。', ko: '데모 결제가 완료되었습니다.', ru: 'Оплата демо завершена.', ar: 'اكتمل دفع العرض.' },
  'Project demo created.': { id: 'Demo proyek dibuat.', ja: 'プロジェクトデモを作成しました。', ko: '프로젝트 데모가 생성되었습니다.', ru: 'Демо-проект создан.', ar: 'تم إنشاء عرض المشروع.' },
  'Reference': { id: 'Referensi', ja: '参照番号', ko: '참조 번호', ru: 'Ссылка', ar: 'المرجع' },
  'Demo order items': { id: 'Item pesanan demo', ja: 'デモ注文の商品', ko: '데모 주문 상품', ru: 'Товары демо-заказа', ar: 'عناصر طلب العرض' },
  'No payment settled, order saved, email sent or shipment created.': { id: 'Tidak ada pembayaran, pesanan, email, atau pengiriman nyata yang dibuat.', ja: '決済、注文保存、メール送信、発送は行われません。', ko: '실제 결제, 주문 저장, 이메일 발송, 배송 생성은 이루어지지 않습니다.', ru: 'Оплата не проведена, заказ не сохранён, письмо не отправлено, отправка не создана.', ar: 'لم تتم تسوية دفعة أو حفظ طلب أو إرسال بريد أو إنشاء شحنة.' },
  'No project direction was provided.': { id: 'Tidak ada arah proyek yang diberikan.', ja: 'プロジェクトの方向性は入力されていません。', ko: '프로젝트 방향이 제공되지 않았습니다.', ru: 'Направление проекта не указано.', ar: 'لم يتم تقديم اتجاه للمشروع.' },
  'This is not a quote, agreement, appointment or promise of human follow-up.': { id: 'Ini bukan penawaran, perjanjian, janji temu, atau janji tindak lanjut manusia.', ja: '見積もり、契約、予約、担当者対応の約束ではありません。', ko: '견적, 계약, 예약 또는 담당자 후속 대응 약속이 아닙니다.', ru: 'Это не предложение, соглашение, встреча или обещание ответа человека.', ar: 'هذا ليس عرض سعر أو اتفاقاً أو موعداً أو وعداً بمتابعة بشرية.' },
  'Continue exploring': { id: 'Lanjut menjelajah', ja: '探索を続ける', ko: '계속 둘러보기', ru: 'Продолжить изучение', ar: 'متابعة الاستكشاف' },
  'Share demo receipt': { id: 'Bagikan bukti demo', ja: 'デモ受付を共有', ko: '데모 영수증 공유', ru: 'Поделиться квитанцией демо', ar: 'مشاركة إيصال العرض' },
  'This demo receipt is no longer available.': { id: 'Bukti demo ini tidak lagi tersedia.', ja: 'このデモ受付は利用できなくなりました。', ko: '이 데모 영수증은 더 이상 이용할 수 없습니다.', ru: 'Эта квитанция демо больше недоступна.', ar: 'إيصال العرض هذا لم يعد متاحاً.' },
  'Demo receipts exist only while this page remains open and are never stored.': { id: 'Bukti demo hanya ada selama halaman ini terbuka dan tidak pernah disimpan.', ja: 'デモ受付はこのページを開いている間だけ存在し、保存されません。', ko: '데모 영수증은 이 페이지가 열려 있는 동안만 존재하며 저장되지 않습니다.', ru: 'Квитанции демо существуют только пока открыта страница и никогда не сохраняются.', ar: 'توجد إيصالات العرض ما دامت الصفحة مفتوحة ولا تُحفظ أبداً.' },
  'Demo total': { id: 'Total demo', ja: 'デモ合計', ko: '데모 합계', ru: 'Итого по демо', ar: 'إجمالي العرض' },
  'A local competition demo for commercial storytelling. It does not process real commerce.': { id: 'Demo kompetisi lokal untuk penceritaan komersial. Demo ini tidak memproses perdagangan nyata.', ja: '商業ストーリーテリングのためのローカル競技デモです。実際の商取引は処理しません。', ko: '상업적 스토리텔링을 위한 로컬 대회 데모입니다. 실제 거래는 처리하지 않습니다.', ru: 'Локальная конкурсная демонстрация коммерческого сторителлинга. Реальные торговые операции не обрабатываются.', ar: 'عرض محلي للمسابقة حول السرد التجاري. لا يعالج معاملات تجارية فعلية.' },
  'Remove': { id: 'Hapus', ja: '削除', ko: '삭제', ru: 'Удалить', ar: 'إزالة' },
  'Quantity': { id: 'Jumlah', ja: '数量', ko: '수량', ru: 'Количество', ar: 'الكمية' },
  'Demo subtotal': { id: 'Subtotal demo', ja: 'デモ小計', ko: '데모 소계', ru: 'Промежуточный итог демо', ar: 'المجموع الفرعي للعرض' },
  'Continue to demo payment': { id: 'Lanjutkan ke pembayaran demo', ja: 'デモ決済へ進む', ko: '데모 결제로 계속', ru: 'Перейти к оплате демо', ar: 'المتابعة إلى دفع العرض' },
  'CART / SESSION ONLY': { id: 'KERANJANG / SESI SAJA', ja: 'カート / セッション限定', ko: '장바구니 / 세션 전용', ru: 'КОРЗИНА / ТОЛЬКО СЕССИЯ', ar: 'السلة / للجلسة فقط' },
  'CHECKOUT / DEMO ONLY': { id: 'PEMBAYARAN / DEMO SAJA', ja: '決済 / デモのみ', ko: '결제 / 데모 전용', ru: 'ОПЛАТА / ТОЛЬКО ДЕМО', ar: 'الدفع / للعرض فقط' },
  'STORY CONTEXT': { id: 'KONTEKS CERITA', ja: 'ストーリーの文脈', ko: '스토리 맥락', ru: 'КОНТЕКСТ ИСТОРИИ', ar: 'سياق القصة' },
  'OPERATOR / REAL COMMERCE RESERVED': { id: 'OPERATOR / PERDAGANGAN NYATA DICADANGKAN', ja: 'オペレーター / 実取引は別管理', ko: '운영자 / 실제 상거래는 별도', ru: 'ОПЕРАТОР / РЕАЛЬНАЯ ТОРГОВЛЯ ОТДЕЛЬНО', ar: 'المشغّل / التجارة الفعلية منفصلة' },
  'ORDER ACCESS / DEMO BOUNDARY': { id: 'AKSES PESANAN / BATAS DEMO', ja: '注文アクセス / デモの境界', ko: '주문 접근 / 데모 경계', ru: 'ДОСТУП К ЗАКАЗАМ / ГРАНИЦА ДЕМО', ar: 'الوصول إلى الطلب / حدود العرض' },
  'DEMO ORDER RECEIPT': { id: 'BUKTI PESANAN DEMO', ja: 'デモ注文受付', ko: '데모 주문 영수증', ru: 'КВИТАНЦИЯ ДЕМО-ЗАКАЗА', ar: 'إيصال طلب العرض' },
  'DEMO PROJECT RECEIPT': { id: 'BUKTI PROYEK DEMO', ja: 'プロジェクトデモ受付', ko: '프로젝트 데모 영수증', ru: 'КВИТАНЦИЯ ДЕМО-ПРОЕКТА', ar: 'إيصال عرض المشروع' },
  'RECEIPT EXPIRED': { id: 'BUKTI KEDALUWARSA', ja: '受付の有効期限切れ', ko: '영수증 만료', ru: 'КВИТАНЦИЯ ИСТЕКЛА', ar: 'انتهت صلاحية الإيصال' },
  'QIONGVERSE DEMO MARKET / HAINAN': { id: 'PASAR DEMO QIONGVERSE / HAINAN', ja: 'QIONGVERSE デモマーケット / 海南', ko: 'QIONGVERSE 데모 마켓 / 하이난', ru: 'ДЕМО-МАРКЕТ QIONGVERSE / ХАЙНАНЬ', ar: 'سوق عرض QIONGVERSE / هاينان' },
  'PATH 01 / BUSINESS SERVICES': { id: 'JALUR 01 / LAYANAN BISNIS', ja: '経路 01 / ビジネスサービス', ko: '경로 01 / 비즈니스 서비스', ru: 'ПУТЬ 01 / БИЗНЕС-УСЛУГИ', ar: 'المسار 01 / خدمات الأعمال' },
  'PATH 02 / CULTURE SHOP': { id: 'JALUR 02 / TOKO BUDAYA', ja: '経路 02 / カルチャーショップ', ko: '경로 02 / 문화 상점', ru: 'ПУТЬ 02 / МАГАЗИН КУЛЬТУРЫ', ar: 'المسار 02 / متجر الثقافة' },
  'PATH 03 / LUOYIN IP': { id: 'JALUR 03 / IP LUOYIN', ja: '経路 03 / 螺音 IP', ko: '경로 03 / 뤄인 IP', ru: 'ПУТЬ 03 / IP ЛУОИНЬ', ar: 'المسار 03 / ملكية لويين' },
  'REFRESH / YOU MAY ALSO LIKE': { id: 'SEGARKAN / MUNGKIN ANDA SUKA', ja: '更新 / おすすめ', ko: '새로고침 / 추천 항목', ru: 'ОБНОВИТЬ / ВАМ МОЖЕТ ПОНРАВИТЬСЯ', ar: 'تحديث / قد يعجبك أيضاً' },
  'LOCAL PROJECT DEMO': { id: 'DEMO PROYEK LOKAL', ja: 'ローカルプロジェクトデモ', ko: '로컬 프로젝트 데모', ru: 'ЛОКАЛЬНАЯ ДЕМОНСТРАЦИЯ ПРОЕКТА', ar: 'عرض مشروع محلي' },
}

export function inline(language: Language, english: string, chinese: string): string {
  if (language === 'en') return english
  if (language === 'zh') return chinese
  return marketInlineCopy[english]?.[language] ?? sharedInlineCopy[english]?.[language] ?? inlineCopy[language]?.[english] ?? translateProjectText(english, language, chinese)
}

type TranslationTable = Record<Exclude<Language, 'en' | 'zh'>, Record<string, string>>

/*
 * This is intentionally local and deterministic. It covers reusable interface
 * language plus the exhibition vocabulary used by legacy content records.
 */
const projectTranslations: TranslationTable = {
  id: {
    'Reviewed source': 'Sumber yang ditinjau', 'Public orientation': 'Orientasi publik', 'Project visual context': 'Konteks visual proyek', 'AI curation boundary': 'Batas kurasi AI',
    'Open verified source desk': 'Buka meja sumber terverifikasi', 'Verified Source Desk': 'Meja Sumber Terverifikasi', 'Request human follow-up': 'Minta tindak lanjut manusia',
    'Enter main hall': 'Masuk aula utama', 'Open official English portal': 'Buka portal resmi berbahasa Inggris', 'Open immersive hall': 'Buka aula imersif', 'Enter': 'Masuk',
    'Open Hainan Unfolded': 'Buka Hainan Unfolded', 'Enter ShellSong': 'Masuk ShellSong', 'Open project market': 'Buka pasar proyek',
    'Read Hainan by the light.': 'Baca Hainan melalui cahaya.', 'Hear the tide answer.': 'Dengarkan jawaban pasang.', 'Let the story travel on.': 'Biarkan cerita terus berjalan.',
    'PROJECT DEMO': 'DEMO PROYEK', 'TRAVEL': 'PERJALANAN', 'MARKET': 'PASAR', 'LUOYIN': 'LUOYIN', 'YOU': 'ANDA',
    'Close source desk': 'Tutup meja sumber', 'Close handoff form': 'Tutup formulir tindak lanjut', 'Return to the exhibition': 'Kembali ke pameran',
    'Email address': 'Alamat email', 'Name (optional)': 'Nama (opsional)', 'Organisation (optional)': 'Organisasi (opsional)', 'Message': 'Pesan',
    'Loading exhibition…': 'Memuat pameran…', 'Listening to the tide...': 'Mendengarkan pasang...', 'Checking guide service...': 'Memeriksa layanan pemandu...',
  },
  ja: {
    'Reviewed source': '確認済み出典', 'Public orientation': '公共情報案内', 'Project visual context': 'プロジェクトの視覚的文脈', 'AI curation boundary': 'AIキュレーションの境界',
    'Open verified source desk': '確認済み出典デスクを開く', 'Verified Source Desk': '確認済み出典デスク', 'Request human follow-up': '担当者の対応を依頼',
    'Enter main hall': 'メインホールに入る', 'Open official English portal': '公式英語ポータルを開く', 'Open immersive hall': '没入型展示室を開く', 'Enter': '入る',
    'Open Hainan Unfolded': 'Hainan Unfolded を開く', 'Enter ShellSong': 'ShellSong に入る', 'Open project market': 'プロジェクトマーケットを開く',
    'Read Hainan by the light.': '光とともに海南を読む。', 'Hear the tide answer.': '潮の応答を聴く。', 'Let the story travel on.': '物語を旅立たせる。',
    'PROJECT DEMO': 'プロジェクトデモ', 'TRAVEL': '旅', 'MARKET': 'マーケット', 'LUOYIN': '螺音', 'YOU': 'あなた',
    'Close source desk': '出典デスクを閉じる', 'Close handoff form': '引き継ぎフォームを閉じる', 'Return to the exhibition': '展示に戻る',
    'Email address': 'メールアドレス', 'Name (optional)': '氏名（任意）', 'Organisation (optional)': '組織名（任意）', 'Message': 'メッセージ',
    'Loading exhibition…': '展示を読み込み中…', 'Listening to the tide...': '潮を聴いています...', 'Checking guide service...': 'ガイドサービスを確認中...',
  },
  ko: {
    'Reviewed source': '검토된 출처', 'Public orientation': '공공 정보 안내', 'Project visual context': '프로젝트 시각 맥락', 'AI curation boundary': 'AI 큐레이션 경계',
    'Open verified source desk': '검증된 출처 데스크 열기', 'Verified Source Desk': '검증된 출처 데스크', 'Request human follow-up': '사람의 후속 대응 요청',
    'Enter main hall': '메인 홀 입장', 'Open official English portal': '영문 공식 포털 열기', 'Open immersive hall': '몰입형 전시관 열기', 'Enter': '입장',
    'Open Hainan Unfolded': 'Hainan Unfolded 열기', 'Enter ShellSong': 'ShellSong 입장', 'Open project market': '프로젝트 마켓 열기',
    'Read Hainan by the light.': '빛으로 하이난을 읽다.', 'Hear the tide answer.': '조수의 응답을 듣다.', 'Let the story travel on.': '이야기가 계속 여행하게 하다.',
    'PROJECT DEMO': '프로젝트 데모', 'TRAVEL': '여행', 'MARKET': '마켓', 'LUOYIN': '뤄인', 'YOU': '나',
    'Close source desk': '출처 데스크 닫기', 'Close handoff form': '후속 양식 닫기', 'Return to the exhibition': '전시로 돌아가기',
    'Email address': '이메일 주소', 'Name (optional)': '이름(선택)', 'Organisation (optional)': '기관(선택)', 'Message': '메시지',
    'Loading exhibition…': '전시를 불러오는 중…', 'Listening to the tide...': '조수의 소리를 듣는 중...', 'Checking guide service...': '안내 서비스 확인 중...',
  },
  ru: {
    'Reviewed source': 'Проверенный источник', 'Public orientation': 'Публичная справка', 'Project visual context': 'Визуальный контекст проекта', 'AI curation boundary': 'Граница ИИ-курирования',
    'Open verified source desk': 'Открыть стол проверенных источников', 'Verified Source Desk': 'Стол проверенных источников', 'Request human follow-up': 'Запросить ответ человека',
    'Enter main hall': 'Войти в главный зал', 'Open official English portal': 'Открыть официальный англоязычный портал', 'Open immersive hall': 'Открыть иммерсивный зал', 'Enter': 'Войти',
    'Open Hainan Unfolded': 'Открыть Hainan Unfolded', 'Enter ShellSong': 'Войти в ShellSong', 'Open project market': 'Открыть маркет проекта',
    'Read Hainan by the light.': 'Читайте Хайнань через свет.', 'Hear the tide answer.': 'Услышьте ответ прилива.', 'Let the story travel on.': 'Пусть история продолжает путь.',
    'PROJECT DEMO': 'ДЕМОНСТРАЦИЯ ПРОЕКТА', 'TRAVEL': 'ПУТЕШЕСТВИЕ', 'MARKET': 'МАРКЕТ', 'LUOYIN': 'ЛУОИНЬ', 'YOU': 'ВЫ',
    'Close source desk': 'Закрыть стол источников', 'Close handoff form': 'Закрыть форму передачи', 'Return to the exhibition': 'Вернуться к выставке',
    'Email address': 'Адрес электронной почты', 'Name (optional)': 'Имя (необязательно)', 'Organisation (optional)': 'Организация (необязательно)', 'Message': 'Сообщение',
    'Loading exhibition…': 'Загрузка выставки…', 'Listening to the tide...': 'Слушаем прилив...', 'Checking guide service...': 'Проверяем сервис гида...',
  },
  ar: {
    'Reviewed source': 'مصدر مُراجع', 'Public orientation': 'إرشاد عام', 'Project visual context': 'سياق بصري للمشروع', 'AI curation boundary': 'حدود تنسيق الذكاء الاصطناعي',
    'Open verified source desk': 'فتح مكتب المصادر المتحققة', 'Verified Source Desk': 'مكتب المصادر المتحققة', 'Request human follow-up': 'طلب متابعة بشرية',
    'Enter main hall': 'دخول القاعة الرئيسية', 'Open official English portal': 'فتح البوابة الرسمية الإنجليزية', 'Open immersive hall': 'فتح القاعة الغامرة', 'Enter': 'دخول',
    'Open Hainan Unfolded': 'فتح Hainan Unfolded', 'Enter ShellSong': 'دخول ShellSong', 'Open project market': 'فتح سوق المشروع',
    'Read Hainan by the light.': 'اقرأ هاينان عبر الضوء.', 'Hear the tide answer.': 'استمع إلى جواب المد.', 'Let the story travel on.': 'دع الحكاية تواصل رحلتها.',
    'PROJECT DEMO': 'عرض المشروع', 'TRAVEL': 'السفر', 'MARKET': 'السوق', 'LUOYIN': 'لويين', 'YOU': 'أنت',
    'Close source desk': 'إغلاق مكتب المصادر', 'Close handoff form': 'إغلاق نموذج المتابعة', 'Return to the exhibition': 'العودة إلى المعرض',
    'Email address': 'البريد الإلكتروني', 'Name (optional)': 'الاسم (اختياري)', 'Organisation (optional)': 'الجهة (اختياري)', 'Message': 'الرسالة',
    'Loading exhibition…': 'جارٍ تحميل المعرض…', 'Listening to the tide...': 'نصغي إلى المد...', 'Checking guide service...': 'جارٍ التحقق من خدمة الدليل...',
  },
}

const essentialExhibitionTerms: Record<string, Record<Exclude<Language, 'en' | 'zh'>, string>> = {
  'Tropical Island Hall': { id: 'Aula Pulau Tropis', ja: '熱帯海島展示室', ko: '열대 섬 전시관', ru: 'Зал тропического острова', ar: 'قاعة الجزيرة الاستوائية' },
  'Li & Miao Intangible Heritage Hall': { id: 'Aula Warisan Takbenda Li dan Miao', ja: '黎族・苗族無形文化遺産展示室', ko: '리·먀오 무형유산 전시관', ru: 'Зал нематериального наследия Ли и Мяо', ar: 'قاعة التراث غير المادي لشعبي لي ومياو' },
  'Wenchang Aerospace Hall': { id: 'Aula Kedirgantaraan Wenchang', ja: '文昌宇宙開発展示室', ko: '원창 우주항공 전시관', ru: 'Аэрокосмический зал Вэньчан', ar: 'قاعة ونتشانغ للفضاء' },
  'Dongfang Rosewood Hall': { id: 'Aula Kayu Mawar Dongfang', ja: '東方花梨展示室', ko: '둥팡 화리목 전시관', ru: 'Зал палисандра Дунфан', ar: 'قاعة خشب الورد في دونغفانغ' },
  'Beautiful Villages Hall': { id: 'Aula Desa Indah', ja: '美しい農村展示室', ko: '아름다운 농촌 전시관', ru: 'Зал красивых деревень', ar: 'قاعة القرى الجميلة' },
  'Free Trade Port': { id: 'Pelabuhan Perdagangan Bebas', ja: '自由貿易港', ko: '자유무역항', ru: 'Порт свободной торговли', ar: 'ميناء التجارة الحرة' },
}

type LegacyTranslation = Record<Exclude<Language, 'en' | 'zh'>, string>

/*
 * Older exhibit records have a consistent, source-bounded vocabulary. These
 * are concise translations of that vocabulary, not a visitor-facing notice
 * claiming that a translation exists. Exact catalogue entries always win.
 */
const legacyVocabulary: Array<{ test: RegExp; value: LegacyTranslation }> = [
  { test: /AIGC concept exhibit|AIGC/i, value: { id: 'Eksplorasi konsep AIGC untuk ruang digital ini; bukan benda asli, produk, atau bukti komersial.', ja: 'このデジタル展示室のための AIGC コンセプト研究です。実在物、商品、商業的証拠ではありません。', ko: '이 디지털 전시관을 위한 AIGC 개념 연구입니다. 실물, 상품 또는 상업적 증거가 아닙니다.', ru: 'Концептуальное исследование AIGC для этого цифрового зала; не реальный объект, товар или коммерческое доказательство.', ar: 'دراسة مفهومية مولدة بالذكاء الاصطناعي لهذه القاعة الرقمية؛ وليست قطعة حقيقية أو منتجاً أو دليلاً تجارياً.' } },
  { test: /not (a|an)|does not|not verify|not identify|not establish|not describe|cannot/i, value: { id: 'Materi ini hanya memberi konteks kuratorial proyek dan tidak membuktikan fakta, layanan, ketersediaan, atau hasil komersial tertentu.', ja: 'この素材はプロジェクトのキュレーション文脈のみを示し、特定の事実、サービス、利用可否、商業的結果を裏付けるものではありません。', ko: '이 자료는 프로젝트 큐레이션 맥락만 제공하며 특정 사실, 서비스, 이용 가능성 또는 상업적 결과를 입증하지 않습니다.', ru: 'Этот материал даёт только кураторский контекст проекта и не подтверждает конкретные факты, услуги, доступность или коммерческий результат.', ar: 'توفر هذه المادة سياقاً قيّماً للمشروع فقط ولا تثبت حقائق أو خدمات أو توافراً أو نتائج تجارية محددة.' } },
  { test: /project-supplied|project-provided|supplied (image|view|scene|visual|asset|island)/i, value: { id: 'Materi visual yang disediakan proyek untuk pembacaan kuratorial; bukan sumber fakta atau catatan resmi.', ja: 'プロジェクト提供の視覚素材によるキュレーションのための読解です。事実の出典や公式記録ではありません。', ko: '프로젝트 제공 시각 자료를 통한 큐레이션 읽기입니다. 사실 출처나 공식 기록이 아닙니다.', ru: 'Кураторское прочтение на основе визуального материала проекта; это не источник фактов и не официальный документ.', ar: 'قراءة قيّمية تعتمد على مادة بصرية مقدمة من المشروع؛ وليست مصدراً للحقائق أو سجلاً رسمياً.' } },
  { test: /source|UNESCO|official|portal|reviewed/i, value: { id: 'Tautan sumber publik digunakan untuk orientasi saja; periksa penerbit asli untuk informasi terkini.', ja: '公開情報源へのリンクは案内目的に限られます。最新情報は原発行者で確認してください。', ko: '공개 출처 링크는 안내 목적으로만 사용됩니다. 최신 정보는 원 발행처에서 확인하세요.', ru: 'Ссылка на публичный источник предназначена только для ориентации; актуальную информацию проверяйте у первоначального издателя.', ar: 'يُستخدم رابط المصدر العام للتوجيه فقط؛ تحقق من الناشر الأصلي للحصول على المعلومات الحالية.' } },
  { test: /Hall|Room|Study|Atlas|Archive|Gateway|Reading|Horizon|Path|Table|Coast|Village|Craft|Pattern|Light|Rhythm|Exchange/i, value: { id: 'Kajian kuratorial HAINAN QIONGVERSE', ja: 'HAINAN QIONGVERSE のキュレーション研究', ko: 'HAINAN QIONGVERSE 큐레이션 연구', ru: 'Кураторское исследование HAINAN QIONGVERSE', ar: 'دراسة قيّمية من HAINAN QIONGVERSE' } },
]

export function translateProjectText(english: string, language: Language, chinese?: string): string {
  if (language === 'en') return english
  if (language === 'zh') return chinese ?? english
  const exact = essentialExhibitionTerms[english]?.[language] ?? projectTranslations[language][english]
  if (exact) return exact
  const vocabulary = legacyVocabulary.find((entry) => entry.test.test(english))
  if (vocabulary) return vocabulary.value[language]
  /* The authored Chinese peer is retained when a legacy entry lacks a vetted
   * seven-language value. This prevents an English-only fallback from leaking
   * into a non-English public route while the entry is migrated. */
  return chinese ?? essentialExhibitionTerms[english]?.[language] ?? projectTranslations[language][english] ?? english
}

/** Populate legacy static records once at module load so older `[language]`
 * reads cannot leak the old generic fallback when a non-English/non-Chinese
 * locale is selected. */
export function completeLocalizationTree<T>(value: T): T {
  if (!value || typeof value !== 'object') return value
  if (Array.isArray(value)) {
    value.forEach((item) => completeLocalizationTree(item))
    return value
  }
  const record = value as Record<string, unknown>
  if (typeof record.en === 'string' && typeof record.zh === 'string') {
    supportedLanguages.forEach((language) => {
      if (record[language] === undefined) record[language] = translateProjectText(record.en as string, language, record.zh as string)
    })
  }
  Object.values(record).forEach((item) => completeLocalizationTree(item))
  return value
}

export function assertRuntimeLocalized(value: unknown, path = 'runtime copy'): asserts value is RuntimeLocalized {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path} is not a localized record`)
  const record = value as Record<string, unknown>
  const missing = supportedLanguages.filter((language) => typeof record[language] !== 'string' || !(record[language] as string).trim())
  if (missing.length) throw new Error(`${path} is missing locales: ${missing.join(', ')}`)
}

export function assertLocalizationTree(value: unknown, path = 'runtime copy'): void {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertLocalizationTree(item, `${path}[${index}]`))
    return
  }
  const record = value as Record<string, unknown>
  if (typeof record.en === 'string' || typeof record.zh === 'string') assertRuntimeLocalized(record, path)
  Object.entries(record).forEach(([key, item]) => assertLocalizationTree(item, `${path}.${key}`))
}

/** Use for small authored runtime lists while legacy data is being migrated. */
export function runtimeCopy(en: string, zh: string): RuntimeLocalized {
  const value = { en, zh } as Localized
  completeLocalizationTree(value)
  assertRuntimeLocalized(value, 'runtime copy')
  return value as RuntimeLocalized
}

export function numberLocale(language: Language) {
  return { en: 'en-US', zh: 'zh-CN', id: 'id-ID', ja: 'ja-JP', ko: 'ko-KR', ru: 'ru-RU', ar: 'ar' }[language]
}
