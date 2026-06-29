import React, { useEffect, useState } from 'react';
import Block from '@/layouts/Block';
import RenderFieldExt from './RenderFieldExt';
import { SCHEMA_ADDRESS, SCHEMA_UPLOAD } from '../contanst';
import { SCHEMA_SELECT, SCHEMA_INPUT, SCHEMA_DATE_PICKER, SCHEMA_CHECKBOX } from '@/components/CommonTable/contanst';
import { Icon, Loading } from '@alifd/next';
import { recognizeIdCard, translateText } from '../services';
import Message from '@/components/UI/Message';
import { errorInfo } from '../enums';
import moment from 'moment';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
function CorporateInfor({ view, field, corporateVisible, facePersonInfoBackImageUrl, facePersonInfoFrontImageUrl, isVisible, UBOPersonInfoListData, basicInfo, companyTypeChange, companyType, flattenErrorsMap, isFlattenErrors, setIsFlattenErrors, queryEnumsList, isPassport, setIsPassport, handheldIdImageUrl, currentTime }) {
  const [idColorImageList, setIdColorImageList] = useState([]); // 人像页
  const [idNationalEmblemImageList, setIdNationalEmblemImageList] = useState([]); // 国徽页
  const [hasIdColorImage, setHasIdColorImage] = useState('');
  const [hasIdNationalEmblemImage, setHasIdNationalEmblemImage] = useState('');
  const [basicLoading, setBasicLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isLongTerm, setIsLongTerm] = useState(false); // 是否长期
  const [handheldIdImageUrlList, setHandheldIdImageUrlList] = useState([]);
  useEffect(() => {
    if (facePersonInfoFrontImageUrl.length > 0) {
      setIdColorImageList(facePersonInfoFrontImageUrl);
    }
  }, [facePersonInfoFrontImageUrl]);
  useEffect(() => {
    if (facePersonInfoBackImageUrl.length > 0) {
      setIdNationalEmblemImageList(facePersonInfoBackImageUrl);
    }
  }, [facePersonInfoBackImageUrl]);
  useEffect(() => {
    if (handheldIdImageUrl.length > 0) {
      setHandheldIdImageUrlList(handheldIdImageUrl);
    }
  }, [handheldIdImageUrl]);
  useEffect(() => {
    if (corporateVisible) {
      setVisible(true);
    }
  }, [corporateVisible]);
  useEffect(() => {
    if (basicInfo?.expireDate) {
      setIsLongTerm(basicInfo?.expireDate === '长期');
    }
  }, [basicInfo]);
  const commonOptions = (overrides = {}) => ({
    placeholder: '请输入',
    hasClear: true,
    style: { width: 320 },
    disabled: view,
    ...overrides,
  });
  const ID_TYPE = {
    name: '证件类型',
    fieldKey: 'legalPersonInfo_idType',
    type: SCHEMA_SELECT,
    opt: commonOptions({
      placeholder: '请选择',
      nameStyle: { alignItems: 'normal' },
      rules: [{ required: true, message: '请选择证件类型' }],
      disabled: true,
      initValue: 'ID_CARD',
      dataSource: [
        { label: '身份证', value: 'ID_CARD' },
        { label: '护照', value: 'PASSPORT' },
      ],
    }),
  };
  const common = async ({ file, model }) => {
    const faceImageUrl = await getBase64(idColorImageList[0]?.originFileObj);
    const backImageUrl = isPassport ? await getBase64(idNationalEmblemImageList[0]?.originFileObj) : '';
    if (isVisible) {
      UBOPersonInfoListData([
        {
          faceImageKey: hasIdColorImage || file.response.result,
          backImageKey: hasIdNationalEmblemImage || file.response.result,
          faceImageUrl,
          backImageUrl,
        },
      ]);
      const keyPrefix = '1_';
      const { legalPersonInfo_idType, legalPersonInfo_nationality } = field.getValues();
      field.setValues({
        [`${keyPrefix}faceImageKey`]: hasIdColorImage || file.response.result,
        [`${keyPrefix}backImageKey`]: isPassport ? hasIdNationalEmblemImage || file.response.result : undefined,
        [`${keyPrefix}faceImageUrl`]: hasIdColorImage || file.response.result,
        [`${keyPrefix}backImageUrl`]: isPassport ? hasIdNationalEmblemImage || file.response.result : undefined,
        [`${keyPrefix}shareHoldingRatio`]: 100,
        [`${keyPrefix}name`]: model?.name,
        [`${keyPrefix}birthDate`]: model?.birthDate,
        [`${keyPrefix}address`]: {
          addressCodeText: `${model?.address?.province || ''} ${model?.address?.city || ''} ${model?.address?.area || ''} ${model?.address?.town || ''}`,
          province: model?.address?.province,
          city: model?.address?.city,
          area: model?.address?.area,
          town: model?.address?.town,
        },
        [`${keyPrefix}addressDetail`]: model?.address?.address,
        [`${keyPrefix}idNumber`]: model?.idNumber,
        [`${keyPrefix}idType`]: legalPersonInfo_idType,
        [`${keyPrefix}nationality`]: legalPersonInfo_nationality,
        [`${keyPrefix}englishName`]: isVisible && legalPersonInfo_idType === 'PASSPORT' ? model?.name : undefined,
      });
    }
  };
  const onRemoveCommon = () => {
    if (isVisible) {
      UBOPersonInfoListData([
        {
          faceImageKey: '',
          backImageKey: '',
          faceImageUrl: '',
          backImageUrl: '',
        },
      ]);
      const keyPrefix = '1_';
      field.setValues({
        [`${keyPrefix}faceImageKey`]: '',
        [`${keyPrefix}backImageKey`]: '',
        [`${keyPrefix}faceImageUrl`]: '',
        [`${keyPrefix}backImageUrl`]: '',
        [`${keyPrefix}shareHoldingRatio`]: '',
        [`${keyPrefix}name`]: '',
        [`${keyPrefix}birthDate`]: '',
        [`${keyPrefix}address`]: {
          addressCodeText: '',
          province: '',
          city: '',
          area: '',
          town: '',
        },
        [`${keyPrefix}addressDetail`]: '',
        [`${keyPrefix}idNumber`]: '',
        [`${keyPrefix}idType`]: '',
        [`${keyPrefix}nationality`]: '',
        [`${keyPrefix}englishName`]: '',
      });
      field.setErrors({
        [`${keyPrefix}faceImageUrl`]: '',
        [`${keyPrefix}backImageUrl`]: '',
        [`${keyPrefix}shareHoldingRatio`]: '',
        [`${keyPrefix}name`]: '',
        [`${keyPrefix}birthDate`]: '',
        [`${keyPrefix}address`]: '',
        [`${keyPrefix}addressDetail`]: '',
        [`${keyPrefix}idNumber`]: '',
        [`${keyPrefix}idType`]: '',
        [`${keyPrefix}nationality`]: '',
        [`${keyPrefix}englishName`]: '',
      });
    }
  };
  const recognizeIdCardData = (file, fileList, idType) => {
    recognizeIdCard({
      request: {
        idType,
        faceImageKey: file.response.result,
        backImageKey: hasIdNationalEmblemImage || field?.getValue('legalPersonInfo_backImageKey'),
      },
    }).then((res) => {
      const { model, success, msg } = res;
      if (success && model) {
        setBasicLoading(false);
        setVisible(true);
        setIsLongTerm(false);
        // setIsPassport(model.nationality === 'CN');
        field.setValues({
          // legalPersonInfo_nationality: model.nationality,
          // legalPersonInfo_idType: model.nationality === 'CN' ? 'ID_CARD' : 'PASSPORT',
          legalPersonInfo_backImageKey: isPassport ? hasIdNationalEmblemImage || field?.getValue('legalPersonInfo_backImageKey') : '',
          legalPersonInfo_backImageUrl: isPassport ? hasIdNationalEmblemImage || field?.getValue('legalPersonInfo_backImageUrl') : '',
          legalPersonInfo_faceImageKey: file.response.result,
          legalPersonInfo_faceImageUrl: file.response.result,
          legalPersonInfo_name: model?.name,
          legalPersonInfo_englishName: model?.englishName,
          legalPersonInfo_birthDate: model?.birthDate,
          legalPersonInfo_address: {
            addressCodeText: `${model?.address?.province || ''} ${model?.address?.city || ''} ${model?.address?.area || ''} ${model?.address?.town || ''}`,
            province: model?.address?.province,
            city: model?.address?.city,
            area: model?.address?.area,
            town: model?.address?.town,
          },
          legalPersonInfo_addressDetails: model?.address?.address,
          legalPersonInfo_idNumber: model?.idNumber,
          legalPersonInfo_expireDate: model?.expireDate,
          isVisible_faceImageUrl: fileList,
          isVisible_backImageUrl: idNationalEmblemImageList,
        });
        common({ file, model });
        field.setErrors({
          legalPersonInfo_handheldIdImageUrl: idType === 'ID_CARD' ? null : field.getError('legalPersonInfo_backImageUrl'),
          legalPersonInfo_expireDate: moment(model.expireDate)?.valueOf() <= currentTime ? '需使用有效期内的证件进行注册' : null,
        });
        // companyTypeChange(companyType, 'legalPersonInfo_faceImageUrl');
      } else {
        setIdColorImageList(errorInfo);
        setIdNationalEmblemImageList(errorInfo);
        field.setValues({
          legalPersonInfo_faceImageUrl: '',
          legalPersonInfo_faceImageKey: '',
        });
        setVisible(false);
        setBasicLoading(false);
        Message._show({ content: msg || '数据异常', type: 'error' });
      }
    }).catch((err) => {
      setIdColorImageList(errorInfo);
      setIdNationalEmblemImageList(errorInfo);
      field.setValues({
        legalPersonInfo_faceImageUrl: '',
        legalPersonInfo_faceImageKey: '',
      });
      setVisible(false);
      setBasicLoading(false);
      Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
    });
  };
  const onRemoveClick = () => {
    setIsFlattenErrors(true);
    setVisible(false);
    setBasicLoading(false);
    onRemoveCommon();
    field.setValues({
      legalPersonInfo_address: {
        addressCodeText: '',
        province: '',
        city: '',
        area: '',
        town: '',
      },
    });
  };
  // 证件彩色影像件
  const ID_COLOR_IMAGE = {
    name: '证件彩色影像件',
    type: SCHEMA_UPLOAD,
    fieldKey: 'legalPersonInfo_faceImageUrl',
    opt: {
      listType: 'picture-card',
      action: 'https://crossborder.1688.com/choice/upload',
      accept: '.jpg,.jpeg,.png,.pdf',
      title: isPassport ? '人像页' : '',
      disabled: view,
      className: 'id-color-image-upload',
      rules: [
        {
          validator: (rule, value, callback) => {
            if (value?.length > 0 && visible) {
              callback();
            } else {
              callback(isPassport ? '请上传人像页' : '请上传护照');
            }
          },
        },
      ],
      onRemove: () => {
        setIdColorImageList([]);
        field.setValues({
          legalPersonInfo_faceImageUrl: '',
          legalPersonInfo_faceImageKey: '',
        });
        if (isPassport) {
          if (!field?.getValue('legalPersonInfo_faceImageUrl') && !field?.getValue('legalPersonInfo_backImagUrl')) {
            onRemoveClick();
          }
        } else {
          onRemoveClick();
        }
      },
      fileList: idColorImageList,
      onChange: ({ file, fileList }) => {
        setIdColorImageList(fileList);
        if (fileList.filter((item) => item.response && !item.response.success)?.length) {
          field.setErrors({
            legalPersonInfo_faceImageUrl: file?.response?.retMsg,
          });
          return false;
        } else {
          field.setErrors({
            legalPersonInfo_faceImageUrl: null,
            legalPersonInfo_address: null,
          });
        }
        const { status } = file;
        if (status === 'done') {
          setHasIdColorImage(file.response.result);
          if (isPassport) {
            if (field?.getValue('legalPersonInfo_backImageUrl')) {
              setBasicLoading(true);
              recognizeIdCardData(file, fileList, 'ID_CARD');
            }
          } else {
            setBasicLoading(true);
            recognizeIdCardData(file, fileList, 'PASSPORT');
          }
          field.setValues({
            legalPersonInfo_faceImageUrl: file.response.result,
            legalPersonInfo_faceImageKey: file.response.result,
          });
        }
      },
      children: (
        idColorImageList.length >= 1 ? null : (
          <div className="relative">
            {isPassport && (
              <img className="w-[160px] h-[100px]" src="https://img.alicdn.com/imgextra/i4/O1CN01Ejn9sD29Dd1FgRt5D_!!6000000008034-2-tps-160-100.png" alt="" />
            )}
            <div className="upload-round w-[36px] h-[36px] rounded-[30px] bg-black bg-opacity-10 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] hover:bg-[#0077FF]" />
            <Icon type="add" size="xl" className="text-[#fff] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" />
          </div>
        )
      ),
    },
  };
  const ID_NATIONAL_EMBLEM = {
    fieldKey: 'legalPersonInfo_backImageUrl',
    type: SCHEMA_UPLOAD,
    opt: {
      listType: 'picture-card',
      action: 'https://crossborder.1688.com/choice/upload',
      accept: '.jpg,.jpeg,.png,.pdf',
      title: '国徽页',
      disabled: view,
      className: 'id-color-image-upload',
      nameStyle: { alignItems: 'normal' },
      rules: [
        {
          validator: (rule, value, callback) => {
            if (value?.length > 0 && visible) {
              callback();
            } else {
              callback('请上传国徽页');
            }
          },
        },
      ],
      onRemove: () => {
        setIdNationalEmblemImageList([]);
        field.setValues({
          legalPersonInfo_backImageUrl: '',
          legalPersonInfo_backImageKey: '',
        });
        if (!field?.getValue('legalPersonInfo_backImagUrl') && !field?.getValue('legalPersonInfo_faceImageUrl')) {
          onRemoveClick();
        }
      },
      fileList: idNationalEmblemImageList,
      onChange: ({ file, fileList }) => {
        setIdNationalEmblemImageList(fileList);
        if (fileList.filter((item) => item.response && !item.response.success)?.length) {
          field.setErrors({
            legalPersonInfo_backImageUrl: file?.response?.retMsg,
          });
          return false;
        } else {
          field.setErrors({
            legalPersonInfo_backImageUrl: null,
            legalPersonInfo_address: null,
          });
        }
        const { status } = file;
        if (status === 'done') {
          setHasIdNationalEmblemImage(file.response.result);
          if (field?.getValue('legalPersonInfo_faceImageUrl')) {
            setBasicLoading(true);
            recognizeIdCard({
              request: {
                idType: 'ID_CARD',
                faceImageKey: hasIdColorImage || field?.getValue('legalPersonInfo_faceImageKey'),
                backImageKey: file.response.result,
              },
            }).then((res) => {
              const { model, success, msg } = res;
              if (success && model) {
                setBasicLoading(false);
                setVisible(true);
                setIsLongTerm(false);
                field.setValues({
                  legalPersonInfo_faceImageUrl: hasIdColorImage || field?.getValue('legalPersonInfo_faceImageUrl'),
                  legalPersonInfo_faceImageKey: hasIdColorImage || field?.getValue('legalPersonInfo_faceImageKey'),
                  legalPersonInfo_backImageUrl: file.response.result,
                  legalPersonInfo_backImageKey: file.response.result,
                  legalPersonInfo_name: model.name,
                  legalPersonInfo_englishName: model.englishName,
                  legalPersonInfo_birthDate: model.birthDate,
                  legalPersonInfo_address: {
                    addressCodeText: `${model.address.province || ''} ${model.address.city || ''} ${model.address.area || ''} ${model.address.town || ''}`,
                    province: model.address.province,
                    city: model.address.city,
                    area: model.address.area,
                    town: model.address.town,
                  },
                  legalPersonInfo_addressDetails: model.address.address,
                  legalPersonInfo_idNumber: model.idNumber,
                  legalPersonInfo_expireDate: model.expireDate,
                  isVisible_faceImageUrl: idColorImageList,
                  isVisible_backImageUrl: fileList,
                });
                field.setErrors({
                  legalPersonInfo_expireDate: moment(model.expireDate)?.valueOf() <= currentTime ? '需使用有效期内的证件进行注册' : null,
                });
                common({ file, model });
                companyTypeChange(companyType, 'legalPersonInfo_backImageUrl');
              } else {
                setIdColorImageList(errorInfo);
                setIdNationalEmblemImageList(errorInfo);
                field.setValues({
                  legalPersonInfo_backImageUrl: '',
                  legalPersonInfo_backImageKey: '',
                });
                setVisible(false);
                setBasicLoading(false);
                Message._show({ content: msg || '数据异常', type: 'error' });
              }
            }).catch((err) => {
              setIdColorImageList(errorInfo);
              setIdNationalEmblemImageList(errorInfo);
              field.setValues({
                legalPersonInfo_backImageUrl: '',
                legalPersonInfo_backImageKey: '',
              });
              setVisible(false);
              setBasicLoading(false);
              Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
            });
          }
          field.setValues({
            legalPersonInfo_backImageUrl: file.response.result,
            legalPersonInfo_backImageKey: file.response.result,
          });
        }
      },
      children: (
        idNationalEmblemImageList.length >= 1 ? null : (
          <div className="relative upload-content">
            <img className="w-[160px] h-[100px]" src="https://img.alicdn.com/imgextra/i1/O1CN01B0Z81O1ccTBHtuac9_!!6000000003621-2-tps-160-100.png" alt="" />
            <div className="upload-round w-[36px] h-[36px] rounded-[30px] bg-black bg-opacity-10 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" />
            <Icon type="add" size="xl" className="text-[#fff] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" />
          </div>
        )
      ),
    },
  };
  // 国籍
  const NATIONALITY = {
    name: '国籍',
    fieldKey: 'legalPersonInfo_nationality',
    type: SCHEMA_SELECT,
    opt: commonOptions({
      placeholder: '请选择',
      nameStyle: { alignItems: 'normal' },
      rules: [{ required: true, message: '请选择国籍' }],
      initValue: 'CN',
      showSearch: true,
      onChange: (value) => {
        setVisible(false);
        setBasicLoading(false);
        setIdColorImageList([]);
        setIdNationalEmblemImageList([]);
        setHandheldIdImageUrlList([]);
        field.setErrors({
          legalPersonInfo_faceImageUrl: null,
          legalPersonInfo_handheldIdImageUrl: null,
          legalPersonInfo_backImageUrl: null,
        });
        field.setValues({
          legalPersonInfo_nationality: value,
          legalPersonInfo_idType: value === 'CN' ? 'ID_CARD' : 'PASSPORT',
          legalPersonInfo_faceImageUrl: '',
          legalPersonInfo_faceImageKey: '',
          legalPersonInfo_backImageUrl: '',
          legalPersonInfo_backImageKey: '',
          legalPersonInfo_name: '',
          legalPersonInfo_englishName: '',
          legalPersonInfo_birthDate: '',
          legalPersonInfo_address: {
            addressCodeText: '',
            province: '',
            city: '',
            area: '',
            town: '',
          },
          legalPersonInfo_addressDetails: '',
          legalPersonInfo_idNumber: '',
          legalPersonInfo_expireDate: '',
          legalPersonInfo_handheldIdImageUrl: '',
          legalPersonInfo_handheldIdImageKey: '',
          isVisible_faceImageUrl: [],
          isVisible_backImageUrl: [],
        });
        if (value !== 'CN') {
          field.remove('legalPersonInfo_backImageUrl');
        }
        field.remove('legalPersonInfo_handheldIdImageUrl');
        setIsPassport(value === 'CN');
      },
    }),
    values: queryEnumsList['regionType'],
  };
  // 姓名（中文）
  const NAME_CHINESE = {
    name: isPassport ? '姓名（中文）' : '姓名（与护照一致）',
    fieldKey: 'legalPersonInfo_name',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: isPassport ? '请输入姓名（中文）' : '请输入姓名（与护照一致）' }],
      onChange: (value) => {
        field.setErrors({
          legalPersonInfo_name: null,
        });
        field.setValues({
          legalPersonInfo_name: value,
        });
        if (isVisible) {
          const keyPrefix = '1_';
          field.setValues({
            [`${keyPrefix}name`]: value,
            [`${keyPrefix}englishName`]: companyType === 'SOLE_PROPRIETORSHIP_ENTERPRISE' ? value : undefined,
          });
        }
        if (isPassport) {
          translateText({
            request: [
              {
                translateKey: 'legalPersonInfo_englishName',
                translateText: value,
              },
            ],
          }).then((res) => {
            const { model, success, msg } = res;
            if (success) {
              field.setValues(model);
            } else {
              Message._show({ content: msg || '数据异常', type: 'error' });
            }
          }).catch((err) => {
            Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
          });
        }
      },
      flattenErrors: isFlattenErrors ? '' : flattenErrorsMap['legalPersonInfo_name'],
    }),
  };

  // 姓名（英文）
  const NAME_ENGLISH = {
    name: '姓名（英文）',
    fieldKey: 'legalPersonInfo_englishName',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入姓名（英文）' }],
    }),
  };
  // 出生年月日
  const BIRTH_DATE = {
    name: '出生年月日',
    fieldKey: 'legalPersonInfo_birthDate',
    type: SCHEMA_DATE_PICKER,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入出生年月日' }],
      onChange: (value) => {
        field.setErrors({
          legalPersonInfo_birthDate: null,
        });
        field.setValues({
          legalPersonInfo_birthDate: value,
        });
        if (isVisible) {
          const keyPrefix = '1_';
          field.setValues({
            [`${keyPrefix}birthDate`]: value,
          });
        }
      },
    }),
  };

  // 居住地址
  const REGISTER_ADDRESS_IN_CHINESE = {
    name: '居住地址',
    fieldKey: 'legalPersonInfo_address',
    type: SCHEMA_ADDRESS,
    opt: commonOptions({
      placeholder: '选择居住地址',
      maxLevel: 4,
      rules: [{ required: true, message: '选择居住地址' }],
      value: field.getValue('legalPersonInfo_address'),
      onChange: (value) => {
        field.setErrors({
          legalPersonInfo_address: null,
        });
        field.setValues({
          legalPersonInfo_address: {
            addressCodeText: `${value.provinceName || ''} ${value.cityName || ''} ${value.areaName || ''} ${value.townName || ''}`,
            province: value.provinceName,
            city: value.cityName,
            area: value.areaName,
            town: value.townName,
            ...value,
          },
        });
        if (isVisible) {
          const keyPrefix = '1_';
          field.setValues({
            [`${keyPrefix}address`]: {
              addressCodeText: `${value.provinceName || ''} ${value.cityName || ''} ${value.areaName || ''} ${value.townName || ''}`,
              province: value.provinceName,
              city: value.cityName,
              area: value.areaName,
              town: value.townName,
            },
          });
        }
      },
    }),
  };
  const ADDRESS_DETAILS_IN_CHINESE = {
    name: isPassport ? '' : '居住地址',
    fieldKey: 'legalPersonInfo_addressDetails',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入居住地址详情' }],
      onChange: (value) => {
        field.setErrors({
          legalPersonInfo_addressDetails: null,
        });
        field.setValues({
          legalPersonInfo_addressDetails: value,
        });
        if (isVisible) {
          const keyPrefix = '1_';
          field.setValues({
            [`${keyPrefix}addressDetail`]: value,
          });
        }
      },
    }),
  };

  // 证件号
  const ID_NUMBER = {
    name: '证件号',
    fieldKey: 'legalPersonInfo_idNumber',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入证件号' }],
      onChange: (value) => {
        field.setErrors({
          legalPersonInfo_idNumber: null,
        });
        field.setValues({
          legalPersonInfo_idNumber: value,
        });
        if (isVisible) {
          const keyPrefix = '1_';
          field.setValues({
            [`${keyPrefix}idNumber`]: value,
          });
        }
      },
    }),
  };

  // 证件过期日期
  const ID_EXPIRY_DATE = {
    name: '证件过期日期',
    fieldKey: 'legalPersonInfo_expireDate',
    type: SCHEMA_DATE_PICKER,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入证件过期日期' }],
      onChange: (value) => {
        field.setErrors({
          legalPersonInfo_expireDate: value?.valueOf() <= currentTime ? '需使用有效期内的证件进行注册' : null,
        });
        field.setValues({
          legalPersonInfo_expireDate: value,
        });
      },
    }),
  };
  // 长期
  const ID_EXPIRY = {
    name: '证件过期日期',
    fieldKey: 'legalPersonInfo_expireDates',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      initValue: '/',
      value: field.getValue('legalPersonInfo_expireDates') ? '/' : '',
      disabled: true,
      rules: [],
    }),
  };
  const ID_EXPIRY_DATE_BOX = {
    name: '长期有效',
    type: SCHEMA_CHECKBOX,
    opt: commonOptions({
      style: { width: 100 },
      checked: isLongTerm,
      onChange: (value) => {
        setIsLongTerm(value);
        if (value) {
          field.setValue('legalPersonInfo_expireDates', '长期');
          field.setError('legalPersonInfo_expireDate', null);
        } else {
          field.setValue('legalPersonInfo_expireDates', '');
          field.setValue('legalPersonInfo_expireDate', '');
        }
      },
    }),
  };
  // 法人手持证件照
  const COMPANY_OFFICE_PHOTO = {
    name: '法人手持证件照',
    fieldKey: 'legalPersonInfo_handheldIdImageUrl',
    type: SCHEMA_UPLOAD,
    opt: {
      listType: 'picture-card',
      className: 'products-business-upload',
      maxCount: 1,
      disabled: view,
      action: 'https://crossborder.1688.com/choice/upload',
      accept: '.jpg,.jpeg,.png,.pdf',
      rules: [{ required: true, message: '请上传法人手持证件照' }],
      onRemove: () => {
        setHandheldIdImageUrlList([]);
        field.setValues({
          legalPersonInfo_handheldIdImageUrl: '',
          legalPersonInfo_handheldIdImageKey: '',
        });
      },
      onChange: ({ file, fileList }) => {
        setHandheldIdImageUrlList(fileList);
        if (fileList.filter((item) => item.response && !item.response.success)?.length) {
          field.setErrors({
            legalPersonInfo_handheldIdImageUrl: file?.response?.retMsg,
          });
        } else {
          field.setErrors({
            legalPersonInfo_handheldIdImageUrl: null,
          });
        }
        const { status } = file;
        if (status === 'done') {
          field.setValues({
            legalPersonInfo_handheldIdImageUrl: file?.response?.result,
            legalPersonInfo_handheldIdImageKey: file?.response?.result,
          });
          companyTypeChange(companyType, 'legalPersonInfo_faceImageUrl')
        }
      },
      fileList: handheldIdImageUrlList,
      children: (
        handheldIdImageUrlList.length >= 1 ? null : (
          <div className="products-business-upload-text">
            <Icon type="add" />
            <div>上传</div>
          </div>
        )
      ),
    },
  };
  return (
    <Block
      title={
        <div>
          <span className="text-[#FB3B20]">* </span>
          <span className="text-[16px]">法人信息</span>
          <span className="text-[12px] text-[#999] ml-[4px]">证件上传完成后可对展开的字段进行编辑</span>
        </div>
    }
    >
      <Loading tip="加载中..." visible={basicLoading} style={{ width: '100%' }}>
        <div className="flex flex-wrap alipay-international-edd-info">
          <div className="w-[48%]">
            {[NATIONALITY, ID_TYPE].map((ele) => (
              <RenderFieldExt {...ele} field={field} />
            ))}
            <div>
              <div className="flex">
                <div className="mr-[20px]">
                  <RenderFieldExt {...ID_COLOR_IMAGE} field={field} />
                </div>
                {isPassport && <div className="mr-[20px]"> <RenderFieldExt {...ID_NATIONAL_EMBLEM} field={field} /> </div>}
              </div>
              <div className="text-[12px] text-[#999] flex mt-[8px] ml-[192px]">请提供实体证件的彩色扫描件或照片（电子证件暂不接受）</div>
            </div>
            {visible && (
              <div>
                <RenderFieldExt {...NAME_CHINESE} field={field} />
                {isPassport && <RenderFieldExt {...NAME_ENGLISH} field={field} />}
              </div>
            )}
          </div>
          {visible && (
            <div className="w-[48%]">
              <RenderFieldExt {...BIRTH_DATE} field={field} />
              {isPassport && <RenderFieldExt {...REGISTER_ADDRESS_IN_CHINESE} field={field} />}
              {[ADDRESS_DETAILS_IN_CHINESE, ID_NUMBER].map((ele) => (
                <RenderFieldExt {...ele} field={field} />
              ))}
              <div>
                {isLongTerm ? <RenderFieldExt {...ID_EXPIRY} field={field} /> : <RenderFieldExt {...ID_EXPIRY_DATE} field={field} />}
                {isPassport && (
                  <div className="pl-[182px]">
                    <div className={`${field.getError('legalPersonInfo_expireDate') ? '' : 'mt-[8px]'} w-[100px] flex items-center ml-[12px] checkbox-long-term`} >
                      <RenderFieldExt {...ID_EXPIRY_DATE_BOX} field={field} content_style="1" />
                    </div>
                  </div>
                )}
                {!isPassport && <RenderFieldExt {...COMPANY_OFFICE_PHOTO} field={field} />}
              </div>
            </div>
          )}
        </div>
      </Loading>
    </Block>
  );
}

export default CorporateInfor;
