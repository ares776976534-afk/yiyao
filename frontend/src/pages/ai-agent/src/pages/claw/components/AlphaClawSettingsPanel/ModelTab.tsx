import React, { useState, useEffect } from 'react';
import { Input, Select, message } from 'antd';
import Loading from '@/pages/claw/components/Loading';
import getSettingModel from '@/services/claw/getSettingModel';
import saveSettingModle from '@/services/claw/saveSettingModle';
import type { TypeModelDefaultInfo, TypeModelCustomForm } from './types';
import styles from './index.module.scss';

/** Coding Plan 各厂商购买链接 */
const CODING_PLAN_LINKS: { label: string; url: string }[] = [
  { label: '阿里', url: 'https://www.aliyun.com/benefit/scene/codingplan' },
  { label: '火山', url: 'https://www.volcengine.com/activity/codingplan' },
  { label: '腾讯', url: 'https://cloud.tencent.com/act/pro/codingplan' },
  { label: '百度', url: 'https://cloud.baidu.com/doc/qianfan/s/imlg0beiu' },
  { label: 'Minimax', url: 'https://platform.minimaxi.com/subscribe/token-plan' },
  { label: '智谱', url: 'https://www.bigmodel.cn/glm-coding' },
];

const ICON_RADIO_CHECKED = 'https://img.alicdn.com/imgextra/i2/6000000005777/O1CN01oQb4Yx1sXvCNRfxky_!!6000000005777-2-gg_dtc.png';
const ICON_SAVE = 'https://img.alicdn.com/imgextra/i3/6000000007374/O1CN01vKrBcD24LLiQROcJl_!!6000000007374-2-gg_dtc.png';
const ICON_ARROW_RIGHT = 'https://img.alicdn.com/imgextra/i3/O1CN01FULcVj1s8jPuc0tyu_!!6000000005722-55-tps-18-18.svg';
const ICON_EYE = 'https://img.alicdn.com/imgextra/i1/6000000007014/O1CN01G1Lgp721gT8EtnK32_!!6000000007014-2-gg_dtc.png';
const ICON_EYE_CLOSE = 'https://img.alicdn.com/imgextra/i3/O1CN01PEe71U1NaRHrqWXtZ_!!6000000001586-55-tps-16-16.svg';
const ICON_INPUT_CLEAR = 'https://img.alicdn.com/imgextra/i1/6000000000109/O1CN01xaF0PD1CfyIVwhnUy_!!6000000000109-2-gg_dtc.png';

export interface TypeModelTabProps {
  onShowCreditsDetail?: () => void;
}

type TypeModelFormErrors = {
  modelName: boolean;
  apiKey: boolean;
};

const INIT_ERRORS: TypeModelFormErrors = { modelName: false, apiKey: false };

