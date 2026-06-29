import React, { useState, useRef, useEffect } from 'react';
import { Table, Checkbox, Balloon, Icon, Message } from '@alifd/next';
import Clipboard from '@/components/ClipBoard';
import Button from '@/components/UI/Button';
import BallonTooltip from '@/pages/ManufacturerInfoManagement/components/BallonTooltip';
import LogisticsDetailsDialog from './LogisticsDetailsDialog';
import './JitTable.scss';
import PrintPreviewDialog from '@/pages/AeOrder/components/PrintPreviewDialog';
import moment from 'moment';
import { StatusText, BgColors } from '../enums';
import { splitArray } from '@/utlis';
import PromptDialog from '@/pages/JitConsignment/components/PromptDialog';
import { queryPermission } from '../services';

function JitTable({
  dataSource,
  loading,
  handleSelectChange,
  getData,
}) {
  const printDialog = useRef(null);
  // 初始化选中项的状态，这里假设每行都有一个唯一的id属性
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [readOnlyGroups, setReadOnlyGroups] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [processedDataSource, setProcessedDataSource] = useState([]);
  const onSelectGroupChange = (groupId, checked) => {
    const groupItems = dataSource.find((group) => group.purchaseOrderId === groupId).children;
    const groupItemIds = groupItems.map((item) => item.id);

    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, ...groupItemIds]);
      setReadOnlyGroups([...readOnlyGroups, groupId]);
      handleSelectChange([groupItems.filter((ele) => [...selectedRowKeys, ...groupItemIds].includes(ele.id))]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((key) => !groupItemIds.includes(key)));
      setReadOnlyGroups(readOnlyGroups.filter((purchaseOrderId) => purchaseOrderId !== groupId));
      handleSelectChange([groupItems.filter((ele) => selectedRowKeys.filter((key) => !groupItemIds.includes(key)).includes(ele.id))]);
    }
  };


  // 单行选择操作
  const onSelectChange = (selectedKeys) => {
    setSelectedRowKeys(selectedKeys);
    const newReadOnlyGroups = [];
    const Keys = [];
    dataSource.forEach((group) => {
      const groupItems = group.children;
      const groupItemIds = groupItems.map((item) => item.id);
      Keys.push(groupItems.filter((ele) => selectedKeys.includes(ele.id)));
      if (groupItemIds.some((purchaseOrderId) => selectedKeys.includes(purchaseOrderId))) {
        newReadOnlyGroups.push(group.purchaseOrderId);
      }
    });
    setReadOnlyGroups(newReadOnlyGroups);
    handleSelectChange(Keys);
  };

  const isGroupAllSelected = (groupId) => {
    const groupItems = dataSource?.find((group) => group.purchaseOrderId === groupId)?.children;
    const groupItemIds = groupItems?.map((item) => item.id);
    return groupItemIds?.every((purchaseOrderId) => selectedRowKeys.includes(purchaseOrderId));
  };

  const isGroupIndeterminate = (groupId) => {
    const groupItems = dataSource?.find((group) => group.purchaseOrderId === groupId)?.children;
    const groupItemIds = groupItems?.map((item) => item.id);
    return groupItemIds?.some((purchaseOrderId) => selectedRowKeys.includes(purchaseOrderId)) && !isGroupAllSelected(groupId);
  };

  const isReadOnlyGroup = (groupId) => {
    return readOnlyGroups.includes(groupId);
  };

  const groupHeaderRender = (record) => {
    const { purchaseOrderId, gmtCreate, childOrderList } = record;
    let disabledValue = false;
    if (childOrderList.some((item) => item.status !== 'WAIT_DELIVERY')) {
      disabledValue = true;
    } else {
      disabledValue = readOnlyGroups.length > 0 && !isReadOnlyGroup(purchaseOrderId);
    }
    return (
      <div className="text-[#333] text-[14px] font-medium flex">
        <div className="px-[16px]">
          <Checkbox
            checked={isGroupAllSelected(purchaseOrderId)}
            indeterminate={isGroupIndeterminate(purchaseOrderId)}
            onChange={(e) => onSelectGroupChange(purchaseOrderId, e)}
            disabled={disabledValue}
          />
        </div>
        <span>订单号：</span>
        <span className="font-normal mr-[16px]">{purchaseOrderId}</span>
        <span>创建时间：</span>
        <span className="font-normal">{moment(gmtCreate).format('YYYY-MM-DD HH:mm:ss')}</span>
      </div>
    );
  };

  const boxRender = (value, index, record) => {
    const { id = '', status = '' } = record;
    const isDisabled = readOnlyGroups?.some((groupId) => {
      const groupItems = dataSource?.find((group) => group.purchaseOrderId === groupId)?.children;
      const groupItemIds = groupItems?.map((item) => item.id);
      return !groupItemIds?.includes(id);
    });
    let disabledValue = false;
    if (status !== 'WAIT_DELIVERY') {
      disabledValue = true;
    } else {
      disabledValue = isDisabled;
    }
    return (
      <div>
        <Checkbox
          checked={selectedRowKeys.includes(id)}
          onChange={() => onSelectChange(
            selectedRowKeys.includes(id)
              ? selectedRowKeys.filter((key) => key !== id)
              : [...selectedRowKeys, id],
          )}
          disabled={disabledValue}
        />
      </div>
    );
  };

  const orderInfoRender = (value, index, record) => {
    const { offer } = record;
    const { imageUrl = '', offerTitle = '', offerId = '', skuDesc = [], quantity = '' } = offer;
    const hasImage = !!imageUrl; // 是否有图片
    return (
      <div className="mb-[3px] flex">
        {hasImage && (
          <div className="w-[60px] h-[60px] mr-[8px] ">
            <img className="rounded-[6px]" src={imageUrl} alt="img" />
          </div>
        )}
        <div>
          <div className="flex justify-between w-full">
            <div className="flex flex-col justify-between">
              {offerTitle.length < 12 ? (
                <span className={'w-[166px] text-[14px] text-[#333] text-ellipsis line-clamp-1'}>{offerTitle}</span>
              ) : (
                <Balloon.Tooltip
                  trigger={<div className="w-[166px] text-[14px] text-[#333] text-ellipsis line-clamp-1">{offerTitle}</div>}
                  align="t"
                  popupStyle={{ backgroundColor: '#333' }}
                  popupClassName="products-business-tooltips"
                >
                  <span className="text-[14px] text-[#fff]">{offerTitle}</span>
                </Balloon.Tooltip>
              )}
              <div className="text-[#999] text-[12px]">供货产品ID：{offerId}</div>
              <div className="text-[#999] text-[12px]">下单件数：{quantity}</div>
              <div className="text-[#999] text-[12px]">规格：{skuDesc.map((e) => e.specValue).join('/')}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const addressRender = (value, index, record) => {
    const { receiveAddress = {} } = record;
    const { provinceName = '', cityName = '', areaName = '', townName = '', detailAddress = '', mobile = '', warehouseName = '', contactorName = '' } = receiveAddress;
    return (
      <div className="text-[#999] text-[12px]">
        <div className="mb-[8px] text-[14px] text-[#333] flex items-center leading-[20px]">
          <span className="mr-[4px]">{warehouseName}</span>
          <Clipboard text={`${provinceName} ${cityName} ${areaName} ${townName} ${detailAddress} ${contactorName} ${mobile}`} ><Icon type="copy" /></Clipboard>
        </div>
        <div className="flex items-start">
          <div className="w-[36px]">地址：</div>
          <div className="flex-1 text-[#333] break-words">{provinceName} {cityName} {areaName} {townName} {detailAddress}</div>
        </div>
        <div>联系人：<span className="text-[#333]">{contactorName}</span></div>
        <div>联系方式：<span className="text-[#333]">{mobile}</span></div>
      </div>
    );
  };

  const performanceRender = (value, index, record) => {
    const { status = '', attributes = {} } = record;
    return (
      <div>
        <div className="flex items-center">
          <div className={`w-[8px] h-[8px] rounded-[4px] mr-[4px] ${BgColors[status]}`} />
          {StatusText[status]}
        </div>
        {status === 'CANCEL' && <div className="text-[#999] text-[14px]">买家已退款</div>}
        {attributes?.cancelConsignRole === 'trade' && status !== 'CANCEL' && (
          <div className="flex items-center">
            <div className="text-[#FF8B00] text-[14px] mr-[4px]">请重新发货</div>
            <BallonTooltip
              trigger={<Icon type="help" size={'small'} style={{ color: '#BBB' }} />}
              content={
                <div className="text-[#333]">由于合并发货时，买家取消了其中的一单。因此，该笔采购单需要重新发货方式并发货。</div>
              }
              align="b"
              backgroundColor="#FFF"
              popupClassName="products-business-tooltips-white"
            />
          </div>
        )}
      </div>
    );
  };
  // 切换当前行的展开状态
  const toggleExpand = (itemId) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  useEffect(() => {
    // 处理数据源，计算 rowSpan
    const processedData = dataSource.map((group) => {
      const processedChildren = processChildren(group.children);
      const newProcessedChildren = [...processedChildren]?.sort((x, y) => {
        const idX = x?.relatedFetchPackageOrderDTOList?.length ? x?.relatedFetchPackageOrderDTOList[0]?.id : 0;
        const idY = y?.relatedFetchPackageOrderDTOList?.length ? y?.relatedFetchPackageOrderDTOList[0]?.id : 0;
        return idX - idY;
      });
      return {
        ...group,
        children: newProcessedChildren,
      };
    });
    setProcessedDataSource(processedData);
  }, [dataSource]);

  const processChildren = (children) => {
    const rowSpanMap = new Map();
    // 计算每一行的 rowSpan
    children.forEach((child) => {
      const id = child?.relatedConsignOrderResultDTO?.id;
      if (!id) return; // 如果 id 不存在，跳过该子项
      if (!rowSpanMap.has(id)) {
        rowSpanMap.set(id, 1);
      } else {
        rowSpanMap.set(id, rowSpanMap.get(id) + 1);
      }
    });
    // 添加 rowSpan 属性到每个子项
    return children.map((child) => {
      const id = child?.relatedConsignOrderResultDTO?.id;
      return {
        ...child,
        rowSpan: id ? rowSpanMap.get(id) : 1, // 如果 id 不存在，默认 rowSpan 为 1
      };
    });
  };

  const cellProps = (rowIndex, colIndex, dataIndex, record) => {
    if (colIndex === 4 && record.rowSpan) {
      return {
        rowSpan: record.rowSpan,
      };
    }
    if (colIndex === 5 && record.rowSpan) {
      return {
        rowSpan: record.rowSpan,
      };
    }
    return {};
  };
  // 发货类型及状态
  const deliveryTypeRender = (value, index, record) => {
    console.log(record);
    const { id, status, sendType, gmtCreate, relatedFetchPackageOrderDTOList, relatedConsignOrderResultDTO } = record;
    const isExpanded = expandedRows[id] || false;
    const [firstPart, secondPart] = splitArray(relatedFetchPackageOrderDTOList, 2);
    const time = moment(gmtCreate);
    const hour = time.hour();
    const minute = time.minute();
    const isBefore14 = hour < 14 || (hour === 14 && minute === 0);
    switch (status) {
      case 'WAIT_DELIVERY': // 待发货
        return (
          <div className="text-[12px]">
            <div className="inline-table py-[1px] px-[4px] bg-[#F2F2F2] text-[#666] rounded-[10px] mb-[8px]">待选择发货方式</div>
            <div className="text-[#333]">上门揽：</div>
            <div className="text-[#FF8B00]">{
              isBefore14 ? (
                <span>
                  此单为
                  <span className="font-bold">14点前</span>
                  下单的订单，需在当日
                  <span className="font-bold">15点前</span>
                  完成预约揽收
                </span>
              ) : (
                <span>
                  此单为
                  <span className="font-bold">14点后</span>
                  下单的订单，需在次日
                  <span className="font-bold">15点前</span>
                  完成预约揽收
                </span>
              )}
            </div>
            <div className="text-[#333]">自寄-最晚到仓时间：</div>
            <div className="text-[#FF8B00]">{moment(gmtCreate).add(72, 'hours').format('YYYY/MM/DD HH:mm:ss')}</div>
          </div>
        );
      case 'ACCEPT': // 已揽收
      case 'CONSIGN': // 待揽收
      case 'DELIVERED': // 已送达
      case 'CONFIRMED': // 收货完成
      case 'SUCCESS': // 成功
        if (sendType === 'SUPPLIER_OFFLINE_SEND') { // 自寄
          return (
            <div className="text-[12px]">
              <div className="inline-table py-[1px] px-[4px] bg-[#ECF7EC] text-[#3BB347] rounded-[10px] mb-[8px]">自寄</div>
              {firstPart?.map((ele, i) => (
                <div className="leading-[16px] mb-[4px]"><span className="text-[#BBB]">运单{i + 1}：</span>
                  <span className="text-[#333]">{ele?.carriageInfo?.cpName} {ele.mailNo}</span>
                  <Clipboard text={`${ele?.carriageInfo?.cpName} ${ele.mailNo}`} ><Icon type="copy" /></Clipboard>
                </div>
              ))}
              {isExpanded && secondPart?.map((ele, i) => (
                <div className="leading-[16px] mb-[4px]"><span className="text-[#BBB]">运单{i + 3}：</span>
                  <span className="text-[#333]">{ele?.carriageInfo?.cpName} {ele.mailNo}</span>
                  <Clipboard text={`${ele?.carriageInfo?.cpName} ${ele.mailNo}`} ><Icon type="copy" /></Clipboard>
                </div>
              ))}
              {secondPart?.length > 0 && (
                <button className="cursor-pointer text-[#333]" onClick={() => toggleExpand(id)} style={{ lineHeight: '12px' }}>
                  {isExpanded ? <span>收起全部<Icon type="arrow-up" style={{ color: '#333' }} /></span> : <span>展开全部<Icon type="arrow-down" style={{ color: '#333' }} /></span>}
                </button>
              )}
            </div>
          );
        } else {
          return (
            <div className="text-[12px]">
              <div className="inline-table py-[1px] px-[4px] bg-[#E6F2FF] text-[#0077FF] rounded-[10px] mb-[8px]">上门揽</div>
              <div className="leading-[16px] mb-[4px]">
                <span className="mr-[4px] text-[#333]">共{relatedFetchPackageOrderDTOList?.length || 0}个揽收单</span>
                {relatedFetchPackageOrderDTOList?.map((ele) => ele.mailNo)?.filter(Boolean)?.length ? (
                  <span className="text-[#0077FF] cursor-pointer" onClick={() => LogisticsDetailsDialog.open({ mailNoList: relatedFetchPackageOrderDTOList.map((e) => e.mailNo).filter(Boolean) })}>查看物流详情</span>) : (
                    <span className="text-[#0077FF]">服务商接单中，请稍后刷新查看状态</span>
                )}
              </div>
              {relatedFetchPackageOrderDTOList?.length && status === 'CONSIGN' && (<div>预计上门时间：<span className="text-[#333]">{relatedConsignOrderResultDTO?.gmtExpectPickUpTime}前</span></div>)}
              {firstPart?.map((ele, i) => (
                ele.mailNo && <div className="leading-[16px] mb-[4px]"><span className="text-[#BBB]">揽收单{i + 1}：</span><span className="text-[#333]">{ele.mailNo}</span></div>
              ))}
              {isExpanded && secondPart?.map((ele, i) => (
                ele.mailNo && <div className="leading-[16px] mb-[4px]"><span className="text-[#BBB]">揽收单{i + 3}：</span><span className="text-[#333]">{ele.mailNo}</span></div>
              ))}
              {secondPart?.length > 0 && (
                <button className="cursor-pointer text-[#333]" onClick={() => toggleExpand(id)} style={{ lineHeight: '12px' }}>
                  {isExpanded ? <span>收起全部<Icon type="arrow-up" style={{ color: '#333' }} /></span> : <span>展开全部<Icon type="arrow-down" style={{ color: '#333' }} /></span>}
                </button>
              )}
            </div>
          );
        }
      case 'CANCEL': // 关单
        return <></>;
      default:
        return <></>;
    }
  };
  // 打印揽收单
  const printWayBill = (pickupOrderNumber) => {
    printDialog.current.onOpen({
      type: 'jitPrintWayBill',
      pickupOrderNumber,
    });
  };
  const operationRender = (value, index, record) => {
    const { receiveAddress, offer, id, fcId, relatedConsignOrderResultDTO, status, sendType, gmtCreate, relatedFetchPackageOrderDTOList } = record;
    const navigateWithQueryParams = async () => {
      const isAllow = await queryPermission();
      if (!isAllow) {
        Message.error('子账号没有权限，请前往子账号权限配置');
        return;
      }
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('type', 'shipments');
      currentUrl.searchParams.set('add', JSON.stringify(receiveAddress));
      currentUrl.searchParams.set('gmtCreate', JSON.stringify(gmtCreate));
      currentUrl.searchParams.set('offer', JSON.stringify([offer]));
      currentUrl.searchParams.set('fcId', JSON.stringify(fcId));
      currentUrl.searchParams.set('id', JSON.stringify([{
        [fcId]: {
          [id]: offer.quantity,
        },
      }]));
      const { origin, search } = currentUrl;
      window.open(`https://air.1688.com/app/channel-fe/chain-work/jitconsignment.html${search}`, '_blank');
    };
    // 取消揽收
    const onCancelFPOrder = async () => {
      const isAllow = await queryPermission();
      if (!isAllow) {
        Message.error('子账号没有权限，请前往子账号权限配置');
        return;
      }
      PromptDialog.open({
        state: 'other',
        content: `共有${relatedFetchPackageOrderDTOList?.length}个揽收单，您是否确定取消揽收？取消揽收可能导致货物到仓超时。`,
        consignOrderId: relatedConsignOrderResultDTO?.id,
        getData,
      });
    };
    switch (status) {
      case 'WAIT_DELIVERY': // 待发货
        return (
          <Button type="primary" style={{ marginBottom: '8px', borderRadius: '6px' }} onClick={navigateWithQueryParams}>去发货</Button>
        );
      case 'ACCEPT': // 已揽收
      case 'CONSIGN': // 待揽收
        if (sendType === 'SUPPLIER_OFFLINE_SEND') {
          return <></>;
        } else {
          return (
            <div>
              <div><Button type="normal:primary-ghost" style={{ marginBottom: '8px', borderRadius: '6px' }} onClick={() => printWayBill(relatedConsignOrderResultDTO.id)}>打印揽收单</Button></div>
              <div>
                {status === 'ACCEPT' ? (
                  <BallonTooltip
                    trigger={
                      <Button type="primary" text style={{ color: '#999' }}>取消揽收</Button>
                    }
                    content="部分已揽收，不支持取消"
                    align="b"
                  />
                ) : (<Button type="primary" text onClick={onCancelFPOrder}>取消揽收</Button>)}
              </div>
            </div>
          );
        }
      case 'DELIVERED': // 已送达
      case 'CONFIRMED': // 收货完成
      case 'SUCCESS': // 成功
      case 'CANCEL': // 关单
        return <></>;
      default:
        return <></>;
    }
  };

  return (
    <div className="jit-order-list">
      <Table
        hasBorder={false}
        dataSource={processedDataSource}
        loading={loading}
        tableLayout="fixed"
        cellProps={cellProps}
      >
        <Table.GroupHeader cell={groupHeaderRender} />
        <Table.Column title="" dataIndex="productName" align="center" width={48} cell={boxRender} />
        <Table.Column title="供货产品信息" cell={orderInfoRender} />
        <Table.Column title="收货地址" dataIndex="specInfo" cell={addressRender} />
        <Table.Column title="履约状态" dataIndex="price" width={140} cell={performanceRender} />
        <Table.Column title="发货类型及状态" dataIndex="quantity" width={320} cell={deliveryTypeRender} />
        <Table.Column title="操作" dataIndex="operation" align="center" width={140} cell={operationRender} />
      </Table>
      <PrintPreviewDialog ref={printDialog} type="jitText" />
    </div>
  );
}

export default JitTable;
