# Public Luoyin deployment

## What visitors use

Visitors use the website's `POST /api/luoyin` endpoint. The browser never calls GLM directly and never receives the GLM key. The Node service calls `GLM-4.6V-Flash` only from its own process environment.

For a public website, deploy the Vite `dist/` output and `server.mjs` behind the same HTTPS domain. Route `/api/*` to the Node process with a reverse proxy. This is the preferred configuration because it needs no browser CORS permission.

## Production configuration

Set these environment variables in the hosting provider's secret/environment settings, not in the repository:

```text
GLM_API_KEY=<your secret key>
LUOYIN_SERVER_HOST=127.0.0.1
LUOYIN_SERVER_PORT=8787
LUOYIN_TRUST_PROXY=1
```

The reverse proxy terminates HTTPS and forwards only `/api/*` to `http://127.0.0.1:8787`. Do not expose port 8787 to the public internet when the proxy and Node process share a host.

If the frontend and API must be on different HTTPS origins, build the frontend with a non-secret API origin and allow only that exact site origin:

```text
VITE_LUOYIN_API_BASE_URL=https://api.example.com
LUOYIN_ALLOWED_ORIGINS=https://www.example.com
LUOYIN_SERVER_HOST=0.0.0.0
LUOYIN_TRUST_PROXY=1
```

Do not use `*` for `LUOYIN_ALLOWED_ORIGINS`. When more than one frontend origin is needed, use a comma-separated exact list.

Managed hosts commonly inject `PORT`. The service accepts that value first and retains `LUOYIN_SERVER_PORT` for same-host Caddy deployments. `GET /healthz` is a generic liveness endpoint with no model, source, secret, token, or deployment detail.

## Local launch

For local preview, keep the default loopback listener and run:

```powershell
cd D:\Lenovo\网页开发2
.\Start-LuoyinGlm.ps1
```

The script prompts for the key without echoing it, validates a real GLM response, and returns to local fallback if validation fails. To test a separate local frontend origin, pass only that origin explicitly, for example:

```powershell
.\Start-LuoyinGlm.ps1 -AllowedOrigins 'http://127.0.0.1:5177'
```

## Publish checklist

1. Set the key in the host's secret manager.
2. Build the client with `npm run build`.
3. Start the guide service in the host process manager.
4. Configure HTTPS reverse proxy routing from `/api/*` to the guide service.
5. Open the deployed site and send two different questions. The response metadata should show `GLM guide response`.
6. Confirm `GET /api/luoyin/status` shows `upstreamConfigured: true` and no secret fields.

The service keeps only temporary, in-memory rate-limit data. Questions, answers, identities, and keys are not stored by this project.

## Social Sharing And Visitor Publishing

Set `VITE_PUBLIC_SITE_URL` during the client build and `SOCIAL_PUBLIC_BASE_URL` in the Node process to the same public HTTPS origin. This makes canonical and Open Graph image URLs absolute for X and Facebook share previews. A localhost or HTTP URL intentionally keeps public sharing disabled.

X and Facebook can use their user-controlled share interfaces once the public origin exists. Real visitor-authorized publishing additionally requires platform developer approval and these deployment-only secrets:

```text
SOCIAL_OAUTH_STATE_SECRET=<random secret, at least 32 characters>
X_CLIENT_ID=<secret-manager value>
X_CLIENT_SECRET=<secret-manager value>
TIKTOK_CLIENT_KEY=<secret-manager value>
TIKTOK_CLIENT_SECRET=<secret-manager value>
GOOGLE_CLIENT_ID=<secret-manager value>
GOOGLE_CLIENT_SECRET=<secret-manager value>
```

Register exactly these HTTPS callback URLs in the corresponding developer portals:

```text
https://your-public-domain.example/api/social/x/callback
https://your-public-domain.example/api/social/tiktok/callback
https://your-public-domain.example/api/social/youtube/callback
```

Do not enable TikTok or YouTube publishing until their scopes, app review, public-upload rules, and test-account flows have passed. OAuth tokens are kept only in short-lived server memory and never belong in `.env` files, build variables, logs, or browser storage.

## VPS + Caddy release procedure

`qiongverse.com` is the intended canonical `.com` domain pending operator registration. Its DNS currently has no public records; finish domain purchase and DNS ownership verification before attempting certificate issuance. Use `deploy/Caddyfile.qiongverse.com.example` and `deploy/qiongverse.service.example` for this domain, or use the generic `deploy/Caddyfile.example` for a later domain. Copy `deploy/qiongverse.env.example` to `/etc/qiongverse/qiongverse.env`, fill secrets through the VPS secret workflow, and keep the file mode at `600`.

1. Create the DNS A record (and AAAA only when IPv6 is stable) plus the `www` CNAME.
2. Install the release into a timestamped directory under `/srv/qiongverse/releases/`, then update the `current` symlink after build checks pass.
3. Store production variables in `/etc/qiongverse/qiongverse.env` with mode `600`; never put secrets in the repository.
4. Enable the systemd service, reload Caddy, and verify `/api/luoyin/status` and `/api/social/status` before switching traffic.
5. Run `npm run verify:deployment -- https://qiongverse.com`, then perform the external X/Facebook preview checks and mobile first-load network assertions.

The repository cannot register a domain, change DNS, obtain certificates, or perform external platform debugging without operator access. Until the final domain resolves, local HTTP builds intentionally leave public share metadata disabled.

## Free demonstration route

For a no-cost public demonstration, deploy the frontend to Cloudflare Pages and the Node API from `render.yaml`. Follow `deploy/cloudflare-pages-free.md`. This uses separate origins and exact CORS; it is not the same as the preferred Caddy architecture, and it must not enable provider OAuth secrets or promise uninterrupted availability.
