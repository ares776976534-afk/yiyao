import React from 'react';
import { Balloon, Icon } from '@alifd/next';
import './index.scss';
import { BidStatus, StatusColors, StatusTextMap } from '@/pages/ProductsBidding/enums';
import moment from 'moment';
import Clipboard from '@/components/ClipBoard';
import { sendLogger } from '@/pages/ProductsBidding/utils';

const baseInfoCell = (v, i, record) => {
  const { imgUrl, itemId, itemName, skuName } = record;
  return (
    <div className="baseInfo-cell">
      <div className="bcproducts-card-top">
        <a
          href={`https://detail.1688.com/offer/${itemId}.html`}
          target="_blank"
          rel="noreferrer"
          style={{ cursor: 'pointer' }}
        >
          <div className="bcproducts-card-top-left">
            <img src={imgUrl} alt="" className="bcproducts-card-img" />
          </div>
        </a>
        <div className="bcproducts-card-top-right">
          <div className="bcproducts-card-center-title">
            {itemName &&
              (itemName.length < 24 ? (
                <div className="bcproducts-card-title">
                  <span className="bcproducts-card-tag">大客爆品</span>
                  <span className="bcproducts-card-text">{itemName}</span>
                </div>
              ) : (
                <Balloon.Tooltip
                  trigger={
                    <div className="bcproducts-card-title">
                      <span className="bcproducts-card-tag">大客爆品</span>
                      <span className="bcproducts-card-text"> {`${itemName?.slice(0, 24)}...`}</span>
                    </div>
                  }
                  align="t"
                  popupStyle={{ backgroundColor: '#333' }}
                  popupClassName="bcproducts-business-tooltips"
                >
                  {itemName}
                </Balloon.Tooltip>
              ))}
            <div className="bcproducts-card-describe-content">
              <div className="bcproducts-card-describe-id">ID：</div>
              <div style={{ color: '#999' }}>{itemId}</div>
            </div>
            <div className="bcproducts-card-describe-content">
              <div className="bcproducts-card-describe">sku信息</div>
              <div>{skuName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const demandCell = (v, i, record) => {
  const { oppMsg } = record;
  const oppMsgJsonObject = JSON.parse(oppMsg);
  const hasImage = !!oppMsgJsonObject?.img_url; // 是否有图片
  return (
    <div className="demand-cell">
      <div className="bcproducts-card-top">
        {hasImage && (
          <div className="bcproducts-card-top-left">
            <img src={oppMsgJsonObject?.img_url} alt="" className="bcproducts-card-img" />
          </div>
        )}
        <div className="bcproducts-card-top-right">
          <div className="bcproducts-card-describe-title">
            <div className="bcproducts-card-describe-bottom">预计采购量：</div>
            {oppMsgJsonObject?.target_product_counts}
          </div>
          <div className="bcproducts-card-describe-title">
            <div className="bcproducts-card-describe-bottom">竞价不高于：</div>¥
            {(oppMsgJsonObject?.goal_price / 100)?.toFixed(2)}
          </div>
          {/* <div className="bcproducts-card-describe-title">
            <div className="bcproducts-card-describe-bottom">发货方式：</div>
            平台上门揽
          </div> */}
          <div className="bcproducts-card-describe-title">
            <div className="bcproducts-card-describe-bottom">履约方式：</div>
            平台发货
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
          <div className="information-cell-id">
            <span style={{ marginRight: 6 }}>提报ID</span>
            <span style={{ color: '#333' }}>{id}</span>
          </div>
          <Clipboard text={id}>
            <Icon type=" " />
          </Clipboard>
        </div>
        <div>
          <span style={{ marginRight: 6 }}>提报时间</span>
          <span style={{ color: '#333' }}> {dateTimeStr}</span>
        </div>
      </div>
    </>
  );
};

const submitResultCell = (v, i, record) => {
  const { status } = record;
  const statusValue = Object.keys(BidStatus)?.find((key) => BidStatus[key] === status);
  const statusText = StatusTextMap[statusValue];
  const dotColorClass = StatusColors[BidStatus[statusValue]];
  return (
    <div className="submit-result-cell">
      <span className={`result-cell ${dotColorClass}`} />
      {statusText}
    </div>
  );
};

const handleJump = () => {
  window.open('https://work.1688.com/?_path_=gonghuotuoguan/cross_boarder_2/bh_management');
};

export const columnConfigs = (showModal) => {
  return [
    {
      title: '提报商品',
      align: 'left',
      cell: baseInfoCell,
      dataIndex: 'id',
    },
    {
      title: '商机需求',
      align: 'left',
      dataIndex: 'id',
      cell: demandCell,
    },
    {
      title: '提报价格',
      align: 'right',
      cell: priceCell,
      dataIndex: 'reportsPrices',
    },
    {
      title: '提报库存',
      align: 'right',
      dataIndex: 'stock',
      cell: (v, i, record) => {
        // return <div>{record.stock === -1 ? '不限库存' : record.stock}</div>;
        return <div>不限库存</div>;
      },
    },
    {
      title: '提报信息',
      align: 'left',
      cell: informationCell,
      dataIndex: 'submitInformation',
    },
    {
      title: '提报结果',
      align: 'left',
      cell: submitResultCell,
      dataIndex: 'submitResult',
    },
    {
      title: '操作',
      align: 'center',
      cell: (v, i, record) => {
        const { status } = record;
        const modifyReportingButton = (
          <div
            className="action-cell"
            key="modifyReporting"
            onClick={() => {
              sendLogger('modifyReporting');
              showModal(record);
            }}
          >
            修改提报
          </div>
        );
        const replenishButton =
          status === 'active' ? (
            <div className="action-replenish-button" key="replenish" onClick={handleJump}>
              去补货
            </div>
          ) : null;

        return (
          <>
            {/* {replenishButton} */}
            {modifyReportingButton}
          </>
        );
      },
    },
  ];
};
