
import Mtop from "@ali/lib-mtop";
import { isPre } from "@/utils/env";
import _httpRequest from "@/services/httpRequest";
import type { TypeMtopRequestOptions } from "./types";


function configMtop() {
  const REGEX_HOST = /([a-zA-Z0-9]+\.)?\.(tmall|taobao|1688)\.com/;

  if (location.host) {
    const match = location.host.match(REGEX_HOST);
    if (match) {
      Mtop.config.mainDomain = `${match[2]}.com`;
    } else {
      Mtop.config.mainDomain = "1688.com";
    }
  }

  if (isPre) {
    Mtop.config.subDomain = "wapa";
    const matchSubDomain =
      window.location.search.match(/__mtop_subdomain__=([^&]+)/)?.[1] ||
      window.location.search.match(/mtop_subdomain=([^&]+)/)?.[1];
    const matchMainDomain =
      window.location.search.match(/__mtop_maindomain__=([^&]+)/)?.[1] ||
      window.location.search.match(/mtop_maindomain=([^&]+)/)?.[1];

    if (matchSubDomain) {
      Mtop.config.subDomain = matchSubDomain;
    }

    if (matchMainDomain) {
      Mtop.config.mainDomain = matchMainDomain;
    }
  }
}

configMtop();

export default {
  async request({ data, ...config }: TypeMtopRequestOptions = {}) {
    configMtop();
    return await Mtop.request({
      v: '1.0',
      timeout: 20000,
      ecode: '0',
      data,
      ...config,
    });
  },
};

export const httpRequest = _httpRequest;
