# Guiding thought

A DeepSeek Harness Host plugin. When a conclusion is about to freeze into a root cause, exclusion, or world, it puts the guiding thought into **this turn** so later facts can overturn it. Everyday reading, searching, and detail work are left alone.

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
| `major-direction.js` | Detect 根因 / 排除 / 世界 |
| `inject-this-turn.js` | Append into this turn; `additionalContexts` on tool results |
| `cordis.patch.yml` | Bundle patch |
| `locale/` | Plugin Manager title and description |
| `docs/design.md` | Design |
| `docs/plan.md` | Implementation plan |
