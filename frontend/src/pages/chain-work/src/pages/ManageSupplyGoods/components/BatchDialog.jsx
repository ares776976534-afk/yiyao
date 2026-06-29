import React from 'react';
import { Dialog, Button, NumberPicker, Field } from '@alifd/next';
import ReactDOM from 'react-dom';
import '../index.scss';
import { data } from './enums';

const container = document.createElement('div');
function BatchDialog({ props: { title, field, name } }) {
  const fields = Field.useField({ parseName: true });
  const dialogRef = React.createRef();
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
  };
  const onOk = () => {
    fields.validate(async (errors) => {
      if (errors) {
        return;
      }
      const newValues = fields.getValues();
      const currentValues = field.getValues();
      const updatedValues = Object.keys(currentValues).reduce((acc, key) => {
        acc[key] = { ...currentValues[key], ...newValues };
        return acc;
      }, {});
      field.setValues(updatedValues);
      onClose();
    });
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title={<div className="text-[16px]">批量设置{title}</div>}
      onClose={onClose}
      visible
      footerAlign="center"
      style={{ width: '400px' }}
      footer={
        <div>
          <Button type="primary" onClick={onOk} style={{ marginRight: '8px', borderRadius: '6px' }}>
            确定
          </Button>
          <Button onClick={onClose} style={{ borderRadius: '6px' }}>取消</Button>
        </div>
      }
    >
      {data[name].map(({ label, key, attrs = {}, precision, rules }, index) => (
        <div>
          <div key={key} className={`flex items-center ${index !== data[name].length - 1 && 'mb-[16px]'}`}>
            <div className="text-[14px] text-[#666] mr-[8px] w-[80px] text-right">{label}</div>
            <NumberPicker
              style={{ width: '100%' }}
              className="number-picker"
              {...fields.init(key, {
                rules,
              })}
              hasTrigger={false}
              precision={precision}
              placeholder="请输入"
              {...attrs}
            />
          </div>
          {fields.getError(key) && (
            <div className="text-[#FB3B20] text-[12px] mt-[8px] text-left ml-[68px]">
              {fields.getError(key)}
            </div>
          )}
        </div>
      ))}
    </Dialog>
  );
}

BatchDialog.open = (props) => {
  ReactDOM.render(<BatchDialog props={props} />, container);
};

export default BatchDialog;
