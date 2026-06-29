import React from 'react';
import { Button, Checkbox } from '@alifd/next';
import {
  PO_PENDING_APPOINTMENT,
  BH_PENDING_CONFIRM,
  CO_CONFIRMED,
  CO_DISCREPANCY,
  CO_IN_TRANSIT,
  // CO_RECEIVING,
  // ACTION_BATCH_RLENISHMENT_PALN_CONFIRM_MSG,
  // ACTION_BATCH_CONSIGNMENT_SUBMIT_MSG,
  // ACTION_BATCH_RESERVATION_ORDER_SUBMIT_MSG,
} from '../../../../constant';
// import { replenishmentPlanOrderConfirm, exportWareHouseByDownload } from '../../services/action';
import { exportWareHouseByDownload } from '../../services/action';
// import Appointment from './components/Appointment';


export default (type) => {
  switch (type) {
    case BH_PENDING_CONFIRM:
      return {
        hasRowSelection: false,
        // leftAction: ({ checked, onActionClick = () => { }, isDisabled }) => {
        //   const handleClick = () => {
        //     replenishmentPlanOrderConfirm(checked?.map((item) => item.billInfo))
        //       .then((success) => {
        //         if (success) {
        //           Message.success('批量确认补货成功');
        //           onActionClick(ACTION_BATCH_RLENISHMENT_PALN_CONFIRM_MSG);
        //         } else {
        //           Message.error('请稍后再试');
        //         }
        //       });
        //   };
        //   return (
        //     <Button onClick={handleClick} disabled={isDisabled}>批量确认补货</Button>
        //   );
        // },
        rightAction: ({ onChange = () => { } }) => (
          <Checkbox onChange={(val) => { onChange({ isAboutToTimeOut: val }); }}>
            即将确认超时（倒计时3天）
          </Checkbox>
        ),
      };
    case PO_PENDING_APPOINTMENT:
      return {
        hasRowSelection: false,
        // leftAction: ({ checked, onActionClick = () => { } }) => {
        //   const handleClick = () => {
        //     Appointment.open({ onOk: () => onActionClick(ACTION_BATCH_RESERVATION_ORDER_SUBMIT_MSG), records: checked });
        //   };
        //   return (
        //     <>
        //       <Button disabled={checked.length === 0} onClick={handleClick}>批量预约</Button>
        //     </>
        //   );
        // },
      };
    case CO_CONFIRMED:
      return {
        hasRowSelection: true,
        primaryKey: 'billId',
        // leftAction: ({ checked, onActionClick = () => {} }) => {
        //   const billInfos = checked.map((item) => item.billInfo);
        //   const handleClick = () => {
        //     consignmentSubmit(billInfos)
        //       .then((success) => {
        //         if (success) {
        //           Message.success('批量确认发货成功');
        //           onActionClick(ACTION_BATCH_CONSIGNMENT_SUBMIT_MSG);
        //         } else {
        //           Message.error('请稍后再试');
        //         }
        //       });
        //   };
        //   return (
        //     <Button disabled={checked.length === 0} onClick={handleClick}>批量确认发货</Button>
        //   );
        // },
        leftAction: ({ checked }) => {
          const handleClickDown = () => {
            exportWareHouseByDownload(checked.map((item) => item.billInfo));
          };
          return (
            <Button disabled={checked.length === 0} onClick={handleClickDown}>批量导出收货地址</Button>
          );
        },
        rightAction: ({ onChange = () => { } }) => (
          <Checkbox onChange={(val) => { onChange({ isAboutToTimeOut: val }); }}>
            即将确认发货超时（倒计时3天）
          </Checkbox>
        ),
      };
    case CO_IN_TRANSIT:
      return {
        hasRowSelection: true,
        primaryKey: 'billId',
        leftAction: ({ checked }) => {
          const handleClickDown = () => {
            exportWareHouseByDownload(checked.map((item) => item.billInfo));
          };
          return (
            <Button disabled={checked.length === 0} onClick={handleClickDown}>批量导出收货地址</Button>
          );
        },
        rightAction: ({ onChange = () => { } }) => (
          <Checkbox onChange={(val) => { onChange({ isAboutToTimeOut: val }); }}>
            即将运输超时（倒计时3天）
          </Checkbox>
        ),
      };
    case CO_DISCREPANCY:
      return {
        rightAction: ({ onChange = () => { } }) => (
          <Checkbox onChange={(val) => { onChange({ isAboutToTimeOut: val }); }}>
            差异单即将处理超时
          </Checkbox>
        ),
      };
    default:
      return {};
  }
};
