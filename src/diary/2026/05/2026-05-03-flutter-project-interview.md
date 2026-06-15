---
date: 2026-05-03T10:20:00+08:00
title: "Flutter 项目面试准备 — 重点与难点"
slug: flutter-project-interview
description: "基于真实跨境电商和 iPad 批发管理系统项目的技术总结与面试准备。"
---

> 基于 **AIRBS Wholesale**（C端批发采购App）和 **YesShop Business HD**（B端iPad批发管理系统）两个真实项目的技术总结。

---

## 一、项目概览（开场介绍用）

### AIRBS Wholesale（v3.4.0）
- **定位**：B2B 批发电商移动端，面向采购商
- **核心功能**：商品浏览/搜索、购物车、销售订单、报价单、优惠券、QR扫码、多语言（英/中/西/意）
- **技术栈**：Flutter + GetX + Dio + SharedPreferences + json_serializable

### YesShop Business HD（v7.0.0）
- **定位**：iPad 端批发业务管理系统，面向业务员/仓管
- **核心功能**：商品管理、采购/销售订单、报价单、WMS仓储、ESL电子价签、PDA扫码枪、相机拍照
- **技术栈**：Flutter + GetX + Dio + Drift(SQLite) + SharedPreferences + json_serializable
- **亮点**：同一套代码适配手机和 iPad 两种尺寸

---

## 二、架构设计（面试高频问题）

### Q: 项目整体架构是怎么设计的？

**回答要点：**

```
lib/
├── common/          # 全局状态、路由、事件总线
├── runtime/         # 基础设施：HTTP、Auth、Language、枚举
├── config/          # 环境配置（develop/test/release）
├── domains/         # 业务层：Service + Model + Command
│   ├── service/     # 18个领域服务（ProductService, CartService...）
│   ├── model/       # 数据模型（38+ @JsonSerializable 类）
│   └── command/     # 命令模式处理写操作
├── modules/         # 功能页面（19个模块，每个含 Controller + View）
├── components/      # 可复用业务组件
└── ui/              # 基础 UI 组件库（按钮、表单、对话框、骨架屏...）
```

**关键设计决策：**

| 层级 | 职责 | 说明 |
|------|------|------|
| **UI 层** | 纯展示 | Widget 只负责渲染，不含业务逻辑 |
| **Controller 层** | 页面逻辑 | 继承 `GetxController`，管理页面状态和交互 |
| **Service 层** | 业务逻辑 | 封装 API 调用和数据处理，与 UI 解耦 |
| **Model 层** | 数据定义 | `@JsonSerializable` + code gen，保证序列化一致性 |

**可以深入展开的点：**
- 为什么选 GetX 而不是 BLoC/Riverpod → 项目偏 CRUD 型业务，GetX 的路由+状态+DI 一体化开发效率高
- Service 层的设计 → 每个业务领域一个 Service，通过 `Get.lazyPut()` 懒加载注入，按需初始化

---

## 三、重点难点及解决方案

### 难点 1：购物车状态管理与多端同步

**问题描述：**
购物车是核心模块，涉及多种复杂计算和状态同步：
- 商品有多种包装规格（箱/包/个），切换规格时需要合并或拆分
- 数量变化触发实时价格计算（单价 × 数量 × 包装倍率）
- 重量/体积需要单位换算后聚合
- 优惠券折扣叠加计算
- 用户快速操作时防止频繁请求后端

**解决方案：**

```dart
// 1. CartState 单例 + Rx 响应式
class CartState {
  final cartItems = RxList<CartItemVdto>([]);
  final totalAmount = 0.0.obs;
  final totalWeight = 0.0.obs;
  
  // 2. 防抖同步：250ms 内的多次数量变更只触发一次后端请求
  void onQuantityChanged(String itemId, int qty) {
    _updateLocalState(itemId, qty);      // 立即更新本地
    _debouncer.run(() => _syncToServer()); // 防抖同步后端
  }
  
  // 3. 聚合计算：单位换算 + 折扣
  void calcSumInfo() {
    totalWeight.value = cartItems.sumBy((x) =>
      UnitUtils.weightConvert(targetUnit, x.weightUnit, x.weight * x.quantity));
    
    final discounted = amount * (100 - discountRate) / 100;
    totalAmount.value = discounted;
  }
}
```

**YesShop HD 额外难点 — 离线购物车：**
- 使用 **Drift ORM (SQLite)** 做本地持久化，断网时也能操作购物车
- `CartSubTable` 存储明细，重新联网后批量同步
- 去重逻辑：相同商品+相同规格 → 合并数量而非新增行

**面试话术：**
> "购物车是整个系统最复杂的状态模块。难点在于实时计算（价格、重量、体积的单位换算）和前后端同步。我用 GetX 的 Rx 响应式做本地即时更新，配合 250ms 防抖避免频繁请求。YesShop 项目因为有离线场景，额外用 Drift 做了 SQLite 持久化，保证断网可用。"

