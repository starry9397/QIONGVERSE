# Module Guide: Foreground HTTP Self-Test

## 1. Module goal

- Module name: Foreground HTTP Self-Test / 前台 HTTP 自测.
- Core user task: verify the real Luoyin and lead HTTP routes without depending on a separately launched background server.
- Project relationship: this is verification infrastructure for HAINAN∞QIONGVERSE, not a visitor-facing exhibition or commercial feature. It makes the AI guide, verified-source path, and consent-first lead handoff testable before deployment.
- Foreign-user path: none. The module creates no visible browser UI or visitor data.

## 2. Content boundaries

- Must test: English normal question, English policy question, Chinese culture question, valid consented lead, and invalid lead rejection.
- Must use the existing `/api/luoyin` and `/api/leads` HTTP routes, not direct function calls.
- Must start on loopback only with an ephemeral port, then close the listener before process exit.
- Must not expose, print, persist, or synthesize a GLM API key.
- Must not call any model other than the fixed `GLM-4.6V-Flash`; if no key is set or upstream is unavailable, the existing usable local fallback is accepted as the expected guide result.
- Must not add aerospace content, a fifth exhibition zone, remote browser control, third-party test libraries, external crawling, lead persistence, or production data changes.
- This module does not claim upstream GLM availability when the upstream provider returns an error.

## 3. Material rules

| Path | Use | Failure fallback |
| --- | --- | --- |
| `server.mjs` | Own server instance, test runner, route requests, safe shutdown | Nonzero exit code and concise test name |
| `package.json` | `test:server` script only | Direct `node server.mjs --self-test` |
| `docs/**` | Test protocol documentation only | No runtime impact |

- No images, videos, models, external source text, or user data are used.
- The test uses synthetic example contact information only.

## 4. Visual system

- No visitor-facing visual change.
- Terminal output is concise `PASS`/`FAIL` plain text, with no payload content or secret-bearing headers.

## 5. Interaction and states

- Default: not running.
- Running: foreground process owns a loopback listener on an ephemeral port.
- Pass: every named check prints `PASS`; listener closes.
- Fail: failed check prints `FAIL`; listener still closes; process exit code is nonzero.
- No keyboard, touch, animation, reduced-motion, or Luoyin-character behavior is introduced because this module has no browser UI.

## 6. Technical constraints

- Keep Node built-ins only.
- Open `127.0.0.1` on port `0` unless `LUOYIN_SELF_TEST_PORT` is explicitly supplied.
- Send JSON POST requests through `fetch` to the actual local routes.
- Preserve `cache-control: no-store`, request validation, rate limits, body limits, and response contracts.
- Start test mode only through `--self-test` or `LUOYIN_SELF_TEST=1`; normal `npm run server` behavior remains unchanged.
- Do not log request payloads, authorization headers, answers, reference codes, or API keys.

## 7. Internationalization

- Exercise English normal and policy questions and one Chinese culture question.
- Test labels stay in English for command-line consistency; visitor copy remains unchanged.

## 8. Acceptance criteria

- `npm run test:server` opens an ephemeral loopback listener, calls both HTTP routes, prints five passing checks, closes the listener, and returns exit code 0.
- English normal, English policy, and Chinese culture requests return non-empty answers, including fallback when upstream is unavailable.
- Valid lead returns an in-memory receipt with a reference; invalid lead returns a rejected status.
- Build passes.
- Secret scan and user-facing forbidden-content scan pass.
- Normal server mode remains able to start without self-test behavior.

## 9. Next action

- After implementation, run `npm run test:server`, `npm run build`, and scans.
- Pause only if test mode leaks a secret, does not close the listener, changes production behavior, or calls an unintended upstream model.
- After acceptance, return to the main roadmap: source-backed partner directory and real operational handoff only after the user designates a data owner and retention policy.
