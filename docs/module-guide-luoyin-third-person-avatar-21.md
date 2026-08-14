# Module Guide 21: Luoyin Third-Person Avatar

## Purpose

This module adds an optional third-person Luoyin guide character to the four existing SPZ immersive halls: Li & Miao Heritage, Wenchang Aerospace, Dongfang Rosewood, and Beautiful Villages. The character is a project-curated navigation layer for Hainan Province storytelling, not a historical person, official mascot, or government representative.

## Asset boundary

`luoyin_body.glb` is preserved as the source asset. Blender 5.2 prepares two web exports with a lightweight armature, skinning, and the `Luoyin_Idle`, `Luoyin_Walk`, `Luoyin_TurnLeft`, and `Luoyin_TurnRight` clips. The exported GLB files are project-supplied AIGC/curatorial assets. Their presence does not establish a partnership, endorsement, product, historical identity, or commercial availability.

The desktop and mobile files are loaded from `/assets/3d/luoyin/` only after the user activates the character. Draco decoder files are served locally from `/draco/`; no third-party runtime request is needed for model decoding.

## Interaction contract

- The character is hidden by default and no character GLB is requested on hall entry.
- `Show Luoyin` loads the appropriate desktop or mobile file on demand and caches the parsed source for the current page session.
- `Hide Luoyin` restores the hall's free Spark camera without storing a preference or position.
- `WASD` and arrow keys move relative to the horizontal camera heading. Hold `Shift` while moving to sprint; press `Space` for a short hop that can be combined with horizontal movement.
- Pointer drag or one-finger touch orbits horizontally and allows only a small, bounded pitch. Wheel and two-finger pinch adjust distance within fixed limits.
- Each hall supplies its own spawn, floor, radius, and rectangular safety bounds. SPZ scenes do not provide a navigation mesh, so the controller does not claim object-level collision detection or permit travel outside the configured safe region.
- The render loop pauses when the component is unmounted or the page switches to the exhibit index. Controller disposal removes listeners, animation mixers, cloned objects, and renderer resources.

## Failure and accessibility states

If WebGL/SPZ loading fails, times out, or falls back to a static reference image, the character control stays unavailable and the existing static exhibit index, guide entry, keyboard navigation, and free-camera fallback remain usable. If the character file or Draco decoder fails after SPZ succeeds, the status reads:

`3D character unavailable. Free camera remains available.`

The control is a keyboard-focusable button with an `aria-live` status. Instructions use English-first bilingual text: `WASD / arrows to walk · drag to orbit · wheel to zoom` and the Chinese equivalent. Reduced-motion preferences do not remove any information or make movement the only way to understand state.

## Privacy and API boundary

This module does not request camera access, use MediaPipe, call a new API, expose an API key, or write to `localStorage`, `sessionStorage`, URLs, logs, or the knowledge base. The existing `/api/luoyin` guide flow remains unchanged and is opened only by the existing Ask Luoyin action.

## Acceptance checklist

- [ ] Four halls start with the character hidden and without a character network request.
- [ ] Activating the button loads the matching GLB and shows `Luoyin ready`.
- [ ] Idle/walk animation, movement, bounded orbit, zoom, and pitch limits work with mouse, touch, and keyboard.
- [ ] Hiding the character restores free Spark camera control.
- [ ] Character load failure leaves the hall usable and reports the fallback message.
- [ ] SPZ failure leaves static media, exhibit index, guide entry, and return controls usable.
- [ ] No user position, preference, camera data, or API key is persisted or sent.
- [ ] 320px, 375px, 768px, and desktop layouts have no horizontal overflow.

Next module: evaluate the four halls together for shared avatar polish and camera tuning before adding any new world or real-world operational integration.
