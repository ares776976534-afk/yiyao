import React from 'react';

const InfoItemList = [
  {
    key: 'submitQualification',
    title: '提交海外仓资质',
    value: '点击下方“立即申请”，提交材料等待审核',
  },
  {
    key: 'payDeposit',
    title: '缴纳保证金',
    value: '保证金需要满足大市场要求',
  },
  {
    key: 'publishProduct',
    title: '发布商品',
    value: '商品发货收货地址需设置为海外、需包邮',
  },
  {
    key: 'checkPrice',
    title: '查看核价结果，及时调价',
    value: '核价通过的商品会有流量加权',
  },
]

export default () => {
  return (
    <div className="flex px-[20px] py-[12px] rounded-[6px] bg-[#fff]">
      {InfoItemList?.map((ele, index) => (
        <div key={ele?.key} className="flex min-w-[279px] w-full">
          <div className="flex bg-[#EBF6FF] rounded-[6px] w-[100%]">
            {index !== 0 && <div className="w-0 h-0 border-l-[16px] border-l-[#FFF] border-t-[31px] border-t-transparent border-b-[31px] border-b-transparent" />}
            <div className="h-[62px] w-full flex flex-col justify-center items-center p-[12px] flex-grow-1">
              <div className="h-[38px] flex flex-col justify-center items-center p-[0px] gap-[4px]">
                <div className="text-[14px] font-medium leading-[17px] text-center tracking-normal text-[#333]">{ele?.title}</div>
                <div className="text-[12px] font-normal leading-[17px] text-center tracking-normal text-[#999]">{ele?.value}</div>
              </div>
            </div>
          </div>
          {index !== InfoItemList?.length - 1 && <div className="w-0 h-0 border-l-[16px] border-l-[#EBF6FF] border-t-[31px] border-t-transparent border-b-[31px] border-b-transparent" />}
        </div>
      ))}
    </div>
  );
};
