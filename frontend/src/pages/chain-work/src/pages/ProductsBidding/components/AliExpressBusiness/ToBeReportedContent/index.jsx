import React, { useState, useMemo, useEffect } from 'react';
import './index.scss';
import { Button, Pagination, Loading, Message } from '@alifd/next';
import SubmitBusinessDialog from '@/pages/ProductsBidding/components/AliExpressBusiness/SubmitBusinessDialog';
import { CountDown } from '@/pages/ProductsBidding/components/CountDown';
import ProgressiveImage from '@/components/ProgressiveImage';
import { getBusinessList } from '@/pages/ProductsBidding/api';
import FailureDialog from '@/pages/ProductsBidding/components/ToolTipDialog/FailureDialog';
import SuccessDialog from '@/pages/ProductsBidding/components/ToolTipDialog/SuccessDialog';
import { sendLogger, aeJingjiaType } from '@/pages/ProductsBidding/utils';

const now = Date.now();

function ToBeReportedContent({
  loadData,
  handleTanChange,
  biddingActiveKey,
  onSendData,
  configurationData,
  sellerTypeChecked,
  setSellerTypeChecked,
}) {
  const [pageSize, setPageSize] = useState(10); // 默认每页显示10条记录
  const [currentPage, setCurrentPage] = useState(1); // 当前页
  const [total, setTotal] = useState(0); // 总条目数量
  const [biddingList, setBiddingList] = useState([]); // 提报列表数据存储
  const [cardLoading, setCardLoading] = useState(false); // 加载
  const [toolTipState, setToolTipState] = useState({});

  // 查询商机数据
  const getData = () => {
    setCardLoading(true);

    getBusinessList({
      pageNum: currentPage,
      pageSize,
      jingjiaType: aeJingjiaType,
    })
      .then((res) => {
        if (res && res?.data) {
          setBiddingList(res?.data);
          onSendData(res);
          setTotal(Number(res?.total));
        }
      })
      .catch((error) => {
        Message.error(error?.errorMessage || '服务异常');
      })
      .finally(() => {
        setCardLoading(false);
        sendLogger('searchData');
      });
  };

  const onPaginationChange = (_current) => {
    setCurrentPage(_current);
  };

  const onPageSizeChange = (_pageSize) => {
    setPageSize(_pageSize);
  };

  useEffect(() => {
    // 当外层tab为‘tab1’时，查询商机数据
    if (biddingActiveKey === 'tab1' && loadData === 'subtab1') {
      getData();
    }
  }, [biddingActiveKey, loadData, currentPage, pageSize]);

  // 缓存处理后的数据
  const processedDataList = useMemo(() => {
    return biddingList?.map((item) => ({
      ...item,
      endTime: item?.strategy_end_time,
    }));
  }, [biddingList]);

  const updateParentState = (newState) => {
    setToolTipState(newState);
  };

  const handleSuccessRedirect = () => {
    handleTanChange('subtab2');
  };

  const handleRefresh = () => {
    currentPage === 1 ? getData() : setCurrentPage(1);
  };

  const cardList = () =>
    processedDataList?.map((item, index) => {
      const isEnded = item?.endTime < now; // 是否已结束
      const isEmptyField = !item?.item_name; // 失效sku
      const offerUrl = `https://detail.1688.com/offer/${item?.match_item_id}.html`;
      const ButtonDisabled = true;
      let sku_map_json = [];
      try {
        if (item?.sku_json) {
          sku_map_json = JSON.parse(item.sku_json).map((_item) => {
            return {
              ..._item,
              goal_price: (Number(_item.goal_price || 0) / 100).toFixed(2),
            };
          });
        }
      } catch (error) {
        console.log(error);
      }

      return (
        <div className="aeproducts-card-content" key={index}>
          <div>
            <div className="aeproducts-card-top">
              <a href={offerUrl} target="_blank" rel="noreferrer">
                <div className="aeproducts-card-top-left">
                  <ProgressiveImage src={item.sku_img} alt="img_url" className="aeproducts-card-img" />
                </div>
              </a>
              <div className="aeproducts-card-top-right">
                <div className="aeproducts-card-center-title">
                  <div className="aeproducts-card-title" title={item.item_name}>
                    <span className="aeproducts-card-tag">速卖通爆品</span>
                    <span className="aeproducts-card-text">{item.item_name}</span>
                  </div>

                  <div className="aeproducts-card-describe-content">
                    <div>ID：</div>
                    <div>{item?.match_item_id}</div>
                  </div>
                </div>
                {isEmptyField ? (
                  <div style={{ color: '#CCC' }}>距结束 00天 00:00:00</div>
                ) : (
                  <CountDown endTime={item?.endTime / 1000} />
                )}
              </div>
            </div>
            <div className="aeproducts-card-dashed" />
            <div className="aeproducts-card-bottom">
              <div style={{ display: 'flex' }}>
                <div className="aeproducts-card-describe-title">
                  <div className="aeproducts-card-describe-bottom">预计采购量：</div>
                  <div className="aeproducts-business-describe-div">{parseInt(item?.target_product_counts || 0)}</div>
                </div>
                {/* <div className="aeproducts-card-describe-title">
              <div className="aeproducts-card-describe-bottom">竞价不高于：</div>
              <div className="aeproducts-business-describe-div">
                ¥{item?.goal_price ? (item?.goal_price / 100)?.toFixed(2) : ''}
              </div>
            </div> */}
                <div className="aeproducts-card-describe-title">
                  <div className="aeproducts-card-describe-bottom">
                    平台发货
                    <span className="aeproducts-card-line" />
                    平台上门揽
                  </div>
                </div>
              </div>
              <div>
                {isEmptyField ? (
                  <Button type="primary" disabled={ButtonDisabled} className="aeproducts-card-submit">
                    已失效
                  </Button>
                ) : (
                  <SubmitBusinessDialog
                    trigger={
                      <Button type="primary" disabled={isEnded} className="aeproducts-card-submit">
                        去提报
                      </Button>
                    }
                    record={{
                      ...item,
                      oppMsg: JSON.stringify(item),
                      sku_map_json,
                    }}
                    configurationData={configurationData}
                    updateParentState={updateParentState}
                    sellerTypeChecked={sellerTypeChecked}
                    setSellerTypeChecked={setSellerTypeChecked}
                    getData={handleRefresh}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      );
    });

  return (
    <Loading visible={cardLoading} style={{ width: '100%' }}>
      {processedDataList?.length > 0 ? (
        <div className="aeproducts-list-content">
          {cardList()}
          <div className="dataTable-content-page">
            <Pagination
              pageSizeSelector="dropdown"
              current={currentPage}
              total={total || 0}
              onChange={onPaginationChange}
              onPageSizeChange={onPageSizeChange}
              pageSize={pageSize}
            />
          </div>
          <FailureDialog
            visible={toolTipState.failureOpen}
            setVisible={toolTipState.setFailureOpen}
            operationType={'submit'}
            failureReason={toolTipState.failureReason}
            callbackFn={handleRefresh}
          />
          <SuccessDialog
            visible={toolTipState.successOpen}
            setVisible={toolTipState.setSuccessOpen}
            operationType={'submit'}
            onRedirect={handleSuccessRedirect}
            callbackFn={handleRefresh}
          />
        </div>
      ) : (
        <div className="empty-state">
          <div>
            <img
              src="https://img.alicdn.com/imgextra/i3/O1CN01b5Rg6K1nabGTflgZf_!!6000000005106-55-tps-180-162.svg"
              alt="img"
            />
          </div>
          <div className="empty-state-title">速卖通商机未匹配！</div>
        </div>
      )}
    </Loading>
  );
}

export default ToBeReportedContent;
