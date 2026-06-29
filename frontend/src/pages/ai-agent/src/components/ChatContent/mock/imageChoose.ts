// 加载阶段
const step1 = {
  title: "爆款图参考",
  type: "imageChoose",
  images: [],
};

// 结果输出
const step2 = {
  title: "爆款图参考",
  type: "imageChoose",
  images: [
    "https://xxx.jpg",
    "https://xxx.jpg",
    "https://xxx.jpg",
    "https://xxx.jpg",
    "https://xxx.jpg",
    "https://xxx.jpg",
  ],
};

// 选择结果
const step3 = {
  title: "爆款图参考",
  type: "imageChoose",
  images: [
    "https://xxx.jpg",
    "https://xxx.jpg",
    "https://xxx.jpg",
    "https://xxx.jpg",
    "https://xxx.jpg",
    "https://xxx.jpg",
  ],
  chooseIndex: 0,
};

// 新增会话状态信号
const step4 = {
  sessionId: "6c416f95-2d7a-4dc5-aadd-713fe0c1fa7a",
  id: 34,
  type: "statusChange",
  taskId: "be1f7b69-a7a5-4481-a5ea-13a1ba64239f",
  status: "waitForUser",
};

// 注：选择结果事件仅在详情和分享中会出，当用户点击恢复时，前端页面自动更新组件状态，不需要后端提供此事件。

/**
 * 接口设计
 * 新增接口：
 * 聊天恢复接口
 * 链接：POST https://pre-www.alphashop.cn/alpha-shop/agent/resume
 *
 * 入参
 * sessionId String 会话id
 * taskId String 任务id
 * userInput 用户输入：可能会是多种形式的，基于waitForUser前出的卡片要求决定
 */

// UserInput协议
const step5 = {
  type: "imageChoose",
  chooseStatus: "accept", // accept\refuse
  chooseIndex: 0, // accept情况下才会关心选择了什么
};
