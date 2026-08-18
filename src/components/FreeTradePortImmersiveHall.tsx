import { useEffect, useRef, useState, type MouseEvent } from "react";
import type * as ThreeTypes from "three";
import { zones, type Language } from "../data";
import { assertLocalizationTree, completeLocalizationTree, localize, type RuntimeLocalized } from "../i18n";
import { createImmersiveCameraGuard } from "../immersive-controls";
import {
  avatarWorldConfigs,
  createLuoyinAvatarController,
  type LuoyinAvatarController,
} from "../luoyin-avatar";
import {
  freeTradePortExhibits,
  freeTradePortReferenceImage,
  freeTradePortSourceUrl,
  freeTradePortWorldUrl,
  type FreeTradePortExhibit,
} from "../free-trade-port-data";
import BrandLockup from "./BrandLockup";
import LanguageSelector from "./LanguageSelector";
import ImmersiveExhibitIndex, { immersiveIndexStatus } from "./ImmersiveExhibitIndex";
completeLocalizationTree(freeTradePortExhibits)
assertLocalizationTree(freeTradePortExhibits, 'Free Trade Port hall exhibits')

type Props = {
  language: Language;
  onChangeLanguage: (language: Language) => void;
  onExit: () => void;
  onOpenGuide: (exhibit: FreeTradePortExhibit) => void;
};
type SceneStatus = "loading" | "ready" | "fallback";
type HallView = "world" | "index";
const freeTradePortCopy = {
  "Back to five halls": { en: "Back to five halls", zh: "返回五个展厅", id: "Kembali ke lima aula", ja: "五つの展示室に戻る", ko: "다섯 전시관으로 돌아가기", ru: "К пяти залам", ar: "العودة إلى القاعات الخمس" },
  "Close exhibit": { en: "Close exhibit", zh: "关闭展项", id: "Tutup pameran", ja: "展示を閉じる", ko: "전시 닫기", ru: "Закрыть экспонат", ar: "إغلاق المعروض" },
  "Open official background source": { en: "Open official background source", zh: "打开官方背景来源", id: "Buka sumber latar resmi", ja: "公式背景資料を開く", ko: "공식 배경 출처 열기", ru: "Открыть официальный справочный источник", ar: "فتح المصدر الرسمي للخلفية" },
  "Ask Luoyin about this exhibit": { en: "Ask Luoyin about this exhibit", zh: "询问螺音关于此展项", id: "Tanyakan pameran ini kepada Luoyin", ja: "この展示について螺音に聞く", ko: "이 전시에 대해 뤄인에게 묻기", ru: "Спросить Луоинь об этом экспонате", ar: "اسأل لويين عن هذا المعروض" },
  "Hide Luoyin": { en: "Hide Luoyin", zh: "隐藏螺音", id: "Sembunyikan Luoyin", ja: "螺音を隠す", ko: "뤄인 숨기기", ru: "Скрыть Луоинь", ar: "إخفاء لويين" },
  "Loading Luoyin": { en: "Loading Luoyin", zh: "正在加载螺音", id: "Memuat Luoyin", ja: "螺音を読み込み中", ko: "뤄인 로드 중", ru: "Загрузка Луоинь", ar: "جارٍ تحميل لويين" },
  "Show Luoyin": { en: "Show Luoyin", zh: "显示螺音", id: "Tampilkan Luoyin", ja: "螺音を表示", ko: "뤄인 표시", ru: "Показать Луоинь", ar: "إظهار لويين" },
  "3D character unavailable. Free camera remains available.": { en: "3D character unavailable. Free camera remains available.", zh: "3D 角色暂不可用，仍可使用自由相机浏览。", id: "Karakter 3D tidak tersedia. Kamera bebas tetap dapat digunakan.", ja: "3D キャラクターは利用できません。自由カメラは引き続き使えます。", ko: "3D 캐릭터를 사용할 수 없습니다. 자유 카메라는 계속 이용할 수 있습니다.", ru: "3D-персонаж недоступен. Свободная камера по-прежнему работает.", ar: "الشخصية ثلاثية الأبعاد غير متاحة. تظل الكاميرا الحرة متاحة." },
  "Luoyin ready · WASD / arrows to walk · drag to orbit · wheel to zoom": { en: "Luoyin ready · WASD / arrows to walk · drag to orbit · wheel to zoom", zh: "螺音已准备 · WASD / 方向键行走 · 拖动环绕 · 滚轮缩放", id: "Luoyin siap · WASD / panah untuk berjalan · seret untuk mengorbit · roda untuk memperbesar", ja: "螺音の準備完了 · WASD / 矢印で歩く · ドラッグで周回 · ホイールでズーム", ko: "뤄인 준비 완료 · WASD / 방향키로 걷기 · 드래그로 회전 · 휠로 확대", ru: "Луоинь готова · WASD / стрелки для ходьбы · перетаскивание для обзора · колесо для масштаба", ar: "لويين جاهزة · استخدم WASD / الأسهم للمشي · اسحب للدوران · العجلة للتكبير" },
  "FREE TRADE PORT / IMMERSIVE HALL": { en: "FREE TRADE PORT / IMMERSIVE HALL", zh: "自贸港 / 沉浸展厅", id: "PELABUHAN PERDAGANGAN BEBAS / AULA IMERSIF", ja: "自由貿易港 / 没入型展示室", ko: "자유무역항 / 몰입형 전시관", ru: "ПОРТ СВОБОДНОЙ ТОРГОВЛИ / ИММЕРСИВНЫЙ ЗАЛ", ar: "ميناء التجارة الحرة / القاعة الغامرة" },
  "FREE TRADE PORT / EXHIBIT INDEX": { en: "FREE TRADE PORT / EXHIBIT INDEX", zh: "自贸港 / 展项索引", id: "PELABUHAN PERDAGANGAN BEBAS / INDEKS PAMERAN", ja: "自由貿易港 / 展示索引", ko: "자유무역항 / 전시 색인", ru: "ПОРТ СВОБОДНОЙ ТОРГОВЛИ / КАТАЛОГ ЭКСПОНАТОВ", ar: "ميناء التجارة الحرة / فهرس المعروضات" },
  "HAINAN PROVINCE / FREE TRADE PORT": { en: "HAINAN PROVINCE / FREE TRADE PORT", zh: "海南省 / 自贸港", id: "PROVINSI HAINAN / PELABUHAN PERDAGANGAN BEBAS", ja: "海南省 / 自由貿易港", ko: "하이난성 / 자유무역항", ru: "ПРОВИНЦИЯ ХАЙНАНЬ / ПОРТ СВОБОДНОЙ ТОРГОВЛИ", ar: "مقاطعة هاينان / ميناء التجارة الحرة" },
  "Interactive Free Trade Port visual world": { en: "Interactive Free Trade Port visual world", zh: "可交互的自贸港视觉世界", id: "Dunia visual Pelabuhan Perdagangan Bebas interaktif", ja: "インタラクティブな自由貿易港の視覚世界", ko: "인터랙티브 자유무역항 시각 세계", ru: "Интерактивный визуальный мир порта свободной торговли", ar: "عالم بصري تفاعلي لميناء التجارة الحرة" },
  "Free Trade Port immersive hall reference view": { en: "Free Trade Port immersive hall reference view", zh: "自贸港沉浸展厅静态参考视图", id: "Tampilan referensi aula imersif Pelabuhan Perdagangan Bebas", ja: "自由貿易港没入型展示室の参考ビュー", ko: "자유무역항 몰입형 전시관 참고 화면", ru: "Эталонный вид иммерсивного зала порта свободной торговли", ar: "عرض مرجعي للقاعة الغامرة في ميناء التجارة الحرة" },
  "Opening the Free Trade Port world…": { en: "Opening the Free Trade Port world…", zh: "正在打开自贸港视觉世界…", id: "Membuka dunia visual Pelabuhan Perdagangan Bebas…", ja: "自由貿易港の視覚世界を開いています…", ko: "자유무역항 시각 세계를 여는 중…", ru: "Открываем визуальный мир порта свободной торговли…", ar: "جارٍ فتح العالم البصري لميناء التجارة الحرة…" },
  "This device is using the static hall view. Exhibits and Luoyin remain available.": { en: "This device is using the static hall view. Exhibits and Luoyin remain available.", zh: "当前设备正在使用静态展厅视图；展项与螺音仍可使用。", id: "Perangkat ini menggunakan tampilan aula statis. Pameran dan Luoyin tetap tersedia.", ja: "この端末では静的な展示ビューを使用しています。展示と螺音は引き続き利用できます。", ko: "이 기기는 정적 전시관 화면을 사용합니다. 전시와 뤄인은 계속 이용할 수 있습니다.", ru: "На этом устройстве используется статический вид зала. Экспонаты и Луоинь по-прежнему доступны.", ar: "يستخدم هذا الجهاز عرض القاعة الثابت. تظل المعروضات ولويين متاحتين." },
  "HAINAN PROVINCE / PUBLIC INFORMATION ORIENTATION": { en: "HAINAN PROVINCE / PUBLIC INFORMATION ORIENTATION", zh: "海南省 / 公共信息导览", id: "PROVINSI HAINAN / ORIENTASI INFORMASI PUBLIK", ja: "海南省 / 公共情報ガイド", ko: "하이난성 / 공공 정보 안내", ru: "ПРОВИНЦИЯ ХАЙНАНЬ / ПУБЛИЧНАЯ СПРАВКА", ar: "مقاطعة هاينان / توجيه المعلومات العامة" },
  "Free Trade Port Immersive Hall": { en: "Free Trade Port Immersive Hall", zh: "自贸港沉浸展厅", id: "Aula Imersif Pelabuhan Perdagangan Bebas", ja: "自由貿易港の没入型展示室", ko: "자유무역항 몰입형 전시관", ru: "Иммерсивный зал порта свободной торговли", ar: "القاعة الغامرة لميناء التجارة الحرة" },
  "A project-curated visual world for reading connection, logistics and public-information pathways. Official sources remain the place to check current policy details.": { en: "A project-curated visual world for reading connection, logistics and public-information pathways. Official sources remain the place to check current policy details.", zh: "一座由项目策展素材构成的视觉世界，用于阅读连接、物流与公共信息路径。当前政策细节仍应以官方来源为准。", id: "Dunia visual kurasi proyek untuk membaca koneksi, logistik, dan jalur informasi publik. Periksa sumber resmi untuk rincian kebijakan terkini.", ja: "つながり、物流、公共情報への道筋を読むための、プロジェクトが編んだ視覚世界です。最新の政策詳細は公式情報源で確認してください。", ko: "연결과 물류, 공공 정보의 경로를 읽기 위한 프로젝트 큐레이션 시각 세계입니다. 최신 정책 세부 사항은 공식 출처에서 확인해 주세요.", ru: "Визуальный мир, созданный проектом для чтения связей, логистики и путей к публичной информации. Актуальные детали политики проверяйте по официальным источникам.", ar: "عالم بصري نسّقه المشروع لقراءة الروابط والخدمات اللوجستية ومسارات المعلومات العامة. تحقّق من التفاصيل السياسية الحالية عبر المصادر الرسمية." },
  "3D world ready": { en: "3D world ready", zh: "3D 世界已准备", id: "Dunia 3D siap", ja: "3D ワールド準備完了", ko: "3D 세계 준비 완료", ru: "3D-мир готов", ar: "العالم ثلاثي الأبعاد جاهز" },
  "Opening 3D world": { en: "Opening 3D world", zh: "正在打开 3D 世界", id: "Membuka dunia 3D", ja: "3D ワールドを開いています", ko: "3D 세계를 여는 중", ru: "Открываем 3D-мир", ar: "جارٍ فتح العالم ثلاثي الأبعاد" },
  "Static hall view ready": { en: "Static hall view ready", zh: "静态展厅视图已准备", id: "Tampilan aula statis siap", ja: "静的な展示ビューの準備完了", ko: "정적 전시관 화면 준비 완료", ru: "Статический вид зала готов", ar: "عرض القاعة الثابت جاهز" },
  "Open exhibit index": { en: "Open exhibit index", zh: "打开展项索引", id: "Buka indeks pameran", ja: "展示索引を開く", ko: "전시 색인 열기", ru: "Открыть каталог экспонатов", ar: "فتح فهرس المعروضات" },
  "Ask Luoyin": { en: "Ask Luoyin", zh: "询问螺音", id: "Tanya Luoyin", ja: "螺音に聞く", ko: "뤄인에게 묻기", ru: "Спросить Луоинь", ar: "اسأل لويين" },
  "Open official English portal": { en: "Open official English portal", zh: "打开英文官方门户", id: "Buka portal resmi berbahasa Inggris", ja: "公式英語ポータルを開く", ko: "영문 공식 포털 열기", ru: "Открыть официальный англоязычный портал", ar: "فتح البوابة الرسمية الإنجليزية" },
  "Verify current notices and policy materials with the official portal. This project cannot decide eligibility, tax, customs, visa, investment or commercial outcomes.": { en: "Verify current notices and policy materials with the official portal. This project cannot decide eligibility, tax, customs, visa, investment or commercial outcomes.", zh: "当前通知与政策资料请以英文官方门户为准；本项目不判断资格、税务、通关、签证、投资或商业结果。", id: "Periksa pemberitahuan dan bahan kebijakan terkini di portal resmi. Proyek ini tidak menentukan kelayakan, pajak, bea cukai, visa, investasi, atau hasil komersial.", ja: "最新の通知と政策資料は公式ポータルで確認してください。本プロジェクトは資格、税、税関、ビザ、投資、商業上の結果を判断しません。", ko: "최신 공지와 정책 자료는 공식 포털에서 확인해 주세요. 이 프로젝트는 자격, 세금, 통관, 비자, 투자 또는 상업적 결과를 판단하지 않습니다.", ru: "Актуальные уведомления и материалы о политике проверяйте на официальном портале. Проект не определяет право на участие, налоги, таможню, визы, инвестиционные или коммерческие результаты.", ar: "تحقّق من الإشعارات ومواد السياسات الحالية عبر البوابة الرسمية. لا يحدد هذا المشروع الأهلية أو الضرائب أو الجمارك أو التأشيرات أو الاستثمار أو النتائج التجارية." },
  "Exhibits in the world": { en: "Exhibits in the world", zh: "大世界展项", id: "Pameran di dunia", ja: "ワールド内の展示", ko: "월드 전시", ru: "Экспонаты в мире", ar: "المعروضات في العالم" },
  "Project asset": { en: "Project asset", zh: "项目素材", id: "Aset proyek", ja: "プロジェクト素材", ko: "프로젝트 소재", ru: "Материал проекта", ar: "مادة المشروع" },
  "Enter an immersive hall": { en: "Enter an immersive hall", zh: "进入沉浸展厅", id: "Masuk aula imersif", ja: "没入型展示室に入る", ko: "몰입형 전시관 입장", ru: "Войти в иммерсивный зал", ar: "دخول القاعة الغامرة" },
  "Enter hall": { en: "Enter hall", zh: "进入展厅", id: "Masuk aula", ja: "展示室に入る", ko: "전시관 입장", ru: "Войти в зал", ar: "دخول القاعة" },
  "Project-supplied asset": { en: "Project-supplied asset", zh: "项目提供素材", id: "Aset yang disediakan proyek", ja: "プロジェクト提供素材", ko: "프로젝트 제공 소재", ru: "Материал, предоставленный проектом", ar: "مادة مقدمة من المشروع" },
  "Drag to rotate · wheel / pinch to zoom · WASD or arrow keys to move · click the world for a pulse": { en: "Drag to rotate · wheel / pinch to zoom · WASD or arrow keys to move · click the world for a pulse", zh: "拖动旋转 · 滚轮/双指缩放 · WASD 或方向键移动 · 点击大世界触发脉冲", id: "Seret untuk memutar · roda / cubit untuk memperbesar · WASD atau tombol panah untuk bergerak · klik dunia untuk memicu denyut", ja: "ドラッグで回転 · ホイール / ピンチでズーム · WASD または矢印キーで移動 · ワールドをクリックしてパルス", ko: "드래그로 회전 · 휠 / 핀치로 확대 · WASD 또는 방향키로 이동 · 월드를 클릭해 파동 만들기", ru: "Перетаскивайте для поворота · колесо / щипок для масштаба · WASD или стрелки для движения · кликните по миру для импульса", ar: "اسحب للدوران · العجلة / القرص للتكبير · استخدم WASD أو الأسهم للتحرك · انقر على العالم لإطلاق نبضة" },
  "Exhibit Index": { en: "Exhibit Index", zh: "展项索引", id: "Indeks Pameran", ja: "展示索引", ko: "전시 색인", ru: "Каталог экспонатов", ar: "فهرس المعروضات" },
  "Choose a project-supplied visual record. The immersive world remains one step away.": { en: "Choose a project-supplied visual record. The immersive world remains one step away.", zh: "选择一项项目提供的视觉记录；沉浸大世界始终只需一步返回。", id: "Pilih catatan visual yang disediakan proyek. Dunia imersif tetap satu langkah dari sini.", ja: "プロジェクト提供の視覚記録を選んでください。没入型ワールドへは一歩で戻れます。", ko: "프로젝트가 제공한 시각 기록을 선택하세요. 몰입형 월드는 한 걸음 거리에 있습니다.", ru: "Выберите визуальную запись, предоставленную проектом. До иммерсивного мира остаётся один шаг.", ar: "اختر سجلاً بصرياً مقدماً من المشروع. يظل العالم الغامر على بُعد خطوة واحدة." },
  "Back to immersive world": { en: "Back to immersive world", zh: "返回沉浸大世界", id: "Kembali ke dunia imersif", ja: "没入型ワールドに戻る", ko: "몰입형 월드로 돌아가기", ru: "Вернуться в иммерсивный мир", ar: "العودة إلى العالم الغامر" },
  "Project-supplied curatorial asset": { en: "Project-supplied curatorial asset", zh: "项目提供的策展素材", id: "Aset kuratorial yang disediakan proyek", ja: "プロジェクト提供のキュレーション素材", ko: "프로젝트 제공 큐레이션 소재", ru: "Кураторский материал, предоставленный проектом", ar: "مادة قيّمية مقدمة من المشروع" },
  "Open exhibit": { en: "Open exhibit", zh: "打开展项", id: "Buka pameran", ja: "展示を開く", ko: "전시 열기", ru: "Открыть экспонат", ar: "فتح المعروض" },
} satisfies Record<string, RuntimeLocalized>
assertLocalizationTree(freeTradePortCopy, 'Free Trade Port interface copy')
const tx = (language: Language, en: keyof typeof freeTradePortCopy, _zh?: string) => localize(freeTradePortCopy[en], language);

