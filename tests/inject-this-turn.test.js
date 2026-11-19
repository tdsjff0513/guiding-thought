import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createThoughtMessage } from '../thought.js';
import {
  appendThoughtIfNeeded,
  additionalContextsForToolResult,
} from '../inject-this-turn.js';

function userMsg(text) {
  return {
    id: 'u',
    role: 'user',
    content: [{ type: 'text', text }],
    source: { kind: 'user' },
  };
}

test('appendThoughtIfNeeded returns a non-enter decision unchanged', () => {
  const decision = { kind: 'reject' };
  assert.equal(appendThoughtIfNeeded(decision, 't1'), decision);
  assert.deepEqual(appendThoughtIfNeeded(decision, 't1'), { kind: 'reject' });
});

test('appendThoughtIfNeeded leaves everyday enter batches unchanged', () => {
  const result = appendThoughtIfNeeded(
    { kind: 'enter', messages: [userMsg('读这段日志')] },
    't1',
  );
  assert.equal(result.messages.length, 1);
  assert.equal(
    result.messages.some((message) => message.source?.kind === 'guiding-thought'),
    false,
  );
});

test('appendThoughtIfNeeded appends a thought and keeps startsRequestSeries', () => {
  const result = appendThoughtIfNeeded(
    {
      kind: 'enter',
      messages: [userMsg('根因是缓存层已经失效')],
      startsRequestSeries: true,
    },
    't1',
  );
  assert.equal(result.startsRequestSeries, true);
  assert.equal(result.messages.at(-1).source.kind, 'guiding-thought');
  assert.equal(result.messages.at(-1).id, 't1');
});

test('appendThoughtIfNeeded does not append when a guiding-thought is already present', () => {
  const messages = [
    userMsg('根因是缓存层已经失效'),
    createThoughtMessage('existing'),
  ];
  const result = appendThoughtIfNeeded(
    {
      kind: 'enter',
      messages,
      startsRequestSeries: true,
    },
    't1',
  );
  assert.equal(result.messages.length, messages.length);
});

test('additionalContextsForToolResult injects when exec args are major-direction', () => {
  const result = additionalContextsForToolResult(
    { arguments: { content: 'TASK AS OF THIS BLOCK: 这条路已经排除' } },
    { content: [] },
    't2',
  );
  assert.deepEqual(result, [createThoughtMessage('t2')]);
});

test('additionalContextsForToolResult is empty for everyday tool result text', () => {
  assert.deepEqual(
    additionalContextsForToolResult(
      { arguments: {} },
      { content: [{ type: 'text', text: 'grep handleRequest' }] },
      't2',
    ),
    [],
  );
});

test('additionalContextsForToolResult injects when result text is major-direction', () => {
  const result = additionalContextsForToolResult(
    { arguments: {} },
    { content: [{ type: 'text', text: '排除了超时这一路' }] },
    't2',
  );
  assert.deepEqual(result, [createThoughtMessage('t2')]);
});
