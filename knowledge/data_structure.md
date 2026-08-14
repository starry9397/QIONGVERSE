# HAINAN∞QIONGVERSE Knowledge Registry

This directory holds structured source metadata for Luoyin. It is not a copied web archive, legal database, or live-search index.

## Files

- `source-registry.json`: records used to label Luoyin answers. Only `reviewed` records with the `verified_primary_source` class can appear as verified public sources.

## Required source fields

Each record must include `id`, `sourceClass`, `status`, `publisher`, `canonicalUrl`, `language`, `checkedAt`, `zoneIds`, `topicTags`, bilingual `title` and `scope`, plus `permittedUse`.

`canonicalUrl` is nullable only for an explicitly labeled project-media or fiction record. Project media supplies exhibition context; it does not validate external claims.

## Review workflow

1. Verify the publisher is authoritative for the intended narrow claim.
2. Verify the HTTPS canonical URL loads and matches that scope.
3. Record the checked date, tags, scope, and permitted use.
4. Mark a record `reviewed` only after all fields are complete.
5. Mark uncertain, inaccessible, or stale material `needs_review`, `blocked`, or `expired`. The runtime will not cite it.
