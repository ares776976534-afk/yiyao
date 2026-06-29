// formItemLayout
export const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

const validateNumberInput = (value, regex, errorMessage) => {
  if (value === '' || value === undefined) {
    return Promise.resolve();
  }
  if (!regex.test(value)) {
    throw new Error(errorMessage);
  }
  return Promise.resolve();
};

const numberRegex = /^(0(\.\d{1,2})|([1-9]\d*(\.\d{1,2})?))$/;
const numberErrorMessage = '最多保留两位小数,且仅支持数字输入';
const weightRegex = /^\d+$/;
const weightErrorMessage = '请输入大于零的整数';

const validateWeight = (value) => {
  return validateNumberInput(value, weightRegex, weightErrorMessage).then(() => {
    if (parseInt(value, 10) <= 0) {
      throw new Error(weightErrorMessage);
    }
  });
};

export const FieldsMap = [
  {
    key: 'length',
    label: '长',
    suffix: 'cm',
    precision: 2,
    rules: (rule, value) => validateNumberInput(value, numberRegex, numberErrorMessage),
  },
  {
    key: 'width',
    label: '宽',
    suffix: 'cm',
    precision: 2,
    rules: (rule, value) => validateNumberInput(value, numberRegex, numberErrorMessage),
  },
  {
    key: 'height',
    label: '高',
    suffix: 'cm',
    precision: 2,
    rules: (rule, value) => validateNumberInput(value, numberRegex, numberErrorMessage),
  },
  {
    key: 'weight',
    label: '重量',
    suffix: 'g',
    precision: 0,
    rules: (rule, value) => validateWeight(value),
  },
];

export const ITEM_TYPE = {
  qqyx: '全球严选',
};

// 已获权益TYPEand进阶权益TYPE
export const TYPE = {
  item_choice_light: 'Choice商品标及流量',
  item_pws: '件重尺场域权益',
  item_cert: '跨境证书场域权益',
  item_rank: '海景房/榜单权益',
};

export const TIME_RANGE = [
  { title: '近7天', key: 'last7Days' },
  { title: '近30天', key: 'last30Days' },
];
