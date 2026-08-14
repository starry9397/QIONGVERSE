# Module Guide: Hainan Free Trade Port Hall / 海南自由贸易港展厅

## 1. Module goal

- Module name: Hainan Free Trade Port Hall / 海南自由贸易港展厅.
- Core user task: an international visitor moves from the HAINAN QIONGVERSE archive into a calm, bilingual orientation room, understands that the room is an information gateway rather than a promise, and opens the reviewed official English portal for current notices and policy materials.
- Project relationship: this is the province-level policy reading layer beside the four cultural rooms. Hainan Province is the primary subject; Dongfang remains one local scene within the wider provincial story.
- Foreign-user path: English first -> choose Free Trade Port in the primary navigation -> read the orientation wall -> understand scope and limits -> open the official HTTPS portal -> return to the archive or ask Luoyin. Chinese mirrors every visitor-facing label.
- Narrative role: connect cultural discovery to responsible public-information literacy without turning the museum archive into a sales dashboard.

## 2. Content boundaries

### Must appear

- Province-level wording: Hainan Province / 海南省 as the overall destination and communication subject.
- The phrase `orientation` / `信息导览`, not legal, tax, visa, customs, investment, or eligibility advice.
- The reviewed source: Hainan Free Trade Port official English portal, with publisher, checked date, canonical HTTPS link, scope, and limitation.
- A clear statement that the page is a project reading layer and does not claim government endorsement, partnership, eligibility, guaranteed response, or commercial outcome.
- A route back to the four-zone exhibition and Luoyin.

### Must not appear

- Fabricated policy facts, rates, dates, quotas, eligibility rules, tax outcomes, visa outcomes, customs outcomes, investment approvals, prices, inventory, orders, bookings, testimonials, conversion data, or guaranteed response.
- Any claim that HAINAN QIONGVERSE is an official government website, partner, service provider, or certified operator.
- Any fictional ShellSong or Luoyin statement presented as policy, law, history, or official material.
- A fifth cultural zone. The existing four zones remain unchanged.

### Reality, fiction, and AI distinction

- The Hainan Free Trade Port portal is a reviewed external primary-source entry point.
- `main-hall-policy-timeline.jpg` is a project-supplied visual context asset, not an official timeline or policy document.
- Luoyin can explain the page's scope and point to the source, but AI output is not an official interpretation.

### Out of scope

- No live scraping, policy calculator, eligibility form, booking, payment, CRM, email, legal advice, investment advice, or real operational handoff.
- No new institution logos or copied long-form policy text.

## 3. Material and data rules

| Path | Use | Review / processing | Fallback |
| --- | --- | --- | --- |
| `assets/user-media2/main-hall-policy-timeline.jpg` | Main visual texture for the policy reading wall | Project-supplied; crop and compress for presentation only | `assets/hero/hero-dongfang-showroom-wide.webp` |
| `assets/brand/qiongverse-wordmark-en.svg` | Existing brand header/footer | Real project logo; do not attach to government identity | Existing text wordmark |
| `knowledge/source-desk.json` | Reviewed source metadata and canonical URL | Read-only; use the existing reviewed Hainan Free Trade Port entry | Preserve a text-only source record |
| `knowledge/source-registry.json` | Checked date and scope reference | Read-only; no new policy claims | Show `date not available` rather than inventing one |
| `assets/luoyin/luoyin-guide-listening.webp` | Small guide identity near the exit to Luoyin | Existing project asset | Existing `/luoyin/luoyin.png` fallback |

- No new remote assets, hotlinks, or third-party copied policy material.
- Do not alter source files. CSS cropping, responsive sizing, and image compression are allowed.
- Official HTTPS source is opened in a new tab with `noopener noreferrer`; if it fails, the local scope and limitation remain visible.

## 4. Visual system

