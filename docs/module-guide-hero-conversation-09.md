# Module Guide: Immersive Hero and Continuous Luoyin Conversation

## 1. Module goal

- Module name: Immersive Hero and Continuous Luoyin Conversation / 沉浸式首屏与螺音连续对话.
- Core user task: visitors immediately understand HAINAN∞QIONGVERSE as a full-width Dongfang digital exhibition, enter the four-zone archive from a legible but expansive hero, and hold several consecutive questions with Luoyin without losing previous dialogue.
- Project relationship: the hero is the exhibition threshold; the continuous conversation is the guide layer that supports exploration, reviewed-source orientation, and later human handoff without replacing those distinct flows.
- Foreign-user path: English default user reads the title over an uncluttered wide image, notices quiet archival navigation marks in the image-safe left margin, opens Luoyin, asks a question, reads a labeled answer, asks again, and keeps the prior exchange in view. Chinese remains synchronized.

## 2. Content boundaries

### Must appear

- A full-width horizontal hero at desktop with a larger, spacious title treatment and readable action controls.
- A restrained left-margin archive notation that supports the supplied hero visual without covering the central textile object.
- A chronological, visibly separated conversation transcript in the Luoyin drawer.
- Per-answer AI/source labels already returned by the guide route; an offline fallback remains labeled as such.
- Existing four zones, verified source desk, source limitations, local-only simulation, and human follow-up entry stay available.

### Must not appear

- Wenchang aerospace content, a fifth zone, unverified policy claim, false endorsement, fabricated partner, price, stock, booking, order, review, visitor metric, or transaction outcome.
- ShellSong fiction presented as history or a real cultural source.
- A fabricated chat history, fake typing indicator, false real-time human presence, or a claim that the assistant remembers a user beyond the current in-memory drawer session.
- Dense decorative elements, gradients, floating blobs, a card-in-card hero, or text that obstructs the primary supplied exhibit image.

### Reality and AI distinction

- Hero photography remains supplied project media.
- The new left-margin notation is an interface label only, not a factual caption.
- Luoyin answers remain AI suggestion, local preview, or reviewed-source-oriented output according to their existing response metadata; each message retains that label.
- ShellSong remains explicitly fictional in guide content.

### Out of scope

- No persistent chat account, browser storage, server-side chat history, profile, speech input, voice synthesis, new GLM model, or change to source/lead/handoff rules.
- No changes to official source directory records or real operational handoff.

## 3. Material and data rules

| Path | Use | Failure fallback |
| --- | --- | --- |
| `assets/hero/hero-dongfang-showroom-wide.webp` | Desktop full-bleed hero image | Existing loop poster image |
| `assets/hero/hero-dongfang-showroom-portrait.webp` | Mobile hero image | Existing reduced or poster image |
| `public/luoyin/luoyin.png` | Existing drawer guide identity | Existing Luoyin webp fallback |
| `src/App.tsx` | Hero annotation and local in-memory transcript | Existing single answer becomes a local transcript message |
| `src/styles.css` | Hero and drawer transcript layout | Single-column, readable mobile flow |
| `server.mjs` | Existing guide route and HTTP self-test only | Existing local fallback response |

- No new remote media, copied external copy, model asset, API key, or tracking asset is introduced.
- Messages live only in React state for the open browser session and are never put in localStorage, a URL, logs, the knowledge registry, lead data, or handoff data.
- Existing poster and image fallbacks remain available.

## 4. Visual system

- Direction: an expansive digital-museum threshold, as if an archive label has been moved to the edge of the exhibition wall rather than placed on top of an artwork.
- Design Read: extension mode; authoritative and quiet visual temperature; image dependence 9/10; motion 2/10; information density 4/10; brand fidelity 9/10.
- Tokens: retain Night `#081416`, Paper `#f4efe3`, Ink `#182022`, Shell Gold `#e8c987`, Coral Clay `#c77b4a`, and existing muted/line tokens.
- Typography: Libre Baskerville anchors the large hero title and answer text; Manrope carries explanatory text; DM Mono carries archival notation, source labels, and timestamps/order markers.
- Layout: desktop hero copy may occupy a broad left-side reading plane with a controlled maximum line length, while the central image remains open. The left blank field receives only a thin vertical index, a small shell contour, and zone cue text. On mobile the annotations collapse before the title can compete with the portrait image.
- Conversation: messages are unframed reading blocks separated by archival rules, never stacked rounded chat bubbles or nested cards. User prompt is small mono text; answer is a clear serif reply beneath it.
- Avoid: gradient hero, purple/pink color treatment, generic travel marketing copy, oversized opaque text panel, repetitive message cards, and decorative metrics.

