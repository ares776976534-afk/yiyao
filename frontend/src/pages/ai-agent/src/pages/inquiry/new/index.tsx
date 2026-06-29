import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, message } from 'antd';
import ChooseSuppliers from '../components/ChooseSuppliers';
import AddInquiryOffer from '../components/AddInquiryOffer';
import InquiryQuestions from '../components/InquiryQuestions';
import TimeSelector from '../components/TimeSelector';
import AutoOrderSettings from '../components/AutoOrderSettings';
import Header from '../components/Header';
import CommonWrapper from '@/components/CommonWrapper';
import { postTask } from '../services';
import { QuestionType } from '../components/InquiryQuestions';
import { useNavigate, definePageConfig, useSearchParams } from 'ice';
import handleFromPage from './handleFromPage';
import { DisableItem } from '../types';
import Layout from '../../select-product/components/Layout';
import styles from './index.module.css';
import BasicInfor from '../components/BasicInfor';
import { receiveAddressList } from '@/pages/inquiry/services';
import { $t } from '@/i18n';
interface PostData {
  supplierInfo: {
    memberId: string;
    companyName: string;
    headImg: string;
    wangwangId: string;
  }[];
  type: string;
  itemInfo: {
    imgFileKey?: string;
    offerId?: string;
    offerImg?: string;
  };
  inquiryQuestions: {
    prebuild?: string[];
    custom?: string[];
  };
  config: {
    reportFinishTimeMinute?: number;
    autoOrderConfig: {
      enable: boolean;
      conditions: {
        key: string;
        value: string;
      }[];
    };
  };
}

// 表单验证规则
const validationRules = {
  supplierInfo: [
    {
      required: true,
      validator: (_, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return Promise.reject();
        }
        return Promise.resolve();
      }
    }
  ],
  itemInfo: [
    {
      required: true,
      validator: (_, value) => {
        if (!value) {
          return Promise.reject();
        }

        // 检查是否有图片或商品ID
        if (!value.imgFileKey && !value.offerId) {
          return Promise.reject();
        }

        // 检查是否有type字段
        if (!value.type) {
          return Promise.reject();
        }

        return Promise.resolve();
      }
    }
  ],
  inquiryQuestions: [
    {
      required: true,
      validator: (_, value) => {
        if (!value || value.length === 0) {
          return Promise.reject();
        }
        return Promise.resolve();
      }
    }
  ],
  reportFinishTimeMinute: [
    {
      required: true,
      validator: (_, value) => {
        if (!value || value <= 0) {
          return Promise.reject();
        }
        return Promise.resolve();
      }
    }
  ],
  // autoOrderConfig: [
  //   {
  //     validator: (_, value) => {
  //       if (!value) {
  //         return Promise.resolve();
  //       }

  //       const { enable, conditions } = value;

  //       if (enable && (!conditions || conditions.length === 0)) {
  //         return Promise.reject();
  //       }

  //       if (enable) {
  //         const hasValidCondition = conditions.some((item: any) =>
  //           item.value && item.value.toString().trim() !== ''
  //         );
  //         if (!hasValidCondition) {
  //           return Promise.reject();
  //         }
  //       }

  //       return Promise.resolve();
  //     }
  //   }
  // ]
};