const ModelTab: React.FC<TypeModelTabProps> = ({ }) => {
  const [useDefaultModel, setUseDefaultModel] = useState(false);
  const [defaultModelInfo, setDefaultModelInfo] = useState<TypeModelDefaultInfo>({
    totalCredits: 0,
    freeCredits: 0,
    rechargeCredits: 0,
    modelName: '',
    apiKeyMasked: '',
    baseUrl: '',
  });
  const [customModelForm, setCustomModelForm] = useState<TypeModelCustomForm>({
    modelName: '',
    apiKey: '',
    baseUrl: '',
    apiType: 'openai-completions',
  });
  const [formErrors, setFormErrors] = useState<TypeModelFormErrors>(INIT_ERRORS);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSettingModel()
      .then((res) => {
        if (!res) return;
        setUseDefaultModel(res.useDefault);
        setDefaultModelInfo({
          ...res.defaultModel,
          totalCredits: Number(res.totalPoints) || 0,
          freeCredits: Number(res.freePoints) || 0,
          rechargeCredits: Number(res.rechargePoints) || 0,
        });
        setCustomModelForm(res.customModel);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFieldChange = (field: 'modelName' | 'apiKey', value: string) => {
    setCustomModelForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleFieldBlur = (field: 'modelName' | 'apiKey') => {
    setFormErrors((prev) => ({ ...prev, [field]: !customModelForm[field].trim() }));
  };

  const handleSwitchToDefault = () => {
    if (useDefaultModel || saving) return;
    setUseDefaultModel(true);
    setSaving(true);
    saveSettingModle({
      useDefault: true,
      defaultModel: {
        ...defaultModelInfo,
        modelName: 'kimi-k2.5',
      },
      customModel: customModelForm ?? {},
    })
      .then(() => {
        message.success('保存成功');
      })
      .catch((e) => message.error(e?.message || '保存失败'))
      .finally(() => setSaving(false));
  };

  const handleSave = () => {
    if (useDefaultModel || saving) return;

    const nextErrors: TypeModelFormErrors = {
      modelName: !customModelForm.modelName.trim(),
      apiKey: !customModelForm.apiKey.trim(),
    };
    setFormErrors(nextErrors);
    if (nextErrors.modelName || nextErrors.apiKey) return;

    setSaving(true);
    saveSettingModle({
      useDefault: useDefaultModel,
      defaultModel: {
        ...defaultModelInfo,
        modelName: 'kimi-k2.5',
      },
      customModel: customModelForm ?? {},
    })
      .then(() => {
        message.success('保存成功');
      })
      .catch((e) => message.error(e?.message || '保存失败'))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className={styles.modelContentWrap}>
        <Loading className={styles.innerLoading} fullScreen={false} text="正在加载中..." />
      </div>
    );
  }

  return (
    <div className={styles.modelContentWrap}>
      <div className={styles.modelSection}>
        <div
          className={styles.modelSectionTitleRow}
          role="button"
          tabIndex={0}
          onClick={handleSwitchToDefault}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSwitchToDefault()}
        >
          {useDefaultModel ? (
            <img className={styles.modelRadioIcon} src={ICON_RADIO_CHECKED} alt="" />
          ) : (
            <div className={styles.modelRadioUnchecked} />
          )}
          <span className={styles.modelSectionTitle}>使用默认模型配置</span>
        </div>
        {useDefaultModel && defaultModelInfo?.freeCredits <= 0 && (
          <div className={styles.modelQuotaNotice}>
            <p className={styles.modelQuotaNoticeText}>
              当前赠送模型额度已用完，建议购买Coding Plan进行配置，Coding Plan快捷链接：
            </p>
            <div className={styles.modelQuotaNoticeLinks}>
              {CODING_PLAN_LINKS.map((item) => (
                <a
                  key={item.label}
                  className={styles.modelQuotaNoticeLink}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                  <img className={styles.modelQuotaNoticeLinkIcon} src={ICON_ARROW_RIGHT} alt="" />
                </a>
              ))}
            </div>
            <p className={styles.modelQuotaNoticeText2}>
              购买后，请在下方【使用自定义配置】中进行配置
            </p>
          </div>
        )}
        <div className={styles.modelDefaultCard}>
          {/* <div className={styles.modelDefaultCardHeader}>
            <span className={styles.modelCreditsLabel}>
              剩余免费积分 {(defaultModelInfo?.totalCredits ?? 0).toLocaleString()}
            </span>
            <div
              className={styles.modelLinkButton}
              role="button"
              tabIndex={0}
              onClick={() => {
                window.open('https://www.alphashop.cn/seller-center/credit-management?tab=3', '_blank');
              }}
            >
              查看消耗明细
            </div>
          </div> */}
          {/* <div className={styles.modelCreditsRow}>
            <div className={styles.modelCreditsBlock}>
              <span className={styles.modelCreditsSubLabel}>免费积分</span>
              <div className={styles.modelCreditsValueRow}>
                <span className={styles.modelCreditsValue}>
                  {(defaultModelInfo?.freeCredits ?? 0).toLocaleString()}
                </span>
                <span className={styles.modelCreditsSlash}>
                  /{(defaultModelInfo?.totalCredits ?? 0).toLocaleString()}
                </span>
              </div>
              <div className={styles.modelProgressTrack}>
                <div
                  className={styles.modelProgressFill}
                  style={{
                    width: `${(defaultModelInfo?.totalCredits ?? 0) > 0 ? ((defaultModelInfo?.freeCredits ?? 0) / (defaultModelInfo?.totalCredits ?? 1)) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className={styles.modelCreditsDivider} />
            <div className={styles.modelCreditsBlock}>
              <span className={styles.modelCreditsSubLabel}>充值积分</span>
              <div className={styles.modelCreditsValueRow}>
                <span className={styles.modelCreditsValue}>
                  {(defaultModelInfo?.rechargeCredits ?? 0).toLocaleString()}
                </span>
                <span
                  className={styles.modelRechargeLink}
                  role="button"
                  tabIndex={0}
                  onClick={() => { }}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && {}}
                >
                  去充值
                  <img className={styles.modelRechargeArrow} src={ICON_ARROW_RIGHT} alt="" />
                </span>
              </div>
              <div className={styles.modelProgressTrack} />
            </div>
          </div> */}

          <div className={styles.modelInfoRow}>
            <span className={styles.modelInfoLabel}>剩余免费积分</span>

            <div className={styles.modelCreditsValueWrapper}>
              <div className={styles.modelCreditsValueRow}>
                <span className={styles.modelCreditsValue}>
                  {(defaultModelInfo?.freeCredits ?? 0).toLocaleString()}
                </span>
                <span className={styles.modelCreditsSlash}>
                  /{(defaultModelInfo?.totalCredits ?? 0).toLocaleString()}
                </span>
              </div>
              <div className={styles.modelProgressTrack}>
                <div
                  className={styles.modelProgressFill}
                  style={{
                    width: `${(defaultModelInfo?.totalCredits ?? 0) > 0 ? ((defaultModelInfo?.freeCredits ?? 0) / (defaultModelInfo?.totalCredits ?? 1)) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div
              className={styles.modelLinkButton}
              role="button"
              tabIndex={0}
              onClick={() => {
                window.open('https://www.alphashop.cn/seller-center/credit-management?tab=3', '_blank');
              }}
            >
              查看消耗明细
            </div>
          </div>

          <div className={styles.modelDivider} />
          <div className={styles.modelInfoRow}>
            <span className={styles.modelInfoLabel}>模型名称</span>
            <span className={styles.modelInfoValue}>{defaultModelInfo?.modelName ?? 'kimi-k2.5'}</span>
          </div>
        </div>
      </div>

      <div className={styles.modelSection}>
        <div
          className={styles.modelSectionTitleRow}
          role="button"
          tabIndex={0}
          onClick={() => setUseDefaultModel(false)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setUseDefaultModel(false)}
        >
          {!useDefaultModel ? (
            <img className={styles.modelRadioIcon} src={ICON_RADIO_CHECKED} alt="" />
          ) : (
            <div className={styles.modelRadioUnchecked} />
          )}

          <span className={styles.modelSectionTitle}>使用自定义配置</span>
          <div
            className={styles.modelSaveConfigLink}
            role="button"
            tabIndex={0}
            aria-disabled={(useDefaultModel || saving) || undefined}
            onClick={(e) => {
              if (!useDefaultModel && !saving) {
                e.stopPropagation();
                handleSave();
              }
            }}
            onKeyDown={(e) => {
              if (!useDefaultModel && !saving && (e.key === 'Enter' || e.key === ' ')) {
                e.stopPropagation();
                handleSave();
              }
            }}
          >
            <img className={styles.modelSaveIcon} src={ICON_SAVE} alt="" />
            <span>{saving ? '正在保存' : '保存配置'}</span>
          </div>
        </div>
        <div
          className={
            useDefaultModel
              ? `${styles.modelCustomCard} ${styles.modelCustomCardDisabled}`
              : styles.modelCustomCard
          }
        >
          <div className={`${styles.modelFormRow}${formErrors.modelName ? ` ${styles.modelFormRowError}` : ''}`}>
            <span className={`${styles.modelFormLabel} ${styles.formLabelRequired}${formErrors.modelName ? ` ${styles.modelFormLabelError}` : ''}`}>模型名称</span>
            <div className={styles.modelFormInputColumn}>
              <Input
                className={`${styles.modelFormInput}${formErrors.modelName ? ` ${styles.modelFormInputError}` : ''}`}
                placeholder="请输入"
                value={customModelForm?.modelName ?? ''}
                onChange={(e) => handleFieldChange('modelName', e.target.value)}
                onBlur={() => handleFieldBlur('modelName')}
                disabled={useDefaultModel || saving}
              />
              {formErrors.modelName && (
                <span className={styles.modelFormErrorMsg}>请输入模型名称</span>
              )}
            </div>
          </div>
          <div className={styles.modelDivider} />
          <div className={`${styles.modelFormRow}${formErrors.apiKey ? ` ${styles.modelFormRowError}` : ''}`}>
            <span className={`${styles.modelFormLabel} ${styles.formLabelRequired}${formErrors.apiKey ? ` ${styles.modelFormLabelError}` : ''}`}>API KEY</span>
            <div className={styles.modelFormInputColumn}>
              <Input.Password
                className={`${styles.modelFormInput}${formErrors.apiKey ? ` ${styles.modelFormInputError}` : ''}`}
                placeholder="请填写密钥"
                visibilityToggle
                value={customModelForm?.apiKey ?? ''}
                disabled={useDefaultModel || saving}
                onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                onBlur={() => handleFieldBlur('apiKey')}
              />
              {formErrors.apiKey && (
                <span className={styles.modelFormErrorMsg}>请输入 API KEY</span>
              )}
            </div>
          </div>
          <div className={styles.modelDivider} />
          <div className={styles.modelFormRow}>
            <span className={styles.modelFormLabel}>BASE URL</span>
            <Input
              className={styles.modelFormInput}
              placeholder="请输入"
              value={customModelForm?.baseUrl ?? ''}
              onChange={(e) => setCustomModelForm((prev) => ({ ...prev, baseUrl: e.target.value }))}
              disabled={useDefaultModel || saving}
            />
          </div>
          <div className={styles.modelDivider} />
          <div className={styles.modelFormRow}>
            <span className={styles.modelFormLabel}>API 类型</span>
            <Select
              className={styles.modelFormInput}
              placeholder="请选择"
              value={customModelForm?.apiType || 'openai-completions'}
              onChange={(value) => setCustomModelForm((prev) => ({ ...prev, apiType: value }))}
              disabled={useDefaultModel || saving}
              options={[
                { value: 'openai-completions', label: 'OpenAI' },
                { value: 'anthropic-messages', label: 'Anthropic' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelTab;
