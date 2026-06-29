import React, { useState } from 'react';
import { Balloon, Button, Dropdown, Menu, Divider } from '@alifd/next';
import { ITEM_TYPE, TIME_RANGE } from '@/pages/Select/enums';
import PieceWeightDialog from '../components/PieceWeightDialog';
import QualificationsDialog from '../components/QualificationsDialog';
import { Logger, splitArray, MessageError, MessageSuccess } from '@/utlis';
import TagLabel from '@/components/TagLabel';
import ConfirmDialog from '../components/ConfirmDialog';
import CrossBorderDialog from '@/pages/CrossBorderOfferlist/components/CrossBorderDialog';
import QuitDialogCell from '../components/QuitDialogCell';
import BalloonFatigue from '../components/BalloonFatigue';
import OpenStatusLabel from '../components/OpenStatusLabel';
import { joinOfferQqjx } from '@/pages/CrossBorderOfferlist/api';
import ExpendMore from '../components/ExpendMore';

const onBindClick = ({ text, itemId }) => {
  return Logger.report({ c: itemId, d: 'CLK', e: `@source_2去优化@divert_${text}@funnel_优化任务` });
};
function handleClick({ actionCode, itemId, record, onActionClick }) {
  const _url = `https://offer-new.1688.com/page/publish.html?offerId=${itemId}`;
  switch (actionCode) {
    case 'item_weight': // 完善商品重量信息
      PieceWeightDialog.open({ records: { ...record, type: 'item_weight' }, onActionOk: () => onActionClick({ type: 'diffLevel', record }) });
      break;
    case 'item_48h_ship': // 商品开通48h内发货
    case 'sku_num':
    case 'not_sku':
    case 'ship_copy_error':
    case 'not_batch_sell_offer':
    case 'quick_back_scene_offer':
    case 'factory_mem_processing':
      window.open(_url);
      break;
    case 'item_pws': // 完善商品件重尺
      onBindClick({ text: '去件重尺填写', itemId });
      PieceWeightDialog.open({ records: record, onActionOk: () => onActionClick({ type: 'diffLevel', record }) });
      break;
    case 'item_cert': // 关联跨境证书
      onBindClick({ text: '去关联资质', itemId });
      QualificationsDialog.open({
        records: record,
        onActionOk: () => onActionClick({ type: 'goAssociate', record }),
      });
      break;
    case 'item_choice_upgrade': // 升级choice
      CrossBorderDialog.open({ onActionOk: () => onActionClick({ type: 'initFn' }) });
      break;
    case 'not_htqq_offer':
      joinOfferQqjx({ itemId })
        .then((res) => {
          if (res && res.data.bizSuccess) {
            MessageSuccess('加入成功，可在「已加入Choice」列表中进行管理。');
            onActionClick({ type: 'initFn' });
          } else {
            MessageError(res?.data?.errorMsg || '操作失败');
          }
        });
      break;
    default:
      console.log('未知操作', actionCode);
      break;
  }
}
const ACTION_OPERATION = {
  title: '操作',
  dataIndex: 'action',
  align: 'center',
  width: 110,
  lock: 'right',
  cell: (value, index, record = {}, others = {}) => {
    const { itemId, strategyId, supplyChannelList = [], productId } = record;
    const { onActionClick = () => { } } = others;

    const isDOM = supplyChannelList?.includes('DOM');

    const joinChoice = () => {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('itemId', itemId);
      currentUrl.searchParams.set('strategyId', strategyId);
      currentUrl.searchParams.set('recruitType', 'generic');
      const { origin, search } = currentUrl;
      window.location.href = `${origin}/app/channel-fe/chain-work/choicesingleproductrecruitment.html${search}`;
    };
    const submitReport = () => {
      if (isDOM) {
        window.open(`https://work.1688.com/?_hex_supplyProductId=${productId}&_path_=gonghuotuoguan/tuoguan/gonghuoguanli`);
      } else {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('itemId', itemId);
        const { origin, search } = currentUrl;
        window.location.href = `${origin}/app/channel-fe/chain-work/managesupplygoods.html${search}`;
      }
    };
    function actionHandleClick(actionCode) {
      switch (actionCode) {
        case '编辑跨境素材':
          navigateWithQueryParams({ itemId });
          break;
        case '管理资质证书':
          QualificationsDialog.open({
            records: record,
            onActionOk: () => onActionClick({ type: 'goAssociate', record }),
          });
          break;
        case '编辑件重尺':
          onBindClick({ text: '编辑件重尺', itemId });
          PieceWeightDialog.open({ records: record, onActionOk: () => onActionClick({ type: 'diffLevel', record }) });
          break;
        case '退出Choice':
          ConfirmDialog.open({
            records: {
              children: '退出后商品将失去Choice所有权益，可能导致跨境订单的流失，请谨慎操作。',
              title: '退出Choice',
              itemId,
            },
            onActionOk: () => onActionClick({ type: 'initFn' }),
          });
          break;
        case '加入Choice':
          joinChoice();
          break;
        case '退出全球严选':
        case '退出货通全球':
          QuitDialogCell.open({ records: { itemId, text: actionCode }, onActionOk: () => onActionClick({ type: 'exit', record }) });
          break;
        case '管理托管产品':
          submitReport();
          break;
        default:
          console.log('未知操作', actionCode);
          break;
      }
    }
    const More = ({ btns }) => {
      const menu = (
        <Menu>
          {btns.map((Item) => (
            <Menu.Item key={Item} onClick={() => actionHandleClick(Item)} className="text-[#0077FF]">{Item}</Menu.Item>
          ))}
        </Menu>
      );

      return (
        <Dropdown
          trigger={
            <Button
              type="primary"
              text
            >
              更多
            </Button>
          }
          triggerType="hover"
        >
          {menu}
        </Dropdown>
      );
    };
    const [showBtns, moreBtns] = splitArray(record?.action, 2);
    return (
      <div className="flex flex-col items-start">
        {showBtns?.map((item) => {
          return item === '管理托管产品' && index === 0 ? (
            <BalloonFatigue
              trigger={(
                <Button
                  type="primary"
                  onClick={submitReport}
                  text
                  key={item}
                  style={{ marginBottom: 8 }}
                >
                  {item}
                </Button>
              )}
              align="tl"
              fatigueKey="Choice-supply-balloon-fatigue"
              title="新增“管理托管产品”功能"
              content="成功托管售卖的商品会有对应的托管产品，您需要在托管产品上维护价格及可提供的库存，托管将不会使用您原有商品价格、库存信息。"
            />
          ) : (
            <Button
              type="primary"
              onClick={() => actionHandleClick(item)}
              text
              key={item}
              style={{ marginBottom: 8 }}
            >
              {item}
            </Button>
          );
        })}
        {moreBtns.length > 0 && <More btns={moreBtns} />}
      </div>
    );
  },
};

