import React, { useState, useMemo, useEffect } from 'react';
import './index.scss';
import { Button, Pagination, Balloon, Loading, Message } from '@alifd/next';
import { CountDown } from './components/CountDown';
import { formatDate, splitNum, openLinkAndDownload, systemTime } from '@/utlis';
import moment from 'moment';

// import { data } from './mock'
const now = Date.now();

export default ({
  status,
  onClickCard,
  getBusinessList,
  DesSlot,
  labelMap = { itemId: 'itemId', itemName: 'itemName', img_url: 'img_url', itemStatus: 'status', endTime: 'endTime' },
  expLogger = '',
}) => {
  const [pageSize, setPageSize] = useState(10); // 默认每页显示10条记录
  const [currentPage, setCurrentPage] = useState(1); // 当前页
  const [total, setTotal] = useState(0); // 总条目数量
  const [biddingList, setBiddingList] = useState([]); // 提报列表数据存储
  // const [biddingEditData, setBiddingEditData] = useState([]); // 提报弹窗数据
  const [cardLoading, setCardLoading] = useState(false); // 加载
  const [isEnded, setIsEnded] = useState([]);

  const { keyId, itemId, itemName, img_url, itemStatus, endTime } = labelMap;

  // 查询商机数据
  const getData = async () => {
    setCardLoading(true);
    try {
      const res = await getBusinessList({
        pageNum: currentPage,
        pageSize,
      });
      if (res && res?.data) {
        const isEndArray = [];
        res.data.forEach((item) => {
          isEndArray.push(item?.[endTime] < now);
        });
        setIsEnded(isEndArray);
        setBiddingList(res?.data);
        setTotal(Number(res?.total));
      }
      setCardLoading(false);
    } catch (error) {
      Message.error(error?.errorMessage);
      setCardLoading(false);
    }
  };

  const onPaginationChange = (_current) => {
    setCurrentPage(_current);
  };

  const onPageSizeChange = (_pageSize) => {
    setPageSize(_pageSize);
  };

  useEffect(() => {
    getData();
  }, [currentPage, pageSize]);

  const cardList = () =>
    biddingList?.map((item, index) => {
      const hasImage = !!item?.[img_url]; // 是否有图片
      const isEmptyField = item?.[itemStatus]?.toString() === '0'; // 失效sku
      const ButtonDisabled = true;

      return (
        <div
          className="products-card-content"
          key={item?.[keyId]}
          data-report-primary-key={item?.[itemId]}
          data-report-attribute-exp={expLogger}
        >
          <div className="products-card-top">
            {hasImage && (
              <a
                href={`https://detail.1688.com/offer/${item?.[itemId]}.html`}
                target="_blank"
                rel="noreferrer"
                style={{ cursor: 'pointer' }}
              >
                <div className="products-card-top-left">
                  <img src={item?.[img_url]} alt="img_url" className="products-card-img" />
                </div>
              </a>
            )}
            <div className="products-card-top-right">
              <div className="products-card-center-title">
                <div style={{ display: 'flex' }}>
                  {item?.[itemName]?.length < 32 ? (
                    <div className="products-card-title">
                      <span className="products-card-text"> {item?.[itemName]}</span>
                    </div>
                  ) : (
                    <Balloon.Tooltip
                      trigger={
                        <div className="products-card-title">
                          <span className="products-card-text"> {`${item?.[itemName]?.slice(0, 32)}...`}</span>
                        </div>
                      }
                      align="t"
                      popupStyle={{ backgroundColor: '#333' }}
                      popupClassName="products-business-tooltips"
                    >
                      {item?.[itemName]}
                    </Balloon.Tooltip>
                  )}
                </div>

                <div className="products-card-describe-content" style={{ marginBottom: '16px' }}>
                  <div className="products-card-describe-id">ID：</div>
                  <div style={{ color: '#999' }}>{item?.[itemId]}</div>
                </div>
                <div className="products-card-describe-content">
                  {/* <div className="products-card-describe" style={{color: '#333'}}>结算价:</div>
                    <div style={{color: '#FF7300'}}>{item?.quotePrice} × 成本价</div> */}
                  <DesSlot item={item} />
                </div>
              </div>
              <div className="flex flex-col justify-between h-full items-end">
                <CountDown
                  endTime={item?.[endTime] / 1000}
                  countDownEnd={() => {
                    setIsEnded((isEndArray) => {
                      isEndArray[index] = true;
                      return Object.assign([], isEndArray);
                    });
                  }}
                />
                <Button
                  type="primary"
                  disabled={isEnded[index]}
                  onClick={() => {
                    // setBiddingEditData(item);
                    onClickCard(item);
                  }}
                  className="products-card-submit"
                >
                  去提报
                </Button>
              </div>
            </div>
          </div>
          {/* <div className="products-card-dashed" /> */}
          {/* <div className="products-card-bottom">
              <div style={{ display: 'flex' }}>
                <div className="products-card-describe-title">
                  <div className="products-card-describe-bottom">预计采购量：</div>
                  <div className="products-business-describe-div">{item?.target_product_counts}</div>
                </div>
                <div className="products-card-describe-title">
                  <div className="products-card-describe-bottom">竞价不高于：</div>
                  <div className="products-business-describe-div">
                    ¥{item?.goal_price ? (item?.goal_price / 100).toFixed(2) : ''}
                  </div>
                </div>
                <div className="products-card-describe-title">
                  <div className="products-card-describe-bottom">
                    平台发货
                    <span className="products-card-line" />
                    平台上门揽
                  </div>
                </div>
              </div>
              <div>
              </div>
            </div> */}
        </div>
      );
    });
  return (
    <Loading tip="加载中..." visible={cardLoading} style={{ width: '100%', height: '100%' }}>
      {biddingList && biddingList.length > 0 ? (
        <>
          <div className="products-list-content">{cardList()}</div>
          <Pagination
            pageSizeSelector="dropdown"
            current={currentPage}
            total={total || 0}
            onChange={onPaginationChange}
            onPageSizeChange={onPageSizeChange}
            pageSize={pageSize}
          />
        </>
      ) : (
        <div className="empty-state">
          <div>
            <img
              src="https://img.alicdn.com/imgextra/i3/O1CN01b5Rg6K1nabGTflgZf_!!6000000005106-55-tps-180-162.svg"
              alt="img"
            />
          </div>
          <div className="empty-state-title">暂无托管商机！</div>
        </div>
      )}
    </Loading>
  );
};
