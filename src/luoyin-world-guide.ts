import sharedCues from '../shared/luoyin-world-guide-cues.json'
import type { Language } from './i18n'
import { localize, type Localized } from './i18n'

export type LuoyinWorldMoveDetail = {
  source: 'avatar' | 'free-camera'
  position: { x: number; y: number; z: number }
  cameraPosition: { x: number; y: number; z: number }
  forward: { x: number; y: number; z: number }
}

type SharedCue = (typeof sharedCues)[number]

export type WorldGuideCue = {
  id: string
  zoneId: string
  title: Localized
  localIntro: Localized
  question: Localized
  sourceClass: 'project_context' | 'verified_primary_source' | 'ai_suggestion'
  sourceStatus: 'reviewed' | 'needs_review' | 'local'
  radius: number
  facingCos: number
  position: { x: number; y: number; z: number }
  priority: number
  line: number
  topic: Localized
}

type Direction = 'left' | 'front' | 'right'
const languages: Language[] = ['en', 'zh', 'id', 'ja', 'ko', 'ru', 'ar']

// The line index is part of the local scene language. It gives every nearby
// cue a different observation instead of repeating one hall-level sentence.
const linePhrases: Record<Language, string[]> = {
  en: ['begin with the light at the threshold', 'trace the movement between surfaces', 'listen for the quiet rhythm around the object', 'look up and notice the room opening outward', 'compare the near texture with the distant view', 'follow the edge where two materials meet', 'watch the shadow change as you turn', 'notice the small detail that holds the scene together', 'let your eyes travel along the route line', 'pause here before moving to the next view', 'look for the boundary where the scene changes character', 'read the turn as a meeting of two directions', 'notice how a material detail carries the larger story', 'slow down and compare what is framed with what is open', 'take one last look before the next exhibit calls'],
  zh: ['先从门槛处的光线开始', '沿着表面之间的流动去看', '听一听物件周围安静的节奏', '抬头观察空间如何向外打开', '比较近处纹理和远处视线', '沿着两种材料相遇的边缘观察', '转身看看树影或反光怎样变化', '留意支撑整个场景的小细节', '让视线顺着这条路径继续走', '在这里停一下，再前往下一处', '寻找场景气质发生变化的边界', '把这个转角看成两种方向的相遇', '观察一个材料细节如何托起更大的叙事', '放慢脚步，比较被框住的景物与开放空间', '在下一个展项召唤你前，再回望一次'],
  id: ['mulai dari cahaya di ambang ruang', 'ikuti gerak di antara permukaan', 'dengarkan ritme tenang di sekitar objek', 'lihat bagaimana ruang terbuka ke arah luar', 'bandingkan tekstur dekat dengan pandangan jauh', 'ikuti batas tempat dua bahan bertemu', 'perhatikan bayangan berubah saat Anda berputar', 'temukan detail kecil yang menahan seluruh adegan', 'biarkan mata mengikuti garis rute', 'berhenti sejenak sebelum menuju pandangan berikutnya', 'cari batas ketika suasana adegan berubah', 'baca sudut ini sebagai pertemuan dua arah', 'lihat bagaimana detail material membawa cerita yang lebih besar', 'perlambat langkah dan bandingkan bingkai dengan ruang terbuka', 'lihat sekali lagi sebelum menuju titik berikutnya'],
  ja: ['まず入口の光から見てみましょう', '表面と表面の間の動きを追ってみましょう', '物のまわりの静かなリズムに耳を澄ませましょう', '空間が外へ開く方向を見上げてみましょう', '近くの質感と遠くの眺めを比べてみましょう', '二つの素材が出会う境目をたどりましょう', '向きを変えたときの影や反射を見てみましょう', '場面を支える小さな細部に注目しましょう', '視線を道の線に沿わせてみましょう', 'ここで一度立ち止まり次の景色へ進みましょう', '景色の性格が変わる境目を探してみましょう', 'この角を二つの方向が出会う場所として読みましょう', '素材の細部が大きな物語を支える様子を見ましょう', '速度を落とし、切り取られた景色と開いた空間を比べましょう', '次の展示へ進む前に、もう一度振り返りましょう'],
  ko: ['먼저 입구의 빛에서 시작해 보세요', '표면 사이로 흐르는 움직임을 따라가 보세요', '물체 주변의 고요한 리듬에 귀 기울여 보세요', '공간이 바깥으로 열리는 방향을 올려다보세요', '가까운 질감과 먼 풍경을 비교해 보세요', '두 재료가 만나는 가장자리를 따라가 보세요', '몸을 돌릴 때 달라지는 그림자와 반사를 보세요', '장면을 지탱하는 작은 디테일을 찾아보세요', '시선을 길의 선을 따라 천천히 옮겨 보세요', '여기서 잠시 멈춘 뒤 다음 풍경으로 가 보세요', '장면의 성격이 바뀌는 경계를 찾아보세요', '이 모서리를 두 방향이 만나는 곳으로 읽어 보세요', '재료의 작은 디테일이 큰 이야기를 받치는 방식을 보세요', '속도를 늦추고 열린 공간과 프레임 안 풍경을 비교해 보세요', '다음 전시로 가기 전 마지막으로 한 번 더 돌아보세요'],
  ru: ['начните со света у порога', 'проследите движение между поверхностями', 'прислушайтесь к тихому ритму вокруг объекта', 'поднимите взгляд и заметьте, как зал раскрывается наружу', 'сравните близкую фактуру с дальним видом', 'проследите границу встречи двух материалов', 'посмотрите, как меняется тень при повороте', 'заметьте маленькую деталь, удерживающую сцену', 'позвольте взгляду следовать линии маршрута', 'задержитесь здесь перед следующим видом', 'найдите границу, где характер сцены меняется', 'прочитайте этот поворот как встречу двух направлений', 'заметьте, как деталь материала поддерживает большую историю', 'замедлитесь и сравните открытое пространство с обрамлённым видом', 'оглянитесь ещё раз перед следующим экспонатом'],
  ar: ['ابدأ بالضوء عند العتبة', 'تتبّع الحركة بين الأسطح', 'أنصت إلى الإيقاع الهادئ حول القطعة', 'ارفع نظرك ولاحظ انفتاح القاعة إلى الخارج', 'قارن الملمس القريب بالمشهد البعيد', 'اتبع الحافة التي تلتقي عندها مادتان', 'راقب تغيّر الظل عندما تستدير', 'لاحظ التفصيل الصغير الذي يجمع المشهد', 'دع عينيك تتبعان خط المسار', 'توقف هنا قليلاً قبل المشهد التالي', 'ابحث عن الحد الذي تتغير عنده شخصية المشهد', 'اقرأ هذا المنعطف كلقاء بين اتجاهين', 'لاحظ كيف يحمل تفصيل المادة القصة الأكبر', 'أبطئ خطوتك وقارن بين المشهد المؤطر والمساحة المفتوحة', 'ألق نظرة أخيرة قبل أن يناديك المعروض التالي'],
}

