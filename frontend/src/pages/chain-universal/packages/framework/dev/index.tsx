import React from 'react';
import Mod from '../esm';
import schema from './schema';

export default () => {
  const fetchQueryItem = (values) => {
    return new Promise((resolve) => {
      resolve([]);
    });
  };
  return <Mod schema={schema} listQueryFn={fetchQueryItem} />;
};
