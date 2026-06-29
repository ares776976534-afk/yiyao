import { createService, createEnvProtocol } from "@ali/ascp-shared-service";
import config from "./config";

// const isSupplier = window._user_ && window._user_.memberType == 3;
const newConfig = Object.assign({}, config);

// createEnvProtocol({
//   geiseller: {
//     daily: "pre-supplychain.1688.com",
//     pre: "pre-supplychain.1688.com",
//     prod: "pre-supplychain.1688.com",
//   },
// });

Object.keys(newConfig).forEach((key) => {
  newConfig[key].url = newConfig[key].url.replace("gei://", "geiseller://");
  const curHeaders = newConfig[key].headers || {};
  newConfig[key].headers = {
    ...curHeaders,
    "x-gei-session-type": "BUC",
  };
});
export default createService(newConfig);
