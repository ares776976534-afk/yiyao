import React, { useState } from 'react';
import {
  PO_PENDING_APPOINTMENT,
  BH_PENDING_CONFIRM,
  CO_COMPLETED,
  CO_CONFIRMED,
  CO_DISCREPANCY,
  CO_IN_TRANSIT,
  CO_RECEIVING,
  CANCELLED,
  ACTION_RLENISHMENT_PALN_CONFIRM_MSG,
  ACTION_CONSIGNMENT_SUBMIT_MSG,
  ACTION_RESERVATION_ORDER_SUBMIT_MSG,
} from '../../../../constant';
import { Button, Message, Dialog } from '@alifd/next';
import { formatDate, splitNum, openLinkAndDownload, systemTime } from '@/utlis';
import Appointment, { AppointmentInfoItem } from './components/Appointment';
import {
  replenishmentPlanOrderConfirm,
  consignmentSubmit,
  printBoxMarkService,
  exportWareHouseByDownload,
} from '../../services/action';
import { queryWareHouseInfo } from '../../services/search';
import { queryPickUpOrderDetails } from '../../api';
import CopyIcon from '../CopyIcon';
import CountDown from '@/components/CountDown';
import moment from 'moment';
import DiffDetailsDialog from '../DiffDetailsDialog';
import { querySellerType } from '@/pages/ProductsBidding/api';
import AgreementSigningDialog from '@/pages/Replenishment/components/AgreementSigningDialog';

const BillIdCountDown = (record) => {
  const showCountDown = [
    BH_PENDING_CONFIRM,
    CO_CONFIRMED,
    CO_IN_TRANSIT,
    CO_DISCREPANCY,
    PO_PENDING_APPOINTMENT,
  ].includes(record.statusCode);
  const isLastThreeDays = moment(record.timeoutBegins).diff(systemTime.get(), 'days') <= 3;
  const isLastDays = moment(record.timeoutBegins).diff(systemTime.get(), 'hour') <= 25;
  const showBuffaloStatus = showCountDown && isLastThreeDays && record?.billInfo?.channel === 'buffalo';
  const showAEStatus = showCountDown && isLastDays && record.isUrgent && record?.billInfo?.channel === 'AE';
  const [isEnd, setEnd] = useState(false);
  const handleEnd = () => {
    setEnd(true);
  };
  return showBuffaloStatus || showAEStatus ? (
    <CountDown startTime={systemTime.get()} endTime={moment(record.timeoutBegins)} countDownEnd={handleEnd}>
      {({ day, hour, min, second }) => {
        const text = day > 0 ? `${day}天` : `${hour}:${min}:${second} `;
        return (
          <div className="countdown">
            {showBuffaloStatus ? <>{!isEnd ? `${text}后超时关闭` : '即将关闭'}</> : null}
            {showAEStatus ? <>{!isEnd ? `即将超时${text}` : '预约超时'}</> : null}
          </div>
        );
      }}
    </CountDown>
  ) : null;
};

const UrgentTag = (record) => {
  const showUrgentTag = [PO_PENDING_APPOINTMENT].includes(record.statusCode) && record.isUrgent;
  return showUrgentTag ? <div className="urgent-tag">紧急</div> : null;
};

const BILL_ID = {
  title: '单据信息',
  dataIndex: 'billId',
  width: '216px',
  cell: (value, index, record) => {
    return (
      <div className="col-billId">
        <div className="text">
          {value}
          <CopyIcon text={value} />
        </div>
        <div style={{ display: 'flex' }}>
          <UrgentTag {...record} />
          <BillIdCountDown {...record} />
        </div>
      </div>
    );
  },
};

const CREATE_TIME = {
  title: '创建时间',
  dataIndex: 'createTime',
  align: 'center',
  width: '120px',
  cell: (value) => {
    const dateObj = formatDate(value);
    return (
      <div className="col-createTime">
        <span>{dateObj.ymd}</span>
        <span>{dateObj.hms || ''}</span>
      </div>
    );
  },
};

