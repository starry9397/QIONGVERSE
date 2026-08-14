# Module Guide: Public Luoyin access / 螺音公网智能问答

## 1. Module goal

- Module name: Public Luoyin Access / 螺音公网智能问答。
- Core task: a visitor using the deployed HAINAN QIONGVERSE site can ask Luoyin a question and receive a GLM-4.6V-Flash answer through a protected server endpoint.
- Narrative role: Luoyin remains the conversational guide across the existing four-zone archive; public access does not create another exhibition zone.
- Foreign-user path: open Luoyin in English by default, submit a question, receive an answer in the selected language, and see whether it came from live GLM or the usable local fallback.

## 2. Content boundaries

- Required: the existing four zones, live-GLM status, local fallback, language selection, and a server-side API boundary.
- Prohibited: browser API keys, fictional official endorsement, invented facts or commercial results, persistent chat transcripts, user accounts, CRM dispatch, and a fifth exhibition zone.
- Supplied project media stays labelled as project material; ShellSong remains fiction; reviewed sources remain reviewed-source orientation; a live answer without a matching source is labelled as an AI suggestion.
- This module does not publish the site to a domain, buy hosting, set a DNS record, create a provider account, or promise GLM availability.

## 3. Asset and source rules

- Existing source only: `src/App.tsx`, `server.mjs`, `vite.config.ts`, `Start-LuoyinGlm.ps1`, and reviewed entries in `knowledge/`.
- No new media is required. No source record or official-link claim is added.
- `VITE_LUOYIN_API_BASE_URL` may contain a public HTTPS API origin at build time; it is configuration, never a secret. The default remains same-origin `/api`.
- `GLM_API_KEY` stays process-only. It may never be written to source, build output, browser requests, logs, URL parameters, or documentation.

## 4. Visual system

- Keep the existing Tide Archive drawer, Shell Paper reading surface, Shell Gold metadata, and Coral Clay action controls.
- Do not add dashboards, service uptime claims, partner logos, confidence scores, cards within cards, or gradients.
- The existing compact live/local service statement is the sole public-service status cue.

## 5. Interaction and states

- Default: visitor can type and submit in the open drawer.
- Loading: duplicate submission is disabled; the transcript remains visible.
- Success: response is appended, input is refocused, and GLM/local source mode is visible.
- Error: failed public API requests retain a contextual browser fallback and do not expose backend internals.
- Keyboard: Enter submits, Escape closes, Tab follows native control order. Touch targets remain existing responsive controls.
- Reduced motion keeps equivalent state changes without depending on animation.

## 6. Technical constraints

- React/Vite client uses same-origin `/api` by default and optionally a non-secret `VITE_LUOYIN_API_BASE_URL` public API origin.
- Node server accepts `LUOYIN_SERVER_HOST` and binds to loopback by default. Production should use HTTPS and a same-origin reverse proxy where possible.
- `LUOYIN_ALLOWED_ORIGINS` is an explicit comma-separated allowlist for separated frontend/API origins. No wildcard CORS policy is allowed.
- Optional proxy client identity support is enabled only through `LUOYIN_TRUST_PROXY=1`; otherwise rate limits use the direct socket peer.
- Existing body bounds, timeout, input validation, in-memory rate limiting, no-persistence policy, and GLM fallback remain in place.
- WebGL/video are unrelated to this module. API failure leaves the exhibition and local guide usable.

## 7. Internationalization

- English stays default and Chinese stays synchronized. The selected language is passed to the protected API endpoint.
- Long English messages wrap inside the existing drawer and do not require new layout behavior.
- Terminology remains `Luoyin / 螺音`, `Virtual Exhibition / 虚拟展厅`, and the existing four zone names.
- Current, regulated, cultural, and commercial statements remain clearly qualified for foreign visitors.

## 8. Acceptance criteria

- The browser sends questions only to `/api/luoyin` or a configured HTTPS API base; it never receives a key.
- The service starts with a configurable host, keeps loopback as its default, and correctly applies an explicit CORS allowlist.
- Public reverse-proxy deployments do not collapse all visitors into one rate-limit bucket when proxy trust is explicitly enabled.
- Unauthorized origins receive no permissive CORS header.
- The server self-test, syntax check, production build, and secret scan pass.
- Missing key/upstream failure returns a usable fallback, not a blank answer.
- No persistent question, answer, identity, or key is introduced.

## 9. Next action

- After implementation, verify local same-origin requests, run the server self-test and client build, and inspect source/build output for secrets.
- Pause for the user to choose a hosting provider, domain, and HTTPS reverse proxy when actual public publication is required; those are deployment authorities outside the local project.
- After acceptance, the next task is deployment to a user-controlled HTTPS host or a content refinement module.
