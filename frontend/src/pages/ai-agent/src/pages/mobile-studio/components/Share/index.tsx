import React from 'react';
import { useSpm } from 'ice';
import * as clipboard from 'clipboard-polyfill';
import { Popover, Button } from 'antd-mobile';
import useToast from '@/components/Toast';
import { CloseIcon, LinkIcon } from '@/components/Icons';
import { $t } from '@/i18n';
import { createShare } from '@/services';
import { routeJump } from '@/utils/url';
import styles from './index.module.scss';

interface ShareProps {
  propsSessionId: string;
  visible: boolean;
  onClose: () => void;
  children: React.ReactElement;
}

const Share = (props: ShareProps) => {
  const { propsSessionId, visible, onClose, children } = props;
  const toast = useToast();
  const [spmA, spmB] = useSpm();
  const spmString = `${spmA || null}.${spmB || null}.share`;

  const mergePageParams = (link: string) => {
    const linkUrl = new URL(link);
    linkUrl.searchParams.set('spm', spmString);
    return linkUrl.toString();
  };

  const handleShareContentButtonClick = async () => {
    try {
      const shareLink = await createShare({
        sessionId: propsSessionId,
        shareMode: 'LAST_TASK',
      });
      const linkString = mergePageParams(shareLink);
      const url = new URL(linkString);
      const shareCode = url.searchParams.get('shareCode');
      const finalUrl = routeJump(
        'mobile-studio-share',
        {
          shareCode,
        },
        {
          urlOnly: true,
        },
      ) as string;

      clipboard.writeText(finalUrl).then(() => {
        onClose();
        toast.success($t('global-1688-ai-app.Share.copySuccess', '复制成功'));
      });
    } catch (error) {
      console.error('复制分享链接失败:', error);
    }
  };

  const shareContent = (
    <div className={styles.shareContent}>
      <div className={styles.shareContentHeader}>
        <div className={styles.shareContentHeaderTitle}>
          {$t('global-1688-ai-app.Share.sharedh', '分享对话')}
        </div>
        <CloseIcon className={styles.closeIcon} onClick={onClose} />
      </div>
      <div className={styles.shareContentDescription}>
        {$t(
          'global-1688-ai-app.ChatFlow.Navigation.cihhkwnjtp',
          '复制链接并分享后，获得链接的人可访问，对话内容将实时更新。',
        )}
      </div>
      <Button
        color="primary"
        className={styles.shareContentButton}
        onClick={handleShareContentButtonClick}
      >
        <LinkIcon className={styles.shareLinkIcon} />
        {$t('global-1688-ai-app.Share.copyLink', '复制链接')}
      </Button>
    </div>
  );

  return (
    <Popover
      visible={visible}
      className={styles.sharePopover}
      placement="bottom-end"
      content={shareContent}
    >
      {children}
    </Popover>
  );
};

export default Share;
