import React, { useState, useEffect, useCallback, useRef } from 'react';
import urlParser from 'url';
import TabComp from './components/Tab';
import BusinessComp from './components/businessComp';
// import QqjxJoinDialog from './components/qqjxJoinDialog';
import Notice from './components/Notice';
import './index.scss';
import { BatchResultDialogCell, qqjx_agreement_text_cell } from '@/pages/CrossBorderOfferlist/utils';
import { querySellerType, queryOfferModelList, getAp, setAp, getChoiceBaseInfo, queryCommissionAgreement } from './api';
import { sellerFail, offerFail } from './variables';
import { Logger, MessageError } from '@/utlis';
import CrossBorderDialog from './components/CrossBorderDialog';
import CrossBorderOfferlistDialog from './components/Dialog';
import logger from '@alife/channel-uni-event-logger';
import AeManufacturerDialog from '@/pages/AeOrder/components/AeManufacturerDialog';
import Board from './components/Board';
import { Divider } from '@alifd/next';
import NewProductOpportunities from './components/NewProductOpportunities';
import BusinessToDo from './BusinessToDo';
import AoXiaBanner from './components/AoXiaBanner';
import BatchCrossBorderInfoDialog from '@/components/BatchCrossBorderInfoDialog';
import { getNeedSetCrossInfoOfferCount } from '@/components/BatchCrossBorderInfoDialog/api';
import YxInfoDialog from '@/components/YxInfoDialog';
import { findSellerEntryDetail } from '@/components/YxInfoDialog/api';
import {
  wasYxDialogShownToday,
  setYxDialogShownToday,
  YX_DIALOG_FATIGUE_KEYS,
  CROSS_BORDER_INFO_FATIGUE_KEYS,
} from '@/components/YxInfoDialog/fatigue';

const YX_FATIGUE_KEY = YX_DIALOG_FATIGUE_KEYS.crossBorderOfferlist;
const CROSS_INFO_FATIGUE_KEY = CROSS_BORDER_INFO_FATIGUE_KEYS.crossBorderOfferlist;
Logger.init({ a: '全球严选', b: '全球严选' }, { pageKey: 'crossborderofferlist' });

// const dialogParams = {
//   title: '加入全球严选，享受核心资源',
//   subtitle:
//     '您有多款商品被跨境买家选中，商品将获得标题、主图、详情页AI智能多语言翻译和卖点提炼，更可在跨境专供频道、寻源通API、全球直采、寻源换供等跨境渠道获得核心资源扶持，请您立即将全量被选中商品加入“全球严选”，获取跨境订单！了解更多权益',
//   agreementCellLabel: qqjx_agreement_text_cell,
// };

