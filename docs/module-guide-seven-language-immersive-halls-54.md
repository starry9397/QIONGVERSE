# Module Guide: Seven-language immersive halls

## Scope

This module completes project-authored interface copy and exhibit labels for the five cultural immersive halls plus the Free Trade Port hall. Hainan Province remains the geographic scope; institutional names, brand names, source-site names, and text embedded in supplied media remain original labels where replacement would alter the asset.

## Localization rules

- Runtime copy is authored for `en`, `zh`, `id`, `ja`, `ko`, `ru`, and `ar`.
- English is the first-visit default, not a silent fallback for another locale.
- Arabic follows the existing root RTL direction while image, video, model and map geometry remain LTR.
- Curatorial assets are labeled as project material and do not establish current tourism, policy, commercial, safety, or authenticity facts.

## Privacy, accessibility, and delivery

No new storage, tracking, camera, remote source scraping, API, or personal-data collection is introduced. Existing keyboard navigation, visible focus, dialog semantics, source links, reduced-motion behavior, and static fallback states remain in force. Verify all six hall hashes at mobile and desktop widths.

## Verification

Run `npm run build`, `npm run check:i18n`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`. Cycle all seven locales and confirm the visible hall controls, exhibit strips, index, dialogs, fallback status, and Luoyin controls use the selected language.
