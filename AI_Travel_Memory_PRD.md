# AI 旅行记忆产品 PRD

> 文档版本：v0.1  
> 生成日期：2026-06-24  
> 产品阶段：0-1 MVP 需求设计  
> 目标用途：用于后续 AI Coding、原型设计、开发拆解、测试验收  
> 产品暂定名：旅忆 / TripMemory / Roamory，可后续命名

---

## 0. 文档说明

本文档将“旅行规划、照片记忆整理、天气导向出行、足迹地图点亮、3D 纪念品收藏”整理为一份可开发的产品需求文档。

当前 PRD 的核心原则是：

1. 第一版不做大而全，优先验证主闭环。
2. 核心体验是“AI 规划旅行 + 自动沉淀足迹记忆”。
3. 天气导向和 3D 纪念品作为差异化能力，但不在 MVP 中重投入。
4. 所有 AI 输出必须基于真实地点、路线、天气、相册元数据等可校验数据，避免纯大模型幻觉。
5. 位置、照片、轨迹属于高敏感数据，隐私设计必须前置。

---

## 1. 产品概述

### 1.1 产品定位

本产品是一个面向个人用户的 AI 旅行产品，帮助用户完成从出发前规划、出发中调整、回程后整理记忆、长期点亮人生足迹的完整闭环。

一句话描述：

> 用 AI 帮用户规划旅行，并把每一次旅行自动沉淀成可回看的足迹、照片记忆和纪念收藏。

### 1.2 核心价值

| 阶段 | 用户问题 | 产品价值 |
|---|---|---|
| 出发前 | 不知道怎么玩，攻略太碎，路线难排 | AI 生成可编辑行程，结合地图、预算、通勤时间 |
| 出发中 | 天气变化，不知道临时去哪 | 根据天气、交通时间、兴趣推荐适合目的地 |
| 回来后 | 照片散在相册里，记忆很快模糊 | 自动识别旅行片段，生成旅行记录 |
| 长期 | 想知道自己去过哪里，人生轨迹缺少可视化 | 足迹地图点亮城市，生成年度旅行地图 |
| 情绪价值 | 票根、冰箱贴、纪念品难保存 | 建立数字纪念品收藏柜，后续支持 3D 模型 |

### 1.3 第一版主路径

MVP 主路径定义为：

```text
输入目的地、天数、预算、兴趣
→ AI 生成行程
→ 地图上查看和调整路线
→ 保存为旅行
→ 生成分享海报
→ 点亮足迹地图
→ 旅后从相册生成旅行记忆
```

### 1.4 第一版产品边界

MVP 不是：

- OTA 订酒店/机票平台；
- 完整社交平台；
- 专业摄影/相册管理工具；
- 高精度天文预测软件；
- 工业级 3D 建模工具。

MVP 是：

- 一个能生成可用旅行计划的 AI 行程工具；
- 一个能保存旅行记录和足迹地图的旅行记忆工具；
- 一个具备传播能力的旅行海报生成工具。

---

## 2. 目标用户

### 2.1 主要用户

#### 用户 A：周末短途旅行者

- 年龄：18-35 岁；
- 场景：周五晚上或周末临时想出去；
- 痛点：
  - 不想查大量攻略；
  - 希望 1-3 小时交通圈内有好去处；
  - 喜欢晴天、晚霞、海边、古镇、露营、雪景等氛围感目的地；
  - 喜欢拍照和分享。
- 价值点：
  - 一键生成短途路线；
  - 天气导向推荐；
  - 分享海报。

#### 用户 B：轻度旅行规划者

- 年龄：20-45 岁；
- 场景：节假日、年假、情侣游、朋友游、亲子游；
- 痛点：
  - 攻略信息过载；
  - 不知道景点顺序怎么排；
  - 不知道交通时间；
  - 不知道预算是否够；
  - 不知道一天能玩几个点。
- 价值点：
  - AI 自动生成行程；
  - 可手动修改；
  - 通勤时间自动计算；
  - 雨天备选；
  - 预算估算。

#### 用户 C：旅行记录爱好者

- 年龄：18-40 岁；
- 场景：喜欢地图、照片、纪念品、人生清单；
- 痛点：
  - 照片太多，懒得整理；
  - 去过很多地方但没有系统记录；
  - 旅行记忆散落在相册和社交平台；
  - 想做自己的旅行地图。
- 价值点：
  - 照片自动聚类成旅行；
  - 足迹地图点亮；
  - 旅行卡片；
  - 年度旅行报告；
  - 纪念品收藏。

---

## 3. 产品目标与指标

### 3.1 MVP 目标

MVP 要验证三件事：

1. 用户是否愿意用 AI 生成旅行行程；
2. 用户是否认为 AI 行程可用，并愿意手动调整和保存；
3. 用户是否愿意把旅行记录沉淀为足迹地图和照片记忆。

### 3.2 北极星指标

```text
每月每个活跃用户保存的有效旅行记录数
```

有效旅行记录定义：

- 包含至少 1 个目的地城市；
- 包含至少 1 天行程，或至少 3 张照片；
- 用户主动保存，或用户确认由相册识别生成；
- 未被用户在 24 小时内删除。

### 3.3 核心指标

| 指标类型 | 指标 |
|---|---|
| 激活 | 完成首次 AI 行程生成率 |
| 激活 | 首次行程保存率 |
| 激活 | 首个城市点亮率 |
| 使用质量 | AI 推荐点位删除率 |
| 使用质量 | 行程手动调整率 |
| 使用质量 | 用户对行程评分 |
| 留存 | 7 日内二次打开率 |
| 留存 | 30 日内新增旅行记录率 |
| 传播 | 分享海报生成率 |
| 传播 | 分享链接打开率 |
| 隐私信任 | 相册授权转化率 |
| 隐私信任 | 位置授权转化率 |

---

## 4. 版本范围

### 4.1 P0：MVP 必须实现

| 模块 | 功能 | 说明 |
|---|---|---|
| 用户系统 | 手机号/邮箱/第三方登录 | 可先支持游客模式 |
| 用户偏好 | 兴趣、预算、节奏、同行人、交通方式 | 用于个性化生成 |
| AI 旅行规划 | 输入目的地、天数、预算、兴趣生成行程 | 核心功能 |
| 地图行程 | 显示点位、路线、通勤时间 | 使用地图 API |
| 行程编辑 | 删除、替换、调整顺序、重新生成 | 必须可控 |
| 行程保存 | 保存为 Trip | 形成资产 |
| 分享海报 | 生成行程长图/卡片 | 传播功能 |
| 足迹地图 | 手动点亮城市、关联旅行 | 留存功能 |
| 隐私设置 | 相册/位置授权说明、删除数据 | 必须前置 |

### 4.2 P1：MVP 后增强

| 模块 | 功能 | 说明 |
|---|---|---|
| 照片记忆 | 读取照片时间和坐标，聚类旅行 | 可先本地处理 |
| AI 回忆文案 | 根据地点和照片生成旅行故事 | 情绪价值 |
| 周末推荐 | 根据天气和交通时间推荐短途目的地 | 差异化 |
| 多人协作 | 邀请同行人查看或编辑行程 | 可后置 |
| 预算增强 | 分项预算与实际花费记录 | 可后置 |

### 4.3 P2：探索功能

| 模块 | 功能 | 说明 |
|---|---|---|
| 银河/晚霞预测 | 云量、月相、光污染、日落时间综合判断 | 技术复杂 |
| 3D 纪念品 | 单图/多图生成纪念品模型 | 算力成本高 |
| 年度报告 | 年度旅行地图、照片、城市、同行人总结 | 适合传播 |
| 实体商品 | 照片书、足迹地图海报、纪念票册 | 商业化 |

---

## 5. 信息架构

### 5.1 底部导航

MVP 建议 4 个 Tab：

```text
规划
周末
足迹
我的
```

其中：

- “规划”是主入口；
- “周末”第一版可先放灰度入口或灵感推荐；
- “足迹”承载旅行记录、照片记忆、纪念收藏；
- “我的”承载偏好、账号、隐私、会员。

### 5.2 页面结构

