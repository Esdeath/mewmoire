---
date: 2026-05-03T10:30:00+08:00
title: "Flutter 工程师的 Vue 对比学习指南"
slug: flutter-to-vue-comparison
description: "以 Flutter/Dart 的概念为锚点，快速建立 Vue 3 Composition API 的心智模型。"
---

> 以 Flutter/Dart 的概念为锚点，快速建立 Vue 3 (Composition API) 的心智模型。

---

## 1. 整体架构对比

| 维度 | Flutter | Vue |
|------|---------|-----|
| 语言 | Dart | JavaScript / TypeScript |
| 渲染 | 自绘引擎 (Skia/Impeller) | 基于 DOM |
| 构建单元 | Widget | Component (`.vue` 单文件组件) |
| 状态管理 | setState / Provider / Riverpod / Bloc | ref / reactive / Pinia |
| 路由 | Navigator / GoRouter | Vue Router |
| 样式 | Widget 属性内联 | CSS / Scoped CSS / Tailwind |
| 包管理 | pub (pubspec.yaml) | npm / pnpm (package.json) |
| 构建工具 | Flutter CLI | Vite |

---

## 2. 项目结构对比

```
# Flutter                          # Vue (Vite 脚手架)
lib/                               src/
├── main.dart                      ├── main.ts          # 入口
├── app.dart                       ├── App.vue          # 根组件
├── models/                        ├── types/           # 类型定义
├── screens/                       ├── views/           # 页面组件
├── widgets/                       ├── components/      # 可复用组件
├── providers/                     ├── stores/          # Pinia 状态
├── services/                      ├── api/             # 网络请求
└── utils/                         ├── utils/
pubspec.yaml                       ├── router/          # 路由配置
                                   package.json
```

---

## 3. 组件 = Widget

### 3.1 基本组件结构

**Flutter — StatelessWidget**
```dart
class Greeting extends StatelessWidget {
  final String name;
  const Greeting({required this.name});

  @override
  Widget build(BuildContext context) {
    return Text('Hello, $name');
  }
}
```

**Vue — 单文件组件 (SFC)**
```vue
<template>
  <p>Hello, {{ name }}</p>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()
</script>
```

**对比要点：**
- Flutter 的 `build()` 方法 ≈ Vue 的 `<template>`
- Flutter 的构造函数参数 ≈ Vue 的 `props`
- Vue 用 `{{ }}` 做插值，Flutter 用 `${}` 在 Dart 字符串里插值

### 3.2 有状态组件

**Flutter — StatefulWidget**
```dart
class Counter extends StatefulWidget {
  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text('$count'),
      ElevatedButton(
        onPressed: () => setState(() => count++),
        child: Text('Add'),
      ),
    ]);
  }
}
```

**Vue — Composition API**
```vue
<template>
  <div>
    <p>{{ count }}</p>
    <button @click="count++">Add</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>
```

**对比要点：**
- `setState()` ≈ 直接修改 `ref` 的 `.value`（模板中自动解包，不用写 `.value`）
- Flutter 需要 StatefulWidget + State 两个类，Vue 只需 `ref()` 一行
- Vue 的响应式是自动追踪依赖的，不需要手动调用 setState

---

## 4. 响应式系统对比

| Flutter | Vue | 说明 |
|---------|-----|------|
| `setState(() { })` | 自动（修改 ref/reactive 即触发） | Vue 无需手动通知 |
| `ValueNotifier<T>` | `ref<T>()` | 单值响应式 |
| `ChangeNotifier` | `reactive({})` | 对象级响应式 |
| `Provider.of<T>(context)` | `inject()` / Pinia store | 跨组件共享状态 |
| `StreamBuilder` | `watch()` / `watchEffect()` | 监听变化并执行副作用 |
| `FutureBuilder` | `onMounted` + async 或 `Suspense` | 异步数据加载 |

### ref vs reactive

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'

// ref — 用于基本类型（类似 ValueNotifier）
const count = ref(0)
count.value++  // 脚本中需要 .value

// reactive — 用于对象（类似 ChangeNotifier）
const user = reactive({ name: 'Alice', age: 25 })
user.age++     // 直接修改属性，不需要 .value
</script>
```

### 计算属性 = 派生状态

**Flutter**
```dart
// 每次 build 都重新计算
String get fullName => '${firstName} ${lastName}';
```

**Vue**
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const firstName = ref('Alice')
const lastName = ref('Smith')

// 自动缓存，只在依赖变化时重新计算
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
</script>
```

### 侦听器 = 监听变化

**Flutter**
```dart
// 用 didUpdateWidget 或 addListener
@override
void didUpdateWidget(oldWidget) {
  if (widget.id != oldWidget.id) fetchData(widget.id);
}
```

**Vue**
```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const id = ref(1)

watch(id, (newVal, oldVal) => {
  fetchData(newVal)
})
</script>
```

---

## 5. 生命周期对比

