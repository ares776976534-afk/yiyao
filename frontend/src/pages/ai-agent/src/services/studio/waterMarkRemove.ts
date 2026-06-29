// 图片去水印
import { materiaRequest as request } from "@/services/httpRequest";

export default async function waterMarkRemoveAsync(imageUrl: string): Promise<string> {
  const res = await request(
    "/canvasAITools/submitASyncTask",
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        toolName: 'imageElementRemove',
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

export async function waterMarkRemoveSync(imageUrl: string): Promise<string> {
  const res = await request(
    "/canvasAITools/imageWaterMarkRemove",
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        imageUrl,
      }),
    }
  );

  const { success, result, retMsg } = res || {};

  if (!success) {
    throw new Error(retMsg);
  }

  return result;
}