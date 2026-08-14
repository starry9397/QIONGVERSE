import type { Language } from './data'

export type AerospaceExhibit = {
  id: string
  title: Record<Language, string>
  introduction: Record<Language, string>
  note: Record<Language, string>
  asset: string
  fallback: string
}

export const cnsaUrl = 'https://www.cnsa.gov.cn/english/'
export const aerospaceReferenceImage = '/assets/3d/aerospace/文昌航天展厅参考图.png'
export const aerospaceConsoleImage = '/assets/user-media2/space-console/发射体验控制台.png'

export const aerospaceExhibits: AerospaceExhibit[] = [
  {
    id: 'launch-horizon',
    title: { en: 'Launch Horizon', zh: '发射地平线' },
    introduction: { en: 'A project-supplied orientation image for reading vertical scale, coastal light and the threshold between ground and sky.', zh: '一张项目提供的导览图像，用于观看垂直尺度、海岸光线以及地面与天空之间的临界感。' },
    note: { en: 'This curatorial image is not an official launch record, schedule or facility photograph.', zh: '这张策展图像不是官方发射记录、发射时间表或设施摄影。' },
    asset: '/assets/user-media2/media2/图片素材新/wenchang-hall-banner-01.jpg', fallback: aerospaceReferenceImage,
  },
  {
    id: 'launch-vehicle-study',
    title: { en: 'Launch Vehicle Study', zh: '发射载具形态研究' },
    introduction: { en: 'A project-supplied visual study of a suspended launch-vehicle form, composed for looking at silhouette, structure and upward movement.', zh: '一件项目提供的垂挂式发射载具形态研究，用于观看轮廓、结构与向上运动感。' },
    note: { en: 'The image is a curatorial asset, not a technical diagram or a claim about a current vehicle configuration.', zh: '该图像为策展素材，不是技术图纸，也不对当前载具构型作出主张。' },
    asset: '/assets/user-media2/space-rocket/长征五号B火箭模型（中央垂挂）.png', fallback: aerospaceReferenceImage,
  },
  {
    id: 'orbital-constellation',
    title: { en: 'Orbital Constellation Study', zh: '轨道星座研究' },
    introduction: { en: 'A project-supplied image that invites visitors to read orbital rhythm, distance and communication as visual relationships.', zh: '一张项目提供的图像，邀请访客从视觉关系出发阅读轨道节奏、距离与通信。' },
    note: { en: 'This is not an operational constellation map, service promise or source for current satellite information.', zh: '这不是在轨星座地图、服务承诺或当前卫星信息来源。' },
    asset: '/assets/user-media2/space-satellite/卫星星座模型（海南卫星）.png', fallback: aerospaceReferenceImage,
  },
  {
    id: 'lunar-mobility',
    title: { en: 'Lunar Mobility Study', zh: '月面移动研究' },
    introduction: { en: 'A project-supplied rover image used to consider surface, mobility and the small scale of exploration against a larger field.', zh: '一张项目提供的月球车图像，用于思考表面、移动性与探索者在更大场域中的尺度。' },
    note: { en: 'It is not a documentary record, a current mission update or a claim of technical accuracy.', zh: '它不是纪实记录、当前任务动态或技术准确性声明。' },
    asset: '/assets/user-media2/space-lunar-rover/嫦娥五号玉兔月球车模型.png', fallback: aerospaceReferenceImage,
  },
  {
    id: 'crew-environment',
    title: { en: 'Crew Environment Study', zh: '舱内环境研究' },
    introduction: { en: 'A project-supplied display image for considering enclosure, protection and the human scale inside an aerospace narrative.', zh: '一张项目提供的展柜图像，用于思考航天叙事中的舱体、保护与人的尺度。' },
    note: { en: 'This curatorial asset does not identify authentic equipment, current standards or operational conditions.', zh: '这项策展素材不用于识别真实装备、当前标准或运行条件。' },
    asset: '/assets/user-media2/space-spacesuit/舱内航天服展柜.png', fallback: aerospaceReferenceImage,
  },
]
