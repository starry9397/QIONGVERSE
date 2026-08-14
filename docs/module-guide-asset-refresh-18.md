# Module Guide: Asset Refresh / 素材库刷新

## 1. Module objective

- Keep the existing QIONGVERSE page layout, component boundaries, routes, interactions, type scale, color tokens and responsive rules unchanged.
- Refresh only local visual asset references in the hero, four-zone exhibition, Free Trade Port reading room, archive note and Li & Miao immersive hall.
- Use the asset library's `safe`, `clean`, `wide`, `portrait`, poster and reduced variants according to viewport and failure state.
- Foreign-user path remains unchanged: English-first homepage -> four-zone exhibition -> reading room or immersive hall -> bilingual detail and Luoyin guidance.

## 2. Content boundaries

- Runtime assets must be local project files only. Do not add remote images or infer provenance from generated signage inside source images.
- Do not present image text, pseudo signage, generated labels or stylized room names as official institutions, historical records, government marks or policy facts.
- Keep exactly four cultural zones: Tropical Coast, Li & Miao Heritage, Dongfang Rosewood and Beautiful Villages.
- Keep the Free Trade Port visual as project-supplied context; the official portal remains the factual source.
- This module does not change copy, source claims, commerce, API behavior, camera behavior, 3D behavior or navigation.

## 3. Asset usage rules

- Hero: use `assets/hero/hero-dongfang-showroom-safe.webp` on desktop, `hero-dongfang-showroom-portrait.webp` on mobile, and `hero-dongfang-showroom-loop-poster.webp` on image failure.
- Four zones: use each zone's `*-clean.webp` desktop image, existing `*-portrait.webp` mobile image, and matching loop poster fallback.
- Zone detail banners, Free Trade Port reading image and archive note keep their existing local `user-media2` paths.
- Li & Miao immersive world keeps `assets/3d/limiao/limiao world.spz`; its static fallback remains `limiao-hall-banner-01.jpg`.
- Li & Miao reading layer keeps the selected `zones/lijin` wide/portrait images.
- Three Li brocade models keep their GLB files, use matching `assets/3d/products/lijin/*-poster.webp`, and use matching `product-lijin-*-loop-reduced.webp` for video failure.
- Do not load source PNGs in runtime; they remain review references only.
- CSS may crop with existing `object-fit` behavior; do not regenerate, recolor or alter aspect-ratio rules.

## 4. Visual and interaction constraints

- Preserve the existing Shell Paper / dark teal archive visual system and all current layout proportions.
- Preserve existing hover, focus, active, loading, error, keyboard, touch, reduced-motion, WebGL, video and model states.
- Asset failure must leave the existing title, copy, source labels and fallback media usable.
- Do not add new cards, sections, controls, animation, autoplay or media preload behavior.

## 5. Technical and internationalization constraints

- React + Vite + TypeScript; only data/reference paths may change.
- No API key, user data, camera frame or new persistence.
- English remains default and Chinese remains synchronized through existing state.
- No new facts or translations are introduced by this module.

## 6. Acceptance criteria

- Hero and all four zone data objects reference the selected safe/clean/portrait/poster assets.
- Existing detail banners, Free Trade Port image, archive note and Li & Miao world remain available.
- All referenced local files exist and browser requests resolve.
- Desktop and mobile picture sources remain selected by the existing `<picture>`/data flow.
- No layout, CSS token, route, interaction, API or language behavior changes are introduced.
- `npm run build`, `npm run test:server` and `node --check server.mjs` pass.
- 320px, 375px, 768px and desktop have no horizontal overflow.
- Home bundle does not contain SPZ, GLB or Li model video paths.
- No new unsupported historical, policy, partnership or commercial claim appears.

## 7. Next action

- After implementation, inspect the homepage, four zones, Free Trade Port reading room and Li & Miao index in the browser.
- Pause if a replacement asset requires a new provenance claim or a new page/layout decision.
- After acceptance, continue with the next planned knowledge-layer improvement.
