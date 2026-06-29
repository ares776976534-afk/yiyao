import locale from '../../../locale';

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


class Constants {
  constructor(data) {
    this.DATASOURCE = data;
    this.ENUM = {};
    Object.keys(data).forEach((key) => {
      const item = data[key];
      const itemEnum = {};
      item.forEach((element) => {
        itemEnum[element.value] = element;
      });
      this.ENUM[key] = itemEnum;
    });
  }
}


const exportModules = new Constants({
  FileStatus,
});

export default exportModules;

