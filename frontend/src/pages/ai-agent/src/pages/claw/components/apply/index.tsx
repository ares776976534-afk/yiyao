import React, { useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import View from "@alife/channel-fe-materials-react-appear";
import platformOptions, { EnumPlatformOther } from './platformOptions';
import countryOptions from './countryOptions';
import businessModelOptions, { EnumBusinessModelOther } from './businessModelOptions';
import gmvOptions from './gmvOptions';
import aiScenarioOptions from './aiScenarioOptions';
import handleScrollToTop from '@/utils/scrollToTop';
import submitWhiteApplay from '@/services/claw/submitWhiteApplay';
import useToast from "@/components/Toast";
import aplus from "@/utils/log";
import { $t } from '@/i18n';
import type { TypeApplyFormValues } from './types';
import styles from './index.module.scss';

interface EcommerceAgentFormProps {
  id?: string;
  onBack?: () => void;
}

const EcommerceAgentForm: React.FC<EcommerceAgentFormProps> = ({ id, onBack }) => {
  const [form] = Form.useForm<TypeApplyFormValues>();
  const [loading, setLoading] = useState(false);
  const toast = useToast({ type: 'strong', duration: 2 });

  const platforms = Form.useWatch('platforms', form) ?? [];
  const businessModels = Form.useWatch('businessModels', form) ?? [];
  const showPlatformOther = platforms.includes(EnumPlatformOther);
  const showBusinessModelOther = businessModels.includes(EnumBusinessModelOther);

  const handleSubmit = (values: TypeApplyFormValues) => {
    setLoading(true);
    handleScrollToTop();

    const postData = {
      'mobile': values.mobile,
      'industry': values.industry,
      'position': values.position,
      'companyName': values.companyName,
      'applicationScene': values.applicationScene?.join(','),
      'extraInfo': values,
    };

    submitWhiteApplay(postData as any)
      .then((res: any) => {
        if (res) {
          toast.success('提交成功，请等待审核', {
            onClose: onBack,
          });
        } else {
          message.error(res.retMsg || $t('global-1688-ai-app.seller-center.home.waiting-list.aSte', '申请提交失败！'));
        }
        setLoading(false);
      }).catch((e) => {
        toast.error(e.message || '提交失败，请稍后重试');
        setLoading(false);
      })
  };

  const handleSubmitFailed = (errorInfo: unknown) => {
    message.error('请完善必填信息');
  };

  return (
    <div id={id} className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.headerSection}>
          <div className={styles.titleRow}>
            <button className={styles.backBtn} onClick={onBack} aria-label="返回">
              <img src="https://img.alicdn.com/imgextra/i4/6000000006437/O1CN01lDwmAH1xQCbPNrWu8_!!6000000006437-2-gg_dtc.png" alt="返回" />
            </button>
            <h1 className={styles.mainTitle}>
              请填写<span className={styles.mainTitleHighlight}>免费名额</span>申请表
            </h1>
          </div>
          <span className={styles.subtitle}>
            AlphaClaw是由 1688 官方推出的电商专用 AI Agent。它深度适配电商业务场景，支持一键部署，内置选品、调价、询盘等 50+ 精选技能，助您实现生意自动化。现限时开放名额，填写表单即可申请体验。
          </span>
        </div>

        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardTitle}>
              <img src="https://img.alicdn.com/imgextra/i3/6000000006304/O1CN01zb4n2R1wRHvMaunsP_!!6000000006304-2-gg_dtc.png" alt="" className={styles.infoCardIcon} />
              <span>申请说明</span>
            </div>
            <span className={styles.infoCardDesc}>
              本次活动共发放若干个免费名额，包含一个月免费 Alphaclaw 服务器和部分免费模型额度
            </span>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardTitle}>
              <img src="https://img.alicdn.com/imgextra/i1/6000000006633/O1CN01TOH89r1yryEOj5mSa_!!6000000006633-2-gg_dtc.png" alt="" className={styles.infoCardIcon} />
              <span>审核流程</span>
            </div>
            <span className={styles.infoCardDesc}>
              提交申请 → 人工审核 (预计 1-3 个工作日) → 邮件通知结果，请在收到邮件后的15个自然日内激活启动，逾期名额自动失效。
            </span>
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>
            <img src="https://img.alicdn.com/imgextra/i2/6000000007277/O1CN01NtudPQ23cvIW2YXeb_!!6000000007277-2-gg_dtc.png" alt="" className={styles.formCardIcon} />
            <span>填写表格</span>
          </div>
          <Form<TypeApplyFormValues>
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onFinishFailed={handleSubmitFailed}
            className={styles.antdForm}
            initialValues={{
              platforms: [],
              country: [],
              businessModels: [],
              applicationScene: [],
            }}
          >
            <div className={styles.formFields}>
              {/* 1. 公司/店铺名称 */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabel}>
                  <span>{$t('global-1688-ai-app.AlphaClaw.apply.companyName', '公司/店铺名称')}</span>
                  <span className={styles.required}>*</span>
                </div>
                <Form.Item
                  name="companyName"
                  rules={[{ required: true, message: $t('global-1688-ai-app.AlphaClaw.apply.companyNamePlaceholder', '请输入公司/店铺名称') }]}
                  className={styles.formItem}
                >
                  <Input
                    placeholder={$t('global-1688-ai-app.AlphaClaw.apply.companyNamePlaceholder', '请输入公司/店铺名称')}
                    className={styles.antdInput}
                  />
                </Form.Item>
              </div>

              {/* 2. 所属行业 */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabel}>
                  <span>{$t('global-1688-ai-app.AlphaClaw.apply.industry', '所属行业')}</span>
                  <span className={styles.required}>*</span>
                </div>
                <Form.Item
                  name="industry"
                  rules={[{ required: true, message: $t('global-1688-ai-app.AlphaClaw.apply.industryPlaceholder', '请输入所属行业') }]}
                  className={styles.formItem}
                >
                  <Input
                    placeholder={$t('global-1688-ai-app.AlphaClaw.apply.industryPlaceholder', '请输入所属行业')}
                    className={styles.antdInput}
                  />
                </Form.Item>
              </div>

              {/* 3. 您的职位 */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabel}>
                  <span>{$t('global-1688-ai-app.AlphaClaw.apply.position', '您的职位')}</span>
                  <span className={styles.required}>*</span>
                </div>
                <Form.Item
                  name="position"
                  rules={[{ required: true, message: $t('global-1688-ai-app.AlphaClaw.apply.positionPlaceholder', '请输入您的职位') }]}
                  className={styles.formItem}
                >
                  <Input
                    placeholder={$t('global-1688-ai-app.AlphaClaw.apply.positionPlaceholder', '请输入您的职位')}
                    className={styles.antdInput}
                  />
                </Form.Item>
              </div>

              {/* 4. 手机号码 */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabel}>
                  <span>{$t('global-1688-ai-app.AlphaClaw.apply.mobile', '手机号码')}</span>
                  <span className={styles.required}>*</span>
                </div>
                <Form.Item
                  name="mobile"
                  rules={[
                    { required: true, message: $t('global-1688-ai-app.seller-center.home.waiting-list.qtee', '请输入手机号') },
                    {
                      pattern: /^(\+\d{1,4}[-_ ]?)?\d{5,15}$/,
                      message: $t(
                        'global-1688-ai-app.AlphaClaw.apply.mobileDigitsOnly',
                        '请输入5～15位数字（可带国际区号如+86）',
                      ),
                    },
                  ]}
                  className={styles.formItem}
                >
                  <Input
                    placeholder={$t('global-1688-ai-app.seller-center.home.waiting-list.qtee', '请输入手机号')}
                    className={styles.antdInput}
                  />
                </Form.Item>
              </div>

              {/* 5. 联系邮箱 */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabel}>
                  <span>{$t('global-1688-ai-app.AlphaClaw.apply.email', '联系邮箱')}</span>
                  <span className={styles.required}>*</span>
                </div>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: $t('global-1688-ai-app.AlphaClaw.apply.emailPlaceholder', '请输入联系邮箱') },
                    { type: 'email', message: $t('global-1688-ai-app.AlphaClaw.apply.emailInvalid', '请输入正确的邮箱格式') },
                  ]}
                  className={styles.formItem}
                >
                  <Input
                    placeholder={$t('global-1688-ai-app.AlphaClaw.apply.emailPlaceholder', '请输入联系邮箱')}
                    className={styles.antdInput}
                  />
                </Form.Item>
              </div>

              {/* 6. 主要经营平台 */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabel}>
                  <span>{$t('global-1688-ai-app.AlphaClaw.apply.platforms', '主要经营平台')}</span>
                  <span className={styles.required}>*</span>
                </div>
                <Form.Item
                  name="platforms"
                  rules={[{ required: true, type: 'array', min: 1, message: $t('global-1688-ai-app.AlphaClaw.apply.platformsPlaceholder', '请选择主要经营平台') }]}
                  className={styles.formItem}
                >
                  <Select
                    mode="tags"
                    placeholder={$t('global-1688-ai-app.AlphaClaw.apply.platformsPlaceholder', '请选择主要经营平台')}
                    options={platformOptions}
                    className={styles.antdSelectMultiple}
                    allowClear
                    maxTagCount="responsive"
                  />
                </Form.Item>
              </div>
              {showPlatformOther && (
                <div className={styles.fieldRow}>
                  <div className={styles.fieldLabelSingle}>
                    <span>{$t('global-1688-ai-app.AlphaClaw.apply.platformOtherInput', '其他平台')}</span>
                  </div>
                  <Form.Item name="platformOther" className={styles.formItem}>
                    <Input
                      placeholder={$t('global-1688-ai-app.AlphaClaw.apply.platformOtherPlaceholder', '请输入其他平台名称')}
                      className={styles.antdInput}
                    />
                  </Form.Item>
                </div>
              )}

              {/* 主要经营国家 */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabel}>
                  <span>{$t('global-1688-ai-app.AlphaClaw.apply.country', '主要经营国家')}</span>
                  <span className={styles.required}>*</span>
                </div>
                <Form.Item
                  name="country"
                  rules={[{ required: true, type: 'array', min: 1, message: $t('global-1688-ai-app.AlphaClaw.apply.countryPlaceholder', '请选择主要经营国家') }]}
                  className={styles.formItem}
                >
                  <Select
                    mode="multiple"
                    placeholder={$t('global-1688-ai-app.AlphaClaw.apply.countryPlaceholder', '请选择主要经营国家')}
                    options={countryOptions}
                    className={styles.antdSelectMultiple}
                    allowClear
                    maxTagCount="responsive"
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
              </div>

              {/* 7. 经营模式 */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabel}>
                  <span>{$t('global-1688-ai-app.AlphaClaw.apply.businessModel', '经营模式')}</span>
                  <span className={styles.required}>*</span>
                </div>
                <Form.Item
                  name="businessModels"
                  rules={[{ required: true, type: 'array', min: 1, message: $t('global-1688-ai-app.AlphaClaw.apply.businessModelPlaceholder', '请选择经营模式') }]}
                  className={styles.formItem}
                >
                  <Select
                    mode="tags"
                    placeholder={$t('global-1688-ai-app.AlphaClaw.apply.businessModelPlaceholder', '请选择经营模式')}
                    options={businessModelOptions}
                    className={styles.antdSelectMultiple}
                    allowClear
                    maxTagCount="responsive"
                  />
                </Form.Item>
              </div>
              {showBusinessModelOther && (
                <div className={styles.fieldRow}>
                  <div className={styles.fieldLabelSingle}>
                    <span>{$t('global-1688-ai-app.AlphaClaw.apply.businessModelOtherInput', '其他模式')}</span>
                  </div>
                  <Form.Item name="businessModelOther" className={styles.formItem}>
                    <Input
                      placeholder={$t('global-1688-ai-app.AlphaClaw.apply.businessModelOtherPlaceholder', '请输入其他经营模式')}
                      className={styles.antdInput}
                    />
                  </Form.Item>
                </div>
              )}

              {/* 8. 业务月规模 (GMV) */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabel}>
                  <span>{$t('global-1688-ai-app.AlphaClaw.apply.gmv', '业务月规模 (GMV)')}</span>
                  <span className={styles.required}>*</span>
                </div>
                <Form.Item
                  name="gmv"
                  rules={[{ required: true, message: $t('global-1688-ai-app.AlphaClaw.apply.gmvPlaceholder', '请选择业务月规模') }]}
                  className={styles.formItem}
                >
                  <Select
                    placeholder={$t('global-1688-ai-app.AlphaClaw.apply.gmvPlaceholder', '请选择业务月规模')}
                    options={gmvOptions}
                    className={styles.antdSelect}
                  />
                </Form.Item>
              </div>

              {/* 9. 重点关注的AI应用场景 */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabel}>
                  <span>{$t('global-1688-ai-app.AlphaClaw.apply.applicationScene', '重点关注的AI应用场景')}</span>
                  <span className={styles.required}>*</span>
                </div>
                <Form.Item
                  name="applicationScene"
                  rules={[{ required: true, type: 'array', min: 1, message: $t('global-1688-ai-app.AlphaClaw.apply.aiScenariosPlaceholder', '请选择关注的AI应用场景') }]}
                  className={styles.formItem}
                >
                  <Select
                    mode="tags"
                    placeholder={$t('global-1688-ai-app.AlphaClaw.apply.aiScenariosPlaceholder', '请选择关注的AI应用场景')}
                    options={aiScenarioOptions}
                    className={styles.antdSelectMultiple}
                    allowClear
                    maxTagCount="responsive"
                  />
                </Form.Item>
              </div>

              {/* 10. 是否有推荐人 */}
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabelSingle}>
                  <span>{$t('global-1688-ai-app.AlphaClaw.apply.referrer', '是否有推荐人')}</span>
                </div>
                <Form.Item
                  name="referrer"
                  className={styles.formItem}
                >
                  <Input
                    placeholder={$t('global-1688-ai-app.AlphaClaw.apply.referrerPlaceholder', '如有推荐人请填写')}
                    className={styles.antdInput}
                  />
                </Form.Item>
              </div>
            </div>

            <View
              className={styles.submitFormItem}
              onFirstAppear={() => {
                aplus.record('/alphashop.clawapply.submit', "EXP");
              }}
              onClick={() => {
                aplus.record('/alphashop.clawapply.submit', "CLK");
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                className={styles.submitButton}
                loading={loading}
              >
                {$t('global-1688-ai-app.seller-center.home.waiting-list.jrddmd', '加入等待名单')}
              </Button>
            </View>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EcommerceAgentForm;