```text
App
├── 规划
│   ├── 创建旅行页
│   ├── AI 生成中页
│   ├── 行程结果页
│   ├── 地图编辑页
│   ├── 点位详情页
│   └── 分享海报页
├── 周末
│   ├── 氛围选择页
│   ├── 推荐列表页
│   └── 周末行程生成页
├── 足迹
│   ├── 足迹地图页
│   ├── 城市详情页
│   ├── 旅行记录详情页
│   ├── 相册导入页
│   ├── 记忆确认页
│   └── 纪念收藏柜页
└── 我的
    ├── 个人资料页
    ├── 旅行偏好页
    ├── 隐私设置页
    ├── 数据管理页
    └── 关于页
```

---

## 6. 核心用户流程

### 6.1 创建 AI 行程

```text
用户点击「创建旅行」
→ 输入目的地、天数、预算、兴趣
→ 选择出发城市、出行日期、同行人、节奏
→ 点击「生成行程」
→ 系统生成每日行程和地图路线
→ 用户查看通勤时间、预算、点位理由
→ 用户删除/替换/拖拽点位
→ 系统重新计算路线和时间
→ 用户保存行程
→ 用户生成分享海报
```

### 6.2 保存并点亮足迹

```text
用户保存行程
→ 系统识别目的地城市
→ 询问是否点亮该城市
→ 用户确认
→ 城市在足迹地图中点亮
→ 旅行记录与城市详情关联
```

### 6.3 从相册找回历史旅行

```text
用户进入足迹页
→ 点击「从相册找回旅行」
→ 查看隐私说明
→ 授权读取照片时间和位置
→ 系统本地扫描照片元数据
→ 聚类出疑似旅行片段
→ 用户确认/合并/拆分
→ 生成旅行记忆卡片
→ 点亮相关城市
```

### 6.4 天气导向周末出行

```text
用户进入周末页
→ 选择想要的氛围：晴天/晚霞/银河/雪景
→ 选择交通半径：1 小时/2 小时/3 小时
→ 选择交通方式：公共交通/自驾
→ 系统筛选目的地
→ 用户查看推荐理由和风险提示
→ 一键生成半日/一日行程
```

### 6.5 纪念品收藏

```text
用户进入某次旅行详情
→ 点击「添加纪念品」
→ 拍照或上传图片
→ 系统生成纪念品卡片
→ 用户填写名称、地点、故事
→ 关联旅行和城市
→ 后续可生成 2.5D/3D 展示
```

---

## 7. 功能需求

---

### FR-001 用户登录与游客模式

#### 优先级

P0

#### 需求描述

用户可以登录使用，也可以游客身份体验核心功能。游客模式下允许生成一次行程，但保存、同步、多设备查看需要登录。

#### 功能规则

1. 支持游客模式进入；
2. 游客可以创建并预览 1 次 AI 行程；
3. 游客保存行程时提示登录；
4. 登录方式可选：
   - 手机号验证码；
   - 邮箱验证码；
   - Apple ID；
   - 微信/Google 等第三方登录根据市场选择。
5. 用户数据必须绑定 userId；
6. 用户可注销账号；
7. 用户可导出或删除个人数据。

#### 验收标准

- 未登录用户可以进入首页并创建行程；
- 未登录用户保存行程时出现登录弹窗；
- 登录后行程保存到用户账号；
- 注销账号后，用户个人数据进入删除流程。

---

### FR-002 用户旅行偏好

#### 优先级

P0

#### 需求描述

系统保存用户常用旅行偏好，用于 AI 行程生成和推荐。

#### 偏好字段

| 字段 | 类型 | 示例 |
|---|---|---|
| interests | string[] | 美食、拍照、博物馆、自然风光 |
| travelPace | enum | relaxed / balanced / intense |
| budgetLevel | enum | low / medium / high |
| transportPreference | enum[] | public_transport / driving / walking / taxi |
| companionType | enum | solo / couple / friends / family / elder / child |
| dietaryPreference | string[] | 清淡、素食、不吃辣 |
| avoidTags | string[] | 人多、爬山、排队、商业街 |
| hotelLocation | object | 可为空 |
| defaultDepartureCity | string | 深圳 |

#### 验收标准

- 用户可以新增、修改、删除偏好；
- 创建行程时自动带入默认偏好；
- 用户本次修改可以选择“仅本次使用”或“保存为默认偏好”。

---

### FR-010 AI 旅行规划

#### 优先级

P0

#### 需求描述

用户输入目的地、天数、预算和兴趣偏好后，系统自动生成可执行旅行行程。

#### 输入项

| 字段 | 必填 | 说明 |
|---|---|---|
| destination | 是 | 目的地城市或区域 |
| days | 是 | 旅行天数 |
| budget | 否 | 总预算或预算等级 |
| interests | 否 | 兴趣偏好 |
| departureCity | 否 | 出发城市 |
| startDate | 否 | 出行开始日期 |
| companionType | 否 | 同行人 |
| travelPace | 否 | 旅行节奏 |
| transportMode | 否 | 主要交通方式 |
| hotelLocation | 否 | 住宿位置 |
| mustVisitPois | 否 | 必去地点 |
| avoidPois | 否 | 不想去的地点 |
| freeText | 否 | 自然语言需求 |

#### 输出项

每次生成的行程应包含：

- 行程标题；
- 目的地；
- 天数；
- 总体推荐理由；
- 每日时间轴；
- 每个点位坐标；
- 每个点位推荐理由；
- 预计游玩时长；
- 点位间通勤方式和时间；
- 每日预算估算；
- 餐饮建议；
- 雨天备选；
- 注意事项；
- 可行性评分。

#### 业务规则

1. 不允许 AI 编造不存在的地点；
2. POI 必须来自地图/地点数据源或内部 POI 数据库；
3. 点位之间必须计算真实通勤时间；
4. 如果营业时间不可得，需要标记“营业时间待确认”；
5. 如果行程过满，需要提示“当前行程较紧张”；
6. 每日点位数量根据旅行节奏控制：
   - relaxed：2-4 个；
   - balanced：3-5 个；
   - intense：5-8 个。
7. 默认每日不安排超过 10 小时高强度活动；
8. 预算估算要标注不确定性；
9. 生成失败时返回明确错误原因和可操作建议。

#### 行程可行性评分

评分维度：

| 维度 | 权重 | 说明 |
|---|---:|---|
| 通勤合理性 | 35% | 路线是否绕路、通勤是否过长 |
| 时间合理性 | 25% | 游玩时长和营业时间是否匹配 |
| 偏好匹配度 | 20% | 是否符合用户兴趣 |
| 预算匹配度 | 10% | 是否接近预算 |
| 天气适配度 | 10% | 是否考虑天气或季节 |

#### 验收标准

- 输入“杭州、3 天、2000 元、拍照和美食”可以生成 3 天行程；
- 每个 POI 至少包含名称、坐标、类型、推荐理由；
- 每两个连续点位之间有通勤时间；
- 用户可以保存生成结果；
- 生成结果不存在明显重复点位；
- 当用户选择轻松节奏时，每日点位不应过多；
- 如果地图 API 获取失败，应返回降级行程并提示通勤时间暂不可用。

---

### FR-011 AI 行程重新生成与局部修改

#### 优先级

P0

#### 需求描述

用户可以基于已生成行程进行局部修改，而不需要重新填写全部需求。

#### 支持操作

| 操作 | 说明 |
|---|---|
| 重新生成全部行程 | 保留用户输入条件 |
| 重新生成某一天 | 只替换当天安排 |
| 替换某个点位 | 找一个类似 POI |
| 删除某个点位 | 删除后自动调整时间 |
| 增加某个点位 | 插入后重新计算路线 |
| 降低强度 | 减少点位和通勤 |
| 增加拍照地点 | 增加适合拍照的 POI |
| 降低预算 | 替换更低成本方案 |
| 雨天方案 | 生成室内替代行程 |

#### 验收标准

- 删除 POI 后时间轴自动更新；
- 替换 POI 后重新计算前后路线；
- 用户点击“今天太累了”后，当天点位数量减少；
- 用户所有手动锁定的 POI 不会被 AI 自动替换。

