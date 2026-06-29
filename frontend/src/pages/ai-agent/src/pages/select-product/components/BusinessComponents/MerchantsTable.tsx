import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import CommonTable from '@/components/ChatFlow/CommonTable';
import styles from './merchantsTable.module.css';
import { Tooltip, Checkbox } from 'antd';
import { SuperFactoryIcon, CattleIcon, MoneyShieldIcon, FreeShippingIcon, QualityIcon } from '@/components/Icon';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';
import { $t } from '@/i18n';
const tagIcon = {
  pmplus: <SuperFactoryIcon />, // 超级工厂
  sourceProvider: null, // 源头工厂
  pm: <CattleIcon />, // 实力商家
  tp: null, // 诚信通 5 年
}

interface MerchantsTableData {
  offerId: number;
  memberId: string;
  offerBaseInfo: {
    offerUrl: string;
    price: string;
    title: string;
    offerTags: string[];
  },
  providerBaseInfo: {
    companyName: string;
    primaryCate: string;
    homePageUrl: string;
    providerTags: {
      code: string;
      value: string;
    }[];
  },
  // 售卖情况
  saleInfo: {
    sold30d: string;
    launchDate: string;
  },
  // 履约发货
  fulfillmentInfo: {
    // 发货履约率
    fulfillmentRate30d: string;
    // 揽收率
    hour48collectionRate30d: string;
    shipFrom: string;
  },
  // 商家服务
  providerServiceInfo: {
    // 退款率
    refundRate30d: string;
    // 旺旺响应率
    wwResponseRate30d: string;
    // 回头率
    repurchaseRate90d: string;
    // 品质综合服务分
    qualityCompositeScore: string;
    otherService: string;
  }
}

interface MerchantsTableProps {
  data?: MerchantsTableData[];
  highlightedOfferId?: number | null;
  hasRowSelection?: boolean;
  onCheckChange?: (selectedRowKey: any) => void;
  recommendList?: {
    offerId: number;
    memberId: string;
    offerBaseInfo: {
      offerUrl: string;
      price: string;
      title: string;
      offerTags: string[];
    };
  }[];
  isCheckbox?: boolean;
  checkedRowKeys?: any[];
}

export interface MerchantsTableRef {
  highlightItem: (offerId: number) => void;
}

