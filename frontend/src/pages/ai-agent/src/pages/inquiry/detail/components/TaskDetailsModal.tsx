import { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import styles from './TaskDetailsModal.module.css';
import { getTaskDetail } from '../../services';
import { $t } from '@/i18n';

function TaskDetailsModal({ taskId, isOpen, onClose }: { taskId: string, isOpen: boolean, onClose: () => void }) {
  const [taskDetail, setTaskDetail] = useState<any>(null);
  useEffect(() => {
    getTaskDetail({
      taskId,
    }).then(res => {
      const { data, msg, success } = res || {};
      if (!success) {
        message.error(msg);
        return;
      }
      setTaskDetail(data);
    });
  }, []);
  return (
    <Modal
      title={$t("global-1688-ai-app.inquiry.detail.TaskDetailsModal.taskDetails", "任务详情")}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={760}
      destroyOnHidden
      bodyStyle={{ 
        height: '520px', 
      }}
    >
      <div className={styles.taskDetailsModal}>
        <div>
          <span className={styles.taskDetailsModalTitle}>{$t("global-1688-ai-app.inquiry.detail.TaskDetailsModal.cee", "创建时间：")}</span>
          <span className={styles.taskDetailsModalValue}>{taskDetail?.createTime}</span>
        </div>
        <div className={styles.taskDetailsModalItem}>
          <div className={styles.taskDetailsModalTitle}>{$t("global-1688-ai-app.inquiry.detail.TaskDetailsModal.xpissue", "询盘问题：")}</div>
          {taskDetail?.questionList && (
            <div className={styles.taskDetailsModalContent}>
              {taskDetail?.questionList?.map((item: string) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          )}
        </div>
        <div>
          <span className={styles.taskDetailsModalTitle}>{$t("global-1688-ai-app.inquiry.detail.TaskDetailsModal.endTime", "结束时间：")}</span>
          <span className={styles.taskDetailsModalValue}>{taskDetail?.finishTime}</span>
        </div>
        <div className={styles.taskDetailsModalItem}>
          <div>
            <span className={styles.taskDetailsModalTitle}>{$t("global-1688-ai-app.inquiry.detail.TaskDetailsModal.zce", "自动下单：")}</span>
            <span className={styles.taskDetailsModalValue}>{taskDetail?.autoOrderConfig?.enable ? $t("global-1688-ai-app.inquiry.detail.TaskDetailsModal.yon", "已开启") : $t("global-1688-ai-app.inquiry.detail.TaskDetailsModal.yoff", "已关闭")}</span>
          </div>
          {taskDetail?.autoOrderConfig?.conditions && (
            <div className={styles.taskContent}>
              {taskDetail?.autoOrderConfig?.conditions}
            </div>
          )}
        </div>
        <div>
          <span className={styles.taskDetailsModalTitle}>{$t("global-1688-ai-app.inquiry.detail.TaskDetailsModal.endTime", "结束时间：")}</span>
          <span className={styles.taskDetailsModalValue}>{taskDetail?.finishTime}</span>
        </div>
        <div>
          <span className={styles.taskDetailsModalTitle}>{$t("global-1688-ai-app.inquiry.detail.TaskDetailsModal.qwdgl", "期望订购量：")}</span>
          <span className={styles.taskDetailsModalValue}>{taskDetail?.customConfig?.expectedOrderQuantity}</span>
        </div>
        <div>
          <span className={styles.taskDetailsModalTitle}>{$t("global-1688-ai-app.inquiry.detail.TaskDetailsModal.rvds", "收货地址：")}</span>
          <span className={styles.taskDetailsModalValue}>{taskDetail?.customConfig?.receiveAddress}</span>
        </div>
      </div>
    </Modal>
  );
};
  
export default TaskDetailsModal;