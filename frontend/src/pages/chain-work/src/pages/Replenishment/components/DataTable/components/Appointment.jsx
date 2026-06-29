import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Table, Dialog, Calendar2, Message, Loading, Select, Button, NumberPicker, Form, Radio, Input, Field } from '@alifd/next';
import { useToggle } from 'ahooks';
import { reservationList } from '../../../services/search';
import { reservationOrderSubmit } from '../../../services/action';
import { splitNum, isTrue } from '@/utlis';
import CopyIcon from '../../CopyIcon';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import './appointment.scss';

dayjs.extend(isToday);
dayjs.extend(isSameOrBefore);
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const DOORTODOOR_PICKUP = 'doorToDoorPickUp'; // 官方上门揽收
const SELF_SENDING = 'selfSending'; // 自行送货

const warehouseInfo = [
  {
    name: '仓库名称',
    dataIndex: 'warehouseName',
  },
  {
    name: '仓库联系人',
    dataIndex: 'warehouseContacts',
  },
  {
    name: '仓库联系人电话',
    dataIndex: 'warehousePhone',
  },
  {
    name: '仓库地址',
    dataIndex: 'warehouseAddress',
  },
];

const waveTimeName = {
  '09:00 ~ 11:00': '上午',
  '13:00 ~ 16:00': '下午',
};

const Block = ({ children, title, subTitle }) => {
  return (
    <div className="appointment-block">
      <div className="appointment-block-title">
        <span className="appointment-block-title-main">{title}</span>
        <span className="appointment-block-title-sub">{subTitle}</span>
      </div>
      {children}
    </div>
  );
};

export const AppointmentInfoItem = ({ name, value, className }) => {
  return (
    <div className={`appointment-info-item ${className || ''}`}>
      <span className="appointment-info-item-name">{name}：</span>
      <span className="appointment-info-item-value">{value || '-'}</span>
    </div>
  );
};

let dataLoadingInterval = null;