---

### FR-020 地图行程编辑

#### 优先级

P0

#### 需求描述

用户可以在地图上查看每日路线，并手动调整点位顺序。

#### 页面元素

- 地图；
- POI 标记；
- 每日路线连线；
- 时间轴列表；
- 通勤时间；
- 点位卡片；
- 拖拽排序；
- 切换日期；
- 保存按钮。

#### 交互规则

1. 用户拖拽时间轴中的点位顺序；
2. 系统重新计算路线和通勤时间；
3. 如果新顺序导致路线明显变差，需要提示；
4. 用户可以锁定某个点位；
5. 用户可以隐藏某个点位；
6. 用户可以查看 POI 详情；
7. 用户可以切换交通方式后重新计算路线。

#### 验收标准

- 拖动点位后，路线顺序更新；
- 通勤时间重新计算；
- 保存后再次进入保持用户修改后的顺序；
- 无网络时展示上次缓存的行程，但提示路线可能不是最新。

---

### FR-030 分享海报

#### 优先级

P0

#### 需求描述

用户可以将行程或足迹生成可分享图片。

#### 海报类型

| 类型 | 内容 |
|---|---|
| 行程长图 | 每日时间轴、点位、预算、通勤 |
| 地图路线海报 | 地图轨迹、城市、日期 |
| 小红书封面 | 标题、代表图、关键词 |
| 朋友圈卡片 | 简短标题和路线亮点 |
| 足迹地图 | 点亮城市和统计数据 |

#### 规则

1. 海报生成前用户可选择模板；
2. 支持隐藏预算；
3. 支持隐藏具体酒店位置；
4. 支持隐藏精确定位，只显示城市；
5. 生成图片可保存到相册；
6. 可生成分享链接；
7. 分享链接访问时不展示私密信息。

#### 验收标准

- 用户可从行程详情页生成海报；
- 生成图片清晰，无明显错位；
- 用户关闭“显示预算”后，海报不出现预算；
- 用户设置行程私密后，分享链接不可访问或需要授权。

---

### FR-040 足迹地图点亮

#### 优先级

P0

#### 需求描述

用户去过或计划去某个城市后，可以在地图上点亮该城市，形成个人足迹地图。

#### 点亮来源

| 来源 | 说明 |
|---|---|
| 手动添加 | 用户主动搜索并添加城市 |
| 行程保存 | 保存行程后询问是否点亮 |
| 相册识别 | 照片记忆确认后自动点亮 |
| 位置签到 | 后续版本支持当前位置签到 |

#### 地图层级

- 国家；
- 省/州；
- 城市；
- 景点；
- 路线。

#### 城市详情展示

- 城市名称；
- 去过次数；
- 第一次到访时间；
- 最近一次到访时间；
- 关联旅行记录；
- 代表照片；
- 便签；
- 纪念品；
- 用户评分；
- 是否想再去。

#### 验收标准

- 用户可以手动点亮城市；
- 点亮后地图状态变化；
- 城市详情页显示关联旅行；
- 删除最后一条关联旅行时，询问是否取消点亮城市；
- 用户可以将某个城市设置为私密。

---

### FR-050 照片记忆整理

#### 优先级

P1

#### 需求描述

系统使用手机相册中的拍摄时间和坐标信息，自动聚类生成历史旅行记录。

#### 隐私原则

1. 默认只读取照片元数据；
2. 原图默认不上传；
3. 用户明确选择后才上传缩略图或原图；
4. 精确坐标可模糊化到城市级别；
5. 用户可删除扫描结果；
6. 用户可关闭相册访问权限。

#### 聚类逻辑

输入：

- photoId；
- creationDate；
- latitude；
- longitude；
- city；
- assetType；
- thumbnailPath，可选。

输出：

- 疑似旅行片段；
- 起止时间；
- 城市列表；
- 主要 POI；
- 照片数量；
- 置信度；
- 建议标题。

#### 旅行识别规则

初版启发式规则：

1. 同一城市或邻近区域内，在 1-7 天内拍摄多张照片；
2. 位置距离用户常驻城市超过一定阈值；
3. 照片密度高于日常阈值；
4. 跨城市移动形成连续路径；
5. 排除日常通勤和家庭地点；
6. 低置信度结果需要用户确认。

#### 用户操作

- 确认生成旅行；
- 合并两个旅行片段；
- 拆分一个旅行片段；
- 删除照片；
- 隐藏地点；
- 修改标题；
- 添加心情便签；
- 设置私密。

#### 验收标准

- 授权后系统能扫描相册元数据；
- 能识别出至少包含时间、城市、照片数量的候选旅行；
- 用户确认后生成 Trip；
- 用户拒绝后不再频繁提示同一候选片段；
- 用户撤销相册权限后停止扫描。

---

### FR-060 天气导向出行

#### 优先级

P1

#### 需求描述

用户先选择想要的天气或氛围，系统筛选公共交通或自驾 3 小时内能到达的目的地，并生成短途行程。

#### 氛围选项

MVP 后首批建议：

- 晴天；
- 晚霞；
- 雪景；
- 海边日落；
- 雨后古镇；
- 避暑；
- 露营好天气。

P2 增加：

- 银河；
- 云海；
- 极光；
- 流星雨；
- 花期；
- 红叶季。

#### 输入项

| 字段 | 说明 |
|---|---|
| departureCity | 出发城市 |
| travelTimeLimit | 1/2/3 小时 |
| transportMode | 公共交通/自驾 |
| targetWeather | 想要的天气或氛围 |
| dateRange | 今天/明天/本周末 |
| interests | 兴趣 |
| budget | 预算 |

#### 推荐结果

每张推荐卡片包含：

- 目的地名称；
- 交通时间；
- 推荐天气或景观；
- 推荐理由；
- 风险提示；
- 预计花费；
- 最佳出发时间；
- 一键生成行程。

#### 业务规则

1. 结果必须在用户设置的交通时间范围内；
2. 天气预测必须标记更新时间；
3. 晚霞、银河等结果必须显示“不保证可见”的风险提示；
4. 如果没有满足条件的地点，给出相近替代方案；
5. 公共交通不可达的地点不出现在公共交通模式下。

#### 验收标准

- 用户选择“晚霞 + 公共交通 3 小时内”后，返回推荐列表；
- 每个推荐地点包含天气依据和交通时间；
- 点击推荐地点可生成一日行程；
- 天气 API 失败时展示缓存或提示稍后重试。

---

### FR-070 纪念品收藏柜

#### 优先级

P2

#### 需求描述

用户可为某次旅行添加冰箱贴、票根、明信片、装饰品等纪念品，形成数字收藏柜。后续支持 2.5D 或 3D 展示。

#### MVP 后第一阶段能力

- 拍照或上传图片；
- 自动抠图；
- 生成纪念品卡片；
- 添加名称、地点、日期、故事；
- 关联旅行；
- 放入城市收藏柜；
- 分享收藏卡片。

#### 后续 3D 能力

- 单图生成简易 3D 预览；
- 多角度拍摄引导；
- 生成可旋转模型；
- 支持 glTF/GLB 格式；
- 可嵌入分享页。

#### 验收标准

- 用户可添加纪念品图片；
- 纪念品可关联某次旅行；
- 城市详情页能展示该城市纪念品；
- 未生成 3D 时仍可作为普通收藏卡片展示；
- 3D 生成失败时展示原始卡片，不影响主流程。

---

### FR-080 隐私与数据管理

#### 优先级

P0

#### 需求描述

产品涉及照片、位置、旅行轨迹等敏感信息，必须提供清晰授权、数据控制和删除能力。

#### 必须能力

1. 位置授权说明；
2. 相册授权说明；
3. 原图是否上传的明确开关；
4. 精确位置隐藏；
5. 私密旅行；
6. 分享前隐私检查；
7. 数据导出；
8. 数据删除；
9. 账号注销；
10. 本地缓存清理。

#### 隐私默认值

| 数据 | 默认设置 |
|---|---|
| 行程 | 私密 |
| 精确酒店位置 | 不分享 |
| 预算 | 不分享 |
| 照片原图 | 不上传 |
| 相册扫描 | 需主动授权 |
| 轨迹分享 | 默认模糊到城市级别 |
| 纪念品 | 私密 |

