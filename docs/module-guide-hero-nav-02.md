# Module Revision Guide: Safe hero column and exhibition navigation

## 1. Module goal

- Module name: Tide Archive Hero and primary navigation, revision 02.
- User task: keep the hero introduction inside the supplied image's left negative space and give visitors a clear site-wide navigation model with a single Virtual Exhibition menu containing the four zones.
- Project relationship: the hero remains the threshold into HAINAN∞QIONGVERSE 琼境; the navigation now mirrors a museum website information architecture rather than exposing every exhibition room as a top-level page.
- International visitor path: English-first top navigation leads to Home, Virtual Exhibition, four named zones, and Free Trade Port/archive content; Chinese mirrors the same hierarchy.

## 2. Content boundaries

- Must retain exactly four exhibition zones: Tropical Coast, Li & Miao Heritage, Dongfang Rosewood, Beautiful Villages.
- Must merge the four zone destinations under one Virtual Exhibition control; no fifth zone or extra content domain.
- Must not add aerospace content, unverified policy facts, fabricated official endorsements, prices, inventory, reviews, orders, or partnership claims.
- Hero copy may be rewrapped or recolored for legibility but not expanded with new factual claims.
- This revision does not implement real GLM, CRM, payments, accounts, 3D loading, or new external media.

## 3. Asset rules

- Continue using supplied hero wide and portrait images and existing fallback poster.
- Do not crop, repaint, regenerate, or replace the hero asset.
- The text column must adapt to the image's left safe area; if the image fails, the existing fallback remains active.
- No new third-party assets are introduced.

## 4. Visual system

- Preserve Mangrove Teal, Shell Paper, Coral Clay, Shell Gold, Ink, and deep-night tokens.
- Desktop hero text is a narrow portrait-like column, bounded with `clamp` and aligned to the left safe area; it must not overlap the central textile display.
- Use a warm shell-white/gold text treatment for the hero, with restrained shadow only when needed for contrast; no opaque card behind the copy.
- Navigation keeps the museum archive language: hairline rules, quiet active underline, compact menu panel, no pill controls, purple gradients, or card stacking.

## 5. Interaction and state

- Primary navigation contains Home, Virtual Exhibition, and Free Trade Port. The four exhibition rooms appear in the Virtual Exhibition submenu, not as four peer items.
- Virtual Exhibition menu opens on click and keyboard activation; `aria-expanded` and `role="menu"` state are required.
- Submenu items are keyboard reachable, activate with Enter/Space, close the menu after selection, and route to the selected zone.
- Escape closes the submenu and Luoyin drawer; clicking the backdrop/outside menu closes it.
- Active underline identifies the current top-level destination; zone selection remains visible in the exhibition tabs.
- Hero buttons keep hover, focus-visible, active, keyboard, and reduced-motion behavior.

## 6. Technical constraints

- React + Vite + TypeScript, no new dependency.
- Keep the current data-driven `zones` array and `scrollToTarget` pattern.
- Use semantic links for page/section destinations and a button for the submenu trigger.
- Do not use `scrollIntoView`; honor `prefers-reduced-motion` in scroll behavior.
- No API key, network call, or large GLB load.

## 7. Internationalization

- English remains default; Chinese synchronizes every visible navigation label, submenu label, aria label, and hero text.
- Long English and Chinese labels must wrap inside their containers without horizontal overflow.
- Keep terminology consistent: Virtual Exhibition / 虚拟展厅, Tropical Coast / 热带海岸, Li & Miao Heritage / 黎苗文化, Dongfang Rosewood / 东方花梨, Beautiful Villages / 美丽乡村, Free Trade Port / 自贸港.

## 8. Acceptance criteria

- Hero text remains entirely within the image's left safe region at 1115px, 1280px, and 1440px desktop widths.
- Hero title, body, and actions do not cover the central textile display and do not overflow at 768px or 375px.
- Top navigation has a Home control, one Virtual Exhibition control, and one Free Trade Port control; the four rooms are only inside the Virtual Exhibition menu.
- Menu opens/closes with mouse and keyboard, exposes correct ARIA state, and routes to all four zones.
- Menu and drawer close with Escape; focus states are visible.
- `npm run build` passes; required hero/logo/Luoyin assets resolve; exactly four zones remain; forbidden-content scan is clean.

## 9. Next action

- After implementation, inspect desktop and mobile layouts, open the exhibition menu, activate every submenu item, test Escape and focus behavior, run build/resource scans, and refresh the browser preview.
- Pause only if a safe hero composition cannot be achieved with supplied assets; current asset has a visible left negative field.
- After acceptance, continue with the planned server-side Luoyin/GLM proxy module.
