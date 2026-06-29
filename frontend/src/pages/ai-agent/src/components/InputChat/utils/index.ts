import { getUrlSearchParams, replaceUrlSearchParams } from "@/utils/url";
import queryChatCache from "@/services/studio/queryChatCache";
import {
  createImageItemFromUrl,
  getImageDimensions,
  IMAGE_ACCEPT_MINI_TYPE,
} from "./fileSelector";
import { calcOfferInfoSize } from "@/components/LayerOfferElement/calcOffer";
import { type TypeOfferMaterialResult, queryOfferBy } from "@/services/studio/queryOfferBy";
import type { TypeUploadItem } from "../types";
import { OFFER } from "../types";

/**
 * 从文本中提取图片链接和商品链接
 * @param text 输入文本
 * @returns { imageUrls: string[], offerIds: string[], remainingText: string }
 */
export const extractLinksFromText = (
  text: string
): { imageUrls: string[]; offerIds: string[]; remainingText: string } => {
  if (!text || typeof text !== "string") {
    return { imageUrls: [], offerIds: [], remainingText: "" };
  }

  const imageUrlSet = new Set<string>();
  const offerIdSet = new Set<string>();
  const matchedTexts: string[] = [];

  // 图片链接正则：匹配 http(s):// 开头，以支持的图片格式结尾的 URL
  const imageExtensions = IMAGE_ACCEPT_MINI_TYPE.join("|");
  const imageRegex = new RegExp(
    `https?://[^\\s<>"{}|\\\\^\\[\\]]+\\.(${imageExtensions})(?:\\?[^\\s]*)?`,
    "gi"
  );

  // 商品链接正则：匹配 https://detail.1688.com/offer/xxxxx.html 格式
  // 支持 detail.1688.com 和 m.1688.com，以及纯数字（至少5位）
  const offerRegex =
    /(^\d{5,}$)|(?:https?:\/\/)?(?:m|detail)\.1688\.com\/offer\/(\d+?)\.html(?:\?.*)?/gi;

  // 提取图片链接
  const imageMatches = text.matchAll(imageRegex);
  for (const match of imageMatches) {
    imageUrlSet.add(match[0]);
    matchedTexts.push(match[0]);
  }

  // 提取商品ID
  const offerMatches = text.matchAll(offerRegex);
  for (const match of offerMatches) {
    const offerId = match[1] || match[2]; // match[1]是纯数字ID ，match[2] 是URL中的ID
    if (offerId) {
      offerIdSet.add(offerId);
      matchedTexts.push(match[0]);
    }
  }

  // 从文本中去除匹配到的内容
  let remainingText = text;
  matchedTexts.forEach((matchedText) => {
    remainingText = remainingText.replace(matchedText, "");
  });

  return {
    imageUrls: Array.from(imageUrlSet),
    offerIds: Array.from(offerIdSet),
    remainingText,
  };
};

/**
 * 根据图片 URL 数组并发下载并获取宽高
 * @param imageUrls 图片 URL 数组
 * @returns 返回图片信息数组 { url, width, height }
 */
export const fetchImagesWithDimensions = async (
  imageUrls: string[]
): Promise<Array<{ url: string; width: number; height: number }>> => {
  if (!imageUrls || imageUrls.length === 0) {
    return [];
  }

  const imagePromises = imageUrls.map(async (url) => {
    const trimmedUrl = url.trim();
    const dimensions = await getImageDimensions(trimmedUrl);
    return {
      url: trimmedUrl,
      width: dimensions?.width || 0,
      height: dimensions?.height || 0,
    };
  });

  const imageResults = await Promise.allSettled(imagePromises);

  // 只保留成功下载的图片
  return imageResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as PromiseFulfilledResult<any>).value);
};

/**
 * 根据 offerId 数组查询商品并计算宽高
 * @param offerIds 商品 ID 数组
 * @returns 返回带宽高信息的商品数组
 */
