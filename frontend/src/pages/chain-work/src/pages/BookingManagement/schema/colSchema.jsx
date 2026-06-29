import React from 'react';
import { Button, Balloon, Dialog } from '@alifd/next';
import ViewLogDialog from '../components/ViewLogDialog';
import PrintBoxLabelDialog from '../components/PrintBoxLabelDialog';
import ExpandIcon from '../components/ExpandIcon';
import { StatusType, InOutType, BookingType, reservationType } from '../enums';

const CommonCell = ({ list = [] }) => {
  return (
    <div>
      {list?.map((item) => {
        return (
          <div key={item.label}><span className="text-[#999] mr-[4px]">{item.label}</span>{item.value}</div>
        );
      })}
    </div>
  );
};
// 预约单号
const APPOINTMENT_NUM = {
  title: '预约单号',
  dataIndex: 'appointOrderCode',
  lock: true,
  width: 166,
  cell: (value) => {
    return (
      value ? (
        <Button
          type="primary"
          text
          onClick={() => (
            window.open(`https://web.cbbs.tmall.com/pages/babadchain/inboundoutbound_appoint_order_detail?spm=.25561108.0.0.1923406eYqQzxs&orderCode=${value}`, '_self')
          )}
        >
          {value}
        </Button>
      ) : '-'
    );
  },
};

// 货品信息
const GOODS_INFO = {
  title: '货品信息',
  dataIndex: 'goodsInfo',
  width: 176,
  cell: (value, index, record, { onRowClick }) => {
    const handleClick = () => {
      onRowClick(record);
    };
    const { totalQuantity = '-', totalBoxNum = '-', totalVolume = '-', totalWeight = '-' } = record;
    const _list = [
      { label: '总件数', value: totalQuantity },
      { label: '总箱数', value: totalBoxNum },
      { label: '总体积（立方米）', value: totalVolume },
      { label: '总重量（千克）', value: totalWeight },
    ];
    return (
      <div>
        <CommonCell list={_list} />
        <ExpandIcon retractText="收起明细" expandText="展开明细" onClick={handleClick} />
      </div>
    );
  },
};

// 待预约单据
const WAIT_APPOINTMENT_ORDER = {
  title: '待预约单据',
  dataIndex: 'outOrderSize',
  width: 120,
  cell: (value, index, record) => {
    const { outOrderSize, stockUnit = '-', totalQuantity = '-', outOrderCodes = [] } = record;
    const _list = [
      // { label: '单据数', value: outOrderSize },
      { label: '库存单位', value: stockUnit },
      { label: '数量', value: totalQuantity },
    ];
    return (
      <div>
        <div>
          <span className="text-[#999] mr-[4px]">单据数</span>
          {outOrderSize ? (
            <Balloon v2 trigger={<span className="cursor-pointer text-[#2f88f5]">{outOrderSize}</span>} triggerType="hover" arrowPointToCenter align="b" closable={false} offset={[0, -15]}>
              {outOrderCodes?.map((ele) => ele)}
            </Balloon>) : '-'
          }
        </div>
        <CommonCell list={_list} />
      </div>
    );
  },
};

// 关联业务单号
const RELATED_BIZ_ORDER = {
  title: '关联业务单号',
  dataIndex: 'relatedBusinessOrderCodes',
  width: 176,
  cell: (value) => (
    value ? (
      <Balloon v2 trigger={<span className="cursor-pointer text-[#2f88f5]">{value}</span>} triggerType="hover" arrowPointToCenter align="b" closable={false} offset={[0, -15]}>
        {value?.map((ele) => <Button type="primary" text onClick={() => window.open(`https://web.cbbs.tmall.com/pages/babadchain/purchase_order_detail_v4?spm=.25561108.0.0.1923406eicx48Y&purchaseOrderNo=${ele}`, '_self')}>{ele}</Button>)}
      </Balloon>
    ) : '-'
  ),
};

// 履约执行单编号
const PERFORM_EXECUTE_ORDER = {
  title: '履约执行单编号',
  dataIndex: 'fulfilmentOrderCode',
  width: 176,
  cell: (value) => value || '-',
};

// 仓库
const WAREHOUSE = {
  title: '仓库',
  dataIndex: 'entityName',
  width: 140,
  cell: (value) => value || '-',
};

// // 其它信息
// const OTHER_INFO = {
//   title: '其它信息',
//   dataIndex: 'otherAttributes',
//   width: 100,
//   cell: (value) => value || '-',
// };

// 预约类型
const APPOINTMENT_TYPE = {
  title: '预约类型',
  dataIndex: 'appointType',
  width: 100,
  cell: (value) => reservationType[value] || '-',
};

// 预约日期
const APPOINTMENT_DATE = {
  title: '预约日期',
  dataIndex: 'appointDate',
  width: 120,
  cell: (value) => value || '-',
};

// 预约单类型
const APPOINTMENT_ORDER_TYPE = {
  title: '预约单类型',
  dataIndex: 'orderType',
  width: 176,
  cell: (value, index, record) => {
    const { orderType, inboundType } = record;
    const _list = [
      { label: '类型', value: BookingType[orderType] || '-' },
      { label: '出入库方式', value: InOutType[inboundType] || '-' },
    ];
    return (
      <CommonCell list={_list} />
    );
  },
};

// 状态
const STATUS = {
  title: '状态',
  dataIndex: 'status',
  width: 120,
  cell: (value) => (
    value ? (<div className="h-[16px] rounded-[10px] bg-[#ECF7EC] text-[#3BB347] text-[12px] inline-table " style={{ padding: '1px 4px' }}>{StatusType[`${value}`]}</div>) : '-'
  ),
};

