import type { Camera, Object3D, WebGLRenderer } from 'three'

export type AvatarWorldConfig = {
  spawn: { x: number; y: number; z: number }
  bounds: { minX: number; maxX: number; minY: number; maxY: number; floorZ: number }
  radius: number
  modelHeight: number
  modelFacingOffset: number
  cameraDistance: number
  cameraHeight: number
  cameraTargetHeight: number
  contactShadowRadius: number
  // Small lift from the authored floor to overlap the visible cloud platform
  // with the SPZ surface without creating a floating gap.
  platformLift: number
}

export type AvatarState = 'hidden' | 'loading' | 'ready' | 'failed'

export type LuoyinAvatarController = {
  enable: () => Promise<void>
  disable: () => void
  update: (deltaTime: number) => void
  dispose: () => void
  getState: () => AvatarState
}

type PointerControlsLike = { enable?: boolean }
type SparkControlsLike = { pointerControls?: PointerControlsLike; fpsMovement?: PointerControlsLike }
type SplatLike = {
  getBoundingBox?: (centersOnly?: boolean) => { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }
  forEachSplat?: (callback: (index: number, center: { x: number; y: number; z: number }, scales: unknown, quaternion: unknown, opacity: number) => void) => void
}
type AvatarOptions = {
  scene: Object3D
  avatarScene?: Object3D
  contactScene?: Object3D
  camera: Camera
  renderer: WebGLRenderer
  controls: SparkControlsLike
  splat?: SplatLike
  config: AvatarWorldConfig
  onState?: (state: AvatarState) => void
}

const desktopAsset = '/assets/3d/luoyin/luoyin-avatar-desktop.glb?v=grounded-20260814-3'
const mobileAsset = '/assets/3d/luoyin/luoyin-avatar-mobile.glb?v=grounded-20260814-3'
// Runtime verification of the supplied mesh shows its visible front is
// opposite the controller's mathematical heading. A single half-turn maps
// W to the character's back (moving away from the camera) and S to its face.
const LUOYIN_FORWARD_CORRECTION = Math.PI

let cachedGltf: Promise<{ scene: Object3D }> | null = null

const isMobile = () => matchMedia('(max-width: 760px)').matches
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

async function loadLuoyinAsset() {
  if (!cachedGltf) {
    cachedGltf = (async () => {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js')
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')
      const loader = new GLTFLoader()
      loader.setDRACOLoader(dracoLoader)
      const source = await loader.loadAsync(isMobile() ? mobileAsset : desktopAsset)
      dracoLoader.dispose()
      return { scene: source.scene }
    })()
  }
  return cachedGltf
}

