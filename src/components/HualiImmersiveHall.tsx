import { useEffect, useRef, useState, type MouseEvent } from 'react'
import type * as ThreeTypes from 'three'
import type { Language } from '../data'
import { hualiExhibits, hualiReferenceImage, hualiStatusLabel, type HualiExhibit } from '../huali-data'

type Props = { language: Language; onToggleLanguage: () => void; onExit: () => void; onOpenGuide: (exhibit: HualiExhibit) => void }
type SceneStatus = 'loading' | 'ready' | 'fallback'
type HallView = 'world' | 'index'
type ModelTransform = { scale: number; rotation: number }
const tx = (language: Language, en: string, zh: string) => language === 'en' ? en : zh

function WoodResonance({ reduced, pulse }: { reduced: boolean; pulse: { x: number; y: number; key: number } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pulses = useRef<{ x: number; y: number; born: number }[]>([])
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let frame = 0
    const resize = () => { const box = canvas.getBoundingClientRect(); canvas.width = Math.max(1, box.width * devicePixelRatio); canvas.height = Math.max(1, box.height * devicePixelRatio) }
    const draw = (now: number) => {
      frame = 0
      const context = canvas.getContext('2d')
      if (!context) return
      context.clearRect(0, 0, canvas.width, canvas.height)
      pulses.current = pulses.current.filter((item) => now - item.born < 900)
      pulses.current.forEach((item) => {
        const progress = Math.min(1, (now - item.born) / 900)
        for (let ring = 0; ring < 3; ring += 1) {
          const radius = (reduced ? 36 : 92) * (progress + ring * .18) * devicePixelRatio
          context.beginPath(); context.ellipse(item.x * devicePixelRatio, item.y * devicePixelRatio, radius, radius * .58, 0, 0, Math.PI * 2)
          context.strokeStyle = `rgba(241, 178, 92, ${(.8 - ring * .16) * (1 - progress)})`; context.lineWidth = Math.max(1, 1.8 * devicePixelRatio); context.stroke()
        }
        if (!reduced) for (let index = 0; index < 14; index += 1) {
          const angle = Math.PI * 2 * index / 14; const distance = (28 + progress * 120) * devicePixelRatio
          context.fillStyle = `rgba(255, 220, 150, ${.7 * (1 - progress)})`; context.fillRect(item.x * devicePixelRatio + Math.cos(angle) * distance, item.y * devicePixelRatio + Math.sin(angle) * distance * .58, 2 * devicePixelRatio, 2 * devicePixelRatio)
        }
      })
      if (!document.hidden) frame = requestAnimationFrame(draw)
    }
    const resume = () => { if (!document.hidden && !frame) frame = requestAnimationFrame(draw) }
    resize(); frame = requestAnimationFrame(draw); addEventListener('resize', resize); document.addEventListener('visibilitychange', resume)
    return () => { cancelAnimationFrame(frame); removeEventListener('resize', resize); document.removeEventListener('visibilitychange', resume) }
  }, [reduced])
  useEffect(() => { if (pulse.key) pulses.current.push({ x: pulse.x, y: pulse.y, born: performance.now() }) }, [pulse])
  return <canvas className="huali-pulse-layer" ref={canvasRef} aria-hidden="true" />
}

