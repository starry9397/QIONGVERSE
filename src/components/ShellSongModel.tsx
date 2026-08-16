import { useEffect, useRef, useState } from 'react'
import { inline, type Language } from '../i18n'
import { localMedia } from '../public-media'

type ModelOption = {
  id: string
  file: string
  en: string
  zh: string
}

type GestureRuntime = {
  frame: number
  recognizer: { close: () => void; recognizeForVideo: (video: HTMLVideoElement, timestamp: number) => { landmarks: Array<Array<{ x: number; y: number }>>; gestures: Array<Array<{ categoryName: string }>> } }
  stream: MediaStream
}

type DisposableModel = {
  traverse: (callback: (child: unknown) => void) => void
}

const modelOptions: ModelOption[] = [
  { id: 'body', file: localMedia('/shellsong/models/web/luoyin_body.glb?v=web-20260816-1'), en: 'Core form', zh: '本体' },
  { id: 'awakened', file: localMedia('/shellsong/models/web/luoyin_awakened.glb?v=web-20260816-1'), en: 'Awakening', zh: '苏醒' },
  { id: 'awakened-ii', file: localMedia('/shellsong/models/web/luoyin_awakened2.glb?v=web-20260816-1'), en: 'Awakening II', zh: '苏醒 II' },
  { id: 'resonance', file: localMedia('/shellsong/models/web/luoyin_resonance.glb?v=web-20260816-1'), en: 'Resonance', zh: '共振' },
  { id: 'celebration', file: localMedia('/shellsong/models/web/luoyin_celebration.glb?v=web-20260816-1'), en: 'Celebration', zh: '庆祝' },
  { id: 'flying', file: localMedia('/shellsong/models/web/luoyin_flying.glb?v=web-20260816-1'), en: 'Flying', zh: '飞行' },
  { id: 'shell-closed', file: localMedia('/shellsong/models/web/luoyin_shell_closed.glb?v=web-20260816-1'), en: 'Resting shell', zh: '合螺休眠' },
]

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function disposeModel(root: DisposableModel) {
  root.traverse((child) => {
    const mesh = child as { geometry?: { dispose?: () => void }; material?: unknown }
    mesh.geometry?.dispose?.()
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials.forEach((material) => {
      const candidate = material as Record<string, unknown> | undefined
      if (!candidate) return
      Object.values(candidate).forEach((value) => {
        const texture = value as { isTexture?: boolean; dispose?: () => void }
        if (texture?.isTexture) texture.dispose?.()
      })
      ;(candidate.dispose as (() => void) | undefined)?.()
    })
  })
}

