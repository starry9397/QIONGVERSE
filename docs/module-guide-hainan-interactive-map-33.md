# Module Guide 33: Hainan Interactive Regional Map (Original Baseline)

> Superseded for the visual asset by [Module Guide 34](module-guide-hainan-map-administrative-asset-34.md). The current runtime uses the user-provided administrative-map reference and keeps the source-bounded regional reading and 19 accessible controls defined here.

## Purpose and scope

Build a homepage-only `#hainan-map` reading experience for HAINAN QIONGVERSE. Its user task is to select one of Hainan Province's 19 city/county-level units and read a concise, source-bounded introduction with named places to explore. It is a cultural-tourism orientation layer, not an administrative surveying product, government service, booking tool, live travel planner, or policy adviser.

The covered units are Haikou, Sanya, Sansha, Danzhou, Wenchang, Qionghai, Wanning, Wuzhishan, Dongfang, Ding'an, Tunchang, Chengmai, Lingao, Baisha Li Autonomous County, Changjiang Li Autonomous County, Ledong Li Autonomous County, Lingshui Li Autonomous County, Baoting Li and Miao Autonomous County, and Qiongzhong Li and Miao Autonomous County. Sansha is represented in a separate sea-area inset.

## Design and route contract

- The section is rendered in the home route, after the five-hall gateway and before the Travel, ShellSong, and Market features.
- `#hainan-map` is a shareable in-page anchor, not a new SPA route or server endpoint.
- The desktop exhibition menu and the compact mobile explore menu link to the anchor without adding another desktop top-level item.
- The original visual was a project-authored schematic SVG silhouette. The current visual is the non-destructively archived user-provided administrative-map reference described in Module Guide 34; it is still labeled as a regional reading layer, not an authoritative survey, access, or navigation tool.
- No third-party map SDK, network map tile, geolocation, camera, browser storage, tracking, or new API is permitted.

## Content and evidence gate

- Each region record must include a publisher, HTTPS canonical URL, verification date, source scope, use limitation, and reviewed status before its factual description or named place list is rendered.
- Regional card text may state only the scope supported by its source. It must not state tickets, prices, opening hours, transit, safety, accessibility, accommodation, availability, commercial results, or eligibility.
- Project curation, AIGC material, the ShellSong fiction layer, and broad provincial portals may not be presented as proof for region-specific attractions.
- UNESCO's Li textile record remains limited to its stated cultural scope and must not be used to substantiate unrelated areas or named places.
- The card must direct visitors to verify current public information with the cited official source.

## Localization, accessibility, and resilience

- English is source copy; Simplified Chinese, Indonesian, Japanese, Korean, Russian, and Arabic have complete equivalent project-authored copy. Official source titles and place names remain in their official form where translation could misidentify them.
- The root language preference remains the only permitted browser-stored value. Arabic mirrors reading layout and controls through logical CSS, while the geographic diagram retains fixed geographic orientation.
- Every SVG hotspot is a native button with a translated accessible name, visible focus state, selected state, and normal Tab order. Selection updates a polite live region and moves focus to the card heading only for keyboard activation.
- A non-modal default province card explains how to begin. The card remains usable if SVG styling is unavailable because the region buttons retain text labels.
- Respect `prefers-reduced-motion`; no selection depends on animation. At narrow widths the map precedes the reading card and neither surface may cause horizontal page overflow.

## Implementation and verification

- Keep the data local and type-checked. Do not change server routes, GLM handling, Luoyin, commercial flows, social OAuth, or existing hall resources.
- Add source entries to the source registry and the source-desk only when they meet the reviewed record standard; preserve all user changes already present in those files.
- Verify all 19 controls and the Sansha inset, direct `#hainan-map` access, desktop/mobile menu anchors, seven locales, RTL, keyboard navigation, focus visibility, and static SVG fallback behavior.
- Run `npm run build`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`. Inspect the homepage at 320px, 375px, 768px, 1115px, and 1440px before handoff.
