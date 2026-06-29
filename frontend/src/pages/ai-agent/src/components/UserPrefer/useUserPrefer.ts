import { toJS } from "mobx";
import { useStore } from "@/stores/context";
import type { TypePreference } from "@/components/UserPrefer/type.d";

/**
 * 获取全部偏好设置数据
 */
export function useUserPrefer(): TypePreference {
  const store = useStore();
  return toJS(store.userPrefer.preferences);
}