export const fetchOffersWithDimensions = async (
  offerIds: string[]
): Promise<TypeOfferMaterialResult[]> => {
  if (!offerIds || offerIds.length === 0) {
    return [];
  }

  const offerIdList = offerIds.filter((id) => id.trim());
  if (offerIdList.length === 0) {
    return [];
  }

  try {
    const offerResults = await queryOfferBy(offerIdList);

    // 为每个商品计算宽高信息
    return offerResults.map((_offer) => {
      try {
        const offer = _offer.productModel || {};
        const offerModuleSize = calcOfferInfoSize(offer);
        return {
          ...offer,
          width: offerModuleSize?.width || 0,
          height: offerModuleSize?.height || 0,
          _offerModuleSize: offerModuleSize,
        };
      } catch (err) {
        return {
          ...offer,
          width: 0,
          height: 0,
        };
      }
    });
  } catch (err) {
    // 静默处理商品查询失败
    console.error("查询商品信息失败:", err);
    return [];
  }
};

/**
 * 创建 offer item
 */
export const createOfferItem = (
  offer: TypeOfferMaterialResult
): TypeUploadItem => {
  return {
    id: `${OFFER}-${offer.offerId}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`,
    type: OFFER,
    offer,
  };
};

/**
 * 从 URL 参数初始化的结果类型
 */
export interface TypeInitFromUrlParamsResult {
  inputText: string;
  items: TypeUploadItem[];
  autoSend: boolean;
}

/**
 * 从 cacheId 初始化输入框数据
 */
const initFromCacheId = async (
  cacheId: string,
  autoSend?: string
): Promise<TypeInitFromUrlParamsResult | null> => {
  try {
    const res: any = await queryChatCache(cacheId);
    const { query, attachments } = res;

    // 创建 offers
    const offers = (attachments?.offer || []).map((item) =>
      createOfferItem(item)
    );

    // 创建 images
    const images = (attachments?.image || []).map(
      (item) => createImageItemFromUrl(item) as any
    );

    return {
      inputText: query || "",
      items: [...offers, ...images],
      autoSend: !!autoSend, // 如果没有 autoSend 参数，则自动发送
    };
  } catch (err) {
    // 静默处理错误
    return null;
  }
};

/**
 * 从其它 URL 参数初始化输入框数据（query、images、offerIds）
 */
const initFromOtherParams = async (
  keyword?: string,
  images?: string,
  offerIds?: string,
  autoSend?: string
): Promise<TypeInitFromUrlParamsResult | null> => {
  try {
    const items: TypeUploadItem[] = [];

    // 处理图片链接
    if (images) {
      const imageUrls = images.split(",").filter((url) => url.trim());
      const imageResults = await fetchImagesWithDimensions(imageUrls);
      const imageItems = imageResults.map(
        (img) =>
          createImageItemFromUrl({
            url: img.url,
            width: img.width,
            height: img.height,
          }) as any
      );
      items.push(...imageItems);
    }

    // 处理商品 ID
    if (offerIds) {
      const offerIdList = offerIds.split(",").filter((id) => id.trim());
      const offerResults = await fetchOffersWithDimensions(offerIdList);
      const offerItems = offerResults.map((offer) => createOfferItem(offer));
      items.push(...offerItems);
    }

    return {
      inputText: keyword || "",
      items,
      autoSend: !!autoSend, // 如果没有 autoSend 参数，则自动发送
    };
  } catch (err) {
    // 静默处理错误
    return null;
  }
};

/**
 * 从 URL search params 初始化输入框数据
 * 支持的参数：
 * - cacheId: 缓存 ID，从服务端获取数据
 * - keyword: 查询词，直接填充到输入框
 * - images: 图片链接，逗号分隔
 * - offerIds: 商品 ID，逗号分隔
 * - autoSend: 是否自动发送到对话
 *
 * 优先级：cacheId > 其它参数（当 cacheId 存在时，忽略其它参数）
 *
 * @returns 初始化结果，如果没有任何参数或初始化失败则返回 null
 */
export const initFromUrlParams =
  async (): Promise<TypeInitFromUrlParamsResult | null> => {
    const { cacheId, autoSend, keyword, images, offerIds } =
      getUrlSearchParams();

    // 优先处理 cacheId，如果有 cacheId 则忽略其它参数
    if (cacheId) {
      return initFromCacheId(cacheId, autoSend);
    }

    // 如果没有 cacheId，则处理其它参数
    if (keyword || images || offerIds) {
      return initFromOtherParams(keyword, images, offerIds, autoSend);
    }

    // 没有任何参数
    return null;
  };
