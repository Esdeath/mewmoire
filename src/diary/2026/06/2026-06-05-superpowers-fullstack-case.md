---
date: 2026-06-05T15:58:27+08:00
title: "用 Superpowers Skills 从立项到上线一个全栈项目的完整案例"
slug: superpowers-fullstack-case
description: "以一个读书打卡 App（Java 后端 + Vue 管理后台 + Flutter 移动端）为例，演示从立项、市场、需求、架构、设计、拆分到分端开发、联调、压测、调试、审查、安全、验证、部署、监控、复盘的完整生命周期，每个阶段如何显式调用 Superpowers Skills，配具体问答与命令。"
---

> 记录时间：2026-06-05 15:58:27

## 问题

我想用一个端到端的真实案例，把 Superpowers（以及 BMAD、ECC）的 Skills 串起来：假设要做一个包含 **前端 Vue、移动端 Flutter、后端 Java** 的项目，从立项一直到完整上线，每个阶段应该一步步 **显式调用** 哪些 Skill？最好有具体的提问和回答。

> 说明：下文所有 Skill 调用都用「显式调用」的方式呈现——即明确写出 `/skill-name` 或在对话里点名 `Skill: xxx`，并附上当时的提问（你说）与 Claude 的回答要点。示范项目代号 **ReadTogether（读书打卡社区）**：Java（Spring Boot）后端 + Vue3 管理后台/Web + Flutter 移动端。
>
> 这条链路刻意分成两段：**阶段 0–12 是「开发生命周期」**（想清楚 → 写出来），**阶段 13–23 是「交付与运维生命周期」**（验证 → 上线 → 守护 → 复盘）。很多人只做前半段，把「合并 PR」当成「上线」，这正是项目翻车的高发区。

---

## 阶段总览

| 阶段 | 目标 | 显式调用的 Skill |
| --- | --- | --- |
| 0 立项 | 把模糊想法变清晰 | `superpowers:brainstorming` |
| 1 市场 | 验证需求 / 看竞品 | `bmad-market-research` |
| 2 需求 | 产出 PRD | `bmad-create-prd` |
| 3 架构 | 三端技术架构 | `bmad-create-architecture` |
| 4 设计 | UX / 交互设计 | `bmad-ux` + `ecc:frontend-design-direction` |
| 5 拆分 | Epics & Stories | `bmad-create-epics-and-stories` |
| 6 隔离 | 建工作分支 | `superpowers:using-git-worktrees` |
| 7 计划 | 写实现计划 | `superpowers:writing-plans` |
| 8 建模 | 数据库迁移 | `ecc:database-migrations` |
| 9 后端 | Java TDD 开发 | `superpowers:test-driven-development` + `ecc:springboot-tdd` |
| 10 前端 | Vue 开发 | `ecc:nuxt4-patterns` + `frontend-design:frontend-design` |
| 11 移动端 | Flutter 开发 | `ecc:dart-flutter-patterns` + `ecc:flutter-test` |
| 12 加速 | 并行三端 | `superpowers:dispatching-parallel-agents` |
| 13 联调 | 端到端 E2E 测试 | `ecc:e2e-testing` + `bmad-qa-generate-e2e-tests` |
| 14 压测 | 性能与负载 | `ecc:benchmark` + `ecc:latency-critical-systems` |
| 15 调试 | 定位线上 bug | `superpowers:systematic-debugging` |
| 16 审查 | 代码评审 | `superpowers:requesting-code-review` + `ecc:code-review` |
| 17 安全 | 安全审查 | `ecc:security-review` |
| 18 验证 | 宣称完成前自检 | `superpowers:verification-before-completion` |
| 19 合并 | 收尾合并 | `superpowers:finishing-a-development-branch` + `ecc:pr` |
| 20 部署 | CI/CD 与发布 | `ecc:deployment-patterns` + `ecc:docker-patterns` |
| 21 守护 | 监控与灰度回滚 | `ecc:canary-watch` + `ecc:production-audit` |
| 22 文档 | 文档交付 | `ecc:update-docs` |
| 23 复盘 | 迭代回顾 | `bmad-retrospective` + `ecc:learn` |

---

## 阶段 0 — 立项：先想后做

**你说：** 我想做一个「读书打卡」社区 App，能记录读书进度、打卡、和朋友互相督促。但说实话需求还很模糊，先别写代码。

**显式调用：**

```
/superpowers:brainstorming
```

**Claude 回答要点：**

brainstorming 是「先想后做」的流程性 Skill，它不会直接给方案，而是一次问一个问题、逼你把假设挖出来。对话大致是这样推进的：

- **它问：** 这个 App 的「一句话价值主张」是什么？谁会在什么场景下用它？
- **你答：** 上班族通勤路上读电子书，想有轻量的打卡 + 好友监督，不想要又重又社交化的产品。
- **它问：** 「监督」具体指什么？是好友能看到你的进度，还是有强提醒/惩罚机制？
- **你答：** 第一版只要好友能看到彼此的打卡日历 + 评论鼓励就够了。
- **它问：** 为什么需要原生移动端（Flutter）+ Web（Vue）两套？能不能先只做一端验证？

