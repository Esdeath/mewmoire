---
date: 2026-05-07T00:00:00+08:00
title: "Claude Code 自动跳过权限确认的三种方式"
slug: claude-code-auto-approve
description: "总结 Claude Code 执行任务时遇到 yes/no 权限提示的自动跳过方法，包括启动标志、默认模式和针对性预授权规则。"
---

> 记录时间：2026-05-07

## 问题

在使用 Claude Code 执行任务时，经常遇到权限确认提示（yes/no），需要手动选择，打断工作流。如何让它自动选择 yes、跳过确认？

## 方法一：启动时加标志（最简单粗暴）

```bash
claude --dangerously-skip-permissions
```

直接跳过所有权限提示。适合在安全、可控的环境中使用，不建议在生产环境或敏感项目中开启。

## 方法二：设置默认权限模式

在 `.claude/settings.json` 中配置 `defaultMode`：

```json
{
  "defaultMode": "acceptEdits"
}
```

可选模式：

| 模式 | 行为 |
|------|------|
| `"plan"` | 只读模式，只能读文件和执行只读命令 |
| `"acceptEdits"` | 自动批准文件编辑和常用文件操作（mkdir、touch、mv、cp），危险命令仍会提示 |
| `"bypassPermissions"` | 跳过所有权限提示 |

**推荐日常开发使用 `"acceptEdits"`**，兼顾效率和安全。

## 方法三：针对特定工具预授权（最精细）

在 `settings.json` 的 `permissions.allow` 数组中添加规则，只对匹配的操作自动放行：

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git *)",
      "Edit"
    ]
  }
}
```

- `Bash(npm run *)` — 自动批准所有 npm 脚本
- `Bash(git *)` — 自动批准所有 git 命令
- `Edit` — 自动批准所有文件编辑
- 也支持路径限定，如 `Edit(/src/**)`、`WebFetch(domain:github.com)`

不匹配的操作仍然会弹出确认提示。

## 建议

日常开发最佳实践：**`"acceptEdits"` 模式 + 常用命令的 `allow` 规则**。既不用频繁点确认，又能在执行危险操作时收到提醒。
