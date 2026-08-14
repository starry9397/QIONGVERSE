# Module Guide: Hero Focus Repositioning and Live Luoyin Responses

## 1. Module goal

- Module name: Hero Focus Repositioning and Live Luoyin Responses.
- Core visitor task: read the exhibition threshold from the center-right of the supplied hero scene without covering the textile centerpiece, then ask Luoyin a natural question and receive a live model response when the configured service credential is available.
- Narrative relationship: the hero remains the entrance to the four-room Tide Archive. Luoyin remains a fictional guide layer that helps visitors orient to the supplied visual archive and reviewed sources; it is not an authority that replaces official information.
- Foreign-user path: English remains the default. A visitor reads the centered-right title, enters the exhibition or opens Luoyin, asks a question, receives a short labelled response, and can continue in the same in-memory transcript. Chinese stays synchronized.

## 2. Content boundaries

### Must appear

- Hero copy positioned in the center-right reading field, away from the central woven exhibit and with responsive mobile fallback.
- The existing supplied hero image, four exhibition zones, verified source desk, and local-only handoff wording.
- Live GLM response metadata when the server credential works, with a clearly labelled local fallback when it does not.
- ShellSong fiction clearly distinguished from supplied reality and reviewed-source orientation.

### Must not appear

- Wenchang, aerospace, a fifth zone, unverified policy facts, false endorsement, partnership, price, inventory, booking, order, review, visitor metric, or commercial result.
- A claim that Luoyin is an official institution, gives legal or regulated advice, has persistent memory, or can guarantee outcomes.
- API keys in client code, repository files, browser requests, logs, build output, or on-screen content.
- Any extra opaque panel that hides the exhibit or a generic travel-template treatment.

### Reality and fiction

- Supplied project visual material remains a supplied visual archive.
- ShellSong remains fictional world-building.
- Model answers are AI suggestions unless a reviewed source is specifically attached; current and regulated information must be checked against a primary source.

### Out of scope

- No persistent chat, account, voice, camera, browser storage, CRM, real email, webhook, or changes to lead and simulated-handoff semantics.
- No new model or provider: the only model is GLM-4.6V-Flash through the existing server route.

## 3. Material and data rules

| Material | Use | Fallback | Review status | Transformation |
| --- | --- | --- | --- | --- |
| `assets/hero/hero-dongfang-showroom-wide.webp` | Desktop hero scene | Existing loop poster | User-supplied project asset | CSS crop positioning only |
| `assets/hero/hero-dongfang-showroom-portrait.webp` | Mobile hero scene | Existing loop poster | User-supplied project asset | CSS crop positioning only |
| `public/luoyin/luoyin.png` | Luoyin identity | Existing image fallback | User-supplied project asset | Contain crop only |
| `server.mjs` | Server-only GLM proxy | Existing labelled local response | Existing reviewed implementation | No credential source edit |

- The API credential is process-only configuration. It is never copied to `.env`, source, generated files, requests from the browser, or logs.
- The server sends only the current question, selected language, and selected zone context to the configured GLM endpoint. It does not send the transcript, lead fields, handoff data, identity, or browser state.
- Images keep existing error fallbacks. A GLM failure returns the existing labelled local response and preserves the visitor question.

## 4. Visual system

- Direction: a midnight exhibition room with the copy treated as a small illuminated wall text placed at the textile's left shoulder, not a left-column landing-page layout.
- Signature: the hero title aligns to a controlled center-right coordinate while a sparse archival marker remains in the distant left field, making the image feel staged rather than split.
- Tokens: Night `#081416`, Paper `#f4efe3`, Ink `#182022`, Shell Gold `#e8c987`, Coral Clay `#c77b4a`.
- Type roles: Libre Baskerville for title and answers, Manrope for explanatory text, DM Mono for source and archive labels.
- Layout: on desktop use bounded absolute positioning relative to the hero image-safe area; at tablet and mobile return copy to an in-flow, full-width reading column. Use no more than the existing small reading shadow; do not create a card.
- Avoid: purple/pink gradients, repeated rounded cards, large glass panels, artificial statistics, dashboard styling, or text over the main woven motif.

## 5. Interaction and states

- Default: hero actions are available, title is legible, and Luoyin starts with a short local welcome.
- Live response: append the visitor prompt, show listening state, send a request to `/api/luoyin`, then append a labelled `glm` response or a labelled fallback.
- Error: no previous message disappears; input focus returns; the fallback states that it is local.
- Keyboard: Enter submits a nonempty question; Escape closes the drawer; Tab reaches actions, source links, input and send; visible focus remains.
- Touch: controls remain 44px or larger; drawer scrolls independently.
- Motion: image and title positioning do not rely on animation; reduced motion removes nonessential transitions.

## 6. Technical constraints

- Continue React + Vite + TypeScript and the Node built-in server. Use no new runtime dependency.
- Keep `/api/luoyin`, `/api/leads`, and `/api/operations/handoff` strictly separate.
- Model must remain `GLM-4.6V-Flash`. Vite remains a proxy-only frontend and cannot know the credential.
- Read the API credential only from `process.env.GLM_API_KEY`; never create a committed environment file.
- When restarting the local server for this test, inject the credential into that process only.
- A failed upstream request, blocked WebGL/video, or missing image must leave the page usable through text and existing image fallbacks.

## 7. Internationalization

- English stays default and Chinese stays synchronized for hero copy, controls, labels, fallback state, and source status.
- The center-right copy width is bounded so long English and Chinese wording wraps rather than overlaps art or leaves the viewport.
- Terms such as `reviewed source`, `AI suggestion`, `local fallback`, `Li & Miao Heritage`, and `Dongfang Rosewood` retain the existing bilingual wording.
- Culture, policy and business answers use an explanation for international visitors rather than a literal machine translation.

## 8. Acceptance criteria

- The desktop hero copy is visibly center-right and does not cover the central woven motif; left archive detail remains restrained.
- At 320px and normal desktop width, no document horizontal overflow occurs and copy remains readable.
- A live request returns `mode: glm` when the local server has a working process-only GLM credential.
- A second question remains in the session transcript; input refocuses after response.
- API key scan across source, knowledge, documentation and dist finds no literal key; browser-side code does not contain a key.
- `npm run build`, `node --check server.mjs`, and `npm run test:server` pass.
- Prohibited-content scan finds no Wenchang or aerospace terms; there are exactly four zones.
- Focus, keyboard, reduced-motion, source-link safety and fallback response remain usable.

## 9. Next action

- Before edits, verify current hero geometry and that the existing server returns a local mock due to a missing process environment credential.
- Pause for direction if a persistent conversation, voice/camera, user data retention, provider/model change, or a removal of source and safety distinctions is requested.
- After implementation, check live GLM response shape without printing the credential, test a second question, inspect the desktop and 320px hero, and rerun build/tests/scans.
- After acceptance, the next module should be authored content and source-note refinement for the four existing zones; operational persistence still needs an explicit data governance decision.
