import React, { useEffect, useState } from 'react';
import Block from '@/layouts/Block';
import RenderFieldExt from './RenderFieldExt';
import { SCHEMA_RADIO_GROUP, SCHEMA_SELECT, SCHEMA_DATE_PICKER, SCHEMA_INPUT, SCHEMA_CHECKBOX } from '@/components/CommonTable/contanst';
import { SCHEMA_ADDRESS, SCHEMA_UPLOAD } from '../contanst';
import { Icon, Loading, Button } from '@alifd/next';
import { recognizeBusinessLicense, translateText } from '../services';
import Message from '@/components/UI/Message';
import moment from 'moment';

// 示例
const example = () => window.open('https://www.fadada.com/notice/detail-22356.html', '_blank');
function BasicCompanyInfor({ view, field, basicVisible, basicInfo, businessLicenseUrl, companyTypeChange, queryEnumsList, currentTime, businessLicenseChange, flattenErrorsMap, isFlattenErrors, setIsFlattenErrors, enterpriseAVCreditCode, setEnterpriseAVCreditCode, companyRuleUrlLists, isCompanyRuleUrl, setIsCompanyRuleUrl }) {
  const [businessLicenseColorList, setBusinessLicenseColorList] = useState([]); // 营业执照彩色影像件
  const [hasCompanyBusinessName, setHasCompanyBusinessName] = useState(true); // 公司经营名称是否与注册相同
  const [hasCompanyBusinessAddress, setHasCompanyBusinessAddress] = useState(true); // 公司经营地址是否与注册相同
  const [hasIpoCountryOrRegion, setIpoCountryOrRegion] = useState(false);
  const [hasVisible, setHasVisible] = useState(false);
  const [basicLoading, setBasicLoading] = useState(false);
  const [isLongTerm, setIsLongTerm] = useState(false); // 是否长期
  const [companyRuleUrlList, setCompanyRuleUrlList] = useState([]);
  useEffect(() => {
    if (businessLicenseUrl.length > 0) {
      setBusinessLicenseColorList(businessLicenseUrl);
    }
  }, [businessLicenseUrl]);
  useEffect(() => {
    if (companyRuleUrlLists.length > 0) {
      setCompanyRuleUrlList(companyRuleUrlLists);
    }
  }, [companyRuleUrlLists]);
  useEffect(() => {
    if (basicVisible && basicInfo) {
      setHasVisible(basicVisible);
      setHasCompanyBusinessName(basicInfo?.businessNameEqualRegistration);
      setHasCompanyBusinessAddress(basicInfo?.businessAddressEqualRegistration);
      setIpoCountryOrRegion(basicInfo?.isIPO);
      if (basicInfo?.validToDate) {
        setIsLongTerm(basicInfo?.validToDate === '长期');
      }
      if (basicInfo?.businessAddressEqualRegistration) {
        field.remove('companyInfo_businessAddress');
      }
    }
  }, [basicVisible, basicInfo]);
  const commonOptions = (overrides = {}) => ({
    placeholder: '请输入',
    hasClear: true,
    style: { width: 320 },
    disabled: view,
    ...overrides,
  });
  // 统一社会信用代码
  const UNIFIED_SOCIAL_CREDIT_CODE = {
    name: '统一社会信用代码',
    fieldKey: 'companyInfo_creditCode',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入统一社会信用代码' }],
      onChange: (value) => {
        field.setErrors({
          companyInfo_creditCode: value === enterpriseAVCreditCode ? null : '请使用1688注册店铺对应的工商登记主体进行支付宝国际账号申请',
        });
        field.setValue('companyInfo_creditCode', value);
      },
    }),
  };

  // 公司名称（中文）
  const COMPANY_NAME_CHINESE = {
    name: '公司名称（中文）',
    fieldKey: 'companyInfo_companyName',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入公司名称（中文）' }],
      onChange: (value) => {
        field.setErrors({
          companyInfo_companyName: null,
          companyInfo_englishCompanyName: null,
        });
        translateText({
          request: [
            {
              translateKey: 'companyInfo_englishCompanyName',
              translateText: value,
            },
          ],
        }).then((res) => {
          const { model, success, msg } = res;
          if (success) {
            field.setValues(model);
          } else {
            Message._show({ content: msg || '数据异常', type: 'error' });
          }
        }).catch((err) => {
          Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
        });
        field.setValue('companyInfo_companyName', value);
      },
      flattenErrors: isFlattenErrors ? '' : flattenErrorsMap['companyInfo_companyName'],
    }),
  };

  // 公司名称（英文）
  const COMPANY_NAME_ENGLISH = {
    name: '公司名称（英文）',
    fieldKey: 'companyInfo_englishCompanyName',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入公司名称（英文）' }],
    }),
  };
  // 公司类型
  const COMPANY_TYPE = {
    name: '公司类型',
    fieldKey: 'companyInfo_companyType',
    type: SCHEMA_SELECT,
    opt: commonOptions({
      popupClassName: 'company-type',
      placeholder: '请选择',
      nameStyle: { alignItems: 'normal' },
      rules: [{ required: true, message: '请选择公司类型' }],
      onChange: (value) => {
        setIsCompanyRuleUrl(value === 'STOCK_COOPERATION_SYSTEM' || value === 'RURAL_COOPERATIVES');
        field.setErrors({
          companyInfo_companyType: null,
          companyInfo_companyRuleUrl: null,
        });
        setCompanyRuleUrlList([]);
        companyTypeChange(value);
        field.setValues({
          companyInfo_companyType: value,
          companyInfo_companyRuleKey: '',
          companyInfo_companyRuleFileName: '',
        });
      },
    }),
    values: queryEnumsList['companyType'],
  };
  // 注册地址（中文）
  const REGISTER_ADDRESS_IN_CHINESE = {
    name: '注册地址（中文）',
    fieldKey: 'companyInfo_address',
    type: SCHEMA_ADDRESS,
    opt: commonOptions({
      placeholder: '选择注册地址',
      maxLevel: 4,
      rules: [{
        required: true,
        message: '请选择注册地址（中文）',
      }],
      value: field.getValue('companyInfo_address'),
      onChange: (value) => {
        field.setErrors({
          companyInfo_address: null,
          companyInfo_addressEnglish: null,
        });
        translateText({
          request: [
            {
              translateKey: 'provinceName',
              translateText: value?.provinceName,
            },
            {
              translateKey: 'cityName',
              translateText: value?.cityName,
            },
            {
              translateKey: 'areaName',
              translateText: value?.areaName,
            },
            {
              translateKey: 'townName',
              translateText: value?.townName,
            },
          ],
        }).then((res) => {
          const { model, success, msg } = res;
          if (success) {
            field.setValues({
              companyInfo_addressEnglish: `${model?.provinceName || ''} ${model?.cityName || ''} ${model?.areaName || ''} ${model?.townName || ''}`,
            });
          } else {
            Message._show({ content: msg || '数据异常', type: 'error' });
          }
        }).catch((err) => {
          Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
        });
        field.setValues({
          companyInfo_address: value,
        });
      },
    }),
  };
  const ADDRESS_DETAILS_IN_CHINESE = {
    fieldKey: 'companyInfo_addressDetails',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入地址详情' }],
      onChange: (value) => {
        field.setErrors({
          companyInfo_addressDetails: null,
          companyInfo_addressEnglishDetails: null,
        });
        translateText({
          request: [
            {
              translateKey: 'companyInfo_addressEnglishDetails',
              translateText: value,
            },
          ],
        }).then((res) => {
          const { model, success, msg } = res;
          if (success) {
            field.setValues(model);
          } else {
            Message._show({ content: msg || '数据异常', type: 'error' });
          }
        }).catch((err) => {
          Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
        });
        field.setValues({
          companyInfo_addressDetails: value,
        });
      },
    }),
  };
  const REGISTER_ADDRESS_ENGLISH = {
    name: '注册地址（英文）',
    fieldKey: 'companyInfo_addressEnglish',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入注册地址（英文）' }],
      disabled: true,
    }),
  };
  const ADDRESS_DETAILS_ENGLISH = {
    fieldKey: 'companyInfo_addressEnglishDetails',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入地址详情' }],
    }),
  };
  const BUSINESS_LICENSE_COLOR_IMAGE = {
    name: '营业执照彩色影像件',
    fieldKey: 'companyInfo_businessLicenseUrl',
    type: SCHEMA_UPLOAD,
    opt: {
      desc: '营业执照需在有效期内',
      listType: 'picture-card',
      action: 'https://crossborder.1688.com/choice/upload',
      accept: '.jpg,.jpeg,.png,.pdf',
      disabled: view,
      rules: [
        {
          validator: (rule, value, callback) => {
            if (value?.length > 0) {
              callback();
            } else {
              callback('请上传营业执照彩色影像件');
            }
          },
        },
      ],
      className: 'products-business-upload',
      onRemove: () => {
        setIsFlattenErrors(true);
        setBasicLoading(false);
        setBusinessLicenseColorList([]);
        field.setValues({
          companyInfo_businessLicenseKey: '',
          companyInfo_businessLicenseUrl: '',
          companyInfo_creditCode: '',
          companyInfo_companyName: '',
          companyInfo_englishCompanyName: '',
          companyInfo_companyType: '',
          companyInfo_addressDetails: '',
          companyInfo_addressEnglishDetails: '',
          companyInfo_registrationDate: '',
          companyInfo_validToDate: '',
          companyInfo_industryType: '',
          companyInfo_businessNameEqualRegistration: '',
          companyInfo_businessName: '',
          companyInfo_businessAddressEqualRegistration: '',
          companyInfo_businessAddressDetail: '',
          companyInfo_companyEmail: '',
          companyInfo_isIPO: '',
          companyInfo_stockMarket: '',
          companyInfo_address: '',
          companyInfo_businessAddress: {
            addressCodeText: '',
            province: '',
            city: '',
            area: '',
            town: '',
          },
          companyInfo_businessAddressDetails: '',
        });
        setHasVisible(false);
      },
      onChange: ({ file, fileList }) => {
        const { status } = file;
        setBusinessLicenseColorList(fileList);
        if (fileList.filter((item) => item.response && !item.response.success)?.length > 0) {
          field.setErrors({
            companyInfo_businessLicenseUrl: file?.response?.retMsg,
          });
          return false;
        } else {
          field.setErrors({
            companyInfo_businessLicenseUrl: null,
            companyInfo_businessLicenseKey: null,
            companyInfo_creditCode: null,
            companyInfo_companyName: null,
            companyInfo_englishCompanyName: null,
            companyInfo_companyType: null,
            companyInfo_registrationDate: null,
            companyInfo_validToDate: null,
            companyInfo_companyEmail: null,
            companyInfo_industryType: null,
            companyInfo_address: null,
            companyInfo_addressDetails: null,
            companyInfo_addressEnglish: null,
            companyInfo_addressEnglishDetails: null,
            companyInfo_businessAddress: null,
            companyInfo_businessAddressDetails: null,
            companyInfo_stockMarket: null,
            companyInfo_businessAddressDetail: null,
            companyInfo_businessName: null,
            companyInfo_companyRuleUrl: null,
          });
        }
        if (status === 'done') {
          field.setValues({
            companyInfo_businessLicenseUrl: file.response.result,
            companyInfo_businessLicenseKey: file.response.result,
          });
          setBasicLoading(true);
          recognizeBusinessLicense({
            request: {
              imageKey: file.response.result,
            },
          }).then((res) => {
            const { model, success, msg } = res;
            if (success && model) {
              setHasVisible(true);
              companyTypeChange(model?.companyType);
              businessLicenseChange(model?.uBOPersonInfoList);
              setEnterpriseAVCreditCode(model?.enterpriseAVCreditCode);
              setIsCompanyRuleUrl(model?.companyType === 'STOCK_COOPERATION_SYSTEM' || model?.companyType === 'RURAL_COOPERATIVES');
              setIsLongTerm(model?.validToDate === '长期');
              field.setValues({
                companyInfo_businessLicenseKey: file.response.result,
                companyInfo_businessLicenseUrl: file.response.result,
                companyInfo_creditCode: model?.creditCode,
                companyInfo_companyName: model?.companyName,
                companyInfo_englishCompanyName: model?.englishCompanyName,
                companyInfo_companyType: model?.companyType,
                companyInfo_registrationDate: model?.registrationDate,
                companyInfo_validToDate: model?.validToDate,
                companyInfo_companyEmail: model?.companyEmail,
                companyInfo_industryType: model?.industryType,
                companyInfo_address: {
                  addressCodeText: `${model?.registrationAddress?.province || ''} ${model?.registrationAddress?.city || ''} ${model?.registrationAddress?.area || ''} ${model?.registrationAddress?.town || ''}`,
                  province: model?.registrationAddress?.province,
                  city: model?.registrationAddress?.city,
                  area: model?.registrationAddress?.area,
                  town: model?.registrationAddress?.town,
                },
                companyInfo_addressDetails: model?.registrationAddress?.address,
                companyInfo_addressEnglish: `${model?.englishRegistrationAddress?.province || ''} ${model?.englishRegistrationAddress?.city || ''} ${model?.englishRegistrationAddress?.area || ''} ${model?.englishRegistrationAddress?.town || ''}`,
                companyInfo_addressEnglishDetails: model?.englishRegistrationAddress?.address,
                companyInfo_businessNameEqualRegistration: true,
                companyInfo_businessAddressEqualRegistration: true,
                companyInfo_isIPO: false,
              });
              setBasicLoading(false);
              setHasCompanyBusinessName(true);
              setHasCompanyBusinessAddress(true);
              setIpoCountryOrRegion(false);
              if (model?.validToDate !== '长期') {
                field.setErrors({
                  companyInfo_validToDate: moment(model?.validToDate)?.valueOf() <= currentTime ? '需使用有效期内的营业执照进行注册' : null,
                });
              }
              field.setErrors({
                companyInfo_creditCode: model?.enterpriseAVCreditCode === model?.creditCode ? null : '请使用1688注册店铺对应的工商登记主体进行支付宝国际账号申请',
              });
            } else {
              setBasicLoading(false);
              setBusinessLicenseColorList([
                {
                  uid: '-1',
                  name: 'image.png',
                  status: 'error',
                  url: 'https://img.alicdn.com/imgextra/i4/O1CN01fYlHbe1hEiivqorAO_!!6000000004246-2-tps-100-100.png',
                },
              ]);
              Message._show({ content: msg || '数据异常', type: 'error' });
            }
          }).catch((err) => {
            setBusinessLicenseColorList([
              {
                uid: '-1',
                name: 'image.png',
                status: 'error',
                url: 'https://img.alicdn.com/imgextra/i4/O1CN01fYlHbe1hEiivqorAO_!!6000000004246-2-tps-100-100.png',
              },
            ]);
            setBasicLoading(false);
            Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
          });
        }
      },
      fileList: businessLicenseColorList,
      children: (
        businessLicenseColorList.length >= 1 ? null : (
          <div className="products-business-upload-text">
            <Icon type="add" />
            <div>上传</div>
          </div>
        )
      ),
    },
  };
  // 注册日期
  const REGISTRATION_DATE = {
    name: '注册日期',
    fieldKey: 'companyInfo_registrationDate',
    type: SCHEMA_DATE_PICKER,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入注册日期' }],
      onChange: (value) => {
        field.setErrors({
          companyInfo_registrationDate: null,
        });
        field.setValue('companyInfo_registrationDate', value);
      },
      flattenErrors: isFlattenErrors ? '' : flattenErrorsMap['companyInfo_registrationDate'],
    }),
  };

  // 营业执照失效日期
  const BUSINESS_LICENSE_EXPIRY_DATE = {
    name: '营业执照失效日期',
    fieldKey: 'companyInfo_validToDate',
    type: SCHEMA_DATE_PICKER,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入营业执照失效日期' }],
      onChange: (value) => {
        field.setErrors({
          companyInfo_validToDate: value?.valueOf() <= currentTime ? '需使用有效期内的营业执照进行注册' : null,
        });
        field.setValue('companyInfo_validToDate', value);
      },
      flattenErrors: isFlattenErrors ? '' : flattenErrorsMap['companyInfo_validToDate'],
    }),
  };

  // 主营行业
  const MAIN_INDUSTRY = {
    name: '主营行业',
    fieldKey: 'companyInfo_industryType',
    type: SCHEMA_SELECT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入主营行业' }],
    }),
    values: queryEnumsList['industryType'],
  };

  // 公司经营名称
  const COMPANY_BUSINESS_NAME = {
    name: '公司经营名称',
    fieldKey: 'companyInfo_businessName',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入公司经营名称' }],
    }),
  };
  // 公司经营地址
  const COMPANY_BUSINESS_ADDRESS = {
    name: '公司经营地址',
    fieldKey: 'companyInfo_businessAddress',
    type: SCHEMA_ADDRESS,
    opt: commonOptions({
      maxLevel: 4,
      placeholder: '选择公司经营地址',
      rules: [{ required: true, message: '请选择公司经营地址' }],
    }),
  };
  // 公司经营地址详情
  const COMPANY_BUSINESS_ADDRESS_DETAIL = {
    fieldKey: 'companyInfo_businessAddressDetails',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入公司经营地址详情' }],
    }),
  };

  // 公司联系邮箱
  const COMPANY_CONTACT_EMAIL = {
    name: '公司联系邮箱',
    fieldKey: 'companyInfo_companyEmail',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      desc: '此邮箱将用于支付宝国际账户的登录和资金的提取，请确保邮箱真实有效',
      rules: [
        { required: true, message: '请输入公司联系邮箱' },
        {
          pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
          message: '邮箱地址格式不正确',
          trigger: 'onChange',
        },
      ],
    }),
  };
  // IPO国家/地区
  const IPO_COUNTRY_OR_REGION = {
    name: 'IPO国家/地区',
    fieldKey: 'companyInfo_stockMarket',
    type: SCHEMA_SELECT,
    opt: commonOptions({
      placeholder: '请选择',
      nameStyle: { alignItems: 'normal' },
      showSearch: true,
      rules: [{ required: true, message: '请选择IPO国家/地区' }],
    }),
    values: queryEnumsList['regionType'],
  };
  // 公司经营名称是否与注册相同
  const COMPANY_NAME_CHINESE_IS_SAME_AS_REGISTER = {
    name: '公司经营名称是否与注册相同',
    fieldKey: 'companyInfo_businessNameEqualRegistration',
    type: SCHEMA_RADIO_GROUP,
    opt: commonOptions({
      initValue: field.getValue('companyInfo_businessNameEqualRegistration'),
      onChange: (value) => {
        field.setErrors({
          companyInfo_businessNameEqualRegistration: null,
        });
        setHasCompanyBusinessName(value);
        field.setValue('companyInfo_businessNameEqualRegistration', value);
      },
    }),
    values: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  };
  // 公司经营地址是否与注册相同
  const COMPANY_ADDRESS_IS_SAME_AS_REGISTER = {
    name: '公司经营地址是否与注册相同',
    fieldKey: 'companyInfo_businessAddressEqualRegistration',
    type: SCHEMA_RADIO_GROUP,
    opt: commonOptions({
      initValue: field.getValue('companyInfo_businessAddressEqualRegistration'),
      onChange: (value) => {
        field.setErrors({
          companyInfo_businessAddressEqualRegistration: null,
        });
        if (value) {
          field.remove('companyInfo_businessAddress');
        }
        field.setValue('companyInfo_businessAddressEqualRegistration', value);
        setHasCompanyBusinessAddress(value);
      },
    }),
    values: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  };
  // 是否IPO
  const IS_IPO = {
    name: '是否IPO',
    fieldKey: 'companyInfo_isIPO',
    type: SCHEMA_RADIO_GROUP,
    opt: commonOptions({
      initValue: field.getValue('companyInfo_isIPO'),
      onChange: (value) => {
        field.setErrors({
          companyInfo_isIPO: null,
        });
        field.setValue('companyInfo_isIPO', value);
        setIpoCountryOrRegion(value);
      },
    }),
    values: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  };
  // 长期
  const BUSINESS_LICENSE_EXPIRY = {
    name: '营业执照失效日期',
    fieldKey: 'companyInfo_validToDates',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      initValue: '/',
      value: field.getValue('companyInfo_validToDates') ? '/' : '',
      disabled: true,
    }),
  };
  const BUSINESS_LICENSE_EXPIRY_DATE_BOX = {
    name: '长期有效',
    type: SCHEMA_CHECKBOX,
    opt: commonOptions({
      style: { width: 100 },
      checked: isLongTerm,
      onChange: (value) => {
        setIsLongTerm(value);
        if (value) {
          field.setValue('companyInfo_validToDates', '长期');
          field.setError('companyInfo_validToDate', null);
        } else {
          field.setValue('companyInfo_validToDates', '');
          field.setValue('companyInfo_validToDate', '');
        }
      },
    }),
  };
  const COMPANY_RULE_URL = { // 公司章程（选填，尽量提供）
    name: '公司章程（选填，尽量提供）',
    fieldKey: 'companyInfo_companyRuleUrl',
    type: SCHEMA_UPLOAD,
    opt: commonOptions({
      desc: <div>支持上传1个Word或PDF文件。<span className="text-[#0077FF] cursor-pointer" onClick={example}>参考示例</span></div>,
      listType: 'text',
      action: 'https://crossborder.1688.com/choice/uploadWordAndPdf',
      accept: '.doc, .docx, .pdf, application/msword, application/pdf',
      multiple: true,
      maxCount: 1,
      onChange: ({ file, fileList }) => {
        setCompanyRuleUrlList(fileList);
        if (fileList.filter((item) => item.response && !item.response.success)?.length) {
          field.setErrors({
            companyInfo_companyRuleUrl: file?.response?.retMsg,
          });
          return false;
        } else {
          field.setErrors({
            companyInfo_companyRuleUrl: null,
          });
        }
        field.setValues({
          companyInfo_companyRuleKey: file?.response?.result,
          companyInfo_companyRuleFileName: file?.name,
        });
      },
      fileList: companyRuleUrlList,
      children: (
        <Button disabled={view}>点击上传</Button>
      ),
    }),
  };
  return (
    <Block
      title={
        <div>
          <span className="text-[#FB3B20]">* </span>
          <span className="text-[16px]">公司基本信息</span>
          <span className="text-[12px] text-[#999] ml-[4px]">证件上传完成后可对展开的字段进行编辑</span>
        </div>
      }
    >
      <Loading tip="加载中..." visible={basicLoading} style={{ width: '100%' }}>
        <div className="flex flex-wrap alipay-international-edd-info">
          <div className="w-[48%]">
            <RenderFieldExt {...BUSINESS_LICENSE_COLOR_IMAGE} field={field} />
            {hasVisible && [
              UNIFIED_SOCIAL_CREDIT_CODE,
              COMPANY_NAME_CHINESE,
              COMPANY_NAME_ENGLISH,
              COMPANY_TYPE,
              REGISTER_ADDRESS_IN_CHINESE,
              ADDRESS_DETAILS_IN_CHINESE,
              REGISTER_ADDRESS_ENGLISH,
              ADDRESS_DETAILS_ENGLISH,
            ].map((ele) => (
              <RenderFieldExt {...ele} field={field} />
            ))}
          </div>
          {hasVisible && (
            <div className="w-[48%] item-center">
              <RenderFieldExt {...REGISTRATION_DATE} field={field} />
              {isLongTerm ? <RenderFieldExt {...BUSINESS_LICENSE_EXPIRY} field={field} /> : <RenderFieldExt {...BUSINESS_LICENSE_EXPIRY_DATE} field={field} />}
              <div className="pl-[182px]">
                <div className="mt-[8px] w-[100px] flex items-center ml-[12px] checkbox-long-term">
                  <RenderFieldExt {...BUSINESS_LICENSE_EXPIRY_DATE_BOX} field={field} content_style="1" />
                </div>
              </div>
              {[MAIN_INDUSTRY, COMPANY_NAME_CHINESE_IS_SAME_AS_REGISTER].map((ele) => (
                <RenderFieldExt {...ele} field={field} />
              ))}
              {!hasCompanyBusinessName && <RenderFieldExt {...COMPANY_BUSINESS_NAME} field={field} />}
              <RenderFieldExt {...COMPANY_ADDRESS_IS_SAME_AS_REGISTER} field={field} />
              {!hasCompanyBusinessAddress && [COMPANY_BUSINESS_ADDRESS, COMPANY_BUSINESS_ADDRESS_DETAIL].map((ele) => (
                <RenderFieldExt {...ele} field={field} />
              ))}
              {[COMPANY_CONTACT_EMAIL, IS_IPO].map((ele) => (
                <RenderFieldExt {...ele} field={field} />
              ))}
              {hasIpoCountryOrRegion && <RenderFieldExt {...IPO_COUNTRY_OR_REGION} field={field} />}
              {isCompanyRuleUrl && <RenderFieldExt {...COMPANY_RULE_URL} field={field} />}
            </div>
          )}
        </div>
      </Loading>
    </Block>
  );
}

export default BasicCompanyInfor;
