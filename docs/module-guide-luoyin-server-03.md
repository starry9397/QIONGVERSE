# Module Guide: Luoyin server-side intelligent guide

## 1. Module goal

- Module name: Luoyin Server Guide / 螺音服务端智能导览.
- Core user task: ask Luoyin a question about the current exhibition room and receive a bilingual, source-aware answer without exposing an API key in the browser.
- Project relationship: Luoyin is the narrative bridge between HAINAN∞QIONGVERSE 琼境's four-zone digital archive and an international visitor; this module turns the existing drawer from a visual mock into a protected service boundary.
- Foreign-user path: select a room, ask in English or Chinese, receive a concise answer with a visible layer label, then continue exploring or request human follow-up when the question is factual, policy-related, or commercial.

## 2. Content boundaries

- Required domains remain exactly: Tropical Coast, Li & Miao Heritage, Dongfang Rosewood, Beautiful Villages.
- The service must classify every answer as one of: `reality`, `shellsong`, `suggestion`, `handoff`, or `mock`.
- Reality content is limited to supplied project descriptions and explicitly marked source notes. ShellSong is fictional world-building. Suggestion is AI-generated interpretation, not fact. Policy, price, inventory, legal, visa, investment, partnership, and transaction questions must receive a cautious human-confirmation handoff.
- Fixed prohibitions: no aerospace content, no fifth zone, no unverified policy facts, no fabricated official endorsement, no fabricated attractions, prices, inventory, reviews, orders, visitors, conversion, or commercial results.
- Out of scope: accounts, CRM persistence, payments, analytics identity profiles, voice synthesis, 3D loading, and automatic business claims.

## 3. Asset and knowledge rules

- The server uses typed, local knowledge context derived from the existing four-zone data and the ShellSong role setting; it does not crawl the web or invent sources.
- No new image or video asset is required. The existing `/luoyin/luoyin.png` remains the visual identity, with the existing WebP fallback.
- API responses must return a `sourceLabel` and `layer` so the UI can distinguish supplied project material, ShellSong fiction, AI suggestion, mock preview, or human handoff.
- If the upstream API fails, times out, or returns malformed data, return a usable local fallback answer and an explicit error mode; never blank the drawer.

## 4. Visual system

- Preserve the Tide Archive drawer, Shell Paper surface, Coral Clay action, Shell Gold signal, and existing typography.
- Add only a compact response metadata line and state treatment; do not add a dashboard, card stack, fake confidence score, or data visualization.
- Loading should feel like Luoyin listening to the tide. Error and handoff should use clear text, not alarming red spectacle.

## 5. Interaction and states

- Default: drawer shows current zone and asks for a question.
- Loading: disable duplicate submission, show bilingual listening state, preserve typed input until a response arrives.
- Success: show answer, `layer`, `sourceLabel`, and optional handoff action.
- Empty: do not submit whitespace; keep focus in the input.
- Error/offline: show a local fallback answer and state that this is a local preview or that human confirmation is required.
- Handoff: show a clear human-follow-up action placeholder without collecting personal data in this module.
- Keyboard: Enter submits, Escape closes drawer, tab order remains logical, focus-visible is retained.
- Mobile touch targets stay at least 44px; reduced motion keeps the same state order without animated transforms.

## 6. Technical constraints

- Frontend remains React + Vite + TypeScript. Server uses Node's built-in `http` module in `server.mjs`; no Express or extra runtime dependency is required.
- Vite proxies `/api` to `http://127.0.0.1:8787` during development. The static client never contains `GLM_API_KEY` or the upstream token.
- Endpoint: `POST /api/luoyin` with `{ question, language, zoneId }`; reject oversized or malformed bodies and unsupported zone IDs.
- Environment: `GLM_API_KEY`, optional `GLM_API_URL`, fixed model `GLM-4.6V-Flash`, optional `LUOYIN_SERVER_PORT`.
- Upstream requests use a bounded timeout and a minimal system prompt with explicit safety rules. Never log the key or full user question.
- No persistent storage; no cookies or personal identifiers. Basic in-memory rate limiting is allowed as a protection floor.
- If server is unavailable, the client must fall back to the local zone guide response.

## 7. Internationalization

- English is default; the request language is sent explicitly and the response language must match it.
- Every server state has English and Chinese UI copy.
- Cultural names use one glossary: Virtual Exhibition / 虚拟展厅, Tropical Coast / 热带海岸, Li & Miao Heritage / 黎苗文化, Dongfang Rosewood / 东方花梨, Beautiful Villages / 美丽乡村, Luoyin / 螺音.
- Do not machine-translate a cultural claim into an invented historical assertion.

## 8. Acceptance criteria

- No API key or token appears in `src`, `dist`, or client bundles.
- `POST /api/luoyin` returns a local mock answer when no key is configured.
- With a configured key, the server calls the upstream GLM endpoint, applies the system boundary, and returns normalized JSON.
- Malformed JSON, unsupported zone, empty question, oversized body, timeout, and upstream failure return safe non-blank responses.
- UI displays loading, success, mock, error, and handoff metadata states in both languages.
- Exactly four zones remain and forbidden-content scan is clean.
- `npm run build` passes; server starts with `npm run server`; Vite proxy reaches the endpoint.
- No persistent user data is stored and the browser never receives the API key.

## 9. Next action

- After implementation, run the server without a key, exercise valid and invalid requests, run the frontend build, inspect the drawer states, and search client output for secret names or values.
- Pause and ask for confirmation only if a real verified knowledge source or an approved human handoff destination is required; this MVP can use local context and a placeholder handoff action.
- After acceptance, the next module is the verified knowledge/source management layer and commercial lead handoff design.
