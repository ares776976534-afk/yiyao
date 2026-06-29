import request from './request';

export const getStatus = () => {
  return new Promise((resolve) => {
    request('moduleStatusService')
      .then(({ model }) => {
        if (model && model.length > 0) {
          resolve(model);
        } else {
          resolve([]);
        }
      })
      .catch(() => resolve([]));
  });
};
