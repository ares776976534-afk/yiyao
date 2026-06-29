/**
 * AlphaClaw 设置命令接口
 * 统一请求 /alphaclaw/settings/command，通过 body.code 区分：restart | autoFix | open
 */
import { materiaRequest as request } from '@/services/httpRequest';

export type TypeSettingsCommandCode = 'restart' | 'autoFix' | 'open';

export interface TypeSettingsCommandRes {
  success: boolean;
  result?: any;
  retCode?: string;
  retMsg?: string | null;
}

async function settingsCommand(code: TypeSettingsCommandCode): Promise<TypeSettingsCommandRes> {
  const res = await request('/alphaclaw/settings/command', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ code }),
  });
  if (String(res?.success) === 'true') {
    return { success: true, result: res.result };
  }
  return { success: false, retCode: res.retCode, retMsg: res.retMsg };
}

/** 重启 AlphaClaw */
export async function restartClaw(): Promise<boolean> {
  try {
    const data = await settingsCommand('restart');
    return data.success === true;
  } catch (e) {
    return false;
  }
}

/** 自动修复 AlphaClaw */
export async function autoFixClaw(): Promise<boolean> {
  try {
    const data = await settingsCommand('autoFix');
    return data.success === true;
  } catch (e) {
    return false;
  }
}

/** 获取终端页面 URL，成功时返回链接，失败返回 null */
export async function getTerminalUrl(): Promise<string | null> {
  try {
    const data = await settingsCommand('open');
    return data.result?.resourceUrl as string;
  } catch (e) {
    return null;
  }
}
