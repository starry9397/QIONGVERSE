# Module Guide: Luoyin Tour, Original Voice, and Offline Knowledge

## Module goal

HAINAN∞QIONGVERSE / 琼境 remains a Hainan Province cultural-tourism exhibition and public-information orientation layer. Luoyin (螺音) is an original fictional digital guide, not a person, government identity, professional adviser, booking service, or commercial guarantee.

This module adds light, non-blocking tour cues across the homepage, Hainan map, Travel Atlas, Market, ShellSong, source desk, and six immersive halls. A cue can open the existing Luoyin conversation panel with the current page context. It does not change the existing routes or replace the optional 3D character in immersive halls.

## Tour behavior

- A visible section or authored immersive stop may emit one cue per React session.
- Cues are dismissible and never block scrolling, reading, controls, or modal layers.
- Audio starts only after an explicit user gesture. Route changes cancel pending speech.
- Free-camera guidance uses only authored exhibit IDs and spatial stops. Unknown positions produce a hall-level orientation, never an invented attraction or fact.
- Product guidance describes the project demo boundary and never implies real inventory, payment, order, delivery, or partnership.

## Voice and assets

- The voice is an original synthetic profile: sweet, youthful, and storybook-like. It does not clone a real child or identify a real performer.
- Existing ShellSong video audio remains a project asset and is not used as a cloning sample.
- A server-side TTS adapter may be enabled only with deployment secrets. The browser never receives a provider key.
- Without TTS credentials, the interface remains usable with readable text only; it never calls browser SpeechSynthesis or claims that audio is ready.
- Every generated voice state is labelled as AI-generated voice; no success is shown when synthesis is unavailable.

## Offline knowledge and evidence

- The local catalogue is static, versioned, source-bounded JSON with complete `en`, `zh`, `id`, `ja`, `ko`, `ru`, and `ar` fields.
- It covers project navigation, the six halls, 19 map regions, Travel Atlas, Market, ShellSong, source desk, privacy, AI, and bounded general orientation.
- `verified_primary_source` entries may cite only the registered source scope. Project context, ShellSong fiction, and AI suggestions never prove external facts.
- Current policy, visa, customs, tax, investment, price, inventory, order, availability, safety, and operational aerospace questions require a reviewed source or human confirmation.
- Unknown questions return a localized clarification or inability-to-verify response rather than an unrelated default answer. No web scraping or personal profile is added.

## Privacy, accessibility, and failure

- No new browser storage, camera, microphone, location, tracking SDK, account, CRM, payment flow, or persistent conversation storage is introduced.
- TTS requests are short, rate-limited, bounded, and discarded after the response. Secrets remain process-only deployment values.
- Keyboard focus, Escape, reduced motion, visible focus, screen-reader labels, seven-language copy, and Arabic RTL are required.
- API, TTS, image, GLM, WebGL, or network failure leaves the text guide and existing local fallback usable.

## Verification gate

Run `npm run build`, `npm run check:i18n`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`. Verify tour cues, mobile layouts, seven-language responses, TTS-disabled fallback, no secret leakage, and unchanged CORS behavior for GitHub Pages, Cloudflare Pages, and Webify.
