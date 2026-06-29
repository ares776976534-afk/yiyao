import React, { useState, useEffect, useRef } from 'react';
import { Button, Table, Balloon, Icon, Pagination, Message, Timeline, Dialog } from '@alifd/next';
import dayjs from 'dayjs';
import Clipboard from '@/components/ClipBoard';
import { IconCopy } from '@/components/Icons';
import ProgressiveImage from '@/components/ProgressiveImage';
import PrintPreviewDialog from '@/pages/AeOrder/components/PrintPreviewDialog';
import { SML, ZJ, orderConstants, receiveStatusMap } from '@/pages/AeOrder/constants';
import { orderTableactionMap } from '@/pages/AeOrder/utils';
import actions from '@/service/actions';
import './aeOrderList.scss';
import { checkWhiteList, isGray } from '@/pages/AeOrder/api';
import CountDown from '@/components/CountDown';
import AeManufacturerDialog from '@/pages/AeOrder/components/AeManufacturerDialog';

const TimelineItem = Timeline.Item;
export default ({
  activeType,
  params,
  pageNo,
  setPageNo,
  selectedRowKeys,
  onSelectedRowKeys,
}) => {
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectionData, setSelectionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMergeBtn, setShowMergeBtn] = useState(false);
  const [isGrayBtn, setIsGrayBtn] = useState(false);
  const printDialog = useRef(null);
  const isSml = activeType === SML;
  const getData = () => {
    setLoading(true);
    actions({
      group: 'aeOrder',
      name: 'queryAeOrderList',
      params: { orderType: activeType, pageNo, pageSize, ...params },
    })
      .then((d) => {
        const { orderQueryModelList = [], pageNo: _pageNo = 1, total: _total = 0 } = d.data;
        const _d = (orderQueryModelList || []).map((item) => {
          const _orderEntries = (item.orderEntries || []).map((it) => {
            return {
              ...it,
              ...item,
              childCount: item.orderEntries?.length || 1,
            };
          });
          return {
            ...item,
            children: _orderEntries,
          };
        });
        setDataSource(_d);
        setPageNo(Number(_pageNo));
        setTotal(Number(_total));
      })
      .catch((err) => {
        Message.error(err.errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const groupHeaderRender = (record) => {
    const { id, gmtCreate } = record;
    const pickupOrderNumber = record?.pickupOrder?.pickupOrderNumber || '';
    return (
      <div className="ae-order-group-header-container">
        <span>订单编号：</span>
        {id}
        <span className="copy">
          <Clipboard text={id}>
            <IconCopy />
          </Clipboard>
        </span>
        <span>下单时间：</span>
        {gmtCreate}
        {
          pickupOrderNumber ? (
            <>
              <span style={{ marginLeft: 16 }}>揽收单号：</span>
              {pickupOrderNumber}
              <span className="copy">
                <Clipboard text={pickupOrderNumber}>
                  <IconCopy />
                </Clipboard>
              </span>
            </>
          ) : ''
        }

      </div>
    );
  };
  const cellProps = (rowIndex, colIndex, dataIndex, record) => {
    const { childCount } = record;
    if (colIndex > 3 && childCount) {
      return {
        rowSpan: childCount,
      };
    }
  };
  const orderInfoRender = (value, index, record) => {
    const { mainSummImageUrl = '', productName = '', industrySecurities, refundStatus = '' } = record;
    const refundStatusText = (() => {
      if (refundStatus === 'waitselleragree') {
        return <span style={{ display: 'inline-block', color: '#ff0000', border: '1px solid #ff0000', marginLeft: 5, padding: '0 3px' }}>退款中</span>;
      }
      if (refundStatus === 'refundsuccess') {
        return <span style={{ display: 'inline-block', color: '#333', border: '1px solid #333', marginLeft: 5, padding: '0 3px' }}>退款成功</span>;
      }
      if (refundStatus === 'refundclose') {
        return <span style={{ display: 'inline-block', color: '#666', border: '1px solid #666', marginLeft: 5, padding: '0 3px' }}>退款关闭</span>;
      }
      return '';
    })();
    return (
      <div className="order-info-container" style={{ width: 200 }}>
        <div className="order-info-image">
          <ProgressiveImage src={mainSummImageUrl} />
        </div>
        <div className="order-content">
          <div className="order-name" title={productName}>
            {productName}
            {refundStatusText}
          </div>
          {(industrySecurities || []).length > 0 && (
            <div className="order-servie-container">
              {industrySecurities.map((item) => {
                const { name = '', serviceLink = '' } = item;
                return (
                  <div
                    key={name}
                    className="order-service-item"
                    style={{ cursor: serviceLink ? 'pointer' : 'inherit' }}
                    onClick={() => {
                      serviceLink && window.open(serviceLink);
                    }}
                  >
                    {name}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };
  const specRender = (value) => {
    const { specItems = [] } = value || {};
    if (specItems?.length === 0) {
      return null;
    }
    const _specItems = specItems.map((item) => item.specValue);
    return (
      <div className="order-spec-container">
        {_specItems.map((item) => {
          return (
            <span className="spec-item" key={item}>
              {item}
            </span>
          );
        })}
      </div>
    );
  };
  const priceRender = (value) => {
    if (!value) {
      return null;
    }
    const price = (Number(value) / 100).toFixed(2);
    return <div>&yen; {price}</div>;
  };
  const paymentRender = (value, index, record) => {
    if (!value) {
      return null;
    }
    const { carriage } = record;
    const price = (Number(value) / 100).toFixed(2);
    const _carriage = Number(carriage) / 100;
    return (
      <div className="payment-container">
        <div>&yen;{price}</div>
        {_carriage > 0 && <div>含运费&yen;{_carriage.toFixed(2)}</div>}
      </div>
    );
  };

  const statusRender = (value, index, record) => {
    if (!value) {
      return null;
    }
    const { exceedTime = '', pickupOrder = {}, pickupDeadline, currentTime } = record;
    const statusMap = orderConstants.find((item) => item.value === value) || {};
    const { value: code, label } = statusMap;
    const {
      estimatedPickupTime = '',
      status: receiveStatus,
      driverName = '',
      driverPhone = '',
      carNo = '',
    } = pickupOrder;
    const _receiveStatus = String(receiveStatus);
    return (
      <div>
        <div className="status-label">{label}</div>
        {/* 待卖家发货 额外展示状态 */}
        {code === 'waitsellersend' && (
          <div className="wait-sellersend-container">
            {isSml && (
              <div className="flex flex-col items-start">
                <div>
                  待创建揽收单
                  <Balloon
                    v2
                    align="t"
                    arrowPointToCenter
                    trigger={<Icon type="prompt" />}
                    closable={false}
                    className="balloon-prompt"
                    style={{ padding: 12, background: '#333', fontSize: 13, color: '#fff' }}
                  >
                    当日 14:00-次日 14:00 产生的采购订单，须在次日 15:00 前预约上门揽，并在次日 24:00 前完成揽收
                  </Balloon>
                </div>
                {
                  pickupDeadline && (
                    <div>
                      距离最晚揽收时间：
                      <span className="text-[14px] text-[#FF7300]">
                        <CountDown startTime={Number(currentTime)} endTime={Number(pickupDeadline)}>
                          {
                            ({ day, hour, min, second }) => {
                              if (day) {
                                return `${day}天${hour}小时${min}分钟`;
                              } else {
                                return `${hour}:${min}:${second}`;
                              }
                            }
                          }
                        </CountDown>
                      </span>
                    </div>
                  )
                }
              </div>
            )}
            <div>
              {exceedTime ? (
                <span className="exceed-time">已逾期</span>
              ) : (
                <span className="exceed-prompt">
                  {/* [2026-06-22 Offline] 产品要求下线商家自寄Tab，固定为SML提示 */}
                  请确保14点前支付的订单今日15点前创建揽收单，14点后支付的订单次日15点前创建揽收单
                </span>
              )}
            </div>
          </div>
        )}
        {code === 'waitbuyerreceive' && isSml && (
          <div className="wait-buyer-receive-container">
            {estimatedPickupTime && (
              <div className="estimated-time">
                <div>预计上门揽时间：</div>
                <div>{dayjs(estimatedPickupTime).format('YYYY-MM-DD HH:mm:ss')}</div>
              </div>
            )}
            <div className="collect-status-container">
              <Balloon
                v2
                type="primary"
                align="t"
                arrowPointToCenter
                trigger={<div className="collect-status-text">揽收物流状态</div>}
                closable={false}
                className="collect-status-balloon-container"
              >
                <div className="collect-info-container">
                  <Timeline>
                    {/* {_receiveStatus === '-99' && (
                        <TimelineItem title="未知" state="process" dot={<div className="collect-status-dot" />} />
                      )} */}
                    {receiveStatusMap.map((item) => {
                      const { value: _value, label: _label } = item;
                      return (
                        <TimelineItem
                          key={_value}
                          title={_label}
                          state={_receiveStatus === _value ? 'process' : 'done'}
                          dot={<div className="collect-status-dot" />}
                        />
                      );
                    })}
                  </Timeline>
                  <div className="divider" />
                  <div className="driver-info">
                    <div className="driver-info-item">
                      <div>司机姓名</div>
                      <div>{driverName}</div>
                    </div>
                    <div className="driver-info-item">
                      <div>联系电话</div>
                      <div>{driverPhone}</div>
                    </div>
                    <div className="driver-info-item">
                      <div>车辆信息</div>
                      <div>{carNo}</div>
                    </div>
                  </div>
                </div>
              </Balloon>
            </div>
          </div>
        )}
      </div>
    );
  };
  // 渲染列表的操作按钮，第一个是button样式，其余的都是链接样式
  const operationRender = (value, index, record) => {
    if (value?.length === 0) {
      return null;
    }
    const { id: orderId, orderEntries } = record || {};
    return (
      <div className="opeartion-container">
        {value.map((item, i) => {
          const { code } = item;
          const actionItem = {
            ...item,
            ...orderTableactionMap[code],
          };
          return (
            <div className="opeartion-item" key={code}>
              <Button
                type="primary"
                {...(i === 0
                  ? {}
                  : {
                    component: 'a',
                    text: true,
                  })}
                onClick={() => {
                  actionItem?.action?.(
                    { orderId, orderEntries, pickupOrderNumber: record?.pickupOrder?.pickupOrderNumber },
                    printDialog?.current,
                    record,
                    isGrayBtn,
                  );
                }}
              >
                {actionItem.text}
              </Button>
            </div>
          );
        })}
      </div>
    );
  };
  const handlePageNoChange = (_current) => {
    setPageNo(_current);
    onSelectedRowKeys([]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange(_keys, _data) {
      onSelectedRowKeys(_keys);
      setSelectionData(_data);
    },
  };
  useEffect(() => {
    setDataSource([]);
    isGray().then((res) => {
      if (res.success) {
        setIsGrayBtn(res.content.data);
      }
    });
  }, [activeType]);
  useEffect(() => {
    getData();
  }, [activeType, pageNo, params]);
  useEffect(() => {
    checkWhiteList().then((res) => {
      if (`${res?.content?.data}` === 'true') {
        setShowMergeBtn(true);
      }
    });
  }, []);
  return (
    <div className="ae-order-list-container">
      {isSml && (
      <div className="ae-operations">
        <div className="ae-collect-orders-btns">
          {
            showMergeBtn ? (
              <Button
                type="secondary"
                disabled={selectionData.filter((item) => item.status === 'waitsellersend').length < 2}
                onClick={() => {
                  // 卡下是否签署AE协议
                  AeManufacturerDialog.open({
                    isCloseIcon: true,
                    onOk: () => {
                      const wayBillList = selectionData.filter((item) => item.status === 'waitsellersend');
                      if (wayBillList.length) {
                        const dialog = Dialog.show({
                          title: '合并创建揽收单数量',
                          content: (
                            <div style={{ width: 360 }}>
                              <p style={{ marginBottom: 0, marginTop: 0, paddingLeft: 6 }}>可合并创建揽收单：<span style={{ color: '#0077FF' }}>{wayBillList.length}</span></p>
                              <p style={{ marginBottom: 0, marginTop: 5, paddingLeft: 6 }}>非待发货状态订单（系统自动过滤）：<span style={{ color: '#FF0000' }}>{selectionData.length - wayBillList.length}</span></p>
                            </div>
                          ),
                          footer: (
                            <div style={{ width: '100%' }}>
                              <Button
                                type="primary"
                                onClick={() => {
                                  orderTableactionMap.createMergeWayBillList.action(wayBillList);
                                  dialog.hide();
                                }}
                              >
                                确定
                              </Button>
                            </div>
                          ),
                        });
                      } else {
                        Message.warning('当前选中的所有订单都不可创建揽收单，请重新选择');
                      }
                    } });
                }}
              >
                合并创建揽收单
              </Button>
            ) : null
          }
          <Button
            type="secondary"
            disabled={selectionData.filter((item) => item.status === 'waitsellersend').length < 2}
            onClick={() => {
              // 卡下是否签署AE协议
              AeManufacturerDialog.open({
                isCloseIcon: true,
                onOk: () => {
                  const wayBillList = selectionData.filter((item) => {
                    return item.status === 'waitsellersend';
                  });
                  if (wayBillList.length) {
                    if (wayBillList.length > 10) {
                      return Message.error(`批量创建揽收单一次最多只能选择10条, 当前选择了${wayBillList.length}条`);
                    }
                    const dialog = Dialog.show({
                      title: '批量创建揽收单数量',
                      content: (
                        <div style={{ width: 360 }}>
                          <p style={{ marginBottom: 0, marginTop: 0, paddingLeft: 6 }}>可批量创建揽收单：<span style={{ color: '#0077FF' }}>{wayBillList.length}</span></p>
                          <p style={{ marginBottom: 0, marginTop: 5, paddingLeft: 6 }}>非待发货状态订单（系统自动过滤）：<span style={{ color: '#FF0000' }}>{selectionData.length - wayBillList.length}</span></p>
                        </div>
                      ),
                      footer: (
                        <div style={{ width: '100%' }}>
                          <Button
                            type="primary"
                            onClick={() => {
                              orderTableactionMap.createWayBillList.action(wayBillList, isGrayBtn);
                              dialog.hide();
                            }}
                          >
                            确定
                          </Button>
                        </div>
                      ),
                    });
                  } else {
                    Message.warning('当前选中的所有订单都不可创建揽收单，请重新选择');
                  }
                } });
            }}
          >
            批量创建揽收单
          </Button>
          <Button
            type="secondary"
            disabled={!selectionData.some((item) => !!item.pickupOrder?.pickupOrderNumber)}
            onClick={() => {
              const wayBillList = selectionData
                .filter((item) => !!item.pickupOrder?.pickupOrderNumber)
                .map((item) => item.pickupOrder.pickupOrderNumber);
              if (wayBillList.length) {
                orderTableactionMap.printWayBill.action(
                  { pickupOrderNumber: wayBillList.join(',') },
                  printDialog.current,
                );
              } else {
                Message.warning('当前选中的所有订单都不可打印揽收单，请重新选择');
              }
            }}
          >
            批量打印揽收单
          </Button>
        </div>
        {/* 后端不支持排序 暂不展示 */}
        {/* <div className="ae-order-select">
          <span>排序</span>
          <Select style={{ width: 200 }} />
        </div> */}
      </div>
      )}
      {/* [2026-06-22 Offline] 产品要求下线商家自寄Tab，className固定为SML，rowSelection固定启用 */}
      <div className={`ae-order-list ${SML}`}>
        <Table
          hasBorder={false}
          dataSource={dataSource}
          rowSelection={rowSelection}
          loading={loading}
          cellProps={cellProps}
        >
          <Table.GroupHeader cell={groupHeaderRender} />
          <Table.Column title="商品信息" cell={orderInfoRender} />
          <Table.Column title="规格" dataIndex="specInfo" align="center" width={160} cell={specRender} />
          <Table.Column title="单价" dataIndex="price" align="center" width={140} cell={priceRender} />
          <Table.Column title="数量" dataIndex="quantity.realAmountStr" align="center" width={140} />
          <Table.Column title="订单总额" dataIndex="sumPayment" align="center" width={140} cell={paymentRender} />
          <Table.Column title="订单状态" dataIndex="status" width={300} cell={statusRender} />
          <Table.Column title="操作" dataIndex="operation" align="center" width={140} cell={operationRender} />
        </Table>
      </div>
      {dataSource?.length > 0 && (
      <div className="ae-order-pagination">
        <Pagination
          current={pageNo}
          pageSize={pageSize}
          total={total}
          onChange={handlePageNoChange}
        />
      </div>
      )}
      <PrintPreviewDialog ref={printDialog} />
    </div>
  );
};
