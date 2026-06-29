export const TASK_STATUS = {
  FINISHED: 'FINISHED',
  EXECUTING: 'EXECUTING',
  ERROR: 'ERROR',
  PART_FAILED: 'PART_FAILED',
};

export const TASK_TYPE = {
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
};

const FileStatus = [
  { label: locale.success, value: TASK_STATUS.FINISHED, icon: 'success' },
  { label: locale.padding, value: TASK_STATUS.EXECUTING, icon: 'padding' },
  { label: locale.fail, value: TASK_STATUS.ERROR, icon: 'error' },
  { label: locale.fail, value: TASK_STATUS.PART_FAILED, icon: 'error' },

];