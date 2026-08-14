# Module Guide: Dongfang Rosewood Immersive Hall MVP

## Goal and visitor path

- Build `#huali-hall` as the fourth of the five HAINAN QIONGVERSE halls. Visitors enter a wood-grain archive, select a visible exhibit, read its bilingual context, optionally examine a concept model, ask Luoyin, and return to the five halls.
- English is the default and Chinese is synchronized. The module extends the Hainan Province narrative through a quiet, material-led reading experience, not a retail or authentication service.

## Content boundary

- The SPZ world, fallback image, four image exhibits, and their captions are project-supplied curatorial assets. They are not evidence of a named collection, maker, date, provenance, wood species, authenticity, price, inventory, or commercial availability.
- The three GLBs have `needs-review` QA records and are labelled `AIGC concept exhibit / AIGC 策展概念展品`; they are not real furniture, antiques, historical objects, or material-identification tools.
- ShellSong and Luoyin remain fictional guide layers. No partnership, official endorsement, policy claim, booking, sales, lead storage, camera, or new API is added.

## Materials and fallbacks

| Material | Role | Fallback | Status |
| --- | --- | --- | --- |
| `assets/3d/huali/countryside world.spz` | Route-loaded immersive world | `东方花梨展厅参考图.png` | Project asset |
| `assets/3d/huali/东方花梨展厅参考图.png` | WebGL/load/timeout fallback | Exhibit index remains usable | Project asset |
| Tree-slice, carving, furniture and incense images under `assets/user-media2/huali-*` | Visible image exhibits and reading sheets | Hall reference image | Project asset |
| `assets/3d/products/huali/product-huali-00x-web.glb` | On-demand model preview | Matching poster image and reading text | AIGC concept, needs review |

- The SPZ loads only in `#huali-hall`, uses a 12-second timeout, and releases the renderer and splat on exit.
- WebGL 2 failure, initialization failure, load failure, and timeout use the static image without disabling browsing. Model failure never blocks reading.

## Visual and interaction system

- Use deep wood ink, resin amber, muted copper, and Shell Paper reading sheets. Protect the central tree-ring composition; avoid purple/pink gradients, fabricated dashboards, stacked cards, prices, ratings, or certification marks.
- World clicks, exhibit activation, and Enter/Space on the world create a wood-ring resonance pulse. With reduced motion, use a static amber focus ring and selected state.
- Mouse drag, wheel/pinch, WASD/arrow keys, keyboard buttons, and touch remain available. Concept previews use drag-to-rotate and wheel/pinch-to-zoom. No camera or gesture permission is requested.
- Detail sheets close by Escape, close button, or backdrop. The mobile rail scrolls inside its own container and no state depends on animation.

## Acceptance and next action

- Verify direct route, menu and zone entry, return to the fourth hall, seven exhibit details, SPZ success, static fallback, model fallback, bilingual text, keyboard and touch access, responsive 320/375/768px layouts, no API key or browser storage, and no unsupported factual or commercial claims.
- Run `npm run build`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`.
- Next module: Beautiful Villages immersive hall, unless the project receives reviewed material sources that justify a future factual wood-origins layer.
