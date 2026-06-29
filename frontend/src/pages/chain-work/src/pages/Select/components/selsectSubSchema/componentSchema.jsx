import React from 'react';
import SingleCard from './component/SingleCard';
// import { Logger } from '@/utlis';
import { fetchSellerItemList } from '@/pages/Select/services';

export default (status) => {
  const querySellerItemList = (values) => {
    return new Promise((resolve) => {
      fetchSellerItemList({
        ...values,
        isSelect: values?.currentStatus,
        pageIndex: values?.pageNo,
      }).then((res) => {
        resolve(res);
      });
    });
  };
  switch (status) {
    case '0':
      return {
        dataTable: {
          type: 'slot',
          listQueryFn: querySellerItemList,
          render: (record, index, onActionClick) => (
            <SingleCard
              item={record}
              onClickButton={() => onActionClick({ type: 'currentSubmit', record })}
              subText="提报"
              key={record?.itemId}
            />
          ),
        },
      };
    case '1':
      return {
        dataTable: {
          type: 'slot',
          listQueryFn: querySellerItemList,
          wrapStyle: {
            height: 425,
          },
          render: (record, index, onActionClick) => (
            <SingleCard
              key={record?.itemId}
              item={record}
              onClickButton={() => onActionClick({ type: 'currentCancel', record })}
              subText="撤销"
              style={record?.disabled ? {} : { backgroundColor: '#fff', color: '#07f', border: '1px solid #0077FF' }}
            />
          ),
        },
      };

    default:
      break;
  }
};
