# Module Guide: ShellSong GLB Delivery Repair

## Scope

Repair the ShellSong / Luoyin 3D model loading path on the static GitHub Pages
deployment. Keep the homepage, five-hall wheel, six immersive routes, travel,
market, desktop pet, seven-language system, and existing source boundaries
unchanged. Improve only the on-demand ShellSong GLB delivery and its explicit
failure state.

## User task and route boundary

- `#top` must not request any ShellSong GLB or related Three.js route chunk.
- `#luoyin-tide` must load only the selected model after the ShellSong route
  and model section are rendered.
- Switching model choices may replace the previous object, but must not load
  all seven GLBs at once.
- Original high-resolution GLBs remain in the repository as source assets;
  WebGL delivery derivatives are additive and are not new visual content.

## Asset and source boundary

- Delivery derivatives are generated from the existing project-provided GLBs
  with lossless scene/material structure preserved as far as the web format
  permits. They are project visual media, not evidence for cultural, policy,
  product, or commercial claims.
- GitHub Pages continues to omit very large files from its artifact. The
  production build may use the existing read-only Raw CDN base for only the
  ShellSong delivery derivatives; no new third-party runtime service is added.
- Failed model requests keep the existing labelled static fallback and do not
  silently substitute another Luoyin state.

## Privacy, accessibility, and performance

- No API, browser storage, camera, microphone, tracking, or user data changes.
- Model controls remain keyboard and pointer accessible, with visible focus and
  the current seven-language status text.
- Resource loading is route- and selection-scoped. The homepage waterfall must
  remain free of GLB requests, and no prefetch or preload of model files is
  introduced.

## Verification gate

Run `npm run build`, `npm run prepare:pages`, `npm run check:i18n`,
`npm run test:server`, `node --check server.mjs`, and `git diff --check`.
Validate every delivery GLB with a glTF validator or loader-level smoke check,
check public HTTPS responses and CORS headers, and confirm the direct
`#luoyin-tide` route loads a model while `#top` does not request one.
