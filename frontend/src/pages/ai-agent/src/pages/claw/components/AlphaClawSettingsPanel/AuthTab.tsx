import React, { useState, useEffect, useCallback } from 'react';
import { Input, Modal, Select } from 'antd';
import Loading from '@/pages/claw/components/Loading';
import getPlatformList from '@/services/claw/getPlatformList';
import addPlatform from '@/services/claw/addPlatform';
import deletePlatform from '@/services/claw/deletePlatform';
import type {
  TypeAuthChannel,
  TypeAuthFormValues,
  TypePlatformAccount,
  TypePlatformAddPayload,
} from './types';
import styles from './index.module.scss';

const ICON_AUTH_EMPTY =
  'https://img.alicdn.com/imgextra/i4/O1CN01uYFyfu28nywHV8ab3_!!6000000007978-55-tps-16-16.svg';
const ICON_CLOSE =
  'https://img.alicdn.com/imgextra/i1/6000000005661/O1CN01CwBPyY1rgnFpjxs5c_!!6000000005661-2-gg_dtc.png';
const ICON_OZON =
  'https://img.alicdn.com/imgextra/i4/6000000007855/O1CN01tXwN0f27teDuuxJle_!!6000000007855-2-gg_dtc.png';

const CHANNEL_OPTIONS: { value: TypeAuthChannel; label: string }[] = [
  { value: 'Ozon', label: 'Ozon' },
  // { value: 'Shopee', label: 'Shopee' },
  // { value: 'Amazon', label: 'Amazon' },
];

const getChannelIcon = (_channel: TypeAuthChannel | string): string => {
  return ICON_OZON;
};

const INIT_FORM: TypeAuthFormValues = {
  channel: 'Ozon',
  shopName: '',
  appKey: '',
  clientId: '',
};

type TypeFormErrors = {
  appKey: boolean;
  clientId: boolean;
};

const INIT_ERRORS: TypeFormErrors = { appKey: false, clientId: false };

const AuthTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [accounts, setAccounts] = useState<TypePlatformAccount[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<TypeAuthFormValues>(INIT_FORM);
  const [formErrors, setFormErrors] = useState<TypeFormErrors>(INIT_ERRORS);

  const isEmpty = accounts.length === 0;

  const loadList = useCallback(() => {
    setLoading(true);
    getPlatformList(undefined)
      .then((list) => {
        setAccounts(list);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleAdd = () => {
    setFormValues(INIT_FORM);
    setAddModalOpen(true);
  };

  const handleFormChange = (field: keyof TypeAuthFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (field === 'appKey' || field === 'clientId') {
      setFormErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleFormBlur = (field: 'appKey' | 'clientId') => {
    setFormErrors((prev) => ({ ...prev, [field]: !formValues[field].trim() }));
  };

  const handleFormSubmit = () => {
    const shopName = formValues.shopName.trim();
    const appKey = formValues.appKey.trim();
    const clientId = formValues.clientId.trim();

    const nextErrors: TypeFormErrors = {
      appKey: !appKey,
      clientId: !clientId,
    };
    setFormErrors(nextErrors);

    if (!shopName || !appKey || !clientId) return;

    const channelUpper = formValues.channel.toUpperCase();
    const payload: TypePlatformAddPayload = {
      channel: formValues.channel,
      shopName,
      shopIdentifier: shopName,
      enabled: true,
      credentials: {
        [`${channelUpper}_API_KEY`]: appKey,
        [`${channelUpper}_CLIENT_ID`]: clientId,
        SHOP_NAME: shopName,
      },
    };

    setSaving(true);
    addPlatform(payload)
      .then(() => {
        setAddModalOpen(false);
        setFormValues(INIT_FORM);
        loadList();
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleFormCancel = () => {
    setAddModalOpen(false);
    setFormValues(INIT_FORM);
    setFormErrors(INIT_ERRORS);
  };

  const handleDeleteClick = (account: TypePlatformAccount) => {
    if (!account) return;
    Modal.confirm({
      title: '确定要删除该授权账号吗？',
      content: `删除「${account.shopName}」后需重新添加方可使用。`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        setDeleting(true);
        return deletePlatform(account.skillKey)
          .then(() => {
            loadList();
          })
          .finally(() => {
            setDeleting(false);
          });
      },
    });
  };

  if (loading) {
    return (
      <div className={styles.authContentWrap}>
        <Loading className={styles.innerLoading} fullScreen={false} text="正在加载中..." />
      </div>
    );
  }

  return (
    <div className={styles.authContentWrap}>
      {!loading && isEmpty && (
        <div
          className={styles.authEmptyWrap}
          style={{ pointerEvents: (saving || deleting) ? 'none' : undefined, opacity: (saving || deleting) ? 0.7 : 1 }}
        >
          <div className={styles.authEmptyIcon} />
          <span className={styles.authEmptyTitle}>暂无下游店铺账号</span>
          <span className={styles.authEmptySub}>支持添加Ozon、Shopee、Amazon等账号</span>
          <button
            type="button"
            className={styles.authBtnAdd}
            onClick={handleAdd}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleAdd()}
          >
            <span className={styles.authBtnAddText}>添加新账号</span>
          </button>
        </div>
      )}
      {!loading && !isEmpty && (
        <div
          className={styles.authListWrap}
          style={{ pointerEvents: (saving || deleting) ? 'none' : undefined, opacity: (saving || deleting) ? 0.7 : 1 }}
        >
          <div className={styles.authListScroll}>
            {accounts.map((account) => (
              <div key={account.skillKey} className={styles.authCard}>
                <div className={styles.authCardMain}>
                  <div className={styles.authCardHead}>
                    <img
                      className={styles.authCardIcon}
                      src={getChannelIcon(account.channel)}
                      alt=""
                    />
                    <span className={styles.authCardShopName}>{account.shopName}</span>
                    <div className={styles.authCardTag}>
                      <span className={styles.authCardTagText}>已授权</span>
                    </div>
                  </div>
                  <div className={styles.authCardMeta}>
                    <div className={styles.authCardMetaRow}>
                      <span className={styles.authCardMetaLabel}>账号标识:</span>
                      <span className={styles.authCardMetaValue}>{account.shopIdentifier}</span>
                    </div>
                    <div className={styles.authCardMetaRow}>
                      <span className={styles.authCardMetaLabel}>授权时间:</span>
                      <span className={styles.authCardMetaValue}>{account.authorizedTime}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.authCardDelete}
                  onClick={() => handleDeleteClick(account)}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
          <div className={styles.authListFooter}>
            <button type="button" className={styles.authBtnAdd} onClick={handleAdd}>
              <span className={styles.authBtnAddText}>添加新账号</span>
            </button>
          </div>
        </div>
      )}

      <Modal
        open={addModalOpen}
        onCancel={handleFormCancel}
        footer={null}
        width={540}
        centered
        destroyOnHidden
        maskClosable={false}
        closable={false}
        styles={{ content: { padding: 0, overflow: 'hidden', borderRadius: 16 } }}
      >
        <div className={styles.authAddModalWrap}>
          <div className={styles.authAddModalHeader}>
            <span className={styles.authAddModalTitle}>新增账号</span>
            <img
              className={styles.authAddModalClose}
              src={ICON_CLOSE}
              alt="关闭"
              role="button"
              tabIndex={0}
              onClick={saving ? undefined : handleFormCancel}
              onKeyDown={(e) => {
                if (!saving && (e.key === 'Enter' || e.key === ' ')) handleFormCancel();
              }}
            />
          </div>
          <div className={styles.authAddModalBody}>
            <div className={styles.authAddFormItem}>
              <span className={`${styles.authAddFormLabel} ${styles.formLabelRequired}`}>渠道</span>
              <Select
                value={formValues.channel}
                onChange={(v) => handleFormChange('channel', v)}
                options={CHANNEL_OPTIONS}
                style={{ width: '100%' }}
                getPopupContainer={(el) => el?.parentElement ?? document.body}
                disabled={saving}
              />
            </div>
            <div className={styles.authAddFormItem}>
              <span className={`${styles.authAddFormLabel} ${styles.formLabelRequired}`}>店铺名称</span>
              <Input
                className={`${styles.authAddFormInput} ${styles.authAddFormInputWhite}`}
                placeholder="请输入店铺名称"
                value={formValues.shopName}
                onChange={(e) => handleFormChange('shopName', e.target.value)}
                disabled={saving}
              />
            </div>
            <div className={styles.authAddFormItem}>
              <span className={`${styles.authAddFormLabel} ${styles.formLabelRequired}`}>APP Key</span>
              <Input
                className={`${styles.authAddFormInput} ${styles.authAddFormInputWhite}${formErrors.appKey ? ` ${styles.authAddFormInputError}` : ''}`}
                placeholder="请输入 APP Key"
                value={formValues.appKey}
                onChange={(e) => handleFormChange('appKey', e.target.value)}
                onBlur={() => handleFormBlur('appKey')}
                disabled={saving}
              />
              {formErrors.appKey && (
                <span className={styles.authAddFormErrorMsg}>请输入 APP Key</span>
              )}
            </div>
            <div className={styles.authAddFormItem}>
              <span className={`${styles.authAddFormLabel} ${styles.formLabelRequired}`}>Client ID</span>
              <Input
                className={`${styles.authAddFormInput} ${styles.authAddFormInputWhite}${formErrors.clientId ? ` ${styles.authAddFormInputError}` : ''}`}
                placeholder="请输入 Client ID"
                value={formValues.clientId}
                onChange={(e) => handleFormChange('clientId', e.target.value)}
                onBlur={() => handleFormBlur('clientId')}
                disabled={saving}
              />
              {formErrors.clientId && (
                <span className={styles.authAddFormErrorMsg}>请输入 Client ID</span>
              )}
            </div>
          </div>
          <div className={styles.authAddModalFooter}>
            <button
              type="button"
              className={styles.authAddModalCancel}
              onClick={handleFormCancel}
              disabled={saving}
            >
              取消
            </button>
            <button
              type="button"
              className={styles.authAddModalConfirm}
              onClick={handleFormSubmit}
              disabled={saving || !formValues.shopName.trim() || !formValues.appKey.trim() || !formValues.clientId.trim()}
            >
              {saving ? '正在保存' : '确认创建'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AuthTab;
