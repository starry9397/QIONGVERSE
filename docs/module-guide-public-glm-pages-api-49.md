# Module Guide: GitHub Pages public GLM guide API wiring

## Scope and strict boundaries

This module fixes the split-origin deployment for the existing HAINAN∞QIONGVERSE
琼境 ShellSong guide. The static frontend remains on GitHub Pages and the
server-side `/api/luoyin` service remains on Render. Existing exhibition
content, six immersive halls, seven-language behavior, source limits, desktop
pet behavior, GLB loading, privacy rules, and local fallbacks are unchanged.

The GLM credential is a server-only deployment secret. It must never appear in
Vite variables, GitHub Pages artifacts, browser code, logs, source maps, or API
responses. The browser may receive only the public API origin and the existing
answer/source metadata.

## Public origin contract

- Frontend origin: `https://starry9397.github.io/QIONGVERSE`
- Browser `Origin` header: `https://starry9397.github.io` (paths are not part of
  the CORS origin)
- API origin: `https://qiongverse-api.onrender.com`
- Client build variable: `VITE_LUOYIN_API_BASE_URL`
- Render allowlist variable: `LUOYIN_ALLOWED_ORIGINS`
- Server secret: `GLM_API_KEY` in Render's secret environment only

The Render allowlist uses exact HTTPS origins and may retain the existing
`qiongverse.pages.dev` origin for the alternate deployment. It must not use `*`,
an origin with a path, or a broad domain wildcard.

## Runtime and privacy contract

- The client calls only `GET /api/luoyin/status` and `POST /api/luoyin` (plus the
  existing normalized chat route where used).
- The server calls GLM-4.6V-Flash and keeps the key and upstream response
  handling on the server.
- Seven locale codes remain accepted; unknown locales are rejected by the
  existing server validation.
- When Render or GLM is unavailable, the current source-bounded localized local
  response remains visible and must not claim that a live answer was generated.
- No new browser storage, account data, location data, tracking, camera access,
  or third-party client SDK is introduced.

## Verification checklist

1. Build Pages with `VITE_LUOYIN_API_BASE_URL` set to the Render HTTPS origin.
2. Inspect the generated bundle for the public API origin and for the absence of
   `GLM_API_KEY`, bearer tokens, or other secrets.
3. Check Render `/healthz` and `/api/luoyin/status`; status may expose model
   capability but never a key or token.
4. Check CORS with `Origin: https://starry9397.github.io` and reject an
   unrelated origin.
5. Open the public `#luoyin-tide` route, submit a harmless question, and verify
   either a GLM guide response or the clearly labelled localized fallback.
6. Run `npm run build`, `npm run prepare:pages`, `npm run check:i18n`,
   `npm run test:server`, `node --check server.mjs`, and `git diff --check`.

Any Render dashboard environment variable change must be redeployed before the
public browser can observe the new CORS policy.
