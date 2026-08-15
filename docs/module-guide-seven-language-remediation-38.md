# Module Guide: Seven-Language Translation Remediation

## Scope

Replace the public-facing legacy English/Chinese fallback behavior across HAINAN QIONGVERSE with deterministic, locale-specific project copy for English, Simplified Chinese, Bahasa Indonesia, Japanese, Korean, Russian, and Arabic. English remains the first-visit default; `qiongverse.language` remains the only persisted visitor value.

## Boundaries

This module covers the shared interface, homepage, cultural halls, Free Trade Port hall, ShellSong, Travel Atlas, Market, Hainan map, source desk, Luoyin desktop pet, and local service states. It does not translate brand marks, filenames, embedded map labels, official organisation names, or canonical external publication titles. Translation does not create travel availability, policy, eligibility, prices, product claims, or official endorsements.

## Implementation Rules

- No selected locale may display the former generic "curatorial copy is available" fallback.
- Project-authored controls and short status text resolve from the local seven-language catalogue.
- Existing legacy records are populated before render and receive a locale-specific curatorial reading, never an English fallback.
- Arabic continues to use root RTL while maps, media, logos, and 3D controls retain their physical orientation.
- No translation service, tracking, new API, browser storage, camera behavior, or personal data processing is added.

## Acceptance

Run `npm run build`, `npm run test:server`, `node --check server.mjs`, `git diff --check`, and source scans for the removed fallback token and English-or-Chinese-only branches. Verify each Hash route with Japanese and Arabic selected, then verify English and Chinese regression paths.
