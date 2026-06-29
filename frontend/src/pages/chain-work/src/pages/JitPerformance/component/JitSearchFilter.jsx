import React from 'react';
import { Button, Field } from '@alifd/next';
import RenderField from '@alife/1688-chain-renderfield';

export const sellStatusMap = [
  {
    value: '',
    label: '全部',
  },
  {
    value: 'waitsellersend',
    label: '等待卖家发货',
  },
  {
    value: 'waitbuyerreceive',
    label: '等待买家收货',
  },
  {
    value: 'confirm_goods_but_not_fund',
    label: '已收货待到账',
  },
  {
    value: 'success',
    label: '交易成功',
  },
  {
    value: 'cancel',
    label: '交易关闭',
  },
];
export default (props) => {
  const { filters, setParams } = props;
  const field = Field.useField({
    onChange: (name, value) => {
      field?.setValues({
        [name]: value || undefined,
      });
    },
  });

  const { init } = field;
  const handleSubmit = () => {
    setParams(field?.getValues());
  };
  const handleReset = () => {
    field.reset();
    setParams({});
  };
  const renderButtons = () => {
    return (
      <div>
        <Button
          style={{ borderRadius: '6px', width: '62px' }}
          type="primary"
          onClick={handleSubmit}
        >
          筛选
        </Button>
        <Button
          style={{ marginLeft: '12px', borderRadius: '6px', width: '62px' }}
          onClick={handleReset}
          className="rounded-[6px]"
        >
          清空
        </Button>
      </div>
    );
  };
  const renderField = ({
    key,
    type,
    opt,
    values,
    name,
    fetchData,
    cardsData,
  }) => {
    return (
      <div className="flex items-center" key={name}>
        <span className="text-[14px] text-[#3d3d3d] mr-[12px]">{name}</span>
        <RenderField
          fieldKey={key}
          type={type}
          opt={opt}
          values={values}
          name={name}
          fetchData={fetchData}
          fieldInit={init}
          field={field}
          cardsData={cardsData}
        />
      </div>
    );
  };
  return (
    <div className="flex flex-wrap justify-start gap-[20px]">
      {filters?.map((filter) => (
        <div
          key={filter.name}
          className="flex"
        >
          {renderField(filter)}
        </div>
      ))}
      <div className="flex-1 text-right">{renderButtons()}</div>
    </div>
  );
};
