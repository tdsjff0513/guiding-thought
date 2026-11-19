# Guiding thought Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Host-only DSH bundle that, with zero human participation, recognizes a major-direction moment and puts the guiding thought into *this turn*.

**Architecture:** Pure modules decide *what* the thought is and *whether* this text is a major direction. A third module rewrites `agent/pre-step` enter-decisions and attaches `tools/post-execute` `additionalContexts`. `apply()` only registers those two waterfalls per agent. No deny, no ask, no guard, no followup, no `systemPrompt.section()`.

**Tech Stack:** ESM JavaScript, `node --test`, DSH 0.2.2-rc.3 Host plugin (`export function apply`, `inject: ['tools']`).

**Spec:** [docs/superpowers/specs/2026-11-19-guiding-thought-design.md](../specs/2026-11-19-guiding-thought-design.md)

## Global Constraints

- Target runtime: installed DSH `0.2.2-rc.3`, Desktop `PROFILE=desktop`.
- Host-only bundle at `dsh-bundles/guiding-thought/`, package name `@local/guiding-thought`, plugin id `guiding-thought`.
- No UI, no `export const Config`, no user-facing switch.
- Never call `ctx.tools.guard()`, never return `deny` / `ask` / `cancel` from `tools/pre-execute`, never call `agent.followup()`, never call `ctx.systemPrompt.section()`.
- Thought source kind is `guiding-thought` (do not impersonate `user`). Content is `[{ type: 'text', text: GUIDING_THOUGHT }]`. Notice form summary is exactly `指导思想：根因待证伪` (under 120 chars).
- Thought body, locale, README must not contain 镇反, 反右, or 捕杀比例 as executable instruction.
- Do not `plugin_manager install_bundle` in this plan. Installation is a later, separately approved step.
- Pre-step rewrite must `{ ...decision, messages }` and keep `startsRequestSeries`.
- `inject: ['tools']` so the plugin stays inactive without the tools service.

## File map

| File | Responsibility |
|---|---|
| `dsh-bundles/guiding-thought/thought.js` | `GUIDING_THOUGHT` string + `createThoughtMessage(id)` |
| `dsh-bundles/guiding-thought/major-direction.js` | `isMajorDirection(text)` |
| `dsh-bundles/guiding-thought/inject-this-turn.js` | `appendThoughtIfNeeded(decision, id)` + `additionalContextsForToolResult(exec, result, id)` |
| `dsh-bundles/guiding-thought/index.js` | `apply(ctx)` + `inject` |
| `dsh-bundles/guiding-thought/package.json` | Host-only manifest |
| `dsh-bundles/guiding-thought/cordis.patch.yml` | Insert plugin row |
| `dsh-bundles/guiding-thought/locale/en.json` | `meta.title` / `meta.description` (no `meta.detail`) |
| `dsh-bundles/guiding-thought/locale/zh.json` | Same fields in Chinese |
| `dsh-bundles/guiding-thought/icon.svg` | Original 36×36 icon |
| `dsh-bundles/guiding-thought/README.md` | Fallback detail text |
| `dsh-bundles/guiding-thought/tests/*.test.js` | `node --test` |

## Review Focus

- Daily read/search text must not inject — Task 2 owns the negative fixtures; Task 3 asserts `appendThoughtIfNeeded` leaves those enter-decisions unchanged.
- A tool payload that freezes “根因是 X / 排除 Y / 世界是 Z” must attach thought as `additionalContexts` — Task 3 `additionalContextsForToolResult`.
- `startsRequestSeries: true` must survive a rewrite — Task 3.
- Thought already in the batch (`source.kind === 'guiding-thought'`) must not be duplicated — Task 3.
- Thought / locale / README must not contain 镇反 / 反右 / 捕杀比例 — Task 1 and Task 4.

---

### Task 1: Thought text and message factory

**Files:**
- Create: `dsh-bundles/guiding-thought/thought.js`
- Test: `dsh-bundles/guiding-thought/tests/thought.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: `export const GUIDING_THOUGHT` (string); `export const THOUGHT_SOURCE_KIND = 'guiding-thought'`; `export const THOUGHT_SUMMARY = '指导思想：根因待证伪'`; `export function createThoughtMessage(id)` → `{ id, role: 'user', content: [{ type: 'text', text: GUIDING_THOUGHT }], source: { kind: THOUGHT_SOURCE_KIND, form: 'notice', summary: THOUGHT_SUMMARY } }`

`GUIDING_THOUGHT` is this exact string (newlines as written):

```
指导思想：

