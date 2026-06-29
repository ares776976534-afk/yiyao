# 测试验收报告：下线速卖通订单管理「商家自寄」Tab

## 基本信息

| 项目 | 值 |
|------|-----|
| 需求 | 产品要求下线速卖通订单管理页「商家自寄订单」Tab |
| 分支 | `feature/offline-ae-zj-tab` |
| Commit | `b7e0ac6d feat: 下线速卖通订单管理页「商家自寄」Tab` |
| O2 迭代 | 16814021（下线速卖通商家自寄Tab，v0.0.304） |
| O2 任务 | 149497185（日常构建，pub_status: 3 succeeded） |
| Aone 任务 | 83364580 |
| 验证环境 | 预发 |
| 预发地址 | `https://pre-air.1688.com/app/channel-fe/chain-work/aeorder.html?__mtop_subdomain__=wapa` |
| 验证时间 | 2026-06-22 |

## 验证结果

### 总结：✅ 全部通过

### 逐项验证

| # | 检查项 | 预期结果 | 实际结果 | 状态 |
|---|--------|----------|----------|------|
| 1 | 预发页面加载正常 | 页面正常渲染，无白屏/JS报错 | 页面标题「速卖通订单」正常显示，提示信息完整渲染 | ✅ |
| 2 | 商家自寄 Tab 不可见 | Tab 栏隐藏，无「上门揽收订单/商家自寄订单」切换入口 | Tab 栏完全隐藏，页面直接展示订单列表，无任何 Tab 切换 UI | ✅ |
| 3 | 上门揽收订单列表正常 | 表头和数据区域正常渲染 | 表头完整：商品信息、规格、单价、数量、订单总额、订单状态、操作 | ✅ |
| 4 | 搜索筛选区域正常 | 搜索字段为揽收编号（非物流单号） | 筛选区包含：订单状态、订单标题、下单时间、订单编号、揽收编号，符合预期 | ✅ |
| 5 | 批量操作按钮可见 | 「批量创建揽收单」和「批量打印揽收单」按钮可见 | 两个按钮均可见，未选中订单时为 disabled 状态（正常行为） | ✅ |
| 6 | 全选 checkbox 可见 | 列表支持全选 | 全选 checkbox 可见 | ✅ |

## 证据

- 预发截图：`/tmp/ae-zj-tab-staging-3.png`（弹窗关闭后主页面）
- 全屏截图：`/tmp/ae-zj-tab-staging-full.png`
- O2 构建日志：Task 149497185，Flow 114910999，所有阶段 DONE
- 交互元素快照确认无 Tab 切换相关 DOM 元素

## 变更文件

```
src/pages/AeOrder/constants.js                        — 注释ZJ常量和aeTabList条目
src/pages/AeOrder/components/AeTab/index.jsx          — 隐藏Tab栏、注释ZJ渲染
src/pages/AeOrder/components/AeSearchFilter/index.jsx — 统一为揽收编号
src/pages/AeOrder/components/AeOrderList/index.jsx    — 固定SML className和rowSelection
src/pages/AeOrder/components/AeOrderList/index.scss   — 注释.zj样式
src/pages/AliExpress/components/AeTab.jsx             — 隐藏Tab栏、注释ZJ渲染
src/pages/AliExpress/components/AeOrderList.jsx       — 固定SML className和rowSelection
src/pages/AliExpress/components/aeOrderList.scss      — 注释.zj样式
```

## 风险与备注

- 代码以注释方式屏蔽（非物理删除），注释标注 `// [2026-06-22 Offline] 产品要求下线商家自寄Tab`，方便后续回滚
- `AeOrder/` 和 `AliExpress/` 两套实现已同步修改
- `ZJ` 常量本身保留（避免引用报错），只注释了 `aeTabList` 条目和 UI 渲染
- 当前预发账号无订单数据，列表显示「没有数据」，属正常现象，不影响功能验证

## 结论

预发验证通过，商家自寄 Tab 已成功下线，上门揽收订单管理功能不受影响。可进入正式发布流程。
