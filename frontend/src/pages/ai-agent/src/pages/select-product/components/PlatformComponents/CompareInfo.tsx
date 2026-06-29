import React from 'react';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import TrendChart from '@/components/ChatFlow/TrendChart';
import { TiktokIcon } from '@/components/Icon';
import { Markdown } from '@/components/ChatFlow/Markdown';
import { getValue } from '@/utils/valueExtractor';
import { getFlagClass } from '@/utils/countryMapping';
import styles from './compareInfo.module.css';
import { $t } from '@/i18n';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';

interface TypeCompareData {
  title: string | React.ReactNode;
  isMerged?: boolean;
  platform?: string;
  regionCn?: string;
  column1: string | number | React.ReactNode;
  column2: string | number | React.ReactNode;
  targetProduct?: {
    platform: string;
    regionCn: string;
    column1: string | number | React.ReactNode;
    column2: string | number | React.ReactNode;
  };
}

interface TypeTrendData {
  date: string;
  amazon: number;
  tiktok: number;
}

interface TypeCompareInfoProps {
  data?: any;
  trendData?: TypeTrendData[];
  onClick?: () => void;
}

// 创建国旗图标组件
const FlagIcon: React.FC<{ countryName: string; width?: number; height?: number }> = ({
  countryName,
  width = 16,
  height = 16,
}) => {
  const flagClass = getFlagClass(countryName);

  if (flagClass) {
    return (
      <span
        className={`${flagClass} ${styles.flagIcon}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
        title={countryName}
      />
    );
  }

  return null;
};

// 获取图标的函数，支持平台图标和国家旗帜
const getIcon = (name: string): React.ReactNode => {
  // 平台图标映射
  const platformIcons: Record<string, React.ReactNode> = {
    Amazon: <img src={imgIcon?.[21]} alt="Amazon" width={16} height={16} />,
    TikTok: <TiktokIcon width={16} height={16} />,
  };

  // 如果是平台，返回平台图标
  if (platformIcons[name]) {
    return platformIcons[name];
  }

  // 否则尝试作为国家名称处理
  return <FlagIcon countryName={name} width={16} height={16} />;
};

// 转换函数：将originData转换为表格数据
const convertOriginDataToTableData = (originData: any): TypeCompareData[] => {
  const { targetProduct } = originData;
  const sourceProduct = originData;

  // 销量最高商品显示组件
  const buildProductDisplay = (product: any) => (
    <div className={styles.productDisplay}>
      <FrostedGlass
        style={{ width: 87, height: 87, cursor: 'pointer', borderRadius: 4 }}
        riskStatus={product?.riskStatus}
        imageUrl={product?.mainImgUrl}
        productUrl={product?.productUrl || ''}
      />
      <div
        className={styles.productTitle}
        onClick={product?.productUrl ? () => window.open(product?.productUrl, '_blank') : undefined}
      >
        {product?.title}
      </div>
    </div>
  );

  // 构建最近30天销量显示组件
  const buildSalesDisplay = (salesData: any, growthData?: any) => (
    <div className={styles.salesDisplay}>
      <span>{salesData}</span>
      {growthData && (
        <span className={styles.growthBadge}>
          {growthData?.value}
        </span>
      )}
    </div>
  );

  // 转换销量趋势数据
  const convertTrendData = (): TypeTrendData[] => {
    // 如果sourceProduct没有数据，直接返回空数组
    if (!sourceProduct?.soldCntHisByM) {
      return [];
    }

    const maxLength = Math.max(
      sourceProduct?.soldCntHisByM?.length || 0,
      targetProduct?.soldCntHisByM?.length || 0,
    );

    return Array.from({ length: maxLength }, (unused, itemIndex) => ({
      date: sourceProduct?.soldCntHisByM?.[itemIndex]?.timeValue || targetProduct?.soldCntHisByM?.[itemIndex]?.timeValue || '',
      amazon: Number(sourceProduct?.soldCntHisByM?.[itemIndex]?.trendValue) || 0,
      tiktok: targetProduct?.soldCntHisByM ? Number(targetProduct?.soldCntHisByM?.[itemIndex]?.trendValue) || 0 : 0,
    }));
  };

  // 构建趋势图组件
  const TrendChartComponent = () => {
    const trendData = convertTrendData();

    return (
      <TrendChart data={trendData} />
    );
  };

  return [
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.szPc", "销量最高商品"),
      column1: buildProductDisplay(sourceProduct),
      column2: buildProductDisplay(targetProduct),
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.tkproducts", "同款商品数"),
      column1: sourceProduct?.spInfo?.spItmCnt?.toString() || '0',
      column2: targetProduct?.spInfo?.spItmCnt?.toString() || '0',
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.tkzzsjtime", "同款最早上架时间"),
      column1: $t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.sjday", `${sourceProduct?.spInfo?.launchTime} (上架${sourceProduct?.spInfo?.launchDays}天)`, [sourceProduct?.spInfo?.launchTime, sourceProduct?.spInfo?.launchDays]),
      column2: $t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.sjday", `${targetProduct?.spInfo?.launchTime} (上架${targetProduct?.spInfo?.launchDays}天)`, [targetProduct?.spInfo?.launchTime, targetProduct?.spInfo?.launchDays]),
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.pjprice", "平均价格"),
      column1: getValue(sourceProduct?.spInfo?.spItmMidPrice),
      column2: getValue(targetProduct?.spInfo?.spItmMidPrice),
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.pjrating", "平均评分"),
      column1: sourceProduct?.spInfo?.spRatingMid?.toString() || '/',
      column2: targetProduct?.spInfo?.spRatingMid?.toString() || '/',
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.zae", "最近30天销量"),
      column1: buildSalesDisplay(sourceProduct?.soldCnt30d, sourceProduct?.soldCnt30dMom),
      column2: buildSalesDisplay(targetProduct?.soldCnt30d, targetProduct?.soldCnt30dMom),
    },
    {
      title: $t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.pcm", "商品叶子类目"),
      column1: sourceProduct?.catePath || '',
      column2: targetProduct?.catePath || '',
    },
    {
      title: (
        <div className={styles.trendTitle}>
          <div className={styles.trendTitleText}>{$t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.sqgh", "销量趋势（近12个月）")}</div>
          <div className={styles.trendLegend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendLine} ${styles.legendLineAmazon}`} />
              <span className={styles.legendText}>
                {`${sourceProduct?.regionCn}${sourceProduct?.platform}`}
              </span>
            </div>
            {targetProduct?.soldCntHisByM && (
              <div className={styles.legendItem}>
                <div className={`${styles.legendLine} ${styles.legendLineTiktok}`} />
                <span className={styles.legendText}>
                  {
                    `${targetProduct?.regionCn}${targetProduct?.platform}`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      ),
      column1: <TrendChartComponent />,
      column2: '',
      isMerged: true,
    },
  ];
};

export const CompareInfo: React.FC<TypeCompareInfoProps> = ({ data: originData, onClick }) => {
  const tableData = convertOriginDataToTableData(originData);

  // 检查targetProduct是否为空
  const isTargetProductEmpty = !originData?.targetProduct?.mainImgUrl &&
    !originData?.targetProduct?.spInfo &&
    !originData?.targetProduct?.soldCnt30d &&
    !originData?.targetProduct?.catePath;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.title}>
          <div className={styles.titleIcon} />
          <div className={styles.titleText}>{$t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.qyfx", "迁移分析")}</div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th className={styles.tableHeaderEmpty} />
              <th className={styles.tableHeader}>
                <div className={styles.tableHeaderContent}>
                  {
                    originData?.platform === originData?.targetProduct?.platform
                      ? (
                        <div className={styles.platformInfo}>
                          <div>{originData?.platform}</div>
                          <div>-</div>
                          <div className={styles.platformInfoItem}>
                            <div>{getIcon(originData?.regionCn)}</div>
                            <div>{originData?.regionCn}</div>
                          </div>
                        </div>
                      )
                      : (
                        <div className={styles.platformInfo}>
                          <div>{originData?.regionCn}</div>
                          <div>-</div>
                          <div className={styles.platformInfoItem}>
                            <div>{getIcon(originData?.platform)}</div>
                            <div>{originData?.platform}</div>
                          </div>
                        </div>
                      )
                  }
                </div>
              </th>
              <th className={styles.tableHeader}>
                <div className={styles.tableHeaderContent}>
                  {
                    originData?.platform === originData?.targetProduct?.platform
                      ? (
                        <div className={styles.platformInfo}>
                          <div>{originData?.platform}</div>
                          <div>-</div>
                          <div className={styles.platformInfoItem}>
                            <div>{getIcon(originData?.targetProduct?.regionCn)}</div>
                            <div>{originData?.targetProduct?.regionCn}</div>
                          </div>
                        </div>
                      )
                      : (
                        <div className={styles.platformInfo}>
                          <div>{originData?.regionCn}</div>
                          <div>-</div>
                          <div className={styles.platformInfoItem}>
                            <div>{getIcon(originData?.targetProduct?.platform)}</div>
                            <div>{originData?.targetProduct?.platform}</div>
                          </div>
                        </div>
                      )
                  }
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={index}
                className={`${tableData?.length - 1 === index ? '' : styles.tableRow} ${onClick ? styles.tableRowClickable : ''}`}
                onClick={onClick}
              >
                <td className={styles.tableCellTitle}>
                  {row.title}
                </td>
                {row.isMerged ? (
                  <td
                    className={styles.tableCellMerged}
                    colSpan={2}
                  >
                    {row.column1}
                  </td>
                ) : (
                  <>
                    <td className={styles.tableCellContent}>
                      {row.column1}
                    </td>
                    <td
                      className={styles.tableCellData}
                      rowSpan={isTargetProductEmpty && index < 7 ? 7 : undefined}
                    >
                      {isTargetProductEmpty && index === 0 ? (
                        <div className={styles.emptyDataContainer}>
                          <span className={styles.emptyDataText}>{$t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.woz", "无同款商品在售")}</span>
                        </div>
                      ) : isTargetProductEmpty ? null : (
                        row.column2
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {originData?.summary && (
        <div className="flex-1">
          <div className={styles.markdownHeader}>
            <div className={styles.markdownTitleIcon} />
            <div className={styles.markdownTitle}>{$t("global-1688-ai-app.select-product.PlatformComponents.CompareInfo.tdcp", "同款商品市场迁移机会评估报告")}</div>
          </div>
          <Markdown
            text={originData?.summary}
            chunkIntervalMs={50}
            streamGranularity="char"
            className="rightMardown"
          />
        </div>
      )}
    </>
  );
};