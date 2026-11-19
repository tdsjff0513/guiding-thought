import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GUIDING_THOUGHT,
  THOUGHT_SUMMARY,
  createThoughtMessage,
} from '../thought.js';

const PRINCIPLE_LINES = [
  '没有调查，没有发言权。',
  '结论在调查末尾，不在先头。',
  '现象只是入门向导。',
  '不正确的调查同样没有发言权。',
  '认识对不对看实践结果。',
  '捉住主要矛盾。',
  '不同质的矛盾用不同质的方法。',
];

test('createThoughtMessage returns a user notice echoing id', () => {
  const id = 'thought-1';
  const message = createThoughtMessage(id);

  assert.equal(message.id, id);
  assert.equal(message.role, 'user');
  assert.deepEqual(message.content[0], { type: 'text', text: GUIDING_THOUGHT });
  assert.equal(message.source.kind, 'guiding-thought');
  assert.equal(message.source.form, 'notice');
  assert.equal(message.source.summary, '指导思想：根因待证伪');
});

test('GUIDING_THOUGHT includes the seven principles and 只当待证伪', () => {
  for (const line of PRINCIPLE_LINES) {
    assert.equal(GUIDING_THOUGHT.includes(line), true, `missing: ${line}`);
  }
  assert.equal(GUIDING_THOUGHT.includes('只当待证伪'), true);
});

test('GUIDING_THOUGHT does not include 镇反, 反右, or 捕杀比例', () => {
  assert.equal(GUIDING_THOUGHT.includes('镇反'), false);
  assert.equal(GUIDING_THOUGHT.includes('反右'), false);
  assert.equal(GUIDING_THOUGHT.includes('捕杀比例'), false);
});

test('THOUGHT_SUMMARY.length is at most 120', () => {
  assert.equal(THOUGHT_SUMMARY.length <= 120, true);
});
