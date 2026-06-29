import React, { useEffect, useState } from 'react';
import { Divider, Button, Icon } from '@alifd/next';
import RenderFieldExt from './RenderFieldExt';
import { SCHEMA_UPLOAD } from '../contanst';
import { SCHEMA_SELECT, SCHEMA_INPUT } from '@/components/CommonTable/contanst';
import { Image } from 'antd';

function EddInfo({
  field,
  queryEnumsList,
  eDDCompany,
  eDDUBOList,
  eddPromptMap,
  registrationStatu,
  othersCompanyCapitalSource,
  setOthersCompanyCapitalSource,
  othersCompanyWealthSource,
  setOthersCompanyWealthSource,
  companyEvidenceList,
  setCompanyEvidenceList,
  companyPhotoList,
  setCompanyPhotoList,
  restrictedCertificateList,
  setRestrictedCertificateList,
}) {
  const [List, setList] = useState([]);
  const [uboList, setUboList] = useState([]);
  const [visible, setVisible] = useState(false);
  const COMPANY_BUSINESS_LICENSE = {
    name: '公司真实性证明',
    fieldKey: 'eDDCompany_companyEvidenceList',
    type: SCHEMA_UPLOAD,
    opt: {
      desc: '最多上传1个文件，支持JPG、JPEG、PDF、PNG格式',
      listType: 'text',
      action: 'https://crossborder.1688.com/choice/upload',
      accept: '.jpg,.jpeg,.png,.pdf',
      multiple: true,
      rules: [{ required: true, message: '请上传公司真实性证明' }],
      rule: true,
      maxCount: 1,
      disabled: registrationStatu !== 'EDD_REJECT',
      onChange: ({ file, fileList }) => {
        setCompanyEvidenceList(fileList);
        if (fileList.filter((item) => item.response && !item.response.success)?.length) {
          field.setErrors({
            eDDCompany_companyEvidenceList: file?.response?.retMsg,
          });
          return false;
        } else {
          field.setErrors({
            eDDCompany_companyEvidenceList: null,
          });
        }
        field.setValue('eDDCompany_companyEvidenceList', fileList?.map((ele) => ({
          uploadFileKey: ele?.response?.result,
          uploadFileName: ele?.name,
        })));
      },
      fileList: companyEvidenceList,
      children: (
        <Button disabled={registrationStatu !== 'EDD_REJECT'}>点击上传</Button>
      ),
      flattenErrors: eddPromptMap['eDDCompany_companyEvidenceList'],
    },
  };
  // 公司办公室头照
  const COMPANY_OFFICE_PHOTO = {
    name: '公司办公室头照',
    fieldKey: 'eDDCompany_companyPhotoList',
    type: SCHEMA_UPLOAD,
    opt: {
      desc: '最多上传5个文件，支持JPG、JPEG、PDF、PNG格式',
      listType: 'picture-card',
      className: 'products-business-upload',
      maxCount: 5,
      action: 'https://crossborder.1688.com/choice/upload',
      accept: '.jpg,.jpeg,.png,.pdf',
      rules: [{ required: true, message: '请上传公司办公室头照' }],
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      onChange: ({ file, fileList }) => {
        setCompanyPhotoList(fileList);
        if (fileList.filter((item) => item.response && !item.response.success)?.length) {
          field.setErrors({
            eDDCompany_companyPhotoList: file?.response?.retMsg,
          });
          return false;
        } else {
          field.setErrors({
            eDDCompany_companyPhotoList: null,
          });
        }
        field.setValue('eDDCompany_companyPhotoList', fileList?.map((ele) => ({
          uploadFileKey: ele?.response?.result,
          uploadFileName: ele?.name,
        })));
      },
      fileList: companyPhotoList,
      children: (
        companyPhotoList?.length >= 5 ? null : (
          <div className="products-business-upload-text">
            <Icon type="add" />
            <div>上传</div>
          </div>
        )
      ),
      flattenErrors: eddPromptMap['eDDCompany_companyPhotoList'],
    },
  };
  // 特殊行业资质文件
  const SPECIAL_INDUSTRY_QUALIFICATION = {
    name: '特殊行业资质文件',
    fieldKey: 'eDDCompany_restrictedCertificateList',
    type: SCHEMA_UPLOAD,
    opt: {
      desc: (
        <div>
          最多上传1个文件，支持JPG、JPEG、PDF、PNG格式，特殊行业资质文件参考
          <span className="cursor-pointer text-[#0077ff] ml-[8px] mr-[8px]" onClick={() => setVisible(true)}>示例</span>
        </div>
      ),
      listType: 'text',
      className: 'products-business-upload',
      action: 'https://crossborder.1688.com/choice/upload',
      accept: '.jpg,.jpeg,.png,.pdf',
      rules: [{ required: true, message: '请上传特殊行业资质文件' }],
      rule: true,
      maxCount: 1,
      disabled: registrationStatu !== 'EDD_REJECT',
      onChange: ({ file, fileList }) => {
        setRestrictedCertificateList(fileList);
        if (fileList.filter((item) => item.response && !item.response.success)?.length) {
          field.setErrors({
            eDDCompany_restrictedCertificateList: file?.response?.retMsg,
          });
          return false;
        } else {
          field.setErrors({
            eDDCompany_restrictedCertificateList: null,
          });
        }
        field.setValue('eDDCompany_restrictedCertificateList', fileList?.map((ele) => ({
          uploadFileKey: ele?.response?.result,
          uploadFileName: ele?.name,
        })));
      },
      fileList: restrictedCertificateList,
      children: (
        <Button disabled={registrationStatu !== 'EDD_REJECT'}>点击上传</Button>
      ),
      flattenErrors: eddPromptMap['eDDCompany_restrictedCertificateList'],
    },
  };
  // 公司资金来源
  const COMPANY_FUND_SOURCE = {
    name: '公司资金来源',
    fieldKey: 'eDDCompany_companyCapitalSource',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      hasClear: true,
      style: { width: 320 },
      rules: [{ required: true, message: '请选择公司资金来源' }],
      flattenErrors: eddPromptMap['eDDCompany_companyCapitalSource'],
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      onChange: (value) => {
        field.setValue('eDDCompany_companyCapitalSource', value);
        setOthersCompanyCapitalSource(value === 'OTHERS');
        field.setValue('othersEDDCompany_companyCapitalSource', '');
      },
    },
    values: queryEnumsList['companyCapitalSource'],
  };
  const COMPANY_FUND_SOURCE_OTHERS = {
    name: '',
    fieldKey: 'eDDCompany_othersCompanyCapitalSource',
    type: SCHEMA_INPUT,
    opt: {
      placeholder: '请输入',
      hasClear: true,
      style: { width: 320 },
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      rules: [{ required: true, message: '请输入公司资金来源说明' }],
    },
  };
  // 公司财富来源
  const COMPANY_WEALTH_SOURCE = {
    name: '公司财富来源',
    fieldKey: 'eDDCompany_companyWealthSource',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      hasClear: true,
      style: { width: 320 },
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      rules: [{ required: true, message: '请选择公司财富来源' }],
      flattenErrors: eddPromptMap['eDDCompany_companyWealthSource'],
      onChange: (value) => {
        field.setValue('eDDCompany_companyWealthSource', value);
        setOthersCompanyWealthSource(value === 'OTHERS');
        field.setValue('eDDCompany_othersCompanyWealthSource', '');
      },
    },
    values: queryEnumsList['companyWealthSource'],
  };
  const COMPANY_WEALTH_SOURCE_OTHERS = {
    name: '',
    fieldKey: 'eDDCompany_othersCompanyWealthSource',
    type: SCHEMA_INPUT,
    opt: {
      placeholder: '请输入',
      hasClear: true,
      style: { width: 320 },
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      rules: [{ required: true, message: '请输入公司财富来源说明' }],
    },
  };
  // 预期月度收款次数
  const EXPECTED_MONTHLY_RECEIPT_TIMES = {
    name: '预期月度收款次数',
    fieldKey: 'eDDCompany_estimatedMonthlyCollectionTimes',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      hasClear: true,
      style: { width: 320 },
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      rules: [{ required: true, message: '请选择预期月度收款次数' }],
      flattenErrors: eddPromptMap['eDDCompany_estimatedMonthlyCollectionTimes'],
    },
    values: queryEnumsList['estimatedMonthlyCollectionTimes'],
  };
  // 预期月度收款金额（USD）
  const EXPECTED_MONTHLY_RECEIPT_AMOUNT = {
    name: '预期月度收款金额（USD）',
    fieldKey: 'eDDCompany_estimatedMonthlyCollectionAmount',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      hasClear: true,
      style: { width: 320 },
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      rules: [{ required: true, message: '请选择预期月度收款金额（USD）' }],
      flattenErrors: eddPromptMap['eDDCompany_estimatedMonthlyCollectionAmount'],
    },
    values: queryEnumsList['estimatedMonthlyCollectionAmount'],
  };
  // 预期月度提现次数
  const EXPECTED_MONTHLY_WITHDRAWAL_TIMES = {
    name: '预期月度提现次数',
    fieldKey: 'eDDCompany_estimatedMonthlyPaymentTimes',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      hasClear: true,
      style: { width: 320 },
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      rules: [{ required: true, message: '请选择预期月度提现次数）' }],
      flattenErrors: eddPromptMap['eDDCompany_estimatedMonthlyPaymentTimes'],
    },
    values: queryEnumsList['estimatedMonthlyPaymentTimes'],
  };
  // 预期月度提现金额（USD）
  const EXPECTED_MONTHLY_WITHDRAWAL_AMOUNT = {
    name: '预期月度提现金额（USD）',
    fieldKey: 'eDDCompany_estimatedMonthlyPaymentAmount',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      hasClear: true,
      style: { width: 320 },
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      rules: [{ required: true, message: '请选择预期月度提现金额（USD）' }],
      flattenErrors: eddPromptMap['eDDCompany_estimatedMonthlyPaymentAmount'],
    },
    values: queryEnumsList['estimatedMonthlyPaymentAmount'],
  };
  // 公司前一年收入（USD）
  const COMPANY_PREVIOUS_YEAR_INCOME = {
    name: '公司前一年收入（USD）',
    fieldKey: 'eDDCompany_corporateIncomeOfPriorYear',
    type: SCHEMA_SELECT,
    opt: {
      placeholder: '请选择',
      hasClear: true,
      style: { width: 320 },
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      rules: [{ required: true, message: '请选择公司前一年收入（USD）' }],
      flattenErrors: eddPromptMap['eDDCompany_corporateIncomeOfPriorYear'],
    },
    values: queryEnumsList['corporateIncomeOfPriorYear'],
  };
  // 姓名
  const NAME = {
    name: '姓名',
    fieldKey: 'name',
    type: SCHEMA_INPUT,
    title_style: 0,
    content_style: 'mb-0',
    opt: {
      placeholder: '请输入',
      disabled: true,
      style: { width: 300 },
    },
  };
  // UBO个人财富来源
  const UBO_PERSONAL_WEALTH_SOURCE = {
    name: 'UBO个人财富来源',
    fieldKey: 'wealthSource',
    type: SCHEMA_SELECT,
    title_style: 0,
    content_style: 'mb-0',
    opt: {
      placeholder: '请选择',
      hasClear: true,
      style: { width: 300 },
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      rules: [{ required: true, message: '请选择UBO个人财富来源' }],
    },
    values: queryEnumsList['uboWealthSource'],
  };
  // UBO个人资金来源
  const UBO_PERSONAL_FUND_SOURCE = {
    name: 'UBO个人资金来源',
    fieldKey: 'capitalSource',
    type: SCHEMA_SELECT,
    title_style: 0,
    content_style: 'mb-0',
    opt: {
      placeholder: '请选择',
      hasClear: true,
      style: { width: 300 },
      rule: true,
      disabled: registrationStatu !== 'EDD_REJECT',
      rules: [{ required: true, message: '请选择UBO个人资金来源' }],
    },
    values: queryEnumsList['uboCapitalSource'],
  };
  const eddinfo = (arr) => {
    const schema = arr.map((item) => {
      switch (item) {
        case 'estimatedMonthlyCollectionTimes':
          return EXPECTED_MONTHLY_RECEIPT_TIMES;
        case 'estimatedMonthlyCollectionAmount':
          return EXPECTED_MONTHLY_RECEIPT_AMOUNT;
        case 'estimatedMonthlyPaymentTimes':
          return EXPECTED_MONTHLY_WITHDRAWAL_TIMES;
        case 'estimatedMonthlyPaymentAmount':
          return EXPECTED_MONTHLY_WITHDRAWAL_AMOUNT;
        case 'corporateIncomeOfPriorYear':
          return COMPANY_PREVIOUS_YEAR_INCOME;
        case 'name':
          return NAME;
        case 'uboPersonalWealthSource':
          return UBO_PERSONAL_WEALTH_SOURCE;
        case 'uboPersonalFundSource':
          return UBO_PERSONAL_FUND_SOURCE;
        default:
          return null;
      }
    }).filter(Boolean);
    return schema;
  };
  const expectedOrder = [
    'estimatedMonthlyCollectionTimes',
    'estimatedMonthlyCollectionAmount',
    'estimatedMonthlyPaymentTimes',
    'estimatedMonthlyPaymentAmount',
    'corporateIncomeOfPriorYear',
  ];
  useEffect(() => {
    setList(eddinfo(expectedOrder.filter((item) => eDDCompany.includes(item))));
    setUboList(eddinfo(['name', 'uboPersonalWealthSource', 'uboPersonalFundSource']));
  }, [queryEnumsList, eDDCompany]);
  return (
    <div className="pb-[20px] px-[20px] bg-[#fff]">
      <div >
        {eDDCompany.includes('companyEvidenceList') && (
          <RenderFieldExt {...COMPANY_BUSINESS_LICENSE} field={field} />
        )}
        {eDDCompany.includes('companyPhotoList') && (
          <RenderFieldExt {...COMPANY_OFFICE_PHOTO} field={field} />
        )}
        {eDDCompany.includes('restrictedCertificateList') && (
          <RenderFieldExt {...SPECIAL_INDUSTRY_QUALIFICATION} field={field} />
        )}
        {eDDCompany.includes('companyCapitalSource') && (
          <RenderFieldExt {...COMPANY_FUND_SOURCE} field={field} />
        )}
        {othersCompanyCapitalSource && (
        <RenderFieldExt {...COMPANY_FUND_SOURCE_OTHERS} field={field} />
        )}
        {eDDCompany.includes('companyWealthSource') && (
          <RenderFieldExt {...COMPANY_WEALTH_SOURCE} field={field} />
        )}
        {othersCompanyWealthSource && (
        <RenderFieldExt {...COMPANY_WEALTH_SOURCE_OTHERS} field={field} />
        )}
        {List?.map((item) => <RenderFieldExt {...item} field={field} />)}
      </div>
      {eDDUBOList?.length > 0 && (
      <div className="p-[20px] bg-[#FAFAFA] alipay-international-edd-info mt-[32px]">
        {eDDUBOList?.map((ele, i) => (
          <div key={ele?.key}>
            <div className="flex">
              <div className="ml-[20px] text-[#333] text-[14px] font-[500] leading-[17px] mt-[32px]">UBO信息 {ele?.key}:</div>
              <div className="flex items-start">
                {uboList?.map((item) => {
                  return (
                    <div className="ml-[20px]">
                      <RenderFieldExt
                        {...item}
                        opt={{
                          ...item.opt,
                          flattenErrors: eddPromptMap[`${ele?.key}_eDDUBOList_${item.fieldKey}`],
                        }}
                        fieldKey={`${ele?.key}_eDDUBOList_${item.fieldKey}`}
                        field={field}
                        labelAlign="top"
                      />
                      {field.getValue(`${ele?.key}_eDDUBOList_${item.fieldKey}`) === 'OTHERS' && (
                        <RenderFieldExt
                          name=""
                          fieldKey={`${ele?.key}_eDDUBOList_${item.fieldKey}Others`}
                          type={SCHEMA_INPUT}
                          title_style={0}
                          content_style="mb-0"
                          opt={{
                            placeholder: '请输入',
                            hasClear: true,
                            style: { width: 300 },
                            disabled: registrationStatu !== 'EDD_REJECT',
                            rules: [{ required: true, message: `${item.opt.rules[0].message}说明` }],
                          }}
                          field={field}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {eDDUBOList?.length - 1 !== i && <Divider className="bg-[#E6E6E6] mt-[20px] mb-[20px]" />}
          </div>
        ))}
      </div>
      )}
      <Image
        style={{ display: 'none' }}
        src="https://img.alicdn.com/imgextra/i4/O1CN01PNzDd82988HnuoLkn_!!6000000008022-0-tps-4960-3507.jpg"
        preview={{
          visible,
          scaleStep: 0.5,
          src: 'https://img.alicdn.com/imgextra/i4/O1CN01PNzDd82988HnuoLkn_!!6000000008022-0-tps-4960-3507.jpg',
          onVisibleChange: (value) => {
            setVisible(value);
          },
        }}
      />
    </div>
  );
}

export default EddInfo;
