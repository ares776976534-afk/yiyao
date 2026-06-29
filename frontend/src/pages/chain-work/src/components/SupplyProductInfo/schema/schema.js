import colSchema from './colSchema';
// import batchActionSchema_Replenishment from './batchActionSchema';
// import messageSchema_Replenishment from '@/pages/Replenishment/components/MessageBar/messageSchema';
// import filterSchema_Replenishment from './filterSchema';
// import componentSchema from './componentSchema';

export default {
  colSchema,
  batchActionSchema: () => {
    return {
      expandedRowIndent: [1, 1],
    };
  },
  // messageSchema: messageSchema_Replenishment,
  filterSchema: () => [],
  // componentSchema,
};
