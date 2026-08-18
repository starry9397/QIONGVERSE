# Module Guide: Luoyin Desktop Pet

## Purpose

Replace the root Luoyin drawer with a persistent 2D desktop pet and compact floating conversation panel. The subject remains Hainan Province; Luoyin is an original fictional project guide, not a person, official identity, or service guarantee. English leads and Chinese mirrors project-authored interface content.

## Routes And Reuse

- Render one root-level pet for `#top`, all six immersive halls, `#luoyin-tide`, `#travel-atlas`, and every Market sub-route.
- Reuse root language, guide-zone context, conversation state, `POST /api/luoyin`, `POST /api/luoyin/chat`, source desk, and consent-first handoff behavior.
- Preserve the separate optional 3D Luoyin character in immersive worlds; it remains a spatial interaction and is not a second chat surface.

## Asset And Content Boundary

- Source image: `D:\Lenovo\网页开发2\luoyin\luoyin\luoyin_resonance.png`, supplied project visual, 1254 x 1254 RGB PNG.
- Output: `public/assets/luoyin/luoyin-resonance-deskpet.png`, transparent project-derived visual. It is labelled as an original fictional project guide and does not establish a real, official, cultural, policy, product, price, or availability fact.
- The requested built-in image editor is unavailable in this runtime. Use an edge-connected white-background extraction mask only, without redraw, crop, text, or subject alteration; validate alpha and edges on light, dark, and spatial-world backgrounds.

## Interaction And Accessibility

- A short click opens the floating conversation panel. Mouse left-button hold for 350 ms and touch hold for 450 ms start dragging only after a 6 px movement tolerance.
- The pointer is captured from press through release so a confirmed long press keeps receiving movement after leaving the artwork; default scrolling is still prevented only after drag activation.
- Clamp movement to viewport safe margins. Dragging never opens chat; ordinary touch scrolling is not blocked before drag activation.
- The pet close button hides the pet and panel for the current React session. Existing Ask Luoyin controls restore it and open chat. Position and conversation are never stored in browser storage.
- Closing an automatic page-tour cue with `x` records that cue as dismissed for the current React session, so visibility changes and scrolling do not immediately show the same cue again. Other chapters can still introduce their own cue, and manual chat remains available.
- Each fresh page load starts the pet in the left-bottom safe area. A position chosen by dragging remains only during the current React session.
- Enter and Space open chat, Escape closes it and returns focus to the pet, controls have bilingual accessible names, image failure retains a labelled text trigger, and reduced motion removes pet animation.

## Privacy, Failure, And Layering

- No camera, microphone, media permission, tracking SDK, secret, localStorage, sessionStorage, location, or new server interface is introduced.
- Keep pet and panel above route content but below source desk, handoff, media preview, and immersive detail sheets. Root blocking dialogs temporarily suppress pet interaction.
- Preserve source labels, API fallback copy, rate limiting, and human-confirmation limits already enforced by the guide service.

## Verification

- Run `npm run build`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`.
- Test image alpha, missing-image fallback, mouse/touch dragging, click versus drag, keyboard focus, Escape, close/reopen, bilingual switching, route persistence, modal layering, reduced motion, and 320px through wide desktop layouts.
