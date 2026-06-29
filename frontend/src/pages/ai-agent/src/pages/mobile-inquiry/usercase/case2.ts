export default {
  cardId: "9ce96680-f00f-4a37-9e05-d466cc7d53e1",
  cardType: "INQUIRY_REPORT",
  detail: {
    aiInsight: [
      {
        cnKey: "总询盘商家数",
        value: "6",
      },
      {
        cnKey: "询盘已完成商家数",
        value: "6",
      },
      {
        cnKey: "询盘未完成商家数",
        value: "0",
      },
      {
        cnKey: "询盘完成率",
        value: "100%",
      },
      {
        cnKey: "平均首次回复时长",
        value: "1分",
      },
    ],
    aiSummary: "# 最佳推荐\n\n西藏建华商贸有限公司（b供江甫测试分销001）在价格（1.85元/1000个，为所有报价中最低）、支持出口纸箱包装、起批量适中（500个）以及发货速度（可加急次日发货）方面综合表现最优，尤其适合有出口需求且对交期敏感的采购场景。\n\n# 总体概览\n本次询盘共收到6家供应商的有效回复。本次采购的核心在于价格、最小起批量、发货时间以及是否支持出口纸箱包装。\n- 雷徐冬(分销大b测试003)：价格较低（1.90元），起批量极低（1个），发货快（3天内），但不支持出口纸箱包装。\n- 跨境b供测试002：支持出口包装，但起批量高（1000个），价格略高（2元），发货较慢（7-10天）。\n- 西藏建华商贸有限公司：价格最低（1.85元/1000个），支持出口包装，起批量适中（500个），且可加急次日发货，综合表现优异。\n- 慕嘉测试卞韦的公司：起批量极低（2个），支持出口包装，但价格最高（2.1元），发货时间中等（5天）。\n- 雷徐冬(分销大b测试001)：起批量低（1件），支持出口包装，价格适中（1.95元），但发货较慢（7-10天）。\n- 雷徐冬(b供威亚测试分销008)：价格较低（1.90元），起批量200个，发货需5天，出口包装需额外时间制作，灵活性一般。\n\n# 核心内容\n1. **价格(lowestPrice)**:\n   - 最低单价为西藏建华商贸有限公司（1.85元/1000个，即0.00185元/个，但需注意其报价单位为1000个）；若按单个计价，则雷徐冬(分销大b测试003)和(b供威亚测试分销008)均为1.90元，为最低。\n   - 慕嘉测试卞韦的公司价格最高（2.1元）。\n2. **最小起批量(moq)**:\n   - 雷徐冬(分销大b测试003)和(分销大b测试001)起批量最低（1个/1件）。\n   - 跨境b供测试002起批量最高（1000个）。\n3. **发货时间(deliveryTime)**:\n   - 西藏建华商贸有限公司最快（加急次日发货）。\n   - 雷徐冬(分销大b测试003)次之（3天内）。\n   - 跨境b供测试002和雷徐冬(分销大b测试001)最慢（7-10天）。\n4. **是否支持出口纸箱包装(exportCartonPackaging)**:\n   - 除雷徐冬(分销大b测试003)明确不支持外，其余均支持（其中雷徐冬(b供威亚测试分销008)需额外时间制作）。",
    autoOrderInfo: [

    ],
    isReport: true,
    supplierCompare: [
      {
        conversationId: "05ee90f8-a0d4-4c55-a3c2-9111bea80dde",
        inquiryAnswers: [
          {
            key: "exportCartonPackaging",
            value: "没有",
          },
          {
            key: "moq",
            value: "一个起批",
          },
          {
            key: "deliveryTime",
            value: "3天内发货",
          },
          {
            key: "lowestPrice",
            value: "1.90元一个",
          },
        ],
        inquiryTaskId: "kj-b5c7cc8d-c289-42b4-aa64-15b12cf04c8e",
        progress: "100%",
        questionProgress: [
          {
            isFinished: true,
            q: "能按出口纸箱包装吗？",
          },
          {
            isFinished: true,
            q: "最小起批量是多少？",
          },
          {
            isFinished: true,
            q: "多久可以发货？",
          },
          {
            isFinished: true,
            q: "能给到的最低价是多少？",
          },
        ],
        sellerInfo: {
          companyName: "雷徐冬",
          headImg: "https://cbu01.alicdn.com/img/ibank/2020/428/378/22185873824_536529798.jpg",
          isBest: false,
          wangwangId: "分销大b测试003",
        },
        status: "FINISHED",
      },
      {
        conversationId: "121b1a79-c23c-4b12-87af-8ef388925f48",
        inquiryAnswers: [
          {
            key: "exportCartonPackaging",
            value: "支持",
          },
          {
            key: "moq",
            value: "1000个",
          },
          {
            key: "deliveryTime",
            value: "7-10天内发货",
          },
          {
            key: "lowestPrice",
            value: "1000个2元一个",
          },
        ],
        inquiryTaskId: "kj-b5c7cc8d-c289-42b4-aa64-15b12cf04c8e",
        progress: "100%",
        questionProgress: [
          {
            isFinished: true,
            q: "能按出口纸箱包装吗？",
          },
          {
            isFinished: true,
            q: "最小起批量是多少？",
          },
          {
            isFinished: true,
            q: "多久可以发货？",
          },
          {
            isFinished: true,
            q: "能给到的最低价是多少？",
          },
        ],
        sellerInfo: {
          companyName: "跨境b供测试002",
          headImg: "https://cbu01.alicdn.com/img/ibank/2020/428/378/22185873824_536529798.jpg",
          isBest: false,
          wangwangId: "跨境b供测试002",
        },
        status: "FINISHED",
      },
      {
        conversationId: "70d47f67-1fed-470e-9252-ccd6040eb6c5",
        inquiryAnswers: [
          {
            key: "exportCartonPackaging",
            value: "支持",
          },
          {
            key: "moq",
            value: "500个",
          },
          {
            key: "deliveryTime",
            value: "加急的话明天就能发",
          },
          {
            key: "lowestPrice",
            value: "1000个1.85元一个",
          },
        ],
        inquiryTaskId: "kj-b5c7cc8d-c289-42b4-aa64-15b12cf04c8e",
        progress: "100%",
        questionProgress: [
          {
            isFinished: true,
            q: "能按出口纸箱包装吗？",
          },
          {
            isFinished: true,
            q: "最小起批量是多少？",
          },
          {
            isFinished: true,
            q: "多久可以发货？",
          },
          {
            isFinished: true,
            q: "能给到的最低价是多少？",
          },
        ],
        sellerInfo: {
          companyName: "西藏建华商贸有限公司",
          headImg: "https://cbu01.alicdn.com/img/ibank/2020/428/378/22185873824_536529798.jpg",
          isBest: true,
          wangwangId: "b供江甫测试分销001",
        },
        status: "FINISHED",
      },
      {
        conversationId: "90e0ca70-ecd9-4727-ac97-0884bae17cbb",
        inquiryAnswers: [
          {
            key: "exportCartonPackaging",
            value: "支持",
          },
          {
            key: "moq",
            value: "2个",
          },
          {
            key: "deliveryTime",
            value: "5天内发货",
          },
          {
            key: "lowestPrice",
            value: "2.1元",
          },
        ],
        inquiryTaskId: "kj-b5c7cc8d-c289-42b4-aa64-15b12cf04c8e",
        progress: "100%",
        questionProgress: [
          {
            isFinished: true,
            q: "能按出口纸箱包装吗？",
          },
          {
            isFinished: true,
            q: "最小起批量是多少？",
          },
          {
            isFinished: true,
            q: "多久可以发货？",
          },
          {
            isFinished: true,
            q: "能给到的最低价是多少？",
          },
        ],
        sellerInfo: {
          companyName: "慕嘉测试卞韦的公司",
          headImg: "https://cbu01.alicdn.com/img/ibank/2020/428/378/22185873824_536529798.jpg",
          isBest: false,
          wangwangId: "分销大b测试005",
        },
        status: "FINISHED",
      },
      {
        conversationId: "a322ebfa-3ce8-4e42-913f-f75f461f834c",
        inquiryAnswers: [
          {
            key: "exportCartonPackaging",
            value: "支持",
          },
          {
            key: "moq",
            value: "1件",
          },
          {
            key: "deliveryTime",
            value: "7-10天",
          },
          {
            key: "lowestPrice",
            value: "1.95元一个",
          },
        ],
        inquiryTaskId: "kj-b5c7cc8d-c289-42b4-aa64-15b12cf04c8e",
        progress: "100%",
        questionProgress: [
          {
            isFinished: true,
            q: "能按出口纸箱包装吗？",
          },
          {
            isFinished: true,
            q: "最小起批量是多少？",
          },
          {
            isFinished: true,
            q: "多久可以发货？",
          },
          {
            isFinished: true,
            q: "能给到的最低价是多少？",
          },
        ],
        sellerInfo: {
          companyName: "雷徐冬",
          headImg: "https://cbu01.alicdn.com/img/ibank/O1CN01RO3IFr1DOr5GPhX4i_!!6000000000207-0-cib.jpg",
          isBest: false,
          wangwangId: "分销大b测试001",
        },
        status: "FINISHED",
      },
      {
        conversationId: "d1062413-05ce-4a0b-9013-228c83fd4b25",
        inquiryAnswers: [
          {
            key: "exportCartonPackaging",
            value: "没有出口标准的纸箱包装，但可以加时间做",
          },
          {
            key: "moq",
            value: "200个",
          },
          {
            key: "deliveryTime",
            value: "5天后",
          },
          {
            key: "lowestPrice",
            value: "1.90元一个",
          },
        ],
        inquiryTaskId: "kj-b5c7cc8d-c289-42b4-aa64-15b12cf04c8e",
        progress: "100%",
        questionProgress: [
          {
            isFinished: true,
            q: "能按出口纸箱包装吗？",
          },
          {
            isFinished: true,
            q: "最小起批量是多少？",
          },
          {
            isFinished: true,
            q: "多久可以发货？",
          },
          {
            isFinished: true,
            q: "能给到的最低价是多少？",
          },
        ],
        sellerInfo: {
          companyName: "雷徐冬",
          headImg: "https://cbu01.alicdn.com/img/ibank/2020/428/378/22185873824_536529798.jpg",
          isBest: false,
          wangwangId: "b供威亚测试分销008",
        },
        status: "FINISHED",
      },
    ],
    tableHead: [
      {
        cnKey: "是否支持出口纸箱包装",
        key: "exportCartonPackaging",
      },
      {
        cnKey: "最小起批量",
        key: "moq",
      },
      {
        cnKey: "发货时间",
        key: "deliveryTime",
      },
      {
        cnKey: "价格",
        key: "lowestPrice",
      },
    ],
    taskInfo: {
      createTime: "2025-11-11 14:13:51",
      finishTime: "2025-11-11 14:19:29",
      img: "https://cbu01.alicdn.com/img/ibank/O1CN01ISqHit1VwtbtoTWWX_!!4611686018427382430-0-overseas_pic.jpg",
      isAutoOrder: false,
      questionNum: 4,
      status: "FINISHED",
      supplierNum: 6,
      title: "定制红色天地盒1000个出口包装",
    },
  },
  eventType: "DATA_DISPLAY",
  needHide: false,
  requestId: "f4463ccd-03f2-40fe-b532-449b4f4ee842",
  sessionId: "kj-b5c7cc8d-c289-42b4-aa64-15b12cf04c8e",
  timestamp: 1762841969731,
  title: "询盘报告",
};