export function ShellSongModel({ language }: { language: Language }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const gestureVideoRef = useRef<HTMLVideoElement>(null)
  const runtimeRef = useRef<GestureRuntime | null>(null)
  const yawRef = useRef(.15)
  const distanceRef = useRef(3.25)
  const lastHandXRef = useRef<number | null>(null)
  const lastPinchRef = useRef<number | null>(null)
  const gestureReadoutRef = useRef('')
  const [selectedModel, setSelectedModel] = useState(modelOptions[0])
  const [failed, setFailed] = useState(false)
  const [gestureMode, setGestureMode] = useState<'off' | 'loading' | 'active' | 'unsupported' | 'error'>('off')
  const [gestureReadout, setGestureReadout] = useState('')

  const modelCopy = {
    en: {
        select: 'Choose a 3D form',
        gestureStart: 'Enable hand control',
        gestureStop: 'Stop hand control',
        gestureHint: 'Open palm to turn · Pinch to zoom · Make a fist to pause',
        off: 'The camera stays off until you enable it.',
        loading: 'Preparing local hand tracking…',
        active: 'Camera active. Hand movement stays on this device.',
        unsupported: 'This browser does not support camera hand control.',
        error: 'Camera access was not available. Drag or use arrow keys instead.',
        modelUnavailable: 'This 3D form could not be loaded. It will not be replaced automatically.',
      },
    zh: {
        select: '选择 3D 形态',
        gestureStart: '开启手势控制',
        gestureStop: '关闭手势控制',
        gestureHint: '张开手掌旋转 · 捏合缩放 · 握拳暂停',
        off: '摄像头仅会在你主动开启后使用。',
        loading: '正在准备本地手势识别…',
        active: '摄像头已开启，手势画面仅在本设备处理。',
        unsupported: '当前浏览器不支持摄像头手势控制。',
        error: '无法使用摄像头，可继续拖拽或使用方向键查看。',
        modelUnavailable: '当前 3D 形态无法加载，系统不会自动替换为其他素材。',
      },
    id: { select: 'Pilih bentuk 3D', gestureStart: 'Aktifkan kontrol tangan', gestureStop: 'Hentikan kontrol tangan', gestureHint: 'Telapak terbuka untuk memutar · Cubit untuk memperbesar · Kepalkan tangan untuk jeda', off: 'Kamera tetap mati sampai Anda mengaktifkannya.', loading: 'Menyiapkan pelacakan tangan lokal…', active: 'Kamera aktif. Gerakan tangan tetap diproses di perangkat ini.', unsupported: 'Browser ini tidak mendukung kontrol tangan dengan kamera.', error: 'Akses kamera tidak tersedia. Gunakan seret atau tombol panah sebagai gantinya.', modelUnavailable: 'Bentuk 3D ini tidak dapat dimuat dan tidak akan diganti otomatis.' },
    ja: { select: '3D 形態を選ぶ', gestureStart: 'ハンドコントロールを有効にする', gestureStop: 'ハンドコントロールを停止', gestureHint: '手のひらを開いて回転・ピンチで拡大・握って一時停止', off: '有効にするまでカメラはオフです。', loading: 'ローカルのハンドトラッキングを準備中…', active: 'カメラが有効です。手の動きはこの端末内で処理されます。', unsupported: 'このブラウザはカメラによるハンドコントロールに対応していません。', error: 'カメラを利用できませんでした。ドラッグまたは矢印キーを使用してください。', modelUnavailable: 'この 3D 形態は読み込めず、自動的に別素材へ置き換えられません。' },
    ko: { select: '3D 형태 선택', gestureStart: '손 제어 켜기', gestureStop: '손 제어 끄기', gestureHint: '손바닥을 펴서 회전 · 집어서 확대 · 주먹을 쥐어 일시 정지', off: '직접 켜기 전까지 카메라는 꺼져 있습니다.', loading: '로컬 손 추적을 준비하는 중…', active: '카메라가 켜졌습니다. 손동작은 이 기기에서만 처리됩니다.', unsupported: '이 브라우저는 카메라 손 제어를 지원하지 않습니다.', error: '카메라를 사용할 수 없습니다. 드래그 또는 화살표 키를 사용하세요.', modelUnavailable: '이 3D 형태를 불러올 수 없으며 자동으로 다른 소재로 바뀌지 않습니다.' },
    ru: { select: 'Выберите 3D-форму', gestureStart: 'Включить управление рукой', gestureStop: 'Остановить управление рукой', gestureHint: 'Открытая ладонь - поворот · щипок - масштаб · кулак - пауза', off: 'Камера остаётся выключенной, пока вы её не включите.', loading: 'Подготовка локального отслеживания руки…', active: 'Камера активна. Движение руки обрабатывается только на этом устройстве.', unsupported: 'Этот браузер не поддерживает управление рукой через камеру.', error: 'Камера недоступна. Используйте перетаскивание или стрелки.', modelUnavailable: 'Эта 3D-форма не загрузилась и не будет заменена автоматически.' },
    ar: { select: 'اختر هيئة ثلاثية الأبعاد', gestureStart: 'تفعيل التحكم باليد', gestureStop: 'إيقاف التحكم باليد', gestureHint: 'افتح الكف للدوران · اقرص للتكبير · اقبض يدك للإيقاف', off: 'تبقى الكاميرا متوقفة حتى تفعّلها.', loading: 'جارٍ تجهيز تتبع اليد محلياً…', active: 'الكاميرا نشطة. تبقى حركة اليد على هذا الجهاز.', unsupported: 'لا يدعم هذا المتصفح التحكم باليد عبر الكاميرا.', error: 'تعذر استخدام الكاميرا. استخدم السحب أو مفاتيح الأسهم بدلاً من ذلك.', modelUnavailable: 'تعذر تحميل هذه الهيئة ثلاثية الأبعاد ولن يتم استبدالها تلقائياً.' },
  } satisfies Record<Language, { select: string; gestureStart: string; gestureStop: string; gestureHint: string; off: string; loading: string; active: string; unsupported: string; error: string; modelUnavailable: string }>
  const localized = modelCopy[language]
  const gestureText = {
    paused: ({ en: 'Gesture movement paused.', zh: '手势移动已暂停。', id: 'Gerakan tangan dijeda.', ja: 'ジェスチャー操作を一時停止しました。', ko: '손동작 제어가 일시 정지되었습니다.', ru: 'Управление жестами приостановлено.', ar: 'تم إيقاف حركة الإيماءة مؤقتاً.' } satisfies Record<Language, string>)[language],
    zoom: ({ en: 'Pinch to zoom.', zh: '捏合缩放中。', id: 'Cubit untuk memperbesar.', ja: 'ピンチで拡大します。', ko: '집어서 확대합니다.', ru: 'Сведите пальцы для масштабирования.', ar: 'اضغط بإصبعين للتكبير.' } satisfies Record<Language, string>)[language],
    turn: ({ en: 'Open palm to turn.', zh: '张开手掌可旋转。', id: 'Buka telapak untuk memutar.', ja: '手のひらを開いて回転します。', ko: '손바닥을 펴서 회전합니다.', ru: 'Поверните открытой ладонью.', ar: 'أدر بفتح الكف.' } satisfies Record<Language, string>)[language],
  }

  const setReadout = (next: string) => {
    if (gestureReadoutRef.current === next) return
    gestureReadoutRef.current = next
    setGestureReadout(next)
  }

  const stopGestureTracking = () => {
    const runtime = runtimeRef.current
    if (runtime) {
      cancelAnimationFrame(runtime.frame)
      runtime.recognizer.close()
      runtime.stream.getTracks().forEach((track) => track.stop())
      runtimeRef.current = null
    }
    const video = gestureVideoRef.current
    if (video) video.srcObject = null
    lastHandXRef.current = null
    lastPinchRef.current = null
  }

  const startGestureTracking = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setGestureMode('unsupported')
      return
    }
    stopGestureTracking()
    setGestureMode('loading')
    setReadout('')
    let stream: MediaStream | null = null
    try {
      const vision = await import('@mediapipe/tasks-vision')
      stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      const video = gestureVideoRef.current
      if (!video) throw new Error('Gesture video is unavailable')
      video.srcObject = stream
      await video.play()
      const fileset = await vision.FilesetResolver.forVisionTasks('/shellsong/gesture/wasm')
      let recognizer
      try {
        recognizer = await vision.GestureRecognizer.createFromOptions(fileset, { baseOptions: { modelAssetPath: '/shellsong/gesture/gesture_recognizer.task', delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 1 })
      } catch {
        recognizer = await vision.GestureRecognizer.createFromOptions(fileset, { baseOptions: { modelAssetPath: '/shellsong/gesture/gesture_recognizer.task' }, runningMode: 'VIDEO', numHands: 1 })
      }
      const runtime: GestureRuntime = { stream, recognizer, frame: 0 }
      runtimeRef.current = runtime
      setGestureMode('active')
      setReadout(localized.active)

      const track = () => {
        if (runtimeRef.current !== runtime) return
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          const result = recognizer.recognizeForVideo(video, performance.now())
          const landmarks = result.landmarks[0]
          const gesture = result.gestures[0]?.[0]?.categoryName
          if (!landmarks || !gesture) {
            lastHandXRef.current = null
            lastPinchRef.current = null
            setReadout(localized.active)
          } else if (gesture === 'Closed_Fist') {
            lastHandXRef.current = null
            lastPinchRef.current = null
            setReadout(gestureText.paused)
          } else {
            const palmX = 1 - landmarks[9].x
            const pinchDistance = Math.hypot(landmarks[4].x - landmarks[8].x, landmarks[4].y - landmarks[8].y)
            if (pinchDistance < .095) {
              if (lastPinchRef.current !== null) distanceRef.current = clamp(distanceRef.current + (lastPinchRef.current - pinchDistance) * 8, 2.15, 5.1)
              lastPinchRef.current = pinchDistance
              lastHandXRef.current = null
              setReadout(gestureText.zoom)
            } else {
              lastPinchRef.current = null
              if (gesture === 'Open_Palm' || gesture === 'Pointing_Up') {
                if (lastHandXRef.current !== null) yawRef.current += (palmX - lastHandXRef.current) * 5.2
                lastHandXRef.current = palmX
                setReadout(gestureText.turn)
              } else {
                lastHandXRef.current = null
                setReadout(localized.active)
              }
            }
          }
        }
        runtime.frame = requestAnimationFrame(track)
      }
      track()
    } catch {
      stream?.getTracks().forEach((track) => track.stop())
      runtimeRef.current?.recognizer.close()
      runtimeRef.current = null
      const video = gestureVideoRef.current
      if (video) video.srcObject = null
      setGestureMode('error')
      setReadout('')
    }
  }

  useEffect(() => () => stopGestureTracking(), [])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    let frame = 0
    let renderer: import('three').WebGLRenderer | null = null
    let object: DisposableModel | null = null
    let observer: ResizeObserver | null = null
    const start = async () => {
      try {
        setFailed(false)
        const THREE = await import('three')
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js')
        if (disposed) return
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(34, 1, .1, 100)
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
        renderer.setSize(host.clientWidth, host.clientHeight)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        host.replaceChildren(renderer.domElement)
        const group = new THREE.Group()
        scene.add(group)
        scene.add(new THREE.HemisphereLight(0xe4ffff, 0x062333, 2.4))
        const key = new THREE.DirectionalLight(0xffd6bd, 2.1)
        key.position.set(2, 3, 3)
        scene.add(key)
        const rim = new THREE.PointLight(0x8ef4f0, 4.2, 8)
        rim.position.set(-2, 1.6, -1)
        scene.add(rim)
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/')
        const loader = new GLTFLoader()
        loader.setDRACOLoader(dracoLoader)
        loader.load(selectedModel.file, (gltf) => {
          if (disposed) { disposeModel(gltf.scene as unknown as DisposableModel); return }
          object = gltf.scene as unknown as DisposableModel
          const box = new THREE.Box3().setFromObject(gltf.scene)
          const size = box.getSize(new THREE.Vector3())
          gltf.scene.scale.setScalar(1.7 / Math.max(size.x, size.y, size.z))
          const scaledBox = new THREE.Box3().setFromObject(gltf.scene)
          const center = scaledBox.getCenter(new THREE.Vector3())
          gltf.scene.position.set(-center.x, -scaledBox.min.y - .58, -center.z)
          group.add(gltf.scene)
        }, undefined, () => setFailed(true))
        let dragging = false
        let lastX = 0
        const pointerDown = (event: PointerEvent) => { dragging = true; lastX = event.clientX; host.setPointerCapture(event.pointerId) }
        const pointerMove = (event: PointerEvent) => { if (!dragging) return; yawRef.current += (event.clientX - lastX) * .012; lastX = event.clientX }
        const pointerUp = () => { dragging = false }
        const keyDown = (event: KeyboardEvent) => { if (event.key === 'ArrowLeft') { yawRef.current -= .13; event.preventDefault() } if (event.key === 'ArrowRight') { yawRef.current += .13; event.preventDefault() } }
        const wheel = (event: WheelEvent) => { event.preventDefault(); distanceRef.current = clamp(distanceRef.current + event.deltaY * .003, 2.15, 5.1) }
        host.addEventListener('pointerdown', pointerDown)
        host.addEventListener('pointermove', pointerMove)
        host.addEventListener('pointerup', pointerUp)
        host.addEventListener('pointercancel', pointerUp)
        host.addEventListener('keydown', keyDown)
        host.addEventListener('wheel', wheel, { passive: false })
        observer = new ResizeObserver(() => { if (!renderer) return; renderer.setSize(host.clientWidth, host.clientHeight); camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix() })
        observer.observe(host)
        const render = () => { camera.position.z += (distanceRef.current - camera.position.z) * .12; group.rotation.y += (yawRef.current - group.rotation.y) * .08; renderer?.render(scene, camera); frame = requestAnimationFrame(render) }
        render()
        return () => {
          dracoLoader.dispose()
          host.removeEventListener('pointerdown', pointerDown)
          host.removeEventListener('pointermove', pointerMove)
          host.removeEventListener('pointerup', pointerUp)
          host.removeEventListener('pointercancel', pointerUp)
          host.removeEventListener('keydown', keyDown)
          host.removeEventListener('wheel', wheel)
        }
      } catch { setFailed(true) }
    }
    let cleanup: (() => void) | undefined
    start().then((result) => { cleanup = result })
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      cleanup?.()
      observer?.disconnect()
      if (object) disposeModel(object)
      renderer?.dispose()
    }
  }, [selectedModel])

  const stateMessage = gestureReadout || (gestureMode === 'loading' ? localized.loading : gestureMode === 'unsupported' ? localized.unsupported : gestureMode === 'error' ? localized.error : localized.off)

  return <>
    <div className="ss-model-stage" ref={hostRef} tabIndex={0} aria-label={inline(language, `Interactive 3D Luoyin: ${selectedModel.en}`, `可交互的螺音 3D 角色：${selectedModel.zh}`)} />
    {failed && <p className="ss-model-error" role="status">{localized.modelUnavailable}</p>}
    <div className="ss-model-switcher" role="group" aria-label={localized.select}>
      {modelOptions.map((model) => <button type="button" key={model.id} className={model.id === selectedModel.id ? 'active' : ''} aria-pressed={model.id === selectedModel.id} onClick={() => setSelectedModel(model)}>{inline(language, model.en, model.zh)}</button>)}
    </div>
    <div className="ss-gesture-panel">
      <button type="button" onClick={gestureMode === 'active' || gestureMode === 'loading' ? () => { stopGestureTracking(); setGestureMode('off'); setReadout('') } : startGestureTracking} disabled={gestureMode === 'loading'}>{gestureMode === 'active' || gestureMode === 'loading' ? localized.gestureStop : localized.gestureStart}</button>
      <div><p className="ss-gesture-intro">{localized.gestureHint}</p><p className="ss-gesture-status" role="status" aria-live="polite">{stateMessage}</p></div>
      <video ref={gestureVideoRef} className="ss-gesture-video" muted playsInline aria-hidden="true" />
    </div>
  </>
}
