# Luoyin API Safety

The browser calls only the local project API. `GLM_API_KEY` is read only by the Node server process and must be injected as a deployment secret after external rotation. It is forbidden in source, committed environment files, browser variables, build output, screenshots, logs, documents, URLs, or responses.

## Supported Contracts

- Legacy compatibility: `POST /api/luoyin` with `question`, `language`, and `zoneId`.
- Normalized contract: `POST /api/luoyin/chat` with `message`, `locale`, and optional page context/interests.
- Both routes enforce body limits, JSON validation, origin policy, rate limiting, timeout, local fallback, source scope, and no-store headers.

Questions, leads, avatar position, dialogue state, and preferences are not placed in browser storage or URL parameters. Lead data never enters GLM prompts. A timeout, upstream failure, malformed reply, or absent key returns a safe bilingual fallback without internal details. Regulated or transactional questions require human confirmation and cannot produce a guarantee.

## Social Publishing Boundary

Social OAuth credentials and access tokens are separate deployment secrets. A visitor-authorized publish uses PKCE, one-time state, short-lived HttpOnly/SameSite cookies, and in-memory server state. Tokens are never returned to JavaScript, persisted, written to logs, or sent to GLM. The social API accepts only allowlisted platform, locale, and asset IDs; it cannot accept visitor captions, arbitrary URLs, account profiles, or upload paths. Platform publishing stays disabled until a production HTTPS base URL, exact callback configuration, platform review, and corresponding secrets are present.
