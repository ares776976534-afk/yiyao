import { useState, useEffect } from 'react';
import style from './taskProgress.module.scss';
import { PendingIcon, KeywordsIcon } from '@/components/Icon';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Spin, Button } from 'antd';
import { imgIcon } from "@/components/ChatFlow/imgIcon";

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
      <div className={style.statusContainer}>
        <div className={style.statusContent}>
          <PendingIcon />
          <div className={style.pendingTitle}>等待用户确认需求</div>
        </div>
      </div>
      
    ),
    IN_PROGRESS: (
      <div className={style.statusContainer}>
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
          <div className={style.statusTitle}>{`任务进行中：${currentStep}/${totalStep}`}</div>
        </div>
      </div>
    ),
    COMPLETED: (
      <div className={style.statusSuccessContent}>
        <div className={style.statusSuccessContentbg} />
        <div className={style.statusContainer} style={{ marginBottom: 0 }}>
          <div className={style.statusCompletedRow}>
            <CheckCircleOutlined style={{ color: '#22AC60' }} />
            <div className={style.statusTitle}>任务已完成</div>
          </div>
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
            <div className={style.statusSuccessContentItemTitle}>发起新选品</div>
          </div>
        </div>
      </div>
    ),
  }

  return (
    <div className={style.taskProgress}>
      {statusMap[taskStatus]}
    </div>
  );
};

export default TaskProgress;