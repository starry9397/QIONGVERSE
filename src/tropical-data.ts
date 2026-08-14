import type { Language } from './data'

export type TropicalExhibit = {
  id: string
  title: Record<Language, string>
  introduction: Record<Language, string>
  note: Record<Language, string>
  asset: string
  fallback: string
}

export const tropicalReferenceImage = '/assets/3d/tropical/tropical-island-reference.png'

export const tropicalExhibits: TropicalExhibit[] = [
  { id: 'waterline-play', title: { en: 'Waterline Play', zh: '水岸活动观察' }, introduction: { en: 'A project-supplied still life for reading floating forms, safety colours and the rhythm between sand and water.', zh: '项目提供的静物图像，用于观看漂浮形态、安全色彩，以及沙滩与海水之间的节奏。' }, note: { en: 'This is a curatorial image, not a tourism service, equipment catalogue, rental offer or activity schedule.', zh: '这是一张策展图像，不是旅游服务、设备目录、租赁信息或活动安排。' }, asset: '/assets/exhibits/tropical/waterline-play.png', fallback: tropicalReferenceImage },
  { id: 'shore-rest', title: { en: 'Shore Rest', zh: '沙滩休憩观察' }, introduction: { en: 'A project-supplied beach composition that invites attention to shade, rest and the changing edge of the tide.', zh: '项目提供的海滩构图，邀请观者观察遮荫、停留，以及潮汐不断变化的边界。' }, note: { en: 'It does not identify a real resort, public facility, opening time, booking channel or current beach condition.', zh: '它不指向真实度假区、公共设施、开放时间、预订渠道或当前海滩状况。' }, asset: '/assets/exhibits/tropical/shore-rest.png', fallback: tropicalReferenceImage },
  { id: 'canopy-path', title: { en: 'Canopy Path', zh: '海岛步道观察' }, introduction: { en: 'A project-supplied path study for reading layered greenery, handmade markers and the invitation to move slowly.', zh: '项目提供的步道图像，用于观看层叠绿意、手工装饰与慢行的邀请。' }, note: { en: 'This is not a map, route recommendation, safety notice or verified description of a specific island trail.', zh: '这不是地图、路线推荐、安全提示，也不是对某条真实海岛步道的核验描述。' }, asset: '/assets/exhibits/tropical/canopy-path.png', fallback: tropicalReferenceImage },
  { id: 'tropical-table', title: { en: 'Tropical Table', zh: '热带餐桌观察' }, introduction: { en: 'A project-supplied table scene for noticing colour, texture and the social feeling of sharing a coastal meal.', zh: '项目提供的餐桌场景，用于观察色彩、质感，以及海岸共享餐食的社交感受。' }, note: { en: 'The image is not a menu, restaurant listing, price statement, food-safety claim or promise of availability.', zh: '这不是菜单、餐厅信息、价格说明、食品安全声明或供应承诺。' }, asset: '/assets/exhibits/tropical/tropical-table.png', fallback: tropicalReferenceImage },
]