- Direction: a province-level reading chamber attached to the existing digital museum archive: deep night entry, Shell Paper document field, Shell Gold source markers, Coral Clay action.
- Visual temperature: composed, civic, and human; no institutional impersonation and no dashboard treatment.
- Tokens reuse existing `--night`, `--paper`, `--ink`, `--muted`, `--gold`, `--coral`, and `--line`.
- Typography reuses the existing display serif for the hall title, readable sans for explanatory copy, and mono for source labels and checked dates.
- Layout: full-width dark introduction band, then a two-column paper reading panel; single column below 760px; 8px spacing rhythm; 4px media radius; no nested cards.
- Logo appears only as the existing HAINAN QIONGVERSE wordmark in navigation and footer.
- Avoid purple-pink gradients, partner-logo walls, stat cards, fake badges, rounded SaaS tiles, and decorative data visualizations.

## 5. Interaction and states

- Default: the hall is visible after the archive note; primary navigation `Free Trade Port` scrolls directly to it.
- Hover / focus: source link and archive-return controls gain visible underline, color, and focus ring.
- Active: source link and return-to-archive button retain a pressed state without changing layout.
- Loading: no blocking network load; the source link opens normally.
- Error: if the image fails, use the hero visual; if the official page is unavailable, retain the publisher, scope, limitation, and a local `original page currently unavailable` note.
- Empty: never hide the source record; show a text-only reading field.
- Keyboard: Tab reaches navigation, source link, source desk button, and Luoyin button; Enter activates; Escape closes any open drawer/modal.
- Touch: controls are at least 44px high and the panel becomes one readable column.
- Luoyin feedback: opening the guide uses `listening`; the hall copy invites source questions but never claims official authority.
- Motion purpose: gentle section reveal and source-link emphasis only. Under `prefers-reduced-motion`, transitions become immediate and no state depends on movement.

## 6. Technical constraints

- React + Vite + TypeScript. Keep the existing single-page component boundary and data-driven copy object.
- Add one semantic section (`id=free-trade-port-hall`) and one small data object or copy branch; do not refactor the four-zone state machine.
- Reuse the existing `scrollToTarget` navigation helper; no `scrollIntoView`.
- No new dependency, API route, storage, cookie, analytics, or API key.
- The only factual source link is the existing reviewed Hainan Free Trade Port source. It is not sent to GLM as an untrusted user URL.
- Image requests are lazy where practical and never block the rest of the page.
- If CSS or image support fails, the text source record and official link remain usable.

## 7. Internationalization

- English is the default; Chinese is synchronized for headings, body copy, source labels, checked date, limitations, buttons, and fallback text.
- Stable terms: `Hainan Free Trade Port` / `海南自由贸易港`; `official English portal` / `英文官方门户`; `orientation` / `信息导览`; `reviewed source` / `已核验来源`; `not official advice` / `不构成官方建议`.
- Long English source labels and URLs wrap with `overflow-wrap: anywhere`; no horizontal overflow at 320px.
- Explain the policy path for international visitors in plain language without translating legal concepts into a false guarantee.

## 8. Acceptance criteria

- Functional: top navigation reaches the hall; archive note and footer can return to the hall or open Luoyin; source link opens the canonical HTTPS page.
- Content: province-level positioning is visible; no unsupported policy fact; no partnership, endorsement, price, order, inventory, eligibility, tax, visa, customs, investment, or guarantee claim.
- Source: the portal URL and checked date match the reviewed registry; the image is labeled as project-supplied context.
- Visual: existing museum archive frame is preserved; the hall does not become a dashboard or nested card stack.
- Responsive: no horizontal overflow at 320px, 375px, 768px, or desktop widths; title and long source labels wrap cleanly.
- Accessibility: semantic heading hierarchy, visible focus, keyboard activation, adequate contrast, 44px controls, and reduced-motion fallback.
- Safety: no API key, no storage, no new external requests beyond the existing official source link.
- Build: `npm run build`, `npm run test:server`, `node --check server.mjs` pass; asset paths resolve; the full-text scan finds no stale claim that the website is only for Dongfang City in this new module.

## 9. Next action

- After implementation, check the section at desktop and 320px, verify the official source URL, scan for unsupported policy claims, and confirm the existing four-zone exhibition remains unchanged.
- Pause before adding policy facts, official logos, eligibility tools, real contacts, or live data feeds.
- After this module is accepted, the next module can connect the province-level policy reading layer to a reviewed multilingual knowledge context for Luoyin.
