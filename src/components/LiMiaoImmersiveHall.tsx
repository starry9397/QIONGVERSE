import { useEffect, useRef, useState, type MouseEvent } from 'react'
import type * as ThreeTypes from 'three'
import type { Language } from '../data'
import { assertLocalizationTree, completeLocalizationTree } from '../i18n'
import { hallTx } from '../immersive-copy'
import { limiaoExhibits, type LimiaoExhibit, sourceStatusLabel } from '../limiao-data'
import { createImmersiveCameraGuard } from '../immersive-controls'
import { avatarWorldConfigs, createLuoyinAvatarController, type LuoyinAvatarController } from '../luoyin-avatar'
import BrandLockup from './BrandLockup'
import LanguageSelector from './LanguageSelector'
completeLocalizationTree(limiaoExhibits)
assertLocalizationTree(limiaoExhibits, 'Li and Miao hall exhibits')

type Props = { language: Language; onChangeLanguage: (language: Language) => void; onExit: () => void; onOpenGuide: (exhibit: LimiaoExhibit) => void }
type SceneStatus = 'loading' | 'ready' | 'fallback'
type ModelTransform = { scale: number; rotation: number }
type HallView = 'world' | 'index'

const tx = (language: Language, en: string, _zh?: string) => hallTx(language, en)

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
        const progress = Math.max(0, Math.min(1, (now - pulse.born) / 900))
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
  return <div className="limiao-model-preview" ref={host} onWheel={(event) => { event.preventDefault(); onTransform({ ...transformRef.current, scale: Math.min(1.7, Math.max(.65, transformRef.current.scale - event.deltaY * .001)) }) }} onPointerDown={(event) => { dragRef.current = { x: event.clientX, rotation: transformRef.current.rotation }; event.currentTarget.setPointerCapture(event.pointerId) }} onPointerMove={(event) => { if (!dragRef.current) return; onTransform({ ...transformRef.current, rotation: dragRef.current.rotation + (event.clientX - dragRef.current.x) * .012 }) }} onPointerUp={() => { dragRef.current = null }} onPointerCancel={() => { dragRef.current = null }}>{failed && <img src={exhibit.poster} alt={exhibit.title[language]} onError={(event) => { event.currentTarget.src = exhibit.fallback || '' }} />}<span className="limiao-model-hint">{hallTx(language, 'Drag to rotate · wheel or pinch to zoom')}</span></div>
}

function DetailSheet({ exhibit, language, onClose, onAsk, transform, onTransform, gestureActive: _gestureActive }: { exhibit: LimiaoExhibit; language: Language; onClose: () => void; onAsk: () => void; transform: ModelTransform; onTransform: (next: ModelTransform) => void; gestureActive?: boolean }) {
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
    {exhibit.sourceUrl && <a className="limiao-source-link" href={exhibit.sourceUrl} target="_blank" rel="noreferrer">{tx(language, 'Open reviewed UNESCO source', '打开已核验 UNESCO 来源')} ↗</a>}
    <button className="limiao-ask-button" type="button" onClick={onAsk}>{tx(language, 'Ask Luoyin about this exhibit', '询问螺音关于此展项')}</button>
  </section></div>
}

