# Module Guide: Homepage Load Latency Without 3D Regression

## Scope

Reduce perceived and measured initial loading time for HAINAN∞QIONGVERSE at
`#top` while preserving the existing Hainan Province narrative, six halls,
seven-language system, desktop pet, source desk, social sharing, and all
ShellSong 3D presentation behavior.

## User task and route boundary

- The first visit should render the hero, navigation, and exhibition wheel
  without waiting for below-fold map code, experience pages, SPZ worlds, GLB
  models, gesture runtime, or route videos.
- Direct `#hainan-map` must still render and focus the map section after its
  component is loaded.
- Direct `#luoyin-tide` must still load the selected ShellSong GLB and Draco
  decoder only on that route; this optimization must not replace, remove, or
  downgrade the 3D model.
- Existing Hash routes and browser back/forward behavior remain unchanged.

## Asset and delivery policy

- Prefer existing project assets and non-destructive delivery derivatives.
- The hero may use a documented smaller delivery derivative only when its
  composition remains unchanged and the original remains available as the
  fallback.
- No external CDN, map service, tracking SDK, API, browser storage, camera or
  microphone permission is introduced.
- No SPZ, GLB, video, gesture, or route-specific asset may be requested by the
  initial `#top` route merely because it is present in the repository.

## Accessibility, language, and failure behavior

- Preserve all seven languages, RTL behavior, keyboard navigation, visible
  focus, reduced-motion behavior, meaningful image alternatives, and static
  fallbacks.
- Lazy or deferred resources must retain a readable loading/error state. If a
  delivery derivative fails, the existing original asset path remains usable.

## Verification gate

Run `npm run build`, `npm run prepare:pages`, `npm run check:i18n`,
`npm run test:server`, `node --check server.mjs`, and `git diff --check`.
Inspect the initial `#top` resource waterfall and confirm no ShellSong GLB,
Draco, SPZ, gesture runtime, or route video requests occur. Then verify direct
`#luoyin-tide`, `#hainan-map`, and all six hall routes still load their intended
3D or static fallback content.
