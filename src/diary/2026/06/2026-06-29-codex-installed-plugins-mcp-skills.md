---
date: 2026-06-29T16:23:17+08:00
title: "这台机器上的 Codex 插件、MCP 与 Skills 盘点"
slug: codex-installed-plugins-mcp-skills
description: "一次本机 Codex 环境盘点：当前启用插件、本地缓存插件包、MCP server、个人 skills、插件内置 skills 和被禁用的飞书 skills。"
---

> 记录时间：2026-06-29 16:23:17

这是一份本机 Codex 环境盘点。数据来自当前机器上的 `~/.codex/config.toml`、`~/.codex/plugins/cache`、`~/.codex/skills` 和 `~/.agents/skills`。为了避免把“下载过的包”和“当前启用的能力”混为一谈，下面按层次拆开列。

## 先看结论

当前配置里，明确启用的插件有 11 个；本地插件缓存里有 18 个插件包；显式配置的 MCP server 是 `node_repl`；另外有 3 个插件包自带 MCP 定义。个人 Codex skills 有 15 个，`.agents` 目录下还有 26 个 agent skills，其中飞书系列在当前 Codex 配置中被显式禁用。

真正日常会影响 Codex 行为的，主要是三层：

1. `config.toml` 里启用的插件；
2. 当前会话可见的 plugin skills 和个人 skills；
3. MCP server 或 app connector 提供的外部操作能力。

## 当前启用的插件

`~/.codex/config.toml` 中启用的插件如下：

| 插件 | 来源 | 用途 |
| --- | --- | --- |
| `frontend-design` | `claude-plugins-official` | 前端视觉设计、UI/UX 实现指导 |
| `skill-creator` | `claude-plugins-official` | 创建、改进和评估 skills |
| `documents` | `openai-primary-runtime` | Word / Google Docs 类文档创建与编辑 |
| `spreadsheets` | `openai-primary-runtime` | 表格创建、分析、可视化和导出 |
| `presentations` | `openai-primary-runtime` | PowerPoint / Slides 演示文稿创建与编辑 |
| `pdf` | `openai-primary-runtime` | PDF 读取、创建、检查和渲染验证 |
| `template-creator` | `openai-primary-runtime` | 创建和更新个人 artifact template skills |
| `superpowers` | `openai-curated` | 规划、TDD、调试、代码审查等工程流程 |
| `browser` | `openai-bundled` | 控制 Codex 内置浏览器 |
| `chrome` | `openai-bundled` | 控制用户 Chrome，复用登录态和浏览器状态 |
| `computer-use` | `openai-bundled` | 控制本机 macOS 桌面应用 |

这 11 个是当前配置明确写了 `enabled = true` 的插件。

## 本地缓存的插件包

本地 `~/.codex/plugins/cache` 里还有更多已经下载到机器上的插件包。它们不等于全部都在 `config.toml` 中启用，但说明本机已经具备这些插件文件：

| 插件包 | 版本 | 说明 |
| --- | --- | --- |
| `github` | `0.1.5` | 通过 GitHub connector 和 CLI 辅助查看仓库、PR、issue、CI 与发布变更 |
| `figma` | `2.0.12` | Figma 设计读取、写入、Code Connect、设计系统等工作流 |
| `gmail` | `0.1.3` | 通过 Gmail connector 搜索、阅读、整理和草拟邮件 |
| `build-web-apps` | `0.1.0` | Web app 构建、前端调试、React、Supabase、Stripe、shadcn 等 |
| `build-ios-apps` | `0.1.0` | iOS / SwiftUI 构建、调试、性能分析和模拟器工作流 |
| `expo` | `1.0.0` | Expo / React Native 构建、部署、升级和原生模块 |
| `build-macos-apps` | `0.1.2` | macOS / SwiftUI / AppKit / Xcode 本地应用开发 |
| `superpowers` | `5.1.3` | 工程流程方法论插件 |
| `documents` | `26.623.12021` | 文档 artifact runtime |
| `spreadsheets` | `26.623.12021` | 表格 artifact runtime |
| `presentations` | `26.623.12021` | 演示文稿 artifact runtime |
| `pdf` | `26.623.12021` | PDF artifact runtime |
| `template-creator` | `26.623.12021` | 模板创建 runtime |
| `frontend-design` | 未写版本 | Claude 官方前端设计 skill |
| `skill-creator` | 未写版本 | Claude 官方 skill 创建工具 |
| `browser` | `26.623.61825` | 内置浏览器插件 |
| `chrome` | `26.623.61825` | Chrome 控制插件 |
| `computer-use` | `1.0.857` | macOS Computer Use 插件 |

其中 GitHub、Figma、Gmail 插件还分别带有 app connector 配置，连接器 ID 分别存在本地 `.app.json` 中。文章只记录能力类型，不展开 connector ID。

## MCP server

当前 `config.toml` 中显式配置的 MCP server 只有一个：

| MCP server | 类型 | 作用 |
| --- | --- | --- |
| `node_repl` | 本地命令 | 提供持久 Node.js kernel，支持 browser / chrome 插件的脚本控制场景 |

插件缓存中还有 3 个插件自带 `.mcp.json`：

| 来源插件 | MCP server | 类型 |
| --- | --- | --- |
| `figma` | `figma` | HTTP MCP，指向 Figma MCP 服务 |
| `build-ios-apps` | `xcodebuildmcp` | 通过 `npx xcodebuildmcp@latest mcp` 启动 |
| `computer-use` | `computer-use` | 本地 macOS Computer Use MCP 命令 |

