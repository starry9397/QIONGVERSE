import { useRef, useState, type PointerEvent as ReactPointerEvent, type CSSProperties } from 'react'
import './Lanyard.css'

type LanyardProps = {
  frontImage: string
  ariaLabel?: string
  className?: string
}

type CardTransform = { x: number; y: number; rotate: number }

export default function Lanyard({ frontImage, ariaLabel, className = '' }: LanyardProps) {
  const [dragging, setDragging] = useState(false)
  const [transform, setTransform] = useState<CardTransform>({ x: 0, y: 0, rotate: -2 })
  const lastPoint = useRef({ x: 0, y: 0 })

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    lastPoint.current = { x: event.clientX, y: event.clientY }
    setDragging(true)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const dx = event.clientX - lastPoint.current.x
    const dy = event.clientY - lastPoint.current.y
    lastPoint.current = { x: event.clientX, y: event.clientY }
    setTransform((current) => ({
      x: Math.max(-28, Math.min(28, current.x + dx)),
      y: Math.max(-22, Math.min(22, current.y + dy)),
      rotate: Math.max(-12, Math.min(12, current.rotate + dx * 0.18)),
    }))
  }

  const release = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setDragging(false)
  }

  const style = {
    '--lanyard-x': `${transform.x}px`,
    '--lanyard-y': `${transform.y}px`,
    '--lanyard-rotate': `${transform.rotate}deg`,
  } as CSSProperties

  return <div className={`lanyard-wrapper${className ? ` ${className}` : ''}`} role="img" aria-label={ariaLabel}>
    <div className="lanyard-stage">
      <span className="lanyard-rope" aria-hidden="true" />
      <span className="lanyard-clip" aria-hidden="true" />
      <div
        className={`lanyard-card${dragging ? ' is-dragging' : ''}`}
        style={style}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <img src={frontImage} alt="" draggable="false" />
      </div>
    </div>
  </div>
}
