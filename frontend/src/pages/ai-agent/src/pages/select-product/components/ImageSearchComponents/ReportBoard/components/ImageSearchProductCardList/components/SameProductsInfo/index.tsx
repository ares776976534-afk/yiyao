import React, { useCallback, useEffect, useState } from 'react';
import { ChevronUpIcon } from '@/components/Icons';
import styles from './index.module.css';
import { SkeletonTable } from '../SkeletonTable';
import { searchSkus } from '@/components/ChatFlow/SameNumModal/services';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import { baseUrl } from '@/utils/env';
import { message } from 'antd';
import { httpRequest } from '@/services/mtop';
import SameNumModal from '@/components/CommonTable/TableCellComponent/TextApi/SameNumModal';
import { $t } from '@/i18n';

const columns = [
  {
    title: $t('global-1688-ai-app.ChatFlow.SameInfo.SKUimage', 'SKU图片'),
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    width: 100,
    align: 'center',
    render: (text, record) => {
      return (
        <FrostedGlass
          style={{ width: 48, height: 48, borderRadius: '2.4px' }}
          riskStatus={record?.riskStatus}
          productUrl={record?.productUrl || ''}
          imageUrl={text}
        />
      );
    },
  },
  {
    title: "SKU ID",
    dataIndex: 'skuId',
    key: 'skuId',
    width: 150,
  },
  {
    title: "SKU",
    dataIndex: 'title',
    key: 'title',
    width: 240,
  },
  {
    title: $t('global-1688-ai-app.ChatFlow.SameInfo.SKUmonthSales', 'SKU月销量'),
    dataIndex: 'sold30d',
    key: 'sold30d',
    width: 120,
  },
  {
    title: $t('global-1688-ai-app.ChatFlow.SameInfo.Sne', 'SKU月销售额'),
    dataIndex: 'sold30dAmt',
    key: 'sold30dAmt',
    width: 120,
  },
  {
    title: $t('global-1688-ai-app.ChatFlow.SameInfo.SKUrating', 'SKU评分'),
    dataIndex: 'ratingScore',
    key: 'ratingScore',
    width: 100,
  },
  {
    title: $t('global-1688-ai-app.ChatFlow.SameInfo.SKUsjtime', 'SKU上架时间'),
    dataIndex: 'launchDate',
    key: 'launchDate',
    width: 154,
  },
];


interface TypeSameProductsInfoProps {
  componentData?: {
    spItemCnt?: string | number;
    ratingRange?: string;
    priceRange?: string;
    soldCnt30d?: string | number;
    platform?: string;
    region?: string;
    productIds?: string[];
    spId?: string;
  };
  index?: number;
}

export const getDetailData = async (apiName: string, params: any) => {
  const res = await httpRequest({
    url: `${baseUrl}${apiName}`,
    method: 'POST',
    body: JSON.stringify(params || {}),
  });
  return res;
};

