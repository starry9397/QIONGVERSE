import { useEffect, useRef, useState, type MouseEvent } from "react";
import type * as ThreeTypes from "three";
import type { Language } from "../data";
import { assertLocalizationTree, completeLocalizationTree, inline } from "../i18n";
import { createImmersiveCameraGuard } from "../immersive-controls";
import {
  avatarWorldConfigs,
  createLuoyinAvatarController,
  type LuoyinAvatarController,
} from "../luoyin-avatar";
import {
  tropicalExhibits,
  tropicalReferenceImage,
  type TropicalExhibit,
} from "../tropical-data";
import BrandLockup from "./BrandLockup";
import LanguageSelector from "./LanguageSelector";
completeLocalizationTree(tropicalExhibits)
assertLocalizationTree(tropicalExhibits, 'tropical hall exhibits')

type Props = {
  language: Language;
  onChangeLanguage: (language: Language) => void;
  onExit: () => void;
  onOpenGuide: (exhibit: TropicalExhibit) => void;
};
type SceneStatus = "loading" | "ready" | "fallback";
const tx = (language: Language, en: string, zh: string) => inline(language, en, zh);

function TidePulse({
  reduced,
  pulse,
}: {
  reduced: boolean;
  pulse: { x: number; y: number; key: number };
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const points = useRef<{ x: number; y: number; born: number }[]>([]);
  useEffect(() => {
    if (pulse.key)
      points.current.push({ x: pulse.x, y: pulse.y, born: performance.now() });
  }, [pulse]);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let frame = 0;
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, box.width * devicePixelRatio);
      canvas.height = Math.max(1, box.height * devicePixelRatio);
    };
    const draw = (now: number) => {
      const context = canvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      points.current = points.current.filter((point) => now - point.born < 900);
      points.current.forEach((point) => {
        const progress = Math.min(1, (now - point.born) / 900);
        for (let ring = 0; ring < 3; ring += 1) {
          const radius =
            (reduced ? 34 : 90) * (progress + ring * 0.18) * devicePixelRatio;
          context.beginPath();
          context.ellipse(
            point.x * devicePixelRatio,
            point.y * devicePixelRatio,
            radius,
            radius * 0.58,
            0,
            0,
            Math.PI * 2,
          );
          context.strokeStyle =
            "rgba(91,224,226," + (0.78 - ring * 0.15) * (1 - progress) + ")";
          context.lineWidth = Math.max(1, 1.8 * devicePixelRatio);
          context.stroke();
        }
        if (!reduced)
          for (let index = 0; index < 12; index += 1) {
            const angle = (Math.PI * 2 * index) / 12;
            const distance = (24 + progress * 108) * devicePixelRatio;
            context.fillStyle =
              "rgba(245,207,135," + 0.7 * (1 - progress) + ")";
            context.fillRect(
              point.x * devicePixelRatio + Math.cos(angle) * distance,
              point.y * devicePixelRatio + Math.sin(angle) * distance * 0.58,
              2 * devicePixelRatio,
              2 * devicePixelRatio,
            );
          }
      });
      frame = requestAnimationFrame(draw);
    };
    resize();
    frame = requestAnimationFrame(draw);
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
    };
  }, [reduced]);
  return (
    <canvas className="tropical-pulse-layer" ref={ref} aria-hidden="true" />
  );
}

function DetailSheet({
  exhibit,
  language,
  onClose,
  onAsk,
}: {
  exhibit: TropicalExhibit;
  language: Language;
  onClose: () => void;
  onAsk: () => void;
}) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, [onClose]);
  return (
    <div
      className="tropical-sheet-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        className="tropical-detail-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tropical-detail-title"
      >
        <div className="tropical-sheet-head">
          <div>
            <p className="mono-label">
              PROJECT-SUPPLIED CURATORIAL ASSET / 项目提供策展素材
            </p>
            <h2 id="tropical-detail-title">{exhibit.title[language]}</h2>
          </div>
          <button
            className="close-button"
            type="button"
            onClick={onClose}
            aria-label={tx(language, "Close exhibit", "关闭展项")}
          >
            ×
          </button>
        </div>
        <img
          className="tropical-detail-media"
          src={exhibit.asset}
          alt={exhibit.title[language]}
          onError={(event) => {
            event.currentTarget.src = exhibit.fallback;
          }}
        />
        <p className="tropical-detail-en">{exhibit.title.en}</p>
        <p>{exhibit.introduction[language]}</p>
        <p className="tropical-detail-note">{exhibit.note[language]}</p>
        <button className="tropical-ask-button" type="button" onClick={onAsk}>
          {tx(language, "Ask Luoyin about this exhibit", "询问螺音关于此展项")}
        </button>
      </section>
    </div>
  );
}

