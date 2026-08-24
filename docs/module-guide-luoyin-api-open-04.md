# Module Revision Guide: Luoyin open-domain GLM guide

## 1. Module goal

- Module name: Luoyin Open-Domain API Guide / 螺音开放域 API 导览.
- Core user task: allow visitors to ask Luoyin broad questions in the current language and receive a GLM-generated answer through the protected server endpoint.
- Project relationship: Luoyin becomes the conversational layer across the six-hall HAINAN∞QIONGVERSE experience, while the exhibition remains the visual and cultural source of context.
- Foreign-user path: ask in English by default, switch to Chinese when needed, receive a concise answer with its response mode, and continue exploring without a forced policy/pricing handoff interrupting every question.

## 2. Content boundaries

- The API answers ordinary open-domain questions directly, including science, technology, programming, culture, writing, learning, travel concepts, business concepts, and general knowledge.
- Project knowledge cards are preferred context when they match, but they are not the only allowable subject area. A missing card is not a reason to refuse a normal question.
- A refined decision-boundary gate activates only for current, personal, operational, regulated, or clearly high-risk requests (for example current visa eligibility, live prices, booking, diagnosis, prescription changes, or launch schedules). Educational explanations of a topic remain open-domain.
- The model must not present guesses as verified facts, fabricate official endorsements, invent prices, inventory, orders, reviews, visitor data, legal conclusions, visa guarantees, or partnerships.
- Uncertainty must be stated plainly and the answer should recommend checking an official source when current or regulated facts are requested.
- All six exhibition zones remain available, including the Free Trade Port and Wenchang Aerospace halls.
- The revision removes the old broad keyword-only boundary behavior, while retaining server-side key protection, request limits, timeout handling, source transparency, and non-fabrication instructions.

## 3. Asset and knowledge rules

- Use the existing six-hall context and ShellSong role context as the system prompt grounding.
- Keep `/luoyin/luoyin.png` as the guide identity and retain its image fallback.
- Do not add external media or scrape unverified web content.
- API response includes `layer`, `sourceLabel`, `sourceClass`, `sourceStatus`, `answerMode`, `mode`, and `handoff`. Normalized chat also reports `citations`, `confidence`, and `safetyFlags`; these are metadata, not a substitute for the answer.

## 4. Visual system

- Preserve the existing Shell Paper drawer, Coral Clay action, Shell Gold labels, and compact answer metadata.
- API mode is shown as a calm metadata label such as `GLM guide response`; do not add confidence meters, fake citations, or status dashboards.
- Loading, upstream error, and offline fallback remain visually distinct but quiet.

## 5. Interaction and state

- Default: question input available for any topic.
- Loading: disable duplicate submit and announce listening state.
- Success: display the model answer and mode/source metadata.
- Upstream failure, timeout, quota error, or absent server: show local fallback with an explicit offline label.
- Empty input and invalid requests remain non-submittable or safely rejected.
- Escape closes the drawer; Enter submits; focus-visible and touch targets remain intact.
- Reduced motion preserves state order without animated transforms.

## 6. Technical constraints

- Keep React + Vite + TypeScript frontend and Node built-in HTTP server.
- `POST /api/luoyin` remains the only client endpoint.
- The user-provided key is supplied through the server process environment as `GLM_API_KEY`; never write it to source, `.env` files, logs, bundles, screenshots, or final response.
- `GLM_API_URL` defaults to `https://open.bigmodel.cn/api/paas/v4/chat/completions`; the model remains fixed to `GLM-4.6V-Flash`. Do not substitute another model, even if a model-list response differs or the upstream service is temporarily rate-limited.
- Keep the 24 KiB body envelope, 2,000-character question limit, bounded page/interest/image context, 15-second upstream timeout, rate limiting, JSON validation, prompt-injection handling, and safe fallback.
- Do not log request bodies or authorization headers.

## 7. Internationalization

- English default, Chinese synchronized. The requested language is passed to GLM explicitly.
- The system prompt uses the project glossary: Virtual Exhibition / 虚拟展厅, Tropical Coast / 热带海岸, Li & Miao Heritage / 黎苗文化, Dongfang Rosewood / 东方花梨, Beautiful Villages / 美丽乡村, Luoyin / 螺音.
- Do not translate an uncertain cultural or policy statement into a definitive claim.

## 8. Acceptance criteria

- With a valid server-side key, a normal open question reaches GLM and returns normalized JSON with `answerMode: open_domain`.
- Educational policy, medical, legal, and business concepts receive direct explanations; current or personal decisions receive useful orientation plus a clear uncertainty/verification note.
- Page, hall, interest, and image context can be passed as bounded untrusted metadata and never becomes a trusted fact source.
- Key never appears in `src`, `dist`, logs, source control files, or browser responses.
- Missing key, upstream failure, timeout, malformed JSON, unsupported zone, empty question, and oversized request remain safe and non-blank.
- UI shows GLM mode or local fallback mode in both languages.
- `npm run build` passes; all six halls remain; forbidden-content scan is clean.

## 9. Next action

- After implementation, run the server with the key supplied only in process environment, using `GLM-4.6V-Flash` only. Test a normal question and a policy/business question, verify the client never receives the key, then stop the test process or leave it running only for the local preview.
- Pause if the upstream API contract rejects the model or endpoint; report the exact status without exposing the secret.
- After acceptance, the next module is verified knowledge/source management and commercial lead handoff.
