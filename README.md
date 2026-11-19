# Guiding thought

A DeepSeek Harness Host plugin. When a task is about to freeze a decision — for example, a root cause, conclusion, chosen path, or exclusion — it puts the guiding thought into **this turn** so later facts can overturn it. It looks for decision questions and combinations of a decision subject with a commitment signal; ordinary reading, searching, and detail work are left alone.

The thought is a method rather than a technical recipe: separate facts, goals, constraints, and unknowns; treat judgments as falsifiable hypotheses; identify the major contradiction; choose verification actions with expected results and stop conditions; and revise the route when practice disagrees.

This is a soft intervention at a decision boundary. It only puts the thought in the current turn when a lexical signal is detected; it does not stop a tool, rerun an investigation, choose a diagnostic method, or guarantee that a bug will be fixed. The model may still ignore the notice, and a conclusion written without a detectable signal may pass through.

It does not add prompts, ask the user, deny tools, or register tool guards. There is no configuration; unloading the plugin removes the listeners.

Requires DeepSeek Harness 0.2.2-rc.3 (desktop profile).

## Install

Package name: `@local/guiding-thought`. Not published to npm.

**Any DeepSeek Harness profile**

1. **Plugins → Add plugin**
2. Paste `https://github.com/tdsjff0513/guiding-thought`
3. Restart if the manager asks

After [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) lists it, search **Guiding thought** / **指导思想** in dshmarket.

**Local directory**

1. **Plugins → Add plugin**
2. Choose this checkout
3. Restart if the manager asks

Do not copy files into `$DSH_HOME` or edit the profile `package.json` by hand.

## Test

```bash
node --test tests/*.test.js
```

## Layout

| Path | Role |
|---|---|
| `index.js` | Host `apply()` — `agent/created`, `agent/pre-step`, `tools/post-execute` |
| `thought.js` | Thought text and `createThoughtMessage` |
| `major-direction.js` | Detect decision and commitment signals |
| `inject-this-turn.js` | Append into this turn; `additionalContexts` on tool results |
| `cordis.patch.yml` | Bundle patch |
| `locale/` | Plugin Manager title and description |
| `docs/design.md` | Design |
| `docs/plan.md` | Implementation plan |
