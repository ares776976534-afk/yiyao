import { $t } from '@/i18n';
export const columns = [
  {
    title: $t("global-1688-ai-app.seller-center.points-exchange.columns.exchangeTime", "兑换时间"),
    dataIndex: 'exchangeTime',
    key: 'exchangeTime',
    align: 'center',
    width: 200,
  },
  {
    title: $t("global-1688-ai-app.seller-center.points-exchange.columns.xhpoints", "消耗积分"),
    dataIndex: 'exchangePoint',
    key: 'exchangePoint',
    align: 'center',
    width: 150,
    render: (text: string) => {
      return <div>{$t("global-1688-ai-app.seller-center.points-exchange.columns.points", `${text}积分`, [text])}</div>;
    },
  },
  {
    title: $t("global-1688-ai-app.seller-center.points-exchange.columns.yaut", "已兑换数量"),
    dataIndex: 'exchangeToken',
    key: 'exchangeToken',
    align: 'center',
    width: 180,
    render: (text: string) => {
      return <div><span className="text-[#6150FF]">{text}</span>{$t("global-1688-ai-app.seller-center.points-exchange.columns.zf", "字符")}</div>;
    },
  },
  {
    title: $t("global-1688-ai-app.seller-center.points-exchange.columns.validityPeriod", "有效期"),
    dataIndex: 'endTime',
    key: 'endTime',
    align: 'center',
    width: 200,
  },
  {
    title: $t("global-1688-ai-app.seller-center.points-exchange.columns.zt", "状态"),
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: 120,
    render: (text: string) => {
      return (
        <div
          className="w-[88px] h-8 flex items-center px-4 py-1.5 gap-0.5 z-0 rounded-3xl text-sm font-normal leading-5 tracking-normal text-[#21B283]
           bg-[linear-gradient(109deg,#ECFCF0_0%,#F5FFF8_100%)] font-['PingFang_SC'] mx-auto"
        >{$t("global-1688-ai-app.seller-center.points-exchange.columns.exchangeSuccess", "兑换成功")}</div>
      );
    },
  },
];
