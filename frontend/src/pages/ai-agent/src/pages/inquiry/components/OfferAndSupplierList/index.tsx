import React from 'react';
import { Avatar, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import IndexBlock from '../IndexBlock';
import { WantWantIcon } from '@/components/Icon';
import { getNumberIcon } from '../FormatList/RightComponents/numberIconConfig';
import styles from './index.module.css';
import { $t } from '@/i18n';

interface TypeOfferInfo {
  offerId: string;
  price: string;
  img: string;
  title: string;
}

interface TypeSupplierInfo {
  headImg: string;
  companyName: string;
  wangwangId: string;
  memberId: string;
}

interface TypeOfferAndSupplierItem {
  offerInfo: TypeOfferInfo;
  supplierInfo: TypeSupplierInfo;
}

interface TypeOfferAndSupplierListProps {
  data?: TypeOfferAndSupplierItem[];
  onDelete?: (item: TypeOfferAndSupplierItem) => void;
  disabled?: boolean;
  number?: number; // 数字序号
}

const OfferAndSupplierList: React.FC<TypeOfferAndSupplierListProps> = ({
  data = [],
  onDelete,
  disabled = false,
  number = 1,
}) => {
  const NumberIcon = getNumberIcon(number);
  const handleDelete = React.useCallback((item: TypeOfferAndSupplierItem) => {
    if (disabled || !onDelete) {
      return;
    }
    // 如果只剩最后一个item，不允许删除
    if (data.length === 1) {
      message.warning($t('global-1688-ai-app.inquiry.OfferAndSupplierList.deleteWarning', '询盘商品与供应商不能为空，请回到找商Agent重新勾选'));
      return;
    }
    onDelete(item);
  }, [disabled, onDelete, data.length]);

  return (
    <IndexBlock
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <NumberIcon />
          <span>{$t("global-1688-ai-app.inquiry.OfferAndSupplierList.title", "询盘商品与供应商")}</span>
        </div>
      }
    >
      <div className={styles.offerAndSupplierList}>
        {data.map((item, index) => (
          <div key={`${item.offerInfo.offerId}-${item.supplierInfo.memberId}-${index}`} className={styles.card}>
            {/* 供应商信息区域 */}
            <div className={styles.supplierSection}>
              <Avatar
                src={item.supplierInfo.headImg}
                size={46}
                shape="square"
                style={{ borderRadius: 6, flexShrink: 0 }}
              />
              <div className={styles.supplierInfo}>
                <div className={styles.supplierName}>{item.supplierInfo.companyName}</div>
                <div className={styles.supplierMeta}>
                  <WantWantIcon className={styles.supplierIcon} />
                  <span className={styles.supplierId}>{item.supplierInfo.wangwangId}</span>
                </div>
              </div>
              <div
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDelete(item);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={$t("global-1688-ai-app.inquiry.OfferAndSupplierList.delete", "删除")}
                style={{
                  opacity: disabled ? 0.3 : 1,
                  pointerEvents: disabled ? 'none' : 'auto',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                <CloseOutlined className={styles.deleteIcon} />
              </div>
            </div>
            {/* 商品信息区域 */}
            <div className={styles.offerSectionWrapper}>
              <div className={styles.offerSection}>
                <img
                  src={item.offerInfo.img}
                  alt={item.offerInfo.title}
                  className={styles.offerImage}
                />
                <div className={styles.offerInfo}>
                  <div className={styles.offerTitle} title={item.offerInfo.title}>
                    {item.offerInfo.title}
                  </div>
                  <div className={styles.offerPrice}>¥{item.offerInfo.price}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </IndexBlock>
  );
};

export default OfferAndSupplierList;

