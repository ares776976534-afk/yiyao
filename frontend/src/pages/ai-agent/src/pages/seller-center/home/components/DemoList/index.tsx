import React, { useEffect, useState } from "react";
import Card from "./Card";
import { sceneMap } from "@/pages/agent-home/components/DemoList";
import { getShareRecord, createChatCache } from "@/services";
import { $t } from '@/i18n';
import { appVersionType, AppVersionType } from '@/utils/env';

const isGlobal = appVersionType === AppVersionType.GLOBAL;

const allCardData = [
  {
    oppScene: "NEW_PRODUCT_DISCOVERY",
    shareCode: "eee44b9278",
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.bizkrlye", "美国最火的瑜伽裤新品是什么？都有哪些创新？"),
    imgUrl:
    isGlobal ? 'https://img.alicdn.com/imgextra/i1/O1CN01dVsPlB1QLH0Q5Jb4r_!!6000000001959-2-tps-2016-1512.png' :
      "https://img.alicdn.com/imgextra/i1/O1CN015l52rs29sqk6ShWXc_!!6000000008124-2-tps-3024-2268.png",
    userRequest: $t("global-1688-ai-app.seller-center.home.DemoList.cd850fbcrTSQNOcyEUvyTPaanxeulnei20t25oKrsheottrtokcCroRrteeeNinllaenwusrbc60bdaCraPoaab02bbccrlnvep22s45aHreinodv1f8add0I98b8c9ia655", "{\"cardId\":\"3e31858bb5574003a5bf58e8b221dca6\",\"cardSubType\":\"USER_REQUEST_NEW_PRODUCT\",\"cardType\":\"USER_REQUEST\",\"eventType\":\"DATA_DISPLAY\",\"rawData\":\"{\\\"extInfos\\\":{\\\"executeStatus\\\":\\\"new\\\"},\\\"listingTime\\\":{\\\"endTime\\\":\\\"2025-11-10\\\",\\\"startTime\\\":\\\"2025-05-14\\\"},\\\"productKeyword\\\":\\\"瑜伽裤\\\",\\\"searchContexts\\\":[{\\\"contentType\\\":\\\"text\\\",\\\"productKeyword\\\":\\\"瑜伽裤\\\"}],\\\"selectionCriteria\\\":{\\\"productRequirement\\\":{\\\"priceRange\\\":{\\\"currency\\\":\\\"CNY\\\"},\\\"ratingRange\\\":{},\\\"salesVolumeRange\\\":{}}},\\\"sessionId\\\":\\\"new_product_discovery_f12bbafdc518463aa109fd6bd3d6d350\\\",\\\"targetCountry\\\":\\\"US\\\",\\\"targetPlatform\\\":\\\"amazon\\\",\\\"taskId\\\":\\\"b309408984244bab8585b8ec7c139fc4\\\",\\\"userModel\\\":{\\\"loginId\\\":\\\"vv_v5\\\",\\\"timestamp\\\":1762258062496,\\\"userId\\\":430705726}}\",\"saveToHistory\":true,\"sessionId\":\"new_product_discovery_f12bbafdc518463aa109fd6bd3d6d350\",\"taskId\":\"b309408984244bab8585b8ec7c139fc4\",\"timestamp\":1762775531415}"),
  },
  {
    oppScene: "PRODUCT_IMPROVEMENT",
    shareCode: "986b6b4f92",
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.ytRdevig", "亚马逊热销的清洁机器人都有哪些差评？如何改进？"),
    imgUrl:
    isGlobal ? 'https://img.alicdn.com/imgextra/i1/O1CN012AKJJV1QrKjMQWsYq_!!6000000002029-2-tps-2016-1512.png' :
      "https://img.alicdn.com/imgextra/i3/O1CN014Lx4XV1DULqO8D485_!!6000000000219-2-tps-3024-2268.png",
    userRequest: $t("global-1688-ai-app.seller-center.home.DemoList.cdaf176arTSQIVdUETtDIYatsuaededeCxnTeoKrstrideepRcnYngeunsIdme5af9fd1guUgamok904cb9uoodtt789r02estenoivt12aa5fsdd09892s171", "{\"cardId\":\"5e86af3c5fee4913afe76f136e721a63\",\"cardSubType\":\"USER_REQUEST_IMPROVE\",\"cardType\":\"USER_REQUEST\",\"eventType\":\"DATA_DISPLAY\",\"rawData\":\"{\\\"extInfos\\\":{\\\"executeStatus\\\":\\\"new\\\"},\\\"productKeyword\\\":\\\"吸尘器\\\",\\\"searchContexts\\\":[{\\\"contentType\\\":\\\"text\\\",\\\"productKeyword\\\":\\\"吸尘器\\\"}],\\\"selectionCriteria\\\":{\\\"productRequirement\\\":{\\\"priceRange\\\":{\\\"currency\\\":\\\"CNY\\\"},\\\"ratingRange\\\":{},\\\"salesVolumeRange\\\":{}}},\\\"sessionId\\\":\\\"product_improvement_50281a9b22fd42a981bafbbe5daa8f10\\\",\\\"targetCountry\\\":\\\"US\\\",\\\"targetPlatform\\\":\\\"amazon\\\",\\\"taskId\\\":\\\"dd909ad0d3e0404d9c8f58b6bf99abc2\\\",\\\"userModel\\\":{\\\"loginId\\\":\\\"vv_v5\\\",\\\"timestamp\\\":1762258062496,\\\"userId\\\":430705726}}\",\"saveToHistory\":true,\"sessionId\":\"product_improvement_50281a9b22fd42a981bafbbe5daa8f10\",\"taskId\":\"dd909ad0d3e0404d9c8f58b6bf99abc2\",\"timestamp\":1762775677128}"),
  },
  {
    oppScene: "PLATFORM_MARKET_MIGRATION",
    shareCode: "30339c1cb0",
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.ywyhkm", "有哪些户外玩具产品在亚马逊卖的很火但Tiktok还没人卖？"),
    imgUrl:
    isGlobal ? 'https://img.alicdn.com/imgextra/i1/O1CN01CyUrQi27chYTw3egr_!!6000000007818-2-tps-2016-1512.png' :
      "https://img.alicdn.com/imgextra/i2/O1CN01dJwOwV1YRhTypwvy1_!!6000000003056-2-tps-3024-2268.png",
    userRequest: "{\"cardId\":\"9de9a13974c048b7a655fbe46c4ef922\",\"cardSubType\":\"USER_REQUEST_IMPROVE\",\"cardType\":\"USER_REQUEST\",\"eventType\":\"DATA_DISPLAY\",\"rawData\":\"{\\\"extInfos\\\":{\\\"executeStatus\\\":\\\"new\\\"},\\\"migrationType\\\":\\\"cross_platform\\\",\\\"productKeyword\\\":\\\"sports & outdoor play toys\\\",\\\"searchContexts\\\":[{\\\"contentType\\\":\\\"text\\\",\\\"productKeyword\\\":\\\"sports & outdoor play toys\\\"}],\\\"selectionCriteria\\\":{\\\"productRequirement\\\":{\\\"priceRange\\\":{\\\"currency\\\":\\\"CNY\\\"},\\\"ratingRange\\\":{},\\\"salesVolumeRange\\\":{}}},\\\"sessionId\\\":\\\"market_migration_0c0ab0d1558a4279be3ca9c8e8edddcb\\\",\\\"sourceCountry\\\":\\\"US\\\",\\\"sourcePlatform\\\":\\\"amazon\\\",\\\"targetCountry\\\":\\\"US\\\",\\\"targetPlatform\\\":\\\"tiktok\\\",\\\"taskId\\\":\\\"78878b026ef3443d9eb6bdba0b1ffd22\\\",\\\"userModel\\\":{\\\"loginId\\\":\\\"vv_v5\\\",\\\"timestamp\\\":1762258062496,\\\"userId\\\":430705726}}\",\"saveToHistory\":true,\"sessionId\":\"market_migration_0c0ab0d1558a4279be3ca9c8e8edddcb\",\"taskId\":\"78878b026ef3443d9eb6bdba0b1ffd22\",\"timestamp\":1762840812314}",
  },
  {
    oppScene: "DESIGN_AGENT",
    shareCode: "bf649228ff",
    cacheId: "",
    makeSimilar: true,
    showTitle: $t("global-1688-ai-app.seller-center.home.DemoList.scAgent", "素材Agent"),
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.hqc", "高温清洁器家用场景图"),
    imgUrl:
      "https://img.alicdn.com/imgextra/i2/6000000007476/O1CN01oL61RS25645q8IiTJ_!!6000000007476-0-cbu_global_ai_agent.jpg",
  },
  {
    oppScene: "DESIGN_AGENT",
    shareCode: "28717ef443",
    cacheId: "",
    makeSimilar: true,
    showTitle: $t("global-1688-ai-app.seller-center.home.DemoList.scAgent", "素材Agent"),
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.btoz", "批量抠图&生成商品展示图"),
    imgUrl:
      "https://img.alicdn.com/imgextra/i3/6000000004027/O1CN01V60CgK1fcQ3wKMwcX_!!6000000004027-0-cbu_global_ai_agent.jpg",
  },
  {
    oppScene: "FIND_PROVIDER",
    shareCode: "6d4762b6a5",
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.gxz", "跟卖热销品？找同款最优供应商"),
    imgUrl:
    isGlobal ? 'https://img.alicdn.com/imgextra/i2/O1CN01jRda9k1J48sgjMTDj_!!6000000000974-2-tps-2016-1512.png' :
      "https://img.alicdn.com/imgextra/i3/O1CN01yWhw0q1TDR4HoZDf6_!!6000000002348-0-tps-3024-2268.jpg",
    userRequest: "{\"cardId\":\"07eb14ac009542a0bcbe463adee962e7\",\"cardSubType\":\"USER_REQUEST_FIND_PROVIDER\",\"cardType\":\"USER_REQUEST\",\"eventType\":\"DATA_DISPLAY\",\"rawData\":\"{\\\"intention\\\":\\\"AUTO\\\",\\\"query\\\":\\\"\\\",\\\"searchImageUrl\\\":\\\"https://cbu01.alicdn.com/img/ibank/O1CN016jKtRm1TfpclpK17y_!!4611686018427382122-0-overseas_pic.jpg\\\",\\\"sessionId\\\":\\\"find_provider_4766ef34a5b74e9e8f76f7911aae220d\\\",\\\"taskId\\\":\\\"fe8de8c9b2334be0ba2b7573b1342261\\\",\\\"userModel\\\":{\\\"loginId\\\":\\\"tb961297096476\\\",\\\"timestamp\\\":1763344153540,\\\"userId\\\":2220296025911}}\",\"saveToHistory\":true,\"sessionId\":\"find_provider_4766ef34a5b74e9e8f76f7911aae220d\",\"taskId\":\"fe8de8c9b2334be0ba2b7573b1342261\",\"timestamp\":1763537997611}",
  },
  {
    oppScene: "FIND_PROVIDER",
    shareCode: "726cf44af3",
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.tkbtspzzjs", "同款不同色？拍照直接搜！"),
    imgUrl:
    isGlobal ? 'https://img.alicdn.com/imgextra/i3/O1CN013YJEzr1C9uYlBWsb1_!!6000000000039-2-tps-2016-1512.png' :
      "https://img.alicdn.com/imgextra/i4/O1CN01aD4QBq1jFIWzEn4ud_!!6000000004518-2-tps-3024-2268.png",
    userRequest: $t("global-1688-ai-app.seller-center.home.DemoList.cd2691fcrTSQFREdUETtDIYatoOyyyamrp0cmb1lZyi1134rpgifre1ec82ba2246d23rln977ep33s299viysoior7ed8dcs54494abs147", "{\"cardId\":\"9cd42241560144989ce15e27ff87acea\",\"cardSubType\":\"USER_REQUEST_FIND_PROVIDER\",\"cardType\":\"USER_REQUEST\",\"eventType\":\"DATA_DISPLAY\",\"rawData\":\"{\\\"intention\\\":\\\"AUTO\\\",\\\"query\\\":\\\"找图上的羽绒服，但是要紫色\\\",\\\"searchImageUrl\\\":\\\"https://cbu01.alicdn.com/img/ibank/O1CN01lUAuVZ1c2HyFFA2ic_!!4611686018427383254-2-overseas_pic.png\\\",\\\"sessionId\\\":\\\"find_provider_f0817650ee5b4cde8488c762dcb2bc47\\\",\\\"taskId\\\":\\\"25c7f24f24444ce69fb1d410b2abf53b\\\",\\\"userModel\\\":{\\\"loginId\\\":\\\"tb961297096476\\\",\\\"timestamp\\\":1763344153540,\\\"userId\\\":2220296025911}}\",\"saveToHistory\":true,\"sessionId\":\"find_provider_f0817650ee5b4cde8488c762dcb2bc47\",\"taskId\":\"25c7f24f24444ce69fb1d410b2abf53b\",\"timestamp\":1763541018746}"),
  },
  {
    oppScene: "FIND_PROVIDER",
    shareCode: "8d1edae850",
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.srzj", "支持外贸定制的毛绒玩具工厂"),
    imgUrl:
    isGlobal ? 'https://img.alicdn.com/imgextra/i4/O1CN01nqVAbV1yhtVJ2Wo4N_!!6000000006611-2-tps-2016-1512.png' :
      "https://img.alicdn.com/imgextra/i1/O1CN01TyoCad22zXDMNK8KX_!!6000000007191-0-tps-3024-2268.jpg",
    userRequest: $t("global-1688-ai-app.seller-center.home.DemoList.cd817138rTSQFREdUETtDIYatoOyrcfwennv3172492k0649fbuood19tt725r201ifre041d74a25bf7f0ep54", "{\"cardId\":\"f8558f73e1964f72bf317610366368ed\",\"cardSubType\":\"USER_REQUEST_FIND_PROVIDER\",\"cardType\":\"USER_REQUEST\",\"eventType\":\"DATA_DISPLAY\",\"rawData\":\"{\\\"intention\\\":\\\"AUTO\\\",\\\"query\\\":\\\"我想找毛绒玩具的工厂，支持贴标服务，支持英文说明书\\\",\\\"sessionId\\\":\\\"find_provider_30a021e747724112add94e5709cd482a\\\",\\\"taskId\\\":\\\"2d0345b6eabb4eaf996778f60f3b990b\\\",\\\"userModel\\\":{\\\"loginId\\\":\\\"tb961297096476\\\",\\\"timestamp\\\":1762172932753,\\\"userId\\\":2220296025911}}\",\"sessionId\":\"find_provider_30a021e747724112add94e5709cd482a\",\"taskId\":\"2d0345b6eabb4eaf996778f60f3b990b\",\"timestamp\":1762571954641}"),
  },
  {
    oppScene: "INQUIRY",
    shareCode: "5c5f193bbc",
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.Alc", "AI谈判不露怯，智能决策选最优！"),
    imgUrl:
    isGlobal ? 'https://img.alicdn.com/imgextra/i3/O1CN01FPijn41jd78KpvqxM_!!6000000004570-2-tps-2016-1512.png' :
      "https://img.alicdn.com/imgextra/i1/O1CN01sNC7PP1Iye7Y9XDnw_!!6000000000962-2-tps-3024-2268.png",
  },
  {
    oppScene: "INQUIRY",
    shareCode: "5659edfb06",
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.bjzy", "批量询价自动跑，躺着也能找货源！"),
    imgUrl:
    isGlobal ? 'https://img.alicdn.com/imgextra/i1/O1CN01AsTQj728UkI6fLqHj_!!6000000007936-2-tps-2016-1512.png' :
      "https://img.alicdn.com/imgextra/i4/O1CN01CCk6mC26GQfiQ2wLM_!!6000000007634-2-tps-3024-2268.png",
  },
  {
    oppScene: "INQUIRY",
    shareCode: "e8813a1b63",
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.xziz", "询盘策略全自动，智能筛选真供给！"),
    imgUrl:
    isGlobal ? 'https://img.alicdn.com/imgextra/i2/O1CN01cwq8I41oFp4SHyq9Y_!!6000000005196-2-tps-2016-1512.png' :
      "https://img.alicdn.com/imgextra/i2/O1CN01qVEpCW1Tia05qow6D_!!6000000002416-2-tps-3024-2268.png",
  },
  {
    oppScene: "CONSULT",
    shareCode: "503e9d076d",
    caseTitle: $t("global-1688-ai-app.seller-center.home.DemoList.crknis", "从0开始做TikTok，东南亚物流全攻略"),
    imgUrl:
    isGlobal ? 'https://img.alicdn.com/imgextra/i3/O1CN01GkhtOD1Ke9dhUUXK9_!!6000000001188-2-tps-2016-1512.png' :
      "https://img.alicdn.com/imgextra/i3/O1CN01YNdQWX1sAYyi1atr1_!!6000000005726-0-tps-3024-2268.jpg",
    userRequest: $t("global-1688-ai-app.seller-center.home.DemoList.cde57fd9rTSPAXdUETtDIYayszctksnhfsestenn4143ceckbd4baftt704", "{\"cardId\":\"8e8de09725574072840fbbecdd8189fb\",\"cardSubType\":\"USER_INPUT_PLAIN_TEXT\",\"cardType\":\"USER_REQUEST\",\"eventType\":\"DATA_DISPLAY\",\"rawData\":\"我是一个跨境电商初创业者，自己不是工厂，我想先在tiktok东南亚尝试一下能不能出单，最适合我的物流发货方式是什么？\",\"saveToHistory\":true,\"sessionId\":\"consult_4cb1b18b984e4bb3bf69cb5c4e9659c7\",\"taskId\":\"49bd0c3df3e3402a8b63eaa8e40fff89\",\"timestamp\":1762830071247}"),
  },
];

