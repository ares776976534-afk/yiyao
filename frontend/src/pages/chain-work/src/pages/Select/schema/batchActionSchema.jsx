import React from 'react';
import { Button, Icon } from '@alifd/next';

export default (status, zeroStockCount) => {
  switch (status) {
    case '1':
      return {
        hasRowSelection: true,
        showSelectTip: false,
        primaryKey: 'itemId',
        leftAction: ({ checked, onActionClick = () => {} }) => {
          return (
            <div className="mb-[8px]">
              <div className="flex items-center">
                <Button
                  onClick={() => onActionClick({ type: 'choice_dialog', record: checked })}
                  type="primary"
                  style={{ borderRadius: '6px', fontSize: '14px' }}
                  disabled={!checked.length}
                >
                  批量加入Choice
                </Button>
              </div>
            </div>
          );
        },
      };
    case '2':
      return {
        hasRowSelection: false,
        showSelectTip: false,
        primaryKey: 'itemId',
        leftAction: () => {
          return (
            zeroStockCount && (
              <div className="px-[12px] py-[9px] bg-[#FFF9EB] rounded-[6px] mb-[8px]">
                <Icon type="warning" style={{ color: '#FF8B00', marginRight: '8px' }} />
                <span>您有<span className="text-[#FF8B00]">{zeroStockCount}</span>个商品的SKU库存为0，请在上方进行筛选，并在操作中点击「管理托管产品」补充库存。</span>
              </div>
            )
          );
        },
      };
    default:
      return {};
  }
};
