import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Dialog, Timeline, Radio, Icon, Loading } from '@alifd/next';
import { queryTraceInfoByConsignOrderId } from '../services';
import Message from '@/components/UI/Message';
import './LogisticsDetailsDialog.scss';

const TimelineItem = Timeline.Item;
const map = {
  PENDING_DISPATCH: 1,
  ALREADY_DISPATCH: 2,
  ACCEPT: 3,
  DELIVERING: 4,
  SIGN: 5,
  COLLECT_FAILED: 6,
};
const listData = [
  {
    traceNodeCode: 'PENDING_DISPATCH',
    traceNodeName: '待派车',
  },
  {
    traceNodeCode: 'ALREADY_DISPATCH',
    traceNodeName: '已派车',
  },
  {
    traceNodeCode: 'ACCEPT',
    traceNodeName: '已揽收',
  },
  {
    traceNodeCode: 'DELIVERING',
    traceNodeName: '派送中',
  },
  {
    traceNodeCode: 'SIGN',
    traceNodeName: '已签收',
  },
  {
    traceNodeCode: 'COLLECT_FAILED',
    traceNodeName: '揽收失败',
  },
];
const container = document.createElement('div');
const LogisticsDetailsDialog = ({ props }) => {
  const { mailNoList } = props;
  const dialogRef = React.createRef();
  const [visible, setVisible] = useState(true);
  const [shape, setShape] = useState('');
  const [list, setList] = useState([]);
  const [traceOrderItemDTOListData, setTraceOrderItemDTOList] = useState([]);
  const [i, setI] = useState(0);
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };
  const mergeKeyIntoListData = (l, traceOrderItemDTOList) => {
    const result = [...l];
    traceOrderItemDTOList.forEach((orderItem, index) => {
      const { traceNodeCode } = orderItem.traceNode;
      const { nodeActionTime, attributeMap } = orderItem;
      const matchingNodeIndex = result.findIndex((node) => node.traceNodeCode === traceNodeCode);
      if (matchingNodeIndex !== -1) {
        result[matchingNodeIndex] = {
          ...result[matchingNodeIndex],
          nodeActionTime,
          attributeMap,
          key: index,
        };
      }
    });
    return result;
  };

  const getMaxValueFromList = (l, m) => {
    const values = l?.map((item) => m[item.traceNode?.traceNodeCode])
      .filter((value) => value !== undefined);
    if (values?.length === 0) return undefined;
    return Math.max(...values);
  };
  useEffect(() => {
    queryTraceInfoByConsignOrderId({
      mailNoList,
    }).then((res) => {
      const { success, msg, model } = res;
      if (success) {
        setList(model);
        setShape(model[0].id);
        const lists = model[i].traceOrderItemDTOList;
        const result = lists.some(item => item.traceNode.traceNodeCode === 'COLLECT_FAILED') ? [lists.find(item => item.traceNode.traceNodeCode === 'COLLECT_FAILED')] : lists;
        setTraceOrderItemDTOList(result);
      } else {
        Message._show({ content: msg || '系统异常', type: 'error' });
      }
    });
  }, []);
  const process = (traceNodeCode, index) => {
    const maxValue = getMaxValueFromList(traceOrderItemDTOListData, map);
    if (maxValue === 6 || maxValue === 7) {
      if (maxValue === 6 && traceNodeCode === 'COLLECT_FAILED') {
        return 'process';
      }
    } else if (maxValue > index) {
      return 'process';
    }
  };
  return (
    <Dialog
      ref={dialogRef}
      v2
      title={<div className="text-[#333] text-[16px] font-medium leading-[20px]">查看物流详情</div>}
      visible={visible}
      footerAlign="center"
      style={{ width: '800px' }}
      footer={false}
      onClose={onClose}
    >
      {list?.length > 1 && (
        <Radio.Group
          shape="button"
          value={shape}
          onChange={(value) => {
            const index = list.findIndex((item) => item.id === value);
            setI(index);
            setShape(value);
            const lists = list[index].traceOrderItemDTOList;
            const result = lists.some(item => item.traceNode.traceNodeCode === 'COLLECT_FAILED') ? [lists.find(item => item.traceNode.traceNodeCode === 'COLLECT_FAILED')] : lists;
            setTraceOrderItemDTOList(result); // 更新 traceOrderItemDTOList
          }}
          style={{ marginBottom: 16, borderRadius: 6 }}
        >
          {list.map((item, index) => (
            <Radio value={item.id} key={item.id}>
              揽收单 {index + 1}
            </Radio>
          ))}
        </Radio.Group>
      )}
      <Loading tip="加载中..." visible={!list?.length} style={{ display: 'block' }}>
        <div className="flex text-[14px] text-[#333] mb-[20px]">
          <div className="mr-[24px]">
            <span className="text-[#999]">揽收单号：</span>
            <span>{list[i]?.mailNo || '-'}</span>
          </div>
          <div>
            <span className="text-[#999]">创建时间：</span>
            <span>{list[i]?.gmtCreate || '-'}</span>
          </div>
        </div>
        <Timeline>
          {listData.map((ele, index) => {
            const mergedData = mergeKeyIntoListData([ele], traceOrderItemDTOListData)[0];
            return (
              <TimelineItem
                title={
                  process(ele.traceNodeCode, index) ? (
                    <div className="text-[#0077FF] font-normal text-[14px]">
                      {mergedData?.traceNodeName || ele.traceNodeName}
                      <span className="text-[#999] text-[12px] ml-[8px]">{mergedData.nodeActionTime}</span>
                    </div>
                  ) : <span className="text-[#999] text-[14px] font-normal">{mergedData?.traceNodeName || ele.traceNodeName}</span>
                }
                dot={
                  <Icon
                    type="ic_circle"
                    size="xs"
                    className={
                      process(ele.traceNodeCode, index) && getMaxValueFromList(traceOrderItemDTOListData, map) === index + 1 ? 'bg-[#0077FF] rounded-[50%]' : ''
                    }
                    style={{ ...process(ele.traceNodeCode, index) && { color: '#0077FF' }, marginTop: '4px' }}
                  />
                }
                {...mergedData?.attributeMap && mergedData?.attributeMap?.vehicleNo ? {
                  content: (
                    ele?.traceNodeCode === 'ALREADY_DISPATCH' && (
                      <div className="text-[#333] text-[14px] w-[192px] p-[12px] rounded-[4px] bg-[#F8F8F8]">
                        <div><span className="text-[#999]">司机名称：</span>{mergedData?.attributeMap?.vehicleDriverName}</div>
                        <div><span className="text-[#999]">车牌号：</span>{mergedData?.attributeMap?.vehicleNo}</div>
                        <div><span className="text-[#999]">联系方式：</span>{mergedData?.attributeMap?.vehicleDriverMobile}</div>
                      </div>
                    )
                  ),
                } : {}}
                state={process(ele.traceNodeCode, index)}
              />
            );
          })}
        </Timeline>
      </Loading>
    </Dialog>
  );
};

LogisticsDetailsDialog.open = (props) => {
  ReactDOM.render(<LogisticsDetailsDialog props={props} />, document.createElement('div'));
};

export default LogisticsDetailsDialog;
