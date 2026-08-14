# Module Guide: Commercial Lead Handoff

## 1. Module goal

- Module name: Commercial Lead Handoff / 商业线索交接.
- Core user task: an international visitor can request a human follow-up for one clear purpose: cultural collaboration, responsible travel planning, rosewood/craft inquiry, media partnership, or Free Trade Port information orientation.
- Project relationship: this module turns the verified exhibition into a responsible commercial doorway. It follows the museum-like exploration path and only asks for contact after a visitor explicitly chooses human follow-up.
- Foreign-user path: browse in English, choose an intent, read the scope notice, provide a preferred contact channel and message, consent to follow-up, submit once, and receive a truthful receipt without fabricated availability or deal status. Chinese mirrors every label.
- Module outcome: provide a minimal, consent-first handoff contract for a future CRM or human inbox without implementing a CRM or claiming a completed sale.

## 2. Content boundaries

### Must appear

- Intent choices: cultural collaboration, responsible travel planning, craft/material inquiry, media partnership, and Free Trade Port source orientation.
- English default with synchronized Chinese labels.
- A plain notice that the form requests human follow-up only; it is not an order, booking, visa application, legal consultation, investment approval, price quote, inventory check, or government service.
- Required fields limited to intent, email, and message. Name and organization are optional; phone, passport, ID, payment, precise location, and sensitive personal data are not requested.
- Explicit consent checkbox before submit, with a short retention/use statement.
- Success receipt containing a local reference code only; never invent a response time, staff name, partner, price, or outcome.
- Error, duplicate-submit, offline, and empty states.

### Must not appear

- Wenchang aerospace content, aerospace navigation, or a fifth exhibition zone.
- Fake order numbers, prices, inventory, visitor reviews, conversion metrics, official partnerships, government endorsements, or “guaranteed” human response.
- Automatic submission of chat history, API prompts, source URLs, browsing history, IP address, or the GLM key.
- Collection of passport data, immigration details, payment data, health data, precise location, or unnecessary demographic data.
- A claim that a form submission is a booking, visa request, tax determination, investment approval, or binding commercial offer.

### Reality and fiction distinction

- The exhibition and reviewed source registry remain the only factual context.
- ShellSong fiction may invite reflection but cannot populate a lead field or become a business claim.
- AI suggestions may help a visitor phrase a request but never silently submit it or represent a human decision.

### Out of scope

- No CRM, email provider, payment gateway, calendar booking, ticket sale, inventory, pricing engine, or automated sales qualification.
- No user account, password, cookie-based profile, cross-site tracking, or lead enrichment.

## 3. Material and data rules

### Allowed paths

| Path | Use | Failure fallback |
| --- | --- | --- |
| `src/App.tsx` | Intent picker, consent form, status receipt | Keep browsing and show local retry text |
| `src/styles.css` | Form styling using existing tokens | Plain readable form |
| `server.mjs` | Validate and normalize a lead request; keep it in memory for the MVP | Return a safe unavailable response |
| `knowledge/source-registry.json` | Link policy/source orientation intent to reviewed source metadata | Show source-unavailable notice |
| `public/luoyin/luoyin.png` | Existing guide identity only | Existing image fallback |

### Data minimization

- Payload fields: `intentId`, `email`, `message`, optional `name`, optional `organization`, `consent`, and language.
- Reject unknown fields, oversized payloads, invalid email, missing intent, missing message, and missing consent.
- Normalize whitespace, cap message length, and never log payload contents.
- Store no lead permanently in this MVP. The server returns a short-lived local reference code and a handoff state.
- If a persistent inbox is later added, it requires a separate retention policy, access control, deletion path, and user-facing privacy notice.

## 4. Visual system

- Direction: a Shell Paper “human handoff” sheet attached to the existing Luoyin drawer, visually closer to a museum enquiry card than a growth funnel.
- Temperature: calm, direct, and trustworthy. No urgency, countdown, scarcity, or conversion pressure.
- Reuse tokens: Paper background, Ink text, Coral Clay for submit/action, Gold for intent taxonomy, muted text for retention note.
- Typography: existing display face for the enquiry title; body face for labels and explanations; mono face for intent IDs, status, and local reference code.
- Layout: one-column form within the drawer width; no nested cards, no fake dashboard, no testimonial or logo wall.
- Primary action label: `Request human follow-up` / `请求人工跟进`, never `Buy`, `Book now`, `Invest now`, or `Submit order`.
- Avoid generic AI patterns: neon gradients, fake lead score, chat transcript dump, “instant reply” promise, and decorative analytics.

