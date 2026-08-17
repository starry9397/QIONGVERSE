import { type CSSProperties, type PointerEvent, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Language } from '../data'
import { inline } from '../i18n'
import './luoyin-desktop-pet.css'

type Position = { x: number; y: number }
type DragState = { pointerId: number; startX: number; startY: number; offsetX: number; offsetY: number; dragging: boolean; moved: boolean; timer: number | null } | null

type Props = {
  language: Language
  visible: boolean
  chatOpen: boolean
  suspended: boolean
  onOpenChat: () => void
  onCloseChat: () => void
  onClosePet: () => void
  surfaceTone?: 'light' | 'dark'
  tourCue?: { title: string; text: string; onOpen: () => void; onDismiss: () => void; onSpeak?: () => void }
  children: ReactNode
}

const SAFE_MARGIN = 16
const CHAT_WIDTH = 384
const CHAT_GAP = 8
const CUE_WIDTH = 260
const CUE_HEIGHT = 190
const mouseHoldMs = 350
const touchHoldMs = 450

function footprint() {
  if (window.innerWidth <= 760) return 120
  return Math.min(154, Math.max(118, window.innerWidth * 0.11))
}
function clampPosition(position: Position): Position {
  const size = footprint()
  return {
    x: Math.min(Math.max(SAFE_MARGIN, position.x), Math.max(SAFE_MARGIN, window.innerWidth - size - SAFE_MARGIN)),
    y: Math.min(Math.max(SAFE_MARGIN, position.y), Math.max(SAFE_MARGIN, window.innerHeight - size - SAFE_MARGIN)),
  }
}
function defaultPosition(): Position { return clampPosition({ x: 24, y: window.innerHeight - footprint() - 28 }) }

type FloatingPlacement = { left: number; top: number; side: 'left' | 'right'; above: boolean; maxHeight?: number }

function clampNumber(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(minimum, value), Math.max(minimum, maximum))
}

function alignedPanelPlacement(position: Position, panelWidth: number, panelHeight: number, gap = CHAT_GAP): FloatingPlacement {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const petSize = footprint()
  const aboveSpace = position.y - gap
  const belowSpace = viewportHeight - (position.y + petSize) - gap
  const hasVerticalRoom = aboveSpace >= panelHeight || belowSpace >= panelHeight
  const above = aboveSpace >= panelHeight || aboveSpace >= belowSpace
  const preferredTop = above ? position.y - panelHeight - gap : position.y + petSize + gap
  if (hasVerticalRoom) {
    const centeredLeft = position.x + petSize / 2 - panelWidth / 2
    return {
      left: clampNumber(centeredLeft, SAFE_MARGIN, viewportWidth - panelWidth - SAFE_MARGIN),
      top: clampNumber(preferredTop, SAFE_MARGIN, viewportHeight - panelHeight - SAFE_MARGIN),
      side: centeredLeft >= position.x ? 'right' : 'left',
      above,
    }
  }
  const rightSpace = viewportWidth - (position.x + petSize) - gap
  const leftSpace = position.x - gap
  const side: FloatingPlacement['side'] = rightSpace >= panelWidth || rightSpace >= leftSpace ? 'right' : 'left'
  const preferredLeft = side === 'right' ? position.x + petSize + gap : position.x - panelWidth - gap
  const left = clampNumber(preferredLeft, SAFE_MARGIN, viewportWidth - panelWidth - SAFE_MARGIN)
  const centeredTop = position.y + petSize / 2 - panelHeight / 2
  return { left, top: clampNumber(centeredTop, SAFE_MARGIN, viewportHeight - panelHeight - SAFE_MARGIN), side, above }
}

function alignedCuePlacement(position: Position, cueWidth: number, cueHeight: number, gap = CHAT_GAP): FloatingPlacement {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const petSize = footprint()
  const aboveSpace = position.y - gap
  const belowSpace = viewportHeight - (position.y + petSize) - gap
  const hasVerticalRoom = aboveSpace >= cueHeight || belowSpace >= cueHeight
  const above = aboveSpace >= cueHeight || aboveSpace >= belowSpace
  const top = clampNumber(above ? position.y - cueHeight - gap : position.y + petSize + gap, SAFE_MARGIN, viewportHeight - cueHeight - SAFE_MARGIN)
  if (hasVerticalRoom) {
    const centeredLeft = position.x + petSize / 2 - cueWidth / 2
    return { left: clampNumber(centeredLeft, SAFE_MARGIN, viewportWidth - cueWidth - SAFE_MARGIN), top, side: centeredLeft >= position.x ? 'right' : 'left', above }
  }
  const rightSpace = viewportWidth - (position.x + petSize) - gap
  const leftSpace = position.x - gap
  const side: FloatingPlacement['side'] = rightSpace >= cueWidth || rightSpace >= leftSpace ? 'right' : 'left'
  const left = clampNumber(side === 'right' ? position.x + petSize + gap : position.x - cueWidth - gap, SAFE_MARGIN, viewportWidth - cueWidth - SAFE_MARGIN)
  const centeredTop = position.y + petSize / 2 - cueHeight / 2
  return { left, top: clampNumber(centeredTop, SAFE_MARGIN, viewportHeight - cueHeight - SAFE_MARGIN), side, above }
}

