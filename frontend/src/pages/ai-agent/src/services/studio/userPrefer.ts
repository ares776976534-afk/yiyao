// 设置/读取用户偏好

import { materiaRequest as request } from "@/services/httpRequest";
import type { TypePreference } from "@/components/UserPrefer/type";

export async function saveUserPrefer(preference: TypePreference): Promise<any> {
  let res = "false";

  try {
    res = await request("/preference/save", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        data: {
          preference,
        },
      }),
    });
  } catch (e) {}

  return {
    success: `${res}` === "true",
  };
}

// 获取用户偏好
export async function getUserPrefer(): Promise<any> {
  let preference;

  try {
    const res = await request("/preference/get");
    preference = JSON.parse(res);
  } catch (e) {}

  return preference;
}