## 5. Interaction and states

- Default hero: wide image, clear title/actions, noninteractive archive notation.
- Hero actions: exhibition action preserves reduced-motion-aware scrolling; Luoyin action opens the drawer.
- Conversation default: a short local guide welcome is shown; transcript becomes scrollable only when required.
- Submit: append the visitor question immediately, disable duplicate send, show one labeled loading line, append the returned answer and metadata, then retain focus in the input for the next question.
- Error: append a labeled local fallback answer; do not erase prior conversation or claim delivery.
- Empty: disabled send remains clear; Enter submits a nonempty prompt.
- Keyboard: Escape closes the drawer; Tab reaches transcript links, source desk, lead action, input, and send; focus returns to the trigger on close when feasible.
- Touch: drawer controls remain at least 44px.
- Luoyin state: `listening` during an outbound question, `focus` for Li & Miao content, `resonance` for rosewood, and no celebration for a mere answer.
- Reduced motion: no state is conveyed only by animation; title, transcript and responses appear without transition dependence.

## 6. Technical constraints

- React + Vite + TypeScript and the existing Node built-in server remain in use; no new dependency.
- Represent each local transcript entry with `id`, `kind`, `text`, `layer`, source metadata, and status. Keep only a modest in-memory session limit (for example 12 exchanges) to protect layout and avoid presenting indefinite memory.
- `/api/luoyin` remains the only guide route. Do not send transcript, lead, simulation, source-desk selection, API key, or user identity to it.
- Do not change the fixed guide model `GLM-4.6V-Flash`, rate limit, body limit, source route, lead route, or simulated handoff route.
- Hero image keeps responsive `<picture>` selection; no WebGL or video is added.
- If the guide API or a hero image fails, the existing local fallback remains usable.

## 7. Internationalization

- English default, Chinese synchronized for hero note, conversation state, message labels, error/fallback language, source labels, and controls.
- Long English title and messages wrap within their reading plane; technical source URLs wrap safely.
- `verified source`, `AI suggestion`, `local guide preview`, and `offline fallback` retain their established meanings in both languages.
- No direct machine translation of cultural concepts is added; the existing bilingual content stays the source of wording.

## 8. Acceptance criteria

- Hero: desktop copy is wider and visually decisive; supplied artwork remains unobstructed; left margin has restrained adaptive detail; mobile stays readable and overflow-free.
- Conversation: user can ask at least two consecutive questions; both prompts and answers remain visible, ordered, labeled, and keyboard-operable; no prior exchange is overwritten.
- Resilience: duplicate send is blocked during loading; errors append a fallback message; current input is preserved on network failure; source links retain safe target/rel attributes.
- Privacy: no transcript, API key, lead data, or handoff data is written to storage, URL, logs, or unrelated API request.
- Content: four zones only; no aerospace or prohibited commercial/factual claims.
- Accessibility: semantic transcript list, live response announcement, visible focus, mobile touch targets, Escape close, and reduced motion behavior.
- Verification: `npm run build`, `npm run test:server`, `node --check server.mjs`, secret and prohibited-content scans, plus desktop and 320px browser checks pass.

## 9. Next action

- Before implementation, verify that expanded hero copy does not cover the central exhibit, and continuous conversation remains session-only rather than persistent memory.
- Pause for confirmation if the user requests persistent chat memory, voice/camera, real data collection, a different AI provider/model, or new factual source material.
- After implementation, test two consecutive English questions, an error/fallback path, source link focusability, desktop hero balance, and 320px layout.
- After acceptance, the next module should be selected from the content roadmap; real operations integration still requires a designated data owner, retention policy, recipient, and privacy/deletion process.
