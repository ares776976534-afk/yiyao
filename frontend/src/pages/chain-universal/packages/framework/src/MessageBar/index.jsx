import React, { useEffect, useState } from 'react';
import { Message } from '@alifd/next';

function MessageBar({ msg, link, getIsShow, type = 'warning' }) {
  const [isShow, setIsShow] = useState(true);
  useEffect(() => {
    if (getIsShow && typeof getIsShow === 'function') {
      getIsShow().then((res) => {
        setIsShow(res);
      });
    }
  }, [getIsShow]);
  return (
    <>
      {msg && isShow && (
        <Message title={null} type={type} size="large" shape="inline">
          {msg}
          {link}
        </Message>
      )}
    </>
  );
}

export default MessageBar;
