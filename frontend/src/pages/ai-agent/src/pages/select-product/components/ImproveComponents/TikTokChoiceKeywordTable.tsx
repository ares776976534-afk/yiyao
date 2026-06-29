import CommonTable from '@/components/ChatFlow/CommonTable';
import LineChart from '@/components/ChatFlow/LineAreaChart';
import LiftData from '@/components/ChatFlow/LiftData';
import { observer } from 'mobx-react-lite';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { $t } from '@/i18n';

const columns = [
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.TikTokChoiceKeywordTable.keyword", "关键词"),
    dataIndex: 'keyword',
    key: 'keyword',
  },
  {
    title: (
      <div>
        <span className="mr-1">{$t("global-1688-ai-app.select-product.ImproveComponents.TikTokChoiceKeywordTable.gjjhf", "改进机会分")}</span>
        <Tooltip title={$t("global-1688-ai-app.select-product.ImproveComponents.TikTokChoiceKeywordTable.gjjhf", "改进机会分")}>
          <QuestionCircleOutlined />
        </Tooltip>
      </div>
    ),
    dataIndex: 'oppScore',
    key: 'oppScore',
  },
  {
    title: $t("global-1688-ai-app.select-product.ImproveComponents.TikTokChoiceKeywordTable.krqgh", "关键词销售额趋势(近12个月) "),
    dataIndex: 'demandInfo',
    key: 'demandInfo',
    render: (value, record) => {
      if (record?.demandInfo?.salesVolumeTrends && record?.demandInfo?.salesVolumeTrends.length > 0) {
        return (<div>
          <LineChart
            data={record?.demandInfo?.salesVolumeTrends || []}
            reflect={record?.demandInfo?.isBiggerHigherSalesVolumeTrends}
            toolTipYName={record?.demandInfo?.salesVolumeTrendsPointName}
          />
        </div>
        );
      } else {
        return '-';
      }
    },
  },
  {
    title: '',
    dataIndex: 'salesInfo',
    key: 'salesInfo',
    children: [
      {
        title: $t("global-1688-ai-app.select-product.ImproveComponents.TikTokChoiceKeywordTable.monthSales", "月销量"),
        dataIndex: 'soldCnt30d',
        key: 'soldCnt30d',
        render: (text, record) => {
          return (<div>
            <span>{record?.salesInfo?.soldCnt30d?.value}</span>
            <LiftData
              direction={record?.salesInfo?.soldCnt30d?.growthRate?.direction}
              text={record?.salesInfo?.soldCnt30d?.growthRate?.value}
            />
          </div>);
        },
      },
      {
        title: $t("global-1688-ai-app.select-product.ImproveComponents.TikTokChoiceKeywordTable.monthxse", "月销售额"),
        dataIndex: 'soldCnt30d',
        key: 'soldCnt30d',
        render: (text, record) => {
          return (<div>
            <span>{record?.salesInfo?.soldCnt30d?.value}</span>
            <LiftData
              direction={record?.salesInfo?.soldCnt30d?.growthRate?.direction}
              text={record?.salesInfo?.soldCnt30d?.growthRate?.value}
            />
          </div>);
        },
      },
    ],
  },
];

export const TikTokChoiceKeywordTable = observer((props: any) => {
  const { keywordList } = props;
  return (
    <CommonTable
      data={keywordList || []}
      columns={columns}
    />
  );
});