#### 验收标准

- 用户首次请求相册权限前展示说明；
- 用户可以关闭原图上传；
- 用户分享行程前可以预览公开内容；
- 用户删除旅行后，相关照片引用和足迹关联同步更新；
- 用户注销账号后，数据进入删除流程。

---

## 8. 页面需求

### 8.1 首页 / 规划页

#### 目标

让用户快速创建一次旅行。

#### 核心组件

- 顶部欢迎语；
- 输入框：想去哪里；
- 快捷入口：
  - 周末去哪；
  - 3 天 2 晚；
  - 亲子游；
  - 情侣游；
  - 美食之旅；
  - 拍照打卡；
- 最近行程；
- 推荐目的地；
- 创建旅行按钮。

#### 空状态

当用户没有任何旅行时展示：

```text
还没有旅行记录。
输入一个目的地，让 AI 帮你规划第一段旅程。
```

---

### 8.2 创建旅行页

#### 表单字段

| 字段 | 控件 |
|---|---|
| 目的地 | 搜索输入框 |
| 出发城市 | 定位/搜索 |
| 日期 | 日期选择器 |
| 天数 | 数字选择 |
| 预算 | 金额输入/预算等级 |
| 兴趣 | 多选标签 |
| 同行人 | 单选 |
| 节奏 | 单选 |
| 交通方式 | 多选 |
| 必去地点 | POI 搜索添加 |
| 不想去地点 | POI 搜索添加 |
| 自然语言补充 | 文本框 |

#### CTA

主按钮：

```text
生成我的行程
```

次按钮：

```text
先随便生成一个
```

---

### 8.3 AI 生成中页

#### 展示内容

- 生成进度；
- 当前步骤；
- 生成提示文案；
- 可取消。

#### 步骤文案示例

```text
正在理解你的旅行偏好...
正在寻找适合你的地点...
正在计算点位之间的通勤时间...
正在安排每日节奏...
正在生成可分享的行程卡片...
```

---

### 8.4 行程结果页

#### 展示内容

- 行程标题；
- 总览卡片；
- 每日行程；
- 地图缩略图；
- 总预算估算；
- 总通勤时间；
- 可行性评分；
- 风险提示；
- 操作按钮：
  - 保存；
  - 编辑路线；
  - 重新生成；
  - 分享海报。

#### 每日卡片字段

- Day 1 / 日期；
- 当日主题；
- 上午/中午/下午/晚上；
- POI 列表；
- 餐饮推荐；
- 通勤时间；
- 预算；
- 备注。

---

### 8.5 地图编辑页

#### 展示内容

左/上：地图  
右/下：时间轴

#### 核心操作

- 拖拽排序；
- 删除点位；
- 替换点位；
- 增加点位；
- 切换交通方式；
- 锁定点位；
- 查看 POI 详情。

---

### 8.6 POI 详情页

#### 字段

- 名称；
- 图片；
- 地址；
- 坐标；
- 类型；
- 推荐理由；
- 预计游玩时长；
- 营业时间；
- 价格/门票；
- 评分；
- 适合人群；
- 适合天气；
- 注意事项；
- 替换按钮；
- 加入行程按钮。

---

### 8.7 分享海报页

#### 功能

- 模板选择；
- 内容开关：
  - 显示预算；
  - 显示地图；
  - 显示酒店区域；
  - 显示同行人；
  - 显示具体时间；
- 生成预览；
- 保存图片；
- 复制文字攻略；
- 分享链接。

---

### 8.8 足迹地图页

#### 展示内容

- 地图；
- 已点亮城市数量；
- 已去过国家/省份数量；
- 总旅行次数；
- 最近旅行；
- 手动点亮入口；
- 从相册找回旅行入口。

#### 空状态

```text
你的足迹地图还没有被点亮。
可以手动添加去过的城市，或从相册找回过去的旅行。
```

---

### 8.9 城市详情页

#### 展示内容

- 城市名称；
- 点亮状态；
- 去过次数；
- 首次到访时间；
- 最近到访时间；
- 代表照片；
- 关联旅行；
- 纪念品；
- 便签；
- 分享城市卡片。

---

### 8.10 相册导入页

#### 展示内容

- 隐私说明；
- 授权按钮；
- 扫描状态；
- 候选旅行列表；
- 确认/忽略操作。

#### 隐私说明建议文案

```text
我们会优先在本地读取照片的拍摄时间和地点，用来帮你识别过去的旅行。
默认不会上传原图。你可以随时关闭权限或删除生成结果。
```

---

### 8.11 周末页

#### 展示内容

- 当前城市；
- 氛围选择；
- 交通时间选择；
- 推荐目的地列表；
- 天气更新时间；
- 一键生成短途行程。

---

### 8.12 我的页

#### 展示内容

- 头像昵称；
- 旅行偏好；
- 我的行程；
- 我的足迹；
- 我的纪念品；
- 隐私设置；
- 数据管理；
- 会员入口；
- 关于产品。

---

## 9. 数据模型

### 9.1 实体关系概览

```text
User
├── Preference
├── Trip
│   ├── DayPlan
│   │   ├── TripStop
│   │   │   └── POI
│   │   └── RouteSegment
│   ├── BudgetItem
│   ├── SharePoster
│   ├── MemoryCluster
│   └── Souvenir
└── Footprint
    └── City / Country / POI
```

### 9.2 TypeScript 数据类型建议

```ts
type ID = string;

type TravelPace = "relaxed" | "balanced" | "intense";
type TransportMode = "walking" | "public_transport" | "driving" | "taxi";
type CompanionType = "solo" | "couple" | "friends" | "family" | "elder" | "child";
type TripStatus = "draft" | "planned" | "ongoing" | "completed" | "archived";
type Visibility = "private" | "link_only" | "public";

interface User {
  id: ID;
  nickname: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  defaultDepartureCity?: string;
  createdAt: string;
  updatedAt: string;
}

interface Preference {
  id: ID;
  userId: ID;
  interests: string[];
  travelPace: TravelPace;
  budgetLevel?: "low" | "medium" | "high";
  transportPreference: TransportMode[];
  companionType?: CompanionType;
  dietaryPreference: string[];
  avoidTags: string[];
  defaultDepartureCity?: string;
  createdAt: string;
  updatedAt: string;
}

interface Trip {
  id: ID;
  userId: ID;
  title: string;
  destinationText: string;
  destinationCityIds: ID[];
  departureCityId?: ID;
  startDate?: string;
  endDate?: string;
  days: number;
  budgetAmount?: number;
  budgetCurrency?: string;
  interests: string[];
  companionType?: CompanionType;
  travelPace: TravelPace;
  transportMode: TransportMode[];
  status: TripStatus;
  visibility: Visibility;
  feasibilityScore?: number;
  summary?: string;
  coverImageUrl?: string;
  createdBy: "user" | "ai" | "photo_memory";
  createdAt: string;
  updatedAt: string;
}

interface DayPlan {
  id: ID;
  tripId: ID;
  dayIndex: number;
  date?: string;
  title: string;
  summary?: string;
  estimatedBudget?: number;
  estimatedTravelMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface POI {
  id: ID;
  source: "amap" | "google" | "internal" | "user";
  sourcePoiId?: string;
  name: string;
  address?: string;
  cityId?: ID;
  latitude: number;
  longitude: number;
  category: string;
  tags: string[];
  rating?: number;
  priceLevel?: number;
  openingHoursText?: string;
  imageUrls: string[];
  recommendedDurationMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

interface TripStop {
  id: ID;
  dayPlanId: ID;
  poiId: ID;
  sortOrder: number;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  reason: string;
  locked: boolean;
  hidden: boolean;
  userNote?: string;
  createdAt: string;
  updatedAt: string;
}

interface RouteSegment {
  id: ID;
  dayPlanId: ID;
  fromStopId: ID;
  toStopId: ID;
  transportMode: TransportMode;
  distanceMeters?: number;
  durationMinutes?: number;
  routeSummary?: string;
  provider?: "amap" | "google" | "mock";
  rawProviderData?: unknown;
  createdAt: string;
  updatedAt: string;
}

interface BudgetItem {
  id: ID;
  tripId: ID;
  dayPlanId?: ID;
  category: "transport" | "food" | "ticket" | "hotel" | "shopping" | "other";
  title: string;
  estimatedAmount: number;
  actualAmount?: number;
  currency: string;
  note?: string;
}

interface Footprint {
  id: ID;
  userId: ID;
  targetType: "country" | "province" | "city" | "poi";
  targetId: ID;
  source: "manual" | "trip" | "photo_memory" | "checkin";
  firstVisitedAt?: string;
  lastVisitedAt?: string;
  visitCount: number;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

interface PhotoAssetMeta {
  id: ID;
  userId: ID;
  localAssetId?: string;
  takenAt?: string;
  latitude?: number;
  longitude?: number;
  cityId?: ID;
  width?: number;
  height?: number;
  hash?: string;
  thumbnailUrl?: string;
  uploadedOriginal: boolean;
  createdAt: string;
}

interface MemoryCluster {
  id: ID;
  userId: ID;
  tripId?: ID;
  title: string;
  startAt: string;
  endAt: string;
  cityIds: ID[];
  photoAssetIds: ID[];
  confidence: number;
  status: "suggested" | "confirmed" | "ignored" | "merged" | "split";
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
}

interface Souvenir {
  id: ID;
  userId: ID;
  tripId?: ID;
  cityId?: ID;
  title: string;
  description?: string;
  imageUrl: string;
  cutoutImageUrl?: string;
  model3dUrl?: string;
  modelStatus?: "none" | "queued" | "processing" | "succeeded" | "failed";
  acquiredAt?: string;
  acquiredPlace?: string;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}

interface SharePoster {
  id: ID;
  userId: ID;
  targetType: "trip" | "footprint" | "city" | "souvenir";
  targetId: ID;
  templateId: string;
  imageUrl: string;
  visibility: Visibility;
  hideBudget: boolean;
  hideExactLocation: boolean;
  createdAt: string;
}
```

