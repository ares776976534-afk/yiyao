import React, { useState, useRef } from 'react';
import { RaiseHandIcon, ShopIcon } from '@/components/Icon';
import AIRecommendCard from './AIRecommendCard';
import MerchantsTable, { MerchantsTableRef } from './MerchantsTable';
import styles from './selectionReport.module.css';
import SpSupplyInfo from './SpSupplyInfo';
import { isEmptyObject } from '@/utils/isEmptyObject';

interface reportProps {
  spSupplyInfo: {
    spItemCnt1688: number;
    imageUrl: string;
    imageCropRegion: string;
    spItemPriceRangeList: {
      maxPrice: { amount: number, currencySymbol: string, amountWithSymbol: string };
      midPrice: { amount: number, currencySymbol: string, amountWithSymbol: string };
      minPrice: { amount: number, currencySymbol: string, amountWithSymbol: string };
      platform: string;
    }[];
    title: string;
  };
  recommendedProvider: {
    title: string;
    desc: string;
    recommendList: {
      memberId: string;
      offerBaseInfo: { offerUrl: string, price: string, title: string, offerTags: string[]; imageUrl: string; };
      offerId: number;
      providerBaseInfo: { companyName: string; primaryCate: string; homePageUrl: string; }
      recommendReason: string;
    }[];
  }
  offerProviderDetail: {
    title: string;
    desc: string;
    offerProviderDetailList: {
      fulfillmentInfo: { fulfillmentRate30d: string; hour48collectionRate30d: string; shipFrom: string; }
      memberId: string;
      offerBaseInfo: { offerUrl: string; price: string; title: string; offerTags: string[]; }
      offerId: number;
      providerBaseInfo: { companyName: string; primaryCate: string; homePageUrl: string; providerTags: { code: string; value: string; }[] }
      providerServiceInfo: { refundRate30d: string; wwResponseRate30d: string; repurchaseRate90d: string; qualityCompositeScore: string; otherService: string; }
      saleInfo: { sold30d: string; launchDate: string; };
    }[];
  }
}

interface SelectionReportProps {
  report: reportProps
}

const SelectionReport: React.FC<SelectionReportProps> = ({ report }) => {

  const { spSupplyInfo, recommendedProvider, offerProviderDetail } = report || {};
  const [highlightedOfferId, setHighlightedOfferId] = useState<number | null>(null);
  const merchantsTableRef = useRef<MerchantsTableRef>(null);

  const handleCompare = (offerId: number) => {
    // 设置要高亮的商品ID
    setHighlightedOfferId(offerId);
    // 触发表格中的高亮和定位
    if (merchantsTableRef.current?.highlightItem) {
      merchantsTableRef.current.highlightItem(offerId);
    }
    // 3秒后清除高亮状态
    setTimeout(() => {
      setHighlightedOfferId(null);
    }, 3000);
  };
  return (
    <div className={styles.selectionReportContainer}>
      {!isEmptyObject(spSupplyInfo) && (
        <div className={styles.selectionReport}>
          <div className={styles.selectionReportTitle}>
            <ShopIcon />
            <span className={styles.selectionReportTitleText}>{spSupplyInfo?.title}</span>
          </div>
          <SpSupplyInfo data={spSupplyInfo} />
        </div>
      )}
      {!isEmptyObject(recommendedProvider) && (
        <div className={styles.selectionReport}>
          <div className={styles.selectionReportTitle}>
            <RaiseHandIcon />
            <span className={styles.selectionReportTitleText}>{recommendedProvider?.title}</span>
            <span className={styles.selectionReportTitleSubText}>{recommendedProvider?.desc}</span>
          </div>
          {recommendedProvider?.recommendList?.map((ele, index) => (
            <AIRecommendCard key={ele?.offerId} data={ele} handleCompare={handleCompare} AITopIndex={index} />
          ))}
        </div>
      )}
      {!isEmptyObject(offerProviderDetail) && (
        <div className={styles.selectionReportDetail}>
          <div className={styles.selectionReportTitle}>
            <RaiseHandIcon />
            <span className={styles.selectionReportTitleText}>{offerProviderDetail?.title}</span>
            <span className={styles.selectionReportTitleSubText}>{offerProviderDetail?.desc}</span>
          </div>
          <MerchantsTable
            recommendList={recommendedProvider?.recommendList}
            ref={merchantsTableRef}
            data={offerProviderDetail?.offerProviderDetailList}
            highlightedOfferId={highlightedOfferId}
          />
        </div>
      )}
    </div>
  );
};

export default SelectionReport;
