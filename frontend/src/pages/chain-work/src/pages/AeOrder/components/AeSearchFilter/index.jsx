import React, { useState, useEffect } from 'react';
import { Form, Grid, Select, Input, DatePicker2, Button, Field } from '@alifd/next';
import dayjs from 'dayjs';
import { defaultParam, sellStatusMap } from '../../constants';
import './index.scss';
const { Row, Col } = Grid;
const { Item: FormItem } = Form;
const { RangePicker } = DatePicker2;
const gutter = 24;
const span = 8;
export default (props) => {
  const { setParams, type } = props;
  const field = Field.useField();
  const handleSubmit = (values) => {
    const _values = { ...values };
    if (_values.orderTime?.filter((item) => item).length > 1) {
      const [startTime, endTime] = _values.orderTime;
      const _startTime = startTime.set('hour', 0).set('minute', 0).set('second', 0);
      const _endTime = endTime.set('hour', 23).set('minute', 59).set('second', 59);
      _values.orderCreateTimeStart = dayjs(_startTime).format('YYYY-MM-DD HH:mm:ss');
      _values.orderCreateTimeEnd = dayjs(_endTime).format('YYYY-MM-DD HH:mm:ss');
      delete _values.orderTime;
    } else {
      delete _values.orderTime;
    }
    setParams(_values);
  };
  const handleReset = () => {
    field.setValues(defaultParam);
    setParams(defaultParam);
  };
  useEffect(() => {
    const orderNo = new URLSearchParams(location.search).get('orderId') || '';
    const paras = {
      ...defaultParam,
      orderNo,
    }
    field.setValues(paras);
    setParams(paras);
  }, []);
  return (
    <div className="ae-seach-filter-container">
      <Form field={field}>
        <Row gutter={gutter}>
          <Col>
            <FormItem label="订单状态" name="orderStatus">
              <Select dataSource={sellStatusMap} followTrigger />
            </FormItem>
          </Col>
          <Col>
            <FormItem label="订单标题" name="keyword">
              <Input placeholder="请输入订单标题" hasClear />
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="下单时间" name="orderTime">
              <RangePicker placeholder={['开始时间', '结束时间']} hasClear followTrigger />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={gutter}>
          <Col>
            <FormItem label="订单编号" name="orderNo">
              <Input placeholder="请输入订单编号" hasClear />
            </FormItem>
          </Col>
          {/* [2026-06-22 Offline] 产品要求下线商家自寄Tab，统一为揽收编号 */}
          <Col>
            <FormItem label="揽收编号" name="trackingNo">
              <Input placeholder="请输入揽收编号" hasClear />
            </FormItem>
          </Col>
          {/* 原商家自寄场景使用运单编号，已下线:
            type === 'sml' ? (
              <Col>
                <FormItem label="揽收编号" name="trackingNo">
                  <Input placeholder="请输入揽收编号" hasClear />
                </FormItem>
              </Col>
            ) : (
              <Col>
                <FormItem label="运单编号" name="trackingNo">
                  <Input placeholder="请输入运单编号" hasClear />
                </FormItem>
              </Col>
            )
          */}
          <Col className="hgroup-hend">
            <Form.Submit type="primary" onClick={handleSubmit}>
              查询
            </Form.Submit>
            <Form.Reset type="normal" onClick={handleReset}>
              重置
            </Form.Reset>
          </Col>
        </Row>
      </Form>
    </div>
  );
};