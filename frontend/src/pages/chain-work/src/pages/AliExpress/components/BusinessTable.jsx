import React, { useState, useEffect } from 'react';
import CountDown from '@/components/CountDown';
import Button from '@/components/UI/Button';
import { Dialog, Balloon, ResponsiveGrid, Icon, Loading, Pagination } from '@alifd/next';
import Opportunity from './Opportunity';
import ItemDialog from './ItemDialog';
import { getOppCard, getOppByCondition } from '../services';
import Message from '@/components/UI/Message';
import { Image } from 'antd';

const { Cell } = ResponsiveGrid;

function BusinessCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState([]);
  const [itemsToShow, setItemsToShow] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [pageNum, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(false);
  const [storeLoading, setStoreLoading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const handlePageNoChange = (_current) => {
    setPageNo(_current);
  };
  const getData = () => {
    setLoading(true);
    getOppByCondition({
      request: {
        pageNum,
        pageSize,
        distributeChannel: 'AE_NEW_ITEM',
      },
    }).then((res) => {
      const { success, list, msg } = res || {};
      setTotal(res?.total);
      setPageNo(res?.pageNum);
      if (success) {
        setLoading(false);
        setDataList(list || []);
      } else {
        setLoading(false);
        Message._show({ content: msg || '数据异常，请稍后再试', type: 'error' });
      }
    }).catch((err) => {
      setLoading(false);
      Message._show({ content: err.errorMessage || '数据异常，请稍后再试', type: 'error' });
    });
  };
  const faceOppCard = () => {
    setStoreLoading(true);
    getOppCard({
      request: {
        distributeChannel: 'AE_SHOP_ITEM',
      },
    }).then((res) => {
      const { success, model, msg } = res || {};
      if (success) {
        setStoreLoading(false);
        setData(model || []);
        setItemsToShow(model.slice(0, 4) || []);
      } else {
        setStoreLoading(false);
        Message._show({ content: msg || '数据异常，请稍后再试', type: 'error' });
      }
    }).catch((err) => {
      setStoreLoading(false);
      Message._show({ content: err.errorMessage || '数据异常，请稍后再试', type: 'error' });
    });
  };
  useEffect(() => {
    faceOppCard();
  }, []);
  useEffect(() => {
    setItemsToShow(isExpanded ? data : data.slice(0, 4));
  }, [isExpanded]);
  useEffect(() => {
    getData();
  }, [pageNum, pageSize]);
  const handleCardSuccess = () => {
    faceOppCard();
    getData();
  };
  const handleJoin = (oppName, strategyId) => {
    const dialog = Dialog.show({
      title: <span className="text-[16px] font-medium text-[#333]">{oppName}</span>,
      content: <Opportunity strategyId={strategyId} onClose={() => dialog.hide()} onSuccess={handleCardSuccess} oppName={oppName} />,
      footer: false,
      width: 800,
      className: 'join-opportunity-dialog',
    });
  };
  return (
    <div className="bg-[#fff] p-[20px]">
      {itemsToShow?.length > 0 && (
        <>
          <div className="text-[16px] font-medium leading-[19px] text-[#333] mb-[12px]">店铺品商机</div>
          <Loading tip="加载中..." visible={storeLoading} className="w-full">
            <div className="mb-[12px]">
              <ResponsiveGrid device="desktop" gap={12}>
                {itemsToShow.map(({ oppName = '-', oppText = '-', strategyId = null, endTime = null, currentTime = new Date().valueOf(), onSuccess = () => { }, trafficRight = '-' }) => (
                  <Cell className="w-full flex flex-col p-[16px] border-solid border-[1px] border-[#E6E6E6] rounded-[6px] bg-[#fff]" colSpan={3}>
                    <div className="text-[14px] text-[#333] font-medium leading-[17px] mb-[8px]">
                      {oppName}
                    </div>
                    <div className="h-[38px]">
                      {oppText?.length < 50 ? (
                        <span className="text-[12px] text-[#999] leading-[19px] h-[38px] text-ellipsis line-clamp-2"> {oppText}</span>
                      ) : (
                        <Balloon.Tooltip
                          trigger={<div className="text-[12px] text-[#999] leading-[19px] h-[38px] text-ellipsis line-clamp-2 cursor-pointer">{oppText}</div>}
                          align="t"
                          popupStyle={{ backgroundColor: '#333' }}
                          popupClassName="products-business-tooltips"
                        >
                          <div className="text-[12px] leading-[19px]">{oppText}</div>
                        </Balloon.Tooltip>
                      )}
                    </div>
                    <div className="flex flex-row items-center justify-between mt-[8px]">
                      <div className="flex flex-row items-center">
                        <span className="text-[12px] text-[#666] leading-[12px] mr-[6px]">倒计时</span>
                        <CountDown endTime={endTime} startTime={currentTime}>
                          {
                            ({
                              hour,
                              min,
                              second,
                            }) => {
                              return <span className="text-[12px] text-[#FF8B00] leading-[14px]">{hour}:{min}:{second}</span>;
                            }
                          }
                        </CountDown>
                      </div>
                      <Button type="primary" onClick={() => handleJoin(oppName, strategyId)} style={{ height: '24px', fontSize: '12px' }}>立即提报</Button>
                    </div>
                  </Cell>
                ))}
              </ResponsiveGrid>
            </div>
          </Loading>
          {data.length > 4 && (
          <div className="text-center">
            <Button
              type="primary"
              text
              onClick={() => {
                setIsExpanded((prev) => !prev);
              }}
            >
              {isExpanded ? (
                <div>
                  收起
                  <Icon type="arrow-up" />
                </div>
              ) : (
                <div>
                  展开全部
                  <Icon type="arrow-down" />
                </div>
              )}
            </Button>
          </div>
          )}
        </>
      )}
      <div className="text-[16px] font-medium leading-[19px] text-[#333] mb-[12px]">新品商机</div>
      <Loading tip="加载中..." visible={loading} className="w-full">
        {dataList?.length > 0 ? (
          <ResponsiveGrid device="desktop" gap={12}>
            {dataList.map((item) => {
              const { imageUrl = '', title = '', oppMatchId = '' } = item;
              const hasImage = !!imageUrl; // 是否有图片
              return (
                <Cell className="w-full flex flex-col p-[12px] border-solid border-[1px] border-[#E6E6E6] rounded-[6px] bg-[#fff]" colSpan={3}>
                  <div className="flex mb-[12px]">
                    {hasImage && <img className="rounded-[6px] h-[48px] w-[48px] mr-[10px] cursor-pointer" src={imageUrl} alt="img" onClick={() => setCurrentImageUrl(imageUrl)} />}
                    {currentImageUrl === imageUrl && (
                      <Image
                        width={200}
                        style={{ display: 'none' }}
                        src={imageUrl}
                        preview={{
                          visible: currentImageUrl === imageUrl,
                          scaleStep: 0.5,
                          src: imageUrl,
                          onVisibleChange: (value) => {
                            if (!value) {
                              setCurrentImageUrl(null);
                            }
                          },
                        }}
                      />
                    )}
                    <div>
                      {title.length < 12 ? (
                        <div className={'text-[14px] text-[#333] text-ellipsis line-clamp-1'}>{title}</div>
                      ) : (
                        <Balloon.Tooltip
                          trigger={<div className="text-[14px] text-[#333] text-ellipsis line-clamp-1">{title}</div>}
                          align="t"
                          popupStyle={{ backgroundColor: '#333' }}
                          popupClassName="products-business-tooltips"
                        >
                          <span className="text-[14px] text-[#fff]">{title}</span>
                        </Balloon.Tooltip>
                      )}
                      {/* <div className="text-[#999] text-[13px]">ID：000000000</div> */}
                    </div>
                  </div>
                  <div>
                    <Button style={{ height: '24px', fontSize: '12px', marginRight: '8px' }} onClick={() => window.open('https://offer-new.1688.com/select.htm')}>创建同款新品</Button>
                    <Button type="normal:primary-ghost" style={{ height: '24px', fontSize: '12px' }} onClick={() => ItemDialog.open({ oppMatchId })} >选择店铺商品报名</Button>
                  </div>
                </Cell>
              );
            })}
          </ResponsiveGrid>
        ) : (
          <div className="h-[200px] flex items-center justify-center w-full text-[14px] text-[#999]">暂无数据</div>
        )}
      </Loading>
      {dataList?.length > 0 && (
        <div className="mt-[32px] flex justify-end">
          <Pagination
            current={pageNum}
            pageSize={pageSize}
            total={total}
            onChange={handlePageNoChange}
            pageSizeSelector="dropdown"
            pageSizeList={[10, 20, 50]}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageNo(1);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default BusinessCard;