这说明 MCP 能力分两种：一种直接写在全局配置里，一种随插件包提供，是否实际进入某次会话，还取决于插件启用状态、连接器状态和当前运行环境。

## 个人 Codex skills

`~/.codex/skills` 下有 15 个个人或手动安装的 skills：

- `agents-sdk`
- `chatgpt-apps`
- `cloudflare`
- `cloudflare-email-service`
- `cloudflare-one`
- `cloudflare-one-migrations`
- `durable-objects`
- `figma`
- `publish-article`
- `sandbox-sdk`
- `turnstile-spin`
- `web-perf`
- `workers-best-practices`
- `wrangler`
- `yeet`

这一层更像“长期放在本机的工作说明书”。例如这篇文章使用的发布流程，就是 `publish-article` skill：先生成 `src/diary/YYYY/MM/YYYY-MM-DD-slug.md`，再构建，最后用 Cloudflare Pages 发布。

## 插件内置 skills

本地缓存插件包里总共有 79 个 `SKILL.md`。按插件分组如下：

| 插件 | skills |
| --- | --- |
| `github` | `github`, `gh-fix-ci`, `gh-address-comments`, `yeet` |
| `figma` | `figma-use`, `figma-use-figjam`, `figma-use-motion`, `figma-use-slides`, `figma-create-new-file`, `figma-generate-design`, `figma-generate-diagram`, `figma-generate-library`, `figma-implement-motion`, `figma-swiftui`, `figma-code-connect` |
| `gmail` | `gmail`, `gmail-inbox-triage` |
| `build-web-apps` | `frontend-app-builder`, `frontend-testing-debugging`, `react-best-practices`, `shadcn-best-practices`, `stripe-best-practices`, `supabase-best-practices` |
| `build-ios-apps` | `ios-app-intents`, `ios-debugger-agent`, `ios-ettrace-performance`, `ios-memgraph-leaks`, `swiftui-liquid-glass`, `swiftui-performance-audit`, `swiftui-ui-patterns`, `swiftui-view-refactor` |
| `expo` | `building-native-ui`, `codex-expo-run-actions`, `expo-api-routes`, `expo-cicd-workflows`, `expo-deployment`, `expo-dev-client`, `expo-module`, `expo-tailwind-setup`, `expo-ui-jetpack-compose`, `expo-ui-swift-ui`, `native-data-fetching`, `upgrading-expo`, `use-dom` |
| `superpowers` | `using-superpowers`, `brainstorming`, `writing-plans`, `executing-plans`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `requesting-code-review`, `receiving-code-review`, `dispatching-parallel-agents`, `subagent-driven-development`, `using-git-worktrees`, `finishing-a-development-branch`, `writing-skills` |
| `build-macos-apps` | `appkit-interop`, `build-run-debug`, `liquid-glass`, `packaging-notarization`, `signing-entitlements`, `swiftpm-macos`, `swiftui-patterns`, `telemetry`, `test-triage`, `view-refactor`, `window-management` |
| `openai-primary-runtime` | `documents`, `spreadsheets`, `presentations`, `pdf`, `template-creator` |
| `claude-plugins-official` | `frontend-design`, `skill-creator` |
| `openai-bundled` | `control-in-app-browser`, `control-chrome`, `computer-use` |

这也是为什么 Codex 的能力不只是“一个模型”。模型之外，还有一组可以被任务触发的操作说明、工具约束和工作流。

## `.agents` skills 与禁用状态

`~/.agents/skills` 下还有 26 个 agent skills：

- `agent-reach`
- `find-skills`
- `lark-approval`
- `lark-attendance`
- `lark-base`
- `lark-calendar`
- `lark-contact`
- `lark-doc`
- `lark-drive`
- `lark-event`
- `lark-im`
- `lark-mail`
- `lark-markdown`
- `lark-minutes`
- `lark-okr`
- `lark-openapi-explorer`
- `lark-shared`
- `lark-sheets`
- `lark-skill-maker`
- `lark-slides`
- `lark-task`
- `lark-vc`
- `lark-whiteboard`
- `lark-wiki`
- `lark-workflow-meeting-summary`
- `lark-workflow-standup-report`

其中飞书 / Lark 系列在 `config.toml` 的 `[[skills.config]]` 中被逐项标记为 `enabled = false`。这意味着这些文件还在本机，但当前 Codex 配置不会默认启用它们。`agent-reach` 和 `find-skills` 不在这批禁用项里。

## 这份清单怎么用

以后排查 Codex 能力时，可以按这个顺序看：

1. 先看 `config.toml`：哪些插件真正启用了，哪些 MCP server 明确挂载了。
2. 再看插件 cache：哪些插件包已经下载到本机，但未必启用。
3. 再看 `~/.codex/skills`：哪些长期工作流说明是个人安装的。
4. 最后看 `.agents/skills` 和 `[[skills.config]]`：哪些外部 agent skills 存在，但被当前配置禁用。

这个层次很重要。插件包在 cache 里，不代表当前任务一定会触发；skill 文件存在，也不代表它处于启用状态；MCP 定义存在，也不代表外部服务已经认证完成。真正可靠的判断，是把“文件存在”“配置启用”“会话可见”“认证可用”四件事分开看。