const GOODS_INFO = {
  title: '货品信息',
  width: '175px',
  cell: (value, index, record) => {
    const { goodsName, goodsId } = record;
    return (
      <div className="col-goodsInfo">
        <span className="title">{goodsName}</span>
        <span className="subTitle">货品ID：{goodsId}</span>
      </div>
    );
  },
};

const ITEM_INFO = {
  title: '商品信息',
  width: '210px',
  cell: (value, index, record) => {
    const { itemName, itemId, skuName, skuId } = record;
    return (
      <div className="col-itemInfo">
        <span className="title">{itemName}</span>
        <span className="subTitle">商品ID：{itemId}</span>
        <span className="subTitle">规格名称：{skuName || '-'}</span>
        <span className="subTitle">规格ID：{skuId || '-'}</span>
      </div>
    );
  },
};

const GOODS_QUANTITY = {
  title: '货品件数',
  align: 'center',
  width: '120px',
  dataIndex: 'goodsQuantity',
  cell: (value) => <div className="col-goodsQuantity">{splitNum(value)}</div>,
};

const GOODS_QUANTITY_2 = {
  title: '建议补货数量',
  align: 'center',
  width: '120px',
  dataIndex: 'goodsQuantity',
  cell: (value) => <div className="col-goodsQuantity">{splitNum(value)}</div>,
};

const RESERVATION_QUANTITY = {
  title: '待预约货品件数',
  align: 'center',
  width: '120px',
  dataIndex: 'reservationQuantity',
  cell: (value) => <div className="col-reservationQuantity">{splitNum(value)}</div>,
};

const WAREHOUSE_QUANTITY = {
  title: '实际到仓件数',
  align: 'center',
  width: '100px',
  dataIndex: 'warehouseQuantity',
  cell: (value) => <div className="col-warehouseQuantity">{splitNum(value)}</div>,
};

const WAREHOUSE_QUANTITY_2 = {
  title: '实际上架件数',
  align: 'center',
  width: '100px',
  dataIndex: 'warehouseQuantity',
  cell: (value) => <div className="col-warehouseQuantity">{splitNum(value)}</div>,
};

const WAREHOUSE_NAME = {
  title: '补货仓库',
  width: '175px',
  dataIndex: 'warehouseName',
  cell: (value) => <div className="col-wareHouseName">{value}</div>,
};

const WAREHOUSE_NAME_2 = {
  title: '到货仓库',
  width: '160px',
  dataIndex: 'warehouseName',
  cell: (value) => <div className="col-wareHouseName">{value}</div>,
};

const WAREHOUSE_NAME_3 = {
  title: '仓库信息',
  width: '140px',
  dataIndex: 'warehouseName',
  cell: (value, index, record) => {
    const { warehouseId, billInfo } = record;
    const handleClick = () => {
      Dialog.show({
        content: (
          <div>
            <p style={{ fontSize: '14px', color: '#333' }}>请确认贴箱唛/贴货品标签是否已完成</p>
            <p style={{ fontSize: '14px', color: 'red' }}>
              提示：箱唛/货品标签未贴、贴错均会影响入仓，导致货品退回，请仔细确认清楚
            </p>
          </div>
        ),
        okProps: {
          children: '是',
        },
        cancelProps: {
          children: '否',
        },
      });
    };

    const handleClickInfo = () => {
      queryWareHouseInfo(billInfo).then((res) => {
        if (res) {
          const field = [
            {
              key: 'name',
              name: '仓库名称',
            },
            {
              key: 'address',
              name: '仓库地址',
            },
            {
              key: 'contactor',
              name: '仓库联系人',
            },
            {
              key: 'contactorPhone',
              name: '仓库联系人电话',
            },
          ];
          Dialog.show({
            title: '仓库信息',
            width: '500px',
            content: (
              <div className="appointment-info" style={{ gap: '12px', width: '600px' }}>
                <AppointmentInfoItem name="补货单号" value={billInfo.bhId} />
                {field.map((item) => {
                  return <AppointmentInfoItem key={item.key} name={item.name} value={res[item.key]} />;
                })}
              </div>
            ),
            footerActions: ['cancel'],
            footerAlign: 'center',
            cancelProps: {
              children: '知道了',
            },
          });
        }
      });
    };
    return (
      <div className="col-wareHouseName col-wareHouseName-3">
        <span>{value}</span>
        <Button style={{ textAlign: 'left' }} text type="primary" onClick={handleClickInfo}>
          查看信息
        </Button>
      </div>
    );
  },
};

