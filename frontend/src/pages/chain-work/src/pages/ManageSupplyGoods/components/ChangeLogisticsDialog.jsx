import React, { useEffect } from 'react';
import { Dialog, Button, Form, Message } from '@alifd/next';
import { Address, InputArrtribute, OfficalFreightTemplate } from '@alife/super-link-logistics';
import './index.scss';
import { dialogStyle } from '@/styles/dialogStyle';
function ChangeLogisticsDialog({
  visible,
  setVisible,
  onSuccess,
  recordData,
  officalFreightTemplateProps,
}) {
  const contentMap = {
    Address: (
      <Address
        address={'地址选择'}
        id={recordData}
        open={visible}
        onFail={() => {
          // alert('fail');
          setVisible(false);
        }}
        onSuccess={(data) => {
          onSuccess && onSuccess(data);
          setVisible(false);
        }}
      />
    ),
    InputArrtribute: <InputArrtribute id={recordData} onSuccess={onSuccess} isCeil isDivided5 />,
    OfficalFreightTemplate: (
      <OfficalFreightTemplate
        id={recordData}
        isFreeShipping={officalFreightTemplateProps?.isDiscount || false}
        isDiscount={officalFreightTemplateProps?.isDiscount || false}
        discountRange={officalFreightTemplateProps?.discountRange}
        onSuccess={officalFreightTemplateProps?.onSuccess}
        onFail={officalFreightTemplateProps?.onFail}
        tableMaxHeight={480}
        onCancel={officalFreightTemplateProps?.onCancel}
      />
    ),
  };
  const contentRender = (type) => {
    // if (type === 'OfficalFreightTemplate') {
    //   console.log('officalFreightTemplateProps', officalFreightTemplateProps)
    // }
    return contentMap[type];
  };
  const onOk = () => {
    onSuccess && onSuccess();
    setVisible(false);
  };

  const fullDialogStyle = {
    ...dialogStyle,
    width: '1000px',
    maxHeight: '750px',
  };

  return visible === 'Address' ? (
    contentRender('Address')
  ) : (
    <Dialog
      v2
      title={'商品重量'}
      visible={!!visible}
      // onOk={onOk}
      onClose={() => setVisible(false)}
      footer={false}
      // footerAlign="center"
      style={fullDialogStyle}
      className="change-logistics-dialog"
    >
      {contentRender(visible)}
    </Dialog>
  );
}

export default ChangeLogisticsDialog;
