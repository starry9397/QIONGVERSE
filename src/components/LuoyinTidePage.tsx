import { useEffect, useRef, useState } from 'react'
import type { Language } from '../data'
import { assertLocalizationTree, localize, type RuntimeLocalized } from '../i18n'
import LanguageSelector from './LanguageSelector'
import { ShellSongModel } from './ShellSongModel'
import ShareChooser from './ShareChooser'
import { copyText, downloadBlob, publicShareUrl } from '../share-utils'
import './luoyin-tide.css'

type PosterRatio = 'square' | 'portrait' | 'story'
type Props = { language: Language; onChangeLanguage: (language: Language) => void; onExit: () => void; onOpenHall?: (themeId: string) => void; onAskLuoyin?: (themeId: string) => void }

type Copy = {
  nav: string[]
  soundOn: string
  soundOff: string
  pause: string
  play: string
  replay: string
  fiction: string
  originKicker: string
  originTitle: string
  origin: { title: string; body: string }[]
  signalsKicker: string
  signalsTitle: string
  signalsBody: string
  signals: { term: string; body: string }[]
  diaryKicker: string
  diaryTitle: string
  diary: { title: string; body: string; image: string }[]
  shareKicker: string
  shareTitle: string
  shareBody: string
  chooseLine: string
  choosePose: string
  chooseRatio: string
  download: string
  share: string
  copy: string
  shareStatus: string
  footer: string
}

const imagePath = {
  curious: '/shellsong/images/curious.webp',
  listening: '/shellsong/images/listening.webp',
  resonance: '/shellsong/images/resonance.webp',
  celebration: '/shellsong/images/celebration.webp',
  sleeping: '/shellsong/images/sleeping.webp',
  flying: '/shellsong/images/flying.webp',
}

