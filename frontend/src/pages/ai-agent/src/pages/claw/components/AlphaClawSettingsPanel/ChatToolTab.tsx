import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircleFilled, CloseCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { Input, message, Modal, QRCode, Spin } from 'antd';
import getChatToolConfig from '@/services/claw/getChatToolConfig';
import saveChatToolConfig from '@/services/claw/saveChatToolConfig';
import connectWechatChannel from '@/services/claw/connectWechatChannel';
import getWechatLoginStatus from '@/services/claw/getWechatLoginStatus';
import Loading from '@/pages/claw/components/Loading';
import type {
  TypeWechatBinding,
  TypeFeishuBinding,
  TypeDingtalkBinding,
  TypeQQBinding,
  TypeChatToolSavePayload,
  TypeChatToolChannelItem,
} from './types';
import { getWechatLoginStatusLabel } from './wechatLoginStatusLabels';
import styles from './index.module.scss';

const LABEL_REQUIRED_CLS = `${styles.chatToolFormLabel} ${styles.formLabelRequired}`;

const INIT_WECHAT: TypeWechatBinding = { enabled: false, connected: false };
const INIT_FEISHU: TypeFeishuBinding = { enabled: false, appId: '', appSecret: '' };
const INIT_DINGTALK: TypeDingtalkBinding = {
  enabled: false,
  clientId: '',
  clientSecret: '',
  robotCode: '',
  corpId: '',
  agentId: '',
};
const INIT_QQ: TypeQQBinding = { enabled: false, appId: '', clientSecret: '' };

function parseChannelsToState(result: { channels?: TypeChatToolChannelItem[] } | null) {
  const channels = result?.channels ?? [];
  const wechatCh = channels.find((c) => c.channelName === 'openclaw-weixin');
  const feishuCh = channels.find((c) => c.channelName === 'feishu');
  const dingtalkCh = channels.find((c) => c.channelName === 'dingtalk');
  const qqbotCh = channels.find((c) => c.channelName === 'qqbot');
  const cred = (ch: TypeChatToolChannelItem | undefined) => ch?.credentials ?? {};
  return {
    wechat: wechatCh
      ? { enabled: !!wechatCh.enabled, connected: !!wechatCh.connected }
      : INIT_WECHAT,
    feishu: feishuCh
      ? {
        enabled: !!feishuCh.enabled,
        appId: String(cred(feishuCh).appId ?? ''),
        appSecret: String(cred(feishuCh).appSecret ?? ''),
      }
      : INIT_FEISHU,
    dingtalk: dingtalkCh
      ? {
        enabled: !!dingtalkCh.enabled,
        clientId: String(cred(dingtalkCh).clientId ?? ''),
        clientSecret: String(cred(dingtalkCh).clientSecret ?? ''),
        robotCode: String(cred(dingtalkCh).robotCode ?? ''),
        corpId: String(cred(dingtalkCh).corpId ?? ''),
        agentId: cred(dingtalkCh).agentId != null ? String(cred(dingtalkCh).agentId) : undefined,
      }
      : INIT_DINGTALK,
    qq: qqbotCh
      ? {
        enabled: !!qqbotCh.enabled,
        appId: String(cred(qqbotCh).appId ?? ''),
        clientSecret: String(cred(qqbotCh).clientSecret ?? ''),
      }
      : INIT_QQ,
  };
}

function buildChatToolChannels(
  wechat: TypeWechatBinding,
  feishu: TypeFeishuBinding,
  dingtalk: TypeDingtalkBinding,
  qq: TypeQQBinding,
): TypeChatToolChannelItem[] {
  return [
    {
      channelName: 'openclaw-weixin',
      displayName: '微信',
      enabled: wechat.enabled,
      credentials: {},
    },
    {
      channelName: 'feishu',
      displayName: '飞书',
      enabled: feishu.enabled,
      credentials: {
        appId: (feishu.appId ?? '').trim(),
        appSecret: (feishu.appSecret ?? '').trim(),
      },
    },
    {
      channelName: 'dingtalk',
      displayName: '钉钉',
      enabled: dingtalk.enabled,
      credentials: {
        clientId: (dingtalk.clientId ?? '').trim(),
        clientSecret: (dingtalk.clientSecret ?? '').trim(),
        robotCode: (dingtalk.robotCode ?? '').trim(),
        corpId: (dingtalk.corpId ?? '').trim(),
        ...(dingtalk.agentId?.trim() ? { agentId: dingtalk.agentId.trim() } : {}),
      },
    },
  ];
}