export default function TropicalImmersiveHall({
  language,
  onChangeLanguage,
  onExit,
  onOpenGuide,
}: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"world" | "index">("world");
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>("loading");
  const [active, setActive] = useState(tropicalExhibits[0]);
  const [detail, setDetail] = useState<TropicalExhibit | null>(null);
  const [pulse, setPulse] = useState({ x: 0, y: 0, key: 0 });
  const [avatarState, setAvatarState] = useState<
    "hidden" | "loading" | "ready" | "failed"
  >("hidden");
  const avatarRef = useRef<LuoyinAvatarController | null>(null);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const select = (exhibit: TropicalExhibit) => {
    setActive(exhibit);
    setDetail(exhibit);
  };
  const triggerPulse = (
    event?: Pick<MouseEvent<HTMLElement>, "clientX" | "clientY">,
  ) => {
    const box = mount.current?.getBoundingClientRect();
    if (box)
      setPulse({
        x: event ? event.clientX - box.left : box.width / 2,
        y: event ? event.clientY - box.top : box.height / 2,
        key: Date.now(),
      });
  };
  useEffect(() => {
    if (view !== "world") return;
    const element = mount.current;
    if (!element) return;
    let disposed = false;
    let timedOut = false;
    let frame = 0;
    let timeout = 0;
    let renderer: ThreeTypes.WebGLRenderer | null = null;
    let splat: {
      initialized: Promise<unknown>;
      dispose: () => void;
      getBoundingBox?: (centersOnly?: boolean) => ThreeTypes.Box3;
    } | null = null;
    let resize = () => {};
    let avatar: LuoyinAvatarController | null = null;
    let disposeCameraGuard = () => {};
    setSceneStatus("loading");
    const cleanup = () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      removeEventListener("resize", resize);
      disposeCameraGuard();
      avatar?.dispose();
      if (avatarRef.current === avatar) avatarRef.current = null;
      splat?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
      setAvatarState("hidden");
    };
    void (async () => {
      try {
        if (
          !window.WebGLRenderingContext ||
          !document.createElement("canvas").getContext("webgl2")
        )
          throw new Error("WebGL 2 unavailable");
        const THREE = await import("three");
        const { SparkRenderer, SplatMesh, SparkControls } =
          await import("@sparkjsdev/spark");
        if (disposed) return;
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
        element.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const contactScene = new THREE.Scene();
        const avatarScene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(62, 1, 0.01, 1000);
        scene.add(new SparkRenderer({ renderer }));
        splat = new SplatMesh({
          url: "/assets/3d/tropical/tropical-island-world.spz",
        }) as unknown as {
          initialized: Promise<unknown>;
          dispose: () => void;
          getBoundingBox?: (centersOnly?: boolean) => ThreeTypes.Box3;
        };
        scene.add(splat as unknown as ThreeTypes.Object3D);
        const controls = new SparkControls({ canvas: renderer.domElement });
        const cameraGuard = createImmersiveCameraGuard(controls, camera, splat);
        disposeCameraGuard = cameraGuard.dispose;
        avatar = createLuoyinAvatarController({
          scene,
          avatarScene,
          contactScene,
          camera,
          renderer,
          controls,
          splat,
          config: avatarWorldConfigs.tropical,
          onState: setAvatarState,
        });
        avatarRef.current = avatar;
        resize = () => {
          const width = element.clientWidth;
          const height = element.clientHeight;
          if (!renderer) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        resize();
        addEventListener("resize", resize);
        let lastFrame = performance.now();
        const render = () => {
          if (!renderer || disposed || timedOut) return;
          const now = performance.now();
          const delta = Math.min(0.05, (now - lastFrame) / 1000);
          lastFrame = now;
          if (avatar?.getState() === "ready") avatar.update(delta);
          else {
            controls.update(camera);
            cameraGuard.clamp();
          }
          renderer.render(scene, camera);
          if (avatar?.getState() === "ready") {
            renderer.autoClear = false;
            renderer.clearDepth();
            renderer.render(contactScene, camera);
            renderer.render(avatarScene, camera);
            renderer.autoClear = true;
          }
          frame = requestAnimationFrame(render);
        };
        render();
        timeout = window.setTimeout(() => {
          if (!disposed) {
            timedOut = true;
            cleanup();
            setSceneStatus("fallback");
          }
        }, 12000);
        await splat.initialized;
        clearTimeout(timeout);
        if (timedOut || disposed) return;
        camera.position.set(0, 0, 0);
        camera.up.set(0, 0, 1);
        camera.lookAt(1, 0, 0);
        camera.updateMatrixWorld(true);
        setSceneStatus("ready");
      } catch {
        if (!timedOut) cleanup();
        if (!disposed && !timedOut) setSceneStatus("fallback");
      }
    })();
    return () => {
      disposed = true;
      cleanup();
    };
  }, [view]);
  const toggleAvatar = () => {
    const avatar = avatarRef.current;
    if (!avatar) return;
    if (avatar.getState() === "ready") avatar.disable();
    else void avatar.enable();
  };
  const openExhibit = (exhibit: TropicalExhibit) => {
    triggerPulse();
    select(exhibit);
  };
  return (
    <div className="tropical-hall" data-avatar-state={avatarState}>
      {view === "world" && sceneStatus === "ready" && (
        <div className="luoyin-avatar-floating">
          <button
            className="luoyin-avatar-button"
            type="button"
            disabled={avatarState === "loading"}
            onClick={toggleAvatar}
          >
            {avatarState === "ready"
              ? tx(language, "Hide Luoyin", "隐藏螺音")
              : avatarState === "loading"
                ? tx(language, "Loading Luoyin", "正在加载螺音")
                : tx(language, "Show Luoyin", "显示螺音")}
          </button>
          <span className="luoyin-avatar-status" aria-live="polite">
            {avatarState === "failed"
              ? tx(
                  language,
                  "3D character unavailable. Free camera remains available.",
                  "3D 角色暂不可用，仍可使用自由相机浏览。",
                )
              : avatarState === "ready"
                ? tx(
                    language,
                    "Luoyin ready · WASD / arrows to walk · drag to orbit · wheel to zoom",
                    "螺音已准备 · WASD / 方向键行走 · 拖动环绕 · 滚轮缩放",
                  )
                : ""}
          </span>
        </div>
      )}
      <header className="tropical-header">
        <BrandLockup onNavigate={(event) => { event.preventDefault(); onExit(); }} />
        <p>
          {view === "world"
            ? "TROPICAL ISLAND / IMMERSIVE HALL"
            : "TROPICAL ISLAND / EXHIBIT INDEX"}
        </p>
        <div>
          <LanguageSelector language={language} onChange={onChangeLanguage} />
          <button type="button" onClick={onExit}>
            {tx(language, "Back to five halls", "返回五个展厅")}
          </button>
        </div>
      </header>
      {view === "world" ? (
        <main className="tropical-stage">
          <div
            className="tropical-scene"
            ref={mount}
            onClick={(event) => triggerPulse(event)}
            role="application"
            tabIndex={0}
            aria-label={tx(
              language,
              "Interactive Tropical Island visual world",
              "可交互的热带海岛视觉世界",
            )}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                triggerPulse();
              }
            }}
          >
            {sceneStatus !== "ready" && (
              <div
                className={
                  sceneStatus === "fallback"
                    ? "tropical-scene-fallback is-static"
                    : "tropical-scene-fallback"
                }
              >
                <img
                  src={tropicalReferenceImage}
                  alt={tx(
                    language,
                    "Tropical Island Hall reference view",
                    "热带海岛厅静态参考视图",
                  )}
                />
                <p>
                  {sceneStatus === "loading"
                    ? tx(
                        language,
                        "Opening the island world…",
                        "正在打开海岛视觉世界…",
                      )
                    : tx(
                        language,
                        "Static hall view ready. Exhibit index and Luoyin remain available.",
                        "静态展厅视图已准备好；展项索引与螺音仍可使用。",
                      )}
                </p>
              </div>
            )}
            <TidePulse reduced={reduced} pulse={pulse} />
          </div>
          <aside className="tropical-overlay">
            <p className="mono-label">HAINAN PROVINCE / PROJECT-CURATED VIEW</p>
            <h1>{tx(language, "Tropical Island Hall", "热带海岛厅")}</h1>
            <p>
              {tx(
                language,
                "A tide-line reading room built from project-supplied island scenes. It invites attentive looking, not tourism booking or site verification.",
                "一间由项目提供的海岛场景构成的潮汐观察室，邀请细看与想象，不提供旅游预订或现场核验。",
              )}
            </p>
            <span className="tropical-status" aria-live="polite">
              {sceneStatus === "ready"
                ? tx(language, "3D world ready", "3D 世界已准备好")
                : sceneStatus === "loading"
                  ? tx(language, "Opening 3D world", "正在打开 3D 世界")
                  : tx(
                      language,
                      "Static hall view ready",
                      "静态展厅视图已准备好",
                    )}
            </span>
          </aside>
          <div className="tropical-actions">
            <button type="button" onClick={() => setView("index")}>
              {tx(language, "Open exhibit index", "打开展项索引")}
            </button>
            <button type="button" onClick={() => onOpenGuide(active)}>
              {tx(language, "Ask Luoyin", "询问螺音")}
            </button>
          </div>
          {avatarState !== "ready" && (
            <nav
              className="tropical-exhibit-strip"
              aria-label={tx(
                language,
                "Visible exhibit navigation",
                "可见展项导航",
              )}
            >
              {tropicalExhibits.map((exhibit) => (
                <button
                  type="button"
                  key={exhibit.id}
                  className={active.id === exhibit.id ? "active" : ""}
                  onClick={() => openExhibit(exhibit)}
                >
                  <span>◌</span>
                  <b>{exhibit.title[language]}</b>
                  <small>PROJECT-SUPPLIED ASSET</small>
                </button>
              ))}
            </nav>
          )}
          <p className="tropical-controls">
            {tx(
              language,
              "Drag to rotate · wheel / pinch to zoom · click the world for a tide pulse",
              "拖动旋转 · 滚轮 / 双指缩放 · 点击大世界触发潮汐脉冲",
            )}
          </p>
        </main>
      ) : (
        <main className="tropical-index-page">
          <div className="tropical-index-intro">
            <div>
              <p className="mono-label">HAINAN PROVINCE / TROPICAL ISLAND</p>
              <h1>{tx(language, "Exhibit Index", "展项索引")}</h1>
            </div>
            <img src={tropicalReferenceImage} alt="" />
            <div>
              <p>
                {tx(
                  language,
                  "Choose a project-curated island study. The immersive world remains one step away.",
                  "选择一个项目策展的海岛观察图像；沉浸式大世界始终只需一步返回。",
                )}
              </p>
              <button
                className="tropical-world-return"
                type="button"
                onClick={() => setView("world")}
              >
                {tx(language, "Back to immersive world", "返回沉浸式大世界")} ↗
              </button>
            </div>
          </div>
          <div className="tropical-index-list">
            {tropicalExhibits.map((exhibit) => (
              <article className="tropical-index-entry" key={exhibit.id}>
                <img
                  loading="lazy"
                  src={exhibit.asset}
                  alt={exhibit.title[language]}
                  onError={(event) => {
                    event.currentTarget.src = exhibit.fallback;
                  }}
                />
                <div>
                  <p className="mono-label">
                    PROJECT-SUPPLIED CURATORIAL ASSET / 项目提供策展素材
                  </p>
                  <h2>{exhibit.title[language]}</h2>
                  <p>{exhibit.introduction[language]}</p>
                  <button type="button" onClick={() => select(exhibit)}>
                    {tx(language, "Open exhibit", "打开展项")} ↗
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>
      )}
      {detail && (
        <DetailSheet
          exhibit={detail}
          language={language}
          onClose={() => setDetail(null)}
          onAsk={() => {
            setDetail(null);
            onOpenGuide(detail);
          }}
        />
      )}
    </div>
  );
}
