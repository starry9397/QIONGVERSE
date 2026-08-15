# Module Guide: UNESCO Source Link Repair

## 1. Goal and scope

- Module: reviewed external-source link repair for the Li traditional textile techniques reference.
- Visitor task: open the reviewed UNESCO source from Travel Atlas, the source desk, and Li & Miao exhibit reading without encountering a stale record URL.
- Project boundary: HAINAN QIONGVERSE remains a Hainan Province cultural-tourism exhibition. This repair changes only the canonical source address for an existing reviewed record.
- Out of scope: new cultural claims, destination advice, service availability, booking, policy interpretation, API changes, source scraping, tracking, browser storage, and all unrelated page layout or interaction work.

## 2. Source and content boundary

- Record: `unesco-li-traditional-textile-techniques`.
- Publisher: UNESCO Intangible Cultural Heritage.
- Canonical record URL: `https://ich.unesco.org/en/RL/traditional-textile-techniques-of-the-li-ethnic-group-spinning-dyeing-weaving-and-embroidering-00238`.
- Permitted statement: the link is a general orientation entry point for the UNESCO-listed Li traditional textile techniques page.
- Prohibited expansion: the record does not establish individual makers, objects, product authenticity, prices, ownership, local availability, travel services, or official endorsement.
- Live publisher limitation on 2026-08-16: the UNESCO site currently redirects this historical detail-route pattern to its English homepage in this verification environment. The project preserves the reviewed record URL and does not proxy, mirror, or substitute publisher content.

## 3. Implementation rules

- Keep bilingual CTA labels, `target="_blank"`, and `rel="noopener noreferrer"`.
- Update the registry, source desk, Li & Miao exhibit source constant, and Travel Atlas source entry in the same change.
- Travel Atlas must derive the visible Living Culture CTA URL from its existing `sourceById` record rather than maintaining another literal URL.
- No AIGC asset, route, personal-data, camera, browser-storage, API, or server behavior changes are permitted.

## 4. Accessibility and failure behavior

- The link remains a native anchor so it is keyboard reachable and announced as an external navigation action.
- If an external publisher is temporarily unreachable, keep the source label and limitations visible; do not substitute a project-authored factual claim.
- This narrow metadata repair introduces no motion or responsive-layout change.

## 5. Verification

- Search source, knowledge, and documentation files to confirm the superseded entry URL no longer appears and `00238` is used consistently.
- Verify the Travel Atlas culture CTA, source ledger, source desk, and Li & Miao exhibit links retain their safe new-tab attributes.
- Run `npm run build`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`.
