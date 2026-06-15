---
date: 2026-05-15T00:00:00+08:00
title: "把 rsync 从 Claude hook 搬到 npm postgenerate"
slug: move-rsync-to-npm-postgenerate
description: "一次让终端直跑 npm run generate 也能自动同步产物的小改造，顺便摆脱 Claude hook 的限制，构建/部署流程彻底不消耗 token。"
---

> 记录时间：2026-05-15

## 问题

每次跑 `npm run generate` 都习惯在 Claude Code 里执行，因为 Claude 的 `PostToolUse` hook 会在生成完成后自动把 `.output/public/` 同步到 `learn_it_public/` 仓库。但这样每次构建都要消耗一次 Claude 的 token。

想要的效果：在终端直接跑 `npm run generate`，也能完成同步；并且不依赖 Claude hook。

## 诊断

原来的 hook 只做了一件事：

```bash
rsync -a --delete --exclude='.git' .output/public/ /Users/ruimin/Desktop/code/learn_it_public/
```

但它只挂在 Claude 的 `PostToolUse.Bash` 上，匹配命令里含有 `npm run generate` 时触发。终端环境里完全不会执行 —— 所以脱离 Claude 就丢了同步动作。

## 解决方案：搬到 npm `postgenerate`

npm 自带 lifecycle hook：跑 `npm run generate` 完成后会自动执行 `postgenerate`。这一层完全不依赖 Claude，终端和 Claude 内都会触发。

### 第一步：改 `package.json`

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "postgenerate": "rsync -a --delete --exclude='.git' .output/public/ /Users/ruimin/Desktop/code/learn_it_public/",
    "preview": "nuxt preview",
    "typecheck": "nuxt typecheck"
  }
}
```

### 第二步：删掉对应的 Claude hook

`.claude/settings.local.json` 里原本的整段 `hooks.PostToolUse` 配置可以全部删掉，避免和 npm 重复同步（双跑虽然不会出错，但浪费一次 IO，且让 hook 链路变复杂）。

## 改造后的效果

| 场景 | 命令 | 行为 |
|---|---|---|
| 终端直接跑 | `npm run generate` | 构建 + 自动 rsync ✅ |
| Claude 内跑 | `npm run generate` | 构建 + 自动 rsync ✅（由 npm 触发，不消耗 token） |

关键收益：**Claude 完全不参与构建/部署流程**。

- 终端跑 `npm run generate` → 0 token
- 只在需要改代码、调 bug 时才进 Claude

## 验证

在终端直接跑一次，看目标目录有没有最新文件：

```bash
npm run generate
ls /Users/ruimin/Desktop/code/learn_it_public/ | head
```

## 小结

把「只在某个工具里才会触发的副作用」搬到工具链原生的生命周期钩子上，是省钱也是解耦：

- 凡是 `npm` 自己能处理的副作用，优先用 `pre*` / `post*` 脚本，而不是塞进 Claude hook 或 git hook。
- Claude hook 适合留给「真正只在 Claude 会话里才需要」的动作（比如自动 commit、自动改 memory）。
- 构建/部署这种纯机械流程，留在 npm 这一层最干净，也最便于 CI 复用。
