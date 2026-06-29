// 查询商品信息
import { materiaRequest as request } from "@/services/httpRequest";

export interface TypeOfferMaterialAttribute {
  attributeName: string;
  value: string | null;
}

export interface TypeOfferMaterialSkuAttribute extends TypeOfferMaterialAttribute {
  skuImageUrl?: string | null;
}

export interface TypeOfferMaterialSkuInfo {
  skuId: number;
  skuAttributes: TypeOfferMaterialSkuAttribute[];
}

export interface TypeOfferMaterialResult {
  offerId: number;
  firstCateName?: string;
  secondCateName?: string;
  thirdCateName?: string;
  title?: string;
  images?: string[];
  productAttribute?: TypeOfferMaterialAttribute[];
  productSkuInfos?: TypeOfferMaterialSkuInfo[];
  detailImages?: string[] | null;
  width?: number; // LayerOfferElement计算出的宽度
  height?: number; // LayerOfferElement计算出的高度
}

export interface TypeOfferMaterialResponse {
  success?: boolean;
  retCode?: string;
  retMsg?: string;
  result?: TypeOfferMaterialResult | TypeOfferMaterialResult[];
}

export async function queryOfferMaterial(offerIdList: Array<string | number>): Promise<TypeOfferMaterialResult[]> {
  const endpoint = `/offer/queryMaterial`;

  try {
    const response = await request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ offerIdList }),
      credentials: 'include',
    });


    let data: TypeOfferMaterialResponse;
    data = response as TypeOfferMaterialResponse;

    if (!data || data.success !== true || !data.result) {
      throw new Error(data?.retMsg || 'queryOfferMaterial failed');
    }

    const result = data.result;
    return Array.isArray(result) ? result : [result];
  } catch (e) {
    throw new Error('queryOfferMaterial failed: invalid json response');
  }
}

