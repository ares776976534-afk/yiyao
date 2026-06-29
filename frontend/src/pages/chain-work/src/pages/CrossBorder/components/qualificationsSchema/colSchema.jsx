import React, { useState } from 'react';
import { Button } from '@alifd/next';
const CustomCertificateCell = ({ value }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div className={`${isExpanded ? '' : 'text-ellipsis line-clamp-3'}`}>{value?.join('；')}</div>
      {value?.join('；')?.length > 48 && (
        <button className="cursor-pointer text-[#0077FF]" onClick={toggleExpand}>
          {isExpanded ? '收起' : '展开全部'}
        </button>
      )}
    </div>
  );
};
const CERTIFICATE_NAME = {
  title: '证书名称',
  dataIndex: 'certificateName',
  cell: (value) => <div>{value || '-'}</div>,
};
const CERTIFICATE_TYPE = {
  title: '证书类型',
  dataIndex: 'certificateCategory',
  width: 120,
  cell: (value) => <div>{value || '-'}</div>,
};
const CERTIFICATE_COUNTRY = {
  title: '证书适用国家/地区',
  dataIndex: 'countryNames',
  cell: (value) => <CustomCertificateCell value={value} />,
};

const ASSOCIATED_CERTIFICATE_OPTIONS = {
  title: '操作',
  dataIndex: 'action',
  cell: (value, index, record, others = {}) => {
    const { certificateInfoId } = record;
    const { onActionClick = () => { } } = others;
    return (
      <Button
        type="primary"
        text
        onClick={() => onActionClick({ type: 'unbind', record })}
        data-report-primary-key={certificateInfoId}
        data-report-attribute-clk="@source_2去优化@divert_解绑@funnel_优化任务"
      >解绑
      </Button>
    );
  },
};

const UNASSOCIATED_CERTIFICATE_OPTIONS = {
  title: '操作',
  dataIndex: 'action',
  cell: (value, index, record, others = {}) => {
    const { certificateInfoId } = record;
    const { onActionClick = () => { } } = others;
    return (
      <div>
        <Button
          type="primary"
          text
          className="mr-[12px]"
          onClick={() => onActionClick({ type: 'currentProduct', record })}
          data-report-primary-key={certificateInfoId}
          data-report-attribute-clk="@source_2去优化@divert_关联该商品@funnel_优化任务"
        >关联该商品
        </Button>
        <Button
          type="primary"
          text
          onClick={() => onActionClick({ type: 'categoryProducts', record })}
          data-report-primary-key={certificateInfoId}
          data-report-attribute-clk="@source_2去优化@divert_关联类目商品@funnel_优化任务"
        >关联类目商品
        </Button>
      </div>
    );
  },
};
export default (type) => {
  switch (type) {
    case '1':
      return [CERTIFICATE_NAME, CERTIFICATE_TYPE, CERTIFICATE_COUNTRY, ASSOCIATED_CERTIFICATE_OPTIONS];
    case '2':
      return [CERTIFICATE_NAME, CERTIFICATE_TYPE, CERTIFICATE_COUNTRY, UNASSOCIATED_CERTIFICATE_OPTIONS];
    default:
      return [];
  }
};