## 5. Interaction and states

- Default: form closed; one compact `Human follow-up` action is available from the Luoyin drawer and archive note.
- Intent selection: exactly one intent active; keyboard arrow keys and native buttons work.
- Focus: first invalid field receives focus; visible focus ring remains.
- Loading: disable duplicate submit, keep entered values, announce `Sending a handoff request…`.
- Success: close or collapse editable fields, show reference code and explicit “not a booking or guarantee” note; offer return to exhibition.
- Validation error: identify the exact field and preserve values.
- Offline/server unavailable: explain that no request was sent and provide a retry control; do not claim a handoff occurred.
- Consent unchecked: submit is disabled and the consent explanation remains adjacent to the control.
- Escape closes the handoff sheet and returns to the guide drawer.
- Touch: all intent and submit controls are at least 44 px high.
- Reduced motion: no sliding success choreography; state changes appear immediately.
- Luoyin emotion: `focus` while composing, `listening` during submission, `celebration` only for a confirmed local receipt, never for a business outcome.

## 6. Technical constraints

- Keep React + Vite + TypeScript and the existing Node HTTP service. Add `POST /api/leads` as a separate endpoint; do not mix lead payloads with `/api/luoyin`.
- Validate with built-in Node logic; no new dependency.
- The endpoint may return `{ accepted, reference, intentId, mode }` or a structured error. `accepted: true` means only that the local MVP accepted the request in memory.
- Do not send lead data to GLM. Do not include lead data in model prompts, logs, analytics, browser URLs, or source links.
- Keep the GLM model fixed to `GLM-4.6V-Flash` for guide answers.
- Keep body-size limit, rate limit, CORS behavior, no-store headers, and safe offline fallback.
- No database, CRM SDK, email provider, payment service, browser storage, or third-party tracking in this module.
- If the API is unavailable, the form remains usable for editing but cannot display a success receipt.

## 7. Internationalization

- English default; Chinese synchronized.
- Use stable intent glossary: Cultural collaboration / 文化合作; Responsible travel planning / 负责任的旅行规划; Craft & material inquiry / 工艺与材料咨询; Media partnership / 媒体合作; Free Trade Port orientation / 自贸港信息导览.
- Keep “human follow-up” distinct from “official service”, “booking”, and “commercial transaction”.
- Long English labels wrap inside the drawer and never overflow at 320 px.
- Email validation messages and consent copy must be understandable without legal jargon.

## 8. Acceptance criteria

- Functional: user can open the handoff sheet, choose one intent, enter minimal data, consent, submit, and receive a truthful local reference receipt.
- Validation: invalid email, empty message, missing intent, missing consent, oversized message, unknown fields, and duplicate submits are safely rejected.
- Privacy: no lead payload appears in GLM requests, logs, browser URL, local storage, source registry, or client bundle; the API key remains server-only.
- Content: no aerospace content, fifth zone, fake order/price/inventory/review/partnership/response guarantee, or legal/visa/investment promise.
- Visual: form uses existing museum/archive tokens, has no nested cards or growth-hack patterns, and has clear success/error states.
- Responsive: 320 px mobile and desktop have no horizontal overflow; controls meet touch-target size.
- Accessibility: labels are associated, errors are announced, focus is restored after close, keyboard submission works, and reduced motion is respected.
- Performance: no new heavy dependency, no blocking remote request, and no persistent client storage.
- Verification: `npm run build`, `npm run test:server` (foreground same-process HTTP self-test), source/secret scan, forbidden-term scan, and JSON contract checks pass.

## 9. Next action

- Before implementation, self-check that “accepted” means local receipt only and that no user data is sent to GLM or stored permanently.
- Pause for user confirmation if a future CRM, email, retention period, legal privacy text, or external human inbox is requested without an explicit data-owner decision.
- After implementation, run the foreground self-test for English normal, English policy, Chinese culture, valid lead, and invalid lead states; then report each criterion.
- After acceptance, the next module is commercial operations handoff and source-backed partner directory, only after the user confirms the data owner and retention policy.
