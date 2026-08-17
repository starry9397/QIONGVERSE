import { assertLocalizationTree, localize, type Language, type RuntimeLocalized } from './i18n'

export type LuoyinTourPage = 'home' | 'map' | 'travel' | 'market' | 'source-desk' | 'hall' | 'shellsong'

export type LuoyinTourContext = {
  page: LuoyinTourPage
  sectionId: string
  cueId: string
  zoneId?: string
  exhibitId?: string
  productId?: string
}

export type LuoyinTourCue = {
  id: string
  page: LuoyinTourPage
  title: RuntimeLocalized
  text: RuntimeLocalized
  question: RuntimeLocalized
  sourceClass: 'project_context' | 'shellsong_fiction' | 'verified_primary_source' | 'ai_suggestion'
}

const cue = (
  id: string,
  page: LuoyinTourPage,
  title: RuntimeLocalized,
  text: RuntimeLocalized,
  question: RuntimeLocalized,
  sourceClass: LuoyinTourCue['sourceClass'] = 'project_context',
): LuoyinTourCue => ({ id, page, title, text, question, sourceClass })

export const luoyinTourCues: LuoyinTourCue[] = [
  cue('hall-orientation', 'hall',
    { en: 'Immersive hall orientation', zh: '沉浸展厅导览', id: 'Orientasi ruang imersif', ja: '没入型展示室の案内', ko: '몰입형 전시관 안내', ru: 'Ориентация в иммерсивном зале', ar: 'إرشاد القاعة الغامرة' },
    { en: 'Move slowly through the authored visual world. I can explain the selected exhibit and its project context, but I will not invent a real site or operational fact.', zh: '请在项目创作的视觉大世界中慢慢移动。我可以介绍当前展项与项目语境，但不会虚构真实地点或运营事实。', id: 'Bergerak perlahan melalui dunia visual yang dikurasi. Saya dapat menjelaskan karya dan konteks proyek, tetapi tidak akan mengarang tempat nyata atau fakta operasional.', ja: 'プロジェクト制作の視覚世界をゆっくり歩きます。選択した展示と文脈を説明できますが、実在の場所や運用情報は作りません。', ko: '프로젝트가 만든 시각 세계를 천천히 이동하세요. 선택한 전시와 프로젝트 맥락은 설명하지만 실제 장소나 운영 사실을 만들지 않습니다.', ru: 'Двигайтесь медленно по визуальному миру проекта. Я объясню выбранный экспонат и контекст проекта, но не стану придумывать реальное место или операционный факт.', ar: 'تحرك ببطء داخل العالم البصري الذي صممه المشروع. يمكنني شرح المعروض وسياقه، لكنني لا أختلق مكاناً حقيقياً أو حقيقة تشغيلية.' },
    { en: 'What can I notice in this immersive hall?', zh: '我可以在这个沉浸展厅中观察什么？', id: 'Apa yang dapat saya amati di ruang imersif ini?', ja: 'この没入型展示室では何に注目できますか？', ko: '이 몰입형 전시관에서 무엇을 살펴볼 수 있나요?', ru: 'На что обратить внимание в этом иммерсивном зале?', ar: 'ما الذي يمكنني ملاحظته في هذه القاعة الغامرة؟' }),
  cue('home-free-trade', 'home',
    { en: 'Free Trade Port reading room', zh: '自贸港公共阅览室', id: 'Ruang baca Pelabuhan Perdagangan Bebas', ja: '自由貿易港の公共読書室', ko: '자유무역항 공공 열람실', ru: 'Публичная читальня порта свободной торговли', ar: 'قاعة القراءة العامة لميناء التجارة الحرة' },
    { en: 'Start here for a careful orientation to current public information. I can guide you to the official portal, but I cannot decide eligibility or policy outcomes.', zh: '从这里开始了解当前公共信息。我可以带你前往官方门户，但不能判断资格或政策结果。', id: 'Mulailah dari sini untuk orientasi informasi publik terkini. Saya dapat mengantar ke portal resmi, tetapi tidak menentukan kelayakan atau hasil kebijakan.', ja: '現在の公開情報を慎重に読む入口です。公式ポータルへ案内できますが、資格や政策の結果は判断できません。', ko: '현재 공개 정보를 차분히 확인하는 입구입니다. 공식 포털로 안내할 수 있지만 자격이나 정책 결과를 판단하지는 않습니다.', ru: 'Это вход для осторожного знакомства с актуальной публичной информацией. Я могу направить на официальный портал, но не определяю право или результат политики.', ar: 'هذه بوابة للتعرّف الحذر إلى المعلومات العامة الحالية. يمكنني إرشادك إلى البوابة الرسمية، لكنني لا أحدد الأهلية أو نتائج السياسة.' },
    { en: 'Tell me how to use the Free Trade Port reading room.', zh: '请介绍如何使用自贸港阅览室。', id: 'Jelaskan cara menggunakan ruang baca Pelabuhan Perdagangan Bebas.', ja: '自由貿易港の読書室の使い方を教えてください。', ko: '자유무역항 열람실 이용 방법을 알려 주세요.', ru: 'Расскажи, как пользоваться читальней порта свободной торговли.', ar: 'أخبرني كيف أستخدم قاعة قراءة ميناء التجارة الحرة.' },
    'verified_primary_source'),
  cue('home-exhibition-wheel', 'home',
    { en: 'Five cultural halls', zh: '五个文化展厅', id: 'Lima ruang budaya', ja: '五つの文化展示室', ko: '다섯 문화 전시관', ru: 'Пять культурных залов', ar: 'القاعات الثقافية الخمس' },
    { en: 'Choose a hall to read Hainan through coast, heritage, aerospace, rosewood, or village life. These are project-curated visual layers, not a booking directory.', zh: '选择展厅，从海岸、非遗、航天、花梨或乡村生活阅读海南。这些是项目策展视觉层，不是预订目录。', id: 'Pilih ruang untuk membaca Hainan melalui pesisir, warisan, kedirgantaraan, kayu mawar, atau kehidupan desa. Ini adalah lapisan visual kuratorial proyek, bukan direktori pemesanan.', ja: '海岸、文化遺産、宇宙開発、花梨、農村の暮らしから海南を読みます。プロジェクトによる視覚的キュレーションであり、予約一覧ではありません。', ko: '해안, 유산, 우주항공, 화리목, 농촌의 삶을 통해 하이난을 읽을 전시관을 선택하세요. 프로젝트 큐레이션 시각 층이며 예약 목록이 아닙니다.', ru: 'Выберите зал и читайте Хайнань через побережье, наследие, космос, палисандр или деревенскую жизнь. Это кураторский визуальный слой проекта, а не каталог бронирования.', ar: 'اختر قاعة لقراءة هاينان عبر الساحل أو التراث أو الفضاء أو خشب الورد أو حياة القرى. هذه طبقة بصرية من تنسيق المشروع وليست دليلاً للحجز.' },
    { en: 'Which cultural hall should I visit first?', zh: '我应该先参观哪个文化展厅？', id: 'Ruang budaya mana yang sebaiknya saya kunjungi lebih dulu?', ja: '最初にどの文化展示室を訪れるべきですか？', ko: '어느 문화 전시관부터 방문하면 좋을까요?', ru: 'Какой культурный зал посетить первым?', ar: 'أي قاعة ثقافية ينبغي أن أزور أولاً؟' }),
  cue('home-beyond-halls', 'home',
    { en: 'Beyond the halls', zh: '展厅之外', id: 'Di luar ruang pamer', ja: '展示室の外へ', ko: '전시관 너머', ru: 'За пределами залов', ar: 'ما وراء القاعات' },
    { en: 'Travel, ShellSong, and the project market extend the same Hainan story in different formats. I can point out what is fictional, reviewed, or demonstration-only.', zh: '旅行、ShellSong 与项目商城以不同形式延伸同一琼境叙事。我会说明哪些是虚构、已核验或仅为演示。', id: 'Perjalanan, ShellSong, dan pasar proyek melanjutkan kisah Hainan dalam format berbeda. Saya dapat menjelaskan mana yang fiktif, ditinjau, atau hanya demonstrasi.', ja: '旅、ShellSong、プロジェクトマーケットが異なる形式で海南の物語を広げます。虚構、確認済み、デモのみの違いを説明できます。', ko: '여행, ShellSong, 프로젝트 마켓이 서로 다른 형식으로 같은 하이난 이야기를 확장합니다. 허구, 검토 완료, 데모 전용의 차이를 알려 드립니다.', ru: 'Путешествие, ShellSong и проектный маркет продолжают историю Хайнаня в разных форматах. Я объясню, что является вымыслом, проверенным материалом или демонстрацией.', ar: 'توسّع تجربة السفر وShellSong وسوق المشروع قصة هاينان بصيغ مختلفة. يمكنني توضيح ما هو خيالي أو مُراجع أو مخصص للعرض التجريبي.' },
    { en: 'Guide me through the three experiences.', zh: '请带我浏览三个独立体验。', id: 'Pandu saya melalui tiga pengalaman.', ja: '三つの体験を案内してください。', ko: '세 가지 경험을 안내해 주세요.', ru: 'Проведи меня через три опыта.', ar: 'أرشدني عبر التجارب الثلاث.' },
    'shellsong_fiction'),
  cue('map-reading', 'map',
    { en: 'Hainan regional reading map', zh: '海南区域阅读地图', id: 'Peta bacaan wilayah Hainan', ja: '海南地域リーディングマップ', ko: '하이난 지역 읽기 지도', ru: 'Карта регионального чтения Хайнаня', ar: 'خريطة القراءة الإقليمية لهاينان' },
    { en: 'Select a region to read its authored orientation and reviewed source boundary. The artwork is a cultural reading interface, not a survey map or live navigation tool.', zh: '选择地区，阅读项目导览与已核验来源边界。这幅图是文化阅读界面，不是测绘图或实时导航工具。', id: 'Pilih wilayah untuk membaca orientasi proyek dan batas sumber yang ditinjau. Karya ini adalah antarmuka bacaan budaya, bukan peta survei atau navigasi langsung.', ja: '地域を選ぶと、プロジェクト案内と確認済み出典の範囲を読めます。測量図やリアルタイムナビではありません。', ko: '지역을 선택하면 프로젝트 안내와 검토된 출처의 범위를 읽을 수 있습니다. 측량 지도나 실시간 내비게이션이 아닙니다.', ru: 'Выберите регион, чтобы прочитать авторскую ориентацию проекта и границы проверенных источников. Это интерфейс культурного чтения, а не геодезическая карта или навигация в реальном времени.', ar: 'اختر منطقة لقراءة إرشاد المشروع ونطاق المصدر المُراجع. هذا العمل واجهة قراءة ثقافية وليس خريطة مسح أو أداة ملاحة مباشرة.' },
    { en: 'What can I safely learn from this regional map?', zh: '我可以从这张区域地图中了解什么？', id: 'Apa yang dapat saya pelajari dengan aman dari peta wilayah ini?', ja: 'この地域マップから安全に学べることは何ですか？', ko: '이 지역 지도에서 무엇을 안전하게 알 수 있나요?', ru: 'Что можно надёжно узнать из этой региональной карты?', ar: 'ماذا يمكنني أن أتعلم بأمان من هذه الخريطة الإقليمية؟' }),
  cue('travel-atlas', 'travel',
    { en: 'Hainan Unfolded travel atlas', zh: '海南展开旅行图鉴', id: 'Atlas perjalanan Hainan Unfolded', ja: 'Hainan Unfolded 旅行アトラス', ko: 'Hainan Unfolded 여행 아틀라스', ru: 'Туристический атлас Hainan Unfolded', ar: 'أطلس سفر Hainan Unfolded' },
    { en: 'Build a cultural route from the reviewed catalogue. It is an interpretive plan, not live navigation, booking, availability, or safety advice.', zh: '从已核验目录编排文化路线。这是文化解读方案，不是实时导航、预订、可用性或安全建议。', id: 'Susun rute budaya dari katalog yang ditinjau. Ini adalah rencana interpretatif, bukan navigasi langsung, pemesanan, ketersediaan, atau nasihat keselamatan.', ja: '確認済みカタログから文化ルートを組み立てます。リアルタイムナビ、予約、提供状況、安全助言ではありません。', ko: '검토된 카탈로그로 문화 경로를 구성합니다. 실시간 내비게이션, 예약, 이용 가능성 또는 안전 조언이 아닙니다.', ru: 'Составьте культурный маршрут по проверенному каталогу. Это интерпретационный план, а не навигация в реальном времени, бронирование, гарантия доступности или совет по безопасности.', ar: 'أنشئ مساراً ثقافياً من الكتالوج المُراجع. إنه مخطط تفسيري وليس ملاحة مباشرة أو حجزاً أو ضماناً للتوفر أو نصيحة سلامة.' },
    { en: 'Help me understand this route planner.', zh: '请介绍这条路线编排器。', id: 'Bantu saya memahami penyusun rute ini.', ja: 'このルートプランナーについて教えてください。', ko: '이 경로 플래너를 설명해 주세요.', ru: 'Объясни этот планировщик маршрутов.', ar: 'ساعدني على فهم مخطط المسارات هذا.' }),
  cue('market-demo', 'market',
    { en: 'Project demonstration market', zh: '项目演示商城', id: 'Pasar demonstrasi proyek', ja: 'プロジェクトデモマーケット', ko: '프로젝트 데모 마켓', ru: 'Демонстрационный маркет проекта', ar: 'سوق المشروع التجريبي' },
    { en: 'Browse cultural concepts and Luoyin IP studies. Prices, stock, checkout, delivery, and receipts exist only to demonstrate the interface in this session.', zh: '浏览文化概念与螺音 IP 研究。价格、库存、结算、配送和收据仅用于本次会话的界面演示。', id: 'Jelajahi konsep budaya dan studi IP Luoyin. Harga, stok, pembayaran, pengiriman, dan tanda terima hanya mendemonstrasikan antarmuka dalam sesi ini.', ja: '文化コンセプトと螺音IP研究を見られます。価格、在庫、決済、配送、レシートはこのセッションのUIデモのみです。', ko: '문화 콘셉트와 뤄인 IP 연구를 살펴보세요. 가격, 재고, 결제, 배송, 영수증은 현재 세션의 UI 데모일 뿐입니다.', ru: 'Здесь можно просмотреть культурные концепции и исследования IP Луоинь. Цены, наличие, оплата, доставка и чеки существуют только как демонстрация интерфейса в этой сессии.', ar: 'تصفح المفاهيم الثقافية وأبحاث IP الخاصة بلويين. الأسعار والمخزون والدفع والتوصيل والإيصالات مخصصة لعرض الواجهة في هذه الجلسة فقط.' },
    { en: 'How does this project market demo work?', zh: '这个项目演示商城如何使用？', id: 'Bagaimana cara kerja demo pasar proyek ini?', ja: 'このプロジェクトマーケットのデモはどう使いますか？', ko: '이 프로젝트 마켓 데모는 어떻게 작동하나요?', ru: 'Как работает демонстрация проектного маркета?', ar: 'كيف يعمل عرض سوق المشروع هذا؟' }),
  cue('source-desk', 'source-desk',
    { en: 'Verified source desk', zh: '已核验来源服务台', id: 'Meja sumber terverifikasi', ja: '確認済み出典デスク', ko: '검증된 출처 데스크', ru: 'Стол проверенных источников', ar: 'مكتب المصادر المتحققة' },
    { en: 'Here, reviewed public sources, project context, and AI curation are kept separate. Open an original source before relying on current details.', zh: '这里会区分已核验公开来源、项目语境与 AI 编排。涉及当前详情时，请先打开原始来源核查。', id: 'Sumber publik yang ditinjau, konteks proyek, dan kurasi AI dipisahkan di sini. Buka sumber asli sebelum mengandalkan rincian terkini.', ja: '確認済み公開出典、プロジェクト文脈、AIキュレーションを分けて表示します。現在の詳細は原典で確認してください。', ko: '검토된 공개 출처, 프로젝트 맥락, AI 큐레이션을 구분합니다. 현재 세부 사항은 원문 출처에서 확인하세요.', ru: 'Здесь отдельно показаны проверенные публичные источники, контекст проекта и курирование ИИ. Перед использованием актуальных деталей откройте оригинальный источник.', ar: 'تُفصل هنا المصادر العامة المُراجعة وسياق المشروع وتنسيق الذكاء الاصطناعي. افتح المصدر الأصلي قبل الاعتماد على التفاصيل الحالية.' },
    { en: 'How should I read the source labels?', zh: '我应该如何理解来源标签？', id: 'Bagaimana membaca label sumber?', ja: '出典ラベルはどう読めばよいですか？', ko: '출처 라벨은 어떻게 읽어야 하나요?', ru: 'Как читать метки источников?', ar: 'كيف أقرأ تسميات المصادر؟' },
    'verified_primary_source'),
]

assertLocalizationTree(luoyinTourCues, 'Luoyin tour cues')

export function findTourCue(cueId: string) {
  return luoyinTourCues.find((cue) => cue.id === cueId) || null
}

export function tourCueText(cue: LuoyinTourCue, language: Language) {
  return { title: localize(cue.title, language), text: localize(cue.text, language), question: localize(cue.question, language) }
}
