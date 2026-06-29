export const mockOfferLoading = [
  {
    sessionId: "31a61850-c0e5-4ce7-b4d3-01e7e716006a",
    taskId: "675b9aaf-96c9-49ed-8620-dd8561db1cef",
    type: "resp",
  },
  {
    sessionId: "31a61850-c0e5-4ce7-b4d3-01e7e716006a",
    id: 37,
    type: "statusChange",
    taskId: "675b9aaf-96c9-49ed-8620-dd8561db1cef",
    status: "start",
  },
  {
    sessionId: "31a61850-c0e5-4ce7-b4d3-01e7e716006a",
    id: 38,
    type: "offer_percent_loading",
    taskId: "675b9aaf-96c9-49ed-8620-dd8561db1cef",
    cardId: "offer_card_001",
    startTime: Date.now(),
    endTime: Date.now() + 10000,
    estimateTime: 10000,
  },
  {
    sessionId: "31a61850-c0e5-4ce7-b4d3-01e7e716006a",
    id: 39,
    type: "offer",
    contentType: "text",
    cardId: "offer_card_001",
    content: JSON.stringify({
      offers: [
        {
          description: "",
          firstCateName: "家用电器",
          images: [
            "https://alpha-material-agent.oss-accelerate.aliyuncs.com/image/TSgzFQKhllM06WlUQMfshsAGDdiRkSpUHPRkky5P3dUN8yBLfHWCzgzQPjgWQV3JyVsLGGk5ZZCKM81R0dNA.jpg",
            "https://alpha-material-agent.oss-accelerate.aliyuncs.com/image/9ZpYw2f5LhuK1su5cEMc4jq3d33eh1jwwMyCrOylxISVbc3V09Vuqoj6UN6J6JYRyGa63B3HYzG5kBsPg.jpg",
          ],
          keywords: [],
          mediaId: "f68a4f67-fdeb-467f-ba85-5385d34f6349",
          offerId: 981657375712,
          productAttribute: [
            { attributeName: "产地", value: "温州" },
            { attributeName: "品牌", value: "磊鸟" },
          ],
          secondCateName: "母婴电器",
          sellingPoints: [],
          thirdCateName: "婴儿理发器",
          title: "婴儿理发器超静音宝宝儿童专用电推剪低噪音自动吸发碎发剃头发",
        },
      ],
    }),
    taskId: "675b9aaf-96c9-49ed-8620-dd8561db1cef",
  },
  {
    sessionId: "31a61850-c0e5-4ce7-b4d3-01e7e716006a",
    id: 40,
    type: "statusChange",
    taskId: "675b9aaf-96c9-49ed-8620-dd8561db1cef",
    status: "end",
  },
  {
    sessionId: "31a61850-c0e5-4ce7-b4d3-01e7e716006a",
    id: 41,
    type: "statusChange",
    taskId: "675b9aaf-96c9-49ed-8620-dd8561db1cef",
    status: "allDone",
  },
];

