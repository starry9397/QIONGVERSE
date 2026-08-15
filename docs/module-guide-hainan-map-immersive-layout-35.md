# Module Guide 35: Hainan Map Immersive Layout

## User task and scope

Reshape the homepage `#hainan-map` into a full-width administrative-map reading surface. The visitor's task is unchanged: select one of the 19 city/county-level controls, then read its existing source-bounded regional information. The visual purpose is to make the provided Hainan administrative map the dominant page surface rather than an illustration beside a permanent text column.

HAINAN QIONGVERSE remains a Hainan Province cultural orientation experience. The supplied map remains visual reference media only; it does not substantiate regional facts or operate as surveying, navigation, booking, policy, live-access, or administrative-decision guidance.

## Layout contract

- Remove the visible map eyebrow, heading, and introductory paragraph. Retain an accessible section heading only for screen-reader structure.
- Render the complete map at the full width of the map section and preserve its original aspect ratio so all 19 hotspot coordinates remain valid.
- Place the region reading tool in the map's upper-right sea-area whitespace, sized and positioned so it avoids the western city/county controls and the persistent lower-left Luoyin desktop pet.
- The tool is a single compact, light sea-glass reading surface with copper-gold selection accents. It may scroll internally on short desktop screens; it must not visually imply a separate commercial card system.
- On screens at or below 760px, keep the map fully visible first and move the reading tool below it. No map control, focus ring, long translation, or reading content may cause horizontal overflow.
- Preserve all existing source links, source limitation text, 19 native buttons, `aria-pressed`, keyboard selection, Arabic RTL reading direction, image failure fallback, reduced-motion behavior, and Hash anchor alignment.

## Data, privacy, and implementation bounds

- Do not alter regional facts, sources, selected-place lists, locale persistence, API routes, browser storage, tracking, geolocation, camera, social functions, halls, Travel Atlas, Market, ShellSong, or Luoyin behavior.
- A selected card removes duplicated province-level explanatory copy and emphasizes the selected name, focus, place list, official source, and limitation.
- Keep the map geographic coordinate system LTR even when the surrounding document is Arabic RTL.

## Acceptance

- Inspect desktop and 375px/768px layouts with a selected western region, Wenchang, Sanya, and Sansha.
- Confirm all 19 controls remain inside the map stage and that card placement does not block the Wenchang or Sansha control on desktop.
- Confirm source links, keyboard activation, focus-to-card behavior, direct `#hainan-map`, image-error fallback, and no horizontal page overflow.
- Run `npm run build`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`.
