import React, { useEffect, useState, useRef } from 'react';
import AgreementBlock from '@/components/AgreementBlock';
import { Button, Balloon, Icon, Field, Checkbox, Message, Dialog, Switch, Radio } from '@alifd/next';
import { supplyAgreementSign, supplyAgreementCheck } from '../api';
import { dialogStyle } from '@/styles/dialogStyle';

function AgreementShow({
  checkboxChecked,
  setCheckboxChecked,
  needEntrustOfferRef,
  tableDataNumRef,
  querySignAgreementRef,
  needSellerChainRef,
  getParam,
}) {
  const getMap = (data) => {
    // 把tagId作为signApi的入参
    return {
      0: {
        // 获得更多曝光！加入托管同时授权平台获得”报名商品“的运营权，运营更省心，订单更确定！
        // a.商品是否支持商家链needSellerChain b.商品是否已加入商家链托管needEntrustOfferRef
        tagId: '5167809',
        queryApi: () => Promise.resolve({ success: true, model: data ? 'true' : 'false' }), // 是否已经签署
        signApi: () => Promise.resolve({ success: true, model: true }),
        ifDefaultChecked: true, // 如果查询没签署过，是否要默认钩上
        render: () => (
          <div style={{ color: '#333', fontSize: '13px' }}>
            获得更多曝光！加入托管同时授权平台获得”报名商品“的运营权，运营更省心，订单更确定！
            <Button text type="primary" style={{ color: '#0077FF' }} onClick={() => popShow(1)}>
              查看托管细节
            </Button>
          </div>
        ),
      },
      1: {
        // 我同意加入1688数字供应链托管服务并签署
        tagId: '584387',
        queryApi: supplyAgreementCheck,
        // queryApi: () => Promise.resolve({ success: true, model: true }),
        signApi: supplyAgreementSign,
        ifDefaultChecked: false, // 如果查询没签署过，是否要默认钩上
        render: () => (
          <div style={{ color: '#333', fontSize: '13px' }}>
            我同意加入1688数字供应链托管服务并签署
            <a
              href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240412180443509/20240412180443509.html"
              rel="noreferrer"
              target="_blank"
              style={{ color: '#0077FF' }}
            >
              《1688数字供应链托管技术服务协议》
            </a>
            、
            <a
              href="https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000051"
              rel="noreferrer"
              target="_blank"
              style={{ color: '#0077FF' }}
            >
              《支付宝付款授权服务协议》
            </a>
            ，知晓该商品将委托由1688负责商品展示、1688平台站内/外营销场景、销售渠道、物流、售后等。并委托我们向商家提供以商家名义向买家履行商品交付、售后义务的托管服务。
          </div>
        ),
      },
      2: {
        // 我同意加入1688数字供应链托管服务并签署
        tagId: '5233473',
        queryApi: supplyAgreementCheck,
        // queryApi: () => Promise.resolve({ success: true, model: true }),
        signApi: supplyAgreementSign,
        ifDefaultChecked: false, // 如果查询没签署过，是否要默认钩上
        render: () => (
          <div style={{ color: '#333', fontSize: '13px' }}>
            我同意加入1688哇噢半托管服务并签署
            <a
              href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240507150102313/20240507150102313.html?spm=a26352.29338965.0.0.77281e62rl0fjh"
              rel="noreferrer"
              target="_blank"
              style={{ color: '#0077FF' }}
            >
              《1688哇噢半托管技术服务协议》
            </a>
            、
            <a
              href="https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000051"
              rel="noreferrer"
              target="_blank"
              style={{ color: '#0077FF' }}
            >
              《支付宝付款授权服务协议》
            </a>
            ，知晓该商品将委托由1688负责商品展示、1688平台站内/外营销场景、销售渠道、物流、售后等。并委托我们向商家提供以商家名义向买家履行商品交付、售后义务的托管服务。
          </div>
        ),
      },
    };
  };
  const _getMap = (data) => {
    let indexAry = [];
    if (getParam('scene') === 'customize_all') {
      indexAry = [0, 2];
    } else {
      indexAry = [0, 1];
    }
    const _map = {};
    const mapData = getMap(data);
    indexAry.forEach((item, i) => {
      _map[i] = mapData[item];
    });
    return _map;
  };
  const realMap = _getMap(needEntrustOfferRef.current);
  const mapRef = useRef(realMap);
  const getQueryRef = useRef(null);
  useEffect(() => {
    const sellerTypeMap = realMap;
    mapRef.current = sellerTypeMap;
    getQueryRef.current && getQueryRef.current(0);
  }, [needEntrustOfferRef.current]);

  const popShow = (id) => {
    switch (id) {
      case 1: {
        const dialog = Dialog.show({
          v2: true,
          title: '爆款竞价提交',
          footerAlign: 'center',
          content: (
            <div>
              <div className="font-bold">报名基本信息确认：</div>
              本次报名共计提报{tableDataNumRef.current}
              个规格，提报后可在商品管理中查看是否被托管成功，托管成功后影响如下。
              <div className="font-bold">托管商品影响知悉：</div>
              <div>
                1、托管平台将拥有”报名商品”的运营权，包括但不限于营销报名活动、价格、发货地、收货地、运费模版、件重尺、SKU等信息。
              </div>
              <div>2、售前售后的客服承接仍由商家承担。</div>
              <div>
                3、“报名商品”报名前已设置的营销活动，托管平台有权进行修改；“报名商品”报名后商家自行设置的营销活动，费用由商家承担。
              </div>
              <div>
                4、“报名商品”退出托管后不会还原到托管前的价格、发货地、收货地、运费模版、件重尺、SKU等，商家可退出后自行修改。
              </div>
            </div>
          ),
          footer: (
            <div className="error-modal-footer">
              <Button
                type="primary"
                onClick={() => {
                  dialog.hide();
                }}
              >
                确定
              </Button>
            </div>
          ),
          style: {
            ...dialogStyle,
            width: '500px',
          },
        });
        break;
      }
      default:
        break;
    }
  };

  return (
    <AgreementBlock
      getQueryRef={getQueryRef}
      querySignAgreementRef={querySignAgreementRef}
      sellerTypeMapRef={mapRef}
      show={{ 0: needSellerChainRef, 1: { current: true } }}
      popShow={popShow}
      checkboxChecked={checkboxChecked}
      setCheckboxChecked={setCheckboxChecked}
    />
  );
}
export default AgreementShow;