最终 brainstorming 帮我收敛出 **MVP 边界**：
- 核心闭环：登记书籍 → 每日打卡（页数/分钟）→ 好友动态流 → 评论。
- 移动端 Flutter 做用户主场景；Vue 先只做**运营管理后台**（书籍审核、用户管理、数据看板），不做 Web 端用户产品。
- 砍掉：积分商城、AI 荐书、付费会员——都进 backlog。

> 关键收获：brainstorming 的产出不是代码，而是一份「我们决定做什么 / 不做什么」的共识，这是后面所有阶段的输入。

---

## 阶段 1 — 市场：验证需求与竞品

**你说：** 在投入三端开发之前，先确认这个方向值不值得做——市场有多大、竞品怎么做、我们的差异点在哪。

**显式调用：**

```
/bmad-market-research
```

**Claude 回答要点：**

market-research 以分析师角色，结构化地帮你输出一份市场与竞品报告（落到 `docs/market-research.md`），避免「拍脑袋立项」：

- **市场规模与趋势：** 读书类 / 习惯打卡类 App 的用户体量、增长曲线、付费意愿。
- **竞品矩阵：** 微信读书、藏书馆、各类「habit tracker」——各自的核心卖点、定价、薄弱环节。
- **差异化定位：** 我们的切口是「**轻量 + 好友强督促**」，而不是「内容平台」或「纯个人工具」。
- **风险信号：** 社交督促类产品的留存高度依赖「好友密度」，冷启动是最大风险。

- **它问：** 竞品已经很多了，你的「好友督促」凭什么留住用户？冷启动阶段没有好友密度怎么办？
- **你答：** 第一版主打「小圈子共读」——3~5 人小组，靠真实关系链而非陌生人社交。把这条写进 PRD 的核心假设。

> 想更系统地做市场+用户调研，可改用 `/ecc:market-research`；要把调研结论转成对外材料，可接 `/ecc:investor-materials`。

---

## 阶段 2 — 需求：产出 PRD

**你说：** 共识有了，把它写成正式的产品需求文档（PRD），团队和后面的开发都要照着它做。

**显式调用：**

```
/bmad-create-prd
```

**Claude 回答要点：**

bmad-create-prd 会以 PM 的角色，结构化地引导你填出一份 PRD。它逐节追问并落盘成文件（通常是 `docs/prd.md`）：

```markdown
# ReadTogether PRD
## 1. 背景与目标
## 2. 目标用户与画像
## 3. 用户故事（按优先级 P0/P1/P2）
   - P0: 作为用户，我能添加在读书籍并每日打卡
   - P0: 作为用户，我能看到好友的打卡动态并评论
   - P1: 作为运营，我能在后台审核违规内容
## 4. 功能需求（FR）/ 非功能需求（NFR）
## 5. 验收标准 / 指标（次日留存、人均打卡天数）
## 6. 范围之外（Out of Scope）
```

- **它问：** P0 的验收标准是什么？比如「打卡」要不要支持补卡？
- **你答：** 当天 24 点前可补当日，不能补历史。
- 它把这条写进 FR-03 的验收标准里，避免开发阶段口头约定丢失。

> 也可以用 `/ecc:plan-prd` 走 ECC 体系的 PRD 流程，二选一即可。BMAD 更偏「敏捷文档资产」，ECC 更偏「直接驱动后续 plan」。

---

## 阶段 3 — 架构：三端技术设计

**你说：** PRD 定了，现在设计技术架构。后端 Java，管理后台 Vue，移动端 Flutter，三端怎么分层、怎么通信？

**显式调用：**

```
/bmad-create-architecture
```

**Claude 回答要点：**

它读取 `docs/prd.md`，以 Architect 角色产出 `docs/architecture.md`，包含：

- **系统上下文图**（C4 Level 1）：Flutter App / Vue Admin → API Gateway → Spring Boot 服务 → PostgreSQL + Redis。
- **技术选型表：**

  | 层 | 选型 | 理由 |
  | --- | --- | --- |
  | 后端 | Spring Boot 3 + JPA + PostgreSQL | 团队熟悉、生态成熟 |
  | 缓存 | Redis（动态流、计数） | 好友动态读多写少 |
  | 移动端 | Flutter + Riverpod | 一套代码双平台 |
  | 后台 | Vue3 + Nuxt + Pinia | 团队已有 Nuxt 站点经验 |
  | 通信 | REST + JWT，OpenAPI 契约先行 | 三端共享同一份 API 契约 |

- **关键决策记录（ADR）：** 为什么 REST 不上 GraphQL；为什么动态流用「写扩散 + Redis ZSet」。

- **它问：** 三端共用的 API 契约谁来定？建议 **契约先行**——先在后端用 OpenAPI/springdoc 定义接口，Flutter 和 Vue 据此生成客户端。
- **你答：** 同意，把「OpenAPI 契约作为三端 single source of truth」写进架构约束。

> 想给关键决策留痕，可额外调用 `/ecc:architecture-decision-records` 把每个 ADR 单独落盘。

---

## 阶段 4 — 设计：UX 与交互

**你说：** 架构定了，但前端/移动端不能上来就写代码。先把核心界面的交互和视觉方向定下来，避免开发完再返工。

**显式调用：**

```
/bmad-ux
/ecc:frontend-design-direction
```

**Claude 回答要点：**

