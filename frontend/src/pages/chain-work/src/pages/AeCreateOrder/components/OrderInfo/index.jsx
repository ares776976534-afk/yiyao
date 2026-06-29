import React, { useState } from 'react';
import { Form, Field, NumberPicker, Button, Message, Loading, Dialog } from '@alifd/next';
import AeMessage from '@/components/AeMessage';
import PartLayout from '../PartLayout';
import List from '../List';
import { createPickUpOrder } from '../../api';
import './index.scss';

const formFields = [
  {
    label: '总重量',
    fieldName: 'totalWeight',
    innerAfter: 'kg',
    precision: 3,
    requiredMessage: '请填写包裹的总重量',
  },
  {
    label: '总体积',
    fieldName: 'totalVolume',
    innerAfter: 'm³',
    precision: 3,
    requiredMessage: '请填写包裹的总体积',
  },
  {
    label: '总箱数',
    fieldName: 'totalPackage',
    innerAfter: '箱',
    precision: 0,
    requiredMessage: '请填写包裹的总箱数',
    min: 1,
    max: 999,
  },
];

export default (props) => {
  const { mode, setCreatedStatus, list, setResult, addressId } = props;
  const field = Field.useField();
  const [loadingVisible, setLoadingVisible] = useState(false);

  const handleCancel = () => {
    window.close();
  };

  const confirmTotalPackage = (totalPackage) => {
    return new Promise((reslove, reject) => {
      Dialog.confirm({
        title: '请再次确认揽收单箱数',
        content: <div style={{ width: 500 }}>您确认所选订单将打包进 <b>{totalPackage}个物流大包</b> ？若实际发货中，订单商品数量过多或体积过大导致无法打包进您预估数量的大包中，会造成多余的订单无法发货，以及此揽收单下全部订单在仓库无法收货，请合理预估”。用户需二次确认或者返回修改箱数</div>,
        onOk: () => reslove(),
        onCancel: () => reject(),
      });
    });
  };

  const handleCreate = async () => {
    const params = {
      orderIds: list.map((ele) => ele?.id).join(','),
      addressId,
    };

    if (['single', 'merge'].includes(mode)) {
      let isOk = true;
      field.validate((errors, values) => {
        if (!errors) {
          return true;
        } else {
          isOk = false;
          const errMessage = Object.values(errors)
            .map((item) => item.errors)
            .flat();
          Message.warning(errMessage[0]);
        }
      });

      if (!isOk) {
        return false;
      }

      const formValues = field.getValues();
      params.type = mode === 'merge' ? 'MERGE' : 'BATCH';
      params.totalWeight = `${formValues.totalWeight}`;
      params.totalVolume = `${formValues.totalVolume}`;
      params.totalPackage = formValues.totalPackage;
    }

    if (mode === 'batch') {
      params.type = 'BATCH';
      params.totalWeight = '1';
      params.totalVolume = '0.05';
      params.totalPackage = 1;
    }

    if (mode === 'merge') {
      await confirmTotalPackage(params.totalPackage);
    }

    setLoadingVisible(true);

    createPickUpOrder(params).then((res) => {
      const data = res?.data?.data || {};
      setLoadingVisible(false);
      if (!Object.keys(data).length) {
        return Message.error('网络错误，请重试');
      }

      setResult(data);
      setCreatedStatus('result');
    }).catch((e) => {
      setLoadingVisible(false);
      Message.error(e?.data?.msg || '网络错误，请重试');
    });
  };

  return (
    <div className="order-inof-box">
      <div className="order-info-container">
        <PartLayout title="订单信息">
          {mode === 'batch' && <AeMessage closeable>以下订单将批量创建揽收单，请您确保张贴时，揽收单与箱唛一一对应。</AeMessage>}
          {mode === 'merge' && <AeMessage closeable>请预估下列订单需要分几箱发货，系统将生成对应数量的箱号。<a style={{ color: '#FF0000' }}>可以估多，切勿估少</a>，估少会造成部分订单无法发出，全部订单仓库无法收货</AeMessage>}
          {
            mode === 'merge' && (
              <Form inline field={field}>
                <Form.Item label={'揽收总箱数：'} name="totalPackage" required requiredMessage="请填写订单相关包裹总数">
                  <NumberPicker hasTrigger={false} style={{ width: 196 }} innerAfter="箱" precision={0} placeholder="请填写订单相关包裹总数" min={1} max={999} />
                </Form.Item>
                <Form.Item label={'总重量：'} name="totalWeight" required requiredMessage="请填写订单相关包裹总重量">
                  <NumberPicker hasTrigger={false} style={{ width: 210 }} innerAfter="kg" precision={3} placeholder="请填写订单相关包裹总重量" />
                </Form.Item>
                <Form.Item label={'总体积：'} name="totalVolume" required requiredMessage="请填写订单相关包裹总体积">
                  <NumberPicker hasTrigger={false} style={{ width: 212 }} innerAfter="m³" precision={3} placeholder="请填写订单相关包裹总体积" />
                </Form.Item>
              </Form>
            )
          }
          {
            mode === 'merge' ? (
              <p style={{ color: '#333', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>
                <span>订单信息</span><span style={{ marginLeft: 20 }}>总计：</span>
                <span style={{ color: '#0077FF' }}>{list.length}</span>
                <span>单</span>
              </p>
            ) : null
          }
          {mode === 'merge' && <AeMessage closeable>以下订单将批量创建揽收单，请您确保张贴时，揽收单与箱唛一一对应。</AeMessage>}
          <List list={list} mode={mode} removeItem={props.removeItem} />
        </PartLayout>

      </div>
      {mode === 'single' && (
        <div className="single-create-field">
          <PartLayout title="重量体积与箱数">
            <Form inline field={field}>
              {formFields.map((item) => {
                const { label, fieldName, requiredMessage, innerAfter, precision, min, max } = item;
                return (
                  <Form.Item label={label} name={fieldName} required requiredMessage={requiredMessage}>
                    <NumberPicker hasTrigger={false} style={{ width: '100%' }} precision={precision} innerAfter={innerAfter} min={min} max={max} />
                  </Form.Item>
                );
              })}
            </Form>
          </PartLayout>
        </div>
      )}
      <div className="ae-order-opeations">
        <Button onClick={handleCancel}>取消创建</Button>
        <Button type="primary" onClick={handleCreate}>确认创建</Button>
      </div>
      <Loading
        visible={loadingVisible}
        fullScreen
        shape="fusion-reactor"
      />
    </div>
  );
};