function ModelPreview({ exhibit, language, transform, onTransform }: { exhibit: HualiExhibit; language: Language; transform: ModelTransform; onTransform: (value: ModelTransform) => void }) {
  const host = useRef<HTMLDivElement>(null); const transformRef = useRef(transform); const dragRef = useRef<{ x: number; rotation: number } | null>(null); const [failed, setFailed] = useState(false)
  useEffect(() => { transformRef.current = transform }, [transform])
  useEffect(() => {
    const container = host.current
    const modelAsset = exhibit.modelAsset
    if (!container || !modelAsset) return
    let disposed = false; let cleanup = () => {}
    void (async () => {
      try {
        const THREE = await import('three'); const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        if (disposed) return
        const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(38, 1, .1, 100); camera.position.set(0, .2, 3.4)
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7)); renderer.setSize(container.clientWidth, container.clientHeight); container.appendChild(renderer.domElement)
        scene.add(new THREE.HemisphereLight(0xffe5b2, 0x160c09, 2.4)); const light = new THREE.DirectionalLight(0xffa84a, 2.2); light.position.set(3, 2, 2); scene.add(light)
        const object = (await new GLTFLoader().loadAsync(modelAsset)).scene; if (disposed) return
        scene.add(object); const box = new THREE.Box3().setFromObject(object); object.position.sub(box.getCenter(new THREE.Vector3()))
        let frame = 0; const render = () => { object.rotation.y = transformRef.current.rotation; object.scale.setScalar(transformRef.current.scale); renderer.render(scene, camera); frame = requestAnimationFrame(render) }; render()
        cleanup = () => { cancelAnimationFrame(frame); renderer.dispose(); renderer.domElement.remove() }
      } catch { if (!disposed) setFailed(true) }
    })()
    return () => { disposed = true; cleanup() }
  }, [exhibit.modelAsset])
  const update = (next: ModelTransform) => onTransform({ scale: Math.min(1.7, Math.max(.65, next.scale)), rotation: next.rotation })
  return <div className="huali-model-preview" ref={host} onWheel={(event) => { event.preventDefault(); update({ ...transformRef.current, scale: transformRef.current.scale - event.deltaY * .001 }) }} onPointerDown={(event) => { dragRef.current = { x: event.clientX, rotation: transformRef.current.rotation }; event.currentTarget.setPointerCapture(event.pointerId) }} onPointerMove={(event) => { if (dragRef.current) update({ ...transformRef.current, rotation: dragRef.current.rotation + (event.clientX - dragRef.current.x) * .012 }) }} onPointerUp={() => { dragRef.current = null }} onPointerCancel={() => { dragRef.current = null }}>
    {failed && <img src={exhibit.modelPoster || exhibit.fallback} alt={exhibit.title[language]} onError={(event) => { event.currentTarget.src = exhibit.fallback }} />}
    <span>{tx(language, 'Drag to rotate · wheel or pinch to zoom', '拖拽旋转 · 滚轮或双指缩放')}</span>
  </div>
}

function DetailSheet({ exhibit, language, transform, onTransform, onClose, onAsk }: { exhibit: HualiExhibit; language: Language; transform: ModelTransform; onTransform: (value: ModelTransform) => void; onClose: () => void; onAsk: () => void }) {
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; addEventListener('keydown', close); return () => removeEventListener('keydown', close) }, [onClose])
  return <div className="huali-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }} role="presentation"><section className="huali-detail-sheet" role="dialog" aria-modal="true" aria-labelledby="huali-detail-title">
    <div className="huali-sheet-head"><div><p className="mono-label">{hualiStatusLabel(exhibit, language)}</p><h2 id="huali-detail-title">{exhibit.title[language]}</h2></div><button className="close-button" type="button" onClick={onClose} aria-label={tx(language, 'Close exhibit', '关闭展项')}>×</button></div>
    {exhibit.kind === 'model' ? <ModelPreview exhibit={exhibit} language={language} transform={transform} onTransform={onTransform} /> : <img className="huali-detail-media" src={exhibit.asset} alt={exhibit.title[language]} onError={(event) => { event.currentTarget.src = exhibit.fallback }} />}
    <p className="huali-detail-en">{exhibit.title.en}</p><p>{exhibit.introduction[language]}</p><p className="huali-detail-note">{exhibit.note[language]}</p>
    <button className="huali-ask-button" type="button" onClick={onAsk}>{tx(language, 'Ask Luoyin about this exhibit', '询问螺音关于此展项')}</button>
  </section></div>
}