---

## 10. 接口设计

### 10.1 通用约定

#### 请求头

```http
Authorization: Bearer <token>
Content-Type: application/json
X-Client-Version: 0.1.0
X-Platform: ios | android | web
```

#### 通用响应

```json
{
  "success": true,
  "data": {},
  "error": null,
  "requestId": "req_xxx"
}
```

#### 错误响应

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AI_GENERATION_FAILED",
    "message": "行程生成失败，请减少条件后重试",
    "detail": {}
  },
  "requestId": "req_xxx"
}
```

---

### 10.2 用户与偏好接口

#### 获取我的信息

```http
GET /api/me
```

#### 更新旅行偏好

```http
PUT /api/me/preferences
```

请求示例：

```json
{
  "interests": ["美食", "拍照", "博物馆"],
  "travelPace": "balanced",
  "transportPreference": ["public_transport", "walking"],
  "companionType": "couple",
  "dietaryPreference": ["不吃辣"],
  "avoidTags": ["人多", "排队"]
}
```

---

### 10.3 AI 行程生成接口

#### 创建 AI 行程生成任务

```http
POST /api/trips/generate
```

请求示例：

```json
{
  "destination": "杭州",
  "departureCity": "上海",
  "startDate": "2026-10-02",
  "days": 3,
  "budgetAmount": 2000,
  "budgetCurrency": "CNY",
  "interests": ["拍照", "美食", "寺庙", "咖啡"],
  "travelPace": "balanced",
  "companionType": "friends",
  "transportMode": ["public_transport", "taxi"],
  "mustVisitPois": ["西湖"],
  "avoidPois": [],
  "freeText": "不想太累，希望有一天下午适合慢慢逛"
}
```

响应示例：

```json
{
  "success": true,
  "data": {
    "generationTaskId": "gen_123",
    "status": "queued"
  },
  "error": null,
  "requestId": "req_123"
}
```

#### 查询生成任务

```http
GET /api/trips/generate/{generationTaskId}
```

响应示例：

```json
{
  "success": true,
  "data": {
    "generationTaskId": "gen_123",
    "status": "succeeded",
    "tripId": "trip_123",
    "progress": 100
  },
  "error": null,
  "requestId": "req_124"
}
```

---

### 10.4 行程接口

#### 获取行程详情

```http
GET /api/trips/{tripId}
```

#### 更新行程基本信息

```http
PATCH /api/trips/{tripId}
```

#### 删除行程

```http
DELETE /api/trips/{tripId}
```

#### 保存草稿为正式行程

```http
POST /api/trips/{tripId}/save
```

#### 重新生成某天行程

```http
POST /api/trips/{tripId}/days/{dayPlanId}/regenerate
```

#### 替换点位

```http
POST /api/trips/{tripId}/stops/{stopId}/replace
```

请求示例：

```json
{
  "replaceReason": "想换成更适合拍照的地方",
  "keepTimeSlot": true,
  "lockedStopIds": ["stop_001", "stop_002"]
}
```

#### 调整点位顺序

```http
PATCH /api/day-plans/{dayPlanId}/stops/reorder
```

请求示例：

```json
{
  "stopOrders": [
    { "stopId": "stop_001", "sortOrder": 1 },
    { "stopId": "stop_003", "sortOrder": 2 },
    { "stopId": "stop_002", "sortOrder": 3 }
  ],
  "transportMode": "public_transport",
  "recalculateRoute": true
}
```

---

### 10.5 POI 与地图接口

#### 搜索 POI

```http
GET /api/pois/search?keyword=西湖&city=杭州
```

#### 获取 POI 详情

```http
GET /api/pois/{poiId}
```

#### 计算路线

```http
POST /api/routes/calculate
```

请求示例：

```json
{
  "transportMode": "public_transport",
  "points": [
    { "latitude": 30.259, "longitude": 120.130 },
    { "latitude": 30.240, "longitude": 120.102 }
  ]
}
```

---

### 10.6 分享海报接口

#### 生成海报

```http
POST /api/share-posters
```

请求示例：

```json
{
  "targetType": "trip",
  "targetId": "trip_123",
  "templateId": "trip_long_001",
  "hideBudget": true,
  "hideExactLocation": true
}
```

#### 获取海报

```http
GET /api/share-posters/{posterId}
```

---

### 10.7 足迹接口

#### 获取足迹地图

```http
GET /api/footprints
```

#### 手动点亮城市

```http
POST /api/footprints
```

请求示例：

```json
{
  "targetType": "city",
  "targetId": "city_hangzhou",
  "source": "manual",
  "firstVisitedAt": "2024-10-02",
  "visibility": "private"
}
```

#### 删除足迹

```http
DELETE /api/footprints/{footprintId}
```

---

### 10.8 照片记忆接口

#### 上传照片元数据

```http
POST /api/photo-memories/assets/batch
```

请求示例：

```json
{
  "assets": [
    {
      "localAssetId": "ios_asset_001",
      "takenAt": "2024-10-02T09:30:00+08:00",
      "latitude": 30.259,
      "longitude": 120.130,
      "width": 4032,
      "height": 3024,
      "uploadedOriginal": false
    }
  ]
}
```

#### 创建聚类任务

```http
POST /api/photo-memories/cluster
```

#### 获取候选旅行

```http
GET /api/photo-memories/clusters
```

#### 确认生成旅行

```http
POST /api/photo-memories/clusters/{clusterId}/confirm
```

---

### 10.9 天气导向接口

#### 获取周末推荐

```http
POST /api/weekend/recommendations
```

请求示例：

```json
{
  "departureCity": "深圳",
  "travelTimeLimitHours": 3,
  "transportMode": "public_transport",
  "targetWeather": "sunset",
  "dateRange": {
    "start": "2026-06-27",
    "end": "2026-06-28"
  },
  "interests": ["海边", "拍照", "咖啡"]
}
```

---

### 10.10 纪念品接口

#### 创建纪念品

```http
POST /api/souvenirs
```

#### 生成 3D 任务

```http
POST /api/souvenirs/{souvenirId}/generate-3d
```

#### 查询 3D 任务状态

```http
GET /api/souvenirs/{souvenirId}/model-status
```

---

## 11. AI 能力与编排

### 11.1 AI 原则

AI 不直接“凭空写攻略”，而是作为编排和表达层：

```text
用户输入
→ 意图解析
→ POI 检索
→ 路线计算
→ 规则排程
→ 大模型生成解释文案
→ 结构化 JSON 输出
→ 前端渲染
```

### 11.2 行程生成流程

#### Step 1：解析需求

输入用户自然语言和结构化字段，提取：

- 目的地；
- 天数；
- 预算；
- 兴趣；
- 节奏；
- 同行人；
- 交通方式；
- 必去/避开地点；
- 隐性偏好。

#### Step 2：检索候选 POI

根据目的地和兴趣检索：

- 景点；
- 餐厅；
- 咖啡；
- 商圈；
- 博物馆；
- 自然风光；
- 夜景；
- 亲子场所；
- 室内备选。

候选 POI 必须包含：

- 名称；
- 坐标；
- 类型；
- 地址；
- 推荐标签；
- 预计游玩时长。

#### Step 3：评分与筛选

POI 评分公式建议：

```text
poiScore =
  interestMatchScore * 0.35
