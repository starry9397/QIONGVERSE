# Module Guide: ShellSong Source Replacement

## Objective

Replace the integrated `#luoyin-tide` surface with the user-approved ShellSong experience currently served at `http://127.0.0.1:5173/shellsong.html`. Preserve the current main-site routes, homepage, five-hall wheel, six immersive halls, shared language state, existing Luoyin drawer, and `#top` return target. Hainan Province remains the project subject.

## Approved Source Scope

- Reuse the approved CG hero, origin sequence, character signals, six-state tide diary, and local bubble-poster composition flow.
- Keep the visible `original fictional character` boundary. All narrative references remain fictional ShellSong material, not historical, official, tourism, policy, product, or cultural-fact claims.
- Use `#luoyin-tide` as the only main-site route. The ShellSong header returns to `#top`; it does not create a second router or a separate language store.

## Assets And Runtime Limits

- Copy only the source CG video and the page's already-approved WebP state images. The CG remains route-lazy, uses `preload="metadata"`, and falls back to the existing local hero poster on failure.
- The user has explicitly approved migration of the source page's seven standalone state GLBs. Load only the selected model on demand; do not prefetch the collection from the homepage or from another route.
- Migrate only the locally hosted MediaPipe task and WASM files needed for opt-in hand control. No remote model download is introduced.
- No tracking, browser persistence, remote analytics, API key, payment, CRM, or account state is allowed.

## Interaction And Accessibility

- Preserve English-first and shared Chinese switching, keyboard-operable media controls, heading focus after hash navigation, meaningful image alternatives, visible focus states, and reduced-motion video pause behavior.
- Hand control is opt-in: the camera is requested only after the visitor presses the control; frames remain in the browser; no video frame, landmark, or gesture data is transmitted or stored; stopping control immediately closes every media track.
- Poster generation, sharing fallback, and copy actions remain local browser actions. The page does not upload or retain generated images or captions.
- Validate at 320px, 375px, 768px, 1115px, and wide desktop without page-level horizontal overflow.

## Deliberate Deviation

The standalone source includes opt-in camera hand control and large unoptimized GLB variants. The source's camera control is now included under the user's explicit request, with its original user-activation and local-processing boundaries retained. The user has now also explicitly requested the source GLB area, so the seven approximately 84-94 MB models are restored as on-demand selectable states. A GLB failure shows a status message only and does not automatically replace the selected 3D form with a static image or another model.

## Verification

Run `npm run build`, `npm run test:server`, `node --check server.mjs`, and `git diff --check`. Verify direct `#luoyin-tide` access, video-poster fallback, shared language switch, local poster state changes, return path, no missing assets or console errors, and responsive layout at every required width.