const hallContext: Record<string, Localized> = {
  freeTradePort: { en: 'In this project reading of the Free Trade Port hall, vessels, routes and public information become a connected landscape.', zh: '在自贸港主厅的项目语境里，船舶、路径与公共信息被编排成一片相互连接的景观。', id: 'Dalam pembacaan proyek tentang aula Free Trade Port ini, kapal, rute, dan informasi publik menjadi lanskap yang saling terhubung.', ja: 'この自由貿易港ホールのプロジェクト解釈では、船、航路、公共情報がつながる風景になります。', ko: '이 자유무역항 홀의 프로젝트 해석에서는 선박, 경로, 공공 정보가 연결된 풍경이 됩니다.', ru: 'В проектном прочтении зала свободной торговли суда, маршруты и публичная информация становятся связанным ландшафтом.', ar: 'في القراءة المشروعية لقاعة التجارة الحرة، تصبح السفن والمسارات والمعلومات العامة مشهداً مترابطاً.' },
  tropical: { en: 'In the tropical island hall, water, salt air, roots and changing light guide the way you look.', zh: '在热带海岛厅，水面、盐风、根系与变化的光线共同引导观看。', id: 'Di aula pulau tropis, air, udara asin, akar, dan cahaya yang berubah mengarahkan cara kita melihat.', ja: '熱帯の島の展示室では、水、潮風、根、変わる光が見方を導きます。', ko: '열대 섬 전시관에서는 물, 소금기 머금은 바람, 뿌리와 변하는 빛이 시선을 이끕니다.', ru: 'В тропическом зале взгляд ведут вода, солёный воздух, корни и меняющийся свет.', ar: 'في قاعة الجزيرة الاستوائية، يقود النظر الماء والهواء المالح والجذور والضوء المتبدل.' },
  limiao: { en: 'In the Li and Miao hall, colour, thread, breath and shelter connect handwork with everyday life.', zh: '在黎苗非遗厅，色彩、线、气息与庇护把手工劳动连接到日常生活。', id: 'Di aula Li dan Miao, warna, benang, napas, dan ruang teduh menghubungkan kerajinan dengan kehidupan sehari-hari.', ja: '黎族・苗族の展示室では、色、糸、息づかい、住まいが手仕事と暮らしを結びます。', ko: '리족과 먀오족 전시관에서는 색, 실, 숨결과 쉼터가 손작업과 일상을 잇습니다.', ru: 'В зале Ли и Мяо цвет, нить, дыхание и укрытие связывают ручной труд с повседневностью.', ar: 'في قاعة لي ومياو، يربط اللون والخيط والنَفَس والمأوى العمل اليدوي بالحياة اليومية.' },
  aerospace: { en: 'In the aerospace hall, upward motion, signals, materials and the island sky form a project study of exploration.', zh: '在文昌航天厅，向上的运动、信号、材料与岛屿天空构成一场关于探索的项目研究。', id: 'Di aula antariksa, gerak ke atas, sinyal, material, dan langit pulau membentuk studi proyek tentang penjelajahan.', ja: '宇宙展示室では、上昇する動き、信号、素材、島の空が探査をめぐる研究になります。', ko: '우주 전시관에서는 상승 운동, 신호, 재료와 섬의 하늘이 탐험을 연구하는 프로젝트가 됩니다.', ru: 'В аэрокосмическом зале движение вверх, сигналы, материалы и островное небо складываются в исследование освоения.', ar: 'في قاعة الفضاء، تشكّل الحركة إلى أعلى والإشارات والمواد وسماء الجزيرة دراسة مشروعية للاستكشاف.' },
  huali: { en: 'In the Dongfang rosewood hall, grain, carving, joinery and reflected light make material a changing experience.', zh: '在东方花梨厅，木纹、雕刻、榫卯与反光让材料成为不断变化的体验。', id: 'Di aula kayu mawar Dongfang, serat, ukiran, sambungan, dan cahaya pantul membuat material terasa berubah.', ja: '東方花梨の展示室では、木目、彫刻、継手、反射光が素材の体験を変えていきます。', ko: '동방 화리목 전시관에서는 결, 조각, 짜맞춤과 반사광이 재료의 경험을 바꿉니다.', ru: 'В зале палисандра Дунфан текстура, резьба, соединения и отражённый свет меняют ощущение материала.', ar: 'في قاعة خشب الورد في دونغفانغ، تغيّر العروق والنحت والوصلات والضوء المنعكس تجربة المادة.' },
  village: { en: 'In the beautiful villages hall, volcanic stone, fields, paths, water and shared shade make a lived landscape.', zh: '在美丽乡村厅，火山石、田野、路径、水渠与共享树荫共同构成有生活痕迹的景观。', id: 'Di aula desa indah, batu vulkanik, ladang, jalan, air, dan teduh bersama membentuk lanskap yang hidup.', ja: '美しい農村の展示室では、火山岩、畑、道、水、共有の木陰が暮らしの風景をつくります。', ko: '아름다운 농촌 전시관에서는 화산석, 들판, 길, 물과 함께 쓰는 그늘이 살아 있는 풍경을 만듭니다.', ru: 'В зале красивых деревень вулканический камень, поля, тропы, вода и общая тень создают живой ландшафт.', ar: 'في قاعة القرى الجميلة، يصنع الحجر البركاني والحقول والمسارات والماء والظل المشترك مشهداً نابضاً بالحياة.' },
}

