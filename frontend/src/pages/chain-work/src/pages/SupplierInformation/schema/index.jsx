import React from 'react';
import { contanst } from '@alife/1688-chain-renderfield';
import CategoryAbility from '../components/CategoryAbility';
import { hasValue, warehouseType, newProductDevFrequency, ProductQualityCertification, QualityCertificationSystem, patentColumn, regularDeviceColumn } from '../enums';
import { MODE_EDIT, MODE_PREVIEW } from '..';
import FieldBlock from '../components/FieldBlock';
import { Button } from '@alifd/next';
import '../index.scss';

const btnStyle = {
  text: 'text',
  type: 'primary',
  style: {
    fontSize: '14px',
    marginLeft: '8px',
    fontWeight: 'normal',
  },
};
const modifyLink = 'https://work.1688.com/?spm=a2638g.u_11_1008.0.d80lj1nlfy.3cb11768TVhw4M&_path_=gonghuotuoguan/2017sellerbase_setting/deepAuth';
const smallYellowLabel = 'https://work.1688.com/?spm=a2638g.u_9_1014.0.d80lj1nlfy.7f271768bzLtMG&_path_=gonghuotuoguan/findfactory/tag_manage';
const certificateLink = 'https://work.1688.com/?spm=a2638g.u_4_1016.0.d80lj1nlfy.3ed11768lQbyDw&_path_=gonghuotuoguan/2017sellerbase_winport/member_infopage_manage';
export default (mode, field, fieldInstance) => {
  const createSystemField = (title, fieldKey, systemNameKey) => ({
    title,
    type: 'custom',
    fieldInitOptions: fieldKey === 'hasERPSystem' && { rules: [{ required: true }] },
    customComponent: () => (
      <div className="relative">
        <FieldBlock
          mode={mode}
          field={field}
          fieldClassName="erpName"
          fields={[
            mode !== 'preview' && {
              fieldKey,
              type: contanst.SCHEMA_RADIO_GROUP,
              values: hasValue,
              contentClassName: 'erpName',
              fieldInitOptions: fieldKey === 'hasERPSystem' && { rules: [{ required: true }] },
            },
            field.getValue(fieldKey) === 'true' && {
              fieldKey: systemNameKey,
              title: mode !== 'preview' && '系统名称',
              type: contanst.SCHEMA_INPUT,
              contentClassName: mode === 'preview' && 'absolute left-[-9px]',
            },
          ]}
        />
      </div>
    ),
  });
  const onChange = (v) => {
    field.setValues({ mainCategoryList: v });
  };
  const blocks = [
    {
      id: 'newProductCapability',
      title: '新品能力',
      subTitle: mode !== 'preview' && '仅展示最新资质信息，如需修改请跳原页面调整',
      subBlocks: [
        {
          title: '研发设计能力',
          fields: [
            { fieldKey: 'newProductDevNum', title: '新品开发数量(年)', type: contanst.SCHEMA_INPUT, fieldInitOptions: { rules: [{ required: true }] } },
            { fieldKey: 'designStaffNum', title: '设计人员数', type: contanst.SCHEMA_INPUT, fieldInitOptions: { rules: [{ required: true }] } },
            { fieldKey: 'patentNum', title: '专利证书数量', type: contanst.SCHEMA_INPUT },
            { fieldKey: 'newProductDevFrequency', title: '新品开发频次', type: contanst.SCHEMA_SELECT, values: newProductDevFrequency },
            { fieldKey: 'newProductDevPeriod', title: '新品研发周期(天)', tips: '需求填写从接到新品需求到研发上市的天数', type: contanst.SCHEMA_INPUT },
            { fieldKey: 'patentList', title: '专利', type: 'table', align: 'start', display: 'block', contentClassName: 'table-style', column: patentColumn, data: field.getValue('patentList') },
          ],
        },
        {
          title: '打样能力',
          fields: [
            { fieldKey: 'canSelfProofing', title: '能否自主打样', type: contanst.SCHEMA_SELECT, fieldInitOptions: { rules: [{ required: true }] }, values: hasValue },
            { fieldKey: 'proofingPeriod', title: '打样周期(天)', type: contanst.SCHEMA_INPUT, fieldInitOptions: { rules: [{ required: true }] } },
            { fieldKey: 'canSelfOpenModel', title: '能否自主开模', type: contanst.SCHEMA_SELECT, values: hasValue },
            { fieldKey: 'proofingDevicePic', title: '打样/制程设备照片', align: 'start', type: 'image', disabled: mode === 'preview', display: 'block', data: field.getValue('proofingDevicePic')?.map((e) => ({ src: e })), modifyLink },
            { fieldKey: 'proofingRoomPic', title: '样板间照片', align: 'start', type: 'image', display: 'block', disabled: mode === 'preview', data: field.getValue('proofingRoomPic')?.map((e) => ({ src: e })), modifyLink, valid: false },
          ],
        },
      ],
    },
    {
      id: 'productionCapability',
      title: '生产能力',
      subTitle: mode !== 'preview' && '仅展示最新资质信息，如需修改请跳原页面调整',
      subBlocks: [
        {
          title: '生产设备',
          fields: [
            { fieldKey: 'totalDeviceNum', title: '总设备台数(台)', type: contanst.SCHEMA_INPUT },
            { fieldKey: 'outsourceProcessNum', title: '外包工序', tips: '需包含名称、厂商数量', type: contanst.SCHEMA_INPUT },
            { fieldKey: 'regularDeviceList', title: '常规设备清单', align: 'start', type: 'table', display: 'block', contentClassName: 'table-style', column: regularDeviceColumn, data: field.getValue('regularDeviceList') },
          ],
        },
        {
          title: '品类化能力',
          fields: <CategoryAbility mode={mode} onChange={onChange} value={field.getValue('mainCategoryList')} fieldInstance={fieldInstance} />,
        },
      ],
    },
    {
      id: 'qualityAndService',
      title: '质量与服务',
      subTitle: mode !== 'preview' && '仅展示最新资质信息，如需修改请跳原页面调整',
      subBlocks: [
        {
          title: '质量控制',
          fields: [
            { fieldKey: 'hasQualityControl', title: '是否有质检', type: contanst.SCHEMA_SELECT, values: hasValue },
            { fieldKey: 'qualityControlDeviceNum', title: '质检设备总数', type: contanst.SCHEMA_INPUT },
            { fieldKey: 'qualityControlType', title: '质检类型', type: contanst.SCHEMA_INPUT },
            { fieldKey: 'qualityControlCert', title: '产品质量认证', type: contanst.SCHEMA_CHECKBOX_GROUP, display: 'block', values: ProductQualityCertification, mode: MODE_EDIT, disabled: mode === MODE_PREVIEW, contentClassName: 'qualityControlCert' },
            { fieldKey: 'qualityCertificationSystem', title: '质量认证体系', type: contanst.SCHEMA_CHECKBOX_GROUP, display: 'block', values: QualityCertificationSystem, mode: MODE_EDIT, disabled: mode === MODE_PREVIEW, contentClassName: 'qualityControlCert' },
            { fieldKey: 'qualityControlDeviceList', title: '质检设备清单', align: 'start', type: 'image', display: 'block', modifyLink, disabled: mode === 'preview', data: field.getValue('qualityControlDeviceList')?.map((e) => ({ src: e })) },
          ],
        },
        {
          title: '服务能力',
          fields: [
            { fieldKey: 'supportCustomization', title: '是否支持定制', type: contanst.SCHEMA_SELECT, values: hasValue },
            { fieldKey: 'supportOneDelivery', title: '是否支持一件代发', type: contanst.SCHEMA_SELECT, values: hasValue, disabled: true },
          ],
        },
        {
          title: '库存管理能力',
          fields: [
            { fieldKey: 'warehouseType', title: '仓储类型', type: contanst.SCHEMA_SELECT, values: warehouseType },
            { fieldKey: 'inventoryTurnoverRate', title: '库存周转率', type: contanst.SCHEMA_INPUT },
            { fieldKey: 'warehouseArea', title: '仓储面积(平方米)', type: contanst.SCHEMA_INPUT },
          ],
        },
      ],
    },
    {
      id: 'informationLevel',
      title: '信息化程度',
      subTitle: mode !== 'preview' && '仅展示最新资质信息，如需修改请跳原页面调整',
      subBlocks: [
        {
          title: '信息化程度',
          fields: [
            createSystemField('是否有ERP管理系统', 'hasERPSystem', 'erpName'),
            createSystemField('是否有进销存管理系统', 'hasERP', 'ERPSystemName'),
            createSystemField('是否有WMS系统', 'hasWMS', 'WMSName'),
            createSystemField('是否有MES系统', 'hasMES', 'MESName'),
            createSystemField('是否有计划排产系统', 'hasPlanProduction', 'planProductionName'),
          ],
        },
      ],
    },
    {
      id: 'qualificationCapability',
      title: '资质能力',
      subTitle: mode !== 'preview' && '仅展示最新资质信息，如需修改请跳原页面调整',
      subBlocks: [
        {
          title: '品牌资质能力',
          btn: mode !== 'preview' && <Button {...btnStyle} onClick={() => window.open(smallYellowLabel, '_blank')}>去认证</Button>,
          fields: [
            { fieldKey: 'factory', title: '代工厂', type: contanst.SCHEMA_INPUT, opt: { disabled: true } },
            { fieldKey: 'brandFactory', title: '品牌工厂', type: contanst.SCHEMA_INPUT, opt: { disabled: true } },
          ],
        },
        {
          title: '先进制造',
          btn: mode !== 'preview' && <Button {...btnStyle} onClick={() => window.open(smallYellowLabel, '_blank')}>去修改</Button>,
          fields: [
            { fieldKey: 'isSpecialized', title: '专精特新', type: contanst.SCHEMA_RADIO_GROUP, values: hasValue, disabled: true },
            { fieldKey: 'isSmallEnterprise', title: '科技型中小企业', type: contanst.SCHEMA_RADIO_GROUP, values: hasValue, disabled: true },
            { fieldKey: 'isIntellectualProperty', title: '知识产权示范企业', type: contanst.SCHEMA_RADIO_GROUP, values: hasValue, disabled: true },
            { fieldKey: 'isIntellectualPropertyAdvantage', title: '知识产权优势企业', type: contanst.SCHEMA_RADIO_GROUP, values: hasValue, disabled: true },
            { fieldKey: 'isSmallGiantEnterprise', title: '小巨人企业', type: contanst.SCHEMA_RADIO_GROUP, values: hasValue, disabled: true },
            { fieldKey: 'isTechnologyCenter', title: '企业技术中心', type: contanst.SCHEMA_RADIO_GROUP, values: hasValue, disabled: true },
            { fieldKey: 'isHighTechEnterprise', title: '高新技术企业', type: contanst.SCHEMA_RADIO_GROUP, values: hasValue, disabled: true },
            { fieldKey: 'isInnovationEnterprise', title: '创新示范企业', type: contanst.SCHEMA_RADIO_GROUP, values: hasValue, disabled: true },
          ],
        },
        {
          title: '外贸资质',
          fields: [
            { fieldKey: 'mainExportCountry', title: '主营出口国家&地区', type: contanst.SCHEMA_INPUT, display: 'block', fieldInitOptions: { rules: [{ required: true }] } },
            { fieldKey: 'certificate', title: '上传证书', align: 'start', type: 'text', modifyLink: certificateLink, display: 'block', disabled: mode === 'preview', data: field.getValue('certificate')?.map((e) => ({ src: e })) },
          ],
        },
      ],
    },
  ];
  return blocks;
};
