import React, { useState } from 'react';
import { Dialog } from '@alifd/next';
import ReactDOM from 'react-dom';
import CommonTable from '@/components/CommonTable';
import schema from './schema';
import './itemDialog.scss';
import { queryOffer, signUp } from '../services';
import Message from '@/components/UI/Message';

const container = document.createElement('div');

function ItemDialog({ props }) {
  const { oppMatchId } = props || {};
  const [visible, setVisible] = useState(true);
  const dialogRef = React.createRef();
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };
  const listQueryFn = (values) => {
    return new Promise((resolve) => {
      queryOffer({ request: JSON.stringify(values) }).then((res) => {
        const { success, model, msg } = res || {};
        if (success) {
          resolve({
            model: model?.list || [],
            total: model?.total || 0,
          });
        } else {
          Message._show({ content: msg || '数据异常，请稍后再试', type: 'error' });
        }
      });
    });
  };
  const handleActionClick = ({ type, record }, fn) => {
    switch (type) {
      case 'action':
        signUp(JSON.stringify({
          signUpSource: 'OPP_NEW',
          oppNew: {
            oppMatchId,
            offerId: record?.offerId,
          },
        })).then((res) => {
          const { success, msg } = res || {};
          if (success) {
            Message._show({ content: '提报成功', type: 'success' });
            fn && fn();
          } else {
            Message._show({ content: msg || '数据异常，请稍后再试', type: 'error' });
          }
        });
        break;
      default:
        break;
    }
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title="选择店铺商品报名"
      onClose={onClose}
      visible={visible}
      width={800}
      footer={false}
      className="itemDialog"
    >
      <CommonTable
        className="commonTable"
        schema={schema}
        SlotOrShowStatusFilter={false}
        searchFilterType="4"
        listQueryFn={listQueryFn}
        onActionComplete={handleActionClick}
        pageSize={5}
        otherPagination={{
          type: 'simple',
          shape: 'arrow-only',
        }}
      />
    </Dialog>
  );
}

ItemDialog.open = (props) => {
  ReactDOM.render(<ItemDialog props={props} />, container);
};

export default ItemDialog;
