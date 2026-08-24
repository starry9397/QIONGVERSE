# Module Guide: Luoyin open-domain API chat

## Goal

All visitor-authored free-text questions in Luoyin chat must be sent to the
server-side GLM path when the provider is configured. Interactive chat must not
return, display, or use a `project_context` or `shellsong_fiction` catalogue
card as the primary answer. The registered automatic world-guide cues remain a
separate background feature and may keep their project-context metadata.

## Strict implementation prompt

Trace both `/api/luoyin` and `/api/luoyin/chat` from request validation through
question classification, GLM prompt construction, response metadata,
provider-failure fallback, and React rendering. Give every interactive question
an open-domain answer mode, except current or personal high-risk questions that
retain a useful general orientation plus official or qualified-human
confirmation. Exclude project-context and fictional catalogue items from the
interactive GLM prompt. Reviewed public sources and concise general-knowledge
notes may be optional support, but the model must answer the visitor's actual
question first. Never expose API credentials, internal prompts, headers,
browser coordinates, movement history, or stored dialogue.

## Public contract

- Interactive GLM responses use `answerMode: open_domain` or
  `regulated_orientation`.
- Provider failures use `open_domain_fallback` and never return
  `sourceClass: project_context`.
- A minimal hidden website-capability block may tell GLM that the current
  Market route is a session-only concept showcase without payment, orders,
  stock or fulfilment, and that Luoyin is not an official representative. This
  block prevents the model from inventing site capabilities; it is not a
  catalogue card, is never returned to the browser, and does not change
  open-domain response metadata.
- Reviewed HTTPS sources may still return `verified_primary_source` metadata.
- The normalized chat response defaults to `open_domain`, never
  `project_context`.
- The frontend defensively normalizes legacy project-card metadata while a
  rolling deployment or stale cache is present.
- `/api/luoyin/auto-guide` remains registered-cue-only and may keep project
  context because it is an automatic exhibit introduction rather than a
  visitor-authored conversation.

## Factual and safety boundary

This change removes project-card interception; it does not claim that a model
can guarantee every live fact. Ordinary science, culture, ecology, craft,
history, technology, and exhibition questions should receive a direct useful
answer. Current policy, visa, tax, customs, medical, legal, personal-safety,
price, inventory, booking, authenticity, and live operational questions still
need current official evidence or qualified human confirmation. Provider
content-safety decisions remain upstream behavior and are not bypassed.

## Failure and privacy behavior

- GLM calls remain server-side, serialized, bounded, and retried only for
  transient provider failures.
- No API key, authorization header, prompt, answer, coordinate, movement trace,
  or dialogue history is logged or shipped in static assets.
- If the provider remains unavailable, reviewed general-knowledge notes may
  answer known topics; otherwise the localized fallback asks the visitor to
  retry without substituting an exhibition context card.
- Browser dialogue state remains session-only React state.

## Verification

1. Prove the former behavior with failing tests for an explicit exhibit
   question on both chat APIs and a simulated upstream GLM response.
2. Confirm the tests turn green after the interactive/background split.
3. Run `node --check server.mjs`, `npm run test:server`,
   `npm run check:i18n`, `npm run build:webify`, `npm run verify:webify`, and
   `git diff --check`.
4. Scan the deployable build for likely credentials and authorization tokens.
5. Test a website-capability question such as “Is the market a real payment
   service?” and require a direct negative answer without project-context
   metadata.
6. Deploy GitHub Pages, CloudBase static assets, and the shared Render backend.
7. Verify both public sites with ordinary knowledge, explicit exhibit,
   project-service, and current regulated questions; no interactive response
   may contain project-context metadata.
