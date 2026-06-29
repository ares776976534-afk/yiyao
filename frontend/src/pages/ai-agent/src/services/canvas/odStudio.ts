import mtop from "@/services/mtop";
import * as mockOfferData from "@/services/mocks/mockOdCanvas";

export const getOdCanvasInfo = async () => {
  return {
    sessionId: "test",
  };
};

export const getOdCanvasData = async (params: { sessionId: string }) => {
  return mockOfferData.canvasOfferElement;
};

export const saveOdCanvasData = async (params: {
  data: {
    sessionId: string;
    content: string;
  };
}) => {
  try {
    const res = await mtop.request({
      api: "global.1688.ai.offer.opt.save",
      type: "POST",
      data: {
        commonRequest: params,
      },
    });

    return res;
  } catch (error) {
    throw error;
  }
};

export const getOfferData = async (params) => {
  try {
    const res = await mtop.request({
      api: "global.1688.ai.offer.opt",
      timeout: 90000,
      data: params,
    });
    if (!res?.data?.result || res?.data?.retCode !== "S0000") {
      return Promise.reject(res);
    }

    return res?.data?.result || {};
  } catch (error) {
    return Promise.reject({
      success: false,
      message: error?.ret?.[0] || "服务异常",
    });
  }
};

export const getSettings = async () => {
  try {
    const res = await mtop.request({
      api: "mtop.1688.global.ai.opp.getsettings",
      data: {},
    });
    if (!res?.data?.data || res?.data?.data?.failure === "true") {
      return Promise.reject(res);
    }

    return res?.data?.data || {};
  } catch (error) {
    return Promise.reject({
      success: false,
      message: error?.ret?.[0] || "服务异常",
    });
  }
};

export const exportOfferData = async (params) => {
  try {
    const res = await mtop.request({
      api: "global.1688.ai.offer.opt.export",
      type: "POST",
      data: params,
    });

    if (!res?.data?.result || res?.data?.retCode !== "S0000") {
      return Promise.reject(res);
    }

    return res?.data?.result || "";
  } catch (error) {
    return Promise.reject({
      success: false,
      message: error?.ret?.[0] || "服务异常",
    });
  }
};
