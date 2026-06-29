import React, { useState } from 'react';
import { Grid, Menu, Button, Dropdown, Icon } from '@alifd/next';
import PartLayout from '../PartLayout';
import './index.scss';

const { Row, Col } = Grid;


export default (props) => {
  const { address = {}, onChange = () => {}, addressList = [] } = props;

  const { sendInfo = {}, receiveInfo = {} } = address;
  const ModifyAddress = () => {
    const [selectedItem, setSelectedItem] = useState(sendInfo?.addressId);
    const onClickItem = (ele, index) => {
      setSelectedItem(index);
      onChange(ele);
    };
    const menu = (
      <Menu>
        {addressList.map((ele) => {
          const { name, phone, addressId, city, county, province, street } = ele;
          return (
            <Menu.Item onClick={() => onClickItem(ele, addressId)} disabled={!street}>
              <div className="flex justify-between">
                <div className="leading-[22px]">
                  <div className="text-[16px]">{name} <span className="text-[14px]">{phone}</span></div>
                  <div className="text-[14px]">
                    {province} {city} {county} {street} {ele.address}
                  </div>
                </div>
                {selectedItem === addressId && <Icon type="select" className="text-[#06f]" />}
                {!street && <div className="text-[14px] text-[#FF7300]"><Icon type="warning" />地址街道缺失</div>}
              </div>
            </Menu.Item>
          );
        })}
      </Menu>
    );
    const onClick = () => {
      window.open('https://wuliu.1688.com/foundation/send_goods_address_manage.htm?spm=a2dml.20853291.0.0.a96a7e8ebQ6zy8', '_blank');
    };
    return (
      <div>
        <Dropdown
          trigger={<Button className="icon-style" type="primary" text>修改地址<Icon type="arrow-down" /></Button>}
          triggerType="click"
        >
          <div className="flex flex-col max-h-[350px] bg-[#fff] justify-between w-[500px]">
            <div className="pt-[20px]">
              <div className="overflow-auto shadow-none next-menu max-h-[254px]">{menu}</div>
            </div>
            <div className="p-[20px] text-[14px] text-[#0077ff] cursor-pointer" onClick={onClick}><Icon type="add" />修改或添加地址</div>
          </div>
        </Dropdown>
      </div>
    );
  };

  return (
    <div className="address-info-container">
      <div className="address-info-item">
        <PartLayout title="发货地址" subTitle={<ModifyAddress />}>
          <div className="address-info-content">
            <div className="content-item">
              <Row>
                <Col fixedSpan={4}>
                  <span className="title">发件人：</span>
                </Col>
                <Col>
                  <span className="content">{sendInfo.name}</span>
                </Col>
              </Row>
            </div>
            <div className="content-item">
              <Row>
                <Col fixedSpan={4}>
                  <span className="title">发货地址：</span>
                </Col>
                <Col>
                  <span className="content">{sendInfo.province} {sendInfo.city} {sendInfo.county} {sendInfo.street} {sendInfo.address}</span>
                </Col>
              </Row>
            </div>
            <div className="content-item">
              <Row>
                <Col fixedSpan={4}>
                  <span className="title">联系方式：</span>
                </Col>
                <Col>
                  <span className="content">{sendInfo.phone}</span>
                </Col>
              </Row>
            </div>
          </div>
        </PartLayout>
      </div>
      <div className="address-info-item">
        <PartLayout title="收货地址（仓库）">
          <div className="address-info-content">
            <div className="content-item">
              <Row>
                <Col fixedSpan={4}>
                  <span className="title">收件人：</span>
                </Col>
                <Col>
                  <span className="content">{receiveInfo.name}</span>
                </Col>
              </Row>
            </div>
            <div className="content-item">
              <Row>
                <Col fixedSpan={4}>
                  <span className="title">收货地址：</span>
                </Col>
                <Col>
                  <span className="content">{receiveInfo.province} {receiveInfo.city} {receiveInfo.county} {receiveInfo.street} {receiveInfo.detailAddressContext}</span>
                </Col>
              </Row>
            </div>
            <div className="content-item">
              <Row>
                <Col fixedSpan={4}>
                  <span className="title">联系方式：</span>
                </Col>
                <Col>
                  <span className="content">{receiveInfo.phone}</span>
                </Col>
              </Row>
            </div>
          </div>
        </PartLayout>
      </div>
    </div>
  );
};
