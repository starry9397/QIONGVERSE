# Module Guide 23: Free Trade Port Immersive Hall

## Goal and narrative boundary

The route #free-trade-hall is the public-information orientation layer for HAINAN QIONGVERSE. Hainan Province remains the narrative subject; this hall uses a project-curated visual world to invite visitors to read connection, logistics, public-information pathways and outward-looking exchange.

English is the default and Chinese is synchronized. Luoyin remains a fictional guide layer, not an official spokesperson. The four visual records are project-supplied curatorial assets and do not establish policy outcomes, customs treatment, tax treatment, investment eligibility, commercial availability, prices, schedules or partnerships.

## Assets and fallback

| Asset | Use | Status | Failure path |
| --- | --- | --- | --- |
| public/assets/3d/zimaogang/zimaogang.spz | Route-loaded primary Gaussian-splat world | Project-supplied visual asset | zimaogang.jpg |
| public/assets/3d/zimaogang/zimaogang.jpg | Static SPZ fallback | Project-supplied visual asset | Text, index and controls remain usable |
| port-connection.jpg | Port Connection exhibit | Project-supplied curatorial asset | Static hall image |
| bonded-logistics.jpg | Bonded Logistics exhibit | Project-supplied curatorial asset | Static hall image |
| smart-customs.jpg | Smart Customs exhibit | Project-supplied curatorial asset | Static hall image |
| open-exchange.jpg | Open Exchange exhibit | Project-supplied curatorial asset | Static hall image |
| Luoyin desktop and mobile GLB | Optional third-person guide | Project-curated static guide asset | Free camera remains available |

Source assets remain in the project library. No unrelated hall model or video is reused.

## Interaction and accessibility

- SPZ, Spark and Three dependencies load only after the immersive route is entered.
- WebGL 2 failure, request failure, initialization failure and the 12-second timeout switch to the static image.
- Exhibit anchors are visible in the world and mirrored in a keyboard-accessible bottom strip; details open from pointer, touch, Enter and Space.
- Details contain bilingual title, project-asset label, scoped description, limitation note, official Hainan Free Trade Port English portal link and Luoyin context action.
- Escape, close button and backdrop close the detail sheet. Mobile uses a bottom sheet and an internally scrolling exhibit strip.
- Reduced motion uses a static highlight instead of relying on pulse animation.

## Luoyin third-person rules

Luoyin is hidden by default and loaded only after explicit activation. The freeTradePort avatar configuration uses an independently calibrated spawn, floor, safety rectangle, model height, camera target and orbit distance. The SPZ has no navigation mesh; the rectangle and authored ground are an explicit safety approximation, not a claim of physical collision.

Mouse or touch drag changes camera yaw and limited pitch only. The camera remains upright, inside the safety rectangle and aimed at Luoyin. The avatar stays upright; W moves away from the camera and S toward it, with smooth turns only while moving. A and D, arrows, Shift sprint and Space hop are supported. Hiding Luoyin restores free Spark camera and the exhibit strip. Static fallback does not show a scene-misaligned avatar.

No camera permission, MediaPipe, browser storage, position persistence or browser API key is used. Existing guide, lead and handoff routes remain unchanged.

## Source boundary and acceptance

The reviewed Hainan Free Trade Port English portal at https://en.hnftp.gov.cn/ is a starting point for current public notices and policy materials. It does not decide individual eligibility, tax treatment, customs clearance, visa outcomes, investment approval, commercial availability or project-asset authenticity. No page copy may imply government affiliation, approval, sponsorship, booking, order, price, inventory or partnership.

Acceptance checklist:

- [ ] The immersive route opens directly and the two homepage entries reach it.
- [ ] SPZ is lazy-loaded and falls back cleanly to the static image.
- [ ] Four image exhibits open, close and retain bilingual text in static mode.
- [ ] Official source link and Luoyin context action remain available after failure.
- [ ] Luoyin is opt-in, upright, grounded, bounded, non-flipping and supports keyboard movement, sprint and hop.
- [ ] The exhibit strip hides only while Luoyin is ready and returns when hidden.
- [ ] Mobile and desktop layouts have no horizontal overflow.
- [ ] Build, server self-test, Node syntax check and git diff check pass.

Next module: improve exhibit-aware Luoyin knowledge context for public-information questions; do not add real approvals, transactions, identity qualification or camera services.
