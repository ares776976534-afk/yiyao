import React, { useState, useEffect } from 'react';
import ChangeLogisticsDialog from './ChangeLogisticsDialog';
import { dealPrice } from '@/utlis';
import { Message } from '@alifd/next';
import { queryTransInfo, queryOfficialAvgFgt } from '@/components/SupplyProductInfo/api';

function TransInfoBlock({
  getParam,
  logisticsId, // 物流模版ID
  skuDataInfoRef, // sku长宽高重量匹配
  setLogisticsIdFn,
  reReloadTransParam = null,
  getDeliveryCostCb = () => {},
  transInfoRef,
  hasAlreadyDiscountRef,
}) {
  const [logisticsVisible, setLogisticsVisible] = useState(false);
  const [transInfo, setTransInfo] = useState([
    {
      label: '发货地址',
      key: 'sendAddress',
      value: '',
      action: {
        label: '修改',
        onClick: () => {
          setLogisticsVisible('Address');
        },
      },
    },
    {
      label: '运费模板',
      key: 'logisticsTemplateName',
      value: '',
      action: {
        label: '查看',
        onClick: () => {
          setLogisticsVisible('OfficalFreightTemplate');
        },
      },
    },
    {
      label: '商品重量',
      key: 'weight',
      value: '',
      action: {
        label: '去设置',
        onClick: () => {
          setLogisticsVisible('InputArrtribute');
        },
      },
    },
    {
      label: '商品邮费',
      key: 'postage',
      value: '',
      action: {
        label: '',
        onClick: () => {
          // reloadTableRef.current();
          // 只重新计算邮费
        },
      },
    },
  ]);
  const [officalFreightTemplateProps, setOfficalFreightTemplateProps] = useState(null);
  // 物流信息查询
  const getTransInfo = async (postageType) => {
    const data = await queryTransInfo({
      oppId: getParam('oppId'),
      itemId: getParam('itemId'),
      postageType,
    });
    setLogisticsIdFn(data?.logisticsId);
    // 处理/显示物流信息 + 计算运费
    const newInfo = await dealTransInfo(transInfo, data, postageType, data?.logisticsId);
    const _newInfo = newInfo.map((item) => item.value);
    transInfoRef.current = _newInfo;
    setTransInfo(_newInfo);
  };
  const dealTransInfo = (infos, data, postageType, _logisticsId) => {
    return new Promise((resolve, reject) => {
      const promises = [];
      infos.forEach((item) => {
        item.value = data[item.key];
        if (item.key === 'sendAddress') {
          if (!data['sendAddress'] || data['sendAddress'].length === 0) {
            item.value = '未设置';
            item.action.label = '去新建';
          } else {
            item.action.label = '修改';
          }
        }
        // 不透出【查看运费模板】的入口
        if (item.key === 'logisticsTemplateName' && !data.templateCanView) {
          item.action.label = null;
        }
        if (item.key === 'weight') {
          if ((data['notCompleteMsg'] && data['notCompleteMsg'].length > 0) || !data['weight']) {
            item.value = data['notCompleteMsg'] || '未设置';
          } else {
            item.value = data['weight'] + '千克';
          }
        }
        // 计算运费
        // 1. 重量设置不完全或未设置（即notCompleteMsg字段存在时） 邮费不显示
        if (item.key === 'postage' && data['notCompleteMsg']) {
          item.value = '';
        }
        // 2. 重量设置完全下 邮费进行查询
        if (item.key === 'postage' && data.completeData) {
          const promise = new Promise(async (resolveSingle) => {
            const { officialAvgFgt, freightType, historyAvgFgt } = await queryOfficialAvgFgt({
              oppId: getParam('oppId'), // 商机ID
              itemId: getParam('itemId'), // 商品ID,
              logisticsId: _logisticsId, // 物流模版ID,
              categoryId: getParam('categoryId'), // 类目ID
              clusterId: getParam('clusterId'), // ---商品簇ID
              postageType,
            });
            const price = String(freightType) === '3' ? dealPrice(historyAvgFgt) : dealPrice(officialAvgFgt);
            item.value = price ? price + '元' : '-';
            if (price) {
              getDeliveryCostCb && getDeliveryCostCb(price);
            }
            resolveSingle(item);
          });
          promises.push(promise);
          return;
        }
        promises.push(Promise.resolve(item));
      });
      Promise.allSettled(promises).then((results) => resolve(results));
    });
  };
  useEffect(() => {
    if (reReloadTransParam && reReloadTransParam.needPostageDiscount) {
      setTransInfo((old) => {
        return old.map((item) => {
          if (item.key === 'logisticsTemplateName' && item.action.label) {
            item.action.label = '设置折扣';
          }
          return item;
        });
      });
      setOfficalFreightTemplateProps({
        isDiscount: true, // 是否开启批量打折能力
        discountRange: reReloadTransParam.discountRange, // 折扣范围 [0,100]
        onCancel: () => {
          setLogisticsVisible(false);
        }, // 取消回调
        onSuccess: () => {
          getTransInfo();
          setLogisticsVisible(false);
          hasAlreadyDiscountRef.current = true;
        }, // 保存接口回调成功
        onFail: (data) => {
          if (data.errorCode === 'outOfDiscount') {
            Message.warning('您当前运费价格过高，建议设置运费折扣，降低运费后继续报名');
          } else {
            Message.error('设置失败');
          }
        }, // 保存接口回调失败
      });
      if (reReloadTransParam.shouldOpenDialogInstantly) {
        setTimeout(() => {
          setLogisticsVisible('OfficalFreightTemplate');
        }, 1000);
      }
    } else {
      getTransInfo(reReloadTransParam);
    }
  }, [reReloadTransParam]);
  return (
    <div className="w-full bg-[#f8f8f8] rounded-[6px] text-[14px] p-[16px]">
      {Array.isArray(transInfo) &&
        transInfo.filter((ele) => ele?.key !== 'postage').map((item) => {
          return (
            <div key={item.label} className="mb-[16px] last:mb-[0px] flex">
              <span className="text-[#666] text-right pr-[12px]">{item.label}</span>
              {/* <span className='text-[#333] mr-[12px] '> */}
              <span
                className={
                  item.value && String(item.value).includes('设置')
                    ? 'text-[#FF7300] mr-[12px]'
                    : 'text-[#333] mr-[12px]'
                }
              >
                {item.value}
              </span>
              {item.action.label && (
                <span className="text-[#0077FF] flex items-center cursor-pointer" onClick={item.action.onClick}>
                  {item.action.label}
                  {!item.action.label.startsWith('重新计算') && (
                    <img
                      className="w-[16px] h-[16px] ml-[4px]"
                      src="https://img.alicdn.com/imgextra/i3/O1CN01zef3Kz1gT5URGiSgk_!!6000000004142-2-tps-32-32.png"
                    />
                  )}
                </span>
              )}
            </div>
          );
        })}
      {logisticsId && (
        <ChangeLogisticsDialog
          visible={logisticsVisible}
          setVisible={setLogisticsVisible}
          recordData={logisticsId}
          officalFreightTemplateProps={officalFreightTemplateProps}
          onSuccess={(id, inputArrtributeData) => {
            // reloadTableRef.current();
            // 每次修改完物流信息后，都重新查询一次物流信息+计算运费
            getTransInfo();
            skuDataInfoRef.current = inputArrtributeData;
            hasAlreadyDiscountRef.current = false; // 重置
            setLogisticsVisible(false);
          }}
        />
      )}
    </div>
  );
}

export default TransInfoBlock;
