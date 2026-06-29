import { Tooltip } from 'antd';
import styles from './index.module.css';
import { imgIcon } from '../imgIcon';
import { getValue } from '@/utils/valueExtractor';
import LineChart from '../LineAreaChart';
import style from '../DemandSituation/index.module.css';
import { $t } from '@/i18n';
import { ChevronUpIcon } from "@/components/Icons";

const searchRankLevelColorMap = {
  BEST: 'var(--semantic-success-primary)',
  GOOD: '#0072FD',
  MEDIUM: 'var(--orange-primary)',
  BAD: 'var(--semantic-warning-primary)'
};

// 处理换行符的工具函数
export const formatTooltipContent = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, index) => (
    <div key={index}>{line}</div>
  ));
};

interface DataBoardProps {
  data: any[][];
  platform?: string;
  open?: boolean;
}

export default function DataBoard({ data, platform = 'amazon', open }: DataBoardProps) {
  return (
    <div
      className={styles.dataBoard}
      style={{
        gap: platform === 'amazon' ? '16px' : '48px',
      }}
    >
      {data?.map((item, index) => (
        <div key={index} className={styles.dataBoardContentWrapper}>
          {item?.map((ele, itemIndex) => (
            <div key={ele?.id || itemIndex} className={ele?.isBtn ? styles.dataBoardContentItem : undefined}>
              <div className={styles.dataBoardContent}>
                <div className={styles.dataBoardContentHeader}>
                  {ele?.salesVolumeTrendsDesc ? (
                    <Tooltip placement="top" title={ele?.salesVolumeTrendsDesc}>
                      <div className={styles.dataBoardContentHeaderTitle}>{ele?.title}</div>
                    </Tooltip>
                  ): (
                    <div className={styles.dataBoardContentHeaderTitle}>{ele?.title}</div>
                  )}
                  {ele?.desc && (
                    <Tooltip title={ele?.desc} placement="top">
                      <img className={styles.dataBoardContentHeaderIcon} src={imgIcon[13]} alt="" />
                    </Tooltip>
                  )}
                </div>
                {ele?.lineChartData?.length > 0 ? (
                  <div className={style.demandSituationItemArea}>
                    <LineChart reflect={ele?.reflect} data={ele?.lineChartData} toolTipYName={ele?.toolTipYName} />
                  </div>
                ) : (
                  <div>
                    <div className={styles.dataBoardContentBodyValueWrapper}>
                      <div className={styles.dataBoardContentBodyValue}>
                        {(() => {
                          // 如果 ele?.value 已经是字符串或数字，直接使用
                          if (typeof ele?.value === 'string' || typeof ele?.value === 'number') {
                            return ele?.value || '-';
                          }
                          // 如果是对象，使用 getValue 提取
                          const result = getValue(ele?.value);
                          return result || '-';
                        })()}
                      </div>
                      {ele?.searchRankLevel && ele?.type !== 'price' && (
                        <div className={styles.dataBoardContentBodyValueUnit}>
                          <div className={styles.dataBoardContentBodyValueUnitDivider}>/</div>
                          <Tooltip placement="bottom" title={formatTooltipContent(ele?.searchRankLevelDesc)}>
                            <div
                              className={styles.dataBoardContentBodyValueUnitText}
                              style={{ color: searchRankLevelColorMap[ele?.searchRankLevel] }}
                            >
                              {ele?.text}
                            </div>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                    {ele?.direction && (
                      <div className={styles.dataBoardContentBodyTrend}>
                        <img className={styles.dataBoardContentBodyTrendIcon} src={imgIcon[ele?.direction === 'UP' ? 14 : 19]} alt="" />
                        <span className={styles.dataBoardContentBodyTrendValue} style={{ color: ele?.direction === 'UP' ? '#FF0000' : '#22AC60' }}>{ele?.trend}</span>
                      </div>
                    )}
                    {ele?.searchRankLevel && ele?.type === 'price' && (
                      <div className={styles.dataBoardContentBodyValueUnit} style={{ marginTop: 8 }}>
                        <span className={styles.dataBoardContentBodyValueUnitDivider}>/</span>
                        <Tooltip placement="bottom" title={formatTooltipContent(ele?.searchRankLevelDesc)}>
                          <div
                          className={styles.dataBoardContentBodyValueUnitText}
                          style={{ color: searchRankLevelColorMap[ele?.searchRankLevel] }}
                          >
                            {ele?.text}
                          </div>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {ele?.isBtn && (
                <div className={styles.btn} onClick={ele?.handleBtn}>
                  <div className={styles.btnText}>{open ? $t("global-1688-ai-app.ChatFlow.DataBoard.sq", "收起") : $t("global-1688-ai-app.ChatFlow.DataBoard.zkviewSKU", "展开查看SKU")}</div>
                  <ChevronUpIcon className={`text-[#7B7B8D] ${open ? '' : 'rotate-180'}`} size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}