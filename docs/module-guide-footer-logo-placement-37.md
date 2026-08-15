# Module Guide: Footer Brand Mark Placement

## Scope

Place the supplied QIONGVERSE logo in the existing empty brand position at the left of the homepage footer. Keep the existing wordmark, archive entry point, social controls, footer code, routes, and interaction behavior unchanged.

## Asset and presentation boundary

The user-provided `logo2.jpg` is copied as a project brand asset without overwriting its source. It is displayed as a contained square mark with its supplied white field retained, rather than being interpreted as an official certification or recreated as a new logo. No factual, policy, travel, commercial, privacy, or data-collection copy changes are made.

## Accessibility and responsive behavior

The mark receives a concise English brand alt label. Desktop layout reserves a fixed visual column before the existing wordmark. On narrow screens the footer remains a single-column stack with a constrained mark size and no horizontal overflow. Arabic layout retains its existing footer direction rules while the visual mark itself remains unmirrored.

## Verification

Run the production build and `git diff --check`; inspect desktop and mobile footer alignment, existing archive action, social controls, and wordmark legibility.
