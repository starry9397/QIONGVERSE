import { useEffect, useRef, useState, type MouseEvent } from 'react'
import type * as ThreeTypes from 'three'
import type { Language } from '../data'
import { assertLocalizationTree, completeLocalizationTree, inline } from '../i18n'
import { aerospaceConsoleImage, aerospaceExhibits, aerospaceReferenceImage, cnsaUrl, type AerospaceExhibit } from '../aerospace-data'
import { createImmersiveCameraGuard } from '../immersive-controls'
import { avatarWorldConfigs, createLuoyinAvatarController, type LuoyinAvatarController } from '../luoyin-avatar'
import BrandLockup from './BrandLockup'
import LanguageSelector from './LanguageSelector'
completeLocalizationTree(aerospaceExhibits)
assertLocalizationTree(aerospaceExhibits, 'aerospace hall exhibits')

type Props = { language: Language; onChangeLanguage: (language: Language) => void; onExit: () => void; onOpenGuide: (exhibit: AerospaceExhibit) => void }
type SceneStatus = 'loading' | 'ready' | 'fallback'
type HallView = 'world' | 'index'
const tx = (language: Language, en: string, zh: string) => inline(language, en, zh)

function OrbitPulse({ reduced, pulse }: { reduced: boolean; pulse: { x: number; y: number; key: number } }) {
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
        const progress = Math.max(0, Math.min(1, (now - item.born) / 900))
        const radius = (reduced ? 48 : 138) * progress * devicePixelRatio
        context.beginPath(); context.arc(item.x * devicePixelRatio, item.y * devicePixelRatio, radius, 0, Math.PI * 2); context.strokeStyle = 'rgba(110, 200, 255, ' + (.9 * (1 - progress)) + ')'; context.lineWidth = Math.max(1, 2 * devicePixelRatio); context.stroke()
        context.beginPath(); context.arc(item.x * devicePixelRatio, item.y * devicePixelRatio, radius * .58, 0, Math.PI * 2); context.strokeStyle = 'rgba(229, 163, 75, ' + (.72 * (1 - progress)) + ')'; context.stroke()
        if (!reduced) for (let index = 0; index < 16; index += 1) { const angle = Math.PI * 2 * index / 16; const distance = radius * (.25 + progress * .85); context.fillStyle = 'rgba(255, 216, 140, ' + (.72 * (1 - progress)) + ')'; context.fillRect(item.x * devicePixelRatio + Math.cos(angle) * distance, item.y * devicePixelRatio + Math.sin(angle) * distance, 2 * devicePixelRatio, 2 * devicePixelRatio) }
      })
      if (!document.hidden) frame = requestAnimationFrame(draw)
    }
    const resume = () => { if (!document.hidden && !frame) frame = requestAnimationFrame(draw) }
    resize(); frame = requestAnimationFrame(draw); addEventListener('resize', resize); document.addEventListener('visibilitychange', resume)
    return () => { cancelAnimationFrame(frame); removeEventListener('resize', resize); document.removeEventListener('visibilitychange', resume) }
  }, [reduced])
  useEffect(() => { if (pulse.key) pulses.current.push({ x: pulse.x, y: pulse.y, born: performance.now() }) }, [pulse])
  return <canvas className="aerospace-pulse-layer" ref={canvasRef} aria-hidden="true" />
}

