import React, { useEffect, useState, useCallback } from 'react';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import SaleData from './components/SaleData';
import NoticBanner from '@/components/NoticBanner';
import NoticBoard from './components/NoticBoard';
import TableList from './components/TableList';
import { querySellerDataBoard, queryIsPopWindow } from './services';
import Message from '@/components/UI/Message';
import './index.scss';
import { Logger } from '@/utlis';
import SLevelPromotionPeriod from './components/SLevelPromotionPeriod';
import { Icon } from '@alifd/next';
import OperationVideoDialog from '@/components/OperationVideoDialog';
import { videoIntro } from '@/pages/AliExpress/enums';
import DescribeDom from '@/pages/AliExpress/components/DescribeDom';
import YxInfoDialog from '@/components/YxInfoDialog';
import { findSellerEntryDetail } from '@/components/YxInfoDialog/api';
import {
  wasYxDialogShownToday,
  setYxDialogShownToday,
  YX_DIALOG_FATIGUE_KEYS,
  CROSS_BORDER_INFO_FATIGUE_KEYS,
} from '@/components/YxInfoDialog/fatigue';
import BatchCrossBorderInfoDialog from '@/components/BatchCrossBorderInfoDialog';
import { getNeedSetCrossInfoOfferCount } from '@/components/BatchCrossBorderInfoDialog/api';
import AeManufacturerDialog from '@/pages/AeOrder/components/AeManufacturerDialog';
import { querySellerType } from '@/pages/CrossBorderOfferlist/api';

const YX_FATIGUE_KEY = YX_DIALOG_FATIGUE_KEYS.aliexpress;
const CROSS_INFO_FATIGUE_KEY = CROSS_BORDER_INFO_FATIGUE_KEYS.aliexpress;

Logger.init({ a: 'Aliexpress', b: 'Aliexpress' }, { pageKey: 'Aliexpress' });