export function createLuoyinAvatarController(options: AvatarOptions) {
  let state: AvatarState = 'hidden'
  let avatar: Object3D | null = null
  let avatarModel: Object3D | null = null
  let contactShadow: Object3D | null = null
  let avatarLights: Object3D[] = []
  let THREE: typeof import('three') | null = null
  let position = { ...options.config.spawn }
  // Match the verified hall entry view: the camera starts behind the avatar
  // on -X and looks into the world along +X. This keeps the first third-person
  // frame inside the authored scene instead of orbiting out through the back.
  let yaw = Math.PI / 2
  let pitch = 0.28
  let distance = options.config.cameraDistance
  let speed = 0
  let jumpVelocity = 0
  let verticalOffset = 0
  let resolvedBounds: { minX: number; maxX: number; minY: number; maxY: number; floorZ: number } | null = null
  let capturedEntry = false
  let pointerId: number | null = null
  let lastPointer = { x: 0, y: 0 }
  let pinchDistance: number | null = null
  const pointers = new Map<number, { x: number; y: number }>()
  const keys = new Set<string>()

  const setState = (next: AvatarState) => { state = next; options.onState?.(next) }
  const avatarScene = () => options.avatarScene ?? options.scene
  const setControlsEnabled = (enabled: boolean) => {
    if (options.controls.pointerControls) options.controls.pointerControls.enable = enabled
    if (options.controls.fpsMovement) options.controls.fpsMovement.enable = enabled
  }
  const safeBounds = () => {
    if (resolvedBounds) return resolvedBounds
    const configured = options.config.bounds
    try {
      const box = options.splat?.getBoundingBox?.(true)
      if (box && Number.isFinite(box.min.x) && Number.isFinite(box.max.x) && Number.isFinite(box.min.y) && Number.isFinite(box.max.y)) {
        const next = {
          minX: Math.max(configured.minX, box.min.x + options.config.radius),
          maxX: Math.min(configured.maxX, box.max.x - options.config.radius),
          minY: Math.max(configured.minY, box.min.y + options.config.radius),
          maxY: Math.min(configured.maxY, box.max.y - options.config.radius),
          floorZ: configured.floorZ,
        }
        if (next.minX < next.maxX && next.minY < next.maxY) {
          resolvedBounds = next
          return next
        }
      }
    } catch {
      // Spark may expose bounds only after its first render.
    }
    return configured
  }
  const applyPosition = (next: { x: number; y: number }) => {
    const bounds = safeBounds()
    position.x = clamp(next.x, bounds.minX, bounds.maxX)
    position.y = clamp(next.y, bounds.minY, bounds.maxY)
    position.z = bounds.floorZ
    if (avatar) avatar.position.set(position.x, position.y, position.z + options.config.platformLift + verticalOffset)
  }
  const normalizeAvatar = () => {
    if (!avatarModel || !THREE) return
    // GLTF assets are Y-up while Spark worlds use Z-up.  Convert the model
    // once at the root so its local Y axis becomes the world's vertical Z
    // axis.  Applying this before measuring the bounds prevents a sideways
    // spawn and keeps the feet on the configured floor.
    avatarModel.rotation.order = 'XYZ'
    avatarModel.rotation.set(Math.PI / 2, 0, 0)
    avatarModel.updateMatrixWorld(true)
    let primaryMesh: Object3D | null = null
    let primaryVertexCount = 0
    avatarModel.traverse((node) => {
      const candidate = node as unknown as { isMesh?: boolean; geometry?: { attributes?: { position?: { count?: number } } } }
      const count = candidate.isMesh ? candidate.geometry?.attributes?.position?.count ?? 0 : 0
      if (count > primaryVertexCount) { primaryMesh = node; primaryVertexCount = count }
    })
    const measuredObject = primaryMesh ?? avatarModel
    const box = new THREE.Box3().setFromObject(measuredObject)
    const center = box.getCenter(new THREE.Vector3())
    avatarModel.position.x -= center.x
    avatarModel.position.y -= center.y
    avatarModel.position.z -= box.min.z
    avatarModel.updateMatrixWorld(true)
    const normalized = new THREE.Box3().setFromObject(measuredObject)
    const height = normalized.max.z - normalized.min.z
    if (height > 0.001) avatarModel.scale.multiplyScalar(options.config.modelHeight / height)
    avatarModel.updateMatrixWorld(true)
    // Scaling around the local origin can introduce a fractional base shift.
    // Re-anchor after scaling so the movement root, not a render-time bound,
    // owns the ground contact.
    const scaled = new THREE.Box3().setFromObject(measuredObject)
    avatarModel.position.z -= scaled.min.z
    avatarModel.updateMatrixWorld(true)
    avatarModel.traverse((node) => {
      const mesh = node as unknown as { isMesh?: boolean; frustumCulled?: boolean; renderOrder?: number; material?: { needsUpdate?: boolean; depthTest?: boolean; depthWrite?: boolean; transparent?: boolean; opacity?: number; side?: number } | Array<{ needsUpdate?: boolean; depthTest?: boolean; depthWrite?: boolean; transparent?: boolean; opacity?: number; side?: number }> }
      if (!mesh.isMesh) return
      mesh.frustumCulled = false
      // Preserve self-depth in the late avatar pass. Disabling depth here
      // makes the sculpt's front and back shells draw through one another.
      mesh.renderOrder = 0
      const prepareMaterial = (material: { needsUpdate?: boolean; depthTest?: boolean; depthWrite?: boolean }) => {
        material.depthTest = true
        material.depthWrite = true
        material.needsUpdate = true
      }
      if (Array.isArray(mesh.material)) mesh.material.forEach(prepareMaterial)
      else if (mesh.material) prepareMaterial(mesh.material)
    })
  }
  const captureEntryFromCamera = () => {
    if (!THREE || capturedEntry) return
    const forward = options.camera.getWorldDirection(new THREE.Vector3())
    const horizontalLength = Math.hypot(forward.x, forward.y)
    if (horizontalLength < .0001) return
    const directionX = forward.x / horizontalLength
    const directionY = forward.y / horizontalLength
    // Preserve the view that has already been proven visible in the SPZ. The
    // avatar is placed one camera-distance ahead of it, so switching modes
    // cannot teleport the viewer to a hard-coded capture-edge coordinate.
    position.x = options.camera.position.x + directionX * distance
    position.y = options.camera.position.y + directionY * distance
    yaw = Math.atan2(directionX, directionY)
    capturedEntry = true
  }
  const resetToVerifiedEntry = () => {
    // Every hall component is authored around the same Spark entry pose.
    // Reasserting it before the first avatar enable prevents Spark's free
    // camera inertia from becoming an accidental spawn point.
    options.camera.position.set(0, 0, 0)
    options.camera.up.set(0, 0, 1)
    options.camera.lookAt(1, 0, 0)
    options.camera.updateMatrixWorld(true)
  }
  const createContactShadow = () => {
    if (!THREE || contactShadow) return
    const canvas = document.createElement('canvas')
    canvas.width = 128; canvas.height = 128
    const context = canvas.getContext('2d')
    const gradient = context?.createRadialGradient(64, 64, 3, 64, 64, 62)
    if (context && gradient) {
      gradient.addColorStop(0, 'rgba(4, 10, 8, .62)')
      gradient.addColorStop(.48, 'rgba(4, 10, 8, .34)')
      gradient.addColorStop(1, 'rgba(4, 10, 8, 0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, 128, 128)
    }
    const texture = new THREE.CanvasTexture(canvas)
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0x202421,
      map: texture,
      opacity: .68,
      transparent: true,
      // Gaussian splats do not expose a stable floor depth buffer. The shadow
      // is deliberately drawn as a late contact cue, then the avatar is drawn
      // above it with its own self-depth.
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const shadow = new THREE.Mesh(geometry, material)
    shadow.name = 'LuoyinGroundContact'
    shadow.scale.set(options.config.contactShadowRadius, options.config.contactShadowRadius * .58, 1)
    shadow.position.set(position.x, position.y, safeBounds().floorZ + options.config.platformLift + .012)
    shadow.renderOrder = 1
    ;(options.contactScene ?? options.scene).add(shadow)
    contactShadow = shadow

  }
  const addAvatarLights = () => {
    if (!THREE || avatarLights.length) return
    const ambient = new THREE.AmbientLight(0xffffff, 1.8)
    const key = new THREE.DirectionalLight(0xfff0d6, 2.2)
    key.position.set(2.5, -3.5, 5)
    const fill = new THREE.DirectionalLight(0x9ed9ff, 1.1)
    fill.position.set(-3, 2, 2.5)
    avatarLights = [ambient, key, fill]
    avatarLights.forEach((light) => avatarScene().add(light))
  }
  const removeAvatarLights = () => {
    avatarLights.forEach((light) => light.removeFromParent())
    avatarLights = []
  }
  const updateCamera = () => {
    if (!avatar || !THREE) return
    const bounds = safeBounds()
    const target = new THREE.Vector3(position.x, position.y, bounds.floorZ + verticalOffset + options.config.cameraTargetHeight)
    const sinYaw = Math.abs(Math.sin(yaw))
    const cosYaw = Math.abs(Math.cos(yaw))
    const maxFromX = sinYaw > .0001
      ? (Math.sin(yaw) > 0 ? target.x - bounds.minX : bounds.maxX - target.x) / sinYaw
      : Number.POSITIVE_INFINITY
    const maxFromY = cosYaw > .0001
      ? (Math.cos(yaw) > 0 ? bounds.maxY - target.y : target.y - bounds.minY) / cosYaw
      : Number.POSITIVE_INFINITY
    // Keep the whole camera orbit inside the authored SPZ safety rectangle.
    // Independent x/y clamping can move the camera to a corner outside the
    // scene while it is still looking at the avatar.
    const orbitLimit = Math.max(.12, Math.min(maxFromX, maxFromY) - .12)
    const pitchCos = Math.max(.08, Math.cos(pitch))
    const horizontal = Math.min(pitchCos * distance, orbitLimit)
    const orbitDistance = horizontal / pitchCos
    const nextX = target.x - Math.sin(yaw) * horizontal
    const nextY = target.y - Math.cos(yaw) * horizontal
    const nextZ = bounds.floorZ + options.config.cameraHeight + verticalOffset + Math.sin(pitch) * orbitDistance * .42
    options.camera.position.set(clamp(nextX, bounds.minX, bounds.maxX), clamp(nextY, bounds.minY, bounds.maxY), Math.max(bounds.floorZ + 0.15, nextZ))
    options.camera.up.set(0, 0, 1)
    options.camera.lookAt(target)
  }
  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'shift'].includes(key)) {
      keys.add(key)
      event.preventDefault()
    }
  }
  const onKeyUp = (event: KeyboardEvent) => { keys.delete(event.key.toLowerCase()) }
  const onPointerDown = (event: PointerEvent) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size === 1) {
      pointerId = event.pointerId
      lastPointer = { x: event.clientX, y: event.clientY }
      options.renderer.domElement.setPointerCapture(event.pointerId)
    }
    if (pointers.size === 2) {
      const points = [...pointers.values()]
      pinchDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
    }
  }
  const onPointerMove = (event: PointerEvent) => {
    const previous = pointers.get(event.pointerId)
    if (!previous) return
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size === 2 && pinchDistance) {
      const points = [...pointers.values()]
      const nextDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
      distance = clamp(distance - (nextDistance - pinchDistance) * .008, options.config.cameraDistance * .55, options.config.cameraDistance * 1.8)
      pinchDistance = nextDistance
      updateCamera()
      return
    }
    if (pointerId !== event.pointerId) return
    yaw -= (event.clientX - lastPointer.x) * .008
    pitch = clamp(pitch + (event.clientY - lastPointer.y) * .004, -.12, .62)
    lastPointer = { x: event.clientX, y: event.clientY }
    updateCamera()
  }
  const onPointerUp = (event: PointerEvent) => {
    pointers.delete(event.pointerId)
    if (pointerId === event.pointerId) pointerId = null
    if (pointers.size < 2) pinchDistance = null
  }
  const onWheel = (event: WheelEvent) => {
    distance = clamp(distance + event.deltaY * .002, options.config.cameraDistance * .55, options.config.cameraDistance * 1.8)
    event.preventDefault()
    updateCamera()
  }
  const addListeners = () => {
    const canvas = options.renderer.domElement
    canvas.style.touchAction = 'none'
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    addEventListener('keydown', onKeyDown)
    addEventListener('keyup', onKeyUp)
  }
  const removeListeners = () => {
    const canvas = options.renderer.domElement
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
    canvas.removeEventListener('wheel', onWheel)
    removeEventListener('keydown', onKeyDown)
    removeEventListener('keyup', onKeyUp)
    keys.clear(); pointers.clear(); pointerId = null; pinchDistance = null
  }

  return {
    async enable() {
      if (state === 'loading' || state === 'ready') return
      setState('loading')
      try {
        THREE = await import('three')
        if (!avatar) {
          resetToVerifiedEntry()
          const source = await loadLuoyinAsset()
          captureEntryFromCamera()
          avatar = new THREE.Group()
          avatar.name = 'LuoyinStaticAvatar'
          avatar.rotation.order = 'ZXY'
          avatar.rotation.set(0, 0, 0)
          avatarModel = source.scene.clone(true)
          avatar.add(avatarModel)
          avatarScene().add(avatar)
          addAvatarLights()
          normalizeAvatar()
          createContactShadow()
          // Start facing the viewer. Subsequent movement changes the root only
          // through the shortest angular path, so idle never snaps or flips.
          avatar.rotation.z = Math.atan2(-Math.sin(yaw), -Math.cos(yaw)) + options.config.modelFacingOffset
          applyPosition(position)
        } else {
          captureEntryFromCamera()
          avatar.visible = true
      if (contactShadow) contactShadow.visible = true
          applyPosition(position)
        }
        setControlsEnabled(false)
        addListeners()
        setState('ready')
        updateCamera()
      } catch {
        avatar?.removeFromParent()
        avatar = null
        avatarModel = null
        removeAvatarLights()
        setControlsEnabled(true)
        setState('failed')
      }
    },
    disable() {
      removeListeners()
      setControlsEnabled(true)
      if (avatar) avatar.visible = false
      if (contactShadow) contactShadow.visible = false
      setState('hidden')
    },
    update(deltaTime: number) {
      if (state !== 'ready' || !avatar || !THREE) return
      avatar.rotation.x = 0
      avatar.rotation.y = 0
      const forward = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'))
      const strafe = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
      const length = Math.hypot(forward, strafe)
      const targetSpeed = length ? (keys.has('shift') ? 2.4 : 1.25) : 0
      speed += (targetSpeed - speed) * Math.min(1, deltaTime * 8)
      if (keys.has(' ') && verticalOffset <= .001 && jumpVelocity <= 0) {
        jumpVelocity = 2.5
        keys.delete(' ')
      }
      jumpVelocity -= 9.2 * deltaTime
      verticalOffset = Math.max(0, verticalOffset + jumpVelocity * deltaTime)
      if (verticalOffset === 0) jumpVelocity = 0
      if (length) {
        const fx = Math.sin(yaw); const fy = Math.cos(yaw)
        const rx = Math.cos(yaw); const ry = -Math.sin(yaw)
        const moveX = (fx * forward + rx * strafe) / length
        const moveY = (fy * forward + ry * strafe) / length
        const dx = moveX * speed * deltaTime
        const dy = moveY * speed * deltaTime
        applyPosition({ x: position.x + dx, y: position.y + dy })
        const heading = Math.atan2(moveX, moveY) + options.config.modelFacingOffset
        const delta = Math.atan2(Math.sin(heading - avatar.rotation.z), Math.cos(heading - avatar.rotation.z))
        avatar.rotation.z += delta * Math.min(1, deltaTime * 10)
        avatar.rotation.x = 0
        avatar.rotation.y = 0
      } else {
        speed *= Math.max(0, 1 - deltaTime * 10)
      }
      const bounds = safeBounds()
      const airborne = clamp(verticalOffset / .45, 0, 1)
      avatar.position.z = bounds.floorZ + options.config.platformLift + verticalOffset
      if (contactShadow) {
        const scale = 1 - airborne * .28
        contactShadow.position.set(position.x, position.y, bounds.floorZ + options.config.platformLift + .012)
        contactShadow.scale.set(
          options.config.contactShadowRadius * scale,
          options.config.contactShadowRadius * .58 * scale,
          1,
        )
        const material = (contactShadow as import('three').Mesh).material as import('three').MeshBasicMaterial
        material.opacity = .68 * (1 - airborne * .78)
      }
      updateCamera()
    },
    dispose() {
      removeListeners()
      setControlsEnabled(true)
      avatar?.removeFromParent()
      if (contactShadow) {
        const shadowMesh = contactShadow as import('three').Mesh
        const shadowMaterial = shadowMesh.material as import('three').MeshBasicMaterial
        shadowMesh.geometry.dispose()
        shadowMaterial.map?.dispose()
        shadowMaterial.dispose()
        contactShadow.removeFromParent()
      }
      avatar = null
      avatarModel = null
      contactShadow = null
      removeAvatarLights()
      setState('hidden')
    },
    getState: () => state,
  }
}