---

### 难点 2：iPad + 手机双端适配（YesShop HD）

**问题描述：**
同一套代码需要适配 iPad（1024×1366）和手机（375×812），布局差异很大：
- iPad 用多列布局，手机用单列
- 字体大小、间距、图标尺寸都不同
- 部分页面 iPad 有侧边栏，手机没有

**解决方案：**

```dart
// 1. 基于 flutter_screenutil 的双端适配
ScreenUtils.isPad  // 运行时判断设备类型

// 2. 封装适配函数
double fitW(double phoneValue, double padValue) {
  return ScreenUtils.isPad ? padValue.w : phoneValue.w;
}

// 3. 不同设计稿尺寸初始化
ScreenUtil.init(context,
  designSize: ScreenUtils.isPad 
    ? const Size(1024, 1366)  // iPad
    : const Size(375, 812),    // iPhone
);

// 4. 资源文件分目录管理
// assets/phone/  → 手机端图片
// assets/pad/    → iPad端图片
```

**面试话术：**
> "YesShop 最大的挑战之一是一套代码同时跑在 iPad 和手机上。我们用 `flutter_screenutil` 配合自定义的 `fitW()` 函数做尺寸适配，通过 `ScreenUtils.isPad` 在运行时决定布局策略。对于布局差异大的页面，用条件渲染切换多列/单列。图片资源也按设备类型分目录管理，避免 iPad 上图片模糊。"

---

### 难点 3：PDA 扫码枪硬件集成（YesShop HD）

**问题描述：**
业务员使用 PDA 手持终端（带物理扫码键），需要：
- 识别多种 PDA 品牌（CRUISE、AUTOID、MT5）
- 监听硬件扫码按键事件
- 扫码结果要根据当前所在页面路由到不同处理逻辑

**解决方案：**

```dart
// 1. Platform Channel 与原生通信
static const pdaScanChannel = MethodChannel('pdaScanChannel');

// 2. 设备识别 — 通过 manufacturer 字段判断 PDA 型号
bool isPdaDevice = ['CRUISE', 'AUTOID', 'MT5']
    .contains(deviceInfo.manufacturer.toUpperCase());

// 3. Android 端 BroadcastReceiver 接收扫码数据
// 原生层注册广播接收器，扫到条码后通过 Channel 传给 Flutter

// 4. 路由感知的扫码订阅
// 根据当前页面路由，决定扫码结果的处理方式：
// - 商品页 → 查询商品
// - 库存页 → 查找库位
// - 订单页 → 匹配订单号
```

**面试话术：**
> "YesShop 需要对接 PDA 扫码枪，这是典型的 Platform Channel 实战场景。Android 端通过 BroadcastReceiver 监听硬件扫码事件，再通过 MethodChannel 传给 Flutter。难点是同一个扫码入口要根据当前页面路由分发到不同业务逻辑，我设计了一个基于路由的订阅者模式，每个页面注册自己的扫码回调，离开页面时自动取消。"

---

### 难点 4：网络层封装与统一错误处理

**问题描述：**
两个项目共 30+ 个 Service，几百个 API 接口，需要统一管理：
- 请求头动态注入（token、语言、时区、公司ID、区域ID）
- 登录过期自动跳转
- Loading 弹窗统一控制
- 分页请求的通用封装
- 文件上传（单张/多张图片）

**解决方案：**

```dart
class Http {
  static final Dio _dio = Dio(BaseOptions(
    connectTimeout: Duration(seconds: 20),
    receiveTimeout: Duration(seconds: 25),
  ));

  // 动态请求头
  static Map<String, String> get _headers => {
    'ide': Auth.identity,          // 登录 token
    'lang': Lang.current.apiCode,   // 语言代码
    'corp': AppContext.corpId,      // 公司ID
    'area': AppContext.areaCorpId,  // 区域ID
    'offset_hours': timezone,       // 时区偏移
    'type': '3',                    // 终端类型
  };

  // 统一响应处理
  static Future<HttpResult<T>> post<T>(String url, {
    Map<String, dynamic>? data,
    bool showLoading = false,
    T Function(dynamic)? fromJson,
  }) async {
    if (showLoading) DialogUtils.showLoading();
    try {
      final response = await _dio.post(url, data: data);
      final result = HttpResult<T>.fromJson(response.data, fromJson);
      
      // 登录过期统一拦截
      if (result.errorCode == HttpErrorCode.loginExpired) {
        _redirectToLogin();
      }
      return result;
    } on DioException catch (e) {
      return HttpResult.error(e.message);
    } finally {
      if (showLoading) DialogUtils.dismiss();
    }
  }

  // 分页请求封装
  static Future<PagedResult<T>> paged<T>(...) { ... }
  
  // 图片上传
  static Future<HttpResult<T>> uploadImage(File file) { ... }
  static Future<HttpResult<List<T>>> multiUploadImage(List<File> files) { ... }
}
```

