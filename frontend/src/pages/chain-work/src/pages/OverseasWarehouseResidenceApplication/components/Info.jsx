import React, { useState, useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import { AREA_CODE_LIST, OVERSEAS_MOBILE_MAP } from '../type';
import './info.scss';
import { queryEnums } from '@/pages/OverseasWarehouse/services';
import Message from '@/components/UI/Message';

const { Option } = Select;

const Info = ({ reviewStatus }) => {
  const form = Form.useFormInstance();
  const [selectedAreaCode, setSelectedAreaCode] = useState('');
  const [enums, setEnums] = useState({});
  const getPhoneValidationRules = (areaCode) => {
    const rules = [{ required: true, message: '请输入联系电话' }];
    if (areaCode && OVERSEAS_MOBILE_MAP[areaCode]) {
      const regex = OVERSEAS_MOBILE_MAP[areaCode];
      rules.push({
        pattern: regex,
        message: `请输入符合${areaCode}格式的有效电话号码`,
      });
    }
    return rules;
  };
  useEffect(() => {
    const currentAreaCode = form.getFieldValue('phoneAreaCode');
    if (currentAreaCode) {
      setSelectedAreaCode(currentAreaCode);
    }
  }, [form]);
  const handleAreaCodeChange = (value) => {
    setSelectedAreaCode(value);
    form.setFieldsValue({ phoneNumber: '' });
    form.validateFields(['phoneNumber']).catch(() => {});
  };

  useEffect(() => {
    queryEnums().then((res) => {
      const { model, success } = res;
      if (success) {
        setEnums(model);
      } else {
        Message._show({ content: '主营国家/地区请求异常，请稍后再试', type: 'error' });
      }
    });
  }, []);
  return (
    <div className="flex flex-col gap-[20px] p-[20px] rounded-[6px] bg-[#fff] info">
      <div className="text-[16px] text-[#333] font-medium leading-[19px]">基础信息</div>
      <div className="flex items-center">
        <div className="w-[120px] text-[14px] text-[#333] text-right pr-[8px]">
          <span className="text-red-500">*</span>联系人
        </div>
        <div className="flex-1">
          <Form.Item
            name="userName"
            rules={[{ required: true, message: '请输入联系人' }]}
            className="mb-0"
          >
            <Input style={{ width: '408px' }} disabled={['PASS', 'UNDER_REVIEW'].includes(reviewStatus)} />
          </Form.Item>
        </div>
      </div>
      <div className="flex items-start">
        <div className="w-[120px] text-[14px] text-[#333] text-right pr-[8px] pt-[8px]">
          <span className="text-red-500">*</span>联系电话
        </div>
        <div className="flex-1 flex gap-[8px]">
          <Form.Item
            name="phoneAreaCode"
            rules={[{ required: true, message: '请选择联系电话区号' }]}
            className="mb-0"
          >
            <Select
              placeholder="请选择联系电话区号"
              style={{ width: '100px' }}
              onChange={handleAreaCodeChange}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
              disabled={!['UNREGISTER_DRAFT', 'REJECT'].includes(reviewStatus) && ['PASS', 'UNDER_REVIEW'].includes(reviewStatus)}
            >
              {AREA_CODE_LIST.map((ele) => (
                <Option value={ele.areaCode} key={ele.areaCode} >
                  {ele.areaCode}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            rules={getPhoneValidationRules(selectedAreaCode)}
            className="mb-0"
            dependencies={['phoneAreaCode']}
          >
            <Input
              placeholder={
                            selectedAreaCode
                              ? `请输入符合${selectedAreaCode}格式的电话号码`
                              : '请先选择区号'
                        }
              style={{ width: '300px' }}
              disabled={
                ['UNREGISTER_DRAFT', 'REJECT'].includes(reviewStatus) ? false : (!selectedAreaCode || ['PASS', 'UNDER_REVIEW'].includes(reviewStatus))
              }
            />
          </Form.Item>
        </div>
      </div>
      <div className="flex items-start">
        <div className="w-[120px] text-[14px] text-[#333] text-right pr-[8px] pt-[8px]">
          <span className="text-red-500">*</span>主营国家/地区
        </div>
        <div className="flex-1">
          <Form.Item
            name="mainRegion"
            rules={[{ required: true, message: '请选择主营国家/地区' }]}
            className="mb-0"
          >
            <Select
              placeholder="请选择主营国家/地区"
              style={{ width: '408px' }}
              showSearch
              disabled={['PASS', 'UNDER_REVIEW'].includes(reviewStatus)}
              mode="multiple"
              maxTagCount={3}
            >
              {enums?.mainRegion?.map((ele) => <Option value={ele} key={ele} >{ele}</Option>)}
            </Select>
          </Form.Item>
        </div>
      </div>
    </div>
  );
};

export default Info;