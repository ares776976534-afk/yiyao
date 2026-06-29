import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';
import { InfoCircleOutlined, CloseOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';


const Alter = (props) => {
  const { closeAlter, reviewStatus = '', rejectReason = '' } = props;
  return (
    <div>
      {/* 入驻申请 */}
      {['UNREGISTER', 'UNREGISTER_DRAFT', 'UNDER_REVIEW'].includes(reviewStatus) && (
        <div className="alter-wrapper px-[12px] py-[9px] rounded-[6px] bg-[#EBF6FF] flex flex-row items-center justify-between">
          <div className="flex flex-row items-center flex-1 gap-x-[8px]">
            <InfoCircleOutlined style={{ fontSize: '16px', color: '#0077FF' }} />
            {['UNREGISTER', 'UNREGISTER_DRAFT'].includes(reviewStatus) && <div className="text-[14px] font-normal leading-[22px] text-[#666]">请提交以下信息供小二审核，仅资质审核通过后海外仓商品才可对外售卖。</div>}
            {reviewStatus === 'UNDER_REVIEW' && <div className="text-[14px] font-normal leading-[22px] text-[#0077FF]">入驻申请审核中。</div>}
          </div>
          <div>
            <CloseOutlined style={{ fontSize: '16px', color: '#bbb' }} onClick={closeAlter} />
          </div>
        </div>
      )}
      {/* 审核未通过 */}
      {reviewStatus === 'REJECT' && (
        <div className="alter-wrapper px-[12px] py-[12px] rounded-[6px] bg-[#FFF2ED]">
          <div className="flex flex-row items-center gap-x-[8px]">
            <CloseCircleOutlined className="text-[#FB3B20] text-[16px]" />
            <div className="text-[14px] font-bold leading-[22px] text-[#333]">海外仓入驻申请审核未通过，请重新提交申请。</div>
          </div>
          <div className="text-[14px] font-normal leading-[22px] text-[#666] mt-[8px]">
            {rejectReason || '可能原因：提交的资质材料不完整或不符合要求；企业经营范围与海外仓业务不匹配；其他业务合规性问题。'}
          </div>
        </div>
      )}
      {/* 审核通过 */}
      {reviewStatus === 'PASS' && (
        <div className="alter-wrapper px-[12px] py-[9px] rounded-[6px] bg-[#ECF7EC] flex flex-row items-center justify-between">
          <div className="flex flex-row items-center flex-1 gap-x-[8px]">
            <CheckCircleOutlined style={{ fontSize: '16px', color: '#3BB347' }} />
            <div className="text-[14px] font-normal leading-[22px] text-[#666]">入驻申请审核通过。</div>
          </div>
          <div>
            <CloseOutlined style={{ fontSize: '16px', color: '#bbb' }} onClick={closeAlter} />
          </div>
        </div>
      )}

    </div>
  )
};

export default Alter;