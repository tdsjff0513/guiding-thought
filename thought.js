export const GUIDING_THOUGHT = `指导思想：

没有调查，没有发言权。
结论在调查末尾，不在先头。
现象只是入门向导。
不正确的调查同样没有发言权。
认识对不对看实践结果。
捉住主要矛盾。
不同质的矛盾用不同质的方法。

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
