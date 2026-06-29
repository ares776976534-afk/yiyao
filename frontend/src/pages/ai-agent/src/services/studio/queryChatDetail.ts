// 查询对话详情
import { materiaRequest as request } from "@/services/httpRequest";

export default async function queryChatDetail(sessionId: string) {
  if (sessionId === 'test') {
    return {
      "success": true,
      "data": {
        "userId": 2214527143646,
        "sessionId": "fb511af7-00d4-4e28-88b4-15094ef37678",
        "title": "跨境商品分析",
        "sessionImage": "",
        "messages": [
          {
            "attachments": [],
            "offerInfos": [],
            "messageType": "USER",
            "query": "测试商品跨境分析",
            "cardId": "351c3314"
          },
          {
            "messageType": "ASSISTANT",
            "cardId": "c4f93c3d",
            "sessionId": "fb511af7-00d4-4e28-88b4-15094ef37678",
            "type": "resp",
            "taskId": "98ea2e34-287b-49cf-bd32-10b6e97cba94"
          },
          {
            "messageType": "ASSISTANT",
            "cardId": "fddc5043",
            "sessionId": "fb511af7-00d4-4e28-88b4-15094ef37678",
            "type": "intent",
            "intent": "smallTalk",
            "taskId": "98ea2e34-287b-49cf-bd32-10b6e97cba94"
          },
          {
            "messageType": "ASSISTANT",
            "cardId": "2441b8f1",
            "type": "text",
            "content": "您好！我是 AlphaShop 助手，很高兴为您服务。\n\n关于您提到的“测试商品跨境分析”，根据现有信息，我为您整理了以下关键内容，供您参考或用于测试场景：\n\n---\n\n### \uD83D\uDCCA 商品跨境分析测试方法（简明版）：\n1. **小批量试销**：通过 Amazon、Shopee 等平台定向投放少量样品，观察真实市场反馈；\n2. **A/B 测试**：对比不同定价、主图、文案的点击率（CTR）与转化率（CVR）；\n3. **本地化调研**：结合问卷与焦点小组，评估文化适配性与用户真实需求；\n4. **竞品模拟测试**：用关键词搜索竞品，监测曝光、点击、加购行为等链路表现。\n\n---\n\n### \uD83D\uDEE0 常用工具推荐：\n- **趋势洞察**：Google Trends（搜索热度）\n- **平台数据**：Jungle Scout / Helium 10（亚马逊）\n- **流量分析**：SimilarWeb、SE Ranking\n- **合规验证**：HS 编码查询系统、本地支付/物流 API 沙箱\n\n---\n\n### \uD83D\uDCC8 核心评估指标（建议阈值）：\n| 维度 | 指标 | 健康参考值 |\n|------|------|------------|\n| 市场潜力 | 3年CAGR、月均搜索量 | ≥10% 增长为佳 |\n| 准入风险 | 关税、认证缺口率 | CE/EN71等认证缺失率＜30% |\n| 竞争强度 | 头部3卖家市占率 | ＜60% 为可进入区间 |\n| 转化效率 | CTR / CVR / 退货率 | CTR ≥2%，CVR ≥8%，退货率 ＜12% |\n| 本地化健康度 | 多语言页完读率、客服响应时长 | 完读率 ≥65%，响应＜2小时 |\n\n---\n\n### \uD83D\uDCC4 报告输出建议（500字内精简版）：\n- 执行摘要（推荐/暂缓结论）  \n- TOP3机会与风险（如：“德国年搜索量↑47%，但CE认证缺口63%”）  \n- 量化证据 + 可行动建议（如：“优先完成EN71认证，首期试销500件”）  \n- 附录索引（数据源链接、合规清单）\n\n如您有具体商品类目、目标国家或想测试的某环节（如：HS编码合规性验证、本地化文案A/B测试），欢迎告诉我，我可以帮您定制测试方案或生成模拟报告模板 \uD83D\uDE0A"
          },
          {
            "messageType": "ASSISTANT",
            "sessionId": "fb511af7-00d4-4e28-88b4-15094ef37678",
            "type": "statusChange",
            "taskId": "98ea2e34-287b-49cf-bd32-10b6e97cba94",
            "status": "allDone"
          }
        ],
        "createdTime": 1772196692000,
        "latestTaskId": "98ea2e34-287b-49cf-bd32-10b6e97cba94",
        "taskStatus": "COMPLETED",
        "latestEventId": 5,
        "meta": {
          "version": "1.1.1"
        }
      },
      "code": null,
      "mesg": null,
      "failure": false
    };
  }

  try {
    const res = await request(
      "/chatHistory/detail",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          sessionId,
        }),
      }
    );

    const { success, data = {} } = res || {};

    if (success) {
      return { success, data };
    }
    return { success: false, data: {} };
  } catch (e) {
    return { success: false, data: {} };
  }
}
