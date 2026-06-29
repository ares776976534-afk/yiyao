// 获取图层任务结果，如图片去水印、图片对象提取、图片分割图层等
import { materiaRequest as request } from "@/services/httpRequest";

export default async function getLayerTaskResult(taskId: string | string[]): Promise<any[]> {
  const res = await request(
    "/canvasAITools/queryASyncTaskResult",
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(Array.isArray(taskId) ? taskId : [taskId]),
    }
  );

  const { success, result, retMsg } = res || {};

  if (!success) {
    throw {
      message: retMsg,
    };
  }

  return result?.map?.((taskItem) => {
    let resultItem = taskItem.result;

    if (typeof resultItem === 'string') {
      try {
        resultItem = JSON.parse(resultItem);
      } catch (e) { }
    }

    return {
      ...taskItem,
      result: resultItem,
    };
  }) || [];
}
