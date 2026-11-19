# Decision Signal Detector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the plugin inject a fuller, operational guiding thought at genuine conclusion-freezing moments while avoiding ordinary keyword mentions, duplicate tool-result injections, and malformed tool arguments.

**Architecture:** Replace the three-token detector with a small, dependency-free signal scorer. It recognizes either explicit decision questions or a combination of a decision subject and a commitment/finality signal, while uncertainty language suppresses weak matches. Expand the thought text from principles alone into a short investigation-and-verification loop. Keep turn-local deduplication in the post-execute path and make argument serialization fail closed.

**Tech Stack:** ESM JavaScript, `node:test`, DeepSeek Harness 0.2.2-rc.3 Host events.

**Spec:** `docs/design.md` and the user's requirement that the plugin apply Mao-style investigation principles to task decision points.

## Global Constraints

- Do not add runtime dependencies or model calls.
- Keep `inject: ['tools']` and Host-only bundle behavior.
- Never use tool guards, deny/ask/cancel, followup, or system-prompt registration.
- Preserve the existing message shape and `startsRequestSeries` fields.
- Preserve current-turn injection semantics.
- Fail closed when tool arguments cannot be serialized.
- Keep the thought as a method, not a preselected technical route.

## Review Focus

- Ordinary mentions such as “世界时间” or “排除目录中的文件” must not trigger by themselves.
- Explicit questions such as “根本原因是什么” must still trigger investigation guidance.
- A settled claim such as “已确认采用缓存方案” must trigger.
- Uncertain claims such as “可能是缓存问题，待验证” must not trigger on weak signals.
- If a downstream post-execute decision already carries a guiding-thought context, the plugin must not append another; the event payload exposes no stable turn id for stronger cross-execution deduplication.
- Circular or BigInt tool arguments must not break post-execute handling.

### Task 1: Decision-signal detector

**Files:**
- Modify: `major-direction.js`
- Modify: `tests/major-direction.test.js`

**Interfaces:**
- Preserve `isMajorDirection(text): boolean`.
- Add explicit positive and negative fixtures for decision subjects, finality/commitment, inquiry questions, ordinary keyword mentions, uncertainty, and English equivalents.

- [x] Write the failing fixtures first.
- [x] Run `node --test tests/major-direction.test.js` and observe the expected failures.
- [x] Implement the smallest dependency-free scorer/regex set.
- [x] Run the detector tests and then the full suite.

### Task 2: Operational guiding thought

**Files:**
- Modify: `thought.js`
- Modify: `tests/thought.test.js`

**Interfaces:**
- Preserve `GUIDING_THOUGHT`, `THOUGHT_SOURCE_KIND`, `THOUGHT_SUMMARY`, and `createThoughtMessage` exports.
- Keep the seven existing principles, and add fact/unknown separation, falsifiable hypotheses, major-contradiction prioritization, and verification action/expected-result/stop-condition guidance.

- [x] Add failing assertions for the operational method lines.
- [x] Run `node --test tests/thought.test.js` and observe the expected failures.
- [x] Expand the thought text without introducing a fixed technical recipe.
- [x] Run the thought tests and then the full suite.

### Task 3: Robust tool-result injection

**Files:**
- Modify: `inject-this-turn.js`
- Modify: `index.js`
- Modify: `tests/inject-this-turn.test.js`
- Modify: `tests/apply.test.js`

**Interfaces:**
- Preserve existing exports.
- `additionalContextsForToolResult` must return `[]` if arguments cannot be serialized.
- `tools/post-execute` must avoid appending a duplicate guiding-thought context when the downstream decision already contains one.

- [x] Add failing tests for circular/BigInt arguments and duplicate additional contexts.
- [x] Run the focused tests and observe failure.
- [x] Implement safe serialization and one-context deduplication.
- [x] Run the full suite.

### Task 4: Documentation and verification

**Files:**
- Modify: `README.md`
- Modify: `docs/design.md`

- [x] Document that detection is based on decision/finality signals rather than three literal trigger words.
- [x] Run syntax checks, the full test suite, and package dry-run.
- [x] Review the final diff for scope and forbidden APIs.
