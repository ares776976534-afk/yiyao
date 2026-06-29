export const tabData = [
  {
    key: 'newProductCapability',
    title: '新品能力',
    // badgeCount: 1,
  },
  {
    key: 'productionCapability',
    title: '生产能力',
  },
  {
    key: 'qualityAndService',
    title: '质量与服务',
  },
  {
    key: 'informationLevel',
    title: '信息化程度',
  },
  {
    key: 'qualificationCapability',
    title: '资质能力',
  },
];


export const Mode = {
  preview: '编辑',
  edit: '提交',
};

export const hasValue = [
  {
    value: 'true',
    label: '是',
  },
  {
    value: 'false',
    label: '否',
  },
];

// 仓储类型
export const warehouseType = [
  {
    label: '自有',
    value: 'private',
  },
  {
    label: '租赁',
    value: 'lease',
  },
];

// 新品开发频次
export const newProductDevFrequency = [
  {
    label: '每年',
    value: '每年',
  },
  {
    label: '每季',
    value: '每季',
  },
  {
    label: '每月',
    value: '每月',
  },
  {
    label: '每周',
    value: '每周',
  },
  {
    label: '每日',
    value: '每日',
  },
];

// 产品质量认证
export const ProductQualityCertification = [
  {
    value: 'CCC',
    label: 'CCC',
  },
  {
    value: 'CQC',
    label: 'CQC',
  },
  {
    value: 'CB',
    label: 'CB',
  },
  {
    value: 'CE',
    label: 'CE',
  },
  {
    value: 'RoHS',
    label: 'RoHS',
  },
  {
    value: 'PSE',
    label: 'PSE',
  },
  {
    value: 'JET',
    label: 'JET',
  },
  {
    value: 'E/e-mark',
    label: 'E/e-mark',
  },
  {
    value: '其他',
    label: '其他',
  },
];

// 质量认证体系
export const QualityCertificationSystem = [
  {
    value: 'ISO 900',
    label: 'ISO 900',
  },
  {
    value: 'ISO 9001',
    label: 'ISO 9001',
  },
  {
    value: 'ISO 9002',
    label: 'ISO 9002',
  },
  {
    value: 'ISO 9003',
    label: 'ISO 9003',
  },
  {
    value: 'ISO 9004',
    label: 'ISO 9004',
  },
  {
    value: 'ISO 14000',
    label: 'ISO 14000',
  },
  {
    value: 'ISO 140001',
    label: 'ISO 140001',
  },
  {
    value: 'ISO 140002',
    label: 'ISO 140002',
  },
  {
    value: 'ISO 140003',
    label: 'ISO 140003',
  },
  {
    value: 'ISO 140004',
    label: 'ISO 140004',
  },
  {
    value: 'ISO/TS 16949',
    label: 'ISO/TS 16949',
  },
  {
    value: 'SA 8000',
    label: 'SA 8000',
  },
  {
    value: 'HACCP',
    label: 'HACCP',
  },
  {
    value: 'OHSMS18001',
    label: 'OHSMS18001',
  },
  {
    value: 'ISO 13485',
    label: 'ISO 13485',
  },
  {
    value: 'ISO 1006',
    label: 'ISO 1006',
  },
  {
    value: 'ISO 27001',
    label: 'ISO 27001',
  },
  {
    value: 'QC 080000',
    label: 'QC 080000',
  },
  {
    value: 'IQNET',
    label: 'IQNET',
  },
  {
    value: 'OHSAS 18000',
    label: 'OHSAS 18000',
  },
  {
    value: 'OHSAS 18001',
    label: 'OHSAS 18001',
  },
  {
    value: 'OHSAS 18002',
    label: 'OHSAS 18002',
  },
];

// 专利Table
export const patentColumn = [
  {
    title: '专利名称',
    dataIndex: 'patentName',
  },
  {
    title: '专利号',
    dataIndex: 'patentNo',
  },
  {
    title: '数据来源',
    dataIndex: 'dataSource',
  },
  {
    title: '证明材料',
    dataIndex: 'materials',
  },
  {
    title: '状态',
    dataIndex: 'patentStatus',
  },
];

// 常规设备清单
export const regularDeviceColumn = [
  {
    title: '设备名称',
    dataIndex: 'deviceName',
  },
  {
    title: '设备数量',
    dataIndex: 'deviceNum',
  },
  {
    title: '品牌',
    dataIndex: 'brand',
  },
  {
    title: '操作人数',
    dataIndex: 'operatorNum',
  },
  {
    title: '型号',
    dataIndex: 'deviceModel',
  },
  {
    title: '状态',
    dataIndex: 'deviceStatus',
  },
];
