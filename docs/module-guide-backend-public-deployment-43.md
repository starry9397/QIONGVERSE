# Module Guide: Public Backend Deployment

## Purpose and scope

This module makes the existing Node guide service deployable behind a public HTTPS frontend without changing HAINAN∞QIONGVERSE's scope: it remains a Hainan Province cultural exhibition and carefully bounded public-information orientation layer. It is not a government site, booking service, CRM, payment system, policy adviser, or general-purpose AI agent.

## Deployment topology

The preferred production topology remains a same-origin VPS plus Caddy. A no-cost demonstration topology may use Cloudflare Pages for the Vite frontend and Render for the Node API. The split-origin setup uses an exact CORS allowlist and is intended for guided API responses plus X/Facebook link sharing only. It does not enable TikTok, YouTube, or X OAuth publishing because their callbacks require a dedicated reviewed public origin and provider configuration.

## Security and privacy

The service accepts the host platform's `PORT` only as a listener setting. `GLM_API_KEY`, OAuth credentials, and state secrets remain server-only secret-manager values. `/healthz` returns only a generic liveness payload. No new storage, tracking, account, location, camera, microphone, media upload, source scraping, or personal-data collection is added.

## Deployment variables

For Render, set `LUOYIN_SERVER_HOST=0.0.0.0`, leave `LUOYIN_SERVER_PORT` unset so the host `PORT` is used, and allow only the exact deployed frontend URL through `LUOYIN_ALLOWED_ORIGINS`. The current frontend URL is `https://starry9397.github.io/QIONGVERSE`. Build the frontend with its exact public URL and the exact API base URL. Do not use wildcard CORS origins or build-time secrets.

## Verification

Run `npm run build`, `npm run check:i18n`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`. In the host, verify `/healthz`, `/api/luoyin/status`, and `/api/social/status`; ensure liveness output contains no model key, token, secret, origin list, or internal path. Confirm a cross-origin request succeeds only from the configured Pages origin and fails from an untrusted origin.
