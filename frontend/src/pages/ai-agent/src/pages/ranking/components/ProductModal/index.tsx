import { Modal, Tooltip, Table } from 'antd';
import styles from './index.module.css';
import type { TableProps } from 'antd';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import { ChevronUpIcon } from "@/components/Icons";
import jumpTo from '@/utils/jumpTo';
import { platformMap, platformMapText, rankingTypeMapText, REGION_MAP } from '../../config';
import { useMemo, useEffect, useRef } from 'react';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { $t } from "@/i18n";
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';

interface ProductModalProps {
  isModalOpen: boolean;
  onCancel: () => void;
  data?: {
    list: any[];
    imageList: string[];
    platform: string;
    title: string;
    country: string;
  };
  country?: string;
  rankingName?: string;
  rankingType?: string;
}

const Title: React.FC<{ name: string; text: string }> = ({ name, text }) => {
  return (
    <div className={styles.titleContainer}>
      <div className={styles.titleName}>{name}</div>
      <Tooltip placement="bottom" title={text}>
        <img className={styles.titleIcon} src={imgIcon[13]} alt="" srcSet="" />
      </Tooltip>
    </div>
  )
}

const ProductModal: React.FC<ProductModalProps> = ({ isModalOpen, onCancel, data, country, rankingName, rankingType }) => {
  const { list = [], imageList = [], platform, title } = data || {};
  const modalExpRef = useRef(false);
  const { navigateByCache } = useChatQuery();
  useEffect(() => {
    if (isModalOpen && !modalExpRef.current) {
      modalExpRef.current = true;
      log.record(LOG_KEYS.RANKINGLIST.TRACK_ANALYSIS.MORE, 'EXP');
    }
    if (!isModalOpen) {
      modalExpRef.current = false;
    }
  }, [isModalOpen]);
  const columns = useMemo(() => {
    if (!list || list.length === 0) return [];

    const firstItem = list[0];
    const dynamicColumns: TableProps<any>['columns'] = [];
    const fieldMapping = [
      { key: 'itemCount', getValue: (item: any) => item?.value },
      { key: 'soldCnt30d', getValue: (item: any) => item?.value },
      { key: 'soldCnt30dGrowthRate', getValue: (item: any) => item?.value },
      { key: 'priceAvg', getValue: (item: any) => item?.value },
      { key: 'newProductSalesPct', getValue: (item: any) => item?.value },
      { key: 'brandMonopolyCoefficient', getValue: (item: any) => item?.value },
      { key: 'cnSellerPct', getValue: (item: any) => item?.value },
    ];

    fieldMapping.forEach(({ key, getValue }) => {
      const fieldData = firstItem?.[key];
      if (fieldData && fieldData.name) {
        dynamicColumns.push({
          title: <Title name={fieldData.name} text={fieldData.desc || ''} />,
          dataIndex: key,
          key: key,
          render: (value: any) => getValue(value),
        });
      }
    });

    return dynamicColumns;
  }, [list])
  const dataSource = useMemo(() => {
    return list?.map((item, index) => ({
      ...item,
      key: index.toString(),
    }));
  }, [list]);

  return (
    <Modal
      open={isModalOpen}
      onCancel={onCancel}
      footer={null}
      width="auto"
      className={styles.productModal}
      title={
        <div className={styles.modalTitle}>
          <img src={platformMap[platform || '']} alt="" className={styles.modalTitleImage} />
          <div className={styles.modalTitleText}>{title}</div>
        </div>
      }
    >
      <Table className={styles.productModalTable} columns={columns} dataSource={dataSource} pagination={false} />
      <div className={styles.productModalContent}> 
        <div className={styles.productModalContentHeader}>
          <div className={styles.productModalContentHeaderLeft}>
            <div className={styles.productModalContentHeaderLeftIcon} />
            <div className={styles.productModalContentHeaderLeftText}>{$t('global-1688-ai-app.ranking.ProductModal.representativeProductRecommend', '代表商品推荐')}</div>
          </div>
          <div className={styles.productModalContentHeaderRight} onClick={() => {
            log.record(LOG_KEYS.RANKINGLIST.TRACK_ANALYSIS.MORE, 'CLK');
            navigateByCache({ chatInput: {
              query: `${$t('global-1688-ai-app.ranking.ProductModal.pleaseRecommend', '请帮我推荐')}：
              ${platformMapText[platform || '']}${REGION_MAP[country || '']?.name}，
              「${title}」${rankingTypeMapText[rankingType || '']}
              40${$t('global-1688-ai-app.ranking.ProductModal.products', '款商品')}`,
              __submit_type__: 'user_input',
            }, url: '/select-product/general-agent' });
            // jumpTo(`/select-product?keyword=${title}&platform=${platform}&country=${country}`);
          }}>
            <div className={styles.productModalContentHeaderRightText}>{$t('global-1688-ai-app.ranking.ProductModal.viewMore', '查看更多')}</div>
            <ChevronUpIcon className='rotate-[90deg]' fill='#D15700' size={14} />
          </div>
        </div>
        <div className={styles.container}>
          {imageList?.map((item) => (
            <img 
              key={item}
              className={styles.image} 
              src={item} 
              alt="" 
              onClick={() => {
                log.record(LOG_KEYS.RANKINGLIST.TRACK_ANALYSIS.ITEM_IMG_CLICK, 'CLK', { item_id: item });
                jumpTo(`/select-product/image-search-agent?imageUrl=${item}`);
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;