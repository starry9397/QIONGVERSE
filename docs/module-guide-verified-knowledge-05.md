# Module Guide: Verified Knowledge and Source Management

## 1. Module goal

- Module name: Verified Knowledge and Source Management / 已核验知识与来源管理.
- Core user task: a visitor asks Luoyin about the exhibition, culture, travel, policy, or business context and can see whether the response is based on supplied project media, a reviewed public source, ShellSong fiction, or an AI suggestion.
- Project relationship: this module makes HAINAN∞QIONGVERSE / 琼境 a reliable digital exhibition rather than a generic travel chatbot. It gives the four-zone Tide Archive a factual foundation before commercial lead collection is introduced.
- Foreign-user path: English is the first language. A visitor asks a question, receives a short bilingual-ready answer, sees a plain source label and link when a reviewed source supports it, and is directed to the primary source for current, regulated, or transactional matters.
- Module outcome: create a local, versioned knowledge registry and a small retrieval layer that can ground Luoyin without inventing citations or presenting unreviewed web material as fact.

## 2. Content boundaries

### Must appear

- Exactly four source classes: `supplied_project_media`, `verified_primary_source`, `shellsong_fiction`, and `ai_suggestion`.
- A review state on every source record: `reviewed`, `needs_review`, `expired`, or `blocked`.
- A source title, publisher, canonical URL, language, checked date, topic tags, and permitted-use note for every public record.
- The four fixed exhibition zones: Tropical Coast, Li & Miao Heritage, Dongfang Rosewood, and Beautiful Villages.
- A clear current-information notice for Free Trade Port, travel rules, visas, customs, investment, pricing, and business inquiries.

### Must not appear

- Wenchang aerospace content, aerospace navigation, or a fifth exhibition zone.
- Any policy fact, tax treatment, customs rule, visa condition, legal conclusion, or investment promise without a reviewed primary source and checked date.
- Fabricated government partnership, official endorsement, certification, destination, price, inventory, order, visitor metric, review, or commercial outcome.
- AIGC concepts or ShellSong lore presented as history, ethnography, or official culture.
- Scraped, copied, or unlicensed source text beyond a minimal quotation needed for a review note.

### Reality and fiction labels

- `Supplied project media`: project-provided visual material only; it is not evidence for external factual claims.
- `Verified primary source`: an official institution, recognized intergovernmental body, or authenticated first-party source reviewed for a defined statement.
- `ShellSong fiction`: imaginative narrative used only as an explicitly fictional guide layer.
- `AI suggestion`: planning or explanatory language that must not imply official status, current law, price, or availability.

### Out of scope

- This module does not sell tickets or products, collect leads, provide legal or immigration advice, scrape the web at query time, or make a commercial decision.
- It does not create a policy encyclopedia. It only provides a governed registry and the question-answer grounding contract.

## 3. Material rules

### Allowed project paths

| Path | Use | Transformation | Fallback | Review status |
| --- | --- | --- | --- | --- |
| `src/data.ts` | Zone IDs, English/Chinese labels, supplied-media context | Read only | Zone-neutral response | Existing project content |
| `server.mjs` | Server-only grounding and source metadata | Patch only after this guide passes review | Local response | Code reviewed |
| `src/App.tsx` | Compact source label/link in Luoyin drawer | Patch only after this guide passes review | Plain disclosure text | Code reviewed |
| `assets/**`, `public/luoyin/**` | Existing supplied exhibition media and guide identity | No new factual inference; existing display processing only | Existing poster/image fallback | Project-supplied |
| `knowledge/**` | New registry, data structure, and source records | Text only; no source mirroring | Empty-registry state | To be reviewed record-by-record |

### Public-source policy

- A public source is stored as metadata and a canonical URL, not copied wholesale into the project.
- A record may become `reviewed` only after its publisher, URL, scope, date, and permitted use have been checked.
- Initial candidate publishers may include official Hainan Free Trade Port information channels, the Hainan provincial government, China Customs, and UNESCO; candidates remain `needs_review` until their exact page and claim scope are reviewed.
- Do not use search snippets, social posts, secondary travel blogs, stock image sites, or AI outputs as factual authority.
- Desktop and mobile use the same source metadata. If a public URL fails, the UI shows publisher/title text and states that the original source is unavailable.

## 4. Visual system

- Direction: a quiet Shell Paper archive annotation layered into the existing dark digital-museum interface, not a separate dashboard.
- Design temperature: calm, scholarly, and navigable for an international visitor. The source label must feel like an exhibit caption, not a system log.
- Reuse existing visual tokens from `src/styles.css`: Shell Paper for source surfaces, dark ink for copy, Coral Clay only for the active external-source action, Shell Gold for taxonomy labels.
- Typography roles: existing display face for concise source title; body face for explanation; existing mono face for `REVIEWED SOURCE`, check date, and source class.
- Layout: source information stays inside the Luoyin drawer answer region; no cards inside cards, no floating page section, no competing status panel. Maximum readable line length stays within the drawer column.
- Logo: use the existing real wordmark only in the global header/footer; no invented source seal or official-looking badge.
- Avoid generic AI patterns: confidence percentage, generated citation count, fake verified checkmark, dense bento dashboard, purple/pink gradient, and decorative data visualization.