+ popularityScore * 0.20
+ distanceScore * 0.20
+ budgetFitScore * 0.10
+ weatherFitScore * 0.05
+ noveltyScore * 0.10
```

#### Step 4：路线矩阵

对候选点位计算距离和时间矩阵：

```text
POI A → POI B：公共交通 32 分钟
POI B → POI C：步行 14 分钟
```

#### Step 5：每日排程

考虑：

- 每日活动时长；
- 点位营业时间；
- 餐饮时间；
- 通勤时间；
- 用户节奏；
- 必去点；
- 酒店位置；
- 晚上活动；
- 天气备选。

#### Step 6：生成结构化结果

大模型输出必须是 JSON，禁止只返回自然语言。

### 11.3 行程生成 JSON Schema

```json
{
  "title": "杭州 3 日慢游计划",
  "summary": "适合喜欢拍照、美食和寺庙的轻松路线。",
  "destination": "杭州",
  "days": [
    {
      "dayIndex": 1,
      "title": "西湖与湖滨慢逛",
      "summary": "第一天以经典西湖和湖滨夜景为主。",
      "estimatedBudget": 380,
      "estimatedTravelMinutes": 75,
      "stops": [
        {
          "name": "西湖",
          "sourcePoiId": "xxx",
          "category": "自然风光",
          "startTime": "09:30",
          "endTime": "12:00",
          "durationMinutes": 150,
          "reason": "杭州经典景点，适合初次到访和拍照。",
          "tags": ["拍照", "自然风光"]
        }
      ],
      "routes": [
        {
          "fromStopIndex": 0,
          "toStopIndex": 1,
          "transportMode": "public_transport",
          "durationMinutes": 25,
          "distanceMeters": 5200,
          "summary": "乘坐地铁和步行"
        }
      ],
      "foodSuggestions": [
        {
          "name": "湖滨附近杭帮菜",
          "budget": 120,
          "reason": "距离下一站较近"
        }
      ],
      "rainyDayAlternative": "如遇下雨，可将西湖步行替换为浙江省博物馆。"
    }
  ],
  "warnings": [
    "节假日西湖周边人流较大，建议提前出发。"
  ],
  "feasibilityScore": 82
}
```

### 11.4 AI Prompt 模板建议

#### 系统 Prompt

```text
你是一个专业旅行规划助手。你必须基于已提供的真实 POI、路线时间、营业信息和用户偏好生成行程。
禁止编造不存在的地点、坐标、营业时间、价格和路线。
当信息不足时，必须标记为“待确认”。
输出必须是符合指定 schema 的 JSON，不要输出 Markdown。
```

#### 用户 Prompt 结构

```text
用户需求：
{userInput}

用户偏好：
{preferences}

候选 POI：
{candidatePois}

路线矩阵：
{routeMatrix}

天气信息：
{weatherInfo}

约束：
1. 旅行天数为 {days}
2. 节奏为 {travelPace}
3. 交通方式为 {transportMode}
4. 必去地点为 {mustVisitPois}
5. 避开地点为 {avoidPois}
6. 每日活动不超过 {maxActivityHours} 小时
7. 输出 JSON
```

---

## 12. 算法设计

### 12.1 照片旅行聚类算法

#### 输入

```text
PhotoAssetMeta[]
```

#### 输出

```text
MemoryCluster[]
```

#### 简化算法

```text
1. 过滤没有 takenAt 的照片。
2. 将有坐标的照片按时间排序。
3. 将坐标反查为城市。
4. 识别用户常驻城市，作为日常地点。
5. 按城市和时间窗口聚类。
6. 如果某个非日常城市在连续 1-7 天内照片数超过阈值，则生成候选旅行。
7. 如果多个城市在短时间内连续出现，合并为跨城旅行。
8. 计算置信度。
9. 返回候选旅行给用户确认。
```

#### 置信度建议

```text
confidence =
  photoCountScore * 0.25
+ distanceFromHomeScore * 0.25
+ timeContinuityScore * 0.20
+ locationDensityScore * 0.20
+ poiDiversityScore * 0.10
```

### 12.2 天气导向推荐算法

#### 输入

- 出发城市；
- 交通时间上限；
- 目标天气；
- 日期范围；
- 交通方式；
- 兴趣偏好。

#### 输出

推荐目的地列表。

#### 简化流程

```text
1. 获取出发城市周边候选目的地。
2. 计算交通时间，过滤超过时间上限的地点。
3. 获取候选地点天气。
4. 根据目标天气计算天气匹配分。
5. 根据用户兴趣计算兴趣匹配分。
6. 根据目的地热度和新鲜度计算推荐分。
7. 返回 Top N 推荐。
```

#### 推荐分

```text
recommendScore =
  weatherMatchScore * 0.40
