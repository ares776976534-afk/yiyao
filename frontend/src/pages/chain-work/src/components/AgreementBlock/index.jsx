import React, { useEffect, useState } from 'react';
import { Button, Balloon, Icon, Field, Checkbox, Message, Dialog, Switch, Radio } from '@alifd/next';

// 协议签署
function AgreementBlock({
  checkboxChecked,
  setCheckboxChecked,
  getQueryRef,
  querySignAgreementRef,
  show,
  sellerTypeMapRef,
}) {
  // const length = Object.keys(sellerTypeMapRef.current).length;
  const [ifAlreadyChecked, setIfAlreadyChecked] = useState([false, false]); // 用于标记是否已经签署过
  // const [checkboxChecked, setCheckboxChecked] = useState([false, false]);

  const setCheckedArray = (index, value, fn = setCheckboxChecked) => {
    fn((arr) => {
      // eslint-disable-next-line no-param-reassign
      arr[index] = value;
      return Object.assign([], arr);
    });
  };

  const dealSellerTypeSubmit = () => {
    return new Promise((resolve) => {
      // 所有未签署的协议对应的tagId的数组
      // eslint-disable-next-line @iceworks/best-practices/recommend-polyfill
      const unsignedArray = ifAlreadyChecked.flatMap((value, index) => (value === false ? index : []));
      if (unsignedArray.length === 0) {
        resolve(true);
        return;
      }
      const tagIdsSignFn = [];
      unsignedArray.forEach((index) => {
        const tagIdArray = sellerTypeMapRef.current[index].tagId?.split(',');
        const signUpFn = sellerTypeMapRef.current[index].signApi;
        tagIdArray.forEach((tagId) => {
          show[index]?.current && tagIdsSignFn.push(signUpFn(tagId));
        });
      });
      // console.log('tagIdsSignFn', tagIdsSignFn, checkboxChecked);
      Promise.all(tagIdsSignFn).then((values) => {
        // eslint-disable-next-line @iceworks/best-practices/recommend-polyfill
        const res = values.flatMap((value) => value.data).indexOf(false);
        if (res === -1) {
          resolve(true);
          return;
        }
        resolve(false);
        Message.warning('协议签署失败，请稍后重试');
      });
    });
  };
  // 查询协议是否签署
  const fetchSellerType = async (index) => {
    const tagId = sellerTypeMapRef.current[index].tagId;
    const queryApi = sellerTypeMapRef.current[index].queryApi;
    const ifDefaultChecked = sellerTypeMapRef.current[index].ifDefaultChecked || false;

    try {
      const sellerTypeRes = await queryApi(tagId);

      const type = `${sellerTypeRes?.model}`;
      const ifAlreadySign = Boolean(type === 'true');
      // console.log('isSellerTypeFalse',index,ifAlreadySign, sellerTypeRes, ifDefaultChecked);
      // 若查出来没签署，但想要默认签署
      if (!ifAlreadySign && ifDefaultChecked) {
        setCheckedArray(index, true);
      } else {
        setCheckedArray(index, ifAlreadySign);
      }
      setCheckedArray(index, ifAlreadySign, setIfAlreadyChecked);
    } catch (error) {
      setCheckedArray(index, false); // 默认情况下，如果查询失败，设置为 false
      setCheckedArray(index, false, setIfAlreadyChecked);
    }
  };

  useEffect(() => {
    fetchSellerType(1);
    // fetchSellerType(0);
    getQueryRef.current = fetchSellerType;
    querySignAgreementRef.current = dealSellerTypeSubmit;
  }, []);

  return (
    <div className="w-full">
      {show[0]?.current && (
        <Checkbox
          name="baseAgreemen2"
          className="submit-offer-form-agreement"
          disabled={ifAlreadyChecked[0]}
          checked={checkboxChecked[0]}
          onChange={(checked) => setCheckedArray(0, checked)}
        >
          {sellerTypeMapRef.current[0].render()}
        </Checkbox>
      )}
      <Checkbox
        name="baseAgreement1"
        className="submit-offer-form-agreement"
        disabled={ifAlreadyChecked[1]}
        checked={checkboxChecked[1]}
        onChange={(checked) => setCheckedArray(1, checked)}
      >
        {sellerTypeMapRef.current[1].render()}
      </Checkbox>
    </div>
  );
}

export default AgreementBlock;
