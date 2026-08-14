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