const copy: Record<Language, Copy> = {
  en: {
    nav: ['Origin', 'Signals', 'Tide Diary', 'Cast a Bubble'], soundOn: 'Sound on', soundOff: 'Sound off', pause: 'Pause CG', play: 'Play CG', replay: 'Replay CG', fiction: 'ShellSong is an original fictional character. Her world is a story, not a historical or official account.',
    originKicker: '01 / ORIGIN OF A SONG', originTitle: 'Three memories became one small voice.',
    origin: [
      { title: 'The light', body: 'When an ancient rosewood spirit broke apart, one quiet thread of light chose not to become a tree again.' },
      { title: 'The conch', body: 'At a tide pool on Hainan’s east coast, a pink conch had held sea songs, fishing calls and monsoon rain for a thousand years.' },
      { title: 'The first dawn', body: 'Moonlight, saltwater and the small remaining light met in the spiral. At dawn, ShellSong looked out and began to listen.' },
    ],
    signalsKicker: '02 / CHARACTER SIGNALS', signalsTitle: 'Read the details that make her ShellSong.', signalsBody: 'She is tiny by design, but every detail carries a different kind of listening.',
    signals: [
      { term: 'Wave hair', body: 'Blue tide hair holds a thread of amber rosewood light.' }, { term: 'Conch ears', body: 'Small spiral ears turn toward the farthest water-borne sound.' }, { term: 'Rosewood sprout', body: 'A tiny sprout bends with the tide and stands tall when resonance is near.' }, { term: 'Pink conch', body: 'Her conch is both home and instrument: it listens, then carries a song onward.' }, { term: 'Foam base', body: 'She has no wings. A soft piece of sea foam keeps her aloft.' },
    ],
    diaryKicker: '03 / TIDE DIARY', diaryTitle: 'One small guide, six ways to listen.',
    diary: [
      { title: 'Curious', body: 'Every new sound makes her lean closer.', image: imagePath.curious }, { title: 'Listening', body: 'She holds the conch near and lets the tide speak first.', image: imagePath.listening }, { title: 'Resonance', body: 'Near a fragment of memory, sea foam takes on a quiet amber glow.', image: imagePath.resonance }, { title: 'Celebration', body: 'When a voice is found, she spins and leaves a bright trail of bubbles.', image: imagePath.celebration }, { title: 'Dreaming', body: 'After a long tide, she folds into her shell and lets the coast keep watch.', image: imagePath.sleeping }, { title: 'Flying', body: 'A little foam is enough to carry a very large heart.', image: imagePath.flying },
    ],
    shareKicker: '04 / BUBBLE CASTING STATION', shareTitle: 'Send one small song outward.', shareBody: 'Compose an original ShellSong image in this browser. Nothing is uploaded, saved or linked to an account.', chooseLine: 'Choose a line', choosePose: 'Choose a pose', chooseRatio: 'Choose a format', download: 'Download image', share: 'Share image', copy: 'Copy caption', shareStatus: 'Your bubble is made here, on this device.', footer: 'ShellSong / 螺音 — an original fictional digital character.',
  },
  zh: {
    nav: ['诞生', '形象信号', '潮汐日记', '吹出泡沫'], soundOn: '打开声音', soundOff: '关闭声音', pause: '暂停 CG', play: '播放 CG', replay: '重播 CG', fiction: '螺音是原创虚构角色。她的世界观是角色叙事，不是历史事实或官方说明。',
    originKicker: '01 / 声音的诞生', originTitle: '三段记忆，变成一个小小的声音。',
    origin: [
      { title: '那缕光', body: '花梨神木崩解时，一缕灵光没有重新成为树木，它选择去寻找一位能带它回来的伙伴。' }, { title: '那枚螺', body: '海南东海岸的潮间带里，一枚粉色海螺收藏了潮声、渔歌与季风雨。' }, { title: '第一次黎明', body: '月光、海水和那缕灵光在螺旋深处相遇。第一束晨光抵达时，螺音探出了头。' },
    ],
    signalsKicker: '02 / 角色信号', signalsTitle: '认识让她成为螺音的每一处细节。', signalsBody: '她的身体很小，但每一件细节都在聆听不同的声音。',
    signals: [
      { term: '浪花长发', body: '潮蓝色的发丝中，藏着几缕花梨琥珀色的灵光。' }, { term: '海螺耳朵', body: '小小的螺旋耳会转向来自远海的声音。' }, { term: '花梨芽苞', body: '她头顶的嫩枝会随潮摆动，也会在共振到来时竖起。' }, { term: '粉色海螺', body: '海螺既是她的家，也是她用来聆听和传音的法器。' }, { term: '海沫底座', body: '她没有翅膀，一小团柔软的海沫托着她飞行。' },
    ],
    diaryKicker: '03 / 潮汐日记', diaryTitle: '一位小向导，六种聆听方式。',
    diary: [
      { title: '好奇', body: '每一种陌生的声音，都会让她再靠近一点。', image: imagePath.curious }, { title: '聆听', body: '她把海螺贴近耳边，让潮声先说话。', image: imagePath.listening }, { title: '共振', body: '靠近记忆碎片时，海沫会染上一层安静的琥珀光。', image: imagePath.resonance }, { title: '庆祝', body: '找到一段声音后，她会旋转，留下明亮的泡沫轨迹。', image: imagePath.celebration }, { title: '打盹', body: '漫长潮汐过后，她缩回螺壳，让海岸替她守望。', image: imagePath.sleeping }, { title: '飞行', body: '一小团海沫，足够托起一颗很大的心。', image: imagePath.flying },
    ],
    shareKicker: '04 / 泡沫信使站', shareTitle: '把一段小小的声音吹向远方。', shareBody: '在此浏览器中组合一张原创螺音海报。不会上传、保存或关联任何账号。', chooseLine: '选择一句话', choosePose: '选择姿态', chooseRatio: '选择比例', download: '下载图片', share: '分享图片', copy: '复制文案', shareStatus: '你的泡沫只在这台设备上生成。', footer: 'ShellSong / 螺音 — 原创虚构数字角色。',
  },
  id: {
    nav: ['Asal', 'Sinyal', 'Buku Harian Pasang', 'Kirim Gelembung'], soundOn: 'Nyalakan suara', soundOff: 'Matikan suara', pause: 'Jeda CG', play: 'Putar CG', replay: 'Putar ulang CG', fiction: 'ShellSong adalah karakter fiksi orisinal. Dunianya adalah cerita, bukan catatan sejarah atau keterangan resmi.',
    originKicker: '01 / ASAL SEBUAH LAGU', originTitle: 'Tiga kenangan menjadi satu suara kecil.',
    origin: [{ title: 'Cahaya', body: 'Saat roh kayu rosewood kuno terurai, seutas cahaya hening memilih untuk tidak menjadi pohon lagi.' }, { title: 'Keong', body: 'Di kolam pasang pantai timur Hainan, keong merah muda menyimpan lagu laut, panggilan nelayan, dan hujan monsun selama seribu tahun.' }, { title: 'Fajar pertama', body: 'Cahaya bulan, air asin, dan sisa cahaya bertemu di dalam spiral. Saat fajar tiba, ShellSong menatap keluar dan mulai mendengarkan.' }],
    signalsKicker: '02 / TANDA-TANDA KARAKTER', signalsTitle: 'Baca detail yang membentuk ShellSong.', signalsBody: 'Tubuhnya kecil karena dirancang begitu, tetapi setiap detail membawa cara mendengarkan yang berbeda.',
    signals: [{ term: 'Rambut ombak', body: 'Rambut biru pasang menyimpan seutas cahaya rosewood keemasan.' }, { term: 'Telinga keong', body: 'Telinga spiral kecilnya mengarah ke suara air yang paling jauh.' }, { term: 'Tunas rosewood', body: 'Tunas kecilnya mengikuti pasang dan tegak saat resonansi mendekat.' }, { term: 'Keong merah muda', body: 'Keongnya adalah rumah sekaligus alat musik: mendengar lalu membawa lagu ke depan.' }, { term: 'Alas busa', body: 'Ia tidak bersayap. Sepotong busa laut lembut membuatnya tetap melayang.' }],
    diaryKicker: '03 / BUKU HARIAN PASANG', diaryTitle: 'Satu pemandu kecil, enam cara mendengarkan.',
    diary: [{ title: 'Penasaran', body: 'Setiap suara baru membuatnya mendekat.', image: imagePath.curious }, { title: 'Mendengarkan', body: 'Ia mendekatkan keong dan membiarkan pasang berbicara lebih dulu.', image: imagePath.listening }, { title: 'Resonansi', body: 'Di dekat serpihan kenangan, busa laut berubah menjadi cahaya ambar yang tenang.', image: imagePath.resonance }, { title: 'Perayaan', body: 'Saat suara ditemukan, ia berputar dan meninggalkan jejak gelembung terang.', image: imagePath.celebration }, { title: 'Bermimpi', body: 'Setelah pasang panjang, ia masuk ke cangkang dan membiarkan pantai berjaga.', image: imagePath.sleeping }, { title: 'Terbang', body: 'Sedikit busa cukup untuk membawa hati yang sangat besar.', image: imagePath.flying }],
    shareKicker: '04 / STASIUN GELEMBUNG', shareTitle: 'Kirim satu lagu kecil ke luar.', shareBody: 'Rangkai gambar ShellSong orisinal di peramban ini. Tidak ada yang diunggah, disimpan, atau ditautkan ke akun.', chooseLine: 'Pilih kalimat', choosePose: 'Pilih pose', chooseRatio: 'Pilih format', download: 'Unduh gambar', share: 'Bagikan gambar', copy: 'Salin keterangan', shareStatus: 'Gelembungmu dibuat di sini, pada perangkat ini.', footer: 'ShellSong / 螺音 — karakter digital fiksi orisinal.',
  },
  ja: {
    nav: ['誕生', 'キャラクターのしるし', '潮汐日記', '泡を飛ばす'], soundOn: '音声をオン', soundOff: '音声をオフ', pause: 'CG を一時停止', play: 'CG を再生', replay: 'CG をもう一度', fiction: 'ShellSong はオリジナルの架空キャラクターです。彼女の世界は物語であり、歴史的または公式な記録ではありません。',
    originKicker: '01 / 歌のはじまり', originTitle: '三つの記憶が、小さな声になった。',
    origin: [{ title: '光', body: '古いローズウッドの精霊がほどけたとき、静かな光の糸が、もう一度木になることを選びませんでした。' }, { title: '巻き貝', body: '海南東岸の潮だまりで、桃色の巻き貝は千年にわたり海の歌、漁の呼び声、モンスーンの雨を抱えていました。' }, { title: '最初の夜明け', body: '月明かりと塩水、残った小さな光が渦の中で出会います。夜明けに ShellSong は顔を出し、聴き始めました。' }],
    signalsKicker: '02 / キャラクターのしるし', signalsTitle: '彼女を ShellSong にする細部を読む。', signalsBody: '小さく設計された体ですが、どの細部にも異なる聴き方が宿っています。',
    signals: [{ term: '波の髪', body: '潮の青い髪に、琥珀色のローズウッドの光が一本走っています。' }, { term: '巻き貝の耳', body: '小さな渦巻きの耳が、遠くの水音へ向きを変えます。' }, { term: 'ローズウッドの芽', body: '小さな芽は潮に揺れ、共鳴が近づくとまっすぐ立ちます。' }, { term: '桃色の巻き貝', body: '巻き貝は家であり楽器。聴いた歌を次へ運びます。' }, { term: '泡の台座', body: '翼はありません。やわらかな海の泡が、彼女を浮かせます。' }],
    diaryKicker: '03 / 潮汐日記', diaryTitle: '小さな案内役、六つの聴き方。',
    diary: [{ title: '好奇心', body: '新しい音がするたび、少し身を寄せます。', image: imagePath.curious }, { title: '聴く', body: '巻き貝を近づけ、まず潮の声に耳を澄ませます。', image: imagePath.listening }, { title: '共鳴', body: '記憶のかけらのそばで、海の泡が静かな琥珀色に光ります。', image: imagePath.resonance }, { title: '祝福', body: '声を見つけると、くるりと回り、明るい泡の跡を残します。', image: imagePath.celebration }, { title: '夢見る', body: '長い潮のあと、殻に戻り、海岸に見守りを任せます。', image: imagePath.sleeping }, { title: '飛ぶ', body: '少しの泡が、大きな心を運びます。', image: imagePath.flying }],
    shareKicker: '04 / 泡を届ける場所', shareTitle: '小さな歌を遠くへ送る。', shareBody: 'このブラウザでオリジナルの ShellSong 画像を組み立てます。アップロード、保存、アカウントとの紐づけはありません。', chooseLine: '言葉を選ぶ', choosePose: 'ポーズを選ぶ', chooseRatio: '形式を選ぶ', download: '画像をダウンロード', share: '画像を共有', copy: 'キャプションをコピー', shareStatus: '泡はこの端末の中で生まれます。', footer: 'ShellSong / 螺音 — オリジナルの架空デジタルキャラクター。',
  },
  ko: {
    nav: ['탄생', '캐릭터 신호', '조수 일기', '거품 보내기'], soundOn: '소리 켜기', soundOff: '소리 끄기', pause: 'CG 일시정지', play: 'CG 재생', replay: 'CG 다시 재생', fiction: 'ShellSong은 오리지널 허구 캐릭터입니다. 그 세계는 이야기이며 역사적 기록이나 공식 설명이 아닙니다.',
    originKicker: '01 / 노래의 탄생', originTitle: '세 기억이 작은 목소리 하나가 되었습니다.',
    origin: [{ title: '빛', body: '오래된 로즈우드의 정령이 흩어질 때, 고요한 빛 한 줄기는 다시 나무가 되지 않기로 했습니다.' }, { title: '소라', body: '하이난 동쪽 해안의 조수 웅덩이에서 분홍 소라는 천 년 동안 바다의 노래와 어부의 부름, 몬순의 비를 품었습니다.' }, { title: '첫 새벽', body: '달빛과 짠물, 남은 작은 빛이 나선 안에서 만났습니다. 새벽에 ShellSong은 고개를 내밀고 듣기 시작했습니다.' }],
    signalsKicker: '02 / 캐릭터 신호', signalsTitle: '그녀를 ShellSong으로 만드는 디테일을 읽어 보세요.', signalsBody: '작게 설계된 몸이지만 모든 디테일에는 서로 다른 듣기의 방식이 담겨 있습니다.',
    signals: [{ term: '파도 머리카락', body: '조수의 푸른 머리카락에는 호박빛 로즈우드 빛이 한 줄기 흐릅니다.' }, { term: '소라 귀', body: '작은 나선 귀가 가장 먼 물소리를 향합니다.' }, { term: '로즈우드 새싹', body: '작은 새싹은 조수에 흔들리고 공명이 다가오면 곧게 섭니다.' }, { term: '분홍 소라', body: '소라는 집이자 악기입니다. 듣고 나서 노래를 다음 곳으로 옮깁니다.' }, { term: '거품 받침', body: '날개는 없습니다. 부드러운 바다 거품이 그녀를 띄웁니다.' }],
    diaryKicker: '03 / 조수 일기', diaryTitle: '작은 안내자, 여섯 가지 듣는 법.',
    diary: [{ title: '호기심', body: '새로운 소리가 날 때마다 조금 더 가까이 몸을 기울입니다.', image: imagePath.curious }, { title: '듣기', body: '소라를 가까이 대고 조수가 먼저 말하게 합니다.', image: imagePath.listening }, { title: '공명', body: '기억의 조각 곁에서 바다 거품이 조용한 호박빛으로 빛납니다.', image: imagePath.resonance }, { title: '축하', body: '목소리를 찾으면 빙글 돌며 밝은 거품 자국을 남깁니다.', image: imagePath.celebration }, { title: '꿈', body: '긴 조수가 지나면 껍데기 안으로 돌아가 해안에 지켜보기를 맡깁니다.', image: imagePath.sleeping }, { title: '비행', body: '작은 거품 하나가 아주 큰 마음을 실어 나릅니다.', image: imagePath.flying }],
    shareKicker: '04 / 거품 전송소', shareTitle: '작은 노래 하나를 바깥으로 보내세요.', shareBody: '이 브라우저에서 오리지널 ShellSong 이미지를 구성합니다. 업로드, 저장, 계정 연결은 일어나지 않습니다.', chooseLine: '문장 선택', choosePose: '포즈 선택', chooseRatio: '형식 선택', download: '이미지 다운로드', share: '이미지 공유', copy: '캡션 복사', shareStatus: '거품은 이 기기에서만 만들어집니다.', footer: 'ShellSong / 뤄인 — 오리지널 허구 디지털 캐릭터.',
  },
  ru: {
    nav: ['Рождение', 'Знаки характера', 'Дневник приливов', 'Пузырёк наружу'], soundOn: 'Включить звук', soundOff: 'Выключить звук', pause: 'Пауза CG', play: 'Воспроизвести CG', replay: 'Повторить CG', fiction: 'ShellSong — оригинальный вымышленный персонаж. Её мир — это история, а не историческая или официальная запись.',
    originKicker: '01 / РОЖДЕНИЕ ПЕСНИ', originTitle: 'Три воспоминания стали одним маленьким голосом.',
    origin: [{ title: 'Свет', body: 'Когда дух древнего палисандра распался, тихая нить света не захотела снова стать деревом.' }, { title: 'Раковина', body: 'В приливной заводи на восточном побережье Хайнаня розовая раковина тысячу лет хранила морские песни, крики рыбаков и муссонный дождь.' }, { title: 'Первый рассвет', body: 'Лунный свет, солёная вода и оставшийся свет встретились в спирали. На рассвете ShellSong выглянула и начала слушать.' }],
    signalsKicker: '02 / ЗНАКИ ХАРАКТЕРА', signalsTitle: 'Рассмотрите детали, из которых складывается ShellSong.', signalsBody: 'Она нарочно маленькая, но каждая деталь несёт свой способ слушать.',
    signals: [{ term: 'Волосы-волны', body: 'В синих волосах прилива живёт нить янтарного света палисандра.' }, { term: 'Уши-раковины', body: 'Маленькие спирали поворачиваются к самому далёкому звуку воды.' }, { term: 'Росток палисандра', body: 'Росток гнётся вместе с приливом и выпрямляется, когда приближается резонанс.' }, { term: 'Розовая раковина', body: 'Раковина — и дом, и инструмент: она слушает, а затем несёт песню дальше.' }, { term: 'Основа из пены', body: 'У неё нет крыльев. Мягкий кусочек морской пены удерживает её в воздухе.' }],
    diaryKicker: '03 / ДНЕВНИК ПРИЛИВОВ', diaryTitle: 'Один маленький проводник, шесть способов слушать.',
    diary: [{ title: 'Любопытство', body: 'Каждый новый звук заставляет её наклониться ближе.', image: imagePath.curious }, { title: 'Слушание', body: 'Она подносит раковину и сначала даёт приливу заговорить.', image: imagePath.listening }, { title: 'Резонанс', body: 'Рядом с осколком памяти морская пена загорается тихим янтарным светом.', image: imagePath.resonance }, { title: 'Праздник', body: 'Найдя голос, она кружится и оставляет яркий след пузырьков.', image: imagePath.celebration }, { title: 'Сон', body: 'После долгого прилива она прячется в раковине и оставляет берегу дозор.', image: imagePath.sleeping }, { title: 'Полёт', body: 'Немного пены достаточно, чтобы нести очень большое сердце.', image: imagePath.flying }],
    shareKicker: '04 / СТАНЦИЯ ПУЗЫРЬКОВ', shareTitle: 'Отправьте маленькую песню наружу.', shareBody: 'Соберите оригинальное изображение ShellSong в этом браузере. Ничего не загружается, не сохраняется и не связывается с аккаунтом.', chooseLine: 'Выбрать строку', choosePose: 'Выбрать позу', chooseRatio: 'Выбрать формат', download: 'Скачать изображение', share: 'Поделиться изображением', copy: 'Скопировать подпись', shareStatus: 'Ваш пузырёк создан здесь, на этом устройстве.', footer: 'ShellSong / Луоинь — оригинальный вымышленный цифровой персонаж.',
  },
  ar: {
    nav: ['البداية', 'إشارات الشخصية', 'يوميات المد', 'إرسال فقاعة'], soundOn: 'تشغيل الصوت', soundOff: 'إيقاف الصوت', pause: 'إيقاف CG مؤقتاً', play: 'تشغيل CG', replay: 'إعادة تشغيل CG', fiction: 'ShellSong شخصية خيالية أصلية. عالمها حكاية، وليس سجلاً تاريخياً أو وصفاً رسمياً.',
    originKicker: '01 / ميلاد أغنية', originTitle: 'ثلاث ذكريات أصبحت صوتاً صغيراً واحداً.',
    origin: [{ title: 'الضوء', body: 'حين تفتتت روح خشب الورد العتيق، اختار خيط هادئ من الضوء ألا يعود شجرة.' }, { title: 'الصدفة', body: 'في بركة مدّ على الساحل الشرقي لهاينان، حملت صدفة وردية أغاني البحر ونداءات الصيادين ومطر الرياح الموسمية ألف عام.' }, { title: 'الفجر الأول', body: 'التقى ضوء القمر والماء المالح وبقية الضوء الصغيرة داخل اللولب. وعند الفجر، أطلّت ShellSong وبدأت الإصغاء.' }],
    signalsKicker: '02 / إشارات الشخصية', signalsTitle: 'اقرأ التفاصيل التي تصنع ShellSong.', signalsBody: 'هي صغيرة بتصميمها، لكن كل تفصيل يحمل طريقة مختلفة للإصغاء.',
    signals: [{ term: 'شعر الموج', body: 'يحمل شعرها الأزرق كخيط المد ضوءاً كهرمانياً من خشب الورد.' }, { term: 'أذنا الصدفة', body: 'تتجه الأذنان الحلزونيتان الصغيرتان نحو أبعد صوت يحمله الماء.' }, { term: 'برعم خشب الورد', body: 'ينحني البرعم الصغير مع المد ويستقيم حين يقترب الرنين.' }, { term: 'الصدفة الوردية', body: 'صدفتها بيت وآلة معاً: تصغي ثم تحمل الأغنية إلى الأمام.' }, { term: 'قاعدة الرغوة', body: 'لا جناحين لها. قطعة ناعمة من رغوة البحر تبقيها محلقة.' }],
    diaryKicker: '03 / يوميات المد', diaryTitle: 'مرشدة صغيرة واحدة، وست طرق للإصغاء.',
    diary: [{ title: 'فضول', body: 'كل صوت جديد يجعلها تميل إلى الأمام قليلاً.', image: imagePath.curious }, { title: 'إصغاء', body: 'تقرب الصدفة وتترك للمد فرصة الكلام أولاً.', image: imagePath.listening }, { title: 'رنين', body: 'بالقرب من شظية ذكرى، تكتسب رغوة البحر توهجاً كهرمانياً هادئاً.', image: imagePath.resonance }, { title: 'احتفال', body: 'حين تجد صوتاً، تدور وتترك وراءها أثراً مضيئاً من الفقاعات.', image: imagePath.celebration }, { title: 'حلم', body: 'بعد مد طويل، تنكمش داخل صدفتها وتدع الساحل يحرسها.', image: imagePath.sleeping }, { title: 'تحليق', body: 'تكفي رغوة قليلة لحمل قلب كبير جداً.', image: imagePath.flying }],
    shareKicker: '04 / محطة إرسال الفقاعات', shareTitle: 'أرسل أغنية صغيرة إلى الخارج.', shareBody: 'كوّن صورة ShellSong أصلية في هذا المتصفح. لا يتم رفع أي شيء أو حفظه أو ربطه بحساب.', chooseLine: 'اختر عبارة', choosePose: 'اختر وضعية', chooseRatio: 'اختر صيغة', download: 'تنزيل الصورة', share: 'مشاركة الصورة', copy: 'نسخ الوصف', shareStatus: 'تتكوّن فقاعتك هنا، على هذا الجهاز.', footer: 'ShellSong / لويين — شخصية رقمية خيالية أصلية.',
  },
}

