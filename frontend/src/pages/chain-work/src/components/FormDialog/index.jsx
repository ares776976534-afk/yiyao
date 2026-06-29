import React, { useState } from 'react';
import { Dialog, Button, Field } from '@alifd/next';
import ReactDOM from 'react-dom';
import './index.scss';
import RenderField from '../CommonTable/components/RenderField';
import { SCHEMA_SEARCH } from '@/components/CommonTable/contanst';

const container = document.createElement('div');
function FormModal({ props }) {
  const { title = '标题', width = 600, schema, onSubmit = () => {}, labelAlign = 'left', subName = '确定', status = null } = props;
  const filters = schema(status);
  const field = Field.useField({
    parseName: true,
    onChange: (key, value) => {
      field.setValue(key, value);
    },
  });
  const { init, getError, validate, getValues } = field;
  const [visible, setVisible] = useState(true);
  const dialogRef = React.createRef();
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };

  // 提交
  const handleSubmit = () => {
    validate((errors) => {
      if (errors) {
        return;
      }
      onSubmit(getValues());
      onClose();
    });
  };
  const renderItem = ({ key, type, opt, values, name, fetchData, tip, children, colClassName }) => {
    let otherProps = {};
    if (type === SCHEMA_SEARCH) {
      otherProps = {
        onFilterChange: (val) => {
          opt?.onFilterChange && field.setValue('areaCode', val);
        },
      };
    }
    return (
      <div key={key}>
        {key === 'others' && children}
        {key !== 'others' &&
          <div className={`${labelAlign !== 'top' && 'flex'} mt-[20px] ${colClassName}`}>
            <div className={`${labelAlign !== 'top' && 'text-right pt-[7px]'} mb-[4px] w-[160px] mr-[12px]`}>
              {opt?.required && <span className="mr-[4px] text-[#FF4000]">*</span>}
              {name}{tip}
            </div>
            <div className="width-style">
              <RenderField
                fieldKey={key}
                type={type}
                opt={opt}
                values={values}
                name={name}
                fetchData={fetchData}
                fieldInit={() => {
                  return init(key,
                    { rules: opt?.rules, initValue: opt?.initValue });
                }}
                {...otherProps}
              />
              <br />
              {getError(key) ? (
                <span style={{ color: 'red' }}>
                  {getError(key).join(',')}
                </span>
              ) : (
                ''
              )}
            </div>
          </div>
        }
      </div>
    );
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
      className="form-modal rounded-[12px]"
      width={width}
    >
      {filters.map((item) => renderItem(item))}
    </Dialog>
  );
}

FormModal.open = (props) => {
  ReactDOM.render(<FormModal props={props} />, container);
};

export default FormModal;
