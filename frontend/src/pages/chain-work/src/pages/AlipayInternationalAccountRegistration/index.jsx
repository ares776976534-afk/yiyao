/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import { Field, Tab } from '@alifd/next';
import { Logger } from '@/utlis';
import { queryAlipayUserIdByAuthCode, querySettledInfo, queryEnums } from './services';
import Message from '@/components/UI/Message';
import Button from '@/components/UI/Button';
import './index.scss';
import aiRobot, { aiRobotSwitch } from '@/libs/alipayRobotSdk';
import { querySettledBaseInfo } from '@/pages/Select/services';
import { registrationStatusMap } from './enums';
import HeaderRender from './components/HeaderRender';
import FooterRender from './components/FooterRender';
import EddInfo from './components/EddInfo';
import CddInfo from './components/CddInfo';

Logger.init({ a: '商家进件', b: '商家进件' }, { pageKey: 'merchantEntry' });
const getUrlParam = (key) => {
  const value =
    new URLSearchParams(location.search).get(key);

  return value || '';
};
function AlipayInternationalAccountRegistration() {
  const [disabled, setDisabled] = useState(false);
  const [basicVisible, setBasicVisible] = useState(false);
  const [corporateVisible, setCorporateVisible] = useState(false);
  const [hasEquityStructureDiagram, setHasEquityStructureDiagram] = useState(false);
  const [companyShareHoldingList, setCompanyShareHoldingList] = useState([]);
  const [UBOPersonInfoLists, setUBOPersonInfoList] = useState([]);
  const [basicInfo, setBasicInfo] = useState({});
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState([]);
  const [facePersonInfoBackImageUrl, setlegalPersonInfoBackImageUrl] = useState([]);
  const [facePersonInfoFrontImageUrl, setlegalPersonInfoFrontImageUrl] = useState([]);
  const [handheldIdImageUrl, sethandheldIdImageUrlList] = useState([]);
  const [companyShareHoldingInfoEquityStructureDiagramUrl, setCompanyShareHoldingInfoEquityStructureDiagramUrl] = useState([]);
  const [alipay, setAlipay] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uboVisible, setUboVisible] = useState(false);
  const field = Field.useField({
    autoUnmount: false,
    scrollToFirstError: true,
  });
  const [registrationStatusType, setRegistrationStatusType] = useState('');
  const [registrationStatu, setRegistrationStatu] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [currentTime, setCurrentTime] = useState(''); // 当前时间
  const [flattenErrorsMap, setFlattenErrorsMap] = useState({}); // 错误信息
  const [isFlattenErrors, setIsFlattenErrors] = useState(false); // 是否更换身份证
  const [isFlattenUrlErrors, setIsFlattenUrlErrors] = useState(false); // 是否换营业执照
  const [enterpriseAVCreditCode, setEnterpriseAVCreditCode] = useState('');
  const [switchAiRobot, setSwitchAiRobot] = useState(false);
  const [activeKey, setActiveKey] = useState('EDD'); // 切换tab
  const [queryEnumsList, setQueryEnumsList] = useState([]);
  const [eDDCompany, setEDDCompany] = useState([]);
  const [eDDUBOList, setEDDUBOList] = useState([]);
  const [eddPromptMap, setEddPromptMap] = useState({}); // edd提示信息
  const [isEddTab, setIsEddTab] = useState(false); // 是否edd tab
  const [othersCompanyCapitalSource, setOthersCompanyCapitalSource] = useState(false);
  const [othersCompanyWealthSource, setOthersCompanyWealthSource] = useState(false);
  const [companyEvidenceList, setCompanyEvidenceList] = useState([]); // 公司真实性证明
  const [companyPhotoList, setCompanyPhotoList] = useState([]); // 公司办公室头照
  const [restrictedCertificateList, setRestrictedCertificateList] = useState([]); // 特殊行业资质文件
  const [rejectSummarize, setRejectSummarize] = useState(''); // 结案陈词
  const [isPassport, setIsPassport] = useState(true); // 是否展示护照
  const [isUboList, setIsUboList] = useState(true); // 是否展示UBO列表
  const [companyRuleUrlList, setCompanyRuleUrlList] = useState([]);
  const isHeight = registrationStatu === 'REGISTER_REJECT' || registrationStatu === 'REGISTER_SUCCESS';
  const [isCompanyRuleUrl, setIsCompanyRuleUrl] = useState(false);
  const buildObjectFromArray = (arr) => {
    const result = {};
    arr?.forEach((item) => {
      const keys = item?.fieldKey?.split(/[.[\]]+/)?.filter(Boolean);
      let currentObj = result;
      for (let i = 0; i < keys?.length - 1; i++) {
        if (!currentObj[keys[i]]) {
          currentObj[keys[i]] = {};
        }
        currentObj = currentObj[keys[i]];
      }
      currentObj[keys[keys?.length - 1]] = item?.msg;
    });

    return result;
  };
  const getQueryAlipayUserIdByAuthCode = () => {
    queryAlipayUserIdByAuthCode({
      request: {
        authCode: getUrlParam('auth_code'),
      },
    }).then((res) => {
      const { model, success, msg } = res;
      if (success) {
        setAlipay(model);
      } else {
        Message._show({ content: msg || '数据异常', type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
    });
  };
  const urlList = (url) => {
    return [
      {
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url,
      },
    ];
  };
  const convertEdduboList = (list) => {
    const result = {};
    for (const key in list) {
      // eslint-disable-next-line @iceworks/best-practices/recommend-polyfill, no-prototype-builtins
      if (list.hasOwnProperty(key)) {
        const item = list[key];
        const keys = Number(key) + 1;
        result[`${key}_eDDUBOList_wealthSource`] = item.wealthSource;
        result[`${key}_eDDUBOList_capitalSource`] = item.capitalSource;
        if (item?.name) {
          result[`${keys}_eDDUBOList_name`] = item?.name;
        }
      }
    }
    return result;
  };
  const convertEdduboListData = (list) => {
    const result = {};
    for (const key in list) {
      // eslint-disable-next-line @iceworks/best-practices/recommend-polyfill, no-prototype-builtins
      if (list.hasOwnProperty(key)) {
        const item = list[key];
        const keys = Number(key) + 1;
        result[`${keys}_eDDUBOList_name`] = item?.name;
      }
    }
    return result;
  };
  const transformAndMerge = (array) => {
    return array.reduce((acc, item) => {
      const { rejectNumber } = item;
      const prefix = `${rejectNumber}_eDDUBOList_`;
      const itemPrefix = `${rejectNumber}_`; // 新增的前缀处理
      const transformedItem = {
        [`${itemPrefix}rejectNumber`]: item.rejectNumber,
        [`${prefix}capitalSource`]: item.capitalSource,
        [`${prefix}capitalSourceOthers`]: item.othersCapitalSource,
        [`${prefix}wealthSource`]: item.wealthSource,
        [`${prefix}wealthSourceOthers`]: item.othersWealthSource,
      };
      return { ...acc, ...transformedItem };
    }, {});
  };
  useEffect(() => {
    queryEnums().then((res) => {
      const { model, success, msg } = res;
      if (success) {
        setQueryEnumsList(model);
      } else {
        Message._show({ content: msg || '数据异常', type: 'error' });
      }
    })
      .catch((err) => {
        Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
      });
    if (getUrlParam('auth_code')) {
      getQueryAlipayUserIdByAuthCode();
    }
    querySettledBaseInfo().then((r) => {
      if (r?.success) {
        const registration = registrationStatusMap[r?.model?.registrationStatus];
        setRegistrationStatusType(registration);
        setRegistrationStatu(r?.model?.registrationStatus);
        setDisabled(true);
        if (['UNREGISTER', 'UNREGISTER_DRAFT'].includes(r?.model?.registrationStatus)) {
          setDisabled(false);
        }
        setCurrentTime(r?.model?.currentTime);
        setEnterpriseAVCreditCode(r?.model?.enterpriseAVCreditCode);
        if (!getUrlParam('auth_code') || registration === 'UNREGISTER_DRAFT') {
          querySettledInfo().then((res) => {
            const { model, success, msg } = res;
            if (success && model) {
              setRejectSummarize(model?.rejectSummarize);
              if (registration === 'UNREGISTER_DRAFT' || !getUrlParam('auth_code')) {
                const alipayNickName = model?.settledCDDInfo?.alipayNickName ? decodeURIComponent(atob(model?.settledCDDInfo?.alipayNickName).split('').map((c) => {
                  return `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`;
                }).join('')) : '';
                setAlipay({
                  ...model?.settledCDDInfo,
                  alipayUserId: model?.settledCDDInfo?.alipayUserId,
                  alipayNickName,
                });
              }
              const { settledCDDInfo = {}, eDDRejectInfoList = [], settledEDDInfo = {} } = model;
              const { companyInfo, legalPersonInfo, authorizedPersonInfo, companyShareHoldingInfo, uBOPersonInfoList, hasUBOInfo } = settledCDDInfo;
              setIsVisible(companyInfo?.companyType === 'SOLE_PROPRIETORSHIP_ENTERPRISE');
              setUboVisible(companyInfo?.companyType === 'SOLE_PROPRIETORSHIP_ENTERPRISE');
              setCompanyType(companyInfo?.companyType);
              setBasicVisible(companyInfo?.businessLicenseKey);
              setCorporateVisible(legalPersonInfo?.faceImageKey);
              setHasEquityStructureDiagram(companyShareHoldingInfo?.hasEquityStructureDiagram);
              setCompanyShareHoldingList(companyShareHoldingInfo?.companyShareHoldingList);
              setUBOPersonInfoList(uBOPersonInfoList);
              setBasicInfo({
                businessNameEqualRegistration: companyInfo?.businessNameEqualRegistration,
                businessAddressEqualRegistration: companyInfo?.businessAddressEqualRegistration,
                isIPO: companyInfo?.isIPO,
                validToDate: companyInfo?.validToDate,
                expireDate: legalPersonInfo?.expireDate,
              });
              if (companyInfo?.businessLicenseUrl) {
                setBusinessLicenseUrl(urlList(companyInfo?.businessLicenseUrl));
              }
              if (legalPersonInfo?.backImageUrl) {
                setlegalPersonInfoBackImageUrl(urlList(legalPersonInfo?.backImageUrl));
              }
              if (legalPersonInfo?.faceImageUrl) {
                setlegalPersonInfoFrontImageUrl(urlList(legalPersonInfo?.faceImageUrl));
              }
              if (legalPersonInfo?.handheldIdImageUrl) {
                sethandheldIdImageUrlList(urlList(legalPersonInfo?.handheldIdImageUrl));
              }
              if (companyShareHoldingInfo?.hasEquityStructureDiagram) {
                setCompanyShareHoldingInfoEquityStructureDiagramUrl(urlList(companyShareHoldingInfo?.equityStructureDiagramUrl));
              }
              if (companyInfo?.companyRuleUrl) {
                setCompanyRuleUrlList([
                  {
                    uid: '-1',
                    name: companyInfo?.companyRuleFileName,
                    status: 'done',
                    url: companyInfo?.companyRuleUrl,
                  },
                ]);
              }
              if (registration === 'goSupplement') {
                const cDDRejectInfoList = buildObjectFromArray(model?.cDDRejectInfoList);
                if (model?.cDDRejectInfoList?.length > 0) {
                  if (Object.values(cDDRejectInfoList?.uBOPersonInfoList || {}).length && companyInfo?.companyType !== 'SOLE_PROPRIETORSHIP_ENTERPRISE') {
                    setUboVisible(false);
                  }
                  field.setErrors({
                    companyInfo_businessLicenseUrl: cDDRejectInfoList?.companyInfo?.businessLicenseUrl,
                    companyInfo_creditCode: cDDRejectInfoList?.companyInfo?.creditCode,
                    companyInfo_companyName: cDDRejectInfoList?.companyInfo?.companyName,
                    companyInfo_englishCompanyName: cDDRejectInfoList?.companyInfo?.englishCompanyName,
                    companyInfo_companyType: cDDRejectInfoList?.companyInfo?.companyType,
                    companyInfo_addressDetails: cDDRejectInfoList?.companyInfo?.registrationAddress?.address,
                    companyInfo_addressEnglishDetails: cDDRejectInfoList?.companyInfo?.englishRegistrationAddress?.address,
                    companyInfo_registrationDate: cDDRejectInfoList?.companyInfo?.registrationDate,
                    companyInfo_validToDate: companyInfo?.validToDate !== '长期' ? cDDRejectInfoList?.companyInfo?.validToDate : '',
                    companyInfo_validToDates: companyInfo?.validToDate === '长期' ? cDDRejectInfoList?.companyInfo?.validToDate : '',
                    companyInfo_industryType: cDDRejectInfoList?.companyInfo?.industryType,
                    companyInfo_businessNameEqualRegistration: cDDRejectInfoList?.companyInfo?.businessNameEqualRegistration,
                    companyInfo_businessName: cDDRejectInfoList?.companyInfo?.businessName,
                    companyInfo_businessAddressEqualRegistration: cDDRejectInfoList?.companyInfo?.businessAddressEqualRegistration,
                    companyInfo_businessAddressDetail: cDDRejectInfoList?.companyInfo?.businessAddress?.address,
                    companyInfo_companyEmail: cDDRejectInfoList?.companyInfo?.companyEmail,
                    companyInfo_isIPO: cDDRejectInfoList?.companyInfo?.isIPO,
                    companyInfo_stockMarket: cDDRejectInfoList?.companyInfo?.stockMarket,
                    companyInfo_companyRuleUrl: cDDRejectInfoList?.companyInfo?.companyRuleUrl,
                    companyInfo_address: cDDRejectInfoList?.companyInfo?.registrationAddress?.province || cDDRejectInfoList?.companyInfo?.registrationAddress?.city || cDDRejectInfoList?.companyInfo?.registrationAddress?.area || cDDRejectInfoList?.companyInfo?.registrationAddress?.town ? `${cDDRejectInfoList?.companyInfo?.registrationAddress?.province || ''} ${cDDRejectInfoList?.companyInfo?.registrationAddress?.city || ''} ${cDDRejectInfoList?.companyInfo?.registrationAddress?.area || ''} ${cDDRejectInfoList?.companyInfo?.registrationAddress?.town || ''}` : undefined,
                    companyInfo_businessAddress: cDDRejectInfoList?.companyInfo?.businessAddressEqualRegistration !== undefined ? `${cDDRejectInfoList?.companyInfo?.businessAddress?.province || ''} ${cDDRejectInfoList?.companyInfo?.businessAddress?.city || ''} ${cDDRejectInfoList?.companyInfo?.businessAddress?.area || ''} ${cDDRejectInfoList?.companyInfo?.businessAddress?.town || ''}` : undefined,
                    companyInfo_businessAddressDetails: cDDRejectInfoList?.companyInfo?.businessAddress?.address,
                    legalPersonInfo_faceImageUrl: cDDRejectInfoList?.legalPersonInfo?.faceImageUrl,
                    legalPersonInfo_backImageUrl: cDDRejectInfoList?.legalPersonInfo?.backImageUrl,
                    legalPersonInfo_name: cDDRejectInfoList?.legalPersonInfo?.name,
                    legalPersonInfo_englishName: cDDRejectInfoList?.legalPersonInfo?.englishName,
                    legalPersonInfo_birthDate: cDDRejectInfoList?.legalPersonInfo?.birthDate,
                    legalPersonInfo_addressDetails: cDDRejectInfoList?.legalPersonInfo?.address?.address,
                    legalPersonInfo_idNumber: cDDRejectInfoList?.legalPersonInfo?.idNumber,
                    legalPersonInfo_expireDate: legalPersonInfo?.expireDate !== '长期' ? cDDRejectInfoList?.legalPersonInfo?.expireDate : '',
                    legalPersonInfo_expireDates: legalPersonInfo?.expireDate === '长期' ? cDDRejectInfoList?.legalPersonInfo?.expireDate : '',
                    legalPersonInfo_handheldIdImageUrl: legalPersonInfo?.idType === 'ID_CARD' ? null : cDDRejectInfoList?.legalPersonInfo?.handheldIdImageUrl,
                    legalPersonInfo_address: legalPersonInfo?.idType === 'ID_CARD' ? cDDRejectInfoList?.legalPersonInfo?.address?.province || cDDRejectInfoList?.legalPersonInfo?.address?.city || cDDRejectInfoList?.legalPersonInfo?.address?.area || cDDRejectInfoList?.legalPersonInfo?.address?.town ? `${cDDRejectInfoList?.legalPersonInfo?.address?.province || ''} ${cDDRejectInfoList?.legalPersonInfo?.address?.city || ''} ${cDDRejectInfoList?.legalPersonInfo?.address?.area || ''} ${cDDRejectInfoList?.legalPersonInfo?.address?.town || ''}` : undefined : undefined,
                    hasUBOInfo: cDDRejectInfoList?.hasUBOInfo,
                    AuthorizedPersonInfo_authorizedPersonEqualLegalPerson: cDDRejectInfoList?.authorizedPersonInfo?.authorizedPersonEqualLegalPerson,
                    CompanyShareHoldingInfo_hasEquityStructureDiagram: cDDRejectInfoList?.companyShareHoldingInfo?.hasEquityStructureDiagram,
                    CompanyShareHoldingInfo_equityStructureDiagramUrl: companyShareHoldingInfo?.hasEquityStructureDiagram ? cDDRejectInfoList?.companyShareHoldingInfo?.equityStructureDiagramUrl : '',
                    ...Object.values(cDDRejectInfoList?.companyShareHoldingInfo?.companyShareHoldingList || {})?.reduce((acc, item, index) => {
                      if (!item) return acc;
                      const prefix = `${index}_CompanyShareHoldingInfo_`;
                      acc[`${prefix}companyName`] = item?.companyName;
                      acc[`${prefix}shareHoldingRatio`] = item?.shareHoldingRatio;
                      return acc;
                    }, {}),
                    ...Object.values(cDDRejectInfoList?.uBOPersonInfoList || {})?.reduce((acc, item, index) => {
                      if (!item) return acc;
                      const prefix = `${index + 1}_`;
                      acc[`${prefix}name`] = item?.name;
                      acc[`${prefix}shareHoldingRatio`] = item?.shareHoldingRatio;
                      acc[`${prefix}faceImageUrl`] = item?.faceImageUrl;
                      acc[`${prefix}backImageUrl`] = item?.backImageUrl;
                      acc[`${prefix}name`] = item?.name;
                      acc[`${prefix}birthDate`] = item?.birthDate;
                      acc[`${prefix}address`] = item?.address?.province || item?.address?.city || item?.address?.area || item?.address?.town ? `${item?.address?.province || ''} ${item?.address?.city || ''} ${item?.address?.area || ''} ${item?.address?.town || ''}` : null;
                      acc[`${prefix}addressDetail`] = item?.address?.address;
                      acc[`${prefix}idNumber`] = item?.idNumber;
                      return acc;
                    }, {}),
                  });
                }
              }
              setIsEddTab(eDDRejectInfoList?.length);
              if (eDDRejectInfoList?.length > 0) {
                const newEDDRejectInfoList = buildObjectFromArray(eDDRejectInfoList.filter((item) => 'fieldKey' in item));
                setRegistrationStatusType('view');
                setEddPromptMap({
                  eDDCompany_companyEvidenceList: newEDDRejectInfoList?.eDDCompany?.companyEvidenceList,
                  eDDCompany_companyPhotoList: newEDDRejectInfoList?.eDDCompany?.companyPhotoList,
                  eDDCompany_restrictedCertificateList: newEDDRejectInfoList?.eDDCompany?.restrictedCertificateList,
                  eDDCompany_companyCapitalSource: newEDDRejectInfoList?.eDDCompany?.companyCapitalSource,
                  eDDCompany_companyWealthSource: newEDDRejectInfoList?.eDDCompany?.companyWealthSource,
                  eDDCompany_estimatedMonthlyCollectionTimes: newEDDRejectInfoList?.eDDCompany?.estimatedMonthlyCollectionTimes,
                  eDDCompany_estimatedMonthlyCollectionAmount: newEDDRejectInfoList?.eDDCompany?.estimatedMonthlyCollectionAmount,
                  eDDCompany_estimatedMonthlyPaymentTimes: newEDDRejectInfoList?.eDDCompany?.estimatedMonthlyPaymentTimes,
                  eDDCompany_estimatedMonthlyPaymentAmount: newEDDRejectInfoList?.eDDCompany?.estimatedMonthlyPaymentAmount,
                  eDDCompany_corporateIncomeOfPriorYear: newEDDRejectInfoList?.eDDCompany?.corporateIncomeOfPriorYear,
                  ...convertEdduboList(newEDDRejectInfoList?.eDDUBOList),
                });
                const list = Object.entries(newEDDRejectInfoList?.eDDUBOList || {}).map(([key]) => ({
                  key: Number(key),
                }));
                setEDDUBOList(list);
                setEDDCompany(Object.keys(newEDDRejectInfoList?.eDDCompany));
                if (r?.model?.registrationStatus === 'EDD_REJECT') {
                  field.setValues({
                    ...convertEdduboList(uBOPersonInfoList),
                  });
                } else {
                  setOthersCompanyCapitalSource(settledEDDInfo?.eDDCompany?.companyCapitalSource === 'OTHERS');
                  setOthersCompanyWealthSource(settledEDDInfo?.eDDCompany?.companyWealthSource === 'OTHERS');
                  setCompanyEvidenceList(settledEDDInfo?.eDDCompany?.companyEvidenceList?.map((ele) => ({
                    uid: '-1',
                    name: ele?.uploadFileName,
                    status: 'done',
                    url: ele?.uploadFileUrl,
                  })));
                  setCompanyPhotoList(settledEDDInfo?.eDDCompany?.companyPhotoList?.map((ele) => ({
                    uid: '-1',
                    name: ele?.uploadFileName,
                    status: 'done',
                    url: ele?.uploadFileUrl,
                  })));
                  setRestrictedCertificateList(settledEDDInfo?.eDDCompany?.restrictedCertificateList?.map((ele) => ({
                    uid: '-1',
                    name: ele?.uploadFileName,
                    status: 'done',
                    url: ele?.uploadFileUrl,
                  })));
                  field.setValues({
                    eDDCompany_companyCapitalSource: settledEDDInfo?.eDDCompany?.companyCapitalSource,
                    eDDCompany_othersCompanyCapitalSource: settledEDDInfo?.eDDCompany?.othersCompanyCapitalSource,
                    eDDCompany_companyWealthSource: settledEDDInfo?.eDDCompany?.companyWealthSource,
                    eDDCompany_othersCompanyWealthSource: settledEDDInfo?.eDDCompany?.othersCompanyWealthSource,
                    eDDCompany_estimatedMonthlyCollectionTimes: settledEDDInfo?.eDDCompany?.estimatedMonthlyCollectionTimes,
                    eDDCompany_estimatedMonthlyCollectionAmount: settledEDDInfo?.eDDCompany?.estimatedMonthlyCollectionAmount,
                    eDDCompany_estimatedMonthlyPaymentTimes: settledEDDInfo?.eDDCompany?.estimatedMonthlyPaymentTimes,
                    eDDCompany_estimatedMonthlyPaymentAmount: settledEDDInfo?.eDDCompany?.estimatedMonthlyPaymentAmount,
                    eDDCompany_corporateIncomeOfPriorYear: settledEDDInfo?.eDDCompany?.corporateIncomeOfPriorYear,
                    ...transformAndMerge(settledEDDInfo?.eDDUBOList),
                    ...convertEdduboListData(uBOPersonInfoList),
                  });
                }
              }
              setIsPassport(legalPersonInfo?.nationality === 'CN');
              if (legalPersonInfo?.nationality !== 'CN') {
                field.remove('legalPersonInfo_backImageUrl');
              }
              if (!companyShareHoldingInfo?.hasEquityStructureDiagram) {
                field.remove('CompanyShareHoldingInfo_equityStructureDiagramUrl');
              }
              setIsUboList(hasUBOInfo);
              setIsCompanyRuleUrl(companyInfo?.companyType === 'STOCK_COOPERATION_SYSTEM' || companyInfo?.companyType === 'RURAL_COOPERATIVES')
              field.setValues({
                companyInfo_address: {
                  addressCodeText: companyInfo?.registrationAddress?.province ? `${companyInfo?.registrationAddress?.province || ''} ${companyInfo?.registrationAddress?.city || ''} ${companyInfo?.registrationAddress?.area || ''} ${companyInfo?.registrationAddress?.town || ''}` : undefined,
                  province: companyInfo?.registrationAddress?.province,
                  city: companyInfo?.registrationAddress?.city,
                  area: companyInfo?.registrationAddress?.area,
                  town: companyInfo?.registrationAddress?.town,
                },
                companyInfo_addressDetails: companyInfo?.registrationAddress?.address,
                companyInfo_addressEnglish: `${companyInfo?.englishRegistrationAddress?.province || ''} ${companyInfo?.englishRegistrationAddress?.city || ''} ${companyInfo?.englishRegistrationAddress?.area || ''} ${companyInfo?.englishRegistrationAddress?.town || ''}`,
                companyInfo_addressEnglishDetails: companyInfo?.englishRegistrationAddress.address,
                companyInfo_businessLicenseKey: companyInfo?.businessLicenseKey,
                companyInfo_businessLicenseUrl: companyInfo?.businessLicenseUrl,
                companyInfo_companyEmail: companyInfo?.companyEmail,
                companyInfo_companyName: companyInfo?.companyName,
                companyInfo_companyType: companyInfo?.companyType,
                companyInfo_creditCode: companyInfo?.creditCode,
                companyInfo_englishCompanyName: companyInfo?.englishCompanyName,
                companyInfo_industryType: companyInfo?.industryType,
                companyInfo_registrationDate: companyInfo?.registrationDate,
                companyInfo_validToDate: companyInfo?.validToDate,
                companyInfo_businessNameEqualRegistration: companyInfo?.businessNameEqualRegistration,
                companyInfo_businessName: companyInfo?.businessName,
                companyInfo_companyRuleUrl: companyInfo?.companyRuleUrl,
                companyInfo_businessAddress: {
                  addressCodeText: companyInfo?.businessAddress?.province ? `${companyInfo?.businessAddress?.province || ''} ${companyInfo?.businessAddress?.city || ''} ${companyInfo?.businessAddress?.area || ''} ${companyInfo?.businessAddress?.town || ''}` : undefined,
                  province: companyInfo?.businessAddress?.province,
                  city: companyInfo?.businessAddress?.city,
                  area: companyInfo?.businessAddress?.area,
                  town: companyInfo?.businessAddress?.town,
                },
                companyInfo_businessAddressDetails: companyInfo?.businessAddress?.address,
                companyInfo_businessAddressEqualRegistration: companyInfo?.businessAddressEqualRegistration,
                companyInfo_isIPO: companyInfo?.isIPO,
                companyInfo_stockMarket: companyInfo?.stockMarket,
                legalPersonInfo_address: {
                  addressCodeText: legalPersonInfo?.address?.province ? `${legalPersonInfo?.address?.province || ''} ${legalPersonInfo?.address?.city || ''} ${legalPersonInfo?.address?.area || ''} ${legalPersonInfo?.address?.town || ''}` : undefined,
                  province: legalPersonInfo?.address?.province,
                  city: legalPersonInfo?.address?.city,
                  area: legalPersonInfo?.address?.area,
                  town: legalPersonInfo?.address?.town,
                },
                legalPersonInfo_addressDetails: legalPersonInfo?.address?.address,
                legalPersonInfo_backImageKey: legalPersonInfo?.backImageKey,
                legalPersonInfo_backImageUrl: legalPersonInfo?.backImageUrl,
                legalPersonInfo_birthDate: legalPersonInfo?.birthDate,
                legalPersonInfo_englishName: legalPersonInfo?.englishName,
                legalPersonInfo_expireDate: legalPersonInfo?.expireDate,
                legalPersonInfo_faceImageKey: legalPersonInfo?.faceImageKey,
                legalPersonInfo_faceImageUrl: legalPersonInfo?.faceImageUrl,
                legalPersonInfo_faceImageKeys: legalPersonInfo?.faceImageKey,
                legalPersonInfo_idNumber: legalPersonInfo?.idNumber,
                legalPersonInfo_name: legalPersonInfo?.name,
                legalPersonInfo_nationality: legalPersonInfo?.nationality,
                legalPersonInfo_idType: legalPersonInfo?.idType,
                legalPersonInfo_handheldIdImageUrl: legalPersonInfo?.handheldIdImageUrl,
                legalPersonInfo_handheldIdImageKey: legalPersonInfo?.handheldIdImageKey,
                hasUBOInfo,
                AuthorizedPersonInfo_authorizedPersonEqualLegalPerson: authorizedPersonInfo?.authorizedPersonEqualLegalPerson,
                CompanyShareHoldingInfo_hasEquityStructureDiagram: companyShareHoldingInfo?.hasEquityStructureDiagram,
                CompanyShareHoldingInfo_equityStructureDiagramKey: companyShareHoldingInfo?.equityStructureDiagramKey,
                CompanyShareHoldingInfo_equityStructureDiagramUrl: companyShareHoldingInfo?.equityStructureDiagramUrl,
                // ...companyShareHoldingInfo?.companyShareHoldingList?.reduce((acc, item, index) => {
                //   if (!item) return acc;
                //   const prefix = `${index}_CompanyShareHoldingInfo_`;
                //   acc[`${prefix}companyName`] = item?.companyName;
                //   acc[`${prefix}shareHoldingRatio`] = item?.shareHoldingRatio;
                //   return acc;
                // }, {}),
                ...uBOPersonInfoList?.reduce((acc, item, index) => {
                  if (!item) return acc;
                  const prefix = `${index + 1}_`;
                  acc[`${prefix}name`] = item?.name;
                  acc[`${prefix}shareHoldingRatio`] = item?.shareHoldingRatio;
                  acc[`${prefix}englishName`] = item?.englishName;
                  acc[`${prefix}faceImageKey`] = item?.faceImageKey;
                  acc[`${prefix}backImageKey`] = item?.backImageKey;
                  acc[`${prefix}faceImageUrl`] = item?.faceImageUrl;
                  acc[`${prefix}backImageUrl`] = item?.backImageUrl;
                  acc[`${prefix}name`] = item?.name;
                  acc[`${prefix}birthDate`] = item?.birthDate;
                  acc[`${prefix}nationality`] = item?.nationality;
                  acc[`${prefix}idType`] = item?.idType;
                  acc[`${prefix}address`] = {
                    addressCodeText: item?.address?.province ? `${item?.address?.province || ''} ${item?.address?.city || ''} ${item?.address?.area || ''} ${item?.address?.town || ''}` : undefined,
                    province: item?.address?.province,
                    city: item?.address?.city,
                    area: item?.address?.area,
                    town: item?.address?.town,
                  };
                  acc[`${prefix}addressDetail`] = item?.address?.address;
                  acc[`${prefix}idNumber`] = item?.idNumber;
                  return acc;
                }, {}),
              });
              if (!hasUBOInfo) {
                field.remove('1_backImageUrl');
                field.remove('1_faceImageUrl');
              }
            } else {
              Message._show({ content: msg || '数据异常', type: 'error' });
            }
          }).catch((err) => {
            Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
          });
        }
      } else {
        Message._show({ content: r?.msg || '数据异常', type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.message || err?.errorMessage || '数据异常', type: 'error' });
    });
  }, []);
  useEffect(() => {
    aiRobotSwitch()
      .then((res) => {
        setSwitchAiRobot(res);
      });
  }, []);
  const handleOpenAlipayRobot = async () => {
    aiRobot().madaOpen();
  };
  const propsData = {
    field,
    enterpriseAVCreditCode,
    setEnterpriseAVCreditCode,
    isFlattenErrors,
    setIsFlattenErrors,
    flattenErrorsMap,
    currentTime,
    registrationStatusType,
    basicVisible,
    basicInfo,
    businessLicenseUrl,
    isFlattenUrlErrors,
    setIsFlattenUrlErrors,
    companyType,
    isVisible,
    corporateVisible,
    facePersonInfoBackImageUrl,
    facePersonInfoFrontImageUrl,
    handheldIdImageUrl,
    uboVisible,
    UBOPersonInfoLists,
    hasEquityStructureDiagram,
    companyShareHoldingList,
    companyShareHoldingInfoEquityStructureDiagramUrl,
    setUBOPersonInfoList,
    setIsVisible,
    setUboVisible,
    setCompanyType,
    queryEnumsList,
    isPassport,
    setIsPassport,
    isUboList,
    setIsUboList,
    companyRuleUrlList,
    isCompanyRuleUrl,
    setIsCompanyRuleUrl,
  }
  return (
    <div>
      <NewWorkLayout
        title="支付宝国际账号注册"
        // eslint-disable-next-line no-nested-ternary
        style={{ backgroundImage: 'linear-gradient(0deg, #F9F9F9 0%, #F9F9F9 24%, #F9F9F9 100%)', marginBottom: isHeight ? '67px' : '120px' }}
        subTitle={
          switchAiRobot && <Button type="primary" text onClick={handleOpenAlipayRobot}>咨询支付宝客服</Button>
        }
      >
        <HeaderRender alipay={alipay} registrationStatusType={registrationStatusType} rejectSummarize={rejectSummarize} />
        {isEddTab ? (
          <Tab activeKey={activeKey} onChange={(key) => { setActiveKey(key); }} shape="wrapped" >
            <Tab.Item title="补充信息" key="EDD">
              <EddInfo
                field={field}
                queryEnumsList={queryEnumsList}
                eDDCompany={eDDCompany}
                eDDUBOList={eDDUBOList}
                eddPromptMap={eddPromptMap}
                registrationStatu={registrationStatu}
                othersCompanyCapitalSource={othersCompanyCapitalSource}
                setOthersCompanyCapitalSource={setOthersCompanyCapitalSource}
                othersCompanyWealthSource={othersCompanyWealthSource}
                setOthersCompanyWealthSource={setOthersCompanyWealthSource}
                companyEvidenceList={companyEvidenceList}
                setCompanyEvidenceList={setCompanyEvidenceList}
                companyPhotoList={companyPhotoList}
                setCompanyPhotoList={setCompanyPhotoList}
                restrictedCertificateList={restrictedCertificateList}
                setRestrictedCertificateList={setRestrictedCertificateList}
              />
            </Tab.Item>
            <Tab.Item title="基本信息" key="CEDD">
              <CddInfo {...propsData} />
            </Tab.Item>
          </Tab>
        ) : (
          <CddInfo {...propsData} />
        ) }
      </NewWorkLayout>
      <FooterRender
        registrationStatu={registrationStatu}
        loading={loading}
        field={field}
        alipay={alipay}
        disabled={disabled}
        setDisabled={setDisabled}
        setFlattenErrorsMap={setFlattenErrorsMap}
        setIsFlattenUrlErrors={setIsFlattenUrlErrors}
        setIsFlattenErrors={setIsFlattenErrors}
        setLoading={setLoading}
        isHeight={isHeight}
      />
    </div>
  );
}

export default AlipayInternationalAccountRegistration;
