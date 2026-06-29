import React, { useState } from 'react';
import BasicCompanyInfor from './BasicCompanyInfor';
import CorporateInfor from './CorporateInfor';
import UBOInfor from './UBOInfor';
import EnterpriseShareholdingInfor from './EnterpriseShareholdingInfor';
import AuthorizedPersonInfo from './AuthorizedPersonInfo';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
function CddInfo({
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
  handheldIdImageUrl,
  isUboList,
  setIsUboList,
  companyRuleUrlList,
  isCompanyRuleUrl,
  setIsCompanyRuleUrl,
}) {
  const [panes, setPanes] = useState([
    { tab: 'UBO信息 1', key: '1', closeable: false, isPassport: true, visible: false, balloonVisible: false, fileLists: { faceImageUrl: [], backImageUrl: [] } },
  ]);
  const [hasAdd, setHasAdd] = useState(false);
  const [isList, setIsList] = useState(false);
  const businessLicenseChange = (list) => {
    if (list.length) {
      list?.forEach((ele, index) => {
        const keyPrefix = `${index + 1}_`;
        field.setValues({
          [`${keyPrefix}shareHoldingRatio`]: ele?.shareHoldingRatio,
          [`${keyPrefix}name`]: ele?.name,
        });
      });
      setPanes(list?.map((ele, index) => ({
        tab: `UBO信息 ${index + 1}`,
        key: `${index + 1}`,
        closeable: list.length > 1,
        visible: false,
        balloonVisible: false,
        isPassport: true,
        fileLists: { faceImageUrl: [], backImageUrl: [] },
      })));
      setIsList(registrationStatusType !== 'goSupplement');
      setHasAdd(registrationStatusType !== 'goSupplement');
    }
  };
  const companyTypeChange = async (val, v) => {
    setIsVisible(val === 'SOLE_PROPRIETORSHIP_ENTERPRISE');
    setUboVisible(val === 'SOLE_PROPRIETORSHIP_ENTERPRISE');
    setCompanyType(val);
    if (val === 'SOLE_PROPRIETORSHIP_ENTERPRISE') {
      const {
        isVisible_backImageUrl = [],
        isVisible_faceImageUrl = [],
        legalPersonInfo_backImageKey,
        legalPersonInfo_backImageUrl,
        legalPersonInfo_faceImageKey,
        legalPersonInfo_faceImageUrl,
        legalPersonInfo_name,
        legalPersonInfo_birthDate,
        legalPersonInfo_address,
        legalPersonInfo_addressDetails,
        legalPersonInfo_idNumber,
        legalPersonInfo_nationality,
        legalPersonInfo_idType,
      } = field.getValues();
      const faceImageUrl = isVisible_faceImageUrl[0]?.originFileObj ? await getBase64(isVisible_faceImageUrl[0]?.originFileObj) : '';
      const backImageUrl = isVisible_backImageUrl[0]?.originFileObj ? await getBase64(isVisible_backImageUrl[0]?.originFileObj) : '';
      setUBOPersonInfoList([
        {
          faceImageKey: isVisible_faceImageUrl[0]?.response?.result || legalPersonInfo_faceImageKey,
          backImageKey: isVisible_backImageUrl[0]?.response?.result || legalPersonInfo_backImageKey,
          faceImageUrl: faceImageUrl || legalPersonInfo_faceImageUrl,
          backImageUrl: backImageUrl || legalPersonInfo_backImageUrl,
        },
      ]);
      const keyPrefix = val === 'SOLE_PROPRIETORSHIP_ENTERPRISE' ? '1_' : '';
      field.setValues({
        [`${keyPrefix}faceImageKey`]: legalPersonInfo_faceImageKey,
        [`${keyPrefix}backImageKey`]: isPassport ? legalPersonInfo_backImageKey : '',
        [`${keyPrefix}faceImageUrl`]: legalPersonInfo_faceImageUrl,
        [`${keyPrefix}backImageUrl`]: isPassport ? legalPersonInfo_backImageUrl : '',
        [`${keyPrefix}shareHoldingRatio`]: 100,
        [`${keyPrefix}name`]: legalPersonInfo_name,
        [`${keyPrefix}birthDate`]: legalPersonInfo_birthDate,
        [`${keyPrefix}address`]: legalPersonInfo_address,
        [`${keyPrefix}addressDetail`]: legalPersonInfo_addressDetails,
        [`${keyPrefix}idNumber`]: legalPersonInfo_idNumber,
        [`${keyPrefix}nationality`]: legalPersonInfo_nationality,
        [`${keyPrefix}idType`]: legalPersonInfo_idType,
        [`${keyPrefix}englishName`]: legalPersonInfo_idType === 'PASSPORT' ? legalPersonInfo_name : undefined,
      });
      if (v) {
        field.setErrors({
          ...v === 'legalPersonInfo_faceImageUrl' ? {
            [`${keyPrefix}faceImageUrl`]: '',
          } : {},
          ...v === 'legalPersonInfo_backImageUrl' ? {
            [`${keyPrefix}backImageUrl`]: '',
          } : {},
          [`${keyPrefix}shareHoldingRatio`]: '',
          [`${keyPrefix}name`]: '',
          [`${keyPrefix}birthDate`]: '',
          [`${keyPrefix}address`]: '',
          [`${keyPrefix}addressDetail`]: '',
          [`${keyPrefix}idNumber`]: '',
          [`${keyPrefix}nationality`]: '',
          [`${keyPrefix}idType`]: '',
          [`${keyPrefix}englishName`]: '',
        });
      } else {
        field.setErrors({
          [`${keyPrefix}faceImageUrl`]: '',
          [`${keyPrefix}backImageUrl`]: '',
          [`${keyPrefix}shareHoldingRatio`]: '',
          [`${keyPrefix}name`]: '',
          [`${keyPrefix}birthDate`]: '',
          [`${keyPrefix}address`]: '',
          [`${keyPrefix}addressDetail`]: '',
          [`${keyPrefix}idNumber`]: '',
          [`${keyPrefix}nationality`]: '',
          [`${keyPrefix}idType`]: '',
          [`${keyPrefix}englishName`]: '',
        });
      }
      if (legalPersonInfo_nationality !== 'CN') {
        field.remove(`${keyPrefix}backImageUrl`);
      }
    }
  };
  const UBOPersonInfoListData = (v) => {
    setUBOPersonInfoList(v);
  };
  return (
    <div>
      <BasicCompanyInfor
        enterpriseAVCreditCode={enterpriseAVCreditCode}
        setEnterpriseAVCreditCode={setEnterpriseAVCreditCode}
        isFlattenErrors={isFlattenErrors}
        setIsFlattenErrors={setIsFlattenErrors}
        flattenErrorsMap={flattenErrorsMap}
        businessLicenseChange={businessLicenseChange}
        currentTime={currentTime}
        queryEnumsList={queryEnumsList}
        view={registrationStatusType === 'view'}
        field={field}
        basicVisible={basicVisible}
        basicInfo={basicInfo}
        businessLicenseUrl={businessLicenseUrl}
        companyTypeChange={companyTypeChange}
        companyRuleUrlLists={companyRuleUrlList}
        isCompanyRuleUrl={isCompanyRuleUrl}
        setIsCompanyRuleUrl={setIsCompanyRuleUrl}
      />
      <CorporateInfor
        queryEnumsList={queryEnumsList}
        isFlattenErrors={isFlattenUrlErrors}
        setIsFlattenErrors={setIsFlattenUrlErrors}
        flattenErrorsMap={flattenErrorsMap}
        companyType={companyType}
        companyTypeChange={companyTypeChange}
        view={registrationStatusType === 'view'}
        isVisible={isVisible}
        UBOPersonInfoListData={UBOPersonInfoListData}
        basicInfo={basicInfo}
        field={field}
        corporateVisible={corporateVisible}
        facePersonInfoBackImageUrl={facePersonInfoBackImageUrl}
        facePersonInfoFrontImageUrl={facePersonInfoFrontImageUrl}
        handheldIdImageUrl={handheldIdImageUrl}
        isPassport={isPassport}
        setIsPassport={setIsPassport}
        currentTime={currentTime}
      />
      <UBOInfor
        queryEnumsList={queryEnumsList}
        panes={panes}
        setPanes={setPanes}
        view={registrationStatusType === 'view' || uboVisible}
        field={field}
        uBOPersonInfoList={UBOPersonInfoLists}
        isPassport={isPassport}
        isUboList={isUboList}
        setIsUboList={setIsUboList}
        hasAdd={hasAdd}
        setHasAdd={setHasAdd}
        isList={isList}
      />
      <EnterpriseShareholdingInfor
        view={registrationStatusType === 'view'}
        field={field}
        hasEquityStructureDiagram={hasEquityStructureDiagram}
        companyShareHoldingList={companyShareHoldingList}
        companyShareHoldingInfoEquityStructureDiagramUrl={companyShareHoldingInfoEquityStructureDiagramUrl}
      />
      <AuthorizedPersonInfo field={field} />
    </div>
  );
}

export default CddInfo;
