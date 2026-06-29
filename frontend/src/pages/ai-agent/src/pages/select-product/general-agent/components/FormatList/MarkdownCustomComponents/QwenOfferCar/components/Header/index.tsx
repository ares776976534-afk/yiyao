import styles from './index.module.css';
import { keywordLevelMap, keywordLevelColorMap, keywordLevelIconCount, iconColors, iconList } from '@/components/ChatFlow/TabCard';
import RadarChart from '@/components/ChatFlow/RadarChart';
import { DownArrowIcon, StarMarkerIcon } from "@/components/Icon";
import { TypeQwenOfferCard } from '../../index';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import { platformIconMap, regionIconMap } from '@/pages/select-product/general-agent/components/FormatList/MarkdownCustomComponents/QwenMarketAnalysi/components/KeywordAnalysis';
import { SecondaryBtn } from '@/components/ChatFlow/Btn';
import HeaderBottom from '../HeaderBottom';
import { $t } from '@/i18n';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';

export const Header = (props: TypeQwenOfferCard) => {
  const {
    productUrl,
    imageUrl,
    platform,
    title,
    region,
    spLaunchTime,
    oppScoreValueLevel,
    sellingPrice,
    radarVO,
    oppScore,
    productId,
  } = props;

  const handleMaterialProcessing = (e) => {
    e.stopPropagation();
    // 埋点：点击素材处理
    log.record(LOG_KEYS.GENERAL_AGENT.LP.MATERIAL_PROCESS, 'CLK', {
      productId: productId || '',
      title: title || '',
      platform: platform || '',
      region: region || '',
    });
    window.open(`https://www.alphashop.cn/studio?images=${imageUrl}&keyword=${title}`, '_blank');
  };
  const handleProductClick = (e) => {
    e.stopPropagation();
    // 埋点：点击商品标题跳转详情页
    log.record(LOG_KEYS.GENERAL_AGENT.LP.PRODUCT_DETAIL, 'CLK', {
      productId: productId || '',
      title: title || '',
      platform: platform || '',
      region: region || '',
    });
    productUrl && window.open(productUrl, '_blank');
  };
  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <div
          className={styles.headerTopLeft}
          onMouseEnter={() => {
            log.record(LOG_KEYS.GENERAL_AGENT.LP.PRODUCT_IMG_HOVER, 'OTHER', {
              productId: productId || '',
              title: title || '',
              platform: platform || '',
              region: region || '',
            });
          }}
        >
          <img
            className={styles.headerTopLeftImg}
            src={imageUrl}
            alt={title}
          />
          <div className={styles.headerTopLeftOverlay}>
            <SecondaryBtn
              style={{
                width: '80px',
                height: '28px',
                gap: '4px',
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              icon={<StarMarkerIcon width="12" height="12" />}
              text="素材处理"
              handleBtn={handleMaterialProcessing}
            />
          </div>
        </div>
        <div className={styles.headerTopRight} onClick={handleProductClick}>
          <div>
            <div className={styles.headerTopRightTitleText}>{title}</div>
            <div className={styles.headerTopRightSubContent}>
              <div className={styles.headerTopRightSubContentItemContainer}>
                <img className={styles.platformIcon} src={imgIcon[platformIconMap[platform]]} alt={platform} />
                {/* <div className={styles.headerTopRightSubContentItem}>{textMap[platform]}</div> */}
              </div>
              <div className={styles.divider} />
              <div className={styles.headerTopRightSubContentItemContainer}>
                <div className={styles.regionIcon}>
                  {regionIconMap[region]}
                </div>
                {/* <div className={styles.headerTopRightSubContentItem}>
                  {regionTextMap[region]}
                </div> */}
              </div>
              <div className={styles.divider} />
              <div className={styles.headerTopRightSubContentItem}>{spLaunchTime}上架</div>
            </div>
          </div>
          <div className={styles.headerTopRightPrice}>
            {sellingPrice || '-'}
          </div>
        </div>
      </div>
      <div className={styles.headerBottom}>
        <div className={styles.headerBottomLeftContent}>
          <div className={styles.headerBottomLeft}>
            <div className={styles.headerBottomLeftTitle} style={{ color: keywordLevelColorMap[oppScoreValueLevel] }}>
              {keywordLevelMap[oppScoreValueLevel]}
            </div>
            <div className={styles.footerKeywordContent}>
              <div className={styles.iconContent}>
                {iconList.map((i) => {
                  const highlightCount = keywordLevelIconCount[oppScoreValueLevel] || 0;
                  const isHighlight = i < highlightCount;
                  return (
                    <div
                      key={i}
                      className={styles.footerKeywordContentIcon}
                      style={{
                        background: isHighlight ? iconColors[i] : 'var(--fill-primary)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div
            className={styles.headerBottomChart}
            onMouseEnter={() => {
              log.record(LOG_KEYS.GENERAL_AGENT.LP.OPP_SCORE_HOVER, 'OTHER', {
                productId: productId || '',
                oppScore: oppScore || '',
                oppScoreValueLevel: oppScoreValueLevel || '',
                platform: platform || '',
              });
            }}
          >
            <div className={styles.oppScore}>{oppScore}</div>
            <RadarChart
              data={radarVO?.propertyList}
              radarDescription={radarVO?.radarDescription}
              orther={{ width: '50px', height: '50px' }}
              radarTitle="新品机会分"
              oppScore={Number(oppScore)}
            />
          </div>
        </div>
        <div className={styles.headerBottomDivider} />
        <HeaderBottom {...props} />
      </div>
    </div>
  );
};