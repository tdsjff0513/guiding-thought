import {
  appendThoughtIfNeeded,
  additionalContextsForToolResult,
} from './inject-this-turn.js';

export const inject = ['tools'];

export function apply(ctx) {
  ctx.effect(() => {
    const preStepDisposers = new Map();
    let counter = 0;
    const nextId = () => `guiding-thought:${Date.now()}:${++counter}`;

    const stopCreated = ctx.on('agent/created', (payload) => {
      const agent = payload.agent;
      const disposePreStep = agent.ctx.effect(() => {
        return agent.ctx.on('agent/pre-step', async (payload, next) => {
          const decision = await next();
          return appendThoughtIfNeeded(decision, nextId());
        });
      });
      preStepDisposers.set(agent, disposePreStep);
    });

    const stopPostExecute = ctx.on(
      'tools/post-execute',
      async (exec, result, next) => {
        const decision = await next();
        const extra = additionalContextsForToolResult(exec, result, nextId());
        if (extra.length === 0) {
          return decision;
        }
        return {
          ...decision,
          additionalContexts: [
            ...(decision.additionalContexts ?? []),
            ...extra,
          ],
        };
      },
    );

    return () => {
      stopCreated();
      stopPostExecute();
      for (const dispose of preStepDisposers.values()) {
        dispose();
      }
      preStepDisposers.clear();
    };
  });
}
