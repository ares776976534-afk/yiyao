/**
 * 调试日志收集器
 *
 * 用于收集轮询数据，方便发给后端排查问题
 *
 * 使用方式：
 * 1. 自动收集：在 onMessage 中自动调用
 * 2. 导出日志：window.__downloadDebugLogs__() 导出全部，window.__downloadDebugLogs__('sessionId') 导出指定会话
 * 3. 查看日志：window.__getDebugLogs__() 查看全部，window.__getDebugLogs__('sessionId') 查看指定会话
 * 4. 清空日志：window.__clearDebugLogs__()
 */
import { cloneDeep } from "lodash";

interface TypeLogEntry {
  timestamp: number;
  time: string;
  messages: any[];
  count: number;
}

class DebugLogger {
  private sessions: Map<string, TypeLogEntry[]> = new Map();
  // private enabled: boolean = process.env.NODE_ENV === "development";
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      (window as any).__downloadDebugLogs__ = this.download;
      (window as any).__getDebugLogs__ = this.get;
      (window as any).__clearDebugLogs__ = this.clear;
    }
  }

  setEnabled = (enabled: boolean): void => {
    this.enabled = enabled;
    console.log(`[DebugLogger] ${enabled ? "已启用" : "已禁用"}`);
  };

  log = (sessionId: string, messages: any[]): void => {
    if (!this.enabled || !sessionId || messages?.length === 0) return;

    const now = Date.now();
    const time = this.formatTime(now);

    // 控制台打印
    // console.log(`${time}`, "messages------", messages);

    let sessionEntries = this.sessions.get(sessionId);
    if (!sessionEntries) {
      sessionEntries = [];
      this.sessions.set(sessionId, sessionEntries);
    }

    sessionEntries.push({
      timestamp: now,
      time,
      messages: cloneDeep(messages),
      count: messages.length,
    });
  };

  get = (
    sessionId?: string,
  ): TypeLogEntry[] | Record<string, TypeLogEntry[]> | null => {
    if (sessionId) {
      return this.sessions.get(sessionId) || null;
    }
    return Object.fromEntries(this.sessions);
  };

  download = (sessionId?: string): void => {
    let data: any;
    let filename: string;

    if (sessionId) {
      data = this.sessions.get(sessionId);
      if (!data) {
        console.warn(`[DebugLogger] 没有找到会话 ${sessionId} 的日志`);
        return;
      }
      filename = `debug-logs-${sessionId}-${Date.now()}.json`;
    } else {
      if (this.sessions.size === 0) {
        console.warn("[DebugLogger] 没有日志数据");
        return;
      }
      // 保留 sessionId 作为 key
      data = Object.fromEntries(this.sessions);
      filename = `debug-logs-all-${Date.now()}.json`;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("[DebugLogger] 日志已下载");
  };

  clear = (): void => {
    this.sessions.clear();
    console.log("[DebugLogger] 已清空日志");
  };

  formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
}

const debugLogger = new DebugLogger();

export default debugLogger;
