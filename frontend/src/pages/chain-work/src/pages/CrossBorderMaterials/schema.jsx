import React from 'react';
import { Icon, Button } from '@alifd/next';
import { SCHEMA_SELECT, SCHEMA_CHECKBOX_GROUP } from '@/components/CommonTable/contanst';
import BallonTooltip from '@/pages/ManufacturerInfoManagement/components/BallonTooltip';
import { queryAreaInfo } from '@/service/common';
import FormModal from '../ManufacturerInfoManagement/FormModal';
import { queryOfferEnums } from '@/pages/OverseasDistribution/services';

const SCHEMA_UPLOAD_IMAGE = 'uploadImage';

const RenderIcon = (config) => {
  const { value } = config;
  const intro = <Icon type="d-help" size="small" className="cursor-pointer" />;
  const contentToDisplay = typeof value === 'string' ? value : value.props.children;
  return (
    <BallonTooltip trigger={intro} content={contentToDisplay} />
  );
};
// 禁售国家/地区
const PROHIBITED_AREAS = {
  name: (
    <>
      <span className="mr-[5px]">禁售国家/地区</span>
      <RenderIcon value="未设置禁售国家/地区，表示您的商品支持售往所有境外地区。" />
    </>
  ),
  fieldKey: 'prohibitedAreas',
  type: SCHEMA_SELECT,
  opt: {
    showSearch: true,
    hasClear: true,
    style: { width: 500, borderRadius: 6 },
    mode: 'multiple',
    maxTagCount: 10,
  },
  fetchData: () => {
    return queryAreaInfo({
      queryType: 1,
      name: 'manufacturerAddress',
    }).then((res) => {
      return res;
    });
  },
};
const onJump = () => {
  const currentUrl = new URL(window.location.href);
  const { origin } = currentUrl;
  window.location.href = `${origin}/app/channel-fe/chain-work/manufacturerinfomanagement.html`;
};
// 商品外包装语言
const PACKAGING_LANGUAGE = {
  name: '商品外包装语言',
  fieldKey: 'packageLanguage',
  type: SCHEMA_SELECT,
  opt: {
    showSearch: true,
    hasClear: true,
    rules: [{ required: true, message: '请选择商品外包装语言' }],
    style: { width: 500, borderRadius: 6 },
    mode: 'multiple',
    maxTagCount: 10,
  },
  fetchData: () => queryOfferEnums().then((res) => {
    return res?.packageLanguage?.map(({ code, desc }) => ({ label: desc, key: code, value: code }));
  }),
};

export default (props) => {
  const { manufacturerList = [], manuCount = 0, addManufacturerInfo = () => {}, state, field } = props;
  const addButton = () => {
    return (
      <div>
        <Button
          type="primary"
          text
          onClick={() => FormModal.open({
            title: <div className="text-[16px] font-medium">新增制造商信息</div>,
            onSubmit: (value) => addManufacturerInfo(value),
            labelAlign: 'left',
            subName: '保存并使用',
          })}
          disabled={manuCount}
        >
          新增制造商信息
        </Button>
      </div>
    );
  };
  // 制造商信息
  const MANUFACTURER_INFO = {
    name: (
      <>
        <span className="mr-[5px]">制造商信息</span>
        <RenderIcon
          value={
            <>
              {'欧洲通用产品安全法规（GPSR）将于2024年12月13日强制实施，售往欧盟地区的商品必须填写制造商信息，'}
              <a href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/QOG9lyrgJP3OoX66TDxPGL1KVzN67Mw4" target="_blank" rel="noreferrer" >查看更多信息</a>
            </>
          }
        />
      </>
    ),
    fieldKey: 'manufacturerId',
    type: SCHEMA_SELECT,
    opt: {
      showSearch: true,
      cacheValue: false,
      style: { width: 500, borderRadius: 6 },
      extraButtons: (
        <>
          <Button className="mr-[12px] ml-[12px]" type="primary" text onClick={onJump}>管理制造商信息</Button>
          {manuCount ? (
            <BallonTooltip trigger={addButton()} content="最多支持100个制造商信息，若需要新增请删除未使用的制造商信息。" />
          ) : (
            addButton()
          )}
        </>
      ),
    },
    values: manufacturerList,
  };
  // 可提供的商品服务（多选下拉）
  const PROVIDED_SERVICE = {
    name: '可提供的商品服务',
    fieldKey: 'itemProvideService',
    type: SCHEMA_SELECT,
    opt: {
      showSearch: true,
      hasClear: true,
      style: { width: 500, borderRadius: 6 },
      mode: 'multiple',
      maxTagCount: 10,
    },
    fetchData: () => queryOfferEnums().then((res) => {
      return res?.provideService?.map(({ code, desc }) => ({ label: desc, key: code, value: code }));
    }),
  };

  // 跨境增值服务（checkbox组）
  const CROSS_BORDER_SERVICE = {
    name: '跨境增值服务',
    fieldKey: 'crossBorderModel',
    type: SCHEMA_CHECKBOX_GROUP,
    opt: {
      rules: [{
        required: true,
        message: '请选择跨境增值服务',
        validator: (rule, value, callback) => {
          if (!value || !Array.isArray(value) || value.length === 0) {
            callback('请选择跨境增值服务');
          } else {
            callback();
          }
        },
      }],
    },
    values: [
      { label: '可提供外语说明书', value: 'foreignLanguageManual' },
      { label: '可提供外语包装', value: 'foreignLanguagePackaging' },
      { label: '支持跨境贴标', value: 'crossBorderLabeling' },
      { label: '支持贴箱唛', value: 'cartonMarking' },
    ],
  };

  // 外包装参考图
  const PACKAGE_IMAGE = {
    name: '外包装参考图',
    fieldKey: 'foreignPackageImageList',
    type: SCHEMA_UPLOAD_IMAGE,
    opt: {
      maxCount: 3,
    },
  };

  switch (state) {
    case 'language':
      return [PACKAGING_LANGUAGE];
    case 'channelNoLanguage':
      return [PROHIBITED_AREAS, MANUFACTURER_INFO, PROVIDED_SERVICE];
    case 'channelService': {
      // 获取跨境增值服务的值
      const crossBorderModelValue = field?.getValue('crossBorderModel') || [];
      // 判断是否选择了"可提供外语包装"
      const hasForeignLanguagePackaging = crossBorderModelValue.includes('foreignLanguagePackaging');
      // 如果选择了"可提供外语包装"，则包含外包装参考图
      const fields = [CROSS_BORDER_SERVICE];
      if (hasForeignLanguagePackaging) {
        fields.push(PACKAGE_IMAGE);
      }
      fields.push(PROHIBITED_AREAS, MANUFACTURER_INFO);
      return fields;
    }
    default:
      return [PROHIBITED_AREAS, MANUFACTURER_INFO];
  }
};
