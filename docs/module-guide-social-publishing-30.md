# Module Guide: Social Sharing And Visitor Publishing

## Purpose

Add a restrained social-sharing band to the HAINAN∞QIONGVERSE homepage. The project remains an English-first, bilingual digital exhibition about Hainan Province. Sharing promotes the project page and supplied project media only; it is not a government endorsement, tourism booking, commercial offer, partnership, or policy statement.

## Routes, Content, And Assets

- Render the sharing controls only in the homepage footer. They share the canonical public homepage, never a private hash route, visitor message, source-desk record, lead form, or current location.
- X and Facebook share the canonical project link and project-scoped title/description. Facebook uses its user-controlled Share Dialog rather than personal-profile API publishing.
- TikTok may post only `public/assets/social/luoyin-cg-vertical.mp4`, a non-destructive 9:16 derivative of supplied `public/shellsong/video/luoyin-cg.mp4`. YouTube may upload only supplied `public/assets/travel/hainan-unfolded-hero.mp4`.
- Fixed bilingual metadata is allowlisted server-side. The browser cannot send arbitrary captions, URLs, file paths, platform account data, or media bytes.

## OAuth, Privacy, And Failure Boundaries

- Visitor-owned accounts authorize every publish action. There are no project-owned account tokens and no automatic posting.
- OAuth uses HTTPS callbacks, PKCE, one-time state, short-lived SameSite/HttpOnly cookies, in-memory server state, and server-only access tokens. Tokens are never returned to JavaScript, logged, persisted, or stored in browser storage.
- X may publish a fixed project link after user confirmation when its OAuth configuration is available. TikTok Direct Post and YouTube upload remain disabled until their developer applications, scopes, platform review, and exact production callback URLs are configured.
- If configuration, authorization, user confirmation, source asset, upload, or upstream response fails, the UI explains that publishing did not occur. It never reports a successful share without a successful platform response.
- No analytics SDK, pixel, CRM, identity collection, location, camera, microphone, or new browser storage is introduced.

## Accessibility And Presentation

- Use accessible brand-icon controls with bilingual names, visible focus, 44px minimum targets, hover tooltips, keyboard operation, and reduced-motion behavior.
- The footer keeps the existing deep-sea and pearl-gold visual system. The social group is compact on desktop and wraps without horizontal overflow on narrow screens.
- A confirmation dialog shows the fixed project title, description, asset scope, and final action before any OAuth-backed post or upload.

## Verification

- Run `npm run build`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`.
- Test share intent encoding, absent production URL, disabled OAuth configuration, invalid/expired/reused state, invalid platform or asset, OAuth cancellation, upstream failure, token redaction, focus handling, language switching, and 320px through wide desktop layouts.
- Before production enablement, configure the deployment domain and platform credentials in host secrets, complete each platform's review, and run end-to-end tests with authorized test accounts.
