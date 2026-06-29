import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { getUserInfo } from '@/utils/login';
import { restartClaw, autoFixClaw, getTerminalUrl } from '@/services/claw/settingsCommand';
import canShowTerminal from '@/services/claw/canShowTerminal';
import { alpha_claw_logo } from '@/pages/claw/components/constants';
import styles from './index.module.scss';

const ICON_RESTART = 'https://img.alicdn.com/imgextra/i4/6000000007505/O1CN01JAKCGS25JLbG44juZ_!!6000000007505-2-gg_dtc.png';
const ICON_FIX = 'https://img.alicdn.com/imgextra/i1/6000000000279/O1CN01BRkfyt1DvpcvzrY5z_!!6000000000279-2-gg_dtc.png';
const ICON_UPGRADE = 'https://img.alicdn.com/imgextra/i2/6000000002501/O1CN01g87jJf1ULVgdSTEkb_!!6000000002501-2-gg_dtc.png';
const ICON_TERMINAL = 'https://img.alicdn.com/imgextra/i1/6000000001557/O1CN01num11r1NN9nhm4V4G_!!6000000001557-2-gg_dtc.png';

export interface TypeBasicTabProps {
  sessionId?: string;
  /** 获取到终端链接后回调，用于面板内展示终端视图 */
  onTerminalReady?: (url: string) => void;
}

const BasicTab: React.FC<TypeBasicTabProps> = ({ sessionId = '', onTerminalReady }) => {
  const [actionLoading, setActionLoading] = useState<'restart' | 'autoFix' | 'terminal' | null>(null);
  const [userAvatar, setUserAvatar] = useState<string>(alpha_claw_logo);
  const [userLoginId, setUserLoginId] = useState<string>('');
  const [showTerminal, setShowTerminal] = useState<boolean>(false);

  const handleRestart = async () => {
    if (actionLoading) return;
    setActionLoading('restart');
    try {
      const ok = await restartClaw();
      if (ok) {
        message.success('重启成功');
      } else {
        message.error('重启失败，请稍后重试');
      }
    } catch {
      message.error('重启失败，请稍后重试');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutoFix = async () => {
    if (actionLoading) return;
    setActionLoading('autoFix');
    try {
      const ok = await autoFixClaw();
      if (ok) {
        message.success('修复成功');
      } else {
        message.error('自动修复失败，请稍后重试');
      }
    } catch {
      message.error('自动修复失败，请稍后重试');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenTerminal = async () => {
    if (actionLoading) return;
    setActionLoading('terminal');
    try {
      const url = await getTerminalUrl();
      if (url) {
        // onTerminalReady?.(url);
        window.open(url, '_blank');
      } else {
        message.error('获取终端链接失败，请稍后重试');
      }
    } catch {
      message.error('获取终端链接失败，请稍后重试');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    getUserInfo().then((user) => {
      if (!user) return;
      const u = user as { userImg?: string; avatar?: string; loginId?: string };
      // setUserAvatar(u?.userImg ?? u?.avatar ?? studioDefaults.userImage);
      setUserLoginId(u?.loginId ? decodeURIComponent(u?.loginId) : '');
    });

    canShowTerminal().then((canShow) => {
      setShowTerminal(canShow);
    });
  }, []);

  return (
    <div className={styles.infoSectionWrap}>
      <div className={styles.infoSection}>
        <img className={styles.avatar} src={userAvatar} alt="" />
        <div className={styles.infoDetails}>
          <div className={styles.statusRow}>
            <span className={styles.menuText}>AlphaClaw</span>
            <div className={styles.statusDot} />
          </div>
          {/* <span className={styles.infoId}>ID：{userLoginId || sessionId || '—'}</span> */}
        </div>
      </div>
      <div className={styles.actionList}>
        <div
          className={styles.actionItem}
          role="button"
          tabIndex={0}
          onClick={handleRestart}
          style={{ opacity: actionLoading === 'restart' ? 0.6 : 1 }}
        >
          <div className={styles.actionContent}>
            <div className={styles.basicActionIcon} style={{ '--maskImage': `url(${ICON_RESTART})` } as React.CSSProperties} />
            <span className={styles.actionText}>
              重启AlphaClaw
            </span>
          </div>

          {
            actionLoading === 'restart' && (
              <span className={styles.actionTextSecondary}>
                正在重启中，请稍等...
              </span>
            )
          }
        </div>

        <div
          className={styles.actionItem}
          role="button"
          tabIndex={0}
          onClick={handleAutoFix}
          style={{ opacity: actionLoading === 'autoFix' ? 0.6 : 1 }}
        >
          <div className={styles.actionContent}>
            <div className={styles.basicActionIcon} style={{ '--maskImage': `url(${ICON_FIX})` } as React.CSSProperties} />
            <span className={styles.actionText}>
              自动修复AlphaClaw
            </span>
          </div>

          {
            actionLoading === 'autoFix' && (
              <span className={styles.actionTextSecondary}>
                正在修复中，请稍等...
              </span>
            )
          }
        </div>

        <div className={styles.actionItem} data-disabled="true">
          <div className={styles.actionContent}>
            <div className={styles.basicActionIcon} style={{ '--maskImage': `url(${ICON_UPGRADE})` } as React.CSSProperties} />
            <span className={styles.actionText}>升级AlphaClaw</span>
          </div>
        </div>

        {
          showTerminal && (
            <div
              className={styles.actionItem}
              role="button"
              tabIndex={0}
              onClick={handleOpenTerminal}
              style={{ opacity: actionLoading === 'terminal' ? 0.6 : 1 }}
            >
              <div className={styles.actionContent}>
                <div className={styles.basicActionIcon} style={{ '--maskImage': `url(${ICON_TERMINAL})` } as React.CSSProperties} />
                <span className={styles.actionText}>
                  打开终端
                </span>
              </div>

              {
                actionLoading === 'terminal' && (
                  <span className={styles.actionTextSecondary}>
                    正在获取终端链接，请稍等...
                  </span>
                )
              }
            </div>
          )
        }
      </div>
    </div>
  );
};

export default BasicTab;
