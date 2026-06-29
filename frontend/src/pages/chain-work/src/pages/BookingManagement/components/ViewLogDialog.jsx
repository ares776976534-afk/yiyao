import React, { useState } from 'react';
import { Dialog, Button } from '@alifd/next';
import ReactDOM from 'react-dom';
import CommonTable from '@/components/CommonTable';
import schema from './viewLogSchema';
import { queryAppointOrderLogService } from '../service';

const container = document.createElement('div');

function ViewLogDialog({ props }) {
  const { record } = props;
  const [visible, setVisible] = useState(true);
  const dialogRef = React.createRef();

  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };
  const fetchQueryItem = () => {
    return new Promise((resolve) => {
      queryAppointOrderLogService(
        record?.appointOrderCode,
      ).then((res) => {
        resolve(res);
      });
    });
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title={<div className="text-[16px] font-medium">查看日志</div>}
      onClose={onClose}
      visible={visible}
      footerAlign="center"
      footer={
        <Button onClick={onClose} type="primary" style={{ borderRadius: '6px' }}>
          关闭
        </Button>
      }
      style={{ width: '800px' }}
    >
      <CommonTable
        schema={schema}
        SlotOrShowStatusFilter={false}
        showSearchAction={false}
        listQueryFn={fetchQueryItem}
        showPagination={false}
      />
    </Dialog>
  );
}

ViewLogDialog.open = (props) => {
  ReactDOM.render(<ViewLogDialog props={props} />, container);
};

export default ViewLogDialog;
