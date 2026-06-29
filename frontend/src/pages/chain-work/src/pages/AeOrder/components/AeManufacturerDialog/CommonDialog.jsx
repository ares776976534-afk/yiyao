import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Dialog, Checkbox } from '@alifd/next';
import './index.scss';
import { fullDialogStyle } from './enums';
import { isFunction } from '@/utlis';
import { clickThinkLater } from './services';
import Message from '@/components/UI/Message';

const container = document.createElement('div');

const CommonDialog = ({ props }) => {
  const { data: _data, isCheck, onOkInfo, isCloseIcon, onClose = () => { }, onOk = () => { } } = props;
  const data = isFunction(_data) ? _data() : _data;
  const [isChecked, setIsChecked] = useState(isCheck);
  const dialogRef = React.createRef();

  const onBtnOk = async () => {
    onOkInfo().then((res) => {
      if (res) {
        onOk();
        ReactDOM.unmountComponentAtNode(container);
      }
    });
  };

  const checkboxOnChange = (value) => {
    setIsChecked(value);
  };
  const onNormalClose = () => {
    clickThinkLater().then((res) => {
      const { success, msg = '系统异常，请稍后重试' } = res;
      if (success) {
        ReactDOM.unmountComponentAtNode(container);
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.errorMessage || '系统异常，请稍后重试', type: 'error' });
    });
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title={data?.title}
      onClose={(e) => {
        isCloseIcon && ReactDOM.unmountComponentAtNode(container);
        onClose();
      }}
      visible
      closeIcon={!isCloseIcon && <div className="cursor-auto w-[20px] h-[20px]" />}
      style={fullDialogStyle}
      className="ae-jit-dialog"
      footer={
        data?.footer?.map((item) => {
          return (
            <Button key={item?.primaryType} type={item?.primaryType} onClick={item?.primaryType === 'normal' ? onNormalClose : onBtnOk} style={{ borderRadius: '6px', marginLeft: 12 }} disabled={item?.disabled ? false : !isChecked}>
              {item.text}
            </Button>
          );
        })
      }
      footerAlign="center"
    >
      <div className="text-[#333] text-[14px] mb-[20px]">
        {data?.describe?.map((ele) => (
          <div key={ele?.title}>
            <div className="mb-[4px]">{ele?.title}</div>
            <div>{ele?.describe}</div>
          </div>
        ))}
      </div>
      {data?.children}
      {data?.checkboxList?.map((item, index) => (
        <div key={item?.content} className={`flex text-[#333] text-[14px] ${data?.checkboxList?.length !== index && 'mb-[10px]'} ${index === 0 && 'mt-[20px]'}`}>
          <Checkbox onChange={checkboxOnChange} />
          {item?.content}
        </div>
      ))}
    </Dialog>
  );
};

CommonDialog.open = (props) => {
  ReactDOM.render(<CommonDialog props={props} />, container);
};

export default CommonDialog;
