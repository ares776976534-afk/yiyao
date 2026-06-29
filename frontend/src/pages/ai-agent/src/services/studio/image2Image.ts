// 以图生图
import { materiaRequest as request } from "@/services/httpRequest";

interface TypeParams {
  imageUrl: string;
  prompt: string;
}

export default async function image2ImageAsync(params: TypeParams): Promise<string> {
  const res = await request(
    "/canvasAITools/submitASyncTask",
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        toolName: 'image2Image',
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

export async function image2ImageSync(params: TypeParams): Promise<string> {
  const res = await request(
    "/canvasAITools/image2Image",
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
