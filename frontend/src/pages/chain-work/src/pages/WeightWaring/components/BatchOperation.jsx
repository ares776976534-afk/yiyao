import React, { useState } from 'react';
import { Dialog, Button } from '@alifd/next';
import ReactDOM from 'react-dom';

const container = document.createElement('div');

function BatchOperation({ props }) {
  const { content, text, onOK } = props;
  const [visible, setVisible] = useState(true);
  const dialogRef = React.createRef();
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
    onOK && onOK();
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title={text}
      onClose={onClose}
      visible={visible}
      footer={
        <Button onClick={onClose} style={{ borderRadius: '6px' }}>
          知道了
        </Button>
      }
      footerAlign="center"
      style={{ width: '400px' }}
    >
      {content}
    </Dialog>
  );
}

BatchOperation.open = (props) => {
  ReactDOM.render(<BatchOperation props={props} />, container);
};

export default BatchOperation;
