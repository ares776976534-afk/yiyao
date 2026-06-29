import React from 'react';
import { Balloon, Icon } from '@alifd/next';
import './index.scss';
import moment from 'moment';
import ProgressiveImage from '@/components/ProgressiveImage';
import { sendLogger, defaultImg } from '@/pages/ProductsBidding/utils';

const baseInfoCell = (v, i, record) => {
  const { skuOpp = {} } = record;

  const { img_url, opp_title, property, target_product_counts, goal_price } = skuOpp;
  return (
    <div className="baseInfo-cell">
      <div className="aeproducts-card-top">
        <div className="aeproducts-card-top-left">
          <ProgressiveImage src={img_url || defaultImg} className="aeproducts-card-img" />
        </div>
        <div className="aeproducts-card-top-right">
          <div className="aeproducts-card-center-title">
            <div className="aeproducts-card-title" title={opp_title}>
              <span className="aeproducts-card-text">{opp_title}</span>
            </div>
            <div className="aeproducts-card-describe-content sku-info">
              <div>
                <span>预计采购量：</span>
                <span>{target_product_counts}</span>
              </div>
              <div>
                <span>竞价不高于：</span>
                <span>&yen;{goal_price}</span>
              </div>
            </div>
            <div className="aeproducts-card-describe-content">
              <div>
                <span>sku信息：</span>
                <span>{property || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const demandCell = (v, i, record) => {
  const { itemName, skuOpp } = record;

  const { sku_img, sku_name } = skuOpp;

  return (
    <div className="demand-cell">
      <div className="aeproducts-card-top">
        <div className="aeproducts-card-top-left">
          <ProgressiveImage src={sku_img} className="aeproducts-card-img" />
        </div>
        <div className="aeproducts-card-top-right">
          <div className="aeproducts-card-title" title={itemName}>
            <span className="aeproducts-card-text">{itemName}</span>
          </div>
          <div className="aeproducts-card-describe-title">
            <div className="aeproducts-card-describe-bottom">sku信息：</div>
            {sku_name}
          </div>
        </div>
      </div>
    </div>
  );
};

const priceCell = (v, i, record) => {
  const { price } = record;
  const hasPrice = price && price !== 0; // 是否有价格
  const priceInYuan = price / 100;
  return <div>{hasPrice && <div>¥{priceInYuan?.toFixed(2)}</div>}</div>;
};

const informationCell = (v, i, record) => {
  const { id, gmtCreate } = record;
  const dateTimeStr = moment(gmtCreate).format('YYYY/MM/DD HH:mm');
  return (
    <>
      <div className="information-cell">
        <div className="information-cell-content">
          <div className="information-cell-item">
            <span>提报ID</span>
            <span>{id}</span>
          </div>
          <div className="information-cell-item">
            <span>提报时间</span>
            <span>{dateTimeStr}</span>
          </div>
        </div>
      </div>
    </>
  );
};

const handleJump = () => {
  window.open('https://work.1688.com/?_path_=gonghuotuoguan/cross_boarder_2/bh_management');
};

export default [
  {
    title: '商机需求',
    width: 400,
    cell: baseInfoCell,
  },
  {
    title: '提报SKU',
    width: 400,
    cell: demandCell,
  },
  {
    title: '提报价格',
    width: 110,
    align: 'center',
    cell: priceCell,
    dataIndex: 'reportsPrices',
  },
  {
    title: '提报库存',
    width: 120,
    align: 'center',
    dataIndex: 'stock',
    cell: (v, i, record) => {
      return <div>{String(record.stock) === '-1' ? '不限库存' : record.stock}</div>;
    },
  },
  {
    title: '提报结果',
    align: 'center',
    width: 100,
  },
  {
    title: '操作',
    align: 'center',
    width: 100,
  },
];