function OrbitPulse({
  reduced,
  pulse,
}: {
  reduced: boolean;
  pulse: { x: number; y: number; key: number };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulses = useRef<{ x: number; y: number; born: number }[]>([]);
  useEffect(() => {
    const canvas = canvasRef.current;
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
      pulses.current = pulses.current.filter((item) => now - item.born < 900);
      pulses.current.forEach((item) => {
        const progress = Math.max(0, Math.min(1, (now - item.born) / 900));
        const radius = (reduced ? 48 : 138) * progress * devicePixelRatio;
        const x = item.x * devicePixelRatio;
        const y = item.y * devicePixelRatio;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.strokeStyle = "rgba(111,221,197," + 0.86 * (1 - progress) + ")";
        context.lineWidth = Math.max(1, 2 * devicePixelRatio);
        context.stroke();
        context.beginPath();
        context.arc(x, y, radius * 0.58, 0, Math.PI * 2);
        context.strokeStyle = "rgba(229,163,75," + 0.72 * (1 - progress) + ")";
        context.stroke();
      });
      if (!document.hidden) frame = requestAnimationFrame(draw);
    };
    resize();
    frame = requestAnimationFrame(draw);
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
    };
  }, [reduced]);
  useEffect(() => {
    if (pulse.key)
      pulses.current.push({ x: pulse.x, y: pulse.y, born: performance.now() });
  }, [pulse]);
  return (
    <canvas className="ftp-pulse-layer" ref={canvasRef} aria-hidden="true" />
  );
}

