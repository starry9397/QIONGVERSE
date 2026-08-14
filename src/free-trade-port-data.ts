import type { Language } from './data'

export type FreeTradePortExhibit = {
  id: string
  title: Record<Language, string>
  introduction: Record<Language, string>
  note: Record<Language, string>
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
    title: { en: 'Port Connection', zh: '港口连接' },
    introduction: { en: 'A project-supplied image for reading vessels, equipment, water and edge conditions as a connected visual field.', zh: '一张项目提供的图像，用于观察船舶、设备、水面与岸线如何构成相互连接的视觉场域。' },
    note: { en: 'This curatorial asset is not an official port record, operating schedule, capacity statement, or service commitment.', zh: '该策展素材不是官方港口记录、运营时刻表、吞吐能力说明或服务承诺。' },
    asset: '/assets/user-media2/zimaogang-pictures/port-connection.jpg', fallback: freeTradePortReferenceImage,
  },
  {
    id: 'bonded-logistics',
    title: { en: 'Bonded Logistics', zh: '保税物流' },
    introduction: { en: 'A project-supplied visual study of storage, circulation and the routes that connect a logistics landscape.', zh: '一项项目提供的视觉研究，用于观察仓储、流动与连接物流场景的路径关系。' },
    note: { en: 'It does not describe an active warehouse, customs treatment, cargo availability, clearance outcome, or commercial service.', zh: '它不描述真实仓库、海关待遇、货物可得性、通关结果或商业服务。' },
    asset: '/assets/user-media2/zimaogang-pictures/bonded-logistics.jpg', fallback: freeTradePortReferenceImage,
  },
  {
    id: 'smart-customs',
    title: { en: 'Smart Customs', zh: '智慧监管' },
    introduction: { en: 'A project-supplied image that frames systems, screens and infrastructure as a visual prompt for considering public-information pathways.', zh: '一张项目提供的图像，将系统、屏幕与基础设施作为理解公共信息路径的视觉提示。' },
    note: { en: 'This image is not a technical description of a real regulatory system or a statement of current procedures.', zh: '这张图不是对真实监管系统的技术说明，也不代表当前办理流程。' },
    asset: '/assets/user-media2/zimaogang-pictures/smart-customs.jpg', fallback: freeTradePortReferenceImage,
  },
  {
    id: 'open-exchange',
    title: { en: 'Open Exchange', zh: '开放交流' },
    introduction: { en: 'A project-supplied scene for considering exchange, meeting and outward-looking connections within a provincial public-information narrative.', zh: '一项项目提供的场景，用于在省级公共信息叙事中思考交流、会面与对外连接。' },
    note: { en: 'It does not establish investment eligibility, a partnership, commercial opportunity, consumer offer, or policy outcome.', zh: '它不构成投资资格、合作关系、商业机会、消费优惠或政策结果。' },
    asset: '/assets/user-media2/zimaogang-pictures/open-exchange.jpg', fallback: freeTradePortReferenceImage,
  },
]