const SALES_CHANNEL = {
  title: '跨境托管售卖渠道',
  dataIndex: 'salesChannel',
  align: 'center',
  width: 300,
  cell: (value, index, record = {}) => {
    const { saleChannel = [] } = record;
    return (
      <div className="flex flex-col items-start gap-y-[12px]">
        {
          saleChannel.map((channel) => (
            <OpenStatusLabel status={channel.isPass === true ? 'open' : 'close'} key={channel.saleChannelDesc}>
              {
                channel.saleChannelDesc
              }
            </OpenStatusLabel>
          ))
        }
        {
          !saleChannel.length && <div className="text-[#BBBBBB] text-center">正在校验</div>
        }
      </div>
    );
  },
};

const SALE_CHANNEL_TASK = {
  title: '开启售卖渠道完成的任务',
  width: 240,
  cell: (value, index, record = {}, others = {}) => {
    const { saleChannel = [], itemId } = record;
    const { onActionClick = () => { } } = others;
    const taskList = [];
    saleChannel.forEach((item) => {
      if (item.unfinishedTaskList) {
        taskList.push(...item.unfinishedTaskList);
      }
    });
    const isTask = taskList.length !== 0;
    return (
      <ExpendMore>
        {
          isTask ? taskList.map((task, i) => {
            return (
              <div className="ml-[-12px] mr-[-16px]" key={task?.code}>
                <div className={`ml-[12px] mr-[16px] text-[#333] flex ${task?.length - 1 !== i && 'mb-[8px]'}`} key={task?.action}>
                  <span className="mr-[4px]">{task?.optimizeDesc}</span>
                  <Button
                    type="primary"
                    onClick={() => handleClick({
                      actionCode: task?.code,
                      itemId,
                      record,
                      onActionClick,
                    })}
                    text
                  >
                    {task?.action}
                  </Button>
                </div>
              </div>
            );
          }) : [<div className="text-[#BBBBBB]">已完成所有任务</div>]
        }
      </ExpendMore>
    );
  },
};