+ travelTimeScore * 0.25
+ interestMatchScore * 0.20
+ popularityScore * 0.10
+ noveltyScore * 0.05
```

### 12.3 路线排序算法

MVP 可以先采用启发式规则，不必一开始做复杂运筹优化。

规则：

1. 必去 POI 优先；
2. 同区域 POI 尽量放同一天；
3. 餐厅安排在午餐/晚餐时间附近；
4. 夜景类 POI 放晚上；
5. 室内 POI 可作为雨天备选；
6. 通勤时间过长则提示用户；
7. 用户锁定点位不自动移动。

---

## 13. 状态与异常

### 13.1 行程状态

```text
draft：AI 生成草稿
planned：用户保存的计划
ongoing：旅行进行中
completed：旅行已完成
archived：归档
```

### 13.2 AI 生成任务状态

```text
queued：排队中
processing：生成中
succeeded：成功
failed：失败
cancelled：取消
```

### 13.3 3D 生成任务状态

```text
none：未生成
queued：排队
processing：处理中
succeeded：成功
failed：失败
```

### 13.4 异常处理

| 场景 | 处理 |
|---|---|
| AI 生成失败 | 提示原因，允许重试 |
| POI 搜索失败 | 使用热门 POI 缓存或提示换目的地 |
| 路线计算失败 | 展示行程，但标记通勤待确认 |
| 天气 API 失败 | 展示缓存，标记更新时间 |
| 相册权限拒绝 | 展示手动添加旅行入口 |
| 图片上传失败 | 保留本地草稿 |
| 分享海报失败 | 允许重新生成 |
| 用户无网络 | 展示缓存行程，只读模式 |

---

## 14. 权限与隐私

### 14.1 权限清单

| 权限 | 触发时机 | 用途 | 是否必须 |
|---|---|---|---|
| 位置 | 用户使用当前城市/周末推荐时 | 判断出发城市和附近目的地 | 否 |
| 相册读取 | 用户点击从相册找回旅行时 | 读取照片时间和位置 | 否 |
| 相册写入 | 用户保存海报时 | 保存图片 | 否 |
| 相机 | 用户添加纪念品时 | 拍摄纪念品 | 否 |
| 通知 | 天气提醒/旅行提醒 | 提醒用户 | 否 |

### 14.2 分享隐私检查

用户分享前必须展示：

```text
即将分享以下信息：
- 行程城市
- 每日路线
- 景点名称
- 通勤时间
- 是否包含预算：否
- 是否包含酒店精确位置：否
- 是否包含照片：是/否
```

用户确认后才生成公开链接。

### 14.3 数据删除规则

- 删除 Trip：删除 DayPlan、TripStop、RouteSegment、BudgetItem、SharePoster 引用；
- 删除 Trip 不默认删除 PhotoAssetMeta，只解除关联；
- 删除 Footprint：只删除点亮记录，不删除 Trip；
- 删除账号：进入异步删除流程，清理用户数据和对象存储资源；
- 删除分享链接：公开页面立即不可访问。

---

## 15. 埋点设计

### 15.1 事件列表

| 事件名 | 触发时机 | 关键参数 |
|---|---|---|
| app_open | 打开 App | userId, platform |
| trip_create_start | 点击创建旅行 | source |
| trip_generate_click | 点击生成行程 | destination, days, budget |
| trip_generate_success | 行程生成成功 | duration, poiCount, score |
| trip_generate_fail | 行程生成失败 | errorCode |
| trip_save | 保存行程 | tripId |
| trip_edit_reorder | 调整点位顺序 | tripId, dayIndex |
| trip_stop_delete | 删除点位 | poiCategory |
| trip_stop_replace | 替换点位 | oldCategory, newCategory |
| poster_generate | 生成海报 | templateId |
| poster_share | 分享海报 | channel |
| footprint_add | 点亮城市 | source, cityId |
| album_permission_view | 查看相册授权说明 | source |
| album_permission_grant | 授权相册 | platform |
| memory_cluster_found | 找到候选旅行 | clusterCount |
| memory_confirm | 确认生成旅行 | photoCount, cityCount |
| weekend_recommend_click | 点击周末推荐 | weatherType |
| souvenir_create | 创建纪念品 | hasTripId |
| privacy_setting_change | 修改隐私设置 | settingKey |

---

## 16. 非功能需求

### 16.1 性能

| 场景 | 要求 |
|---|---|
| 首页加载 | 2 秒内展示首屏缓存 |
| AI 行程生成 | 复杂任务可异步，前端展示进度 |
| 地图拖拽排序 | 交互响应小于 300ms |
| 路线重新计算 | 尽量 5 秒内返回 |
| 海报生成 | 10 秒内生成，失败可重试 |
| 相册扫描 | 后台分批处理，不能卡死 UI |

### 16.2 可用性

- 核心功能无网络时可展示已保存行程；
- AI 生成失败不影响历史行程查看；
- 地图 API 失败时显示列表版行程；
- 相册权限拒绝时可以手动添加旅行。

### 16.3 安全

- 所有接口使用 HTTPS；
- 用户数据按 userId 隔离；
- 分享链接使用不可猜测 token；
- 私密行程不允许未授权访问；
- 对象存储资源需要签名 URL 或权限控制；
- 日志中不得记录精确照片坐标和原图内容。

### 16.4 合规

- 明示相册和位置用途；
- 默认最小化收集；
- 用户可撤回授权；
- 用户可删除数据；
- 对精确轨迹提供模糊化展示；
- 涉及未成年人/亲子场景时，不公开儿童照片和精确位置。

---

## 17. MVP 验收用例

### TC-001 生成基础行程

输入：

```text
目的地：杭州
天数：3
预算：2000
兴趣：拍照、美食、寺庙、咖啡
节奏：适中
交通：公共交通
```

预期：

- 生成 3 天行程；
- 每天有 3-5 个点位；
- 点位包含坐标；
- 点位间包含通勤时间；
- 有预算估算；
- 可保存。

### TC-002 删除点位后重新计算

操作：

```text
进入 Day 1
删除第 2 个 POI
```

预期：

- Day 1 时间轴更新；
- 前后路线重新计算；
- 总通勤时间更新；
- 保存后刷新仍保持删除状态。

### TC-003 拖拽排序

操作：

```text
将 Day 2 第 4 个 POI 拖到第 2 个
```

预期：

- 排序立即变化；
- 路线重新计算；
- 如果路线变差，出现提示；
- 用户可以确认或撤销。

### TC-004 分享海报隐藏预算

操作：

```text
生成行程海报
关闭“显示预算”
```

预期：

- 海报预览不显示预算；
- 保存后的图片不显示预算；
- 分享链接不显示预算。

### TC-005 手动点亮城市

操作：

```text
搜索“成都”
点击点亮
```

预期：

- 成都在地图上变为点亮状态；
- 城市详情页展示“去过 1 次”；
- 足迹统计更新。

### TC-006 相册权限拒绝

操作：

```text
点击从相册找回旅行
拒绝授权
```

预期：

- 不崩溃；
- 展示手动添加旅行入口；
- 用户可再次进入授权说明页。

### TC-007 生成失败降级

模拟：

```text
地图路线 API 失败
```

预期：

- 行程仍可展示；
- 通勤时间标记为“待确认”；
- 用户可保存；
- 系统提示稍后可重新计算路线。

---

## 18. 开发拆解建议

### 18.1 第 1 阶段：基础框架

目标：跑通 App 基础框架和数据结构。

任务：

1. 搭建前端项目；
2. 搭建后端项目；
3. 用户登录/游客模式；
4. Trip、DayPlan、POI、TripStop 数据表；
5. 创建旅行表单；
6. 行程详情页静态渲染；
7. 本地 mock 数据。

产出：

- 用户可以创建 mock 行程；
- 用户可以查看行程详情。

### 18.2 第 2 阶段：AI 行程生成

目标：从真实输入生成结构化行程。

任务：

1. 接入 LLM；
2. 定义 JSON Schema；
3. 实现 POI 检索接口；
4. 实现候选 POI 过滤；
5. 实现行程生成任务；
6. 实现生成中状态；
7. 实现失败重试。

产出：

- 输入目的地后能生成结构化行程；
- 结果可以保存。

### 18.3 第 3 阶段：地图与路线

目标：让行程变得可信和可编辑。

任务：

1. 接入地图 SDK；
2. POI 坐标展示；
3. 路线计算；
4. 时间轴拖拽；
5. 删除/替换/新增点位；
6. 重新计算通勤时间。

产出：

- 用户可以在地图上编辑行程；
- 通勤时间随调整变化。

### 18.4 第 4 阶段：足迹与分享

目标：形成旅行资产和传播。

任务：

1. 足迹地图；
2. 城市点亮；
3. 旅行与城市关联；
4. 海报模板；
5. 图片生成；
6. 分享链接；
7. 隐私检查。

产出：

- 用户可点亮城市；
- 用户可生成并分享行程海报。

### 18.5 第 5 阶段：照片记忆

目标：提升留存和情绪价值。

任务：

1. 相册授权说明；
2. 读取照片元数据；
3. 本地/服务端聚类；
4. 候选旅行确认页；
5. 生成旅行记忆；
6. 照片墙；
7. 隐私删除能力。

产出：

- 用户可从相册生成历史旅行。

### 18.6 第 6 阶段：天气导向与纪念品

目标：做差异化探索。

任务：

1. 周末氛围页；
2. 天气 API；
3. 交通半径筛选；
4. 推荐卡片；
5. 一键生成短途行程；
6. 纪念品卡片；
7. 图片抠图；
8. 3D 生成实验。

---

## 19. 推荐技术架构

### 19.1 前端

可选方案：

- 移动端优先：React Native / Flutter；
- Web 快速验证：Next.js；
- 小程序验证：中国市场可考虑微信小程序。

建议 MVP：

```text
先用 Web / 小程序验证产品闭环，再决定是否投入原生 App。
```

如果需要访问相册元数据和更好的地图体验，原生 App 或 React Native 会更合适。

### 19.2 后端

可选方案：

- Node.js + NestJS；
- Python + FastAPI；
- PostgreSQL；
- Redis；
- 对象存储；
- 队列任务系统。

建议服务：

```text
API Server
AI Orchestration Service
Map/POI Adapter
Weather Adapter
Photo Memory Worker
Poster Generation Worker
Object Storage
```

### 19.3 数据库表建议

核心表：

```text
users
preferences
trips
day_plans
pois
trip_stops
route_segments
budget_items
footprints
photo_assets
memory_clusters
souvenirs
share_posters
```

### 19.4 外部依赖

| 能力 | 依赖 |
|---|---|
| POI 搜索 | 高德/Google/Mapbox/内部库 |
| 路线计算 | 高德/Google/Mapbox |
| 天气 | 高德天气/Open-Meteo/商业天气 API |
| AI 生成 | LLM API |
| 图片生成海报 | 服务端 Canvas/SVG/HTML 转图片 |
| 相册访问 | iOS PhotoKit / Android MediaStore |
| 3D 生成 | 第三方 3D 生成模型或服务 |

---

## 20. AI Coding 任务提示词模板

### 20.1 让 AI 生成数据模型

```text
请根据 PRD 中的数据模型，使用 TypeScript + Prisma 生成数据库 schema。
要求：
1. 包含 users、preferences、trips、day_plans、pois、trip_stops、route_segments、footprints、share_posters。
2. 所有表包含 id、createdAt、updatedAt。
3. 设置合理外键关系。
4. Trip 删除时级联删除 day_plans、trip_stops、route_segments。
5. PhotoAssetMeta 暂不存原图，只存元数据。
```

### 20.2 让 AI 生成行程生成接口

```text
请实现 POST /api/trips/generate。
要求：
1. 接收 destination、days、budget、interests、travelPace、transportMode 等字段。
2. 创建异步 generationTask。
3. 从 POI service 获取候选点位。
4. 调用 LLM 生成符合 TripPlan JSON Schema 的结果。
5. 将结果保存为 draft Trip。
6. 返回 generationTaskId。
7. 包含错误处理和日志。
```

### 20.3 让 AI 生成前端页面

```text
请实现创建旅行页面。
要求：
1. 使用 React/Next.js。
2. 包含目的地、天数、预算、兴趣、节奏、同行人、交通方式字段。
3. 点击按钮调用 POST /api/trips/generate。
4. 生成中展示进度页。
5. 成功后跳转到 /trips/[tripId]。
6. 表单需要基础校验。
```

### 20.4 让 AI 生成地图编辑功能

```text
请实现行程地图编辑页面。
要求：
1. 左侧/上方展示地图，右侧/下方展示时间轴。
2. 支持拖拽 TripStop 顺序。
3. 拖拽后调用 PATCH /api/day-plans/{dayPlanId}/stops/reorder。
4. 接口返回新的 routeSegments 后更新 UI。
5. 支持删除、锁定、替换点位。
```

### 20.5 让 AI 生成测试用例

```text
请根据 PRD 的 MVP 验收用例，为后端接口生成集成测试。
重点覆盖：
1. AI 行程生成成功；
2. 生成失败；
3. 行程保存；
4. 点位重排；
5. 删除点位；
6. 足迹点亮；
7. 分享海报隐私字段隐藏。
```

---

## 21. 风险与对策

| 风险 | 严重度 | 说明 | 对策 |
|---|---|---|---|
| 产品范围过大 | 高 | 五个方向同时做会拖慢 MVP | 先做 AI 规划 + 足迹 |
| AI 行程不可信 | 高 | 编造地点或路线会损害信任 | POI 和路线必须来自真实数据源 |
| API 成本高 | 中 | 地图、天气、AI 都收费 | 缓存、限额、会员分层 |
| 隐私风险 | 高 | 相册、位置、轨迹敏感 | 默认私密、本地优先、可删除 |
| 相册元数据缺失 | 中 | 很多照片可能没有 GPS | 支持用户手动补地点 |
| 天气预测不准 | 中 | 晚霞/银河不保证 | 展示风险提示和置信度 |
| 3D 质量不稳定 | 中 | 单图生成模型可能效果差 | 做趣味功能，不作为核心 |
| 地图供应商限制 | 中 | 国内外 API 差异大 | 设计 Adapter 层 |
| 分享泄露位置 | 高 | 酒店和轨迹可能敏感 | 分享前隐私检查 |

---

## 22. 待确认问题

这些问题不影响 MVP 开发启动，但需要在产品迭代中逐步确认：

1. 首发平台：App、Web、小程序，还是多端？
2. 首发市场：中国大陆、海外，还是双市场？
3. 地图服务商：高德、腾讯、百度、Google、Mapbox？
4. 是否需要账号体系，还是先游客模式？
5. 是否允许用户上传原图到云端？
6. 是否做公开社区，还是只做私密分享？
7. 是否接酒店、门票、当地玩乐交易？
8. 3D 纪念品是否作为会员功能？
9. 是否需要多人协作规划？
10. 是否需要导出 PDF/Markdown/小红书文案？

---

## 23. MVP 成功标准

建议 MVP 上线后 4-8 周观察：

| 指标 | 目标 |
|---|---:|
| 首次行程生成完成率 | ≥ 60% |
| 行程保存率 | ≥ 35% |
| 分享海报生成率 | ≥ 20% |
| 足迹点亮率 | ≥ 30% |
| 7 日留存 | ≥ 15% |
| 用户行程满意评分 | ≥ 4.0 / 5 |
| 相册授权率 | ≥ 20% |
| 第二次行程创建率 | ≥ 15% |

如果满足：

- 行程保存率高；
- 分享率高；
- 用户愿意点亮足迹；

说明方向值得继续。

如果 AI 行程生成率高但保存率低，需要优先优化行程质量。

如果保存率高但留存低，需要加强足迹、相册记忆和年度报告。

---

## 24. 最小可开发版本定义

为了让 AI Coding 更容易启动，下面定义一个最小可开发版本。

### 24.1 最小功能

```text
1. 创建旅行表单
2. Mock/LLM 生成结构化行程
3. 行程详情页
4. 点位列表和每日时间轴
5. 保存行程
6. 手动点亮城市
7. 足迹地图列表版
8. 生成简单分享图
```

### 24.2 可暂时不做

```text
1. 真实地图路线
2. 真实天气推荐
3. 相册扫描
4. 3D 纪念品
5. 多人协作
6. 酒店/门票交易
7. 复杂会员体系
```

### 24.3 推荐第一周开发任务

1. 建立项目；
2. 建立数据模型；
3. 实现创建旅行表单；
4. 实现 Trip mock 数据；
5. 实现行程详情页；
6. 实现保存行程；
7. 实现足迹城市列表；
8. 准备后续接入地图和 AI。

---

## 25. 附录：示例行程展示文案

```text
杭州 3 日慢游计划

