import React from 'react';
import { Balloon, Button, Dropdown, Menu } from '@alifd/next';
import { splitArray, Logger } from '@/utlis';
import QualificationsDialog from '@/pages/Select/components/QualificationsDialog';
import QuitDialogCell from '@/pages/Select/components/QuitDialogCell';
import PieceWeightDialog from '@/pages/Select/components/PieceWeightDialog';
import { joinHtqq } from '@/pages/OverseasDistribution/services';
import Message from '@/components/UI/Message';

const ITEM_INFO = {
  title: '商品信息',
  dataIndex: 'itemId',
  width: 300,
  cell: (value, index, record) => {
    const { itemId = '', title = '', picUrl = '' } = record;
    const hasImage = !!picUrl; // 是否有图片
    return (
      <div className="mb-[3px] flex p-[16px]">
        {hasImage && <img className="rounded-[6px] w-[60px] h-[60px] mr-[8px] " src={picUrl} alt="img" />}
        <div className="flex flex-col justify-between">
          {title?.length < 32 ? (
            <span className="text-[14px] text-[#333] text-ellipsis line-clamp-2"> {title}</span>
          ) : (
            <Balloon.Tooltip
              trigger={<div className="text-[14px] text-[#333] text-ellipsis line-clamp-2">{title}</div>}
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
    );
  },
};
// 经营洞察
const BUSINESS_INSIGHTS = {
  title: '经营洞察',
  dataIndex: 'offerInsightInfoList',
  cell: (value, index, record) => {
    const { offerInsightInfoList = [] } = record;
    return (
      offerInsightInfoList?.map(({ insightName = '', insightTextList = [], offerAdviceInfoList = [] }, i) => {
        const height = offerAdviceInfoList?.length > insightTextList?.length ? offerAdviceInfoList?.length * 20 + (offerAdviceInfoList?.length - 1) * 8 : insightTextList?.length * 20 + (insightTextList?.length - 1) * 8;
        return (
          <div
            className="text-[#333] text-[14px] flex flex-col gap-y-[8px] p-[16px]"
            key={insightName}
            style={{
              borderBottom: offerInsightInfoList?.length - 1 === i ? 'none' : '1px solid #E5E5E5',
              // eslint-disable-next-line no-nested-ternary
              height: height < 0 ? 'auto' : insightName ? height + 52 : height + 32,
            }}
          >
            <div className="leading-[17px]">{insightName}</div>
            {insightTextList?.map((ele, ids) => (
              <div className="leading-[17px]" key={ele}>{ids + 1}. {ele}</div>
            ))}
          </div>
        )
      })
    );
  },
};
const handleClick = ({ adviceName, actionDesc, actionCode, itemId, record, onActionClick }) => {
  Logger.report({ d: 'CLK', e: `2海外分销${adviceName}点击按钮@funnel_${actionDesc}` });
  const _url = `https://offer-new.1688.com/page/publish.html?offerId=${itemId}`;
  switch (actionCode) {
    case 'OPEN_7D_RETURN': // 开通7天无理由退货
    case 'OPEN_24H_SHIP': // 商品开通24h内发货
    case 'EDIT_ITEM': // 去修改商品设置
      window.open(_url);
      break;
    case 'COMPLETE_ITEM_PWS': // 完善商品件重尺
      PieceWeightDialog.open({
        records: {
          ...record,
          imageUrl: record?.picUrl,
        },
        onActionOk: () => onActionClick({ type: 'reload' }),
      });
      break;
    case 'RELATE_ITEM_CERT': // 关联跨境证书
      QualificationsDialog.open({
        records: record,
        onActionOk: () => onActionClick({ type: 'reload' }),
      });
      break;
    case 'SET_PACKAGE_LANGUAGE': // 设置商品外包装语言
      navigateWithQueryParams({ itemId });
      break;
    case 'PROVIDE_CARTON_MARK': // 提供贴标箱唛服务
      navigateWithQueryParams({ itemId });
      break;
    case 'GO_SHIP': // 24小时揽收率
      window.open('https://work.1688.com/?_path_=sellerPro/lvyue/saleList');
      break;
    case 'JOIN_HTQQ': // 去加入-货通全球
      queryJoinHtqq(itemId, onActionClick);
      break;
    case 'JOIN_QQYX': // 去加入-全球严选
      onActionClick({ type: 'JOIN_QQYX', record });
      break;
    case 'EDIT_CROSS_DISTRIBUTION_PRICE':
      onActionClick({ type: 'EDIT_CROSS_DISTRIBUTION', record });
      break;
    default:
      break;
  }
};
// 经营建议
const BUSINESS_ADVICE = {
  title: '经营建议',
  dataIndex: 'businessAdvice',
  width: 340,
  cell: (value, index, record, others) => {
    const { offerInsightInfoList = [], itemId } = record;
    const { onActionClick = () => { } } = others;
    return (
      offerInsightInfoList.map(({ insightName = '', offerAdviceInfoList = [], insightTextList = [] }, i) => {
        const height = (offerAdviceInfoList?.length > insightTextList?.length ? offerAdviceInfoList?.length * 20 + (offerAdviceInfoList?.length - 1) * 8 : insightTextList?.length * 20 + (insightTextList?.length - 1) * 8)
        return (
          <div
            className="text-[#333] text-[14px] flex flex-col gap-y-[8px] p-[16px]"
            key={insightName}
            style={{
              borderBottom: offerInsightInfoList?.length - 1 === i ? 'none' : '1px solid #E5E5E5',
              // eslint-disable-next-line no-nested-ternary
              height: height < 0 ? 'auto' : insightName ? height + 52 : height + 32,
            }}
          >
            {offerAdviceInfoList?.length > 0 ? offerAdviceInfoList.map(({ adviceName = '', action = {} }) => (
              <div className="leading-[17px]" key={adviceName}>
                <span className="mr-[4px]">{adviceName}</span>
                <Button
                  type="primary"
                  onClick={() => handleClick({
                    adviceName,
                    actionDesc: action?.actionDesc,
                    actionCode: action?.actionCode,
                    itemId,
                    record,
                    onActionClick,
                  })}
                  text
                  data-report-primary-key={itemId}
                  data-report-attribute-exp={`1海外分销${adviceName}曝光@funnel_${action?.actionDesc}`}
                >
                  {action?.actionDesc}
                </Button>
              </div>
            )) : <div className="text-[14px] text-[#999] leading-[17px]">您已落实所有经营建议，我们将持续分析，为您提供新的优化方向</div>}
          </div>
        );
      })
    );
  },
};
// 非分销商品和基础分销商品经营建议
const BUSINESS_ADVICE_NON_DISTRIBUTION = {
  title: '经营建议',
  dataIndex: 'offerAdviceInfoList',
  width: 340,
  cell: (value, index, record, others) => {
    const { offerAdviceInfoList = [], itemId } = record;
    const { onActionClick = () => { } } = others;
    return (
      <div className="p-[16px]">
        {offerAdviceInfoList?.map(({ adviceName = '', action = {}, unfinishedSubTask = [] }) => (
          <div>
            <div className="leading-[17px]" key={adviceName}>
              <span className="mr-[4px]">{adviceName}</span>
              <Button
                type="primary"
                onClick={() => handleClick({
                  adviceName,
                  actionDesc: action?.actionDesc,
                  actionCode: action?.actionCode,
                  itemId,
                  record,
                  onActionClick,
                })}
                text
                data-report-primary-key={itemId}
                data-report-attribute-exp={`1海外分销${adviceName}曝光@funnel_${action?.actionDesc}`}
              >
                {action?.actionDesc}
              </Button>
            </div>
            <div className="mt-[8px]">
              {unfinishedSubTask?.map((ele, ids) => (
                <div className="leading-[17px]" key={ele}>
                  {ids + 1}. {ele}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
function navigateWithQueryParams({ itemId }) {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('itemId', itemId);
  currentUrl.searchParams.set('channel', 'crossbordermaterials');
  const { origin, search } = currentUrl;
  window.location.href = `${origin}/app/channel-fe/chain-work/crossbordermaterials.html${search}`;
}
const queryJoinHtqq = (itemId, onActionClick) => {
  joinHtqq({ offerId: itemId }).then((res) => {
    const { success, msg = '数据异常' } = res;
    if (success) {
      onActionClick({ type: 'reload' });
      Message._show({ content: '加入成功', type: 'success' });
    } else {
      Message._show({ content: msg, type: 'error' });
    }
  }).catch((err) => {
    Message._show({ content: err.errMsg || '系统异常', type: 'error' });
  });
};
// 操作
const OPERATION = {
  title: '操作',
  dataIndex: 'actionList',
  width: 150,
  cell: (value, index, record, others) => {
    const { itemId } = record;
    const { onActionClick = () => { } } = others;

    const actionHandleClick = (actionCode, actionDesc) => {
      Logger.report({ d: 'CLK', e: `2海外分销操作点击按钮@funnel_${actionDesc}` });
      switch (actionCode) {
        case 'JOIN_HTQQ': // 加入货通全球
          queryJoinHtqq(itemId, onActionClick);
          break;
        case 'JOIN_QQYX': // 加入全球严选
          onActionClick({ type: 'JOIN_QQYX', record });
          break;
        case 'CERT': // 管理资质证书
          QualificationsDialog.open({
            records: record,
            onActionOk: () => onActionClick({ type: 'reload' }),
          });
          break;
        case 'EDIT_KJXC': // 编辑跨境素材
          navigateWithQueryParams({ itemId });
          break;
        case 'QUIT_QQYX':
        case 'QUIT_HTQQ': // 退出货通全球
          QuitDialogCell.open({ records: { itemId, text: actionDesc }, onActionOk: () => onActionClick({ type: 'reload', record }) });
          break;
        case 'EDIT_CROSS_DISTRIBUTION_PRICE':
          onActionClick({ type: 'EDIT_CROSS_DISTRIBUTION_PRICE', record });
          break;
        default:
          break;
      }
    };
    const More = ({ btns }) => {
      const menu = (
        <Menu>
          {btns.map(({ actionCode = '', actionDesc = '' }) => (
            <Menu.Item
              key={actionCode}
              onClick={() => actionHandleClick(actionCode, actionDesc)}
              className="text-[#0077FF]"
              data-report-primary-key={itemId}
              data-report-attribute-exp={`1海外分销操作按钮曝光@funnel_${actionDesc}`}
            >
              {actionDesc}
            </Menu.Item>
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
    const [showBtns, moreBtns] = splitArray(record?.actionList, 2);
    return (
      <div className="flex flex-col items-start p-[16px]">
        {showBtns?.map(({ actionCode = '', actionDesc = '' }) => {
          return (
            <Button
              type="primary"
              onClick={() => actionHandleClick(actionCode, actionDesc)}
              text
              key={actionCode}
              style={{ marginBottom: 8 }}
              data-report-primary-key={itemId}
              data-report-attribute-exp={`1海外分销操作按钮曝光@funnel_${actionDesc}`}
            >
              {actionDesc}
            </Button>
          );
        })}
        {moreBtns?.length > 0 && <More btns={moreBtns} />}
      </div>
    );
  },
};

export default (status) => {
  switch (status) {
    case 'QQYX':
      return [ITEM_INFO, BUSINESS_INSIGHTS, BUSINESS_ADVICE, OPERATION];
    default:
      return [ITEM_INFO, BUSINESS_ADVICE_NON_DISTRIBUTION, OPERATION];
  }
};