function DetailSheet({ exhibit, language, onClose, onAsk }: { exhibit: AerospaceExhibit; language: Language; onClose: () => void; onAsk: () => void }) {
  useEffect(() => { const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }; addEventListener('keydown', listener); return () => removeEventListener('keydown', listener) }, [onClose])
  return <div className="aerospace-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }} role="presentation"><section className="aerospace-detail-sheet" role="dialog" aria-modal="true" aria-labelledby="aerospace-detail-title">
    <div className="aerospace-sheet-head"><div><p className="mono-label">{tx(language, 'PROJECT-SUPPLIED CURATORIAL ASSET', '项目提供的策展素材')}</p><h2 id="aerospace-detail-title">{exhibit.title[language]}</h2></div><button className="close-button" type="button" onClick={onClose} aria-label={tx(language, 'Close exhibit', '关闭展项')}>×</button></div>
    <img className="aerospace-detail-media" src={exhibit.asset} alt={exhibit.title[language]} onError={(event) => { event.currentTarget.src = exhibit.fallback }} />
    <p className="aerospace-detail-en">{exhibit.title.en}</p><p>{exhibit.introduction[language]}</p><p className="aerospace-detail-note">{exhibit.note[language]}</p>
    <a className="aerospace-source-link" href={cnsaUrl} target="_blank" rel="noreferrer">{tx(language, 'Open official background source', '打开官方背景来源')} ↗</a><button className="aerospace-ask-button" type="button" onClick={onAsk}>{tx(language, 'Ask Luoyin about this exhibit', '询问螺音关于此展项')}</button>
  </section></div>
}

