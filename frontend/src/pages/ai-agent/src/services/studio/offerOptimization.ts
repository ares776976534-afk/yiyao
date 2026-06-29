// 图片翻译
import { materiaRequest as request } from "@/services/httpRequest";

type optimization =
  | "title"
  | "mainImage"
  | "productAttribute"
  | "detailImage"
  | "sku"
  | "platform";

interface TypeOptimizationContext {
  sourceLanguage?: string;
  platform: string;
  targetLanguage: string;
  optimizations: optimization[];
}

interface TypeParams {
  productModel: Record<string, any>;
  optimizationContext: TypeOptimizationContext;
}

export default async function (params: TypeParams): Promise<string> {
  try {
    const res = await request("/canvasAITools/offerCollection/optimization/v2", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...params,
      }),
    });
    const { success, result } = res || {};

    if (success) {
      return result;
    } else {
      return "";
    }
  } catch (e) {
    return "";
  }
}
