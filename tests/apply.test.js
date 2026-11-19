import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apply, inject } from '../index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function userMsg(text) {
  return {
    id: 'u',
    role: 'user',
    content: [{ type: 'text', text }],
    source: { kind: 'user' },
  };
}

function createFakeCtx() {
  const handlers = new Map();
  const ctx = {
    effect(fn) {
      const disposer = fn();
      if (typeof disposer === 'function') {
        ctx.disposers.push(disposer);
      }
      return disposer;
    },
    on(event, handler) {
      const list = handlers.get(event) ?? [];
      list.push(handler);
      handlers.set(event, list);
      return () => {
        const current = handlers.get(event) ?? [];
        handlers.set(
          event,
          current.filter((entry) => entry !== handler),
        );
      };
    },
    handlers,
    disposers: [],
  };
  return ctx;
}

function fire(ctx, event, ...args) {
  const list = ctx.handlers.get(event) ?? [];
  for (const handler of list) {
    handler(...args);
  }
}

function setupAppliedAgent() {
  const ctx = createFakeCtx();
  const agentCtx = createFakeCtx();
  const agent = { ctx: agentCtx };
  apply(ctx);
  fire(ctx, 'agent/created', { agent });
  const preStep = (agentCtx.handlers.get('agent/pre-step') ?? [])[0];
  const postExecute = (ctx.handlers.get('tools/post-execute') ?? [])[0];
  assert.equal(typeof preStep, 'function');
  assert.equal(typeof postExecute, 'function');
  return { preStep, postExecute };
}

test('inject is tools only', () => {
  assert.deepEqual(inject, ['tools']);
});

test('index.js does not use guard, section, followup, ask, or deny', () => {
  const source = readFileSync(join(root, 'index.js'), 'utf8');
  for (const forbidden of [
    'tools.guard',
    'systemPrompt.section',
    'followup(',
    "'ask'",
    "kind: 'deny'",
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
});

test('pre-step appends guiding thought for major-direction enter', async () => {
  const { preStep } = setupAppliedAgent();
  const decision = await preStep({}, async () => ({
    kind: 'enter',
    messages: [userMsg('根因是什么')],
    startsRequestSeries: true,
  }));
  assert.equal(decision.kind, 'enter');
  assert.equal(decision.startsRequestSeries, true);
  assert.equal(decision.messages.at(-1).source.kind, 'guiding-thought');
});

test('pre-step does not append for everyday enter', async () => {
  const { preStep } = setupAppliedAgent();
  const decision = await preStep({}, async () => ({
    kind: 'enter',
    messages: [userMsg('读这段日志')],
  }));
  assert.equal(decision.kind, 'enter');
  assert.equal(decision.messages.length, 1);
  assert.equal(
    decision.messages.some((message) => message.source?.kind === 'guiding-thought'),
    false,
  );
});

test('post-execute adds additionalContexts for major-direction args', async () => {
  const { postExecute } = setupAppliedAgent();
  const decision = await postExecute(
    { arguments: { content: '排除了超时这一路' } },
    { content: [] },
    async () => ({ kind: 'accept' }),
  );
  assert.equal(decision.additionalContexts[0].source.kind, 'guiding-thought');
});

test('post-execute does not add additionalContexts for everyday args', async () => {
  const { postExecute } = setupAppliedAgent();
  const decision = await postExecute(
    { arguments: { content: 'grep handleRequest' } },
    { content: [] },
    async () => ({ kind: 'accept' }),
  );
  assert.equal(
    !decision.additionalContexts || decision.additionalContexts.length === 0,
    true,
  );
});

test('locale files have title and description and no detail', () => {
  for (const name of ['en.json', 'zh.json']) {
    const locale = JSON.parse(
      readFileSync(join(root, 'locale', name), 'utf8'),
    );
    assert.equal(typeof locale.meta.title, 'string');
    assert.equal(locale.meta.title.length > 0, true);
    assert.equal(typeof locale.meta.description, 'string');
    assert.equal(locale.meta.description.length > 0, true);
    assert.equal('detail' in locale.meta, false);
  }
});

test('thought, locales, and README omit banned phrases', () => {
  const blob = [
    readFileSync(join(root, 'thought.js'), 'utf8'),
    readFileSync(join(root, 'locale/en.json'), 'utf8'),
    readFileSync(join(root, 'locale/zh.json'), 'utf8'),
    readFileSync(join(root, 'README.md'), 'utf8'),
  ].join('\n');
  for (const banned of ['镇反', '反右', '捕杀比例']) {
    assert.equal(blob.includes(banned), false, banned);
  }
});
