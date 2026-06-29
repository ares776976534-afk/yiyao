import React, { useEffect, useState, useRef } from 'react';
import { speaker } from '@/utlis';
import { Input, Select } from '@alifd/next';
import { connect, getPrintNameList, printTask } from './printServices';
import { getPrintTaskDetail, updatePrintProcess } from './services';

import './index.scss';

const QUEUE_RESULT_STATUS = {
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
  QUEUE: 'QUEUE',
};

const QUEUE_RESULT = {
  [QUEUE_RESULT_STATUS.SUCCESS]: '打印成功',
  [QUEUE_RESULT_STATUS.FAIL]: '打印失败',
  [QUEUE_RESULT_STATUS.QUEUE]: '打印中',
};


function PrintWayBill() {
  const [wayBillId, setWayBillId] = useState('');
  const [queueResult, setQueueResult] = useState('');
  const [printList, setPrintList] = useState([]);
  const [currentPrint, setCurrentPrint] = useState('');
  const [currentWayBillType, setCurrentWayBillType] = useState('shipmentId');
  const [inputDisabled, setInputDisabled] = useState(false);
  const inputRef = useRef(null);

  const autoFocus = () => {
    setTimeout(() => {
      inputFocus();
    }, 3000);
  };

  const inputFocus = () => {
    inputRef.current.focus();
  };

  const printFail = () => {
    setQueueResult(QUEUE_RESULT_STATUS.FAIL);
    setWayBillId('');
    setInputDisabled(false);
    inputFocus();
  };

  const handlePrint = () => {
    setInputDisabled(true);
    setQueueResult(QUEUE_RESULT_STATUS.QUEUE);
    getPrintTaskDetail({
      [currentWayBillType]: wayBillId,
      printName: currentPrint,
    })
      .then(({ success, tasks, taskId }) => {
        if (success && tasks.length > 0) {
          printTask(tasks)
            .then(({ success: successList = [], fail: failList = [] }) => {
              if (failList.length > 0) {
                printFail();
              } else {
                setQueueResult(QUEUE_RESULT_STATUS.SUCCESS);
              }
              setWayBillId('');
              setInputDisabled(false);
              inputFocus();
              let printStatus = '';
              if (successList.length > 0 && failList.length === 0) {
                printStatus = 'success';
              } else if (successList.length === 0 && failList.length > 0) {
                printStatus = 'fail';
              } else {
                printStatus = 'partialSuccess';
              }
              updatePrintProcess({
                printStatus,
                taskId,
              });
            })
            .catch(() => {
              printFail();
            });
        } else {
          printFail();
        }
      })
      .catch(() => {
        printFail();
      });
  };

  const getPrintList = () => {
    getPrintNameList()
      .then((res) => {
        setPrintList(res);
        setCurrentPrint(res[0].value);
      });
  };

  useEffect(() => {
    if (queueResult && QUEUE_RESULT[queueResult]) {
      speaker({
        text: QUEUE_RESULT[queueResult],
      });
    }
  }, [queueResult]);

  useEffect(() => {
    connect()
      .then(() => {
        getPrintList();
      });
  }, []);

  return (
    <div className="print-way-bill">
      <div className="print-way-bill-header">
        <div>
          <a href="https://www.1688.com" target="_blank" rel="noreferrer">
            <img src="https://img.alicdn.com/imgextra/i1/O1CN01dUHefe1TNxqfFY58z_!!6000000002371-55-tps-404-83.svg" className="logo" />
          </a>
        </div>
      </div>
      <div className="input-wrap">
        <Input.Group
          addonBefore={
            <Select size="large" onChange={setCurrentWayBillType} value={currentWayBillType}>
              <Select.Option value="shipmentId">运单号</Select.Option>
              <Select.Option value="noMainPartCode">无主件码</Select.Option>
            </Select>
          }
          addonAfter={
            <Select size="large" placeholder="选择打印机" value={currentPrint} onChange={setCurrentPrint}>
              {
                printList.map((item) => <Select.Option value={item.value}>{item.label}</Select.Option>)
              }
            </Select>
          }
        >
          <Input
            disabled={inputDisabled}
            size="large"
            autoFocus
            onPressEnter={handlePrint}
            value={wayBillId}
            onChange={setWayBillId}
            ref={inputRef}
            onBlur={autoFocus}
          />
        </Input.Group>
      </div>
      <div className="result-wrap">
        <p className={`result-wrap-p ${queueResult}`}>{QUEUE_RESULT[queueResult] || '暂无打印任务'}</p>
      </div>
    </div>
  );
}

PrintWayBill.pageConfig = {
  title: '打印面单',
};

export default PrintWayBill;
