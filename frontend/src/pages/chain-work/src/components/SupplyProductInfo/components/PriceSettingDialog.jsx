import React, { useState } from 'react';
import { Dialog, Button, Radio, NumberPicker } from '@alifd/next';
import ReactDOM from 'react-dom';
import { dialogStyle } from '@/styles/dialogStyle';

const container = document.createElement('div');
const RadioGroup = Radio.Group;
function PriceSettingDialog({ props }) {
  const { field, name, title } = props;
  const [visible, setVisible] = useState(true);
  const dialogRef = React.createRef();
  const [only, setOnly] = useState(false); // 批量设置价格确认是否可点击
  const [valueNum, setValueNum] = useState(''); // 批量设置价格值
  const [radioValue, setRadioValue] = useState('oneTimePrice');
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };
  const minus = (num1, num2) => {
    const precision = Math.pow(10, 10); // 设置精度
    num1 = Math.round(num1 * precision);
    num2 = Math.round(num2 * precision);
    return (num1 - num2) / precision;
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title={<div className="text-[16px]">批量设置{title}</div>}
      onClose={onClose}
      visible={visible}
      className="price-setting-dialog"
      footer={
        <div className="error-modal-footer">
          <Button
            className="mr-[12px]"
            style={{ borderRadius: '6px' }}
            type="primary"
            onClick={() => {
              const dataIndex = name;
              const fieldData = JSON.parse(JSON.stringify(field.getValues()));
              Object.keys(fieldData).forEach((key) => {
                fieldData[key][dataIndex] = radioValue === 'oneTimePrice' ? valueNum : minus(fieldData[key][dataIndex], valueNum);
              });
              field.setValues(fieldData);
              onClose();
            }}
            disabled={!only}
          >
            确定
          </Button>
          <Button
            style={{ borderRadius: '6px' }}
            onClick={onClose}
          >
            取消
          </Button>
        </div>
      }
      style={{ width: '360px', borderRadius: '12px', ...dialogStyle }}
      footerAlign="center"
    >
      <div>
        <span className="mr-[12px]">{title}设置</span>
        {
          name === 'supplyPrice' && (
            <RadioGroup
              value={radioValue}
              aria-labelledby="groupId"
              onChange={(v) => setRadioValue(v)}
            >
              <Radio id="oneTimePrice" value="oneTimePrice">
                一口价
              </Radio>
              <Radio id="instantDiscount" value="instantDiscount">
                立减
              </Radio>
            </RadioGroup>
          )
        }
        <NumberPicker
          className={`custom-input ${name === 'supplyPrice' && 'ml-[66px] mt-[12px]'}`}
          label={name === 'supplyPrice' ? '¥' : null}
          style={{ width: '240px', borderRadius: '6px' }}
          placeholder="请输入"
          precision={2}
          min={0}
          hasTrigger={false}
          onChange={(v) => {
            setValueNum(v);
            setOnly(!!v);
          }}
        />
      </div>
    </Dialog>
  );
}

PriceSettingDialog.open = (props) => {
  ReactDOM.render(<PriceSettingDialog props={props} />, container);
};

export default PriceSettingDialog;
