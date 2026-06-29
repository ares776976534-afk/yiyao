// 批量下载
import { materiaRequest as request } from "@/services/httpRequest";

export default async function (params): Promise<boolean> {
  try {
    const res = await request("/offerCollection/product-model/export", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    });

    // 如果返回的是 Blob 对象，直接触发下载
    if (res instanceof Blob) {
      // 创建下载链接
      const url = window.URL.createObjectURL(res);
      const link = document.createElement("a");
      link.href = url;

      // 检查是否有 fileName 属性
      const fileName = (res as any).fileName || `export_${Date.now()}.zip`;
      link.download = fileName;

      // 触发下载
      link.click();

      // 清理
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}
