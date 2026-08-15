# Module Guide 34: Hainan Administrative Map Asset

## Scope and constraints

Replace the homepage `#hainan-map` schematic reference with the newest user-provided administrative-map image. The image is a project-supplied visual asset and is not independently verified as a source for attraction facts, current access, administrative decisions, surveying, or navigation. HAINAN QIONGVERSE remains a Hainan Province cultural orientation experience, not a government service, booking system, live map, or policy adviser.

The module changes only the map visual asset, the 19 overlay control coordinates, related map wording, and asset evidence. It does not change Hash routes, regional reading cards, source URLs, server APIs, browser storage, tracking, geolocation, camera access, social publishing, halls, Travel Atlas, ShellSong, Market, or Luoyin.

## Asset and interaction contract

- Archive the source non-destructively at `public/assets/hainan-map/hainan-administrative-map-user-provided.png`.
- The full `2560 x 1853` image is the exact coordinate space for all controls. Haikou through Sanya align to the main island; Sansha aligns to the lower-right sea-area inset.
- The image is decorative to assist the interaction: its `img` element remains hidden from the accessibility tree while 19 native buttons provide translated names, pressed states, and keyboard activation.
- Hotspot labels remain hidden until hover, focus, or selection so the supplied map labels stay legible. Each target remains visibly discoverable, keyboard reachable, and usable on touch screens.
- If the image fails, a local readable fallback surface and all 19 controls remain available.

## Localization, layout, and validation

- English remains primary, with the existing seven-language UI and Arabic RTL support. Geography stays LTR and must not mirror in RTL.
- The image stage preserves the full source aspect ratio. On narrow screens it appears above the reading card without page-level horizontal overflow.
- The overlay is a cultural reading layer only. Regional facts continue to depend on existing reviewed public-source records and maintain their current limitations.
- Verify the image request, Haikou, Wenchang, Dongfang, Sanya, and Sansha alignment; keyboard selection; direct `#hainan-map`; 320px through 1440px; Arabic RTL; image-error fallback; build; server tests; syntax check; and `git diff --check`.
