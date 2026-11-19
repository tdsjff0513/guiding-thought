const DECISION_SUBJECT =
  /(?:根因|根本原因|主要原因|结论|判断|方案|方向|路径|假设|解释|下一步|主要矛盾|关键矛盾|选项|分支|可能性|这条路|这一路|该路径|该方案)/;

const COMMITMENT =
  /(?:已(?:经)?|最终|唯一|明确|确定|确认|决定|采用|选用|选择|排除|证明|说明|意味着|因此|所以|直接|停止|不再|锁定)/;

const EXPLICIT_QUESTION =
  /(?:根因|根本原因|主要原因|结论|判断|方案|方向|路径|下一步|世界).{0,24}(?:是什么|怎么|如何|为何|哪个|哪一)/;

const RELATIONAL_CLAIM =
  /(?:根因|根本原因|主要原因|结论|判断|方案|方向|路径|假设|解释|下一步|主要矛盾|关键矛盾|选项|分支|可能性|这条路|这一路|该路径|该方案)\s*(?:是|为|就是|已(?:经)?)/;

const WORLD_CLAIM = /(?:世界|现实|当前状态)\s*(?:是|为|就是)/;

const ENGLISH_SETTLED =
  /\b(?:the\s+root\s+cause\s+is|the\s+final\s+conclusion\s+is|the\s+decision\s+is|we\s+(?:decided|will\s+use|choose)\b)/i;

const ENGLISH_QUESTION =
  /\b(?:what(?:'s|\s+is)\s+the\s+root\s+cause|what\s+is\s+the\s+conclusion|which\s+(?:approach|path|plan)\s+should\s+we\s+choose)\b/i;

const UNCERTAIN =
  /(?:可能|也许|或许|暂时|尚未|未(?:能|被|经)|待(?:验证|确认)|需要(?:调查|验证|确认)|先(?:调查|验证|收集证据)|could\s+be|might\s+be|needs?\s+(?:verification|investigation)|to\s+be\s+verified)/i;

export function isMajorDirection(text) {
  const value = String(text ?? '');
  if (!value.trim()) {
    return false;
  }
  if (
    EXPLICIT_QUESTION.test(value) ||
    ENGLISH_QUESTION.test(value) ||
    ENGLISH_SETTLED.test(value)
  ) {
    return true;
  }
  if (UNCERTAIN.test(value) && !/(?:已(?:经)?|最终|唯一|明确|确定|确认|锁定)/.test(value)) {
    return false;
  }
  const hasSubject = DECISION_SUBJECT.test(value) || WORLD_CLAIM.test(value);
  return hasSubject && (COMMITMENT.test(value) || RELATIONAL_CLAIM.test(value));
}
