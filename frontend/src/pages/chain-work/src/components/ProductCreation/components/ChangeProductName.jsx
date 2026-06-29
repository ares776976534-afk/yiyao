import React from 'react';
import { Button, Input, Dialog, Field, Form } from '@alifd/next';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

function ChangeProductName({ onProductUpdate, visible, setVisible, skuId, value }) {
  const field = Field.useField();

  const onClose = () => {
    setVisible(false);
  };

  const onOk = async () => {
    try {
      await field.validate(async (errors, values) => {
        setVisible(false);
        onProductUpdate(values?.name, skuId);
      });
    } catch (errors) {
      setVisible(false);
      console.error('Validation errors:', errors);
    }
  };
  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      footer={
        <div>
          <Button type="primary" onClick={onOk} className="mr-[12px]">
            确定
          </Button>
          <Button onClick={onClose}>取消</Button>
        </div>
      }
      title={<div className="text-[16px]">修改</div>}
      footerAlign="center"
      v2
      style={{ width: '420px' }}
    >
      <div>
        <Form field={field} {...formItemLayout}>
          <Form.Item label={'货品名称:'} name="name">
            <Input placeholder={'请输入'} defaultValue={value} />
          </Form.Item>
        </Form>
      </div>
    </Dialog>
  );
}

export default ChangeProductName;