function DetailSheet({
  exhibit,
  language,
  onClose,
  onAsk,
}: {
  exhibit: FreeTradePortExhibit;
  language: Language;
  onClose: () => void;
  onAsk: () => void;
}) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    addEventListener("keydown", listener);
    return () => removeEventListener("keydown", listener);
  }, [onClose]);
  return (
    <div
      className="ftp-sheet-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        className="ftp-detail-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ftp-detail-title"
      >
        <div className="ftp-sheet-head">
          <div>
            <p className="mono-label">
              {tx(language, "Project-supplied curatorial asset")}
            </p>
            <h2 id="ftp-detail-title">{exhibit.title[language]}</h2>
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
          className="ftp-detail-media"
          src={exhibit.asset}
          alt={exhibit.title[language]}
          onError={(event) => {
            event.currentTarget.src = exhibit.fallback;
          }}
        />
        <p className="ftp-detail-en">{exhibit.title.en}</p>
        <p>{exhibit.introduction[language]}</p>
        <p className="ftp-detail-note">{exhibit.note[language]}</p>
        <div className="ftp-detail-actions">
          <a
            className="ftp-source-link"
            href={freeTradePortSourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            {tx(
              language,
              "Open official background source",
              "打开官方背景来源",
            )}{" "}
            ↗
          </a>
          <button className="ftp-ask-button" type="button" onClick={onAsk}>
            {tx(
              language,
              "Ask Luoyin about this exhibit",
              "询问螺音关于此展项",
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function FreeTradePortImmersiveHall({
  language,
  onChangeLanguage,
  onExit,
  onOpenGuide,
}: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<HallView>("world");
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>("loading");
  const [active, setActive] = useState(freeTradePortExhibits[0]);
  const [detail, setDetail] = useState<FreeTradePortExhibit | null>(null);
  const [pulse, setPulse] = useState({ x: 0, y: 0, key: 0 });
  const avatarRef = useRef<LuoyinAvatarController | null>(null);
  const [avatarState, setAvatarState] = useState<
    "hidden" | "loading" | "ready" | "failed"
  >("hidden");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const select = (exhibit: FreeTradePortExhibit) => {
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
    setSceneStatus("loading");
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
        splat = new SplatMesh({ url: freeTradePortWorldUrl }) as unknown as {
          initialized: Promise<unknown>;
          dispose: () => void;
          getBoundingBox: (centersOnly?: boolean) => ThreeTypes.Box3;
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
          config: avatarWorldConfigs.freeTradePort,
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
  return (
    <div
      className={`ftp-immersive-hall${avatarState === "ready" ? " luoyin-visible" : ""}`}
      data-avatar-state={avatarState}
    >
      {view === "world" && (
        <div className="luoyin-avatar-floating">
          <button
            className="luoyin-avatar-button"
            type="button"
            disabled={sceneStatus !== "ready" || avatarState === "loading"}
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
      {view === "world" && <header className="ftp-immersive-header">
        <BrandLockup onNavigate={(event) => { event.preventDefault(); onExit(); }} />
        <p>
          {view === "world"
            ? tx(language, "FREE TRADE PORT / IMMERSIVE HALL")
            : tx(language, "FREE TRADE PORT / EXHIBIT INDEX")}
        </p>
        <div>
          <LanguageSelector language={language} onChange={onChangeLanguage} />
          <button className="hall-guide-button" type="button" onClick={() => onOpenGuide(active)}>
            {tx(language, "Ask Luoyin", "询问螺音")}
          </button>
          <button type="button" onClick={onExit}>
            {tx(language, "Back to five halls", "返回五个展厅")}
          </button>
        </div>
      </header>}
      {view === "world" ? (
        <main className="ftp-immersive-stage">
          <div
            className="ftp-immersive-scene"
            ref={mount}
            onClick={(event) => triggerPulse(event)}
            role="application"
            tabIndex={0}
            aria-label={tx(
              language,
              "Interactive Free Trade Port visual world",
              "可交互的自贸港视觉世界",
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
                    ? "ftp-scene-fallback is-static"
                    : "ftp-scene-fallback"
                }
              >
                <img
                  src={freeTradePortReferenceImage}
                  alt={tx(
                    language,
                    "Free Trade Port immersive hall reference view",
                    "自贸港沉浸展厅静态参考视图",
                  )}
                />
                <p>
                  {sceneStatus === "loading"
                    ? tx(
                        language,
                        "Opening the Free Trade Port world…",
                        "正在打开自贸港视觉世界…",
                      )
                    : tx(
                        language,
                        "This device is using the static hall view. Exhibits and Luoyin remain available.",
                        "当前设备正在使用静态展厅视图；展项与螺音仍可使用。",
                      )}
                </p>
              </div>
            )}
            <OrbitPulse reduced={reduced} pulse={pulse} />
          </div>
          <aside className="ftp-immersive-overlay">
            <p className="mono-label">
              {tx(language, "HAINAN PROVINCE / PUBLIC INFORMATION ORIENTATION")}
            </p>
            <h1>
              {tx(language, "Free Trade Port Immersive Hall", "自贸港沉浸展厅")}
            </h1>
            <p>
              {tx(
                language,
                "A project-curated visual world for reading connection, logistics and public-information pathways. Official sources remain the place to check current policy details.",
                "一座由项目策展素材构成的视觉世界，用于阅读连接、物流与公共信息路径。当前政策细节仍应以官方来源为准。",
              )}
            </p>
            <span aria-live="polite">
              {sceneStatus === "ready"
                ? tx(language, "3D world ready", "3D 世界已准备")
                : sceneStatus === "loading"
                  ? tx(language, "Opening 3D world", "正在打开 3D 世界")
                  : tx(
                      language,
                      "Static hall view ready",
                      "静态展厅视图已准备",
                    )}
            </span>
          </aside>
          <div className="ftp-immersive-actions">
            <button
              type="button"
              onClick={() => setView("index")}
            >
              {tx(language, "Open exhibit index", "打开展项索引")}
            </button>
            <a
              className="ftp-official-portal"
              href={freeTradePortSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tx(language, "Open official English portal", "打开英文官方门户")}
              <span aria-hidden="true">↗</span>
            </a>
            <p className="ftp-official-limit">
              {tx(
                language,
                "Verify current notices and policy materials with the official portal. This project cannot decide eligibility, tax, customs, visa, investment or commercial outcomes.",
                "当前通知与政策资料请以英文官方门户为准；本项目不判断资格、税务、通关、签证、投资或商业结果。",
              )}
            </p>
            <nav
              className="ftp-world-anchors"
              aria-label={tx(language, "Exhibits in the world", "大世界展项")}
              aria-hidden={avatarState === "ready"}
            >
              {freeTradePortExhibits.map((exhibit) => (
                <button
                  key={exhibit.id}
                  type="button"
                  tabIndex={avatarState === "ready" ? -1 : undefined}
                  className={
                    "ftp-world-anchor" +
                    (active.id === exhibit.id ? " active" : "")
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    triggerPulse(event);
                    select(exhibit);
                  }}
                >
                  <img src={exhibit.asset} alt="" aria-hidden="true" />
                  <span>
                    <b>{exhibit.title[language]}</b>
                    <small>{tx(language, "Project asset", "项目素材")}</small>
                  </span>
                </button>
              ))}
            </nav>
          </div>
          <nav
            className="ftp-exhibit-strip ftp-hall-entry-strip"
            aria-label={tx(language, "Enter an immersive hall", "进入沉浸展厅")}
            aria-hidden={avatarState === "ready"}
          >
            {zones.map((zone, index) => (
              <button
                type="button"
                key={zone.id}
                tabIndex={avatarState === "ready" ? -1 : undefined}
                onClick={() => {
                  window.location.hash = [
                    "tropical-hall",
                    "limiao-hall",
                    "aerospace-hall",
                    "huali-hall",
                    "village-hall",
                  ][index];
                }}
              >
                <span>{zone.index}</span>
                <b>{zone.title[language]}</b>
                <small>{tx(language, "Enter hall", "进入展厅")} ↗</small>
              </button>
            ))}
          </nav>
          <nav
            className="ftp-exhibit-strip ftp-legacy-exhibit-strip"
            aria-hidden="true"
          >
            {freeTradePortExhibits.map((exhibit) => (
              <button type="button" key={exhibit.id} tabIndex={-1}>
                <span>◉</span>
                <b>{exhibit.title[language]}</b>
                <small>
                  {tx(language, "Project-supplied asset", "项目提供素材")}
                </small>
              </button>
            ))}
          </nav>
          <p className="ftp-controls">
            {tx(
              language,
              "Drag to rotate · wheel / pinch to zoom · WASD or arrow keys to move · click the world for a pulse",
              "拖动旋转 · 滚轮/双指缩放 · WASD 或方向键移动 · 点击大世界触发脉冲",
            )}
          </p>
        </main>
      ) : (
        <ImmersiveExhibitIndex language={language} onChangeLanguage={onChangeLanguage} onExit={onExit} onBack={() => setView("world")} eyebrow={{ en: "HAINAN PROVINCE / FREE TRADE PORT", zh: "海南省 / 自贸港", id: "PROVINSI HAINAN / PELABUHAN PERDAGANGAN BEBAS", ja: "海南省 / 自由貿易港", ko: "하이난성 / 자유무역항", ru: "ПРОВИНЦИЯ ХАЙНАНЬ / ПОРТ СВОБОДНОЙ ТОРГОВЛИ", ar: "مقاطعة هاينان / ميناء التجارة الحرة" }} title={{ en: "Free Trade Port Archive", zh: "自贸港档案", id: "Arsip Pelabuhan Perdagangan Bebas", ja: "自由貿易港アーカイブ", ko: "자유무역항 아카이브", ru: "Архив порта свободной торговли", ar: "أرشيف ميناء التجارة الحرة" }} subtitle={{ en: "Connections, logistics and public-information pathways held apart from current policy facts.", zh: "将连接、物流与公共信息路径放在项目策展语境中阅读，不替代当前政策事实。", id: "Koneksi, logistik, dan jalur informasi publik dalam konteks kuratorial, terpisah dari fakta kebijakan terkini.", ja: "つながり、物流、公共情報への道筋を、最新の政策事実とは分けて読みます。", ko: "연결과 물류, 공공 정보 경로를 현재 정책 사실과 분리된 큐레이션 맥락으로 읽습니다.", ru: "Связи, логистика и пути к публичной информации, отделённые от актуальных политических фактов.", ar: "روابط ولوجستيات ومسارات للمعلومات العامة منفصلة عن حقائق السياسات الحالية." }} background="/assets/index-backgrounds/free-trade-port.png" items={freeTradePortExhibits.map((exhibit, index) => ({ id: exhibit.id, title: exhibit.title, introduction: exhibit.introduction, status: immersiveIndexStatus.project, media: exhibit.asset, fallback: exhibit.fallback, accent: ['slate', 'blue', 'olive', 'gold'][index % 4] as 'slate' | 'blue' | 'olive' | 'gold', onOpen: () => select(exhibit) }))} />
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
