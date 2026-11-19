const DECISION_SUBJECT =
  /(?:方案|方向|路径|下一步|选项|分支|这条路|这一路|该路径|该方案)/;

const COMMITMENT =
  /(?:最终|唯一|明确|确定|确认|决定|采用|选用|选择|排除|证明|停止|不再|锁定)/;

const EXPLICIT_QUESTION =
  /(?:根因|根本原因|主要原因|主要矛盾|关键矛盾).{0,24}(?:是什么|怎么|如何|为何|哪个|哪一)/;

const CONTEXTUAL_QUESTION =
  /(?:(?:判断|下一步|这条路|这一路|该路径|该方案|选择哪一|采用哪一).{0,24}(?:是什么|怎么|如何|为何|哪个|哪一|最好|应|该|采用|选择|走)|(?:哪个|哪一|哪条)(?:方案|路径|方向|选项).{0,24}(?:最好|应|该|采用|选择|走)?|应(?:该)?选(?:择)?哪(?:一|条|个)(?:方案|路径|方向|选项))/;

const RELATIONAL_CLAIM =
  /(?:根因|根本原因|主要原因|主要矛盾|关键矛盾)\s*(?:是|为|就是|已(?:经)?)/;

const FINAL_CONCLUSION =
  /(?:最终|明确|确定|确认)结论\s*(?:是|为|就是|已(?:经)?)/;

const WORLD_CLAIM =
  /(?:世界|现实|当前状态)\s*(?:就是|已(?:经)?(?:明确|确定|确认)|已被(?:明确|确定|确认))/;

const ENGLISH_SETTLED =
  /(?:\b(?:the\s+)?root\s+cause\s+is\b|\broot\s+cause\s*:|\bthe\s+final\s+conclusion\s+is\b|\bthe\s+decision\s+is\b|\bthe\s+world\s+is\s+that\b|\bwe\s+(?:decided|chose)\s+(?:to\s+)?(?:use\s+)?|\bwe\s+(?:have\s+)?excluded\b|\bthis\s+(?:path|approach|plan|option|route)\s+is\s+excluded\b|\bruled\s+out\b)/i;

const ENGLISH_QUESTION =
  /\b(?:what(?:'s|\s+is)\s+the\s+(?:root\s+cause|conclusion|decision)|which\s+(?:approach|path|plan|option)\s+should\s+we\s+(?:choose|take|pick)|what\s+(?:approach|path|plan|option)\s+should\s+we\s+(?:choose|use|take|pick))\b/i;

const UNCERTAIN =
  /(?:可能|也许|或许|暂时|尚未|未(?:能|被|经)|待(?:验证|确认)|需要(?:调查|验证|确认)|先(?:调查|验证|收集证据)|\b(?:could\s+be|might\s+be|probably|possibly|maybe|uncertain|unknown|unconfirmed|pending|not\s+yet|needs?\s+(?:verification|investigation)|to\s+be\s+verified)\b)/i;

export function isMajorDirection(text) {
  const value = String(text ?? '');
  if (!value.trim()) {
    return false;
  }
  if (
    EXPLICIT_QUESTION.test(value) ||
    CONTEXTUAL_QUESTION.test(value) ||
    ENGLISH_QUESTION.test(value)
  ) {
    return true;
  }
  if (UNCERTAIN.test(value)) {
    return false;
  }
  if (ENGLISH_SETTLED.test(value)) {
    return true;
  }
  const hasDecision = DECISION_SUBJECT.test(value) && COMMITMENT.test(value);
  const hasClaim =
    RELATIONAL_CLAIM.test(value) ||
    FINAL_CONCLUSION.test(value) ||
    WORLD_CLAIM.test(value);
  return hasDecision || hasClaim;
}