export default function HualiImmersiveHall({ language, onToggleLanguage, onExit, onOpenGuide }: Props) {
  const mount = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<HallView>('world'); const [sceneStatus, setSceneStatus] = useState<SceneStatus>('loading'); const [active, setActive] = useState(hualiExhibits[0]); const [detail, setDetail] = useState<HualiExhibit | null>(null); const [pulse, setPulse] = useState({ x: 0, y: 0, key: 0 }); const [transform, setTransform] = useState<ModelTransform>({ scale: 1, rotation: 0 })
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const select = (exhibit: HualiExhibit) => { setActive(exhibit); setDetail(exhibit); if (exhibit.kind === 'model') setTransform({ scale: 1, rotation: 0 }) }
  const triggerPulse = (event?: Pick<MouseEvent<HTMLElement>, 'clientX' | 'clientY'>) => { const box = mount.current?.getBoundingClientRect(); if (box) setPulse({ x: event ? event.clientX - box.left : box.width / 2, y: event ? event.clientY - box.top : box.height / 2, key: Date.now() }) }

  useEffect(() => {
    if (view !== 'world') return
    const element = mount.current
    if (!element) return
    setSceneStatus('loading')
    let disposed = false; let timedOut = false; let frame = 0; let timeout = 0; let renderer: ThreeTypes.WebGLRenderer | null = null; let splat: { initialized: Promise<unknown>; dispose: () => void } | null = null; let resize = () => {}
    const cleanup = () => { cancelAnimationFrame(frame); clearTimeout(timeout); removeEventListener('resize', resize); splat?.dispose(); renderer?.dispose(); renderer?.domElement.remove() }
    void (async () => {
      try {
        if (!window.WebGLRenderingContext || !document.createElement('canvas').getContext('webgl2')) throw new Error('WebGL 2 unavailable')
        const THREE = await import('three'); const { SparkRenderer, SplatMesh, SparkControls } = await import('@sparkjsdev/spark')
        if (disposed) return
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)); element.appendChild(renderer.domElement)
        const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(62, 1, .01, 1000); scene.add(new SparkRenderer({ renderer }))
        splat = new SplatMesh({ url: '/assets/3d/countryside/countryside world.spz' }) as unknown as { initialized: Promise<unknown>; dispose: () => void }; scene.add(splat as unknown as ThreeTypes.Object3D)
        const controls = new SparkControls({ canvas: renderer.domElement }); resize = () => { const width = element.clientWidth; const height = element.clientHeight; if (!renderer) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix() }; resize(); addEventListener('resize', resize)
        const render = () => { if (!renderer || disposed || timedOut) return; controls.update(camera); renderer.render(scene, camera); frame = requestAnimationFrame(render) }; render()
        timeout = window.setTimeout(() => { if (!disposed) { timedOut = true; cleanup(); setSceneStatus('fallback') } }, 12000)
        await splat.initialized; clearTimeout(timeout)
        if (timedOut || disposed) return
        camera.position.set(0, 0, 0); camera.up.set(0, 0, 1); camera.lookAt(1, 0, 0); camera.updateMatrixWorld(true); setSceneStatus('ready')
      } catch { if (!timedOut) cleanup(); if (!disposed && !timedOut) setSceneStatus('fallback') }
    })()
    return () => { disposed = true; cleanup() }
  }, [view])

  return <div className="huali-hall">
    <header className="huali-header"><a className="brand" href="#top" onClick={(event) => { event.preventDefault(); onExit() }}><img src="/assets/brand/qiongverse-wordmark-en.svg" alt="HAINAN QIONGVERSE" /></a><p>{view === 'world' ? 'DONGFANG ROSEWOOD / IMMERSIVE HALL' : 'DONGFANG ROSEWOOD / EXHIBIT INDEX'}</p><div><button type="button" onClick={onToggleLanguage}>EN / 中</button><button type="button" onClick={onExit}>{tx(language, 'Back to five halls', '返回五个展厅')}</button></div></header>
    {view === 'world' ? <main className="huali-stage"><div className="huali-scene" ref={mount} onClick={(event) => triggerPulse(event)} role="application" tabIndex={0} aria-label={tx(language, 'Interactive Dongfang rosewood visual world', '可交互的东方花梨视觉世界')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); triggerPulse() } }}>
      {sceneStatus !== 'ready' && <div className={sceneStatus === 'fallback' ? 'huali-scene-fallback is-static' : 'huali-scene-fallback'}><img src={hualiReferenceImage} alt={tx(language, 'Dongfang Rosewood Hall reference view', '东方花梨厅静态参考视图')} /><p>{sceneStatus === 'loading' ? tx(language, 'Opening the wood-grain archive…', '正在打开木纹档案馆…') : tx(language, 'This device is using the static hall view. The exhibit index and Luoyin remain available.', '当前设备正在使用静态展厅视图；展项索引与螺音仍可正常使用。')}</p></div>}
      <WoodResonance reduced={reduced} pulse={pulse} />
    </div><aside className="huali-overlay"><p className="mono-label">HAINAN PROVINCE / PROJECT-CURATED VIEW</p><h1>{tx(language, 'Dongfang Rosewood Hall', '东方花梨厅')}</h1><p>{tx(language, 'A wood-grain archive built from project-supplied images and concept models. It supports material-led looking, not authentication or commerce.', '一间由项目提供图像与概念模型构成的木纹档案馆，支持以材质为线索的观看，不提供鉴定或商业服务。')}</p><span className="huali-status" aria-live="polite">{sceneStatus === 'ready' ? tx(language, '3D world ready', '3D 世界已准备') : sceneStatus === 'loading' ? tx(language, 'Opening 3D world', '正在打开 3D 世界') : tx(language, 'Static hall view ready', '静态展厅视图已准备')}</span></aside><div className="huali-actions"><button type="button" onClick={() => setView('index')}>{tx(language, 'Open exhibit index', '打开展项索引')}</button><button type="button" onClick={() => onOpenGuide(active)}>{tx(language, 'Ask Luoyin', '询问螺音')}</button></div><nav className="huali-exhibit-strip" aria-label={tx(language, 'Visible exhibit navigation', '可见展项导航')}>{hualiExhibits.map((exhibit) => <button type="button" key={exhibit.id} className={active.id === exhibit.id ? 'active' : ''} onClick={() => { triggerPulse(); select(exhibit) }}><span>◌</span><b>{exhibit.title[language]}</b><small>{hualiStatusLabel(exhibit, language)}</small></button>)}</nav><p className="huali-controls">{tx(language, 'Drag to rotate · wheel / pinch to zoom · WASD or arrow keys to move · click the world for a wood-ring resonance', '拖拽旋转 · 滚轮/双指缩放 · WASD 或方向键移动 · 点击大世界触发木纹共鸣')}</p></main> : <main className="huali-index-page"><div className="huali-index-intro"><div><p className="mono-label">HAINAN PROVINCE / DONGFANG ROSEWOOD</p><h1>{tx(language, 'Exhibit Index', '展项索引')}</h1></div><img src={hualiReferenceImage} alt="" /><div><p>{tx(language, 'Choose a project-curated material study or AIGC concept object. The immersive world remains one step away.', '选择一项项目策展材质研究或 AIGC 概念展品。沉浸大世界始终只需一步返回。')}</p><button className="huali-world-return" type="button" onClick={() => setView('world')}>{tx(language, 'Back to immersive world', '返回沉浸大世界')} ↗</button></div></div><div className="huali-index-list">{hualiExhibits.map((exhibit) => <article className="huali-index-entry" key={exhibit.id}><img loading="lazy" src={exhibit.modelPoster || exhibit.asset} alt={exhibit.title[language]} onError={(event) => { event.currentTarget.src = exhibit.fallback }} /><div><p className="mono-label">{hualiStatusLabel(exhibit, language)}</p><h2>{exhibit.title[language]}</h2><p>{exhibit.introduction[language]}</p><button type="button" onClick={() => select(exhibit)}>{tx(language, 'Open exhibit', '打开展项')} ↗</button></div></article>)}</div></main>}
    {detail && <DetailSheet exhibit={detail} language={language} transform={transform} onTransform={setTransform} onClose={() => setDetail(null)} onAsk={() => { setDetail(null); onOpenGuide(detail) }} />}
  </div>
}
