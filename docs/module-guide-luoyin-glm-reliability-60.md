# Module Revision Guide: Luoyin GLM-4.6V-Flash reliability

## Goal and confirmed failure pattern

Keep Luoyin's ordinary questions on the protected server-side
`GLM-4.6V-Flash` path while preventing automatic guide traffic from causing
avoidable model fallbacks. Production evidence showed one successful GLM
answer followed by rapid `service_unavailable` fallbacks. The official Zhipu
documentation identifies short bursts, concurrent requests, error 1302 and
platform overload error 1305 as recoverable rate-limit conditions.

## Strict implementation prompt

Use the official API model code `glm-4.6v-flash` while retaining the public
display name `GLM-4.6V-Flash`. Route every upstream request through one bounded
server-side scheduler. Interactive visitor questions have priority over
automatic exhibit introductions; automatic guide requests may wait only in a
small background queue and must retain their existing local response when the
provider remains unavailable. Retry only transient network, HTTP 429 and HTTP
5xx failures, with a short bounded delay. Never retry authentication,
permission, balance, quota-exhaustion, content-safety or invalid-parameter
errors. Never log prompts, answers, authorization headers, keys, browser
coordinates or visitor data. Keep the current validation, request limits,
source metadata, multilingual behavior and factual fallback intact.

## Product and blueprint boundaries

- The six halls, hash routes, desktop pet and automatic cue catalogue remain
  unchanged.
- `/api/luoyin` remains backward compatible and `/api/luoyin/chat` retains its
  normalized contract.
- Current policy, visa, tax, customs, medical, legal, price, inventory and
  personal decision requests still require current official or human
  confirmation. Improving availability is not permission to fabricate facts.
- `GLM_API_KEY` remains a Render-only process secret. It must not enter Vite,
  `dist`, GitHub Pages, CloudBase, browser storage, logs or responses.
- No dialogue history, user account, analytics, tracking SDK or new database is
  introduced.

## Failure behavior

- One transient provider failure receives one delayed retry.
- A second failure immediately uses the existing contextual local fallback.
- Non-retryable provider failures immediately use the existing fallback.
- Automatic guide traffic cannot create concurrent provider requests.
- The public status endpoint reports capability and model display name only;
  it does not claim that every individual provider call will succeed.

## Verification

1. Add regression checks that fail when requests use the wrong model code,
   omit the transient retry, or execute concurrently.
2. Run the regression checks red before implementation and green afterward.
3. Run `node --check server.mjs`, `npm run test:server`,
   `npm run check:i18n`, `npm run build:webify`, `npm run verify:webify`, and
   `git diff --check`.
4. Deploy through GitHub `main`, wait for Render and GitHub Pages, then verify
   both public frontends and the Render API without exposing secrets.
5. Sample ordinary science, Hainan culture, explicit exhibit context and a
   current regulated question. Confirm GLM responses are direct when the
   provider succeeds and local fallbacks remain useful when it does not.
