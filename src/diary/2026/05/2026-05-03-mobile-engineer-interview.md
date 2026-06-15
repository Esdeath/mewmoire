---
date: 2026-05-03T10:40:00+08:00
title: "移动端全栈工程师面试题与详解"
slug: mobile-engineer-interview
description: "覆盖 iOS、Android、Flutter 三端的面试核心考点，包括语言基础、内存管理、并发编程和架构设计。"
---

---

## 目录

### 第一部分：iOS 开发
1. [Swift 语言基础](#1-swift-语言基础)
2. [内存管理](#2-内存管理)
3. [UIKit 与 SwiftUI](#3-uikit-与-swiftui)
4. [并发编程](#4-并发编程)
5. [架构与设计模式](#5-架构与设计模式ios)
6. [性能优化与工具](#6-性能优化与工具ios)
7. [系统机制与框架](#7-系统机制与框架)

### 第二部分：Android 开发
8. [Kotlin 语言基础](#8-kotlin-语言基础)
9. [四大组件与生命周期](#9-四大组件与生命周期)
10. [Jetpack 组件](#10-jetpack-组件)
11. [并发编程（Coroutines）](#11-并发编程coroutines)
12. [架构与设计模式](#12-架构与设计模式android)
13. [性能优化与工具](#13-性能优化与工具android)
14. [系统机制](#14-系统机制)

### 第三部分：Flutter 开发
15. [Dart 语言与核心机制](#15-dart-语言与核心机制)
16. [渲染与三棵树](#16-渲染与三棵树)
17. [状态管理](#17-状态管理)
18. [平台通信与混合开发](#18-平台通信与混合开发)
19. [性能优化](#19-性能优化flutter)

### 第四部分：跨平台通用
20. [网络与安全](#20-网络与安全)
21. [CI/CD 与发布](#21-cicd-与发布)
22. [架构设计与系统设计](#22-架构设计与系统设计)

---

# 第一部分：iOS 开发

## 1. Swift 语言基础

### Q1.1: `struct` 和 `class` 的区别？什么时候用哪个？

**答：**

| 特性 | Struct（值类型） | Class（引用类型） |
|------|-----------------|------------------|
| 存储位置 | 通常在栈上（小对象） | 堆上 |
| 赋值行为 | 拷贝（Copy-on-Write） | 共享引用 |
| 继承 | 不支持 | 支持 |
| 引用计数 | 无 | ARC |
| 线程安全 | 天然安全（值拷贝） | 需要同步 |
| `mutating` | 需要标记修改方法 | 不需要 |
| `deinit` | 无 | 有析构器 |

```swift
// Struct：值语义
struct Point {
    var x: Double
    var y: Double
}

var a = Point(x: 1, y: 2)
var b = a       // 拷贝
b.x = 10
print(a.x)     // 1，a 不受影响

// Class：引用语义
class Person {
    var name: String
    init(name: String) { self.name = name }
}

let p1 = Person(name: "Alice")
let p2 = p1     // 共享引用
p2.name = "Bob"
print(p1.name)  // "Bob"，p1 也被修改了
```

**选择指南（Apple 官方建议）：**
- **默认用 Struct**：数据模型、坐标、配置等
- **用 Class**：需要继承、需要引用语义（身份标识）、需要 `deinit`、需要与 Objective-C 互操作

**Copy-on-Write (COW)：** Swift 标准库的集合类型（Array、Dictionary、Set）使用 COW 优化：只在真正修改且有多个引用时才执行拷贝。

```swift
var arr1 = [1, 2, 3]
var arr2 = arr1      // 此时共享底层存储，未拷贝
arr2.append(4)       // 修改时才触发拷贝
```

---

### Q1.2: Swift 中的 `Protocol` 和 `Protocol-Oriented Programming` 是什么？

**答：**

Protocol 定义行为契约，是 Swift 实现多态和代码复用的核心机制：

```swift
protocol Drawable {
    func draw()
}

// Protocol Extension：提供默认实现
extension Drawable {
    func draw() {
        print("Default drawing")
    }

    // 非协议要求的方法：静态派发
    func description() -> String {
        return "A drawable object"
    }
}

struct Circle: Drawable {
    func draw() { print("Drawing circle") }         // 动态派发
    func description() -> String { return "Circle" } // ⚠️ 静态派发！
}

let shape: Drawable = Circle()
shape.draw()          // "Drawing circle" ✅ 动态派发
shape.description()   // "A drawable object" ⚠️ 调用的是 extension 的默认实现！
```

**关键陷阱：** Protocol Extension 中定义的方法如果**不在协议声明中**，则使用**静态派发**，根据编译时类型决定调用哪个实现。

**Protocol 与泛型约束：**

```swift
// 关联类型（Associated Type）
protocol Container {
    associatedtype Item
    var count: Int { get }
    mutating func append(_ item: Item)
    subscript(i: Int) -> Item { get }
}

// 泛型约束
func findIndex<T: Equatable>(of value: T, in array: [T]) -> Int? {
    return array.firstIndex(of: value)
}

// any vs some
func draw(shape: any Drawable) { }  // 存在类型（运行时多态，有开销）
func draw(shape: some Drawable) { } // 不透明类型（编译时确定，零开销）
```

**POP vs OOP：**

```swift
// OOP：通过继承复用（单继承限制、紧耦合）
class Animal { func eat() { } }
class Dog: Animal { func bark() { } }

// POP：通过组合复用（灵活、可用于值类型）
protocol Eating { func eat() }
protocol Barking { func bark() }

extension Eating { func eat() { print("Eating") } }
extension Barking { func bark() { print("Barking") } }

struct Dog: Eating, Barking { }  // 组合多个能力
```

---

### Q1.3: Swift 中的 `enum` 有哪些高级用法？

**答：**

Swift 的 enum 是一等类型，远比 C/Java 的枚举强大：

```swift
// 1. 关联值（Associated Values）
enum NetworkResult {
    case success(data: Data, statusCode: Int)
    case failure(error: Error)
}

let result: NetworkResult = .success(data: data, statusCode: 200)

switch result {
case .success(let data, let statusCode) where statusCode == 200:
    process(data)
case .success(_, let statusCode):
    print("Unexpected status: \(statusCode)")
case .failure(let error):
    print("Error: \(error)")
}

// 2. 递归枚举
indirect enum ArithExpr {
    case number(Int)
    case add(ArithExpr, ArithExpr)
    case multiply(ArithExpr, ArithExpr)
}

func evaluate(_ expr: ArithExpr) -> Int {
    switch expr {
    case .number(let n): return n
    case .add(let a, let b): return evaluate(a) + evaluate(b)
    case .multiply(let a, let b): return evaluate(a) * evaluate(b)
    }
}

// 3. 遵循协议 + 计算属性
enum Planet: CaseIterable, Comparable {
    case mercury, venus, earth, mars

    var distanceFromSun: Double {
        switch self {
        case .mercury: return 57.9
        case .venus: return 108.2
        case .earth: return 149.6
        case .mars: return 227.9
        }
    }
}

// 4. 用 enum 做命名空间（无 case 的 enum 不能被实例化）
enum Constants {
    static let apiBaseURL = "https://api.example.com"
    static let maxRetries = 3
}

// 5. Result 类型（标准库）
enum Result<Success, Failure: Error> {
    case success(Success)
    case failure(Failure)
}
```

---

### Q1.4: 解释 Swift 的 `@propertyWrapper`

**答：**

Property Wrapper 封装属性的存取逻辑，避免重复的样板代码：

```swift
// 定义：限制值在指定范围内
@propertyWrapper
struct Clamped<Value: Comparable> {
    var wrappedValue: Value {
        didSet { wrappedValue = min(max(wrappedValue, range.lowerBound), range.upperBound) }
    }
    let range: ClosedRange<Value>

    init(wrappedValue: Value, _ range: ClosedRange<Value>) {
        self.range = range
        self.wrappedValue = min(max(wrappedValue, range.lowerBound), range.upperBound)
    }
}

// 使用
struct Player {
    @Clamped(0...100) var health: Int = 100
    @Clamped(0...999) var score: Int = 0
}

var player = Player()
player.health = 150  // 被钳制为 100
player.health = -10  // 被钳制为 0
```

**SwiftUI 中的常见 Property Wrapper：**

| Wrapper | 用途 |
|---------|------|
| `@State` | View 私有状态，值类型 |
| `@Binding` | 父子 View 之间的双向绑定 |
| `@ObservedObject` | 外部传入的可观察对象 |
| `@StateObject` | View 拥有的可观察对象（生命周期绑定） |
| `@EnvironmentObject` | 通过环境注入的共享对象 |
| `@Environment` | 读取系统环境值（如 colorScheme） |
| `@Published` | 属性变更时自动通知订阅者 |
| `@AppStorage` | UserDefaults 的声明式封装 |

---

### Q1.5: `some` 和 `any` 关键字的区别是什么？

**答：**

```swift
// some：不透明类型（Opaque Type）
// 编译时确定具体类型，但对调用者隐藏
func makeShape() -> some Shape {
    return Circle(radius: 10)
    // 每次调用返回同一具体类型（编译器保证）
}

// any：存在类型（Existential Type）
// 运行时可以是任意遵循协议的类型
func draw(shapes: [any Shape]) {
    for shape in shapes {
        shape.draw() // 运行时动态派发
    }
}
```

| | `some` | `any` |
|--|--------|-------|
| 派发方式 | 静态派发（零开销） | 动态派发（有开销） |
| 类型一致性 | 必须始终是同一具体类型 | 可以是不同类型 |
| 放在集合中 | 不能（类型不统一） | 可以 `[any Protocol]` |
| 性能 | 更好 | 有装箱开销（Existential Container） |
| 使用场景 | 函数返回值、SwiftUI body | 异构集合、需要运行时多态 |

```swift
// SwiftUI 中 some 是必须的
struct ContentView: View {
    var body: some View {  // 编译器知道具体类型
        VStack {
            Text("Hello")
            Image(systemName: "star")
        }
    }
}

// 需要 any 的场景
protocol Animal { func sound() -> String }
struct Dog: Animal { func sound() -> String { "Woof" } }
struct Cat: Animal { func sound() -> String { "Meow" } }

let pets: [any Animal] = [Dog(), Cat()] // 异构集合必须用 any
```

---

## 2. 内存管理

### Q2.1: ARC（Automatic Reference Counting）的工作原理？如何解决循环引用？

**答：**

ARC 在编译时自动插入 `retain`（引用计数 +1）和 `release`（引用计数 -1）调用。当引用计数归零时，对象被销毁。

**循环引用（Retain Cycle）：**

```swift
// ❌ 循环引用：两个对象互相强引用
class Person {
    var apartment: Apartment?
    deinit { print("Person deinit") } // 永远不会调用
}

class Apartment {
    var tenant: Person?   // 强引用
    deinit { print("Apartment deinit") } // 永远不会调用
}

var john: Person? = Person()
var unit: Apartment? = Apartment()
john?.apartment = unit
unit?.tenant = john
john = nil  // 引用计数 1（Apartment 还持有）
unit = nil  // 引用计数 1（Person 还持有）
// 内存泄漏！
```

**解决方案：`weak` 和 `unowned`**

```swift
class Apartment {
    weak var tenant: Person?  // 弱引用，不增加引用计数
    // tenant 被销毁后自动置为 nil
}

class CreditCard {
    unowned let owner: Person  // 无主引用，不增加引用计数
    // 假设 owner 生命周期 >= CreditCard
    // owner 被销毁后访问会崩溃（类似野指针）
}
```

| | `weak` | `unowned` |
|--|--------|----------|
| 类型 | `Optional`（可选） | 非可选 |
| 对象销毁后 | 自动设为 `nil` | 悬垂引用（访问崩溃） |
| 性能 | 略有开销（side table） | 更轻量 |
| 适用场景 | 引用对象可能先销毁 | 确信引用对象生命周期更长 |

**闭包中的循环引用：**

```swift
class ViewController: UIViewController {
    var name = "VC"

    func setupTimer() {
        // ❌ 闭包隐式捕获 self（强引用）
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            self.updateUI()  // self 引用计数 +1
        }

        // ✅ 使用 capture list 打破循环
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self else { return }
            self.updateUI()
        }
    }
}
```

---

### Q2.2: 什么是 Autorelease Pool？在 Swift 中还需要关心它吗？

**答：**

Autorelease Pool 是 Objective-C MRC 时代的遗留机制，用于延迟释放对象：

```swift
// Swift 中仍然需要关心的场景：
// 循环中大量创建临时对象时
for i in 0..<1_000_000 {
    // ❌ 临时对象积压到 RunLoop 结束才释放
    let image = processImage(data[i])
}

// ✅ 用 autoreleasepool 及时释放
for i in 0..<1_000_000 {
    autoreleasepool {
        let image = processImage(data[i])
        // 每次循环结束时释放 pool 中的对象
    }
}
```

**什么时候需要 autoreleasepool：**
- 循环中大量创建临时对象（特别是与 Objective-C 桥接的对象）
- 后台线程（没有自动的 RunLoop autorelease pool）
- 命令行工具（没有 UIApplication 管理的 pool）

**主线程 RunLoop** 每次迭代结束时会自动 drain autorelease pool，所以日常开发中大多不需要手动管理。

---

## 3. UIKit 与 SwiftUI

### Q3.1: SwiftUI 的视图更新机制是怎样的？与 UIKit 有什么本质区别？

**答：**

**UIKit（命令式）：**

```swift
// 手动管理状态同步
class CounterVC: UIViewController {
    var count = 0
    let label = UILabel()

    func increment() {
        count += 1
        label.text = "\(count)"       // 手动更新 UI
        button.isEnabled = count < 10  // 手动更新 UI
        // 每个状态变化都要手动同步所有关联的 UI
    }
}
```

**SwiftUI（声明式）：**

```swift
struct CounterView: View {
    @State private var count = 0

    var body: some View {
        VStack {
            Text("\(count)")
            Button("Increment") { count += 1 }
                .disabled(count >= 10)
        }
        // 状态变化 → 自动重新计算 body → 高效 diff 更新
    }
}
```

**SwiftUI 更新机制：**

```
@State / @ObservedObject 变化
          ↓
标记 View 为 invalid
          ↓
调用 body 属性（重新计算声明）
          ↓
与旧的 View 值进行结构对比（Diff）
          ↓
只更新变化的部分到底层 UIKit/AppKit 视图
```

**关键设计差异：**

| | UIKit | SwiftUI |
|--|-------|---------|
| View 本质 | 类（引用类型，长寿命对象） | 结构体（值类型，轻量描述） |
| 更新方式 | 命令式（手动 set） | 声明式（状态驱动） |
| 布局 | Auto Layout（约束求解） | 自带布局系统（Stack/Alignment） |
| 数据流 | Delegate/KVO/NotificationCenter | @State/@Binding/Environment |
| 动画 | UIView.animate / Core Animation | withAnimation / .animation modifier |
| 生命周期 | viewDidLoad/viewWillAppear... | onAppear/onDisappear/task |

---

### Q3.2: SwiftUI 中 `@State`、`@StateObject`、`@ObservedObject`、`@EnvironmentObject` 的区别？

**答：**

```swift
// @State：View 私有的简单值类型状态
struct ToggleView: View {
    @State private var isOn = false  // View 拥有此状态
    var body: some View {
        Toggle("Switch", isOn: $isOn)
    }
}

// @StateObject：View 拥有的引用类型状态（整个生命周期只创建一次）
struct ParentView: View {
    @StateObject private var viewModel = MyViewModel()  // 只创建一次
    var body: some View {
        ChildView(viewModel: viewModel)
    }
}

// @ObservedObject：外部传入的引用类型状态（不拥有，可能重建）
struct ChildView: View {
    @ObservedObject var viewModel: MyViewModel  // 由父传入
    var body: some View {
        Text(viewModel.title)
    }
}

// @EnvironmentObject：通过环境注入的共享状态
struct DeepChildView: View {
    @EnvironmentObject var settings: AppSettings  // 从祖先注入
    var body: some View {
        Text(settings.theme)
    }
}

// 注入方式
ContentView()
    .environmentObject(AppSettings())
```

**核心区别总结：**

| Wrapper | 所有权 | 类型 | 创建时机 | 适用场景 |
|---------|--------|------|---------|---------|
| `@State` | View 拥有 | 值类型 | View 首次创建时 | 简单的局部状态 |
| `@StateObject` | View 拥有 | ObservableObject | View 首次创建时 | ViewModel、复杂对象 |
| `@ObservedObject` | 外部传入 | ObservableObject | 外部创建 | 父传子的数据 |
| `@EnvironmentObject` | 环境注入 | ObservableObject | 祖先提供 | 全局共享（主题/认证） |

**⚠️ 常见陷阱：**

```swift
// ❌ 用 @ObservedObject 创建对象 → 每次 body 重算都会重建
struct BuggyView: View {
    @ObservedObject var vm = MyViewModel()  // 每次父 View 重建都创建新实例！
    var body: some View { Text(vm.data) }
}

// ✅ 用 @StateObject → 只创建一次
struct CorrectView: View {
    @StateObject var vm = MyViewModel()
    var body: some View { Text(vm.data) }
}
```

---

### Q3.3: UIKit 中 UITableView / UICollectionView 的性能优化要点？

**答：**

```swift
// 1. Cell 复用（最基础）
func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath)
    // 配置 cell...
    return cell
}

// 2. 预估高度 + 自动计算
tableView.estimatedRowHeight = 80
tableView.rowHeight = UITableView.automaticDimension

// 3. 异步图片加载 + 取消
func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath) as! ImageCell
    cell.task?.cancel()  // 取消上一次请求
    cell.task = Task {
        let image = try await ImageLoader.load(url: items[indexPath.row].imageURL)
        if !Task.isCancelled {
            cell.photoView.image = image
        }
    }
    return cell
}

// 4. 预加载（Prefetching）
extension VC: UITableViewDataSourcePrefetching {
    func tableView(_ tableView: UITableView, prefetchRowsAt indexPaths: [IndexPath]) {
        for indexPath in indexPaths {
            ImageLoader.prefetch(url: items[indexPath.row].imageURL)
        }
    }

    func tableView(_ tableView: UITableView, cancelPrefetchingForRowsAt indexPaths: [IndexPath]) {
        for indexPath in indexPaths {
            ImageLoader.cancelPrefetch(url: items[indexPath.row].imageURL)
        }
    }
}

// 5. Diffable Data Source（iOS 13+，避免 reloadData）
var snapshot = NSDiffableDataSourceSnapshot<Section, Item>()
snapshot.appendSections([.main])
snapshot.appendItems(items, toSection: .main)
dataSource.apply(snapshot, animatingDifferences: true)

// 6. Compositional Layout（iOS 13+，高性能复杂布局）
let layout = UICollectionViewCompositionalLayout { sectionIndex, env in
    let item = NSCollectionLayoutItem(layoutSize: ...)
    let group = NSCollectionLayoutGroup.horizontal(layoutSize: ..., subitems: [item])
    return NSCollectionLayoutSection(group: group)
}
```

**关键优化清单：**
- 避免在 `cellForRow` 中做耗时操作
- Cell 中避免离屏渲染（圆角用 `cornerRadius` + `masksToBounds` 会触发，可用贝塞尔路径裁剪）
- 图层扁平化（减少层级嵌套）
- 固定高度优于动态计算

---

## 4. 并发编程

### Q4.1: Swift Concurrency（async/await、Actor）如何工作？

**答：**

**async/await（结构化并发）：**

```swift
// 定义异步函数
func fetchUser(id: String) async throws -> User {
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}

// 调用
Task {
    do {
        let user = try await fetchUser(id: "123")
        // 自动在合适的线程更新（如果是 @MainActor）
    } catch {
        print(error)
    }
}
```

**并行执行：**

```swift
// async let：并行启动多个任务
func loadDashboard() async throws -> Dashboard {
    async let user = fetchUser()
    async let posts = fetchPosts()
    async let notifications = fetchNotifications()

    // 三个请求并行执行，在这里等待全部完成
    return try await Dashboard(
        user: user,
        posts: posts,
        notifications: notifications
    )
}

// TaskGroup：动态数量的并行任务
func fetchAllImages(urls: [URL]) async throws -> [UIImage] {
    try await withThrowingTaskGroup(of: UIImage.self) { group in
        for url in urls {
            group.addTask { try await downloadImage(url) }
        }
        var images: [UIImage] = []
        for try await image in group {
            images.append(image)
        }
        return images
    }
}
```

**Actor（数据竞争保护）：**

```swift
// Actor：保证内部状态串行访问，消除数据竞争
actor BankAccount {
    private var balance: Double = 0

    func deposit(_ amount: Double) {
        balance += amount
    }

    func withdraw(_ amount: Double) throws -> Double {
        guard balance >= amount else { throw InsufficientFundsError() }
        balance -= amount
        return amount
    }
}

// 外部访问 Actor 属性/方法必须 await
let account = BankAccount()
await account.deposit(100)
let money = try await account.withdraw(50)

// @MainActor：保证在主线程执行
@MainActor
class ViewModel: ObservableObject {
    @Published var items: [Item] = []

    func load() async {
        let data = await fetchFromNetwork()  // 可能在其他线程
        items = data  // 自动回到主线程，因为类标记了 @MainActor
    }
}
```

**Sendable：**

```swift
// Sendable 标记可以安全跨并发域传递的类型
struct UserData: Sendable {  // 值类型通常自动 Sendable
    let name: String
    let age: Int
}

// ⚠️ 类需要满足条件才能 Sendable
final class Config: Sendable {  // final + 所有属性不可变
    let apiKey: String
    init(apiKey: String) { self.apiKey = apiKey }
}
```

---

### Q4.2: GCD（Grand Central Dispatch）的核心概念？与 Swift Concurrency 的对比？

**答：**

```swift
// GCD：基于队列的并发模型
// 串行队列
let serial = DispatchQueue(label: "com.app.serial")
serial.async { /* 任务按顺序执行 */ }

// 并发队列
let concurrent = DispatchQueue(label: "com.app.concurrent", attributes: .concurrent)
concurrent.async { /* 任务并行执行 */ }

// 主队列
DispatchQueue.main.async { /* UI 更新 */ }

// 全局队列（按优先级）
DispatchQueue.global(qos: .userInitiated).async { /* 高优先级后台任务 */ }
DispatchQueue.global(qos: .utility).async { /* 低优先级任务 */ }

// DispatchGroup：等待一组任务完成
let group = DispatchGroup()
group.enter()
fetchA { group.leave() }
group.enter()
fetchB { group.leave() }
group.notify(queue: .main) { /* 全部完成 */ }

// Semaphore：限制并发数
let semaphore = DispatchSemaphore(value: 3) // 最多 3 个并发
for url in urls {
    semaphore.wait()
    queue.async {
        download(url)
        semaphore.signal()
    }
}
```

**GCD vs Swift Concurrency：**

| | GCD | Swift Concurrency |
|--|-----|-------------------|
| 语法 | 闭包回调 | async/await |
| 线程管理 | 开发者控制队列 | 运行时自动管理 |
| 数据安全 | 需手动加锁/串行队列 | Actor 自动保护 |
| 取消支持 | 需手动实现 | Task.cancel() 内建 |
| 编译检查 | 无 | Sendable 编译检查 |
| 回调地狱 | 容易出现 | 线性代码流 |
| 优先级反转 | 可能发生 | 运行时自动处理 |

---

## 5. 架构与设计模式（iOS）

### Q5.1: 对比 MVC、MVVM、VIPER、TCA 架构

**答：**

**MVC（Apple 传统）：**

```
View ← Controller → Model
       (Massive)
```

问题：Controller 承担过多职责（Massive View Controller）

**MVVM：**

```swift
// Model
struct User { let name: String; let email: String }

// ViewModel：不依赖 UIKit
class UserViewModel: ObservableObject {
    @Published var displayName = ""
    @Published var isLoading = false
    private let repository: UserRepository

    init(repository: UserRepository) {
        self.repository = repository
    }

    func load() async {
        isLoading = true
        let user = try? await repository.getUser()
        displayName = user?.name ?? "Unknown"
        isLoading = false
    }
}

// View：只负责展示
struct UserView: View {
    @StateObject var viewModel: UserViewModel

    var body: some View {
        if viewModel.isLoading {
            ProgressView()
        } else {
            Text(viewModel.displayName)
        }
    }
}
```

**TCA（The Composable Architecture）：**

```swift
// 单向数据流，强调可测试性和可组合性
@Reducer
struct Counter {
    @ObservableState
    struct State: Equatable {
        var count = 0
    }

    enum Action {
        case increment
        case decrement
        case fetchCompleted(Int)
    }

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .increment:
                state.count += 1
                return .none
            case .decrement:
                state.count -= 1
                return .none
            case .fetchCompleted(let value):
                state.count = value
                return .none
            }
        }
    }
}

// View
struct CounterView: View {
    let store: StoreOf<Counter>

    var body: some View {
        HStack {
            Button("-") { store.send(.decrement) }
            Text("\(store.count)")
            Button("+") { store.send(.increment) }
        }
    }
}
```

| 架构 | 复杂度 | 可测试性 | 适用规模 | 学习成本 |
|------|--------|---------|---------|---------|
| MVC | 低 | 差 | 小型/原型 | 低 |
| MVVM | 中 | 好 | 中型 | 低 |
| VIPER | 高 | 很好 | 大型团队 | 高 |
| TCA | 中-高 | 极好 | 中大型 | 中-高 |

---

## 6. 性能优化与工具（iOS）

### Q6.1: 如何使用 Instruments 诊断 iOS 性能问题？

**答：**

| Instrument | 用途 | 关注指标 |
|-----------|------|---------|
| Time Profiler | CPU 耗时分析 | 主线程占用、热点函数 |
| Allocations | 内存分配跟踪 | 总内存、分配频率、泄漏 |
| Leaks | 内存泄漏检测 | 泄漏对象、循环引用 |
| Core Animation | 渲染性能 | FPS、离屏渲染、混合图层 |
| Network | 网络请求分析 | 请求数、响应时间、数据量 |
| Energy Log | 电池消耗分析 | CPU/GPU/网络唤醒、后台活动 |

**常见性能问题与解决方案：**

```swift
// 1. 主线程阻塞
// ❌ 主线程做 IO/计算
let data = try! Data(contentsOf: largeFileURL) // 主线程阻塞

// ✅ 移到后台
Task.detached {
    let data = try await loadData(from: largeFileURL)
    await MainActor.run { self.process(data) }
}

// 2. 离屏渲染
// ❌ 触发离屏渲染
view.layer.cornerRadius = 10
view.layer.masksToBounds = true  // 配合圆角 → 离屏渲染
view.layer.shadowOffset = CGSize(width: 0, height: 2)  // 阴影 → 离屏渲染

// ✅ 优化
view.layer.cornerRadius = 10
view.layer.cornerCurve = .continuous
// 阴影加 path 避免离屏渲染
view.layer.shadowPath = UIBezierPath(roundedRect: view.bounds, cornerRadius: 10).cgPath

// 3. 图片解码
// ❌ 加载原图（4000x3000 解码消耗大量内存）
imageView.image = UIImage(named: "huge_photo")

// ✅ 降采样（Downsampling）
func downsample(imageAt url: URL, to pointSize: CGSize, scale: CGFloat) -> UIImage? {
    let options = [kCGImageSourceShouldCache: false] as CFDictionary
    guard let source = CGImageSourceCreateWithURL(url as CFURL, options) else { return nil }

    let maxDimension = max(pointSize.width, pointSize.height) * scale
    let downsampleOptions = [
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceShouldCacheImmediately: true,
        kCGImageSourceThumbnailMaxPixelSize: maxDimension
    ] as CFDictionary

    guard let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, downsampleOptions) else { return nil }
    return UIImage(cgImage: cgImage)
}
```

---

## 7. 系统机制与框架

### Q7.1: iOS App 的启动流程是怎样的？如何优化启动时间？

**答：**

```
┌─────────────────────────────────────────────┐
│  Pre-main（系统阶段）                        │
│  1. 加载 dyld（动态链接器）                   │
│  2. 加载动态库（系统 + 第三方）                │
│  3. Rebase & Bind（指针修正）                 │
│  4. ObjC Runtime Setup（类注册、category 加载）│
│  5. +load 方法                               │
│  6. C++ 静态初始化器                          │
├─────────────────────────────────────────────┤
│  Post-main（应用阶段）                       │
│  7. main() → UIApplicationMain()            │
│  8. application:didFinishLaunchingWithOptions│
│  9. 首帧渲染完成                              │
└─────────────────────────────────────────────┘
```

**优化策略：**

| 阶段 | 优化方法 |
|------|---------|
| Pre-main | 减少动态库数量（合并或改用静态库）、移除不用的 ObjC 类、避免 `+load`（改用 `+initialize`）、减少 C++ 静态初始化 |
| Post-main | `didFinishLaunching` 中延迟非必要初始化、首屏只加载必要数据、懒加载 SDK、使用 Launch Storyboard 提升感知速度 |

```swift
// 测量启动时间
// Scheme → Environment Variables → 添加 DYLD_PRINT_STATISTICS = 1

// 延迟初始化示例
func application(_ application: UIApplication,
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // 只做必要初始化
    setupCrashReporting()
    setupCoreData()

    // 延迟非关键初始化
    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
        self.setupAnalytics()
        self.setupPushNotifications()
    }

    return true
}
```

---

### Q7.2: 什么是 RunLoop？它和 iOS 事件处理的关系？

**答：**

RunLoop 是线程上的事件处理循环，让线程在没有事件时休眠，有事件时唤醒处理：

```
┌──────────────────────────────────────┐
│              RunLoop 循环             │
│                                      │
│   1. 处理 Source0（非端口事件）         │
│      ↓                               │
│   2. 处理 Source1（端口/系统事件）      │
│      ↓                               │
│   3. 处理 Timer                       │
│      ↓                               │
│   4. 处理 Observer 通知               │
│      ↓                               │
│   5. 处理 GCD dispatch 到主队列的 block│
│      ↓                               │
│   6. 没有事件 → 线程休眠              │
│      ↓                               │
│   7. 有事件 → 唤醒，回到 1            │
└──────────────────────────────────────┘
```

**RunLoop Mode：**

| Mode | 用途 |
|------|------|
| `default` | 默认模式，大部分事件 |
| `tracking` | ScrollView 滚动时的模式 |
| `common` | default + tracking 的集合 |

```swift
// 常见问题：Timer 在滚动时停止
// ❌ 默认 mode，滚动时 RunLoop 切换到 tracking mode，Timer 不触发
let timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
    updateUI()
}

// ✅ 添加到 common mode
RunLoop.current.add(timer, forMode: .common)
```

**RunLoop 的应用场景：**
- AutoreleasePool 的 drain 时机（每次 RunLoop 迭代结束）
- 手势识别
- 屏幕刷新（CADisplayLink）
- 延迟加载（在 RunLoop 空闲时加载图片）

---

### Q7.3: 解释 iOS 中的 App Lifecycle（前后台切换）和 Scene 生命周期

**答：**

```
Not Running → Inactive → Active → (用户使用中)
                 ↕
              Background → Suspended → (系统可能终止)
```

```swift
// iOS 13+ Scene-based lifecycle
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    func sceneDidBecomeActive(_ scene: UIScene) {
        // 前台活跃：恢复暂停的任务、刷新 UI
    }

    func sceneWillResignActive(_ scene: UIScene) {
        // 即将失去焦点：暂停游戏、保存草稿
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // 进入后台：保存数据、释放共享资源
        // 约 5 秒执行时间
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // 即将回到前台：撤销后台的更改
    }
}

// SwiftUI
@main
struct MyApp: App {
    @Environment(\.scenePhase) var scenePhase

    var body: some Scene {
        WindowGroup { ContentView() }
            .onChange(of: scenePhase) { _, phase in
                switch phase {
                case .active: break      // 前台活跃
                case .inactive: break    // 临时不活跃
                case .background: break  // 后台
                @unknown default: break
                }
            }
    }
}
```

**后台任务：**

```swift
// Background Task：申请额外执行时间
func sceneDidEnterBackground(_ scene: UIScene) {
    let taskID = UIApplication.shared.beginBackgroundTask {
        // 时间到了的清理回调
        UIApplication.shared.endBackgroundTask(taskID)
    }

    Task {
        await saveData()
        UIApplication.shared.endBackgroundTask(taskID)
    }
}

// BGTaskScheduler（iOS 13+）：后台定时任务
BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.app.refresh", using: nil) { task in
    handleBackgroundRefresh(task: task as! BGAppRefreshTask)
}
```

---

# 第二部分：Android 开发

## 8. Kotlin 语言基础

### Q8.1: Kotlin 中的 `data class`、`sealed class`、`object`、`companion object` 各有什么用？

**答：**

```kotlin
// 1. data class：自动生成 equals/hashCode/toString/copy/componentN
data class User(val name: String, val age: Int)

val user1 = User("Alice", 25)
val user2 = user1.copy(age = 26)       // 浅拷贝并修改
val (name, age) = user1                 // 解构
println(user1)                          // User(name=Alice, age=25)
println(user1 == User("Alice", 25))     // true（结构相等）

// 2. sealed class：受限的继承层次，编译器可穷举
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String) : Result<Nothing>()
    data object Loading : Result<Nothing>()
}

fun handle(result: Result<String>) = when (result) {
    is Result.Success -> println(result.data)
    is Result.Error -> println(result.message)
    Result.Loading -> println("Loading...")
    // 不需要 else，编译器知道已穷举
}

// 3. object：单例
object Database {
    fun connect() { /* ... */ }
}
Database.connect()

// 4. companion object：类的静态成员（类似 Java static）
class MyFragment : Fragment() {
    companion object {
        private const val ARG_ID = "id"

        fun newInstance(id: String) = MyFragment().apply {
            arguments = bundleOf(ARG_ID to id)
        }
    }
}
```

---

### Q8.2: Kotlin 的空安全和作用域函数（let/run/with/apply/also）

**答：**

**空安全：**

```kotlin
var name: String = "Hello"   // 非空
var name: String? = null     // 可空

name?.length                 // 安全调用
name ?: "default"            // Elvis 操作符
name!!.length                // 强制解包（null 时抛 NPE）

// 智能转换（Smart Cast）
fun process(value: Any) {
    if (value is String) {
        println(value.length)  // 自动转换为 String，无需强转
    }
}
```

**作用域函数：**

| 函数 | 对象引用 | 返回值 | 典型场景 |
|------|---------|--------|---------|
| `let` | `it` | Lambda 结果 | 空安全调用、变量转换 |
| `run` | `this` | Lambda 结果 | 对象配置 + 计算结果 |
| `with` | `this` | Lambda 结果 | 对已有对象调用多个方法 |
| `apply` | `this` | 对象本身 | 对象初始化/配置 |
| `also` | `it` | 对象本身 | 额外的副作用（日志等） |

```kotlin
// let：空安全 + 转换
val length = name?.let {
    println("Name is $it")
    it.length  // 返回长度
}

// apply：对象初始化
val textView = TextView(context).apply {
    text = "Hello"
    textSize = 16f
    setTextColor(Color.BLACK)
}

// also：链式操作中的副作用
fun getUser() = repository.findUser(id)
    .also { log("Found user: $it") }  // 日志，不影响返回值

// run：配置 + 计算
val result = service.run {
    port = 8080
    query("SELECT * FROM users")  // 返回查询结果
}

// with：已有对象的多个操作
with(binding) {
    titleText.text = item.title
    subtitleText.text = item.subtitle
    imageView.load(item.imageUrl)
}
```

---

### Q8.3: Kotlin 中的委托（Delegation）机制

**答：**

```kotlin
// 1. 类委托（by）：用组合替代继承
interface Printer {
    fun print(message: String)
}

class ConsolePrinter : Printer {
    override fun print(message: String) = println(message)
}

// LoggingPrinter 自动委托 Printer 接口的实现给 printer
class LoggingPrinter(private val printer: Printer) : Printer by printer {
    override fun print(message: String) {
        println("[LOG] About to print")
        printer.print(message)  // 委托给真正的实现
    }
}

// 2. 属性委托
// lazy：首次访问时初始化
val heavyObject: HeavyObject by lazy {
    HeavyObject()  // 线程安全的懒初始化
}

// observable：属性变化监听
var name: String by Delegates.observable("initial") { prop, old, new ->
    println("$old → $new")
}

// 自定义委托
class SharedPreferencesDelegate(
    private val prefs: SharedPreferences,
    private val key: String,
    private val default: String
) : ReadWriteProperty<Any, String> {

    override fun getValue(thisRef: Any, property: KProperty<*>): String {
        return prefs.getString(key, default) ?: default
    }

    override fun setValue(thisRef: Any, property: KProperty<*>, value: String) {
        prefs.edit().putString(key, value).apply()
    }
}

// 使用
class Settings(prefs: SharedPreferences) {
    var username: String by SharedPreferencesDelegate(prefs, "username", "")
    var theme: String by SharedPreferencesDelegate(prefs, "theme", "light")
}
```

---

### Q8.4: Kotlin 的内联函数（inline）、reified 泛型和高阶函数

**答：**

```kotlin
// inline：编译时将函数体内联到调用处，消除 Lambda 对象开销
inline fun measureTime(block: () -> Unit): Long {
    val start = System.currentTimeMillis()
    block()  // 不会创建 Function 对象
    return System.currentTimeMillis() - start
}

// reified：在 inline 函数中获取泛型的实际类型（运行时可用）
// 普通泛型在运行时被擦除，reified 保留类型信息
inline fun <reified T> Gson.fromJson(json: String): T {
    return fromJson(json, T::class.java)  // 可以直接使用 T::class
}

// 使用
val user = gson.fromJson<User>(jsonString) // 不需要传 User::class.java

// crossinline / noinline
inline fun execute(
    crossinline setup: () -> Unit,   // 不允许非局部返回
    noinline callback: () -> Unit    // 不内联此参数（可以存储引用）
) {
    setup()
    post(callback)  // noinline 的 lambda 可以作为对象传递
}

// 非局部返回
inline fun List<Int>.forEachInlined(action: (Int) -> Unit) {
    for (item in this) action(item)
}

fun test() {
    listOf(1, 2, 3).forEachInlined {
        if (it == 2) return  // 直接从 test() 返回（非局部返回）
    }
}
```

---

## 9. 四大组件与生命周期

### Q9.1: Activity 的生命周期和配置变更处理

**答：**

```
                  onCreate()
                      ↓
                  onStart()    ←── onRestart()
                      ↓               ↑
                  onResume()          │
                      ↓               │
               [Activity Running]     │
                      ↓               │
                  onPause()           │
                      ↓               │
                  onStop()  ──────────┘
                      ↓
                  onDestroy()
```

**配置变更（如旋转屏幕）默认行为：** 销毁 Activity → 重建 Activity

```kotlin
// 方案 1：ViewModel（推荐，数据在配置变更中存活）
class MyViewModel : ViewModel() {
    private val _data = MutableLiveData<List<Item>>()
    val data: LiveData<List<Item>> = _data

    fun loadData() {
        viewModelScope.launch {
            _data.value = repository.fetch()
        }
    }
}

// 方案 2：onSaveInstanceState（少量简单数据）
override fun onSaveInstanceState(outState: Bundle) {
    super.onSaveInstanceState(outState)
    outState.putInt("scroll_position", scrollPosition)
}

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    savedInstanceState?.getInt("scroll_position")?.let { scrollTo(it) }
}

// 方案 3：自行处理配置变更（不推荐，除非有特殊需求）
// AndroidManifest.xml
// android:configChanges="orientation|screenSize|keyboardHidden"
override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    // 手动调整布局
}
```

---

### Q9.2: Fragment 的生命周期和常见问题

**答：**

```
onAttach() → onCreate() → onCreateView() → onViewCreated()
    → onStart() → onResume()

onPause() → onStop() → onDestroyView() → onDestroy() → onDetach()
```

**常见问题与最佳实践：**

```kotlin
class MyFragment : Fragment(R.layout.fragment_my) {

    // ✅ 使用 viewLifecycleOwner（而非 this）观察 LiveData
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // ❌ 使用 this 可能导致多次观察（Fragment 可能多次 onCreateView）
        // viewModel.data.observe(this) { ... }

        // ✅ viewLifecycleOwner 跟随 View 生命周期
        viewModel.data.observe(viewLifecycleOwner) { data ->
            adapter.submitList(data)
        }
    }

    // ViewBinding 的正确用法
    private var _binding: FragmentMyBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentMyBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null  // 避免内存泄漏
    }

    // Fragment 之间通信：使用 ViewModel 或 FragmentResult API
    // ❌ 直接引用其他 Fragment
    // ✅ 共享 ViewModel
    private val sharedViewModel: SharedViewModel by activityViewModels()

    // ✅ FragmentResult API
    setFragmentResult("requestKey", bundleOf("key" to value))
    // 接收方
    setFragmentResultListener("requestKey") { _, bundle ->
        val value = bundle.getString("key")
    }
}
```

---

### Q9.3: Service、BroadcastReceiver、ContentProvider 的使用场景

**答：**

**Service：**

```kotlin
// Foreground Service（长时间后台任务，如音乐播放、GPS 导航）
class MusicService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification) // 必须显示通知
        playMusic()
        return START_STICKY // 被杀后自动重启
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

// WorkManager（推荐替代后台 Service）
val request = OneTimeWorkRequestBuilder<UploadWorker>()
    .setConstraints(Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .setRequiresBatteryNotLow(true)
        .build())
    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.SECONDS)
    .build()

WorkManager.getInstance(context).enqueue(request)
```

**BroadcastReceiver：**

```kotlin
// 静态注册（AndroidManifest.xml，受限）
// 动态注册（推荐）
val receiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BATTERY_LOW -> showWarning()
            ConnectivityManager.CONNECTIVITY_ACTION -> checkNetwork()
        }
    }
}

// 注册
registerReceiver(receiver, IntentFilter(Intent.ACTION_BATTERY_LOW))
// 注销（避免泄漏）
unregisterReceiver(receiver)
```

**ContentProvider：**

```kotlin
// 跨应用数据共享
class MyProvider : ContentProvider() {
    override fun query(uri: Uri, ...): Cursor? {
        return when (uriMatcher.match(uri)) {
            ITEMS -> database.query("items", ...)
            ITEM_ID -> database.query("items", ..., "id=${uri.lastPathSegment}")
            else -> null
        }
    }
}

// 使用
val cursor = contentResolver.query(
    ContactsContract.Contacts.CONTENT_URI, null, null, null, null
)
```

---

## 10. Jetpack 组件

### Q10.1: Jetpack Compose 的重组（Recomposition）机制

**答：**

```kotlin
// Compose 核心：声明式 UI，状态变化触发重组
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }

    Column {
        Text("Count: $count")  // count 变化时重组
        Button(onClick = { count++ }) {
            Text("Increment")
        }
    }
}
```

**重组优化原则：**

```kotlin
// 1. Compose 是智能的：只重组读取了变化状态的 Composable
@Composable
fun Parent() {
    var name by remember { mutableStateOf("") }
    var age by remember { mutableStateOf(0) }

    NameDisplay(name)  // 只有 name 变化时重组
    AgeDisplay(age)    // 只有 age 变化时重组
}

// 2. remember：在重组中保持值
@Composable
fun ExpensiveCalculation(input: List<Int>) {
    // ❌ 每次重组都计算
    val result = input.sorted().take(10)

    // ✅ 只有 input 变化时重新计算
    val result = remember(input) { input.sorted().take(10) }
}

// 3. derivedStateOf：减少不必要的重组
@Composable
fun ItemList(items: List<Item>) {
    val listState = rememberLazyListState()

    // ❌ 每次滚动都重组
    val showButton = listState.firstVisibleItemIndex > 0

    // ✅ 只在条件变化时重组
    val showButton by remember {
        derivedStateOf { listState.firstVisibleItemIndex > 0 }
    }

    if (showButton) {
        ScrollToTopButton()
    }
}

// 4. 稳定性（Stability）
// Compose 跳过重组的条件：参数是 Stable 且 equals 返回 true
// data class 默认 Stable（所有属性都是 val 且类型 Stable）
data class User(val name: String, val age: Int)  // ✅ Stable

// List/Map 不是 Stable（可能被外部修改）
data class State(val items: List<Item>)  // ⚠️ 不 Stable

// 解决方案：使用 @Immutable 或 kotlinx.collections.immutable
@Immutable
data class State(val items: ImmutableList<Item>)  // ✅ Stable
```

---

### Q10.2: ViewModel + LiveData/StateFlow + Repository 模式

**答：**

```kotlin
// Repository
class UserRepository(
    private val api: UserApi,
    private val dao: UserDao
) {
    fun getUsers(): Flow<List<User>> = dao.observeAll()  // Room 返回 Flow

    suspend fun refresh() {
        val users = api.fetchUsers()
        dao.insertAll(users)
    }
}

// ViewModel（使用 StateFlow）
class UserViewModel(private val repository: UserRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.getUsers()
                .catch { _uiState.value = UiState.Error(it.message ?: "Unknown") }
                .collect { users -> _uiState.value = UiState.Success(users) }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                repository.refresh()
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Unknown")
            }
        }
    }
}

sealed class UiState {
    data object Loading : UiState()
    data class Success(val users: List<User>) : UiState()
    data class Error(val message: String) : UiState()
}

// Compose UI
@Composable
fun UserScreen(viewModel: UserViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when (val state = uiState) {
        is UiState.Loading -> CircularProgressIndicator()
        is UiState.Success -> UserList(state.users)
        is UiState.Error -> ErrorView(state.message, onRetry = { viewModel.refresh() })
    }
}
```

**LiveData vs StateFlow：**

| | LiveData | StateFlow |
|--|---------|-----------|
| 生命周期感知 | 自动 | 需要 `collectAsStateWithLifecycle()` |
| 初始值 | 可选 | 必须有初始值 |
| 纯 Kotlin | 需要 Android 依赖 | 纯 Kotlin，跨平台 |
| 操作符 | 有限（map/switchMap） | 完整 Flow 操作符 |
| 推荐 | 旧项目维护 | 新项目首选 |

---

### Q10.3: Room 数据库的使用和优化

**答：**

```kotlin
// Entity
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "display_name") val name: String,
    val email: String,
    @ColumnInfo(index = true) val createdAt: Long  // 添加索引
)

// DAO
@Dao
interface UserDao {
    @Query("SELECT * FROM users ORDER BY created_at DESC")
    fun observeAll(): Flow<List<UserEntity>>  // 响应式查询

    @Query("SELECT * FROM users WHERE id = :userId")
    suspend fun getById(userId: String): UserEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(users: List<UserEntity>)

    @Transaction  // 事务
    suspend fun replaceAll(users: List<UserEntity>) {
        deleteAll()
        insertAll(users)
    }

    @Query("DELETE FROM users")
    suspend fun deleteAll()
}

// Database
@Database(entities = [UserEntity::class], version = 2)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}

// 类型转换器
class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? = value?.let { Date(it) }

    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? = date?.time
}

// 数据库迁移
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE users ADD COLUMN email TEXT NOT NULL DEFAULT ''")
    }
}

// 构建
Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
    .addMigrations(MIGRATION_1_2)
    .build()
```

---

## 11. 并发编程（Coroutines）

### Q11.1: Kotlin Coroutines 的核心概念

**答：**

```kotlin
// CoroutineScope：定义协程的生命周期
class MyViewModel : ViewModel() {
    // viewModelScope：ViewModel 销毁时自动取消
    fun load() = viewModelScope.launch {
        val data = fetchData()  // 挂起，不阻塞线程
        _state.value = data
    }
}

// Dispatcher：决定协程在哪个线程执行
viewModelScope.launch(Dispatchers.Main) {      // 主线程
    val data = withContext(Dispatchers.IO) {    // 切到 IO 线程
        api.fetchData()                        // 网络请求
    }
    updateUI(data)                             // 回到主线程
}

// Dispatchers 对比
// Main：主线程，UI 操作
// IO：IO 密集型（网络、文件），线程池较大
// Default：CPU 密集型（排序、解析），线程数 = CPU 核数
// Unconfined：不切换线程（不推荐常规使用）
```

**结构化并发：**

```kotlin
// 并行请求
suspend fun loadDashboard(): Dashboard = coroutineScope {
    val user = async { fetchUser() }
    val posts = async { fetchPosts() }
    val stats = async { fetchStats() }

    Dashboard(
        user = user.await(),
        posts = posts.await(),
        stats = stats.await()
    )
    // 任何一个失败，其他自动取消
}

// 异常处理
viewModelScope.launch {
    try {
        val result = repository.fetchData()
        _state.value = UiState.Success(result)
    } catch (e: CancellationException) {
        throw e  // 不要吞掉 CancellationException！
    } catch (e: Exception) {
        _state.value = UiState.Error(e.message)
    }
}

// SupervisorJob：子协程失败不影响其他子协程
val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
scope.launch { task1() }  // task1 失败不会取消 task2
scope.launch { task2() }
```

---

### Q11.2: Flow 的冷流与热流，以及 StateFlow / SharedFlow

**答：**

```kotlin
// Cold Flow（冷流）：每个收集者独立执行
fun fetchItems(): Flow<Item> = flow {
    for (item in api.getItems()) {
        emit(item)
        delay(100)
    }
}

// 每次 collect 都会重新执行 flow { } 块
fetchItems().collect { item -> println(item) } // 执行一次
fetchItems().collect { item -> println(item) } // 再执行一次

// Hot Flow（热流）：多个收集者共享
// StateFlow：始终持有当前值，新收集者立即获得最新值
private val _state = MutableStateFlow(UiState.Loading)
val state: StateFlow<UiState> = _state.asStateFlow()

// SharedFlow：不持有值，可配置重放和缓冲
private val _events = MutableSharedFlow<Event>(
    replay = 0,              // 新订阅者不接收历史事件
    extraBufferCapacity = 1, // 缓冲区
    onBufferOverflow = BufferOverflow.DROP_OLDEST
)
val events: SharedFlow<Event> = _events.asSharedFlow()
```

**Flow 操作符：**

```kotlin
repository.getUsers()
    .map { users -> users.filter { it.isActive } }          // 转换
    .distinctUntilChanged()                                  // 去重
    .debounce(300)                                           // 防抖
    .catch { e -> emit(emptyList()) }                        // 异常处理
    .flowOn(Dispatchers.IO)                                  // 上游在 IO 线程
    .onEach { users -> analytics.log("users: ${users.size}") }
    .stateIn(                                                 // 转换为 StateFlow
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),      // 无订阅者 5s 后停止
        initialValue = emptyList()
    )
```

**在 UI 中安全收集：**

```kotlin
// Compose
@Composable
fun MyScreen(viewModel: MyViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    // 自动跟随 Lifecycle 暂停/恢复
}

// View 系统
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.state.collect { state ->
            updateUI(state)
        }
    }
}
```

---

## 12. 架构与设计模式（Android）

### Q12.1: Android 推荐架构（Google 官方）

**答：**

```
┌─────────────────────────────────────────┐
│              UI Layer                    │
│   Activity/Fragment/Compose ← ViewModel │
│         (观察 UiState)                   │
├─────────────────────────────────────────┤
│            Domain Layer (可选)           │
│            UseCases                      │
├─────────────────────────────────────────┤
│             Data Layer                   │
│   Repository → Remote DataSource (API)   │
│              → Local DataSource (Room)   │
└─────────────────────────────────────────┘
```

**单向数据流（UDF）：**

```kotlin
// 事件从 UI → ViewModel → Repository（向下）
// 状态从 Repository → ViewModel → UI（向上）

// UiState
data class HomeUiState(
    val items: List<Item> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

// ViewModel
class HomeViewModel(private val repository: ItemRepository) : ViewModel() {
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    fun onEvent(event: HomeEvent) {
        when (event) {
            is HomeEvent.Refresh -> refresh()
            is HomeEvent.Delete -> delete(event.itemId)
        }
    }

    private fun refresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                val items = repository.getItems()
                _uiState.update { it.copy(items = items, isLoading = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message, isLoading = false) }
            }
        }
    }
}

sealed class HomeEvent {
    data object Refresh : HomeEvent()
    data class Delete(val itemId: String) : HomeEvent()
}
```

---

### Q12.2: Hilt 依赖注入

**答：**

```kotlin
// 1. Module 定义
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit = Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    @Provides
    @Singleton
    fun provideUserApi(retrofit: Retrofit): UserApi =
        retrofit.create(UserApi::class.java)
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    @Singleton
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}

// 2. 注入
@HiltViewModel
class UserViewModel @Inject constructor(
    private val repository: UserRepository
) : ViewModel() { ... }

@AndroidEntryPoint
class UserActivity : AppCompatActivity() {
    private val viewModel: UserViewModel by viewModels()
}

// 3. Scope 对比
// @Singleton → SingletonComponent（应用级）
// @ActivityScoped → ActivityComponent（Activity 级）
// @ViewModelScoped → ViewModelComponent（ViewModel 级）
// @FragmentScoped → FragmentComponent（Fragment 级）
```

---

## 13. 性能优化与工具（Android）

### Q13.1: Android 性能优化的关键领域

**答：**

**1. 启动优化：**

```kotlin
// App Startup 库：控制初始化顺序和延迟
class AnalyticsInitializer : Initializer<Analytics> {
    override fun create(context: Context): Analytics {
        return Analytics.init(context)
    }

    override fun dependencies(): List<Class<out Initializer<*>>> {
        return listOf(CrashReportingInitializer::class.java) // 依赖关系
    }
}

// Baseline Profile（提升启动和运行时性能）
// 提前编译热路径代码为机器码
@get:Rule
val rule = BaselineProfileRule()

@Test
fun generateBaselineProfile() {
    rule.collect(packageName = "com.example.app") {
        startActivityAndWait()
        // 模拟用户操作...
    }
}
```

**2. 内存优化：**

```kotlin
// 避免内存泄漏
// ❌ 静态引用 Activity
companion object {
    var activity: Activity? = null  // 永远不要这样做
}

// ❌ 内部类持有外部引用
class MyActivity : AppCompatActivity() {
    inner class MyHandler : Handler() { ... }  // 隐式持有 Activity
}

// ✅ 使用 WeakReference 或静态内部类
class MyHandler(activity: Activity) : Handler(Looper.getMainLooper()) {
    private val activityRef = WeakReference(activity)
    override fun handleMessage(msg: Message) {
        activityRef.get()?.let { /* ... */ }
    }
}
```

**3. 布局优化：**

```kotlin
// Compose：避免不必要的重组（前面已详述）
// View 系统：减少层级、使用 ConstraintLayout
// 工具：Layout Inspector

// R8/ProGuard：代码缩减 + 混淆
android {
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}
```

---

### Q13.2: Android 常用性能分析工具

**答：**

| 工具 | 用途 |
|------|------|
| Android Studio Profiler | CPU、内存、网络、电量实时监控 |
| Layout Inspector | Compose/View 层级、重组次数 |
| LeakCanary | 自动检测内存泄漏 |
| Systrace / Perfetto | 系统级帧分析 |
| Macrobenchmark | 启动时间、帧率等自动化基准测试 |
| Baseline Profile | 预编译热路径提升性能 |
| R8 | 代码缩减、混淆、优化 |

```kotlin
// LeakCanary（Debug 版自动检测泄漏）
debugImplementation("com.squareup.leakcanary:leakcanary-android:2.14")
// 无需额外代码，泄漏时自动弹出通知

// Macrobenchmark
@LargeTest
@RunWith(AndroidJUnit4::class)
class StartupBenchmark {
    @get:Rule
    val benchmarkRule = MacrobenchmarkRule()

    @Test
    fun startupCompilation() = benchmarkRule.measureRepeated(
        packageName = "com.example.app",
        metrics = listOf(StartupTimingMetric()),
        iterations = 5,
        startupMode = StartupMode.COLD
    ) {
        pressHome()
        startActivityAndWait()
    }
}
```

---

## 14. 系统机制

### Q14.1: Android 的进程优先级和后台限制

**答：**

```
进程优先级（从高到低）：
1. 前台进程（Foreground）     - 用户正在交互的 Activity
2. 可见进程（Visible）        - 可见但不在前台（如对话框后面的 Activity）
3. 服务进程（Service）        - 正在运行 startService
4. 缓存进程（Cached/Background） - 不可见，可能被系统随时杀死
5. 空进程（Empty）            - 无活跃组件，最先被杀
```

**Android 后台限制演进：**

| 版本 | 限制 |
|------|------|
| Android 8 (O) | 后台服务限制、广播限制 |
| Android 9 (P) | Standby Buckets |
| Android 12 (S) | 前台服务启动限制、精确闹钟权限 |
| Android 13 (T) | 通知权限、前台服务类型声明 |
| Android 14 (U) | 前台服务类型强制声明 |

```kotlin
// 正确的后台工作方式选择
// 立即执行 + 长时间 → Foreground Service
// 可延迟 + 需要保证执行 → WorkManager
// 精确定时 → AlarmManager（需要权限）
// 短暂后台操作 → Coroutine（在 ViewModel/lifecycle scope 中）
```

---

### Q14.2: Intent 和 Intent Filter 的工作机制

**答：**

```kotlin
// 显式 Intent：指定目标组件
val intent = Intent(this, DetailActivity::class.java).apply {
    putExtra("item_id", "123")
}
startActivity(intent)

// 隐式 Intent：通过 Action/Category/Data 匹配
val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://example.com"))
startActivity(intent)

// Intent Filter（在 Manifest 中声明）
// <intent-filter>
//     <action android:name="android.intent.action.VIEW" />
//     <category android:name="android.intent.category.DEFAULT" />
//     <data android:scheme="https" android:host="example.com" />
// </intent-filter>

// Deep Link 处理
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    intent?.data?.let { uri ->
        when {
            uri.pathSegments.firstOrNull() == "product" -> {
                val productId = uri.lastPathSegment
                navigateToProduct(productId)
            }
        }
    }
}

// PendingIntent（跨进程传递 Intent）
val pendingIntent = PendingIntent.getActivity(
    context, 0, intent,
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
)
```

---

# 第三部分：Flutter 开发

## 15. Dart 语言与核心机制

### Q15.1: Dart 的事件循环和 Isolate

**答：**

```dart
// 事件循环（单线程模型）
// 执行顺序：同步代码 → Microtask Queue → Event Queue

void main() {
  print('1');                                    // 同步
  Future(() => print('2'));                       // Event Queue
  Future.microtask(() => print('3'));             // Microtask Queue
  scheduleMicrotask(() => print('4'));            // Microtask Queue
  Future(() => print('5'));                       // Event Queue
  print('6');                                    // 同步
}
// 输出：1, 6, 3, 4, 2, 5

// Isolate：真正的并行（独立内存，消息传递通信）
// 适用于 CPU 密集型任务：JSON 解析、图片处理、加密
final result = await Isolate.run(() {
  return jsonDecode(hugeJsonString); // 在独立 Isolate 中执行
});

// compute() 是 Flutter 封装的便捷方法
final parsed = await compute(parseJson, rawData);

// 复杂场景：长时间运行的 Isolate + 双向通信
final receivePort = ReceivePort();
await Isolate.spawn(heavyWork, receivePort.sendPort);
receivePort.listen((message) {
  if (message is SendPort) {
    message.send('start');
  } else {
    print('Result: $message');
  }
});
```

---

### Q15.2: Dart 3 的新特性：Records、Patterns、sealed class

**答：**

```dart
// Records（匿名复合类型）
(String, int) getUserInfo() => ('Alice', 25);

final info = getUserInfo();
print(info.$1); // 'Alice'
print(info.$2); // 25

// 命名字段
({String name, int age}) getUser() => (name: 'Alice', age: 25);
final user = getUser();
print(user.name);

// Patterns（模式匹配）
// switch 表达式
String describe(Object obj) => switch (obj) {
  int n when n < 0 => 'negative',
  int n => 'int: $n',
  String s => 'string: $s',
  (int x, int y) => 'point($x, $y)',  // 解构 Record
  [int first, ...rest] => 'list starting with $first',
  {'name': String name} => 'map with name: $name',
  _ => 'unknown',
};

// if-case
if (json case {'users': [{'name': String name}, ...]}) {
  print('First user: $name');
}

// sealed class + 穷举
sealed class Shape {}
class Circle extends Shape { final double radius; Circle(this.radius); }
class Rect extends Shape { final double w, h; Rect(this.w, this.h); }

double area(Shape shape) => switch (shape) {
  Circle(radius: var r) => 3.14 * r * r,
  Rect(w: var w, h: var h) => w * h,
};

// class modifiers（Dart 3）
// base class → 只能继承，不能实现
// interface class → 只能实现，不能继承
// final class → 不能继承也不能实现（同文件除外）
// sealed class → 同文件内穷举子类
```

---

## 16. 渲染与三棵树

### Q16.1: Widget / Element / RenderObject 三棵树详解

**答：**

```
Widget Tree          Element Tree            RenderObject Tree
(不可变配置)          (可变实例)               (布局+绘制)

Scaffold ──────► StatefulElement
  │                    │
  ├─ AppBar ────► ComponentElement ──────► RenderFlex
  │                    │
  └─ ListView ──► SliverMultiBoxAdaptorElement ──► RenderSliverList
       │
       └─ ListTile ──► StatelessElement ──► RenderPadding
                                               └─ RenderFlex
```

**核心流程：**

1. **Widget**：不可变的配置描述，每次 `build()` 可能创建新实例
2. **Element**：Widget 的实例化，管理生命周期，决定是否复用
   - `canUpdate(oldWidget, newWidget)`：`runtimeType` + `key` 都相同则复用
3. **RenderObject**：真正执行布局（`performLayout`）和绘制（`paint`）

**约束传递规则：**
```
Constraints go down（父传子约束）
Sizes go up（子回传尺寸）
Parent sets position（父设子位置）
```

```dart
// 理解约束的典型问题
SizedBox(
  width: 100,
  height: 100,
  child: Container(
    width: 200,  // 无效！父约束 tight=100，子不能大于 100
    height: 200,
    color: Colors.red,
  ),
)
// 实际渲染为 100x100

// ConstrainedBox 传递约束
ConstrainedBox(
  constraints: BoxConstraints(maxWidth: 200),
  child: Container(width: 300),  // 实际宽度被限制为 200
)
```

---

## 17. 状态管理

### Q17.1: BLoC vs Riverpod 深度对比

**答：**

**BLoC（Business Logic Component）：**

```dart
// 事件驱动、流式响应
// Event → BLoC → State

sealed class AuthEvent {}
class LoginRequested extends AuthEvent {
  final String email, password;
  LoginRequested(this.email, this.password);
}
class LogoutRequested extends AuthEvent {}

sealed class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthSuccess extends AuthState { final User user; AuthSuccess(this.user); }
class AuthFailure extends AuthState { final String message; AuthFailure(this.message); }

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _repo;

  AuthBloc(this._repo) : super(AuthInitial()) {
    on<LoginRequested>(_onLogin);
    on<LogoutRequested>(_onLogout);
  }

  Future<void> _onLogin(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final user = await _repo.login(event.email, event.password);
      emit(AuthSuccess(user));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onLogout(LogoutRequested event, Emitter<AuthState> emit) async {
    await _repo.logout();
    emit(AuthInitial());
  }
}

// UI
BlocBuilder<AuthBloc, AuthState>(
  builder: (context, state) => switch (state) {
    AuthInitial() => LoginForm(),
    AuthLoading() => CircularProgressIndicator(),
    AuthSuccess(user: final u) => HomePage(user: u),
    AuthFailure(message: final m) => ErrorView(message: m),
  },
)
```

**Riverpod：**

```dart
// 编译安全、无需 context、自动依赖管理
final authRepositoryProvider = Provider((ref) => AuthRepository());

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;
  AuthNotifier(this._repo) : super(AuthInitial());

  Future<void> login(String email, String password) async {
    state = AuthLoading();
    try {
      final user = await _repo.login(email, password);
      state = AuthSuccess(user);
    } catch (e) {
      state = AuthFailure(e.toString());
    }
  }
}

// UI
class LoginPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    return switch (authState) {
      AuthInitial() => LoginForm(),
      AuthLoading() => CircularProgressIndicator(),
      AuthSuccess(user: final u) => HomePage(user: u),
      AuthFailure(message: final m) => ErrorView(message: m),
    };
  }
}
```

| | BLoC | Riverpod |
|--|------|---------|
| 数据流 | 事件 → BLoC → 状态（严格单向） | 函数式、Provider 依赖图 |
| 学习曲线 | 中-高 | 中 |
| 模板代码 | 较多（Event + State + BLoC） | 较少 |
| 测试 | `blocTest()`，非常规范 | Provider override，灵活 |
| context 依赖 | 需要（BlocProvider） | 不需要（编译安全） |
| 适用团队 | 大型团队（规范强制） | 中小型团队（灵活高效） |

---

## 18. 平台通信与混合开发

### Q18.1: Platform Channel 和 Add-to-App 方案

**答：**

```dart
// MethodChannel（最常用）
class NativeService {
  static const _channel = MethodChannel('com.app/native');

  Future<String> getPlatformVersion() async {
    return await _channel.invokeMethod('getPlatformVersion');
  }

  // 原生调用 Dart
  void setupCallHandler() {
    _channel.setMethodCallHandler((call) async {
      switch (call.method) {
        case 'onNativeEvent':
          handleNativeEvent(call.arguments);
          return 'handled';
        default:
          throw MissingPluginException();
      }
    });
  }
}
```

```swift
// iOS 端（Swift）
let channel = FlutterMethodChannel(name: "com.app/native",
                                    binaryMessenger: controller.binaryMessenger)
channel.setMethodCallHandler { (call, result) in
    switch call.method {
    case "getPlatformVersion":
        result("iOS \(UIDevice.current.systemVersion)")
    default:
        result(FlutterMethodNotImplemented)
    }
}
```

```kotlin
// Android 端（Kotlin）
MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.app/native")
    .setMethodCallHandler { call, result ->
        when (call.method) {
            "getPlatformVersion" -> result.success("Android ${Build.VERSION.RELEASE}")
            else -> result.notImplemented()
        }
    }
```

**Pigeon（类型安全的代码生成替代方案）：**

```dart
// 定义接口（pigeon 文件）
@HostApi()
abstract class NativeApi {
  String getPlatformVersion();
  @async
  UserInfo getUserInfo(String userId);
}

// 自动生成 Dart/Swift/Kotlin 代码，类型安全无需手动序列化
```

**Add-to-App（在现有原生应用中嵌入 Flutter）：**

```swift
// iOS：将 Flutter 模块作为 Framework 引入
let flutterEngine = FlutterEngine(name: "my_engine")
flutterEngine.run()

let flutterVC = FlutterViewController(engine: flutterEngine, nibName: nil, bundle: nil)
present(flutterVC, animated: true)
```

```kotlin
// Android：FlutterFragment 或 FlutterActivity
val flutterFragment = FlutterFragment
    .withCachedEngine("my_engine")
    .build<FlutterFragment>()

supportFragmentManager.beginTransaction()
    .replace(R.id.container, flutterFragment)
    .commit()
```

---

## 19. 性能优化（Flutter）

### Q19.1: Flutter 性能优化全面指南

**答：**

```dart
// 1. 减少 rebuild 范围
// ❌ 整个页面因一个计数器重建
class _PageState extends State<Page> {
  int count = 0;
  Widget build(context) {
    return Column(children: [
      ExpensiveHeader(),    // 不需要重建
      Text('$count'),       // 需要重建
      ExpensiveFooter(),    // 不需要重建
    ]);
  }
}

// ✅ 拆分为独立 Widget
class CounterText extends StatefulWidget { ... }
// 或使用 ValueListenableBuilder
ValueListenableBuilder<int>(
  valueListenable: counter,
  builder: (context, value, child) => Text('$value'),
)

// 2. const 构造函数
const SizedBox(height: 16)  // 编译期创建，可复用
const EdgeInsets.all(8)
const TextStyle(fontSize: 14)

// 3. ListView 优化
ListView.builder(
  itemCount: 10000,
  itemExtent: 72,          // 固定高度，跳过布局计算
  itemBuilder: (ctx, i) => ItemTile(items[i]),
)

// 4. 图片优化
Image.asset('photo.png', cacheWidth: 200)  // 降采样
CachedNetworkImage(imageUrl: url)          // 缓存网络图片

// 5. 动画性能
AnimatedBuilder(
  animation: controller,
  child: const ExpensiveChild(),  // 缓存不变的子树
  builder: (ctx, child) => Transform.scale(
    scale: controller.value,
    child: child,  // 复用
  ),
)

// 6. Shader 预热（Impeller 已大幅缓解）
// 收集 SkSL → 编译时打包
// flutter run --profile --cache-sksl --purge-persistent-cache
// flutter build apk --bundle-sksl-path flutter_01.sksl.json

// 7. 使用 DevTools 分析
// flutter run --profile
// 打开 DevTools → Performance → 分析帧耗时
```

---

# 第四部分：跨平台通用

## 20. 网络与安全

### Q20.1: HTTPS、证书固定（Certificate Pinning）和网络安全最佳实践

**答：**

```
TLS 握手过程：
Client ──→ ClientHello（支持的密码套件）──→ Server
Client ←── ServerHello + 证书 ←── Server
Client 验证证书链 → 信任 CA → 建立加密连接
```

**证书固定（Certificate Pinning）：**

```swift
// iOS：使用 URLSession 实现
class PinningDelegate: NSObject, URLSessionDelegate {
    let pinnedHashes: Set<String> = ["sha256/BBBBBBBBB..."]

    func urlSession(_ session: URLSession,
                    didReceive challenge: URLAuthenticationChallenge,
                    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        guard let serverTrust = challenge.protectionSpace.serverTrust,
              let certificate = SecTrustGetCertificateAtIndex(serverTrust, 0) else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }

        let serverHash = sha256(SecCertificateCopyData(certificate) as Data)
        if pinnedHashes.contains(serverHash) {
            completionHandler(.useCredential, URLCredential(trust: serverTrust))
        } else {
            completionHandler(.cancelAuthenticationChallenge, nil)
        }
    }
}
```

```kotlin
// Android：OkHttp 证书固定
val client = OkHttpClient.Builder()
    .certificatePinner(CertificatePinner.Builder()
        .add("api.example.com", "sha256/BBBBBBBBB...")
        .add("api.example.com", "sha256/backup-pin...")  // 备用 pin
        .build())
    .build()
```

```xml
<!-- Android：Network Security Config（推荐） -->
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.example.com</domain>
        <pin-set expiration="2025-12-31">
            <pin digest="SHA-256">base64-encoded-hash</pin>
            <pin digest="SHA-256">backup-pin-hash</pin>
        </pin-set>
    </domain-config>
</network-security-config>
```

**安全存储：**

| 平台 | 安全存储方案 | 用途 |
|------|------------|------|
| iOS | Keychain | Token、密码、证书 |
| Android | EncryptedSharedPreferences / Keystore | Token、敏感配置 |
| Flutter | flutter_secure_storage（底层用 Keychain/Keystore）| 跨平台安全存储 |

```kotlin
// Android EncryptedSharedPreferences
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val prefs = EncryptedSharedPreferences.create(
    context, "secret_prefs", masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
prefs.edit().putString("auth_token", token).apply()
```

---

### Q20.2: 移动端常见安全威胁与防护

**答：**

| 威胁 | 防护措施 |
|------|---------|
| 中间人攻击（MITM） | 证书固定、TLS 1.3 |
| 逆向工程 | 代码混淆（ProGuard/R8）、防调试检测 |
| 数据泄露 | 加密存储、不在日志中打印敏感信息 |
| 越狱/Root 检测 | Jailbreak/Root 检测 + 降级功能 |
| 不安全的 WebView | 禁用 JavaScript（除非必要）、验证 URL scheme |
| 剪贴板泄露 | 敏感字段禁止复制、清除剪贴板 |
| 截屏泄露 | `FLAG_SECURE`（Android）、`applicationDidEnterBackground` 遮挡（iOS） |

```swift
// iOS 防截屏
func applicationWillResignActive(_ application: UIApplication) {
    let blurView = UIVisualEffectView(effect: UIBlurEffect(style: .light))
    blurView.tag = 999
    window?.addSubview(blurView)
}
```

```kotlin
// Android 防截屏
window.setFlags(
    WindowManager.LayoutParams.FLAG_SECURE,
    WindowManager.LayoutParams.FLAG_SECURE
)
```

---

## 21. CI/CD 与发布

### Q21.1: 移动端 CI/CD 流水线设计

**答：**

```yaml
# 典型流水线（以 GitHub Actions 为例）
# .github/workflows/mobile.yml

name: Mobile CI/CD

on:
  pull_request:
    branches: [main]
  push:
    tags: ['v*']

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      # Flutter
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test --coverage

      # iOS
      - run: xcodebuild test -workspace App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15'

      # Android
      - run: ./gradlew test
      - run: ./gradlew lint

  build-ios:
    needs: test
    runs-on: macos-latest
    if: startsWith(github.ref, 'refs/tags/')
    steps:
      - run: flutter build ipa --release --export-options-plist=ExportOptions.plist
      - uses: apple-actions/upload-testflight-build@v1

  build-android:
    needs: test
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')
    steps:
      - run: flutter build appbundle --release
      - uses: r0adkll/upload-google-play@v1
        with:
          track: internal
```

**代码签名管理：**

| 平台 | 方案 | 说明 |
|------|------|------|
| iOS | fastlane match | 集中管理证书和 Provisioning Profile |
| Android | Play App Signing | Google 管理签名密钥 |
| 通用 | CI 环境变量 + Secrets | 不在代码中存储密钥 |

---

## 22. 架构设计与系统设计

### Q22.1: 如何设计一个离线优先（Offline-First）的移动应用？

**答：**

```
┌────────────────────────────────────────────────┐
│                   UI Layer                      │
│    展示数据（始终从本地数据库读取）                │
├────────────────────────────────────────────────┤
│                Repository Layer                 │
│  ┌──────────┐    ┌─────────────┐               │
│  │ Local DB  │←──│ Sync Engine │               │
│  │ (Room/    │   │             │               │
│  │  SQLite/  │──→│ Conflict    │               │
│  │  Hive)    │   │ Resolution  │               │
│  └──────────┘    └──────┬──────┘               │
│                         │                       │
│                  ┌──────▼──────┐               │
│                  │  Remote API  │               │
│                  └─────────────┘               │
└────────────────────────────────────────────────┘
```

```kotlin
// Repository：先写本地，后台同步
class TodoRepository(
    private val dao: TodoDao,
    private val api: TodoApi,
    private val syncManager: SyncManager
) {
    // 读取：始终从本地
    fun observeTodos(): Flow<List<Todo>> = dao.observeAll()

    // 写入：先本地，然后排队同步
    suspend fun addTodo(todo: Todo) {
        val localTodo = todo.copy(syncStatus = SyncStatus.PENDING)
        dao.insert(localTodo)
        syncManager.enqueueSync(localTodo.id)
    }

    // 同步引擎
    suspend fun sync() {
        // 1. 上传本地未同步的变更
        val pending = dao.getPendingSyncItems()
        for (item in pending) {
            try {
                api.upsert(item)
                dao.updateSyncStatus(item.id, SyncStatus.SYNCED)
            } catch (e: ConflictException) {
                resolveConflict(item, e.serverVersion)
            }
        }

        // 2. 拉取远程变更
        val lastSync = prefs.lastSyncTimestamp
        val remoteChanges = api.getChangesSince(lastSync)
        dao.upsertAll(remoteChanges)
        prefs.lastSyncTimestamp = System.currentTimeMillis()
    }
}
```

**冲突解决策略：**
- **Last Write Wins**：最后修改时间戳大的胜出（简单但可能丢数据）
- **Server Wins**：服务器版本始终优先
- **Client Wins**：客户端版本始终优先
- **Manual Merge**：提示用户手动解决冲突
- **CRDT**：无冲突复制数据类型（适合协作编辑）

---

### Q22.2: 移动端如何实现推送通知系统？

**答：**

```
┌─────────┐    ┌──────────┐    ┌──────────────┐    ┌────────────┐
│ Backend  │───→│ Push     │───→│ APNs / FCM   │───→│ Mobile App │
│ Server   │    │ Service  │    │              │    │            │
└─────────┘    └──────────┘    └──────────────┘    └────────────┘
```

```swift
// iOS：APNs 注册
func application(_ application: UIApplication,
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
        guard granted else { return }
        DispatchQueue.main.async { application.registerForRemoteNotifications() }
    }
    return true
}

func application(_ application: UIApplication,
                 didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    let token = deviceToken.map { String(format: "%02x", $0) }.joined()
    api.registerPushToken(token)
}

// 处理推送
extension AppDelegate: UNUserNotificationCenterDelegate {
    // 前台收到通知
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound])
    }

    // 用户点击通知
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        handleDeepLink(from: userInfo)
        completionHandler()
    }
}
```

```kotlin
// Android：FCM
class MyFirebaseService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        api.registerPushToken(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // 数据消息（自定义处理）
        remoteMessage.data["type"]?.let { type ->
            when (type) {
                "chat" -> showChatNotification(remoteMessage.data)
                "order" -> showOrderNotification(remoteMessage.data)
            }
        }

        // 通知消息（系统自动显示）
        remoteMessage.notification?.let { notification ->
            showNotification(notification.title, notification.body)
        }
    }

    private fun showNotification(title: String?, body: String?) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE)

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        NotificationManagerCompat.from(this).notify(NOTIFICATION_ID, notification)
    }
}
```

```dart
// Flutter：使用 firebase_messaging
FirebaseMessaging.instance.requestPermission();

FirebaseMessaging.instance.getToken().then((token) {
  api.registerPushToken(token!);
});

// 前台消息
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  showLocalNotification(message);
});

// 后台/终止态 点击通知
FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
  navigateToScreen(message.data);
});
```

---

### Q22.3: 如何设计一个高效的图片加载框架？

**答：**

```
请求 URL
   ↓
┌──────────────┐
│ 内存缓存      │ → 命中 → 返回
│ (LRU Cache)  │
└──────┬───────┘
       ↓ 未命中
┌──────────────┐
│ 磁盘缓存      │ → 命中 → 解码 → 存入内存缓存 → 返回
│ (文件系统)    │
└──────┬───────┘
       ↓ 未命中
┌──────────────┐
│ 网络请求      │ → 下载 → 存入磁盘缓存 → 解码 → 存入内存缓存 → 返回
│ (HTTP)       │
└──────────────┘
```

**各平台常用方案：**

| 平台 | 框架 | 特点 |
|------|------|------|
| iOS | Kingfisher / SDWebImage / Nuke | 自动缓存、降采样、动画 |
| Android | Coil / Glide | 生命周期感知、协程支持 |
| Flutter | cached_network_image | 内存+磁盘缓存 |

```kotlin
// Android Coil 示例
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/photo.jpg")
        .crossfade(true)
        .size(200, 200)           // 降采样到指定尺寸
        .memoryCachePolicy(CachePolicy.ENABLED)
        .diskCachePolicy(CachePolicy.ENABLED)
        .build(),
    contentDescription = null,
    modifier = Modifier.size(200.dp),
    placeholder = painterResource(R.drawable.placeholder),
    error = painterResource(R.drawable.error),
)
```

**关键设计考量：**
- **内存缓存大小**：通常为可用内存的 1/8
- **磁盘缓存大小**：通常 50-250MB
- **图片降采样**：根据 ImageView 实际尺寸解码，避免全尺寸解码浪费内存
- **请求合并**：相同 URL 的并发请求合并为一个
- **优先级管理**：可见区域的图片优先加载
- **生命周期绑定**：页面销毁时取消请求

---

### Q22.4: 设计一个聊天应用的消息系统（WebSocket + 本地存储）

**答：**

```
┌────────────────────────────────────────────────────────────┐
│                     Chat Architecture                       │
│                                                            │
│   UI Layer                                                 │
│   ├── MessageList (observe local DB)                       │
│   └── MessageInput → send()                                │
│                                                            │
│   Domain Layer                                             │
│   └── ChatRepository                                       │
│       ├── observeMessages() → Flow<List<Message>>          │
│       ├── sendMessage(text) → optimistic insert            │
│       └── syncMessages() → pull missing                    │
│                                                            │
│   Data Layer                                               │
│   ├── WebSocketManager (实时消息收发)                       │
│   ├── MessageDao (本地持久化)                               │
│   └── ChatApi (HTTP 补充：历史消息、文件上传)               │
└────────────────────────────────────────────────────────────┘
```

```kotlin
// 消息模型
@Entity
data class Message(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val chatId: String,
    val senderId: String,
    val text: String,
    val timestamp: Long,
    val status: MessageStatus = MessageStatus.SENDING
)

enum class MessageStatus { SENDING, SENT, DELIVERED, READ, FAILED }

// WebSocket 管理
class WebSocketManager(private val dao: MessageDao) {
    private var socket: WebSocket? = null
    private val _connectionState = MutableStateFlow(ConnectionState.DISCONNECTED)

    fun connect() {
        val request = Request.Builder().url("wss://chat.example.com/ws").build()
        socket = okHttpClient.newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                val message = json.decodeFromString<Message>(text)
                scope.launch { dao.insert(message) }  // 收到消息存入本地
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                _connectionState.value = ConnectionState.DISCONNECTED
                reconnectWithBackoff()  // 指数退避重连
            }
        })
    }

    // 指数退避重连
    private fun reconnectWithBackoff() {
        scope.launch {
            var delay = 1000L
            repeat(10) {
                delay(delay)
                try { connect(); return@launch }
                catch (e: Exception) { delay = minOf(delay * 2, 30_000L) }
            }
        }
    }

    fun send(message: Message) {
        socket?.send(json.encodeToString(message))
    }
}

// Repository：乐观更新
class ChatRepository(
    private val dao: MessageDao,
    private val wsManager: WebSocketManager
) {
    fun observeMessages(chatId: String): Flow<List<Message>> =
        dao.observeMessages(chatId)

    suspend fun sendMessage(chatId: String, text: String) {
        val message = Message(
            chatId = chatId,
            senderId = currentUserId,
            text = text,
            timestamp = System.currentTimeMillis(),
            status = MessageStatus.SENDING
        )

        // 乐观插入：先显示在 UI 上
        dao.insert(message)

        try {
            wsManager.send(message)
            dao.updateStatus(message.id, MessageStatus.SENT)
        } catch (e: Exception) {
            dao.updateStatus(message.id, MessageStatus.FAILED)
        }
    }
}
```

---

## 附录：高频面试知识点速查

### iOS 核心

| 主题 | 关键词 |
|------|--------|
| Swift 语言 | struct vs class、POP、enum 关联值、some/any、@propertyWrapper |
| 内存管理 | ARC、weak/unowned、闭包 capture list、autoreleasepool |
| SwiftUI | @State/@StateObject/@ObservedObject、声明式 UI、body 重算 |
| 并发 | async/await、Actor/@MainActor、Sendable、TaskGroup |
| 性能 | Instruments、离屏渲染、图片降采样、启动优化 |
| 系统 | RunLoop、App Lifecycle、Scene、Background Task |

### Android 核心

| 主题 | 关键词 |
|------|--------|
| Kotlin 语言 | data/sealed/object class、作用域函数、委托、inline/reified |
| 组件 | Activity/Fragment 生命周期、ViewModel、配置变更 |
| Compose | Recomposition、remember、derivedStateOf、Stability |
| Coroutines | 结构化并发、Flow 冷热流、StateFlow/SharedFlow |
| Jetpack | Room、Hilt、WorkManager、Navigation、Paging |
| 性能 | Baseline Profile、LeakCanary、R8、Macrobenchmark |

### Flutter 核心

| 主题 | 关键词 |
|------|--------|
| Dart 语言 | Null Safety、Isolate、事件循环、Records/Patterns |
| 渲染 | 三棵树、Constraints、RepaintBoundary、Impeller |
| 状态管理 | BLoC vs Riverpod、InheritedWidget 原理 |
| 平台通信 | MethodChannel/EventChannel/FFI、Pigeon |
| 性能 | const Widget、ListView.builder、AnimatedBuilder child |

### 跨平台通用

| 主题 | 关键词 |
|------|--------|
| 网络 | HTTPS/TLS、证书固定、安全存储 |
| 架构 | Clean Architecture、单向数据流、离线优先 |
| 系统设计 | 推送通知、图片缓存、WebSocket 聊天 |
| CI/CD | 自动化测试、代码签名、分发 |