没有调查，没有发言权。
结论在调查末尾，不在先头。
现象只是入门向导。
不正确的调查同样没有发言权。
认识对不对看实践结果。
捉住主要矛盾。
不同质的矛盾用不同质的方法。

说出口的根因、排除、世界，只当待证伪。后面的事实可以掀前面的结论。日常读、搜、对细节不惊动。动作从当前问题的思想长，不从预装办法长。
```

- [ ] **Step 1: Write the failing test**

`tests/thought.test.js` (ESM, `node:test` + `node:assert/strict`):

- `createThoughtMessage` returns `role === 'user'`, `content[0] === { type: 'text', text: GUIDING_THOUGHT }`, `source.kind === 'guiding-thought'`, `source.form === 'notice'`, `source.summary === '指导思想：根因待证伪'`, and echoes `id`.
- `GUIDING_THOUGHT` includes each of the seven principle lines and the substring `只当待证伪`.
- `GUIDING_THOUGHT` does not include `镇反`, `反右`, or `捕杀比例`.
- `THOUGHT_SUMMARY.length <= 120`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/thought.test.js` from `dsh-bundles/guiding-thought/`
Expected: FAIL (module missing)

- [ ] **Step 3: Implement `createThoughtMessage(id)` in `thought.js`**

Export the four names in Interfaces. Do not import `@deepseek-ai/dsh-llm`; this is a plain object factory.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/thought.test.js` from `dsh-bundles/guiding-thought/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add dsh-bundles/guiding-thought/thought.js dsh-bundles/guiding-thought/tests/thought.test.js
git commit -m "feat(guiding-thought): thought text and message factory"
```

---

### Task 2: Major-direction detector

**Files:**
- Create: `dsh-bundles/guiding-thought/major-direction.js`
- Test: `dsh-bundles/guiding-thought/tests/major-direction.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: `export function isMajorDirection(text: string): boolean`

v1 may use a word list. The list is allowed to change later; these fixtures are not.

Positive (must be `true`):

- `根因是什么`
- `可以把这条路排除`
- `根因是缓存层已经失效`
- `世界就是上游已经停更`
- `TASK AS OF THIS BLOCK: 这条路已经排除`
- `所以根因已经确定`
- `compress summary: 排除了超时这一路`

Negative (must be `false`):

- `读这段日志`
- `grep handleRequest`
- `list files in src/`
- `帮我看一下这个函数`
- `dump the function at line 40`
- `''`
- `read docs/overview.md`

- [ ] **Step 1: Write the failing test**

One test that loops the positive list asserting `true`; one that loops the negative list asserting `false`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/major-direction.test.js` from `dsh-bundles/guiding-thought/`
Expected: FAIL (module missing)

- [ ] **Step 3: Implement `isMajorDirection(text)` in `major-direction.js`**

Classify from `String(text ?? '')`. Do not special-case any one incident beyond the fixtures.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/major-direction.test.js` from `dsh-bundles/guiding-thought/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add dsh-bundles/guiding-thought/major-direction.js dsh-bundles/guiding-thought/tests/major-direction.test.js
git commit -m "feat(guiding-thought): major-direction detector"
```

---

### Task 3: Inject into this turn

**Files:**
- Create: `dsh-bundles/guiding-thought/inject-this-turn.js`
- Test: `dsh-bundles/guiding-thought/tests/inject-this-turn.test.js`

**Interfaces:**
- Consumes: `createThoughtMessage(id)` from Task 1; `isMajorDirection(text)` from Task 2
- Produces:
  - `export function messageText(message): string` — join `content[].text` for `type === 'text'` blocks; `''` otherwise
  - `export function batchNeedsThought(messages): boolean` — true iff some message’s `messageText` is major-direction **and** no message has `source.kind === 'guiding-thought'`
  - `export function appendThoughtIfNeeded(decision, id)` — if `decision.kind !== 'enter'`, return `decision` unchanged; if `!batchNeedsThought(decision.messages)`, return `decision` unchanged; otherwise return `{ ...decision, messages: [...decision.messages, createThoughtMessage(id)] }`
  - `export function additionalContextsForToolResult(exec, result, id): array` — stringify `exec?.arguments` (DSH 0.2.2-rc.3 `ToolExecution.arguments`; there is no `args`) and each `result?.content[]` text block; if any chunk is major-direction, return `[createThoughtMessage(id)]`, else `[]`

- [ ] **Step 1: Write the failing test**

