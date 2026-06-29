import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Form, Icon, Balloon, Select, Tab, Button, Field, Message, Checkbox } from '@alifd/next';
import { MessageCard, MessageCardProps, OverseaQualificationForm } from './components';

import { COUNTRY_OPTIONS } from './options';
import { queryQualificationsDetailService, submitQualificationsInfoService } from './api';
import { Logger } from '@/utlis';

// 国家表单组件的引用接口
interface CountryFormRef {
  validate: () => Promise<{ valid: boolean; errors?: any; values?: any }>;
}

// 国家表单内容组件
interface CountryFormContentProps {
  state: MessageCardProps['state'];
  data?: any;
  onUploadingChange?: (isUploading: boolean) => void;
}

Logger.init({ a: 'qualification', b: 'qualification' }, { pageKey: '跨境资质提交' });

const CountryFormContent = forwardRef<CountryFormRef, CountryFormContentProps>(({ state, data, onUploadingChange }, ref) => {
  const field = Field.useField({ parseName: true });

  useImperativeHandle(ref, () => ({
    validate: () => {
      return new Promise<{ valid: boolean; errors?: any; values?: any }>((resolve) => {
        field.validate((fieldErrors, fieldValues) => {
          if (fieldErrors) {
            resolve({ valid: false, errors: fieldErrors });
          } else {
            resolve({ valid: true, values: fieldValues });
          }
        });
      });
    },
  }));

  return (<OverseaQualificationForm
    field={field}
    state={state || undefined}
    data={data}
    onUploadingChange={onUploadingChange}
  />);
});

CountryFormContent.displayName = 'CountryFormContent';

