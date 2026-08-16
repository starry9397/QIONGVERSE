# Module Guide: Stable HTTPS Deployment And Share Verification

## Scope and guardrails

This module deploys HAINAN∞QIONGVERSE 琼境, a Hainan Province cultural exhibition and public-information orientation layer, behind one stable HTTPS origin. It is not a government site, booking engine, payment system, policy adviser, or social account publisher. Hash routes remain the public MVP routes.

The production topology is a VPS with Caddy terminating HTTPS, serving the Vite `dist/` directory, and proxying only `/api/*` to the loopback Node service on `127.0.0.1:8787`. The browser never receives GLM or OAuth secrets. The canonical origin is the registered apex domain; `www` redirects to it.

## Domain and DNS

The operator registers a `.com` domain and controls its DNS. No password, verification code, registrar token, or private key belongs in this repository or chat. Before production cutover, the operator supplies the final domain string and DNS provider, then creates the required A/AAAA records and `www` CNAME.

## Runtime and secrets

`VITE_PUBLIC_SITE_URL` and `SOCIAL_PUBLIC_BASE_URL` are the same HTTPS origin without a trailing slash. `GLM_API_KEY`, OAuth client secrets, and `SOCIAL_OAUTH_STATE_SECRET` are process-only deployment secrets. They are never sent to Vite, returned by status endpoints, logged, or persisted in browser storage. TikTok and YouTube remain unavailable until their separate OAuth review and test-account requirements are complete.

## Metadata and sharing

Open Graph and X metadata always point to the public homepage and absolute HTTPS project media. X and Facebook open user-controlled official share dialogs. Hash state, conversations, map selections, route plans, carts, and private forms are never included in shared URLs.

## Privacy, accessibility, and failure behavior

No tracking SDK, camera, geolocation, new browser storage, CRM, payment flow, or remote source scraping is introduced. The deployment keeps the seven-language catalog and Arabic RTL behavior. A failed health check, missing public origin, failed asset request, or disabled OAuth capability is reported as unavailable; it must never be rendered as a successful deployment or publication.

## Acceptance

Run `npm run build`, `npm run check:i18n`, `npm run test:server`, `node --check server.mjs`, and `git diff --check` before release. Then run `npm run verify:deployment -- https://<PUBLIC_DOMAIN>` from a network that resolves the final domain. Verify TLS, canonical/OG/X tags, the OG image, `/api/luoyin/status`, `/api/social/status`, mobile first load at 320/375/768/1115/1440px, and that `#top` does not request ShellSong, Travel, Market, SPZ, GLB, or non-homepage video assets.

