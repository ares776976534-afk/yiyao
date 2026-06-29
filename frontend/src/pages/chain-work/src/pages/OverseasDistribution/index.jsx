import React, { useEffect, useState, useCallback } from 'react';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import DataBoard from './components/DataBoard';
import Notice from './components/Notice';
import NoticBoard from './components/NoticBoard';
import NoticBanner from '@/components/NoticBanner';
import TableList from './components/TableList';
import CrossBorderOfferlistDialog from '@/pages/CrossBorderOfferlist/components/Dialog';
import { querySellerType } from '@/pages/CrossBorderOfferlist/api';
import { getOfferCount, gmvRanking, pageOffer, querystatus } from './services';
import Message from '@/components/UI/Message';
import './index.scss';
import { Icon } from '@alifd/next';
import { Logger } from '@/utlis';
import DistributionPriceDialog from './components/DistributionPriceDialog';
import fatigue from '@alife/1688-chain-fatigue';
import { findSellerEntryDetail } from '@/components/YxInfoDialog/api';
import YxInfoDialog from '@/components/YxInfoDialog';
import {
  wasYxDialogShownToday,
  setYxDialogShownToday,
  YX_DIALOG_FATIGUE_KEYS,
  CROSS_BORDER_INFO_FATIGUE_KEYS,
} from '@/components/YxInfoDialog/fatigue';
import BatchCrossBorderInfoDialog from '@/components/BatchCrossBorderInfoDialog';
import { getNeedSetCrossInfoOfferCount } from '@/components/BatchCrossBorderInfoDialog/api';

Logger.init({ a: '海外分销', b: '海外分销' }, { pageKey: '海外分销' });

const YX_FATIGUE_KEY = YX_DIALOG_FATIGUE_KEYS.overseasDistribution;
const CROSS_INFO_FATIGUE_KEY = CROSS_BORDER_INFO_FATIGUE_KEYS.overseasDistribution;

const productsMap = {
  QQYX: 'qqyxItemCount',
  NOT_HTQQ: 'notHtqqItemCount',
  HTQQ_NOT_QQYX: 'htqqNotQqyxItemCount',
};
const products = [
  {
    name: '严选分销商品',
    code: 'QQYX',
    desc: '加入全球严选的商品，可享受海外分销特殊权益',
    subStatusList: [{ name: '商品数', code: 'QQYX', quantity: '-' }],
  },
  {
    name: '基础分销商品',
    code: 'HTQQ_NOT_QQYX',
    desc: '加入货通全球但未加入全球严选的商品，可被海外分销',
    subStatusList: [{ name: '商品数', code: 'HTQQ_NOT_QQYX', quantity: '-' }],
  },
  {
    name: '非分销商品',
    code: 'NOT_HTQQ',
    desc: '未加入货通全球的商品',
    subStatusList: [{ name: '商品数', code: 'NOT_HTQQ', quantity: '-' }],
  },
];