export const avatarWorldConfigs: Record<'tropical' | 'limiao' | 'aerospace' | 'huali' | 'village', AvatarWorldConfig> = {
  // Spawn/bounds follow the measured SPZ centres rather than a shared origin.
  // These are calibrated visible floor planes, not splat bounding-box minima.
  // Camera and character share the same plane, so the cloud base, shadow and
  // third-person target remain physically coherent.
  tropical: { spawn: { x: 2.45, y: 0, z: 0 }, bounds: { minX: -8.8, maxX: 12.5, minY: -5.2, maxY: 6.5, floorZ: -.78 }, radius: .16, modelHeight: .82, modelFacingOffset: LUOYIN_FORWARD_CORRECTION, cameraDistance: 2.55, cameraHeight: 1.48, cameraTargetHeight: .46, contactShadowRadius: .31, platformLift: 0 },
  limiao: { spawn: { x: 2.55, y: 0, z: 0 }, bounds: { minX: -5.9, maxX: 21.9, minY: -4.6, maxY: 6.6, floorZ: -.84 }, radius: .16, modelHeight: .82, modelFacingOffset: LUOYIN_FORWARD_CORRECTION, cameraDistance: 2.55, cameraHeight: 1.52, cameraTargetHeight: .46, contactShadowRadius: .31, platformLift: 0 },
  aerospace: { spawn: { x: 2.65, y: 0, z: 0 }, bounds: { minX: -3.5, maxX: 8.2, minY: -2.8, maxY: 4.2, floorZ: -.84 }, radius: .16, modelHeight: .8, modelFacingOffset: LUOYIN_FORWARD_CORRECTION, cameraDistance: 2.65, cameraHeight: 1.54, cameraTargetHeight: .45, contactShadowRadius: .3, platformLift: 0 },
  huali: { spawn: { x: 2.55, y: 0, z: 0 }, bounds: { minX: -15.4, maxX: 23, minY: -2.7, maxY: 3.8, floorZ: -.64 }, radius: .16, modelHeight: .82, modelFacingOffset: LUOYIN_FORWARD_CORRECTION, cameraDistance: 2.55, cameraHeight: 1.32, cameraTargetHeight: .46, contactShadowRadius: .32, platformLift: 0 },
  village: { spawn: { x: 2.85, y: 0, z: 0 }, bounds: { minX: -43.6, maxX: 48.8, minY: -52.4, maxY: 54.1, floorZ: -1.12 }, radius: .16, modelHeight: .84, modelFacingOffset: LUOYIN_FORWARD_CORRECTION, cameraDistance: 2.85, cameraHeight: 1.84, cameraTargetHeight: .48, contactShadowRadius: .33, platformLift: 0 },
}
