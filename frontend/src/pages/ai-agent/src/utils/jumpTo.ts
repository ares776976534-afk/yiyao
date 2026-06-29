import { appBaseUrl } from "./env";

export default (url: string) => {
  window.open(`${appBaseUrl}${url}`, '_blank');
};