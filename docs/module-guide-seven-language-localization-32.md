# Module Guide: Seven-language Localization

## Goal

HAINAN QIONGVERSE remains an English-first Hainan Province digital exhibition. This module adds English, Simplified Chinese, Indonesian, Japanese, Korean, Russian, and Arabic across every route, while retaining English as the default for visitors without a saved preference.

## Content and evidence boundary

- Translation mirrors existing project-authored text only. It cannot add cultural, policy, travel, commercial, or official claims.
- UNESCO, CNSA, Hainan Free Trade Port, source publishers, URLs, product/demo boundaries, and AIGC labels retain their existing scope in every language.
- The language selector uses native language names. Brand names, proper names, media labels, and source titles remain unchanged where translation would misrepresent the publisher.

## Privacy and state

- `qiongverse.language` is the sole persistent client-side value introduced by this module. It contains one supported language code and no dialogue, location, form, route, analytics, or account data.
- English is used when storage is unavailable, malformed, cleared, or unselected. A same-origin `storage` event updates other open project tabs.
- No API key, camera, tracking SDK, translation service, remote scraping, or third-party translation request is introduced.

## Interaction and accessibility

- One shared accessible language selector replaces binary EN/Chinese toggles on the root site, six halls, ShellSong, Travel Atlas, Market, and Luoyin chat.
- Root `lang` uses the active BCP-47 tag. Arabic sets root `dir="rtl"`; media and logo assets remain visually unmirrored, while text, navigation order, drawers, and action direction use logical CSS properties.
- Existing keyboard navigation, focus visibility, reduced-motion behavior, screen-reader labels, and hash routes remain usable after a language switch.

## Verification

- Validate all seven locale codes in UI state, persistence, route changes, server validation, Luoyin fallback, travel planner, source desk, social endpoints, and lead receipts.
- Test Arabic RTL and long Russian, Indonesian, Japanese, and Korean text at 320px through 1440px without horizontal overflow.
- Run `npm run build`, `npm run test:server`, `node --check server.mjs`, `git diff --check`, and scan browser storage usage to ensure only `qiongverse.language` is introduced.
