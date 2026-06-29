import React from 'react';
import ColInfo from '@/pages/ManufacturerInfo/components/ColInfo';
import { SCHEMA_SELECT } from '@/components/CommonTable/contanst';
import { queryAllManufacturerDetailsByUserId } from '@/service/common';

export default (record) => {
  const { picUrl, title, itemId, price, manufacturerInfoDO, manufacturerId } = record || {};
  const OTHERS = {
    key: 'others',
    children: (
      <div className="mt-[20px]">
        <div className="text-[#666] text-[14px]">商品信息</div>
        <ColInfo
          url={picUrl}
          title={title}
          id={itemId}
        >
          <div className="mt-[4px]">¥ {price}</div>
        </ColInfo>
      </div>
    ),
  };
  const MANUFACTURER_INFO = {
    name: '选择制造商信息',
    key: 'manufacturerId',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      size: 'large',
      style: { borderRadius: '6px' },
      initValue: manufacturerId,
      showSearch: true,
    },
    fetchData: () => queryAllManufacturerDetailsByUserId(),
  };
  return [OTHERS, MANUFACTURER_INFO];
};
