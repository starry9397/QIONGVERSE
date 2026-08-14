# Module Guide: Verified Source Desk / 已核验来源服务台

## 1. Module goal

- Module name: Verified Source Desk / 已核验来源服务台.
- Core user task: an international visitor moves from the four-zone exhibition to a small, readable directory of reviewed public sources, understands each source's scope and limits, opens the official HTTPS page, and may run a clearly labeled local operational-handoff simulation.
- Project relationship: this is the factual reading layer beside the virtual exhibition. It gives the archive a responsible route outward without turning cultural exploration into a sales dashboard.
- Foreign-user path: English is the default. Open the Source Desk, select a topic, read publisher, scope, check date, and limitation, open the official page when needed, select one existing enquiry intent, consent to a simulation, and receive a local-only reference. Chinese mirrors every visitor-facing label and status.
- Outcome: show two reviewed source and service entry points without claiming they are collaborators, service providers, or endorsements.

## 2. Content boundaries

### Must appear

- Exactly two directory entries: UNESCO's Li traditional textile techniques page and the Hainan Free Trade Port official English portal.
- Publisher, official HTTPS link, checked date, bilingual scope, bilingual limitation, topic labels, and the explicit status `No partnership claim` / `不宣称合作关系`.
- A simulation-only handoff path using one of the existing five intent identifiers and explicit consent.
- A receipt that says no real institution was contacted, no partnership was established, and no booking, order, quote, eligibility decision, or commercial outcome was created.
- Source-link failure guidance that preserves the publisher, scope, and limitation while identifying the official page as currently unavailable.

### Must not appear

- Wenchang aerospace material, aerospace terminology, an aerospace navigation entry, or a fifth exhibition zone.
- Partnership, government endorsement, certification, guaranteed response, official service, price, inventory, booking, order, deal, review, score, or conversion claim.
- A fabricated institution, destination, provider, official source, policy fact, or commercial result.
- ShellSong fiction described as real history, official material, or a source record.
- AI-generated suggestion presented as a verified public source.

### Reality, fiction, and AI distinction

- Source Desk records are reviewed external source metadata with narrow, visible scope and limitation statements.
- ShellSong remains an original fictional guide layer and is not placed in this directory.
- Luoyin answers remain AI or local-guide output; they can link to reviewed records but do not upgrade an answer into a fact.

### Out of scope

- No live content scraping, legal/policy interpretation, booking, payment, CRM, email delivery, webhook, supplier directory, personal merchant listing, account system, or analytics.
- No real human follow-up, retention workflow, or data-owner operation. A future real handoff needs an explicitly assigned controller, recipient, retention period, and privacy notice.

## 3. Material and data rules

| Path | Use | Allowed processing | Failure fallback |
| --- | --- | --- | --- |
| `knowledge/source-registry.json` | Reviewed source metadata and check date | Read only | Directory unavailable state |
| `knowledge/source-desk.json` | Public directory index; only reviewed source references | Read and contract validation | Hide unavailable entries; do not invent replacements |
| `src/App.tsx` | Source Desk sheet, topic selection, intent, consent, and receipt | UI only | Preserve official link metadata and retry affordance |
| `src/styles.css` | Existing Shell Paper archive interface and responsive states | CSS only | Readable single-column layout |
| `server.mjs` | Stateless directory contract and simulation validation | Generate an ephemeral local reference only | Structured local error with no simulated success |
| `public/luoyin/luoyin.png` | Existing Luoyin identity near the entry point only | Existing responsive contain behavior | Existing guide fallback |

- No new remote images, video, models, generated media, or external copied text are introduced.
- Official URLs are stored only as HTTPS canonical links already present in the reviewed registry.
- `source-desk.json` may contain only `SourceDeskEntry` objects with `collaborationStatus: no_partnership_claim`; it begins with the two reviewed primary-source records.
- User inputs are `sourceId`, `intentId`, `language`, and `consent`; no identity, email, message, browser history, IP, source URL, or chat history is submitted to the simulated route.
- Simulated data is not written to localStorage, URLs, logs, knowledge files, databases, email, CRM, webhook, or GLM prompts.

## 4. Visual system

- Direction: a Shell Paper reference sheet pinned to the museum archive, with one generous reading column and thin archival rules rather than a partner dashboard.
- Visual temperature: precise, calm, and slightly ceremonial; the memorable element is a small gold source index that turns source classification into a readable museum catalog.
- Tokens: `--paper` for the sheet, `--ink` for text, `--muted` for limitations, `--gold` for source taxonomy, `--coral` for the explicit simulation action, and `--night` for the modal surround. No new color family is introduced.
- Type: existing Libre Baskerville display face for title and entry names, Manrope for scope/limitation, DM Mono for status, check date, and reference.
- Layout: a desktop two-column entry reading rail (metadata + prose) which becomes a one-column flow at 760px and below; 18px mobile edge padding; no nested cards and no rounded dashboard tiles.
- Logo: use the existing HAINAN QIONGVERSE wordmark only in its existing header/footer role; do not attach it to an institution or imply affiliation.
- Avoid: purple-pink gradients, stat cards, logo walls, certification badges, stock-like partnership illustrations, and repetitive cards.

## 5. Interaction and states