export default function LiMiaoImmersiveHall({ language, onChangeLanguage, onExit, onOpenGuide }: Props) {
  const mount = useRef<HTMLDivElement>(null); const [view, setView] = useState<HallView>('world'); const [sceneStatus, setSceneStatus] = useState<SceneStatus>('loading'); const [active, setActive] = useState(limiaoExhibits[0]); const [detail, setDetail] = useState<LimiaoExhibit | null>(null); const [pulse, setPulse] = useState({ x: 0, y: 0, key: 0 }); const [modelTransform, setModelTransform] = useState<ModelTransform>({ scale: 1, rotation: 0 })
  const activeRef = useRef(active); const detailRef = useRef(detail); const modelTransformRef = useRef(modelTransform); const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const avatarRef = useRef<LuoyinAvatarController | null>(null)
  const [avatarState, setAvatarState] = useState<'hidden' | 'loading' | 'ready' | 'failed'>('hidden')
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
    let disposed = false; let timedOut = false; let frame = 0; let timeout = 0; let renderer: ThreeTypes.WebGLRenderer | null = null; let splat: { initialized: Promise<unknown>; dispose: () => void; getBoundingBox?: (centersOnly?: boolean) => ThreeTypes.Box3 } | null = null; let resize = () => {}; let avatar: LuoyinAvatarController | null = null; let disposeCameraGuard = () => {}
    let cleanup = () => {
      cancelAnimationFrame(frame)
      clearTimeout(timeout)
      removeEventListener('resize', resize)
      disposeCameraGuard()
      splat?.dispose()
      renderer?.dispose()
      renderer?.domElement.remove()
      avatar?.dispose()
      if (avatarRef.current === avatar) avatarRef.current = null
      setAvatarState('hidden')
    }
    void (async () => {
      try {
        if (!window.WebGLRenderingContext || !document.createElement('canvas').getContext('webgl2')) throw new Error('WebGL 2 is unavailable')
        const THREE = await import('three'); const { SparkRenderer, SplatMesh, SparkControls } = await import('@sparkjsdev/spark')
        if (disposed) return
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)); element.appendChild(renderer.domElement)
        const scene = new THREE.Scene(); const contactScene = new THREE.Scene(); const avatarScene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(62, 1, .01, 1000); const spark = new SparkRenderer({ renderer }); scene.add(spark)
        splat = new SplatMesh({ url: '/assets/3d/limiao/limiao world.spz' }) as unknown as { initialized: Promise<unknown>; dispose: () => void; getBoundingBox: (centersOnly?: boolean) => ThreeTypes.Box3 }; const splatObject = splat as unknown as ThreeTypes.Object3D; scene.add(splatObject)
        const controls = new SparkControls({ canvas: renderer.domElement }); const cameraGuard = createImmersiveCameraGuard(controls, camera, splat); disposeCameraGuard = cameraGuard.dispose
        avatar = createLuoyinAvatarController({ scene, avatarScene, contactScene, camera, renderer, controls, splat, config: avatarWorldConfigs.limiao, onState: setAvatarState }); avatarRef.current = avatar
        resize = () => { const width = element.clientWidth; const height = element.clientHeight; if (!renderer) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix() }; resize(); addEventListener('resize', resize)
        let lastFrame = performance.now()
        const render = () => { if (!renderer || disposed || timedOut) return; const now = performance.now(); const delta = Math.min(.05, (now - lastFrame) / 1000); lastFrame = now; if (avatar?.getState() === 'ready') avatar.update(delta); else { controls.update(camera); cameraGuard.clamp() } renderer.render(scene, camera); if (avatar?.getState() === 'ready') { renderer.autoClear = false; renderer.clearDepth(); renderer.render(contactScene, camera); renderer.render(avatarScene, camera); renderer.autoClear = true } frame = requestAnimationFrame(render) }; render(); timeout = window.setTimeout(() => { if (!disposed) { timedOut = true; cleanup(); setSceneStatus('fallback') } }, 12000); await splat.initialized
        clearTimeout(timeout)
        if (timedOut || disposed) return
        camera.position.set(0, 0, 0); camera.up.set(0, 0, 1); camera.lookAt(1, 0, 0); camera.updateMatrixWorld(true)
        if (!disposed) { setSceneStatus('ready') } else { cleanup() }
      } catch { if (!timedOut) cleanup(); if (!disposed && !timedOut) setSceneStatus('fallback') }
    })()
    return () => { disposed = true; cleanup() }
  }, [view])

  const toggleAvatar = () => { const avatar = avatarRef.current; if (!avatar) return; if (avatar.getState() === 'ready') avatar.disable(); else void avatar.enable() }

  const gesture = 'idle' as 'idle' | 'ready' | 'paused'
  const gestureText: Record<'idle' | 'ready' | 'paused', string> = { idle: tx(language, 'Mouse and touch controls remain available', '鼠标与触控仍可使用'), ready: tx(language, 'Mouse and touch controls remain available', '鼠标与触控仍可使用'), paused: tx(language, 'Mouse and touch controls remain available', '鼠标与触控仍可使用') }
  const videoRef = useRef<HTMLVideoElement>(null)
  return <div className="limiao-hall" data-avatar-state={avatarState}>
    {view === 'world' && <div className="luoyin-avatar-floating"><button className="luoyin-avatar-button" type="button" disabled={sceneStatus !== 'ready' || avatarState === 'loading'} onClick={toggleAvatar}>{avatarState === 'ready' ? tx(language, 'Hide Luoyin', '隐藏螺音') : avatarState === 'loading' ? tx(language, 'Loading Luoyin', '正在加载螺音') : tx(language, 'Show Luoyin', '显示螺音')}</button><span className="luoyin-avatar-status" aria-live="polite">{avatarState === 'failed' ? tx(language, '3D character unavailable. Free camera remains available.', '3D 角色暂不可用，仍可使用自由相机浏览。') : avatarState === 'ready' ? tx(language, 'Luoyin ready · WASD / arrows to walk · drag to orbit · wheel to zoom', '螺音已准备 · WASD / 方向键行走 · 拖动环绕 · 滚轮缩放') : ''}</span></div>}
    <header className="limiao-header"><BrandLockup onNavigate={(event) => { event.preventDefault(); onExit() }} /><p>{hallTx(language, view === 'world' ? 'LI & MIAO / IMMERSIVE HALL' : 'LI & MIAO / EXHIBIT INDEX')}</p><div><LanguageSelector language={language} onChange={onChangeLanguage} /><button type="button" onClick={onExit}>{tx(language, 'Back to five halls', '返回五个分展厅')}</button></div></header>
    {view === 'world' ? <main className="limiao-stage">
      <div className="limiao-scene" ref={mount} onClick={(event) => { triggerPulse(event) }} aria-label={tx(language, 'Interactive Li and Miao visual world', '可交互的黎苗视觉世界')} role="application" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); triggerPulse() } }}>
        {sceneStatus !== 'ready' && <div className={sceneStatus === 'fallback' ? 'limiao-scene-fallback is-static' : 'limiao-scene-fallback'}><img src="/assets/3d/limiao/黎苗展厅参考图.png" alt={tx(language, 'Li and Miao immersive hall reference view', '黎苗沉浸展厅静态参考视图')} /><p>{sceneStatus === 'loading' ? tx(language, 'Opening the visual world…', '正在打开视觉世界…') : tx(language, 'This device is using the static hall view. Exhibit index and Luoyin remain available.', '当前设备正在使用静态展厅视图；展项索引与螺音仍可正常使用。')}</p></div>}
        <TidePulse reduced={reduced} paused={gesture === 'paused'} pulse={pulse} />
        <div className="limiao-world-anchors" aria-label={tx(language, 'Exhibits in the world', '大世界展项')}>
          {limiaoExhibits.map((exhibit, index) => <button key={exhibit.id} type="button" className={active.id === exhibit.id ? ('limiao-world-anchor anchor-' + (index + 1) + ' active') : ('limiao-world-anchor anchor-' + (index + 1))} onClick={(event) => { event.stopPropagation(); triggerPulse(event); select(exhibit) }} aria-label={`${hallTx(language, 'Open ')}${exhibit.title[language]}`}>
            <img className="anchor-thumb" loading="lazy" src={exhibit.poster || exhibit.asset} alt="" aria-hidden="true" onError={(event) => { if (exhibit.fallback) event.currentTarget.src = exhibit.fallback }} /><span className="anchor-glyph">{exhibit.kind === 'model' ? '◌' : exhibit.kind === 'video' ? '▶' : '◇'}</span><span className="anchor-copy"><b>{exhibit.title[language]}</b><small>{exhibit.kind === 'model' ? tx(language, '3D + video', '3D + 视频') : exhibit.kind === 'video' ? tx(language, 'Moving study', '动态研究') : tx(language, 'Image reading', '图像阅读')}</small></span>
          </button>)}
        </div>
      </div>
      <aside className="limiao-overlay"><p className="mono-label">{hallTx(language, 'HAINAN PROVINCE / CULTURAL EXPLORATION')}</p><h1>{tx(language, 'Li & Miao Immersive Hall', '黎苗沉浸展厅')}</h1><p>{tx(language, 'A visual reading room. Li textile orientation is linked to UNESCO; Miao references are project-provided curatorial context.', '一间视觉阅读室。黎族纺织技艺概览链接 UNESCO；苗族相关内容为项目提供的策展语境。')}</p><span className="limiao-status" aria-live="polite">{sceneStatus === 'ready' ? tx(language, '3D world ready', '3D 世界已准备') : sceneStatus === 'loading' ? tx(language, 'Opening 3D world', '正在打开 3D 世界') : tx(language, 'Static hall view ready', '静态展厅视图已准备')}</span></aside>
      <div className="limiao-actions"><button type="button" onClick={() => setView('index')}>{tx(language, 'Open exhibit index', '打开展项索引')}</button><button type="button" onClick={() => onOpenGuide(active)}>{tx(language, 'Ask Luoyin', '询问螺音')}</button><p aria-live="polite">{gestureText[gesture]}</p><video className="limiao-gesture-video" ref={videoRef} muted playsInline aria-hidden="true" /></div>
      <nav className="limiao-exhibit-strip" aria-label={tx(language, 'Visible exhibit navigation', '可见展项导航')}>{limiaoExhibits.map((exhibit) => <button type="button" key={exhibit.id} className={active.id === exhibit.id ? 'active' : ''} onClick={() => { triggerPulse(); select(exhibit) }}><span>{exhibit.kind === 'model' ? '◌' : '◇'}</span><b>{exhibit.title[language]}</b><small>{sourceStatusLabel(exhibit.sourceStatus, language)}</small></button>)}</nav>
      <p className="limiao-controls">{tx(language, 'Drag to rotate · wheel / pinch to zoom · WASD or arrow keys to move · click the world for a tide pulse', '拖拽旋转 · 滚轮/双指缩放 · WASD 或方向键移动 · 点击大世界触发潮汐脉冲')}</p>
    </main> : <main className="limiao-index-page"><div className="limiao-index-intro"><p className="mono-label">{hallTx(language, 'HAINAN PROVINCE / LI & MIAO HERITAGE')}</p><h1>{tx(language, 'Exhibit Index', '展项索引')}</h1><p>{tx(language, 'Choose a visual record, moving study or AIGC concept object. The immersive world remains one step away.', '选择图像记录、动态研究或 AIGC 策展概念展品。沉浸大世界始终只需一步返回。')}</p><button type="button" className="limiao-world-return" onClick={() => setView('world')}>{tx(language, 'Back to immersive world', '返回沉浸大世界')} ↗</button></div><div className="limiao-index-list">{limiaoExhibits.map((exhibit) => <article key={exhibit.id} className="limiao-index-entry"><div className="limiao-index-media"><img loading="lazy" src={exhibit.poster || exhibit.asset} alt={exhibit.title[language]} onError={(event) => { if (exhibit.fallback) event.currentTarget.src = exhibit.fallback }} /><span>{exhibit.kind === 'model' ? tx(language, '3D + video', '3D + 视频') : exhibit.kind === 'video' ? tx(language, 'Moving study', '动态研究') : tx(language, 'Image reading', '图像阅读')}</span></div><div className="limiao-index-copy"><p className="mono-label">{sourceStatusLabel(exhibit.sourceStatus, language)}</p><h2>{exhibit.title[language]}</h2><p>{exhibit.introduction[language]}</p><button type="button" onClick={() => select(exhibit)}>{tx(language, 'Open exhibit', '打开展项')} ↗</button></div></article>)}</div></main>}
    {detail && <DetailSheet exhibit={detail} language={language} transform={modelTransform} onTransform={updateModelTransform} gestureActive={gesture === 'ready' || gesture === 'paused'} onClose={() => setDetail(null)} onAsk={() => { setDetail(null); onOpenGuide(detail) }} />}
  </div>
}