bmad-ux 以 UX 设计师角色梳理信息架构、用户流程与关键界面；frontend-design-direction 负责定「视觉方向」（排版、间距、色彩、质感），让产品看起来专业、不像 AI 默认样式。产出 `docs/ux-spec.md`：

- **关键用户流程：** 注册 → 建/入共读小组 → 添加在读书籍 → 每日打卡 → 看好友动态 → 评论鼓励。
- **核心界面线框：** 打卡页（一键打卡 + 进度环）、好友动态流、打卡日历、运营后台审核台。
- **设计方向：** 安静克制的阅读感——大留白、衬线标题、低饱和强调色；用字重和留白区分层级，而不是大色块。
- **无障碍基线：** 对比度、可点区域尺寸、动态字号支持。

- **它问：** 「打卡」是 App 里最高频的动作，要不要做成首页一步可达、带即时正反馈（动效 + 连续天数）？
- **你答：** 要。打卡按钮放首页中心，打卡成功有日历点亮 + streak 自增动效。这条直接影响阶段 11 的 Flutter 实现。

> 设计稿/HTML 已经有了、要直接转成代码时，前端可用 `/ecc:ui-to-vue`，移动端参照 `/ecc:dart-flutter-patterns`。无障碍要做深可上 `/ecc:accessibility`。

---

## 阶段 5 — 拆分：Epics 与 Stories

**你说：** 架构和设计都有了，把它拆成可执行的开发任务。

**显式调用：**

```
/bmad-create-epics-and-stories
```

**Claude 回答要点：**

它把 PRD + 架构 + UX 拆成 Epic → Story 层级，每个 Story 带验收标准，落到 `docs/stories/`：

```
Epic 1: 账号与好友体系
  Story 1.1 手机号注册/登录（后端 JWT）
  Story 1.2 加好友 / 好友列表
Epic 2: 打卡核心闭环
  Story 2.1 添加在读书籍（后端 + Flutter）
  Story 2.2 每日打卡（含当日补卡规则 FR-03）
  Story 2.3 好友动态流（Redis 写扩散）
Epic 3: 运营后台
  Story 3.1 内容审核列表（Vue）
  Story 3.2 数据看板（Vue + 图表）
```

- **它问：** Story 2.3 涉及后端 + 移动端 + 可能的后台展示，要不要拆成「按端」的子任务？
- **你答：** 拆。每个 Story 内部再分 `后端 API`、`Flutter UI`、`联调` 三步，方便并行。

> 单条 Story 临开发前可用 `/bmad-create-story` 细化成「开发就绪」状态（含技术上下文、文件清单）。

---

## 阶段 6 — 隔离环境：开工作分支

**你说：** 准备开发 Epic 2（打卡闭环），别污染主分支。

**显式调用：**

```
/superpowers:using-git-worktrees
```

**Claude 回答要点：**

using-git-worktrees 建议为这个 Epic 起一个独立 worktree，让三端代码改动隔离、可随时丢弃：

```bash
git worktree add ../readtogether-epic2 -b feat/epic2-checkin
cd ../readtogether-epic2
```

这样后端、Flutter、Vue 的改动都在 `feat/epic2-checkin` 分支里，主分支保持干净，多任务并行时互不干扰。

---

## 阶段 7 — 写实现计划

**你说：** 先别写代码，把 Story 2.2「每日打卡」的实现步骤写成一份计划，我 review 后再执行。

**显式调用：**

```
/superpowers:writing-plans
```

**Claude 回答要点：**

writing-plans 产出一份**给「失忆的工程师」也能照做**的计划：每步都有明确动作、验证方式、完成标志。`docs/plans/story-2.2-checkin.md` 大致是：

```markdown
## Story 2.2 每日打卡 — 实现计划
### 数据库
0. 迁移：新增 checkin 表（user_id, book_id, pages, checkin_date, tz_offset）
### 后端（Spring Boot）
1. 写测试：CheckinServiceTest — 当日首次打卡成功
2. 写测试：当日补卡（24点前）成功；补历史日期 → 抛 BizException
3. 实现 CheckinService 使之通过
4. 暴露 POST /api/checkins，更新 OpenAPI 契约
### Flutter
5. 据更新后的 OpenAPI 重新生成 api client
6. 打卡按钮 → 调用 → 乐观更新本地状态
### 联调
7. 起后端 + 模拟器，跑通真实链路；验证补卡边界
### 验证标准
- 后端测试全绿；补历史日期返回 422；模拟器能看到打卡日历点亮
```

- **它问：** 「当日」是按服务器时区还是用户本地时区？这会影响补卡边界测试。
- **你答：** 按用户本地时区，请求带 `tzOffset`，测试要覆盖跨时区 case。计划据此补了一条测试项。

> 计划写好后，正式执行时可调用 `/superpowers:executing-plans`，它会逐条勾选、不允许跳步。

---

## 阶段 8 — 建模：数据库迁移

**你说：** 后端逻辑要落到 PostgreSQL，先把打卡相关的表结构用迁移管起来，别手改库。

**显式调用：**

```
/ecc:database-migrations
```

**Claude 回答要点：**

