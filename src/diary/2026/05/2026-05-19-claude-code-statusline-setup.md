---
date: 2026-05-19T00:00:00+08:00
title: "Claude Code 自定义 statusline 配置与生成"
slug: claude-code-statusline-setup
description: "整理当前 Claude Code 终端底部状态栏的脚本实现（模型、上下文进度条、Git 分支、Token、费用），并说明如何快速复刻这套 statusline。"
---

> 记录时间：2026-05-19

## 问题

Claude Code 默认 statusline 信息有限。我希望终端底部能同时看到：当前模型名、上下文窗口占用百分比（带彩色进度条）、当前 Git 分支、本轮输入/输出 token、本次会话累计费用。如何把这套 statusline 整理成可复用的脚本，并快速安装到任意机器？

## 回答要点
如果你不想知道原理，直接生成跟我一样的statusline，只需要把下面一段话复制到Claude code对话框即可。

```
 /statusline display model name, context window with color (green<60% yellow 60-85% red>85%), git branch, session cost, and token usage
```
## 当前 statusline 长什么样

效果（去色后）示意：

```
Claude  [████████░░░░░░░░░░░░] 38%  minrui/it  in:12.3k out:1.2k  $0.0421
```

字段说明：

| 字段 | 含义 | 颜色 |
| --- | --- | --- |
| `Claude` | 当前模型 display name | 青色 |
| `[████░░░] 38%` | 上下文窗口占用 20 格进度条 | <60% 绿、60–85% 黄、>85% 红 |
| `minrui/it` | 当前工作目录的 Git 分支 | 青色 |
| `in:12.3k out:1.2k` | 本轮输入/输出 token（≥1000 自动转 `k`） | 暗色 |
| `$0.0421` | 本会话累计费用（USD） | 暗色 |

数据全部来自 Claude Code 通过 stdin 传给脚本的 JSON（`model`、`context_window`、`cwd`、`cost` 等字段）。

## 完整脚本

文件路径：`~/.claude/statusline-command.sh`

```sh
#!/bin/sh
input=$(cat)

# Colors
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
CYAN='\033[36m'
DIM='\033[2m'
RESET='\033[0m'

# Model name
model=$(echo "$input" | jq -r '.model.display_name // "Claude"')

# Context window
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')

if [ -n "$used" ]; then
  used_int=$(printf "%.0f" "$used")
  filled=$(( used_int / 5 ))
  empty=$(( 20 - filled ))

  if [ "$used_int" -lt 60 ]; then
    bar_color="$GREEN"
  elif [ "$used_int" -le 85 ]; then
    bar_color="$YELLOW"
  else
    bar_color="$RED"
  fi

  bar=""
  i=0
  while [ $i -lt $filled ]; do
    bar="${bar}█"
    i=$(( i + 1 ))
  done
  i=0
  while [ $i -lt $empty ]; do
    bar="${bar}░"
    i=$(( i + 1 ))
  done

  ctx_str="${bar_color}[${bar}] ${used_int}%${RESET}"
else
  ctx_str="${DIM}[░░░░░░░░░░░░░░░░░░░░] -${RESET}"
fi

# Token usage (input + output from current_usage)
in_tok=$(echo "$input" | jq -r '.context_window.current_usage.input_tokens // empty')
out_tok=$(echo "$input" | jq -r '.context_window.current_usage.output_tokens // empty')
if [ -n "$in_tok" ] && [ -n "$out_tok" ]; then
  if [ "$in_tok" -ge 1000 ]; then
    in_fmt=$(awk "BEGIN{printf \"%.1fk\", $in_tok/1000}")
  else
    in_fmt="${in_tok}"
  fi
  if [ "$out_tok" -ge 1000 ]; then
    out_fmt=$(awk "BEGIN{printf \"%.1fk\", $out_tok/1000}")
  else
    out_fmt="${out_tok}"
  fi
  tokens_str="${DIM}in:${in_fmt} out:${out_fmt}${RESET}"
else
  tokens_str=""
fi

# Git branch (from cwd field)
cwd=$(echo "$input" | jq -r '.cwd // .workspace.current_dir // empty')
branch=""
if [ -n "$cwd" ]; then
  branch=$(git -C "$cwd" --no-optional-locks rev-parse --abbrev-ref HEAD 2>/dev/null)
fi
if [ -n "$branch" ]; then
  branch_str="${CYAN}${branch}${RESET}"
else
  branch_str=""
fi

# Session cost
cost=$(echo "$input" | jq -r '.cost.total_cost_usd // empty')
if [ -n "$cost" ] && [ "$cost" != "null" ]; then
  cost_str=$(awk "BEGIN{printf \"\$%.4f\", $cost}")
else
  cost_str=""
fi

# Assemble status line
parts="${CYAN}${model}${RESET}  ${ctx_str}"
[ -n "$branch_str" ] && parts="${parts}  ${branch_str}"
[ -n "$tokens_str" ] && parts="${parts}  ${tokens_str}"
[ -n "$cost_str" ] && parts="${parts}  ${DIM}${cost_str}${RESET}"

printf '%b' "${parts}"
```

设计要点：

- 用 `jq` 解析 stdin JSON，找不到字段时用 `// empty` 兜底，保证字段缺失不会让脚本崩。
- 进度条用 20 个格子，每格代表 5%，纯 `printf` 拼字符，不依赖额外工具。
- Git 分支必须用 `git -C "$cwd"`，因为 statusline 进程的 `pwd` 不一定是项目目录；加 `--no-optional-locks` 防止抢锁。
- Token 数自动换算成 `12.3k`，避免长串数字撑爆状态栏。
- 颜色用 ANSI 转义码，最后通过 `printf '%b'` 让转义生效。

## 在 `settings.json` 中启用

编辑 `~/.claude/settings.json`，加上 `statusLine` 字段：

```json
{
  "statusLine": {
    "type": "command",
    "command": "sh /Users/your-name/.claude/statusline-command.sh"
  }
}
```

要点：

- `type` 固定为 `"command"`，表示用外部命令产出 statusline。
- `command` 路径写绝对路径，避免不同工作目录下找不到脚本。

## 快速生成这个 statusline（三步走）

在一台新机器上复刻这套 statusline，只需要：

```bash
# 1. 确认依赖（macOS 自带 git 和 awk；jq 用 brew 装）
brew install jq

# 2. 把脚本写到 ~/.claude/statusline-command.sh
mkdir -p ~/.claude
cat > ~/.claude/statusline-command.sh <<'SH'
# …上面 "完整脚本" 一整段，原样粘贴…
SH
chmod +x ~/.claude/statusline-command.sh

# 3. 在 ~/.claude/settings.json 里加 statusLine 配置（见上一节）
```

完成后重启 Claude Code，底部状态栏即生效。

也可以让 Claude Code 自己配：在会话里直接说「帮我配置一下 statusline，用这个脚本」并把脚本内容贴进去，它会调用 statusline-setup skill 自动写入两份文件。

## 小结

- statusline 本质是一个读 stdin JSON、输出一行字符串的 shell 脚本。
- 关键字段：`model.display_name`、`context_window.used_percentage`、`context_window.current_usage.{input,output}_tokens`、`cwd`、`cost.total_cost_usd`。
- 移植时只要带走 `~/.claude/statusline-command.sh` 和 `~/.claude/settings.json` 里的 `statusLine` 字段即可。
