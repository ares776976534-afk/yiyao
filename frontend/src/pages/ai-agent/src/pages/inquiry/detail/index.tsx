import { useEffect, useState } from 'react';
import { Layout, message, Spin } from 'antd';
import Header from '../components/Header';
import TaskStatus from './components/TaskStatus';
import DataInsights from './components/DataInsights';
import TaskSummary from './components/TaskSummary';
import SupplierComparison from './components/SupplierComparison';
import styles from './index.module.css';
import { getTaskProgress } from '../services';
import { useSearchParams, definePageConfig } from 'ice';
import LayoutWrapper from '../../select-product/components/Layout';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import AutoOrderInfo from './components/AutoOrderInfo';
import { $t } from '@/i18n';

import type {
  TypeSupplierComparisonData,
  TypeApiResponse,
  TypeProcessSupplierDataResult,
  TypeTableHead,
  TypeSupplierCompare,
  TypeActionButton
} from './types';

const { Content } = Layout;
const headerTitle: Record<string, string> = {
  'FINISHED': $t("global-1688-ai-app.inquiry.detail.xpbg", "询盘报告"),
  'RUNNING': $t("global-1688-ai-app.inquiry.detail.xptaskjz", "询盘任务进展"),
  'QUEUING': $t("global-1688-ai-app.inquiry.detail.xptaskjz", "询盘任务进展"),
};
function InquiryReport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<TypeSupplierComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigateWithScroll();
  const taskId = searchParams.get('taskId');
  useEffect(() => {
    getTaskProgress({
      taskId,
    }).then(res => {
      const { success = false, data = {} as TypeSupplierComparisonData, msg = $t("global-1688-ai-app.inquiry.detail.systemAbnormal", "系统异常") } = res as TypeApiResponse;
      if (!success) {
        message.error(msg);
        return;
      }
      setIsLoading(false);
      setData(data);
    });
  }, []);

  const handleToWangwang = (row) => {
    const wangwangId = row?.sellerInfo?.wangwangId.replace(/@cnalichn/, '');
    window.open(`https://air.1688.com/app/ocms-fusion-components-1688/def_cbu_web_im/index.html?touid=cnalichn${wangwangId}&siteid=cnalichn&status=2&portalId=&gid=&offerId=&itemsId#/`, '_blank');
  }

  const handleToOrder = (row) => {
    window.open(`https://air.1688.com/app/ctf-page/trade-order-detail/index.html?orderId=${row?.orderId}`, '_blank');
  }

  // 处理动态表头和数据
  const processSupplierData = (supplierData: TypeSupplierComparisonData | null): TypeProcessSupplierDataResult => {
    if (!supplierData) return { tableHead: [], inquiryAnswers: [] };
    // 提取表头
    const tableHead = supplierData.tableHead?.map((item: TypeTableHead) => item.cnKey) || [];
    // 处理询盘答案数据
    const inquiryAnswers = supplierData.supplierCompare?.map((supplier: TypeSupplierCompare) => {
      // 按照tableHead的顺序排列answers
      const answers = supplierData.tableHead?.map((header: TypeTableHead) => {
        const answer = supplier.inquiryAnswers?.find((ans) => ans.key === header.key);
        return answer?.value || '-';
      }) || [];

      // 根据isBest决定是否显示"查看订单"按钮
      const actions: TypeActionButton[] = [
        { text: $t("global-1688-ai-app.inquiry.detail.xpjl", "询盘记录"), type: 'default', onClick: handleToWangwang }
      ];

      // 只有isBest为true时才显示"查看订单"按钮
      if (supplier?.orderId) {
        actions.unshift({ text: $t("global-1688-ai-app.inquiry.detail.viewOrder", "查看订单"), type: 'primary', onClick: handleToOrder });
      }
      return {
        ...supplier,
        sellerInfo: supplier.sellerInfo,
        progress: supplier.progress,
        answers: answers,
        actions: actions,
        inquiryAnswers: supplier.inquiryAnswers,
        questionProgress: supplier.questionProgress,
      };
    }) || [];

    return { tableHead, inquiryAnswers };
  };
  const { tableHead, inquiryAnswers } = processSupplierData(data);

  return (
    <LayoutWrapper title={headerTitle[data?.taskInfo?.status || 'QUEUING']} onBack={() => navigate('/inquiry')}>
      {isLoading ? <Spin /> : (
        <Layout className={styles.inquiryReport} >
          {/* <Header title={headerTitle[data?.taskInfo?.status || 'QUEUING']} /> */}
          <Content className={styles.content}>
            <div className={styles.container}>
              <TaskStatus data={data as any} taskId={taskId || ''} />
              {Array.isArray(data?.aiInsight) && data?.aiInsight?.length > 0 && <DataInsights data={data?.aiInsight} />}
              {data?.aiSummary && <TaskSummary summaryData={data?.aiSummary} />}
              {data?.taskInfo?.isAutoOrder && <AutoOrderInfo autoOrderInfo={data?.autoOrderInfo}/>}
              <SupplierComparison
                data={data}
                tableHead={tableHead}
                inquiryAnswers={inquiryAnswers}
              />
            </div>
          </Content>
        </Layout>
      )}
    </LayoutWrapper>
  );
}

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.inquiry.detail.xpbg", "询盘报告"),
  spm: {
    spmB: 'inquiry-report',
  },
});

export default InquiryReport;