database-migrations 强调 schema 变更必须**版本化、可前进可回滚**，而不是在数据库里手动改表。它用 Flyway/Liquibase 风格生成迁移脚本（`src/main/resources/db/migration/`）：

```sql
-- V3__create_checkin.sql
CREATE TABLE checkin (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT      NOT NULL REFERENCES app_user(id),
    book_id       BIGINT      NOT NULL REFERENCES book(id),
    pages         INT         NOT NULL,
    checkin_date  DATE        NOT NULL,        -- 用户本地日期
    tz_offset_min INT         NOT NULL,        -- 本地 - UTC，分钟
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 同一用户同一天只能有一条，支撑「补卡」幂等
CREATE UNIQUE INDEX uq_checkin_user_date ON checkin(user_id, checkin_date);
-- 动态流按时间倒序读
CREATE INDEX idx_checkin_user_created ON checkin(user_id, created_at DESC);
```

- **它问：** `checkin_date` 用 `DATE` 而不带时区，但你的补卡规则依赖「用户本地当日」——是否需要把 `tz_offset` 一起持久化，否则事后无法复算边界？
- **你答：** 对，加 `tz_offset_min` 字段一起存。这条直接预防了阶段 15 那个时区 bug 的「数据层根因」。
- **它提醒：** 上线迁移要可回滚——每个 `Vx__up` 都要有对应回滚思路，生产环境严禁 `drop` 列不留备份。

> 迁移与后端代码强相关，本阶段常常和阶段 9 交替进行：先加迁移 → 再写依赖该表的测试与实现。

---

## 阶段 9 — 后端 Java：测试驱动开发

**你说：** 表结构有了，开始写后端打卡逻辑，严格 TDD。

**显式调用：**

```
/superpowers:test-driven-development
/ecc:springboot-tdd
```

**Claude 回答要点：**

TDD Skill 强制 **红 → 绿 → 重构**，先写失败的测试，绝不先写实现。springboot-tdd / java-coding-standards 提供 Spring Boot 的测试与代码规范。

**红（先写失败测试）：**

```java
@Test
void 当日补卡_24点前_应成功() {
    var cmd = new CheckinCommand(userId, bookId, 30, todayLocal);
    var result = checkinService.checkin(cmd);
    assertThat(result.status()).isEqualTo(CheckinStatus.DONE);
}

@Test
void 补历史日期_应抛业务异常() {
    var cmd = new CheckinCommand(userId, bookId, 30, yesterdayLocal);
    assertThatThrownBy(() -> checkinService.checkin(cmd))
        .isInstanceOf(BizException.class)
        .hasMessageContaining("CANNOT_BACKFILL");
}
```

跑测试 → 红（`CheckinService` 还不存在）。

**绿（最小实现让测试通过）：**

```java
public CheckinResult checkin(CheckinCommand cmd) {
    if (!cmd.date().isEqual(LocalDate.now(cmd.zone()))) {
        throw new BizException("CANNOT_BACKFILL");
    }
    var entity = checkinRepo.save(Checkin.from(cmd));
    redisFeed.fanout(cmd.userId(), entity); // 写扩散到好友动态
    return CheckinResult.done(entity.getId());
}
```

跑测试 → 绿。**重构** 阶段再抽出时区计算、补充 OpenAPI 注解。

- **它问（TDD 纪律）：** 你想直接加「连续打卡天数」字段，但当前没有对应失败测试——要不要先补测试？
- **你答：** 对，先写 `连续打卡天数_应正确累加()` 测试，再实现。坚持不写没有测试覆盖的逻辑。

> 后端写完可调用 `/ecc:springboot-verification` 或 `/ecc:java-review` 做一次专项检查。

---

## 阶段 10 — 前端 Vue：管理后台

**你说：** 后端审核接口好了，做 Story 3.1 运营后台的「内容审核列表」。

**显式调用：**

```
/ecc:nuxt4-patterns
/frontend-design:frontend-design
```

**Claude 回答要点：**

nuxt4-patterns 给出本项目（Nuxt + Pinia）的目录约定与数据获取范式；frontend-design 负责把界面做得专业、不像 AI 默认样式。

```vue
<!-- pages/admin/moderation.vue -->
<script setup lang="ts">
const { data, refresh } = await useFetch('/api/admin/moderation', {
  query: { status: 'pending' },
})
async function approve(id: string) {
  await $fetch(`/api/admin/moderation/${id}/approve`, { method: 'POST' })
  await refresh()
}
</script>
```

- **它问（frontend-design）：** 审核列表是高频操作界面，要不要支持键盘流（j/k 上下、a 通过、r 驳回）来提升运营效率？
- **你答：** 要，加键盘快捷键 + 批量选择。frontend-design 据此给出无障碍焦点管理与视觉层级建议（用留白和字重而非大色块区分状态）。

> 如果是把一张设计稿/HTML 转成 Vue 组件，可改用 `/ecc:ui-to-vue`。

---

## 阶段 11 — 移动端 Flutter：用户主场景

**你说：** 做 Flutter 端的打卡页，调阶段 9 的后端接口。

**显式调用：**

```
/ecc:dart-flutter-patterns
/ecc:flutter-test
```

**Claude 回答要点：**

dart-flutter-patterns 给出 Riverpod 状态管理与项目结构约定；flutter-test 负责 widget/单元测试。坚持「契约先行」：后端 OpenAPI 更新后，重新生成 Dart api client，再写 UI。