assertLocalizationTree(copy, 'ShellSong page copy')

const shellsongUi = {
  returnHome: { en: 'Return to Qiongverse home', zh: '返回琼境首页', id: 'Kembali ke beranda Qiongverse', ja: 'Qiongverse のホームに戻る', ko: 'Qiongverse 홈으로 돌아가기', ru: 'Вернуться на главную Qiongverse', ar: 'العودة إلى الصفحة الرئيسية لـ Qiongverse' },
  sections: { en: 'ShellSong page sections', zh: '螺音页面导航', id: 'Bagian halaman ShellSong', ja: 'ShellSong ページのセクション', ko: 'ShellSong 페이지 섹션', ru: 'Разделы страницы ShellSong', ar: 'أقسام صفحة ShellSong' },
  home: { en: 'Home', zh: '首页', id: 'Beranda', ja: 'ホーム', ko: '홈', ru: 'Главная', ar: 'الرئيسية' },
  hero: { en: 'ShellSong CG film', zh: '螺音 CG 短片', id: 'Film CG ShellSong', ja: 'ShellSong CG 映像', ko: 'ShellSong CG 영상', ru: 'CG-фильм ShellSong', ar: 'فيلم ShellSong بتقنية CG' },
  posterAlt: { en: 'Luoyin beside a glowing sea portal', zh: '螺音站在发光的海洋之门旁', id: 'Luoyin di samping gerbang laut bercahaya', ja: '光る海の門のそばに立つ螺音', ko: '빛나는 바다의 문 곁에 선 뤄인', ru: 'Луоинь рядом со светящимся морским порталом', ar: 'لويين بجوار بوابة بحرية مضيئة' },
  controls: { en: 'CG controls', zh: 'CG 控制', id: 'Kontrol CG', ja: 'CG 操作', ko: 'CG 제어', ru: 'Управление CG', ar: 'عناصر تحكم CG' },
  listeningAlt: { en: 'Luoyin listening through her conch', zh: '螺音用海螺聆听', id: 'Luoyin mendengarkan melalui keongnya', ja: '巻き貝で耳を澄ます螺音', ko: '소라로 듣고 있는 뤄인', ru: 'Луоинь слушает через раковину', ar: 'لويين تصغي عبر صدفتها' },
  listeningCaption: { en: 'Her first act is always to listen.', zh: '她做的第一件事，总是先聆听。', id: 'Hal pertama yang selalu ia lakukan adalah mendengarkan.', ja: '彼女が最初にすることは、いつも聴くことです。', ko: '그녀가 가장 먼저 하는 일은 언제나 듣는 것입니다.', ru: 'Первое, что она делает, — всегда слушает.', ar: 'أول ما تفعله دائماً هو الإصغاء.' },
  originalCharacter: { en: 'Original fictional digital character', zh: '原创虚构数字角色', id: 'Karakter digital fiksi orisinal', ja: 'オリジナルの架空デジタルキャラクター', ko: '오리지널 허구 디지털 캐릭터', ru: 'Оригинальный вымышленный цифровой персонаж', ar: 'شخصية رقمية خيالية أصلية' },
  imageReady: { en: 'Image ready to share.', zh: '图片已准备好，可以分享。', id: 'Gambar siap dibagikan.', ja: '画像を共有できます。', ko: '이미지를 공유할 준비가 되었습니다.', ru: 'Изображение готово к публикации.', ar: 'الصورة جاهزة للمشاركة.' },
  shareOpened: { en: 'Share sheet opened.', zh: '已打开分享面板。', id: 'Panel berbagi dibuka.', ja: '共有シートを開きました。', ko: '공유 창을 열었습니다.', ru: 'Окно общего доступа открыто.', ar: 'فُتحت لوحة المشاركة.' },
  shareUnavailable: { en: 'System sharing is unavailable. Download the image instead.', zh: '系统分享不可用，请改为下载图片。', id: 'Berbagi sistem tidak tersedia. Unduh gambarnya sebagai gantinya.', ja: 'システム共有は利用できません。代わりに画像をダウンロードしてください。', ko: '시스템 공유를 사용할 수 없습니다. 대신 이미지를 다운로드하세요.', ru: 'Системная отправка недоступна. Скачайте изображение.', ar: 'المشاركة عبر النظام غير متاحة. نزّل الصورة بدلاً من ذلك.' },
  captionCopied: { en: 'Caption copied.', zh: '文案已复制。', id: 'Keterangan disalin.', ja: 'キャプションをコピーしました。', ko: '캡션을 복사했습니다.', ru: 'Подпись скопирована.', ar: 'نُسخ الوصف.' },
} satisfies Record<string, RuntimeLocalized<string>>
assertLocalizationTree(shellsongUi, 'ShellSong page interface copy')

