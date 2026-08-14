# Module Guide: Li & Miao World Interaction / 黎苗大世界展项交互

## 1. Goal

- Extend the existing Li & Miao Immersive Hall without changing its route or four-room architecture.
- Place image, video and three AIGC model exhibits as a small, spatially distributed set of world anchors over the SPZ scene.
- Let a visitor click or tap an anchor to trigger a tide pulse and open the existing bilingual detail sheet.
- Let an opened model respond to optional local hand gestures: pinch distance changes scale; horizontal hand movement changes rotation.
- Keep the visual hierarchy clear: SPZ world first, six quiet anchors second, reading sheet third.

## 2. Boundaries

- Anchors are project interface objects, not claims that the supplied SPZ contains historic objects.
- Li textile facts remain linked to the reviewed UNESCO source.
- Miao references remain project-provided curatorial context.
- The three GLB files remain \`AIGC concept exhibit / AIGC 策展概念展品\`.
- No prices, stock, orders, reviews, partnerships, official endorsement or unsupported cultural history.
- No new API route, no camera upload, no face recognition, no identity tracking, no storage.

## 3. Material and layout rules

- Use the existing six exhibit records and their verified/project/AIGC labels.
- Anchor positions are intentionally sparse and fixed by CSS so the main SPZ composition remains readable.
- Image anchors use poster thumbnails; video anchors use poster thumbnails with a video label and visitor-initiated playback in the detail sheet.
- Model anchors render a compact GLB preview when WebGL is available and use the matching poster otherwise.
- On small screens anchors become a horizontally scrollable rail; no horizontal page overflow.

## 4. Gesture behavior

- Camera permission is still requested only from the explicit Enable hand gestures button.
- When a model detail sheet is open, pinch distance maps to model scale and horizontal hand movement maps to model rotation.
- A pinch also selects the current exhibit and creates a tide pulse.
- Open palm means explore; fist pauses decorative motion; swipe changes the current exhibit.
- Text instructions are always available in English and Chinese. Mouse, touch and keyboard remain complete fallbacks.

## 5. Acceptance

- The SPZ remains the dominant scene and anchors do not cover the title, controls or exhibit strip.
- Image, video and all three model anchors are visible and keyboard reachable.
- Clicking any anchor opens the correct bilingual detail sheet and pulse feedback.
- Model detail preview responds to wheel/pointer plus pinch scale and hand-driven rotation when gesture mode is active.
- Model fallback poster and video fallback remain usable.
- Camera is not requested on entry; denial leaves ordinary controls usable.
- \`prefers-reduced-motion\` removes continuous particle motion while retaining labels and detail content.
- Build, server self-test, syntax check, asset scan, secret/storage scan and 320px overflow scan pass.

## 6. Next action

After this enhancement is accepted, optimize exhibit-aware Luoyin prompts and answer citations. Pause for approval before adding persistent user accounts, real camera processing services or commercial inventory.
