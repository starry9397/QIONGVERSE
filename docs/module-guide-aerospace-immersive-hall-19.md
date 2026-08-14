# Module Guide: Wenchang Aerospace Immersive Hall MVP

## Goal and visitor path

- Build `#aerospace-hall` as the third of the five HAINAN QIONGVERSE halls.
- English is the default and Chinese is synchronized. Visitors enter from the Wenchang Aerospace Hall, explore a 3D world or static fallback, choose an exhibit, read its context, ask Luoyin, and return to the five halls.
- The hall presents a project-curated launch horizon inside the broader Hainan Province narrative. It does not represent an official exhibition or an institutional partnership.

## Content boundary

- Use the China National Space Administration English portal only for general public aerospace background orientation. Do not state mission schedules, technical specifications, launch outcomes, ticketing, investment, eligibility, or commercial facts unless separately verified.
- The SPZ, reference image, console image, and five exhibit images are project-supplied curatorial assets. Their visual content is not evidence of official facilities, records, vehicles, or products.
- ShellSong and Luoyin remain fictional guide layers. No ShellSong language is presented as aerospace history.
- This module does not add booking, sales, leads, cameras, gesture recognition, persistent data, or a new AI endpoint.

## Materials and fallbacks

| Material | Role | Fallback | Status |
| --- | --- | --- | --- |
| `assets/3d/aerospace/aerospace world.spz` | On-demand immersive world | Static reference image | Project asset |
| `assets/3d/aerospace/文昌航天展厅参考图.png` | WebGL, load and timeout fallback | Remains readable with exhibit navigation | Project asset |
| `wenchang-hall-banner-01.jpg` and five space exhibit images | Index and reading images | Reference image | Project asset |
| `https://www.cnsa.gov.cn/english/` | General official background link | Publisher, scope and limitation note remain visible | Reviewed primary source |

- SPZ loading is route-triggered, has a 12-second timeout, cleans renderer resources, and never blocks the static reading path.
- Images may be cropped for responsive presentation but not represented as official material.

## Visual and interaction system

- Extension mode: preserve the HAINAN QIONGVERSE header, type roles, sharp reading sheets, responsive structure, language toggle and Luoyin pattern.
- Use deep-space ink, structural blue and restrained launch amber. No purple/pink gradient, fabricated dashboard, logo wall, score or data display.
- Central vertical launch composition is protected in the SPZ/static scene. The left overlay provides title and factual boundary; the right actions stay visible; the lower exhibit rail never depends on invisible 3D hotspots.
- Click or keyboard activation triggers an orbit pulse. With reduced motion, show a static focus ring/highlight instead.
- Mouse drag, wheel/pinch, WASD/arrow keys, keyboard buttons and touch remain available. No camera permission request occurs.

## Accessibility, security and acceptance

- All buttons have visible focus, reachable keyboard order and translated labels. Detail sheets close by Escape, close button or backdrop. Mobile rails scroll horizontally without page overflow.
- API keys remain server-only. No browser storage, camera, persistence, GLM route changes or source-desk simulation changes are permitted.
- Verify direct hash routing, five exhibit details, static fallback, source link, no SPZ eager load from home, no unrelated tropical media in the aerospace preview, responsive 320px/375px/768px layouts, `npm run build`, `npm run test:server`, `node --check server.mjs`, and secret/forbidden-claim scans.

## Next action

- After the implementation, verify the route and fallback in browser conditions. Pause for user direction before adding factual mission timelines, true model assets, video, gesture/camera input, sales flows, or new institutional claims.