const CLOSE_REASON = {
  title: '取消原因',
  width: '170px',
  dataIndex: 'closeReason',
  cell: (value, index, record) => {
    return <div className="col-closeReason">{value}</div>;
  },
};

const ALL_DATE = {
  title: '日期',
  width: '120px',
  cell: (value, index, record) => {
    const { createTime, reservationTime, arriveWareHouseTime, tallySheetTime } = record;
    const _createTime = formatDate(createTime);
    const _reservationTime = formatDate(reservationTime);
    const _arriveWareHouseTime = formatDate(arriveWareHouseTime);
    const _tallySheetTime = formatDate(tallySheetTime);
    return (
      <div className="col-allDate">
        <span>创建：{_createTime.ymd}</span>
        <span>预约：{_reservationTime.ymd}</span>
        <span>到仓：{_arriveWareHouseTime.ymd}</span>
        <span>差异单：{_tallySheetTime.ymd}</span>
      </div>
    );
  },
};

const ALL_DATE_2 = {
  title: '日期',
  width: '140px',
  cell: (value, index, record) => {
    const { createTime, reservationTime } = record;
    const _createTime = formatDate(createTime);
    const _reservationTime = formatDate(reservationTime);
    return (
      <div className="col-allDate">
        <span>创建：{_createTime.ymd}</span>
        <span>预约：{_reservationTime.ymd}</span>
      </div>
    );
  },
};

const ALL_DATE_3 = {
  title: '日期',
  width: '120px',
  cell: (value, index, record) => {
    const { createTime, reservationTime, arriveWareHouseTime } = record;
    const _createTime = formatDate(createTime);
    const _reservationTime = formatDate(reservationTime);
    const _arriveWareHouseTime = formatDate(arriveWareHouseTime);
    return (
      <div className="col-allDate">
        <span>创建：{_createTime.ymd}</span>
        <span>预约：{_reservationTime.ymd}</span>
        <span>到仓：{_arriveWareHouseTime.ymd}</span>
      </div>
    );
  },
};
const ACTIONS = (actions, opts = {}) => {
  return {
    title: '操作',
    width: '170px',
    align: 'center',
    cell: (value, index, record, others) => (
      <div className="col-actions">
        {actions.map((action) => {
          return (
            <span className="col-actions-item" key={action}>
              {action({ value, index, record, others, opts })}
            </span>
          );
        })}
      </div>
    ),
    ...opts,
  };
};

