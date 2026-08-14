# Module Revision Guide: Hero vertical left composition

## 1. Module goal

- Module name: Tide Archive Hero / vertical left composition, revision 01.
- User task: move the hero introduction into the intentional blank area on the left side of the supplied showroom image, using a narrow portrait-like composition that remains readable at every viewport.
- Project relationship: the hero is the threshold into the four-zone Tide Archive; the composition should make the museum entrance feel authored rather than letting text float across the artifact image.
- International visitor path: English remains the default, with the same narrow column carrying the Chinese mirror copy; visitors should read identity, thesis, then enter or call Luoyin.

## 2. Content boundaries

- Preserve the current hero copy, two actions, image caption, and four exhibition zones.
- Do not add a new story, statistic, policy claim, commercial claim, fifth zone, or new visual asset.
- Do not hide the hero thesis behind a decorative panel; the content remains directly over the image/blank field.
- Reality media, ShellSong fiction, and AI mock guidance remain separated as in the base guide.

## 3. Asset rules

- Use the existing wide hero image on desktop and portrait hero image on small screens.
- Keep the existing loop-poster fallback for image failure.
- No crop, repaint, image generation, or third-party material in this revision.
- Desktop composition must sit in the image's left negative space; mobile composition may return to a full-width reading column because the left negative space no longer exists.

## 4. Visual system

- Preserve Mangrove Teal, Shell Paper, Coral Clay, Shell Gold, Ink, and deep-night tokens.
- Desktop hero content is a narrow vertical stack, approximately 210-270px wide, aligned to the left safe area and vertically centered toward the lower half.
- Title remains horizontal and readable; “vertical” means a portrait-like stacked composition, not rotated glyphs or `writing-mode` for English copy.
- Actions become a compact vertical rhythm on desktop; mobile actions remain inline when space permits.
- Avoid card framing, pill UI, large gradients, excessive shadow, and overlap with the hero artifact.

## 5. Interaction and states

- Enter exhibition keeps the existing smooth scroll and reduced-motion behavior.
- Listen with Luoyin keeps opening the guide drawer.
- Buttons retain hover, focus-visible, active, and keyboard states.
- On narrow screens, content remains in normal flow over the portrait hero image with no clipping or horizontal scroll.
- Reduced motion removes the hero composition transition if one is introduced; no new motion is required for this revision.

## 6. Technical constraints

- React + Vite + TypeScript; CSS-first layout adjustment with no new dependency.
- Keep `.hero-content` in the existing hero section and do not change data contracts.
- Use responsive `clamp`, `min`, and `max` dimensions; avoid viewport-scaled text that becomes unreadable.
- Preserve current asset error handlers and navigation logic.

## 7. Internationalization

- English default; Chinese synchronized.
- Long English hero titles must wrap inside the narrow column without overflow.
- Chinese title may use two to four balanced lines; no forced character-by-character rotation.

## 8. Acceptance criteria

- At desktop widths, the hero content is visibly contained in the left image negative space and no longer sprawls across the central artifact.
- The text block reads as a portrait/vertical composition with clear eyebrow, title, body, and actions.
- At 375px and 768px, content remains legible, actions remain reachable, and there is no horizontal overflow.
- Hero image remains the first-viewport signal; text does not occlude the main textile display more than necessary.
- Build passes with `npm run build`.
- Required hero assets still resolve and fallback remains present.
- Page source still has exactly four zones and no forbidden content.

## 9. Next action

- After implementation, inspect 1440px, 1115px, 768px, and 375px layouts, verify text wrapping and button targets, run build and forbidden-term scans, and refresh the browser preview.
- Pause only if the supplied hero asset cannot provide a usable left negative space; current assets visibly provide one.
- After acceptance, continue with the planned server-side Luoyin/GLM proxy module.
