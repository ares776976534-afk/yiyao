import React, { useEffect } from 'react';
import { Checkbox, Dialog } from '@alifd/next';
import Button from '@/components/UI/Button';
import Message from '@/components/UI/Message';
import { submitSettledCDDInfo, judgeBusinessLicenseLatest } from '../services';
import EmailOtp from '@/components/EmailOtp';

const submitReport = () => {
  window.location.href = 'https://work.1688.com/?_path_=gonghuotuoguan/cross_boarder_2/choice';
};

function FooterRender({
  registrationStatu,
  loading,
  disabled,
  setDisabled,
  field,
  alipay,
  setFlattenErrorsMap,
  setIsFlattenUrlErrors,
  setIsFlattenErrors,
  setLoading,
  isHeight,
}) {
  let isDisabled = true;
  if (['UNREGISTER', 'UNREGISTER_DRAFT'].includes(registrationStatu)) {
    isDisabled = false;
  }
  function buildObjectFromArray(arr) {
    const result = {};
    arr.forEach((item) => {
      const keys = item.fieldKey.split(/[.[\]]+/).filter(Boolean);
      let currentObj = result;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!currentObj[keys[i]]) {
          currentObj[keys[i]] = {};
        }
        currentObj = currentObj[keys[i]];
      }
      currentObj[keys[keys.length - 1]] = item.msg;
    });

    return result;
  }
  const encodeToBase64 = (str) => {
    const utf8Bytes = new TextEncoder().encode(str);
    let base64String = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      base64String += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(base64String);
  };
  function transformObj(obj) {
    const result = {
      companyShareHoldingInfo: {
        hasEquityStructureDiagram: false,
        // companyShareHoldingList: [],
        equityStructureDiagramKey: null,
      },
      UBOPersonInfoList: [],
      authorizedPersonInfo: {},
      legalPersonInfo: {},
      companyInfo: {},
      eDDCompany: {},
      eDDUBOList: [],
      hasUBOInfo: true,
    };
    // for (const key in obj) {
    //   if (key.includes('CompanyShareHoldingInfo')) {
    //     const indexMatch = key.match(/^(\d+)_CompanyShareHoldingInfo/);
    //     if (indexMatch) {
    //       const index = parseInt(indexMatch[1], 10);
    //       const subKey = key.split('_')[2];
    //       if (!result.companyShareHoldingInfo.companyShareHoldingList[index]) {
    //         result.companyShareHoldingInfo.companyShareHoldingList[index] = {};
    //       }
    //       result.companyShareHoldingInfo.companyShareHoldingList[index][subKey] = obj[key];
    //     }
    //   }
    // }
    // result.companyShareHoldingInfo.companyShareHoldingList = result.companyShareHoldingInfo.companyShareHoldingList.filter(Boolean).sort((a, b) => a.shareHoldingRatio - b.shareHoldingRatio);
    result.companyShareHoldingInfo.hasEquityStructureDiagram = obj?.CompanyShareHoldingInfo_hasEquityStructureDiagram === undefined ? false : obj.CompanyShareHoldingInfo_hasEquityStructureDiagram;
    result.companyShareHoldingInfo.equityStructureDiagramKey = obj?.CompanyShareHoldingInfo_hasEquityStructureDiagram === undefined || !obj.CompanyShareHoldingInfo_equityStructureDiagramKey ? null : obj.CompanyShareHoldingInfo_equityStructureDiagramKey;
    const b = Object.entries(obj).reduce((acc, [key, value]) => {
      if (!key.includes('CompanyShareHoldingInfo')) {
        acc[key] = value;
      }
      return acc;
    }, {});
    for (const key in b) {
      const match = key.match(/^(\d+)_/);
      if (match) {
        const index = parseInt(match[1], 10);
        const subKey = key.split('_')[1];
        if (!result.UBOPersonInfoList[index]) {
          result.UBOPersonInfoList[index] = {};
        }
        if (subKey === 'address') {
          result.UBOPersonInfoList[index][subKey] = {
            province: obj[key]?.province || obj[key]?.provinceName,
            city: obj[key]?.city || obj[key]?.cityName,
            area: obj[key]?.area || obj[key]?.areaName,
            town: obj[key]?.town || obj[key]?.townName,
            address: obj[`${index}_addressDetail`],
          };
        } else {
          result.UBOPersonInfoList[index][subKey] = obj[key];
        }
      }
    }
    for (const key in obj) {
      if (key.includes('legalPersonInfo')) {
        const subKey = key.split('_')[1];
        if (subKey === 'address') {
          result.legalPersonInfo[subKey] = {
            province: obj[key]?.province || obj[key]?.provinceName,
            city: obj[key]?.city || obj[key]?.cityName,
            area: obj[key]?.area || obj[key]?.areaName,
            town: obj[key]?.town || obj[key]?.townName,
            address: obj[`legalPersonInfo_${subKey}Details`],
          };
        } else {
          result.legalPersonInfo[subKey] = obj[key];
        }
      }
    }
    for (const key in obj) {
      if (key.includes('companyInfo')) {
        const subKey = key.split('_')[1];
        if (subKey === 'address' || subKey === 'businessAddress') {
          result.companyInfo[subKey] = {
            province: obj[key]?.province || obj[key]?.provinceName,
            city: obj[key]?.city || obj[key]?.cityName,
            area: obj[key]?.area || obj[key]?.areaName,
            town: obj[key]?.town || obj[key]?.townName,
            address: obj[`companyInfo_${subKey}Details`],
          };
        } else {
          result.companyInfo[subKey] = obj[key];
        }
      }
    }
    for (const key in obj) {
      if (key.includes('eDDCompany')) {
        const subKey = key.split('_')[1];
        result.eDDCompany[subKey] = obj[key];
      }
    }
    for (const key in obj) {
      if (key.includes('eDDUBOList')) {
        const indexMatch = key.match(/^(\d+)_eDDUBOList/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1], 10);
          const subKey = key.split('_')[2];
          if (!result.eDDUBOList[index]) {
            result.eDDUBOList[index] = {};
          }
          result.eDDUBOList[index][subKey] = obj[key];
          result.eDDUBOList[index]['rejectNumber'] = index;
        }
      }
    }
    const { companyInfo, legalPersonInfo, UBOPersonInfoList, companyShareHoldingInfo, eDDCompany, eDDUBOList } = result;
    return {
      companyInfo: {
        ...companyInfo,
        registrationAddress: companyInfo?.address,
        englishRegistrationAddress: {
          address: companyInfo?.addressEnglishDetails,
        },
        validToDate: companyInfo?.validToDates ? '长期' : companyInfo?.validToDate,
        businessName: companyInfo?.businessNameEqualRegistration ? undefined : companyInfo?.businessName,
        businessAddress: companyInfo?.businessAddressEqualRegistration ? undefined : companyInfo?.businessAddress,
        stockMarket: companyInfo?.isIPO ? companyInfo?.stockMarket : undefined,
      },
      legalPersonInfo: {
        ...legalPersonInfo,
        expireDate: legalPersonInfo?.expireDates ? '长期' : legalPersonInfo?.expireDate,
      },
      authorizedPersonInfo: {
        authorizedPersonEqualLegalPerson: true,
      },
      UBOPersonInfoList: UBOPersonInfoList.filter(Boolean),
      companyShareHoldingInfo,
      eDDCompany,
      hasUBOInfo: obj?.hasUBOInfo,
      eDDUBOList: eDDUBOList.filter(Boolean).map((ele) => {
        return {
          capitalSource: ele?.capitalSource,
          OthersCapitalSource: ele?.capitalSourceOthers,
          name: ele?.name,
          rejectNumber: ele?.rejectNumber,
          OthersWealthSource: ele?.wealthSourceOthers,
          wealthSource: ele?.wealthSource,
        };
      }),
    };
  }
  const submitSettledCDD = (info, alipayNickName, saveDraft) => {
    const { UBOPersonInfoList = [], authorizedPersonInfo = {}, companyShareHoldingInfo = {}, companyInfo = {}, legalPersonInfo = {}, eDDCompany = {}, eDDUBOList = [], hasUBOInfo = true } = info;
    submitSettledCDDInfo({
      request: {
        settledCDDInfo: {
          UBOPersonInfoList: hasUBOInfo ? UBOPersonInfoList : [],
          authorizedPersonInfo,
          companyInfo,
          companyShareHoldingInfo,
          legalPersonInfo,
          alipayUserId: alipay?.alipayUserId,
          alipayNickName,
          saveDraft,
          hasUBOInfo,
        },
        settledEDDInfo: {
          eDDCompany,
          eDDUBOList,
        },
      },
    }).then((res) => {
      const { model, success, msg } = res;
      if (success && model) {
        setLoading(false);
        Message._show({ content: saveDraft ? '保存成功' : '提交成功', type: 'success' });
        submitReport();
      } else {
        setLoading(false);
        Message._show({ content: msg || '数据异常', type: 'error' });
      }
    }).catch((err) => {
      setLoading(false);
      Message._show({ content: saveDraft ? err?.errMsg || '保存失败' : err?.errMsg || '提交失败', type: 'error' });
    });
  };
  const handleScrollDown = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    setTimeout(() => {
      window.scrollBy({
        top: 270,
        behavior: 'smooth',
      });
    }, 500);
  };
  function isString(value) {
    return typeof value === 'string' || value instanceof String;
  }
  function flattenErrors(errorObject) {
    const errors = {};
    Object.keys(errorObject).forEach((key) => {
      const subFields = errorObject[key];
      Object.keys(subFields).forEach((subKey) => {
        const Key = `${key}_${subKey}`; // 构造字段名，例如 companyInfo_validToDate
        errors[Key] = subFields[subKey]; // 设置错误信息
      });
    });
    return errors;
  }
  const commonSubmit = (saveDraft, values, alipayNickName) => {
    const info = transformObj(Object.keys(values).reduce((acc, key) => {
      if (values[key] !== undefined) {
        acc[key] = values[key];
      }
      return acc;
    }, {}));
    const { companyInfo = {}, legalPersonInfo = {} } = info;
    const { creditCode = '', companyName = '', registrationDate = '', validToDate = '' } = companyInfo;
    const { name = '' } = legalPersonInfo;
    if (saveDraft) {
      submitSettledCDD(info, alipayNickName, saveDraft);
    } else if (registrationStatu === 'EDD_REJECT') {
      submitSettledCDD(info, alipayNickName, false);
    } else {
      judgeBusinessLicenseLatest({
        request: {
          creditCode, // 统一社会信用代码
          legalPersonName: name, // 法人姓名
          companyName, // 公司名称(中文)
          registrationDate: isString(registrationDate) ? registrationDate : registrationDate.format('YYYY-MM-DD'), // 注册时间
          validToDate, // 失效日期
          alipayNickName,
        },
      }).then((res) => {
        const { model, success, msg } = res;
        if (success) {
          if (model.length > 0) {
            setIsFlattenErrors(false);
            setIsFlattenUrlErrors(false);
            const infoMap = buildObjectFromArray(model);
            setFlattenErrorsMap(flattenErrors(infoMap));
            const dialog = Dialog.show({
              title: (
                <div className="flex items-center">
                  <img src="https://img.alicdn.com/imgextra/i2/O1CN01iWdkRO25KGI433Uin_!!6000000007507-2-tps-16-15.png" alt="" className="mr-[8px] w-[20px]" />
                  <span className="text-[#333] text-[16px] font-medium">请使用最新营业执照</span>
                </div>
              ),
              content: '请使用最新营业执照进行注册，否则将导致审核失败。',
              style: { width: '400px' },
              footerAlign: 'center',
              footer: (
                <div>
                  <Button
                    type="primary"
                    onClick={() => {
                      dialog.hide();
                      handleScrollDown();
                    }}
                    style={{ borderRadius: '6px', marginRight: '8px' }}
                  >
                    返回修改
                  </Button>
                  <Button
                    type="normal"
                    onClick={() => {
                      dialog.hide();
                      submitSettledCDD(info, alipayNickName, saveDraft);
                    }}
                    style={{ borderRadius: '6px' }}
                  >
                    继续提交
                  </Button>
                </div>
              ),
            });
          } else {
            submitSettledCDD(info, alipayNickName, saveDraft);
          }
        } else {
          Message._show({ content: msg || '数据异常', type: 'error' });
        }
      }).catch((err) => {
        Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
      });
    }
  };
  const submit = (saveDraft) => {
    const alipayNickName = encodeToBase64(alipay?.alipayNickName);
    if (!saveDraft) {
      const error = field.getErrors();
      if (Object.values(error).filter((e) => e !== null).length > 0) {
        Message._show({ content: '报错字段需要重新编辑后才可提交，请检查页面内容', type: 'error' });
        field.setErrors(error);
        return;
      }
      field.validate((errors, values) => {
        if (errors) {
          return;
        }
        EmailOtp.open({
          email: field.getValue('companyInfo_companyEmail'),
          sceneCode: 'ALIPAY_GLOBAL_REGISTER',
          onSuccess: () => commonSubmit(saveDraft, values, alipayNickName),
        });
      });
    } else {
      EmailOtp.open({
        email: field.getValue('companyInfo_companyEmail'),
        sceneCode: 'ALIPAY_GLOBAL_REGISTER',
        onSuccess: () => commonSubmit(saveDraft, field.getValues(), alipayNickName),
      });
    }
  };
  const buttonRender = () => {
    switch (registrationStatu) {
      case 'UNDER_REVIEW':
        return (
          <div className="fixed bottom-[16px] w-full flex flex-row justify-center gap-[16px]">
            <div className="flex flex-row justify-center gap-[16px]">
              <Button type="primary" className="w-[216px]" style={{ borderRadius: '6px' }} disabled>
                信息审核中，请等待审核结果
              </Button>
            </div>
          </div>
        );
      case 'REGISTER_REJECT':
      case 'REGISTER_SUCCESS':
        return;
      default:
        return (
          <div className="fixed bottom-[16px] w-full flex flex-row justify-center gap-[16px]">
            <Button loading={loading} type="primary" className="w-[62px]" style={{ borderRadius: '6px' }} onClick={() => submit(false)} disabled={!disabled}>
              提交
            </Button>
            {registrationStatu !== 'CDD_REJECT' && (
              <Button
                loading={loading}
                type="normal"
                className="w-[62px]"
                style={{ borderRadius: '6px' }}
                onClick={() => (registrationStatu === 'EDD_REJECT' ? submitReport() : submit(true))}
              >
                {registrationStatu === 'EDD_REJECT' ? '取消' : '保存'}
              </Button>
            )}
          </div>
        );
    }
  };
  return (
    <div className={`${isHeight ? 'h-[72px]' : 'h-[116px]'} z-20 fixed bottom-0 w-full static left-0 opacity-100 items-end p-[16px_0] self-stretch bg-[#FFFFFF] shadow-[0px_1px_6px_0px_rgba(0,0,0,0.0773)]`}>
      <div className={`px-[24px] flex text-[14px] ${isDisabled ? 'text-[#999]' : 'text-[#333]'}`}>
        <Checkbox disabled={isDisabled} style={{ marginRight: 8 }} checked={disabled} onChange={(val) => setDisabled(val)} />
        <span>
          我已阅读
          <a href="https://render.alipay.com/p/f/agreementpages/alipayserviceagreement.html" target="_blank" rel="noreferrer">《Alipay Services Agreement》</a>
          <a href="https://global.alipay.com/docs/ac/Platform/alipaymstc" target="_blank" rel="noreferrer">《Alipay MS Terms and Conditions》</a>
          <a href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20250114160831595/20250114160831595.html">《1688 Global免费会员协议》</a>，
          已充分理解各条款内容，特别是其中免除或者限制责任的以粗体标识的条款。我同意向1688. COM PTE. LTD. 、Alipay Singapore E-commerce Private Limited、Alipay Merchant Services Pte. Ltd.提供上述信息，并注册成为1688 Global平台会员，使用平台按照
          <a href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20250114160831595/20250114160831595.html">《1688 Global免费会员协议》</a>
          约定提供的服务。
        </span>
      </div>
      {buttonRender()}
    </div>
  );
}

export default FooterRender;
