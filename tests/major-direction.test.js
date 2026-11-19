import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isMajorDirection } from '../major-direction.js';

const POSITIVE = [
  '根因是什么',
  '可以把这条路排除',
  '根因是缓存层已经失效',
  '世界就是上游已经停更',
  'TASK AS OF THIS BLOCK: 这条路已经排除',
  '所以根因已经确定',
  'compress summary: 排除了超时这一路',
];

const NEGATIVE = [
  '读这段日志',
  'grep handleRequest',
  'list files in src/',
  '帮我看一下这个函数',
  'dump the function at line 40',
  '',
  'read docs/overview.md',
];

test('isMajorDirection returns true for major-direction fixtures', () => {
  for (const text of POSITIVE) {
    assert.equal(isMajorDirection(text), true, text);
  }
});

test('isMajorDirection returns false for everyday fixtures', () => {
  for (const text of NEGATIVE) {
    assert.equal(isMajorDirection(text), false, text);
  }
});
