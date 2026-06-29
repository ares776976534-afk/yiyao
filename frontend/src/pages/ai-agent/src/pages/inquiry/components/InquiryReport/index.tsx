import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Layout, message, Spin } from 'antd';
import TaskStatus from './components/TaskStatus';
import DataInsights from './components/DataInsights';
import TaskSummary from './components/TaskSummary';
import SupplierComparison from './components/SupplierComparison';
import AutoOrderInfo from './components/AutoOrderInfo';
import styles from './index.module.css';
import { getTaskProgress, exportTaskReport } from '@/pages/inquiry/services';
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

export interface TypeInquiryReportProps {
  taskId: string;
  onExportReady?: (exportFn: () => Promise<void>) => void;
}

export interface TypeInquiryReportRef {
  exportReport: () => Promise<void>;
}

const InquiryReport = forwardRef<TypeInquiryReportRef, TypeInquiryReportProps>(({ taskId, onExportReady }, ref) => {
  const [data, setData] = useState<TypeSupplierComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!taskId) {
      setIsLoading(false);
      return;
    }

    getTaskProgress({
      taskId,
    }).then(res => {
      const { success = false, data: responseData = {} as TypeSupplierComparisonData, msg = $t("global-1688-ai-app.inquiry.InquiryReport.systemAbnormal", "系统异常") } = res as TypeApiResponse;
      if (!success) {
        message.error(msg);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setData(responseData);
    }).catch(() => {
      setIsLoading(false);
    });
  }, [taskId]);

  const handleToWangwang = (row) => {
    const wangwangId = row?.sellerInfo?.wangwangId.replace(/@cnalichn/, '');
    window.open(`https://air.1688.com/app/ocms-fusion-components-1688/def_cbu_web_im/index.html?touid=cnalichn${wangwangId}&siteid=cnalichn&status=2&portalId=&gid=&offerId=&itemsId#/`, '_blank');
  };

  const handleToOrder = (row) => {
    window.open(`https://air.1688.com/app/ctf-page/trade-order-detail/index.html?orderId=${row?.orderId}`, '_blank');
  };

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
        { text: $t("global-1688-ai-app.inquiry.InquiryReport.xpjl", "询盘记录"), type: 'default', onClick: handleToWangwang }
      ];

      // 只有isBest为true时才显示"查看订单"按钮
      if (supplier?.orderId) {
        actions.unshift({ text: $t("global-1688-ai-app.inquiry.InquiryReport.viewOrder", "查看订单"), type: 'primary', onClick: handleToOrder });
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

  // 从数据中获取 taskId（优先从 supplierCompare 中获取）
  const actualTaskId = data?.supplierCompare?.[0]?.inquiryTaskId || taskId;

  // 导出报告处理函数
  const handleExportReport = useCallback(async () => {
    if (!actualTaskId) {
      message.error($t("global-1688-ai-app.inquiry.InquiryReport.taskIdMissing", "任务ID不存在"));
      return;
    }

    try {
      const res = await exportTaskReport({
        taskId: actualTaskId,
        type: "pdf",
      });

      const { success, data: pdfUrl, msg } = res;
      if (success && pdfUrl) {
        window.open(pdfUrl);
      } else {
        message.error(
          msg ||
          $t(
            "global-1688-ai-app.inquiry.InquiryReport.exportFailed",
            "导出失败"
          )
        );
      }
    } catch (error) {
      message.error($t("global-1688-ai-app.inquiry.InquiryReport.exportFailed", "导出失败，请重试"));
    }
  }, [actualTaskId]);

  // 暴露导出函数给父组件
  useImperativeHandle(ref, () => ({
    exportReport: handleExportReport,
  }));

  // 通过回调函数通知父组件导出函数已准备好
  useEffect(() => {
    if (onExportReady && actualTaskId) {
      onExportReady(handleExportReport);
    }
  }, [onExportReady, actualTaskId, handleExportReport]);

  return (
    <Layout className={styles.inquiryReport}>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin />
        </div>
      ) : (
        <Content className={styles.content}>
          <div className={styles.container}>
            <TaskStatus data={data as any} taskId={taskId || ''} />
            {Array.isArray(data?.aiInsight) && data?.aiInsight?.length > 0 && <DataInsights data={data?.aiInsight} />}
            {data?.aiSummary && <TaskSummary summaryData={data?.aiSummary} />}
            {data?.taskInfo?.isAutoOrder && <AutoOrderInfo autoOrderInfo={data?.autoOrderInfo} />}
            <SupplierComparison
              data={data}
              tableHead={tableHead}
              inquiryAnswers={inquiryAnswers}
            />
          </div>
        </Content>
      )}
    </Layout>
  );
});

InquiryReport.displayName = 'InquiryReport';

export default InquiryReport;

