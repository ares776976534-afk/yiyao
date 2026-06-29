/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import { NumberPicker, Balloon } from '@alifd/next';
import BallonTooltip from '@/pages/ManufacturerInfoManagement/components/BallonTooltip';

// 定义各个列配置
// const SERIAL_NUMBER = {
//   title: '序号',
//   cell: (v, i) => <div>{Number(i) + 1}</div>,
//   dataIndex: '__rowIndex',
//   align: 'center',
// };

// const COLOR_NAME = {
//   title: '颜色',
//   cell: (v, i, record) => <div>{record?.attributes?.[0]?.text}</div>,
//   dataIndex: 'color',
//   align: 'center',
// };

// const SIZE_NAME = {
//   title: '尺码',
//   cell: (v, i, record) => <div>{record?.attributes?.[1]?.text}</div>,
//   dataIndex: 'size',
//   align: 'center',
// };

// SKU信息
const SKU_INFO = {
  title: 'SKU信息',
  dataIndex: 'skuLabels',
  width: 152,
  cell: (value, index, record) => {
    const { attributes = [] } = record;
    return (
      <div className="p-[16px]">
        {attributes?.length > 0 ? (
          <div>
            {attributes[0]?.text && (<BallonTooltip trigger={<div className="text-[14px] text-[#333] text-ellipsis line-clamp-1 cursor-pointer">{attributes[0]?.label}: {attributes[0]?.text}</div>} content={`${attributes[0]?.label}: ${attributes[0]?.text}`} />)}
            {attributes[1]?.text && (<BallonTooltip trigger={<div className="text-[14px] text-[#333] text-ellipsis line-clamp-1 cursor-pointer">{attributes[1]?.label}: {attributes[1]?.text}</div>} content={`${attributes[1]?.label}: ${attributes[1]?.text}`} />)}
          </div>
        ) : '-'}
      </div>
    );
  },
};

