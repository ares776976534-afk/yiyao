import React, { useEffect, useState, useRef } from 'react';
import CommonTable from '@/components/CommonTable';
import schema from './schema/schema';
import {
  queryCompanySku,
  // queryTransInfo,
  getErrorInfos,
  // supplyProductSignUp,
  // getLogistics,
  // supplyAgreementSign,
  // supplyAgreementCheck,
  queryOppServiceDemand,
} from './api';
import Block from '@/layouts/Block';
import { Button, Balloon, Icon, Field, Checkbox, Message, Dialog, Switch, Radio } from '@alifd/next';
import columnSchema from './schema/colSchema';
import { dealPrice, Logger, scrollTo } from '@/utlis';
import ChangeSkuDialog from './components/ChangeSkuDialog';
import ChangeLogisticsDialog from './components/ChangeLogisticsDialog';
import './index.scss';
import { getTableData, CHANNEL, judgeTableType, getUrlParam, formatNumber, getAllUrlParams } from './utils';
import { useAuth } from 'ice';
import ServicesBox from './components/ServicesBoxNew';
import TransInfoBlock from './components/TransInfoBlock';
import AgreementShow from './components/AgreementShow';
import { dealDiscountAndPriceAnomaly } from './dealPostage';
import { popOfTooCheapJudge } from './dealSubmit';
//
export default ({
  data: componentData = { isInDrawer: false },
  successCallback = () => {},
  signUpFn = false,
  _showServices = true,
  showAgreement = true,
  preSkuParam = null,
}) => {
  const getParam = (p) => {
    if (componentData.isInDrawer) {
      if (!p) return componentData;
      // false 下return ''
      if (componentData[p] === undefined || componentData[p] === null) return '';
      return String(componentData[p]);
    }
    if (!p) {
      return getAllUrlParams();
    } else {
      return getUrlParam(p);
    }
  };
  const defaultInvSku = getParam('invControlSku').length > 0 ? getParam('invControlSku') === 'true' : true;
  const firstGetPreSkuFlag = useRef(true);
  const [showServices, setShowServices] = useState(_showServices);
  const [channelList, setChannelList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [logisticsVisible, setLogisticsVisible] = useState(false);
  const [logisticsId, setLogisticsId] = useState(null);
  const logisticsIdRef = useRef(null);
  const [crtItem, setCrtItem] = useState({});
  const reloadTableRef = useRef(null);
  const tableType = componentData.isInDrawer ? componentData.tableType : judgeTableType();
  const deliveryCostRef = useRef(null);
  const [errorBoxInfos, setErrorBoxInfos] = useState({});
  const [reReloadTransParam, setReReloadTransParam] = useState(null); // 计算邮费
  const field = Field.useField({ parseName: true });
  const [isQuantityDisabled, setIsQuantityDisabled] = useState(defaultInvSku);
  const skuDataInfoRef = useRef(null); // 物流组件返回件重尺
  const tempDataRef = useRef(null);
  const tableDataNumRef = useRef(null);
  const needSellerChainRef = useRef(false);
  const needEntrustOfferRef = useRef(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const querySignAgreementRef = useRef(null);
  const transInfoRef = useRef(null);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState([false, false]);
  const skuDataSourceRef = useRef([]);
  const hasAlreadyDiscountRef = useRef(false); // 是否已经设置过折扣
  const serviceOkRef = useRef(false);
  const [oppServiceDemand, setOppServiceDemand] = useState(null);
  const [auth] = componentData.isInDrawer ? componentData.auth : useAuth();
  const invControlGray = auth?.invControl; // 是否灰度商家
  // console.log('[ invControlGray ] >', invControlGray, tableType);
  const _columnSchema = columnSchema(field, tableType, invControlGray, deliveryCostRef, getParam, isQuantityDisabled);
  const judgePreSku = (params) => {
    // console.log('请求', params, firstGetPreSkuFlag.current)
    if (preSkuParam && firstGetPreSkuFlag.current) {
      const supplySkuList = preSkuParam.map((item, index) => {
        // item为原field的存储信息，包装成接口返回值
        const info = {
          ...item, // 因为之前oppId和supplySkuId等opp相关数据是在baseSkuInfo外面的
          supplySkuId: item.supplySkuId || item.skuId,
          baseSkuInfo: item,
        };
        return {
          ...info,
          recordId: String(index),
        };
      });
      // console.log('[ supplySkuList ] >', supplySkuList);
      setTimeout(() => {
        firstGetPreSkuFlag.current = false;
      }, 3000);
      const res = {
        model: supplySkuList,
        total: supplySkuList.length,
      };
      tableDataNumRef.current = res.total;
      skuDataSourceRef.current = res.model;
      return Promise.resolve(res);
    } else {
      return getData(params);
    }
  };
  const getData = (params) => {
    return new Promise(async (resolve, reject) => {
      if (!deliveryCostRef.current) {
        resolve([]);
        return;
      }
      const _params = {
        ...params,
        oppId: getParam('oppId'), // 商机ID,
        itemId: getParam('itemId'), // 商品ID,
        supplyProductId: getParam('supplyProductId'), // 报名记录ID（只在修改价格的时候传）
        postage: deliveryCostRef.current, // 邮费
        // strategyId: getParam('strategyId'), //  策略id 在分销大客会使用这个字段判断限制价格
        logisticsId: logisticsIdRef.current,
        hasAlreadyDiscount: hasAlreadyDiscountRef.current,
      };
      let res = null;
      if (tempDataRef.current) {
        const model = tempDataRef.current;
        const tableData = getTableData(model);
        const total = tableData.length;
        res = {
          success: true,
          data: { model: tableData, total, ...model },
        };
        tempDataRef.current = null;
        const fieldData = {}
        // table刷新无法带来field的更新 需手动set // 把数据包装成field信息
        tableData.forEach((item, recordId) => {
          fieldData[recordId] = { ...item.baseSkuInfo, ...item.oppInfo }
        });
        field.setValues(fieldData);
      } else {
        res = await queryCompanySku(_params);
      }
      if (res && res.success) {
        // a.商品是否支持商家链needSellerChain b.商品是否已加入商家链托管needEntrustOffer
        needSellerChainRef.current = res.data.needSellerChain;
        needEntrustOfferRef.current = res.data.needEntrustOffer || false;
        // 是否价格异常
        const priceAnomalyFlag = await dealDiscountAndPriceAnomaly(
          res.data,
          getErrorInfos,
          setErrorBoxInfos,
          setReReloadTransParam,
          deliveryCostRef,
          logisticsIdRef,
          getParam,
        );
        if (priceAnomalyFlag) {
          resolve([]);
          return;
        }
        tableDataNumRef.current = res.data.total;
        skuDataSourceRef.current = res.data.model;

        resolve(res.data || []);
      }
    });
  };
  const onActionComplete = ({ type, data }, reloadFn) => {
    switch (type) {
      case 'changeSku':
        // reloadTableRef.current = reloadFn;
        setDialogVisible(true);
        setCrtItem({
          ...data,
          postage: deliveryCostRef.current,
          postageType: errorBoxInfos.postageType,
          hasAlreadyDiscount: hasAlreadyDiscountRef.current,
          skuDataSource: skuDataSourceRef.current,
        });
        break;
      default:
        break;
    }
  };

  const onInvSyncChange = (checked) => {
    setIsQuantityDisabled(checked);
    const fieldData = field.getValues();
    // skuDataSourceRef.current?.forEach((item, index) => {
    //   fieldData[index] = {
    //     quantity: item?.baseSkuInfo?.marketOnSaleQuantity,
    //   };
    // });
    Object.keys(fieldData).forEach((key) => {
      fieldData[key]['invControlSku'] = checked;
      fieldData[key]['quantity'] = fieldData[key]['marketOnSaleQuantity'];
    });
    field.setValues(fieldData);
    field.validate((e, _v) => {
      e && console.log(e);
    });
  };
  const onChangeSwitch = () => {
    const fieldData = JSON.parse(JSON.stringify(field.getValues()));
    Object.keys(fieldData).forEach((key) => {
      if (fieldData[key]['referenceSupplyPrice']) {
        fieldData[key]['supplyPrice'] = fieldData[key]['referenceSupplyPrice'];
      }
    });
    field.setValues(fieldData);
  };

  const setLogisticsIdFn = (_logisticsId) => {
    setLogisticsId(_logisticsId);
    logisticsIdRef.current = _logisticsId;
  };

  const getDemand = async () => {
    const params = {
      oppIds: getParam('oppId'),
      itemId: getParam('itemId'),
      selectBuyerProtect: getParam('selectBuyerProtect'),
    };
    if (getParam('supplyProductId').length > 0) {
      params.supplyProductId = getParam('supplyProductId');
    }
    const res = await queryOppServiceDemand(params);
    setOppServiceDemand(res.model);
  };
  useEffect(() => {
    if (getParam('scene') === 'customize_all' || !showServices) {
      setShowServices(false);
    } else {
      setShowServices(true);
      getDemand();
    }
    Logger.init({ a: '我要供货', b: '提报页' }, { pageKey: 'goodsupply' });
  }, []);

  return (
    <div
      className={
        componentData.isInDrawer
          ? 'bg-[#eef2fa] relative box-border item-post'
          : 'px-[120px] bg-[#eef2fa] relative box-border item-post pt-[24px]'
      }
    >
      <div className={componentData.isInDrawer ? 'bg-[#fff] pb-[30px]' : 'bg-[transparent] pb-[130px]'}>
        {showServices && oppServiceDemand && (
          <ServicesBox
            getParam={getParam}
            oppServiceDemand={oppServiceDemand}
            servicesList={servicesList}
            channelList={channelList}
            setServicesList={setServicesList}
            setChannelList={setChannelList}
            titleClassName="!text-[14px]"
            serviceOkRef={serviceOkRef}
            showBtn={getParam('oppId').length > 0}
          />
        )}
        <Block title={<div className="text-[16px]">物流信息</div>} className="logisticsBlock">
          {/* <div className="text-[14px] text-[#666] pt-[4px]">
            您的商品将投放给B买，B买订单将会由买家承担运费，请您维护用户信息
          </div> */}
          <div className="subTitle">
            为了避免产生物流费用的纠纷，请您仔细维护运费模版信息，若产生不合理物流费用由商家自行承担
          </div>
          <TransInfoBlock
            getParam={getParam}
            logisticsId={logisticsId}
            skuDataInfoRef={skuDataInfoRef}
            setLogisticsIdFn={setLogisticsIdFn}
            reReloadTransParam={reReloadTransParam}
            getDeliveryCostCb={(cost) => {
              deliveryCostRef.current = cost;
              // 有运费就刷新table
              reloadTableRef.current();
            }}
            transInfoRef={transInfoRef}
            hasAlreadyDiscountRef={hasAlreadyDiscountRef}
          />
        </Block>
        <Block
          title={<div className="text-[16px]">供货信息</div>}
          subTitle={
            <div className="flex">
              {invControlGray && ['1', '2']?.includes(tableType) && (
                <div className="text-[14px] mr-[16px] text-nowrap">
                  <span className="mr-[8px]">店铺ERP库存同步</span>
                  <Switch autoWidth checked={isQuantityDisabled} onChange={onInvSyncChange} />
                </div>
              )}
              <div
                className="flex flex-row justify-center items-center p-[10px] gap-[4px] w-[110px] h-[24px] bg-[#FFFFFF] border border-[#0077FF] rounded-[4px] box-border opacity-100 z-1 text-[12px] text-[#0077FF] cursor-pointer"
                onClick={onChangeSwitch}
              >
                一键写入建议价
              </div>
            </div>
          }
          className="supplyBlock"
        >
          <div className="subTitle">
            ·
            价格设置：商家需设置商品供货价（不含运费结算价），平台按运费模板设置的运费计算包邮供货价；例如：商品供货价：¥10.00
            包邮供货价：12.00（¥10.0+运费¥2.0）
            {isBannerVisible && invControlGray && ['1', '2']?.includes(tableType) && (
              <div className="text-[14px]">
                ·
                新上线“店铺ERP库存同步”功能，默认开启可一键共享和展示您的店铺ERP商品库存，无需再手动输入，如需关闭可取消勾选
                {/* <a
                    href=""
                    style={{
                      color: '#0077FF',
                      marginLeft: '4px',
                    }}
                  >
                    查看详情
                  </a> */}
              </div>
            )}
          </div>
          <CommonTable
            showPagination={false}
            schema={{
              ...schema,
              colSchema: _columnSchema,
            }}
            SlotOrShowStatusFilter={false}
            SlotOrShowMsgBar={false}
            pageSize={10}
            // listQueryFn={getData}
            listQueryFn={judgePreSku}
            searchFilterType={'3'}
            blockBorder={false}
            onActionComplete={onActionComplete}
            tableProps={{
              fixedHeader: true,
              stickyHeader: true,
            }}
            reloadTable={(reloadFn) => {
              reloadTableRef.current = reloadFn;
            }}
            tableStyle={{
              '--table-size-s-cell-padding-top': '16px',
              '--table-size-s-cell-padding-bottom': '12px',
            }}
          />
        </Block>
      </div>
      <ChangeSkuDialog
        visible={dialogVisible}
        setVisible={setDialogVisible}
        recordData={crtItem}
        onSuccess={(data) => {
          // console.log('更换匹配关系', data);
          tempDataRef.current = data;
          reloadTableRef.current();
        }}
        getParam={getParam}
        logisticsIdRef={logisticsIdRef}
      />
      <div
        className={
          componentData.isInDrawer
            ? 'flex flex-col bg-[#fff] bottom-0 w-[100%] p-[20px] left-0 border-t-[1px] border-[#eee]'
            : 'fixed flex flex-col bg-[#fff] bottom-0 w-[100%] py-[14px] px-[24px] left-0'
        }
        style={{ zIndex: '1' }}
      >
        {showAgreement && (
          <AgreementShow
            querySignAgreementRef={querySignAgreementRef}
            needSellerChainRef={needSellerChainRef}
            needEntrustOfferRef={needEntrustOfferRef}
            tableDataNumRef={tableDataNumRef}
            checkboxChecked={checkboxChecked}
            setCheckboxChecked={setCheckboxChecked}
            getParam={getParam}
          />
        )}
        <Button
          type="primary"
          onClick={() => {
            popOfTooCheapJudge({
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
              serviceOkRef,
              checkboxChecked,
              componentData,
              successCallback,
              channelList,
            });
          }}
          style={{ minWidth: '84px', margin: '0 auto', marginTop: '12px' }}
          disabled={showAgreement ? checkboxChecked[1] === false : false}
          loading={submitLoading}
        >
          提交
        </Button>
      </div>
    </div>
  );
};