function SameProductsInfo(props: TypeSameProductsInfoProps) {
  const { componentData } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { spItemCnt, ratingRange, priceRange, soldCnt30d,
    platform, region, productIds, spId } = componentData || {};

  const [open, setOpen] = useState(false);

  // 加载数据函数
  const loadData = useCallback(async (page: number, pageSizeValue: number = 10) => {
    try {
      setLoading(true);
      const params = {
        platform,
        region,
        productIds: productIds || [],
        pageNum: page,
        pageSize: pageSizeValue || 10,
      };

      const res = await searchSkus(params);
      const newList = res?.oppSkuVOList || [];
      setList(newList);
      setTotal(res?.total || 0);
      setPageNum(page);
      setPageSize(pageSizeValue || 10);
      setLoading(false);
    } catch (error) {
      setList([]);
      setTotal(0);
      setLoading(false);
    }
  }, [platform, region, productIds]);

  // 初始加载
  useEffect(() => {
    if (isExpanded) {
      setList([]);
      setPageNum(1);
      setTotal(0);
      loadData(1);
    }
  }, [isExpanded, loadData]);

  const getDetailDataApi = useCallback(async (params: { pageSize: number; pageNum: number }): Promise<{
    productList: any[];
    hasMore: boolean;
  }> => {
    return getDetailData('/opp/sel/api/product/querySameStyleProducts', {
      platform,
      region,
      spId,
      ...params,
    }).then((res) => {
      const productList = res?.sameStyleProductVO?.productList ?? [];
      const hasMore = res?.sameStyleProductVO?.hasMore ?? false;
      return {
        productList,
        hasMore,
      };
    }).catch((err) => {
      console.error('err', err);
      message.error(err?.message || $t('global-1688-ai-app.select-product.useChatStream.qqfailed', '请求失败'));
      return Promise.reject(err);
    });
  }, [platform, region, spId]);

  const onClose = () => {
    setOpen(false);
  };


  if (!componentData) return null;


  const dataItems = [
    {
      label: $t('global-1688-ai-app.select-product.general-agent.FormatList.MarkdownCustomComponents.QwenOfferCard.OfferCard.tkproducts', '同款商品数'),
      value: spItemCnt,
      // valueLevel: '优',
      showDetail: true,
      onDetaileClick: () => {
        setOpen(true);
      },
    },
    { label: $t('global-1688-ai-app.ChatFlow.SameInfo.jya', '近30天SPU销量'), value: soldCnt30d },
    { label: $t('global-1688-ai-app.select-product.ChatFlow.SameInfo.Srg', 'SPU平均评价'), value: ratingRange },
    { label: $t('global-1688-ai-app.select-product.ChatFlow.SameInfo.SPUprice', 'SPU平均价格'), value: priceRange },
  ];

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };


  const generateSkeletonData = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
      key: `skeleton-${index}`,
      imageUrl: '',
      skuId: '',
      title: '',
      sold30d: '',
      sold30dAmt: '',
      ratingScore: '',
      launchDate: '',
    }));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.indicator} />
        <span className={styles.headerTitle}>{$t('global-1688-ai-app.inquiry.ChooseSuppliers.SupplierRecommendModal.productInformation', '商品信息')}</span>
      </div>

      <div className={styles.container}>
        {dataItems.map((item, index) => (
          <div key={index} className={styles.infoItem}>
            <div className={styles.label}>
              <span className={styles.labelText}>{item.label}</span>
              {
                item.showDetail && (
                  <div onClick={item?.onDetaileClick} className={styles.detailIcon}>
                    <img className={styles.detailIconImg} src={imgIcon[5]} alt="img" />
                  </div>
                )
              }
            </div>
            <div className={styles.valueContainer}>
              <span className={styles.value}>{item.value || '-'}</span>
              {/* {
                item.valueLevel && (
                  <>
                    <span className={styles.valueLevelDivider}>/</span>
                    <span className={styles.valueLevel}>{item.valueLevel}</span>
                  </>
                )
              } */}
            </div>
          </div>
        ))}
        <div className={styles.infoItem} style={{ alignItems: 'flex-end' }}>
          <div className={styles.btn} style={{ width: isExpanded ? 90 : 147 }} onClick={handleToggle}>
            <div className={styles.btnText}>{isExpanded ? $t('global-1688-ai-app.ChatFlow.DataBoard.sq', '收起') : $t('global-1688-ai-app.ChatFlow.DataBoard.zkviewSKU', '展开查看SKU')}</div>
            <ChevronUpIcon className={`text-[#7B7B8D] ${isExpanded ? '' : 'rotate-180'}`} size={14} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.skuList}>
          <SkeletonTable
            open={isExpanded}
            loading={loading}
            list={list}
            pageSize={pageSize}
            total={total}
            columns={columns}
            generateSkeletonData={generateSkeletonData}
            onPageChange={loadData}
            currentPage={pageNum}
            maxHeight="100%"
            footerName={$t('global-1688-ai-app.ChatFlow.SameInfo.tSKU', '条SKU')}
          />
        </div>
      )}
      <SameNumModal
        open={open}
        onClose={onClose}
        apiRequest={getDetailDataApi}
      />
    </div>
  );
}

export default SameProductsInfo;
