# Module Guide: Tide Archive Virtual Exhibition MVP

## 1. Goal

- Build a browser-rendered virtual exhibition entry for HAINAN∞QIONGVERSE / 琼境.
- Let an international visitor enter the exhibition, switch among four Dongfang content zones, read bilingual context, view local media, and open Luoyin's local guide panel.
- Carry the museum-like information architecture of the Henan Museum reference into a distinct Dongfang night-archive visual language.
- Primary journey: Home -> Virtual Exhibition -> Zone -> Media / context -> Luoyin guide -> return to site navigation.

## 2. Content boundaries

- Required zones: Tropical Coast, Li & Miao Heritage, Dongfang Rosewood, Beautiful Villages.
- No aerospace content, no fifth zone, no fabricated attractions, prices, stock, reviews, government endorsements, or commercial results.
- Reality layer uses supplied visual assets and cautious descriptive copy. ShellSong Myth is explicitly labeled as fictional world-building. AI Suggestion is local mock content only in this module.
- Out of scope: real GLM API, CRM, payment, policy automation, user accounts, inventory, and external asset downloads.

## 3. Asset rules

- Use existing files under `assets/hero`, `assets/zones`, `assets/user-media2`, `assets/video/zones`, `assets/luoyin`, and `assets/brand`.
- Hero uses the supplied Dongfang showroom image; each zone uses its supplied wide image plus a relevant hall banner/poster and local loop video poster.
- Desktop uses wide assets; mobile uses portrait/reduced assets where available. Every video has a poster and every media block has an image fallback.
- Assets are user-provided or project-provided; no new third-party material is introduced. AIGC concept status remains visible where applicable.
- Cropping is limited to `object-fit: cover` presentation; source files remain untouched.

## 4. Visual system

- Direction: digital museum archive after sunset, with shell paper reading surfaces and a restrained coral signal.
- Tokens: Mangrove Teal `#102A2C`, Shell Paper `#F4EFE3`, Coral Clay `#C77B4A`, Shell Gold `#E8C987`, Ink `#182022`, deep night `#081416`.
- Display typography uses a characterful serif stack; body uses readable system sans; utility labels use a compact mono stack.
- Layout uses a 12-column desktop frame, 8px spacing rhythm, 4px radius for media frames, and no card-within-card nesting.
- Logo is referenced as a real SVG wordmark in the navigation and footer; no CSS imitation.
- Avoid purple gradients, generic SaaS cards, fake statistics, decorative badges, repeated eyebrow-title-copy stacks, and spectacle-only motion.

## 5. Interaction and states

- Default zone is Tropical Coast; zone tabs are keyboard reachable and have hover, focus-visible, active, loading and error states.
- Arrow keys switch zones when the zone navigation is focused; touch uses horizontally scrollable tabs.
- Luoyin opens as a compact guide drawer. It supports local mock prompts, loading state, and an offline fallback message.
- Luoyin states: listening for normal browse, focus for culture, resonance for rosewood, celebration after a zone is visited, sleeping only as a visual label.
- Motion communicates entering the exhibition, changing zones, and opening the guide. Reduced motion removes transforms and keeps content order intact.

## 6. Technical constraints

- React + Vite + TypeScript with componentized data-driven rendering.
- Zone data is a typed local array. No API key or secret is present in the client.
- Videos use `preload="none"`, poster images, and a static fallback caption. 3D is represented by a future-ready placeholder panel in this MVP; no large GLB is loaded yet.
- WebGL, video, or image failure never prevents reading the zone text.
- No `scrollIntoView`; navigation uses `window.scrollTo` with a measured section offset.

## 7. Internationalization

- English is the default render language. Chinese is a synchronized alternate, not a machine-translated afterthought.
- Every zone title, description, CTA, and guide response has both language values.
- Copy uses short lines and `text-wrap: pretty`; long English labels must wrap rather than overflow.
- Cultural names remain consistent: Li & Miao Heritage, Li brocade, Dongfang Rosewood, Beautiful Villages, Luoyin / 螺音.

## 8. Acceptance

- Functional: enter exhibition, switch all four zones, toggle language, open/close Luoyin, submit a local mock question, return to top.
- Content: no aerospace term, exactly four zones, no unsupported factual claims, clear reality/myth/AI labels.
- Visual: real logo and supplied assets visible, stable hierarchy, no generic gradient hero or card grid overload.
- Responsive: no horizontal overflow at 375, 768, 1280, and 1440px; touch targets remain usable.
- Accessibility: semantic buttons, visible focus, labelled media, keyboard zone switching, readable contrast, reduced-motion path.
- Performance: lazy zone video, poster-first loading, no GLB on initial render.
- Source safety: `rg -n "文昌航天|航天|aerospace|spaceport"` must return no page/source match after implementation.

## 9. Next action

- After implementation, run type/build checks, search the forbidden terms, inspect the rendered page at desktop and mobile sizes, and verify asset URLs.
- Pause for user confirmation only if a real source, policy fact, identity asset, or API contract is required; none is required for this MVP.
- Next module after acceptance: server-side Luoyin/GLM proxy with verified knowledge context and human handoff.