export default () => {
  const [cardData, setCardData] = useState<any[]>([]);

  const getShareRecordData = async (shareCode: string) => {
    try {
      const res = await getShareRecord({ shareCode });
      // 没有分享记录，直接返回
      if (!res) {
        return "";
      }
      // 聊天记录中第一条user消息
      const userInfo = (res as any)?.messages?.find(
        (item: any) => item.messageType === "USER"
      );

      const { query, attachments, offerInfos } = userInfo || {};

      // 创建缓存id
      const cacheId = await createChatCache({
        query,
        attachments: {
          offer: offerInfos,
          image:
            attachments?.map((item) => ({
              url: item.sourceUrl,
              width: item.width || 0,
              height: item.height || 0,
            })) || [],
        },
      });

      return cacheId;
    } catch (error) {
      console.error(`获取cacheId失败，shareCode: ${shareCode}`, error);
      return "";
    }
  };

  // 初始化静态数据
  const initStaticCardData = () => {
    const staticData = allCardData.map((data) => {
      const sceneData = sceneMap[data.oppScene];
      return {
        ...sceneData,
        ...data,
        title: sceneData?.title || sceneData?.showTitle || data.showTitle,
        description: data.caseTitle,
        image: data.imgUrl,
      };
    });
    setCardData(staticData);
  };

  const getIsDesignAgent = (data) => {
    return data?.oppScene === "DESIGN_AGENT";
  };

  // 异步获取DESIGN_AGENT类型卡片的cacheId
  const fetchCacheIds = async () => {
    const designAgentCards = allCardData.filter(getIsDesignAgent);

    // 为每个DESIGN_AGENT卡片异步获取cacheId
    for (const card of designAgentCards) {
      const cacheId = await getShareRecordData(card.shareCode);

      // 只有获取到cacheId才更新状态
      if (cacheId) {
        setCardData((prevData) =>
          prevData.map((item) => {
            if (getIsDesignAgent(item) && item.shareCode === card.shareCode) {
              return { ...item, cacheId };
            }
            return item;
          })
        );
      }
    }
  };

  useEffect(() => {
    // 先展示静态数据
    initStaticCardData();

    // 然后异步获取cacheId
    fetchCacheIds();
  }, []);

  return (
    <div className="flex justify-center overflow-x-hidden w-full">
      <div className="flex flex-col items-center justify-center w-[1200px]">
        <p className="text-[34px] text-[#1D1E29] mt-[102px] font-['FZLTHProS'] h-[38px]">{$t("global-1688-ai-app.seller-center.home.DemoList.useralzs", "用户案例展示")}</p>

        <p className="text-[#7C7F9A] text-[18px] mt-[24px] font-['FZLTHProR'] h-[26px]">{$t("global-1688-ai-app.seller-center.home.DemoList.tyfa", "探索真实应用场景，一键复刻专属方案")}</p>

        <div className="flex flex-wrap gap-4 pt-[48px] pb-[150px]">
          {cardData.map((item) => (
            <Card key={item.shareCode} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};
