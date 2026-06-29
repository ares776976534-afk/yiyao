import { Button, Balloon, Icon, Field, Checkbox, Message, Dialog, Switch, Radio } from '@alifd/next';
import { dialogStyle } from '@/styles/dialogStyle';
import React, { useEffect, useState, useRef } from 'react';

const updateDiscount = (data, setReReloadTransParam) => {
  if (data.minPostageDiscount) {
    setReReloadTransParam({
      ...data,
      shouldOpenDialogInstantly: false,
      needPostageDiscount: true,
      discountRange: [data.minPostageDiscount * 100, data.maxPostageDiscount * 100],
    });
  }
};
export const dealDiscountAndPriceAnomaly = async (
  data,
  getErrorInfos,
  setErrorBoxInfos,
  setReReloadTransParam,
  deliveryCostRef,
  logisticsIdRef,
  getParam,
) => {
  // 若价格异常
  if (data.needPostageDiscount) {
    const dialog = Dialog.show({
      title: '运费提醒',
      content: '您当前运费价格过高，建议设置运费折扣，降低运费后继续报名',
      onClose: () => {
        console.log('cancel')
        updateDiscount(data, setReReloadTransParam)
        dialog.hide();
      },
      footer: (
        <div className="error-modal-footer">
          <Button
            type="primary"
            onClick={() => {
              setReReloadTransParam({
                ...data,
                shouldOpenDialogInstantly: true,
                needPostageDiscount: true,
                discountRange: [data.minPostageDiscount * 100, data.maxPostageDiscount * 100],
              });
              dialog.hide();
            }}
          >
            去设置
          </Button>
        </div>
      ),
      style: {
        ...dialogStyle,
        width: '440px',
      },
    });
    if (Number(data.maxPostageDiscount) === 1) {
      return false
    }
    return true;
  } else if (data.priceAnomaly) {
    const errorInfoParams = {
      oppId: getParam('oppId'),
      logisticsId: logisticsIdRef.current,
      itemId: getParam('itemId'),
      lastPostage: deliveryCostRef.current,
      lastMinThresholdPrice: data.minThresholdPrice,
    };
    const getErrorInfo = (await getErrorInfos(errorInfoParams)) || {};
    if (getErrorInfo?.success) {
      setErrorBoxInfos(getErrorInfo?.data || {});
      const dialog = Dialog.show({
        title: '运费提醒',
        content: getErrorInfo?.data?.postageTypeText,
        // "为了给买家带来更好的体验，竞争也更加公平，爆款竞价需要支持官方运费模板。您当前商品报名价格低于官方运费，目前暂不支持报名，如果有疑问可进官方钉钉群咨询：85450011245",
        footer: (
          <div className="error-modal-footer">
            <Button
              type="primary"
              onClick={() => {
                // 重新请求【物流信息】
                // getTransInfo(getErrorInfo?.data?.postageType);
                setReReloadTransParam(getErrorInfo?.data?.postageType);
                dialog.hide();
              }}
            >
              确认修改
            </Button>
          </div>
        ),
        style: {
          ...dialogStyle,
          width: '440px',
        },
      });
    } else {
      Message.error({
        style: { zIndex: 9999 },
        content: '获取运费提醒信息失败!',
      });
    }
    return true;
  }
  // 不用打开弹窗，但是要更新下折扣信息
  updateDiscount(data, setReReloadTransParam)

  return false;
};