const posterLines: Record<Language, string[]> = {
  en: ['The sea has a memory.', 'Listen: a small conch keeps the tide.', 'A voice from Hainan, carried outward.'],
  zh: ['海是有记忆的。', '听，一枚小小的海螺收藏着潮声。', '一段从海南出发、传向远方的声音。'],
  id: ['Laut menyimpan ingatan.', 'Dengarkan: keong kecil menyimpan pasang.', 'Suara dari Hainan yang dibawa ke luar.'],
  ja: ['海には記憶がある。', '聴いて。小さな巻き貝が潮を抱いている。', '海南から外へ運ばれる声。'],
  ko: ['바다에는 기억이 있습니다.', '들어 보세요. 작은 소라가 조수를 간직합니다.', '하이난에서 바깥으로 건너가는 목소리.'],
  ru: ['У моря есть память.', 'Слушайте: маленькая раковина хранит прилив.', 'Голос с Хайнаня, унесённый дальше.'],
  ar: ['للبحر ذاكرة.', 'أنصت: صدفة صغيرة تحفظ المد.', 'صوت من هاينان يحمله التيار إلى الخارج.'],
}

const posterPoses = [
  { id: 'curious', image: '/shellsong/images/curious.webp' },
  { id: 'listening', image: '/shellsong/images/listening.webp' },
  { id: 'resonance', image: '/shellsong/images/resonance.webp' },
  { id: 'celebration', image: '/shellsong/images/celebration.webp' },
  { id: 'sleeping', image: '/shellsong/images/sleeping.webp' },
  { id: 'flying', image: '/shellsong/images/flying.webp' },
  { id: 'user-pose-01', image: '/shellsong/images/poses/user-pose-01.jpg' },
  { id: 'user-pose-02', image: '/shellsong/images/poses/user-pose-02.jpg' },
  { id: 'user-pose-03', image: '/shellsong/images/poses/user-pose-03.jpg' },
  { id: 'user-pose-04', image: '/shellsong/images/poses/user-pose-04.jpg' },
  { id: 'user-pose-05', image: '/shellsong/images/poses/user-pose-05.jpg' },
  { id: 'user-pose-06', image: '/shellsong/images/poses/user-pose-06.jpg' },
]
const sectionIds = ['origin', 'signals', 'diary', 'bubble-station']

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

