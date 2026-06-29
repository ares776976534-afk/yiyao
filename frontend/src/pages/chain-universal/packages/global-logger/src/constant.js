
// b: 次级业务类型
export const REPORT_SUB_BUSINESS = 'data-report-sub-business';
// c: 业务主键
export const REPORT_PRIMARY_KEY = 'data-report-primary-key';
// e: CLK
export const REPORT_ATTRIBUTE_CLK = 'data-report-attribute-clk';
// e: EXP
export const REPORT_ATTRIBUTE_EXP = 'data-report-attribute-exp';

// f: e位的结果
export const REPORT_ATTRIBUTE_RES = 'data-report-attribute-res';

// 已经进行过EXP上报
export const HAS_EXP_REPORT_TAG_NAME = 'data-report-has-exped';

export const QUERY_FIX = '_hex_globallogger';

export const QUERY_SESSIONID = `${QUERY_FIX}_sessionid`;

export const CONFIG_TYPE = {
  TIMESTAMP: 'timestamp',
  SESSIONID: 'sessionId',
}

export const QUERY_MAP = {
  [CONFIG_TYPE.SESSIONID]: QUERY_SESSIONID
};
export const LOGGER_CONFIG = 'logger_config';
