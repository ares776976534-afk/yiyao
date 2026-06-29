import React, { useState, useMemo } from 'react';
import { ConfigProvider, Tour, Button } from 'antd';
import type { TourProps } from 'antd';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/stores/context';
import theme from '@/theme/default.json';
import { $t } from '@/i18n';
import styles from './index.module.scss';

const USER_TOUR_FATIGUE_DAYS = 3; // 疲劳度:3天

const UserTourContent = observer(() => {
  const store = useStore();
  const [current, setCurrent] = useState<number>(0);

  // 根据疲劳度判断是否显示引导
  const open = store.userPrefer.shouldShowGuide(
    'homeMaterialStepCloseTime',
    USER_TOUR_FATIGUE_DAYS,
  );
  const steps: TourProps['steps'] = [
    {
      title: $t(
        'global-1688-ai-app.user-tour.title-1',
        '你好，欢迎来到遨虾 👋',
      ),
      description: $t(
        'global-1688-ai-app.user-tour.description-1',
        '遨虾覆盖跨境电商工作全链路，点击切换不同agent能力。',
      ),
      target: () =>
        document.querySelector('[data-tour="tour-step-1"]') as HTMLElement,
    },
    {
      title: $t('global-1688-ai-app.user-tour.title-2', '素材Agent'),
      description: $t(
        'global-1688-ai-app.user-tour.description-2',
        '素材agent支持对话+画布操作，首创商品卡组一站式生图/改图/铺货。',
      ),
      target: () =>
        document.querySelector('[data-tour="tour-step-2"]') as HTMLElement,
    },
    {
      title: $t('global-1688-ai-app.user-tour.title-3', '素材特色能力'),
      description: $t(
        'global-1688-ai-app.user-tour.description-3',
        '支持导入图片和1688商品链接，自动解析下载整套商品素材。',
      ),
      target: () =>
        document.querySelector('[data-tour="tour-step-3"]') as HTMLElement,
    },
    {
      title: $t('global-1688-ai-app.user-tour.title-4', '一键提交任务'),
      description: $t(
        'global-1688-ai-app.user-tour.description-4',
        '直接描述需求，一键提交任务。',
      ),
      target: () =>
        document.querySelector('[data-tour="tour-step-4"]') as HTMLElement,
    },
  ];
  // 状态映射
  const OFFSET_MAP: Record<number, [number, number]> = {
    0: [-60, 20],
    1: [20, 20],
  };
  const DEFAULT_OFFSET: [number, number] = [6, 6];

  const offset = useMemo(() => {
    return OFFSET_MAP[current] || DEFAULT_OFFSET;
  }, [current]);

  // 关闭引导时记录时间戳到服务端和本地缓存
  const handleClose = () => {
    store.userPrefer.updateGuide('homeMaterialStepCloseTime', Date.now());
  };

  return (
    <ConfigProvider theme={theme}>
      <Tour
        prefixCls="user-tour"
        rootClassName={styles.tour}
        closeIcon={false}
        open={open}
        onClose={handleClose}
        steps={steps}
        current={current}
        gap={{ offset, radius: 12 }}
        indicatorsRender={(currentIndex, total) => (
          <div className={styles.indicatorsContainer}>
            {currentIndex + 1} / {total}
          </div>
        )}
        actionsRender={(originNode, { current: actionCurrent, total }) => {
          const firstStep = actionCurrent === 0;
          const lastStep = actionCurrent === total - 1;
          return (
            <>
              {!lastStep && (
                <Button className={styles.userTourButton} onClick={handleClose}>
                  {$t('global-1688-ai-app.user-tour.skip', '跳过')}
                </Button>
              )}
              {!firstStep && (
                <Button
                  className={styles.userTourButton}
                  onClick={() => {
                    setCurrent(actionCurrent - 1);
                  }}
                >
                  {$t('global-1688-ai-app.user-tour.previous', '上一步')}
                </Button>
              )}
              <Button
                className={styles.userTourButton}
                type="primary"
                onClick={() => {
                  if (lastStep) {
                    handleClose();
                  } else {
                    setCurrent(actionCurrent + 1);
                  }
                }}
              >
                {lastStep
                  ? $t('global-1688-ai-app.user-tour.finish', '完成')
                  : $t('global-1688-ai-app.user-tour.next', '下一步')}
              </Button>
            </>
          );
        }}
      />
    </ConfigProvider>
  );
});

export default UserTourContent;
