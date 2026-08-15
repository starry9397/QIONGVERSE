import { type CSSProperties, type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react'
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
  children: ReactNode
}

const SAFE_MARGIN = 16
const mouseHoldMs = 350
const touchHoldMs = 450

function footprint() { return window.innerWidth <= 760 ? 120 : 154 }
function clampPosition(position: Position): Position {
  const size = footprint()
  return {
    x: Math.min(Math.max(SAFE_MARGIN, position.x), Math.max(SAFE_MARGIN, window.innerWidth - size - SAFE_MARGIN)),
    y: Math.min(Math.max(SAFE_MARGIN, position.y), Math.max(SAFE_MARGIN, window.innerHeight - size - SAFE_MARGIN)),
  }
}
function defaultPosition(): Position { return clampPosition({ x: 24, y: window.innerHeight - footprint() - 28 }) }

export default function LuoyinDesktopPet({ language, visible, chatOpen, suspended, onOpenChat, onCloseChat, onClosePet, children }: Props) {
  const [position, setPosition] = useState<Position>(defaultPosition)
  const [dragging, setDragging] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const petButtonRef = useRef<HTMLButtonElement>(null)
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

  return <div className={`luoyin-desktop-pet${chatOpen ? ' is-chat-open' : ''}${dragging ? ' is-dragging' : ''}${opensDown ? ' chat-opens-down' : ''}${opensRight ? ' chat-opens-right' : ''}`} style={{ left: position.x, top: position.y, '--luoyin-chat-space': `${chatSpace}px` } as CSSProperties}>
    {chatOpen && <div className="luoyin-chat-anchor" onKeyDownCapture={(event) => { if (event.key === 'Escape') { event.preventDefault(); closeChat() } }}>{children}</div>}
    <button ref={petButtonRef} data-luoyin-pet-toggle className="luoyin-pet-surface" type="button" aria-label={label} aria-expanded={chatOpen} aria-controls="luoyin-chat-panel" onClick={() => { if (!suppressClickRef.current) onOpenChat() }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}>
      {imageFailed ? <span className="luoyin-pet-fallback" aria-hidden="true">◎</span> : <img src="/assets/luoyin/luoyin-resonance-deskpet.png" alt="" draggable={false} onError={() => setImageFailed(true)} />}
    </button>
    <button className="luoyin-pet-close" type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onClosePet() }} aria-label={closeLabel}>×</button>
  </div>
}
