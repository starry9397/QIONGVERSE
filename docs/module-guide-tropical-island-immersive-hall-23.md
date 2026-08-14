# Tropical Island Immersive Hall / 热带海岛厅

## Module goal

The tropical hall presents a project-curated island visual world for Hainan Province. The English-first path is: enter the island hall, read the spatial scene, select a visible image exhibit, then ask Luoyin for contextual guidance. The hall is an orientation layer, not a booking, route, facility, menu, or current-condition service.

## Asset boundary

| Asset | Use | Status | Failure fallback |
| --- | --- | --- | --- |
| public/assets/3d/tropical/tropical-island-world.spz | Route-loaded Gaussian-splat world | Project-supplied visual asset | tropical-island-reference.png |
| public/assets/3d/tropical/tropical-island-reference.png | Static hall view | Project-supplied visual asset | Text, index and Luoyin remain usable |
| public/assets/exhibits/tropical/waterline-play.png | Waterline Play exhibit | Project-supplied curatorial asset | Static hall reference |
| public/assets/exhibits/tropical/shore-rest.png | Shore Rest exhibit | Project-supplied curatorial asset | Static hall reference |
| public/assets/exhibits/tropical/canopy-path.png | Canopy Path exhibit | Project-supplied curatorial asset | Static hall reference |
| public/assets/exhibits/tropical/tropical-table.png | Tropical Table exhibit | Project-supplied curatorial asset | Static hall reference |

The source files in assets/3d world/haidao/ and assets/user-media2/haidao pictures/ remain unchanged. Runtime files use stable paths under public/assets.

## Content and language rules

- Every image is labelled as a project-supplied curatorial asset.
- Captions must not claim a real resort, facility, route, activity schedule, menu, price, inventory, booking channel, official photograph or current site condition.
- English is the default display language; Chinese is updated through the existing language toggle.
- Luoyin is a fictional project guide layer and must not be described as an official guide, historical person or tourism operator.

## Interaction states

- The home route does not request the tropical SPZ. The SPZ is requested only after the tropical hall mounts.
- WebGL 2 absence, SPZ request/init failure and the 12-second timeout switch to the static reference image.
- The world supports shared Z-up drag orbit, limited pitch, wheel/pinch zoom, keyboard activation and tide pulse feedback.
- The exhibit index remains available in static mode. Image details open from the strip or index and close with Escape, the close button or the backdrop.
- Luoyin is hidden by default and loads only after explicit activation. When ready, the exhibit strip is hidden to preserve the scene; hiding Luoyin restores it.
- Luoyin uses the shared third-person controller: WASD/arrows walk, Shift sprints, Space performs a short hop, pointer drag orbits, and wheel/pinch changes distance.
- The tropical avatar configuration uses an explicit floor and rectangular safety bounds; it does not claim object-level collision because SPZ has no navigation mesh.
- prefers-reduced-motion replaces animated tide particles with a static highlight. The feedback is decorative and never the only information channel.

## Privacy and security

- No camera, MediaPipe, localStorage, sessionStorage or position persistence is used.
- No new API endpoint or browser-side API key is introduced.
- Ask Luoyin continues through the existing guide drawer and /api/luoyin boundary.

## Acceptance checklist

- Direct tropical hall hash access opens the hall without loading SPZ on the home route.
- SPZ success supports orbit, pitch limits, zoom, keyboard activation and tide feedback.
- SPZ/WebGL failure leaves the reference image, index, image details, Luoyin entry and return button usable.
- All four images open with bilingual title, introduction, boundary note and project-asset label.
- Luoyin remains optional, upright, bounded and compatible with the existing walk/sprint/hop controls.
- 320px, 375px, 768px and desktop layouts have no page-level horizontal overflow.
- Build, server self-test, Node syntax check and diff whitespace check pass.

## Next module

Future work can add reviewed island sources or additional project assets. It must preserve the separation between visual curation and verified tourism or facility information.
