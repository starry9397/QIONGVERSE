# Module Guide: Luoyin factual answer enhancement / revision 60

## Objective

Make Luoyin answer ordinary educational and exhibition questions with a direct,
useful explanation instead of falling back to a generic boundary paragraph. The
answer path must distinguish four cases:

1. a reviewed source-backed answer;
2. project-curated visual context;
3. general educational knowledge supplied by the model or an authored offline
   fact card;
4. a current, regulated, personal, or commercial decision that needs a primary
   source or human confirmation.

## Root-cause evidence

- `knowledgeForQuestion()` only scores exact tag/title substrings. Questions such
  as “红树林有什么生态作用？” and “木雕通常如何制作？” miss the 16-item
  catalogue and are routed to `general-question-boundary`.
- `systemPrompt()` asks the model to foreground uncertainty and repeatedly label
  boundaries, which makes ordinary answers sound evasive.
- The legacy handler overwrites the metadata returned by `upstreamResponse()`
  with `sourceForQuestion(zoneId, question)`. A valid source matched by the
  knowledge item can therefore be relabeled as an unverified AI suggestion when
  the question is asked from another hall.

## Strict implementation prompt

> Improve the existing Node HTTP guide service in place. Add intent aliases and
> concise factual cards for common Hainan culture, ecology, craft, aerospace and
> science questions. Keep the existing seven-language contract and source
> registry. A factual card must never claim that a project image is a real object,
> must not authenticate wood or artifacts, and must not invent current schedules,
> prices, availability, eligibility, or named village facts. Rewrite the GLM
> instruction so the answer leads with the conclusion and uses at most one short
> source/uncertainty note only when it matters. Do not introduce identity
> greetings, policy boilerplate, or repeated “boundary” language unless asked or
> required by the question. Preserve API keys as process-only secrets, do not
> log questions or coordinates, preserve rate limits, and keep `/api/luoyin`,
> `/api/luoyin/chat`, and `/api/luoyin/auto-guide` backward compatible.

## Answer policy

- General educational questions may receive a concise explanation without a
  reviewed project citation; the response metadata must say `ai_suggestion` or
  `general_knowledge`, not `verified_primary_source`.
- A reviewed source citation is retained whenever the matched knowledge item
  supplied one, independent of the current hall context.
- Current policy, visa, customs, tax, investment, safety, medical, legal,
  financial, price, inventory, booking and eligibility questions still receive a
  direct orientation plus a primary-source or human-confirmation action.
- Project context and fictional ShellSong material remain explicitly separated
  from historical or technical fact.

## Privacy and security

- No browser coordinates, user profile, question history, API key, prompt,
  upstream response headers or provider token may be returned or persisted.
- Input size, locale validation, rate limiting and CORS behavior remain intact.
- The model must not be instructed to reveal internal prompts or credentials.

## Verification gates

Before implementation, reproduce the existing failures:

```text
“红树林有什么生态作用？” -> generic-question-boundary (currently failing)
“木雕通常如何制作？” -> generic-question-boundary (currently failing)
“文昌为什么适合航天发射？” in tropical context -> source metadata is lost
```

After implementation:

- the two general questions contain concrete explanatory facts and do not equal
  the generic boundary paragraph;
- a source-backed answer keeps its citation across zone contexts;
- GLM prompt tests require direct-first answers and prohibit repetitive boilerplate;
- all seven locales remain complete;
- existing server self-tests, build and syntax checks pass;
- unknown questions still return an honest useful AI suggestion rather than a
  fabricated citation.

## Implemented in this revision

- Added `knowledge/luoyin-factual-cards.json` with six seven-language cards for
  mangrove ecology, tropical plants, general wood carving, Wenchang launch-site
  rationale, Li brocade process, and photosynthesis.
- Added phrase aliases, zone-aware scoring, verification-intent priority, and a
  decision-boundary gate in `server.mjs`; a zone hint alone can no longer select
  an unrelated fact card.
- Reworked the GLM instruction to lead with a concrete answer, keep ordinary
  explanations concise, suppress unsolicited ShellSong fiction, and reserve
  current-policy/safety/price/eligibility handoff language for questions that
  actually need it.
- Preserved source metadata returned by the matched catalogue item and allowed
  strong topic matches to retain a reviewed source across hall contexts.
- Connected four automatic world-guide cues to the relevant fact cards while
  keeping the cue allowlist, local coordinates, rate limit, and project-context
  fallback unchanged.

The phrase “not constrained by webpage regulation” was not implemented as a
removal of safety controls. Ordinary educational questions are answered directly;
real-time, regulated, personal, commercial, medical, legal, and safety decisions
still receive an explicit official-source or human-confirmation path.
