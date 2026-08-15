# Module Guide 25: Province Governance and Luoyin API Contract

## Module goal

Establish HAINAN∞QIONGVERSE / 琼境 as a Hainan Province digital exhibition,
not a Dongfang-only destination site. Preserve the completed five cultural
halls and separate Free Trade Port public-information hall while documenting
the evidence, source, asset, language, and safety rules that govern future
modules. Add a standards-compatible Luoyin chat alias without breaking the
existing exhibition client.

## Current surfaces and scope

- Existing public hash routes remain canonical for the competition MVP:
  `#top`, `#exhibition`, `#tropical-hall`, `#limiao-hall`,
  `#aerospace-hall`, `#huali-hall`, `#village-hall`, and
  `#free-trade-hall`.
- The five cultural halls are Tropical Island, Li & Miao Intangible Heritage,
  Wenchang Aerospace, Dongfang Rosewood, and Beautiful Villages. The Free
  Trade Port hall is separate public-information orientation.
- Existing SPZ fallback, exhibit reading, optional Luoyin avatar, source desk,
  local lead receipt, bilingual interface, and `/api/luoyin` response remain
  available throughout this module.
- This module does not add unreviewed travel pages, policy statements, CRM,
  email, payment, storage, user accounts, tracking, camera access, or an
  external data recipient.

## Content and provenance boundaries

- English leads; Chinese mirrors every project-authored label and limitation.
- Hainan Province is the primary geographical subject. Dongfang appears only
  inside the supplied Rosewood hall and never proves a province-wide fact.
- Project images, SPZ worlds, posters, brand assets, and concept GLBs are
  project-curated media, not official evidence. Concept GLBs retain their
  AIGC-concept label.
- Only reviewed primary-source records can be returned as verified citations.
  UNESCO, CNSA, and the Hainan Free Trade Port English portal keep their
  present narrow scopes. No record asserts partnership or approval.
- ShellSong and Luoyin are original fiction and must remain labeled as such.

## API contract and security

- Preserve `POST /api/luoyin` with `{ question, language, zoneId }` for the
  existing React drawer.
- Add `POST /api/luoyin/chat` with `{ message, locale, pageContext?,
  selectedInterests?, imageContext? }`. It shares body limits, origin policy,
  rate limits, source selection, timeout, and fallback behavior with the
  legacy route.
- The normalized response contains `answer`, `locale`, `citations`,
  `confidence`, optional `action`, and `safetyFlags`. It cannot expose an API
  key, prompt, authorization header, source-file path, lead data, or server
  internals.
- Regulated, transactional, or eligibility questions receive a source-oriented
  answer and a `human_confirmation_required` safety flag, never a personal
  conclusion.
- `GLM_API_KEY` remains process-only. Key rotation, deployment-secret setup,
  CRM ownership, retention period, and external handoff destination require a
  project-owner decision and cannot be claimed complete locally.

## Documentation and evidence

- Add the province blueprint, AI production log, asset ledger, source register,
  policy verification log, bilingual glossary, API safety note, and legacy
  guide status register under `docs/`.
- Each document distinguishes verified sources from project media, AI concepts,
  and fiction. Asset inventory uses explicit runtime-root coverage so new media
  must be added to the ledger before it becomes user-facing.
- Older module guides remain historical implementation evidence. Their
  four-zone or Dongfang-only scope statements are superseded where the status
  register says so; they are not deleted or silently rewritten.

## Accessibility, performance, and failure states

- The new API has no client-side UI dependency, so the existing accessible
  drawer continues to work through the legacy route.
- SPZ, image, GLB, model, and GLM failures retain the established static,
  readable fallbacks. No state depends on animation under reduced motion.
- No new startup request, browser storage, third-party dependency, or large
  runtime asset is introduced.

## Acceptance

- Blueprint and supporting evidence documents consistently say Hainan Province,
  five cultural halls plus Free Trade Port, English-first/Chinese-synchronized,
  and no unsupported commercial or policy claim.
- Source registry labels project media as a six-hall archive and includes the
  Aerospace hall without upgrading supplied media into factual evidence.
- Legacy and standard chat routes return safe JSON; the standard route returns
  only approved citation metadata and flags regulated questions for human
  confirmation.
- `npm run build`, `npm run test:server`, `node --check server.mjs`,
  `git diff --check`, JSON parsing, and secret/storage/camera scans pass.