**面试话术：**
> "我封装了一个统一的 Http 工具类，基于 Dio，所有请求自动注入动态 header（token、语言、时区等）。核心设计是 `HttpResult<T>` 泛型响应包装，配合 fromJson 工厂方法实现类型安全的反序列化。对于登录过期（errorCode 1003/1004）做了全局拦截自动跳转登录页。还封装了 `paged<T>()` 方法统一处理分页逻辑，避免每个列表页重复写分页代码。"

---

### 难点 5：多语言方案设计与维护

**问题描述：**
- AIRBS 支持 4 种语言（英/中/西/意），YesShop 支持 3 种（英/中/西）
- 语言需要运行时切换，且持久化到本地
- API 请求头也要同步当前语言
- 枚举值、单位名称等也需要国际化

**解决方案：**

```dart
// 1. 自定义 L 类 — 编译时类型安全
class L {
  final String en;
  final String zh;
  final String es;
  final String it;
  
  const L({required this.en, required this.zh, required this.es, required this.it});
  
  // 根据当前语言返回对应文本
  String get tr => switch (Lang.current) {
    Language.en => en,
    Language.zh => zh,
    Language.es => es,
    Language.it => it,
  };
}

// 2. 每个模块定义自己的 locals
final _locals = (
  msgConfirmClear: L(en: 'Clear cart?', zh: '清空购物车？', es: '¿Vaciar carrito?', it: 'Svuotare?'),
  btnCheckout: L(en: 'Checkout', zh: '结算', es: 'Pagar', it: 'Pagare'),
);

// 3. 使用
Text(_locals.msgConfirmClear.tr)

// 4. 语言切换 — 通知全局
Lang.changeTo(Language.en);
// → 持久化到 SharedPreferences
// → Get.updateLocale() 更新 Material 组件语言
// → EventBus 发送 LanguageChangeEvent
// → API 请求头自动切换
```

**面试话术：**
> "我们没用 ARB 文件或第三方国际化包，而是自定义了一个 `L` 类，每个翻译项是编译时常量，通过 `.tr` getter 根据当前语言返回对应文本。好处是类型安全、IDE 自动补全、重构友好。切换语言时通过 EventBus 广播，同时更新 SharedPreferences 持久化、GetX locale、和 API 请求头，保证全链路一致。"

---

### 难点 6：商品可售性判断的复杂业务逻辑

**问题描述：**
一个商品是否可以售卖，取决于 5 个条件同时满足：

```
1. 商品启用状态 (enabled = true)
2. 至少有一个可售包装规格
3. 平台销售标志开启
4. 库存数量 > 0
5. 售价 > 0
```

还有更复杂的定价策略：
- 基础价 + 数量阶梯价
- 特价商品（isSpecial + specialPrice）
- 清仓价 / 返场价
- 优惠券折扣叠加
- 按包装规格的倍率计算（1箱=12个，price × rate）

**面试话术：**
> "批发场景的定价逻辑比 C 端复杂很多。一个商品能不能卖要过 5 个校验，价格计算涉及包装倍率、阶梯价、特价、优惠券叠加。我在 Service 层统一封装了定价计算方法，Model 层用 `@JsonSerializable` 保证后端数据映射准确，避免前端自己拼凑计算逻辑导致金额不一致。"

---

### 难点 7：自定义数字键盘与表单交互（YesShop HD）

**问题描述：**
业务员在 iPad 上录入大量数字（数量、价格、重量），系统键盘体验差：
- 需要支持上一项/下一项快速跳转
- 小数点可选（数量不需要，价格需要）
- 输入时顶部实时显示当前值

**解决方案：**
- 自定义 `NumericKeyboard` 组件，替代系统键盘
- `NumericTextFieldManage` 管理焦点链，支持 Previous/Next/Done
- 路由感知 — 离开页面自动关闭键盘、清理焦点

**面试话术：**
> "iPad 上录入大量数字时系统键盘体验很差，所以我们做了自定义数字键盘。难点不在键盘本身，而是焦点管理——多个输入框之间的 Previous/Next 跳转、页面切换时的自动清理。我用了一个 `NumericTextFieldManage` 统一管理焦点链，配合路由监听做生命周期清理。"

---

## 四、性能优化（面试加分项）

### 可以聊的优化点

