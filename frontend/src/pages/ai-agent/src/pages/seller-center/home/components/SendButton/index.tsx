import React from 'react';
import { Button } from 'antd';
import ChatBoxSend from '@/components/Icon/ChatBoxSend';
import styles from './index.module.scss';
import { $t } from '@/i18n';
import { appVersionType, AppVersionType } from '@/utils/env';

const isGlobal = appVersionType === AppVersionType.GLOBAL;

// 创建一个能够根据 disabled 状态动态渲染的按钮组件
const SendButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  { disabled?: boolean; onClick?: () => void }
>((props, ref) => {
  const { disabled, onClick, ...restProps } = props;
  const style = isGlobal ? { fontFamily: 'Poppins' } : {};
  return (
    <Button
      {...restProps}
      ref={ref}
      icon={<ChatBoxSend />}
      type="primary"
      shape={disabled ? 'circle' : 'default'}
      className={styles.sendButton}
      onClick={onClick}
      disabled={disabled}
    >
      {!disabled && <span className={styles.sendButtonText} style={style}>{$t("global-1688-ai-app.seller-center.home.SendButton.fs", "发送")}</span>}
    </Button>
  );
});

SendButton.displayName = 'SendButton';

export default SendButton;
