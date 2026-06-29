import React from 'react';
import { Button, Balloon, Icon, Field, Checkbox, Message, Dialog, Switch, Radio } from '@alifd/next';
import { dealPrice, Logger, scrollTo } from '@/utlis';
import { dialogStyle } from '@/styles/dialogStyle';
import { supplyProductSignUp, getLogistics } from './api';
import { formatNumber } from './utils';

export const dealJump = (supplyProductId, getParam) => {
  const url = location.origin + location.pathname;
  // 若初次提报时关联天猫商机 则弹出--跳转【官方店】
  if (getParam('supplyProductId').length === 0 && getParam('tmall') === '1') {
    const dia = Dialog.notice({
      v2: true,
      title: '温馨提示',
      content: '恭喜你！该供给已被【站外官方店】选中！完善天猫信息，即刻享受天猫官方场景资源推广。',
      footerAlign: 'center',
      footer: (
        <>
          <Button
            type="primary"
            className="mr-[10px]"
            onClick={() => {
              window.open(
                `https://taodadian.1688.com/page/starliner?force=true&st_transform_did=1407&st_dist_src_id=${supplyProductId}&layout=none&st_dist_src_type=3`,
              );
              dia.hide();
              // 跳转到商机列表页
              setTimeout(() => {
                window.location.href = url;
              }, 3000);
            }}
          >
            完善信息
          </Button>
          <Button
            onClick={() => {
              dia.hide();
              // 跳转到商机列表页
              setTimeout(() => {
                window.location.href = url;
              }, 3000);
            }}
          >
            取消
          </Button>
        </>
      ),
      style: dialogStyle,
    });
  } else {
    // 跳转到商机列表页
    setTimeout(() => {
      window.location.href = url;
    }, 3000);
  }
};
const judgeIsCheap = (field) => {
  let cheapTag = false;
  const fieldData = JSON.parse(JSON.stringify(field.getValues()));
  Object.keys(fieldData).forEach((key) => {
    const supplyPrice = parseFloat(fieldData[key]['supplyPrice']);
    const base = parseFloat(fieldData[key]['referenceSupplyPrice'] / 10);
    if (fieldData[key]['referenceSupplyPrice'] && supplyPrice < base) {
      cheapTag = true;
    }
  });
  return cheapTag;
};
const collectPageData = ({
  fieldData,
  skuDataInfoRef,
  getParam,
  errorBoxInfos,
  deliveryCostRef,
  logisticsIdRef,
  servicesList,
  showServices,
  channelList,
}) => {
  const skuParamList = [];
  const isEditBefore = getParam('supplyProductId').length > 0;
  Object.keys(fieldData).forEach((recordId) => {
    const skuId = fieldData[recordId].skuId;
    const skuInfo = skuDataInfoRef.current.find((skuData) => String(skuData.skuId) === String(skuId));
    if (fieldData[recordId] && skuId && skuId !== 'undefined') {
      const data = {
        // 来自物流组件的件重尺数据
        ...skuInfo,
        ...fieldData[recordId], // skuId !== 'undefined' 才传
      };
      if (isEditBefore && fieldData[recordId].cSkuId) {
        const cSkuId = fieldData[recordId].cSkuId;
        data.cSkuId = String(cSkuId);
      }
      // 库存同步时 不传库存字段
      // if (fieldData[recordId].invControlSku === true) {
      //   delete data.quantity;
      // }
      skuParamList.push(formatNumber(data));
    }
  });

  if (skuParamList.length === 0) {
    Logger.saveRecord({
      type: 'skuParamList_empty',
      data: { fieldData, urlParams: getParam() },
    });
    return null;
  }
  const data = {
    oppId: getParam('oppId'),
    offerId: getParam('itemId'),
    postageType: errorBoxInfos.postageType,
    postage: deliveryCostRef.current,
    logisticsConfigId: logisticsIdRef.current,
    skuParamList,
  };
  if (isEditBefore) {
    const bargain = String(getParam('bargain')) === 'true';
    data.bargain = bargain; // 是否为小二议价来源
    data.supplyProductId = getParam('supplyProductId');
  }
  // 根据 servicesList 加入对应服务承诺字段
  // const servicesValue = {};
  // servicesList.forEach((item) => {
  //   if (['essxsfh', 'ssbxsfh'].includes(item)) {
  //     servicesValue.fhsx = item;
  //   } else {
  //     servicesValue[item] = true;
  //   }
  // });
  // console.log('[ servicesList ] >', servicesList);
  // return;
  // showServices的才入参servicesValue
  if (showServices) {
    const filteredServices = servicesList.filter((service) => service !== null);
    data.protectServiceCodes = filteredServices;
    Object.assign(data, { protectServiceCodes: filteredServices });
  }
  // showServices && Object.assign(data, servicesList);
  if (channelList.length > 0) {
    // 分销 字段
    data.waybillChannels = channelList;
  }
  // console.log('[ data ] >', data);
  // return null;
  return data;
};
export const handleSubmit = ({
  signUpFn,
  showAgreement,
  logisticsIdRef,
  skuDataInfoRef,
  querySignAgreementRef,
  field,
  deliveryCostRef,
  transInfoRef,
  setSubmitLoading,
  servicesList,
  showServices,
  getParam,
  errorBoxInfos,
  checkboxChecked,
  componentData,
  successCallback,
  channelList,
}) => {
  setSubmitLoading(true);
  try {
    if (!logisticsIdRef.current) {
      Message.error('物流模版ID获取失败');
      setSubmitLoading(false);
      return;
    }
    field.validate(async (errors, values) => {
      if (!errors) {
        // 提交表单
        // const res = await dealSellerTypeSubmit();
        const res = showAgreement ? await querySignAgreementRef.current() : true;
        if (res) {
          // 查询下物流信息
          if (!skuDataInfoRef.current) {
            const data = await getLogistics({ id: logisticsIdRef.current });
            if (data.succeed) {
              skuDataInfoRef.current = data.model.specificationDTOList;
            }
          }
          const finalData = collectPageData({
            fieldData: values,
            skuDataInfoRef,
            getParam,
            errorBoxInfos,
            deliveryCostRef,
            logisticsIdRef,
            servicesList,
            showServices,
            channelList,
          });
          if (!finalData) {
            Message.error({
              content: '提报内容为空，请先设置【物流信息】中的商品重量!',
            });
            setSubmitLoading(false);
            return;
          }
          const hasOpp = !!getParam('oppId');
          const signUpData = {
            param: finalData,
            option: {
              signUpType: hasOpp ? 'HOT_OPP' : 'SUPPLIER',
            },
          };
          if (showAgreement) signUpData.option.needEntrustOffer = checkboxChecked[0];
          if (signUpFn && typeof signUpFn === 'function') {
            if (!deliveryCostRef.current) {
              Message.error('运费不能为空');
              setSubmitLoading(false);
              return;
            }
            // console.log('[ signUpData ] >', signUpData.param.skuParamList);
            signUpFn(signUpData, transInfoRef.current);
            setSubmitLoading(false);
            return;
          }
          // console.log('[ signUpData ] >', signUpData);
          // setSubmitLoading(false);
          // return;
          supplyProductSignUp(signUpData)
            .then((data) => {
              Logger.report({ d: 'OTHER', e: '4提交成功@funnel_提报' });
              Message.success('提报成功！');
              if (componentData.isInDrawer) {
                successCallback();
              } else {
                dealJump(data.model.supplyProductId, getParam);
              }
            })
            .catch((error) => {
              Logger.saveRecord({
                type: 'supplyProductSignUp_fail',
                data: finalData,
                msg: error.errorMessage,
              });
              Message.error(error.errorMessage || '提报失败');
            })
            .finally(() => {
              setSubmitLoading(false);
            });
        }
      } else {
        setSubmitLoading(false);
        Message.warning('你有不满足填写要求的字段，请修改后再次提报！');
      }
    });
  } catch (errors) {
    setSubmitLoading(false);
    Message.warning('你有不满足填写要求的字段，请修改后再次提报！');
  }
};
export const popOfTooCheapJudge = (_data) => {
  // console.log('[ _data ] >', _data.servicesList);
  // return
  const { field, serviceOkRef, showServices } = _data;
  if (showServices && !serviceOkRef.current) {
    document.getElementById('servicePromise') && scrollTo(document.getElementById('servicePromise'));
    Message.error('请再次确认服务');
    return;
  }
  Logger.report({ d: 'CLK', e: '3点击提交按钮@funnel_提报' });
  const isCheap = judgeIsCheap(field);
  if (isCheap) {
    const dialog = Dialog.show({
      v2: true,
      title: '温馨提示',
      footerAlign: 'center',
      content: <div>您提交的价格偏低，请核算成本后再做决定，避免资金损失</div>,
      footer: (
        <div className="error-modal-footer">
          <Button
            type="primary"
            className="mr-[10px]"
            onClick={() => {
              dialog.hide();
            }}
          >
            去修改价格
          </Button>
          <Button
            onClick={() => {
              handleSubmit(_data);
              dialog.hide();
            }}
          >
            仍要提交
          </Button>
        </div>
      ),
      style: {
        ...dialogStyle,
        width: '420px',
      },
    });
  } else {
    handleSubmit(_data);
  }
};
