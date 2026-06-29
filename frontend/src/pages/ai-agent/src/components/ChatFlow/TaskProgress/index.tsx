import { useState, useEffect } from 'react';
import style from './index.module.css';
import { PendingIcon, KeywordsIcon } from '@/components/Icon';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Spin, Button } from 'antd';
import { imgIcon } from '../imgIcon';
import { $t } from '@/i18n';

interface TaskProgressProps {
  processStatus?: {
    totalStep: number;
    currentStep: number;
    taskStatus?: string;
    desc?: string;
  };
  AnalyzeMoreKeywords?: () => void;
  isStreaming?: boolean;
  hasRequestError?: boolean;
}

const TaskProgress = (props: TaskProgressProps) => {
  const { processStatus, AnalyzeMoreKeywords = () => { }, isStreaming = false, hasRequestError = false } = props;
  const { totalStep, currentStep, taskStatus = 'SUSPEND', desc } = processStatus || {};
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // 只有在请求失败时才重置按钮状态，成功时保持禁用
    if (hasRequestError && isAnalyzing) {
      setIsAnalyzing(false);
    }
  }, [hasRequestError, isAnalyzing]);

  useEffect(() => {
    // 当任务状态变为进行中或完成时，也重置按钮（说明新的任务开始了）
    if (taskStatus === 'IN_PROGRESS' && isAnalyzing) {
      setIsAnalyzing(false);
    }
  }, [taskStatus, isAnalyzing]);

  const handleNewProductSelection = () => {
    const currentUrl = window.location.href;
    // 不要带参数
    const currentUrlWithoutParams = currentUrl.split('?')[0];
    window.open(currentUrlWithoutParams, '_blank', 'noopener,noreferrer');
  };

  const handleAnalyzeMoreKeywords = () => {
    setIsAnalyzing(true);
    AnalyzeMoreKeywords();
  };
  const statusMap = {
    SUSPEND: (
      <div className={style.statusContent}>
        <PendingIcon />
        <div className={style.pendingTitle}>{$t("global-1688-ai-app.ChatFlow.TaskProgress.dri", "等待用户确认需求")}</div>
      </div>
    ),
    IN_PROGRESS: (
      <div className={style.statusContent}>
        <Spin
          spinning={true}
          indicator={
            <img
              src={imgIcon[6]}
              className={style.loadingSpin}
            />
          }
        />
        <div className={style.statusTitle}>{$t("global-1688-ai-app.ChatFlow.TaskProgress.tnr", `任务进行中：${currentStep}/${totalStep}`, [currentStep, totalStep])}</div>
      </div>
    ),
    COMPLETED: (
      <div className={style.statusSuccessContent}>
        <div className={style.statusContent}>
          <CheckCircleOutlined style={{ color: '#22AC60' }} />
          <div className={style.statusTitle}>{$t("global-1688-ai-app.ChatFlow.TaskProgress.taskCompleted", "任务已完成")}</div>
        </div>
        <div className={style.statusSuccessContentItem}>
          {desc && (
            <>
              <Button
                disabled={isAnalyzing}
                type="link"
                onClick={handleAnalyzeMoreKeywords}
                className={style.statusInfoContent}
              >
                <KeywordsIcon className={style.keywordsIcon} style={{ color: isAnalyzing ? 'var(--text-tertiary-4)' : 'var(--text-accent)'}} />
                <span>{desc}</span>
              </Button>
              <div className={style.statusSuccessContentItemDivider} />
            </>
          )}
          <div
            className={style.statusInfoContent}
            onClick={handleNewProductSelection}
          >
            <PlusOutlined />
            <div className={style.statusSuccessContentItemTitle}>{$t("global-1688-ai-app.ChatFlow.TaskProgress.fqnewxp", "发起新选品")}</div>
          </div>
        </div>
      </div>
    ),
  }

  return (
    <div className={style.taskProgress}>
      <div className={style.statusContainer} style={taskStatus === 'COMPLETED' ? { width: 368 } : {}}>
        {statusMap[taskStatus]}
      </div>
    </div>
  );
};

export default TaskProgress;