import React, { useState, useEffect } from 'react';
import { Dialog, Checkbox, Button, Message, Balloon } from '@alifd/next';
import { QQJX_XIEYI } from '@/constant';
import { newItemOppSignUp, queryIsShopAutoJoin } from '../api';
import { queryIsAutoInvite } from '@/pages/CrossBorderOfferlist/api';
import { Logger } from '@/utlis';
import './deliverModal.scss';

// data是getOppList接口返回的list中的item
export const DeliverModal = ({ visible, onClose, data }) => {
  const [checked, setChecked] = useState(true);
  const [info, setInfo] = useState([]);
  const [require, setRequire] = useState([]);
  const [isAutoInvite, setIsAutoInvite] = useState(false);

  const { title, imageUrl, publishNewItemUrl, extraInfo,
    signUpRequire, oppMatchId, offerDetailUrl } = data;

  useEffect(() => {
    if (visible) {
      try {
        const arr = JSON.parse(extraInfo);
        setInfo(arr);
        const requireArr = JSON.parse(signUpRequire);
        setRequire(requireArr);
      } catch (error) {
        console.log(error);
      }

      queryIsAutoInvite().then((res) => {
        const { success, msg, model } = res?.content;
        if (success) {
          setIsAutoInvite(model);
        } else {
          Message._show({ content: msg || '系统异常', type: 'error' });
        }
      }).catch((err) => { Message._show({ content: err.message || '系统异常', type: 'error' }); });

      queryIsShopAutoJoin().then((res) => {
        if (res.content.model) {
          setIsAutoInvite(true);
        }
      });
    }
  }, [extraInfo, signUpRequire, visible]);

  const onPublish = () => {
    Logger.report({ d: 'CLK', e: '2新品商机弹框点击按钮@funnel_发布同款' });
    newItemOppSignUp({
      newItemOppSignUpParam: {
        isAutoJoinQqyx: isAutoInvite ? true : checked,
        oppMatchId,
      },
    }).then((res) => {
      if (res.content.model) {
        onClose();
        window.open(publishNewItemUrl, '_blank');
      } else {
        Message.error(res.content.message || '发布失败');
      }
    });
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="商机商品发布要求"
      footer={false}
      width={560}
      className="deliver-modal"
    >
      <div className="flex flex-col gap-5 text-sm text-[#333]">
        <div className="flex flex-col gap-[16px] p-[20px] bg-[#F8F8F8] rounded-[6px]">
          {title?.length < 32 ? (
            <span className="text-[16px] font-medium leading-[19px] text-ellipsis line-clamp-1"> {title}</span>
          ) : (
            <Balloon.Tooltip
              trigger={<div className="text-[16px] font-medium leading-[19px] text-ellipsis line-clamp-1">{title}</div>}
              align="t"
              popupStyle={{ backgroundColor: '#333' }}
              popupClassName="products-business-tooltips"
            >
              {title}
            </Balloon.Tooltip>
          )}
          <div className="flex flex-row gap-[12px]">
            <img
              src={imageUrl}
              style={{
                width: 76,
                height: 76,
                borderRadius: 6,
                cursor: 'pointer',
              }}
              onClick={offerDetailUrl ? () => {
                window.open(offerDetailUrl, '_blank');
              } : () => { }
              }
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 32px' }}>
              {info.map((item, i) => {
                const { label, value } = item;
                return (
                  <div key={i} className="flex items-center w-[180px]">
                    <span className="text-[14px] leading-[17px] text-[#999] mr-[8px]">{item.label}</span>
                    {item.value?.length < 10 ? (
                      <div className="text-[#333] text-[14px] leading-[17px] text-ellipsis line-clamp-1 w-[102px]">{item.value}</div>
                    ) : (
                      <Balloon.Tooltip
                        trigger={<div className="text-[#333] text-[14px] leading-[17px] text-ellipsis line-clamp-1 w-[102px]">{item.value}</div>}
                        align="t"
                        popupStyle={{ backgroundColor: '#333' }}
                        popupClassName="products-business-tooltips"
                      >
                        {item.value}
                      </Balloon.Tooltip>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[16px] p-[20px] bg-[#F8F8F8] rounded-[6px]">
          <div className="text-[16px] font-medium leading-[19px]">报名商品要求</div>
          <div className="flex flex-wrap gap-[16px]">
            {require.map((item, i) => {
              return (
                <div key={i} className="flex items-center min-w-0 flex-shrink-0">
                  <span className="text-[14px] leading-[17px] text-[#999] mr-[8px] flex-shrink-0">{item.label}</span>
                  <div className="text-[#333] text-[14px] leading-[17px]">{item.value}</div>
                </div>
              );
            })
             }
          </div>
        </div>
        {
          !isAutoInvite && (
            <div className="flex items-center">
              <Checkbox
                defaultChecked={checked}
                onChange={(_checked) => {
                  setChecked(_checked);
                }}
              >
                <span>
                  加入全球严选，享受跨境流量。我已阅读并同意
                  <a target="_blank" href={QQJX_XIEYI} rel="noreferrer">
                    《大严选帮卖协议》
                  </a>
                </span>
              </Checkbox>
            </div>
          )
        }
        <Button
          type="primary"
          className="w-[88px] h-8 mx-auto block"
          onClick={onPublish}
        >
          发布同款
        </Button>
      </div>
    </Dialog >
  );
};