function OverseasDistribution() {
  const [productsList, setProductsList] = useState([]);
  const [gmvData, setGmvData] = useState({});
  // 是否展示横条
  const [isShowDistributionPrice, setIsShowDistributionPrice] = useState(false);
  const [yxInfoDialogVisible, setYxInfoDialogVisible] = useState(false);
  const [needSetCrossInfoOfferCount, setNeedSetCrossInfoOfferCount] = useState(0);
  const [crossBorderOnlyOfferCount, setCrossBorderOnlyOfferCount] = useState(0);
  const [batchCrossBorderInfoDialogVisible, setBatchCrossBorderInfoDialogVisible] = useState(false);
  // 弹窗队列：优先级 货通全球 > 跨境信息 > 严选
  const [dialogQueue, setDialogQueue] = useState([]);
  const [currentDialog, setCurrentDialog] = useState(null);

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
        setDialogQueue((prev) => prev.slice(1));
        setCurrentDialog(null);
      }
    },
    [currentDialog],
  );
  const px = (list) => {
    // Step 1: 转换所有日期为 MM/DD 格式
    const transformed = list.map((item) => {
      const month = item.bizdate.substring(4, 6);
      const day = item.bizdate.substring(6, 8);
      return {
        ...item,
        bizdate: `${month}/${day}`,
      };
    });
    // Step 2: 去重（避免重复的日期）
    const removeDuplicateDates = (arr) => {
      const seen = new Set();
      return arr.filter((item) => {
        if (seen.has(item.bizdate)) {
          return false; // 已存在，跳过
        } else {
          seen.add(item.bizdate);
          return true; // 保留第一个出现的
        }
      });
    };
    const uniqueTransformed = removeDuplicateDates(transformed);
    // Step 3: 按月份和日期排序
    const newList = uniqueTransformed.sort((a, b) => {
      const [monthA, dayA] = a.bizdate.split('/').map(Number);
      const [monthB, dayB] = b.bizdate.split('/').map(Number);
      if (monthA !== monthB) {
        return monthA - monthB; // 先按月份排序
      } else {
        return dayA - dayB; // 再按日期排序
      }
    });
    return newList;
  };
  const queryGmvRanking = () => {
    gmvRanking()
      .then((res) => {
        const { result = {}, errorMsg = '数据加载失败，请稍后重试' } = res;
        if (errorMsg === 'success') {
          setGmvData({
            ...result,
            ranking: px(result?.ranking),
          });
        } else {
          Message._show({ content: errorMsg, type: 'error' });
        }
      })
      .catch((err) => {
        Message._show({ content: err.errMsg || '系统异常', type: 'error' });
      });
  };
  const queryOfferCount = () => {
    getOfferCount()
      .then((res) => {
        const { success = false, model = {}, msg = '数据加载失败，请稍后重试' } = res;
        if (success) {
          setProductsList(
            products.map((ele) => {
              return {
                ...ele,
                subStatusList: [{ name: '商品数', code: ele.code, quantity: model[productsMap[ele.code]] }],
              };
            }),
          );
        } else {
          Message._show({ content: msg, type: 'error' });
        }
      })
      .catch((err) => {
        Message._show({ content: err.errMsg || '系统异常', type: 'error' });
      });
  };
  // 获取fatigue
  const getFatigue = (itemId) => {
    querystatus()
      .then((res) => {
        const { bizSuccess, data, errorMsg } = res || {};
        if (bizSuccess) {
          setIsShowDistributionPrice(!data);
          if (itemId) {
            if (data) {
              window.open(
                `https://air.1688.com/app/channel-fe/channel-work/productmanager.html?editMode=overseaEdit&editOffer=${itemId}`,
              );
            } else {
              DistributionPriceDialog.open({
                handleActionClick,
                handleClose: () => window.open(`https://offer-new.1688.com/page/publish.html?offerId=${itemId}`),
              });
            }
          }
        } else {
          Message._show({ content: errorMsg || '系统异常', type: 'error' });
        }
      })
      .catch((err) => {
        Message._show({ content: err.errorMessage || '系统异常', type: 'error' });
      });
  };
  const handleActionClick = () => {
    queryOfferCount();
    getFatigue();
  };
  useEffect(() => {
    queryGmvRanking();
    queryOfferCount();
    getFatigue();

    // 检查所有弹窗条件，按优先级加入队列
    Promise.all([
      // 货通全球弹窗检查
      Promise.all([querySellerType(5117249), querySellerType(5117313)])
        .then((res) => {
          if (res[0]?.data?.data === 'true' && res[1]?.data?.data === 'false') {
            return { type: 'htqq' };
          }
          return null;
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
            return {
              type: 'crossInfo',
              count: crossBorderOnlyCount,
              crossBorderOnlyOfferCount: crossBorderServiceCount,
            };
          }
          return null;
        })
        .catch(() => null),
      // 海外分销
      // 严选弹窗检查
      findSellerEntryDetail()
        .then((res) => {
          if (res?.data?.status === 'active' && res?.data?.signStatus === 'active') {
            return null; // 已经签约过，不弹
          }
          return { type: 'yx' };
        })
        .catch(() => null),
    ]).then((results) => {
      // 按优先级顺序加入队列：货通全球 > 跨境信息 > 严选；严选受疲劳度控制，一天最多弹一次
      const queue = [];
      if (results[0]) queue.push(results[0]); // 货通全球
      if (results[1] && !wasYxDialogShownToday(CROSS_INFO_FATIGUE_KEY)) queue.push(results[1]); // 跨境信息（一天最多一次）
      if (results[2] && !wasYxDialogShownToday(YX_FATIGUE_KEY)) queue.push(results[2]); // 严选

      if (queue.length > 0) {
        setDialogQueue(queue);
      }
    });
  }, []);

  const TableListCom = () => {
    return productsList.length > 0 && <TableList productsList={productsList} getFatigue={getFatigue} />;
  };
  return (
    <NewWorkLayout
      title={
        <div className="flex flex-row items-center gap-x-[12px]">
          <div className="text-[#333] text-[16px] text-midium leading-[19px]">海外分销</div>
          <div
            className="text-[#999] text-[14px] flex items-center cursor-pointer feedback"
            onClick={() => {
              window.open('https://survey.1688.com/apps/zhiliao/JnLXxIoS-', '_blank');
            }}
          >
            <Icon type="ic_edit1" />
            <span style={{ fontWeight: 400, marginLeft: 4 }}>意见反馈</span>
          </div>
        </div>
      }
    >
      <div className="flex flex-row gap-x-[16px]">
        <div className="flex-1 overflow-hidden">
          <Notice />
          <DataBoard />
        </div>
        <div className="flex flex-col w-[300px]">
          <NoticBoard gmvData={gmvData} />
          <NoticBanner resourceId={37906390} />
        </div>
      </div>
      {isShowDistributionPrice && (
        <div className="flex flex-row items-center text-[14px] leading-[22px] text-[#666] py-[9px] px-[12px] bg-[#FFF9EB] rounded-[6px] mt-[16px]">
          <img
            src="https://img.alicdn.com/imgextra/i2/O1CN01iWdkRO25KGI433Uin_!!6000000007507-2-tps-16-15.png"
            alt=""
            srcSet=""
          />
          <span className="ml-[8px] mr-[8px]">您还未进行跨境分销价格确认，请尽快确认</span>
          <span
            className="text-[#0077FF] cursor-pointer ml-[4px]"
            onClick={() => {
              DistributionPriceDialog.open({ handleActionClick });
            }}
          >
            去确认
          </span>
        </div>
      )}
      <TableListCom />

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

export default OverseasDistribution;
