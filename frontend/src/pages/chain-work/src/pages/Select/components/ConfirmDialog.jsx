import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Dialog } from '@alifd/next';
import { exitChoiceItem } from '../services';
import { MessageError, MessageSuccess } from '@/utlis';

const container = document.createElement('div');

const ConfirmDialog = ({ props }) => {
  const { records, onActionOk } = props;
  const { title, children } = records;
  const dialogRef = React.createRef();
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
  };
  const onOk = () => {
    exitChoiceItem({
      request: {
        itemId: records?.itemId,
      },
    }).then((res) => {
      if (res?.success) {
        MessageSuccess(res.msg || '该商品已退出Choice');
        onActionOk();
        onClose();
      } else {
        MessageError(res.msg || '系统异常');
      }
    }).catch((err) => {
      MessageError(err.message || '系统异常');
    });
  };
  return (
    <Dialog
      ref={dialogRef}
      className="batch-join-choice-dialog"
      v2
      title={title}
      onClose={onClose}
      visible
      style={{ width: 400 }}
      footer={
        <div>
          <Button
            type="primary"
            onClick={onOk}
            style={{ borderRadius: '6px', marginRight: '12px' }}
          >
            确认退出
          </Button>
          <Button
            type="normal"
            onClick={onClose}
            style={{ borderRadius: '6px' }}
          >
            我再想想
          </Button>
        </div>
      }
      footerAlign="center"
    >
      {children}
    </Dialog>
  );
};

ConfirmDialog.open = (callback) => {
  ReactDOM.render(<ConfirmDialog props={callback} />, container);
};

export default ConfirmDialog;