export interface TypeChatToolTabProps {
  /** 可选：保存时回调，用于埋点或父组件感知 */
  onSave?: (payload: TypeChatToolSavePayload) => void;
}

const ChatToolTab: React.FC<TypeChatToolTabProps> = ({ onSave: onSaveCallback }) => {
  const [wechat, setWechat] = useState<TypeWechatBinding>(INIT_WECHAT);
  const [feishu, setFeishu] = useState<TypeFeishuBinding>(INIT_FEISHU);
  const [dingtalk, setDingtalk] = useState<TypeDingtalkBinding>(INIT_DINGTALK);
  const [qq, setQQ] = useState<TypeQQBinding>(INIT_QQ);
  const [wechatQrModalOpen, setWechatQrModalOpen] = useState(false);
  const [wechatConnectLoading, setWechatConnectLoading] = useState(false);
  const [wechatEnableSaving, setWechatEnableSaving] = useState(false);
  const [wechatQrUrl, setWechatQrUrl] = useState<string | null>(null);
  /** 与 GET login-status 返回的 status 一致（含前端超时 timeout） */
  const [wechatLoginStatusCode, setWechatLoginStatusCode] = useState<string | null>(null);
  const [wechatQrReady, setWechatQrReady] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const saveChatToolBinding = (payload: TypeChatToolSavePayload) => {
    onSaveCallback?.(payload);
  };

  const syncWechatFromServer = useCallback(async () => {
    try {
      const result = await getChatToolConfig();
      setWechat(parseChannelsToState(result).wechat);
    } catch {
      message.error('刷新微信绑定状态失败');
    }
  }, []);

  const startWechatBindFlow = useCallback(async () => {
    setWechatConnectLoading(true);
    setWechatQrUrl(null);
    setWechatLoginStatusCode(null);
    try {
      const data = await connectWechatChannel();
      const url = (data.qrcodeUrl ?? '').trim();
      if (url) {
        setWechatQrModalOpen(true);
        setWechatQrUrl(url);
      } else {
        const tip = (data.message ?? '').trim() || '微信已连接';
        message.success(tip);
        await syncWechatFromServer();
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : '获取二维码失败');
      setWechatQrModalOpen(false);
    } finally {
      setWechatConnectLoading(false);
    }
  }, [syncWechatFromServer]);

  const regenWechatQr = useCallback(async () => {
    setWechatConnectLoading(true);
    setWechatLoginStatusCode(null);
    try {
      const data = await connectWechatChannel();
      const url = (data.qrcodeUrl ?? '').trim();
      if (url) {
        setWechatQrUrl(url);
      } else {
        const tip = (data.message ?? '').trim() || '微信已连接';
        message.success(tip);
        await syncWechatFromServer();
        setWechatQrModalOpen(false);
        setWechatQrUrl(null);
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : '重新获取失败');
    } finally {
      setWechatConnectLoading(false);
    }
  }, [syncWechatFromServer]);

  const persistWechatEnabled = useCallback(
    async (nextEnabled: boolean) => {
      if (!wechat.connected) return;
      setWechatEnableSaving(true);
      const channels = buildChatToolChannels(
        { ...wechat, enabled: nextEnabled },
        feishu,
        dingtalk,
        qq,
      );
      try {
        await saveChatToolConfig(channels);
        setWechat((prev) => ({ ...prev, enabled: nextEnabled }));
        message.success('已保存');
        const payload: TypeChatToolSavePayload = {};
        if (nextEnabled) payload.wechat = {};
        onSaveCallback?.(payload);
      } catch (e: unknown) {
        message.error(e instanceof Error ? e.message : '保存失败');
      } finally {
        setWechatEnableSaving(false);
      }
    },
    [wechat, feishu, dingtalk, qq, onSaveCallback],
  );

  const handleWechatSwitchClick = () => {
    if (saving || wechatConnectLoading || wechatEnableSaving) return;
    if (!wechat.connected) {
      void startWechatBindFlow();
      return;
    }
    void persistWechatEnabled(!wechat.enabled);
  };

  const handleSave = async () => {
    if (feishu.enabled) {
      const appId = (feishu.appId ?? '').trim();
      const appSecret = (feishu.appSecret ?? '').trim();
      if (!appId) {
        message.warning('飞书已启用，请填写机器人APP ID');
        return;
      }
      if (!appSecret) {
        message.warning('飞书已启用，请填写APP Secret');
        return;
      }
    }
    if (dingtalk.enabled) {
      const clientId = (dingtalk.clientId ?? '').trim();
      const clientSecret = (dingtalk.clientSecret ?? '').trim();
      const robotCode = (dingtalk.robotCode ?? '').trim();
      const corpId = (dingtalk.corpId ?? '').trim();
      if (!clientId) {
        message.warning('钉钉已启用，请填写 Client ID');
        return;
      }
      if (!clientSecret) {
        message.warning('钉钉已启用，请填写 Client Secret');
        return;
      }
      if (!robotCode) {
        message.warning('钉钉已启用，请填写机器人 Code（必填）');
        return;
      }
      if (!corpId) {
        message.warning('钉钉已启用，请填写 Corp ID');
        return;
      }
    }
    if (qq.enabled) {
      const appId = (qq.appId ?? '').trim();
      const clientSecret = (qq.clientSecret ?? '').trim();
      if (!appId) {
        message.warning('QQ已启用，请填写 APP ID');
        return;
      }
      if (!clientSecret) {
        message.warning('QQ已启用，请填写 Client Secret');
        return;
      }
    }

    const channels = buildChatToolChannels(wechat, feishu, dingtalk, qq);

    setSaving(true);
    saveChatToolConfig(channels)
      .then(() => {
        message.success('配置已保存');
        const payload: TypeChatToolSavePayload = {};
        if (wechat.enabled) payload.wechat = {};
        const feishuItem = channels.find((c) => c.channelName === 'feishu');
        const dingtalkItem = channels.find((c) => c.channelName === 'dingtalk');
        const qqItem = channels.find((c) => c.channelName === 'qqbot');
        if (feishu.enabled && feishuItem) {
          payload.feishu = {
            appId: feishuItem.credentials.appId,
            appSecret: feishuItem.credentials.appSecret,
          };
        }
        if (dingtalk.enabled && dingtalkItem) {
          payload.dingtalk = { ...dingtalkItem.credentials } as TypeChatToolSavePayload['dingtalk'];
        }
        if (qq.enabled && qqItem) {
          payload.qq = {
            appId: qqItem.credentials.appId,
            clientSecret: qqItem.credentials.clientSecret,
          };
        }
        saveChatToolBinding(payload);
      })
      .catch((e) => message.error(e?.message || '保存失败'))
      .finally(() => setSaving(false));
  };

  useEffect(() => {
    getChatToolConfig()
      .then((result) => {
        const { wechat: w, feishu: f, dingtalk: d, qq: q } = parseChannelsToState(result);
        setWechat(w);
        setFeishu(f);
        setDingtalk(d);
        setQQ(q);
      })
      .catch(() => {
        message.error('获取聊天工具配置失败');
      })
      .finally(() => {
        setInitLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!wechatQrUrl) {
      setWechatQrReady(false);
      return;
    }
    setWechatQrReady(false);
    const t = window.setTimeout(() => setWechatQrReady(true), 400);
    return () => window.clearTimeout(t);
  }, [wechatQrUrl]);

  useEffect(() => {
    if (!wechatQrModalOpen || !wechatQrUrl) return;

    const POLL_MS = 2000;
    const MAX_MS = 6 * 60 * 1000;
    const startedAt = Date.now();
    let timer: number | undefined;
    let stopped = false;

    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const run = async () => {
      if (stopped) return;
      if (Date.now() - startedAt > MAX_MS) {
        stop();
        setWechatLoginStatusCode('timeout');
        return;
      }
      try {
        const data = await getWechatLoginStatus();
        const status = data.status;

        if (status === 'confirmed') {
          stop();
          try {
            const result = await getChatToolConfig();
            const w = parseChannelsToState(result).wechat;
            setWechat(w);
            setWechatQrModalOpen(false);
            setWechatQrUrl(null);
            setWechatLoginStatusCode(null);
          } catch {
            message.error('绑定成功但刷新配置失败，请稍后重试');
          }
          return;
        }

        setWechatLoginStatusCode(status);

        if (status === 'expired' || status === 'error' || status === 'timeout') {
          stop();
        }
      } catch {
        // 单次失败不中断轮询，避免弱网误杀
      }
    };

    void run();
    timer = window.setInterval(() => void run(), POLL_MS);
    return () => stop();
  }, [wechatQrModalOpen, wechatQrUrl]);

  const qrFlowBusy = wechatConnectLoading || !wechatQrReady;
  const showScanedOverlay =
    !!wechatQrUrl && !qrFlowBusy && wechatLoginStatusCode === 'scaned';
  const showAbnormalOverlay =
    !!wechatQrUrl &&
    !qrFlowBusy &&
    wechatLoginStatusCode != null &&
    ['expired', 'error', 'timeout'].includes(wechatLoginStatusCode);
  const dimWechatQr = showScanedOverlay || showAbnormalOverlay;

  return (
    <div className={styles.chatToolContentWrap}>
      {initLoading ? (
        <Loading className={styles.innerLoading} text="正在加载中..." fullScreen={false} />
      ) : (
        <>
          <Modal
            centered
            destroyOnClose
            footer={null}
            maskClosable
            open={wechatQrModalOpen}
            width={480}
            onCancel={() => {
              setWechatQrModalOpen(false);
              setWechatQrUrl(null);
              setWechatLoginStatusCode(null);
            }}
            styles={{
              content: { borderRadius: 16, padding: 0, overflow: 'hidden' },
              body: { padding: 0 },
            }}
          >
            <div className={styles.wechatBindModalBody}>
              <div className={styles.wechatBindModalInner}>
                <div className={styles.wechatBindModalHead}>
                  <h2 className={styles.wechatBindModalTitle}>用微信扫码绑定</h2>
                  <p className={styles.wechatBindModalDesc}>
                    请使用微信扫码，然后按微信中的操作完成绑定
                  </p>
                </div>
                <div className={styles.wechatBindModalQrWrap}>
                  <Spin
                    spinning={wechatConnectLoading}
                    wrapperClassName={styles.wechatBindModalSpinNested}
                  >
                    <div className={styles.wechatBindModalQrSlot}>
                      {wechatQrUrl ? (
                        <div className={styles.wechatBindModalQrFrame}>
                          <div
                            className={
                              dimWechatQr
                                ? `${styles.wechatBindModalQrFrameQr} ${styles.wechatBindModalQrFrameDimmed}`
                                : styles.wechatBindModalQrFrameQr
                            }
                          >
                            <QRCode
                              bordered={false}
                              className={styles.wechatBindModalQr}
                              errorLevel="M"
                              size={240}
                              status={qrFlowBusy ? 'loading' : 'active'}
                              type="svg"
                              value={wechatQrUrl}
                            />
                          </div>
                          {showScanedOverlay && (
                            <div
                              aria-hidden
                              className={styles.wechatQrOverlay}
                              role="presentation"
                            >
                              <div className={styles.wechatQrOverlayScanedInner}>
                                <CheckCircleFilled
                                  className={styles.wechatQrOverlayScanedIcon}
                                />
                              </div>
                            </div>
                          )}
                          {showAbnormalOverlay && wechatLoginStatusCode && (
                            <div className={styles.wechatQrOverlay}>
                              <div className={styles.wechatQrOverlayAbnormalInner}>
                                <div className={styles.wechatQrOverlayAbnormalRow}>
                                  <CloseCircleFilled
                                    className={styles.wechatQrOverlayAbnormalIcon}
                                  />
                                  <span>
                                    {getWechatLoginStatusLabel(wechatLoginStatusCode)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className={styles.wechatQrOverlayRefresh}
                                  onClick={() => void regenWechatQr()}
                                >
                                  <ReloadOutlined />
                                  点击刷新
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          aria-hidden
                          className={styles.wechatBindModalQrEmpty}
                        />
                      )}
                    </div>
                  </Spin>
                </div>
                <p className={styles.wechatBindModalFooter}>
                  <span className={styles.wechatBindModalFooterMuted}>若授权失败，请点击 </span>
                  <button
                    type="button"
                    className={styles.wechatBindModalRegen}
                    disabled={wechatConnectLoading}
                    onClick={() => void regenWechatQr()}
                  >
                    重新生成二维码
                  </button>
                </p>
              </div>
            </div>
          </Modal>
          <div className={styles.chatToolScroll}>

            <div className={styles.chatToolBlock}>
              <div className={styles.chatToolBlockHeader}>
                <div className={styles.chatToolBlockTitleRow}>
                  <div className={styles.chatToolBlockDot} />
                  <span className={styles.chatToolBlockName}>微信</span>
                </div>
                <div className={styles.chatToolHeaderRight}>
                  <span
                    className={
                      wechat.connected && wechat.enabled
                        ? `${styles.chatToolConnectHint} ${styles.chatToolConnectHintOn}`
                        : styles.chatToolConnectHint
                    }
                  >
                    {!wechat.connected
                      ? '未绑定微信，点击开启扫码'
                      : wechat.enabled
                        ? '已开启连接'
                        : '已绑定，工具未启用'}
                  </span>
                  <div
                    className={
                      wechat.connected && wechat.enabled
                        ? `${styles.chatToolSwitch} ${styles.chatToolSwitchOn}`
                        : styles.chatToolSwitch
                    }
                    role="switch"
                    aria-checked={wechat.connected ? wechat.enabled : false}
                    aria-disabled={
                      saving || wechatConnectLoading || wechatEnableSaving || undefined
                    }
                    onClick={handleWechatSwitchClick}
                  >
                    <div
                      className={
                        wechat.connected && wechat.enabled
                          ? styles.chatToolSwitchThumbOn
                          : styles.chatToolSwitchThumb
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chatToolBlock}>
              <div className={styles.chatToolBlockHeader}>
                <div className={styles.chatToolBlockTitleRow}>
                  <div className={styles.chatToolBlockDot} />
                  <span className={styles.chatToolBlockName}>飞书</span>
                </div>
                <div
                  className={
                    feishu.enabled
                      ? `${styles.chatToolSwitch} ${styles.chatToolSwitchOn}`
                      : styles.chatToolSwitch
                  }
                  role="switch"
                  tabIndex={0}
                  aria-checked={feishu.enabled}
                  aria-disabled={saving || undefined}
                  onClick={() => !saving && setFeishu((prev) => ({ ...prev, enabled: !prev.enabled }))}
                  onKeyDown={(e) => {
                    if (!saving && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setFeishu((prev) => ({ ...prev, enabled: !prev.enabled }));
                    }
                  }}
                >
                  <div
                    className={
                      feishu.enabled ? styles.chatToolSwitchThumbOn : styles.chatToolSwitchThumb
                    }
                  />
                </div>
              </div>
              <div className={styles.chatToolBlockCard}>
                <div className={styles.chatToolFormRow}>
                  <span className={LABEL_REQUIRED_CLS}>机器人APP ID</span>
                  <Input
                    className={styles.chatToolInput}
                    placeholder="请填写机器人APP ID"
                    value={feishu.appId ?? ''}
                    disabled={!feishu.enabled || saving}
                    onChange={(e) => setFeishu((prev) => ({ ...prev, appId: e.target.value }))}
                  />
                </div>
                <div className={styles.chatToolDivider} />
                <div className={styles.chatToolFormRow}>
                  <span className={LABEL_REQUIRED_CLS}>APP Secret</span>
                  <Input
                    className={styles.chatToolInput}
                    placeholder="请填写密钥"
                    value={feishu.appSecret ?? ''}
                    disabled={!feishu.enabled || saving}
                    onChange={(e) => setFeishu((prev) => ({ ...prev, appSecret: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className={styles.chatToolBlock}>
              <div className={styles.chatToolBlockHeader}>
                <div className={styles.chatToolBlockTitleRow}>
                  <div className={styles.chatToolBlockDot} />
                  <span className={styles.chatToolBlockName}>钉钉</span>
                </div>
                <div
                  className={
                    dingtalk.enabled
                      ? `${styles.chatToolSwitch} ${styles.chatToolSwitchOn}`
                      : styles.chatToolSwitch
                  }
                  role="switch"
                  tabIndex={0}
                  aria-checked={dingtalk.enabled}
                  aria-disabled={saving || undefined}
                  onClick={() => !saving && setDingtalk((prev) => ({ ...prev, enabled: !prev.enabled }))}
                  onKeyDown={(e) => {
                    if (!saving && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setDingtalk((prev) => ({ ...prev, enabled: !prev.enabled }));
                    }
                  }}
                >
                  <div
                    className={
                      dingtalk.enabled ? styles.chatToolSwitchThumbOn : styles.chatToolSwitchThumb
                    }
                  />
                </div>
              </div>
              <div className={styles.chatToolBlockCard}>
                <div className={styles.chatToolFormRow}>
                  <span className={LABEL_REQUIRED_CLS}>Client ID</span>
                  <Input
                    className={styles.chatToolInput}
                    placeholder="请填写 Client ID"
                    value={dingtalk.clientId ?? ''}
                    disabled={!dingtalk.enabled || saving}
                    onChange={(e) => setDingtalk((prev) => ({ ...prev, clientId: e.target.value }))}
                  />
                </div>
                <div className={styles.chatToolDivider} />
                <div className={styles.chatToolFormRow}>
                  <span className={LABEL_REQUIRED_CLS}>Client Secret</span>
                  <Input.Password
                    className={styles.chatToolInput}
                    placeholder="请填写密钥"
                    visibilityToggle
                    value={dingtalk.clientSecret ?? ''}
                    disabled={!dingtalk.enabled || saving}
                    onChange={(e) => setDingtalk((prev) => ({ ...prev, clientSecret: e.target.value }))}
                  />
                </div>
                <div className={styles.chatToolDivider} />
                <div className={styles.chatToolFormRow}>
                  <span className={LABEL_REQUIRED_CLS}>机器人 Code</span>
                  <Input
                    className={styles.chatToolInput}
                    placeholder="请填写机器人 Code"
                    value={dingtalk.robotCode ?? ''}
                    disabled={!dingtalk.enabled || saving}
                    onChange={(e) => setDingtalk((prev) => ({ ...prev, robotCode: e.target.value }))}
                  />
                </div>
                <div className={styles.chatToolDivider} />
                <div className={styles.chatToolFormRow}>
                  <span className={LABEL_REQUIRED_CLS}>Corp ID</span>
                  <Input
                    className={styles.chatToolInput}
                    placeholder="请填写 Corp ID"
                    value={dingtalk.corpId ?? ''}
                    disabled={!dingtalk.enabled || saving}
                    onChange={(e) => setDingtalk((prev) => ({ ...prev, corpId: e.target.value }))}
                  />
                </div>
                <div className={styles.chatToolDivider} />
                <div className={styles.chatToolFormRow}>
                  <span className={styles.chatToolFormLabel}>Agent ID</span>
                  <Input
                    className={styles.chatToolInput}
                    placeholder="请填写 Agent ID"
                    value={dingtalk.agentId ?? ''}
                    disabled={!dingtalk.enabled || saving}
                    onChange={(e) => setDingtalk((prev) => ({ ...prev, agentId: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className={styles.chatToolBlock} style={{ display: 'none' }}>
              <div className={styles.chatToolBlockHeader}>
                <div className={styles.chatToolBlockTitleRow}>
                  <div className={styles.chatToolBlockDot} />
                  <span className={styles.chatToolBlockName}>QQ</span>
                </div>
                <div
                  className={
                    qq.enabled ? `${styles.chatToolSwitch} ${styles.chatToolSwitchOn}` : styles.chatToolSwitch
                  }
                  role="switch"
                  tabIndex={0}
                  aria-checked={qq.enabled}
                  aria-disabled={saving || undefined}
                  onClick={() => !saving && setQQ((prev) => ({ ...prev, enabled: !prev.enabled }))}
                  onKeyDown={(e) => {
                    if (!saving && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setQQ((prev) => ({ ...prev, enabled: !prev.enabled }));
                    }
                  }}
                >
                  <div className={qq.enabled ? styles.chatToolSwitchThumbOn : styles.chatToolSwitchThumb} />
                </div>
              </div>
              <div className={styles.chatToolBlockCard}>
                <div className={styles.chatToolFormRow}>
                  <span className={LABEL_REQUIRED_CLS}>APP ID</span>
                  <Input
                    className={styles.chatToolInput}
                    placeholder="请填写 APP ID"
                    value={qq.appId ?? ''}
                    disabled={!qq.enabled || saving}
                    onChange={(e) => setQQ((prev) => ({ ...prev, appId: e.target.value }))}
                  />
                </div>
                <div className={styles.chatToolDivider} />
                <div className={styles.chatToolFormRow}>
                  <span className={LABEL_REQUIRED_CLS}>Client Secret</span>
                  <Input
                    className={styles.chatToolInput}
                    placeholder="请填写密钥"
                    value={qq.clientSecret ?? ''}
                    disabled={!qq.enabled || saving}
                    onChange={(e) => setQQ((prev) => ({ ...prev, clientSecret: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.chatToolFooter}>
            <div
              className={styles.btnPrimary}
              role="button"
              tabIndex={0}
              aria-disabled={saving || wechatEnableSaving || undefined}
              onClick={saving || wechatEnableSaving ? undefined : handleSave}
              onKeyDown={(e) =>
                !(saving || wechatEnableSaving) && (e.key === 'Enter' || e.key === ' ') && handleSave()
              }
            >
              <span className={styles.btnPrimaryText}>{saving ? '正在保存' : '保存配置'}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatToolTab;
