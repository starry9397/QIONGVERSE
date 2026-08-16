# Module Guide: Homepage Performance

## Scope

Improve first-load performance for the existing HAINAN∞QIONGVERSE homepage
without changing its narrative, routes, six halls, seven-language copy, source
boundaries, desktop pet, or independent ShellSong/Travel/Market experiences.
The task is visitor-perceived loading speed at `#top` and direct `#hainan-map`;
it is not a redesign or a removal of project media.

## User task and route boundary

- The homepage must present the current hero and active exhibition hall quickly.
- Below-fold Hainan Map and three experience-entry media must remain available,
  but should not compete with the first viewport for bandwidth.
- SPZ, GLB, gesture runtime, videos, chat data, and route chunks remain
  route-scoped and must not be preloaded on `#top`.

## Asset policy

Create only non-destructive, project-supplied thumbnail derivatives for the
five wheel navigation images. Keep the original full-resolution images for the
active hall carousel. WebP derivatives are visual delivery optimizations, not
new content, evidence, or AIGC claims. Preserve all existing poster/static
fallbacks and accessible text.

## Privacy, accessibility, and failure behavior

No new API, storage, tracking, browser permission, or third-party service is
introduced. Lazy images retain meaningful alt behavior and existing error
fallbacks. `prefers-reduced-motion`, keyboard wheel navigation, RTL layout, and
mobile breakpoints remain unchanged. If a derivative fails, the original image
path remains the fallback.

## Verification gate

Run `npm run build`, `npm run prepare:pages`, `npm run check:i18n`,
`npm run test:server`, `node --check server.mjs`, and `git diff --check`.
Inspect the public homepage resource waterfall: the initial route must not
request SPZ/GLB/large route videos, and below-fold map/experience images should
be deferred until needed. Verify direct `#hainan-map` still loads its map and
all six hall routes still load their original visual fallback and 3D resources.
