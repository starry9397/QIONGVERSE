import { useEffect, useRef, useState, type MouseEvent } from 'react'
import type * as ThreeTypes from 'three'
import type { Language } from '../data'
import { limiaoExhibits, type LimiaoExhibit, sourceStatusLabel } from '../limiao-data'

type Props = { language: Language; onToggleLanguage: () => void; onExit: () => void; onOpenGuide: (exhibit: LimiaoExhibit) => void }
type SceneStatus = 'loading' | 'ready' | 'fallback'
type GestureStatus = 'idle' | 'preparing' | 'ready' | 'denied' | 'unavailable' | 'paused'
type ModelTransform = { scale: number; rotation: number }
type HallView = 'world' | 'index'

const tx = (language: Language, en: string, zh: string) => language === 'en' ? en : zh

function TidePulse({ reduced, paused, pulse }: { reduced: boolean; paused: boolean; pulse: { x: number; y: number; key: number } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pulses = useRef<{ x: number; y: number; born: number }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let frame = 0
    const resize = () => { const box = canvas.getBoundingClientRect(); canvas.width = Math.max(1, box.width * devicePixelRatio); canvas.height = Math.max(1, box.height * devicePixelRatio) }
    const draw = (now: number) => {
      const context = canvas.getContext('2d')
      if (!context) return
      context.clearRect(0, 0, canvas.width, canvas.height)
      pulses.current = pulses.current.filter((pulse) => now - pulse.born < 900)
      for (const pulse of pulses.current) {
        const progress = Math.min(1, (now - pulse.born) / 900)
        const radius = (reduced ? 42 : 120) * progress * devicePixelRatio
        context.beginPath(); context.arc(pulse.x * devicePixelRatio, pulse.y * devicePixelRatio, radius, 0, Math.PI * 2)
        context.strokeStyle = `rgba(232, 201, 135, ${0.85 * (1 - progress)})`; context.lineWidth = Math.max(1, 2.2 * devicePixelRatio); context.stroke()
        if (!reduced) {
          for (let index = 0; index < 18; index += 1) {
            const angle = (Math.PI * 2 * index) / 18; const distance = radius * (0.25 + progress * 0.9)
            context.fillStyle = `rgba(255, 237, 188, ${0.7 * (1 - progress)})`; context.fillRect(pulse.x * devicePixelRatio + Math.cos(angle) * distance, pulse.y * devicePixelRatio + Math.sin(angle) * distance, 2 * devicePixelRatio, 2 * devicePixelRatio)
          }
        }
      }
      if (!document.hidden && !paused) frame = requestAnimationFrame(draw)
    }
    const resume = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw) }
    resize(); resume(); window.addEventListener('resize', resize); document.addEventListener('visibilitychange', resume)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', resume) }
  }, [paused, reduced])
  useEffect(() => {
    if (!pulse.key) return
    pulses.current.push({ x: pulse.x, y: pulse.y, born: performance.now() })
  }, [pulse])

  return <canvas className="limiao-pulse-layer" ref={canvasRef} aria-hidden="true" />
}

