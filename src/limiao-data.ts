import type { Language } from './data'
import { localize, type Localized } from './i18n'

export type SourceStatus = 'verified_source' | 'project_asset' | 'aigc_concept'

export type LimiaoExhibit = {
  id: string
  kind: 'image' | 'video' | 'model'
  title: Localized
  introduction: Localized
  note: Localized
  asset: string
  poster?: string
  fallback?: string
  sourceLabel: Localized
  sourceStatus: SourceStatus
  sourceUrl?: string
  modelAsset?: string
}

const unescoUrl = 'https://ich.unesco.org/en/RL/traditional-textile-techniques-of-the-li-ethnic-group-spinning-dyeing-weaving-and-embroidering-00238'

export const limiaoExhibits: LimiaoExhibit[] = [
  {
    id: 'pattern', kind: 'image',
    title: { en: 'Pattern Field', zh: '纹样场' },
    introduction: { en: 'A project-supplied reading image for slowing down with colour, rhythm and geometry. It is an entry into looking, not a catalogue record for an historic object.', zh: '项目提供的阅读图像，邀请观者从色彩、节奏与几何关系开始观看；它不是历史器物的目录记录。' },
    note: { en: 'For broad orientation to Li traditional textile techniques, read the reviewed UNESCO source. This image is project-provided curatorial context.', zh: '黎族传统纺织技艺的概览请查阅已核验的 UNESCO 来源；本图像为项目提供的策展语境。' },
    asset: '/assets/zones/lijin/zone-lijin-wide.webp', fallback: '/assets/user-media2/limiao-pattern-poster.jpg', sourceLabel: { en: 'Project-provided curatorial context', zh: '项目提供的策展语境' }, sourceStatus: 'project_asset', sourceUrl: unescoUrl,
  },
  {
    id: 'weaving', kind: 'image',
    title: { en: 'Weaving Reading Room', zh: '织造阅读室' },
    introduction: { en: 'A second supplied image offers a close visual reading of pattern and material. It does not identify a maker, date, provenance or commercial availability.', zh: '第二张项目提供的图像用于近距离阅读纹样与材质；它不标识制作者、年代、来源或商业可得性。' },
    note: { en: 'Li traditional textile techniques are introduced here only through the linked UNESCO source. Miao references in this room remain project-provided curatorial context.', zh: '本展厅关于黎族传统纺织技艺的介绍仅以链接的 UNESCO 来源为准；苗族相关表述仍为项目提供的策展语境。' },
    asset: '/assets/zones/lijin/zone-lijin-portrait.webp', fallback: '/assets/user-media2/brocade-pattern.jpg', sourceLabel: { en: 'Project-provided curatorial context', zh: '项目提供的策展语境' }, sourceStatus: 'project_asset', sourceUrl: unescoUrl,
  },
  {
    id: 'hall-view', kind: 'image',
    title: { en: 'Hall View: Woven Light', zh: '展厅一景：织光' },
    introduction: { en: 'A supplied view of the Li & Miao room anchors the digital visit in a Hainan Province exhibition setting. It is a project asset, not an official museum photograph.', zh: '项目提供的展厅图像，把数字访问锚定在海南省的展览语境中；它不是官方博物馆摄影。' },
    note: { en: 'Use this image as a calm orientation point before moving back into the 3D world.', zh: '可将这张图像作为安静的方向提示，再返回 3D 世界继续探索。' },
    asset: '/assets/user-media2/limiao-hall-banner-01.jpg', fallback: '/assets/user-media2/limiao-pattern-poster.jpg', sourceLabel: { en: 'Project-supplied asset', zh: '项目提供素材' }, sourceStatus: 'project_asset',
  },
  ...(['001', '002', '003'] as const).flatMap((number, index): LimiaoExhibit[] => [{
    id: `object-${number}`, kind: 'model',
    title: { en: `Brocade Concept Object ${String(index + 1).padStart(2, '0')}`, zh: `黎锦概念展品 ${String(index + 1).padStart(2, '0')}` },
    introduction: { en: 'An AIGC concept exhibit for this digital room. It is not a historical object, authentic textile, retail product or evidence of a traditional technique.', zh: '为本数字展厅创作的 AIGC 策展概念展品；它不是历史文物、真实纺织品、零售商品或传统技艺的证据。' },
    note: { en: 'Open the companion moving study by choice. The associated GLB is loaded only when you open this exhibit.', zh: '可自主打开配套动态研究；关联 GLB 仅在打开本展项时加载。' },
    asset: `/assets/video/products/product-lijin-${number}-loop.mp4`, poster: `/assets/3d/products/lijin/product-lijin-${number}-poster.webp`, fallback: `/assets/video/products/product-lijin-${number}-loop-reduced.webp`, modelAsset: `/assets/3d/products/lijin/product-lijin-${number}-web.glb`, sourceLabel: { en: 'AIGC concept exhibit', zh: 'AIGC 策展概念展品' }, sourceStatus: 'aigc_concept',
  }]),
]

limiaoExhibits[0].title = { en: 'Boat-House Form', zh: '船型屋形制' }
limiaoExhibits[0].introduction = { en: 'A project-supplied reconstruction image of a boat-house form, inviting visitors to read roof lines, timber rhythm and the relationship between shelter and movement.', zh: '项目提供的船型屋复原模型图像，邀请观者观察屋顶线条、木构节奏，以及庇护与移动之间的关系。' }
limiaoExhibits[0].asset = '/assets/user-media2/limiao-boat-house/船型屋复原模型（中央镇馆之宝）.png'
limiaoExhibits[1].title = { en: 'Wind Instrument Study', zh: '鼻箫与叮咚乐器' }
limiaoExhibits[1].introduction = { en: 'A project-supplied study of nose flute and ding-dong instrument forms, inviting a close reading of shape, resonance and the gestures implied by each object.', zh: '项目提供的鼻箫与叮咚乐器模型图像，邀请观者近距离阅读形态、共鸣与器物暗示的动作。' }
limiaoExhibits[1].asset = '/assets/user-media2/limiao-instruments/鼻箫、叮咚等乐器模型.png'
limiaoExhibits[2].title = { en: 'Li Brocade Loom', zh: '黎锦织机' }
limiaoExhibits[2].introduction = { en: 'A project-supplied loom model for reading the frame, tension and hand-to-material relationship behind a weaving process.', zh: '项目提供的黎锦织机模型图像，用于阅读织造过程中的框架、张力与手工和材料之间的关系。' }
limiaoExhibits[2].asset = '/assets/user-media2/limiao-loom/黎锦织机（粒子展台基础模型）.png'

export const sourceStatusLabel = (status: SourceStatus, language: Language) => {
  const labels: Record<SourceStatus, Localized> = {
    verified_source: { en: 'Verified source', zh: '已核验来源' },
    project_asset: { en: 'Project-supplied asset', zh: '项目提供素材' },
    aigc_concept: { en: 'AIGC concept exhibit', zh: 'AIGC 策展概念展品' },
  }
  return localize(labels[status], language)
}
