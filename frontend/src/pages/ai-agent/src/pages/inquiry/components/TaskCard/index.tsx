import { useNavigate } from 'ice';
import { AddIcon, DeleteIcon, FinishedIcon, RunningIcon, QueuingIcon } from '@/components/Icon';
import styles from './index.module.css';
import { $t } from '@/i18n';
import InquiryTaskMask from '../InquiryTaskMask';
import { useChatHistory } from '@/pages/select-product/components/ChatHistory/useChatHistory';
import jumpTo from '@/utils/jumpTo';
import { stopTask } from '@/pages/inquiry/services';
import { message } from 'antd';
import EndMissionModal from '../EndMissionModal';
import { useState } from 'react';

import { appVersionType, AppVersionType } from '@/utils/env';

const isGlobal = appVersionType === AppVersionType.GLOBAL;

interface TaskCardProps {
  taskId?: string;
  status?: string;
  name?: string;
  type?: string;
  createTime?: string;
  itemInfo?: {
    imgUrl?: string; // 如果是图片上传，就是图片，否则就是商品主图
    offerId?: string; // 商品id type = ITEM_LINK 时使用
    title?: string; // 商品标题type = ITEM_LINK 时使用
  };
  supplierCnt?: number; // 供应商
  isReportFinished?: boolean;
  isCreateNew?: boolean;
  getTaskListData?: (params: { pNum: number; pSize: number, status?: any }) => void;
  activeFilter?: any;
}

