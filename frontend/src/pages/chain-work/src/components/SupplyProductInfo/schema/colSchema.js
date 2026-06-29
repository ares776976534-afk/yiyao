import React from 'react';
import { Button, Balloon, Switch, Input } from '@alifd/next';
import { getFieldRules } from '@/utlis';
import PriceSettingDialog from '../components/PriceSettingDialog';
import '../index.scss';

export default (field, tableType = '1', invControlGray, deliveryCost, getParam, isQuantityDisabled) => {
  const inputRender = ({ value, dataIndex, disabled = false, attrs = {}, rules = [], isShow = true }) => {
    const err = field.getError(dataIndex);
    let _value = String(value); // 处理value为0的情况
    if (!isShow) {
      return ' -- ';
    }
    if (!value && value !== 0) {
      _value = null;
    }
    return (
      <div className={'goods-cell relative'}>
        <Input
          style={{ width: '120px' }}
          disabled={disabled}
          {...field.init(dataIndex, {
            initValue: _value || '',
            rules,
          })}
          {...attrs}
          className="goods-input"
        />
        {err && (
          <div style={{ color: 'red' }} className="absolute top-[33px] text-[12px]">
            {err}
          </div>
        )}
      </div>
    );
  };
  const ITEM_INFO = {
    title: '参考商品规格',
    width: '272px',
    cell: (value, index, item) => {
      if (!item?.oppSkuId) return ' -- ';
      const hasImage = !!item?.['oppSkuPic']; // 是否有图片
      const imgUrl = 'https://img.alicdn.com/imgextra/' + item?.['oppSkuPic'];
      return (
        <div className="col-itemInfo" style={{ minHeight: '64px', height: '60px' }}>
          <div className="flex">
            {hasImage && (
              <a
                // href={`https://detail.1688.com/offer/${item?.oppSkuId}.html`}
                target="_blank"
                rel="noreferrer"
              >
                <div className="products-card-top-left">
                  <img src={imgUrl} alt="imgUrl" className="w-[60px] h-[68px] rounded-[6px]" />
                </div>
              </a>
            )}
            <div className="ml-[12px]">
              <div style={{ display: 'flex' }}>
                {item?.['oppSkuName']?.length < 21 ? (
                  <div className="w-[163px]">
                    <span className="products-card-text !text-[14px]">{item?.['oppSkuName']}</span>
                  </div>
                ) : (
                  <Balloon.Tooltip
                    trigger={
                      <div className="w-[163px]">
                        <span className="products-card-text !text-[14px]">
                          {' '}
                          {`${item?.['oppSkuName']?.slice(0, 21)}...`}
                        </span>
                      </div>
                    }
                    align="t"
                    popupStyle={{ backgroundColor: '#333', '--balloon-tooltip-color-bg': '#333' }}
                  >
                    {item?.['oppSkuName']}
                  </Balloon.Tooltip>
                )}
              </div>
            </div>
            <span className="hidden">
              {inputRender({
                value: item?.oppSkuId,
                dataIndex: `${item.recordId}.oppSkuId`,
              })}
              {inputRender({
                value: item?.oppSkuPic,
                dataIndex: `${item.recordId}.oppSkuPic`,
              })}
              {inputRender({
                value: item?.oppSkuName,
                dataIndex: `${item.recordId}.oppSkuName`,
              })}
            </span>
          </div>
        </div>
      );
    },
  };
  const SKU_SIGNUP = {
    title: '报名规格',
    width: '272px',
    cell: (v, index, _item, { onActionClick }) => {
      const item = _item.baseSkuInfo;
      const isFirst = getParam('supplyProductId').length === 0;
      // const type = String(!!item.hasSignup);
      const type = item.hasSignup === true ? 'true' : 'false';

      const tagMap = {
        true: { label: '供货中', color: 'text-[#666]', bg: 'bg-[#F2F2F2]' },
        false: { label: '未提报', color: 'text-[#0077ff]', bg: 'bg-[#E6F2FF]' },
      };
      const hasImage = !!item?.['skuPic']; // 是否有图片
      const handleClick = () => {
        onActionClick({
          type: 'changeSku',
          data: _item,
        });
      };
      // if (Object.keys(item).length === 0) return ' -- ';
      return (
        <div className="col-itemInfo" style={{ height: '68px' }}>
          <div className="flex">
            {hasImage && (
              <a
                // href={`https://detail.1688.com/offer/${item?.skuId}.html`}
                target="_blank"
                rel="noreferrer"
                className="mr-[12px]"
              >
                <img src={item?.['skuPic']} alt="imgUrl" className="w-[60px] h-[60px] rounded-[6px]" />
              </a>
            )}
            <div className="relative flex flex-col gap-[2px]">
              {!item.skuId || String(item?.['skuName'])?.length < 21 ? (
                <div className="w-[163px]">
                  <span className="products-card-text !text-[14px]">{item?.['skuName'] || ' -- '}</span>
                </div>
              ) : (
                <Balloon.Tooltip
                  trigger={
                    <div className="w-[163px]">
                      <span className="products-card-text !text-[14px]">
                        {' '}
                        {`${String(item?.['skuName'])?.slice(0, 21)}...`}
                      </span>
                    </div>
                  }
                  align="t"
                  popupStyle={{ backgroundColor: '#333', '--balloon-tooltip-color-bg': '#333' }}
                >
                  {item?.['skuName']}
                </Balloon.Tooltip>
              )}
              {_item.oppSkuId && !getParam('supplyProductId') && (
                <Button type="primary" text className="text-left" onClick={handleClick}>
                  更换
                </Button>
              )}
              {item?.skuId && String(item.canSignup) === 'false' && (
                <div style={{ color: 'red' }} className="text-[12px]">
                  {item.errorMsg ? item.errorMsg : '规格名称存在风险，请更换'}
                </div>
              )}
              {!isFirst && (
                <div className="mt-[2px]">
                  <span className={`p-[1px_4px] h-[16px] rounded-[10px] ${tagMap[type].bg}`}>
                    <span className={`text-[12px] ${tagMap[type].color} h-[14px] leading-[14px]`}>
                      {tagMap[type].label}
                    </span>
                  </span>
                </div>
              )}
              <span className="hidden">
                {inputRender({
                  value: item?.skuId,
                  dataIndex: `${_item.recordId}.skuId`,
                  rules: getFieldRules([
                    {
                      validator: (rule, value, callback) => {
                        if (item.skuId && String(item.canSignup) === 'false') {
                          const msg = item.errorMsg ? item.errorMsg : '规格名称存在风险，请更换';
                          return callback(msg);
                        }
                        return callback();
                      },
                    },
                  ]),
                })}
              </span>
              {/* 修改提报时，需要在fieldData里塞入cSkuId */}
              {item?.cSkuId && (
                <span className="hidden">
                  {inputRender({
                    value: item?.cSkuId,
                    dataIndex: `${_item.recordId}.cSkuId`,
                  })}
                </span>
              )}
              {
                <span className="hidden">
                  {inputRender({
                    value: item?.skuName,
                    dataIndex: `${_item.recordId}.skuName`,
                  })}
                  {inputRender({
                    value: item?.referenceSupplyPrice,
                    dataIndex: `${_item.recordId}.referenceSupplyPrice`,
                  })}
                  {inputRender({
                    value: item?.hasSignup,
                    dataIndex: `${_item.recordId}.hasSignup`,
                  })}
                  {inputRender({
                    value: item?.canSignup,
                    dataIndex: `${_item.recordId}.canSignup`,
                  })}
                  {inputRender({
                    value: item?.skuPic,
                    dataIndex: `${_item.recordId}.skuPic`,
                  })}
                </span>
              }
            </div>
          </div>
        </div>
      );
    },
  };
  const GOODS_ADVICE_PRICE = {
    title: '建议供货价',
    align: 'left',
    width: '163px',
    dataIndex: 'referenceSupplyPrice',
    cell: (value, index, record) => {
      const item = record.baseSkuInfo;
      const price = item?.referenceSupplyPrice;
      const displayPrice = price === null || price === undefined ? '--' : `¥${price}`;
      const hasSignup = item.hasSignup !== false; // 未提报商品加入【原品库存】
      return (
        <div style={{ minHeight: '64px', color: '#333', paddingTop: '5px' }} className="h-[68px]">
          {displayPrice}
          {!hasSignup && (
            <span className="hidden">
              {inputRender({
                value: record.baseSkuInfo.marketOnSaleQuantity,
                dataIndex: `${record?.recordId}.quantity`,
              })}
            </span>
          )}
        </div>
      );
    },
  };

  const GOODS_PRICE = {
    title: (
      <>
        <span className="text-[#FF4000] mr-[4px]">*</span>供货价
        <div
          className="text-[#1677ff] cursor-pointer pl-[10px]"
          onClick={() => {
            PriceSettingDialog.open({ field, name: 'supplyPrice', title: '价格' });
          }}
        >
          批量设置
        </div>
      </>
    ),
    align: 'left',
    width: '163px',
    dataIndex: 'supplyPrice',
    cell: (v, index, record, { onActionClick }) => {
      const price =
        parseFloat(record.baseSkuInfo.supplyPrice) || parseFloat(record.baseSkuInfo.referenceSupplyPrice) || null;
      const _price = price ? price.toFixed(2) : price;
      return (
        <div className="h-[68px]">
          {inputRender({
            isShow: !!record.baseSkuInfo.skuId,
            value: _price,
            dataIndex: `${record.recordId}.supplyPrice`,
            attrs: {
              innerBefore: '¥',
              placeholder: String(record.baseSkuInfo.referenceSupplyPrice || ''),
            },
            rules: getFieldRules([
              'required',
              'round_two',
              {
                validator: (rule, value, callback) => {
                  const referenceSupplyPrice = record.baseSkuInfo.referenceSupplyPrice;
                  const _value = parseFloat(value);
                  // 根据参数决定是否要【禁止改高价格】
                  const noHigher = getParam('noHigherPrice').toString() === 'true';
                  const lastPrice = noHigher ? record.baseSkuInfo.supplyPrice : referenceSupplyPrice;
                  const thresholdPrice = Math.min(referenceSupplyPrice, lastPrice);
                  if (thresholdPrice !== null && _value > thresholdPrice) {
                    return callback(`需低于限制价￥${thresholdPrice}`);
                  }
                  return callback();
                },
                trigger: 'onChange',
              },
            ]),
          })}
        </div>
      );
    },
  };

  const GOODS_SUPPLY_QUANTITY = {
    title: (
      <>
        <span className="text-[#FF4000] mr-[4px]">*</span>供货库存
        <div
          className={`${
            isQuantityDisabled && invControlGray ? 'cursor-not-allowed text-gray-400' : 'cursor-pointer text-[#1677ff]'
          } pl-[10px]`}
          onClick={() => {
            if (!isQuantityDisabled || !invControlGray) {
              PriceSettingDialog.open({ field, name: 'quantity', title: '库存' });
            }
          }}
        >
          批量设置
        </div>
      </>
    ),
    align: 'left',
    width: '200px',
    dataIndex: 'quantity',
    cell: (v, index, record) => {
      const checkboxDataIndex = `${record.recordId}.invControlSku`;
      const dealRule = (arr) => {
        if (isQuantityDisabled && invControlGray) {
          return [];
        } else {
          return arr;
        }
      };
      const marketOnSaleQuantity = record.baseSkuInfo?.marketOnSaleQuantity
        ? String(record.baseSkuInfo?.marketOnSaleQuantity)
        : null;
      return (
        <div className="h-[68px]">
          {inputRender({
            isShow: !!record.baseSkuInfo.skuId,
            value: marketOnSaleQuantity,
            dataIndex: `${record.recordId}.quantity`,
            attrs: {
              placeholder: marketOnSaleQuantity,
            },
            disabled: isQuantityDisabled && invControlGray,
            rules: dealRule(
              getFieldRules([
                {
                  validator: (rule, value, callback) => {
                    setTimeout(() => {
                      if (field.getValue(checkboxDataIndex)) {
                        return callback();
                      }
                      if (!value || String(value).trim() === '') {
                        return callback('此为必填项');
                      }
                      const _value = parseFloat(value);
                      const thresholdQuantity = 299;
                      if (_value < thresholdQuantity + 1) {
                        return callback(`库存需大于${thresholdQuantity}件`);
                      }
                      const pattern = /^[1-9]\d*$/;
                      if (!pattern.test(String(_value))) {
                        return callback('请输入大于0的整数');
                      }

                      return callback();
                    }, 1);
                  },
                  trigger: ['onBlur', 'onChange', 'onFocus'],
                },
              ]),
            ),
          })}
          {isQuantityDisabled && invControlGray && (
            <div className="text-[#999] text-[12px] mt-[8px]">店铺ERP库存同步</div>
          )}
          {
            <span className="hidden">
              {inputRender({
                value: marketOnSaleQuantity,
                dataIndex: `${record.recordId}.marketOnSaleQuantity`,
              })}
            </span>
          }
          {invControlGray && (
            <span className="hidden">
              <Switch
                {...field.init(`${record?.recordId}.invControlSku`, {
                  initValue: true,
                })}
              />
            </span>
          )}
        </div>
      );
    },
  };

  const GOODS_PCS = {
    title: (
      <>
        箱规
        <div
          className="text-[#1677ff] cursor-pointer"
          onClick={() => {
            PriceSettingDialog.open({ field, name: 'pcs', title: '箱规' });
          }}
        >
          批量设置
        </div>
      </>
    ),
    align: 'left',
    width: '150px',
    dataIndex: 'pcs',
    cell: (value, index, record) => (
      <div className="h-[68px]">
        {inputRender({
          isShow: !!record.baseSkuInfo.skuId,
          value: record.baseSkuInfo.pcs,
          dataIndex: `${record.recordId}.pcs`,
          // attrs: { style: { width: '120px' } },
          rules: getFieldRules(['integer']),
        })}
      </div>
    ),
  };
  const GOODS_MOQ = {
    title: (
      <>
        MOQ
        <div
          className="text-[#1677ff] cursor-pointer"
          onClick={() => {
            PriceSettingDialog.open({ field, name: 'moq', title: 'MOQ' });
          }}
        >
          批量设置
        </div>
      </>
    ),
    align: 'left',
    width: '150px',
    dataIndex: 'moq',
    cell: (value, index, record) => (
      <div className="h-[68px]">
        {inputRender({
          isShow: !!record.baseSkuInfo.skuId,
          value: record.baseSkuInfo.moq,
          dataIndex: `${record.recordId}.moq`,
          // attrs: { style: { width: '120px' } },
          rules: getFieldRules(['integer']),
        })}
      </div>
    ),
  };
  const GOODS_CODE = {
    title: (
      <>
        商品条码
        <div
          className="text-[#1677ff] cursor-pointer"
          onClick={() => {
            PriceSettingDialog.open({ field, name: 'barcode', title: '条码' });
          }}
        >
          批量设置
        </div>
      </>
    ),
    align: 'left',
    width: '163px',
    dataIndex: 'barcode',
    cell: (value, index, record) => (
      <div className="h-[68px]">
        {inputRender({
          isShow: !!record.baseSkuInfo.skuId,
          value: record.baseSkuInfo.barcode,
          dataIndex: `${record.recordId}.barcode`,
        })}
      </div>
    ),
  };
  const GOODS_PRICE_ALL = {
    title: '包邮供货价',
    align: 'center',
    width: '252px',
    dataIndex: 'price_all',
    lock: 'right',
    cell: (value, index, record) => {
      const basePrice = Number(field.getValue(`${record.recordId}.supplyPrice`)).toFixed(2);
      const isNull = basePrice === '0.00';
      // const deliveryCost = 60;
      const allPrice = parseFloat(Number(basePrice) + Number(deliveryCost.current)).toFixed(2);
      return !isNull && record.baseSkuInfo.skuId ? (
        <div style={{ minHeight: '64px' }} className="h-[68px]">
          <div className="flex flex-wrap items-center text-[14px] justify-end">
            ¥{basePrice} +
            <span className="mx-[4px] flex bg-[#F8F8F8] border-[1px] border-[#DDD] rounded-[6px] px-[12px] h-[32px] leading-[32px]">
              运费{deliveryCost.current}元
            </span>
            <span className="text-[#666] pr-[4px]">=</span>
            <span className="text-[#333] font-[500]">¥{allPrice}</span>
            {/* <span className="hidden">
            {inputRender({
              value: allPrice,
              dataIndex: `${record.recordId}.price_all`,
            })}
          </span> */}
          </div>
        </div>
      ) : (
        <div>--</div>
      );
    },
  };
  return (type) => {
    switch (tableType) {
      case '1':
        return [
          ITEM_INFO,
          SKU_SIGNUP,
          GOODS_PRICE,
          GOODS_SUPPLY_QUANTITY,
          GOODS_MOQ,
          GOODS_PCS,
          GOODS_CODE,
          GOODS_PRICE_ALL,
        ];
      case '2':
        return [SKU_SIGNUP, GOODS_PRICE, GOODS_SUPPLY_QUANTITY, GOODS_MOQ, GOODS_PCS, GOODS_CODE, GOODS_PRICE_ALL];
      case '3':
        return [
          ITEM_INFO,
          SKU_SIGNUP,
          GOODS_ADVICE_PRICE,
          GOODS_PRICE,
          // GOODS_SUPPLY_QUANTITY,
          GOODS_MOQ,
          GOODS_PCS,
          GOODS_CODE,
          GOODS_PRICE_ALL,
        ];
      case '4':
        return [
          SKU_SIGNUP,
          GOODS_ADVICE_PRICE,
          GOODS_PRICE,
          // GOODS_SUPPLY_QUANTITY,
          GOODS_MOQ,
          GOODS_PCS,
          GOODS_CODE,
          GOODS_PRICE_ALL,
        ];
    }
  };
};