function wrapText(context: CanvasRenderingContext2D, text: string, width: number) {
  const units = text.includes(' ') ? text.split(' ') : Array.from(text)
  const lines: string[] = []
  let line = ''
  for (const unit of units) {
    const next = text.includes(' ') ? `${line}${line ? ' ' : ''}${unit}` : `${line}${unit}`
    if (context.measureText(next).width > width && line) { lines.push(line); line = unit } else line = next
  }
  if (line) lines.push(line)
  return lines
}

function drawCoverImage(context: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const imageWidth = image.naturalWidth * scale
  const imageHeight = image.naturalHeight * scale
  context.drawImage(image, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight)
}

export default function LuoyinTidePage({ language, onChangeLanguage, onExit }: Props) {
  const [videoError, setVideoError] = useState(false)
  const [muted, setMuted] = useState(true)
  const [paused, setPaused] = useState(false)
  const [lineIndex, setLineIndex] = useState(0)
  const [poseId, setPoseId] = useState('curious')
  const [ratio, setRatio] = useState<PosterRatio>('portrait')
  const [shareStatus, setShareStatus] = useState('')
  const [shareChooserOpen, setShareChooserOpen] = useState(false)
  const [shareFile, setShareFile] = useState<{ blob: Blob; filename: string } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const reducedMotion = useReducedMotion()
  const text = copy[language]
  const activePosterLines = posterLines[language]
  const ui = (key: keyof typeof shellsongUi) => localize(shellsongUi[key], language)
  const selectedPose = posterPoses.find((pose) => pose.id === poseId) || posterPoses[0]

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || reducedMotion) return
    video.muted = true
    video.play().then(() => setPaused(false)).catch(() => setPaused(true))
  }, [reducedMotion])

  const toggleVideo = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) { video.play().then(() => setPaused(false)).catch(() => setPaused(true)) } else { video.pause(); setPaused(true) }
  }
  const toggleSound = () => { const video = videoRef.current; if (!video) return; video.muted = !video.muted; setMuted(video.muted); if (video.paused) video.play().catch(() => undefined) }
  const replayVideo = () => { const video = videoRef.current; if (!video) return; video.currentTime = 0; video.play().then(() => setPaused(false)).catch(() => setPaused(true)) }

  const makePoster = async () => {
    const canvas = canvasRef.current || document.createElement('canvas')
    const dimensions = ratio === 'square' ? [1080, 1080] : ratio === 'portrait' ? [1080, 1350] : [1080, 1920]
    canvas.width = dimensions[0]
    canvas.height = dimensions[1]
    const context = canvas.getContext('2d')
    if (!context) return null
    const [width, height] = dimensions
    const image = new Image()
    await new Promise<void>((resolve) => { image.onload = () => resolve(); image.onerror = () => resolve(); image.src = selectedPose.image })
    if (image.naturalWidth) drawCoverImage(context, image, width, height)
    else { context.fillStyle = '#cdeef6'; context.fillRect(0, 0, width, height) }
    context.fillStyle = 'rgba(5, 37, 50, .78)'
    context.fillRect(0, 0, width, height * .41)
    context.fillStyle = 'rgba(5, 37, 50, .72)'
    context.fillRect(0, height - 116, width, 116)
    context.strokeStyle = '#8fe6ec'
    context.lineWidth = 3
    for (let index = 0; index < 3; index += 1) {
      context.globalAlpha = .74 - index * .16
      context.beginPath()
      context.moveTo(-90, height * (.63 + index * .06))
      context.bezierCurveTo(width * .24, height * (.54 + index * .05), width * .7, height * (.7 - index * .04), width + 90, height * (.58 + index * .06))
      context.stroke()
    }
    context.globalAlpha = 1
    context.fillStyle = '#f7fbfb'
    context.font = '600 28px sans-serif'
    context.fillText('SHELLSONG / 螺音', 78, 94)
    context.fillStyle = '#f5a6b6'
    context.font = '400 20px monospace'
    context.fillText(text.shareTitle, 78, 134)
    context.fillStyle = '#f7fbfb'
    context.font = '600 62px serif'
    const line = activePosterLines[lineIndex]
    wrapText(context, line, width - 156).slice(0, 3).forEach((part, index) => context.fillText(part, 78, 238 + index * 76))
    context.fillStyle = '#e6fbfa'
    context.font = '400 19px sans-serif'
    context.fillText(ui('originalCharacter'), 78, height - 70)
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  }

  const downloadPoster = async () => {
    const blob = await makePoster(); if (!blob) return
    downloadBlob(blob, `shellsong-${ratio}-${language}.png`)
    setShareStatus(ui('imageReady'))
  }
  const preparePosterShare = async () => {
    const blob = await makePoster(); if (!blob) return
    setShareFile({ blob, filename: `shellsong-${ratio}-${language}.png` })
    setShareChooserOpen(true)
  }
  const copyCaption = async () => {
    const caption = `${activePosterLines[lineIndex]} — ShellSong / 螺音`
    setShareStatus(await copyText(caption) ? ui('captionCopied') : caption)
  }
  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })

  return <main className="ss-page" data-experience-main>
    <ShareChooser language={language} open={shareChooserOpen} title="ShellSong / 螺音" text={`${activePosterLines[lineIndex]} — ShellSong / 螺音`} url={publicShareUrl(`${window.location.origin}${window.location.pathname}#luoyin-tide`)} file={shareFile} onClose={() => setShareChooserOpen(false)} />
    <canvas className="ss-export-canvas" ref={canvasRef} aria-hidden="true" />
    <header className="ss-header">
      <button type="button" className="ss-wordmark" onClick={onExit} aria-label={ui('returnHome')}><span>ShellSong</span><i>螺音</i></button>
      <nav aria-label={ui('sections')}>{text.nav.map((item, index) => <a key={item} href={'#' + sectionIds[index]} onClick={(event) => { event.preventDefault(); scrollToSection(sectionIds[index]) }}>{item}</a>)}</nav>
      <div className="ss-header-actions">
        <LanguageSelector language={language} onChange={onChangeLanguage} className="ss-language" />
        <button className="ss-return" type="button" onClick={onExit}>
          {ui('home')}<span aria-hidden="true">↗</span>
        </button>
      </div>
    </header>

    <section className="ss-hero" id="top" aria-label={ui('hero')}>
      {!videoError && <video ref={videoRef} className="ss-hero-video" muted playsInline loop preload="metadata" poster="/shellsong/hero-poster.jpg" onError={() => setVideoError(true)} onPlay={() => setPaused(false)} onPause={() => setPaused(true)}>
        <source src="/shellsong/video/luoyin-cg-pages.mp4" type="video/mp4" />
      </video>}
      {videoError && <img className="ss-hero-poster" src="/shellsong/hero-poster.jpg" alt={ui('posterAlt')} />}
      <div className="ss-hero-veil" />
      <h1 className="ss-sr-title" ref={titleRef} tabIndex={-1}>ShellSong / 螺音</h1>
      <div className="ss-hero-controls" aria-label={ui('controls')}>
        <button type="button" onClick={toggleSound}>{muted ? text.soundOn : text.soundOff}</button>
        <button type="button" onClick={toggleVideo}>{paused ? text.play : text.pause}</button>
        <button type="button" onClick={replayVideo}>{text.replay}</button>
      </div>
      <p className="ss-fiction-banner">{text.fiction}</p>
    </section>

    <section className="ss-origin" id="origin" aria-labelledby="origin-title">
      <div className="ss-section-intro"><p>{text.originKicker}</p><h2 id="origin-title">{text.originTitle}</h2></div>
      <ol className="ss-origin-sequence">{text.origin.map((chapter, index) => <li key={chapter.title}><span>0{index + 1}</span><div><h3>{chapter.title}</h3><p>{chapter.body}</p></div></li>)}</ol>
      <figure><img src={imagePath.listening} alt={ui('listeningAlt')} /><figcaption>{ui('listeningCaption')}</figcaption></figure>
    </section>

    <section className="ss-signals" id="signals" aria-labelledby="signals-title">
      <div className="ss-section-intro"><p>{text.signalsKicker}</p><h2 id="signals-title">{text.signalsTitle}</h2><span>{text.signalsBody}</span></div>
      <div className="ss-signals-layout">
        <div className="ss-model-shell">
          <ShellSongModel language={language} />
        </div>
        <dl>{text.signals.map((signal, index) => <div key={signal.term}><dt><span>0{index + 1}</span>{signal.term}</dt><dd>{signal.body}</dd></div>)}</dl>
      </div>
    </section>

    <section className="ss-diary" id="diary" aria-labelledby="diary-title">
      <div className="ss-section-intro"><p>{text.diaryKicker}</p><h2 id="diary-title">{text.diaryTitle}</h2></div>
      <div className="ss-diary-rail">{text.diary.map((entry, index) => <article key={entry.title}><span>0{index + 1}</span><img src={entry.image} alt={entry.title} /><div><h3>{entry.title}</h3><p>{entry.body}</p></div></article>)}</div>
    </section>

    <section className="ss-bubble" id="bubble-station" aria-labelledby="bubble-title">
      <div className="ss-bubble-waves" aria-hidden="true" /><img className="ss-bubble-island" src="/shellsong/images/flying.webp" alt="" aria-hidden="true" />
      <div className="ss-section-intro"><p>{text.shareKicker}</p><h2 id="bubble-title">{text.shareTitle}</h2><span>{text.shareBody}</span></div>
      <div className="ss-bubble-workspace">
        <div className={`ss-poster-preview ratio-${ratio}`}><span>SHELLSONG / 螺音</span><p>{activePosterLines[lineIndex]}</p><img src={selectedPose.image} alt="" /><small>{ui('originalCharacter')}</small></div>
        <div className="ss-poster-controls">
          <fieldset><legend>{text.chooseLine}</legend>{activePosterLines.map((line, index) => <button type="button" key={line} className={lineIndex === index ? 'active' : ''} onClick={() => setLineIndex(index)}>{line}</button>)}</fieldset>
          <fieldset><legend>{text.choosePose}</legend><div className="ss-pose-options">{posterPoses.map((pose) => <button type="button" key={pose.id} className={pose.id === poseId ? 'active' : ''} onClick={() => setPoseId(pose.id)}><img src={pose.image} alt={pose.id} /></button>)}</div></fieldset>
          <fieldset><legend>{text.chooseRatio}</legend><div className="ss-ratio-options">{(['square', 'portrait', 'story'] as PosterRatio[]).map((item) => <button type="button" key={item} className={ratio === item ? 'active' : ''} onClick={() => setRatio(item)}>{item === 'square' ? '1:1' : item === 'portrait' ? '4:5' : '9:16'}</button>)}</div></fieldset>
          <div className="ss-share-actions"><button type="button" onClick={downloadPoster}>{text.download}<b aria-hidden="true">↓</b></button><button type="button" onClick={() => void preparePosterShare()}>{text.share}<b aria-hidden="true">↗</b></button><button type="button" onClick={copyCaption}>{text.copy}<b aria-hidden="true">□</b></button></div>
          <p role="status" aria-live="polite">{shareStatus || text.shareStatus}</p>
        </div>
      </div>
    </section>

    <footer className="ss-footer"><span>ShellSong / 螺音</span><p>{text.footer}</p><button type="button" onClick={onExit} aria-label={ui('returnHome')}>↑</button></footer>
  </main>
}
