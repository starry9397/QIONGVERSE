# Module Guide: Contextual Luoyin Fallback and Hero Title Scale

## 1. Module goal

- Module name: Contextual Luoyin Fallback and Hero Title Scale.
- Core task: visitors receive question-specific guide replies when GLM is unavailable, and see a stronger center-right exhibition title.
- Narrative: Luoyin remains a fictional guide for the existing four-zone Tide Archive; the hero remains its visual threshold.
- Foreign-user path: English is default. Visitors can ask about zones, heritage, material, village, policy orientation, aerospace, or a general question, then continue from a labelled reply. Chinese follows the same path.

## 2. Content boundaries

### Must appear

- Deterministic local replies for greetings, coast, heritage, materials, village, Free Trade Port orientation, aerospace, and general questions.
- Clear distinction between local contextual guidance, AI suggestion, reviewed source, supplied media, and ShellSong fiction.
- Larger center-right desktop title with safe mobile reflow.

### Must not appear

- A fifth zone, aerospace navigation, invented history, mission facts, official endorsement, policy conclusion, price, stock, booking, order, partnership, visitor metric, legal, tax, visa, or investment decision.
- A claim that a local fallback is live GLM or a verified source.
- API keys, transcript persistence, browser storage, tracking, remote scraping, new media, opaque text cards, or generic chat bubbles.

### Reality and scope

- Supplied project media stays supplied visual context; ShellSong remains fiction.
- Existing reviewed records are used only within their recorded scopes.
- Local replies are deterministic server fallback, not AI factual advice. This module does not change models, sources, lead handling, handoff, or exhibit scope.

## 3. Material rules

| Path | Use | Desktop/mobile/failure | Source and review | Processing |
| --- | --- | --- | --- | --- |
| server.mjs | Intent-aware fallback and metadata | Works when GLM fails or key is absent | Existing server code | Deterministic mapping only |
| knowledge/source-registry.json | Existing reviewed links/scopes | Source orientation only | Reviewed local registry | Read-only lookup |
| src/App.tsx | Human-readable reply mode label | Existing drawer at all sizes | Existing UI | Text only |
| src/styles.css | Hero title scale | Larger desktop; safe mobile wrap | Existing visual tokens | CSS only |
| existing hero/Luoyin media | Exhibition and guide identity | Existing image fallback remains | User/project supplied | Existing crop only |

- No remote image, copied external text, API key, user identity, transcript, lead, or handoff data is introduced into model requests or storage.
- GLM_API_KEY remains process-only. A missing, invalid, slow, or unavailable upstream must leave the page usable.

## 4. Visual system

- Direction: an exhibition wall title, not a marketing headline or a card.
- Tokens: Night #081416, Shell Gold #e8c987, Coral Clay #c77b4a, Paper #f4efe3, Ink #182022.
- Libre Baskerville gains desktop scale and stays bounded to a two-line measure; Manrope remains explanatory; DM Mono remains utility text.
- The title stays center-right with no opaque panel and returns to the lower in-flow mobile reading plane.
- Avoid purple/pink gradients, stacked cards, bubbles, fake metrics, dashboard treatment, and decorative spacecraft.

## 5. Interaction and states

- On submit append the visitor message, show listening, append one contextual reply, preserve prior transcript, and refocus input.
- GLM success remains labelled as AI suggestion or verified-source orientation; fallback is visibly labelled local contextual guide.
- Empty input is disabled; errors preserve the visitor message; Escape, Tab, Enter, visible focus, touch targets, and reduced-motion behavior remain usable.

## 6. Technical constraints

- Continue React + Vite + TypeScript and the Node built-in HTTP server; no dependency added.
- Keep GLM-4.6V-Flash, the existing endpoint, body/rate limits, and separate guide, lead, and simulated-handoff routes.
- Never return the key through a status response, client bundle, log, or browser request.
- Image, video, WebGL, and API failures must preserve text reading and controls.

## 7. Internationalization

- English default and Chinese synchronized for every response mode and fallback.
- Chinese local replies use direct explanatory wording rather than literal machine translation.
- Long answers and headline text wrap inside the current viewport.

## 8. Acceptance criteria

- Greeting, policy, heritage, material, village, aerospace, and general questions produce nonempty local replies that are not all identical without GLM.
- Existing UNESCO and Free Trade Port links appear only through valid scope matches.
- Two consecutive messages remain ordered and labelled.
- Desktop hero title is larger and center-right; 320px has no horizontal overflow.
- Build, syntax, self-test, secret/storage scans, four-zone count, and route isolation pass.
- No key, fifth zone, navigation item, invented source, or prohibited commercial/factual claim is introduced.

## 9. Next action

- Before edits, confirm that the running server lacks GLM_API_KEY and returns the repeated zone mock.
- Pause for a request for persistent chat, new source record, provider/model change, new exhibition zone, or data collection.
- After implementation, test varied fallback replies, live-mode contract where a process key exists, browser transcript, desktop/mobile hero, and all static checks.
- After acceptance, the next module is authored source-note refinement for the four exhibition zones.
