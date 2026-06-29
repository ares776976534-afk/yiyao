import React, { useEffect, useState } from 'react';
import { Checkbox } from '@alifd/next';
import { getIsSettled } from '@/pages/PWC/service';
import { queryTagId } from '@/service/common';
import { SETTLED_TAG } from '@/pages/PWC/constants';

const AgreeementLink = ({ children, link }) => {
  return (
    <a className="!text-[#0077FF]" href={link} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};

let AGREEMENT_ITEMS = 0;

export default ({ onChange = () => { } }) => {
  const [isSettledLogicDisabled, setIsSettledLogicDisabled] = useState(false);
  const [isSignDisabled, setIsSignDisabled] = useState(false);
  const [agreementCheck, setAgreementCheck] = useState([]);

  const handleChange = (values, isLogicSettled) => {
    setAgreementCheck(values);
    onChange({
      values,
      isChecked: values.length === AGREEMENT_ITEMS,
      isLogicSettled,
    });
  };

  const getLogicSettled = () => {
    return getIsSettled().then((isSettled) => {
      setIsSettledLogicDisabled(isSettled);
      return {
        name: 'logic',
        value: isSettled,
      };
    });
  };

  const getPwcSign = () => {
    return new Promise((resolve) => {
      queryTagId(SETTLED_TAG)
        .then((res) => {
          if (res && res.data) {
            const isSign = res.data.data || false;
            setIsSignDisabled(isSign);
            resolve({
              name: 'pwc',
              value: isSign,
            });
          } else {
            resolve({
              name: 'pwc',
              value: false,
            });
          }
        });
    });
  };

  const init = () => {
    Promise.all([getLogicSettled(), getPwcSign()]).then((res) => {
      const checked = [];
      res.forEach((agreement) => {
        if (agreement.value) {
          checked.push(agreement.name);
        }
      });
      AGREEMENT_ITEMS = res.length;
      handleChange(checked, res[0].value);
    });
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div>
      <Checkbox.Group style={{ display: 'flex', flexDirection: 'column' }} onChange={(val) => handleChange(val, isSettledLogicDisabled)} value={agreementCheck} >
        {(
          <Checkbox value="logic" disabled={isSettledLogicDisabled}>
            我同意使用1688官方物流服务并签署
            <AgreeementLink link="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20231228211431599/20231228211431599.html">《1688官方寄件货物运输服务协议》</AgreeementLink>
            <AgreeementLink link="https://terms.alicdn.com/legal-agreement/terms/b_platform_service_agreement/20231228192531764/20231228192531764.html">《1688官方寄件供应链管理技术服务协议》</AgreeementLink>
            <AgreeementLink link="https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000051">《付款授权服务协议》</AgreeementLink>，知晓将委托1688提供物流服务并通过支付宝账号扣除相关费用
          </Checkbox>
        )}
        {(
          <Checkbox value="pwc" disabled={isSignDisabled}>
            我同意使用1688商品认证服务并签署
            <AgreeementLink link="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240719104245591/20240719104245591.html">《1688商品件重尺官方认证服务协议》</AgreeementLink>
            ，知晓将委托1688进行商品信息的认证，包括但不限于件重尺、商品属性、商品素材等等。
          </Checkbox>
        )}
      </Checkbox.Group>
    </div >
  );
};
