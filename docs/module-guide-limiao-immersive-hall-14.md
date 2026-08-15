# Module Guide: Li & Miao Immersive Hall / 黎苗沉浸展厅

## 1. Module goal

- Module name: Li & Miao Immersive Hall / 黎苗沉浸展厅.
- Visitor task: enter from the five cultural-hall Hainan archive, freely explore a 3D visual world, select a visible exhibit, receive a tactile particle response, and read or watch the associated bilingual material.
- Project relationship: this is a province-level cultural exploration room inside HAINAN QIONGVERSE. Hainan Province is the primary visitor frame; Dongfang may remain only where the supplied media creates a local scene.
- Foreign-user path: English default -> Li & Miao Heritage -> immersive hall -> visible exhibit strip or 3D hotspot -> image, video, or concept-model reading sheet -> return to the five cultural halls or Luoyin. Chinese is synchronized for every visitor-facing state.

## 2. Content boundaries

### Must appear

- A clearly labeled 3D exploration space, visible exhibit controls, static media fallback, and bilingual descriptions.
- The UNESCO Li textile source link only for broad orientation to Li traditional textile techniques.
- Three GLB exhibits visibly labelled `AIGC concept exhibit / AIGC 策展概念展品`.
- A clear distinction between reviewed source, project-provided material, AIGC concept, and ShellSong fiction.

### Must not appear

- Unsupported Miao historical or ethnographic claims; Miao-related material remains `project-provided curatorial context` until independently reviewed.
- A claim that project imagery, Gaussian splats, or AIGC concept models are real historic objects, authentic products, official documents, or commercial inventory.
- Prices, availability, orders, reviews, guarantees, partnerships, government endorsement, policy claims, or a fifth cultural zone.
- Camera uploads, camera storage, GLM camera input, API keys, or hidden camera activation.

### Out of scope

- No face recognition, user identity tracking, motion recording, live commerce, real handoff, policy advice, external media download, or new service endpoint.

## 3. Material rules

| Material | Use | Status and processing | Fallback |
| --- | --- | --- | --- |
| `assets/3d/limiao/limiao world.spz` | Primary Gaussian-splat exploration scene | User/project supplied visual context; dynamically fetched only inside the hall | Hall banner and readable controls |
| `assets/user-media2/limiao-hall-banner-01.jpg` | Hall visual fallback and reading material | Project-provided | `limiao-pattern-poster.jpg` |
| `assets/user-media2/limiao-pattern-poster.jpg`, `brocade-pattern.jpg` | Image exhibits | Project-provided curatorial context | Each other |
| `assets/3d/products/lijin/product-lijin-00X-web.glb` | On-demand concept object preview | QA: `needs-review`, `AIGC concept`; no factual or commercial claims | matching model poster |
| `assets/video/products/product-lijin-00X-loop.mp4` | Visitor-initiated video exhibit | Project-provided; `preload=metadata`; no autoplay audio | matching poster and reduced webp |
| UNESCO Li textile page | Source orientation link | Reviewed primary source; brief link attribution only | Scope and limitation shown locally |

- CSS cropping and responsive compression are permitted; source media is not overwritten or regenerated.
- All 3D and video assets load only after their corresponding hall or detail sheet opens.

## 4. Visual system

- Direction: an after-dark Hainan archive becomes a woven field of light: dark mangrove teal scene, Shell Paper reading sheets, Shell Gold particles and source markers, Coral Clay only for decisive actions.
- Typography: existing display serif for room/exhibit names; existing readable sans for detail; mono labels for source and interaction state.
- Layout: immersive full-viewport canvas with an accessible editorial overlay; the detail sheet is one reading surface rather than a card stack. Mobile changes controls into a bottom reading rail.
- Avoid purple-pink gradients, generic sci-fi HUD clutter, fake data, stylized historical claims, card nesting, and decorative animation without a visitor action.

## 5. Interaction and states

- Default: SPZ loading state with visible fallback image; mouse/touch/keyboard controls always available.
- Click/tap/hotspot: Shell Gold tide-pulse particle ring, corresponding exhibit highlight, then a detail sheet. Reduced motion uses a static highlight and live text feedback instead.
- Keyboard: Tab reaches exit, Luoyin, visible exhibits, and sheet controls; Enter/Space opens; Escape closes the sheet or hall. Arrow keys and WASD move the camera where focus is not in an input.
- Touch: drag rotates, pinch zooms, tap selects; every action control is at least 44px.
- Retired interaction note: the former camera-based hand-control proposal was removed. The live hall now uses mouse, touch, keyboard, and optional third-person controls only.
- States have explicit text: loading, ready, unavailable, denied, paused, reduced motion, media error, and source status.
- Luoyin is `focus / 专注` in the room and can open the current exhibit context, but does not receive camera data.

## 6. Technical constraints

- React + Vite + TypeScript, dynamically imported `three@0.180.0` and `@sparkjsdev/spark@2.1.0`.
- SPZ uses Spark; GLBs use Three GLTFLoader only when a model sheet is opened.
- A canvas particle layer responds to the visitor pointer and supports throttled mobile performance; its loop pauses when the page is hidden.
- No client API key, storage, cookie, new API route, user telemetry, camera persistence, `localStorage`, or `sessionStorage`. Existing GLM boundary stays unchanged.
- WebGL or media failure keeps the gallery and textual details usable; no camera pipeline is present.

## 7. Internationalization

- English default and Chinese synchronized. Long English titles wrap within container boundaries.
- Use `Li traditional textile techniques / 黎族传统纺织技艺`, `AIGC concept exhibit / AIGC 策展概念展品`, and `project-provided curatorial context / 项目提供的策展语境` consistently.
- Do not machine-translate Chinese cultural terms into a historical claim; give foreign visitors the source and scope they need.

## 8. Acceptance criteria

- Hall route, entry from Li & Miao zone, exit, language state, Luoyin entry, gallery, detail sheets, video fallback, model fallback, and official UNESCO source link work.
- SPZ and GLB bundles do not load on the home route.
- Pointer/touch particle feedback works; no-movement path remains meaningful.
- Camera is never requested until explicit activation; denied/unavailable camera preserves controls and stops tracks on close.
- Four original cultural zones are unchanged; no forbidden commercial, policy, partnership, or unsupported cultural claims are introduced.
- Desktop, 768px, 375px and 320px show no horizontal overflow; keyboard focus is visible; console has no errors.
- `npm run build`, `npm run test:server`, `node --check server.mjs`, asset scan, secret scan, storage scan, and forbidden-text scan pass.

## 9. Self-check and next action

- The guide has no contradiction between 3D-first exploration and static accessibility; camera remains optional; factual Li content stays source-bound; project/AIGC material remains labelled.
- Pause only before a request for a new cultural source, real camera processing service, facial data, API key exposure, real commerce, or policy advice.
- After acceptance, the next module is exhibit-aware Luoyin knowledge context, not a real operating or commerce workflow.
