import { message } from "antd";

export default async function download(url: string, downloadName: string = '', type: 'image' | 'video' = 'image') {
  if (!url) {
    message.error("链接不存在，无法下载");
    return;
  }

  // 方法1: 直接使用a标签下载 (适用于同源或支持CORS)
  const downloadWithLink = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName || '';
    a.target = "_blank";
    // 设置referrer policy以避免一些跨域问题
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 方法2: 使用fetch下载 (更可靠，支持跨域)
  const downloadWithFetch = async () => {
    const response = await fetch(url, {
      method: "GET",
      // headers: {
      //   Accept: "video/*",
      // },
      // 添加跨域设置
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadName || '';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // 清理URL对象
    window.URL.revokeObjectURL(downloadUrl);
  };

  // 对于HTTP(S) URL，首先尝试fetch下载
  try {
    await downloadWithFetch();
  } catch (fetchError) {
    try {
      downloadWithLink();
      return;
    } catch (linkError) { }
    message.error("下载失败");
  }
}
