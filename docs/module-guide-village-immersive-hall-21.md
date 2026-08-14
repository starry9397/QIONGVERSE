# Module Guide: Beautiful Villages Immersive Hall MVP

## Goal and visitor path

- Build `#village-hall` as the fifth HAINAN QIONGVERSE hall. Visitors enter a landscape archive, choose a visible village study or concept object, read bilingual context, optionally ask Luoyin, and return to the five halls.
- English is the default and Chinese is synchronized. The room supports Hainan Province cultural and landscape orientation, not site verification, booking or commercial service.

## Content and source boundary

- The SPZ world, reference image and village photographs are project-supplied curatorial assets. They are not official surveys, current site conditions, route maps, safety notices, ownership records, vendor listings or guarantees.
- The three GLBs are labelled `AIGC concept exhibit / AIGC 策展概念展品` and `needs review / 待审核`. They are not real buildings, heritage objects, architectural plans, property listings or products.
- ShellSong and Luoyin remain fictional guide layers. No partnership, certification, price, inventory, order, camera, storage or new API is added.

## Materials and fallback

| Material | Role | Fallback | Status |
| --- | --- | --- | --- |
| `assets/3d/countryside/countryside world.spz` | Route-loaded immersive world | `美丽乡村参考图.png` | Project asset |
| `assets/3d/countryside/美丽乡村参考图.png` | WebGL/load/timeout fallback | Index remains usable | Project asset |
| Village banner, sand-table, market and terrace images | Reading exhibits | Hall reference image | Project asset |
| `assets/3d/products/village/product-village-00x-web.glb` | On-demand model preview | Matching poster and text | AIGC concept, needs review |

The SPZ loads only after `#village-hall` is opened. WebGL failure, initialization failure, request failure and the 12-second timeout switch to the static reference view while keeping the index, detail sheets, keyboard, touch and Luoyin actions available.

## Interaction and accessibility

- Mouse drag, wheel/pinch, WASD/arrow keys, touch and visible exhibit navigation remain available in both SPZ and fallback modes.
- World and exhibit activation create a soft landscape pulse. `prefers-reduced-motion` changes this to a static focus/highlight state.
- Model previews load GLBs on demand and support drag rotation plus wheel/pinch zoom. Failed models show their poster.
- Detail sheets close with Escape, the close button or backdrop. The mobile exhibit rail scrolls inside its own container; no page-wide horizontal overflow is allowed.
- No camera or gesture permission is requested. No browser storage is used. API keys never enter the browser.

## Acceptance and next module

- Verify direct route, menu and fifth-zone entry, return to the five halls, seven exhibit details, SPZ success, static fallback, model fallback, bilingual text, keyboard/touch access, 320/375/768px layouts, no API key or browser storage, and no unsupported factual or commercial claims.
- Run `npm run build`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`.
- After this module, prioritize contextual knowledge-layer improvements for Luoyin before adding real operations, booking or site data.
