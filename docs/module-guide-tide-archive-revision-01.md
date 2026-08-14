# Module Revision Guide: Luoyin identity and smooth primary navigation

## 1. Module goal

- Module name: Tide Archive Virtual Exhibition MVP, revision 01.
- User task: recognize Luoyin from the supplied `luoyin.png`, open the guide without visual cropping, and move through the primary navigation with predictable smooth positioning.
- Project relationship: this is a refinement of the four-zone digital museum entrance for HAINAN∞QIONGVERSE / 琼境; it does not add a new exhibition domain.
- International visitor path: English navigation remains the default; each label leads to a meaningful existing surface, while Chinese mirrors the same targets.

## 2. Content boundaries

- Must retain exactly four zones: Tropical Coast, Li & Miao Heritage, Dongfang Rosewood, Beautiful Villages.
- Must replace the guide portrait with the user-supplied `D:\Lenovo\网页开发2\luoyin\luoyin\luoyin.png`.
- Must not add aerospace content, a fifth zone, unverified policy facts, official endorsements, prices, inventory, reviews, orders, or fabricated partnerships.
- Reality media, ShellSong fiction, and local mock AI answers remain labeled as separate layers.
- This revision does not implement GLM, CRM, payments, user accounts, 3D loading, or new external media.

## 3. Asset rules

- Allowed identity source: `luoyin/luoyin/luoyin.png` only for the primary guide portrait in this revision.
- Browser URL mapping: `/luoyin/luoyin.png`; the source file stays untouched.
- Desktop and mobile must use the same identity source with `object-fit: contain`, bounded by viewport-relative width and height.
- If the identity image fails, use the existing local `assets/luoyin/luoyin-guide-focus.webp` fallback.
- No crop, repaint, color alteration, or third-party replacement.

## 4. Visual system

- Preserve the night archive, Shell Paper, Coral Clay and Shell Gold token system.
- Luoyin must remain legible as the focal guide object without pushing the drawer beyond the viewport.
- Primary navigation must have a calm, museum-like active underline and a visible focus ring; no pill controls or decorative gradients.
- Preserve the real Qiongverse wordmark and the existing four-zone layout.

## 5. Interaction and state

- Navigation targets: Discover -> top, Virtual Exhibition -> exhibition, Culture & Heritage -> Li & Miao zone, Nature & Villages -> Beautiful Villages zone, Free Trade Port -> archive note.
- Clicking or pressing Enter/Space on a navigation link uses smooth positioning and updates the active underline.
- Keyboard focus remains native; focus-visible state must be obvious.
- Luoyin drawer opens and closes as before; Escape closes it.
- The portrait uses a bounded responsive frame on desktop and mobile; no overflow, clipping, or layout jump.
- `prefers-reduced-motion` disables smooth scrolling and transforms while preserving target order.

## 6. Technical constraints

- React + Vite + TypeScript only; keep data-driven four-zone model.
- Add only the smallest state needed for active primary navigation and target scrolling.
- No API keys, network calls, new dependencies, or large GLB loads.
- Keep fallback handlers for identity media and preserve the existing media fallback behavior.

## 7. Internationalization

- English remains default and Chinese remains synchronized.
- Navigation targets are semantic and identical in both languages.
- Luoyin alt text and labels remain understandable to foreign users; Chinese labels do not overflow.

## 8. Acceptance criteria

- `luoyin/luoyin/luoyin.png` is the primary drawer image source.
- Drawer image remains fully visible at desktop and mobile viewport sizes.
- Every primary nav item has a meaningful smooth target; no item is a dead duplicate link.
- Nav active state updates after click and remains keyboard reachable.
- Escape closes the guide drawer.
- Build passes with `npm run build`.
- Required assets return HTTP 200.
- No forbidden page/source terms and exactly four zones remain.
- No horizontal overflow at 375, 768, 1280, and 1440px.

## 9. Next action

- After implementation, inspect the guide drawer at desktop and mobile widths, test each navigation target with mouse and keyboard, run build and source scans, and confirm asset paths.
- Pause only if the requested local identity asset is missing or unreadable; it is currently present.
- After acceptance, the next module remains the server-side Luoyin/GLM proxy with verified knowledge context and human handoff.
