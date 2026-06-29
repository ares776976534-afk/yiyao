import React from 'react';
import { Balloon, Icon } from '@alifd/next';
import { SCHEMA_SELECT } from '@/components/CommonTable/contanst';
import { queryAreaInfo } from '@/service/common';
import { MANUFACTURER_INFO } from '@/components/schema/ManufactureInfoManagement';

const PROHIBITED_COUNTRY = {
  name: '禁售国家/地区',
  key: 'prohibitedAreaList',
  type: SCHEMA_SELECT,
  tip: (
    <Balloon
      v2
      trigger={
        <Icon type="help" size="small" style={{ marginLeft: '4px' }} />
      }
      align="t"
      triggerType="hover"
      title="title"
      style={{ width: 300 }}
      offset={[0, 18]}
    >
      产品补充
    </Balloon>
  ),
  opt: {
    placeholder: '请选择',
    hasClear: true,
    mode: 'multiple',
    size: 'large',
    style: { borderRadius: '6px' },
    showSearch: true,
  },
  fetchData: () => queryAreaInfo({ queryType: 1, name: 'manufacturerAddress' }),
};

export default (status, currentChecked) => {
  const OTHERS = {
    key: 'others',
    children: (
      <div>
        <div className="flex items-center flex-row p-[9px_12px] gap-[8px] h-[40px] rounded-[6px] bg-[#E6F2FF] mb-[20px] mt-[12px]">
          <Icon type="ic_info" style={{ color: '#0077FF' }} size="small" />
          <span>批量设置生效后会覆盖已设置的信息，请谨慎操作。</span>
        </div>
        <div className="mb-[8px]">已选商品：{currentChecked?.length}个</div>
      </div>
    ),
  };
  switch (status) {
    case 'country':
      return [OTHERS, PROHIBITED_COUNTRY];
    case 'info':
      return [OTHERS, MANUFACTURER_INFO];
    default:
      return [];
  }
};
