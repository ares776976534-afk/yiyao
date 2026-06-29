import styles from './index.module.css';
import { StarMarkerIcon, SearchIcon } from '@/components/Icon';
import FrostedGlass from '../FrostedGlass';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { $t } from '@/i18n';
import { MainBtn, SecondaryBtn } from '../Btn';

interface Product1688AbstractCardProps {
  content?: React.ReactNode;
  data?: any;
  index?: number;
  style?: React.CSSProperties;
}

const Product1688AbstractCard = ({ data, content, index = 0, style }: Product1688AbstractCardProps) => {
  const { mainImgUrl, productUrl, catePath, onShelfDate, onShelfDays, productTitle,
    platformIcon, regionIcon, platform, regionCn,
    showKeyword, riskStatus } = data;
  const { navigateByCache } = useChatQuery();

  const handleFindSupplier = () => {
    navigateByCache({ chatInput: { searchImageUrl: mainImgUrl, intention: 'AUTO' }, url: '/sourcing', isMakeSimilar: false, target: 'blank' });
  };

  const handleMaterialProcessing = () => {
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
          />
        </div>
        <div className={styles.itemInfoCardHeaderRight}>
          <div className={styles.itemInfoCardHeaderRightTitle}>
            <div className={styles.itemInfoCardLeftTitle} onClick={productUrl ? () => window.open(productUrl, '_blank') : undefined}>{productTitle}</div>
            <div className={styles.itemInfoCardLeftTimeContainer}>
              {(platform || platformIcon) &&
                <div className={styles.badge}>
                  {platformIcon && <img className={styles.itemInfoCardLeftTimeContainerIcon} src={platformIcon} />}
                  {platform && <span>{platform}</span>}
                </div>}
              {(regionCn || regionIcon) &&
                <div className={styles.badge}>
                  {regionIcon && <img className={styles.itemInfoCardLeftTimeContainerIcon} src={regionIcon} />}
                  {regionCn && <span>{regionCn}</span>}
                </div>}
              <div>
                {onShelfDate}{$t('ranking.ItemCard.onSale', '上架')}
              </div>
            </div>
          </div>
          <div className={styles.itemInfoCardHeaderRightActions}>
            <MainBtn style={{ width: '140px', height: '36px' }} icon={<SearchIcon />} text={$t("global-1688-ai-app.ChatFlow.ItemInfoCard.ztkgys", "找同款供应商")} handleBtn={handleFindSupplier} />
            <SecondaryBtn style={{ width: '140px', height: '36px' }} icon={<StarMarkerIcon />} text={$t("global-1688-ai-app.ChatFlow.ItemInfoCard.sccl", "素材处理")} handleBtn={handleMaterialProcessing} />
          </div>
        </div>
      </div>
      {content}
    </div>
  );
};

export default Product1688AbstractCard;
