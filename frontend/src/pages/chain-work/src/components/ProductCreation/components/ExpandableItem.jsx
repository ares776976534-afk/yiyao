import React, { useState } from 'react';
import { Icon } from '@alifd/next';

const ExpandableItem = ({ data, children, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onExpand(data.id, !isExpanded);
  };

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <img className="w-[60px] h-[60px] bg-white mr-[16px]" src={data.img} alt="icon" />
          <div>
            <div className="text-sm font-medium text-gray-700">{data.skuTitle}</div>
            <div className="flex gap-4">
              <div className="text-[#999]">
                SKU ID <span className="text-[#333]">{data.skuId}</span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleToggle}>{isExpanded ? <Icon type="arrow-up" /> : <Icon type="d-arrow-down" />}</button>
      </div>
      {isExpanded && children}
    </div>
  );
};
export default ExpandableItem;
