# Module Guide: React Bits Pro Infinite Gallery

## Scope

- Product: HAINAN QIONGVERSE remains an English-first Hainan Province cultural orientation platform, not a booking, map, policy, or commercial-availability service.
- User task: replace or augment the Travel Atlas island-index visual reading surface with the licensed React Bits Pro Infinite Gallery component.
- Target route and area: `#travel-atlas`, `#island-index`; its images remain project-supplied curatorial context or reviewed-source context according to their existing records.
- Non-goals: do not expose a React Bits license key to the browser, change existing source classifications, add tracking, upload visitor data, or load an unreviewed remote gallery feed.

## Integration boundary

- The package must be installed only through the user-licensed React Bits Pro registry, using `REACTBITS_LICENSE_KEY` as an environment variable in the local install process.
- `components.json` may reference the environment variable but must never contain the license value itself.
- The current application is Vite + React + CSS modules-by-namespace and does not presently use shadcn or Tailwind. Before installing the `-tw` component, verify its Tailwind/shadcn dependencies and avoid global styles that regress the existing Travel Atlas visual system.
- Keep the existing seven-language labels, source boundaries, image alt text, visible focus behavior, reduced-motion behavior, Arabic RTL layout, image error handling, and 320px through 1440px responsive contract.

## Verification gate

- Confirm the install command succeeds with a process-only license variable and leaves no key in source, build output, lockfiles, browser requests, or logs.
- Verify the gallery uses only current local assets, retains image alt text and source status, supports drag/pointer and keyboard access, and supplies a static/reduced-motion fallback.
- Run `npm run check:i18n`, `npm run build`, `npm run test:server`, `node --check server.mjs`, and `git diff --check` after integration.