```dart
// 打卡控制器（Riverpod）
class CheckinController extends AsyncNotifier<CheckinState> {
  Future<void> checkin(int pages) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final res = await ref.read(apiProvider).checkin(
        CheckinRequest(pages: pages, tzOffset: localTzOffset()),
      );
      return CheckinState.done(res.streak); // 乐观更新连续天数
    });
  }
}
```

对应 widget 测试：

```dart
testWidgets('点击打卡按钮后日历当日点亮', (tester) async {
  await tester.pumpWidget(makeApp(overrides: [fakeApi]));
  await tester.tap(find.byKey(const Key('checkin_btn')));
  await tester.pumpAndSettle();
  expect(find.byKey(Key('cell_today_active')), findsOneWidget);
});
```

- **它问：** `tzOffset` 要和后端约定方向一致（你传的是「本地 - UTC」还是「UTC - 本地」？），否则跨时区补卡边界会差一天。
- **你答：** 统一为分钟数 `localToUtcMinutes`，并在联调时用一个 UTC+14 的假数据专门验证边界。

> 编译/依赖报错时调用 `/ecc:flutter-build`；提交前用 `/ecc:flutter-review` 做 Dart 代码评审。

---

## 阶段 12 — 加速：三端并行开发

**你说：** 三端任务相互独立，能不能并行推进省时间？

**显式调用：**

```
/superpowers:dispatching-parallel-agents
```

**Claude 回答要点：**

当后端 API 契约已冻结、三端任务彼此无依赖时，dispatching-parallel-agents 可以把后端、Vue、Flutter 三块分派给独立 subagent 并行执行，每个 agent 在自己的 worktree 里干活，最后汇总。

- **它提醒（关键纪律）：** 并行的前提是任务**真正独立**。如果 Flutter 依赖后端还没定的接口，就不能并行——会基于错误假设白干。所以必须等阶段 3 的 OpenAPI 契约确定后再 fan-out。
- **你答：** 后端契约已定稿，三端按契约各自实现，联调阶段再合。

> 若任务是「一个主线 + 多个探索分支」，也可考虑 `/superpowers:subagent-driven-development`。

---

## 阶段 13 — 联调：端到端 E2E 测试

**你说：** 三端各自的单元/widget 测试都绿了，但真实链路（注册 → 加好友 → 打卡 → 好友看到动态）从没整条跑过。补 E2E。

**显式调用：**

```
/ecc:e2e-testing
/bmad-qa-generate-e2e-tests
```

**Claude 回答要点：**

单元测试只证明「每块零件没坏」，E2E 才证明「整机能跑」。e2e-testing 针对跨端真实链路设计用例，bmad-qa-generate-e2e-tests 据 PRD 的验收标准生成测试场景。落到 `e2e/`：

```
场景 1：打卡闭环（跨三端 + 真实后端）
  1. 用户 A、B 互为好友（API 准备）
  2. A 在 Flutter 端添加在读书籍并打卡 30 页
  3. 断言：后端 checkin 表新增一条；Redis 动态流写入
  4. B 刷新动态流 → 看到 A 的打卡卡片
  5. B 评论「加油」→ A 收到
场景 2：补卡边界
  - 当日 23:59 打卡成功；改系统时间到次日补「昨天」→ 返回 422
场景 3：运营后台
  - 违规内容出现在 Vue 审核列表 → approve → 列表移除、内容上线
```

- **它问：** E2E 跑在哪个环境？用真实 PostgreSQL+Redis 还是容器化的一次性环境？建议用 docker-compose 起一套隔离依赖，避免污染开发库、也保证可重复。
- **你答：** 用 docker-compose 起一次性 PG+Redis，CI 里每次全新拉起。这一步正好为阶段 20 的 CI 打了基础。
- **它发现：** 场景 2 跨天补卡**偶发失败**——但不稳定复现。这条线索直接交给阶段 15 系统性定位。

> 纯前端/后台的浏览器侧验证可用 `/ecc:browser-qa`；要把 E2E 固化进流水线参见阶段 20。

---

## 阶段 14 — 压测：性能与负载

**你说：** 功能跑通了，但好友动态流是「写扩散 + Redis ZSet」，担心高峰打卡时扇出把后端压垮。上线前压一压。

**显式调用：**

```
/ecc:benchmark
/ecc:latency-critical-systems
```

**Claude 回答要点：**

benchmark 帮你建立可重复的压测基线，latency-critical-systems 针对热点路径给出优化与容量判断。重点压三条路径：打卡写入、动态流读取、写扩散扇出。

```
压测目标（晚高峰 21:00 打卡潮）：
  - 打卡 POST /api/checkins   : p99 < 200ms @ 500 RPS
  - 动态流 GET /api/feed      : p99 < 100ms @ 2000 RPS（读多）
  - 写扩散：一个大 V（2000 好友）打卡，扇出不能阻塞主请求
结果：
  - 读路径达标（Redis ZSet 命中率 98%）
  - 写扩散在大 V 场景把打卡接口拖到 p99 1.2s —— 不达标
```