const Inquiry: React.FC = () => {
  const [form] = Form.useForm<PostData>();
  const [isFormValid, setIsFormValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [initStatus, setInitStatus] = useState<any>({});
  const fromPage = searchParams.get('fromPage');
  const offerIds = searchParams.get('offerIds');
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    receiveAddressList({}).then((res) => {
      const { msg, data, success } = res || {};
      if (!success) {
        message.error(msg || $t("global-1688-ai-app.inquiry.new.hraqy", "获取地址失败，请重试"));
      }
      setList(data || []);
    }).catch((err) => {
      setList([]);
      message.error(err.message || $t("global-1688-ai-app.inquiry.new.hraqy", "获取地址失败，请重试"));
    });
  }, []);
  const navigate = useNavigate();

  // 检查表单验证状态
  const checkFormValidation = useCallback(async () => {
    // 防止重复验证
    if (isValidating) {
      return;
    }

    setIsValidating(true);

    try {
      await form.validateFields({ validateOnly: true });
      setIsFormValid(true);
    } catch (error) {
      setIsFormValid(false);
    } finally {
      setIsValidating(false);
    }
  }, [form, isValidating]);

  const handleValuesChange = () => {
    // 简单的值变化处理，直接验证
    setTimeout(() => {
      checkFormValidation();
    }, 50);
  };

  const handleSubmit = async () => {
    try {
      const values: any = await form.validateFields({ validateOnly: true });
      const address = list.find(item => item.code === values.address);

      const itemInfoWithType = values.itemInfo as any;
      const transformedData: PostData = {
        ...values,
        type: itemInfoWithType.type, // 提取type字段到顶级
        inquiryQuestions: {
          prebuild: values.inquiryQuestions.map(q => q.type === QuestionType.PREBUILD ? q.key : null).filter((q): q is string => q !== null),
          custom: values.inquiryQuestions.map(q => q.type === QuestionType.CUSTOM ? q.key : null).filter((q): q is string => q !== null),
        },
        itemInfo: {
          imgFileKey: itemInfoWithType.imgFileKey,
          offerId: itemInfoWithType.offerId,
          offerImg: itemInfoWithType.offerImg,
        },
        supplierInfo: values.supplierInfo.map(s => ({
          memberId: s.memberId,
          companyName: s.companyName,
          headImg: s.headImg,
          wangwangId: s.wangwangId,
        })),
        config: {
          ...values?.config || {},
          source: fromPage || '',
          autoOrderConfig: {
            enable: false,
            ...values?.config?.autoOrderConfig || {},
            offerInfos: offerIds ? values.supplierInfo.map(s => ({
              offerId: s.offerId,
              memberId: s.memberId,
            })) : [],
          },
          custom: {
            expectedOrderQuantity: values.expectedOrderQuantity,
            address
          },
        }
      };
      setLoading(true);
      postTask(transformedData)
        .then((res: any) => {
          if (res?.data?.taskId) {
            setLoading(false);
            navigate(`/inquiry`);
          } else {
            setLoading(false);
            message.error('创建询盘任务失败');
          }
        })
        .catch((err: any) => {
          setLoading(false);
          message.error(err.msg || $t("global-1688-ai-app.inquiry.new.cai", "创建询盘任务失败"));
        });

    } catch (errorInfo) {
      message.error('创建询盘任务失败');
    }
  };

  const init = async () => {
    const handleResult = await handleFromPage(fromPage || '', offerIds || '') as any;
    setInitStatus(Object.assign({}, handleResult));
    if (handleResult?.supplierInfo) {
      form.setFieldValue('supplierInfo', handleResult?.supplierInfo || []);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      init();
    }, 100);
  }, []);

  return (
    <Layout
      title={$t("global-1688-ai-app.inquiry.new.newjxpTask", "新建询盘任务")} onBack={() => navigate('/inquiry')}
    >
      <CommonWrapper>
        <div className={styles.inquiry}>
          <Form
            form={form}
            layout="vertical"
            className={styles.inquiryContent}
            onValuesChange={handleValuesChange}
          >
            <Form.Item
              name="itemInfo"
              rules={validationRules.itemInfo}
              validateStatus="success"
            >
              <AddInquiryOffer offerIdLink={initStatus.offerIdLink || []} />
            </Form.Item>

            <Form.Item
              name="supplierInfo"
              rules={validationRules.supplierInfo}
            >
              <ChooseSuppliers
                disabled={initStatus[DisableItem.DISABLE_SELECT_SUPPLIER]}
              />
            </Form.Item>

            <Form.Item
              name="inquiryQuestions"
              rules={validationRules.inquiryQuestions}
            >
              <InquiryQuestions />
            </Form.Item>

            <BasicInfor list={list} />

            <Form.Item
              name={['config', 'reportFinishTimeMinute']}
              rules={validationRules.reportFinishTimeMinute}
            >
              <TimeSelector />
            </Form.Item>

            {
              !initStatus[DisableItem.DISABLE_AUTO_ORDER] && (
                <Form.Item
                  name={['config', 'autoOrderConfig']}
                >
                  <AutoOrderSettings />
                </Form.Item>
              )
            }
          </Form>
        </div>
        <div className={styles.footer}>
          <Button
            type="primary"
            className={styles.antdExecuteButton}
            icon={
              <img
                src="https://img.alicdn.com/imgextra/i4/6000000002675/O1CN01WG3SQk1VdCYuwYazp_!!6000000002675-2-gg_dtc.png"
                className={styles.executeIcon}
                alt={$t("global-1688-ai-app.inquiry.new.zh", "执行")}
              />
            }
            disabled={!isFormValid}
            onClick={handleSubmit}
            loading={loading}
          >{$t("global-1688-ai-app.inquiry.new.iiy", "立即执行")}</Button>
        </div>
      </CommonWrapper>
    </Layout>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.inquiry.new.newjxpTask", "新建询盘任务"),
  spm: {
    spmB: 'inquiry-new-inquiry-task',
  },
});

export default Inquiry;