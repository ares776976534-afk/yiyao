export default {
  getTodoList: {
    url: 'flowhemaos://job/getMerchantJobs.json',
    mock: 'https://mocks.alibaba-inc.com/mock/p6fCegtkv/job/getMerchantJobs.json',
  },
  getFileList: {
    // url: 'gei://gei/task/list',
    // url: 'https://mocks.alibaba-inc.com/mock/gei_application/gei/task/list',
    url: 'gei://supply/product/gei/task/list',
    mock: 'https://mocks.alibaba-inc.com/mock/gei_application/gei/task/list',
    headers: {
      source: 'ascp',
    },
  },
  geiBase: {
    url: 'gei://',
  },
  createExport: {
    url: 'gei://gei/export/task/{code}',
    // mock: 'https://mocks.alibaba-inc.com/mock/gei_application/gei/export/task',
  },
  createImport: {
    // url: 'gei://gei/import/task/{code}',
    url: 'gei://supply/product/gei/import/task/{code}',
    // mock: 'https://mocks.alibaba-inc.com/mock/gei_application/gei/import/task',
  },
  getImportTemplate: {
    url: 'gei://gei/import/template/{code}',
    // mock: 'https://mocks.alibaba-inc.com/mock/gei_application/gei/import/template/code',
  },
  exportFile: {
    url: 'gei://gei/export/task/{taskId}',
  },
  importErrorFile: {
    url: 'gei://gei/import/task/errorFile/{taskId}',
  },
  importErrorMsg: {
    url: 'gei://gei/import/task/errors/{taskId}',
  },
  createRetry: {
    url: 'gei://gei/import/task/retry/{taskId}',
  },
};