export default function OverseaQualification() {
  const [state, setState] = useState<MessageCardProps['state']>('');
  const field = Field.useField({ parseName: true });

  const [rejectReason, setRejectReason] = useState<string>('');
  const [countryList, setCountryList] = useState<string[]>([]);
  const [qualificationInfoList, setQualificationInfoList] = useState<any[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');
  // 跟踪每个国家的上传状态
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});
  // 协议确认状态
  const [agreementChecked, setAgreementChecked] = useState<boolean>(false);

  // 判断表单是否可编辑：new 或 audit_fail 时可编辑，其他状态只读
  const isEditable = state === 'new' || state === 'audit_fail';

  // 存储每个国家表单的 ref
  const countryFormRefs = useRef<Record<string, CountryFormRef>>({});

  // 清理已移除国家的 ref
  useEffect(() => {
    const currentCountries = new Set(countryList);
    Object.keys(countryFormRefs.current).forEach((countryCode) => {
      if (!currentCountries.has(countryCode)) {
        delete countryFormRefs.current[countryCode];
      }
    });
  }, [countryList]);

  useEffect(() => {
    queryQualificationsDetailService().then((res: any) => {
      const { status = 'new',
        rejectReason: rejectReasonFromRes = '',
        overseasWarehouseCountry = '',
        qualificationInfoList: qualificationInfoListFromRes = [] } = res?.model || {};
      setState(status);
      setRejectReason(rejectReasonFromRes);
      // 将字符串按英文逗号分割成数组，并过滤空值
      const countryArray = overseasWarehouseCountry ? overseasWarehouseCountry.split(',').filter(Boolean) : [];
      setCountryList(countryArray);
      setQualificationInfoList(qualificationInfoListFromRes);
      // Select 组件需要数组格式才能正确回显并显示中文
      field.setValues({
        countryCode: countryArray,
      });
    }).catch((err) => {
      console.log(err);
    });
  }, [field]);

  const handleSubmit = () => {
    Logger.report({
      actionType: '跨境资质提交_提交',
    });

    // 先验证国家选择
    field.validate((errors) => {
      if (errors) {
        Message.warning('请填写完整信息后再提交');
        return;
      }

      if (countryList?.length === 0) {
        Message.warning('请至少选择一个国家');
        return;
      }

      // 验证所有国家的表单
      // 使用 requestAnimationFrame 确保所有 tab 都已渲染完成（如果设置了 lazyLoad={false}，所有 tab 都会渲染）
      requestAnimationFrame(() => {
        const validationPromises = countryList?.map((countryCode) => {
          const formRef = countryFormRefs.current[countryCode];
          if (!formRef) {
            return Promise.resolve<{ countryCode: string; valid: boolean; errors?: any; values?: any }>({
              countryCode,
              valid: false,
            });
          }

          return formRef.validate().then((result) => ({
            countryCode,
            ...result,
          }));
        });

        Promise.all(validationPromises).then((results) => {
          const validationErrors = results.filter((r) => !r.valid);
          if (validationErrors.length > 0) {
            Message.warning('请填写完整信息后再提交');
            // 如果有错误，切换到第一个有错误的国家tab
            if (validationErrors.length > 0 && validationErrors[0].countryCode) {
              setActiveKey(validationErrors[0].countryCode);
            }
            return;
          }

          const submitData = results
            .filter((r): r is { countryCode: string; valid: boolean; values: any } => r.valid && !!r.values)
            .map((result) => ({
              countryCode: result.countryCode,
              ...result.values,
            }));

          submitQualificationsInfoService(submitData).then((res: any) => {
            if (res.success) {
              Message.success('提交成功');
              setState('auditing');
            } else {
              Message.error('提交失败');
            }
          });
        });
      });
    });
  };

  const handleCancel = () => {
  };

  // 当 countryList 或 qualificationInfoList 更新时，自动激活第一个 tab
  useEffect(() => {
    if (state === 'new' || state === 'audit_fail') {
      // 新建状态或审核失败状态：使用 countryList
      if (countryList?.length > 0 && (!activeKey || !countryList?.includes(activeKey))) {
        setActiveKey(countryList?.[0]);
      }
    } else if (qualificationInfoList.length > 0) {
      // 其他状态：使用 qualificationInfoList
      const firstCountryCode = qualificationInfoList[0].countryCode;
      if (!activeKey || !qualificationInfoList.find((item) => item.countryCode === activeKey)) {
        setActiveKey(firstCountryCode);
      }
    }
  }, [countryList, qualificationInfoList, state, activeKey]);

  return (
    <div className="text-[#333] px-[120px] py-[20px] bg-[#F9F9F9]
    flex flex-col gap-[20px] w-full min-h-screen"
    >
      <div className="flex justify-between items-center">
        <span className="text-[18px] font-medium font-pingfang">
          跨境资质提交
        </span>
        <div
          className="flex items-center gap-[4px] text-[14px] font-normal font-pingfang text-[#0077FF] cursor-pointer"
          onClick={() => {
            window.open('https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/lyQod3RxJK3moMAATd2zz2b2Jkb4Mw9r', '_blank');
          }}
        >
          <Icon type="help" size="small" />
          填写指引
        </div>

      </div>

      <MessageCard
        state={state}
        content={rejectReason}
      />

      <div
        className="w-full bg-[#fff] p-[20px] rounded-[6px]"
      >
        <Form field={field}>
          <Form.Item
            required
            name="countryCode"
            requiredMessage="请选择您的海外仓、海外货源所在国家"
            label={
              <span className="inline-flex items-center gap-[4px]">
                您的海外仓、海外货源所在国家？
                <Balloon.Tooltip
                  trigger={<Icon type="help" className="text-[#BBB] cursor-pointer" size="small" />}
                  triggerType="hover"
                  align="t"
                  popupStyle={{ backgroundColor: '#333', fontSize: '14px', maxWidth: '300px' }}
                  popupClassName="products-business-tooltips"
                >
                  请填写您拥有海外仓或海外货源的国家信息，可多选
                </Balloon.Tooltip>
              </span>
            }
          >
            <Select
              dataSource={COUNTRY_OPTIONS}
              mode="multiple"
              placeholder="请选择"
              showSearch
              style={{ width: '424px' }}
              disabled={!isEditable}
              onChange={(value) => {
                setCountryList(Array.isArray(value) ? value as string[] : []);
              }}
            />
          </Form.Item>
        </Form>
      </div>


      <div>
        <Tab
          shape="wrapped"
          activeKey={activeKey}
          onChange={(key) => {
            setActiveKey(key);
          }}
          lazyLoad={false}
        >
          {(state === 'new' || state === 'audit_fail')
            ? countryList?.map((item) => {
              const countryOption = COUNTRY_OPTIONS.find((option) => option.value === item);
              // 如果是 audit_fail 状态，从 qualificationInfoList 中查找对应的数据用于回显
              const qualificationData = state === 'audit_fail'
                ? qualificationInfoList.find((qual) => qual.countryCode === item)
                : undefined;
              return (
                <Tab.Item
                  key={item}
                  title={countryOption?.label || item}
                >
                  <CountryFormContent
                    state={state}
                    data={qualificationData}
                    onUploadingChange={(uploading) => {
                      setUploadingStates((prev) => ({
                        ...prev,
                        [item]: uploading,
                      }));
                    }}
                    ref={(ref) => {
                      if (ref) {
                        countryFormRefs.current[item] = ref;
                      } else {
                        delete countryFormRefs.current[item];
                      }
                    }}
                  />
                </Tab.Item>
              );
            })
            : qualificationInfoList?.map((item) => {
              const countryOption = COUNTRY_OPTIONS.find((option) => option.value === item.countryCode);
              return (
                <Tab.Item
                  key={item.countryCode}
                  title={countryOption?.label || item.country || item.countryCode}
                >
                  <CountryFormContent
                    state={state}
                    data={item}
                    ref={(ref) => {
                      if (ref) {
                        countryFormRefs.current[item.countryCode] = ref;
                      } else {
                        delete countryFormRefs.current[item.countryCode];
                      }
                    }}
                  />
                </Tab.Item>
              );
            })}
        </Tab>
      </div>

      {countryList?.length > 0 && isEditable && (
        <div className="flex flex-col gap-[12px] w-full bg-[#fff] rounded-[6px] p-[12px]">
          <div className="flex justify-center items-center">
            <Checkbox
              checked={agreementChecked}
              onChange={(checked) => setAgreementChecked(checked)}
            >
              我已确认同意
              <a
                href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20250917192002592/20250917192002592.html?spm=a211ab.1c0e8fc5.0.0.d6f22896h37fh7"
                target="_blank"
                rel="noreferrer"
                className="!text-[#0077FF]"
                onClick={(e) => e.stopPropagation()}
              >
                《信息授权声明》
              </a>
            </Checkbox>
          </div>
          <div className="flex justify-center items-center">
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={countryList.length === 0 || Object.keys(uploadingStates).some((key) => uploadingStates[key]) || !agreementChecked}
              loading={Object.keys(uploadingStates).some((key) => uploadingStates[key])}
            >提交
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
