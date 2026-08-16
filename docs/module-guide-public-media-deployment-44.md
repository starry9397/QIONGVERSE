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

- Only files already tracked under `public/shellsong/models`,
  `public/shellsong/video`, and `public/assets/travel` are addressed. The two
  `*-pages.mp4` files are non-destructive, 1280x720 H.264/AAC derivatives of
  the existing source videos, kept below the Pages per-file limit for reliable
  range playback; the original videos remain unchanged.
- Production-only large GLB URLs may use the repository's read-only
  `raw.githubusercontent.com` origin. The smaller MP4 derivatives are served
  directly by GitHub Pages with the correct `video/mp4` type. No upload, user
  media, remote scraping, analytics, or third-party tracking is introduced.
- No API key, OAuth token, browser secret, camera stream, location, dialogue,
  or user profile data is included in the media URL configuration.
- The media remains project-supplied/AIGC-labeled where the existing page marks
  it so; restoring delivery does not turn it into an official fact or offer.

## Accessibility and failure behavior

The existing controls, keyboard operation, reduced-motion handling, captions /
alt text, and error messages remain authoritative. A failed Raw request must
still show the current poster/static reference and an understandable localized
failure state. Media loading is lazy and route-scoped as before.

## Verification gate

Run `npm run build`, `npm run prepare:pages`, `npm run check:i18n`,
`npm run test:server`, `node --check server.mjs`, and `git diff --check`.
Inspect exact public HTTP responses for the ShellSong MP4, all seven ShellSong
GLBs, and the Travel MP4. Push only after the GitHub Pages workflow succeeds
and the public URLs return the expected media bytes and MIME-compatible content.
