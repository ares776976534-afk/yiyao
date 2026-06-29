import React, { useState, useEffect, useRef } from 'react';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import Block from '@/layouts/Block';
import CommonTable from '@/components/CommonTable';
import schema from './schema';
import './index.scss';
import { getSendAndReceiveInfo, queryItem, pageChoiceItem, querySettledBaseInfo, getChoiceBondInfo, getChoiceBusinessBacklog } from './services';
import { Tab, Button, Divider } from '@alifd/next';
import { scrollTo, MessageError, Logger } from '@/utlis';
import NoticBoard from './components/NoticBoard';
import { querySellerType } from '@/pages/CrossBorderOfferlist/api';
import CrossBorderOfferlistDialog from '@/pages/CrossBorderOfferlist/components/Dialog';
import AlipayInternationalAccount from './components/AlipayInternationalAccount';
import UnderstandDialog from './components/UnderstandDialog';
import Message from '@/components/UI/Message';
import OperateTab from './components/OperateTab';
import CustodyMarginCard from './components/CustodyMarginCard';
import OperationVideoDialog from '@/components/OperationVideoDialog';
import NoticBanner from './components/NoticBanner';

Logger.init({ a: 'Choice', b: 'Choice' }, { pageKey: 'Choice' });

const videoIntro = 'https://cloud.video.taobao.com/vod/tEE3-wKKpLuw4g2xECL1t7irNZAKlLCYrr0sUoVICYM.mp4';
const Select = () => {
  const [dataList, setDataList] = useState([]); // 内容看板
  const [isLoading, setIsLoading] = useState(false);
  const tableQuery = useRef(null);
  const searchField = useRef(null);
  const [activeKey, setActiveKey] = useState(0);
  const [defaultModel, setDefaultModel] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [zeroStockCount, setZeroStockCount] = useState('');
  const [modelData, setModelData] = useState({});
  const [modelDataLoading, setModelDataLoading] = useState(false);
  const contentRef = useRef(null);
  const [bondData, setBondData] = useState({});
  const [action, setAction] = useState('1');
  const [cards, setCards] = useState([]);
  // 跨境销售数据
  const fetchGetSendAndReceiveInfo = () => {
    setIsLoading(true);
    getSendAndReceiveInfo().then((res) => {
      if (res.success) {
        setIsLoading(false);
        const { model } = res;
        setDataList(model);
      } else {
        setIsLoading(false);
        MessageError('数据异常');
      }
    });
  };

  const getQuerySettledBaseInfo = () => {
    setModelDataLoading(true);
    querySettledBaseInfo().then((res) => {
      const { model, success, msg } = res;
      if (success) {
        setModelDataLoading(false);
        setModelData(model);
      } else {
        setModelDataLoading(false);
        Message._show({ content: msg || '数据异常', type: 'error' });
      }
    });
  };
  // 保证金缴纳
  const queryChoiceBondInfo = () => {
    getChoiceBondInfo().then((res) => {
      const { model = {}, success, msg = '数据异常' } = res;
      if (success) {
        setBondData(model);
        if (model?.isPopUp) {
          // DepositPaymentDialog.open({ data: model, handleActionClick: bondHandleActionClick, closeActionClick: fetchChoiceBaseInfo });
        } else {
          // fetchChoiceBaseInfo();
        }
      } else {
        // fetchChoiceBaseInfo();
        Message._show({ content: msg, type: 'error' });
      }
    }).catch((err) => {
      // fetchChoiceBaseInfo();
      Message._show({ content: err?.message || '数据异常', type: 'error' });
    });
  };
  const bondHandleActionClick = () => {
    queryChoiceBondInfo();
    queryChoiceBusinessBacklog();
  };
  const querySellerTypes = () => {
    Promise.all([querySellerType(5117249), querySellerType(5117313)])
      .then((res) => {
        if (res[0]?.data?.data === 'true' && res[1]?.data?.data === 'false') {
          CrossBorderOfferlistDialog.open(queryChoiceBondInfo);
          return Promise.reject();
        } else if (res[1]?.data.data === 'true') {
          queryChoiceBondInfo();
        }
      });
  };

  const query = () => {
    fetchGetSendAndReceiveInfo();
  };
  useEffect(() => {
    if (refreshTrigger > 0) {
      query();
    }
  }, [refreshTrigger]);
  const queryChoiceBusinessBacklog = () => {
    getChoiceBusinessBacklog().then((res) => {
      const { model = [], success, msg = '数据异常' } = res;
      if (success) {
        setCards(model);
        setAction(model?.length ? '1' : '2');
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    });
  };
  useEffect(() => {
    queryChoiceBusinessBacklog();
    query();
    querySellerTypes();
    getQuerySettledBaseInfo();
    pageChoiceItem({
      request: { pageNum: 1, currentStatus: '2', pageSize: 10 },
    }).then((res) => {
      setActiveKey(res?.model?.length > 0 ? '2' : '1');
      setDefaultModel(res?.model?.length);
    });
  }, []);
  // 如果没有查询条件时为空，则展示空状态
  // 如果有查询条件时为列表
  const fetchQueryItem2 = (values) => {
    return new Promise((resolve) => {
      const _values = {
        ...values,
        isZeroStock: values?.isZeroStock ? values?.isZeroStock : undefined,
        pageNum: values?.pageNo,
      };
      pageChoiceItem({
        request: _values,
      }).then((res) => {
        setZeroStockCount(res?.zeroStockCount || '');
        if (Object.keys(values).every((item) => !values[item])) {
          setDefaultModel(res?.model?.length > 0);
        }
        resolve({ model: res?.model, total: res?.total });
      });
    });
  };
  const fetchQueryItem1 = (values) => {
    setDefaultModel(2);
    return new Promise((resolve) => {
      const _values = {
        ...values,
        pageNum: values?.pageNo,
      };
      queryItem(_values).then((res) => {
        resolve(res);
      });
    });
  };
  const RefreshTrigger = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  const handleActionClick = ({ type, record }, fn) => {
    switch (type) {
      case 'diffLevel':
      case 'goAssociate':
      case 'reload':
      case 'exit':
        fn();
        break;
      case 'jumpFilter':
        searchField.current.reset();
        searchField.current._setValue(record);
        scrollTo(document.getElementById('table'));
        break;
      case 'choice_dialog':
        // BatchJoinChoiceDialog.open({ isShow: true, record, fn, RefreshTrigger });
        break;
      case 'initFn':
        RefreshTrigger();
        break;
      default:
        break;
    }
  };
  const newSchema1 = {
    ...schema,
    batchActionSchema: () => {
      return schema.batchActionSchema('1');
    },
    colSchema: () => {
      return schema.colSchema('1');
    },
    filterSchema: () => {
      return schema.filterSchema('1');
    },
  };
  const newSchema2 = {
    ...schema,
    batchActionSchema: () => {
      return schema.batchActionSchema('2', zeroStockCount);
    },
    colSchema: () => {
      return schema.colSchema('2');
    },
    filterSchema: () => {
      return schema.filterSchema('2');
    },
  };
  const schemaType = {
    1: newSchema1,
    2: newSchema2,
  };
  const getListQueryFn = {
    1: fetchQueryItem1,
    2: fetchQueryItem2,
  };
  const TableCom = () => {
    return (
      <CommonTable
        className="commonTable"
        schema={schemaType[activeKey]}
        SlotOrShowStatusFilter={false}
        searchFilterType="4"
        listQueryFn={getListQueryFn[activeKey]}
        searchChangeFn={(fn) => {
          tableQuery.current = fn;
        }}
        onActionComplete={handleActionClick}
        pageSize={10}
        tableCellProps={(rowIndex, colIndex, dataIndex, record) => {
          const { saleChannel } = record || {};
          const saleChannelTaskFinished = saleChannel?.every((item) => !item.unfinishedTaskList);
          if (colIndex === 1 && record?.otherRightTask?.length === 0 && saleChannelTaskFinished) {
            return {
              colSpan: 3,
            };
          }
        }}
      />
    );
  };
  return (
    <div className="h-[100vh] overflow-y-auto" ref={contentRef}>
      <NewWorkLayout
        title={
          <span className="flex flex-row items-center mr-[16px]">
            跨境托管
            <a
              className="flex flex-row items-center text-[12px] ml-[16px] text-[#07f] cursor-pointer"
              onClick={() => OperationVideoDialog.open({ video: videoIntro, title: '1688全球生意模式介绍' })}
            >
              <img src="https://img.alicdn.com/imgextra/i3/O1CN01T8qIRZ23CMEWaQWau_!!6000000007219-2-tps-32-32.png" className="w-[16px] h-[16px] mr-[4px]" />
              <span>跨境生意模式介绍</span>
            </a>
          </span>
        }
      >
        <div className="flex flex-col gap-y-[16px]" >
          <NoticBoard />
          <div className="flex flex-row gap-x-[12px]">
            <div className="flex-1 overflow-hidden">
              <OperateTab cards={cards} action={action} setAction={setAction} dataList={dataList} isLoading={isLoading} data={bondData} handleActionClick={bondHandleActionClick} />
            </div>
            <div className="flex flex-col w-[300px] gap-y-[12px]">
              <CustodyMarginCard data={bondData} handleActionClick={bondHandleActionClick} queryChoiceBusinessBacklog={queryChoiceBusinessBacklog} />
              {modelData?.registrationStatus === 'REGISTER_SUCCESS' ? <AlipayInternationalAccount modelData={modelData} loading={modelDataLoading} /> : <NoticBanner />}
            </div>
          </div>
          {/* <div className="bg-[#fff] p-[20px] rounded-[6px]">
            <ChoiceBusinessOpportunity isShopJoinChoice={isShopJoinChoice} fetchChoiceBaseInfo={fetchChoiceBaseInfo} tableQuery={tableQuery} init={init} data={data} />
            <SingleProductRecruitment />
          </div> */}
          <Block
            id="table"
            className="blockWidth"
            title="跨境托管商品管理"
            subTitle={
              <div>
                <Button type="primary" text onClick={() => UnderstandDialog.open()}>了解跨境常见问题</Button>
                <Divider direction="ver" />
                <Button type="primary" text onClick={() => window.open('https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/Qnp9zOoBVBZzoQ55iy2vQ5RmV1DK0g6l', '_blank')}>权益说明</Button>
                <Divider direction="ver" />
                <Button type="primary" text onClick={() => window.open('https://work.1688.com/?_path_=sellerPro/tuoguan/gonghuoguanli', '_self')}>查看托管产品列表</Button>
              </div>
            }
          >
            <Tab
              activeKey={2}
              onChange={(key) => setActiveKey(key)}
              className="mt-[22px]"
              unmountInactiveTabs
            >
              {/* <Tab.Item title="未加入Choice" key="1">
                <TableCom />
              </Tab.Item> */}
              <Tab.Item title="已加入跨境托管" key="2">
                {defaultModel ? (
                  <TableCom />
                ) : (
                  <div className="flex justify-center items-center h-[556px] flex-col">
                    <img className="w-[120px] h-[120px] mb-[16px]" src="https://img.alicdn.com/imgextra/i3/O1CN019Ud9TD1ZwDOIOwZ7d_!!6000000003258-2-tps-480-480.png" alt="" />
                    <div className="text-center">
                      <div className="text-[14px] text-[#333] font-medium mb-[8px]">暂无跨境托管商品</div>
                      <div className="text-[12px] text-[#999] font-normal">您可以在【未加入跨境托管】列表中选择商品加入跨境托管。</div>
                      <div className="text-[12px] text-[#999] font-normal">商品加入跨境托管，立享专属流量！</div>
                    </div>
                  </div>
                )}
              </Tab.Item>
            </Tab>
          </Block>
        </div>
      </NewWorkLayout>
    </div>
  );
};

export default Select;
