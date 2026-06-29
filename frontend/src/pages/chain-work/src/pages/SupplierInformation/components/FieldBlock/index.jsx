import React from 'react';
import Field from '../Field';

const blockStyle = 'w-[100%]';

export default ({ field, fields = [], mode, className = '', fieldClassName = '' }) => {
  return (
    <div className={`flex flex-row flex-wrap gap-[12px] ${className}`}>
      {
        fields.map((item) => {
          const isBlock = item?.display === 'block';
          return (
            <div className={`${isBlock ? blockStyle : ''} ${fieldClassName}`}>
              <Field mode={mode} field={field} {...item} />
            </div>
          );
        })
      }
    </div>
  );
};
