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
}

export function inline(language: Language, english: string, chinese: string): string {
  if (language === 'en') return english
  if (language === 'zh') return chinese
  return sharedInlineCopy[english]?.[language] ?? inlineCopy[language]?.[english] ?? translateProjectText(english, language, chinese)
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