- **它问：** 大 V 写扩散同步执行会拖垮打卡接口——是否改成「打卡先返回、扇出异步化」（写 MQ / 后台任务），并对超大好友数走「读扩散」兜底？
- **你答：** 改。扇出移到异步队列，打卡接口只管落库 + 入队；好友数 > 1000 的账号读时合并。压测复跑 → 打卡 p99 回到 120ms。
- **它提醒：** 把这组压测脚本和阈值固化下来，作为阶段 21 监控告警的基线。

> 算法/单函数级的微基准可结合 `/ecc:benchmark-optimization-loop` 做迭代优化。

---

## 阶段 15 — 调试：定位联调 bug

**你说：** 联调发现：UTC+14 时区的用户，当日打卡偶尔被判成「补历史日期」而失败。别瞎改，系统性定位。

**显式调用：**

```
/superpowers:systematic-debugging
```

**Claude 回答要点：**

systematic-debugging 强制「先复现、先定位根因，再改」，禁止凭猜测打补丁：

1. **复现：** 写一个 UTC+14、本地时间 00:30 的测试用例 → 稳定复现失败。
2. **定位：** 后端用 `LocalDate.now(cmd.zone())`，但 `cmd.zone()` 其实是用服务器默认时区构造的——`tzOffset` 没真正传进去。根因是 DTO 映射漏了字段，不是逻辑算错。
3. **最小修复：** 在 `CheckinCommand` 构造处正确注入 `ZoneOffset.ofTotalSeconds(tzOffset*60)`。
4. **回归：** 阶段 9 的补卡测试 + 新增的 UTC+14 边界测试全绿。

- **它问：** 这个 bug 在 Flutter 端有没有对称问题（本地也算了一次日期）？建议两端各加一个边界测试锁住。
- **你答：** 加。两端测试都覆盖 UTC+14 / UTC-11 两个极端。

> 根因定位清楚后，这类「时区」陷阱值得用 `/ecc:learn` 沉淀成经验，避免复犯（见阶段 23）。

---

## 阶段 16 — 代码审查

**你说：** 三端都开发完了，提 PR 前先做一轮代码审查。

**显式调用：**

```
/superpowers:requesting-code-review
/ecc:code-review
```

**Claude 回答要点：**

requesting-code-review 会把改动整理成可评审的形态并触发审查；ecc:code-review 针对当前 diff 找正确性 bug 与可简化点。本轮发现：

- **后端：** `redisFeed.fanout` 没做幂等，重复打卡可能给好友动态写两条 → 建议加去重 key。
- **Flutter：** 乐观更新失败后没回滚 streak 计数 → 状态会和服务端不一致。
- **Vue：** 审核列表 `approve` 后只 `refresh()`，并发审核同一条会重复请求 → 建议禁用按钮 + 乐观移除。

收到评审意见后，用对应的「接受评审」流程逐条处理：

```
/superpowers:receiving-code-review
```

- **它的纪律：** 每条意见要么修，要么明确说明为什么不修，不能默默忽略。
- **你答：** 三条全修，并各补一个测试锁住回归。

> 各端也有专项评审 Skill：后端 `/ecc:springboot-verification`、Flutter `/ecc:flutter-review`、前端可迁移 `/ecc:react-review` 的思路到 Vue。

---

## 阶段 17 — 安全：上线前的安全审查

**你说：** 这是个带注册登录、好友关系、用户内容的社交 App，上线前必须过一遍安全。

**显式调用：**

```
/ecc:security-review
```

**Claude 回答要点：**

security-review 以攻击者视角审一遍认证、授权、输入、敏感数据，重点盯「越权」和「注入」。本轮发现：

- **越权（最高危）：** `GET /api/users/{id}/checkins` 只校验登录、没校验「是否为好友」→ 任意用户可拉取陌生人打卡记录。修：加好友关系校验。
- **JWT：** access token 有效期 7 天且无法吊销 → 改短时效 access + refresh，登出/改密可失效。
- **内容安全：** 评论直出到 Vue 后台未转义 → 存储型 XSS 风险（运营点开就中招）。修：输出转义 + 审核侧 CSP。
- **越权 #2：** 运营后台审核接口只靠前端隐藏按钮，后端未校验 admin 角色 → 加服务端鉴权。

- **它问：** 打卡接口对 `pages` 没有上限校验——会不会被刷出「单日读 999999 页」污染排行榜/动态流？
- **你答：** 加业务校验（单次 ≤ 合理上限）+ 频率限制。每条安全问题都补一个测试或集成用例锁住。

> 想要更系统的扫描可叠加 `/ecc:security-scan`；做漏洞赏金式深挖可用 `/ecc:security-bounty-hunter`。

---

## 阶段 18 — 验证：宣称「完成」之前

**你说：** 我觉得可以上线了。

**显式调用：**

```
/superpowers:verification-before-completion
```

**Claude 回答要点：**

verification-before-completion 不允许「我觉得好了」，要求用**证据**证明完成。它拉了一张清单逐项核对：

