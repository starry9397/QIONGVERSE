# Module Guide 26: Province SEO and Share Metadata

## Goal

Align the single-page application's document metadata with the Hainan Province
blueprint for social sharing and basic discoverability. The page remains an
English-first project exhibition with Chinese content available in-app.

## Content boundary

- Title and description identify HAINAN∞QIONGVERSE as a project exhibition
  about Hainan Province, tropical culture, AI creativity, and carefully scoped
  public-information orientation.
- Metadata must not claim a government affiliation, official certification,
  tourism availability, policy result, booking service, price, partnership, or
  business outcome.
- The share image is the existing project-supplied homepage hero only. It does
  not become an official Hainan image or a factual source.

## Technical boundary

- Update static `index.html` metadata only and add a minimal static
  `robots.txt`. Do not add an analytics SDK, tracking pixels, external fonts,
  image requests, browser storage, or a router.
- Use relative asset paths so the static preview and deployed base path remain
  compatible. The single-page hash routes need no individual server pages.

## Acceptance

- The document title and description no longer name Dongfang as the complete
  site subject.
- Open Graph and Twitter metadata are present, point to a local project asset,
  and make only project-scoped claims.
- `robots.txt` allows the public entry page without inventing a production
  domain or sitemap.
- Build and diff checks pass with no new network dependency.