const CrossBorderComp = () => {
  // const [visible, setVisible] = useState(false);
  const [balloonVisible, setBalloonVisible] = useState(false);
  const [sellerStatus, setSellerStatus] = useState(1);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState('全球严选');
  const [batchJoinResultParams, setBatchJoinResultParams] = useState({});
  // const [updateCount, setUpdateCount] = useState(false);
  const [dialogStatus, setDialogStatus] = useState(null);
  // const [businessParams, setBusinessParams] = useState({});
  // const [isDialog, setIsDialog] = useState(false);
  // const [from, setFrom] = useState('default');
  // const [status, setStatus] = useState(null);
  const [isBusinessComp, setIsBusinessComp] = useState(false);
  const [needSetCrossInfoOfferCount, setNeedSetCrossInfoOfferCount] = useState(0);
  const [crossBorderOnlyOfferCount, setCrossBorderOnlyOfferCount] = useState(0);
  const [batchCrossBorderInfoDialogVisible, setBatchCrossBorderInfoDialogVisible] = useState(false);
  const [yxInfoDialogVisible, setYxInfoDialogVisible] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  // 弹窗队列：优先级 货通全球 > 跨境信息 > 严选
  const [dialogQueue, setDialogQueue] = useState([]);
  const [currentDialog, setCurrentDialog] = useState(null);
  // 加入全球严选弹窗（父组件受控展示）
  const [joinDialogVisible, setJoinDialogVisible] = useState(false);
  const businessToDoRef = useRef();
  function navigateWithQueryParams() {
    const currentUrl = new URL(window.location.href);
    const { origin } = currentUrl;
    window.location.href = `${origin}/app/channel-fe/chain-work/select.html`;
  }
  // const fetchChoiceBaseInfo = () => {
  //   getChoiceBaseInfo().then((r) => {
  //     if (r.success && r?.content) {
  //       // 跨境业务模式升级Dilog
  //       if (r?.content.model.needChoiceUpgrade) {
  //         CrossBorderDialog.open({
  //           navigateWithQueryParams,
  //           onActionOk: openDialog4,
  //           onActionClose: openDialog4,
  //         });
  //       } else {
  //         openDialog4();
  //       }
  //     } else {
  //       MessageError(r.errorMsg || '系统异常');
  //       openDialog4();
  //     }
  //   });
  // };

  // const openDialog2 = () => {
  //   const oppTag = type === '全球严选' ? '' : type;
  //   const _params = {
  //     pageNo: 1,
  //     pageSize: 9,
  //     ruleId: '901094',
  //     filterTag: '415426,575939',
  //     filterParams: { selectValue: '901094' },
  //     oppTag,
  //   };
  //   queryOfferModelList(_params).then((_res) => {
  //     if (_res.data) {
  //       // 商家是否有商品
  //       const hasCommodity = _res.data.data?.length > 0;
  //       setSellerStatus(hasCommodity ? 1 : 3);
  //       setTotal(_res.data?.total);
  //       // 获取疲劳度
  //       const { query } = urlParser.parse(location.href, true);
  //       const { no_fatigue } = query || {};
  //       if (hasCommodity) {
  //         // 已入驻“全球严选”，没有入驻“精选货源”并且有可入驻的商品
  //         if (no_fatigue === 'true') {
  //           // 通过指定链接参数进来的没有疲劳度限制
  //           setVisible(true);
  //         } else {
  //           // 疲劳度限制
  //           getAp('chain-work-qqjx-join-dialog-key').then((result) => {
  //             // true - 不在疲劳有效期内-弹窗；false - 在有效期内-不弹窗
  //             if (!result) {
  //               setTimeout(() => {
  //                 // 设置疲劳度
  //                 // const ex = 20; // 单位秒 一天=86400秒
  //                 const ex = 86400; // 单位秒 一天=86400秒
  //                 setAp('chain-work-qqjx-join-dialog-key', ex).then((apResult) => {
  //                   // true - 成功；false - 失败
  //                   if (apResult) {
  //                     // console.log('疲劳度设置成功');
  //                   }
  //                 });
  //                 setVisible(true);
  //               }, 200);
  //             } else {
  //               fetchChoiceBaseInfo();
  //             }
  //           });
  //         }
  //       } else {
  //         fetchChoiceBaseInfo();
  //       }
  //     } else {
  //       fetchChoiceBaseInfo();
  //       setTotal(0);
  //     }
  //   });
  // };

  // 处理弹窗队列，显示下一个弹窗
  const processDialogQueue = useCallback(() => {
    if (dialogQueue.length === 0 || currentDialog) {
      return;
    }

    const nextDialog = dialogQueue[0];
    setCurrentDialog(nextDialog);

    // 根据弹窗类型显示对应的弹窗
    switch (nextDialog.type) {
      case 'htqq': // 货通全球
        CrossBorderOfferlistDialog.open(() => {
          // 货通全球弹窗关闭后的回调
          setDialogQueue((prev) => prev.slice(1));
          setCurrentDialog(null);
          // 关闭后执行 openDialog4（这是原有逻辑）
          openDialog4();
        });
        logger.report({
          actionType: 'chain-work/crossborderofferlist@入驻弹窗',
        });
        break;
      case 'crossInfo': // 跨境信息（展示时写入疲劳度，一天最多一次）
        setYxDialogShownToday(CROSS_INFO_FATIGUE_KEY);
        setBatchCrossBorderInfoDialogVisible(true);
        break;
      case 'yx': // 严选（展示时写入疲劳度，一天最多一次）
        setYxDialogShownToday(YX_FATIGUE_KEY);
        setYxInfoDialogVisible(true);
        break;
      case 'qqjxJoin': // 加入全球严选（优先级最后）
        setJoinDialogVisible(true);
        break;
      default:
        break;
    }
  }, [dialogQueue, currentDialog]);

  // 当队列变化时，如果当前没有弹窗显示，则处理队列
  useEffect(() => {
    if (!currentDialog && dialogQueue.length > 0) {
      processDialogQueue();
    }
  }, [dialogQueue, currentDialog, processDialogQueue]);

  // 处理弹窗关闭，显示下一个
  const handleDialogClose = useCallback(
    (dialogType) => {
      if (currentDialog?.type === dialogType) {
        if (dialogType === 'qqjxJoin') {
          setJoinDialogVisible(false);
        }
        setDialogQueue((prev) => prev.slice(1));
        setCurrentDialog(null);
      }
    },
    [currentDialog],
  );

  // const isDialogClick = () => {
  //   setIsDialog(true);
  // };

  const openDialog4 = () => {
    querySellerType(660291)
      .then((res) => {
        if (res?.data?.data === 'false') {
          AeManufacturerDialog.open();
          logger.report({
            actionType: 'chain-work/crossborderofferlist@跨境速卖通协议弹窗',
          });
        }
      })
      .catch(() => {});
  };

  // const checkSellerStatus = () => {
  //   // 查询商家是否可加入全球严选
  //   querySellerType(5117313).then((res) => {
  //     if (res?.data) {
  //       // 商家是否符合资质
  //       if (res?.data?.data === 'true') {
  //         setSellerStatus(1);
  //         // 符合情况检验商品
  //       } else {
  //         setSellerStatus(2);
  //         openDialog4();
  //       }
  //     } else {
  //       openDialog4();
  //     }
  //   }).then(() => {
  //     // 查询 AE JIT和AE 优选 的 协议
  //     // AeJitDialog.open({ data: data2 });
  //   })
  //     .then(() => {
  //       // return querySellerTypes();
  //     })
  //     .catch(() => { });
  // };
  const failDialogContentCell = (_query) => {
    const { title, list = [] } = _query;
    return (
      <div className="failDialogContentCell">
        <p>{title}</p>
        {list?.map((item) => {
          return <p>{item}</p>;
        })}
      </div>
    );
  };

  // const updateBusinessFunc = (_visible, _params) => {
  //   setVisible(_visible);
  //   setBusinessParams(_params);
  // };

  // const updateDialogFunc = (_visible, _type = '', _params = {}, _sellerStatus = 0) => {
  //   const sellerStatusType = _sellerStatus || sellerStatus;
  //   setDialogStatus(sellerStatusType);
  //   setVisible(_visible);
  //   // 1 符合 / 2 商家资质不符合 / 3 商家无商品
  //   switch (sellerStatusType) {
  //     case 1:
  //       setType(_type);
  //       dialogParams = {
  //         title: _params.title,
  //         subtitle: _params.subtitle,
  //         agreementCellLabel: _params.footer || qqjx_agreement_text_cell,
  //       };
  //       break;
  //     case 2:
  //       setType(_type);
  //       dialogParams = {
  //         title: '全球严选报名提醒',
  //         subtitle: '',
  //         content: failDialogContentCell(sellerFail),
  //         agreementCellLabel: null,
  //       };
  //       break;
  //     case 3:
  //       setType(_type);
  //       dialogParams = {
  //         title: '全球严选报名提醒',
  //         subtitle: '',
  //         content: failDialogContentCell(offerFail),
  //         agreementCellLabel: null,
  //       };
  //       break;
  //     default:
  //       break;
  //   }
  // };

  useEffect(() => {
    // 检查所有弹窗条件，按优先级加入队列
    Promise.all([
      // 货通全球弹窗检查
      Promise.all([querySellerType(5117249), querySellerType(5117313)])
        .then((res) => {
          const needHtqqDialog = res[0]?.data?.data === 'true' && res[1]?.data?.data === 'false';
          // 如果不需要弹货通全球弹窗，且已入驻，执行 openDialog4
          if (!needHtqqDialog && res[1]?.data.data === 'true') {
            openDialog4();
          }
          return needHtqqDialog ? { type: 'htqq' } : null;
        })
        .catch(() => null),
      // 跨境信息弹窗检查
      getNeedSetCrossInfoOfferCount()
        .then((res) => {
          const crossBorderOnlyCount = res?.model?.crossBorderServiceOfferCount || 0;
          const crossBorderServiceCount = res?.model?.crossBorderOnlyOfferCount || 0;
          setNeedSetCrossInfoOfferCount(crossBorderOnlyCount);
          setCrossBorderOnlyOfferCount(crossBorderServiceCount);
          if (crossBorderOnlyCount > 0 || crossBorderServiceCount > 0) {
            return { type: 'crossInfo' };
          }
          return null;
        })
        .catch(() => null),
      // 全球严选
      // 严选弹窗检查
      findSellerEntryDetail()
        .then((res) => {
          if (res?.data?.status === 'active' && res?.data?.signStatus === 'active') {
            return null; // 已经签约过，不弹
          }
          return { type: 'yx' };
        })
        .catch(() => null),
      // 加入全球严选弹窗检查（优先级最后）- 一进页面就打开该弹窗的入口，已注释
      // queryCommissionAgreement().then((res) => {
      //   const { success, model } = res?.content || {};
      //   if (success && !model) {
      //     return { type: 'qqjxJoin' }; // 未签约则入队
      //   }
      //   return null;
      // }).catch(() => null),
      Promise.resolve(null), // 占位，保持 results 索引与下方 queue 一致
    ]).then((results) => {
      // 按优先级顺序加入队列：货通全球 > 跨境信息 > 严选 > 加入全球严选（最后）
      const queue = [];
      if (results[0]) queue.push(results[0]); // 货通全球
      if (results[1] && !wasYxDialogShownToday(CROSS_INFO_FATIGUE_KEY)) queue.push(results[1]); // 跨境信息（一天最多一次）
      if (results[2] && !wasYxDialogShownToday(YX_FATIGUE_KEY)) queue.push(results[2]); // 严选
      // if (results[3]) queue.push(results[3]); // 加入全球严选（一进页面就打开）- 已注释

      if (queue.length > 0) {
        setDialogQueue(queue);
      }
    });
  }, []);

  // NewProductOpportunities 组件数据加载完成后的回调
  const handleNewProductLoaded = useCallback(() => {
    // 延迟一下，确保页面布局完全稳定
    setTimeout(() => {
      const visitKey = 'crossborder-offerlist-visited';
      const hasVisited = localStorage.getItem(visitKey);

      if (!hasVisited) {
        // 第一次访问，展开 Dropdown
        setIsFirstVisit(true);
        localStorage.setItem(visitKey, 'true');
      }
    }, 300);
  }, []);

  return (
    <div className="cross-border-offer-list">
      <div className="title-top">全球严选</div>
      {/* <Banner resourceId={33059291} style={{ width: '100%', marginTop: '16px' }} /> */}
      {/* <MessageComp /> */}
      <AoXiaBanner />
      <Notice />
      <Board setIsBusinessComp={setIsBusinessComp} />
      {/* 年后需求注释 */}
      {isBusinessComp && (
        <BusinessComp
          // setUpdateCount={() => setUpdateCount(!updateCount)}
          // checkSellerStatus={checkSellerStatus}
          balloonVisible={balloonVisible}
          // updateDialogFunc={updateDialogFunc}
          total={total}
          // setFrom={setFrom}
          // updateBusinessFunc={updateBusinessFunc}
          // isDialogClick={isDialogClick}
        />
      )}
      <BusinessToDo
        ref={businessToDoRef}
        onCrossInfoClick={(count) => {
          setNeedSetCrossInfoOfferCount(count);
          setBatchCrossBorderInfoDialogVisible(true);
        }}
      />
      <NewProductOpportunities onLoaded={handleNewProductLoaded} />
      <TabComp
        balloonVisible={balloonVisible}
        isFirstVisit={isFirstVisit}
        onRefreshBusinessBacklog={() => businessToDoRef.current?.refreshBusinessBacklog()}
        joinDialogVisible={joinDialogVisible}
        onJoinDialogClose={() => handleDialogClose('qqjxJoin')}
      />
      {/* <QqjxJoinDialog
        setBatchJoinResultParams={setBatchJoinResultParams}
        visible={visible}
        dialogParams={dialogParams}
        updateDialogFunc={updateDialogFunc}
        type={type}
        updateCount={updateCount}
        from={from}
        dialogStatus={dialogStatus}
        businessParams={businessParams}
        onOk={() => {
          !isDialog && openDialog4();
        }}
        onClose={() => {
          !isDialog && openDialog4();
        }}
      /> */}
      <BatchResultDialogCell
        visible={batchJoinResultParams.visible}
        _status={batchJoinResultParams.status}
        _msg={batchJoinResultParams.msg}
        setBatchJoinResultParams={setBatchJoinResultParams}
      />

      {/* 跨境信息弹窗 */}
      <BatchCrossBorderInfoDialog
        count={needSetCrossInfoOfferCount}
        crossBorderOnlyOfferCount={crossBorderOnlyOfferCount}
        visible={batchCrossBorderInfoDialogVisible}
        onConfirm={() => {
          setBatchCrossBorderInfoDialogVisible(false);
          handleDialogClose('crossInfo');
          setTimeout(() => window.location.reload(), 500);
        }}
        onClose={() => {
          setBatchCrossBorderInfoDialogVisible(false);
          handleDialogClose('crossInfo');
        }}
      />

      {/* 严选弹窗 */}
      <YxInfoDialog
        visible={yxInfoDialogVisible}
        onClose={() => {
          setYxInfoDialogVisible(false);
          handleDialogClose('yx');
        }}
      />
    </div>
  );
};

export default CrossBorderComp;