const titlePrefix: Record<Language, string> = { en: '', zh: '', id: 'Titik ', ja: '地点 ', ko: '지점 ', ru: 'Точка ', ar: 'نقطة ' }

function localizedCueTitle(item: SharedCue, language: Language): string {
  if (language === 'en') return item.titleEn
  if (language === 'zh') return item.titleZh
  return `${titlePrefix[language]}${String(item.line + 1).padStart(2, '0')} · ${item.titleEn}`
}

function localizedCueIntro(item: SharedCue, language: Language): string {
  const context = localize(hallContext[item.zoneId], language)
  const phrase = linePhrases[language][item.line] || linePhrases[language][0]
  const title = localizedCueTitle(item, language)
  if (language === 'zh') return `${context} ${phrase}，眼前是“${title}”：${item.topicZh}。这里是项目策展语境，不把图像当作已核验的实物、历史或运营承诺。`
  if (language === 'en') return `${context} ${phrase}. Around “${title}”, notice ${item.topicEn}. This is project-curated context, not a verified object, history, or operating promise.`
  const boundary: Record<Language, string> = { en: '', zh: '', id: 'Ini adalah konteks kuratorial proyek, bukan objek, sejarah, atau janji operasional yang telah diverifikasi.', ja: 'これはプロジェクトのキュレーション文脈であり、確認済みの実物・歴史・運営情報ではありません。', ko: '이는 프로젝트 큐레이션 맥락이며 검토된 실물, 역사 또는 운영 약속이 아닙니다.', ru: 'Это кураторский контекст проекта, а не проверенный объект, история или обещание работы.', ar: 'هذا سياق منسق للمشروع وليس قطعة أو تاريخاً أو وعداً تشغيلياً موثقاً.' }
  return `${context} ${phrase} — ${title}. ${boundary[language]}`
}

