import React, { useState, useRef, useEffect } from 'react';
import { Button, Field } from '@alifd/next';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import Block from '@/layouts/Block';
import { HeaderInfoCard, ItemCommonTable } from './components';
import schema from './components/itemSchema';
import { manageSupplyProduct, updateSupplyProduct } from './services';
import Message from '@/components/UI/Message';
// import LogisticsInfor from './components/LogisticsInfor';
import './index.scss';
import TransInfoBlock from './components/TransInfoBlock';
import { getAllUrlParams, getUrlParam } from './utlis.js';
import { getLogistics } from '@/pages/ChoiceSingleProductRecruitment/services';
import { queryItemPws } from '@/pages/Select/services';
import PieceWeightDialog from '@/pages/Select/components/PieceWeightDialog';

function ManageSupplyGoods({
  data: componentData = { isInDrawer: false },
}) {
  const field = Field.useField({ parseName: true });
  const [skuList, setSkuList] = useState([]);
  const [data, setData] = useState({});
  const [logisticsId, setLogisticsId] = useState('');
  const skuDataInfoRef = useRef(null);
  const logisticsIdRef = useRef(null);
  const transInfoRef = useRef(null);
  const hasAlreadyDiscountRef = useRef(false);
  const deliveryCostRef = useRef(0);
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
  const listQueryFn = (values) => {
    return new Promise((resolve) => {
      manageSupplyProduct({
        request: {
          itemId: getParam('itemId'),
        },
      }).then((res) => {
        const { msg = '数据异常', model, success } = res;
        if (success) {
          setData(model);
          setSkuList(model?.skuList);
          resolve({ model: model?.skuList, total: 10 });
        } else {
          Message._show({ content: msg, type: 'error' });
        }
      }).catch((err) => {
        Message._show({ content: err.errorMessage || '数据异常', type: 'error' });
      });
    });
  };
  const onJumpTo = () => {
    const currentUrl = new URL(window.location.href);
    const { origin } = currentUrl;
    window.location.href = `${origin}/app/channel-fe/chain-work/select.html`;
  };
  const updatedSkuList = (list, obj) =>
    list?.map((sku) => ({
      skuId: sku?.skuId,
      ...(obj[sku?.skuId] && {
        moq: obj[sku?.skuId]?.moq,
        pcs: obj[sku?.skuId]?.pcs,
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
        acc.push({});
      }
      return acc;
    }, []);
    return c;
  };
  const getUpdateSupplyProduct = (list) => {
    setIsloading(true);
    updateSupplyProduct({
      request: {
        itemId: data?.itemId,
        logisticsId,
        postage: deliveryCostRef?.current,
        skuList: mergeSkuList(updatedSkuList(skuList, field.getValues()).filter(Boolean), list).map((ele) => ({
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
    }).then((res) => {
      const { msg = '数据异常', model, success } = res;
      if (success && model) {
        setIsloading(false);
        onJumpTo();
      } else {
        setIsloading(false);
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      setIsloading(false);
      Message._show({ content: err.errorMessage || '数据异常', type: 'error' });
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
          getUpdateSupplyProduct(getLogisticsData.model.specificationDTOList);
        }
      } else {
        getUpdateSupplyProduct(skuDataInfoRef.current);
      }
    });
  };
  const getQueryItemPws = () => {
    queryItemPws({
      itemId: getParam('itemId'),
    }).then((res) => {
      const { success = false, msg = '系统错误，请稍后再试', model = {} } = res?.content || {};
      if (success) {
        setModelData(model);
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((error) => {
      Message._show({ content: error?.errMsg || '系统错误，请稍后再试', type: 'error' });
    });
  };
  useEffect(() => {
    getQueryItemPws();
  }, []);
  return (
    <div>
      <NewWorkLayout title="管理托管产品" style={{ marginBottom: '64px' }}>
        <div className="text-[#999] text-[14px] mb-[20px]">托管产品是您向1688托管售卖的产品信息，包括物流信息、提报价格、可售库存等，不受到您店铺中同款商品的变化影响，在托管期间请重点关注您托管产品的价格和库存，保证价格有竞争力且有库存可卖。</div>
        {modelData?.isAlert && (
          <div className="py-[9px] px-[12px] bg-[#FFF2ED] text-[14px] flex items-center rounded-[6px] mb-[20px]">
            <img src="https://img.alicdn.com/imgextra/i1/O1CN01zrTaVz1T5BrNgir2y_!!6000000002330-2-tps-16-16.png" alt="" srcSet="" />
            <div className="text-[#666] ml-[8px]">件重尺数据不准确，请查看建议值并修改</div>
            <div
              className="text-[#0077FF] cursor-pointer ml-[8px]"
              onClick={() => PieceWeightDialog.open({
                records: modelData,
                onActionOk: () => {
                  getQueryItemPws();
                  setReReloadTransParam('1');
                },
              })}
            >
              查看建议并修改
            </div>
          </div>
        )}
        <Block
          title="商品信息"
        >
          <HeaderInfoCard {...data} />
        </Block>
        <Block className="supply-goods-block">
          <Block
            title="物流信息"
            className="logistics-infor"
          >
            <div className="mt-[12px] mb-[12px]">
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
          </Block>
          <Block
            title="编辑托管产品"
            className="edit-supply-goods"
          >
            <ItemCommonTable field={field} listQueryFn={listQueryFn} schema={schema} />
          </Block>
        </Block>
      </NewWorkLayout>
      <div
        className="fixed bg-[#fff] bottom-0 w-[100%] py-[16px] px-[24px] left-0 flex justify-center"
        style={{ zIndex: '1' }}
      >
        <Button
          type="primary"
          onClick={onSubmit}
          loading={isloading}
          style={{ borderRadius: '6px', width: '60px', marginRight: '8px' }}
        >
          保存
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
  );
}

export default ManageSupplyGoods;
