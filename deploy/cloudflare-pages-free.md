# Cloudflare Pages: no-cost demonstration deployment

Use Cloudflare Pages to publish the Vite frontend at the stable project subdomain created by Pages, for example `https://qiongverse.pages.dev`. This does not register a `.com` domain.

1. Push the repository to a Git provider accessible to Cloudflare Pages.
2. Create a Pages project with build command `npm run build` and output directory `dist`.
3. Set non-secret build variables:

```text
VITE_PUBLIC_SITE_URL=https://qiongverse.pages.dev
VITE_LUOYIN_API_BASE_URL=https://qiongverse-api.onrender.com
```

4. Create the API service from `render.yaml`. Render injects `PORT`; do not set `LUOYIN_SERVER_PORT` there.
5. Replace `https://qiongverse.pages.dev` in `render.yaml` only after Cloudflare assigns the final Pages hostname, then redeploy the API.
6. Add the deployed Render HTTPS URL to the Cloudflare Pages build variable and rebuild the frontend.

The free split-origin route supports the guide API and user-controlled X/Facebook link sharing. Do not set social OAuth provider secrets in this topology: callback endpoints would need a separately reviewed same-origin HTTPS deployment. Free services can have limits or cold starts; confirm their current terms before presenting the site as continuously available.