function localizedCueQuestion(item: SharedCue, language: Language): string {
  const title = localizedCueTitle(item, language)
  const questions: Record<Language, string> = { en: `Tell me more about ${title}.`, zh: `请继续介绍“${title}”。`, id: `Ceritakan lebih banyak tentang ${title}.`, ja: `${title}についてもう少し教えてください。`, ko: `${title}에 대해 더 알려 주세요.`, ru: `Расскажите подробнее о точке «${title}».`, ar: `أخبرني بالمزيد عن ${title}.` }
  return questions[language]
}

export const luoyinWorldCues: WorldGuideCue[] = (sharedCues as readonly SharedCue[]).map((item) => ({
  id: item.id,
  zoneId: item.zoneId,
  title: Object.fromEntries(languages.map((language) => [language, localizedCueTitle(item, language)])) as Localized,
  localIntro: Object.fromEntries(languages.map((language) => [language, localizedCueIntro(item, language)])) as Localized,
  question: Object.fromEntries(languages.map((language) => [language, localizedCueQuestion(item, language)])) as Localized,
  topic: { en: item.topicEn, zh: item.topicZh, id: item.topicEn, ja: item.topicEn, ko: item.topicEn, ru: item.topicEn, ar: item.topicEn },
  sourceClass: 'project_context',
  sourceStatus: 'local',
  radius: 1.85,
  facingCos: 0.52,
  position: { x: item.position[0], y: item.position[1], z: item.position[2] },
  priority: item.priority,
  line: item.line,
}))

const cueByZone = (zoneId: string) => luoyinWorldCues.filter((item) => item.zoneId === zoneId)
// Exhibit cues are authored on the hall's floor plane. A free camera carries
// a significant height above that plane, so including z would make an exhibit
// unreachable even when the viewer is directly over its x/y location.
const distanceSquared = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2

function guideProbePosition(detail: LuoyinWorldMoveDetail) {
  if (detail.source === 'avatar') return detail.position
  // Free camera sits behind the point the visitor is looking at. The authored
  // cues describe that target space, so project a short distance forward for
  // matching instead of requiring the camera itself to overlap the exhibit.
  const projectionDistance = 3
  return {
    x: detail.position.x + detail.forward.x * projectionDistance,
    y: detail.position.y + detail.forward.y * projectionDistance,
    z: detail.position.z + detail.forward.z * projectionDistance,
  }
}

function directionForCue(cue: WorldGuideCue, detail: LuoyinWorldMoveDetail): Direction {
  const dx = cue.position.x - detail.cameraPosition.x
  const dy = cue.position.y - detail.cameraPosition.y
  const length = Math.hypot(dx, dy) || 1
  const fx = detail.forward.x
  const fy = detail.forward.y
  const fl = Math.hypot(fx, fy) || 1
  const rightDot = (-fy / fl) * (dx / length) + (fx / fl) * (dy / length)
  if (rightDot > .34) return 'right'
  if (rightDot < -.34) return 'left'
  return 'front'
}

export type WorldGuideMatch = { cue: WorldGuideCue; direction: Direction }

export function createWorldGuideMatcher() {
  const inside = new Set<string>()
  const triggered = new Set<string>()
  return {
    evaluate(zoneId: string, detail: LuoyinWorldMoveDetail): WorldGuideMatch | null {
      const cues = cueByZone(zoneId)
      const probePosition = guideProbePosition(detail)
      const current = new Set<string>()
      for (const item of cues) if (distanceSquared(probePosition, item.position) <= item.radius ** 2) current.add(item.id)
      for (const id of [...triggered]) if (!current.has(id)) triggered.delete(id)
      inside.clear()
      current.forEach((id) => inside.add(id))
      const candidate = cues
        .filter((item) => current.has(item.id) && !triggered.has(item.id))
        .filter((item) => {
          const dx = item.position.x - detail.cameraPosition.x
          const dy = item.position.y - detail.cameraPosition.y
          const length = Math.hypot(dx, dy) || 1
          const forwardLength = Math.hypot(detail.forward.x, detail.forward.y) || 1
          return (detail.forward.x * dx + detail.forward.y * dy) / (forwardLength * length) >= item.facingCos
        })
        .sort((a, b) => b.priority - a.priority || a.line - b.line)[0]
      if (!candidate) return null
      triggered.add(candidate.id)
      return { cue: candidate, direction: directionForCue(candidate, detail) }
    },
    reset() {
      inside.clear()
      triggered.clear()
    },
  }
}

export function worldGuideZoneId(activeHall: string) {
  return activeHall === 'freeTradePort' ? 'freeTradePort' : activeHall
}

export function worldGuideTitle(cue: WorldGuideCue, language: Language) {
  return localize(cue.title, language)
}

export function worldGuideQuestion(cue: WorldGuideCue, language: Language) {
  return localize(cue.question, language)
}

export type { Direction }
