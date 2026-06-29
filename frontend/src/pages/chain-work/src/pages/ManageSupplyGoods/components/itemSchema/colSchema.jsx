import React, { useState } from 'react';
import { Balloon } from '@alifd/next';
import { getFieldRules } from '@/utlis';
import BatchDialog from '../BatchDialog';
import { inputRender } from '../../utlis';
// import BalloonPrompt from '@/pages/Select/components/BalloonPrompt';

export default (field) => {
  const batchSetButton = (title, name) => (
    <div className="text-[#1677ff] cursor-pointer" onClick={() => BatchDialog.open({ title, name, field })}>
      批量设置
    </div>
  );
  const [expandedItem, setExpandedItem] = useState(null);
  // 参考商品规格
  const REFERENCE_GOODS_SPECIFICATION = {
    title: '商品规格',
    dataIndex: 'referenceGoodsSpecification',
    align: 'center',
    width: 400,
    cell: (value, index, record) => {
      const { skuImageUrl, skuName } = record;
      const hasImage = !!skuImageUrl; // 是否有图片
      return (
        <div className="flex">
          {hasImage && <img src={skuImageUrl} alt="img" className="w-[60px] h-[60px] mr-[8px] rounded-[6px]" />}
          <div className="h-[60px]">
            {skuName?.length < 21 ? (
              <span className="w-[296px] text-[14px] text-[#333] text-ellipsis line-clamp-2 text-left"> {skuName}</span>
            ) : (
              <Balloon.Tooltip
                trigger={<div className="w-[296px] text-[14px] text-[#333] text-ellipsis line-clamp-2 text-left">{skuName}</div>}
                align="t"
                popupStyle={{ backgroundColor: '#333' }}
                popupClassName="products-business-tooltips"
              >
                {skuName}
              </Balloon.Tooltip>
            )}
          </div>
        </div>
      );
    },
  };
  // MOQ
  // const MOQ = {
  //   title: (
  //     <>
  //       <div>
  //         MOQ
  //         <BalloonPrompt content="MOQ即最小补货订单量。为了降低后期退供风险，MOQ值不建议过高。" />
  //       </div>
  //       {batchSetButton('MOQ', 'moq')}
  //     </>
  //   ),
  //   dataIndex: 'moq',
  //   align: 'center',
  //   width: 152,
  //   cell: (value, index, record) => {
  //     return inputRender({
  //       dataIndex: `${record.skuId}.moq`,
  //       value,
  //       field,
  //       hasErr: hasMoqErr,
  //       attrs: {
  //         placeholder: '请输入',
  //         innerAfter: '件',
  //       },
  //       rules: [{
  //         validator: (rule, v, callback) => {
  //           const values = field?.getValues();
  //           values[record.skuId].moq = values[record.skuId].moq === undefined ? '' : v;
  //           const checkMoqNotEmpty = (data) => {
  //             return data.some(item => item.moq !== '');
  //           };
  //           if (checkMoqNotEmpty(Object.values(values).filter(Boolean))) {
  //             setHasMoqErr(true);
  //             return callback(!values[record.skuId].moq && '此为必填项');
  //           } else {
  //             setHasMoqErr(false);
  //             return callback();
  //           }
  //         },
  //       }],
  //     });
  //   },
  // };
  // 箱规
  // const BOX_PCS = {
  //   title: (
  //     <>
  //       箱规
  //       {batchSetButton('箱规', 'pcs')}
  //     </>
  //   ),
  //   dataIndex: 'pcs',
  //   align: 'center',
  //   width: 152,
  //   cell: (value, index, record) => {
  //     return (
  //       <div className="flex">
  //         {inputRender({
  //           dataIndex: `${record.skuId}.pcs`,
  //           value,
  //           attrs: {
  //             placeholder: '请输入',
  //             innerAfter: '件/箱',
  //           },
  //           field,
  //           hasErr: hasPcsErr,
  //           precision: 0,
  //           rules: [{
  //             validator: (rule, v, callback) => {
  //               const values = field?.getValues();
  //               values[record.skuId].pcs = values[record.skuId].pcs === undefined ? '' : v;
  //               const checkMoqNotEmpty = (data) => {
  //                 return data.some(item => item.pcs !== '');
  //               };
  //               if (checkMoqNotEmpty(Object.values(values).filter(Boolean))) {
  //                 setHasPcsErr(true);
  //                 return callback(!values[record.skuId].pcs && '此为必填项');
  //               } else {
  //                 setHasPcsErr(false);
  //                 return callback();
  //               }
  //             },
  //           }],
  //         })}
  //       </div>
  //     );
  //   },
  // };
  // 期望价格
  const EXPECTED_PRICE = {
    title: '期望价格',
    dataIndex: 'expectedPrice',
    align: 'center',
    width: 220,
    cell: (value, index, record) => inputRender({
      dataIndex: `${record.skuId}.expectedPrice`,
      value,
      attrs: {
        width: '100%',
        disabled: true,
        innerBefore: <span className="text-[#999] ml-[12px]">¥</span>,
      },
      field,
    }),
  };
  // * 提报价格
  const REPORT_PRICE = {
    title: (
      <>
        <span className="text-[#FF4000] mr-[4px]">*</span>提报价格
        {batchSetButton('提报价格', 'signUpPrice')}
      </>
    ),
    dataIndex: 'signUpPrice',
    align: 'center',
    width: 300,
    cell: (v, index, record) => {
      return (
        <div className="text-left">
          {inputRender({
            dataIndex: `${record.skuId}.signUpPrice`,
            value: v,
            attrs: {
              width: '100%',
              innerBefore: <span className="text-[#999] ml-[12px]">¥</span>,
            },
            rules: getFieldRules([
              'required',
              {
                validator: (rule, value, callback) => {
                  const _value = parseFloat(record?.expectedPrice);
                  // 根据参数决定是否要【禁止改高价格】
                  if (_value < value) {
                    setExpandedItem(-1);
                    return callback(`需低于限制价￥${_value}`);
                  }
                  return callback();
                },
                trigger: 'onChange',
              },
              {
                validator: (rule, value, callback) => {
                  const _expectedPrice = parseFloat(record?.expectedPrice) / 2;
                  const _value = parseFloat(value);
                  // 根据参数决定是否要【禁止改高价格】
                  if (_value < _expectedPrice) {
                    setExpandedItem(index);
                    return callback();
                  }
                  setExpandedItem(-1);
                  return callback();
                },
                trigger: 'onChange',
              },
            ]),
            field,
          })}
          {expandedItem === index && (
            <div className="text-[#FF8B00] text-[12px] text-left mt-[8px]">价格过低，请谨慎填写价格</div>
          )}
          {record?.lastSignUpPrice > 0 && (
            <div className="text-[#FF8B00] text-[12px] text-left mt-[8px]">上次提报价格 {record?.lastSignUpPrice}元</div>
          )}
        </div>
      );
    },
  };
  // * 库存
  const INVENTORY = {
    title: (
      <>
        <span className="text-[#FF4000] mr-[4px]">*</span>库存
        {batchSetButton('库存', 'stock')}
      </>
    ),
    dataIndex: 'stock',
    align: 'center',
    width: 240,
    cell: (v, index, record) => (
      <div className="text-left">
        {inputRender({
          dataIndex: `${record.skuId}.stock`,
          value: v,
          attrs: {
            width: '100%',
          },
          rules: getFieldRules([
            'required',
            {
              validator: (rule, value, callback) => {
                const _value = parseFloat(value);
                if (_value < 50) {
                  return callback('托管库存需≥50');
                }
                return callback();
              },
              trigger: 'onChange',
            },
          ]),
          field,
        })}
      </div>
    ),
  };
  return [REFERENCE_GOODS_SPECIFICATION, EXPECTED_PRICE, REPORT_PRICE, INVENTORY];
};
