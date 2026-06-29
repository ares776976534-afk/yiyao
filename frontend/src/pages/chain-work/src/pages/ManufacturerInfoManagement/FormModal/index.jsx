import React, { useState, useEffect } from 'react';
import { Dialog, Button, Field, Form, Input, Select, Search } from '@alifd/next';
import ReactDOM from 'react-dom';
import { queryTranslate, queryAreaInfo } from '@/service/common';
import './index.scss';
import { MessageError } from '@/utlis';
import { useDebounceFn } from 'ahooks';
import { nameKeyWords, includesNameKeyWords } from '@/components/schema/ManufactureInfoManagement';
import AddressPicker from '@ali/ctf-lib-antd-address-picker';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 16,
  },
};
const container = document.createElement('div');
function FormModal({ props }) {
  const { title = '标题', width = 600, onSubmit = () => { }, subName = '确定', values = {} } = props;
  const field = Field.useField({
    parseName: true,
    onChange: (key, value) => {
      field.setValue(key, value);
    },
  });
  const { validate, getValues } = field;
  const [visible, setVisible] = useState(true);
  const [phoneSetter, setPhoneSetter] = useState([
    { value: '', label: '' },
  ]);
  const [addressList, setAddressList] = useState([{
    value: '',
    label: '',
  }]);
  const [areaCodeValue, setAreaCodeValue] = useState([{ value: values?.areaCode }]);
  const dialogRef = React.createRef();
  useEffect(() => {
    queryAreaInfo({ queryType: 2, name: 'phoneNumber' }).then((res) => {
      setPhoneSetter(res);
    });
    queryAreaInfo({ queryType: 0, name: 'manufacturerAddress' }).then((res) => {
      setAddressList(res);
    });
    field.setValue('addressDetail', values?.addressDetail);
  }, []);
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };
  const { run: onManufacturerNameCnChange } = useDebounceFn(
    (v) => {
      queryTranslate({ sourceText_cn: v }).then((res) => {
        const { content = {} } = res;
        const { success, message, data } = content;
        if (success) {
          field.setValue('manufacturerNameEn', data?.translated);
        } else {
          MessageError(message || '系统异常');
        }
      });
    },
    { wait: 300 },
  );
  const { run: onDetailedAddressCnChange } = useDebounceFn(
    (v) => {
      queryTranslate({ sourceText_cn: v }).then((res) => {
        const { content } = res;
        const { success, message, data } = content;
        if (success) {
          field.setValue('detailedAddressEn', data?.translated);
        } else {
          MessageError(message || '系统异常');
        }
      });
    },
    { wait: 300 },
  );
  // 提交
  const handleSubmit = () => {
    validate((errors) => {
      if (errors) {
        return;
      }
      if (!areaCodeValue[0].value) {
        return MessageError('区号不能为空');
      }
      const _values = getValues();
      onSubmit({
        ..._values,
        areaCode: areaCodeValue[0].value,
      });
      onClose();
    });
  };
  const onFilterChange = (v) => {
    setAreaCodeValue([{ value: v }]);
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title={title}
      onClose={onClose}
      visible={visible}
      footer={
        <div className="flex items-center justify-center button-info gap-[8px]">
          <Button type="primary" onClick={handleSubmit}>{subName}</Button>
          <Button onClick={onClose}>取消</Button>
        </div>
      }
      className="form-modals rounded-[12px] h-[627px]"
      width={width}
    >
      <Form {...formItemLayout} field={field} labelAlign="left" className="mt-[20px] mb-[0px]">
        <FormItem
          name="manufacturerNameCn"
          label="制造商名称"
          required
          requiredMessage="制造商名称不能为空"
          className="mb-[8px]"
          maxLength={100}
          validator={(rule, v, callback) => {
            if (!includesNameKeyWords(v, nameKeyWords)) {
              callback(`制造商名称必须包含${nameKeyWords.join('、')}`);
            }
            callback();
          }}
        >
          <Input
            style={{ borderRadius: 6 }}
            placeholder="请输入中文，输入后将同步翻译为英文"
            hasClear
            onChange={(v) => onManufacturerNameCnChange(v)}
            defaultValue={values?.manufacturerNameCn}
          />
        </FormItem>
        <FormItem
          label=""
          name="manufacturerNameEn"
          required
          requiredMessage="制造商名称翻译不能为空"
          wrapperCol={{ offset: 7, span: 16 }}
          className="mb-[20px]"
        >
          <Input style={{ borderRadius: 6 }} placeholder="请输入英文" hasClear defaultValue={values?.manufacturerNameEn} />
        </FormItem>
        <FormItem
          label="制造商地址"
          name="manufacturerAddress"
          required
          requiredMessage="制造商地址不能为空"
          className="mb-[20px]"
        >
          <Select
            placeholder="请选择国家/地区"
            style={{ width: '280px', borderRadius: '6px' }}
            hasClear
            onChange={(v) => {
              queryAreaInfo({ queryType: 3, name: 'manufacturerAddressPhone', value: v }).then((res) => {
                setAreaCodeValue(res);
              });
            }}
            showSearch
            className="manufacturerAddress"
            defaultValue={values?.manufacturerAddress}
          >
            {addressList.map((ele) => <option value={ele?.value} key={ele?.value}>{ele?.label}</option>)}
          </Select>
        </FormItem>
        <FormItem
          label="请选择省、市、区"
          name="addressDetail"
          required
          requiredMessage="省、市、区"
        >
          <AddressPicker />
        </FormItem>
        <FormItem
          label="邮政编码"
          name="zipCode"
          required
          requiredMessage="请输入6位数字邮编"
          validator={(rule, v, callback) => {
            if (v) {
              const reg = /^[0-9]*$/;
              if (!reg.test(v)) {
                callback('请输入6位数字邮编');
              }
              callback();
            } else {
              callback('邮政编码不能为空');
            }
          }}
        >
          <Input
            placeholder="请输入6位数字邮编"
            maxLength={6}
            hasClear
            defaultValue={values?.zipCode}
          />
        </FormItem>
        <FormItem
          label="详细地址"
          name="detailedAddressCn"
          required
          requiredMessage="详细地址不能为空"
          className="mb-[8px]"
          maxLength={200}
        >
          <Input.TextArea
            placeholder="请输入中文，输入后将同步翻译为英文"
            hasClear
            style={{ width: '100%', borderRadius: 6 }}
            onChange={(v) => onDetailedAddressCnChange(v)}
            maxLength={500}
            rows={7}
            showLimitHint
            defaultValue={values?.detailedAddressCn}
          />
        </FormItem>
        <FormItem
          name="detailedAddressEn"
          required
          requiredMessage="详细地址翻译不能为空"
          wrapperCol={{ offset: 7, span: 16 }}
          className="mb-[20px]"
        >
          <Input.TextArea
            style={{ width: '100%', borderRadius: 6 }}
            maxLength={500}
            rows={7}
            placeholder="请输入英文"
            hasClear
            showLimitHint
            defaultValue={values?.detailedAddressEn}
          />
        </FormItem>
        <FormItem
          label="手机/固定电话号码"
          name="phoneNumber"
          required
          requiredMessage="手机/固定电话号码不能为空"
          className="mb-[20px]"
          validator={(rule, v, callback) => {
            if (v) {
              const reg = /^[0-9]*$/;
              if (!reg.test(v)) {
                callback('电话号码只能为数字');
              }
              callback();
            } else {
              callback('电话号码不能为空');
            }
          }}
        >
          <Search
            defaultFilterValue={areaCodeValue[0]?.value}
            filterValue={areaCodeValue[0]?.value}
            filter={phoneSetter}
            onFilterChange={onFilterChange}
            placeholder="请输入"
            hasClear
            hasIcon={false}
            type="normal"
            shape="simple"
            style={{ width: '280px', borderRadius: '6px' }}
            defaultValue={values?.phoneNumber}
            className="phoneNumber"
          />
        </FormItem>
        <FormItem
          label="电子邮箱"
          name="email"
          format="email"
          required
          requiredMessage="电子邮箱不能为空"
          useLabelForErrorMessage
          className="mb-[0px]"
        >
          <Input style={{ borderRadius: 6 }} placeholder="请输入邮箱地址" hasClear defaultValue={values?.email} />
        </FormItem>
      </Form>
    </Dialog>
  );
}

FormModal.open = (props) => {
  ReactDOM.render(<FormModal props={props} />, container);
};

export default FormModal;