// 获取权益需完成优化任务
const NEED_COMPLETED_OPTIMIZATION_TASKS = {
  title: '其他权益及任务',
  width: 240,
  cell: (value, index, record = {}, others = {}) => {
    const { itemId, otherRightTask = [] } = record;
    const { onActionClick = () => { } } = others;
    const isOtherTask = otherRightTask.length !== 0;
    return (
      <div className="flex flex-col items-start gap-y-[12px]">
        {
          isOtherTask ? otherRightTask?.map((ele, i) => {
            const isPass = ele.isPass === true;
            const choiceRightText = ele.choiceRightDesc;
            return isPass ? <OpenStatusLabel status={'open'}>{choiceRightText}</OpenStatusLabel> : ele?.unfinishedTaskList?.map((item) => (
              <OpenStatusLabel status={'close'}>
                <div className="flex flex-row items-center" key={item?.action}>
                  <span className="mr-[4px]">{choiceRightText}</span>
                  <Button
                    type="primary"
                    onClick={() => handleClick({
                      actionCode: item?.code,
                      itemId,
                      record,
                      onActionClick,
                    })}
                    text
                  >
                    {item?.action}
                  </Button>
                </div>
              </OpenStatusLabel>
            ));
          }) : <div className="text-[#BBBBBB]">需完成售卖任务后再获取其他权益</div>
        }
      </div>
    );
  },
};
function navigateWithQueryParams({ itemId }) {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('itemId', itemId);
  const { origin, search } = currentUrl;
  window.location.href = `${origin}/app/channel-fe/chain-work/crossbordermaterials.html${search}`;
}

const OPTIMIZATION_TASKS = {
  title: '优化建议',
  dataIndex: 'optimizeTask',
  align: 'center',
  cell: (value, index, record, others = {}) => {
    const { unFinishedTaskList, itemId } = record;
    const { onActionClick = () => { } } = others;
    return (
      <div className="text-center">
        {unFinishedTaskList?.length > 0 ? unFinishedTaskList?.map((ele) => (
          <div className="mb-[4px] flex justify-center" key={ele.code}>
            <span className="mr-[12px]">{ele.optimizeDesc}</span>
            <Button
              type="primary"
              onClick={() => handleClick({
                actionCode: ele?.code,
                itemId,
                record,
                onActionClick,
              })}
              text
              data-report-primary-key={itemId}
              data-report-attribute-exp={ele.action.includes('去关联') ? '@source_1优化任务曝光@divert_去关联资质@funnel_优化任务' : '@source_1优化任务曝光@divert_去件重尺填写@funnel_优化任务'}
            >
              {ele.action}
            </Button>
          </div>
        )) : '-'}
      </div>
    );
  },
};
// 商机信息
const BUSINESS_INFO = {
  title: '商机信息',
  dataIndex: 'isKjOpp',
  cell: (value, index, record) => {
    const { oppTextList, isKjOpp } = record;
    return (
      <div>
        {isKjOpp === 'true' ? (
          oppTextList?.map((ele) => (
            <div key={ele}>{ele}</div>
          ))
        ) : <div className="text-[#999]">——</div>}
      </div>
    );
  },
};