export default function LuoyinDesktopPet({ language, visible, chatOpen, suspended, onOpenChat, onCloseChat, onClosePet, surfaceTone = 'light', tourCue, children }: Props) {
  const [position, setPosition] = useState<Position>(defaultPosition)
  const [chatPlacement, setChatPlacement] = useState<FloatingPlacement>(() => alignedPanelPlacement(defaultPosition(), Math.min(CHAT_WIDTH, Math.max(220, window.innerWidth - SAFE_MARGIN * 2)), Math.max(220, Math.min(620, window.innerHeight - SAFE_MARGIN * 2))))
  const [cuePlacement, setCuePlacement] = useState<FloatingPlacement>(() => alignedCuePlacement(defaultPosition(), Math.min(CUE_WIDTH, Math.max(220, window.innerWidth - SAFE_MARGIN * 2)), CUE_HEIGHT))
  const [dragging, setDragging] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const petButtonRef = useRef<HTMLButtonElement>(null)
  const chatAnchorRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLElement>(null)
  const dragRef = useRef<DragState>(null)
  const suppressClickRef = useRef(false)

  const closeChat = () => {
    onCloseChat()
    window.setTimeout(() => petButtonRef.current?.focus(), 0)
  }

  const clearDrag = () => {
    const drag = dragRef.current
    if (drag && drag.timer !== null) window.clearTimeout(drag.timer)
    dragRef.current = null
    setDragging(false)
  }

  useEffect(() => {
    const resize = () => setPosition((current) => clampPosition(current))
    addEventListener('resize', resize)
    return () => removeEventListener('resize', resize)
  }, [])

  useLayoutEffect(() => {
    const panelWidth = Math.min(CHAT_WIDTH, Math.max(220, window.innerWidth - SAFE_MARGIN * 2))
    const maxHeight = Math.max(220, Math.min(620, window.innerHeight - SAFE_MARGIN * 2))
    const renderedPanel = chatAnchorRef.current?.firstElementChild as HTMLElement | null
    const renderedBounds = renderedPanel?.getBoundingClientRect()
    const measuredWidth = renderedBounds?.width || panelWidth
    const measuredHeight = renderedBounds?.height || maxHeight
    setChatPlacement({ ...alignedPanelPlacement(position, measuredWidth, measuredHeight), maxHeight })
    const cueWidth = Math.min(CUE_WIDTH, Math.max(220, window.innerWidth - SAFE_MARGIN * 2))
    const renderedCue = cueRef.current?.getBoundingClientRect()
    setCuePlacement(alignedCuePlacement(position, renderedCue?.width || cueWidth, renderedCue?.height || CUE_HEIGHT))
  }, [position, chatOpen, tourCue])

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const panel = chatAnchorRef.current?.firstElementChild as HTMLElement | null
    const cue = cueRef.current
    if (!panel && !cue) return
    const observer = new ResizeObserver(() => {
      if (panel) {
        const bounds = panel.getBoundingClientRect()
        const maxHeight = Math.max(220, Math.min(620, window.innerHeight - SAFE_MARGIN * 2))
        setChatPlacement({ ...alignedPanelPlacement(position, bounds.width, bounds.height), maxHeight })
      }
      if (cue) {
        const bounds = cue.getBoundingClientRect()
        setCuePlacement(alignedCuePlacement(position, bounds.width, bounds.height))
      }
    })
    if (panel) observer.observe(panel)
    if (cue) observer.observe(cue)
    return () => observer.disconnect()
  }, [position, chatOpen, tourCue])

  useEffect(() => () => clearDrag(), [])

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (suspended || (event.pointerType === 'mouse' && event.button !== 0)) return
    const box = event.currentTarget.getBoundingClientRect()
    const pointerId = event.pointerId
    const target = event.currentTarget
    const drag: Exclude<DragState, null> = { pointerId, startX: event.clientX, startY: event.clientY, offsetX: event.clientX - box.left, offsetY: event.clientY - box.top, dragging: false, moved: false, timer: null }
    const holdMs = event.pointerType === 'touch' ? touchHoldMs : mouseHoldMs
    dragRef.current = drag

    // Capture immediately so the hold timer and subsequent movement survive the pointer leaving the image.
    // Scrolling remains available until the hold completes because preventDefault is only used while dragging.
    try {
      target.setPointerCapture(pointerId)
    } catch {
      // Browsers that decline capture still use the element-level Pointer Events handlers.
    }

    drag.timer = window.setTimeout(() => {
      if (!dragRef.current || dragRef.current.pointerId !== pointerId) return
      dragRef.current.dragging = true
      setDragging(true)
    }, holdMs)
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY)
    if (!drag.dragging && distance > 6) {
      drag.moved = true
      if (drag.timer !== null) window.clearTimeout(drag.timer)
      drag.timer = null
      return
    }
    if (!drag.dragging) return
    event.preventDefault()
    setPosition(clampPosition({ x: event.clientX - drag.offsetX, y: event.clientY - drag.offsetY }))
  }

  const onPointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (drag.dragging || drag.moved) {
      suppressClickRef.current = true
      window.setTimeout(() => { suppressClickRef.current = false }, 0)
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    clearDrag()
  }

  if (!visible || suspended) return null
  const opensDown = position.y < window.innerHeight / 2
  const opensRight = position.x < window.innerWidth / 2
  const chatSpace = opensDown
    ? Math.max(220, window.innerHeight - position.y - 18)
    : Math.max(220, position.y - 18)
  const label = inline(language, 'Open Luoyin chat. Long press and drag to move Luoyin.', '打开螺音对话。长按后拖动可移动螺音。')
  const closeLabel = inline(language, 'Hide Luoyin for this session', '在本次浏览中隐藏螺音')

  return <div className={`luoyin-desktop-pet tone-${surfaceTone}${chatOpen ? ' is-chat-open' : ''}${dragging ? ' is-dragging' : ''}${opensDown ? ' chat-opens-down' : ''}${opensRight ? ' chat-opens-right' : ''}`} style={{ left: position.x, top: position.y, '--luoyin-chat-space': `${chatSpace}px` } as CSSProperties}>
    {tourCue && !chatOpen && <aside ref={cueRef} className={`luoyin-tour-cue cue-side-${cuePlacement.side} cue-vertical-${cuePlacement.above ? 'above' : 'below'}`} style={{ '--luoyin-cue-left': `${cuePlacement.left}px`, '--luoyin-cue-top': `${cuePlacement.top}px` } as CSSProperties} role="status" aria-live="polite"><button className="luoyin-tour-cue-close" type="button" onClick={tourCue.onDismiss} aria-label={inline(language, 'Dismiss tour cue', '关闭导览提示')}>×</button><p className="luoyin-tour-cue-title">{tourCue.title}</p><p>{tourCue.text}</p><div className="luoyin-tour-cue-actions"><button type="button" onClick={tourCue.onOpen}>{inline(language, 'Ask Luoyin', '询问螺音')} <span aria-hidden="true">↗</span></button>{tourCue.onSpeak && <button type="button" onClick={tourCue.onSpeak}>{inline(language, 'Play voice', '播放语音')} <span aria-hidden="true">◉</span></button>}<button type="button" onClick={tourCue.onDismiss}>{inline(language, 'Later', '稍后')}</button></div></aside>}
    {chatOpen && <div ref={chatAnchorRef} className="luoyin-chat-anchor" style={{ '--luoyin-chat-left': `${chatPlacement.left}px`, '--luoyin-chat-top': `${chatPlacement.top}px`, '--luoyin-chat-max-height': `${chatPlacement.maxHeight}px` } as CSSProperties} onKeyDownCapture={(event) => { if (event.key === 'Escape') { event.preventDefault(); closeChat() } }}>{children}</div>}
    <button ref={petButtonRef} data-luoyin-pet-toggle className="luoyin-pet-surface" type="button" aria-label={label} aria-expanded={chatOpen} aria-controls="luoyin-chat-panel" onClick={() => { if (!suppressClickRef.current) onOpenChat() }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}>
      {imageFailed ? <span className="luoyin-pet-fallback" aria-hidden="true">◎</span> : <picture><source type="image/webp" srcSet="/assets/luoyin/luoyin-resonance-deskpet.webp" /><img src="/assets/luoyin/luoyin-resonance-deskpet.png" decoding="async" alt="" draggable={false} onError={() => setImageFailed(true)} /></picture>}
    </button>
    <button className="luoyin-pet-close" type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onClosePet() }} aria-label={closeLabel}>×</button>
  </div>
}
