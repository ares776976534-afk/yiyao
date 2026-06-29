import React, { useState } from 'react';
import { Button, Dialog, Balloon } from '@alifd/next';
import './businessCard.scss';
import { qqjx_agreement_text_cell } from '@/pages/CrossBorderOfferlist/utils';
import { sellerFail, offerFail } from '@/pages/CrossBorderOfferlist/variables';
import { querySellerType, queryOfferModelList } from '@/pages/CrossBorderOfferlist/api';
import CountDown from '@/components/CountDown';
import Opportunity from './Opportunity';
import moment from 'moment';

const BusinessCard = (props) => {
  const { index, handleCardSuccess } = props;
  const { oppText, endTime, oppName, currentTime, strategyId, updateTime } = props.item || {};
  const [disabled, setDiasbled] = useState(false);

  const failDialogContentCell = (_query) => {
    const { list = [] } = _query;
    return (
      <div className="failDialogContentCell">
        <p>{_query.title}</p>
        {
          list?.map((item) => {
            return <p>{item}</p>;
          })
        }
      </div>
    );
  };
  // const handleClick = () => {
  //   const params = {
  //     title: oppName,
  //     subtitle: desc,
  //     agreementCellLabel: qqjx_agreement_text_cell,
  //   };
  //   const sellerFailParams = {
  //     title: '全球严选报名提醒',
  //     subtitle: '',
  //     content: failDialogContentCell(sellerFail),
  //     agreementCellLabel: null,
  //   };
  //   const offerFailParams = {
  //     title: '全球严选报名提醒',
  //     subtitle: '',
  //     content: failDialogContentCell(offerFail),
  //     agreementCellLabel: null,
  //   };
  //   let _status = 0;
  //   const oppTag = oppName === '全球严选' ? '' : oppName;
  //   // 查询商家是否可加入全球严选
  //   querySellerType(5117313).then((res) => {
  //     if (res && res.data) {
  //       // 商家是否符合资质
  //       if (res.data.data === 'true') {
  //         const _params = {
  //           pageNo: 1,
  //           pageSize: 9,
  //           ruleId: '901094',
  //           filterTag: '415426,575939',
  //           filterParams: { selectValue: '901094' },
  //           oppTag,
  //         };
  //         queryOfferModelList(_params).then((_res) => {
  //           if (_res.data) {
  //             // 商家是否有商品
  //             _status = _res.data.data?.length > 0 ? 1 : 3;
  //             // setTotal(_res.data?.total);
  //             props.updateDialogFunc(true, oppName, params, _status);
  //             switch (_status) {
  //               case 1:
  //                 // props.updateDialogFunc(true, oppName, params, _status);
  //                 updateBusinessFunc(true, params);
  //                 break;
  //               case 3:
  //                 // props.updateDialogFunc(true, oppName, offerFailParams, _status);
  //                 updateBusinessFunc(true, offerFailParams);
  //                 break;
  //               default:
  //                 break;
  //             }
  //           } else {
  //             // props.updateDialogFunc(true, oppName, offerFailParams, 3);
  //             updateBusinessFunc(true, offerFailParams);
  //           }
  //           // setFrom(oppName);
  //         });
  //       } else {
  //         _status = 2;
  //         // props.updateDialogFunc(true, oppName, sellerFailParams, _status);
  //         updateBusinessFunc(true, sellerFailParams);
  //       }
  //       setFrom(oppName);
  //     }
  //   });
  // };
  const handleJoin = () => {
    const dialog = Dialog.show({
      title: <span className="text-[16px] font-medium text-[#333]">{oppName}</span>,
      content: <Opportunity strategyId={strategyId} onClose={() => dialog.hide()} onSuccess={handleCardSuccess} oppName={oppName} dialogParams={qqjx_agreement_text_cell} oppText={oppText} />,
      footer: false,
      width: 800,
      className: 'join-opportunity-dialog',
    });
  };
  const _disable = endTime ? disabled : true;
  return (
    <div className="w-[280px] p-[16px] rounded-[6px]" style={{ border: '1px solid #ddd' }}>
      <div className="text-[#333] leading-[17px] text-[14px] font-[500]">
        {oppName}
      </div>
      {oppText?.length < 32 ? (
        <div className="text-[#999] leading-[17px] text-[12px] mt-[8px] text-ellipsis line-clamp-2 h-[34px]"> {oppText}</div>
      ) : (
        <Balloon.Tooltip
          trigger={<div className="text-[#999] leading-[17px] text-[12px] mt-[8px] text-ellipsis line-clamp-2 h-[34px]">{oppText}</div>}
          align="t"
          popupStyle={{ backgroundColor: '#333' }}
          popupClassName="products-business-tooltips"
        >
          <span className="">{oppText}</span>
        </Balloon.Tooltip>
      )}
      <div className="mt-[8px] flex justify-between items-center">
        <div className="flex flex-row items-center">
          <span className="text-[12px] text-[#666] leading-[12px] mr-[6px]">{updateTime ? '商机更新日期' : '倒计时'}</span>
          {updateTime ? (
            <span className="text-[12px] text-[#FF8B00] leading-[14px]">{moment(updateTime).format('YYYY-MM-DD')}</span>
          ) : (
            <CountDown endTime={endTime} startTime={currentTime}>
              {
                ({
                  hour,
                  min,
                  second,
                }) => {
                  return <span className="text-[12px] text-[#FF8B00] leading-[14px]">{hour}:{min}:{second}</span>;
                }
              }
            </CountDown>
          )}

        </div>
        <Button
          disabled={updateTime ? false : _disable}
          type="primary"
          style={{ borderRadius: '6px', height: '24px', fontSize: '12px' }}
          size="medium"
          onClick={handleJoin}
        >立即提报
        </Button>
      </div>
    </div>
  );
};

export default BusinessCard;
