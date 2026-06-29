// 图片翻译
import { materiaRequest as request } from "@/services/httpRequest";

interface TypeParams {
  imageUrl: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export default async function imageTranslateAsync(params: TypeParams): Promise<string> {
  const res = await request(
    "/canvasAITools/submitASyncTask",
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        toolName: 'translateImage',
        params: {
          ...params,
        }
      }),
    }
  );

  const { success, result, retMsg } = res || {};

  if (!success) {
    throw new Error(retMsg);
  }

  return result;
}

export async function imageTranslateSync(params: TypeParams): Promise<string> {
    const res = await request(
      "/canvasAITools/imageTranslate",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...params,
        }),
      }
    );
    
    const { success, result, retMsg } = res || {};
  
    if (!success) {
      throw new Error(retMsg);
    }
  
    return result;
}
