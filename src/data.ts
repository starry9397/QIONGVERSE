export type Language = 'en' | 'zh'

export type Zone = {
  id: string
  index: string
  title: { en: string; zh: string }
  kicker: { en: string; zh: string }
  description: { en: string; zh: string }
  image: string
  mobileImage: string
  banner: string
  poster: string
  video: string
  tag: { en: string; zh: string }
  tone: 'tide' | 'woven' | 'amber' | 'village' | 'aerospace'
  guide: { en: string; zh: string }
}

export const zones: Zone[] = [
  {
    id: 'tropical', index: '01', title: { en: 'Tropical Island Hall', zh: '热带海岛厅' },
    kicker: { en: 'A shoreline that keeps a record', zh: '一条保存记忆的海岸线' },
    description: { en: 'Enter the tide line: mangrove shadows, salt air, and the slow rhythm of an island edge.', zh: '进入潮汐线：红树林的影子、盐的气息，以及岛屿边缘缓慢的节奏。' },
    image: '/assets/zones/tropical/zone-tropical-clean.webp', mobileImage: '/assets/zones/tropical/zone-tropical-portrait.webp',
    banner: '/assets/user-media2/tropical-hall-banner-01.jpg', poster: '/assets/zones/tropical/zone-tropical-loop-poster.webp', video: '/assets/video/zones/zone-tropical-loop.mp4',
    tag: { en: 'REALITY / COAST', zh: '现实 / 海岸' }, tone: 'tide', guide: { en: 'I can hear the shoreline changing. Start with the coast, then follow the light.', zh: '我听见海岸正在变化。先从海边出发，再沿着光走。' },
  },
  {
    id: 'lijin', index: '02', title: { en: 'Li & Miao Intangible Heritage Hall', zh: '黎苗非遗厅' },
    kicker: { en: 'Patterns that remember', zh: '把记忆织进纹样' },
    description: { en: 'Slow down with the rhythm of Li brocade: color, geometry, touch, and the people who keep making.', zh: '跟随黎锦的节奏慢下来：颜色、几何、触感，以及持续创造的人们。' },
    image: '/assets/zones/lijin/zone-lijin-clean.webp', mobileImage: '/assets/zones/lijin/zone-lijin-portrait.webp',
    banner: '/assets/user-media2/limiao-hall-banner-01.jpg', poster: '/assets/zones/lijin/zone-lijin-loop-poster.webp', video: '/assets/video/zones/zone-lijin-loop.mp4',
    tag: { en: 'REALITY / HERITAGE', zh: '现实 / 文化' }, tone: 'woven', guide: { en: 'This pattern is not a decoration to rush past. Let us look at its structure first, then ask what has been carried through it.', zh: '这不是一眼掠过的装饰。让我们先看它的结构，再问它承载了什么。' },
  },
  {
    id: 'aerospace', index: '03', title: { en: 'Wenchang Aerospace Hall', zh: '文昌航天厅' },
    kicker: { en: 'A project-curated launch horizon', zh: '项目策展的发射地平线' },
    description: { en: 'A visual orientation room for Wenchang aerospace stories, assembled from project-supplied media and open-ended questions.', zh: '一间关于文昌航天叙事的视觉导览厅，使用项目提供的媒体素材，保留继续探索与提问的空间。' },
    image: '/assets/zones/tropical/zone-tropical-clean.webp', mobileImage: '/assets/zones/tropical/zone-tropical-portrait.webp',
    banner: '/assets/user-media2/media2/图片素材新/wenchang-hall-banner-01.jpg', poster: '/assets/user-media2/media2/图片素材新/wenchang-hall-banner-01.jpg', video: '/assets/video/zones/zone-tropical-loop.mp4',
    tag: { en: 'PROJECT / AEROSPACE', zh: '项目 / 航天' }, tone: 'aerospace', guide: { en: 'This is a project-curated visual layer. Ask for sources before treating any aerospace detail as current fact.', zh: '这是项目策展的视觉层。涉及航天细节时，请先查看来源，再将其理解为当前事实。' },
  },
  {
    id: 'huali', index: '04', title: { en: 'Dongfang Rosewood Hall', zh: '东方花梨厅' },
    kicker: { en: 'The memory inside wood', zh: '木头里的时间' },
    description: { en: 'A quiet room of grain, carving and material intelligence. Turn the object slowly; every surface changes the light.', zh: '一间关于木纹、雕刻与材料智慧的安静展室。慢慢转动作品，每一面都会改变光。' },
    image: '/assets/zones/huali/zone-huali-clean.webp', mobileImage: '/assets/zones/huali/zone-huali-portrait.webp',
    banner: '/assets/user-media2/huali-hall-banner-01.jpg', poster: '/assets/zones/huali/zone-huali-loop-poster.webp', video: '/assets/video/zones/zone-huali-loop.mp4',
    tag: { en: 'REALITY / CRAFT', zh: '现实 / 工艺' }, tone: 'amber', guide: { en: 'Quiet here. The wood remembers through its grain. The ShellSong story around it is a fictional layer, not a historical claim.', zh: '这里需要安静。木头通过纹理记忆。围绕它的螺音故事是虚构叙事，不是历史断言。' },
  },
  {
    id: 'village', index: '05', title: { en: 'Beautiful Villages Hall', zh: '美丽乡村厅' },
    kicker: { en: 'Where memory still lives', zh: '记忆仍在生活里' },
    description: { en: 'Look closer at volcanic stone, fields, pathways and everyday gestures that make a place more than a view.', zh: '看见火山石、田野、路径与日常动作，让地方不止是一幅风景。' },
    image: '/assets/zones/village/zone-village-clean.webp', mobileImage: '/assets/zones/village/zone-village-portrait.webp',
    banner: '/assets/user-media2/village-hall-banner-01.jpg', poster: '/assets/zones/village/zone-village-loop-poster.webp', video: '/assets/video/zones/zone-village-loop.mp4',
    tag: { en: 'REALITY / LIVING', zh: '现实 / 生活' }, tone: 'village', guide: { en: 'A village is not a backdrop. Listen for the small routines that make a place feel held.', zh: '乡村不是背景。听一听那些让地方被好好守护的日常。' },
  },
]

