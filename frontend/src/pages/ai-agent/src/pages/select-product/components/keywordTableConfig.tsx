import LineChart from '@/components/ChatFlow/LineAreaChart';
import LiftData from '@/components/ChatFlow/LiftData';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { $t } from '@/i18n';

// 公共样式常量
const KEYWORD_COLUMN_WIDTH = '280px';
const TREND_COLUMN_WIDTH = '240px';
const KEYWORD_TRUNCATE_LENGTH = 74;

// 关键词文本截断样式
const keywordTruncateStyle = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  wordBreak: 'break-all' as const,
  lineHeight: '1.4',
  maxHeight: '2.8em',
};

// 渲染关键词列（带文本截断和 Tooltip）
const renderKeyword = (value: string, record: any) => {
  const _value = record?.showKeyword || record?.keyword || value;
  if (!_value) return '-';

  return (
    <div>
      <div>
        {_value.length > KEYWORD_TRUNCATE_LENGTH ? (
          <Tooltip title={_value} placement="top">
            <div style={keywordTruncateStyle}>{_value}</div>
          </Tooltip>
        ) : (
          _value
        )}
      </div>
      <div>
        {record?.keywordCn?.length > 32 ? (
          <Tooltip title={_value} placement="top">
            <div style={keywordTruncateStyle}>{record?.keywordCn}</div>
          </Tooltip>
        ) : (
          record?.keywordCn
        )}
      </div>
    </div>
  );
};

// 渲染关键词排名
const renderKeywordRank = (value: any) => {
  return <span>{value?.searchRank || '-'}</span>;
};

// 渲染关键词排名趋势（近12个月）
const renderKeywordTrend = (value: any, record: any) => {
  console.log('record', record)
  if (record?.demandInfo?.rankTrends && record?.demandInfo?.rankTrends.length > 0) {
    return (
      <div>
        <LineChart reflect={record?.demandInfo?.rankTrendsIsBiggerHigher} data={record.demandInfo.rankTrends} toolTipYName={record?.demandInfo?.rankTrendsPointName} />
      </div>
    );
  }
  return '-';
};

// 渲染带增长率的数据
const renderWithGrowthRate = (value: string | number | undefined, growthRate: any) => {
  return (
    <div>
      <span>{value || '-'}</span>
      {growthRate && (
        <LiftData
          direction={growthRate.direction}
          text={growthRate.value}
        />
      )}
    </div>
  );
};

// 创建机会分列标题
const createScoreColumnTitle = (text: string, tooltipText: string) => (
  <div>
    <span className="mr-1">{text}</span>
    <Tooltip title={tooltipText}>
      <QuestionCircleOutlined />
    </Tooltip>
  </div>
);

// 关键词列
const keywordColumn = {
  title: $t("global-1688-ai-app.select-product.keywordTableConfig.keyword", "关键词"),
  dataIndex: 'showKeyword',
  key: 'showKeyword',
  width: KEYWORD_COLUMN_WIDTH,
  render: renderKeyword,
};

// 关键词排名列（带平台参数）
const createKeywordRankColumn = (platform = 'amazon') => {
  return {
    title: platform !== 'tiktok' ? $t("global-1688-ai-app.select-product.keywordTableConfig.keywordpm", "关键词排名") : $t("global-1688-ai-app.select-product.keywordTableConfig.dut", "带货达人数量"),
    dataIndex: 'demandInfo',
    key: 'demandInfo',
    render: renderKeywordRank,
  };
};

// 关键词排名趋势列（带平台参数）
const createKeywordTrendColumn = (platform = 'amazon') => {
  return {
    title: platform !== 'tiktok' ? $t("global-1688-ai-app.select-product.keywordTableConfig.krsM", "关键词排名趋势（近12个月）") : $t("global-1688-ai-app.select-product.keywordTableConfig.dut.2", "带货达人数量趋势"),
    dataIndex: 'demandInfo',
    key: 'demandInfo',
    width: TREND_COLUMN_WIDTH,
    render: renderKeywordTrend,
  };
};

// 月销量子列
const soldCntColumn = {
  title: $t("global-1688-ai-app.select-product.keywordTableConfig.monthSales", "月销量"),
  dataIndex: 'soldCnt30d',
  key: 'soldCnt30d',
  render: (text: any, record: any) => {
    return renderWithGrowthRate(
      record?.salesInfo?.soldCnt30d?.value,
      record?.salesInfo?.soldCnt30d?.growthRate
    );
  },
};

