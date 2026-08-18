# Module Guide: Public Media Deployment Repair

## Scope and user task

This module repairs delivery of existing HAINAN∞QIONGVERSE media on the public
GitHub Pages deployment. The site remains a Hainan Province cultural exhibition
and public-information orientation layer, not a government service, booking
system, model marketplace, or media CDN product.

The user task is limited to restoring the already-authored ShellSong GLB
viewer and ShellSong/Travel video playback at the published URL. Existing Hash
routes, six halls, seven-language UI, gesture-camera consent, desktop pet,
source desk, social sharing, and static fallbacks remain unchanged.

## Asset and source boundary

- All existing files under `public/` are included in the production Pages
  artifact. The Vite bundle still removes only the unused high-resolution
  ShellSong source models; the checked-in web delivery models, worlds, videos,
  images and gesture assets remain available without changing their contents.
- Production Pages keeps the complete built media set in the Pages artifact.
  The checkout enables Git LFS before Vite copies `public/`, so large GLB,
  SPZ, MP4 and WASM files are uploaded as real bytes by the Pages origin.
  No Raw CDN or LFS pointer fallback is used for the production artifact. No
  upload, user media, remote scraping, analytics, or third-party tracking is
  introduced.
- The Pages checkout enables Git LFS so every tracked media blob is materialized
  before Vite copies `public/` into the artifact; the browser never receives an
  LFS pointer file.
- No API key, OAuth token, browser secret, camera stream, location, dialogue,
  or user profile data is included in the media URL configuration.
- The media remains project-supplied/AIGC-labeled where the existing page marks
  it so; restoring delivery does not turn it into an official fact or offer.

## Accessibility and failure behavior

The existing controls, keyboard operation, reduced-motion handling, captions /
alt text, and error messages remain authoritative. A failed media request must
still show the current poster/static reference and an understandable localized
failure state. Media loading is lazy and route-scoped as before.

## Verification gate

Run `npm run build`, `npm run prepare:pages` (large media is kept by default;
`VITE_PAGES_KEEP_LARGE_MEDIA=true` is an explicit equivalent), `npm run check:i18n`,
`npm run test:server`, `node --check server.mjs`, and `git diff --check`.
Inspect exact public HTTP responses for the ShellSong MP4, all seven ShellSong
GLBs, and the Travel MP4. Push only after the GitHub Pages workflow succeeds
and the public URLs return the expected media bytes and MIME-compatible content.