export const copy = {
  en: { nav: ['Home', 'Virtual Exhibition', 'Free Trade Port'], menuLabel: 'Open exhibition menu', heroEyebrow: 'HAINAN∞QIONGVERSE / HAINAN PROVINCE', heroTitle: 'The island is speaking.', heroBody: 'A living digital exhibition of Hainan coastlines, cultural memory, craft and village life.', enter: 'Enter exhibition', listen: 'Listen with Luoyin', zonesEyebrow: 'TIDE ARCHIVE / FIVE HALLS', zonesTitle: 'Five ways into Hainan', zonesBody: 'Move through Hainan at the speed of a tide. Each hall holds a different way of reading the province.', guideTitle: 'Luoyin is listening', guideBody: 'Ask about a zone, a material, or the feeling you want to take with you.', guideInput: 'Ask Luoyin something...', send: 'Send', source: 'Supplied project asset', reality: 'Reality layer', myth: 'ShellSong myth', mock: 'Local guide preview', close: 'Close guide', open: 'Open Luoyin guide', footer: 'A living gateway to Hainan Province.' },
  zh: { nav: ['首页', '虚拟展厅', '自贸港'], menuLabel: '打开展厅菜单', heroEyebrow: 'HAINAN∞QIONGVERSE / 海南省', heroTitle: '岛屿正在说话。', heroBody: '一座关于海南热带海岸、文化记忆、手工艺与乡村生活的数字展厅。', enter: '进入展厅', listen: '与螺音一起聆听', zonesEyebrow: '潮汐档案 / 五个分展厅', zonesTitle: '进入海南的五种方式', zonesBody: '以潮汐的速度穿过海南。每一间展厅，都保存着不同的阅读方式。', guideTitle: '螺音正在聆听', guideBody: '可以问我展区、材料，或者你想带走的感觉。', guideInput: '问螺音一个问题……', send: '发送', source: '项目提供素材', reality: '现实层', myth: '螺音神话层', mock: '本地导览预览', close: '关闭导览', open: '打开螺音导览', footer: '一座通往海南省的活态入口。' },
}
