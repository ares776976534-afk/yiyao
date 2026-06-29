# RatingReview 评分组件

## 概述

评分组件用于展示商品的好评和差评信息，包含好评标签、评分统计和差评信息。

## 功能特性

- **好评部分**：
  - 显示推荐人数统计
  - **Tabs切换**：展示好评标签及人数，支持点击切换
  - 动态滑动下划线，跟随选中的tab移动
  - 展示详细标签及百分比
  - 查看好评按钮

- **差评部分**：
  - 显示差评信息
  - 当前支持"暂无差评"提示
  - 与好评部分间隔30px

- **交互效果**：
  - Tab切换时颜色变化（激活态：#6E50FF，默认态：#7C7F9A）
  - 底部滑动条平滑过渡动画（固定32px宽度，居中显示）
  - 响应窗口resize自动调整滑动条位置
  - **切换tab时显示对应的详细标签**，每个tab有独立的详细标签数据

## 使用方法

```tsx
import RatingReview from './components/RatingReview';

const mockData = {
  positiveCount: 345,
  positiveReviews: [
    {
      tag: '设计款式风格新颖',
      count: 286,
      detailTags: [
        { tag: '设计好看', percent: '22.22%' },
        { tag: '轻薄设计', percent: '5%' },
        { tag: '轻奢风', percent: '5%' },
      ],
    },
    {
      tag: '商品质量好',
      count: 96,
      detailTags: [
        { tag: '质量可靠', percent: '15%' },
        { tag: '做工精细', percent: '10%' },
      ],
    },
  ],
  negativeCount: 0,
  negativeReviews: [],
};

<RatingReview componentData={mockData} />
```

## Props 说明

### TypeRatingReviewProps

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| componentData | TypeRatingReviewData | 否 | 评分数据 |

### TypeRatingReviewData

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| positiveCount | number | 否 | 推荐人数 |
| positiveReviews | TypeReviewTag[] | 否 | 好评标签列表 |
| negativeCount | number | 否 | 差评人数 |
| negativeReviews | TypeReviewTag[] | 否 | 差评标签列表 |

### TypeReviewTag

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tag | string | 是 | 标签名称 |
| count | number | 是 | 标签人数 |
| detailTags | TypeDetailTag[] | 否 | 该tab下的详细标签列表 |

### TypeDetailTag

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tag | string | 是 | 详细标签名称 |
| percent | string | 是 | 百分比 |

## 样式说明

- 组件宽度: 100% (自适应父容器宽度)
- 好评卡片背景: #D8D0FF21
- 差评卡片背景: #FBFBFD
- 好评指示器颜色: #21A84A (绿色)
- 差评指示器颜色: #F55353 (红色)
- 差评与好评间距: 30px
- 卡片内边距: 24px

## 文件结构

```
RatingReview/
├── index.tsx           # 主组件
├── index.module.css    # 样式文件
├── types.ts           # 类型定义
└── README.md          # 说明文档
```

## 示例

查看 `/test/RatingReviewExample.tsx` 获取完整示例。