const MerchantsTable = forwardRef<MerchantsTableRef, MerchantsTableProps>(({ data = [], highlightedOfferId, hasRowSelection = false, onCheckChange, recommendList = [], isCheckbox = false, checkedRowKeys = [] }, ref) => {
  const [flashingOfferId, setFlashingOfferId] = useState<number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    highlightItem: (offerId: number) => {
      setFlashingOfferId(offerId);

      // 滚动到对应的表格行
      setTimeout(() => {
        const targetRow = document.querySelector(`[data-offer-id="${offerId}"]`);
        if (targetRow) {
          targetRow.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);

      // 3秒后停止闪烁
      setTimeout(() => {
        setFlashingOfferId(null);
      }, 3000);
    }
  }));

  const isFlashing = (offerId: number) => {
    return flashingOfferId === offerId || highlightedOfferId === offerId;
  };
  const columns = [
    {
      title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.productInformation", "商品信息"),
      dataIndex: 'offerBaseInfo',
      key: 'offerBaseInfo',
      width: 200,
      fixed: 'left',
      render: (value, record, index) => {
        const isCheckboxDisabled = isCheckbox && checkedRowKeys.length >= 5 && !checkedRowKeys.includes(record?.offerId);
        const isCheckboxChecked = isCheckbox && checkedRowKeys.includes(record?.offerId);
        return (
          <div className={styles.itemContainer}>
            {recommendList?.length >= index + 1 ? record?.offerBaseInfo?.offerTags?.map((ele: string, tagIndex: number) => (
              <div key={`tag-${tagIndex}-${ele}`} className={styles.itemTag}>
                <span className={styles.itemTagText}>{ele}</span>
                <span className={styles.itemTagNumber}>#{index + 1}</span>
              </div>
            )) : null}
            {isCheckbox ? <Checkbox disabled={isCheckboxDisabled} checked={isCheckboxChecked} onChange={() => onCheckChange && onCheckChange(record?.offerId)} /> : null}
            <FrostedGlass
              style={{ width: 44, height: 44 }} 
              riskStatus={record?.riskStatus} 
              imageUrl={record?.offerBaseInfo?.imageUrl} 
              productUrl={record?.offerBaseInfo?.offerUrl  || ''}
            />
            <div className={styles.offerBaseInfo}>
              {
                record?.offerBaseInfo?.title?.length < 8 ? (
                  <div className={styles.itemTitle}>{record?.offerBaseInfo?.title}</div>
                ) : (
                  <Tooltip placement="top" title={record?.offerBaseInfo?.title} arrow={true}>
                    <div className={styles.itemTitle}>{record?.offerBaseInfo?.title}</div>
                  </Tooltip>
                )
              }
              <div className={styles.itemPrice}>
                {typeof record?.offerBaseInfo?.price === 'string'
                  ? record?.offerBaseInfo.price
                  : typeof record?.offerBaseInfo?.price === 'object' && record?.offerBaseInfo?.price?.amountWithSymbol
                    ? record?.offerBaseInfo.price.amountWithSymbol
                    : record?.offerBaseInfo?.price?.amount
                      ? `${record?.offerBaseInfo.price.currencySymbol || '$'}${record?.offerBaseInfo.price.amount}`
                      : $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.pricedx", "价格待询")}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.gft", "供应商信息"),
      dataIndex: 'providerBaseInfo',
      key: 'providerBaseInfo',
      width: 200,
      render: (value, record) => {
        return (
          <div className={styles.merchantInfo}>
            <div className={styles.merchantName} onClick={() => window.open(record?.providerBaseInfo?.homePageUrl, '_blank')}>{record?.providerBaseInfo?.companyName}</div>
            {record?.providerBaseInfo?.providerTags?.length > 0 && (
              <div className={styles.merchantTag}>
                {
                  record?.providerBaseInfo?.providerTags?.map((tag, tagIndex) => (
                    <div key={`provider-tag-${tagIndex}-${tag.code}`} className={`${styles.merchantTagItem} ${styles[tag.code]}`}>
                      {tagIcon[tag.code]}
                      {tag.value}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: (
        <div className={styles.titleContainer}>
          <MoneyShieldIcon />
          <span>{$t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.smqk", "售卖情况")}</span>
        </div>
      ),
      dataIndex: 'saleInfo',
      key: 'saleInfo',
      children: [
        {
          title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.pc0a", "商品最近30天销量"),
          dataIndex: 'sold30d',
          key: 'sold30d',
          render: (text, record) => <div>{record?.saleInfo?.sold30d}</div>,
        },
        {
          title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.pci", "商品上架时间"),
          dataIndex: 'launchDate',
          key: 'launchDate',
          render: (text, record) => <div>{record?.saleInfo?.launchDate}</div>,
        },
      ],
    },
    {
      title: (
        <div className={styles.titleContainer}>
          <FreeShippingIcon />
          <span>{$t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.lyship", "履约发货")}</span>
        </div>
      ),
      dataIndex: 'fulfillmentInfo',
      key: 'fulfillmentInfo',
      children: [
        {
          title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.shiplyl", "发货履约率"),
          dataIndex: 'fulfillmentRate30d',
          key: 'fulfillmentRate30d',
          render: (text, record) => <div>{record?.fulfillmentInfo?.fulfillmentRate30d}</div>,
        },
        {
          title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.48hourlsl", "48小时揽收率"),
          dataIndex: 'hour48collectionRate30d',
          key: 'hour48collectionRate30d',
          render: (text, record) => <div>{record?.fulfillmentInfo?.hour48collectionRate30d}</div>,
        },
        {
          title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.ond", "产地/发货地"),
          dataIndex: 'shipFrom',
          key: 'shipFrom',
          render: (text, record) => <div>{record?.fulfillmentInfo?.shipFrom}</div>,
        },
      ],
    },
    {
      title: (
        <div className={styles.titleContainer}>
          <QualityIcon />
          <span>{$t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.merchantService", "商家服务")}</span>
        </div>
      ),
      dataIndex: 'providerServiceInfo',
      key: 'providerServiceInfo',
      children: [
        {
          title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.gel", "工厂品质退款率"),
          dataIndex: 'refundRate30d',
          key: 'refundRate30d',
          render: (text, record) => <div>{record?.providerServiceInfo?.refundRate30d}</div>,
        },
        {
          title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.cmrx", "客服响应率"),
          dataIndex: 'wwResponseRate30d',
          key: 'wwResponseRate30d',
          render: (text, record) => <div>{record?.providerServiceInfo?.wwResponseRate30d}</div>,
        },
        {
          title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.zj90dayhtl", "最近90天回头率"),
          dataIndex: 'repurchaseRate90d',
          key: 'repurchaseRate90d',
          render: (text, record) => <div>{record?.providerServiceInfo?.repurchaseRate90d}</div>,
        },
        {
          title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.phi", "品质体验综合服务分"),
          dataIndex: 'qualityCompositeScore',
          key: 'qualityCompositeScore',
          render: (text, record) => <div>{record?.providerServiceInfo?.qualityCompositeScore}</div>,
        },
        {
          title: $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsTable.qtservice", "其他服务"),
          dataIndex: 'otherService',
          key: 'otherService',
          render: (text, record) => <div>{record?.providerServiceInfo?.otherService}</div>,
        },
      ],
    },
  ];

  return (
    <div ref={tableRef}>
      <CommonTable
        columns={columns}
        data={data}
        rowClassName={(record: MerchantsTableData) => {
          const className = isFlashing(record?.offerId) ? `${styles.flashingRow}` : '';
          if (className) {
            console.log('应用闪烁样式到商品:', record?.offerId, className);
          }
          return className;
        }}
        onRow={(record: MerchantsTableData) => ({
          'data-offer-id': record?.offerId,
        } as React.HTMLAttributes<any>)}
      // hasRowSelection={hasRowSelection}
      // onCheckRowChange={onCheckRowChange}
      />
    </div>
  );
});

MerchantsTable.displayName = 'MerchantsTable';

export default MerchantsTable;