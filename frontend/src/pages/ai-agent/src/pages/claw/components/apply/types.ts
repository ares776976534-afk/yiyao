/** 申请状态枚举：0 未申请/可填表单，1 已提交审核中，2 审核通过 */
export const EnumApplyStatus = {
  None: '',
  Reviewing: 'doing',
  Passed: 'done',
} as const;

export type TypeApplyStatus = (typeof EnumApplyStatus)[keyof typeof EnumApplyStatus];

/** 申请表单字段类型 */
export interface TypeApplyFormValues {
  companyName: string;
  industry: string;
  position: string;
  mobile: string;
  email: string;
  platforms: string[];
  /** 主要经营国家（多选），值为中文国名 */
  country: string[];
  platformOther?: string;
  businessModels: string[];
  businessModelOther?: string;
  gmv: string;
  applicationScene: string[];
  referrer?: string;
}
