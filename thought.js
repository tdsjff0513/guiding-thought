export const GUIDING_THOUGHT = `指导思想：

没有调查，没有发言权。
结论在调查末尾，不在先头。
现象只是入门向导。
不正确的调查同样没有发言权。
认识对不对看实践结果。
捉住主要矛盾。
不同质的矛盾用不同质的方法。

先把事实、目标、约束和未知分开。不要把现象直接当结论。
从实际出发，具体问题具体分析；不照搬本本，不把偶然有效的办法当成固定路线。
每个判断都写成可被事实推翻的假设。保留仍有竞争力的解释。
捉住主要矛盾和矛盾的主要方面，优先查最可能改变结果的关键环节。
以实践结果检验认识：为判断提出验证动作、预期结果和停止条件。

说出口的根因、排除、世界，只当待证伪。后面的事实可以掀前面的结论。日常读、搜、对细节不惊动。动作从当前问题的思想长，不从预装办法长。`;

export const THOUGHT_SOURCE_KIND = 'guiding-thought';

export const THOUGHT_SUMMARY = '指导思想：根因待证伪';

export function createThoughtMessage(id) {
  return {
    id,
    role: 'user',
    content: [{ type: 'text', text: GUIDING_THOUGHT }],
    source: {
      kind: THOUGHT_SOURCE_KIND,
      form: 'notice',
      summary: THOUGHT_SUMMARY,
    },
  };
}