const DELIVERY = {
  title: '送货方式',
  windth: '140px',
  dataIndex: 'deliveryTypeCode',
  cell: (value, index, record) => {
    const { warehouseId, billInfo } = record;

    const handleClickInfo = () => {
      queryPickUpOrderDetails(JSON.stringify({ coId: billInfo?.coId })).then((res) => {
        const model = res?.data?.model;
        if (model) {
          const field = [
            {
              key: 'pickupOrderCode',
              name: '揽收单号',
            },
            {
              key: 'expectPickupTime',
              name: '预计揽收时间',
            },
            {
              key: 'orderStatus',
              name: '揽收状态',
            },
            {
              key: 'pickupDriverName',
              name: '揽收司机名称',
            },
            {
              key: 'pickupDriverPhone',
              name: '司机电话',
            },
          ];
          const field_2 = [
            {
              key: 'totalFee',
              name: '预计费金额',
              unit: '元',
            },
            {
              key: 'totalWeight',
              name: '预计费重量',
              unit: '克',
            },
            {
              key: 'totalVolume',
              name: '预测量体积',
              unit: '立方厘米',
            },
          ];
          Dialog.show({
            title: '上门揽明细',
            width: '800px',
            content: (
              <>
                <div className="appointment-info-title" style={{ paddingTop: '12px' }}>
                  揽收详情
                </div>
                <div className="appointment-info" style={{ gap: '12px 0', width: '800px' }}>
                  <AppointmentInfoItem name="补货单号" value={billInfo.bhId} />
                  {field.map((item) => {
                    const _value = model[item.key];
                    return (
                      <AppointmentInfoItem
                        key={item.key}
                        name={item.name}
                        value={_value ? `${_value} ${item.unit || ''}` : ''}
                      />
                    );
                  })}
                </div>
                <div className="appointment-info-title">预计揽收费用</div>
                <div className="appointment-info" style={{ gap: '12px 0', width: '800px' }}>
                  {field_2.map((item) => {
                    const _value = model[item.key];
                    return (
                      <AppointmentInfoItem
                        key={item.key}
                        name={item.name}
                        value={_value ? `${_value} ${item.unit || ''}` : ''}
                        className={item.key === 'totalFee' ? 'appointment-info-item-other' : null}
                      />
                    );
                  })}
                </div>
              </>
            ),
            footer: false,
          });
        }
      });
    };
    return (
      <div className="col-wareHouseName col-wareHouseName-3">
        {value === 'doorToDoorPickUp' ? (
          <>
            <span>{record.deliveryType || ''}</span>
            <span style={{ color: '#666666' }}>预计上门时间：{record.expectPickupTime || '-'}</span>
            <Button style={{ textAlign: 'left' }} text type="primary" onClick={handleClickInfo}>
              查看揽收明细
            </Button>
          </>
        ) : (
          <span>{record.deliveryType || ''}</span>
        )}
      </div>
    );
  },
};

// 确认补货
const ACTION_RLENISHMENT_PALN_CONFIRM = ({ record, others = {} }) => {
  const { onActionClick } = others;
  const handleClick = () => {
    replenishmentPlanOrderConfirm([record.billInfo]).then((success) => {
      if (success) {
        onActionClick(ACTION_RLENISHMENT_PALN_CONFIRM_MSG);
        Message.success('确认补货成功');
      } else {
        Message.error('请稍后再试');
      }
    });
  };
  return (
    <Button text type="primary" onClick={handleClick}>
      确认补货
    </Button>
  );
};

// 去预约
const ACTION_ESERVATION_ORDER_SUBMIT = ({ record, others = {} }) => {
  const { onActionClick = () => { } } = others;

  const handleClick = async () => {
    try {
      const sellerTypeRes = await querySellerType(577987);

      // 协议未签署
      if (!sellerTypeRes?.data?.data && record?.isUrgent) {
        AgreementSigningDialog.open(() => {
          Appointment.open({ records: [record], onOk: () => onActionClick(ACTION_RESERVATION_ORDER_SUBMIT_MSG) });
        });
      } else {
        Appointment.open({ records: [record], onOk: () => onActionClick(ACTION_RESERVATION_ORDER_SUBMIT_MSG) });
      }
    } catch (error) {
      Message.error(error?.message || '请稍后再试');
    }
  };

  return (
    <>
      <Button text type="primary" onClick={handleClick}>
        去预约
      </Button>
    </>
  );
};