| 优化项 | 做法 | 效果 |
|--------|------|------|
| **图片加载** | `cached_network_image` + `flutter_cache_manager` 二级缓存 | 减少重复网络请求，列表滑动流畅 |
| **图片上传** | 上传前压缩（quality 90%，min 800×800） | 减少上传时间和带宽 |
| **列表分页** | `RefreshPagingListController` 封装分页+下拉刷新+上拉加载 | 首屏快，按需加载 |
| **骨架屏** | 自定义 `ShimmerWidget` + `AnimationController.unbounded()` | 提升感知性能，替代白屏等待 |
| **防抖** | 购物车数量变更 250ms 防抖 | 避免频繁 API 调用 |
| **懒加载** | `Get.lazyPut()` 按需初始化 Service/Controller | 减少启动时间 |
| **文字缩放** | `TextScaler.linear(1.0)` 固定缩放比 | 防止系统字体放大导致布局错乱 |
| **屏幕适配** | `flutter_screenutil` + splitScreenMode | 不同设备一致体验 |

---

## 五、技术选型问题（面试常见追问）

### Q: 为什么选 GetX 而不是 BLoC？

> "两个项目都是业务驱动的 CRUD 应用，页面多、迭代快。GetX 的优势是路由、状态管理、依赖注入三合一，减少样板代码。BLoC 更适合状态流转复杂的场景，但对于我们这种以表单和列表为主的业务系统，GetX 的 `Obx` + `RxList` 开发效率更高。缺点是 GetX 的隐式依赖查找在大型项目中需要注意管理生命周期。"

### Q: 为什么 YesShop 要用 Drift 而 AIRBS 不用？

> "YesShop 是业务员使用的工具，有离线操作购物车的场景，需要本地持久化。Drift 提供类型安全的 SQL 操作和 schema migration，比直接用 sqflite 写 raw SQL 更可靠。AIRBS 是 C 端采购 App，网络环境稳定，用 SharedPreferences 存简单配置就够了。"

### Q: 网络层为什么选 Dio 而不是 http 包？

> "Dio 支持拦截器、请求取消、文件上传、超时配置，这些在业务项目中都是必须的。特别是拦截器机制，让我可以统一处理 token 注入、登录过期跳转、Loading 弹窗，不用在每个 API 调用处重复写。"

---

## 六、可以主动提的亮点

1. **EventBus 跨模块通信** — 登录/登出、语言切换、区域切换等全局事件，用 EventBus 解耦模块间依赖
2. **Deep Linking** — AIRBS 支持 App Links，扫码/分享链接可直接跳转到商品详情页
3. **TabViewController 基类** — 封装了底部 Tab 页面的生命周期（激活/失活/首次加载/登录状态），子类只需关注业务
4. **RxFilter 响应式过滤器** — 支持变更追踪、默认值保存/恢复，用于复杂筛选场景
5. **多环境配置** — develop/test/release 三套环境，Host 配置从服务端动态获取，避免硬编码
6. **PDF 预览** — YesShop 支持在 App 内查看 PDF 文档（`flutter_pdfview`）
7. **Syncfusion 图表** — YesShop Dashboard 使用 Syncfusion Charts 展示业务数据可视化

---

## 七、项目数据（量化展示能力）

| 指标 | AIRBS Wholesale | YesShop Business HD |
|------|----------------|---------------------|
| 功能模块数 | 19 | 60+ 路由页面 |
| Service 数 | 18 | 20+ |
| 数据模型数 | 38+ | 50+ |
| 支持语言 | 4（英/中/西/意） | 3（英/中/西） |
| 设备适配 | 手机 | 手机 + iPad |
| 本地数据库 | 无 | Drift (SQLite) |
| 硬件对接 | QR 扫码 | QR 扫码 + PDA 扫码枪 + 相机 |
| 当前版本 | v3.4.0 | v7.0.0 |

---

## 八、面试万能回答模板

当面试官问 **"讲一个你遇到的难点，是怎么解决的"** 时，用 **STAR 法则**：

```
Situation（背景）: 在 XXX 项目中，我们需要实现 XXX 功能...
Task（任务）:      难点在于 XXX，因为 XXX...
Action（行动）:    我的解决方案是 XXX，具体做了以下几步...
Result（结果）:    最终实现了 XXX，效果是 XXX...
```

**示例：**

> **S**: 在 YesShop Business HD 项目中，我们需要同一套 Flutter 代码同时运行在 iPad 和手机上。
> **T**: 难点在于两种设备的屏幕尺寸差异巨大，iPad 适合多列布局，手机适合单列，而且字体、间距、图片都需要差异化。
> **A**: 我基于 `flutter_screenutil` 封装了双端适配方案：用不同的设计稿尺寸初始化，写了 `fitW()` 等适配函数，通过 `ScreenUtils.isPad` 在运行时切换布局策略，图片资源按设备分目录管理。
> **R**: 最终一套代码成功适配两种设备，没有维护两个分支的成本，iPad 上的多列布局充分利用了大屏空间，用户体验良好。
