import styles from './index.module.css';
import RadarChart from '../RadarChart';
import { StarMarkerIcon, SearchIcon } from '@/components/Icon';
import FrostedGlass from '../FrostedGlass';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { $t } from '@/i18n';
import { MainBtn, SecondaryBtn } from '../Btn';
import log from '@/utils/log';

interface ItemInfoCardProps {
  content?: React.ReactNode;
  data?: any;
  radarTitle?: string;
  index?: number;
  style?: React.CSSProperties;
  imgClickLogKey?: string;
  titleClickLogKey?: string;
  findSupplierLogKey?: string;
  materialProcessLogKey?: string;
}

const ItemInfoCard = ({ data, content, radarTitle, index = 0, style, imgClickLogKey, titleClickLogKey, findSupplierLogKey, materialProcessLogKey }: ItemInfoCardProps) => {
  const { mainImgUrl, productUrl, title, onShelfDate, onShelfDays, oppScore, radarVO, showKeyword, riskStatus, oppScoreDesc } = data;
  const { navigateByCache } = useChatQuery();

  const logParams = {
    productId: data?.productId || data?.spId || '',
    title: title || '',
  };

  const handleFindSupplier = () => {
    if (findSupplierLogKey) {
      log.record(findSupplierLogKey, 'CLK', logParams);
    }
    navigateByCache({ chatInput: { searchImageUrl: mainImgUrl, intention: 'AUTO' }, url: '/sourcing', isMakeSimilar: false, target: 'blank' });
  };

  // 素材处理跳转
  const handleMaterialProcessing = () => {
    if (materialProcessLogKey) {
      log.record(materialProcessLogKey, 'CLK', logParams);
    }
    window.open(`https://www.alphashop.cn/studio?images=${mainImgUrl}&keyword=${showKeyword || ''}`, '_blank');
  };

  return (
    <div className={styles.itemInfoCard} style={style}>
      <div className={styles.itemInfoCardHeader}>
        <div className={styles.itemInfoCardHeaderLeft}>
          <div className={styles.imageIcon}>{index + 1}</div>
          <FrostedGlass
            style={{ width: 180, height: 180, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}
            riskStatus={riskStatus}
            productUrl={productUrl || ''}
            imageUrl={mainImgUrl}
            logKey={imgClickLogKey}
            logParams={{
              productId: data?.productId || data?.spId || '',
              title: title || '',
            }}
          />
        </div>
        <div className={styles.itemInfoCardHeaderRight}>
          <div className={styles.itemInfoCardHeaderRightTitle}>
            <div className={styles.itemInfoCardLeftTitle} onClick={productUrl ? () => {
              if (titleClickLogKey) {
                log.record(titleClickLogKey, 'CLK', logParams);
              }
              window.open(productUrl, '_blank');
            } : undefined}>{title}</div>
            <div className={styles.itemInfoCardLeftTimeContainer}>{$t("global-1688-ai-app.ChatFlow.ItemInfoCard.sjsjday", `${onShelfDate}上架｜上架${onShelfDays}天`, [onShelfDate, onShelfDays])}</div>
          </div>
          <div className={styles.itemInfoCardHeaderRightScore}>
            <div className={styles.itemInfoCardHeaderRightScoreItem}>
              <div className={styles.itemInfoCardHeaderRightScoreItemTitle}>
                <div className={styles.itemInfoCardHeaderRightScoreItemTitleText}>
                  <div className={styles.itemInfoCardHeaderRightScoreItemTitleTextTitle}>{radarTitle}</div>
                  <div className={styles.itemInfoCardHeaderRightScoreItemTitleTextValueContainer}>
                    <span className={styles.itemInfoCardHeaderRightScoreItemTitleTextValue}>{oppScore}</span>
                    <span className={styles.itemInfoCardHeaderRightScoreItemTitleTextUnit}>{$t("global-1688-ai-app.ChatFlow.ItemInfoCard.f", "分")}</span>
                  </div>
                </div>
                <div className={styles.tabContentItemRightTitle}>{oppScoreDesc}</div>
              </div>
              {radarVO?.propertyList?.length > 0 && (
                <div className={styles.tabContentChart}>
                  <RadarChart radarDescription={radarVO?.radarDescription} radarTitle={radarTitle} oppScore={oppScore} data={radarVO?.propertyList || []} orther={{ width: '48px', height: '48px' }} />
                </div>
              )}
            </div>
            <div className={styles.itemInfoCardHeaderRightScoreItemRight}>
              <MainBtn style={{ width: '140px', height: '36px' }} icon={<SearchIcon />} text={$t("global-1688-ai-app.ChatFlow.ItemInfoCard.ztkgys", "找同款供应商")} handleBtn={handleFindSupplier} />
              <SecondaryBtn style={{ width: '140px', height: '36px' }} icon={<StarMarkerIcon />} text={$t("global-1688-ai-app.ChatFlow.ItemInfoCard.sccl", "素材处理")} handleBtn={handleMaterialProcessing} />
            </div>
          </div>
        </div>
      </div>
      {content}
    </div>
  );
};

export default ItemInfoCard;