- [x] 后端 `./mvnw test` 全绿（贴输出）
- [x] Flutter `flutter test` 全绿
- [x] Vue `npm run typecheck` 通过
- [x] E2E 三个场景全绿（阶段 13）
- [x] 压测达标（打卡 p99 120ms，阶段 14）
- [x] 安全四项已修并有用例（阶段 17）
- [x] PRD 里 P0 的三条验收标准逐条对照 → 满足
- [x] 阶段 15 的时区 bug 有回归测试覆盖
- [ ] ⚠️ 数据看板（Story 3.2）尚未实现 —— 属于 Epic 3，不在本次 Epic 2 范围

- **它指出：** 别把「Epic 2 完成」说成「项目完成」。本次只交付打卡闭环，数据看板要单独走流程。
- **你答：** 对，PR 标题限定为「Epic 2: 打卡闭环」，看板留到下个迭代。

---

## 阶段 19 — 合并：收尾与 PR

**你说：** 验证通过，提 PR 准备合并。

**显式调用：**

```
/superpowers:finishing-a-development-branch
/ecc:pr
```

**Claude 回答要点：**

finishing-a-development-branch 负责干净收尾：确认测试绿、commit 信息规范、清理 worktree、确认要不要删分支；ecc:pr 生成结构化的 PR（含变更摘要、测试说明、风险点）。

```bash
# 收尾检查（由 Skill 引导）
git status            # 工作区干净
./mvnw test && flutter test && npm run typecheck  # 三端全绿
# 生成 PR
gh pr create --base master --head feat/epic2-checkin \
  --title "Epic 2: 打卡闭环（后端+Flutter+Vue）"
```

PR 描述自动包含：

```markdown
## 变更摘要
- 后端：打卡 API（当日补卡规则 + 时区修正）、Redis 异步写扩散动态流
- Flutter：打卡页 + 乐观更新 + 日历点亮
- Vue：运营后台内容审核列表
## 测试
- 后端 42 / Flutter 18 / Vue 类型检查 / E2E 3 场景 全绿
- 压测：打卡 p99 120ms @ 500 RPS
## 安全
- 修复好友越权、JWT 时效、存储型 XSS、后台鉴权
## 范围之外
- 数据看板（Story 3.2）下迭代交付
```

合并后，worktree 清理掉，主分支拿到一个**经过测试、经过审查、经过验证**的功能。但**这还不是上线**——代码进了主干，离用户用上还差部署。

---

## 阶段 20 — 部署：CI/CD 与发布

**你说：** 代码合进 master 了，现在真正发到生产环境——三端怎么构建、怎么发布？

**显式调用：**

```
/ecc:deployment-patterns
/ecc:docker-patterns
```

**Claude 回答要点：**

deployment-patterns 设计从「合并」到「生产」的流水线，docker-patterns 负责后端服务的容器化。三端的发布形态不同，分别处理：

```yaml
# CI 流水线（合并到 master 触发）
后端 Spring Boot:
  - mvn test → 构建可运行 jar → 打 Docker 镜像 → 推镜像仓库
  - 跑数据库迁移（Flyway，先在 staging 验证回滚）
  - 部署到 staging → 自动 E2E（阶段 13）→ 人工放行 → 生产
Vue 运营后台:
  - npm run generate → 静态产物 → 部署到 Cloudflare Pages / Nginx
移动端 Flutter:
  - flutter build apk/ipa → 上传到内测渠道（蒲公英/TestFlight）→ 审核 → 商店
环境与密钥:
  - .env 不进仓库；生产密钥走 secrets 管理（JWT 密钥、DB 口令、Redis）
  - staging / prod 配置分离
```

- **它问：** 数据库迁移和应用部署谁先谁后？如果新代码依赖新列，但迁移失败、应用已上 → 直接 500。建议「先迁移、向后兼容、再发应用」，且迁移要能独立回滚。
- **你答：** 采用「扩展-收缩」式迁移：先加列（兼容旧代码）→ 发新代码 → 下个版本再清理旧列。绝不在一次发布里做破坏性变更。
- **它提醒：** 移动端不能像后端一样「随时回滚」——用户装了旧版就回不去了。所以 App 必须保证「旧客户端 + 新后端」兼容，API 加字段而非改字段。

> 容器编排 / 自托管可参考 `/ecc:uncloud`；进程守护用 `/ecc:pm2`。

---

## 阶段 21 — 守护：监控与灰度回滚

**你说：** 发上线了，但我怎么知道它在生产上是不是真的好的？万一出问题怎么快速止损？

**显式调用：**

```
/ecc:canary-watch
/ecc:production-audit
```

**Claude 回答要点：**

「部署成功」不等于「上线成功」。canary-watch 做灰度发布 + 自动盯盘，production-audit 体检生产配置与可观测性缺口。

```
灰度发布：
  - 新版本先放给 5% 用户（或先发内测组）
  - 盯关键指标 10~30 分钟：错误率、打卡接口 p99、写扩散队列积压
  - 指标正常 → 逐步放量 25% → 50% → 100%
  - 任一指标越过阈值（阶段 14 的压测基线）→ 自动回滚 / 暂停放量
可观测性（production-audit 检查清单）：
  - [x] 日志：结构化、带 traceId，能从一次打卡串到写扩散
  - [x] 指标：打卡成功率、动态流延迟、Redis 命中率、队列深度
  - [x] 告警：打卡错误率 > 1%、p99 > 阈值、队列积压 → 通知
  - [ ] ⚠️ 缺少「冷启动留存」业务看板 —— 列入下迭代
```

