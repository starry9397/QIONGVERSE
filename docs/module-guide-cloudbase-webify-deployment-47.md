# Module Guide: Tencent CloudBase Webify Deployment

## Scope and guardrails

This module publishes the existing HAINAN∞QIONGVERSE 琼境 frontend as a static Vite site through Tencent CloudBase Webify. The product remains a Hainan Province cultural exhibition, AI-assisted fictional guide, and bounded public-information orientation layer. It is not a government service, booking system, payment system, CRM, policy adviser, or proof of a commercial partnership.

This is a deployment change only. Existing homepage content, six exhibition routes, seven-language system, source desk, ShellSong fiction, map, travel atlas, market demo, desktop pet, social share boundaries, and failure fallbacks remain unchanged.

## Webify publishing contract

- Source: the repository branch selected in the Webify console.
- Build command: `npm run build`.
- Output directory: `dist`.
- Node version: use the repository's current LTS-compatible Node runtime (Node 20 or newer).
- Install command: `npm ci`.
- Optional local artifact check: `npm run verify:webify` after the build.
- Routing: keep the existing Hash routes (`#top`, `#hainan-map`, `#luoyin-tide`, `#travel-atlas`, `#market`, and exhibition hashes). No server-side rewrite is required.
- Webify serves static assets only. Do not upload or run `server.mjs` in Webify.
- The production build retains the original high-resolution ShellSong GLBs in the repository but excludes those unreferenced source copies from `dist`; the checked-in `shellsong/models/web/` delivery derivatives remain available to the ShellSong model chooser.

The Webify public origin is the browser origin for the frontend. It must be an HTTPS URL before it is used for canonical metadata, social previews, or CORS configuration.

## Current deployment record

- CloudBase environment: `qiongverse-webify-d5drsw1e9a5fd4` (Shanghai, free trial)
- Webify service: `qiongverse-webify`
- Current public URL: `https://qiongverse-webify-qiongverse-webify-d5drsw1e9a5fd4.webapps.tcloudbase.com/`
- Current deployed version: `qiongverse-webify-002` (build status `SUCCESS`)
- API origin: `https://qiongverse-api.onrender.com` (Render CORS must be redeployed with the Webify origin before browser chat requests succeed)

## Split-origin API boundary

The current Node API remains deployed on Render at `https://qiongverse-api.onrender.com` unless a later migration is explicitly approved. Configure the Webify build variable below in the Webify project settings, never in source code:

```text
VITE_LUOYIN_API_BASE_URL=https://qiongverse-api.onrender.com
VITE_PUBLIC_SITE_URL=https://<actual-webify-domain>
```

After Webify assigns its final HTTPS domain, configure the Render service with exact origins only:

```text
LUOYIN_ALLOWED_ORIGINS=https://<actual-webify-domain>
SOCIAL_PUBLIC_BASE_URL=https://<actual-webify-domain>
```

Do not use `*`, localhost, a preview URL, or a comma-separated broad wildcard in production. If a stable custom domain is added, list that exact HTTPS origin and use the same value for `VITE_PUBLIC_SITE_URL` and `SOCIAL_PUBLIC_BASE_URL`.

## Secrets, sources, and privacy

- `GLM_API_KEY`, OAuth client secrets, signing secrets, and access tokens stay only in the Render/server secret manager.
- Never add `GLM_API_KEY` or any secret to Webify environment variables, Vite `VITE_*` variables, the repository, `dist`, browser storage, or logs.
- Webify receives only non-secret public build values beginning with `VITE_`.
- The build does not add camera, microphone, tracking SDK, cookies, account storage, location storage, conversation storage, payment, or order functionality.
- AIGC concept art, concept models, ShellSong fiction, and project-curated material retain their existing labels and source limitations.
- The public site uses the existing seven-language and Arabic RTL behavior; no locale data is inferred from the deployment region.

## Webify console procedure

1. Create or select a CloudBase environment and open Webify static site deployment (CloudBase console may label this **Static website hosting > Application deployment**).
2. Connect the Git repository and select the intended branch. Do not upload `.env`, `node_modules`, `server.mjs`, or local-delivery archives as static assets.
3. Set install command `npm ci`, build command `npm run build`, output directory `dist`, and Node 20+.
4. Add only the two public build variables shown above. Leave `GLM_API_KEY`, `SOCIAL_OAUTH_STATE_SECRET`, OAuth client secrets, and server-only variables unset.
5. Deploy and copy the final HTTPS Webify domain.
6. Update the Render variables with the exact Webify origin, trigger a redeploy, and then run the verification commands below.
7. When a custom domain is ready, update both providers atomically and re-run the checks.

For a CLI-driven deployment, Tencent's CloudBase CLI supports the same Vite contract after login:

```powershell
npm install --global @cloudbase/cli
tcb login
tcb app deploy --framework vite -e <cloudbase-environment-id>
```

Use the console when the account, environment, Git provider, or custom domain still needs confirmation. Do not put the environment ID or any secret into the frontend source; the ID is only a deployment target.

## Local preflight and acceptance

Run from the repository root before every Webify deployment:

```powershell
npm ci
$env:VITE_PUBLIC_SITE_URL = "https://<actual-webify-domain>"
$env:VITE_LUOYIN_API_BASE_URL = "https://qiongverse-api.onrender.com"
npm run build
npm run verify:webify
npm run check:i18n
npm run test:server
node --check server.mjs
git diff --check
```

Inspect `dist` for secrets and confirm the build contains no unresolved `%PUBLIC_SITE_URL%` placeholder. After deployment, verify:

- the homepage and every Hash route load directly;
- `/api/luoyin/status` and `/api/social/status` respond from the Render origin without exposing secrets;
- the ShellSong, map, travel, market, source-desk, seven-language, RTL, desktop-pet, and social-share flows remain usable;
- a failed API, image, video, GLB, or SPZ request keeps the existing understandable fallback;
- no page has horizontal overflow at 320px, 375px, 768px, 1115px, or 1440px.

Use `npm run verify:deployment -- https://<actual-api-or-same-origin-domain>` only after the public HTTPS origin resolves. A Webify static origin cannot pass API checks until the Render CORS allowlist has been updated.

## Rollback

Webify deployments are versioned by the provider. Roll back to the last known-good static build if a deployment fails, then restore the corresponding `VITE_PUBLIC_SITE_URL`/CORS pair. Keep the Render API and GLM secret unchanged during a frontend-only rollback.