这是一条适合喜欢拍照、美食和寺庙的杭州路线。
整体节奏适中，第一天安排经典西湖和湖滨，第二天偏寺庙与茶园，第三天安排城市漫步和返程前轻松活动。

Day 1：西湖与湖滨夜景
09:30 - 12:00 西湖
12:20 - 13:30 午餐：湖滨附近杭帮菜
14:00 - 16:00 浙江省博物馆
16:30 - 18:00 湖滨步行街
18:30 - 20:00 晚餐与夜景

预计通勤：75 分钟
预计花费：380 元
提醒：节假日西湖周边人多，建议早出发。
```

---

## 26. 附录：第一版产品 slogan 方向

可选：

1. 让每次旅行，都成为可以回看的记忆。
2. AI 帮你规划路线，也帮你记住走过的路。
3. 从攻略到回忆，一站式旅行记忆助手。
4. 点亮你走过的世界。
5. 不只计划旅行，也收藏人生。

---

## 27. 结论

本产品的 0-1 核心不是做一个普通旅行攻略工具，而是构建一个旅行生命周期产品：

```text
规划 → 出行 → 记录 → 回忆 → 分享 → 再出发
```

MVP 最应优先打磨：

1. AI 行程规划的可信度；
2. 地图和路线编辑的可控性；
3. 足迹地图的情绪价值；
4. 分享海报的传播能力；
5. 隐私设计的安全感。

天气导向和 3D 纪念品非常有差异化，但建议在主闭环跑通后再重点投入。