| Flutter (State) | Vue 3 (Composition API) | 时机 |
|-----------------|------------------------|------|
| `initState()` | `onMounted()` | 组件挂载/初始化 |
| `didUpdateWidget()` | `onUpdated()` | 更新后 |
| `dispose()` | `onUnmounted()` | 销毁/卸载 |
| `didChangeDependencies()` | `watch()` | 依赖变化 |
| — | `onBeforeMount()` | 挂载前 |
| — | `onBeforeUpdate()` | 更新前 |

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// ≈ initState
onMounted(() => {
  console.log('组件已挂载')
  window.addEventListener('resize', onResize)
})

// ≈ dispose
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>
```

---

## 6. 模板语法 = Widget 树

### 6.1 条件渲染

**Flutter**
```dart
Column(children: [
  if (isLoggedIn) Text('Welcome'),
  if (!isLoggedIn) TextButton(onPressed: login, child: Text('Login')),
])
```

**Vue**
```vue
<template>
  <p v-if="isLoggedIn">Welcome</p>
  <button v-else @click="login">Login</button>
</template>
```

### 6.2 列表渲染

**Flutter**
```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (ctx, i) => ListTile(
    key: ValueKey(items[i].id),
    title: Text(items[i].name),
  ),
)
```

**Vue**
```vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
</template>
```

### 6.3 事件绑定

| Flutter | Vue | 说明 |
|---------|-----|------|
| `onPressed: () => {}` | `@click="handler"` | 点击 |
| `onChanged: (v) => {}` | `@input="handler"` | 输入 |
| `onSubmitted: (v) => {}` | `@submit.prevent="handler"` | 表单提交 |
| `GestureDetector` | `@mousedown` `@touchstart` 等 | 手势 |

### 6.4 属性绑定

```vue
<template>
  <!-- 静态属性 -->
  <img src="/logo.png" />

  <!-- 动态绑定（v-bind 缩写为 :） -->
  <img :src="imageUrl" />

  <!-- class 绑定 -->
  <div :class="{ active: isActive, disabled: isDisabled }"></div>

  <!-- style 绑定 -->
  <div :style="{ color: textColor, fontSize: size + 'px' }"></div>
</template>
```

---

## 7. 组件通信对比

| 场景 | Flutter | Vue |
|------|---------|-----|
| 父→子 | 构造函数参数 | `props` |
| 子→父 | 回调函数 `onChanged` | `emit` 事件 |
| 跨层级 | `InheritedWidget` / `Provider` | `provide` / `inject` |
| 全局状态 | Riverpod / Bloc | Pinia |

### Props 传递（父→子）

**Flutter**
```dart
// 父组件
UserCard(name: userName, onTap: () => goToProfile())

// 子组件
class UserCard extends StatelessWidget {
  final String name;
  final VoidCallback onTap;
  // ...
}
```

**Vue**
```vue
<!-- 父组件 -->
<UserCard :name="userName" @tap="goToProfile" />

<!-- 子组件 UserCard.vue -->
<script setup lang="ts">
defineProps<{ name: string }>()
const emit = defineEmits<{ tap: [] }>()
</script>

<template>
  <div @click="emit('tap')">{{ name }}</div>
</template>
```

### 插槽 = child / builder

**Flutter**
```dart
Card(child: Text('内容'))

// builder 模式
MyWidget(builder: (context) => Text('动态内容'))
```

**Vue**
```vue
<!-- 默认插槽 ≈ child -->
<Card>
  <p>内容</p>
</Card>

<!-- 作用域插槽 ≈ builder -->
<MyList :items="items">
  <template #default="{ item }">
    <span>{{ item.name }}</span>
  </template>
</MyList>
```

---

## 8. 路由对比

**Flutter — GoRouter**
```dart
GoRouter(routes: [
  GoRoute(path: '/', builder: (ctx, state) => HomePage()),
  GoRoute(path: '/user/:id', builder: (ctx, state) {
    final id = state.pathParameters['id']!;
    return UserPage(id: id);
  }),
])

// 导航
context.go('/user/42');
```

**Vue — Vue Router**
```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/views/Home.vue') },
    { path: '/user/:id', component: () => import('@/views/User.vue') },
  ],
})
```

```vue
<!-- 使用路由 -->
<template>
  <router-link to="/user/42">Go to User</router-link>
  <router-view />  <!-- ≈ Navigator 的显示区域 -->
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()     // 读取当前路由信息
const router = useRouter()   // 编程式导航

console.log(route.params.id) // '42'
router.push('/user/42')      // ≈ context.go()
</script>
```

### 路由守卫 ≈ Navigator Observer

```ts
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return '/login'  // 重定向
  }
})
```

---

## 9. 状态管理对比

### Pinia ≈ Riverpod / Provider

**Flutter — Riverpod**
```dart
final counterProvider = StateNotifierProvider<CounterNotifier, int>(
  (ref) => CounterNotifier(),
);

class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);
  void increment() => state++;
}

