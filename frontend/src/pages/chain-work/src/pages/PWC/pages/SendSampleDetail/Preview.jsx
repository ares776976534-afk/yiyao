import React, { useState, useEffect, useRef } from 'react';
import Block from './components/Block';
import SendInfoTable from './components/SendInfoTable';
import HandlingMethod from './components/HandlingMethod';
import LogicInfo from './components/LogicInfo';

export default ({ itemInfos = [], dealType = {}, sendInfo = {} }) => {
  const [tableData, setTableData] = useState([]);
  const handlingMethodField = useRef(null);
  const logicInfoField = useRef(null);

  const setHandlingMethodField = (field) => {
    handlingMethodField.current = field;
  };

  const setLogicInfoField = (field) => {
    logicInfoField.current = field;
  };

  const handleSetValues = () => {
    handlingMethodField.current.setValues(dealType);
    logicInfoField.current.setValues(sendInfo);
  };

  useEffect(() => {
    setTableData(itemInfos);
  }, [itemInfos]);

  useEffect(() => {
    handleSetValues();
  }, [dealType, sendInfo]);

  return (
    <div className="pb-[56px]">
      <Block
        title="样品信息"
      >
        <SendInfoTable tableData={tableData} preview />
      </Block>
      <Block
        title="样品处理方式"
      >
        <HandlingMethod getFieldInstance={setHandlingMethodField} preview />
      </Block>
      <Block
        title="寄样物流信息"
      >
        <LogicInfo getFieldInstance={setLogicInfoField} preview />
      </Block>
    </div>
  );
};
