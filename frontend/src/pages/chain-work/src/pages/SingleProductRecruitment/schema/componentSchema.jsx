import React from 'react';
import SingleProductRecruitmentCard from '../components/SingleProductRecruitmentCard';

export default ({ getData = () => {} }) => {
  return {
    dataTable: {
      type: 'slot',
      listQueryFn: getData,
      render: (item, index) => {
        return (
          <div key={index} className="mb-[12px]">
            <SingleProductRecruitmentCard {...item} />
          </div>
        );
      },
    },
  };
};