function AliExpress() {
  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState([]); // 内容看板
  const [yxInfoDialogVisible, setYxInfoDialogVisible] = useState(false);
  const [needSetCrossInfoOfferCount, setNeedSetCrossInfoOfferCount] = useState(0);
  const [crossBorderOnlyOfferCount, setCrossBorderOnlyOfferCount] = useState(0);
  const [batchCrossBorderInfoDialogVisible, setBatchCrossBorderInfoDialogVisible] = useState(false);
  // 弹窗队列：优先级 本页弹窗 > 跨境信息 > 严选；跨境信息/严选受疲劳度控制，一天最多弹一次
  const [dialogQueue, setDialogQueue] = useState([]);
  const [currentDialog, setCurrentDialog] = useState(null);

  const openDialog4 = (callback) => {
    querySellerType(660291)
      .then((res) => {
        if (res?.data?.data === 'false') {
          AeManufacturerDialog.open({
            onOk: () => callback?.(),
            onClose: () => callback?.(),
          });
        } else {
          callback?.();
        }
      })
      .catch(() => {
        callback?.();
      });
  };

  // 内容看板数据
  const fetchGetSendAndReceiveInfo = () => {
    setIsLoading(true);
    querySellerDataBoard()
      .then((res) => {
        const { success = false, model = [], msg = '数据加载失败' } = res;
        if (success) {
          setDataList(model);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          Message._show({ content: msg, type: 'error' });
        }
      })
      .catch((err) => {
        setIsLoading(false);
        Message._show({ content: err.errorMessage || '请求失败', type: 'error' });
      });
  };

  // 处理弹窗关闭，显示下一个（与 CrossBorderOfferlist 一致）
  const handleDialogClose = useCallback(
    (dialogType) => {
      if (currentDialog?.type === dialogType) {
        setDialogQueue((prev) => prev.slice(1));
        setCurrentDialog(null);
      }
    },
    [currentDialog],
  );

  // 处理弹窗队列，显示下一个弹窗（与 CrossBorderOfferlist 一致：展示时写入疲劳度）
  const processDialogQueue = useCallback(() => {
    if (dialogQueue.length === 0 || currentDialog) {
      return;
    }
    const nextDialog = dialogQueue[0];
    setCurrentDialog(nextDialog);

    switch (nextDialog.type) {
      case 'sLevel': // 本页弹窗
        SLevelPromotionPeriod.open({
          onClose: () => {
            setDialogQueue((prev) => prev.slice(1));
            setCurrentDialog(null);
          },
        });
        break;
      case 'crossInfo': // 跨境信息（展示时写入疲劳度，一天最多一次）
        setYxDialogShownToday(CROSS_INFO_FATIGUE_KEY);
        setNeedSetCrossInfoOfferCount(nextDialog.count ?? 0);
        setCrossBorderOnlyOfferCount(nextDialog.crossBorderOnlyOfferCount ?? 0);
        setBatchCrossBorderInfoDialogVisible(true);
        break;
      case 'yx': // 严选（展示时写入疲劳度，一天最多一次）
        setYxDialogShownToday(YX_FATIGUE_KEY);
        setYxInfoDialogVisible(true);
        break;
      default:
        break;
    }
  }, [dialogQueue, currentDialog, handleDialogClose]);

  useEffect(() => {
    if (!currentDialog && dialogQueue.length > 0) {
      processDialogQueue();
    }
  }, [currentDialog, dialogQueue, processDialogQueue]);

  // 查询是否要弹窗：按优先级建队，建队时做疲劳度校验（与 CrossBorderOfferlist 一致）
  const queryDialog = () => {
    const checkYx = () =>
      findSellerEntryDetail()
        .then((res) => {
          if (res?.data?.status === 'active' && res?.data?.signStatus === 'active') return null;
          return true;
        })
        .catch(() => null);

    Promise.all([queryIsPopWindow(), checkYx(), getNeedSetCrossInfoOfferCount()]).then(([popRes, needYx, crossInfoRes]) => {
      const { success = false, model = false, msg = '数据加载失败' } = popRes || {};
      if (!success) {
        Message._show({ content: msg, type: 'error' });
      }
      const crossBorderOnlyCount = crossInfoRes?.model?.crossBorderServiceOfferCount || 0;
      const crossBorderServiceCount = crossInfoRes?.model?.crossBorderOnlyOfferCount || 0;
      // 按优先级顺序加入队列：本页弹窗 > 跨境信息 > 严选；跨境信息/严选受疲劳度控制
      const queue = [];
      if (model) queue.push({ type: 'sLevel' });
      if ((crossBorderOnlyCount > 0 || crossBorderServiceCount > 0) && !wasYxDialogShownToday(CROSS_INFO_FATIGUE_KEY)) queue.push({ type: 'crossInfo', count: crossBorderOnlyCount, crossBorderOnlyOfferCount: crossBorderServiceCount });
      if (needYx && !wasYxDialogShownToday(YX_FATIGUE_KEY)) queue.push({ type: 'yx' });

      if (queue.length > 0) {
        setDialogQueue(queue);
      }
    }).catch((err) => {
      Message._show({ content: err.errorMessage || '请求失败', type: 'error' });
    });
  };

  useEffect(() => {
    openDialog4(queryDialog);
    fetchGetSendAndReceiveInfo();
  }, []);
  return (
    <NewWorkLayout
      title={
        <div className="header-title">
          <span className="text-[18px] text-[#333] leading-[19px]" style={{ fontWeight: 500 }}>
            速卖通订单
          </span>
          <a
            className="text-[14px] ml-[12px] link"
            target="_blank"
            href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/dQPGYqjpJYg0vYGGcl6ap4BDWakx1Z5N"
            onClick={() => {
              Logger.report({ d: 'CLK', e: '3点击按钮@funnel_操作指引' });
            }}
            rel="noreferrer"
          >
            操作指引
          </a>
          <a
            className="text-[14px] ml-[12px] link cursor-pointer flex items-center"
            onClick={() => {
              OperationVideoDialog.open({ video: videoIntro, content: <DescribeDom /> });
              Logger.report({ d: 'CLK', e: '3点击按钮@funnel_操作视频' });
            }}
          >
            <Icon type="ic_play1" size="small" style={{ marginRight: 4 }} />
            <span>操作视频</span>
          </a>
        </div>
      }
    >
      <div className="bg-[#fff] p-[20px] mb-[16px] text-[#666] text-[14px] rounded-[6px]">
        <div className="flex items-center gap-x-[4px] mb-[12px]">
          <img
            className="w-[16px] h-[16px]"
            src="https://img.alicdn.com/imgextra/i1/O1CN01f6V9qW2ANXDZ7xPc3_!!6000000008191-2-tps-32-32.png"
            alt=""
            srcSet=""
          />
          <span className="text-[#333] text-[16px] font-[500] h-[19px] flex items-center">公告</span>
        </div>
        <div className="flex flex-col leading-[17px] gap-y-[8px]">
          <div>
            1. 速卖通订单只展示近三个月订单；对于三个月以前的订单，可前往“
            <a
              className="link cursor-pointer"
              href="https://work.1688.com/?_path_=gonghuotuoguan/2017sellerbase_trade/saleList"
              target="_blank"
              rel="noreferrer"
            >
              已卖出的货品
            </a>
            ”进行查看。
          </div>
          <div>
            2.
            商家您好，根据速卖通平台发货时效要求，昨日14:00至今日14:00产生的采购订单，须在今日15:00前预约上门揽，并在今日24:00前完成揽收。请您尽快发货。
          </div>
          <div>
            3.
            为保障您持续获得速卖通渠道订单，建议您在速卖通渠道已动销的商品保持在架可售状态。如您确需下架或删除商品的，请您点击
            <a
              className="link cursor-pointer text-[13px] ml-[2px]"
              href="https://survey.1688.com/apps/zhiliao/DBau6KyIC"
              target="_blank"
              rel="noreferrer"
            >
              《商品下架申请》
            </a>
            提交需求，提交后我们会为您配置权限，5个工作日后您可操作下架或删除1688商品。
          </div>
          <div>
            4.
            针对速卖通上门揽订单，如您的订单在被揽收后接到“仅退款”申请的，在平台另行公告前，您可拒绝“仅退款”申请，平台会根据速卖通是否收到您的包裹判定“仅退款”或“退货退款”。
          </div>
          <div>
            5. 速卖通优选”订单工具上线啦，一键打单更轻松！
            <a
              className="link cursor-pointer"
              href="https://peixun.1688.com/space/l2AmoY1414wvQzdb/detail/gvNG4YZ7JneM3OddIRPpkDeqV2LD0oRE"
              target="_blank"
              rel="noreferrer"
            >
              点击查看
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-x-[16px] mt-[16px] mb-[16px]">
        <div className="py-[12px] px-[20px] bg-[#fff] rounded-[6px] flex-1">
          <SaleData dataList={dataList} isLoading={isLoading} />
        </div>
        <div className="flex flex-col w-[300px] gap-y-[12px]">
          <NoticBanner resourceId={37746680} />
          <NoticBoard id={37742777} />
        </div>
      </div>
      <TableList />
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
    </NewWorkLayout>
  );
}

export default AliExpress;
