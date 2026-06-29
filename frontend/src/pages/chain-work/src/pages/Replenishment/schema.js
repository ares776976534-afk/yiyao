import colSchema_Replenishment from '@/pages/Replenishment/components/DataTable/colSchema';
import batchActionSchema_Replenishment from '@/pages/Replenishment/components/DataTable/batchActionSchema';
import messageSchema_Replenishment from '@/pages/Replenishment/components/MessageBar/messageSchema';
import filterSchema_Replenishment from '@/pages/Replenishment/components/SearchFilter/filterSchema';

export default {
  colSchema: colSchema_Replenishment,
  batchActionSchema: batchActionSchema_Replenishment,
  messageSchema: messageSchema_Replenishment,
  filterSchema: filterSchema_Replenishment,
  componentSchema: (status) => {
    const data = messageSchema_Replenishment(status)
    return {
      messageBar: {
        type: 'default', // default会忽略render
        data,
      },
    };
  },
};
