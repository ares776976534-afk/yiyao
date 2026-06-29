import React, { useState } from 'react';
import { Select, Input, Icon, CascaderSelect, Button } from '@alifd/next';
import './index.scss';

const { Option } = Select;

const TableSearch = (props) => {
  const [inputValue, setInputValue] = useState();
  // const [selectValue, setSelectValue] = useState('901094');
  const { searchOnChange } = props;

  // const selectOnChange = function (_value) {
  //   props.setSelectValueCon('');
  //   setTimeout(() => {
  //     setSelectValue(_value);
  //     searchOnChange({
  //       itemId: inputValue,
  //       selectValue: _value,
  //     });
  //   }, 0);
  // };
  function isNumeric(str) {
    return /^\d+$/.test(str);
  }
  const InputOnChange = (value) => {
    if (isNumeric(value) || value.length === 0) {
      setInputValue(value);
    }
  };

  const InputOnclick = () => {
    searchOnChange({
      itemId: inputValue,
      selectValue: props?.filterParams?.selectValue || 0,
    });
  };
  return (
    <>
      {/* <Select
        id="basic-demo"
        onChange={selectOnChange}
        value={props.selectValueCon || selectValue}
        defaultValue="777570"
        style={{ marginRight: '20px', width: '200px' }}
      >
        <Option value="777570">全部商品</Option>
        <Option value="901095">全球严选未达标</Option>
        <Option value="901094">全球严选可入驻</Option>
        <Option value="0">全球严选已入驻</Option>
      </Select> */}
      <span className="text-[#333] mr-[12px] text-[14px]">商品ID</span>
      <Input
        // innerAfter={
        //   <Icon
        //     type="search"
        //     onClick={InputOnclick}
        //     style={{ marginRight: '12px' }}
        //   />
        //         }
        value={inputValue}
        placeholder="商品ID"
        aria-label="input with config of innerAfter"
        onChange={InputOnChange}
        style={{ borderRadius: '6px', width: '240px' }}
      />
      <Button type="primary" onClick={InputOnclick} style={{ marginLeft: '20px', marginRight: '12px' }}>搜索</Button>
      <Button
        onClick={() => {
          setInputValue('');
          searchOnChange({ itemId: '', selectValue: props?.filterParams?.selectValue || 0 });
        }}
      >
        重置
      </Button>
    </>
  );
};


export default TableSearch;
