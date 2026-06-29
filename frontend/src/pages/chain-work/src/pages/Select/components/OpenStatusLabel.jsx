import React from 'react';

const open = 'bg-[url(https://img.alicdn.com/imgextra/i1/O1CN01lKkJbW1a6kWXNwXET_!!6000000003281-2-tps-32-32.png)]';
const close = 'bg-[url(https://img.alicdn.com/imgextra/i4/O1CN01VAJTUW1XxvfH6BjXQ_!!6000000002991-2-tps-32-32.png)]';

const statusStyle = {
  open,
  close,
};

export default ({ children, status = 'open' }) => {
  return (
    <div className={`flex flex-col justify-center text-[#333] text-[14px] pl-[20px] bg-left bg-[16px_auto] bg-no-repeat  ${statusStyle[status]}`}>
      {children}
    </div>
  );
};
