---
date: 2026-05-03T10:00:00+08:00
title: "Flutter / iOS / Android / Vue 四平台横向对比"
slug: cross-platform-comparison
description: "以同一主题为轴，横向对比四个平台的基础、重难点、易错点与面试高频考点。"
---

> 以同一主题为轴，横向对比四个平台的基础、重难点、易错点与面试高频考点。
> 适合有 Flutter/iOS 经验、正在拓展 Android 和 Vue 的工程师复习使用。

---

## 目录

1. [语言基础对比](#1-语言基础对比)
2. [UI 构建范式](#2-ui-构建范式)
3. [状态管理](#3-状态管理)
4. [布局系统](#4-布局系统)
5. [导航与路由](#5-导航与路由)
6. [网络与数据层](#6-网络与数据层)
7. [持久化存储](#7-持久化存储)
8. [并发与异步编程](#8-并发与异步编程)
9. [渲染机制与性能优化](#9-渲染机制与性能优化)
10. [平台通信与原生能力](#10-平台通信与原生能力)
11. [架构模式](#11-架构模式)
12. [构建、测试与发布](#12-构建测试与发布)

---

## 1. 语言基础对比

### 1.1 语言概览

| 维度 | Dart (Flutter) | Swift (iOS) | Kotlin (Android) | TypeScript (Vue) |
|------|---------------|-------------|-------------------|------------------|
| 类型系统 | 静态强类型 | 静态强类型 | 静态强类型 | 静态强类型（JS超集） |
| 空安全 | Sound null safety | Optional (`?`) | Nullable (`?`) | strict null checks |
| 编译方式 | AOT (release) + JIT (debug) | AOT | JVM 字节码 / Native | 转译为 JS |
| 内存管理 | GC（分代回收） | ARC（引用计数） | GC（JVM） | GC（V8 引擎） |
| 函数式支持 | 有（不如 Kotlin 强） | 协议 + 泛型 + 高阶函数 | 最强（扩展函数、作用域函数） | 原生支持 |

### 1.2 空安全机制对比

```dart
// Dart — Sound null safety
String? name;          // 可空
String nonNull = '';   // 不可空
name?.length;          // 安全调用
name!.length;          // 强制解包（可能抛异常）
name ?? 'default';     // 空合并
```

```swift
// Swift — Optional
var name: String?       // 可空
var nonNull: String = ""// 不可空
name?.count             // 可选链
name!.count             // 强制解包（可能崩溃）
name ?? "default"       // 空合并
if let n = name { }     // 可选绑定（Dart 没有）
guard let n = name else { return }  // 提前退出
```

```kotlin
// Kotlin — Nullable
var name: String? = null  // 可空
var nonNull: String = ""  // 不可空
name?.length              // 安全调用
name!!.length             // 强制解包
name ?: "default"         // Elvis 操作符
name?.let { println(it) } // 作用域函数（Dart/Swift 没有）
```

```typescript
// TypeScript — strict null checks
let name: string | null = null;  // 联合类型
let nonNull: string = "";
name?.length;                     // 可选链
name!.length;                     // 非空断言
name ?? "default";                // 空值合并
```

> ⚠️ **重难点**：Dart 的 null safety 是 sound 的（编译器保证运行时不会出现非空变量为 null），Swift 的 Optional 是类型系统的一部分（`Optional<String>` 是独立类型），Kotlin 在 JVM 上需要处理 Java 互操作的 platform type，TypeScript 的 null check 只在编译时生效，运行时仍是 JS。

> ❌ **易错点**：
> - Dart：`late` 变量未初始化就使用会运行时报错，不是编译时错误
> - Swift：`implicitly unwrapped optional (!)` 声明容易忘记判空
> - Kotlin：Java 互操作时 platform type 不会触发空检查
> - TypeScript：`any` 类型绕过所有类型检查，`as` 断言不做运行时校验

> 🎯 **面试考点**：
> - Dart sound null safety 和 Kotlin null safety 的区别？（Dart 编译器完全保证，Kotlin 有 platform type 漏洞）
> - Swift Optional 的本质是什么？（是枚举 `enum Optional<T> { case none, some(T) }`）
> - TypeScript 的类型检查发生在什么阶段？（仅编译时，运行时无类型信息）

---

### 1.3 值类型 vs 引用类型

| 概念 | Dart | Swift | Kotlin | TypeScript |
|------|------|-------|--------|------------|
| 值类型 | 无（除 int/double 等基本类型） | `struct`, `enum`, 元组 | `data class`（copy 语义） | 原始类型（number, string, boolean） |
| 引用类型 | `class` | `class` | `class` | `object`, `array`, `class` |
| Copy 机制 | 手动 `copyWith` | 自动 copy-on-write | 手动 `.copy()` | 手动展开 `{...obj}` |
| 不可变 | `final` / `const` | `let` | `val` | `const` / `readonly` |

```dart
// Dart — 没有 struct，用 class + copyWith 模拟值语义
class Point {
  final int x, y;
  const Point(this.x, this.y);
  Point copyWith({int? x, int? y}) => Point(x ?? this.x, y ?? this.y);
}
```

```swift
// Swift — struct 是值类型，赋值即拷贝
struct Point {
    var x: Int
    var y: Int
}
var a = Point(x: 1, y: 2)
var b = a       // 拷贝，修改 b 不影响 a
b.x = 10       // a.x 仍为 1
```

```kotlin
// Kotlin — data class 提供 copy()，但仍是引用类型
data class Point(val x: Int, val y: Int)
val a = Point(1, 2)
val b = a.copy(x = 10)  // a 不变
```

```typescript
// TypeScript — 对象是引用类型，需展开操作符
interface Point { x: number; y: number }
const a: Point = { x: 1, y: 2 };
const b = { ...a, x: 10 };  // 浅拷贝
```

> ⚠️ **重难点**：Swift 的 struct 是真正的值类型（栈分配 + copy-on-write），Kotlin 的 `data class` 虽然提供 `copy()` 但本质仍在堆上。Dart 完全没有值类型 struct，全部是引用类型。

> ❌ **易错点**：
> - Swift 在 `struct` 中使用 `mutating` 方法时容易混淆值语义
> - TypeScript 的 `{...obj}` 只是浅拷贝，嵌套对象仍是引用共享
> - Kotlin `data class` 的 `equals()` 只比较主构造函数参数

> 🎯 **面试考点**：
> - Swift 中什么时候用 struct，什么时候用 class？（默认用 struct，需要继承/引用语义/deinit 时用 class）
> - Dart 为什么没有 struct？（Dart 全部对象在堆上，GC 管理，不适合栈分配值类型）

---

### 1.4 集合操作与函数式编程

| 操作 | Dart | Swift | Kotlin | TypeScript |
|------|------|-------|--------|------------|
| 映射 | `.map()` | `.map()` | `.map()` | `.map()` |
| 过滤 | `.where()` | `.filter()` | `.filter()` | `.filter()` |
| 归约 | `.fold()` | `.reduce()` | `.fold()` | `.reduce()` |
| 扁平化 | `.expand()` | `.flatMap()` | `.flatMap()` | `.flatMap()` |
| 排序 | `.sort()` (原地) | `.sorted()` (新数组) | `.sortedBy()` | `.sort()` (原地) |
| 首个匹配 | `.firstWhere()` | `.first(where:)` | `.first {}` | `.find()` |
| 分组 | 手动 | `Dictionary(grouping:by:)` | `.groupBy {}` | 手动或 lodash |

> ❌ **易错点**：
> - Dart 的 `.map()` 返回 **惰性 Iterable**，不是 List！需要 `.toList()` 才能多次遍历
> - Swift 的 `.sorted()` 返回新数组，`.sort()` 原地排序（注意 mutating）
> - Kotlin 的 `.map()` 立即求值返回 List，`.asSequence().map()` 才是惰性的
> - TypeScript 的 `.sort()` 是原地排序且返回自身（容易误以为返回新数组）

---

### 1.5 模式匹配

```dart
// Dart 3 — switch 表达式 + sealed class
sealed class Shape {}
class Circle extends Shape { final double r; Circle(this.r); }
class Rect extends Shape { final double w, h; Rect(this.w, this.h); }

String describe(Shape s) => switch (s) {
  Circle(r: var r) => '圆形 r=$r',
  Rect(w: var w, h: var h) => '矩形 ${w}x$h',
};
```

```swift
// Swift — enum + 关联值 + switch 穷举
enum Shape {
    case circle(r: Double)
    case rect(w: Double, h: Double)
}
func describe(_ s: Shape) -> String {
    switch s {
    case .circle(let r): return "圆形 r=\(r)"
    case .rect(let w, let h): return "矩形 \(w)x\(h)"
    }
}
```

```kotlin
// Kotlin — sealed class + when
sealed class Shape
data class Circle(val r: Double) : Shape()
data class Rect(val w: Double, val h: Double) : Shape()

fun describe(s: Shape) = when (s) {
    is Circle -> "圆形 r=${s.r}"
    is Rect -> "矩形 ${s.w}x${s.h}"
}
```

```typescript
// TypeScript — 联合类型 + 判别属性
type Shape =
  | { kind: 'circle'; r: number }
  | { kind: 'rect'; w: number; h: number };

function describe(s: Shape): string {
  switch (s.kind) {
    case 'circle': return `圆形 r=${s.r}`;
    case 'rect': return `矩形 ${s.w}x${s.h}`;
  }
}
```

> 🎯 **面试考点**：
> - Dart 3 的 sealed class 和 Kotlin 的 sealed class 有什么区别？（Dart 要求同文件，Kotlin 要求同 package）
> - Swift enum 的关联值 vs Kotlin sealed class，哪个更灵活？（Kotlin 的子类可以有自己的方法和属性）
> - TypeScript 的判别联合 (discriminated union) 如何保证穷举？（开启 `strictNullChecks` + `never` 类型兜底）

---

## 2. UI 构建范式

### 2.1 声明式 UI 对比

| 维度 | Flutter (Widget) | iOS (SwiftUI) | Android (Compose) | Vue (SFC) |
|------|------------------|---------------|--------------------|-----------| 
| 构建单元 | Widget 类 | View struct | @Composable 函数 | `.vue` 单文件组件 |
| 最小更新单位 | Element 树 diff | View diff | Recomposition | Virtual DOM diff |
| UI 描述方式 | Dart 代码嵌套 | Swift DSL（ViewBuilder） | Kotlin DSL | `<template>` HTML 模板 |
| 样式机制 | Widget 属性 | Modifier 链式调用 | Modifier 链式调用 | CSS / Scoped CSS |
| 有/无状态区分 | StatelessWidget / StatefulWidget | View (统一) | @Composable (统一) | 统一（Composition API） |

### 2.2 基本组件写法

```dart
// Flutter — StatelessWidget
class Greeting extends StatelessWidget {
  final String name;
  const Greeting({required this.name});
  
  @override
  Widget build(BuildContext context) {
    return Text('Hello, $name', style: TextStyle(fontSize: 16));
  }
}
```

```swift
// SwiftUI — View
struct Greeting: View {
    let name: String
    
    var body: some View {
        Text("Hello, \(name)")
            .font(.body)
    }
}
```

```kotlin
// Compose — @Composable
@Composable
fun Greeting(name: String) {
    Text(
        text = "Hello, $name",
        fontSize = 16.sp
    )
}
```

```vue
<!-- Vue 3 — SFC -->
<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <span style="font-size: 16px">Hello, {{ name }}</span>
</template>
```

> ⚠️ **重难点**：
> - Flutter 的 Widget 是不可变的配置描述，真正的可变状态在 State 对象中；SwiftUI 的 View 也是 struct（值类型），每次 body 重新计算
> - Compose 的 @Composable 不是类，是函数 + 编译器插件注入的位置 key
> - Vue 的 `<template>` 编译为 render 函数，最终通过 Virtual DOM diff 更新真实 DOM

> 🎯 **面试考点**：
> - Flutter Widget 为什么设计成 immutable？（频繁创建+销毁，GC 高效处理短命对象；真正昂贵的是 RenderObject，它被复用）
> - SwiftUI 的 `some View` 是什么？（不透明返回类型，编译器知道具体类型但调用者不知道）
> - Vue `<script setup>` 和 Options API 的区别？（setup 是 Composition API 的语法糖，更好的类型推导和 tree-shaking）

---

### 2.3 组件生命周期对比

| 阶段 | Flutter | SwiftUI | Compose | Vue 3 |
|------|---------|---------|---------|-------|
| 创建 | `createState()` | `init()` | 首次组合 | `setup()` |
| 挂载 | `initState()` | `onAppear` | `LaunchedEffect` | `onMounted()` |
| 更新 | `didUpdateWidget()` | body 重新计算 | Recomposition | 响应式自动触发 |
| 卸载 | `dispose()` | `onDisappear` | `DisposableEffect` | `onUnmounted()` |
| 依赖变化 | `didChangeDependencies()` | `onChange(of:)` | `LaunchedEffect(key)` | `watch()` |

> ❌ **易错点**：
> - Flutter: `initState` 中不能直接用 `context` 获取 InheritedWidget（此时 didChangeDependencies 还没调用）
> - SwiftUI: `onAppear` 可能被多次调用（NavigationStack 返回时），不等于 `viewDidLoad`
> - Compose: `LaunchedEffect(Unit)` 只在首次组合执行，key 变化会取消重启
> - Vue: `setup()` 在组件实例创建后、挂载前执行，此时 DOM 不存在

---

### 2.4 条件渲染与列表渲染

```dart
// Flutter
Column(children: [
  if (isLoggedIn) Text('Welcome'),      // 条件
  ...items.map((e) => ListTile(title: Text(e))), // 列表
])
```

```swift
// SwiftUI
VStack {
    if isLoggedIn { Text("Welcome") }    // 条件
    ForEach(items, id: \.self) { item in // 列表
        Text(item)
    }
}
```

```kotlin
// Compose
Column {
    if (isLoggedIn) { Text("Welcome") }  // 条件
    items.forEach { item ->              // 列表
        Text(item)
    }
}
```

```vue
<!-- Vue -->
<div>
  <span v-if="isLoggedIn">Welcome</span>    <!-- 条件 -->
  <div v-for="item in items" :key="item">   <!-- 列表 -->
    {{ item }}
  </div>
</div>
```

> ❌ **易错点**：
> - Vue 的 `v-for` 必须绑定 `:key`，否则 diff 算法会就地复用导致状态错乱
> - Flutter 的 `ListView.builder` 要用 `Key` 来保持列表项状态
> - SwiftUI 的 `ForEach` 中的 `id` 参数必须唯一，否则 diff 出错
> - Compose 的 `LazyColumn` 中 `items` 的 `key` 同理必须唯一且稳定

---

## 3. 状态管理

### 3.1 局部状态

| 场景 | Flutter | SwiftUI | Compose | Vue 3 |
|------|---------|---------|---------|-------|
| 组件内状态 | `StatefulWidget` + `setState()` | `@State` | `remember { mutableStateOf() }` | `ref()` / `reactive()` |
| 派生状态 | 手动计算（或 ValueNotifier） | computed property | `derivedStateOf` | `computed()` |
| 副作用 | `initState` / `didUpdateWidget` | `.onAppear` / `.onChange` / `.task` | `LaunchedEffect` / `SideEffect` | `onMounted` / `watch` / `watchEffect` |

```dart
// Flutter
class Counter extends StatefulWidget {
  @override State<Counter> createState() => _CounterState();
}
class _CounterState extends State<Counter> {
  int count = 0;
  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => setState(() => count++),
      child: Text('$count'),
    );
  }
}
```

```swift
// SwiftUI
struct Counter: View {
    @State private var count = 0
    var body: some View {
        Button("\(count)") { count += 1 }
    }
}
```

```kotlin
// Compose
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    Button(onClick = { count++ }) { Text("$count") }
}
```

```vue
<!-- Vue 3 -->
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>
<template>
  <button @click="count++">{{ count }}</button>
</template>
```

> ⚠️ **重难点**：
> - Flutter 的 `setState()` 标记当前 Element dirty，触发 build 重建整棵 Widget 子树（但 Element/RenderObject 会复用）
> - SwiftUI 的 `@State` 内部是 property wrapper，值存储在框架管理的存储区，View struct 重建不影响状态
> - Compose 的 `remember` 将值绑定到组合树的位置 (positional memoization)
> - Vue 的 `ref()` 基于 Proxy 代理实现响应式追踪

> 🎯 **面试考点**：
> - `setState()` 是同步还是异步的？（同步的，但 build 是在下一帧微任务中执行）
> - SwiftUI `@State` vs `@Binding` vs `@ObservedObject` vs `@StateObject` 的区别？（所有权和生命周期不同）
> - Vue `ref()` vs `reactive()` 怎么选？（ref 适合基本类型和需要替换的对象，reactive 适合不会整体替换的对象）
> - Compose `remember` vs `rememberSaveable` 的区别？（后者在 configuration change 时保存状态）

---

### 3.2 全局/跨组件状态

| 方案 | Flutter | SwiftUI | Compose | Vue 3 |
|------|---------|---------|---------|-------|
| 官方推荐 | Provider / Riverpod | `@EnvironmentObject` | ViewModel + `hiltViewModel()` | Pinia |
| 依赖注入 | Provider / GetIt / GetX | Environment / @EnvironmentObject | Hilt (Dagger) | provide / inject |
| 事件总线 | EventBus / Stream | Combine Publisher | SharedFlow / Channel | mitt / EventBus |
| 不可变状态流 | BLoC (Stream) | Combine | StateFlow + MVI | Pinia + actions |

> ⚠️ **重难点**：
> - Flutter Provider 基于 InheritedWidget，`context.watch<T>()` 和 `context.read<T>()` 的区别是前者订阅变化后者不订阅
> - SwiftUI `@StateObject` vs `@ObservedObject`：前者拥有对象生命周期，后者不拥有（View 重建可能导致对象重建）
> - Compose 的 ViewModel 在 Activity/Fragment 的 ViewModelStore 中，存活于 configuration change
> - Vue 的 Pinia store 是单例，但 SSR 场景下需要注意 store 隔离

> ❌ **易错点**：
> - Flutter: `Provider` 放错位置导致 `ProviderNotFoundException`
> - SwiftUI: 用 `@ObservedObject` 代替 `@StateObject` 导致状态丢失（View 重建时对象被重新创建）
> - Compose: 在 `@Composable` 之外收集 StateFlow 导致不响应更新
> - Vue: 在 `<script setup>` 外部解构 Pinia store 导致响应性丢失（需要 `storeToRefs()`）

---

### 3.3 响应式原理对比

| 维度 | Flutter | SwiftUI | Compose | Vue |
|------|---------|---------|---------|-----|
| 触发机制 | 手动 `setState()` 或 `notifyListeners()` | `@Published` 属性变化 | `MutableState` 值变化 | Proxy getter/setter 拦截 |
| 追踪粒度 | Widget 级别 | View body 级别 | 读取点级别（最细） | 属性级别 |
| 更新范围 | 标记 dirty 的 Element 子树 | body 重新求值 | 只重组读取了变化状态的 Composable | 关联的组件重新渲染 |
| 批量更新 | 同一帧合并 | 同一 RunLoop 合并 | 快照系统 (Snapshot) | nextTick 微任务合并 |

> 🎯 **面试考点**：
> - Vue 的响应式原理是什么？（Vue 3 用 Proxy 拦截 get/set，收集依赖 track，派发更新 trigger）
> - Compose 的 Recomposition 如何做到精确更新？（编译器插入的代码在状态读取时建立依赖关系，只重组受影响的 scope）
> - Flutter 的 `const` Widget 为什么能优化性能？（canUpdate 时 widget == 旧widget，跳过 build）

---

## 4. 布局系统

### 4.1 布局方式对比

| 布局 | Flutter | SwiftUI | Compose | Vue (CSS) |
|------|---------|---------|---------|-----------|
| 水平排列 | `Row` | `HStack` | `Row` | `display: flex` |
| 垂直排列 | `Column` | `VStack` | `Column` | `flex-direction: column` |
| 层叠 | `Stack` | `ZStack` | `Box` | `position: relative/absolute` |
| 网格 | `GridView` | `LazyVGrid` / `LazyHGrid` | `LazyVerticalGrid` | `display: grid` |
| 弹性占比 | `Expanded` / `Flexible` | `.frame(maxWidth: .infinity)` | `Modifier.weight()` | `flex: 1` |
| 间距 | `SizedBox` / `Padding` | `.padding()` / `Spacer()` | `Spacer()` / `Modifier.padding()` | `margin` / `padding` / `gap` |
| 滚动 | `ListView` / `SingleChildScrollView` | `ScrollView` / `List` | `LazyColumn` / `verticalScroll` | `overflow: auto` |

### 4.2 约束传递机制

```
Flutter: 父传约束 → 子确定大小 → 父决定位置（单次遍历，O(n)）
         BoxConstraints(minW, maxW, minH, maxH) → Size → Offset

SwiftUI: 父提供建议尺寸 → 子返回实际尺寸 → 父决定位置
         ProposedViewSize → ViewDimensions → position

Compose: 父传约束 → 子测量返回 Placeable → 父布局
         Constraints → MeasureResult → layout { placeable.place(x, y) }

Vue/CSS: 盒模型 → 流式布局/Flex/Grid
         content-box / border-box → 流式计算
```

> ⚠️ **重难点**：
> - Flutter 的 `Constraints go down, Sizes go up, Parent sets position` 是布局三原则
> - SwiftUI 布局是**子控制大小**：父只提建议，子自己决定多大（和 Flutter 不同）
> - Compose 的 `intrinsic measurement` 允许子组件查询兄弟尺寸（SubcomposeLayout）
> - CSS 的 `flex-grow/shrink/basis` 三属性组合是 Flexbox 的核心

> ❌ **易错点**：
> - Flutter: `Column` 中子组件高度无限 + 外层没有约束 → `unbounded height` 崩溃（需 `Expanded` 或 `Flexible`）
> - Flutter: `Row` 中放 `ListView` 不加约束 → 无限宽度崩溃
> - SwiftUI: `.frame()` 只是提建议，不是强制约束；子 View 可以超出 frame
> - Vue/CSS: `flex: 1` 在嵌套 flex 容器中不生效时，检查父容器是否设了高度

> 🎯 **面试考点**：
> - Flutter 中 `Expanded` 和 `Flexible` 的区别？（Expanded 是 `fit: FlexFit.tight` 必须填满，Flexible 是 `loose` 可以小于分配空间）
> - 解释 Flutter 的 "tight constraints" 和 "loose constraints"？（tight: min==max, loose: min==0）
> - CSS `flex: 1 1 0` 和 `flex: 1 1 auto` 的区别？（basis 为 0 按比例分配，auto 先满足内容再分配剩余）

---

## 5. 导航与路由

### 5.1 路由方案对比

| 维度 | Flutter | iOS (SwiftUI) | iOS (UIKit) | Android (Compose) | Vue |
|------|---------|---------------|-------------|--------------------|----|
| 声明式路由 | GoRouter | NavigationStack | — | Navigation Compose | Vue Router |
| 命令式路由 | Navigator.push | — | UINavigationController.push | — | router.push |
| 路由定义 | RouteConfiguration | NavigationPath | Storyboard/代码 | NavHost + composable() | createRouter() |
| 参数传递 | pathParameters / extra | NavigationDestination init | prepareForSegue / 属性赋值 | arguments Bundle / 类型安全 | params / query / props |
| 深链接 | GoRouter deepLink | `onOpenURL` | Universal Links | Deep Links | Vue Router 本身 |
| 路由守卫 | GoRouter redirect | — | — | — | `beforeEach` / `beforeEnter` |
| 嵌套路由 | ShellRoute | NavigationSplitView | Tab + Nav 组合 | nested NavHost | `children` 嵌套 |

### 5.2 基本路由代码

```dart
// Flutter — GoRouter
final router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (_, __) => HomePage()),
    GoRoute(
      path: '/product/:id',
      builder: (_, state) => ProductPage(id: state.pathParameters['id']!),
    ),
  ],
  redirect: (context, state) {
    if (!isLoggedIn) return '/login';
    return null;
  },
);
```

```swift
// SwiftUI — NavigationStack (iOS 16+)
NavigationStack(path: $path) {
    HomeView()
        .navigationDestination(for: Product.self) { product in
            ProductDetailView(product: product)
        }
}
// 导航: path.append(product)
```

```kotlin
// Compose — Navigation
NavHost(navController, startDestination = "home") {
    composable("home") { HomeScreen() }
    composable("product/{id}") { backStackEntry ->
        ProductScreen(id = backStackEntry.arguments?.getString("id"))
    }
}
// 导航: navController.navigate("product/123")
```

```typescript
// Vue Router
const router = createRouter({
  routes: [
    { path: '/', component: HomePage },
    { path: '/product/:id', component: ProductPage, props: true },
  ],
})
router.beforeEach((to, from) => {
  if (!isLoggedIn && to.meta.requiresAuth) return '/login'
})
```

> ⚠️ **重难点**：
> - Flutter Navigator 2.0 的声明式路由（RouterDelegate + RouteInformationParser）非常复杂，GoRouter 是社区对其的简化封装
> - SwiftUI 在 iOS 16 之前没有好的 programmatic navigation 方案，`NavigationLink` 是纯声明式的
> - Compose Navigation 的参数传递用字符串不够类型安全，社区有 type-safe navigation 方案
> - Vue Router 的路由守卫支持异步（返回 Promise），可以做权限校验和数据预加载

> ❌ **易错点**：
> - Flutter: `Navigator.pop()` 返回数据时需要 `await Navigator.push()` 接收
> - SwiftUI: `NavigationStack` 的 `path` 数组中的类型必须是 `Hashable`
> - Compose: 避免在 `composable()` 中传大对象，应该传 ID 再从 ViewModel 获取
> - Vue: 动态路由 `/product/:id` 切换时组件不销毁重建，需要 `watch(() => route.params.id)` 或加 `:key`

> 🎯 **面试考点**：
> - Flutter Navigator 1.0 和 2.0 的区别？（1.0 命令式栈操作，2.0 声明式路由配置）
> - Vue Router 的 `hash` 模式和 `history` 模式的区别？（hash 用 `#` 不需服务端配置，history 需要服务端 fallback）
> - iOS deep link 的 Universal Links 和 URL Schemes 的区别？（Universal Links 走 HTTPS 验证更安全，不会弹确认框）

---

## 6. 网络与数据层

### 6.1 HTTP 客户端对比

| 维度 | Flutter | iOS | Android | Vue / 前端 |
|------|---------|-----|---------|------------|
| 主流库 | **Dio** | **URLSession** (原生) / Alamofire | **Retrofit** + OkHttp | **Axios** / fetch API |
| 拦截器 | Dio Interceptor | URLProtocol / Alamofire Interceptor | OkHttp Interceptor | Axios Interceptor |
| 序列化 | json_serializable / freezed | Codable | Gson / Moshi / kotlinx.serialization | 原生 JSON / zod / io-ts |
| 取消请求 | CancelToken | URLSessionTask.cancel() | Coroutine cancel | AbortController |
| 文件上传 | FormData (Dio) | URLSession uploadTask | MultipartBody (OkHttp) | FormData (Axios) |
| WebSocket | web_socket_channel | URLSessionWebSocketTask | OkHttp WebSocket | 原生 WebSocket / Socket.io |

### 6.2 JSON 序列化对比

```dart
// Dart — json_serializable
@JsonSerializable()
class User {
  final int id;
  final String name;
  User({required this.id, required this.name});
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
// 需要 build_runner 生成 .g.dart
```

```swift
// Swift — Codable（编译器自动合成）
struct User: Codable {
    let id: Int
    let name: String
}
let user = try JSONDecoder().decode(User.self, from: data)
```

```kotlin
// Kotlin — kotlinx.serialization
@Serializable
data class User(val id: Int, val name: String)
val user = Json.decodeFromString<User>(jsonString)
```

```typescript
// TypeScript — 运行时无类型，需要手动校验或用 zod
interface User { id: number; name: string }
// 简单方式（不安全）
const user = response.data as User;
// 安全方式（zod）
const UserSchema = z.object({ id: z.number(), name: z.string() });
const user = UserSchema.parse(response.data);
```

> ⚠️ **重难点**：
> - Swift 的 `Codable` 最优雅，编译器自动生成 encode/decode（无需 code gen 工具）
> - Dart 需要 `build_runner` + `json_serializable` 生成代码，或者用 `freezed` 同时生成 copyWith/equals/toString
> - TypeScript 的 `interface` 在运行时被擦除，JSON 解析无法自动校验类型，zod 等库填补这个空白
> - Kotlin 有多种方案：Gson（反射）、Moshi（反射或 codegen）、kotlinx.serialization（编译器插件）

> ❌ **易错点**：
> - Dart: 忘记运行 `dart run build_runner build` 导致 `.g.dart` 文件不存在
> - Swift: JSON key 和属性名不一致时需要自定义 `CodingKeys`
> - Kotlin: Gson 用反射创建对象，可以绕过 `val` 约束创建不合法对象
> - TypeScript: `as` 类型断言不做任何运行时检查，JSON 字段类型错误不会报错

> 🎯 **面试考点**：
> - Dart `json_serializable` vs `freezed` 的区别？（freezed 额外生成 copyWith、equals、sealed union 支持）
> - Swift `Codable` 的底层原理？（编译器自动合成 `init(from: Decoder)` 和 `encode(to: Encoder)`，可自定义 container）
> - Retrofit 的原理？（动态代理 + 注解处理，接口方法 → HTTP 请求映射）

---

### 6.3 错误处理模式

| 模式 | Flutter (Dart) | Swift | Kotlin | TypeScript |
|------|---------------|-------|--------|------------|
| 异常 | `try-catch` + `throw` | `do-try-catch` + `throw` | `try-catch` + `throw` | `try-catch` + `throw` |
| Result 类型 | 无内置（手写或三方） | `Result<Success, Failure>` | `Result<T>` | 无内置（手写或 neverthrow） |
| 推荐模式 | sealed class 包装 | Result + typed throws (Swift 6) | `runCatching {}` / sealed class | 联合类型或 Result 模式 |

```dart
// Dart — sealed class 包装（推荐）
sealed class ApiResult<T> {}
class Success<T> extends ApiResult<T> { final T data; Success(this.data); }
class Failure<T> extends ApiResult<T> { final String message; Failure(this.message); }
```

```swift
// Swift — Result 类型
func fetchUser() async -> Result<User, APIError> {
    do {
        let user = try await api.getUser()
        return .success(user)
    } catch {
        return .failure(.networkError(error))
    }
}
```

---

## 7. 持久化存储

### 7.1 存储方案对比

| 场景 | Flutter | iOS | Android | Vue / 前端 |
|------|---------|-----|---------|------------|
| 键值对 | SharedPreferences | UserDefaults | DataStore (Preferences) | localStorage |
| 轻量数据库 | **Drift** / sqflite / Hive | **SwiftData** / Core Data / GRDB | **Room** | IndexedDB / Dexie |
| 文件存储 | path_provider + File | FileManager | Context.filesDir | File API / Blob |
| 安全存储 | flutter_secure_storage | Keychain | EncryptedSharedPreferences | — (后端处理) |

### 7.2 ORM 对比

| 特性 | Drift (Flutter) | SwiftData (iOS) | Room (Android) |
|------|-----------------|-----------------|----------------|
| 定义方式 | Dart 类 + 注解 | `@Model` 宏 | `@Entity` 注解 |
| 查询方式 | 类型安全 Dart DSL | `@Query` 宏 + `#Predicate` | `@Dao` + SQL 字符串 |
| 关系 | 外键 + Join | `@Relationship` | `@Relation` |
| 迁移 | 手动 schema 版本 | 自动轻量迁移 | 手动 Migration |
| 响应式 | `watch()` 返回 Stream | SwiftUI 自动观察 | `Flow<List<T>>` |
| Code Gen | 需要 build_runner | 编译器宏（无 code gen 步骤） | 需要 kapt/ksp |

> ⚠️ **重难点**：
> - Room 的 `@Dao` 方法返回 `Flow<List<T>>` 可以直接在 Compose 中 `collectAsState()`，实现数据库→UI 的响应式链路
> - SwiftData 是 Core Data 的现代封装，用 Swift 宏替代了繁琐的 NSManagedObject 子类
> - Drift 的 `watch()` 返回 Stream，数据库变更时自动推送新数据，配合 `StreamBuilder` 使用

> ❌ **易错点**：
> - SharedPreferences / UserDefaults **不是**加密存储！敏感数据（token、密码）必须用 Keychain / flutter_secure_storage
> - Room 的迁移如果漏写某个 schema 变更会导致崩溃（`IllegalStateException`）
> - Core Data 的 `NSManagedObjectContext` 不是线程安全的，必须用 `perform {}` 包裹

> 🎯 **面试考点**：
> - SharedPreferences 的底层实现？（Android: XML 文件，iOS: plist/UserDefaults，Flutter: 平台桥接）
> - Room vs Realm vs SQLDelight 怎么选？（Room 是 Google 官方，SQLDelight 跨平台，Realm 已停止维护）
> - 前端 localStorage vs sessionStorage vs Cookie 的区别？（localStorage 持久化，sessionStorage 会话级，Cookie 每次请求自动发送）

---

## 8. 并发与异步编程

### 8.1 线程/并发模型对比

| 维度 | Dart | Swift | Kotlin | JavaScript/TypeScript |
|------|------|-------|--------|----------------------|
| 线程模型 | **单线程** + Event Loop | **多线程** + GCD/async-await | **多线程** + Coroutines | **单线程** + Event Loop |
| 并行隔离 | Isolate（独立内存） | Actor（共享内存 + 隔离访问） | Thread / Coroutine Dispatcher | Web Worker（独立内存） |
| 异步原语 | `Future` / `Stream` | `async/await` / `AsyncSequence` | `suspend fun` / `Flow` | `Promise` / `AsyncIterator` |
| 调度器 | Event Loop（不可选） | MainActor / 自定义 Actor | `Dispatchers.Main/IO/Default` | Event Loop（不可选） |
| 取消机制 | 无内置（需手动） | Task.cancel() (cooperative) | Job.cancel() (cooperative) | AbortController |

### 8.2 异步代码对比

```dart
// Dart — Future + async/await
Future<User> fetchUser() async {
  final response = await dio.get('/user');
  return User.fromJson(response.data);
}
// 并行
final results = await Future.wait([fetchUser(), fetchOrders()]);
```

```swift
// Swift — structured concurrency
func fetchUser() async throws -> User {
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}
// 并行
async let user = fetchUser()
async let orders = fetchOrders()
let (u, o) = try await (user, orders)
```

```kotlin
// Kotlin — Coroutines
suspend fun fetchUser(): User {
    val response = apiService.getUser()
    return response.body()!!
}
// 并行
coroutineScope {
    val user = async { fetchUser() }
    val orders = async { fetchOrders() }
    val (u, o) = user.await() to orders.await()
}
```

```typescript
// TypeScript — Promise + async/await
async function fetchUser(): Promise<User> {
  const res = await axios.get('/user');
  return res.data;
}
// 并行
const [user, orders] = await Promise.all([fetchUser(), fetchOrders()]);
```

> ⚠️ **重难点**：
> - Dart 和 JS 都是**单线程**，`async/await` 不会创建新线程，只是将回调注册到 Event Loop（微任务队列）
> - Swift 的 `async/await` 是真正的**多线程**并发，编译器在 await 点做线程挂起/恢复
> - Kotlin Coroutines 是基于 CPS (Continuation Passing Style) 的编译器变换，`suspend` 函数被编译为状态机
> - Dart Isolate 之间不能共享内存，通信通过 SendPort/ReceivePort（类似 Actor 模型）

> ❌ **易错点**：
> - Dart: `Future` 一创建就开始执行，不是 lazy 的（Kotlin 的 `suspend` 是 lazy 的）
> - Swift: `Task {}` 创建的非结构化任务不会随父 Task 取消而自动取消
> - Kotlin: 在 `GlobalScope.launch` 中启动协程不受生命周期管理，容易内存泄漏
> - TypeScript: `Promise` 不可取消，需要 `AbortController` 配合 `fetch` 实现取消
> - **通用陷阱**：`async` 函数中忘记 `await` 导致异步操作"射后不管"（fire-and-forget）

> 🎯 **面试考点**：
> - Dart 的 Event Loop 机制？（微任务队列优先于事件队列，`Future.microtask` > `Timer` > I/O 回调）
> - Swift Actor 解决了什么问题？（数据竞争：Actor 保证同一时间只有一个任务访问其可变状态）
> - Kotlin 的 `CoroutineScope` 和 `supervisorScope` 的区别？（前者一个子协程失败全部取消，后者互不影响）
> - JS 的微任务 (microtask) 和宏任务 (macrotask) 的执行顺序？（同步代码 → 微任务队列清空 → 一个宏任务 → 微任务队列清空 → ...）

---

### 8.3 响应式流对比

| 概念 | Dart Stream | Swift AsyncSequence | Kotlin Flow | Vue (RxJS/watch) |
|------|-------------|--------------------|--------------|----|
| 冷流（lazy） | `Stream.fromIterable` | `AsyncStream` | `flow {}` | `watchEffect` |
| 热流（shared） | `StreamController.broadcast` | `AsyncChannel` | `SharedFlow` / `StateFlow` | `ref()` / Pinia state |
| 操作符 | `.map()` `.where()` `.transform()` | `.map()` `.filter()` | `.map()` `.filter()` `.collect()` | RxJS 全套 / `watch` |
| 背压 | `StreamController` 支持 pause/resume | 内置 | `buffer()` / `conflate()` | 无（单线程无需） |
| 取消 | `StreamSubscription.cancel()` | `Task.cancel()` | `Job.cancel()` | `watchEffect` 返回 stop 函数 |

---

## 9. 渲染机制与性能优化

### 9.1 渲染管线对比

| 阶段 | Flutter | SwiftUI | Compose | Vue |
|------|---------|---------|---------|-----|
| UI 描述 | Widget 树 | View 树 | @Composable 树 | Virtual DOM |
| Diff/Reconcile | Element 树 canUpdate | View body diff | Slot Table + positional key | VNode diff |
| 布局 | RenderObject layout | Layout Protocol | Measure + Place | CSS 引擎 (Blink/WebKit) |
| 绘制 | RenderObject paint → Skia/Impeller | Core Animation layer | Canvas + RenderNode | DOM 操作 → 合成层绘制 |
| 帧率目标 | 60/120fps | 60/120fps | 60/120fps | 60fps |

### 9.2 三棵树 vs 其他机制

```
Flutter 三棵树:
  Widget 树  ──build()──→  Element 树  ──createRenderObject()──→  RenderObject 树
  (配置/蓝图)              (生命周期管理)                        (布局/绘制)

SwiftUI:
  View struct  ──body──→  View Graph (AttributeGraph)  ──→  Core Animation Layer
  (声明/配置)              (内部状态图)                       (渲染)

Compose:
  @Composable  ──composition──→  Slot Table  ──→  LayoutNode  ──→  RenderNode
  (函数)                         (线性存储)       (布局)          (绘制)

Vue:
  Template  ──compile──→  Render Function  ──exec──→  VNode 树  ──diff/patch──→  真实 DOM
  (模板)                  (渲染函数)                  (虚拟DOM)                  (浏览器DOM)
```

> ⚠️ **重难点**：
> - Flutter: Widget→Element 的对应关系由 `canUpdate()` 决定（runtimeType + key 相同则更新，否则新建）
> - Compose: Slot Table 是线性数组，利用 Gap Buffer 高效插入/删除，比树结构更快
> - Vue: 编译器在编译阶段就能标记静态节点 (static hoisting)、Patch Flags，跳过不需要 diff 的部分

> 🎯 **面试考点**：
> - Flutter 中 `Key` 的作用？（帮助 Element 树正确匹配 Widget，用于列表重排、动画 Hero 等场景）
> - GlobalKey vs LocalKey 的区别？（GlobalKey 全局唯一可跨子树访问 State，LocalKey 在同级中唯一）
> - Vue 的 Virtual DOM diff 算法复杂度？（O(n) 同层比较，不跨层）

---

### 9.3 性能优化手段

| 优化项 | Flutter | SwiftUI | Compose | Vue |
|--------|---------|---------|---------|-----|
| 减少重建 | `const` Widget、合理拆分 Widget | `EquatableView`、提取子 View | `key` 稳定、`remember` | `v-once`、`computed`、`shallowRef` |
| 列表优化 | `ListView.builder` (懒加载) | `LazyVStack` / `List` | `LazyColumn` | 虚拟列表 (vue-virtual-scroller) |
| 图片优化 | `cached_network_image` + 尺寸限制 | AsyncImage + 缓存 | Coil (异步+缓存) | 懒加载 + srcset + WebP |
| 动画 | `AnimationController` 60fps 独立 | `withAnimation` 隐式动画 | `animate*AsState` | CSS Transition / GSAP |
| 分析工具 | DevTools (Timeline/Widget Inspector) | Instruments (Time Profiler) | Layout Inspector / Profiler | Chrome DevTools (Performance) |
| 内存分析 | DevTools Memory 视图 | Instruments (Allocations/Leaks) | Android Profiler | Chrome Memory Snapshot |

> ❌ **易错点**：
> - Flutter: 在 `build()` 中创建大对象（如 AnimationController）导致每帧重复创建
> - Flutter: 不加 `const` 导致 Widget 无法复用，整棵子树每帧重建
> - SwiftUI: 在 `body` 中做耗时计算（body 可能频繁调用）
> - Compose: 在 `@Composable` 中 `remember` 之外创建对象，每次 recomposition 重新创建
> - Vue: `v-for` 不加 `key` 或用 index 做 key 导致列表状态错乱
> - Vue: `computed` 依赖了不需要追踪的变量导致不必要的重算

---

## 10. 平台通信与原生能力

### 10.1 通信机制对比

| 维度 | Flutter | SwiftUI / UIKit | Compose / Android | Vue / Web |
|------|---------|-----------------|-------------------|-----------| 
| 调用原生 | **MethodChannel** / EventChannel | 直接调用 Framework | 直接调用 Android SDK | Web API / JS Bridge |
| 通信协议 | 异步消息传递（JSON/二进制） | 直接函数调用 | 直接函数调用 | postMessage / Bridge |
| 原生 UI 嵌入 | `PlatformView` (性能开销大) | 直接使用 | 直接使用 | iframe / Web Component |
| 插件机制 | pub.dev 插件 (Dart + 原生) | Swift Package / Framework | Gradle 依赖 | npm 包 |

### 10.2 Flutter Platform Channel

```
Flutter (Dart)                     Native (Swift/Kotlin)
     │                                     │
     │  MethodChannel('com.app/battery')   │
     │  ──── invokeMethod('level') ────→   │
     │                                     │  处理请求
     │  ←──── result.success(85) ────────  │
     │                                     │
     │  EventChannel('com.app/events')     │
     │  ──── listen() ────→               │
     │  ←──── stream of events ────────   │
```

```dart
// Dart 端
const channel = MethodChannel('com.app/battery');
final level = await channel.invokeMethod<int>('getBatteryLevel');
```

```swift
// Swift (iOS) 端
let channel = FlutterMethodChannel(name: "com.app/battery", binaryMessenger: messenger)
channel.setMethodCallHandler { call, result in
    if call.method == "getBatteryLevel" {
        result(UIDevice.current.batteryLevel * 100)
    }
}
```

```kotlin
// Kotlin (Android) 端
val channel = MethodChannel(flutterEngine.dartExecutor, "com.app/battery")
channel.setMethodCallHandler { call, result ->
    if (call.method == "getBatteryLevel") {
        val level = getBatteryLevel()
        result.success(level)
    }
}
```

> ⚠️ **重难点**：
> - MethodChannel 是**异步**的，数据需要序列化/反序列化（StandardMessageCodec），大量数据传输有性能开销
> - `PlatformView`（在 Flutter 中嵌入原生 View）有显著性能开销：Android 用 VirtualDisplay 或 Hybrid Composition，iOS 用 UIKitView
> - Pigeon 工具可以生成类型安全的 Platform Channel 代码，避免手写字符串匹配

> ❌ **易错点**：
> - Channel 名称拼写不一致导致调用无响应
> - 在非主线程调用 MethodChannel 导致崩溃（Flutter engine 要求主线程通信）
> - 忘记处理 `FlutterMethodNotImplemented` 错误

> 🎯 **面试考点**：
> - MethodChannel vs EventChannel vs BasicMessageChannel 的区别？（Method: 一次性调用，Event: 持续数据流，Basic: 自定义编解码）
> - Flutter 如何嵌入原生 View？性能问题如何优化？（PlatformView，尽量用 Texture 替代）
> - Flutter 的 FFI (dart:ffi) 和 Platform Channel 的区别？（FFI 是直接调用 C 函数，同步，无序列化开销）

---

## 11. 架构模式

### 11.1 MVVM 在四平台的实现

| 层级 | Flutter | SwiftUI | Compose | Vue |
|------|---------|---------|---------|-----|
| View | Widget (build) | View (body) | @Composable | `<template>` |
| ViewModel | ChangeNotifier / GetxController / BLoC | ObservableObject | ViewModel (AAC) | Composition API (setup) |
| Model | Dart class / freezed | struct + Codable | data class + Room Entity | TypeScript interface + API |
| 绑定方式 | Provider / Obx / BlocBuilder | @StateObject + @Published | collectAsState() | ref + template 自动绑定 |

```dart
// Flutter MVVM — ChangeNotifier + Provider
class UserViewModel extends ChangeNotifier {
  User? _user;
  User? get user => _user;
  
  Future<void> loadUser() async {
    _user = await userRepository.getUser();
    notifyListeners();
  }
}

// View
Consumer<UserViewModel>(
  builder: (_, vm, __) => Text(vm.user?.name ?? 'Loading'),
)
```

```swift
// SwiftUI MVVM — ObservableObject
@Observable class UserViewModel {
    var user: User?
    
    func loadUser() async {
        user = try? await userRepository.getUser()
    }
}

// View
struct UserView: View {
    @State var vm = UserViewModel()
    var body: some View {
        Text(vm.user?.name ?? "Loading")
            .task { await vm.loadUser() }
    }
}
```

```kotlin
// Compose MVVM — ViewModel + StateFlow
class UserViewModel @Inject constructor(
    private val repo: UserRepository
) : ViewModel() {
    private val _user = MutableStateFlow<User?>(null)
    val user = _user.asStateFlow()
    
    fun loadUser() { viewModelScope.launch { _user.value = repo.getUser() } }
}

// Composable
@Composable
fun UserScreen(vm: UserViewModel = hiltViewModel()) {
    val user by vm.user.collectAsState()
    Text(user?.name ?: "Loading")
}
```

```vue
<!-- Vue MVVM — Composition API -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUser } from '@/api/user'

const user = ref<User | null>(null)
onMounted(async () => { user.value = await getUser() })
</script>

<template>
  <span>{{ user?.name ?? 'Loading' }}</span>
</template>
```

---

### 11.2 依赖注入对比

| 方案 | Flutter | iOS | Android | Vue |
|------|---------|-----|---------|-----|
| 框架级 | Provider / Riverpod | SwiftUI Environment | **Hilt** (Dagger) | provide / inject |
| 第三方 | GetIt / get_it | Swinject / Factory | Koin | — |
| 注册方式 | `Provider<T>()` 在 Widget 树中 | `@Environment` / `environmentObject` | `@Inject` + `@Module` 注解 | `app.provide()` |
| 作用域 | Widget 子树 | View 子树 | Activity/Fragment/ViewModel scope | 组件子树 |

> ⚠️ **重难点**：
> - Hilt 是编译时 DI（基于 Dagger 的注解处理），性能最好但配置最复杂
> - Riverpod 独立于 Widget 树（不依赖 BuildContext），可以在测试中轻松 override
> - Vue 的 `provide/inject` 不是响应式的（需要 provide ref 才能响应式）

> 🎯 **面试考点**：
> - Provider vs Riverpod 的核心区别？（Provider 依赖 BuildContext，Riverpod 不依赖；Riverpod 有编译时安全）
> - Hilt 的 Component 层级？（SingletonComponent → ActivityComponent → FragmentComponent → ViewModelComponent → ViewComponent）
> - Vue 的 provide/inject 和 Pinia 的区别？（provide/inject 是组件树级别的，Pinia 是全局单例 store）

---

### 11.3 模块化方案对比

| 方案 | Flutter | iOS | Android | Vue |
|------|---------|-----|---------|-----|
| 代码组织 | Package / 文件夹约定 | Swift Package / Framework | Gradle Module | npm workspace / monorepo |
| 动态加载 | Deferred Components | Dynamic Framework | Dynamic Feature Module | 路由级 lazy import |
| 路由解耦 | 路由表注册 | Coordinator 模式 | Navigation Component + Deep Link | Vue Router lazy loading |

---

## 12. 构建、测试与发布

### 12.1 构建工具对比

| 维度 | Flutter | iOS | Android | Vue |
|------|---------|-----|---------|-----|
| 构建工具 | Flutter CLI | Xcode Build System | **Gradle** (Kotlin DSL/Groovy) | **Vite** / Webpack |
| 包管理 | pub (pubspec.yaml) | SPM / CocoaPods | Gradle Dependencies | npm / pnpm (package.json) |
| Code Gen | build_runner | Swift 宏 | kapt / KSP | Vite 插件 |
| 热重载 | ✅ Hot Reload (保留状态) | ✅ Xcode Previews (SwiftUI) | ❌ (仅 Apply Changes 部分支持) | ✅ Vite HMR |
| 产物 | APK / AAB / IPA | IPA | APK / AAB | 静态文件 (HTML/JS/CSS) |

### 12.2 测试框架对比

| 层级 | Flutter | iOS | Android | Vue |
|------|---------|-----|---------|-----|
| 单元测试 | `flutter_test` | XCTest | JUnit / MockK | Vitest / Jest |
| 组件测试 | `WidgetTester` | XCTest + ViewInspector | Compose Testing | Vue Test Utils + @testing-library/vue |
| 集成测试 | `integration_test` | XCUITest | Espresso / UI Automator | Cypress / Playwright |
| 快照测试 | `golden_toolkit` | `PreviewSnapshots` | Paparazzi / Roborazzi | `@vue/test-utils` + snapshot |
| Mock | mockito | Swift mock protocols | Mockito-Kotlin / MockK | vitest mock / msw |

### 12.3 测试代码对比

```dart
// Flutter — Widget 测试
testWidgets('Counter increments', (tester) async {
  await tester.pumpWidget(MaterialApp(home: CounterPage()));
  expect(find.text('0'), findsOneWidget);
  await tester.tap(find.byIcon(Icons.add));
  await tester.pump();
  expect(find.text('1'), findsOneWidget);
});
```

```swift
// SwiftUI — XCTest + ViewInspector
func testCounterIncrements() throws {
    var sut = CounterView()
    let button = try sut.inspect().find(button: "+")
    try button.tap()
    let text = try sut.inspect().find(text: "1")
    XCTAssertNotNil(text)
}
```

```kotlin
// Compose — UI 测试
@Test
fun counterIncrements() {
    composeTestRule.setContent { CounterScreen() }
    composeTestRule.onNodeWithText("0").assertIsDisplayed()
    composeTestRule.onNodeWithContentDescription("add").performClick()
    composeTestRule.onNodeWithText("1").assertIsDisplayed()
}
```

```typescript
// Vue — Vitest + Vue Test Utils
test('counter increments', async () => {
  const wrapper = mount(Counter)
  expect(wrapper.text()).toContain('0')
  await wrapper.find('button').trigger('click')
  expect(wrapper.text()).toContain('1')
})
```

> ⚠️ **重难点**：
> - Flutter 的 `pump()` / `pumpAndSettle()` 控制帧推进，是测试异步 UI 的关键
> - SwiftUI 的测试生态还不成熟，`ViewInspector` 是社区库
> - Compose 的测试基于语义树（semantics），需要正确设置 `contentDescription` 和 `testTag`

> ❌ **易错点**：
> - Flutter: `pumpWidget` 后没有 `pump()` 导致状态变化未反映到 UI
> - Vue: 异步操作后没有 `await nextTick()` 导致断言时 DOM 还没更新
> - Android: Espresso 在异步操作时需要 `IdlingResource`，否则测试不稳定

> 🎯 **面试考点**：
> - Flutter 的三种测试有什么区别？（Unit: 纯逻辑，Widget: 单组件渲染，Integration: 真设备完整流程）
> - 如何测试异步操作？各平台的方案？（Flutter: pump, Swift: async test + expectation, Kotlin: runTest, Vue: nextTick/flush-promises）

---

### 12.4 CI/CD 与发布

| 维度 | Flutter | iOS | Android | Vue |
|------|---------|-----|---------|-----|
| CI/CD | GitHub Actions / Codemagic | Xcode Cloud / Fastlane | GitHub Actions / Bitrise | Vercel / Netlify / GitHub Pages |
| 发布渠道 | App Store + Google Play | App Store (TestFlight) | Google Play (内部测试轨道) | CDN 部署 |
| 签名 | Android: keystore, iOS: certificate + provisioning | Certificate + Provisioning Profile | keystore | 无需签名 |
| 热更新 | Shorebird (实验性) | 不允许 (App Store 政策) | 不允许 (Play Store 政策) | 直接部署新版本 |

> 🎯 **面试考点**：
> - Flutter 的 Release 模式和 Debug 模式的区别？（Debug: JIT + assert + DevTools, Release: AOT + tree-shaking + 无 assert）
> - iOS 的 Code Signing 流程？（开发者证书 + App ID + Provisioning Profile 三件套）
> - Vue 的 Vite 构建做了哪些优化？（Tree-shaking、Code Splitting、CSS 提取、预构建依赖）

---

## 附录：四平台速查表

| 你想做... | Flutter | iOS (Swift) | Android (Kotlin) | Vue 3 (TS) |
|-----------|---------|-------------|-------------------|------------|
| 创建项目 | `flutter create` | Xcode New Project | Android Studio New Project | `npm create vue@latest` |
| 运行项目 | `flutter run` | Cmd+R (Xcode) | Run (Android Studio) | `npm run dev` |
| 安装依赖 | `flutter pub get` | SPM resolve / `pod install` | Gradle Sync | `npm install` |
| 状态变量 | `setState()` / `.obs` | `@State` | `mutableStateOf` | `ref()` |
| 全局状态 | Provider / Riverpod | @EnvironmentObject | ViewModel + Hilt | Pinia |
| 网络请求 | Dio | URLSession | Retrofit | Axios |
| 路由跳转 | GoRouter / Navigator | NavigationStack | NavHost | Vue Router |
| 本地存储 | SharedPreferences | UserDefaults | DataStore | localStorage |
| 数据库 | Drift / sqflite | SwiftData / Core Data | Room | IndexedDB |
| 列表组件 | ListView.builder | LazyVStack / List | LazyColumn | `v-for` + 虚拟列表 |
| 格式化 | `dart format` | Xcode 格式化 | ktlint / detekt | ESLint + Prettier |
| 运行测试 | `flutter test` | Cmd+U (Xcode) | `./gradlew test` | `npm run test` |
