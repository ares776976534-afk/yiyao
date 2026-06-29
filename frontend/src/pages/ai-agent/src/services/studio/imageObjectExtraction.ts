// 图片对象提取
import { materiaRequest as request } from "@/services/httpRequest";

export default async function imageObjectExtractionAsync(imageUrl: string): Promise<string> {
  const res = await request(
    "/canvasAITools/submitASyncTask",
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        toolName: 'imageObjectExtraction',
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

export async function imageObjectExtractionSync(imageUrl: string): Promise<string> {
  const res = await request(
    "/canvasAITools/imageObjectExtraction",
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

  const { success, result, retMsg } = res || {};

  if (!success) {
    throw new Error(retMsg);
  }

  return result;
}