export default function AerospaceImmersiveHall({ language, onChangeLanguage, onExit, onOpenGuide }: Props) {
  const mount = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<HallView>('world')
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>('loading')
  const [active, setActive] = useState(aerospaceExhibits[0])
  const [detail, setDetail] = useState<AerospaceExhibit | null>(null)
  const [pulse, setPulse] = useState({ x: 0, y: 0, key: 0 })
  const avatarRef = useRef<LuoyinAvatarController | null>(null)
  const [avatarState, setAvatarState] = useState<'hidden' | 'loading' | 'ready' | 'failed'>('hidden')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const select = (exhibit: AerospaceExhibit) => { setActive(exhibit); setDetail(exhibit) }
  const triggerPulse = (event?: Pick<MouseEvent<HTMLElement>, 'clientX' | 'clientY'>) => { const box = mount.current?.getBoundingClientRect(); if (box) setPulse({ x: event ? event.clientX - box.left : box.width / 2, y: event ? event.clientY - box.top : box.height / 2, key: Date.now() }) }

  useEffect(() => {
    if (view !== 'world') return
    const element = mount.current
    if (!element) return
    setSceneStatus('loading')
    let disposed = false; let timedOut = false; let frame = 0; let timeout = 0; let renderer: ThreeTypes.WebGLRenderer | null = null; let splat: { initialized: Promise<unknown>; dispose: () => void; getBoundingBox?: (centersOnly?: boolean) => ThreeTypes.Box3 } | null = null; let resize = () => {}; let avatar: LuoyinAvatarController | null = null; let disposeCameraGuard = () => {}
    const cleanup = () => { cancelAnimationFrame(frame); clearTimeout(timeout); removeEventListener('resize', resize); disposeCameraGuard(); avatar?.dispose(); if (avatarRef.current === avatar) avatarRef.current = null; splat?.dispose(); renderer?.dispose(); renderer?.domElement.remove(); setAvatarState('hidden') }
    void (async () => {
      try {
        if (!window.WebGLRenderingContext || !document.createElement('canvas').getContext('webgl2')) throw new Error('WebGL 2 unavailable')
        const THREE = await import('three'); const { SparkRenderer, SplatMesh, SparkControls } = await import('@sparkjsdev/spark')
        if (disposed) return
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)); element.appendChild(renderer.domElement)
        const scene = new THREE.Scene(); const contactScene = new THREE.Scene(); const avatarScene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(62, 1, .01, 1000); scene.add(new SparkRenderer({ renderer }))
        splat = new SplatMesh({ url: '/assets/3d/aerospace/aerospace world.spz' }) as unknown as { initialized: Promise<unknown>; dispose: () => void }; scene.add(splat as unknown as ThreeTypes.Object3D)
        const controls = new SparkControls({ canvas: renderer.domElement }); const cameraGuard = createImmersiveCameraGuard(controls, camera, splat); disposeCameraGuard = cameraGuard.dispose
        avatar = createLuoyinAvatarController({ scene, avatarScene, contactScene, camera, renderer, controls, splat, config: avatarWorldConfigs.aerospace, onState: setAvatarState }); avatarRef.current = avatar
        resize = () => { const width = element.clientWidth; const height = element.clientHeight; if (!renderer) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix() }; resize(); addEventListener('resize', resize)
        let lastFrame = performance.now()
        const render = () => { if (!renderer || disposed || timedOut) return; const now = performance.now(); const delta = Math.min(.05, (now - lastFrame) / 1000); lastFrame = now; if (avatar?.getState() === 'ready') avatar.update(delta); else { controls.update(camera); cameraGuard.clamp() } renderer.render(scene, camera); if (avatar?.getState() === 'ready') { renderer.autoClear = false; renderer.clearDepth(); renderer.render(contactScene, camera); renderer.render(avatarScene, camera); renderer.autoClear = true } frame = requestAnimationFrame(render) }; render()
        timeout = window.setTimeout(() => { if (!disposed) { timedOut = true; cleanup(); setSceneStatus('fallback') } }, 12000)
        await splat.initialized; clearTimeout(timeout)
        if (timedOut || disposed) return
        camera.position.set(0, 0, 0); camera.up.set(0, 0, 1); camera.lookAt(1, 0, 0); camera.updateMatrixWorld(true); setSceneStatus('ready')
      } catch { if (!timedOut) cleanup(); if (!disposed && !timedOut) setSceneStatus('fallback') }
    })()
    return () => { disposed = true; cleanup() }
  }, [view])

  const toggleAvatar = () => {
    const avatar = avatarRef.current
    if (!avatar) return
    if (avatar.getState() === 'ready') avatar.disable()
    else void avatar.enable()
  }

  return <div className="aerospace-hall" data-avatar-state={avatarState}>
    {view === 'world' && <div className="luoyin-avatar-floating"><button className="luoyin-avatar-button" type="button" disabled={sceneStatus !== 'ready' || avatarState === 'loading'} onClick={toggleAvatar}>{avatarState === 'ready' ? tx(language, 'Hide Luoyin', '隐藏螺音') : avatarState === 'loading' ? tx(language, 'Loading Luoyin', '正在加载螺音') : tx(language, 'Show Luoyin', '显示螺音')}</button><span className="luoyin-avatar-status" aria-live="polite">{avatarState === 'failed' ? tx(language, '3D character unavailable. Free camera remains available.', '3D 角色暂不可用，仍可使用自由相机浏览。') : avatarState === 'ready' ? tx(language, 'Luoyin ready · WASD / arrows to walk · drag to orbit · wheel to zoom', '螺音已准备 · WASD / 方向键行走 · 拖动环绕 · 滚轮缩放') : ''}</span></div>}
    <header className="aerospace-header"><BrandLockup onNavigate={(event) => { event.preventDefault(); onExit() }} /><p>{view === 'world' ? 'WENCHANG / IMMERSIVE HALL' : 'WENCHANG / EXHIBIT INDEX'}</p><div><LanguageSelector language={language} onChange={onChangeLanguage} /><button type="button" onClick={onExit}>{tx(language, 'Back to five halls', '返回五个展厅')}</button></div></header>
    {view === 'world' ? <main className="aerospace-stage"><div className="aerospace-scene" ref={mount} onClick={(event) => triggerPulse(event)} role="application" tabIndex={0} aria-label={tx(language, 'Interactive Wenchang aerospace visual world', '可交互的文昌航天视觉世界')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); triggerPulse() } }}>
      {sceneStatus !== 'ready' && <div className={sceneStatus === 'fallback' ? 'aerospace-scene-fallback is-static' : 'aerospace-scene-fallback'}><img src={aerospaceReferenceImage} alt={tx(language, 'Wenchang aerospace hall reference view', '文昌航天展厅静态参考视图')} /><p>{sceneStatus === 'loading' ? tx(language, 'Opening the launch horizon…', '正在打开发射地平线…') : tx(language, 'This device is using the static hall view. The exhibit index and Luoyin remain available.', '当前设备正在使用静态展厅视图；展项索引与螺音仍可正常使用。')}</p></div>}
      <OrbitPulse reduced={reduced} pulse={pulse} />
    </div><aside className="aerospace-overlay"><p className="mono-label">HAINAN PROVINCE / PROJECT-CURATED VIEW</p><h1>{tx(language, 'Wenchang Aerospace Hall', '文昌航天厅')}</h1><p>{tx(language, 'A launch-horizon reading room built from project-supplied images. Official public sources provide background, not approval or media verification.', '一间由项目提供图像构成的发射地平线阅读室。官方公开来源仅提供背景导览，不构成认可或素材核验。')}</p><span className="aerospace-status" aria-live="polite">{sceneStatus === 'ready' ? tx(language, '3D world ready', '3D 世界已准备') : sceneStatus === 'loading' ? tx(language, 'Opening 3D world', '正在打开 3D 世界') : tx(language, 'Static hall view ready', '静态展厅视图已准备')}</span></aside><div className="aerospace-actions"><button type="button" onClick={() => setView('index')}>{tx(language, 'Open exhibit index', '打开展项索引')}</button><button type="button" onClick={() => onOpenGuide(active)}>{tx(language, 'Ask Luoyin', '询问螺音')}</button></div><nav className="aerospace-exhibit-strip" aria-label={tx(language, 'Visible exhibit navigation', '可见展项导航')}>{aerospaceExhibits.map((exhibit) => <button type="button" key={exhibit.id} className={active.id === exhibit.id ? 'active' : ''} onClick={() => { triggerPulse(); select(exhibit) }}><span>◌</span><b>{exhibit.title[language]}</b><small>{tx(language, 'Project asset', '项目素材')}</small></button>)}</nav><p className="aerospace-controls">{tx(language, 'Drag to rotate · wheel / pinch to zoom · WASD or arrow keys to move · click the world for an orbit pulse', '拖拽旋转 · 滚轮/双指缩放 · WASD 或方向键移动 · 点击大世界触发轨道脉冲')}</p></main> : <main className="aerospace-index-page"><div className="aerospace-index-intro"><div><p className="mono-label">HAINAN PROVINCE / WENCHANG AEROSPACE</p><h1>{tx(language, 'Exhibit Index', '展项索引')}</h1></div><img src={aerospaceConsoleImage} alt="" /><div><p>{tx(language, 'Choose a project-curated visual record. The immersive world remains one step away.', '选择一项项目策展视觉记录。沉浸大世界始终只需一步返回。')}</p><button type="button" className="aerospace-world-return" onClick={() => setView('world')}>{tx(language, 'Back to immersive world', '返回沉浸大世界')} ↗</button></div></div><div className="aerospace-index-list">{aerospaceExhibits.map((exhibit) => <article key={exhibit.id} className="aerospace-index-entry"><img loading="lazy" src={exhibit.asset} alt={exhibit.title[language]} onError={(event) => { event.currentTarget.src = exhibit.fallback }} /><div><p className="mono-label">{tx(language, 'Project-supplied curatorial asset', '项目提供的策展素材')}</p><h2>{exhibit.title[language]}</h2><p>{exhibit.introduction[language]}</p><button type="button" onClick={() => select(exhibit)}>{tx(language, 'Open exhibit', '打开展项')} ↗</button></div></article>)}</div></main>}
    {detail && <DetailSheet exhibit={detail} language={language} onClose={() => setDetail(null)} onAsk={() => { setDetail(null); onOpenGuide(detail) }} />}
  </div>
}
