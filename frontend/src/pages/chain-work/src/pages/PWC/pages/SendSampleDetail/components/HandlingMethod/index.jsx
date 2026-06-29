import React, { useEffect, useState } from 'react';
import { Form, Select, Radio, Field, Button, Input } from '@alifd/next';
import { transformFieldLabel } from '@/utlis';
import { getReturnAdd } from '@/pages/PWC/service';
import { STATUS_ARREARS } from '@/pages/PWC/constants';

const RadioGroup = Radio.Group;
const { Option } = Select;

const formItemLayout = {
  labelCol: { fixedSpan: 5 },
};

const formItemStyle = {
  color: '#333',
};

const formItemDefaultSetting = {
  labelAlign: 'left',
  style: formItemStyle,
  labelTextAlign: 'right',
  ...formItemLayout,
};

export default ({ getFieldInstance, preview = false, tableData = [] }) => {
  const [addData, setAddData] = useState([]);
  const isArrears = tableData.some((table = []) => table.some((item = {}) => item.status === STATUS_ARREARS));

  const field = Field.useField({
    autoUnmount: false,
  });

  const handleAddChange = (values) => {
    const address = addData.find((item) => item.returnAddressId === values.returnAddressId);
    const addressText = address?.returnAddress;
    field.setValue('returnAddress', addressText);
  };

  const handleFormChange = (values, item) => {
    const {
      name,
    } = item;
    switch (name) {
      case 'returnAddressId':
        handleAddChange(values);
        break;
      default:
        break;
    }
  };

  const getAddData = () => {
    getReturnAdd().then((res) => {
      setAddData(res);
    });
  };

  const showAddress = () => {
    return field?.getValue('dealType') === 'RETURN';
  };

  const jumpModifyAddress = () => {
    window.open('https://work.1688.com/?_path_=gonghuotuoguan/lvyue/sendGoodsAddressManage', '_blank');
  };

  useEffect(() => {
    getFieldInstance && getFieldInstance(field);
    getAddData();
  }, []);

  useEffect(() => {
    if (isArrears) {
      field.setValue('dealType', 'DESTROY');
    }
  }, [isArrears]);

  return (
    <Form field={field} inline={false} style={{ marginBottom: '-16px' }} isPreview={preview} onChange={handleFormChange}>
      <Form.Item
        label={transformFieldLabel('处理方式', preview)}
        name="dealType"
        required
        {...formItemDefaultSetting}
      >
        <RadioGroup defaultValue={isArrears ? 'DESTROY' : 'RETURN'}>
          <Radio value="RETURN" disabled={isArrears}>寄回</Radio>
          <Radio value="DESTROY">销毁</Radio>
        </RadioGroup>
      </Form.Item>
      {showAddress() && (
        <>
          <Form.Item
            label={transformFieldLabel('寄回地址', preview)}
            name="returnAddressId"
            required
            requiredMessage="请输入寄回地址"
            {...formItemDefaultSetting}
          >
            <Select style={{ width: 400 }}>
              {
                addData.map((item) => (
                  <Option key={item.returnAddressId} value={item.returnAddressId}>{item.returnAddress}</Option>
                ))
              }
            </Select>
            {!preview ? <Button text type="primary" style={{ margin: '0 0 0 12px' }} onClick={jumpModifyAddress}>修改地址</Button> : null}
          </Form.Item>
          <Form.Item
            name="returnAddress"
            style={{ display: 'none' }}
          >
            <Input style={{ width: 400, display: 'none' }} />
          </Form.Item>
        </>
      )}
    </Form>
  );
};
