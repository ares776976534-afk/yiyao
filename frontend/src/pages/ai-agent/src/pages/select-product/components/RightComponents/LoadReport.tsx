import { Spin } from 'antd';
import { $t } from '@/i18n';

export const LoadReport = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-[282px]">
        <Spin />
        <span className="text-[12px] text-[#7B7B8D] mt-[12px]">{$t("global-1688-ai-app.select-product.RightComponents.LoadReport.bcd", "报告正在生成中，请耐心等待")}</span>
    </div>
  );
};