// 使用
final count = ref.watch(counterProvider);
ref.read(counterProvider.notifier).increment();
```

**Vue — Pinia**
```ts
// stores/counter.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  function increment() { count.value++ }
  return { count, increment }
})
```

```vue
<!-- 使用 -->
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <p>{{ counter.count }}</p>
  <button @click="counter.increment()">+1</button>
</template>
```

---

## 10. 样式对比

**Flutter** — 所有样式通过 Widget 属性内联
```dart
Container(
  padding: EdgeInsets.all(16),
  decoration: BoxDecoration(
    color: Colors.blue,
    borderRadius: BorderRadius.circular(8),
  ),
  child: Text('Hello', style: TextStyle(fontSize: 18, color: Colors.white)),
)
```

**Vue** — CSS (Scoped)
```vue
<template>
  <div class="card">
    <p class="card-text">Hello</p>
  </div>
</template>

<style scoped>
.card {
  padding: 16px;
  background-color: blue;
  border-radius: 8px;
}
.card-text {
  font-size: 18px;
  color: white;
}
</style>
```

### 常用 CSS 布局 ≈ Flutter 布局 Widget

| Flutter | CSS | 说明 |
|---------|-----|------|
| `Column` | `display: flex; flex-direction: column` | 纵向排列 |
| `Row` | `display: flex; flex-direction: row` | 横向排列 |
| `Stack` | `position: relative` + `position: absolute` | 层叠 |
| `Expanded(flex: 1)` | `flex: 1` | 弹性占比 |
| `SizedBox(width: 100)` | `width: 100px` | 固定尺寸 |
| `Padding` | `padding: 16px` | 内边距 |
| `Center` | `display: flex; justify-content: center; align-items: center` | 居中 |
| `ListView` | `overflow-y: auto` | 滚动列表 |
| `GridView` | `display: grid; grid-template-columns: ...` | 网格 |
| `Wrap` | `display: flex; flex-wrap: wrap` | 自动换行 |

---

## 11. 网络请求对比

**Flutter — dio**
```dart
final dio = Dio();
final response = await dio.get('/api/users');
final users = response.data;
```

**Vue — axios / fetch**
```ts
import axios from 'axios'

// 在 composable 中封装（≈ Flutter 的 Repository）
export function useUsers() {
  const users = ref([])
  const loading = ref(false)

  async function fetchUsers() {
    loading.value = true
    try {
      const { data } = await axios.get('/api/users')
      users.value = data
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchUsers)
  return { users, loading }
}
```

---

## 12. 组合式函数 (Composables) ≈ Mixin / Hook

Vue 的 Composable 是复用逻辑的核心方式，类似 Flutter 中的 Mixin 或 Riverpod 的自定义 Provider。

```ts
// composables/useMouse.ts（≈ Flutter 的 mixin）
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(e: MouseEvent) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

```vue
<!-- 使用 -->
<script setup lang="ts">
import { useMouse } from '@/composables/useMouse'
const { x, y } = useMouse()
</script>

<template>
  <p>Mouse: {{ x }}, {{ y }}</p>
</template>
```

---

## 13. 开发工具链对比

| 用途 | Flutter | Vue |
|------|---------|-----|
| 创建项目 | `flutter create` | `npm create vue@latest` |
| 开发服务器 | `flutter run` | `npm run dev` (Vite) |
| 热重载 | 内置 Hot Reload | Vite HMR |
| 调试工具 | Flutter DevTools | Vue DevTools (浏览器插件) |
| 构建 | `flutter build` | `npm run build` |
| 代码检查 | `dart analyze` | ESLint |
| 格式化 | `dart format` | Prettier |
| 测试 | `flutter test` | Vitest |
| 组件测试 | Widget Test | @vue/test-utils |
| E2E 测试 | Integration Test | Cypress / Playwright |

---

## 14. 快速上手路径

1. **环境搭建**：安装 Node.js → `npm create vue@latest`（选 TypeScript + Router + Pinia）
2. **先跑通**：看懂 `App.vue`、`main.ts`、路由配置
3. **写组件**：把你熟悉的 Flutter Widget 用 Vue SFC 重写一遍
4. **学响应式**：重点掌握 `ref`、`reactive`、`computed`、`watch`
5. **学路由**：Vue Router 的配置式路由和 GoRouter 非常像
6. **学状态管理**：Pinia 比 Riverpod 简单，先用再深入
7. **学 CSS**：这是 Flutter 工程师最大的新领域，重点学 Flexbox 和 Grid

---

## 15. 核心思维转换

| Flutter 思维 | Vue 思维 |
|-------------|---------|
| 一切皆 Widget | 一切皆组件 |
| Widget 树是不可变的，rebuild 整棵树 | 模板 + 响应式数据，只更新变化的 DOM |
| 样式是 Widget 的属性 | 样式和结构分离 (CSS) |
| `BuildContext` 访问上层数据 | `inject()` / Pinia 访问共享数据 |
| `Key` 控制 Widget 复用 | `:key` 控制 DOM 元素复用 |
| `const` Widget 优化性能 | Vue 编译器自动优化 |
| 手动 `setState` 触发重建 | 修改响应式数据自动触发更新 |