// 月销量子列
const searchVolumeColumn = {
  title: $t("global-1688-ai-app.select-product.keywordTableConfig.monthSales", "月销量"),
  dataIndex: 'soldCnt30d',
  key: 'soldCnt30d',
  render: (text: any, record: any) => {
    return renderWithGrowthRate(
      record?.salesInfo?.soldCnt30d?.value,
      record?.salesInfo?.soldCnt30d?.growthRate
    );
  },
};

// 月销售额子列
const soldAmtColumn = {
  title: $t("global-1688-ai-app.select-product.keywordTableConfig.monthxse", "月销售额"),
  dataIndex: 'soldCnt30d',
  key: 'soldCnt30d',
  render: (value: any, record: any) => {
    return renderWithGrowthRate(
      record?.salesInfo?.soldAmt30d?.value?.amountWithSymbol,
      record?.salesInfo?.soldAmt30d?.growthRate
    );
  },
};

// 平均价格子列
const avgPriceColumn = {
  title: $t("global-1688-ai-app.select-product.keywordTableConfig.pjprice", "平均价格"),
  dataIndex: 'profitInfo',
  key: 'profitInfo',
  render: (text: any, record: any) => {
    return <span>{record?.profitInfo?.priceAvg?.value?.amountWithSymbol || '-'}</span>;
  },
};

// 平均评分子列
const avgRatingColumn = {
  title: $t("global-1688-ai-app.select-product.keywordTableConfig.pjrating", "平均评分"),
  dataIndex: 'supplyInfo',
  key: 'supplyInfo',
  render: (text: any, record: any) => {
    return <span>{record?.supplyInfo?.ratingAvg?.value || '-'}</span>;
  },
};

// 在售商品数子列
const itemCountColumn = {
  title: $t("global-1688-ai-app.select-product.keywordTableConfig.zsproducts", "在售商品数"),
  dataIndex: 'supplyInfo',
  key: 'supplyInfo',
  render: (text: any, record: any) => {
    return <span>{record?.supplyInfo?.itemCount?.value || '-'}</span>;
  },
};

// Top3商品成交占比子列
const monopolyCoefficientColumn = {
  title: $t("global-1688-ai-app.select-product.keywordTableConfig.Trt", "Top3商品成交占比"),
  dataIndex: 'supplyInfo',
  key: 'supplyInfo',
  render: (text: any, record: any) => {
    return <span>{record?.supplyInfo?.itemMonopolyCoefficient?.value || '-'}</span>;
  },
};
// 改进关键词亚马逊表格列配置
export const ImproveKeywordAmazonTableColumns = (platform: string) => {
  return [
    keywordColumn,
    createKeywordRankColumn(platform),
    createKeywordTrendColumn(platform),
    {
      title: '',
      dataIndex: 'salesInfo',
      key: 'salesInfo',
      children: [searchVolumeColumn, soldAmtColumn],
    },
  ]
};

// 改进选择关键词表格列配置
export const ImproveChoiceKeywordTablecolumns = (platform: string) => [
  keywordColumn,
  {
    title: createScoreColumnTitle($t("global-1688-ai-app.select-product.keywordTableConfig.gjjhf", "改进机会分"), $t("global-1688-ai-app.select-product.keywordTableConfig.gjjhf", "改进机会分")),
    dataIndex: 'oppScore',
    key: 'oppScore',
  },
  createKeywordRankColumn(platform),
  createKeywordTrendColumn(platform),
  {
    title: '',
    dataIndex: 'salesInfo',
    key: 'salesInfo',
    children: [searchVolumeColumn],
  },
];

// 平台选择关键词表格迁移列配置
export const PlatformChoiceKeywordTablemigrateColumns = (platform: string) => [
  keywordColumn,
  {
    title: createScoreColumnTitle($t("global-1688-ai-app.select-product.keywordTableConfig.qyjhf", "迁移机会分"), $t("global-1688-ai-app.select-product.keywordTableConfig.qyjhf", "迁移机会分")),
    dataIndex: 'oppScore',
    key: 'oppScore',
  },
  createKeywordRankColumn(platform),
  createKeywordTrendColumn(platform),
  {
    title: '',
    dataIndex: 'salesInfo',
    key: 'salesInfo',
    children: [soldCntColumn],
  },
];

/**
 * 关键词亚马逊表格选择列配置
 */
export const KeywordAmazonTablechoiceColumns = (platform: string) => [
  keywordColumn,
  createKeywordRankColumn(platform),
  createKeywordTrendColumn(platform),
  {
    title: $t("global-1688-ai-app.select-product.keywordTableConfig.krdb", "关键词商品样本库"),
    dataIndex: 'salesInfo',
    key: 'salesInfo',
    children: [
      soldCntColumn,
      soldAmtColumn,
      avgPriceColumn,
      avgRatingColumn,
      itemCountColumn,
      monopolyCoefficientColumn,
    ],
  },
];