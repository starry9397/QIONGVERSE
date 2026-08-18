# Travel Atlas Layout Revision Guide

## Scope

- Apply only to the Travel Atlas page layout and its local navigation.
- Remove the redundant travel-column introduction band and the public-information desk band when requested.
- Place the reviewed moving-image archive immediately below the hero so the page opens with a direct visual entry point.
- Rename the island index heading to the user-provided Chinese label `探索无界`; preserve the existing English source label and all reviewed source boundaries.

## Boundaries

- Do not delete reviewed source records, travel planner logic, source ledger entries, or video assets.
- Do not add facts, destinations, booking claims, external scraping, storage, APIs, or tracking.
- Keep the seven-language runtime contract intact; removed sections must not leave navigation links, tour targets, or hash anchors that point to missing content.
- Keep keyboard focus, skip links, responsive layout, RTL behavior, and the desktop pet overlay functional.

## Acceptance

- Travel Atlas renders in the order hero, moving archive, island index, field notes, route planner, culture, signal, source ledger, footer.
- No `travel-desk` section or navigation item remains.
- The index heading renders `探索无界` in the current Chinese view.
- `#moving-archive` is reachable directly below the hero and all three video cards remain available.
- Build, localization, server self-test, syntax, and diff checks pass; no horizontal overflow appears at supported breakpoints.
