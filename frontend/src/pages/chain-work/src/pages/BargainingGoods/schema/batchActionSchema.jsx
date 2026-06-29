import React from 'react';
import { Button, Checkbox } from '@alifd/next';
import { Logger } from '@/utlis';

export default ({ currentCheckedRef, checkedAll, indeterminate, filterItemIds, checkedRef }) => {
  return {
    hasRowSelection: true,
    showSelectTip: false,
    primaryKey: 'itemId',
    leftAction: ({ total, onActionClick = () => {} }) => {
      return (
        <div className="flex items-center mb-[12px]">
          <Checkbox
            indeterminate={indeterminate}
            checked={checkedAll}
            onChange={(v) => {
              onActionClick({ type: 'all', record: v ? currentCheckedRef?.current : [] });
            }}
          >
            全选
          </Checkbox>
          <div className="mr-[20px] text-[14px] text-[#999] ml-[12px]">
            <span>已选</span>
            <span className="text-[#333] text-[14px] font-medium ml-[4px] mr-[4px]">{checkedAll ? total - filterItemIds?.length : checkedRef?.length}/{total || 0}</span>
            <span>个商品</span>
          </div>
          <Button
            onClick={() => {
              Logger.report({ d: 'CLK', e: '2议价列表点击按钮@funnel_批量接受期望价' });
              onActionClick({ type: 'bargining' });
            }}
            type="primary"
            style={{ borderRadius: '6px', fontSize: '14px' }}
            disabled={!checkedAll && !checkedRef?.length}
          >
            批量接受期望价
          </Button>
        </div>
      );
    },
  };
};