- Default: desk closed; a compact `Verified Source Desk` / `已核验来源服务台` entry is available from the archive note and Luoyin drawer.
- Topic filter: native buttons switch which approved entries are emphasized; `All` is default. Focus, hover, and pressed state remain visibly distinct.
- Source link: opens the HTTPS canonical page in a new tab with `noopener noreferrer`; title, publisher, scope, and limitation remain visible if the link cannot load.
- Simulation: user chooses a reviewed entry, one existing intent, checks consent, then activates `Simulate operational handoff` / `模拟运营交接`.
- Loading: duplicate action disabled; Luoyin state is `listening`; an `aria-live` message says a local simulation is being prepared.
- Success: Luoyin moves to `celebration` for the local receipt only, not for any external outcome. Receipt states `simulation`, local reference, zero persistence, and no real contact.
- Error: preserve selection; identify validation or temporary failure; do not show a reference. Empty topic state gives clear filtering guidance.
- Keyboard: Escape closes and returns to its trigger; Tab reaches filters, official links, intent buttons, checkbox, and submit. Enter/Space activate buttons.
- Touch: controls are at least 44px high.
- Motion: the sheet opens with the existing drawer/sheet motion only; no animation communicates the success state by itself. Under `prefers-reduced-motion`, state changes are immediate.

## 6. Technical constraints

- Stack: React + Vite + TypeScript UI; Node built-in HTTP server; no new dependency.
- Components remain inside the present single-page App boundary: `SourceDesk` state/view, distinct from guide chat and human lead handoff.
- SourceDeskEntry contract:

```ts
type SourceDeskEntry = {
  id: string
  sourceRecordId: string
  displayKind: 'verified_source' | 'service_orientation'
  status: 'reviewed' | 'needs_review' | 'expired' | 'blocked'
  title: { en: string; zh: string }
  publisher: string
  canonicalUrl: string
  topics: string[]
  scope: { en: string; zh: string }
  limitation: { en: string; zh: string }
  collaborationStatus: 'no_partnership_claim'
}
```

- `POST /api/operations/handoff` accepts only `{ sourceId, intentId, language, consent }`, reviewed source-desk IDs, the five existing lead intent IDs, `language` `en` or `zh`, and `consent: true`.
- `accepted: true` means solely that stateless local simulation validation passed. The reference is short-lived and is not stored or logged.
- The handoff handler must not call `upstreamResponse`, GLM, email, CRM, webhook, persistent storage, or the `/api/leads` code path.
- Preserve body limit, loopback server behavior, `no-store`, and safe error responses. Browser requests never contain an API key. GLM remains fixed to `GLM-4.6V-Flash` for guide chat only.
- No WebGL, video, or new image loading is introduced. If JavaScript or the directory fetch contract fails, official links and explanatory static source metadata remain in the rendered UI; if the API fails, no simulation receipt appears.

## 7. Internationalization

- English is default and Chinese is synchronized for heading, filters, scopes, limitations, actions, consent, errors, and receipt.
- Stable terminology: `Verified Source Desk` / `已核验来源服务台`; `official source page` / `官方来源页面`; `simulation only` / `仅模拟`; `no partnership claim` / `不宣称合作关系`.
- Long English publisher names, links, and limitations use wrapping and `overflow-wrap: anywhere`; no horizontal overflow at 320px.
- Explain policy materials as an orientation route for foreign users, not an eligibility, tax, visa, customs, investment, or legal conclusion.
- Do not mechanically translate cultural concepts or use ShellSong story text as a factual cultural explanation.

## 8. Acceptance criteria

- Functional: exactly two approved entries show; filtering, official links, intent selection, consent, simulation, receipt, retry, and close work.
- Source contract: both entries reference reviewed primary records; publisher, HTTPS URL, checked date, scope, limitation, and no-partnership status match the registry. Unreviewed, expired, blocked, unknown, and mismatched source IDs cannot hand off.
- API: `/api/operations/handoff` returns a local `simulation` receipt only for valid reviewed source + valid intent + valid language + explicit consent; missing consent and invalid IDs reject; it never calls GLM or the lead handler.
- Content: no aerospace terms, fifth zone, fictitious endorsement/partner, pricing, inventory, order, booking, rating, guarantee, or unsupported policy fact.
- Privacy: no handoff fields enter GLM, logs, localStorage, URL, registry, or persistent data; no API key appears in source, build, or browser request.
- Visual: archive system is retained, with no nested cards, gradients, logo wall, fake badge, metric, or dashboard.
- Responsive and accessibility: no 320px horizontal overflow; visible focus; keyboard completion; 44px controls; live status; accessible labels; reduced motion is sufficient.
- Performance: no new package or media request; source index is small, no-store HTTP behavior remains.
- Verification: `npm run test:server`, `npm run build`, `node --check server.mjs`, JSON parsing/contract checks, secret scan, forbidden-content scan, handler-separation scan, asset-path checks, and browser checks at desktop plus 320px pass.

## 9. Next action

- Before code changes, self-check that all use cases call the two entries sources rather than partners; a local receipt is never read as external delivery; and the source link itself is not a claim of affiliation.
- Pause and ask the user before adding real contacts, email, CRM, webhook, storage, a named data owner, retention policy, policy/legal advice, institution logo, or any new source record whose review cannot be evidenced.
- After implementation, run the guide's complete functional, privacy, scan, responsive, and route checks.
- After acceptance, the next module is a real operational handoff decision only after the user appoints a data owner, recipient, lawful retention period, and privacy/deletion process.
