import * as clipboard from "clipboard-polyfill";
import styles from './autoOrderInfo.module.css';
import CommonTable from '@/components/ChatFlow/CommonTable';
import { autoOrderInfoSchema } from './autoOrderInfoSchema';
import { message } from 'antd';
import { CheckCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { $t } from '@/i18n';

function AutoOrderInfo({ autoOrderInfo }: { autoOrderInfo: any[] | undefined }) {
  const data = autoOrderInfo?.map((ele) => ({...ele, ...ele.orderInfo})) || [];
  const [messageApi, contextHolder] = message.useMessage();
  const MessageContact = (params) => {
    messageApi.open({
      className: styles.messageContact,
      ...params,
    });
  };
  // 复制订单号功能
  const handleCopyOrderId = () => {
    const orderId = data[0]?.orderId;
    if (orderId) {
        clipboard.writeText(orderId).then(() => {
            MessageContact({
                content: $t("global-1688-ai-app.inquiry.InquiryReport.AutoOrderInfo.onry", "订单号已复制到剪贴板"),
                icon: <CheckCircleFilled style={{ color: '#fff', fontSize: 16 }} />
            });
        }).catch(() => {
            // 降级处理：使用传统方法复制
            const textArea = document.createElement('textarea');
            textArea.value = orderId;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                MessageContact({
                    content: $t("global-1688-ai-app.inquiry.InquiryReport.AutoOrderInfo.onry", "订单号已复制到剪贴板"),
                    icon: <CheckCircleFilled style={{ color: '#fff', fontSize: 16 }} />
                });
            } catch (err) {
                MessageContact({
                    icon: <ExclamationCircleFilled style={{ color: '#fff', fontSize: 16 }} />,
                    content: $t("global-1688-ai-app.inquiry.InquiryReport.AutoOrderInfo.caqp", "复制失败，请手动复制"),
                });
            }
            document.body.removeChild(textArea);
        });
    }
};
  return (
    <div className={styles.autoOrderInfo}>
      <div className={styles.header}>
        <div className={styles.headerTitleRow}>
          <div className={styles.headerAccent} />
          <h2 className={styles.headerTitle}>{$t("global-1688-ai-app.inquiry.InquiryReport.AutoOrderInfo.zcea", "自动下单详情")}</h2>
        </div>
        {autoOrderInfo && autoOrderInfo[0]?.reason && (
          <div className={styles.headerDescription}>
            {autoOrderInfo[0]?.reason}
          </div>
        )}
      </div>
      {data?.length > 0 ? (
        <CommonTable className={styles.autoOrderTable} data={data} columns={autoOrderInfoSchema(data, handleCopyOrderId)} containerWidth={1200} />
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <img className={styles.emptyImg} src="https://img.alicdn.com/imgextra/i2/O1CN01EL8zwu1v0tSCdENC2_!!6000000006111-2-tps-200-200.png" alt="" srcSet="" />
            <div className={styles.emptyText}>{$t("global-1688-ai-app.inquiry.InquiryReport.AutoOrderInfo.zpzrn", "正在执行询盘任务，暂未创建订单，请耐心等待")}</div>
          </div>
        </div>
      )}
      {contextHolder}
    </div>
  );
}

export default AutoOrderInfo;