function ModelPreview({ exhibit, language, transform, onTransform }: { exhibit: LimiaoExhibit; language: Language; transform: ModelTransform; onTransform: (next: ModelTransform) => void }) {
  const host = useRef<HTMLDivElement>(null); const [failed, setFailed] = useState(false)
  const transformRef = useRef(transform)
  const dragRef = useRef<{ x: number; rotation: number } | null>(null)
  useEffect(() => { transformRef.current = transform }, [transform])
  useEffect(() => {
    const container = host.current
    if (!container || !exhibit.modelAsset) return
    const modelAsset = exhibit.modelAsset
    let disposed = false; let cleanup = () => {}
    void (async () => {
      try {
        const THREE = await import('three'); const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        if (disposed) return
        const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(38, 1, .1, 100); camera.position.set(0, .2, 3.4)
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7)); renderer.setSize(container.clientWidth, container.clientHeight); container.appendChild(renderer.domElement); cleanup = () => { renderer.dispose(); renderer.domElement.remove() }
        scene.add(new THREE.HemisphereLight(0xfff2cd, 0x073a3c, 2.2)); const light = new THREE.DirectionalLight(0xffd78a, 2.4); light.position.set(3, 2, 2); scene.add(light)
        const loader = new GLTFLoader(); const gltf = await loader.loadAsync(modelAsset); if (disposed) return
        const object = gltf.scene; scene.add(object); const box = new THREE.Box3().setFromObject(object); const center = box.getCenter(new THREE.Vector3()); object.position.sub(center)
        let frame = 0; const render = () => { object.rotation.y = transformRef.current.rotation; object.scale.setScalar(transformRef.current.scale); renderer.render(scene, camera); frame = requestAnimationFrame(render) }; render()
        cleanup = () => { cancelAnimationFrame(frame); renderer.dispose(); renderer.domElement.remove() }
      } catch { if (!disposed) setFailed(true) }
    })()
    return () => { disposed = true; cleanup() }
  }, [exhibit.modelAsset])
  return <div className="limiao-model-preview" ref={host} onWheel={(event) => { event.preventDefault(); onTransform({ ...transformRef.current, scale: Math.min(1.7, Math.max(.65, transformRef.current.scale - event.deltaY * .001)) }) }} onPointerDown={(event) => { dragRef.current = { x: event.clientX, rotation: transformRef.current.rotation }; event.currentTarget.setPointerCapture(event.pointerId) }} onPointerMove={(event) => { if (!dragRef.current) return; onTransform({ ...transformRef.current, rotation: dragRef.current.rotation + (event.clientX - dragRef.current.x) * .012 }) }} onPointerUp={() => { dragRef.current = null }} onPointerCancel={() => { dragRef.current = null }}>{failed && <img src={exhibit.poster} alt={exhibit.title[language]} onError={(event) => { event.currentTarget.src = exhibit.fallback || '' }} />}<span className="limiao-model-hint">{language === 'en' ? 'Drag to rotate · wheel to zoom' : '拖拽旋转 · 滚轮缩放'}</span></div>
}

function DetailSheet({ exhibit, language, onClose, onAsk, transform, onTransform, gestureActive }: { exhibit: LimiaoExhibit; language: Language; onClose: () => void; onAsk: () => void; transform: ModelTransform; onTransform: (next: ModelTransform) => void; gestureActive: boolean }) {
  const [videoFailed, setVideoFailed] = useState(false)
  useEffect(() => { const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; addEventListener('keydown', listener); return () => removeEventListener('keydown', listener) }, [onClose])
  return <div className="limiao-sheet-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }} role="presentation"><section className="limiao-detail-sheet" role="dialog" aria-modal="true" aria-labelledby="limiao-detail-title">
    <div className="limiao-sheet-head"><div><p className="mono-label">{sourceStatusLabel(exhibit.sourceStatus, language)}</p><h2 id="limiao-detail-title">{exhibit.title[language]}</h2></div><button className="close-button" type="button" onClick={onClose} aria-label={tx(language, 'Close exhibit', '关闭展项')}>×</button></div>
    <div className="limiao-detail-media">
      {exhibit.kind === 'image' && <img src={exhibit.asset} alt={exhibit.title[language]} onError={(event) => { event.currentTarget.src = exhibit.fallback || '' }} />}
      {exhibit.kind === 'model' && <ModelPreview exhibit={exhibit} language={language} transform={transform} onTransform={onTransform} />}
      {exhibit.kind === 'model' && <div className="limiao-video-study">{videoFailed ? <img src={exhibit.fallback} alt={exhibit.title[language]} /> : <video controls playsInline preload="metadata" poster={exhibit.poster} onError={() => setVideoFailed(true)}><source src={exhibit.asset} type="video/mp4" /></video>}</div>}
    </div>
    <p className="limiao-detail-en">{exhibit.title.en}</p><p>{exhibit.introduction[language]}</p><p className="limiao-detail-note">{exhibit.note[language]}</p>
    {exhibit.kind === 'model' && <p className="limiao-model-gesture-note">{gestureActive ? tx(language, 'Hand control is active: pinch to scale, move your hand left or right to rotate.', '手势已启用：捏合缩放，左右移动手掌旋转。') : tx(language, 'Optional hand control: enable gestures, then pinch to scale and move your hand left or right to rotate.', '可选手势：开启手势后，捏合缩放，左右移动手掌旋转。')}</p>}
    {exhibit.sourceUrl && <a className="limiao-source-link" href={exhibit.sourceUrl} target="_blank" rel="noreferrer">{tx(language, 'Open reviewed UNESCO source', '打开已核验 UNESCO 来源')} ↗</a>}
    <button className="limiao-ask-button" type="button" onClick={onAsk}>{tx(language, 'Ask Luoyin about this exhibit', '询问螺音关于此展项')}</button>
  </section></div>
}

