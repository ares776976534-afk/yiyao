/* eslint-disable no-param-reassign */

// 往父页面发送消息
export const PARENT_TARGET = 'ascp_notification_center_parent';
// 往子页面发送消息
export const CHILDREN_TARGET = 'ascp_notification_center_children';
// 文件任务开始轮询
export const FILE_CENTER_START_POLL = 'file_center_start_poll';
// 文件任务成功
export const FILE_CENTER_ON_SUCCESS = 'file_center_on_success';
// 文件任务失败
export const FILE_CENTER_ON_ERROR = 'file_center_on_error';

export const TARGET = {
  TODO: 'todo',
  MESSAGE: 'message',
  FILE: 'file',
};

const Target = [
  { value: TARGET.TODO },
  { value: TARGET.MESSAGE },
  { value: TARGET.FILE },
];


class Constants {
  constructor(data) {
    this.DATASOURCE = data;
    this.ENUM = {};
    Object.keys(data).forEach((key) => {
      const item = data[key];
      const itemEnum = {};
      item.forEach((element) => {
        itemEnum[element.value] = element.label;
      });
      this.ENUM[key] = itemEnum;
    });
  }
}


const exportModules = new Constants({
  Target,
});

export default exportModules;
