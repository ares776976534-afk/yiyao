import React from 'react';
import { Button, Field, Divider } from '@alifd/next';
import RenderField from '@alife/1688-chain-renderfield';
import BalloonPrompt from '@/pages/Select/components/BalloonPrompt';

export default (props) => {
  const { filters, hanldeSetParams, activeTab, tabItem, onTabFilter = () => {} } = props;
  const field = Field.useField({
    onChange: (name, value) => {
      field?.setValues({
        [name]: value || undefined,
      });
    },
  });
  const { init } = field;
  const handleSubmit = () => {
    hanldeSetParams(field?.getValues());
  };
  const handleReset = () => {
    field.reset();
    hanldeSetParams({});
  };
  const renderButtons = () => {
    return (
      <div>
        <Button
          style={{ borderRadius: '6px', width: '62px' }}
          type="primary"
          onClick={handleSubmit}
        >
          搜索
        </Button>
        <Button
          style={{ marginLeft: '12px', borderRadius: '6px', width: '62px' }}
          onClick={handleReset}
          className="rounded-[6px]"
        >
          重置
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
        {name && <span className="text-[14px] text-[#3d3d3d] mr-[12px]">{name}</span>}
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
    <div className="bg-[#fff] py-[18px] px-[20px]" style={{ borderRadius: '0 0 6px 6px', boxShadow: '0px 1px 6px 0px rgba(0, 0, 0, 0.05)' }}>
      <div className="flex items-center mb-[20px] h-[20px]">
        {tabItem?.map((ele, index) => {
          return (
            <div key={ele?.key} >
              <span
                className={`text-[14px] leading-[17px] cursor-pointer ${activeTab === ele.key ? 'text-[#0077FF] font-medium' : 'text-[#666]'}`}
                onClick={() => {
                  onTabFilter(ele?.key);
                  handleReset();
                }}
              >
                {ele.title}
              </span>
              {ele?.tip && <BalloonPrompt content={ele?.tip} />}
              {index !== tabItem.length - 1 && <Divider direction="ver" className="h-[16px] mx-[16px]" />}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-start gap-[20px]">
        {filters?.map((filter) => (
          <div
            key={filter?.name}
            className="flex"
          >
            {renderField(filter)}
          </div>
        ))}
        <div className="flex-1 text-right">{renderButtons()}</div>
      </div>
    </div>
  );
};