Fixtures: `userMsg(text)` = `{ id: 'u', role: 'user', content: [{ type: 'text', text }], source: { kind: 'user' } }`.

Assertions:

- `appendThoughtIfNeeded({ kind: 'reject' }, 't1')` is the same object / `{ kind: 'reject' }`.
- `appendThoughtIfNeeded({ kind: 'enter', messages: [userMsg('读这段日志')] }, 't1').messages` has length 1 and no `guiding-thought`.
- `appendThoughtIfNeeded({ kind: 'enter', messages: [userMsg('根因是缓存层已经失效')], startsRequestSeries: true }, 't1')` has `startsRequestSeries === true`, last message `source.kind === 'guiding-thought'`, last `id === 't1'`.
- Same as previous but messages already contain a `guiding-thought` source: length unchanged.
- `additionalContextsForToolResult({ arguments: { content: 'TASK AS OF THIS BLOCK: 这条路已经排除' } }, { content: [] }, 't2')` is one thought message.
- `additionalContextsForToolResult({ arguments: {} }, { content: [{ type: 'text', text: 'grep handleRequest' }] }, 't2')` is `[]`.
- `additionalContextsForToolResult({ arguments: {} }, { content: [{ type: 'text', text: '排除了超时这一路' }] }, 't2')` is one thought message.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/inject-this-turn.test.js` from `dsh-bundles/guiding-thought/`
Expected: FAIL (module missing)

- [ ] **Step 3: Implement the four exports in `inject-this-turn.js`**

Spread enter-decisions. Do not call `agent.inject` or `agent.followup` here.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/inject-this-turn.test.js` from `dsh-bundles/guiding-thought/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add dsh-bundles/guiding-thought/inject-this-turn.js dsh-bundles/guiding-thought/tests/inject-this-turn.test.js
git commit -m "feat(guiding-thought): inject thought into this turn"
```

---

### Task 4: `apply()` wiring and Host-only bundle

**Files:**
- Create: `dsh-bundles/guiding-thought/index.js`
- Create: `dsh-bundles/guiding-thought/package.json`
- Create: `dsh-bundles/guiding-thought/cordis.patch.yml`
- Create: `dsh-bundles/guiding-thought/locale/en.json`
- Create: `dsh-bundles/guiding-thought/locale/zh.json`
- Create: `dsh-bundles/guiding-thought/icon.svg`
- Create: `dsh-bundles/guiding-thought/README.md`
- Test: `dsh-bundles/guiding-thought/tests/apply.test.js`

**Interfaces:**
- Consumes: `appendThoughtIfNeeded`, `additionalContextsForToolResult` from Task 3; `createThoughtMessage` from Task 1
- Produces: `export const inject = ['tools']`; `export function apply(ctx)` registers effects and returns nothing else. No `Config`.

`apply(ctx)` behavior:

1. `export const inject = ['tools']`.
2. Inside `ctx.effect`, listen `agent/created` as Cordis **serial** `(payload)` — payload is `{ agent, source, signal? }`, not the Agent. For each `payload.agent`, `agent.ctx.effect` registers `agent/pre-step` as Cordis **waterfall** `(payload, next)` with `next` last: `const decision = await next(); return appendThoughtIfNeeded(decision, id)` where `id` is a fresh string per injection (e.g. `guiding-thought:${Date.now()}:${counter}`). Keep that disposer in a `Map` on the plugin effect so plugin unload disposes per-agent listeners. Do not register `(next) =>` or treat the created payload as `Agent`.
3. On `ctx` (tools service present), `tools/post-execute` as Cordis **waterfall** `(exec, result, next)` with `next` last: `const decision = await next(); const extra = additionalContextsForToolResult(exec, result, id); if (extra.length === 0) return decision; return { ...decision, additionalContexts: [...(decision.additionalContexts ?? []), ...extra] }`. Do not register `(next, exec, result)`.
4. Do not listen `tools/pre-execute`. Do not call `ctx.tools.guard`. Do not call `ctx.systemPrompt.section`. Do not call `agent.followup` / `agent.inject`.

Manifest (Host-only, no client):

```json
{
  "name": "@local/guiding-thought",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./index.js",
    "./locale/*.json": "./locale/*.json",
    "./icon": "./icon.svg"
  },
  "files": [
    "index.js",
    "thought.js",
    "major-direction.js",
    "inject-this-turn.js",
    "cordis.patch.yml",
    "locale/*.json",
    "icon.svg",
    "README.md"
  ],
  "dsh": { "bundle": { "patch": "./cordis.patch.yml" } }
}
```