// 打印箱唛
const ACTION_PRINT_BOX_MARK = ({ record, others = {}, opts = {} }) => {
  const { onActionClick = () => { } } = others;
  const { showConfirm = true } = opts;

  const boxMark = {
    name: '打印箱唛',
    onClick: () => {
      printBoxMarkService({ billInfo: record.billInfo, opType: 'box' }).then((url) => {
        if (url) {
          openLinkAndDownload(url);
        }
      });
    },
  };
  const boxMark2 = {
    name: '打印货品标签',
    onClick: () => {
      printBoxMarkService({ billInfo: record.billInfo, opType: 'offer' }).then((url) => {
        if (url) {
          openLinkAndDownload(url);
        }
      });
    },
  };
  const confirmSubmit = {
    name: '确认发货',
    onClick: () => {
      Dialog.show({
        title: '提示',
        content: (
          <div>
            <p style={{ fontSize: '14px', color: '#333' }}>请确认贴箱唛/贴货品标签是否已完成</p>
            <p style={{ fontSize: '14px', color: 'red' }}>
              提示：箱唛/货品标签未贴、贴错均会影响入仓，导致货品退回，请仔细确认清楚
            </p>
          </div>
        ),
        onOk: () => {
          consignmentSubmit([record.billInfo]).then((success) => {
            if (success) {
              Message.success('确认发货成功');
              onActionClick(ACTION_CONSIGNMENT_SUBMIT_MSG);
            } else {
              Message.error('请稍后再试');
            }
          });
        },
        // onCancel
        okProps: {
          children: '是',
        },
        cancelProps: {
          children: '否',
        },
      });
    },
  };

  const exportReservation = {
    name: '导出收货地址',
    onClick: () => {
      exportWareHouseByDownload([record?.billInfo]);
    },
  };

  const collectOrders = {
    name: '打印揽收单',
    onClick: () => {
      printBoxMarkService({ billInfo: record.billInfo, opType: 'collectOrders' }).then((url) => {
        if (url) {
          openLinkAndDownload(url);
        }
      });
    },
  };

  const collectOrdersDetails = {
    name: '查看上门揽明细',
    onClick: () => {
      const { warehouseId, billInfo } = record;
      queryPickUpOrderDetails(JSON.stringify({ coId: billInfo?.coId })).then((res) => {
        const model = res?.data?.model;
        if (model) {
          const field = [
            {
              key: 'pickupOrderCode',
              name: '揽收单号',
            },
            {
              key: 'expectPickupTime',
              name: '预计揽收时间',
            },
            {
              key: 'orderStatus',
              name: '揽收状态',
            },
            {
              key: 'pickupDriverName',
              name: '揽收司机名称',
            },
            {
              key: 'pickupDriverPhone',
              name: '司机电话',
            },
          ];
          const field_2 = [
            {
              key: 'totalFee',
              name: '预计费金额',
              unit: '元',
            },
            {
              key: 'totalWeight',
              name: '预计费重量',
              unit: '克',
            },
            {
              key: 'totalVolume',
              name: '预测量体积',
              unit: '立方厘米',
            },
          ];
          Dialog.show({
            title: '上门揽明细',
            width: '800px',
            content: (
              <>
                <div className="appointment-info-title" style={{ paddingTop: '12px' }}>
                  揽收详情
                </div>
                <div className="appointment-info" style={{ gap: '12px 0', width: '800px' }}>
                  <AppointmentInfoItem name="补货单号" value={billInfo.bhId} />
                  {field.map((item) => {
                    const value = model[item.key];
                    return (
                      <AppointmentInfoItem
                        key={item.key}
                        name={item.name}
                        value={value ? `${value} ${item.unit || ''}` : ''}
                      />
                    );
                  })}
                </div>
                <div className="appointment-info-title">预计揽收费用</div>
                <div className="appointment-info" style={{ gap: '12px 0', width: '800px' }}>
                  {field_2.map((item) => {
                    const value = model[item.key];
                    return (
                      <AppointmentInfoItem
                        key={item.key}
                        name={item.name}
                        value={value ? `${value} ${item.unit || ''}` : ''}
                        className={item.key === 'totalFee' ? 'appointment-info-item-other' : null}
                      />
                    );
                  })}
                </div>
              </>
            ),
            footer: false,
          });
        }
      });
    },
  };
  let actions = [];
  if (record.deliveryTypeCode === 'doorToDoorPickUp') {
    actions = [collectOrders, boxMark2, boxMark, collectOrdersDetails];
  } else {
    // ESERVATION
    actions = [boxMark, boxMark2];

    if (showConfirm) {
      actions.push(confirmSubmit);
    }

    actions.push(exportReservation);
  }

  return (
    <div className="col-action-printBoxMark">
      {actions.map((action, index) => {
        return (
          <div key={action.name} className="col-action-printBoxMark-item" onClick={action.onClick}>
            <span className="col-action-printBoxMark-item-num">{index + 1}</span>
            <span className="col-action-printBoxMark-item-text">{action.name}</span>
          </div>
        );
      })}
    </div>
  );
};

