import React from 'react';
import style from './demandSituation.module.scss';
import { imgIcon } from '@/components/ChatFlow/imgIcon';
import LineChart from '@/components/ChatFlow/LineAreaChart';
import { Tooltip } from 'antd';
import { formatTooltipContent } from '@/components/ChatFlow/DataBoard'

export default function DemandSituation({ list = [] }: { list?: any[] }) {
  return (
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
                      <div className={style.demandSituationItemAreaEmpty}>即将上线</div>
                      )
                    }
                  </div>
                <div className={style.demandSituationItemArea}>
                {item?.searchRankLevelDesc ? (
                    <Tooltip placement="top" title={formatTooltipContent(item?.searchRankLevelDesc)}>
                      <div className={style.demandSituationItemAreaTitle} style={{ cursor: 'pointer' }}>{item.areaTitle}</div>
                    </Tooltip>
                  ) : (
                    <div className={style.demandSituationItemAreaTitle}>{item.areaTitle}</div>
                  )}
                    {item?.cardSubType === 'CATE_SELECT_CARD' ? (
                    <div className={style.demandSituationItemAreaEmpty}>即将上线</div>
                  ) : (
                    <LineChart
                      type='mobile'
                      reflect={item?.reflect}
                      data={item.areaData}
                      toolTipYName={item.toolTipYName}
                      style= {{ height: '17.5px', width: '100%' }}
                      height={17.5}
                    />
                  )}
                </div>
              </div>
            </div>
            {index !== list?.length - 1 && <img src={imgIcon[17]} alt='直线' className={style.demandSituationItemLine} />}
          </React.Fragment>
        )
      })}
    </div>
  );
}