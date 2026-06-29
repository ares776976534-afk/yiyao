/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@alifd/next';
import Button from '@/components/UI/Button';
import InfoTable from '../InfoTable';
import { CANCEL_MERGE, ITEM_STATUS_OVER, STATUS_WAITING, PRINT_LABEL } from '@/pages/PWC/constants';
import PrintPreviewDialog from '@/components/PrintPreviewDialog';

import sendTableSchema from '../schema/sendTable';
import previewTableSchema from '../schema/previewTable';
import previewResultTableSchema from '../schema/previewResultTable';

export default ({ tableData = [], onChange = () => { }, preview = false }) => {
  // const [tableData, setTableData] = useState([]);
  const [selectKeys, setSelectKeys] = useState([]);
  const [disableMergeBtn, setDisableMergeBtn] = useState(true);
  const printDialog = useRef(null);
  const [isAllOver, setIsAllOver] = useState(false);

  const setTableDataByIndex = (index, data) => {
    const resetTableData = [...tableData];
    resetTableData[index] = data;
    onChange(resetTableData);
  };

  const setSelectKeysByIndex = (index, data) => {
    const resetSelectKeys = [...selectKeys];
    resetSelectKeys[index] = data;
    setSelectKeys(resetSelectKeys);
  };

  // hack 全选逻辑
  const handleSelect = (tableIndex, isSelect, val) => {
    let _selectData = tableData[tableIndex];
    const _selectKeys = selectKeys[tableIndex] || [];
    if (val.id === -1 && isSelect) {
      _selectData = _selectData.map((item) => item.id);
    } else if (val.id === -1 && !isSelect) {
      _selectData = [];
    } else {
      const index = _selectKeys.indexOf(val.id);
      if (isSelect) {
        if (index === -1) {
          _selectData = [..._selectKeys, val.id];
        }
      } else {
        _selectData = _selectKeys.filter((item) => item !== val.id);
      }
    }
    selectKeys[tableIndex] = _selectData;
    setSelectKeys([...selectKeys]);
    const allEmpty = selectKeys.every((item = []) => item.length === 0);
    const oneSelected = selectKeys.filter((item = []) => item.length !== 0).length === 1;
    const isDisableMergeBtn = !oneSelected || allEmpty;
    setDisableMergeBtn(isDisableMergeBtn);
  };

  const handlePreMerge = () => {
    const tableIndex = selectKeys.findIndex((item = []) => item.length > 0);
    handleMerge(tableIndex, selectKeys[tableIndex]);
  };

  // 批量合并
  const handleMerge = (tableIndex, targets = []) => {
    const newData = [...tableData[tableIndex]];
    const _targets = targets.filter((item) => item !== -1);
    const target = newData.find((item) => item.id === _targets[0]);
    const targetIndex = newData.findIndex((item) => item.id === _targets[0]);
    const { ...otherData } = target;
    const mergeData = {
      ...otherData,
      dataList: [],
      id: target.id,
    };

    _targets.forEach((targetId) => {
      const _target = newData.find((item) => item.id === targetId);
      const _targetIndex = newData.findIndex((item) => item.id === targetId);
      mergeData.dataList.push(..._target.dataList);
      newData.splice(_targetIndex, 1);
    });

    newData.splice(targetIndex, 0, mergeData);
    setTableDataByIndex(tableIndex, newData);
    setSelectKeysByIndex(tableIndex, []);
  };

  // 取消合并
  const handleCancelMerge = (tableIndex, { index }) => {
    const newData = [...tableData[tableIndex]];
    const target = newData[index];
    const { dataList = [], ...otherData } = target;
    const splitData = [];

    dataList.forEach((item) => {
      splitData.push({
        ...otherData,
        dataList: [item],
        id: item.barCode,
      });
    });

    newData.splice(index, 1, ...splitData);
    setTableDataByIndex(tableIndex, newData);
    setSelectKeysByIndex(tableIndex, []);
  };

  // 打印条码
  const handlePrint = (data) => {
    const printData = {
      preview: true,
      barcodePrintList: JSON.stringify(data.map((item) => ({
        skuName: item.skuName?.join(','),
        itemName: item.itemName,
        barcode: item.barCode,
      }))),
    };
    printDialog.current.onOpen({
      serviceMap_name: 'label_pws',
      type: 'printPwsLabel',
      params: {
        ...printData,
        printTemplateSize: '60_30',
      },
    });
  };

  // 批量打印条码
  const handleBatchPrint = () => {
    const _data = [];
    tableData.forEach((_table) => {
      _table.forEach((_item) => {
        if (_item.type === 'sku') {
          _item.dataList.forEach((_sku) => {
            const exxistIndex = _data.findIndex((current) => current.barCode === _item.id);
            if (exxistIndex === -1) {
              // eslint-disable-next-line no-param-reassign
              _sku.skuName = [_sku.skuName?.join(';')];
              _data.push(_sku);
            } else {
              _data[exxistIndex].skuName.push(_sku.skuName?.join(';'));
            }
          });
        }
      });
    });

    handlePrint(_data);
  };

  const handleCellAction = (tableIndex, type, cellData) => {
    switch (type) {
      case CANCEL_MERGE:
        handleCancelMerge(tableIndex, cellData);
        break;
      case PRINT_LABEL:
        handlePrint(cellData?.record?.dataList || []);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setSelectKeys(Array(tableData.length).fill([]));
  }, []);

  useEffect(() => {
    const _isAllOver = tableData.some((_table) => {
      const _data = _table[0] || {};
      const { measureStatus } = _data;
      return measureStatus === ITEM_STATUS_OVER;
    });

    setIsAllOver(_isAllOver);
  }, [tableData]);

  return (
    <div>
      {
        preview ? null : (
          <div className="mb-[16px]">
            <Message title={null} type="notice" size="large" shape="inline" style={{ backgroundColor: '#E6F2FF' }} >
              如果同一个商品下有多个SKU的长宽高重量完全一致，您可以勾选这些SKU，再点击合并生成样品条码，只寄出1个样品来进行认证
            </Message>
          </div>
        )
      }
      <div className="mb-[12px] flex flex-row justify-between">
        <div>
          {preview ? null : <Button onClick={handlePreMerge} disabled={disableMergeBtn} type="normal:primary-ghost">合并生成样品条码</Button>}
        </div>
        <div>
          {!isAllOver ? <Button onClick={handleBatchPrint}>打印全部条码</Button> : null}
        </div>
      </div>
      {
        tableData.map((_table, index) => {
          const selectKey = selectKeys[index];
          const _data = _table[0] || {};
          const { status, measureStatus } = _data;
          let schema = previewTableSchema;

          if (status === STATUS_WAITING) {
            schema = sendTableSchema;
          }

          if (measureStatus === ITEM_STATUS_OVER) {
            schema = previewResultTableSchema;
          }

          return (
            <>
              <InfoTable
                data={_table}
                primaryKey="id"
                column={schema}
                rowSelection={preview ? null : {
                  // onChange: handleSelectChange,
                  selectedRowKeys: selectKey,
                  onSelect: (isSelect, val) => handleSelect(index, isSelect, val),
                }}
                onCellAction={(type, cellData) => handleCellAction(index, type, cellData)}
              />
              <PrintPreviewDialog ref={printDialog} />
            </>

          );
        })
      }
    </div>
  );
};