## 5. Interaction and states

- Default: Luoyin accepts a question; the registry selects only reviewed records matching the active zone/topic.
- Success with reviewed source: answer includes one compact source caption and an external-link control labeled by the publisher/title.
- Success without a reviewed source: answer is identified as `AI suggestion` or `Supplied project media`; it does not imply verification.
- Fiction request: source caption states `ShellSong fiction`.
- Loading: existing listening state; no source link until answer metadata is available.
- Error: on unavailable model or registry, show the existing offline fallback and say no verified source was retrieved.
- Empty: a source-neutral prompt remains usable; no fake recommendations.
- Hover/focus/active: external link visibly underlines or changes to Coral Clay; focus ring remains keyboard-visible; pressed state does not shift layout.
- Keyboard: Enter submits, Escape closes the drawer, Tab reaches the source link, and native link behavior opens the canonical source.
- Touch: source link has a minimum 44 px touch target with no hover-only meaning.
- Luoyin behavior: `listening` while waiting; `focus` for cultural material; `resonance` for rosewood; no false certainty animation.
- Motion: source caption fades in with the answer only to clarify answer order. Under `prefers-reduced-motion`, it appears without transition.

## 6. Technical constraints

- Keep React + Vite + TypeScript with the current Node HTTP service and `POST /api/luoyin`.
- Add a structured local registry, preferably `knowledge/source-registry.json` plus `knowledge/data_structure.md`; validate required source-record fields before use.
- Keep retrieval deterministic and local: topic/zone matching against reviewed records only. Do not crawl, search, or fetch unknown public pages in response to a visitor query.
- Suggested response contract: `{ answer, layer, sourceLabel, sourceUrl?, sourceClass, sourceStatus, mode, handoff }`.
- API key remains server-only in `GLM_API_KEY`; never put it in a JSON registry, the React bundle, browser requests, logs, source links, or documentation.
- The upstream model remains fixed to `GLM-4.6V-Flash`; do not introduce model fallback.
- Continue body-size limits, timeout, rate limits, JSON validation, and local fallback.
- Do not add a database, analytics SDK, vector database, unreviewed RAG service, browser-side secret, remote document scraper, or `dangerouslySetInnerHTML`.
- If WebGL, video, image, API, registry parsing, or a public source link fails, the existing exhibition and local fallback remain usable; source metadata failure cannot block the question input.

## 7. Internationalization requirements

- English is default and Chinese is synchronized.
- Every registry record includes English and Chinese title/summary fields where project-authored labels are needed; canonical external source titles must not be mistranslated.
- Long English publisher/title pairs wrap within the drawer and never cause horizontal overflow.
- Use consistent glossary: Virtual Exhibition / 虚拟展厅; Tropical Coast / 热带海岸; Li & Miao Heritage / 黎苗文化; Dongfang Rosewood / 东方花梨; Beautiful Villages / 美丽乡村; Luoyin / 螺音; ShellSong / 螺音虚构叙事.
- Explain Free Trade Port and other policy topics as current information that requires primary-source verification. Do not turn Chinese administrative language into a definitive English promise.

## 8. Acceptance criteria

- Functional: the registry loads; only `reviewed` records can ground a `verified_primary_source` response; unreviewed records never generate a source link.
- Content: exactly four zones; no aerospace content; no fake fact, policy promise, commercial data, or fictitious official endorsement.
- Source: every reviewed record has publisher, canonical URL, checked date, language, scope, status, tags, and use note; URLs are HTTPS and valid at review time.
- Visual: source captions stay compact, use existing tokens, have no nested-card layout, no fake verification badges, and no visual overflow.
- Responsive: desktop and 320 px mobile remain horizontally contained; source links meet touch-target requirements.
- Accessibility: source labels are semantic text, external links have descriptive accessible names, focus is visible, loading/error status is announced, and reduced motion is respected.
- Performance: registry is a small local static file; no new blocking network request or heavyweight dependency.
- Security: scan `src`, `dist`, `knowledge`, and documentation for API keys; browser requests contain no key.
- Search: search `src`, `server.mjs`, `knowledge`, and user-facing content for `文昌航天`, `Wenchang`, `航天`, `aerospace`, and `spaceflight`; no prohibited user-facing content may remain.

## 9. Next action

- Before implementation, verify the guide has no conflict between open-domain answers and reviewed-source-only factual grounding.
- During implementation, pause for user confirmation if a source's publisher, scope, licensing, date, or policy interpretation cannot be verified, or if a decision would collect personal data.
- After implementation, validate source records and URLs, exercise reviewed/no-source/fiction/offline states in English and Chinese, run build and secret scans, then report each acceptance criterion.
- After acceptance, the next module is commercial lead handoff with explicit consent, data minimization, and a human follow-up boundary.
