import React, { useState } from 'react';

const downArrow = 'https://img.alicdn.com/imgextra/i1/O1CN01AuKRRM1keJi7GRLWZ_!!6000000004708-2-tps-32-32.png';
const showArrowStyle = 'transform rotate-180';

export default ({ maxCount = 3, children = [] }) => {
  const [show, setShow] = useState(false);
  const newChildren = [].concat(children);
  const newCHildrenLength = newChildren.length;
  const showChildren = newChildren.splice(0, show ? newCHildrenLength : maxCount);

  const handleToggle = () => {
    setShow(!show);
  };

  return (
    <div className="flex flex-col">
      {
        showChildren
      }
      {
        (newCHildrenLength > maxCount) && (
          <div className="cursor-pointer flex flex-row items-center text-[14px] text-[#333]" onClick={handleToggle}>
            {show ? '收起' : '展开更多'}
            <img className={`w-[16px] h-[16px] ml-[8px] ${show && showArrowStyle}`} src={downArrow} />
          </div>
        )
      }
    </div>
  );
};
