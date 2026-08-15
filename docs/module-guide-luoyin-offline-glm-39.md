# Module Guide: Luoyin Offline Knowledge and GLM Runtime

## 1. Scope and user task

- Module: Luoyin offline knowledge base and GLM-4.6V-Flash runtime integration.
- Product scope: HAINAN∞QIONGVERSE / 琼境 is a Hainan Province cultural exhibition and public-information orientation layer, not a government service, booking engine, policy adviser, product catalogue, payment system, or commercial guarantee.
- User task: ask Luoyin about the exhibition, Hainan orientation, culture, travel planning, aerospace context, the Free Trade Port, ShellSong fiction, the demo market, privacy, or general questions and receive a useful answer with an explicit evidence class.
- Luoyin identity: an original fictional digital guide. It must never imply a government identity, human identity, official endorsement, or professional advice relationship.
- Routes covered: `#top`, `#hainan-map`, `#luoyin-tide`, `#travel-atlas`, `#market`, the six halls, source desk, and the existing desktop-pet chat entry.

## 2. Knowledge and evidence rules

- The offline catalogue is static, local, versioned JSON. It is not a web crawler, vector database, or hidden user profile.
- Every item has a stable ID, topic tags, seven-language title and answer, evidence class, status, source IDs where applicable, and a limitation statement.
- Allowed evidence classes are `verified_primary_source`, `project_context`, `shellsong_fiction`, and `ai_suggestion`.
- Only `verified_primary_source` records in `knowledge/source-registry.json` may produce a public source citation. A project-context or fiction item may explain the experience but never prove an external fact.
- Current policy, customs, tax, visa, investment, travel availability, opening hours, transport, prices, stock, orders, contracts, safety, and technical aerospace claims require an official source or human confirmation. The model must say when it cannot verify them.
- No source is copied wholesale. The catalogue stores short project-authored summaries and source IDs only.
- The phrase “answer all questions” means broad assistance with honest uncertainty. It does not authorize invented facts, hidden browsing, or unbounded claims.

## 3. GLM runtime boundary

- The upstream model is fixed to `GLM-4.6V-Flash` at `https://open.bigmodel.cn/api/paas/v4/chat/completions`.
- `GLM_API_KEY` is read only from the server process environment. It must never appear in source, JSON, frontend code, build output, logs, URLs, screenshots, tests, or this guide.
- Existing `POST /api/luoyin` and `POST /api/luoyin/chat` contracts remain compatible. Request size limits, rate limiting, timeout, no-store responses, locale validation, and local fallback remain mandatory.
- GLM receives the active zone, the matched offline catalogue context, the reviewed-source scope when one exists, and the user question. It does not receive browser storage, location, contact data, conversation history from persistence, or arbitrary URLs.
- Upstream output is labelled `ai_suggestion` unless a reviewed source was explicitly matched. A reviewed citation does not expand beyond that source's declared scope.
- Prompt injection, requests for secrets/internal instructions, and unsupported factual certainty are refused or redirected in the selected language.

## 4. Seven-language and accessibility rules

- Supported locales are `en`, `zh`, `id`, `ja`, `ko`, `ru`, and `ar`; English is the default and Arabic uses root RTL.
- Every catalogue item must contain all seven locales. Missing fields fail the server self-test instead of silently falling back to English.
- Brand names, source publisher names, UNESCO/CNSA/Hainan Free Trade Port names, and embedded asset labels may remain original labels. Explanatory text and boundaries must be translated.
- Answers, source labels, human-confirmation actions, loading/error states, and aria text use the request locale.
- Long text must wrap at 320px through 1440px. Keyboard focus, Escape, reduced motion, and image/API failure states remain usable.

## 5. Privacy and data boundary

- No new browser storage is introduced. The only existing persistent value is `qiongverse.language`.
- No camera, microphone, location, tracking SDK, analytics, CRM, payment, account, or third-party client key is added.
- The server does not persist questions, answers, prompts, tokens, or user profiles. Rate-limit memory is process-local and disposable.
- Logs and errors must not include authorization headers, prompts, user message contents, or environment values.

## 6. Acceptance and verification

- Knowledge loader rejects malformed records, incomplete locales, unknown evidence classes, unknown source IDs, and unreviewed source citations.
- Local matching returns topic-specific, non-generic answers for greeting, exhibition, tropical coast, Li/Miao heritage, rosewood, villages, aerospace, Free Trade Port, travel, market, ShellSong, privacy, and unknown/general questions.
- All seven locales return non-empty localized fallback answers; no non-English locale may receive a generic English fallback.
- GLM unavailable, timeout, invalid response, or rate limit leaves the chat usable with a clearly labelled local response.
- Run `npm run build`, `npm run test:server`, `node --check server.mjs`, `git diff --check`, and a source/build secret scan before delivery.
