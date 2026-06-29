import React from 'react';
import Block from '@/layouts/Block';
import RenderFieldExt from './RenderFieldExt';
import { SCHEMA_RADIO_GROUP } from '@/components/CommonTable/contanst';

function AuthorizedPersonInfo({ field }) {
  // 授权人信息是否与法人一致
  const IS_AUTHORIZED_PERSON_SAME_AS_LEGAL_PERSON = {
    name: '授权人信息是否与法人一致',
    fieldKey: 'AuthorizedPersonInfo_authorizedPersonEqualLegalPerson',
    type: SCHEMA_RADIO_GROUP,
    opt: {
      initValue: true,
      style: { width: 320 },
      disabled: true,
    },
    values: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  };
  return (
    <Block
      title={
        <div>
          <span className="text-[#FB3B20]">* </span>
          <span className="text-[16px]">授权人信息</span>
        </div>
        }
    >
      <div className="py-[9px] px-[12px] text-[#666] bg-[#EBF6FF] rounded-[6px] mt-[12px] text-[14px]">
        <div>授权人是指被授予权力和职责，可以代表组织、公司或个人进行签署文件、合同或其他法律文件的人员（当前支付宝国际账号注册流程中，指可以代表公司通过1688开通账号）。授权签字人通常需要经过正式的授权程序或拥有相应的职位或身份来行使签字权。他们在签署文件时必须符合相关法律法规和组织的规定，以确保签署的文件具有法律效力。在当前注册流程中，统一认定公司法人为授权人。</div>
      </div>
      {[IS_AUTHORIZED_PERSON_SAME_AS_LEGAL_PERSON].map((ele) => (
        <RenderFieldExt {...ele} field={field} />
      ))}
    </Block>
  );
}

export default AuthorizedPersonInfo;
