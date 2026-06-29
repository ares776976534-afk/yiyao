import { useMemo, useEffect } from 'react';
import { Layout, message } from 'antd';
import TaskStatus from '../../InquiryReport/components/TaskStatus';
import DataInsights from '../../InquiryReport/components/DataInsights';
import TaskSummary from '../../InquiryReport/components/TaskSummary';
import SupplierComparison from '../../InquiryReport/components/SupplierComparison';
import AutoOrderInfo from '../../InquiryReport/components/AutoOrderInfo';
import styles from '../../InquiryReport/index.module.css';
import { exportTaskReport } from '@/pages/inquiry/services';
import { $t } from '@/i18n';
import type {
  TypeSupplierComparisonData,
  TypeProcessSupplierDataResult,
  TypeTableHead,
  TypeSupplierCompare,
  TypeActionButton
} from '../../InquiryReport/types';

const { Content } = Layout;

interface TypeReportContentProps {
  detail?: TypeSupplierComparisonData;
  cardId?: string;
  readonly?: boolean;
  title?: string;
  onExportReady?: (exportFn: () => Promise<void>) => void;
}

function ReportContent({ detail, cardId, readonly, title, onExportReady }: TypeReportContentProps) {
  const handleToWangwang = (row) => {
    const wangwangId = row?.sellerInfo?.wangwangId.replace(/@cnalichn/, '');
    window.open(`https://air.1688.com/app/ocms-fusion-components-1688/def_cbu_web_im/index.html?touid=cnalichn${wangwangId}&siteid=cnalichn&status=2&portalId=&gid=&offerId=&itemsId#/`, '_blank');
  };

  const handleToOrder = (row) => {
    window.open(`https://air.1688.com/app/ctf-page/trade-order-detail/index.html?orderId=${row?.orderId}`, '_blank');
  };

  // 处理动态表头和数据
  const processSupplierData = (supplierData: TypeSupplierComparisonData | null | undefined): TypeProcessSupplierDataResult => {
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
        { text: $t("global-1688-ai-app.inquiry.FormatList.RightComponents.ReportContent.xpjl", "询盘记录"), type: 'default', onClick: handleToWangwang }
      ];

      // 只有isBest为true时才显示"查看订单"按钮
      if (supplier?.orderId) {
        actions.unshift({ text: $t("global-1688-ai-app.inquiry.FormatList.RightComponents.ReportContent.viewOrder", "查看订单"), type: 'primary', onClick: handleToOrder });
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

  const { tableHead, inquiryAnswers } = useMemo(() => {
    return processSupplierData(detail);
  }, [detail]);

  // 从 detail 中提取 taskId（从 supplierCompare 的第一个元素的 inquiryTaskId）
  const taskId = detail?.supplierCompare?.[0]?.inquiryTaskId || cardId || '';

  // 导出报告处理函数（使用与 InquiryReport 相同的逻辑）
  const handleExportReport = async () => {
    if (!taskId) {
      message.error($t("global-1688-ai-app.inquiry.InquiryReport.taskIdMissing", "任务ID不存在"));
      return;
    }

    try {
      const res = await exportTaskReport({
        taskId,
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
  };

  // 通知父组件导出函数已准备好
  useEffect(() => {
    if (onExportReady && taskId) {
      onExportReady(handleExportReport);
    }
  }, [onExportReady, taskId]);

  return (
    <Layout className={styles.inquiryReport}>
      <Content className={styles.content}>
        <div className={styles.container}>
          <TaskStatus data={detail as any} taskId={taskId} />
          {Array.isArray(detail?.aiInsight) && detail?.aiInsight?.length > 0 && <DataInsights data={detail?.aiInsight} />}
          {detail?.aiSummary && <TaskSummary summaryData={detail?.aiSummary} />}
          {detail?.taskInfo?.isAutoOrder && <AutoOrderInfo autoOrderInfo={detail?.autoOrderInfo} />}
          <SupplierComparison
            data={detail}
            tableHead={tableHead}
            inquiryAnswers={inquiryAnswers}
          />
        </div>
      </Content>
    </Layout>
  );
}

export default ReportContent;