const TaskCard = ({
  taskId,
  status,
  name,
  type,
  createTime,
  itemInfo,
  supplierCnt, // 供应商
  isReportFinished,
  isCreateNew,
  getTaskListData,
  activeFilter,
}: TaskCardProps) => {
  const { navigateToChatHistory } = useChatHistory();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
  };
  if (isCreateNew) {
    const handleClick = () => {
      navigate('/inquiry/new');
    };
    return (
      <div className={styles.createCard}>
        <div className={styles.createContent} onClick={handleClick}>
          <AddIcon style={{ width: '15px', height: '15px', color: '#7B7B8D' }} />
          <span className={styles.createText}>{$t("global-1688-ai-app.inquiry.TaskCard.cds", "创建新的询盘任务")}</span>
        </div>
      </div>
    );
  }

  const getStatusConfig = (statusValue) => {
    switch (statusValue) {
      case 'FINISHED':
        return {
          color: '#2CBCC1',
          icon: (
            <FinishedIcon style={{ width: '12px', height: '12px' }} />
          ),
          label: $t("global-1688-ai-app.inquiry.TaskCard.xpend", "询盘结束"),
          buttonText: $t("global-1688-ai-app.inquiry.TaskCard.viewxpbg", "查看询盘报告"),
          buttonType: isReportFinished ? 'primary' : 'default',
        };
      case 'RUNNING':
        return {
          color: '#6E50FF',
          icon: (
            <RunningIcon style={{ width: '12px', height: '12px' }} />
          ),
          label: $t("global-1688-ai-app.inquiry.TaskCard.xrs", "询盘进行中"),
          buttonText: $t("global-1688-ai-app.inquiry.TaskCard.viewTaskjz", "查看任务进展"),
          buttonType: 'default',
        };
      case 'QUEUING':
        return {
          color: '#7C7F9A',
          icon: (
            <QueuingIcon style={{ width: '12px', height: '12px' }} />
          ),
          label: $t("global-1688-ai-app.inquiry.TaskCard.ddstart", "等待开始"),
          buttonText: $t("global-1688-ai-app.inquiry.TaskCard.viewTaskjz", "查看任务进展"),
          buttonType: 'default',
        };
      case 'STOP':
        return {
          color: '#FF4000',
          icon: (<DeleteIcon style={{ width: '12px', height: '12px', color: '#FF4000' }} />),
          label: $t("global-1688-ai-app.inquiry.TaskCard.ystop", "已停止"),
          buttonText: $t("global-1688-ai-app.inquiry.TaskCard.viewxpbg", "查看询盘报告"),
          buttonType: isReportFinished ? 'primary' : 'default',
        };
      case 'REPORTING':
        return {
          color: '#6E50FF',
          icon: <RunningIcon style={{ width: '12px', height: '12px' }} />,
          label: '终止任务中...',
          buttonText: $t("global-1688-ai-app.inquiry.TaskCard.viewDetails", "查看详情"),
          buttonType: 'default',
        };
      default:
        return {
          color: '#7B7B8D',
          icon: (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="6" r="5" stroke="#7B7B8D" strokeWidth="1" />
              <path d="M6 3V6L8 8" stroke="#7B7B8D" strokeWidth="1" strokeLinecap="round" />
            </svg>
          ),
          label: $t("global-1688-ai-app.inquiry.TaskCard.wz", "未知"),
          buttonText: $t("global-1688-ai-app.inquiry.TaskCard.viewDetails", "查看详情"),
          buttonType: 'default',
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const handleOk = () => {
    if (taskId) {
      stopTask({
        taskId,
      }).then((res) => {
        const { success, msg = '系统异常' } = res;
        if (success) {
          setOpen(false);
          getTaskListData?.({
            pNum: 1,
            pSize: 10,
            status: activeFilter,
          });
        } else {
          message.error(msg);
        }
      }).catch((err) => {
        message.error(err?.message || '请求失败，请稍后重试');
      });
    }
  }
  const onEndTask = () => {
    setOpen(true);
  }; 
  const onCopyTask = () => {
    if (taskId) {
      jumpTo(`/inquiry?fromPage=ZS&taskId=${taskId}`);
    }
  };
  const onViewDetail = () => {
    if (taskId) {
      navigateToChatHistory('/inquiry', taskId || '');
    }
  };
  return (
    <div className={styles.taskCard}>
      <h3 className={styles.taskTitle}>
        {name}
      </h3>
      <div className={styles.cardContent}>
        <div className={styles.leftContent}>
          <div className={styles.statusSection}>

            <div className={styles.taskInfo}>
              <div className={styles.taskMeta}>
                <span className={styles.metaText}>{$t("global-1688-ai-app.inquiry.TaskCard.cj", `${createTime || ''}创建`, [createTime || ''])}</span>
                {/* <span className={styles.separator} />
                <span className={styles.metaText}>
                  {supplierCnt}个供应商
                </span> */}
              </div>
            </div>

            <div className={styles.statusTag}>
              {status !== 'FinishedIcon' && status !== 'RunningIcon' && statusConfig.icon}
              {status === 'RunningIcon' && <img className={styles.statusIcon} src="https://img.alicdn.com/imgextra/i1/O1CN01oy9HpZ1auDN81cuXo_!!6000000003389-2-tps-48-48.png" alt="" />}
              {status === 'FinishedIcon' && <img className={styles.statusIcon} src="https://img.alicdn.com/imgextra/i1/O1CN01aMIzuQ1byAPCKcfUo_!!6000000003533-2-tps-48-48.png" alt="" />}
              <span style={{ color: statusConfig.color }}>{statusConfig.label}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.inquiryTaskMask}>
        <InquiryTaskMask status={status} onEndTask={onEndTask} onCopyTask={onCopyTask} onViewDetail={onViewDetail} />
      </div>
      {itemInfo?.imgUrl && (
        <div className={`${styles.imageContainer} ${isGlobal ? styles.globalImageContainer : styles.cnImageContainer}`}>
          <img
            src={itemInfo.imgUrl}
            alt={$t("global-1688-ai-app.inquiry.TaskCard.taskImage", "任务图片")}
            className={styles.taskImage}
          />
        </div>
      )}
      <EndMissionModal open={open} onClose={onClose} handleOk={handleOk} />
    </div>
  );
};

export default TaskCard;