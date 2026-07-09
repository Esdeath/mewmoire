---
date: 2026-07-09T14:15:03+08:00
title: "用 sim-use 给 AI agent 装上眼睛和手：我在 Flutter 项目里的用法"
slug: sim-use-in-flutter-projects
description: "sim-use 是 LY Corporation 开源的跨平台 CLI，能把 iOS 模拟器和 Android 模拟器的屏幕变成 AI agent 可读的紧凑大纲，并支持按别名点按。这篇笔记记录我在 Flutter 项目里接入它的完整流程：安装、Semantics 配置、观察-操作-验证循环，以及几个踩过的坑。"
---

> 记录时间：2026-07-09 14:15:03
>
> 这篇笔记整理自我在 Flutter 项目里接入 [sim-use](https://github.com/lycorp-jp/sim-use) 的实践。它解决的是 agentic 开发里最后一环的问题：agent 写完代码之后，怎么自己去模拟器上确认「真的能用」。

## sim-use 是什么

一句话：**给 AI agent 在 iOS 模拟器和 Android 模拟器/真机上装上眼睛和手**。

它是 LY Corporation（LINE 雅虎）开源的跨平台 CLI，Apache 2.0 协议。核心就两个动作：

**观察（Observe）**——把当前屏幕变成一份 LLM 能直接推理的紧凑大纲：

```text
$ sim-use ui
App: Settings  402x874

[Top  y<120]
  @1  StaticText  "Settings"
[Content  y=120..754]
  @5  SearchField  "Search"
  @7  Button  "Sign in to your iPhone"
  @9  Button  "General"
  ...
[Bottom  y>754]
  @43 TabBar
```

**操作（Act）**——不用坐标，按别名直接点：

```text
$ sim-use tap @9
✓ Tap at (201.0, 452.0) completed successfully
```

官方说这份大纲比原始 JSON 无障碍树紧凑约 16 倍，一整屏只要几百 token。底层走的是 Meta idb 的 XCFramework、Apple 的 Accessibility API 和模拟器 HID 管线；Android 侧则是一个通过 `adb forward` 通信的桥接 APK。首次调用后有常驻 daemon，一轮「观察 → 操作」大约 300ms。

## 为什么 Flutter 项目需要它

我现在的 Flutter 开发流程里，代码大部分由 agent 完成。但一直有一个缺口：agent 改完 widget、跑完 `flutter analyze`、过完测试，最后那句「界面上真的对了吗」还是要我自己盯着模拟器点一遍。**计划、编码都自动化了，验证却是手动的**，等于开着自动驾驶还得自己踩刹车。

sim-use 补的就是这一环。agent 改完代码之后，可以自己执行：

```bash
sim-use ui          # 1. 看一眼屏幕
sim-use tap @9      # 2. 点进目标页面
sim-use ui          # 3. 确认结果
```

三条命令走完「观察 → 操作 → 验证」，agent 对自己刚写的 UI 有了闭环反馈，不再是「我改好了，你看看」，而是「我改好了，我看过了，截图在这」。

## 安装与接入 Claude Code

Homebrew 一行装好（macOS 14+）：

```bash
brew tap lycorp-jp/tap
brew install lycorp-jp/tap/sim-use
```

它自带一份 agent skill，直接安装进 AI 客户端的技能目录：

```bash
sim-use init --client claude    # 教会 Claude Code 全部命令面
```

装完之后不需要在 CLAUDE.md 里手写任何说明，agent 自己就知道 `ui`、`tap`、`batch` 这些动词怎么用。这是我见过接入成本最低的一档。

## 关键一步：让 Flutter 界面「可被看见」

sim-use 读的是**无障碍树**，而 Flutter 是自绘 UI，所有元素都靠语义树（Semantics）暴露给系统。这意味着两件事：

**第一，给关键控件加上稳定的标识。** Flutter 3.19 起 `Semantics` 有了 `identifier` 属性，在 iOS 上映射为 `accessibilityIdentifier`（Android 上是 `resource-id`），正好对应 sim-use 的 `#<id>` 选择器：

```dart
Semantics(
  identifier: 'submitButton',
  child: FilledButton(
    onPressed: _submit,
    child: const Text('提交'),
  ),
)
```

之后 agent 就可以用不随布局变化的方式操作它：

```bash
sim-use tap "#submitButton"
```

`@N` 别名快但依赖上一次 `ui` 的缓存，`#<id>` 才是写进脚本和 skill 里的稳定写法。列表页还有 `#3`（主列表第 3 个 cell）这种寻址，配合 Flutter 的 `ListView` 很好用。

**第二，确保语义树是开着的。** Flutter 默认按需构建语义树，如果 `sim-use ui` 只看到一个近乎空白的大纲，可以在 debug 入口处强制打开：

```dart
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  if (kDebugMode) {
    SemanticsBinding.instance.ensureSemantics();
  }
  runApp(const MyApp());
}
```

## 我的日常循环

跑 Flutter 时带上 `--pid-file`，让 agent 能自己触发热重载：

```bash
flutter run -d "iPhone 16" --pid-file /tmp/flutter.pid
```

agent 的一轮完整迭代长这样：

```bash
# 改完 Dart 代码后热重载（SIGUSR2 是热重启）
kill -USR1 $(cat /tmp/flutter.pid)

# 验证一个「搜索 → 进详情页」的流程，一条命令串完
sim-use ios batch \
  --wait-timeout 5 \
  --step "tap --id searchField" \
  --step "type 'flutter'" \
  --step "key 40" \
  --step "tap '#1'"

# 留证据
sim-use screenshot --output /tmp/verify.png
```

`batch` 会复用同一个 HID 会话和无障碍快照，多步流程比逐条调用快不少；`--wait-timeout` 让选择器点按轮询等待元素出现，是跨页面流程的关键。要交付演示时还可以 `sim-use record-video --output demo.mp4` 直接录屏。

Android 侧同一套动词，只是首次要装桥接 APK：

```bash
sim-use android init --device emulator-5554
sim-use ui --device emulator-5554
```

同样的 agent 循环脚本，iOS 和 Android 通吃，这对 Flutter 这种双端框架来说刚好。

## 踩过的坑

- **中文输入用 `paste`，别用 `type`。** HID 键码表达不了 CJK，`sim-use paste '中文内容'` 走剪贴板 + Cmd+V，绕开宿主输入法。注意 iOS 16+ 首次粘贴会弹「允许粘贴」确认框，sim-use 不会替你点掉，手动允许一次即可。
- **软键盘模式下 Cmd+V 会被丢弃。** 先用 `sim-use keyboard-state` 探测，输出 `soft` 时改走 `paste --via-menu --target-id xxx`（长按输入框走系统编辑菜单）。
- **崩溃检测是免费的。** daemon 会盯着目标进程，App 挂掉后下一次 `ui` 会直接带出横幅提示，Flutter 引擎崩溃再也不会被 agent「视而不见」。主动重启 App 后记得 `sim-use app-state --reset`。
- **想看 agent 看到了什么，跑 `sim-use viewer`。** 内置的本地网页会把 `ui --json` 渲染成可点按的 SVG，用来排查哪些 Flutter 控件没暴露语义、大纲里为什么缺元素，非常直观。

## 小结

sim-use 把「验证」这个环节从人手里交还给了 agent：语义大纲省 token，`#<id>` 选择器配合 Flutter 的 `Semantics.identifier` 稳定寻址，`batch` 串起多步流程，双端一套命令面。对 Flutter 项目来说，接入成本就是一次 `brew install`、一次 `sim-use init`，再加上给关键控件补 `identifier` 的习惯——换来的是 agent 能自己看、自己点、自己确认的完整闭环。

> 计划、编码、验证、交付——教会 agent 这个 CLI，agentic 移动开发的最后一块拼图就补上了。
