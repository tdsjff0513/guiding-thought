import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isMajorDirection } from '../major-direction.js';

const POSITIVE = [
  '根因是什么',
  '根本原因是什么',
  '可以把这条路排除',
  '根因是缓存层已经失效',
  '世界就是上游已经停更',
  '请判断下一步方案是什么',
  '已确认采用缓存方案',
  '最终结论是上游已经停更',
  'TASK AS OF THIS BLOCK: 这条路已经排除',
  '所以根因已经确定',
  'compress summary: 排除了超时这一路',
  'The root cause is the cache layer',
  'We decided to use the fallback path',
  'What is the root cause?',
];

const NEGATIVE = [
  '读这段日志',
  'grep handleRequest',
  'list files in src/',
  '帮我看一下这个函数',
  'dump the function at line 40',
  '',
  'read docs/overview.md',
  '世界时间换算工具',
  '世界时间换算工具是免费的',
  '排除目录中的临时文件',
  '可能是缓存问题，待验证',
  '先收集证据，再决定方案',
  'Could be a cache issue; needs verification',
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
