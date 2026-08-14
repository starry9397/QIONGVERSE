import type { Box3, Camera } from 'three'

type PointerControlsLike = {
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
}

const finiteBox = (box: Box3 | undefined) => Boolean(box && Number.isFinite(box.min.x) && Number.isFinite(box.min.y) && Number.isFinite(box.min.z) && Number.isFinite(box.max.x) && Number.isFinite(box.max.y) && Number.isFinite(box.max.z) && box.max.x > box.min.x && box.max.y > box.min.y && box.max.z > box.min.z)

/** Keeps Spark's free camera usable inside a splat without allowing roll or inversion. */
export function createImmersiveCameraGuard(controls: SparkControlsLike, camera: Camera, splat?: SplatBoundsLike): CameraGuard {
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
    const activeBounds = getBounds()
    if (activeBounds) camera.position.clamp(activeBounds.min, activeBounds.max)
    else camera.position.clamp(fallbackMin, fallbackMax)

    const direction = camera.getWorldDirection(camera.position.clone())
    const horizontal = Math.hypot(direction.x, direction.y) || 1
    const pitch = Math.atan2(direction.z, horizontal)
    const limitedPitch = Math.max(-.82, Math.min(.82, pitch))
    if (Math.abs(pitch - limitedPitch) > .001) {
      const limitedDirection = direction.clone()
      const horizontalScale = Math.cos(limitedPitch)
      limitedDirection.set((direction.x / horizontal) * horizontalScale, (direction.y / horizontal) * horizontalScale, Math.sin(limitedPitch))
      camera.lookAt(camera.position.clone().add(limitedDirection))
    }
  }

  return { clamp }
}
