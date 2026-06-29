import React, { useEffect, useState } from 'react';
import { Message } from '@alifd/next';
import messageSchema from './messageSchema';
import { PO_PENDING_APPOINTMENT } from '../../../../constant';
import { listQuery } from '../../services/search';

function MessageBar({ status }) {
  const { msg, link } = messageSchema(status);
  const [urgentMsg, setUrgentMsg] = useState(false);
  useEffect(() => {
    if (status === PO_PENDING_APPOINTMENT) {
      // 当为补货预约时，查询是否有紧急补货单
      const param = { subModuleCode: PO_PENDING_APPOINTMENT, pageNo: 1, pageSize: 10 };
      listQuery(param).then((res) => {
        const isExists = res?.model?.length && res.model.some((item) => {
          if (item.isUrgent) {
            console.log(item);
            return true;
          }
          return false;
        });
        console.log('isExists', isExists);

        setUrgentMsg(isExists);
      }).catch((error) => { });
    }
  }, [status]);
  return (
    <>
      {status === PO_PENDING_APPOINTMENT && msg && urgentMsg ?
        <div>
          <Message
            title={null}
            type="warning"
            size="large"
            shape="inline"
          >
            {msg}
            {link}
          </Message>
        </div>
        : null}
      {status !== PO_PENDING_APPOINTMENT && msg ?
        <div>
          <Message
            title={null}
            type="warning"
            size="large"
            shape="inline"
          >
            {msg}
          </Message>
        </div>
        : null}
    </>
  );
}

export default MessageBar;
