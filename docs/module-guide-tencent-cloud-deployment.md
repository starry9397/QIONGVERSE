# Module Guide: Tencent Cloud Release

## Scope

This module packages the existing HAINAN∞QIONGVERSE service for a Tencent Cloud Lighthouse or CVM Linux host. The deployed product remains a Hainan Province cultural exhibition and bounded public-information orientation layer. It is not a government service, booking system, CRM, payment service, or policy adviser.

## Deployment target

- Target: Ubuntu 22.04/24.04 on Tencent Cloud Lighthouse or CVM.
- Web edge: Caddy terminates HTTPS and serves the Vite `dist/` directory.
- API: `server.mjs` runs as the unprivileged `qiongverse` systemd user on loopback port `8787`.
- Public paths: `/` serves the static site and `/api/*` proxies to the Node service.
- Hash routes remain unchanged so static hosting does not require SPA server rewrites.

## User, source, and asset boundaries

- The release contains only repository assets actually needed by the built site and Node service.
- AIGC concepts, ShellSong fiction, and project-curated media remain labelled in the existing UI.
- No runtime source scraping, camera/microphone use, tracking SDK, account system, payment, CRM, or extra browser storage is introduced.
- The package must exclude `.env` files, private keys, tokens, `.git`, `node_modules`, and local logs.

## Secrets and privacy

- `GLM_API_KEY` is injected only into `/etc/qiongverse/qiongverse.env` on the host with mode `600`.
- OAuth secrets remain unset unless separately reviewed and configured.
- The installer never accepts a secret as a command-line argument and never writes secrets to the release directory.
- CORS is same-origin by default; if a split-origin frontend is used, the exact HTTPS origin must be configured explicitly.

## Required host checks

- DNS A/AAAA records point to the host before Caddy certificate issuance.
- Ports 80 and 443 are allowed by the Tencent Cloud security group; port 8787 stays private.
- Node.js 20+ and Caddy are installed, or the operator allows the installer to install them through the OS package manager.
- The operator supplies the domain and connects over SSH as a sudo-capable user.

## Acceptance

Run locally before upload: `npm run build`, `npm run check:i18n`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`.

After deployment verify `/healthz`, `/api/luoyin/status`, `/api/social/status`, HTTPS redirects, same-origin API calls, Hash routes, and the absence of secrets in logs, bundles, and public responses. Run `npm run verify:deployment -- https://<domain>` from a trusted workstation.
