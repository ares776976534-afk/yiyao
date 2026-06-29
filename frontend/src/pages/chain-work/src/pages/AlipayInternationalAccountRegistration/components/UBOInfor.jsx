import React, { useEffect, useState } from 'react';
import Block from '@/layouts/Block';
import RenderFieldExt from './RenderFieldExt';
import { Tab, Icon, Balloon, Button, Loading } from '@alifd/next';
import { SCHEMA_UPLOAD, SCHEMA_ADDRESS, SCHEMA_NUMBER_PICKER } from '../contanst';
import UploadField from './UploadField';
import { SCHEMA_INPUT, SCHEMA_SELECT, SCHEMA_DATE_PICKER, SCHEMA_RADIO_GROUP } from '@/components/CommonTable/contanst';
import { recognizeIdCard } from '../services';
import { errorInfo } from '../enums';
import Message from '@/components/UI/Message';
import { Image } from 'antd';

function UboInfor({ view, field, uBOPersonInfoList, panes, setPanes, queryEnumsList, isPassport, isUboList, setIsUboList, hasAdd, setHasAdd, isList }) {
  const [activeKey, setActiveKey] = useState('1');
  const [basicLoading, setBasicLoading] = useState(false);
  const [removeIdColorImage, setRemoveIdColorImage] = useState(false);
  const [removeIdNationalEmblemImage, setRemoveIdNationalEmblemImage] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (uBOPersonInfoList?.length > 0) {
      setPanes(uBOPersonInfoList?.map((ele, index) => ({
        tab: `UBO信息 ${index + 1}`,
        key: `${index + 1}`,
        closeable: index > 0 && uBOPersonInfoList.length > 1,
        visible: !!ele.faceImageKey,
        balloonVisible: false,
        isPassport: ele?.nationality ? ele?.nationality === 'CN' : isPassport,
        fileLists: {
          faceImageUrl: ele?.faceImageUrl ? [
            {
              uid: '-1',
              name: 'image.png',
              status: 'done',
              url: ele?.faceImageUrl,
            },
          ] : [],
          backImageUrl: ele?.backImageUrl ? [
            {
              uid: '-1',
              name: 'image.png',
              status: 'done',
              url: ele?.backImageUrl,
            },
          ] : [],
        },
      })));
    }
  }, [uBOPersonInfoList]);
  const commonOptions = (overrides = {}) => ({
    placeholder: '请输入',
    hasClear: true,
    style: { width: 320 },
    disabled: view,
    ...overrides,
  });
  const UBO_NAME = {
    // name: '姓名',
    fieldKey: 'name',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      disabled: isList || view,
    }),
  };
  // 姓名（英文）
  const NAME_ENGLISH = {
    name: '姓名（英文）',
    fieldKey: 'englishName',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      disabled: view,
      rules: [{ required: true, message: '请输入姓名（英文）' }],
    }),
  };
  const UBO_SHAREHOLDING_RATIO = {
    name: '持股比例',
    fieldKey: 'shareHoldingRatio',
    type: SCHEMA_NUMBER_PICKER,
    opt: commonOptions({
      hasTrigger: false,
      disabled: isList || view,
      rules: [
        { required: true, message: '请输入持股比例' },
        {
          validator: (rule, value, callback) => {
            if (value > 100) {
              callback('持股比例不能大于100');
            } else if (value < 25) {
              callback('持股比例不能小于25');
            } else {
              callback();
            }
          },
        },
      ],
      onChange: (value) => {
        const keyPrefix = `${panes[activeKey - 1].key}_`;
        field.setErrors({
          [`${keyPrefix}shareHoldingRatio`]: null,
        });
        field.setValues({
          [`${keyPrefix}shareHoldingRatio`]: value,
        });
        if (value < 25) {
          field.setErrors({
            [`${keyPrefix}shareHoldingRatio`]: '持股比例不能小于25',
          });
        }
        const regex = /^(\d+)_shareHoldingRatio/;
        let sum = 0;

        for (const key in field.getValues()) {
          if (regex.test(key)) {
            sum += field.getValues()[key];
          }
        }
        if (sum > 100) {
          field.setErrors({
            [`${keyPrefix}shareHoldingRatio`]: '持股比例总和不能大于100',
          });
        }
        setHasAdd(sum >= 100);
      },
      innerAfter: <span style={{ color: '#999', margin: '0 12px 0 8px' }}>%</span>,
    }),
  };

  const ID_TYPE = {
    name: '证件类型',
    fieldKey: 'idType',
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

  function generateUBOPersonInfo(key, file, model) {
    const keyPrefix = `${key}_`;
    return {
      [`${keyPrefix}faceImageKey`]: field.getValue(`${panes[activeKey - 1].key}_faceImageKey`) || file?.response?.result,
      [`${keyPrefix}backImageKey`]: field.getValue(`${panes[activeKey - 1].key}_backmageKey`) || file?.response?.result,
      [`${keyPrefix}faceImageUrl`]: field.getValue(`${panes[activeKey - 1].key}_faceImageUrl`) || file?.response?.result,
      [`${keyPrefix}backImageUrl`]: field.getValue(`${panes[activeKey - 1].key}_backImageUrl`) || file?.response?.result,
      [`${keyPrefix}birthDate`]: model?.birthDate,
      [`${keyPrefix}address`]: {
        addressCodeText: model ? `${model?.address?.province || ''} ${model?.address?.city || ''} ${model?.address?.area || ''} ${model?.address?.town || ''}` : '',
        province: model?.address?.province,
        city: model?.address?.city,
        area: model?.address?.area,
        town: model?.address?.town,
      },
      [`${keyPrefix}addressDetail`]: model?.address?.address,
      [`${keyPrefix}idNumber`]: model?.idNumber,
      // [`${keyPrefix}nationality`]: model?.nationality,
      // [`${keyPrefix}idType`]: model?.nationality === 'CN' ? 'ID_CARD' : 'PASSPORT',
      // [`${keyPrefix}name`]: model?.name,
      // [`${keyPrefix}englishName`]: model?.nationality === 'CN' ? undefined : model?.englishName,
    };
  }
  function generateUBOPerson(key) {
    const keyPrefix = `${key}_`;
    return {
      [`${keyPrefix}faceImageKey`]: '',
      [`${keyPrefix}backImageKey`]: '',
      [`${keyPrefix}faceImageUrl`]: '',
      [`${keyPrefix}backImageUrl`]: '',
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
      [`${keyPrefix}nationality`]: '',
      [`${keyPrefix}name`]: '',
      [`${keyPrefix}englishName`]: '',
      [`${keyPrefix}shareHoldingRatio`]: '',
    };
  }
  const query = (file, is = true) => {
    setBasicLoading(true);
    recognizeIdCard({
      request: {
        idType: is ? 'ID_CARD' : 'PASSPORT',
        faceImageKey: field.getValue(`${panes[activeKey - 1]?.key}_faceImageKey`) || file?.response?.result,
        backImageKey: field.getValue(`${panes[activeKey - 1]?.key}_backImageKey`) || file?.response?.result,
      },
    }).then((res) => {
      const { model, success, msg } = res;
      if (success && model) {
        setBasicLoading(false);
        setPanes((prevPanes) => prevPanes.map((pane) =>
          (pane.key === activeKey ? { ...pane, visible: true } : pane)));
        const info = generateUBOPersonInfo(panes[activeKey - 1].key, file, model);
        field.setValues(info);
        if (!is) {
          if (info[`${panes[activeKey - 1].key}_nationality`] !== 'CN') {
            field.remove(`${panes[activeKey - 1].key}_backImageUrl`);
          }
        }
      } else {
        const info = generateUBOPerson(panes[activeKey - 1].key);
        field.setValues(info);
        setBasicLoading(false);
        setPanes(panes?.map((ele, index) => {
          if (activeKey - 1 === index) {
            return ({
              ...ele,
              fileLists: {
                faceImageUrl: errorInfo,
                backImageUrl: errorInfo,
              },
            });
          }
          return ele;
        }));
        Message._show({ content: msg || '数据异常', type: 'error' });
      }
    }).catch((err) => {
      const info = generateUBOPerson(panes[activeKey - 1].key);
      field.setValues(info);
      setPanes(panes?.map((ele, index) => {
        if (activeKey - 1 === index) {
          return ({
            ...ele,
            fileLists: {
              faceImageUrl: errorInfo,
              backImageUrl: errorInfo,
            },
          });
        }
        return ele;
      }));
      setBasicLoading(false);
      Message._show({ content: err?.errorMessage || '数据异常', type: 'error' });
    });
  };
  const ID_COLOR_IMAGE = {
    name: '证件彩色影像件',
    fieldKey: 'faceImageUrl',
    opt: {
      listType: 'picture-card',
      action: 'https://crossborder.1688.com/choice/upload',
      accept: '.jpg,.jpeg,.png,.pdf',
      className: 'id-color-image-upload',
      disabled: view,
      onRemove: () => {
        setRemoveIdColorImage(true);
        if (removeIdNationalEmblemImage) {
          setBasicLoading(false);
          setRemoveIdNationalEmblemImage(false);
        }
        const keyPrefix = `${panes[activeKey - 1].key}_`;
        field.setValues({
          [`${keyPrefix}faceImageKey`]: '',
          [`${keyPrefix}faceImageUrl`]: '',
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
        });
      },
      imgUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01Ejn9sD29Dd1FgRt5D_!!6000000008034-2-tps-160-100.png',
    },
  };

  const ID_NATIONAL_EMBLEM = {
    fieldKey: 'backImageUrl',
    type: SCHEMA_UPLOAD,
    opt: {
      listType: 'picture-card',
      action: 'https://crossborder.1688.com/choice/upload',
      accept: '.jpg,.jpeg,.png,.pdf',
      title: '国徽页',
      className: 'id-color-image-upload',
      disabled: view,
      nameStyle: { alignItems: 'normal' },
      rules: [{ required: true, message: '请上传国徽页' }],
      onRemove: () => {
        setRemoveIdNationalEmblemImage(true);
        if (removeIdColorImage) {
          setBasicLoading(false);
          setRemoveIdColorImage(false);
        }
        const keyPrefix = `${panes[activeKey - 1].key}_`;
        field.setValues({
          [`${keyPrefix}backImageUrl`]: '',
          [`${keyPrefix}backImageKey`]: '',
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
        });
      },
      imgUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01B0Z81O1ccTBHtuac9_!!6000000003621-2-tps-160-100.png',
    },
  };

  const NATIONALITY = {
    name: '国籍',
    fieldKey: 'nationality',
    type: SCHEMA_SELECT,
    opt: commonOptions({
      placeholder: '请选择',
      nameStyle: { alignItems: 'normal' },
      rules: [{ required: true, message: '请选择国籍' }],
      initValue: 'CN',
      showSearch: true,
      onChange: (value) => {
        setBasicLoading(false);
        const keyPrefix = `${panes[activeKey - 1].key}_`;
        field.setValues({
          [`${keyPrefix}nationality`]: value,
          [`${keyPrefix}idType`]: value === 'CN' ? 'ID_CARD' : 'PASSPORT',
          [`${keyPrefix}faceImageKey`]: '',
          [`${keyPrefix}faceImageUrl`]: '',
          [`${keyPrefix}backImageUrl`]: '',
          [`${keyPrefix}backImageKey`]: '',
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
        });
        setPanes(panes?.map((ele, index) => {
          if (activeKey - 1 === index) {
            return ({
              ...ele,
              visible: false,
              isPassport: value === 'CN',
              fileLists: {
                faceImageUrl: [],
                backImageUrl: [],
              },
            });
          }
          return ele;
        }));
        if (value !== 'CN') {
          field.remove(`${keyPrefix}backImageUrl`);
        }
      },
    }),
    values: queryEnumsList['regionType'],
  };

  const BIRTH_DATE = {
    name: '出生年月日',
    fieldKey: 'birthDate',
    type: SCHEMA_DATE_PICKER,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入出生年月日' }],
    }),
  };

  const RESIDENTIAL_ADDRESS = {
    name: '居住地址',
    fieldKey: 'address',
    type: SCHEMA_ADDRESS,
    opt: commonOptions({
      placeholder: '选择居住地址',
      maxLevel: 4,
      rules: [{ required: true, message: '请选择居住地址' }],
    }),
  };

  const RESIDENTIAL_ADDRESS_DETAIL = {
    fieldKey: 'addressDetail',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入居住地址详情' }],
    }),
  };

  const UBO_ID_NUMBER = {
    name: '证件号',
    fieldKey: 'idNumber',
    type: SCHEMA_INPUT,
    opt: commonOptions({
      rules: [{ required: true, message: '请输入证件号' }],
    }),
  };

  const addTabpane = () => {
    const newKey = `${panes.length + 1}`;
    field.setValues(generateUBOPerson(newKey));
    setPanes((prevPanes) =>
      prevPanes.map((pane) => ({
        ...pane,
      }))
        .concat({
          tab: `UBO信息 ${newKey}`,
          key: newKey,
          closeable: true,
          visible: false,
          balloonVisible: false,
          isPassport: true,
          fileLists: { faceImageUrl: [], backImageUrl: [] },
        }));
    setActiveKey(newKey);
  };

  const removeTabpane = (targetKey) => {
    setPanes((prevPanes) => {
      const targetIndex = prevPanes.findIndex((pane) => pane.key === targetKey);
      const newPanes = prevPanes.filter((pane) => pane.key !== targetKey);
      if (targetKey === activeKey) {
        const newIndex = Math.max(0, targetIndex - 1);
        setActiveKey(newPanes[newIndex].key);
      }
      return newPanes;
    });
    field.remove(`${targetKey}_shareHoldingRatio`);
    field.remove(`${targetKey}_name`);
    field.remove(`${targetKey}_idType`);
    field.remove(`${targetKey}_faceImageKey`);
    field.remove(`${targetKey}_backImageKey`);
    field.remove(`${targetKey}_faceImageUrl`);
    field.remove(`${targetKey}_backImageUrl`);
    field.remove(`${targetKey}_idType`);
    field.remove(`${targetKey}_birthDate`);
    field.remove(`${targetKey}_address`);
    field.remove(`${targetKey}_addressDetail`);
    field.remove(`${targetKey}_idNumber`);
    field.remove(`${targetKey}_englishName`);
    field.remove(`${targetKey}_nationality`);
    field.setErrors({
      [`${targetKey}_shareHoldingRatio`]: null,
      [`${targetKey}_name`]: null,
      [`${targetKey}_idType`]: null,
      [`${targetKey}_faceImageKey`]: null,
      [`${targetKey}_backImageKey`]: null,
      [`${targetKey}_faceImageUrl`]: null,
      [`${targetKey}_backImageUrl`]: null,
      [`${targetKey}_idType`]: null,
      [`${targetKey}_birthDate`]: null,
      [`${targetKey}_address`]: null,
      [`${targetKey}_addressDetail`]: null,
      [`${targetKey}_idNumber`]: null,
      [`${targetKey}_englishName`]: null,
      [`${targetKey}_nationality`]: null,
    });
    if (total(field.getValues()) > 100) {
      setHasAdd(true);
    } else {
      setHasAdd(false);
    }
  };

  const handleVisibleChange = (key, v) => {
    setPanes((prevPanes) =>
      prevPanes.map((pane) =>
        (pane.key === key ? { ...pane, balloonVisible: v } : { ...pane, balloonVisible: false })));
  };

  const total = (obj) => {
    let sum = 0;
    for (const key in obj) {
      if (key.includes('shareHoldingRatio')) {
        sum += obj[key];
      }
    }
    return sum;
  };
  const COMPANY_IS_UBO = {
    name: '公司是否有UBO',
    fieldKey: 'hasUBOInfo',
    type: SCHEMA_RADIO_GROUP,
    opt: {
      initValue: true,
      style: { width: 320 },
      disabled: isList || view,
      onChange: (value) => {
        setIsUboList(value);
        const keyPrefix = `${panes[activeKey - 1].key}_`;
        field.setErrors({
          hasUBOInfo: null,
        });
        field.setValues({
          hasUBOInfo: value,
          [`${keyPrefix}backImageUrl`]: '',
          [`${keyPrefix}backImageKey`]: '',
          [`${keyPrefix}faceImageUrl`]: '',
          [`${keyPrefix}faceImageKey`]: '',
          [`${keyPrefix}nationality`]: 'CN',
          [`${keyPrefix}idType`]: 'ID_CARD',
          [`${keyPrefix}name`]: '',
          [`${keyPrefix}shareHoldingRatio`]: '',
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
        });
        if (value) {
          setPanes([
            { tab: 'UBO信息 1', key: '1', closeable: false, visible: false, isPassport: true, balloonVisible: false, fileLists: { UBOPersonInfo_faceImageUrl: [], UBOPersonInfo_backImageUrl: [] } },
          ]);
        } else {
          field.setErrors({
            [`${keyPrefix}shareHoldingRatio`]: null,
            [`${keyPrefix}name`]: null,
            [`${keyPrefix}idType`]: null,
            [`${keyPrefix}faceImageKey`]: null,
            [`${keyPrefix}backImageKey`]: null,
            [`${keyPrefix}faceImageUrl`]: null,
            [`${keyPrefix}backImageUrl`]: null,
            [`${keyPrefix}idType`]: null,
            [`${keyPrefix}birthDate`]: null,
            [`${keyPrefix}address`]: null,
            [`${keyPrefix}addressDetail`]: null,
            [`${keyPrefix}idNumber`]: null,
          });
          field.remove(`${keyPrefix}faceImageKey`);
          field.remove(`${keyPrefix}backImageKey`);
          field.remove(`${keyPrefix}faceImageUrl`);
          field.remove(`${keyPrefix}backImageUrl`);
        }
      },
    },
    values: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
    title_style: 'w-[97px]',
    content_style: 'mt-[8px]',
  };
  return (
    <Block
      title={
        <div>
          <span className="text-[#FB3B20]">* </span>
          <span className="text-[16px]">UBO信息</span>
          <span className="text-[12px] text-[#999] ml-[4px]">证件上传完成后可对展开的字段进行编辑</span>
        </div>
      }
    >
      <div className="py-[9px] px-[12px] text-[#666] text-[14px] bg-[#EBF6FF] rounded-[6px] mt-[12px]">
        <div>UBO信息（UBO：Ultimate Beneficial Owner的短写，也就是最终受益人），满足以下任一条件的都需要填写：</div>
        <div>（1）直接或间接持公司25%及以上的所有股东（自然人）；</div>
        <div>（2）能对公司起到25%份额及以上投票权的人；</div>
        <div>（3）能行使或拥有公司最终控制权的人；</div>
        <div className="text-[#333]">
          {/* 【简单解释：满足以下任一条件的都需要填写1、直接或间接持公司25%及以上的所有股东（自然人）；2、能对公司起到25%份额及以上投票权的人；3、能行使或拥有公司最终控制权的人】 */}
          仍有问题可见<span className="cursor-pointer text-[#0077ff] ml-[8px] mr-[8px]" onClick={() => setVisible(true)}>示例图</span>
        </div>
      </div>
      {[COMPANY_IS_UBO].map((ele) => (
        <RenderFieldExt {...ele} field={field} />
      ))}
      {isUboList && (
        <Tab
          activeKey={activeKey}
          className="mt-[14px]"
          onChange={(e) => setActiveKey(e)}
          onAdd={addTabpane}
          showAdd={hasAdd ? false : !view && panes.length < 4}
        >
          {panes.map((ele) => {
            return (
              <Tab.Item
                title={
                  <div>
                    {ele.tab}
                    {ele.closeable && (
                    <Balloon
                      trigger={<Icon type="close" className="text-[#666] ml-[8px]" onClick={() => handleVisibleChange(ele.key, true)} />}
                      align="tr"
                      closable={false}
                      visible={ele.balloonVisible}
                      style={{ width: '240px', padding: '20px' }}
                      onClose={() => handleVisibleChange(ele.key, false)}
                    >
                      <div>
                        <div className="text-[14px] text-[#333]">确定要删除该UBO信息吗？</div>
                        <div className="flex justify-end mt-[20px]">
                          <Button style={{ marginRight: '8px', borderRadius: '4px', height: '24px', width: '48px', fontSize: '12px', padding: '4px 12px' }} onClick={() => handleVisibleChange(ele.key, false)}>取消</Button>
                          <Button type="primary" style={{ borderRadius: '4px', height: '24px', width: '48px', fontSize: '12px', padding: '4px 12px' }} onClick={() => { handleVisibleChange(ele.key, false); removeTabpane(ele.key); }}>确定</Button>
                        </div>
                      </div>
                    </Balloon>
                    )}
                  </div>
              }
                key={ele.key}
              >
                <Loading tip="加载中..." visible={basicLoading} style={{ width: '100%' }}>
                  <div className="flex flex-wrap alipay-international-edd-info">
                    <div className="w-[48%]">
                      {[UBO_NAME].map((e) => (
                        <div className="mt-[20px] mr-[20px]">
                          <RenderFieldExt
                            {...e}
                            name={ele.isPassport ? '姓名' : '姓名（与护照一致）'}
                            opt={{
                              ...e.opt,
                              rules: [{ required: true, message: ele.isPassport ? '请输入姓名' : '请输入姓名（与护照一致）' }],
                            }}
                            field={field}
                            fieldKey={`${ele.key}_${e.fieldKey}`}
                          />
                        </div>
                      ))}
                      {!ele.isPassport && [NAME_ENGLISH].map((e) => (
                        <div className="mt-[20px] mr-[20px]">
                          <RenderFieldExt
                            {...e}
                            field={field}
                            fieldKey={`${ele.key}_${e.fieldKey}`}
                          />
                        </div>
                      ))}
                      {[UBO_SHAREHOLDING_RATIO, NATIONALITY, ID_TYPE].map((e) => (
                        <div className="mt-[20px] mr-[20px]">
                          <RenderFieldExt
                            {...e}
                            field={field}
                            fieldKey={`${ele.key}_${e.fieldKey}`}
                          />
                        </div>
                      ))}
                      <div className="flex">
                        {[ID_COLOR_IMAGE].map((item) => (
                          <div className="mt-[20px] mr-[20px]">
                            <UploadField
                              {...item}
                              opt={{
                                ...item.opt,
                                title: ele.isPassport ? '人像页' : '',
                                rules: [{ required: true, message: ele.isPassport ? '请上传人像页' : '请上传护照' }],
                              }}
                              field={field}
                              fieldKey={`${ele.key}_${item.fieldKey}`}
                              fileLists={ele.fileLists[item.fieldKey]}
                              onFileListChange={(newFileList) => {
                                setPanes((prevPanes) =>
                                  prevPanes.map((pane) =>
                                    (pane.key === ele.key
                                      ? {
                                        ...pane,
                                        fileLists: {
                                          ...pane.fileLists,
                                          [item.fieldKey]: newFileList,
                                        },
                                      }
                                      : pane)));
                              }}
                              query={query}
                              isPassport={ele.isPassport}
                              panes={panes[activeKey - 1]?.key}
                            />
                          </div>
                        ))}
                        {ele.isPassport && [ID_NATIONAL_EMBLEM].map((item) => (
                          <div className="mt-[20px] mr-[20px]">
                            <UploadField
                              {...item}
                              field={field}
                              fieldKey={`${ele.key}_${item.fieldKey}`}
                              fileLists={ele.fileLists[item.fieldKey]}
                              onFileListChange={(newFileList) => {
                                setPanes((prevPanes) =>
                                  prevPanes.map((pane) =>
                                    (pane.key === ele.key
                                      ? {
                                        ...pane,
                                        fileLists: {
                                          ...pane.fileLists,
                                          [item.fieldKey]: newFileList,
                                        },
                                      }
                                      : pane)));
                              }}
                              isPassport={ele.isPassport}
                              query={query}
                              panes={panes[activeKey - 1]?.key}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="text-[12px] text-[#999] flex mt-[8px] ml-[192px]">请提供实体证件的彩色扫描件或照片（电子证件暂不接受）</div>
                    </div>
                    {ele.visible && (
                    <div className="w-[48%]">
                      {[BIRTH_DATE].map((e) => (
                        <RenderFieldExt {...e} field={field} fieldKey={`${ele.key}_${e.fieldKey}`} />
                      ))}
                      {ele.isPassport && [RESIDENTIAL_ADDRESS].map((e) => (
                        <RenderFieldExt {...e} field={field} fieldKey={`${ele.key}_${e.fieldKey}`} />
                      ))}
                      {[RESIDENTIAL_ADDRESS_DETAIL].map((e) => (
                        <RenderFieldExt {...e} name={ele.isPassport ? '' : '居住地址'} field={field} fieldKey={`${ele.key}_${e.fieldKey}`} />
                      ))}
                      {[UBO_ID_NUMBER].map((e) => (
                        <RenderFieldExt {...e} field={field} fieldKey={`${ele.key}_${e.fieldKey}`} />
                      ))}
                    </div>
                    )}
                  </div>
                </Loading>
              </Tab.Item>
            );
          })}
        </Tab>
      )}
      {isUboList && (
        <Image
          style={{ display: 'none' }}
          src="https://img.alicdn.com/imgextra/i3/O1CN01bCauS21ukP84DlSmc_!!6000000006075-2-tps-1931-1021.png"
          preview={{
            visible,
            imageRender: () => <img src="https://img.alicdn.com/imgextra/i3/O1CN01bCauS21ukP84DlSmc_!!6000000006075-2-tps-1931-1021.png" style={{ backgroundColor: '#fff' }} />,
            onVisibleChange: (value) => {
              setVisible(value);
            },
          }}
        />
      )}
    </Block>
  );
}

export default UboInfor;
