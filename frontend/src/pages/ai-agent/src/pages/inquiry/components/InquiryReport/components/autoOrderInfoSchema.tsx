import styles from './autoOrderInfo.module.css';
import { CopyIcon } from '@/components/Icon';
import { ColorfulBtn } from '@/components/ChatFlow/ColorfulBtn';
import { $t } from '@/i18n';

export const autoOrderInfoSchema = (data: any[], handleCopyOrderId: () => void) => {
    return [
        {
            title: (
                <div className={styles.titleContainer}>
                    {data[0]?.orderId && (
                        <div className={styles.title}>
                            <span>{$t("global-1688-ai-app.inquiry.InquiryReport.autoOrderInfoSchema.onr", `订单号：${data[0]?.orderId}`, [data[0]?.orderId])}</span>
                            <CopyIcon 
                                style={{ cursor: 'pointer' }}
                                onClick={handleCopyOrderId}
                            />
                        </div>
                    )}
                    {data[0]?.orderId && data[0]?.orderTime && <div className={styles.titleSeparator} />}
                    {data[0]?.orderTime && <div className={styles.title}>{$t("global-1688-ai-app.inquiry.InquiryReport.autoOrderInfoSchema.poT", `下单时间：${data[0]?.orderTime}`, [data[0]?.orderTime])}</div>}
                </div>
            ),
        dataIndex: 'name',
        key: 'name',
        width: 800,
        render: (v, record) => {
            const { title, skuName, sendTime, img, price, amount, totalPrice } = record || {};
            return (
                <div className={styles.sellerInfo}>
                    <div className={styles.sellerInfoItem}>
                        {img && <img className={styles.sellerInfoItemImg} src={img} alt="" />}
                        <div className={styles.sellerInfoItemContent}>
                            <div className={styles.sellerInfoItemContentTitle}>{title}</div>
                            <div className={styles.sellerInfoItemContentSkuInfo}>{skuName}</div>
                            <div className={styles.sellerInfoItemContentTime}>{$t("global-1688-ai-app.inquiry.InquiryReport.autoOrderInfoSchema.eahm", `预计发货时间：${sendTime}`, [sendTime])}</div>
                        </div>
                    </div>
                    <div className={styles.cardInfo}>
                        <div className={styles.cardItem}>
                            <div className={styles.cardTitle}>{$t("global-1688-ai-app.inquiry.InquiryReport.autoOrderInfoSchema.dj", "单价")}</div>
                            <div className={styles.cardValue}>{price}</div>
                        </div>
                        <div className={styles.cardItem}>
                            <div className={styles.cardTitle}>{$t("global-1688-ai-app.inquiry.InquiryReport.autoOrderInfoSchema.quantity", "数量")}</div>
                            <div className={styles.cardValue}>{amount}</div>
                        </div>
                        <div className={styles.cardItem}>
                            <div className={styles.cardTitle}>{$t("global-1688-ai-app.inquiry.InquiryReport.autoOrderInfoSchema.totalAmount", "总金额")}</div>
                            <div className={styles.cardValue}>{totalPrice}</div>
                        </div>
                    </div>
                </div>
            )
        }
    },
    {
        dataIndex: 'supplierName',
        key: 'name',
        render: (v, record) => {
            const { supplierName } = record || {};
            return (
                <div className={styles.supplierInfo}>
                    <div className={styles.supplierInfoTitle}>{$t("global-1688-ai-app.inquiry.InquiryReport.autoOrderInfoSchema.gysmc", "供应商名称")}</div>
                    <div className={styles.supplierInfoValue}>{supplierName}</div>
                </div>
            )
        }
    },
    {
        dataIndex: 'action',
        key: 'action',
        width: 124,
        render: (v, record) => {
            const handleToOrder = (row) => {
                window.open(`https://air.1688.com/app/ctf-page/trade-order-detail/index.html?orderId=${row?.orderId}`, '_blank');
            }
            return (
                <div className={styles.actionColumn}>
                    <ColorfulBtn title={$t("global-1688-ai-app.inquiry.InquiryReport.autoOrderInfoSchema.qpay", "去付款")} onClick={() => { handleToOrder(record) }} />
                </div>
            )
        }
    }];
};