export default function LiMiaoImmersiveHall({ language, onToggleLanguage, onExit, onOpenGuide }: Props) {
  const mount = useRef<HTMLDivElement>(null); const [view, setView] = useState<HallView>('world'); const [sceneStatus, setSceneStatus] = useState<SceneStatus>('loading'); const [active, setActive] = useState(limiaoExhibits[0]); const [detail, setDetail] = useState<LimiaoExhibit | null>(null); const [pulse, setPulse] = useState({ x: 0, y: 0, key: 0 }); const [modelTransform, setModelTransform] = useState<ModelTransform>({ scale: 1, rotation: 0 })
  const [gesture, setGesture] = useState<GestureStatus>('idle'); const streamRef = useRef<MediaStream | null>(null); const videoRef = useRef<HTMLVideoElement>(null); const landmarkerRef = useRef<{ close: () => void } | null>(null); const gestureFrameRef = useRef<number | null>(null); const gestureSessionRef = useRef(0); const activeRef = useRef(active); const detailRef = useRef(detail); const modelTransformRef = useRef(modelTransform); const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => { activeRef.current = active }, [active])
  useEffect(() => { detailRef.current = detail }, [detail])
  useEffect(() => { modelTransformRef.current = modelTransform }, [modelTransform])
  const select = (exhibit: LimiaoExhibit) => { activeRef.current = exhibit; setActive(exhibit); setDetail(exhibit); if (exhibit.kind === 'model') { const reset = { scale: 1, rotation: 0 }; modelTransformRef.current = reset; setModelTransform(reset) } }
  const updateModelTransform = (next: ModelTransform) => { const bounded = { scale: Math.min(1.7, Math.max(.65, next.scale)), rotation: next.rotation }; modelTransformRef.current = bounded; setModelTransform(bounded) }
  const triggerPulse = (event?: Pick<MouseEvent<HTMLElement>, 'clientX' | 'clientY'>) => { const box = mount.current?.getBoundingClientRect(); if (!box) return; setPulse({ x: event ? event.clientX - box.left : box.width / 2, y: event ? event.clientY - box.top : box.height / 2, key: Date.now() }) }

  useEffect(() => {
    if (view !== 'world') return
    const element = mount.current; if (!element) return
    setSceneStatus('loading')
    let disposed = false; let timedOut = false; let frame = 0; let timeout = 0; let renderer: ThreeTypes.WebGLRenderer | null = null; let splat: { initialized: Promise<unknown>; dispose: () => void; getBoundingBox: (centersOnly?: boolean) => ThreeTypes.Box3 } | null = null; let resize = () => {}
    let cleanup = () => {
      cancelAnimationFrame(frame)
      clearTimeout(timeout)
      removeEventListener('resize', resize)
      splat?.dispose()
      renderer?.dispose()
      renderer?.domElement.remove()
    }
    void (async () => {
      try {
        if (!window.WebGLRenderingContext || !document.createElement('canvas').getContext('webgl2')) throw new Error('WebGL 2 is unavailable')
        const THREE = await import('three'); const { SparkRenderer, SplatMesh, SparkControls } = await import('@sparkjsdev/spark')
        if (disposed) return
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)); element.appendChild(renderer.domElement)
        const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(62, 1, .01, 1000); const spark = new SparkRenderer({ renderer }); scene.add(spark)
        splat = new SplatMesh({ url: '/assets/3d/limiao/limiao world.spz' }) as unknown as { initialized: Promise<unknown>; dispose: () => void; getBoundingBox: (centersOnly?: boolean) => ThreeTypes.Box3 }; const splatObject = splat as unknown as ThreeTypes.Object3D; scene.add(splatObject)
        const controls = new SparkControls({ canvas: renderer.domElement }); resize = () => { const width = element.clientWidth; const height = element.clientHeight; if (!renderer) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix() }; resize(); addEventListener('resize', resize)
        const render = () => { if (!renderer || disposed || timedOut) return; controls.update(camera); renderer.render(scene, camera); frame = requestAnimationFrame(render) }; render(); timeout = window.setTimeout(() => { if (!disposed) { timedOut = true; cleanup(); setSceneStatus('fallback') } }, 12000); await splat.initialized
        clearTimeout(timeout)
        if (timedOut || disposed) return
        camera.position.set(0, 0, 0); camera.up.set(0, 0, 1); camera.lookAt(1, 0, 0); camera.updateMatrixWorld(true)
        if (!disposed) { setSceneStatus('ready') } else { cleanup() }
      } catch { if (!timedOut) cleanup(); if (!disposed && !timedOut) setSceneStatus('fallback') }
    })()
    return () => { disposed = true; cleanup() }
  }, [view])

  const stopGestures = () => { gestureSessionRef.current += 1; if (gestureFrameRef.current !== null) cancelAnimationFrame(gestureFrameRef.current); gestureFrameRef.current = null; landmarkerRef.current?.close(); landmarkerRef.current = null; streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; if (videoRef.current) videoRef.current.srcObject = null; setGesture('idle') }
  useEffect(() => () => stopGestures(), [])
  useEffect(() => { if (view === 'index') stopGestures() }, [view])
  const enableGestures = async () => {
    if (sceneStatus !== 'ready') return
    if (!navigator.mediaDevices?.getUserMedia) { setGesture('unavailable'); return }
    const session = gestureSessionRef.current + 1; gestureSessionRef.current = session; setGesture('preparing')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }); if (session !== gestureSessionRef.current || view !== 'world') { stream.getTracks().forEach((track) => track.stop()); return } streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision'); if (session !== gestureSessionRef.current || view !== 'world') { stream.getTracks().forEach((track) => track.stop()); return }
      const files = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm')
      const landmarker = await HandLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task' }, runningMode: 'VIDEO', numHands: 1 }); if (session !== gestureSessionRef.current || view !== 'world') { landmarker.close(); stream.getTracks().forEach((track) => track.stop()); return } landmarkerRef.current = landmarker
      setGesture('ready'); let lastPinch = 0; let lastX = .5; let lastSwipe = 0; let stopped = false
      const detect = () => {
        if (stopped || !videoRef.current || !streamRef.current || !landmarkerRef.current) return
        const result = landmarker.detectForVideo(videoRef.current, performance.now()); const hand = result.landmarks[0]
        if (hand) { const thumb = hand[4]; const index = hand[8]; const distance = Math.hypot(thumb.x - index.x, thumb.y - index.y); const now = performance.now()
          if (distance < .06 && now - lastPinch > 1100) { lastPinch = now; triggerPulse(); select(activeRef.current) }
          if (detailRef.current?.kind === 'model') {
            const pinchScale = Math.min(1.7, Math.max(.65, distance * 8.5 + .65))
            const rotation = modelTransformRef.current.rotation + (hand[9].x - lastX) * 2.4
            updateModelTransform({ scale: pinchScale, rotation })
          }
          if (now - lastSwipe > 900 && Math.abs(hand[9].x - lastX) > .14) { lastSwipe = now; const current = limiaoExhibits.findIndex((item) => item.id === activeRef.current.id); const next = (current + (hand[9].x < lastX ? 1 : -1) + limiaoExhibits.length) % limiaoExhibits.length; activeRef.current = limiaoExhibits[next]; setActive(limiaoExhibits[next]) } lastX = hand[9].x
          const extended = [8, 12, 16, 20].filter((tip, offset) => hand[tip].y < hand[tip - 2].y).length
          if (distance > .14 && extended >= 3) setGesture('ready')
          if (distance > .1 && extended === 0) setGesture('paused')
        } gestureFrameRef.current = requestAnimationFrame(detect)
      }; detect()
      stream.addEventListener('inactive', () => { stopped = true; stopGestures() }, { once: true })
    } catch (error) { stopGestures(); setGesture(error instanceof DOMException && error.name === 'NotAllowedError' ? 'denied' : 'unavailable') }
  }

  const gestureText: Record<GestureStatus, string> = { idle: tx(language, 'Mouse and touch controls remain available', '鼠标与触控仍可使用'), preparing: tx(language, 'Listening for hand', '正在识别手势'), ready: tx(language, 'Gesture ready', '手势已准备'), denied: tx(language, 'Camera permission denied. Mouse and touch controls remain available.', '摄像头权限未开启；鼠标与触控仍可使用。'), unavailable: tx(language, 'Gesture unavailable. Mouse and touch controls remain available.', '当前浏览器不支持手势；鼠标与触控仍可使用。'), paused: tx(language, 'Visual movement paused', '视觉运动已暂停') }
  return <div className="limiao-hall">
    <header className="limiao-header"><a className="brand" href="#top" onClick={(event) => { event.preventDefault(); onExit() }}><img src="/assets/brand/qiongverse-wordmark-en.svg" alt="HAINAN QIONGVERSE" /></a><p>{view === 'world' ? 'LI & MIAO / IMMERSIVE HALL' : 'LI & MIAO / EXHIBIT INDEX'}</p><div><button type="button" onClick={onToggleLanguage}>EN / 中</button><button type="button" onClick={onExit}>{tx(language, 'Back to four rooms', '返回四域展厅')}</button></div></header>
    {view === 'world' ? <main className="limiao-stage">
      <div className="limiao-scene" ref={mount} onClick={(event) => { triggerPulse(event) }} aria-label={tx(language, 'Interactive Li and Miao visual world', '可交互的黎苗视觉世界')} role="application" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); triggerPulse() } }}>
        {sceneStatus !== 'ready' && <div className={sceneStatus === 'fallback' ? 'limiao-scene-fallback is-static' : 'limiao-scene-fallback'}><img src="/assets/3d/limiao/黎苗展厅参考图.png" alt={tx(language, 'Li and Miao immersive hall reference view', '黎苗沉浸展厅静态参考视图')} /><p>{sceneStatus === 'loading' ? tx(language, 'Opening the visual world…', '正在打开视觉世界…') : tx(language, 'This device is using the static hall view. Exhibit index and Luoyin remain available.', '当前设备正在使用静态展厅视图；展项索引与螺音仍可正常使用。')}</p></div>}
        <TidePulse reduced={reduced} paused={gesture === 'paused'} pulse={pulse} />
        <div className="limiao-world-anchors" aria-label={tx(language, 'Exhibits in the world', '大世界展项')}>
          {limiaoExhibits.map((exhibit, index) => <button key={exhibit.id} type="button" className={active.id === exhibit.id ? ('limiao-world-anchor anchor-' + (index + 1) + ' active') : ('limiao-world-anchor anchor-' + (index + 1))} onClick={(event) => { event.stopPropagation(); triggerPulse(event); select(exhibit) }} aria-label={tx(language, 'Open ' + exhibit.title.en, '打开' + exhibit.title.zh)}>
            <img className="anchor-thumb" loading="lazy" src={exhibit.poster || exhibit.asset} alt="" aria-hidden="true" onError={(event) => { if (exhibit.fallback) event.currentTarget.src = exhibit.fallback }} /><span className="anchor-glyph">{exhibit.kind === 'model' ? '◌' : exhibit.kind === 'video' ? '▶' : '◇'}</span><span className="anchor-copy"><b>{exhibit.title[language]}</b><small>{exhibit.kind === 'model' ? tx(language, '3D + video', '3D + 视频') : exhibit.kind === 'video' ? tx(language, 'Moving study', '动态研究') : tx(language, 'Image reading', '图像阅读')}</small></span>
          </button>)}
        </div>
      </div>
      <aside className="limiao-overlay"><p className="mono-label">HAINAN PROVINCE / CULTURAL EXPLORATION</p><h1>{tx(language, 'Li & Miao Immersive Hall', '黎苗沉浸展厅')}</h1><p>{tx(language, 'A visual reading room. Li textile orientation is linked to UNESCO; Miao references are project-provided curatorial context.', '一间视觉阅读室。黎族纺织技艺概览链接 UNESCO；苗族相关内容为项目提供的策展语境。')}</p><span className="limiao-status" aria-live="polite">{sceneStatus === 'ready' ? tx(language, '3D world ready', '3D 世界已准备') : sceneStatus === 'loading' ? tx(language, 'Opening 3D world', '正在打开 3D 世界') : tx(language, 'Static hall view ready', '静态展厅视图已准备')}</span></aside>
      <div className="limiao-actions"><button type="button" onClick={gesture === 'idle' || gesture === 'denied' || gesture === 'unavailable' ? enableGestures : stopGestures}>{gesture === 'idle' || gesture === 'denied' || gesture === 'unavailable' ? tx(language, 'Enable hand gestures', '开启手势交互') : tx(language, 'Disable hand gestures', '关闭手势交互')}</button><button type="button" onClick={() => setView('index')}>{tx(language, 'Open exhibit index', '打开展项索引')}</button><button type="button" onClick={() => onOpenGuide(active)}>{tx(language, 'Ask Luoyin', '询问螺音')}</button><p aria-live="polite">{gestureText[gesture]}</p><details className="limiao-gesture-help"><summary>{tx(language, 'How to use gestures', '手势使用说明')}</summary><ul><li><b>{tx(language, 'Pinch', '捏合')}</b> {tx(language, 'selects the highlighted exhibit and opens its reading sheet.', '选择当前展项并打开说明。')}</li><li><b>{tx(language, 'Open palm', '张开手掌')}</b> {tx(language, 'keeps the scene in explore mode.', '保持场景探索状态。')}</li><li><b>{tx(language, 'Swipe left / right', '向左 / 向右挥手')}</b> {tx(language, 'moves to the previous or next exhibit.', '切换上一个或下一个展项。')}</li><li><b>{tx(language, 'Fist', '握拳')}</b> {tx(language, 'pauses the decorative particle motion.', '暂停装饰性粒子运动。')}</li></ul><small>{tx(language, 'Camera stays local. Mouse, touch and keyboard controls remain available.', '摄像头仅在本地处理；鼠标、触控和键盘仍可使用。')}</small></details><video className="limiao-gesture-video" ref={videoRef} muted playsInline aria-hidden="true" /></div>
      <nav className="limiao-exhibit-strip" aria-label={tx(language, 'Visible exhibit navigation', '可见展项导航')}>{limiaoExhibits.map((exhibit) => <button type="button" key={exhibit.id} className={active.id === exhibit.id ? 'active' : ''} onClick={() => { triggerPulse(); select(exhibit) }}><span>{exhibit.kind === 'model' ? '◌' : '◇'}</span><b>{exhibit.title[language]}</b><small>{sourceStatusLabel(exhibit.sourceStatus, language)}</small></button>)}</nav>
      <p className="limiao-controls">{tx(language, 'Drag to rotate · wheel / pinch to zoom · WASD or arrow keys to move · click the world for a tide pulse', '拖拽旋转 · 滚轮/双指缩放 · WASD 或方向键移动 · 点击大世界触发潮汐脉冲')}</p>
    </main> : <main className="limiao-index-page"><div className="limiao-index-intro"><p className="mono-label">HAINAN PROVINCE / LI & MIAO HERITAGE</p><h1>{tx(language, 'Exhibit Index', '展项索引')}</h1><p>{tx(language, 'Choose a visual record, moving study or AIGC concept object. The immersive world remains one step away.', '选择图像记录、动态研究或 AIGC 策展概念展品。沉浸大世界始终只需一步返回。')}</p><button type="button" className="limiao-world-return" onClick={() => setView('world')}>{tx(language, 'Back to immersive world', '返回沉浸大世界')} ↗</button></div><div className="limiao-index-list">{limiaoExhibits.map((exhibit) => <article key={exhibit.id} className="limiao-index-entry"><div className="limiao-index-media"><img loading="lazy" src={exhibit.poster || exhibit.asset} alt={exhibit.title[language]} onError={(event) => { if (exhibit.fallback) event.currentTarget.src = exhibit.fallback }} /><span>{exhibit.kind === 'model' ? tx(language, '3D + video', '3D + 视频') : exhibit.kind === 'video' ? tx(language, 'Moving study', '动态研究') : tx(language, 'Image reading', '图像阅读')}</span></div><div className="limiao-index-copy"><p className="mono-label">{sourceStatusLabel(exhibit.sourceStatus, language)}</p><h2>{exhibit.title[language]}</h2><p>{exhibit.introduction[language]}</p><button type="button" onClick={() => select(exhibit)}>{tx(language, 'Open exhibit', '打开展项')} ↗</button></div></article>)}</div></main>}
    {detail && <DetailSheet exhibit={detail} language={language} transform={modelTransform} onTransform={updateModelTransform} gestureActive={gesture === 'ready' || gesture === 'paused'} onClose={() => setDetail(null)} onAsk={() => { setDetail(null); onOpenGuide(detail) }} />}
  </div>
}