// 导出根据类型选择的列配置
export default (state, isWeightOnly, field, isAlert) => {
  const { init, getValues, getError } = field;
  const [isOfficial, setIsOfficial] = useState(true);
  function filterEmptyFields(obj) {
    const _data = {};
    for (const key in obj) {
      if (obj[key] !== '' && obj[key] !== undefined) {
        _data[key] = obj[key];
      }
    }
    return _data;
  }
  function checkDimensions(obj) {
    const _data = filterEmptyFields(obj);
    const { width } = _data;
    const { height } = _data;
    const { length } = _data;
    if (width === undefined && height === undefined && length === undefined) {
      return false;
    } else if (width && height && length) {
      return false;
    } else {
      return true;
    }
  }
  function checkValue(obj) {
    if (obj.length === '' && obj.width === '' && obj.height === '') {
      return false;
    } else {
      return true;
    }
  }
  // 创建一个函数来生成尺寸相关的列配置
  const createDimensionColumn = (title, type, isWeight, precision) => ({
    // title: <div>{!isWeight && <span className="text-[#FF0000]">*</span> }{type !== 'weight' ? '长宽高（cm）' : title}</div>,
    title,
    // colSpan: colSpan(type),
    width: 144,
    cell: (value, index, record, { onActionClick }) => {
      const { currentPws = null, suggestPws = null } = record;
      return (
        <div className="weight-table-cell">
          <div className={`p-[16px] relative ${suggestPws ? 'h-[49px]' : `${record?.attributes?.length >= 2 ? 'h-[74px]' : ''}  flex items-center flex-wrap justify-center`}`}>
            <NumberPicker
              placeholder="请输入"
              style={{ width: '100%', height: '17px', border: 0 }}
              hasTrigger={false}
              precision={precision}
              // defaultValue={currentPws[type]}
              className={`editable-pane ${record.isOfficial && isOfficial ? 'isOfficial' : ''} ${suggestPws ? 'suggestPws' : ''}`}
              {...init(`${index}.${type}`, {
                props: {
                  value: value === undefined ? currentPws[type] : value,
                },
                rules: [
                  type !== 'weight' && { validator: (rule, v, callback) => {
                    onActionClick({ type, info: { value: v || '', index, record } });
                    const values = getValues();
                    // const otherRegex = /^(0(\.\d{1,2})|([1-9]\d*(\.\d{1,2})?))$/;
                    if (v) {
                      // if (!otherRegex.test(v)) {
                      //   return callback('最多保留两位小数,且仅支持数字输入');
                      // }
                      return callback();
                    } else if (!isWeight) {
                      callback('不能为空');
                    } else {
                      callback(checkDimensions(values[index]) ? '不能为空' : '');
                    }
                  } },
                  type === 'weight' && { validator: (rule, v, callback) => {
                    onActionClick({ type, info: { value: v || '', index, record } });
                    const values = getValues();
                    // const weightRegex = /^\d+$/; // 匹配整数
                    if (v) {
                      // if (!weightRegex.test(v)) {
                      //   return callback('请输入非零的整数');
                      // }
                      return callback();
                    } else if (!isWeight) {
                      callback('不能为空');
                    } else {
                      callback(checkDimensions(values[index]) ? '不能为空' : '');
                    }
                  } },
                ],
              })}
            />
            <br />
            {getError(`${index}.${type}`) ? (
              !isWeight ? (
                <span style={{ color: 'red', bottom: 0, left: 12 }}>
                  {getError(`${index}.${type}`).join(',')}
                </span>
              ) : (
                checkValue(getValues()[index]) ? (
                  <span style={{ color: 'red', bottom: 0, left: 12 }}>
                    {getError(`${index}.${type}`).join(',')}
                  </span>
                ) : ''
              )
            ) : (
              ''
            )}
          </div>
          {record?.suggestPws && (
            <div className="p-[16px] bg-[#F5FAFF]">
              <div className="h-[17px] flex items-center justify-center">{suggestPws[type] || '-'}</div>
            </div>
          )}
        </div>
      );
    },
    dataIndex: type.toLowerCase(),
    align: 'center',
  });
  // 数据类型
  const DATA_TYPE = {
    title: '数据类型',
    dataIndex: 'dataType',
    alignHeader: 'center',
    width: 98,
    cell: (value, index, record) => (
      <div>
        <div className={`p-[16px] ${record?.suggestPws ? 'h-[49px]' : `${record?.attributes?.length >= 2 ? 'h-[74px]' : ''} flex items-center`}`}>
          <div className="h-[17px] flex items-center justify-center">当前数据</div>
        </div>
        {record?.suggestPws && (
          <div className="p-[16px] bg-[#F5FAFF]">
            <div className="h-[17px] flex items-center justify-center">建议数据</div>
          </div>
        )}
      </div>
    ),
  };
  // 使用函数生成尺寸列
  const LENGTH_NAME = createDimensionColumn('长（cm）', 'length', isWeightOnly, 2);
  const WIDTH_NAME = createDimensionColumn('宽（cm）', 'width', isWeightOnly, 2);
  const HEIGHT_NAME = createDimensionColumn('高（cm）', 'height', isWeightOnly, 2);
  const WEIGHT_NAME = createDimensionColumn('重量（g）', 'weight', false, 0);

  const PWS_INFO = {
    title: '您当前填写的件重尺',
    dataIndex: 'pwsModels',
    width: 152,
    align: 'center',
    children: [DATA_TYPE, LENGTH_NAME, WIDTH_NAME, HEIGHT_NAME, WEIGHT_NAME],
  };
  // 建议数据来源
  const SUGGEST_INFO = {
    title: '建议数据来源',
    dataIndex: 'suggestInfo',
    width: 116,
    align: 'center',
    cell: (value, index, record) => {
      const { suggestInfo = null } = record;
      const { dataSourceDesc = '', tips = '' } = suggestInfo || {};
      return (
        <div className="p-[16px] text-center">
          {suggestInfo ? (
            <>
              <div>{dataSourceDesc}</div>
              <div className="text-[#999]">{tips}</div>
            </>
          ) : '-'}
        </div>
      );
    },
  };
  // 商品信息
  const PRODUCT_INFO = {
    title: '商品信息',
    dataIndex: 'skuId',
    width: 220,
    cell: (value, index, record) => {
      const { itemId, title, imageUrl } = record;
      const hasImage = !!imageUrl; // 是否有图片
      return (
        <div className="flex p-[16px] w-[220px]">
          {hasImage && (
          <a
            href={`https://detail.1688.com/offer/${itemId}.html`}
            target="_blank"
            rel="noreferrer"
            style={{ cursor: 'pointer' }}
          >
            <div className="rounded-[6px] w-[60px] h-[60px] mr-[8px]">
              <img className="rounded-[6px]" src={imageUrl} alt="img" />
            </div>
          </a>
          )}
          <div className="flex justify-between w-full">
            <div className="flex flex-col justify-between">
              {title?.length < 8 ? (
                <span className="text-[14px] text-[#333] text-ellipsis line-clamp-2"> {title}</span>
              ) : (
                <Balloon.Tooltip
                  trigger={<div className="text-[14px] text-[#333] text-ellipsis line-clamp-2">{title}</div>}
                  align="t"
                  popupStyle={{ backgroundColor: '#333' }}
                  popupClassName="products-business-tooltips"
                >
                  <span className="">{title}</span>
                </Balloon.Tooltip>
              )}
              <div className="text-[#999] text-[13px] mt-[4px]">ID：{itemId}</div>
            </div>
          </div>
        </div>
      );
    },
  };
  switch (state) {
    case 'sku':
      return [SKU_INFO, PWS_INFO, isAlert && SUGGEST_INFO].filter(Boolean);
    case 'item':
      return [DATA_TYPE, LENGTH_NAME, WIDTH_NAME, HEIGHT_NAME, WEIGHT_NAME, isAlert && SUGGEST_INFO].filter(Boolean);
    case 'edit-cross-border-materials-sku':
      return [PRODUCT_INFO, SKU_INFO, PWS_INFO, isAlert && SUGGEST_INFO].filter(Boolean);
    case 'edit-cross-border-materials-item':
      return [DATA_TYPE, LENGTH_NAME, WIDTH_NAME, HEIGHT_NAME, WEIGHT_NAME, isAlert && SUGGEST_INFO].filter(Boolean);
    default:
      return [];
  }
};
