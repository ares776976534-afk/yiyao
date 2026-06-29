import React, { useState, useEffect, useRef } from 'react';
import { Button, Field, Icon, Checkbox } from '@alifd/next';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import Block from '@/layouts/Block';
import { HeaderInfoCard, ItemCommonTable } from '@/pages/ManageSupplyGoods/components';
import schema from '@/pages/ManageSupplyGoods/components/itemSchema';
import './index.scss';
import { setDeliveryTime, setDeliveryTimeMap } from './enums';
import BalloonPrompt from '@/pages/Select/components/BalloonPrompt';
import SelectHostingChannel from './components/SelectHostingChannel';
import TransInfoBlock from '@/pages/ManageSupplyGoods/components/TransInfoBlock';
import { querySignSelect, queryItemPws } from '@/pages/Select/services';
import { getSingleItemSignUpDetail, singleItemSignUp, getLogistics } from './services';
import { getQueryParams, Logger, MessageError } from '@/utlis';
import Message from '@/components/UI/Message';
import { getAllUrlParams, getUrlParam } from '@/pages/ManageSupplyGoods/utlis.js';
import PieceWeightDialog from '@/pages/Select/components/PieceWeightDialog';

function ChoiceSingleProductRecruitment({
  data: componentData = { isInDrawer: false },
}) {
  const field = Field.useField({ parseName: true });
  const channelField = Field.useField({ parseName: true });
  const [activeTab, setActiveTab] = useState('ssbxsfh');
  const [hasActiveTab, setHasActiveTab] = useState(false);
  const [signDisable, setSignDisable] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [sign, setSign] = useState(false);
  const [checkList, setCheckList] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [logisticsId, setLogisticsId] = useState(null);
  const [data, setData] = useState({});
  const skuDataInfoRef = useRef(null);
  const logisticsIdRef = useRef(null);
  const transInfoRef = useRef(null);
  const deliveryCostRef = useRef(null);
  const hasAlreadyDiscountRef = useRef(false);
  const [isloading, setIsloading] = useState(false);
  const [modelData, setModelData] = useState({});
  const [reReloadTransParam, setReReloadTransParam] = useState(null);
  const setLogisticsIdFn = (_logisticsId) => {
    setLogisticsId(_logisticsId);
    logisticsIdRef.current = _logisticsId;
  };
  const getParam = (p) => {
    if (componentData.isInDrawer) {
      if (!p) return componentData;
      if (componentData[p] === undefined || componentData[p] === null) return '';
      return String(componentData[p]);
    }
    if (!p) {
      return getAllUrlParams();
    } else {
      return getUrlParam(p);
    }
  };
  const listQueryFn = () => {
    return new Promise((resolve) => {
      getSingleItemSignUpDetail({
        request: {
          itemId: getQueryParams('itemId'),
          strategyId: getQueryParams('strategyId'),
          recruitType: getQueryParams('recruitType'),
        },
      }).then((res) => {
        const { model, success, msg = '数据异常' } = res;
        if (success) {
          setActiveTab(model?.deliveryTime || 'ssbxsfh');
          setHasActiveTab(model?.deliveryTime);
          setCheckList(model?.checkList);
          setSkuList(model?.skuList);
          setData(model);
          resolve({ model: model?.skuList, total: 10 });
        } else {
          Message._show({ content: msg, type: 'error' });
        }
      }).catch((err) => {
        Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
      });
    });
  };
  const onJumpTo = () => {
    const currentUrl = new URL(window.location.href);
    const { origin } = currentUrl;
    window.location.href = `${origin}/app/channel-fe/chain-work/select.html`;
  };
  const handleTabClick = (key) => {
    setActiveTab(key);
  };
  const getQueryItemPws = () => {
    queryItemPws({
      itemId: getQueryParams('itemId'),
    }).then((res) => {
      const { success = false, msg = '系统错误，请稍后再试', model = {} } = res?.content || {};
      if (success) {
        setModelData(model);
      } else {
        MessageError(msg || '系统错误，请稍后再试');
      }
    }).catch((error) => {
      MessageError(error?.errMsg || '系统错误，请稍后再试');
    });
  };
  const reload = () => {
    getQueryItemPws();
    querySignSelect()
      .then((res) => {
        setSign(res);
        setIsChecked(res);
        setSignDisable(res);
      });
  };
  useEffect(() => {
    reload();
  }, []);
  const handleSign = () => {
    if (!signDisable) {
      setSign(!sign);
    }
  };
  const onChange = (v) => {
    setIsChecked(v);
  };
  const updatedSkuList = (list, obj) =>
    list?.map((sku) => ({
      skuId: sku?.skuId,
      oppMatchId: sku?.oppMatchId,
      ...(obj[sku?.skuId] && {
        // moq: obj[sku?.skuId]?.moq,
        // pcs: obj[sku?.skuId]?.pcs,
        signUpPrice: obj[sku?.skuId]?.signUpPrice,
        stock: obj[sku?.skuId]?.stock,
      }),
    }));
  const mergeSkuList = (a, b) => {
    const c = a.reduce((acc, itemA) => {
      const itemB = b.find((item) => `${item.skuId}` === `${itemA.skuId}`);
      if (itemB) {
        acc.push({ ...itemA, ...itemB });
      } else {
        acc.push(itemB);
      }
      return acc;
    }, []);
    return c;
  };
  const getSingleItemSignUp = (list) => {
    setIsloading(true);
    singleItemSignUp({
      request: JSON.stringify(
        {
          itemId: getQueryParams('itemId'),
          strategyId: getQueryParams('strategyId'),
          deliveryTime: activeTab,
          logisticsId,
          recruitType: getQueryParams('recruitType'),
          postage: deliveryCostRef?.current,
          skuList: mergeSkuList(updatedSkuList(skuList, field.getValues()), list).filter(Boolean).map((ele) => ({
            skuId: ele?.skuId,
            oppMatchId: ele?.oppMatchId,
            signUpPrice: ele?.signUpPrice,
            stock: ele?.stock,
            length: ele?.length,
            width: ele?.width,
            height: ele?.height,
            weight: ele?.weight,
          })),
        },
      ),
    })
      .then((res) => {
        const { model, msg = '数据异常' } = res;
        if (model) {
          setIsloading(false);
          onJumpTo();
        } else {
          setIsloading(false);
          Logger.saveRecord(res);
          Message._show({ content: msg, type: 'error' });
        }
      })
      .catch((err) => {
        setIsloading(false);
        Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
      });
  };
  const onSubmit = () => {
    if (deliveryCostRef?.current === null) {
      return Message._show({ content: '检查物流信息', type: 'error' });
    }
    field.validate(async (errors) => {
      if (errors) {
        return;
      }
      if (!skuDataInfoRef.current) {
        const getLogisticsData = await getLogistics({ id: logisticsIdRef.current });
        if (getLogisticsData.succeed) {
          if (getLogisticsData.model.specificationDTOList.some((item) => JSON.stringify(item) === '{}')) {
            Message._show({ content: '物流信息异常，请重试', type: 'error' });
          } else {
            getSingleItemSignUp(getLogisticsData.model.specificationDTOList);
          }
        }
      } else {
        getSingleItemSignUp(skuDataInfoRef.current);
      }
    });
  };
  return (
    <div>
      <NewWorkLayout title="Choice单品报名" style={{ marginBottom: '112px' }}>
        {/* <div className="text-[#666] text-[14px] mb-[12px] bg-[#EBF6FF] rounded-[6px] py-[9px] px-[12px]">报名的商品可能被选中需要入仓</div> */}
        <Block
          title="商机需求"
          className="choice-business-opportunity-demand"
        >
          <HeaderInfoCard {...data} />
        </Block>
        {modelData?.isAlert && (
          <div className="py-[9px] px-[12px] bg-[#FFF2ED] text-[14px] flex items-center rounded-[6px] mb-[20px]">
            <img src="https://img.alicdn.com/imgextra/i1/O1CN01zrTaVz1T5BrNgir2y_!!6000000002330-2-tps-16-16.png" alt="" srcSet="" />
            <div className="text-[#666] ml-[8px]">件重尺数据不准确，请查看建议值并修改</div>
            <div
              className="text-[#0077FF] cursor-pointer ml-[8px]"
              onClick={() => PieceWeightDialog.open({
                records: modelData,
                onActionOk: () => {
                  reload();
                  setReReloadTransParam('1');
                },
              })}
            >
              查看建议并修改
            </div>
          </div>
        )}
        <Block
          title="商机提报"
          className="choice-single-product-recruitment"
        >
          {checkList?.length && checkList?.some((item) => item.result === false) && (
            <div className="bg-[#FFF9EB] p-[16px] text-[14px] text-[#333] mt-[20px]">
              <div className="text-[16px] font-medium mb-[16px] leading-4">
                当前商品不符合提报门槛
                <span className="text-[#666] text-[14px] ml-[12px] font-normal">您可在商品发布页面编辑商品，完成提报条件；达到门槛后，刷新此页面即可进行提报。</span>
              </div>
              <div className="text-[14px] text-[#333]">
                {checkList?.map((ele) => (
                  <div className="mb-[8px] flex items-center">
                    <Icon type={ele?.result ? 'ic_success' : 'ic_x_circle'} className={`mr-[8px] ${ele?.result ? 'text-[#3BB347]' : 'text-[#FB3B20]'}`} size="small" />
                    {ele?.desc}
                    {!ele?.result && (
                      <span className="text-[#0077FF] cursor-pointer flex items-center ml-[8px]" onClick={() => window.open(`https://offer.1688.com/offer/post/fill_product_info.vm?operator=edit&offerId=${data?.itemId}`)}>
                        去修改
                        <img src="https://img.alicdn.com/imgextra/i3/O1CN01zef3Kz1gT5URGiSgk_!!6000000004142-2-tps-32-32.png" alt="" className="w-[16px] h-[16px] ml-[4px]" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mb-[20px] text-[14px] text-[#333] mt-[20px]">
            <div className="font-medium mb-[12px] leading-4">
              托管渠道
              <BalloonPrompt />
            </div>
            <SelectHostingChannel field={channelField} />
          </div>
          <div className="mb-[20px] text-[14px] text-[#333]">
            <div className="font-medium mb-[12px]">
              设置发货时效
              {hasActiveTab === 'ssbxsfh' && (
                <span className="text-[#FF8B00] ml-[8px] font-normal">
                  托管商品需要保证48小时内发货，如果您的商品未达到要求，将为您自动开启/更改为48小时发货。
                </span>
              )}
            </div>
            <div className="flex flex-wrap">
              {setDeliveryTime.map((item) => {
                const isSelected = activeTab === item.key;
                return (
                  <div
                    key={item.title}
                    // eslint-disable-next-line no-nested-ternary
                    className={`w-[256px] p-[16px] border rounded-[6px] 'bg-[#fff]' ${!isSelected ? 'border-[#BBB]' : 'border-blue-500'} cursor-pointer mr-[16px] relative iconSelected`}
                    onClick={() => handleTabClick(item.key)}
                  >
                    <div className="leading-[17px] text-[#333]">{item.title}</div>
                    {isSelected && (
                      <div className="iconStyle absolute bottom-0 right-0 h-0 w-0 rounded-br-[6px] border-[12px] border-solid border-b-blue-500 border-r-blue-500 border-l-transparent border-t-transparent" >
                        <Icon type="select" className="text-white absolute bottom-[-17px] right-[-13px]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mb-[20px] text-[14px] text-[#333]">
            <div className="font-medium mb-[12px]">
              物流信息
            </div>
            <div className="mt-[12px] mb-[12px] text-[#666]">
              为了避免产生物流费用的纠纷，请您仔细维护运费模版信息，若产生不合理物流费用由商家自行承担
            </div>
            <TransInfoBlock
              getParam={getParam}
              logisticsId={logisticsId}
              transInfoRef={transInfoRef}
              skuDataInfoRef={skuDataInfoRef}
              setLogisticsIdFn={setLogisticsIdFn}
              hasAlreadyDiscountRef={hasAlreadyDiscountRef}
              getDeliveryCostCb={(cost) => {
                deliveryCostRef.current = cost;
              }}
              reReloadTransParam={reReloadTransParam}
            />
          </div>
          <div>
            <div className="font-medium mb-[12px] text-[14px] text-[#333]">
              完善SKU提报信息
            </div>
            <ItemCommonTable field={field} listQueryFn={listQueryFn} schema={schema} />
          </div>
        </Block>
      </NewWorkLayout>
      <div
        className="fixed bg-[#fff] bottom-0 w-[100%] py-[16px] px-[24px] left-0"
        style={{ zIndex: '1' }}
      >
        <div className="text-[#333] text-[14px] flex" onClick={handleSign}>
          <Checkbox checked={isChecked} onChange={onChange} disabled={signDisable} />
          <div className={`ml-[8px] text-[#333333] ${!signDisable ? 'text-[#333]' : 'text-[#999]'}`} >
            我同意加入1688数字供应链托管服务并签署
            <a
              className="text-[#0077FF]"
              href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240412180443509/20240412180443509.html"
              target="_blank"
              rel="noreferrer"
            >
              《1688数字供应链托管技术服务协议》
            </a>
            ，知晓该商品将委托由1688负责商品展示、1688平台站内/外营销场景、销售渠道、物流、售后等。并委托我们向商家提供以商家名义向买家履行商品交付、售后义务的托管服务。
          </div>
        </div>
        <div className="flex justify-center mt-[16px]">
          <Button
            type="primary"
            onClick={onSubmit}
            loading={isloading}
            style={{ borderRadius: '6px', marginRight: '8px' }}
            disabled={!isChecked || !checkList?.some((item) => item.result)}
          >
            提交
          </Button>
          <Button
            type="normal"
            onClick={onJumpTo}
            style={{ borderRadius: '6px', width: '60px' }}
          >
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChoiceSingleProductRecruitment;
