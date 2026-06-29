import React, { useState, useMemo, useEffect } from 'react';
import './index.scss';
import { Button, Pagination, Balloon, Loading, Message } from '@alifd/next';
import SubmitBusinessDialog from '@/pages/ProductsBidding/components/BigCustomerBusiness/SubmitBusinessDialog';
import { CountDown } from '@/pages/ProductsBidding/components/CountDown';
import { getBusinessList } from '@/pages/ProductsBidding/api';
import FailureDialog from '@/pages/ProductsBidding/components/ToolTipDialog/FailureDialog';
import SuccessDialog from '@/pages/ProductsBidding/components/ToolTipDialog/SuccessDialog';
import { sendLogger } from '@/pages/ProductsBidding/utils';

const now = Date.now();

function ToBeReportedContent({ loadData, handleTanChange, biddingActiveKey, onSendData }) {
  const [submitDialogVisible, setSubmitDialogVisible] = useState(false); // 弹窗显隐
  const [pageSize, setPageSize] = useState(10); // 默认每页显示10条记录
  const [currentPage, setCurrentPage] = useState(1); // 当前页
  const [total, setTotal] = useState(0); // 总条目数量
  const [biddingList, setBiddingList] = useState([]); // 提报列表数据存储
  const [biddingEditData, setBiddingEditData] = useState([]); // 提报弹窗数据
  const [cardLoading, setCardLoading] = useState(false); // 加载
  const [toolTipState, setToolTipState] = useState({});

  // 查询商机数据
  const getData = async () => {
    setCardLoading(true);
    try {
      const res = await getBusinessList({
        pageNum: currentPage,
        pageSize,
        jingjiaType: '跨境工作台-大客',
      });
      if (res && res?.data) {
        setBiddingList(res?.data);
        onSendData(res);
        setTotal(Number(res?.total));
      }
      setCardLoading(false);
    } catch (error) {
      Message.error(error?.errorMessage);
    }
    sendLogger('searchData');
  };

  const onPaginationChange = (_current) => {
    setCurrentPage(_current);
  };

  const onPageSizeChange = (_pageSize) => {
    setPageSize(_pageSize);
  };
  useEffect(() => {
    if (biddingActiveKey === 'tab2' && loadData === 'subtab3') {
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
    handleTanChange('subtab4');
  };

  const cardList = () =>
    processedDataList?.map((item) => {
      const isEnded = item?.endTime < now; // 是否已结束
      const hasImage = !!item?.sku_img; // 是否有图片
      const isEmptyField = !item?.item_name || !item?.sku_name || !item?.goal_price; // 失效sku
      const ButtonDisabled = true;

      return (
        <div className="bcproducts-card-content" key={item?.key_id}>
          <div style={{ margin: 12 }}>
            <div className="bcproducts-card-top">
              {hasImage && (
                <a
                  href={`https://detail.1688.com/offer/${item?.item_id}.html`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="bcproducts-card-top-left">
                    <img src={item?.sku_img} alt="img_url" className="bcproducts-card-img" />
                  </div>
                </a>
              )}
              <div className="bcproducts-card-top-right">
                <div className="bcproducts-card-center-title">
                  <div style={{ display: 'flex' }}>
                    {item?.item_name?.length < 32 ? (
                      <div className="bcproducts-card-title">
                        <span className="bcproducts-card-tag">大客爆品</span>
                        <span className="bcproducts-card-text"> {item?.item_name}</span>
                      </div>
                    ) : (
                      <Balloon.Tooltip
                        trigger={
                          <div className="bcproducts-card-title">
                            <span className="bcproducts-card-tag">大客爆品</span>
                            <span className="bcproducts-card-text"> {`${item?.item_name?.slice(0, 32)}...`}</span>
                          </div>
                        }
                        align="t"
                        popupStyle={{ backgroundColor: '#333' }}
                        popupClassName="bcproducts-business-tooltips"
                      >
                        {item?.item_name}
                      </Balloon.Tooltip>
                    )}
                  </div>

                  <div className="bcproducts-card-describe-content">
                    <div className="bcproducts-card-describe-id">ID：</div>
                    <div style={{ color: '#999' }}>{item?.item_id}</div>
                  </div>
                  <div className="bcproducts-card-describe-content">
                    <div className="bcproducts-card-describe">sku信息</div>
                    <div>{item?.sku_name}</div>
                  </div>
                </div>
                {isEmptyField ? (
                  <div style={{ color: '#CCC' }}>距结束 00天 00:00:00</div>
                ) : (
                  <CountDown endTime={item?.endTime / 1000} />
                )}
              </div>
            </div>
            <div className="bcproducts-card-dashed" />
            <div className="bcproducts-card-bottom">
              <div style={{ display: 'flex' }}>
                <div className="bcproducts-card-describe-title">
                  <div className="bcproducts-card-describe-bottom">预计采购量：</div>
                  <div className="bcproducts-business-describe-div">{item?.target_product_counts}</div>
                </div>
                <div className="bcproducts-card-describe-title">
                  <div className="bcproducts-card-describe-bottom">竞价不高于：</div>
                  <div className="bcproducts-business-describe-div">
                    ¥{item?.goal_price ? (item?.goal_price / 100)?.toFixed(2) : ''}
                  </div>
                </div>
                <div className="bcproducts-card-describe-title">
                  <div className="bcproducts-card-describe-bottom">
                    平台发货
                    {/* <span className="bcproducts-card-line" />
                    平台上门揽 */}
                  </div>
                </div>
              </div>
              <div>
                {isEmptyField ? (
                  <Button type="primary" disabled={ButtonDisabled} className="bcproducts-card-submit">
                    已失效
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    disabled={isEnded}
                    onClick={() => {
                      setBiddingEditData(item);
                      setSubmitDialogVisible(true);
                      sendLogger('submitReporting');
                    }}
                    className="bcproducts-card-submit"
                  >
                    去提报
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    });

  return (
    <Loading tip="加载中..." visible={cardLoading} style={{ width: '100%' }}>
      {processedDataList && processedDataList.length > 0 ? (
        <div className="bcproducts-list-content">
          {cardList()}
          <SubmitBusinessDialog
            visible={submitDialogVisible}
            setVisible={setSubmitDialogVisible}
            biddingEditData={biddingEditData}
            operationType={'submit'}
            getData={getData}
            updateParentState={updateParentState}
          />
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
          />
          <SuccessDialog
            visible={toolTipState.successOpen}
            setVisible={toolTipState.setSuccessOpen}
            operationType={'submit'}
            onRedirect={handleSuccessRedirect}
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
          <div className="empty-state-title">大客商机未匹配！</div>
        </div>
      )}
    </Loading>
  );
}

export default ToBeReportedContent;
