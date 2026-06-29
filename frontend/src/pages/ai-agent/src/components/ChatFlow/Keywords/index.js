import { $t } from '@/i18n';

export const tikTokColumns = [
    {
        title: $t("global-1688-ai-app.ChatFlow.Keywords.keyword", "关键词"),
        dataIndex: 'keywords',
        key: 'keywords',
    },
    {
        title: $t("global-1688-ai-app.ChatFlow.Keywords.keywordyb", "关键词样本"),
        dataIndex: 'keywordsSample',
        key: 'keywordsSample',
        children: [
            {
                title: $t("global-1688-ai-app.ChatFlow.Keywords.monthSales", "月销量"),
                dataIndex: 'monthlySales',
                key: 'monthlySales',
                render: (text, record) => {
                    return <span>{record?.keywordsSample?.monthlySales?.value}</span>;
                },
            },
            {
                title: $t("global-1688-ai-app.ChatFlow.Keywords.monthxse", "月销售额"),
                dataIndex: 'monthlySalesQuota',
                key: 'monthlySalesQuota',
                render: (text, record) => {
                    return <span>{record?.keywordsSample?.monthlySalesQuota?.value}</span>;
                },
            },
            {
                title: $t("global-1688-ai-app.ChatFlow.Keywords.pjprice", "平均价格"),
                dataIndex: 'price',
                key: 'price',
                render: (text, record) => {
                    return <span>{record?.keywordsSample?.price?.value}</span>;
                },
            },
            {
                title: $t("global-1688-ai-app.ChatFlow.Keywords.pjrating", "平均评分"),
                dataIndex: 'averageRating',
                key: 'averageRating',
                render: (text, record) => {
                    return <span>{record?.keywordsSample?.averageRating?.value}</span>;
                },
            },
            {
                title: $t("global-1688-ai-app.ChatFlow.Keywords.dxproducts", "动销商品数"),
                dataIndex: 'sellThroughNum',
                key: 'sellThroughNum',
                render: (text, record) => {
                    return <span>{record?.keywordsSample?.sellThroughNum?.value}</span>;
                },
            },
            {
                title: $t("global-1688-ai-app.ChatFlow.Keywords.Trt", "Top3商品成交占比"),
                dataIndex: 'supplyInfo',
                key: 'supplyInfo',
                render: (text, record) => {
                    const value = record?.supplyInfo?.itemMonopolyCoefficient?.value;
                    return (<span>
                        {value}
                    </span>);
                },
            },
        ],
    },
];
