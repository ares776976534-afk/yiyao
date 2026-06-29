import React from 'react';
import style from './index.module.css';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import LineChart from '@/components/ChatFlow/LineAreaChart';
import { Tooltip } from 'antd';
import { $t } from '@/i18n';
import { formatTooltipContent } from '@/components/ChatFlow/DataBoard'

export default function DemandSituation({ list = [], styles }: { list?: any[]; styles?: any, toolTipYName?: string }) {
  return (
    <div className={style.demandSituation} style={styles}>
      <div className={style.demandSituationTitle}>{$t("global-1688-ai-app.ChatFlow.DemandSituation.xqqk", "需求情况")}</div>
      <div className={style.demandSituationContent}>
        {list?.map((item, index) => {
          return (
            <React.Fragment key={item.title || index}>
              <div className={style.demandSituationItem}>
                <div className={style.demandSituationItemTitle}>
                  <img src={item.iconTitle} alt={item.title} className={style.demandSituationItemTitleIcon} />
                  {item.title}
                </div>
                <div className={style.demandSituationItemContent}>
                  <div className={style.demandSituationItemContentItem}>
                    <div className={style.demandSituationItemSubTitle}>{item.subTitle}</div>
                      {item?.value ? (
                        <div className={style.demandSituationItemValue}>{item?.value}</div>
                      ) : (
                        <div className={style.demandSituationItemAreaEmpty}>{$t("global-1688-ai-app.ChatFlow.DemandSituation.jjsx", "即将上线")}</div>
                        )
                      }
                    </div>
                  <div className={style.demandSituationItemArea}>
                  {item?.searchRankLevelDesc ? (
                      <Tooltip placement="top" title={formatTooltipContent(item?.searchRankLevelDesc)}>
                        <div className={style.demandSituationItemAreaTitle} style={{ cursor: 'pointer' }}>{item.areaTitle}</div>
                      </Tooltip>
                    ): (
                      <div className={style.demandSituationItemAreaTitle}>{item.areaTitle}</div>
                    )}
                    
                    {/* {item?.areaData?.length > 0 ? (
                      <LineChart reflect={item?.reflect} data={item.areaData} />
                    ) : (
                      <div className={style.demandSituationItemAreaEmpty}>即将上线</div>
                    )} */}
                     {item?.cardSubType === 'CATE_SELECT_CARD' ? (
                      <div className={style.demandSituationItemAreaEmpty}>{$t("global-1688-ai-app.ChatFlow.DemandSituation.jjsx", "即将上线")}</div>
                    ) : (
                      <LineChart reflect={item?.reflect} data={item.areaData} toolTipYName={item.toolTipYName} />
                    )}
                  </div>
                </div>
              </div>
              {index !== list?.length - 1 && <img src={imgIcon[17]} alt={$t("global-1688-ai-app.ChatFlow.DemandSituation.zx", "直线")} className={style.demandSituationItemLine} />}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  );
}