export default (status) => {
  const [active, setActive] = useState('last7Days');
  const PRODUCT_INFO = {
    title: '商品信息',
    dataIndex: 'itemId',
    width: status === '2' && 220,
    lock: 'left',
    cell: (value, index, record) => {
      const { itemId, title, imageUrl, itemType, isKjOpp } = record;
      const hasImage = !!imageUrl; // 是否有图片
      return (
        <div className="mb-[3px] flex">
          {hasImage && (
            <a
              href={`https://detail.1688.com/offer/${itemId}.html`}
              target="_blank"
              rel="noreferrer"
              style={{ cursor: 'pointer' }}
            >
              <div className="w-[60px] h-[60px] mr-[8px] ">
                <img className="rounded-[6px]" src={imageUrl} alt="img" />
              </div>
            </a>
          )}
          <div>
            <div className="flex justify-between w-full">
              <div className="flex flex-col justify-between">
                {title?.length < (status === '2' ? 20 : 32) ? (
                  <span className="text-sm text-[#333] text-ellipsis line-clamp-2"> {title}</span>
                ) : (
                  <Balloon.Tooltip
                    trigger={<div className="text-sm text-[#333] text-ellipsis line-clamp-2">{title}</div>}
                    align="t"
                    popupStyle={{ backgroundColor: '#333' }}
                    popupClassName="products-business-tooltips"
                  >
                    <span className="">{title}</span>
                  </Balloon.Tooltip>
                )}
                <div className="text-[#999] text-[13px] mt-[4px]">ID：{itemId}</div>
              </div>
            </div>
            <div className="flex">
              {itemType?.map((ele) => (
                <div key={ele} className="w-[54px] mr-[4px]">
                  <TagLabel type="normal">{ITEM_TYPE[ele]}</TagLabel>
                </div>
              ))}
              {isKjOpp === 'true' && (
                <div className="w-[54px]">
                  <TagLabel type="primary">跨境商机</TagLabel>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    },
  };
  // 商品数据
  const PRODUCT_DATA = {
    title: (
      <div className="w-[100%] text-center">
        <span className="mr-[16px]">商品数据</span>
        {TIME_RANGE.map((ele) => (
          <span key={ele.key}>
            <span
              onClick={() => setActive(ele.key)}
              className={`text-[12px] ${active === ele.key ? 'text-[#0077FF]' : 'text-[#666]'} cursor-pointer`}
            >
              {ele.title}
            </span>
            {ele.key === 'last7Days' && <Divider direction="ver" />}
          </span>
        ))}
      </div>
    ),
    dataIndex: 'productData',
    width: '360px',
    align: 'center',
    children: [
      {
        title: '曝光次数',
        dataIndex: 'supplyGoodsId',
        alignHeader: 'center',
        width: 110,
        cell: (value, index, record) => {
          const { itemData = {} } = record;
          return (
            <div>{itemData[active]?.exposureTimes}</div>
          );
        },
      },
      {
        title: '累计成交订单',
        dataIndex: 'supplyGoodsId',
        alignHeader: 'center',
        width: 116,
        cell: (value, index, record) => {
          const { itemData = {} } = record;
          return (
            <div>{itemData[active]?.totalOrder}</div>
          );
        },
      },
      {
        title: '累计GMV（元）',
        dataIndex: 'supplyGoodsId',
        alignHeader: 'center',
        width: 134,
        cell: (value, index, record) => {
          const { itemData = {} } = record;
          return (
            <div>{itemData[active]?.totalAmount}</div>
          );
        },
      },
    ],
  };
  switch (status) {
    // case '0':
    //   return [PRODUCT_INFO, OPTIMIZATION_TASKS, ACTION_OPERATION];
    case '1':
      return [PRODUCT_INFO, BUSINESS_INFO, OPTIMIZATION_TASKS, ACTION_OPERATION];
    case '2':
      return [PRODUCT_INFO, SALES_CHANNEL, SALE_CHANNEL_TASK, NEED_COMPLETED_OPTIMIZATION_TASKS, PRODUCT_DATA, ACTION_OPERATION];
    default:
      return [];
  }
};
