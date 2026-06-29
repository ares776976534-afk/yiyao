import React, { useState } from 'react';
import { Button, Divider } from 'antd';
import { InputIcon, QuestionnaireIcon, LoadIcon, TimeIcon } from '@/components/Icon';
import styles from './TaskStatus.module.css';
import type { TypeTaskStatusProps, TaskStatus as TaskStatusType } from './TaskStatus.types';
import CountDown from './CountDown';
import TaskDetailsModal from './TaskDetailsModal';
import { $t } from '@/i18n';


// 状态配置常量
const STATUS_CONFIG = {
  FINISHED: {
    containerClass: styles.taskStatus,
    dividerClass: styles.divider,
    title: $t("global-1688-ai-app.inquiry.detail.TaskStatus.taskCompleted", "任务已完成"),
    titleClass: styles.statusTitle,
    color: '#22ac60',
    icon: QuestionnaireIcon,
    description: undefined,
  },
  RUNNING: {
    containerClass: styles.taskStatusRunning,
    dividerClass: styles.dividerRunning,
    title: $t("global-1688-ai-app.inquiry.detail.TaskStatus.taskInprogress", "任务进行中"),
    titleClass: styles.statusTitleRunning,
    color: '#6150FF',
    icon: LoadIcon,
  },
  QUEUING: {
    containerClass: styles.taskStatusUpcoming,
    dividerClass: styles.dividerUpcoming,
    title: $t("global-1688-ai-app.inquiry.detail.TaskStatus.pdz", "排队中"),
    titleClass: styles.statusTitleUpcoming,
    color: '#7B7B8D',
    icon: TimeIcon,
  },
  STOP: {
    containerClass: styles.taskStatusUpcoming,
    dividerClass: styles.dividerUpcoming,
    title: $t("global-1688-ai-app.inquiry.detail.TaskStatus.taskStop", "任务停止"),
    titleClass: styles.statusTitleUpcoming,
    color: '#7B7B8D',
    icon: TimeIcon,
  },
} as const;

// 状态图标组件
const StatusIcon: React.FC<{ status: TaskStatusType }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.QUEUING;

  if (status === 'FINISHED' && config.icon) {
    const IconComponent = config.icon;
    return <IconComponent className={styles.statusIcon} style={{ color: config.color, width: '20px', height: '20px' }} />;
  }

  if (status === 'RUNNING' && config.icon) {
    const IconComponent = config.icon;
    return <IconComponent style={{ color: config.color, width: '20px', height: '20px' }} />;
  }

  return <TimeIcon />;
};

// 状态标题组件
const StatusTitle: React.FC<{ status: TaskStatusType, finishTime?: string }> = ({ status, finishTime }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.QUEUING;

  if (status === 'FINISHED') {
    return <span className={config.titleClass}>{config.title}</span>;
  }

  const containerClass = status === 'RUNNING'
    ? styles.statusTitleRunningContainer
    : styles.statusTitleUpcomingContainer;
  return (
    <div className={containerClass}>
      <span className={config.titleClass}>{config.title}</span>
      {status === 'QUEUING' && <span className={styles.statusTitleRunningText}>{$t("global-1688-ai-app.inquiry.detail.TaskStatus.ddscyjtn", "当前询盘通道正忙，任务已进入处理队列，系统将很快按顺序为您发出")}</span>}
      {status === 'RUNNING' && finishTime && <span className={styles.statusTitleUpcomingText}>
        <CountDown endTime={finishTime} countDownEnd={() => { }}>
          {
            ({
              day,
              hour,
              min,
              second,
            }) => {
              return <span className="text-[12px] text-[#FF7300] leading-[12px]">{$t("global-1688-ai-app.inquiry.detail.TaskStatus.hend", `${hour}:${min}:${second}后结束`, [hour, min, second])}</span>;
            }
          }
        </CountDown>
      </span>}
    </div>
  );
};

// 任务元数据组件
const TaskMeta: React.FC<{ data }> = ({ data }) => (
  <div className={styles.taskMeta}>
    {
      data?.taskInfo?.isAutoOrder && (
        <div className={styles.autoOrderTag}>
          <img
            src="https://img.alicdn.com/imgextra/i2/6000000003917/O1CN019WeNuK1eo2TTjvGwX_!!6000000003917-2-gg_dtc.png"
            alt={$t("global-1688-ai-app.inquiry.detail.TaskStatus.zce", "自动下单")}
            className={styles.autoOrderIcon}
          />
          <span className={styles.autoOrderText}>{$t("global-1688-ai-app.inquiry.detail.TaskStatus.yPo", "已开启自动下单")}</span>
          <div className={styles.metaDivider} />
        </div>
      )
    }
    <span className={styles.metaText}>{$t("global-1688-ai-app.inquiry.detail.TaskStatus.gxpissue", `${data?.taskInfo?.questionNum}个询盘问题`, [data?.taskInfo?.questionNum])}</span>
    <div className={styles.metaDivider} />
    <span className={styles.metaText}>{$t("global-1688-ai-app.inquiry.detail.TaskStatus.ggys", `${data?.taskInfo?.supplierNum}个供应商`, [data?.taskInfo?.supplierNum])}</span>
  </div>
);

function TaskStatus({ data, taskId }: TypeTaskStatusProps) {
  const rawStatus = (data?.taskInfo?.status === 'FINISHED' && !data?.isReport ? 'RUNNING' : data?.taskInfo?.status) || 'QUEUING';
  const status = (rawStatus as TaskStatusType) || 'QUEUING';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.QUEUING;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div className={config.containerClass}>
      {/* 状态头部 */}
      <div className={styles.statusHeader}>
        <div className={styles.statusLeft}>
          <StatusIcon status={status} />
          <StatusTitle status={status} finishTime={data?.taskInfo?.finishTime} />
        </div>
        {status === 'FINISHED' && data?.taskInfo?.finishTime && (
          <span className={styles.completionTime}>{$t("global-1688-ai-app.inquiry.detail.TaskStatus.cem", `完成时间:${data.taskInfo.finishTime}`, [data.taskInfo.finishTime])}</span>
        )}
      </div>

      <Divider className={config.dividerClass} />

      {/* 任务内容 */}
      <div className={styles.taskContent}>
        <div className={styles.taskLeft}>
          <img
            src={data?.taskInfo?.img}
            alt={$t("global-1688-ai-app.inquiry.detail.TaskStatus.taskImage", "任务图片")}
            className={styles.taskImage}
          />
          <div className={styles.taskInfo}>
            <div className={styles.taskNameRow}>
              <span className={styles.taskName}>
                {data?.taskInfo?.title}
              </span>
            </div>
            <TaskMeta data={data} />
            {data?.taskInfo?.createTime && (
              <span className={styles.createTime}>{$t("global-1688-ai-app.inquiry.detail.TaskStatus.cj", `${data?.taskInfo?.createTime}创建`, [data?.taskInfo?.createTime])}</span>
            )}
          </div>
        </div>
        <Button className={styles.detailButton} onClick={showModal}>
          <span className={styles.detailButtonText}>{$t("global-1688-ai-app.inquiry.detail.TaskStatus.viewTaskDetails", "查看任务详情")}</span>
        </Button>
      </div>
      <TaskDetailsModal taskId={taskId} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default TaskStatus;