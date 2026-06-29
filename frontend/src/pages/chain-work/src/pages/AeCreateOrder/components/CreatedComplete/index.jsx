import React, { useRef } from 'react';
import { Button, Message } from '@alifd/next';
import { IconSuccess, IconFail, IconCopy } from '@/components/Icons';
import Clipboard from '@/components/ClipBoard';
import PartLayout from '../PartLayout';
import PrintPreviewDialog from '../../../AeOrder/components/PrintPreviewDialog';
import List from '../ResultList';
import './index.scss';
import { print } from '../../api';

export default (props) => {
  const { mode, createdStatus, result } = props;
  const printDialog = useRef(null);

  const batchText = (() => {
    if (mode === 'batch') {
      return '批量';
    }

    if (mode === 'merge') {
      return '合并';
    }

    return '';
  })();

  const isSuccess = (() => {
    return !!Object.keys(result).find((d) => {
      return `${result[d].success}` === 'true';
    });
  })();

  const printWayBill = (pickupOrderNumber) => {
    printDialog.current.onOpen({
      type: 'printWayBillCreate',
      pickupOrderNumber,
    });
  };

  const pickUpOrderNo = result.find((d) => d.success)?.pickUpOrderNo;

  return (
    <div className="created-complete-container">
      <div className="complete-notice-container">
        <div className="complete-notice-title">
          <div className={`complete-icon ${isSuccess ? 'success' : 'fail'}`} style={{ width: 24, height: 24 }}>
            {isSuccess ? <IconSuccess fill="#25BE13" /> : <IconFail />}
          </div>
          <div className="result-info">{isSuccess ? `揽收单${batchText}创建成功` : `揽收单${batchText}创建失败`}</div>
          <a href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/dQPGYqjpJYg0vYGGcl6ap4BDWakx1Z5N" target="_blank" rel="noreferrer">操作指引</a>
        </div>
        {['batch', 'merge'].includes(mode) ? (
          <div className="batch-result-container">
            <div className="batch-result-item">
              <span>创建成功：</span>{result.filter((d) => d.success).length}单，您可在当前页面批量打印揽收单。
            </div>
            <div className="batch-result-item">
              <span>创建失败：</span>{result.filter((d) => !d.success).length}单，当前发货地址不可上门揽，您可以更换发货地址重新创建揽收单，或者申请关单，速卖通将会自动发起仅退款申请。
            </div>
          </div>
        ) : (
          <div className="complete-notice-prompt">
            {isSuccess
              ? '您可在当前页面打印揽收单。'
              : '创建失败，无法上门揽收。您可以发起关单，速卖通将会自动发起仅退款申请。'}
          </div>
        )}
      </div>
      <div className="complete-list">
        <PartLayout
          title={(
            <p>
              <span style={{ fontSize: 16, color: '#333', fontWeight: 'bold' }}>揽收单创建记录</span>
              {
                mode === 'merge' && pickUpOrderNo && (
                  <Clipboard text={pickUpOrderNo}>
                    <span style={{ paddingLeft: 12, display: 'inline-flex', alignItems: 'center' }}><b>揽收单号：</b><span style={{ paddingRight: 10 }}>{pickUpOrderNo}</span><IconCopy /></span>
                  </Clipboard>
                )
              }
            </p>
          )}
          subTitle={(() => {
            if (mode === 'merge') {
              return (
                <Button
                  type="primary"
                  disabled={!pickUpOrderNo}
                  onClick={() => {
                    printWayBill(pickUpOrderNo);
                  }}
                >打印揽收单
                </Button>
              );
            }
            return mode === 'batch' && (
              <Button
                type="primary"
                disabled={!isSuccess}
                onClick={() => {
                  const wayBillList = result
                    .filter((item) => !!item?.pickUpOrderNo)
                    .map((item) => item.pickUpOrderNo);

                  if (wayBillList.length) {
                    printWayBill(wayBillList.join(','));
                  } else {
                    Message.warning('当前所有订单都不可打印揽收单');
                  }
                }}
              >批量打印揽收单
              </Button>
            );
          })()}
        >
          <List createdStatus={createdStatus} list={result} printWayBill={printWayBill} />
        </PartLayout>
      </div>
      <PrintPreviewDialog ref={printDialog} />
    </div>
  );
};
