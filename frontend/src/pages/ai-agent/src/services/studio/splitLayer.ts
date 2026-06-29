/**
 * 分离图层
 * api 格式说明
 * https://ai.meitu.com/doc/?id=366&type=api&lang=zh&domain=OUT
 */

import { materiaRequest as request } from "@/services/httpRequest";
// import * as mockData from "@/services/mocks/splitLayer";


export default async function splitLayerAsync(imageUrl: string): Promise<any> {
  const res = await request(
    "/canvasAITools/submitASyncTask",
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        toolName: 'mtSplitImageLayers',
        params: {
          imageUrl,
        }
      }),
    }
  );

  const { success, result, retMsg } = res || {};

  if (!success || !result) {
    throw {
      message: retMsg,
    };
  }

  return result;
}

export async function splitLayerSync(imageUrl: string): Promise<any> {
  // return mockData.LayerData1;

  const res = await request(
    "/canvasAITools/imageLayerSplit",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        imageUrl,
      }),
    }
  );

  return res;
}
