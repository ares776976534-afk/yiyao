# Spec: 下线速卖通订单管理「商家自寄」Tab

## Meta
- **日期**: 2026-06-22
- **作者**: Brant + Claude
- **状态**: In Progress
- **迭代**: o2 日常

## 目标
按产品要求，下线速卖通订单管理页的「商家自寄订单」Tab 页。下线后页面仅展示「上门揽订单」，不再有 Tab 切换交互。

## Done Contract
1. ✅ 代码以注释方式屏蔽（非物理删除），注释说明 `[2026-06-22] 产品要求下线商家自寄Tab`
2. ✅ 仅保留上门揽订单展示，Tab 切换 UI 隐藏（只剩一个 tab 无需展示 tab bar）
3. ✅ o2 迭代日常部署到预发
4. ✅ 预发页面验证: https://pre-air.1688.com/app/channel-fe/chain-work/aeorder.html?__mtop_subdomain__=wapa
5. ✅ spec + 测试验收报告单独提交

## 变更范围

### 主要改动文件（注释屏蔽方式）

| 文件 | 改动 |
|------|------|
| `src/pages/AeOrder/constants.js` | 注释掉 `ZJ` 常量和 aeTabList 中的商家自寄条目 |
| `src/pages/AeOrder/components/AeTab/index.jsx` | 注释掉 ZJ tab 渲染和 ZJ 条件渲染分支；隐藏 tab bar（只剩一个 tab） |
| `src/pages/AeOrder/components/AeOrderList/index.jsx` | 注释掉 `isSml` 分支中 ZJ 相关逻辑（ZJ 模式下的差异 UI） |
| `src/pages/AeOrder/components/AeSearchFilter/index.jsx` | 注释掉 ZJ 场景"运单编号"分支，统一为"揽收编号" |
| `src/pages/AeOrder/components/AeOrderList/index.scss` | 注释掉 `.zj` 样式块 |
| `src/pages/AliExpress/components/AeTab.jsx` | 注释掉 ZJ tab 和 ZJ 条件渲染 |
| `src/pages/AliExpress/components/AeOrderList.jsx` | 注释掉 ZJ 相关逻辑 |
| `src/pages/AliExpress/components/aeOrderList.scss` | 注释掉 `.zj` 样式块 |

### 不动的文件
- `src/pages/AeOrder/utils.js` — `delivery` action 保留（注释标注后续可清理）
- `src/pages/AeOrder/api.js` — 接口层不动
- `src/service/actions/aeOrder/` — 后端接口定义不动

## 注释格式
```javascript
// [2026-06-22 Offline] 产品要求下线商家自寄Tab，以下代码暂时注释保留
```

## 风险
- **低风险**: 纯前端 UI 隐藏，不影响后端逻辑
- **存量 ZJ 订单**: 已和产品确认下线入口即可，历史数据仍可通过 1688 交易订单详情页查看
- **两套页面同步**: AeOrder 和 AliExpress 两个目录都要同步改动

## 验证计划
1. 预发页面加载正常
2. 商家自寄 Tab 不可见
3. 上门揽订单列表正常展示、搜索、翻页
4. 批量创建/打印揽收单功能正常