// 操作
const OPERATION = {
  title: '操作',
  dataIndex: 'operation',
  lock: 'right',
  width: 120,
  alignHeader: 'center',
  cell: (value, index, record = {}, others = {}) => {
    const { onActionClick = () => { } } = others;
    const button = [
      {
        label: '日志',
        onClick: () => ViewLogDialog.open({ record }),
      },
      {
        label: '打印送货单',
        onClick: () => onActionClick({ type: 'printDeliveryOrder', record }),
      },
      {
        label: '取消预约单号',
        onClick: () => {
          const dialog = Dialog.show({
            v2: true,
            centered: true,
            title: '是否取消预约单',
            content: `确定要取消单号为${record?.appointOrderCode}的预约单吗？`,
            style: { width: 400 },
            footer: (() => {
              return (
                <div style={{ textAlign: 'center' }}>
                  <Button
                    onClick={() => {
                      dialog.hide();
                      onActionClick({ type: 'cancelAppointOrder', record });
                    }}
                  >
                    确认取消
                  </Button>
                  <Button
                    type="primary"
                    style={{ marginLeft: 20 }}
                    onClick={() => {
                      dialog.hide();
                    }}
                  >
                    我再想想
                  </Button>
                </div>
              );
            })(),
          });
        },
      },
    ];
    return (
      <div className="flex flex-col items-center">
        {button?.map((ele) => {
          return (
            <Button type="primary" text className="mb-[6px]" onClick={ele.onClick} key={ele.label}>{ele.label}</Button>
          );
        })}
      </div>
    );
  },
};
const CellRow = ({ url = '', title = '', titleId = '' }) => {
  const hasImage = !!url;
  return (
    <div className="mt-[4px] mb-[4px] ml-[4px] flex items-center w-[100px]">
      {hasImage && <img src={url} alt="" srcSet="" className="rounded-[6px] w-[56px] h-[56px] mr-[12px]" />}
      <div className="h-[62px] flex justify-between w-full">
        <div className="flex flex-col justify-between">
          {title?.length < 7 ? (
            <span className="w-[100px] text-sm text-[#333] text-ellipsis line-clamp-2"> {title || '-'}</span>
          ) : (
            <Balloon.Tooltip
              trigger={<span className="w-[100px] text-sm text-[#333] text-ellipsis line-clamp-2">{title}</span>}
              align="t"
              popupStyle={{ backgroundColor: '#333' }}
              popupClassName="products-business-tooltips"
            >
              <span className="">{title}</span>
            </Balloon.Tooltip>
          )}
          <div className="text-[#999] text-[13px] mt-[4px]">ID：{titleId || '-'}</div>
        </div>
      </div>
    </div>
  );
};
// 货品信息
const GOODS_INFO_SON = {
  title: '货品信息',
  dataIndex: 'goodsInfo',
  width: 204,
  cell: (value, index, record) => {
    const { goodsName, goodsId, goodsImg } = record;
    return <CellRow url={goodsImg} title={goodsName} titleId={goodsId} />;
  },
};

// 关联供货产品
const RELATED_SUPPLY_PRODUCT = {
  title: '关联供货产品',
  dataIndex: 'relatedSupplyProducts',
  width: 204,
  cell: (value, index, record) => {
    const { relatedSupplierItemName, relatedSupplierItemId, goodsImg } = record;
    return <CellRow url={goodsImg} title={relatedSupplierItemName} titleId={relatedSupplierItemId} />;
  },
};

// SKU信息
const SKU_INFO = {
  title: 'SKU信息',
  dataIndex: 'skuName',
  width: 140,
  cell: (value, index, record) => {
    const { skuName, skuId } = record;
    return <CellRow title={skuName} titleId={skuId} />;
  },
};

// 补货量
const REPLENISHMENT_QUANTITY = {
  title: '补货量',
  dataIndex: 'planQty',
  width: 80,
  cell: (value) => value || '-',
};

// 条码
const BAR_CODE = {
  title: '条码',
  dataIndex: 'goodsCode',
  width: 110,
  cell: (value) => value || '-',
};

// 操作
const OPERATION_SON = {
  title: '操作',
  dataIndex: 'operation',
  width: 100,
  alignHeader: 'center',
  cell: (value, index, record, { onActionClick = () => { } }) => {
    const button = [
      {
        label: '打印箱唛',
        onClick: () => {
          PrintBoxLabelDialog.open({ record, onActionOk: (e) => onActionClick({ type: 'printBoxLabel', record: { ...record, ...e } }) });
        },
      },
      {
        label: '打印条码',
        onClick: () => onActionClick({ type: 'printBarCode', record }),
      },
    ];
    return (
      <div className="flex flex-col items-center">
        {button?.map((ele) => (
          <Button type="primary" text className="mb-[6px]" key={ele.label} onClick={ele.onClick}>{ele.label}</Button>
        ))}
      </div>
    );
  },
};

export default (type) => {
  switch (type) {
    case 'SON':
      return [
        GOODS_INFO_SON,
        RELATED_SUPPLY_PRODUCT,
        SKU_INFO,
        REPLENISHMENT_QUANTITY,
        BAR_CODE,
        OPERATION_SON,
      ];
    default:
      return [
        APPOINTMENT_NUM,
        GOODS_INFO,
        WAIT_APPOINTMENT_ORDER,
        RELATED_BIZ_ORDER,
        PERFORM_EXECUTE_ORDER,
        WAREHOUSE,
        // OTHER_INFO,
        APPOINTMENT_TYPE,
        APPOINTMENT_DATE,
        APPOINTMENT_ORDER_TYPE,
        STATUS,
        OPERATION,
      ];
  }
};