export const mockStream2 = [
  {
    sessionId: "7a30ef8f-1652-4c1b-9c3a-2db157c15779",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "resp",
  },

  {
    status: "start",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "statusChange",
  },

  {
    content:
      "OK，我会帮您把图片中的垃圾桶耳朵去掉。让我想一下如何处理得最自然~",
    id: "16de042f-f013-45bb-8cd1-c5a3bbd5a510",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "text",
  },

  {
    status: "end",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "statusChange",
  },

  {
    status: "start",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "statusChange",
  },

  {
    content: "正在帮你去掉图片中的垃圾桶耳朵...",
    id: "88c6ab13-0bc3-427b-a7a2-01aea841470d",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "text",
  },

  {
    status: "end",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "statusChange",
  },

  {
    status: "start",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "statusChange",
  },

  {
    contentType: "image",
    icon: "https://img.alicdn.com/imgextra/i3/6000000007439/O1CN0147pbzG24p7Py14EEp_!!6000000007439-2-cbu_global_ai_agent.png",
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    title: "智能消除",
    type: "design",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 3,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 6,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 9,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 12,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 16,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 21,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 26,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 27,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 31,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 34,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 36,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 39,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 43,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 49,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 50,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 53,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 58,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 70,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 84,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 90,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    estimateTime: 10,
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    percent: 100,
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "percent_loading",
  },

  {
    content:
      "https://aib-image.oss-ap-southeast-1.aliyuncs.com/ppc-records%2Fimage-remove%2Fd303b222-4aac-48c0-aac2-daaa37d079e3.jpg?OSSAccessKeyId=LTAI5t75Zk154w1Ne1UmpHKJ&Expires=4972417565&Signature=4zszb%2By5GBnx8PwTNDxHREAvL2Q%3D",
    contentType: "image",
    icon: "https://img.alicdn.com/imgextra/i3/6000000007439/O1CN0147pbzG24p7Py14EEp_!!6000000007439-2-cbu_global_ai_agent.png",
    id: "67c7ec02-8885-496f-b6c8-10145a24f2e1",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    title: "智能消除",
    type: "design",
  },

  {
    status: "end",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "statusChange",
  },

  {
    status: "start",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "statusChange",
  },

  {
    content:
      '## 报告：移除垃圾桶耳朵的图像处理\n\n### 概述\n本报告记录了对一张包含垃圾桶的图像进行处理的过程，目的是移除垃圾桶上的耳朵。处理后的图像已经生成并提供。\n\n### 关键发现\n- 原始图像中，垃圾桶上有一对耳朵。\n- 使用工具 "generalMas_imageElementRemove" 成功移除垃圾桶上的耳朵。\n- 处理后的图像链接已提供。\n\n### 详细分析\n#### 原始图像\n- **图像链接**: [原始图像](https://cbu01.alicdn.com/img/ibank/O1CN01F9eBcm25i4uufbsvj_!!2219798997559-0-cib.jpg)\n- **描述**: 该图像显示了一个垃圾桶，垃圾桶上有一对耳朵。\n\n#### 处理后的图像\n- **图像链接**: [处理后的图像](https://aib-image.oss-ap-southeast-1.aliyuncs.com/ppc-records%2Fimage-remove%2Fd303b222-4aac-48c0-aac2-daaa37d079e3.jpg?OSSAccessKeyId=LTAI5t75Zk154w1Ne1UmpHKJ&Expires=4972417565&Signature=4zszb%2By5GBnx8PwTNDxHREAvL2Q%3D)\n- **描述**: 该图像显示了垃圾桶，但耳朵已经被成功移除。\n\n#### 使用的工具和参数\n- **工具**: `generalMas_imageElementRemove`\n- **参数**:\n  - `imageUrl`: 原始图像的URL\n  - `noobjRemoveCharacter`: `false`\n  - `noobjRemoveLogo`: `false`\n  - `noobjRemoveNpx`: `false`\n  - `noobjRemoveQrcode`: `false`\n  - `noobjRemoveWatermark`: `false`\n  - `objRemoveWatermark`: `false`\n  - `requestBizId`: `request_001`\n\n### 结论和建议\n- **结论**: 使用 `generalMas_imageElementRemove` 工具成功移除了垃圾桶上的耳朵，处理后的图像符合预期。\n- **建议**: \n  - 如果需要进一步处理图像，可以继续使用该工具调整其他元素。\n  - 确保处理后的图像质量符合需求，必要时进行进一步的图像优化。\n\n### 附录\n- **原始图像**: \n  ![原始图像](https://cbu01.alicdn.com/img/ibank/O1CN01F9eBcm25i4uufbsvj_!!2219798997559-0-cib.jpg)\n- **处理后的图像**: \n  ![处理后的图像](https://aib-image.oss-ap-southeast-1.aliyuncs.com/ppc-records%2Fimage-remove%2Fd303b222-4aac-48c0-aac2-daaa37d079e3.jpg?OSSAccessKeyId=LTAI5t75Zk154w1Ne1UmpHKJ&Expires=4972417565&Signature=4zszb%2By5GBnx8PwTNDxHREAvL2Q%3D)',
    id: "7d6fe556-9ecf-4e37-bb5d-b6dd916572df",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "text",
  },

  {
    status: "end",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "statusChange",
  },

  {
    status: "allDone",
    taskId: "6b4fdb58-a493-4f5e-b29b-771ae5ff54aa",
    type: "statusChange",
  },
];

export const mockSmallTalk = {
  success: true,
  data: {
    userId: 2212625891418,
    sessionId: "fa9fff40-0f7b-4bc3-b24a-4338f956e936",
    title:
      "你好，可以告诉我你的具体需求吗？比如你想要什么样的设计或内容？这样我才能帮你提炼出一个有趣的标题哦！",
    sessionImage: "",
    messages: [
      {
        id: 52,
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "resp",
      },
      {
        id: 54,
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        status: "start",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "statusChange",
      },
      {
        content: "马上为你",
        contentType: "text",
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "text_stream",
      },
      {
        content: "创作一把帅气的宝剑",
        contentType: "text",
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "text_stream",
      },
      {
        content: "，每一处细节都会",
        contentType: "text",
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "text_stream",
      },
      {
        content: "精心打磨，敬请",
        contentType: "text",
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "text_stream",
      },
      {
        content: "期待！",
        contentType: "text",
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "text_stream",
      },
      {
        id: 55,
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        status: "end",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "statusChange",
      },
      {
        id: 57,
        intent: "mediaTask",
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "intent",
      },
      {
        id: 58,
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        status: "start",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "statusChange",
      },
      {
        id: 59,
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        status: "end",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "statusChange",
      },
      {
        id: 60,
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        status: "start",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "statusChange",
      },
      {
        content:
          "正在生成一把宝剑的图像，设计思路如下：整体风格为古典武侠风，宝剑主体修长锋利，剑身带有细微纹路，剑柄缠绕暗红丝线，背景为淡雅水墨山峦，光影柔和，突出剑的气势。",
        contentType: "text",
        id: 61,
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "text",
      },
      {
        id: 62,
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        status: "end",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "statusChange",
      },
      "heartbeat:1761210185825",
      {
        id: 63,
        sessionId: "0b0eefa8-2b7f-4b4d-9467-c5c1f58cfe14",
        status: "start",
        taskId: "3f09f007-4211-4dc3-814c-bddeed29c9f9",
        type: "statusChange",
      },
    ],
    createdTime: 1761202053000,
    latestTaskId: "5544f95e-ca81-41ae-aeaf-677d8b86b773",
    taskStatus: "COMPLETED",
    latestEventId: 8,
    isOfficial: null,
    official: null,
  },
  code: null,
  mesg: null,
  failure: false,
};
