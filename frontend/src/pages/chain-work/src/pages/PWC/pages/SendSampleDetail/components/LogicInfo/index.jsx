import React, { useEffect, useState } from 'react';
import { Form, Select, Input, Field, Button } from '@alifd/next';
import ClipBoard from '@/components/ClipBoard';
import { transformFieldLabel } from '@/utlis';
import { getLogicInfo, getWarehouseAdd } from '../../../../service';

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

export default ({ getFieldInstance, preview = false }) => {
  const [logicInfo, setLogicInfo] = useState([]);
  const [warehouseAdd, setWarehouseAdd] = useState(null);

  const field = Field.useField({
    autoUnmount: false,
  });

  const getData = () => {
    getLogicInfo()
      .then((res) => {
        setLogicInfo(res);
      });
    getWarehouseAdd()
      .then((res) => {
        setWarehouseAdd(res);
      });
  };

  useEffect(() => {
    getFieldInstance && getFieldInstance(field);
    getData();
  }, []);

  return (
    <div>
      <div className="flex flex-row mb-[20px]">
        <span className="text-[#333] text-[13px] font-[500]">
          仓库收件地址：
        </span>
        <span className="text-[#333] text-[13px]">
          {warehouseAdd || '-'}
        </span>
        {
          warehouseAdd && (
            <ClipBoard text={warehouseAdd}>
              <Button text type="primary" style={{ margin: '0 0 0 12px', fontSize: '13px' }}>复制</Button>
            </ClipBoard>
          )
        }
      </div>
      <Form field={field} inline={false} style={{ marginBottom: '-16px' }} isPreview={preview}>
        <Form.Item
          label={transformFieldLabel('物流公司', preview)}
          name="expressCompany"
          required
          requiredMessage="请选择物流公司"
          {...formItemDefaultSetting}
        >
          <Select style={{ width: 300 }} showSearch placeholder="请选择物流公司">
            {
              logicInfo.map((item) => (
                <Option value={item.code} key={item.code}>
                  {item.name}
                </Option>
              ))
            }
          </Select>
        </Form.Item>
        <Form.Item
          label={transformFieldLabel('快递单号', preview)}
          name="expressNumber"
          required
          requiredMessage="请输入快递单号"
          {...formItemDefaultSetting}
        >
          <Input style={{ width: 300 }} placeholder="请输入快递单号" />
        </Form.Item>
      </Form>
    </div>
  );
};
