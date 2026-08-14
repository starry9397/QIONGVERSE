# Module Guide: Aerospace-enabled Luoyin Conversation

## 1. Module goal

- Module name: Aerospace-enabled Luoyin Conversation.
- Core visitor task: ask Luoyin an aerospace or spaceflight question inside the existing guide drawer and receive an explicitly classified AI response without mistaking it for a fifth exhibition room, reviewed archive evidence, policy advice, or an official statement.
- Narrative relationship: the four-room Tide Archive remains Tropical Coast, Li & Miao Heritage, Dongfang Rosewood, and Beautiful Villages. Aerospace is permitted only as an open conversational topic for Luoyin, not as a replacement narrative or a new exhibit.
- Foreign-user path: English remains the default. A visitor asks in English, receives an AI suggestion with a clear source status, and is told when the archive has no reviewed aerospace source. Chinese follows the same rule.

## 2. Content boundaries

### Must appear

- Aerospace and spaceflight questions are accepted by `/api/luoyin`.
- A live GLM answer may provide general orientation when the server credential is configured.
- When no reviewed aerospace source matches, the response remains labeled `AI suggestion; no reviewed source retrieved` or the Chinese equivalent.
- The local fallback gives a topic-aware explanation instead of pretending the existing coastal mock is an aerospace answer.

### Must not appear

- A fifth zone, a new aerospace exhibition, an aerospace navigation item, invented mission facts, launch dates, technical specifications, government backing, official partnership, ticket, price, booking, inventory, legal conclusion, visa conclusion, investment conclusion, or commercial outcome.
- ShellSong fiction stated as real aerospace history or fact.
- A claim that the four-zone supplied archive is a reviewed aerospace source.
- API keys in source code, documentation, generated files, browser requests, logs, or visible copy.

### Reality and fiction

- The existing four-zone supplied media remains supplied project material.
- ShellSong remains fictional world-building.
- Aerospace answers without a reviewed source are AI suggestions and must not be presented as verified fact. Current, regulated, or technical details require a primary official source check.

### Out of scope

- No content, media, 3D model, source-desk entry, fifth zone, model/provider change, persistent chat, lead change, or simulated-handoff change.

## 3. Material and data rules

| Material | Use | Failure fallback | Review status | Transformation |
| --- | --- | --- | --- | --- |
| `server.mjs` | Classify aerospace questions and set a truthful system boundary | Topic-aware local suggestion | Existing server module | Logic and copy only |
| `knowledge/source-registry.json` | Continue to determine whether a reviewed source exists | `ai_suggestion` when none exists | Existing reviewed registry | No new record |
| `src/App.tsx` | Continue rendering response layer and source labels | Existing transcript UI | Existing frontend | No layout change |

- The server sends only the current question, language, and selected zone context to GLM.
- Conversation records stay in React memory only and are not sent as transcript context, stored, logged, or attached to lead/handoff routes.
- API credentials remain process-only in `GLM_API_KEY`.

## 4. Visual system

- Keep the current archive drawer unchanged: Shell Paper for reading, Shell Gold for metadata, Coral Clay for actions.
- An aerospace answer is communicated through the existing textual source label, not a badge, chart, rocket artwork, extra dashboard, or new navigation.
- Keep title, body, utility type, spacing, sharpness, focus, and reduced-motion behavior unchanged.
- Avoid purple/pink gradients, launch imagery used as decoration, fictional infographics, or a stack of response cards.

## 5. Interaction and states

- Default: any nonempty aerospace question is accepted under the same 500-character limit.
- Live: append visitor question, show `listening`, call `/api/luoyin`, append the GLM answer labelled as an AI suggestion if no reviewed source matches.
- Fallback: append a local, topic-aware message explaining that the current archive has no reviewed aerospace source; never substitute coastal copy as an answer.
- Error: preserve prior transcript and return focus to the input.
- Keyboard, touch, focus, Escape close, and reduced-motion behavior remain as in the existing drawer.

## 6. Technical constraints

- React + Vite + TypeScript and the Node built-in server remain in use. No dependency is added.
- GLM remains fixed to `GLM-4.6V-Flash`; `/api/luoyin` remains the only model route.
- `/api/leads` and `/api/operations/handoff` do not call GLM and do not receive chat content.
- Implement topic matching only to choose the safe local fallback. It must not invent source records or bypass the existing source registry.
- The application must remain usable if GLM, video, WebGL, or a media file fails.

## 7. Internationalization

- English default and Chinese synchronization apply to live and fallback aerospace answer labels.
- Use `aerospace` / `spaceflight` and `航天` / `太空探索` as explanatory language where useful, without inventing specialized cultural terminology.
- Long English or Chinese answers must wrap inside the existing transcript and never create horizontal overflow.

## 8. Acceptance criteria

- An English aerospace question and a Chinese aerospace question return a nonempty answer from `/api/luoyin`.
- With no GLM credential, their local fallback is topic-aware and does not use the unrelated coastal mock response.
- With a valid process-only GLM credential, response mode is `glm`; unreviewed aerospace content is labeled `ai_suggestion` with no official source URL.
- The project still has exactly four zones and no aerospace navigation or source-desk record.
- `npm run build`, `node --check server.mjs`, and `npm run test:server` pass.
- API key and browser-storage scans are clean; lead/handoff route isolation stays intact.
- Keyboard submission, sequential questions, mobile wrapping, visible focus, and reduced motion still work.

## 9. Next action

- Before editing, verify that the old restrictions were only project-policy text and that the current code has no aerospace-specific runtime block.
- Pause if the request expands from open conversation to a fifth exhibition zone, a source-desk record, externally claimed factual aerospace material, persistent data collection, or a different model/provider.
- After implementation, test English and Chinese aerospace fallback responses, a normal culture response, source labeling, build, self-test, secret scan, and four-zone count.
- After acceptance, the next module can be a separately sourced aerospace exhibit only if the user supplies or approves primary source material and explicitly requests a new exhibition scope.
