# Module Guide: Li & Miao Asset Curation / 黎苗展厅素材编排

## 1. Module objective

- **Module:** Li & Miao asset refresh for the immersive world and its second-layer reading rooms.
- **Visitor task:** enter `#limiao-hall` into an uncluttered 3D world, then open a separate reading layer to explore Pattern Field, Weaving Reading Room, Woven Light and three concept objects.
- **Narrative role:** the world is the threshold into Hainan Province's cultural exploration; the reading layer gives foreign visitors a calm, explicit route to media and source labels.
- **Foreign-user path:** immersive world -> `Explore pattern & reading rooms` -> choose a labelled image or concept object -> bilingual reading sheet -> ask ShellSong / return to world.

## 2. Content boundaries

- Must include exactly six supplied Li & Miao exhibits: two reading images, one hall image and three AIGC concept objects with companion videos.
- Do not add a fifth cultural zone, aerospace exhibition, price, stock, booking, order, tourist rating, partner logo or official endorsement.
- Li textile context is limited to the linked UNESCO page. Miao references remain project-provided curatorial context unless independently reviewed later.
- ShellSong is a fictional digital guide; it is not a historical narrator or government representative.
- Every supplied image is labelled `Project-supplied asset`; every GLB is labelled `AIGC concept exhibit`, never a historic object or retail item.
- This module does not create new APIs, persistence, commercial handoff, identity tracking or camera uploads.

## 3. Asset rules

| Asset | Use | Source status | Fallback | Handling |
| --- | --- | --- | --- | --- |
| `assets/3d/limiao/limiao world.spz` | First-layer immersive visual world | Project asset | `limiao-hall-banner-01.jpg` plus text | Load only in the hall route; no crop or regeneration |
| `assets/zones/lijin/zone-lijin-wide.webp` | Pattern Field reading image | Project asset | `limiao-pattern-poster.jpg` | Responsive WebP; crop only through CSS `object-fit` |
| `assets/zones/lijin/zone-lijin-portrait.webp` | Weaving Reading Room image | Project asset | `brocade-pattern.jpg` | Responsive WebP; crop only through CSS `object-fit` |
| `assets/user-media2/limiao-hall-banner-01.jpg` | Woven Light and WebGL fallback | Project asset | `limiao-pattern-poster.jpg` | May be compressed for delivery, not recoloured into a historical claim |
| `assets/3d/products/lijin/*-poster.webp` | AIGC object index thumbnails and GLB fallback | AIGC concept exhibit | matching video reduced poster | No misleading physical-product caption |
| `assets/3d/products/lijin/*-web.glb` | On-demand model preview | AIGC concept exhibit | matching static poster | No preloading in the home route |
| `assets/video/products/product-lijin-*-loop.mp4` | User-initiated companion moving study | AIGC concept exhibit | matching `-reduced.webp` | Poster required; no sound autoplay |

- Desktop uses the wide reading asset; narrow layouts preserve each image through `object-fit: cover` with descriptive text outside the crop.
- Asset failures must keep the title, label, bilingual copy, source limitation and an alternative still image visible.
- All files are project-supplied; no third-party image is introduced in this module.

## 4. Visual system

- Direction: a deep-teal night archive for the world, followed by a Shell Paper editorial reading layer.
- Tokens: deep teal `#061c1e`, Shell Paper `var(--paper)`, Shell Gold `var(--gold)`, Coral Clay `var(--coral)`, Ink `var(--ink)`.
- Type roles: display serif for room names, Manrope body copy, DM Mono for state and source labels.
- The world uses one left reading overlay and one restrained control stack. The second page uses a single editorial list, not nested cards.
- Logo remains the existing QIONGVERSE wordmark in the persistent header.
- Avoid purple/pink gradients, generic travel tiles, artificial statistics, excessive hotspots and decorative HUD chrome.

## 5. Interaction and states

- Default: first layer opens as the 3D world; a world click produces an optional tide pulse without opening media.
- The visible `Explore pattern & reading rooms` action opens the second layer. Its reciprocal action returns to the world.
- Image, video and model selections open the accessible detail sheet. Hover/focus/active states remain visible; `Escape`, close button and backdrop close the sheet.
- Keyboard: Tab reaches all actions; Enter/Space activates them. Touch uses normal tap; model preview additionally supports drag and pinch.
- ShellSong is `focus` in this hall; its textual reply retains source class.
- Hand controls are opt-in: pinch selects/pulses, open palm explores, swipe changes the highlighted object, fist pauses decoration; in model detail, pinch scales and horizontal hand movement rotates. The help text stays short and visible on demand.
- Camera errors, permission denial and WebGL failure preserve mouse, touch, keyboard, still media and reading routes.
- Motion conveys feedback only. Under `prefers-reduced-motion`, tide movement becomes a short static gold highlight.

## 6. Technical constraints

- React + Vite + TypeScript, with route-level dynamic loading for Spark, Three, GLTFLoader and MediaPipe.
- SPZ lifecycle is bound to the world view. Switching to the reading layer must release requestAnimationFrame, WebGL canvas and splat resources.
- Switching to the reading layer must stop camera tracks, clear the invisible video binding and close the hand landmarker.
- GLB and video load only from a selected detail sheet; videos use `preload="metadata"` and a poster.
- No API key, camera frame, user question, intent or exhibit preference is written into browser storage, URL or logs.
- Do not replace static fallback with an unavailable external service.

## 7. Internationalization

- English is default; Chinese is synchronized through the existing language toggle.
- `Li textile techniques`, `Li & Miao`, `AIGC concept exhibit`, `Pattern Field` and `Weaving Reading Room` use consistent bilingual labels.
- Long English titles must wrap inside their containers, never cover media or controls.
- Context for foreign users explains source status rather than presenting unfamiliar terms as unqualified fact.

## 8. Acceptance criteria

- The hall opens into the immersive world; Pattern Field and Weaving Reading Room controls appear on the second layer.
- The second layer contains six entries, with valid image/video/GLB/poster/fallback paths.
- AGLB entries are visibly labelled AIGC concept exhibits.
- World-to-index and index-to-world transitions dispose/recreate the SPZ renderer cleanly.
- Hand gesture resources stop when leaving the world; denied camera permission leaves ordinary controls working.
- Detail sheets expose bilingual copy, clear source labels, fallback images and Luoyin context action.
- At 320px, 375px, 768px and desktop there is no horizontal overflow.
- `npm run build`, `npm run test:server` and `node --check server.mjs` pass; known API keys and browser storage calls are absent.
- User-facing route and source data contain no new Wenchang/aerospace exhibit, policy promise, fabricated partnership or commercial claim.

## 9. Next action

- After implementation, verify all new asset paths in the browser and reopen the world after visiting the reading layer.
- Pause for user confirmation if a newly supplied image needs an external provenance claim, a factual historical caption, a commercial use claim or a new exhibition domain.
- After acceptance, the next module is Luoyin exhibit-context injection and source-reference display.
