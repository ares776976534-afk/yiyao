import mtopFc from '@/libs/mtopFc';

// 创建打印任务
export const getPrintProcess = (params) => {
  return new Promise((resolve) => {
    mtopFc(
      'BigCustomerPrintLabelTask',
      {
        params,
        enableToken: true,
        api: 'mtop.alibaba.national.sc.CommonMtop',
      },
    )
      .then((res) => {
        if (res.model) {
          resolve({
            success: true,
            taskId: res.model,
          });
        } else {
          resolve({
            success: false,
            taskId: '',
          });
        }
      })
      .catch((err) => {
        resolve({
          success: false,
          taskId: '',
          message: err,
        });
      });
  });
};

// 获取打印队列
export const getPrintTask = (taskId) => {
  return new Promise((resolve) => {
    mtopFc(
      'BigCustomerPrintLabelProcess',
      {
        params: {
          taskId,
        },
        enableToken: true,
        api: 'mtop.alibaba.national.sc.CommonMtop',
      },
    )
      .then((res) => {
        if (res.model && res.model.length > 0) {
          resolve({
            success: true,
            tasks: res.model,
          });
        } else {
          resolve({
            success: false,
            tasks: [],
          });
        }
      })
      .catch((err) => {
        resolve({
          success: false,
          tasks: [],
          message: err,
        });
      });
  });
};

// 根据运单ID获取打印任务->打印物料
export const getPrintTaskDetail = (params) => {
  return new Promise((resolve) => {
    getPrintProcess(params)
      .then(({ success, taskId, message }) => {
        if (success) {
          getPrintTask(taskId)
            .then(({ success: _success, tasks }) => {
              if (_success) {
                resolve({
                  success: true,
                  tasks,
                  taskId,
                });
              } else {
                resolve({
                  success: false,
                  tasks: [],
                  taskId,
                });
              }
            })
            .catch((err) => {
              resolve({
                success: false,
                tasks: [],
                message: err,
                taskId,
              });
            });
        } else {
          resolve({
            success: false,
            tasks: [],
            taskId,
            message,
          });
        }
      })
      .catch((err) => {
        resolve({
          success: false,
          tasks: [],
          message: err,
        });
      });
  });
};

// 更新打印状态
export const updatePrintProcess = (taskId, status) => {
  return new Promise((resolve) => {
    mtopFc(
      'BigCustomerPrintLabelResult',
      {
        params: {
          printResult: status,
          taskId,
        },
        enableToken: true,
        api: 'mtop.alibaba.national.sc.CommonMtop',
      },
    )
      .then(() => {
        resolve({
          success: true,
        });
      })
      .catch((err) => {
        resolve({
          success: false,
          message: err,
        });
      });
  });
};
