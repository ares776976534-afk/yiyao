import React from 'react';
import styles from './index.module.css';
import { PauseCircleIcon, CopyTaskIcon, EyeTaskIcon } from '@/components/Icon';

interface InquiryTaskMaskProps {
  status?: string;
  onEndTask?: () => void;
  onCopyTask?: () => void;
  onViewDetail?: () => void;
}

const InquiryTaskMask: React.FC<InquiryTaskMaskProps> = ({
  status,
  onEndTask,
  onCopyTask,
  onViewDetail,
}) => {
  const allMenuItems = [
    {
      key: 'end',
      icon: <PauseCircleIcon />,
      label: '结束任务',
      onClick: onEndTask,
      className: styles.endTask,
      hidden: status === 'FINISHED' || status === 'REPORTING',
    },
    {
      key: 'copy',
      icon: <CopyTaskIcon />,
      label: '复制任务',
      onClick: onCopyTask,
    },
    {
      key: 'view',
      icon: <EyeTaskIcon />,
      label: '查看详情',
      onClick: onViewDetail,
    },
  ];

  const menuItems = allMenuItems?.filter(item => !item.hidden);

  return (
    <div className={styles.inquiryTaskMask}>
      <div className={styles.inquiryTaskMaskContent}>
        {menuItems?.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 && <div className={styles.divider} />}
            <div 
              className={styles.inquiryTaskMaskItem}
              onClick={item.onClick}
            >
              {item.icon}
              <div className={item.className}>{item.label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default InquiryTaskMask;