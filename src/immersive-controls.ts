import type { Box3, Camera } from 'three'

type PointerControlsLike = {
  enable?: boolean
  canvas?: HTMLCanvasElement
  update?: (...args: any[]) => boolean
  rotateSpeed?: number
  rotateInertia?: number
  moveInertia?: number
  pointerRollScale?: number
  scrollSpeed?: number
}

type FpsMovementLike = {
  moveSpeed?: number
  rollSpeed?: number
  rotateSpeed?: number
}

type SparkControlsLike = {
  pointerControls?: PointerControlsLike
  fpsMovement?: FpsMovementLike
}

type SplatBoundsLike = {
  getBoundingBox?: (centersOnly?: boolean) => Box3
}

type CameraGuard = {
  clamp: () => void
  dispose: () => void
}

const finiteBox = (box: Box3 | undefined) => Boolean(box && Number.isFinite(box.min.x) && Number.isFinite(box.min.y) && Number.isFinite(box.min.z) && Number.isFinite(box.max.x) && Number.isFinite(box.max.y) && Number.isFinite(box.max.z) && box.max.x > box.min.x && box.max.y > box.min.y && box.max.z > box.min.z)

/** Keeps Spark's free camera usable inside a splat without allowing roll or inversion. */
export function createImmersiveCameraGuard(
  controls: SparkControlsLike,
  camera: Camera,
  splat?: SplatBoundsLike,
): CameraGuard {
  const pointer = controls.pointerControls
  if (pointer) {
    pointer.rotateSpeed = Math.min(pointer.rotateSpeed ?? .0025, .0025)
    pointer.rotateInertia = .08
    pointer.moveInertia = .06
    pointer.pointerRollScale = 0
    pointer.scrollSpeed = Math.min(pointer.scrollSpeed ?? .15, .15)
  }
  const movement = controls.fpsMovement
  if (movement) {
    movement.moveSpeed = Math.min(movement.moveSpeed ?? .6, .6)
    movement.rollSpeed = 0
    movement.rotateSpeed = Math.min(movement.rotateSpeed ?? .5, .5)
  }

  let bounds: Box3 | null = null
  let orientationReady = false
  let yaw = 0
  let pitch = 0
  let activePointer: number | null = null
  let lastPointer = { x: 0, y: 0 }
  let lastTourPosition = camera.position.clone()
  let lastTourEventAt = 0
  const canvas = pointer?.canvas

  const syncOrientation = () => {
    const direction = camera.getWorldDirection(camera.position.clone())
    const horizontal = Math.hypot(direction.x, direction.y) || 1
    yaw = Math.atan2(direction.y, direction.x)
    pitch = Math.atan2(direction.z, horizontal)
    orientationReady = true
  }
  const applyOrientation = () => {
    const direction = camera.position.clone().set(
      Math.cos(yaw) * Math.cos(pitch),
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
    )
    camera.up.set(0, 0, 1)
    camera.lookAt(camera.position.clone().add(direction))
    camera.updateMatrixWorld(true)
  }

  // Spark's built-in PointerControls uses Y-up Euler rotation. The splat halls
  // are Z-up, which cross-wires horizontal drag into vertical motion. Retain
  // its enable state for avatar mode, but replace only its pointer update with
  // an explicit Z-up yaw/pitch controller.
  if (pointer) pointer.update = () => false
  const onPointerDown = (event: PointerEvent) => {
    if (!pointer || pointer.enable === false || event.button !== 0) return
    if (!orientationReady) syncOrientation()
    activePointer = event.pointerId
    lastPointer = { x: event.clientX, y: event.clientY }
    canvas?.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent) => {
    if (!pointer || pointer.enable === false || activePointer !== event.pointerId) return
    const dx = event.clientX - lastPointer.x
    const dy = event.clientY - lastPointer.y
    lastPointer = { x: event.clientX, y: event.clientY }
    yaw -= dx * .006
    pitch = Math.max(-.82, Math.min(.82, pitch - dy * .004))
    applyOrientation()
  }
  const onPointerUp = (event: PointerEvent) => {
    if (activePointer !== event.pointerId) return
    try { canvas?.releasePointerCapture(event.pointerId) } catch { /* pointer was already released */ }
    activePointer = null
  }
  canvas?.addEventListener('pointerdown', onPointerDown)
  canvas?.addEventListener('pointermove', onPointerMove)
  canvas?.addEventListener('pointerup', onPointerUp)
  canvas?.addEventListener('pointercancel', onPointerUp)
  const fallbackMin = camera.position.clone().add({ x: -4, y: -4, z: -2 })
  const fallbackMax = camera.position.clone().add({ x: 4, y: 4, z: 2.5 })
  const getBounds = () => {
    if (bounds) return bounds
    try {
      const candidate = splat?.getBoundingBox?.(true)
      if (finiteBox(candidate)) {
        const size = candidate!.max.clone().sub(candidate!.min)
        const padding = Math.max(.18, Math.min(size.x, size.y, size.z) * .035)
        bounds = candidate!.clone().expandByScalar(-padding)
      }
    } catch {
      // Some Spark versions expose the bounds only after the first render.
    }
    return bounds
  }

  const clamp = () => {
    camera.up.set(0, 0, 1)
    if (pointer?.enable === false) {
      orientationReady = false
    } else if (!orientationReady) syncOrientation()
    const activeBounds = getBounds()
    if (activeBounds) camera.position.clamp(activeBounds.min, activeBounds.max)
    else camera.position.clamp(fallbackMin, fallbackMax)
    const now = performance.now()
    if (now - lastTourEventAt > 1400 && camera.position.distanceToSquared(lastTourPosition) > .035) {
      lastTourEventAt = now
      lastTourPosition.copy(camera.position)
      window.dispatchEvent(new CustomEvent('luoyin-world-move'))
    }

  }

  const dispose = () => {
    canvas?.removeEventListener('pointerdown', onPointerDown)
    canvas?.removeEventListener('pointermove', onPointerMove)
    canvas?.removeEventListener('pointerup', onPointerUp)
    canvas?.removeEventListener('pointercancel', onPointerUp)
    activePointer = null
  }

  return { clamp, dispose }
}