```yaml
- insert:
    - id: guiding-thought
      name: '@local/guiding-thought'
```

Locale (no `meta.detail`):

- `en.json`: `meta.title` = `Guiding thought`; `meta.description` = `When a conclusion is about to freeze into a root cause, exclusion, or world, puts the guiding thought into this turn. No prompts, no tool blocks.`
- `zh.json`: `meta.title` = `指导思想`; `meta.description` = `当现象、本本或摘要正要收成根因、排除或世界时，把指导思想送进这一轮。不弹窗，不拦工具。`

`icon.svg`: original geometry, `width="36" height="36" viewBox="0 0 36 36"`, no tile/background, no `<style>` / scripts / `<text>` / `foreignObject`. Subject: a simple open compass rose (direction, not a lock). Flat fills.

`README.md`: two short paragraphs restating capability and the zero-participation / no-deny limits. Must not contain 镇反 / 反右 / 捕杀比例.

- [ ] **Step 1: Write the failing wiring test**

`tests/apply.test.js` builds a fake `ctx`:

- `effect(fn)` runs `fn` immediately, collecting disposer fns.
- `on(event, handler)` stores handlers.
- Fake `agent = { ctx: { effect, on } }`.

Then `apply(ctx)`, fire `agent/created` with `{ agent }` (the serial payload), not the Agent as the first argument.

Fake `ctx.on` must invoke handlers with the same arity Cordis uses: `handler(...eventArgs, next)` for waterfalls, `handler(payload)` for serial `agent/created`.

Assertions:

- `inject` deep-equals `['tools']`.
- Source of `index.js` contains none of: `tools.guard`, `systemPrompt.section`, `followup(`, `'ask'`, `kind: 'deny'`.
- Simulated pre-step as `(payload, next)`: `handler({}, async () => ({ kind: 'enter', messages: [userMsg('根因是什么')], startsRequestSeries: true }))` returns enter, `startsRequestSeries === true`, last source kind `guiding-thought`.
- Same handler with `handler({}, async () => ({ kind: 'enter', messages: [userMsg('读这段日志')] }))` does not append.
- Simulated post-execute as `(exec, result, next)`: `handler({ arguments: { content: '排除了超时这一路' } }, { content: [] }, async () => ({ kind: 'accept' }))` → decision has `additionalContexts[0].source.kind === 'guiding-thought'`.
- Post-execute with `{ arguments: { content: 'grep handleRequest' } }` → no `additionalContexts` (or empty).
- `locale/en.json` and `locale/zh.json` have `meta.title` / `meta.description` and do not have `meta.detail`.
- Concatenation of `thought.js` + both locale files + `README.md` does not include `镇反`, `反右`, `捕杀比例`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/apply.test.js` from `dsh-bundles/guiding-thought/`
Expected: FAIL (module / manifest missing)

- [ ] **Step 3: Implement `apply(ctx)` and the bundle files listed above**

Keep `apply` as registration only; logic stays in Task 3. Icon: one dominant subject, 18–22 unit extent, transparent empty areas.

- [ ] **Step 4: Run all tests**

Run: `node --test tests/*.test.js` from `dsh-bundles/guiding-thought/`
Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add dsh-bundles/guiding-thought
git commit -m "feat(guiding-thought): host plugin wiring and bundle manifest"
```

Do **not** run `plugin_manager install_bundle`. Stop after the commit and report the bundle path.

---

## Self-review

1. **Spec coverage:** Intent / seven principles / 待证伪 → Task 1. Major direction vs daily read → Task 2. This-turn inject via pre-step + post-execute additionalContexts → Task 3. Host-only, no Config, no deny/ask/guard/followup/section, locales, icon, no install → Task 4.
2. **Step scan:** Detector word list left to the implementer; fixtures are pinned. Icon geometry left to the implementer; constraints pinned. `id` generation left to the implementer; tests only check the id they pass in.
3. **Types:** `createThoughtMessage` / `isMajorDirection` / `appendThoughtIfNeeded` / `additionalContextsForToolResult` names match across tasks. `PreStepDecision` and `PostToolDecision` match 0.2.2-rc.3 (`kind: 'enter' | 'reject'`; `kind: 'accept'` + `additionalContexts`).
4. **Review Focus:** each line has a test in Task 2, 3, or 4.
5. **Proportion:** plan pins names, fixtures, and manifest; it does not transcribe `apply` beyond the two waterfall contracts.
