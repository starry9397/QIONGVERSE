import type { AnimationClip, Camera, Object3D, WebGLRenderer } from 'three'

export type AvatarWorldConfig = {
  spawn: { x: number; y: number; z: number }
  bounds: { minX: number; maxX: number; minY: number; maxY: number; floorZ: number }
  radius: number
  cameraDistance: number
  cameraHeight: number
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
type SplatLike = { getBoundingBox?: (centersOnly?: boolean) => { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } } }
type AvatarOptions = {
  scene: Object3D
  camera: Camera
  renderer: WebGLRenderer
  controls: SparkControlsLike
  splat?: SplatLike
  config: AvatarWorldConfig
  onState?: (state: AvatarState) => void
}
type ActionLike = { reset: () => ActionLike; fadeIn: (duration: number) => ActionLike; fadeOut: (duration: number) => ActionLike; play: () => ActionLike }

const desktopAsset = '/assets/3d/luoyin/luoyin-avatar-desktop.glb'
const mobileAsset = '/assets/3d/luoyin/luoyin-avatar-mobile.glb'

let cachedGltf: Promise<{ scene: Object3D; animations: AnimationClip[] }> | null = null

const isMobile = () => matchMedia('(max-width: 760px)').matches

async function loadLuoyinAsset() {
  if (!cachedGltf) {
    cachedGltf = (async () => {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js')
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')
      const loader = new GLTFLoader()
      loader.setDRACOLoader(dracoLoader)
      const source = await loader.loadAsync(isMobile() ? mobileAsset : desktopAsset)
      dracoLoader.dispose()
      return { scene: source.scene, animations: source.animations }
    })()
  }
  return cachedGltf
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function createLuoyinAvatarController(options: AvatarOptions) {
  let state: AvatarState = 'hidden'
  let avatar: Object3D | null = null
  let mixer: { update: (delta: number) => void; clipAction: (clip: AnimationClip, root?: Object3D) => ActionLike } | null = null
  let actions = new Map<string, ActionLike>()
  let activeAction: ActionLike | null = null
  let THREE: typeof import('three') | null = null
  let position: { x: number; y: number; z: number } = { ...options.config.spawn }
  let yaw = 0
  let pitch = 0.32
  let distance = options.config.cameraDistance
  let speed = 0
  let jumpVelocity = 0
  let verticalOffset = 0
  let pointerId: number | null = null
  let lastPointer = { x: 0, y: 0 }
  let pinchDistance: number | null = null
  const pointers = new Map<number, { x: number; y: number }>()
  const keys = new Set<string>()

  const setState = (next: AvatarState) => { state = next; options.onState?.(next) }
  const setControlsEnabled = (enabled: boolean) => {
    if (options.controls.pointerControls) options.controls.pointerControls.enable = enabled
    if (options.controls.fpsMovement) options.controls.fpsMovement.enable = enabled
  }
  const safeBounds = () => {
    const configured = options.config.bounds
    try {
      const box = options.splat?.getBoundingBox?.(true)
      if (box && Number.isFinite(box.min.x) && Number.isFinite(box.max.x)) {
        const next = {
          minX: Math.max(configured.minX, box.min.x + options.config.radius),
          maxX: Math.min(configured.maxX, box.max.x - options.config.radius),
          minY: Math.max(configured.minY, box.min.y + options.config.radius),
          maxY: Math.min(configured.maxY, box.max.y - options.config.radius),
          floorZ: Math.max(configured.floorZ, box.min.z + .02),
        }
        if (next.minX < next.maxX && next.minY < next.maxY) return next
      }
    } catch {
      // Spark may expose bounds only after the first render.
    }
    return configured
  }
  const applyPosition = (next: { x: number; y: number; z?: number }) => {
    const bounds = safeBounds()
    position.x = clamp(next.x, bounds.minX, bounds.maxX)
    position.y = clamp(next.y, bounds.minY, bounds.maxY)
    position.z = bounds.floorZ
    if (avatar) avatar.position.set(position.x, position.y, position.z)
  }
  const play = (name: string) => {
    if (!mixer || !avatar) return
    const action = actions.get(name) || actions.get(name.replace('Luoyin_', ''))
    if (!action || action === activeAction) return
    activeAction?.fadeOut(.16)
    action.reset().fadeIn(.16).play()
    activeAction = action
  }
  const updateCamera = () => {
    if (!avatar || !THREE) return
    const target = new THREE.Vector3(position.x, position.y, position.z + options.config.cameraHeight)
    const horizontal = Math.cos(pitch) * distance
    options.camera.position.set(target.x - Math.sin(yaw) * horizontal, target.y - Math.cos(yaw) * horizontal, target.z + Math.sin(pitch) * distance)
    options.camera.up.set(0, 0, 1)
    options.camera.lookAt(target)
  }
  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'shift'].includes(key)) { keys.add(key); event.preventDefault() }
  }
  const onKeyUp = (event: KeyboardEvent) => { keys.delete(event.key.toLowerCase()) }
  const onPointerDown = (event: PointerEvent) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size === 1) { pointerId = event.pointerId; lastPointer = { x: event.clientX, y: event.clientY }; options.renderer.domElement.setPointerCapture(event.pointerId) }
    if (pointers.size === 2) { const points = [...pointers.values()]; pinchDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) }
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
      return
    }
    if (pointerId !== event.pointerId) return
    yaw -= (event.clientX - lastPointer.x) * .008
    pitch = clamp(pitch + (event.clientY - lastPointer.y) * .004, -.15, .72)
    lastPointer = { x: event.clientX, y: event.clientY }
  }
  const onPointerUp = (event: PointerEvent) => {
    pointers.delete(event.pointerId)
    if (pointerId === event.pointerId) pointerId = null
    if (pointers.size < 2) pinchDistance = null
  }
  const onWheel = (event: WheelEvent) => { distance = clamp(distance + event.deltaY * .002, options.config.cameraDistance * .55, options.config.cameraDistance * 1.8); event.preventDefault() }
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
        const { clone } = await import('three/examples/jsm/utils/SkeletonUtils.js')
        if (avatar && state === 'hidden') {
          avatar.visible = true
          setControlsEnabled(false)
          addListeners()
          setState('ready')
          updateCamera()
          return
        }
        const source = await loadLuoyinAsset()
        avatar = clone(source.scene) as Object3D
        options.scene.add(avatar)
        const box = new THREE.Box3().setFromObject(avatar)
        const center = box.getCenter(new THREE.Vector3())
        avatar.position.sub(center)
        avatar.position.z -= box.min.z - box.getCenter(new THREE.Vector3()).z
        applyPosition(position)
        mixer = new THREE.AnimationMixer(avatar)
        actions = new Map(source.animations.map((clip) => [clip.name, mixer!.clipAction(clip, avatar!)]))
        setControlsEnabled(false)
        addListeners()
        play('Luoyin_Idle')
        setState('ready')
        updateCamera()
      } catch {
        avatar?.removeFromParent()
        avatar = null
        setControlsEnabled(true)
        setState('failed')
      }
    },
    disable() {
      removeListeners()
      setControlsEnabled(true)
      if (avatar) avatar.visible = false
      setState('hidden')
    },
    update(deltaTime: number) {
      if (state !== 'ready' || !avatar || !mixer) return
      if (!THREE) return
      const forward = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'))
      const strafe = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
      const length = Math.hypot(forward, strafe)
      const targetSpeed = length ? (keys.has('shift') ? 2.4 : 1.25) : 0
      speed += (targetSpeed - speed) * Math.min(1, deltaTime * 8)
      if (keys.has(' ') && verticalOffset === 0) { jumpVelocity = 3.1; keys.delete(' ') }
      jumpVelocity -= 9.2 * deltaTime
      verticalOffset = Math.max(0, verticalOffset + jumpVelocity * deltaTime)
      if (verticalOffset === 0) jumpVelocity = 0
      if (length) {
        const fx = Math.sin(yaw); const fy = Math.cos(yaw)
        const rx = Math.cos(yaw); const ry = -Math.sin(yaw)
        const dx = (fx * forward + rx * strafe) / length * speed * deltaTime
        const dy = (fy * forward + ry * strafe) / length * speed * deltaTime
        applyPosition({ x: position.x + dx, y: position.y + dy })
        const heading = Math.atan2(dx, dy)
        avatar.rotation.z += Math.atan2(Math.sin(heading - avatar.rotation.z), Math.cos(heading - avatar.rotation.z)) * Math.min(1, deltaTime * 10)
        if (!forward && strafe < 0) play('Luoyin_TurnLeft')
        else if (!forward && strafe > 0) play('Luoyin_TurnRight')
        else play('Luoyin_Walk')
      } else play('Luoyin_Idle')
      if (avatar) avatar.position.z = safeBounds().floorZ + verticalOffset
      mixer.update(deltaTime)
      updateCamera()
    },
    dispose() {
      removeListeners()
      setControlsEnabled(true)
      avatar?.removeFromParent()
      avatar = null
      mixer = null
      actions.clear()
      setState('hidden')
    },
    getState: () => state,
  }
}

export const avatarWorldConfigs: Record<'limiao' | 'aerospace' | 'huali' | 'village', AvatarWorldConfig> = {
  limiao: { spawn: { x: 0, y: 0, z: .05 }, bounds: { minX: -2.8, maxX: 2.8, minY: -2.4, maxY: 2.4, floorZ: .05 }, radius: .22, cameraDistance: 2.8, cameraHeight: 1.15 },
  aerospace: { spawn: { x: 0, y: 0, z: .05 }, bounds: { minX: -3.2, maxX: 3.2, minY: -2.4, maxY: 2.4, floorZ: .05 }, radius: .22, cameraDistance: 2.9, cameraHeight: 1.15 },
  huali: { spawn: { x: 0, y: 0, z: .05 }, bounds: { minX: -2.6, maxX: 2.6, minY: -2.6, maxY: 2.6, floorZ: .05 }, radius: .22, cameraDistance: 2.75, cameraHeight: 1.15 },
  village: { spawn: { x: 0, y: 0, z: .05 }, bounds: { minX: -3.4, maxX: 3.4, minY: -2.8, maxY: 2.8, floorZ: .05 }, radius: .22, cameraDistance: 3, cameraHeight: 1.15 },
}
