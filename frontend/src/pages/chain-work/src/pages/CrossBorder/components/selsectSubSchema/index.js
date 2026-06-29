import componentSchema from './componentSchema';
import filterSchema from './filterSchema';
import React from 'react';


export default {
  colSchema: () => [],
  filterSchema,
  componentSchema,
  batchActionSchema: () => [],
  emptySchema: (status, query) => {
    const { itemName, itemId } = query;
    switch (status) {
      case '0':
        return (
          <div>
            <div>
              <img
                src="https://img.alicdn.com/imgextra/i3/O1CN01cj0QH01TB8xa4A7jB_!!6000000002343-2-tps-130-117.png"
                alt="img"
              />
            </div>
            <div className="empty-state-title">{itemName || itemId ? '未搜索到商品' : '暂无可提报商品'}</div>
          </div>
        );
      case '1':
        return <div />;
      default:
        return <div />;
    }
  },
};
