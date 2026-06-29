import React from 'react';
import { Dialog, Button, Icon } from '@alifd/next';
import './CategoryProductsDialog.scss';

export default (props) => {
  const { visible, onClose, onOk, name } = props;
  return (
    <Dialog
      v2
      title={
        <div>
          <Icon type="ic_info" style={{ color: '#0077FF' }} />
          <span className="ml-[8px]">关联当前类目所有商品</span>
        </div>
      }
      className="productsDialog"
      style={{ width: '371px' }}
      visible={visible}
      onClose={onClose}
      footerAlign="center"
      footer={
        <div>
          <Button className="mr-[12px]" type="primary" onClick={onOk}>确定</Button>
          <Button onClick={onClose}>取消</Button>
        </div>
      }
    >
      <div>{`你确定要把该证书关联到 ${name} 下的所有商品吗？（操作后类目下的新增商品不会自动关联证书）`}</div>
    </Dialog>
  );
};
