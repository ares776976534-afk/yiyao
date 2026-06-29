const defaultConfig = {
  userImage: 'https://img.alicdn.com/imgextra/i4/O1CN01qCsPKn1ToX978dp1C_!!6000000002429-2-tps-256-256.png',
};

// 画布迭代的版本
export const canvasFeatures = {
  currentVersion: '1.1.1',
  /**画布增加记忆功能
   * 画布中存储了历史添加的元素id，包含删除的
   * 对话流从这个版本开始要无差别把数据插入画布，由画布的记忆功能来去重
   */
  canvasMemory: {
    version: '1.1.1',
  }
};

export default defaultConfig;