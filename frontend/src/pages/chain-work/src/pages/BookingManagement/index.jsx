import React, { useRef } from 'react';
import NewWorkLayout from '@/layouts/NewWorkLayout';
// import Block from '@/layouts/Block';
import CommonTable from '@/components/CommonTable';
import schema from './schema';
import './index.scss';
import { queryPageAppointOrdersService, cancelAppointOrderService } from './service';
import { MessageError, MessageSuccess } from '@/utlis';
import { BookingType, InOutType } from './enums';
import PrintPreviewDialog from '@/pages/AeOrder/components/PrintPreviewDialog';

function BookingManagement() {
  const printDialog = useRef(null);
  const fetchQueryItem = (values) => {
    const { appointmentDate = [] } = values;
    const appointDateStart = appointmentDate[0] && appointmentDate[0].startOf('day').format('YYYY-MM-DD');
    const appointDateEnd = appointmentDate[1] && appointmentDate[1].endOf('day').format('YYYY-MM-DD');
    return new Promise((resolve) => {
      queryPageAppointOrdersService({
        ...values,
        pageIndex: values.pageNo,
        specialAppointStepList: values.currentStatus === 'all' ? [] : [values.currentStatus],
        appointDateStart,
        appointDateEnd,
      }).then((res) => {
        resolve(res);
      });
    });
  };
  // 确认取消
  const getCancelAppointOrderService = (appointOrderCode, fn) => {
    cancelAppointOrderService({
      appointOrderCode,
    }).then((res) => {
      const { success, errorCode } = res;
      if (success) {
        MessageSuccess('取消成功');
        fn();
      } else {
        MessageError(errorCode || '取消失败');
      }
    });
  };
  // 打印箱唛
  const printBox = (record) => {
    const { goodsId = '', planQty = '', boxGauge = 0, boxNum = 0, goodsName = '', goodsCode = '', relatedSupplierItemId = '', appointOrderCode = '', fulfilmentOrderCode = '' } = record;
    printDialog.current.onOpen({
      type: 'printBoxLabel',
      orderId: goodsId,
      orderEntries: {
        supplierName: '',
        planQty,
        boxSize: Number(boxGauge),
        boxNum,
        appointOrderCode,
        goods: {
          goodsName,
          goodsCode,
          relatedSupplierItemId,
          fulfilmentOrderCode,
        },
      },
    });
  };
  // 打印送货单
  const getPrintDeliveryOrder = (record) => {
    const { appointOrderCode = '', entityCode = '', entityName = '', totalQuantity = 0, orderType = '', appointDate = '', inboundType = '', itemInfoList = [], fulfilmentOrderCode } = record;
    printDialog.current.onOpen({
      type: 'printDelivery',
      orderId: fulfilmentOrderCode,
      orderEntries: {
        entityInfo: {
          entityCode,
          entityName,
        },
        appointOrderInfo: {
          totalQuantity,
          orderType: BookingType[orderType], // 映射给中文
          appointDate,
          inboundType: InOutType[inboundType], // 映射给中文
          fulfilmentOrderCode,
          appointOrderCode,
          scItemsInfo: itemInfoList?.map((ele) => ({
            goodsCode: ele?.goodsCode,
            goodsId: ele?.goodsId,
            goodsName: ele?.goodsName,
            planQty: Number(ele?.planQty || 0),
          })),
        },
      },
    });
  };
  // 打印条码
  const getOfferMarkPrintAppointOrderService = (record) => {
    const { goodsId = '', goodsCode = '' } = record;
    printDialog.current.onOpen({
      type: 'printBarCode',
      orderId: goodsId,
      orderEntries: {
        goodsCode,
      },
    });
  };
  const handleActionClick = ({ type, record }, fn) => {
    switch (type) {
      case 'cancelAppointOrder':
        getCancelAppointOrderService(record?.appointOrderCode, fn);
        break;
      case 'printBoxLabel': // 打印箱唛
        printBox(record);
        break;
      case 'printDeliveryOrder': // 打印送货单
        getPrintDeliveryOrder(record);
        break;
      case 'printBarCode': // 打印条码
        getOfferMarkPrintAppointOrderService(record);
        break;
      default:
        break;
    }
  };
  return (
    <NewWorkLayout title="预约管理">
      <div className="bookingManagement">
        <CommonTable
          className="commonTable"
          schema={schema}
          getStatusFnOrStatusList={[
            { name: '全部', code: 'all', logName: '全部' },
            { name: '待计划小二审核', code: 'INDUSTRY_ADMIN', logName: '待计划小二审核' },
            { name: '待仓运营审核', code: 'WAREHOUSE_ADMIN', logName: '待仓运营审核' },
          ]}
          listQueryFn={fetchQueryItem}
          pageSize={10}
          onActionComplete={handleActionClick}
          searchFilterType="4"
        />
      </div>
      <PrintPreviewDialog ref={printDialog} />
    </NewWorkLayout>
  );
}

export default BookingManagement;