- **它问：** 回滚预案演练过吗？真出事时手忙脚乱地回滚，和提前演练过、一条命令回滚，差别是「5 分钟」还是「2 小时」。
- **你答：** 在 staging 演练一次「发布 → 触发告警 → 一键回滚」全流程，并写进 runbook。
- **它指出：** 灰度期发现写扩散队列在真实流量下偶有积压（压测没覆盖的长尾好友分布）——暂停放量、扩容消费者、确认消化后再继续。**这正是灰度的价值：在 5% 暴露问题，而不是 100%。**

> 单个发布后的持续盯盘可用 `/ecc:canary-watch` 起守护循环；要做长期成本/资源体检见 `/ecc:production-audit`。

---

## 阶段 22 — 文档：交付沉淀

**你说：** 功能上线、稳住了，把这次的接口、架构决策、运维手册补全，别让知识只留在脑子里。

**显式调用：**

```
/ecc:update-docs
```

**Claude 回答要点：**

update-docs 扫描本次改动，更新/补齐三类文档，让下一个人（包括三个月后的你）能接手：

- **API 文档：** OpenAPI 契约导出成可读文档，标注打卡/动态流/审核接口的鉴权要求与时区约定。
- **架构/决策：** 把「写扩散改异步」「扩展-收缩式迁移」「JWT 短时效 + refresh」沉淀进 `docs/architecture.md` 的 ADR。
- **运维 runbook：** 部署步骤、回滚命令、告警处置预案、关键指标看板入口。
- **README：** 三端本地启动方式、环境变量清单、docker-compose 起依赖。

- **它问：** 时区约定（`tzOffset` 是「本地 - UTC」分钟数）这种「踩过坑的隐性约定」有没有写进文档？不写，下个迭代很可能再踩一次。
- **你答：** 写进 API 文档的醒目位置，并附阶段 15 的 bug 作为反例。

> 想生成可视化的代码地图/导览，可用 `/ecc:update-codemaps` 或 `/ecc:code-tour`。

---

## 阶段 23 — 复盘：迭代回顾

**你说：** Epic 2 整条链路走完了，做个复盘，把经验固化下来，下个 Epic 少踩坑。

**显式调用：**

```
/bmad-retrospective
/ecc:learn
```

**Claude 回答要点：**

retrospective 引导团队回顾「做得好 / 做得不好 / 下次改什么」；ecc:learn 把具体的技术教训沉淀成可复用的经验（甚至生成 hook/规则防止复犯）。

```markdown
## Epic 2 复盘
### 做得好
- 契约先行让三端真正并行（阶段 12），没出现「等接口」空转
- 灰度发布在 5% 拦下了写扩散积压（阶段 21），没酿成线上事故
### 做得不好
- 时区 bug 本可在阶段 8 建模时就预防（tz_offset 字段晚加了）
- 压测漏了「长尾好友分布」，灰度才暴露 → 压测场景要更贴近真实分布
### 下次改进
- 新功能涉及时间/日期 → 默认先列时区测试矩阵
- 压测数据要从生产采样，而非均匀假设
```

- **`ecc:learn` 沉淀：** 把「时区处理三件套」（存 tz_offset / 两端边界测试 / 文档醒目标注）固化成项目经验，下次涉及日期逻辑自动提醒。
- **你答：** 采纳，并把「破坏性 DB 变更必须走扩展-收缩」也加进团队约定。

> 想把经验导出/复用到别的项目，可用 `/ecc:instinct-export`；要把复盘结论变成下个迭代的待办，回到阶段 5 重新拆 Story。

---

## 小结

把整条链路串起来，会发现它其实是**两个生命周期的拼接**：

- **开发生命周期（0–12）：** 想清楚 → 设计 → 拆分 → 写出来。
- **交付与运维生命周期（13–23）：** 联调 → 压测 → 审查 → 安全 → 验证 → 合并 → 部署 → 守护 → 文档 → 复盘。

很多人只做前半段，把「合并 PR」当「上线」，结果在没监控、没灰度、没安全审查的情况下裸奔。这套方法的价值，就是把后半段也变成**有纪律、可复现**的显式流程。

贯穿始终的设计哲学是四条：

1. **先想后做** — `brainstorming` / `market-research` / `writing-plans` 在写代码前敲定方向与方案。
2. **先测后写** — `test-driven-development` + 各端 `*-tdd` / `*-test`，逻辑一律先有失败测试再有实现。
3. **先验证后宣称完成** — `systematic-debugging` 不靠猜、`verification-before-completion` 不靠感觉、E2E / 压测 / 安全用证据说话。
4. **上线不是终点** — `deployment-patterns` 真正发布、`canary-watch` 灰度守护、`retrospective` + `learn` 把每次踩坑变成下次的护栏。

而 **三端协作的关键抓手始终是「OpenAPI 契约先行」**：架构阶段冻结契约，后端、Vue、Flutter 才能在 `dispatching-parallel-agents` 下真正并行，否则并行只会放大「基于错误假设白干」的风险。

显式调用每个 Skill 的好处是：流程可复现、纪律不被「就这一次先写代码 / 就这一次先不上监控」绕过——这正是这套方法相对「凭手感开发」的价值所在。
