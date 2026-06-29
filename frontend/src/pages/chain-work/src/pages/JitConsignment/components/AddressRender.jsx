import React from 'react';
import Clipboard from '@/components/ClipBoard';
import { Icon } from '@alifd/next';
import '../index.scss';

const AddressRender = ({ handoverAddress = {} }) => {
  const { warehouseName, provinceName, cityName, areaName, townName, detailAddress, contactorName, mobile } = handoverAddress;
  return (
    <>
      <span className="mr-[16px]">{warehouseName}</span>
      <span className="mr-[16px]">{provinceName} {cityName} {areaName} {townName} {detailAddress}</span>
      <span className="mr-[12px]">{contactorName} {mobile}</span>
      <Clipboard text={`${provinceName} ${cityName} ${areaName} ${townName} ${detailAddress} ${contactorName} ${mobile}`} >
        <Icon type="copy" className="text-[#BBB]" />
      </Clipboard>
    </>
  );
};
export default AddressRender;
