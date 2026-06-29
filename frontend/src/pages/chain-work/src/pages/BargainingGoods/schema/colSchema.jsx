import React from 'react';
import { Balloon, Button } from '@alifd/next';
import { Logger } from '@/utlis';

const styleCom = 'text-[#333] text-[14px] h-[49px] p-[16px]';
// 商品信息
const PRODUCT_INFO = {
  title: '商品信息',
  dataIndex: 'itemId',
  width: 220,
  cell: (value, index, record) => {
    const { itemId, title, imageUrl } = record;
    const hasImage = !!imageUrl; // 是否有图片
    return (
      <div
        className="flex p-[16px]"
        data-report-primary-key={itemId}
        data-report-attribute-exp={'1议价列表曝光@funnel_SKU数量'}
      >
        {hasImage && (
          <a
            href={`https://detail.1688.com/offer/${itemId}.html`}
            target="_blank"
            rel="noreferrer"
            style={{ cursor: 'pointer' }}
          >
            <div className="rounded-[6px] w-[60px] h-[60px] mr-[8px]">
              <img className="rounded-[6px]" src={imageUrl} alt="img" />
            </div>
          </a>
        )}
        <div className="flex justify-between w-full">
          <div className="flex flex-col justify-between">
            {title?.length < 8 ? (
              <span className="text-[14px] text-[#333] text-ellipsis line-clamp-3"> {title}</span>
            ) : (
              <Balloon.Tooltip
                trigger={<div className="text-[14px] text-[#333] text-ellipsis line-clamp-3">{title}</div>}
                align="t"
                popupStyle={{ backgroundColor: '#333' }}
                popupClassName="products-business-tooltips"
              >
                <span className="">{title}</span>
              </Balloon.Tooltip>
            )}
            <div className="text-[#999] text-[13px] mt-[4px]">ID：{itemId}</div>
          </div>
        </div>
      </div>
    );
  },
};
// SKU信息
const SKU_INFO = {
  title: 'SKU信息',
  dataIndex: 'skuName',
  width: 152,
  cell: (value, index, record) => {
    const { choiceOppSkuResults = [] } = record;
    return choiceOppSkuResults?.map(({ skuId, skuName }, i) => (
      <div
        className={styleCom}
        style={{ borderBottom: choiceOppSkuResults?.length - 1 === i ? 'none' : '1px solid #E5E5E5' }}
        key={skuId}
      >
        {skuName?.length < 15 ? (
          <span className="text-[14px] text-[#333] text-ellipsis line-clamp-1"> {skuName}</span>
        ) : (
          <Balloon.Tooltip
            trigger={<div className="text-[14px] text-[#333] text-ellipsis line-clamp-1">{skuName}</div>}
            align="t"
            popupStyle={{ backgroundColor: '#333' }}
            popupClassName="products-business-tooltips"
          >
            {skuName}
          </Balloon.Tooltip>
        )}
      </div>
    ));
  },
};

// 当前供货价（元）
const CURRENT_SUPPLY_PRICE = {
  title: '当前供货价（元）',
  dataIndex: 'currentSupplyPrice',
  width: 140,
  cell: (value, index, record) => {
    const { choiceOppSkuResults = [] } = record;
    return choiceOppSkuResults?.map(({ skuId, currentSupplyPrice = 0, currentSupplyDiscount = 0 }, i) => (
      <div
        className={styleCom}
        style={{ borderBottom: choiceOppSkuResults?.length - 1 === i ? 'none' : '1px solid #E5E5E5' }}
        key={skuId}
      >
        {currentSupplyPrice}（{currentSupplyDiscount}折）
      </div>
    ));
  },
};

// 期望供货价（元）
const EXPECTED_SUPPLY_PRICE = {
  title: '期望供货价（元）',
  dataIndex: 'expectSupplyPrice',
  width: 140,
  cell: (value, index, record) => {
    const { choiceOppSkuResults = [] } = record;
    return choiceOppSkuResults?.map(({ skuId, expectSupplyPrice = 0, expectSupplyDiscount = 0 }, i) => (
      <div
        className={styleCom}
        style={{ borderBottom: choiceOppSkuResults?.length - 1 === i ? 'none' : '1px solid #E5E5E5' }}
        key={skuId}
      >
        {expectSupplyPrice}（{expectSupplyDiscount}折）
      </div>
    ));
  },
};

// 截止时间
const DEADLINE = {
  title: '截止时间',
  dataIndex: 'endTime',
  width: 180,
  cell: (value, index, record) => {
    const { choiceOppSkuResults = [] } = record;
    return choiceOppSkuResults?.map(({ skuId, endTime = '-' }, i) => (
      <div
        className={styleCom}
        style={{ borderBottom: choiceOppSkuResults?.length - 1 === i ? 'none' : '1px solid #E5E5E5' }}
        key={skuId}
      >
        {endTime}
      </div>
    ));
  },
};

// 物流模版
const LOGISTICS_TEMPLATE = {
  title: '物流模版',
  dataIndex: 'logisticsTemplate',
  width: 114,
  cell: (value, index, record) => (
    <div className="p-[16px]">
      <Button type="primary" text>XXXXXX模版</Button>
    </div>
  ),
};

// 操作
const OPERATION = {
  title: '操作',
  dataIndex: 'operation',
  width: 100,
  cell: (value, index, record, { onActionClick = () => { } } = {}) => {
    const { itemId = '', productId = '', supplyChannelList = [] } = record;
    const isDOM = supplyChannelList?.includes('DOM');
    const submitReport = () => {
      if (isDOM) {
        window.open(`https://work.1688.com/?_hex_supplyProductId=${productId}&_path_=gonghuotuoguan/tuoguan/gonghuoguanli`);
      } else {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('itemId', itemId);
        const { origin, search } = currentUrl;
        window.location.href = `${origin}/app/channel-fe/chain-work/managesupplygoods.html${search}`;
      }
    };
    return (
      <div className="p-[16px] inline-table">
        <div>
          <Button
            type="primary"
            style={{ fontSize: '12px', height: '24px', marginBottom: 12 }}
            onClick={() => {
              Logger.report({ d: 'CLK', e: '2议价列表点击按钮@funnel_接受期望价' });
              onActionClick({ type: 'bargining', record });
            }}
          >
            接受期望价
          </Button>
        </div>
        <div>
          <Button type="primary" text onClick={submitReport}>管理托管产品</Button>
        </div>
      </div>
    );
  },
};

export default () => {
  return [PRODUCT_INFO, SKU_INFO, CURRENT_SUPPLY_PRICE, EXPECTED_SUPPLY_PRICE, DEADLINE, OPERATION];
};