// 查看差异单
const ACTION_DISCREPANCY = ({ record }) => {
  const handleClick = () => {
    DiffDetailsDialog.open({ warehouseBizId: record?.billInfo?.bizCoId });
  };
  const isShow = record.hadTallySheet;
  return isShow ? (
    <Button text type="primary" onClick={handleClick}>
      查看差异单
    </Button>
  ) : (
    '无'
  );
};

// 导出发货信息
const ACTION_EXPORT_RESERVATION = ({ record }) => {
  const handleClick = () => {
    exportWareHouseByDownload([record?.billInfo]);
  };
  return (
    <Button text type="primary" onClick={handleClick}>
      导出收货地址
    </Button>
  );
};

export default (type) => {
  switch (type) {
    case BH_PENDING_CONFIRM:
      return [
        BILL_ID,
        CREATE_TIME,
        GOODS_INFO,
        ITEM_INFO,
        GOODS_QUANTITY_2,
        WAREHOUSE_NAME,
        ACTIONS([ACTION_RLENISHMENT_PALN_CONFIRM]),
      ];
    case PO_PENDING_APPOINTMENT:
      return [
        BILL_ID,
        CREATE_TIME,
        WAREHOUSE_NAME_3,
        GOODS_QUANTITY,
        RESERVATION_QUANTITY,
        ITEM_INFO,
        ACTIONS([ACTION_ESERVATION_ORDER_SUBMIT, ACTION_EXPORT_RESERVATION]),
      ];
    case CO_CONFIRMED:
      return [
        BILL_ID,
        DELIVERY,
        ALL_DATE_2,
        WAREHOUSE_NAME_3,
        GOODS_QUANTITY,
        GOODS_INFO,
        ITEM_INFO,
        ACTIONS([ACTION_PRINT_BOX_MARK], { align: 'left' }),
      ];
    case CO_IN_TRANSIT:
      return [
        BILL_ID,
        DELIVERY,
        ALL_DATE_2,
        WAREHOUSE_NAME_3,
        GOODS_QUANTITY,
        GOODS_INFO,
        ITEM_INFO,
        ACTIONS([ACTION_PRINT_BOX_MARK], { align: 'left', showConfirm: false }),
      ];
    case CO_COMPLETED:
      return [BILL_ID, ALL_DATE_3, GOODS_INFO, ITEM_INFO, WAREHOUSE_NAME_2, GOODS_QUANTITY, WAREHOUSE_QUANTITY_2];
    case CO_DISCREPANCY:
      return [
        BILL_ID,
        ALL_DATE,
        GOODS_INFO,
        ITEM_INFO,
        WAREHOUSE_NAME_2,
        GOODS_QUANTITY,
        ACTIONS([ACTION_DISCREPANCY]),
      ];
    case CO_RECEIVING:
      return [
        BILL_ID,
        ALL_DATE,
        GOODS_INFO,
        ITEM_INFO,
        WAREHOUSE_NAME_2,
        GOODS_QUANTITY,
        ACTIONS([ACTION_DISCREPANCY]),
      ];
    case CANCELLED:
      return [BILL_ID, CREATE_TIME, GOODS_INFO, ITEM_INFO, GOODS_QUANTITY_2, WAREHOUSE_NAME, CLOSE_REASON];
    default:
      return [];
  }
};
