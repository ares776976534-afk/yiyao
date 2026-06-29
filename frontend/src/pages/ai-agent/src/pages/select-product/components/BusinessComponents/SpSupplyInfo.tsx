import React, { useEffect, useState } from 'react';
import styles from './spSupplyInfo.module.css';
import { App1688Icon, TiktokIcon } from '@/components/Icon';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import { ThumbnailItem } from '@/components/crop-region/thumbnail-item';
import { getImageNaturalSize } from "@/components/crop-region/utils";
import CommonTable from '@/components/ChatFlow/CommonTable';
import { isEmptyObject } from '@/utils/isEmptyObject';
import { $t } from '@/i18n';

interface SpItemPriceRangeList {
  platform: string;
  minPrice: {
    amount: number;
    amountWithSymbol: string;
    currencySymbol: string;
  };
  maxPrice: {
    amount: number;
    amountWithSymbol: string;
    currencySymbol: string;
  };
  midPrice: {
    amount: number;
    amountWithSymbol: string;
    currencySymbol: string;
  };
}
interface SpSupplyInfoProps {
  data: {
    title: string;
    spItemCnt1688: number;
    imageUrl: string;
    imageCropRegion: string;
    spItemPriceRangeList: SpItemPriceRangeList[];
  }
}
const platformIconMap = {
  'Amazon': <img className={styles.platformIcon} src={imgIcon[21]} alt="" srcSet="" />,
  '1688': <App1688Icon />,
  'TikTok': <TiktokIcon />,
}

const SpSupplyInfo: React.FC<SpSupplyInfoProps> = (props) => {
  const { data } = props || {};
  const [naturalSize, setNaturalSize] = useState({
    width: 0,
    height: 0,
  });
  const initializeData = async () => {
    if (!data?.imageUrl) return;
    try {
      const [natural] = await Promise.all([
        getImageNaturalSize(data?.imageUrl),
      ]);
      setNaturalSize(natural);
    } catch (error) {
      console.error("Failed to initialize crop region:", error);
    }
  }
  useEffect(() => {
    initializeData();
  }, []);
  const columns = [
    {
      title: $t("global-1688-ai-app.select-product.BusinessComponents.SpSupplyInfo.pt", "平台"),
      dataIndex: 'platform',
      key: 'platform',
      render: (text, record) => {
        return (
          <div className={styles.platform}>
            {platformIconMap[record?.platform]}
            <span className={styles.platformText}>{record?.platform}</span>
          </div>
        )
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.BusinessComponents.SpSupplyInfo.snc", "售价范围"),
      dataIndex: 'priceRange',
      key: 'priceRange',
      render: (text, record) => {
        return record?.minPrice?.amountWithSymbol && record?.maxPrice?.amountWithSymbol ? `${record?.minPrice?.amountWithSymbol} ～ ${record?.maxPrice?.amountWithSymbol}` : '-';
      },
    },
    {
      title: $t("global-1688-ai-app.select-product.BusinessComponents.SpSupplyInfo.zwsprice", "中位数价格"),
      dataIndex: 'midPrice',
      key: 'midPrice',
      render: (text, record) => {
        return record?.midPrice?.amountWithSymbol ? record?.midPrice?.amountWithSymbol : '-';
      },
    },
  ]
  
  if (isEmptyObject(data)) return null;
  
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.leftImage}>
          <ThumbnailItem
            cropRegion={data?.imageCropRegion?.split(',').map(Number)}
            imageSrc={data?.imageUrl}
            naturalSize={naturalSize}
            onClick={() => { }}
            contentSize={120}
            thumbnailSize={120}
            viewerMaskStyle={{ position: 'relative', overflow: 'hidden' }}
            itemStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            itemImageStyle={{ position: 'absolute', backgroundPosition: 'center', backgroundSize: '100%' }}
          />
        </div>
        {
          data?.spItemCnt1688 && (
            <div className={styles.leftTitle}>
              <div className={styles.leftTitleText}>{$t("global-1688-ai-app.select-product.BusinessComponents.SpSupplyInfo.1ku", "1688同款商品数")}</div>
              <div className={styles.leftTitleValue}>{data?.spItemCnt1688}</div>
            </div>
          )
        }
      </div>
      <CommonTable
        data={data?.spItemPriceRangeList}
        columns={columns}
        className={styles.spItemPriceRangeListTable}
      />
    </div>
  );
};

export default SpSupplyInfo;