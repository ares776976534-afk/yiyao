import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Dialog, Checkbox, Message } from '@alifd/next';
import './index.scss';
import logger from '@alife/channel-uni-event-logger';
import { querySellerType } from '@/pages/CrossBorderOfferlist/api';
import { fullDialogStyle } from './variables';
import { getSignAgreement } from './services';

const container = document.createElement('div');

const CrossBorderOfferlistDialog = ({ props }) => {
  const { data, children } = props;
  const [isDisabled, setIsDisabled] = useState(false);
  const dialogRef = React.createRef();
  const onOk = async () => {
  };

  const titleDom = () => {
    return (
      <div className="flex flex-row items-center">
        {data?.titleIcon && <img src={data?.titleIcon} className="title-img" />}
        {data?.title}
      </div>
    );
  };

  const checkboxOnChange = (value) => {
    setIsDisabled(value);
  };
  const renderText = (config) => {
    data?.replacements?.forEach((item) => {
      if (item?.typke === 'link') {
        config = config?.replaceAll(
          item?.key,
          `<a href="${item?.href}" target="_blank" rel="noopener noreferrer">${item?.key}</a>`,
        );
      } else {
        config = config?.replaceAll(item?.key, `${item?.children}`);
      }
    });
    return { __html: config };
  };
  return (
    <Dialog
      ref={dialogRef}
      className="ae-jit-dialog"
      v2
      title={titleDom()}
      onClose={() => ReactDOM.unmountComponentAtNode(container)}
      visible
      style={fullDialogStyle}
      footer={
        data?.btns?.map((ele) => (
          <Button
            key={ele?.key}
            type={ele?.key === 'ok' ? 'primary' : 'normal'}
            onClick={ele?.key === 'ok' ? onOk : () => ReactDOM.unmountComponentAtNode(container)}
            style={{ borderRadius: '6px' }}
            disabled={ele?.key === 'ok' ? !isDisabled : false}
          >
            {ele?.btnText}
          </Button>
        ))
      }
      footerAlign="center"
    >
      {data?.introductionText?.map((ele) => (
        <div key={ele?.text} className="text-[#333] text-[14px] mb-[20px]">
          <div className="mb-[4px]">{ele?.title}</div>
          <div dangerouslySetInnerHTML={renderText(ele?.descriptiveContent)} />
        </div>
      ))}
      {children}
      {data?.agreements?.map((ele) => (
        <div className="flex mb-[10px] text-[#333] text-[14px]" key={ele?.key}>
          <Checkbox onChange={checkboxOnChange} />
          <div className="ml-[8px]" dangerouslySetInnerHTML={renderText(ele?.content)} />
        </div>
      ))}
    </Dialog>
  );
};

CrossBorderOfferlistDialog.open = (callback) => {
  ReactDOM.render(<CrossBorderOfferlistDialog props={callback} />, container);
};

export default CrossBorderOfferlistDialog;