function Appointment({ onOk, onCancel, onClose, billIds, records = [] }) {
  const [visible, { toggle: visibleToggle, setLeft: visibleFalse, setRight: visibleTrue }] = useToggle();
  const [data, setData] = useState({});
  const [currentSelectDate, setSelectDate] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [getDataLoading, setGetDataLoading] = useState(false);
  const [currentSelectCapacity, setCurrentSelectCapacity] = useState(null);
  const [pickUpDay, setPickUpDay] = useState();
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const { capacityDays = [], purchaseOrderList = [], warehouse = {}, aeDeliveryInfo = {}, deliveryTypeCode, pickUpDays = [] } = data;
  const DialogField = Field.useField({});

  const totalOrderCount = () => {
    let count = 0;
    purchaseOrderList.forEach((item) => {
      count += item.goods.number;
    });
    return splitNum(count);
  };

  const formatCapacityDays = () => {
    const result = [];
    const sameArr = [];
    capacityDays.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
    capacityDays.forEach((item) => {
      const isDisabled = (item.remnantAmount < totalOrderCount());
      let index = -1;
      let isExists = false;
      if (sameArr?.length) {
        sameArr.forEach((items, j) => {
          if (item?.tip === items) {
            index = j;
            isExists = true;
          } else {
            sameArr.push(item?.tip);
          }
        });
      } else if (item?.tip) {
        sameArr.push(item?.tip);
        isExists = false;
      } else {
        isExists = true;
      }
      if (!isExists) {
        result.push(
          { date: item.tip || '', remnantAmount: '', disabled: true },
          { ...item, disabled: isDisabled },
        );
      } else {
        result.push({ ...item, disabled: isDisabled });
      }
    });
    return result || [];
  };

  const _capacityDays = formatCapacityDays();

  /**
   * 校验提交项是否完整
   */
  const checkForm = () => {
    try {
      if (deliveryTypeCode === DOORTODOOR_PICKUP) {
        const { contactName, contactPhone } = DialogField.values;
        if (!(DialogField.values.deliveryTypeCode && contactName && contactPhone)) {
          setSubmitDisabled(true);
          return;
        }
        for (const i in purchaseOrderList) {
          const { totalWeight, totalVolume, totalBoxNum } = purchaseOrderList[i].goods;
          if (!(totalWeight && totalVolume && totalBoxNum)) {
            setSubmitDisabled(true);
            return;
          }
        }
        if (!(currentSelectDate.date && currentSelectDate.appointWave && pickUpDay)) {
          setSubmitDisabled(true);
          return;
        }
        setSubmitDisabled(false);
        return;
      } else if (!(currentSelectDate.date && currentSelectDate.appointWave)) {
        setSubmitDisabled(true);
        return;
      }
      setSubmitDisabled(false);
    } catch (error) {
      console.error(error, 'error');
      setSubmitDisabled(false);
    }
  };
  /**
   * 提交预约
   * @returns
   */
  const handleOk = () => {
    setSubmitLoading(true);
    let params = {};
    if (deliveryTypeCode === DOORTODOOR_PICKUP) {
      DialogField.validate((errors, values) => {
        if (errors) {
          return false;
        }
        const reservationOrderDetail = purchaseOrderList?.map((item) => {
          return {
            bhId: records[0]?.billInfo?.bhId, //  补货单号
            goodsId: item?.goods?.goodsId, // 货品id
            goodsName: item?.goods?.goodsName, // 货品name
            number: item?.goods?.number, // 补货件数
            deliveryAddress: aeDeliveryInfo?.deliveryAddress, // 发货地址
            totalWeight: item?.goods?.totalWeight, // 总重量
            totalVolume: item?.goods?.totalVolume, // 总体积
            totalBoxNum: item?.goods?.totalBoxNum, // 总箱数
            pickupTime: pickUpDay, // 预约揽收时间
            ...values,
          };
        });
        params = {
          reservationOrderDetail,
          billInfo: records.map((item) => item.billInfo),
          appointDate: currentSelectDate.date,
          appointWave: currentSelectDate.appointWave,
        };
      });
    } else {
      params = {
        billInfo: records.map((item) => item.billInfo),
        appointDate: currentSelectDate.date,
        appointWave: currentSelectDate.appointWave,
      };
    }
    reservationOrderSubmit(params)
      .then((res) => {
        if (res && isTrue(res.success)) {
          onOk && onOk();
          visibleFalse();
          Message.success('提交成功！');
        } else {
          Message.error(res?.msg || '请稍后再试');
        }
      })
      .finally(() => setSubmitLoading(false));
  };

  const handleCancel = () => {
    onCancel && onCancel();
    visibleFalse();
  };

  const handleClose = () => {
    onClose && onClose();
    visibleFalse();
  };

  const Footer = () => {
    const handleSelectDate = (value) => {
      setCurrentSelectCapacity(value);
      setSelectDate({});
      setPickUpDay();
    };

    const handleSelectWave = (value, evt, row) => {
      setSelectDate({
        date: _capacityDays[currentSelectCapacity].date,
        ...row,
      });
    };

    const handleSelectPickUpDay = (value, evt, row) => {
      setPickUpDay(value);
    };

    const timeSource = _capacityDays[currentSelectCapacity]?.waveOrders.map((item) => {
      const isDisabled = (item.remainCapacity < totalOrderCount()) || !item.enable;
      return {
        ...item,
        disabled: isDisabled,
      };
    });

    const formatPickUpDays = () => {
      const pickArr = [];
      pickUpDays.sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
      pickUpDays?.forEach((item) => {
        if (dayjs(item).isSameOrBefore(dayjs(_capacityDays[currentSelectCapacity]?.date))) {
          if (dayjs(item).isToday()) {
            // 日期如果是今天15点之前可以选择
            if (dayjs().format('H') < 15) pickArr.push(item);
          } else {
            pickArr.push(item);
          }
        }
      });
      return pickArr;
    };

    const _pickUpDays = formatPickUpDays();


    return (
      <div className="appointment-footer">
        <div className="appointment-footer-left">
          <div>
            <span className="appointment-footer-text">预约到仓日期:</span>
            <Select
              style={{ width: '228px' }}
              dataSource={_capacityDays}
              itemRender={(item) => `${item.date} ${item.remnantAmount ? `（${item.remnantAmount}）` : ''}`}
              valueRender={(item) => `${item.date}（${item.remnantAmount}）`}
              onChange={handleSelectDate}
              value={_capacityDays[currentSelectCapacity]}
            />
          </div>
          <div>
            <span className="appointment-footer-text">预约到仓时段:</span>
            <Select
              style={{ width: '228px' }}
              disabled={!timeSource}
              dataSource={timeSource}
              itemRender={(item) => (item.appointWaveText ?
                `${waveTimeName[item.appointWaveText] || item.appointWaveText}（${item.remainCapacity}）` : '')}
              valueRender={(item) => (item.appointWaveText ?
                `${waveTimeName[item.appointWaveText] || item.appointWaveText}（${item.remainCapacity}）` : '')}
              onChange={handleSelectWave}
              value={currentSelectDate}
            />
          </div>
          {deliveryTypeCode === DOORTODOOR_PICKUP ?
            <>
              <div>
                <span className="appointment-footer-text">预约上门揽收时间:</span>
                <Select
                  style={{ width: '200px' }}
                  disabled={!currentSelectDate.appointWave}
                  dataSource={_pickUpDays}
                  onChange={handleSelectPickUpDay}
                  value={pickUpDay}
                  placeholder={!currentSelectDate.appointWave ? '请先预约到仓时间' : '请选择'}
                />
              </div>
              <div className="appointment-footer-text-tips">* 当天15:00前可以预约当天上门揽收</div>
            </>
            : null
          }
        </div>
        <div className="appointment-footer-right">
          <Button
            type="primary"
            size="large"
            loading={submitLoading}
            style={{ padding: '0 32px', height: '40px', fontSize: '14px', borderRadius: '4px' }}
            disabled={submitDisabled}
            onClick={handleOk}
          >
            提交预约
          </Button>
        </div>
      </div >
    );
  };

  useEffect(() => {
    dataLoadingInterval = setTimeout(() => {
      setGetDataLoading(true);
    }, 300);
    reservationList(records.map((item) => item.billInfo))
      .then((res) => {
        if (res && res.success && res.model) {
          setData(res.model);
          visibleTrue();
        } else if (res.msg) {
          Dialog.show({
            v2: true,
            title: '温馨提示',
            content: res.msg,
            footerActions: ['ok'],
            footerAlign: 'center',
          });
        } else {
          Message.error('请稍后再试');
        }
      })
      .finally(() => {
        setGetDataLoading(false);
        clearTimeout(dataLoadingInterval);
        dataLoadingInterval = null;
      });
  }, []);

  useEffect(() => {
    checkForm();
  }, [data, currentSelectDate, pickUpDay]);
  /**
   * 表格中输入框修改
   * params
   */
  const tableInputChange = (value, type, index) => {
    switch (type) {
      case 'totalVolume':
        purchaseOrderList[index].goods.totalVolume = value;
        setData({ ...data, purchaseOrderList });
        break;
      case 'totalWeight':
        purchaseOrderList[index].goods.totalWeight = value;
        setData({ ...data, purchaseOrderList });
        break;
      case 'totalBoxNum':
        purchaseOrderList[index].goods.totalBoxNum = value;
        setData({ ...data, purchaseOrderList });
        break;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        v2
        title="预约补货"
        visible={visible}
        onOk={handleOk}
        onClose={handleClose}
        onCancel={handleCancel}
        width={'1000px'}
        footer={<Footer />}
      >
        <Loading visible={submitLoading} fullScreen>
          <div className="appointment">
            <Block title="送货信息">
              <div className="appointment-info">
                {
                  warehouseInfo.map((info) => (
                    <AppointmentInfoItem
                      key={info.dataIndex}
                      name={info.name}
                      value={warehouse[info.dataIndex]}
                    />
                  ))
                }
              </div>
            </Block>
            {deliveryTypeCode ?
              <Form labelAlign="left" inline field={DialogField} style={{ marginBottom: '48px' }} >
                <Block title="送货方式">
                  <FormItem
                    name="deliveryTypeCode"
                    label=""
                    required
                    requiredMessage="请选择送货方式"
                  >
                    <RadioGroup
                      aria-labelledby="groupId"
                      defaultValue={deliveryTypeCode || SELF_SENDING}
                    >
                      <Radio id={DOORTODOOR_PICKUP} value={DOORTODOOR_PICKUP} disabled={deliveryTypeCode !== DOORTODOOR_PICKUP}>
                        官方上门揽收{deliveryTypeCode !== DOORTODOOR_PICKUP ? '（当前订单暂不支持）' : null}
                      </Radio>
                      <Radio id={SELF_SENDING} value={SELF_SENDING} disabled={deliveryTypeCode !== SELF_SENDING}>
                        自行送货 {deliveryTypeCode !== SELF_SENDING ? '（当前订单暂不支持）' : null}
                      </Radio>
                    </RadioGroup>
                  </FormItem>
                  {deliveryTypeCode === DOORTODOOR_PICKUP ?
                    <div className="form_item_box">
                      <div>
                        <FormItem
                          name="contactName"
                          label="商家联系人"
                          required
                          requiredMessage="请填写商家联系人"
                          labelAlign="left"
                          colon
                        >
                          <Input defaultValue={aeDeliveryInfo?.contactName} placeholder="请填写" style={{ width: '206px' }} onChange={checkForm} />
                        </FormItem>
                      </div>
                      <div>
                        <FormItem
                          name="contactPhone"
                          label="商家联系方式"
                          required
                          requiredMessage="请填写商家联系方式"
                          labelAlign="left"
                          colon
                        >
                          <Input defaultValue={aeDeliveryInfo?.contactPhone} placeholder="请填写" style={{ width: '206px' }} onChange={checkForm} />
                        </FormItem>
                      </div>
                    </div>
                    : null}
                </Block>
              </Form>
              : null}
            {deliveryTypeCode === DOORTODOOR_PICKUP ?
              <Block title="补货信息" subTitle={<div>合计总件数：<span className="num">{totalOrderCount()}</span></div>}>
                <Table dataSource={purchaseOrderList} hasBorder={false}>
                  <Table.Column
                    width={280}
                    title="货品详情"
                    dataIndex="poId"
                    cell={(value, index, record) => {
                      return (
                        <>
                          <div className="table_tr"><div>单据号</div><div>{value || '-'} <CopyIcon text={value} /></div></div>
                          <div className="table_tr"><div>货品ID</div><div>{record?.goods?.goodsId || '-'}</div></div>
                          <div className="table_tr"><div>货品名称</div><div>{record?.goods?.goodsName || '-'}</div></div>
                        </>
                      );
                    }}
                  />
                  <Table.Column title="货品补货件数" width={120} align="center" dataIndex="goods.number" />
                  <Table.Column
                    title="发货地点"
                    width={160}
                    cell={() => {
                      return (
                        <span>
                          {aeDeliveryInfo?.deliveryAddress || '-'}
                        </span>
                      );
                    }}
                  />
                  <Table.Column
                    title="总体积"
                    dataIndex="goods.totalVolume"
                    cell={(value, index) => {
                      return (
                        <>
                          <NumberPicker
                            value={value || null}
                            onChange={(e) => { tableInputChange(e, 'totalVolume', index); }}
                            style={{ width: '118.6px' }}
                            min={1}
                            hasTrigger={false}
                            placeholder="请填写"
                            innerAfter={<span style={{ color: '#999999', margin: '0 12px 0 8px' }}>cm³</span>}
                          />
                        </>
                      );
                    }}
                  />
                  <Table.Column
                    title="总重量"
                    dataIndex="goods.totalWeight"
                    cell={(value, index) => {
                      return (
                        <>
                          <NumberPicker
                            value={value || null}
                            onChange={(e) => { tableInputChange(e, 'totalWeight', index); }}
                            style={{ width: '118.6px' }}
                            min={1}
                            hasTrigger={false}
                            placeholder="请填写"
                            innerAfter={<span style={{ color: '#999999', margin: '0 12px 0 8px' }}>g</span>}
                          />
                        </>
                      );
                    }}
                  />
                  <Table.Column
                    title="总箱数"
                    width={120}
                    dataIndex="goods.totalBoxNum"
                    cell={(value, index) => {
                      return (
                        <>
                          <NumberPicker
                            value={value || null}
                            onChange={(e) => { tableInputChange(e, 'totalBoxNum', index); }}
                            style={{ width: '118.6px' }}
                            min={1}
                            hasTrigger={false}
                            placeholder="请填写"
                            precision={0}
                            innerAfter={<span style={{ color: '#999999', margin: '0 12px 0 8px' }}>箱</span>}
                          />
                        </>
                      );
                    }}
                  />
                </Table>
              </Block>
              :
              <Block title="补货信息" subTitle={<div>合计总件数：<span className="num">{totalOrderCount()}</span></div>}>
                <Table dataSource={purchaseOrderList}>
                  <Table.Column title="单号" dataIndex="poId" />
                  <Table.Column title="货品ID" dataIndex="goods.goodsId" />
                  <Table.Column title="货品名称" dataIndex="goods.goodsName" />
                  <Table.Column title="货品补货件数" dataIndex="goods.number" />
                </Table>
              </Block>
            }
            {/* <Block title="预约信息">
              <div style={{ marginBottom: '12px' }}>
                <MessageBar status={'previewDialog'} />
              </div>
              <Calendar2
                disabledDate={disabledDate}
                dateCellRender={dateCellRender}
              />
            </Block> */}
          </div>
        </Loading>
      </Dialog>
      <Loading fullScreen visible={getDataLoading} />
    </>
  );
}

Appointment.open = ({ onCancel, onClose, onOk, records } = {}) => {
  const warehouseList = Array.from(new Set(records.map((item) => item.warehouseName)));

  if (warehouseList.length > 1) {
    Dialog.show({
      v2: true,
      title: '温馨提示',
      content: '请选择同一个送货仓库的单据进行批量预约，您可以通过收货仓库进行筛选，然后选中单据操作批量预约。',
      footerActions: ['ok'],
      footerAlign: 'center',
    });
  } else {
    const tempDiv = document.createElement('div');
    const billIds = records.map((item) => item.billId);
    ReactDOM.render(
      <Appointment onClose={onClose} onCancel={onCancel} onOk={onOk} billIds={billIds} records={records} />,
      tempDiv,
    );
  }
};

export default Appointment;
