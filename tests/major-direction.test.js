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
  'We chose the fallback path',
  'What is the root cause?',
  'Which path should we take?',
  '世界就是这样',
  '现实就是如此',
  '哪个方案最好？',
  '应选哪条路径？',
  'What is the decision?',
  'What approach should we choose?',
  'Which option should we pick?',
  'We ruled out the price formula',
  'This path is excluded',
  'root cause is cache desync',
  'the world is that the server still holds the item',
  'We have excluded the vendor quest path',
  'root cause: held slot',
  'Depending on the logs, we decided to use the fallback path',
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
  'The root cause is probably the cache',
  'The root cause is uncertain',
  '方案说明了读取流程',
  '路径直接读取日志',
  '下一步直接读取日志',
  '世界时间换算工具是什么？',
  '方案文档是什么？',
  '路径已经存在',
  '方案已经包含三个步骤',
  '当前状态是正常',
  '世界是一个时区工具',
  '判断是对的',
  '假设是合理的',
  '解释是这样的',
  '结论是',
  '这个方向就是北',
  '下一步就是打开文件',
  'exclude this file',
  'exclude this path',
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
