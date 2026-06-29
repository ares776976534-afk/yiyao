import { useEffect, useState } from 'react';
import { getExchangeQuota } from '../../services';
import { ThreeSegmentProgress } from './ThreeSegmentProgress';
import { CreditCard } from './CreditOverview/CreditCard';

import ExchangeRecord from './ExchangeRecord';
import { FilterState } from '../types';
import { $t } from '@/i18n';


export const ExchangeQuota = () => {
  const [creditData, setCreditData] = useState<{
    costToken: string;
    expiredToken: string;
    remainAvailableToken: string;
    remainUnAvailableToken: string;
    totalObtainToken: string;
  }>({
    costToken: '0',
    expiredToken: '0',
    remainAvailableToken: '0',
    remainUnAvailableToken: '0',
    totalObtainToken: '0',
  });


  const [filters, setFilters] = useState<FilterState>({
    apiName: '',
    requestId: '',
    dateRange: null,
  });

  const {
    costToken,
    remainAvailableToken,
    remainUnAvailableToken,
    totalObtainToken,
  } = creditData;
  console.log(creditData);
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    getExchangeQuota({
      scene: 'marco',
    },
    ).then((res) => {
      const { success, data, retMsg } = res;
      if (success) {
        setCreditData(data);
      } else {
        console.log(retMsg);
      }
    });
  }, []);

  return (
    <div>
      <div
        className="text-base font-semibold leading-[26px] text-[rgba(0,0,0,0.87)]"
      >{$t("global-1688-ai-app.seller-center.credit-management.ExchangeQuota.Mlm", "Marco大模型翻译")}</div>

      <div className="border-t border-[rgba(0,0,0,0.04)] w-full mt-[18px]" />

      <div className="text-sm font-normal leading-5 tracking-normal text-[rgba(0,0,0,0.87)]">
        <span>{$t("global-1688-ai-app.seller-center.credit-management.ExchangeQuota.gj", "共计")}</span>
        <span
          className="font-[Alibaba Sans 102] text-[32px]
                    font-bold leading-[56px] text-center tracking-normal
                    text-[rgba(0,0,0,0.87)] ml-1 mr-1"
        >{totalObtainToken}</span>
        <span>{$t("global-1688-ai-app.seller-center.credit-management.ExchangeQuota.zfs", "字符数")}</span>
      </div>

      <div className="mt-4">
        <ThreeSegmentProgress
          value1={Number(costToken) || 0}
          value2={Number(remainUnAvailableToken) || 0}
          value3={Number(remainAvailableToken) || 0}
          color1="linear-gradient(92deg, #A0EDC2 12%, #72E5A5 94%)"
          color2="linear-gradient(90deg, #66AFFA 0%, #3391FD 99%)"
          color3="linear-gradient(90deg, #F1F3FF 84%, #EBEDFF 99%)"
          height={4}
          borderRadius={50}
        />
      </div>

      <div
        className="text-xs font-normal leading-[18px] tracking-normal text-[rgba(0,0,0,0.4)] mt-2"
      >{$t("global-1688-ai-app.seller-center.credit-management.ExchangeQuota.ysiz", `已使用${costToken}字符数，剩余${remainAvailableToken}字符数`, [costToken, remainAvailableToken])}</div>

      <div className="flex gap-[16px] mt-12">
        <CreditCard
          value={remainUnAvailableToken}
          label={$t("global-1688-ai-app.seller-center.credit-management.ExchangeQuota.syz", "使用中")}
          background="linear-gradient(104deg, #ECFCF0, #F5FFF8)"
          borderColor="#A9EDB9"
        />

        <CreditCard
          value={costToken}
          label={$t("global-1688-ai-app.seller-center.credit-management.ExchangeQuota.ysy", "已使用")}
          background="linear-gradient(105deg, #EFF7FD, #F3F9FF)"
          borderColor="#66AFFA"
        />

        <CreditCard
          value={remainAvailableToken}
          label={$t("global-1688-ai-app.seller-center.credit-management.ExchangeQuota.remaining", "剩余")}
          background="#FAFAFA"
          borderColor="#E7E8EE"
        />
      </div>


      <div className="flex items-center py-7 pb-6 border-b border-[#0000000A]">
        <h2 className="text-2xl font-medium leading-9 text-[#000000DE]">{$t("global-1688-ai-app.seller-center.credit-management.ExchangeQuota.yldetails", "用量详情")}</h2>
        <span className="text-sm font-normal leading-[22px] text-[#7B7B8D] ml-4">{$t("global-1688-ai-app.seller-center.credit-management.ExchangeQuota.vdeeht", "查看您的API服务使用情况和消耗明细")}</span>
      </div>

      <ExchangeRecord
        filters={filters}
        onFilterChange={handleFilterChange}
      />

    </div>
  );
};