import React, { useState, useEffect } from 'react';
import { Table, Pagination, Balloon, Dialog, Icon, Button, Message, Divider } from '@alifd/next';
import './index.scss';
import TableSearch from './TableSearch';
import { queryOfferList, joinOfferQqjx, batchItemEnroll } from '../../api';
import QuitDialogComp from './compontents/quitDialogCell';
import JoinDialogCell from './compontents/joinDialogCell';
import JoinResultDialog from './compontents/joinResultDialog';
import logger from '@alife/channel-uni-event-logger';
import { BatchResultDialogCell } from '@/pages/CrossBorderOfferlist/utils';
import OperationDropdown from './compontents/OperationDropdown';
import { TIME_RANGE } from '@/pages/Select/enums';
import TagLabel from '@/components/TagLabel';
import BatchCrossBorderInfoDialog from '@/components/BatchCrossBorderInfoDialog';

const { Tooltip } = Balloon;
const tagQuery = {
  415426: '全球严选',
};
let init = false;

const JoinedOfferTable = (props) => {
  const {
    balloonVisible,
    isFirstVisit,
    currentChecked,
    pageNo,
    filterParams,
    errParams,
    setCurrentChecked,
    setPageNo,
    setErrParams,
    handleTanChange,
    onRefreshBusinessBacklog,
    joinDialogVisible: parentJoinDialogVisible,
    onJoinDialogClose,
    // setStatus,
  } = props;
  const [list, setList] = useState([]);
  const [qqjxSellerStatus, setQqjxSellerStatus] = useState('');
  const [quitDialogVisible, setQuitDialogVisible] = useState(false);
  const [joinDialogVisible, setJoinDialogVisible] = useState(false);
  const [joinResultVisible, setJoinResultVisible] = useState(false);
  const [batchJoinResultParams, setBatchJoinResultParams] = useState({});
  const [quitDialogParams, setQuitDialogParams] = useState({});
  const [joinDialogParams, setJoinDialogParams] = useState({});
  const [batchCrossBorderInfoDialogVisible, setBatchCrossBorderInfoDialogVisible] = useState(false);
  const [batchCrossBorderInfoParams, setBatchCrossBorderInfoParams] = useState({ count: 0, offerIds: [] });
  const [total, setTotal] = useState(0);
  const [resultParams, setResultParams] = useState({
    _status: false,
    _msg: '',
  });
  const [selectValueCon, setSelectValueCon] = useState('');
  const [isBatch, setIsBatch] = useState(false);
  const [active, setActive] = useState('last7Days');
  const getData = (parame) => {
    const { itemId, selectValue } = parame;
    if (!filterParams?.itemId) {
      delete filterParams?.itemId;
    }
    queryOfferList({ pageNo: parame.pageNo, itemId, selectValue, filterParams }).then((res) => {
      if (!init && !res?.data?.data?.length) {
        // handleTanChange({ selectValue: '777570' });
        // setSelectValueCon('777570');
      } else {
        // 确定查询逻辑
        setList(res?.data?.data);
        setTotal(Number(res?.data?.total));
      }
      setErrParams({
        visible: false,
      });
      init = true;
    });
  };
  const onPaginationChange = (_pageNo) => {
    setPageNo(_pageNo);
    getData({ pageNo: _pageNo });
  };
  const batchJoinService = () => {
    const _params = {
      offerIds: currentChecked?.join(),
      removeOfferIds: '',
      resource: 'fxHome',
      ruleId: 0,
      oppTag: '',
      filterTag: '',
    };
    batchItemEnroll(_params).then((res) => {
      const _result = res.data;
      if (_result) {
        setCurrentChecked([]);
        setBatchJoinResultParams({
          visible: true,
          status: _result?.data?.status,
          msg: _result?.data,
        });
        if (_result?.data?.status === 'doing') {
          let _count = 0;
          const timer = setInterval(() => {
            _count++;
            if (_count > 20) {
              // 最多轮询20次，避免弹窗关闭了，还在轮询
              clearInterval(timer);
            }
            batchItemEnroll().then((_timeRes) => {
              setBatchJoinResultParams({
                visible: true,
                status: _timeRes.data?.data?.status,
                msg: _timeRes.data?.data,
              });
              if (_timeRes.data.data.status !== 'doing') {
                clearInterval(timer);
              }
            });
          }, 3000);
        }
      }
    });
  };
  const checkAndSetError = () => {
    if (!(currentChecked.length > 0)) {
      setErrParams({
        visible: true,
        text: '需要先勾选商品',
      });
      return false;
    }
    return true;
  };
  const batchJoinOffer = () => {
    if (!checkAndSetError()) {
      return;
    }
    if (!qqjxSellerStatus) {
      // 商家未签约
      setIsBatch(true);
      logger.report({
        actionType: 'EXP_批量加入全球严选签署协议弹窗',
      });
      setJoinDialogVisible(true);
    } else {
      batchJoinService();
    }
  };
  const onBatchSetCrossBorderInfo = () => {
    if (!checkAndSetError()) {
      return;
    }
    setBatchCrossBorderInfoParams({
      count: currentChecked.length,
      offerIds: currentChecked,
    });
    setBatchCrossBorderInfoDialogVisible(true);
  };
  const batchChange = (_values) => {
    setErrParams({
      visible: false,
    });
    setCurrentChecked(_values);
  };
  // const close
  const resultDialogCell = (_success, _msg = '') => {
    let titleCell = '';
    let contentCell = '';
    let childrenCell = '';
    logger.report({
      actionType: `EXP_加入全球严选结果弹窗_${_success === 'true' ? 'SUCCESS' : 'FAIL'}`,
    });
    switch (_success) {
      case 'true':
        titleCell = (
          <div className="title">
            <Icon type="success" style={{ color: '#25BE13', marginRight: '4px' }} size="medium" />
            恭喜，已经成功加入全球严选
          </div>
        );
        contentCell =
          '您可继续报名更多商品，商品将获得AI智能多语言翻译、卖点提炼、跨境渠道重点展示等核心资源扶持，抢占更多跨境订单！';
        childrenCell = '提报更多商品';
        break;
      case 'false':
        titleCell = (
          <div className="title">
            <Icon type="error" style={{ color: '#FF0000', marginRight: '4px' }} size="medium" />
            加入失败，请重新提报
          </div>
        );
        contentCell = '由于系统繁忙，商品加入全球严选失败，请稍后再试';
        childrenCell = '重新提报';
        break;
      default:
        break;
    }

    const dialogJoinResult = Dialog.show({
      title: titleCell,
      footerActions: ['ok'],
      className: 'dialog-result',
      footerAlign: 'center',
      onClose: () => {
        logger.report({ actionType: 'CLK_加入全球严选结果弹窗_关闭' });
        getData({ pageNo });
      },
      onOk: () => {
        logger.report({ actionType: `CLK_加入全球严选结果弹窗_${childrenCell}` });
        getData({ pageNo });
      },
      okProps: {
        children: childrenCell,
      },
      content: <div>{contentCell}</div>,
    });
    return dialogJoinResult;
  };
  const baseInfoCell = (v, i, record) => {
    const { picUrl, title, itemId, price, offerId, tagList = [], oppTag, isKjOpp, isAiImageOptimize } = record;
    const _url = `https://offer-new.1688.com/page/publish.html?offerId=${itemId}`;
    const _odUrl = `https://detail.1688.com/offer/${itemId}.html`;
    const _list = Object.keys(tagQuery);
    const tags = [];
    // 标签枚举查询
    _list?.forEach((ite) => {
      if (tagList?.includes(ite)) {
        tags.push(tagQuery[ite]);
      }
    });
    return (
      <div className="baseInfo-cell">
        <a href={_odUrl} target="_blank" rel="noreferrer">
          <img src={picUrl} className="w-[80px] h-[80px]" />
        </a>
        <div className="offer-info">
          <div className="info-item">
            <a href={_odUrl} target="_blank" rel="noreferrer" className="a-name">
              <span className="value name">{title}</span>
            </a>
            <div className="icon-img-box">
              <img
                className="w-[16px] h-[16px] cursor-pointer"
                onClick={() => window.open(_url)}
                src="https://img.alicdn.com/imgextra/i3/O1CN01ehleZs1CDZeioYxtr_!!6000000000047-2-tps-16-16.png"
              />
            </div>
          </div>
          <div className="info-item">
            <span className="label">ID：</span>
            <span className="value">{itemId}</span>
          </div>
          <div className="info-item">
            <span className="label1">¥</span>
            <span className="value">{price}</span>
          </div>
          <div className="flex items-baseline">
            <div className="info-item tags mr-[4px]">
              {oppTag && (
                <div style={{ display: 'flex' }}>
                  <div className="tag-item  tag-item-FF7300">{oppTag}</div>
                  <Balloon
                    v2
                    trigger={<Icon type="help" size="small" style={{ marginLeft: '4px', color: '#999' }} />}
                    triggerType="hover"
                    closable={false}
                    align="t"
                  >
                    商品已命中热门商机，请立即报名全球严选
                  </Balloon>
                </div>
              )}
            </div>
            <div>
              {isKjOpp === 'true' && (
                <div className="w-[54px]">
                  <TagLabel type="primary">跨境商机</TagLabel>
                </div>
              )}
              {isAiImageOptimize === 'true' && (
                <div
                  className="py-[2px] px-[1px] rounded-[3px] inline-table text-[12px] text-[#3BB347] leading-[14px]"
                  style={{ border: '0.5px solid rgba(59, 179, 71, 0.5)' }}
                >
                  AI图片优化已完成
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const setQuitDialogVisibleFunc = (_visible, _par = {}) => {
    setQuitDialogVisible(_visible);
    setQuitDialogParams(_par);
  };
  const setJoinDialogVisibleFunc = (_visible, _par = {}, _qqjxSellerStatus = 'false') => {
    setIsBatch(false);
    if (!qqjxSellerStatus) {
      logger.report({ actionType: 'EXP_单品加入全球严选签署协议弹窗' });
      // 入驻商家-全球严选
      setJoinDialogVisible(_visible);
      setJoinDialogParams(_par);
    } else {
      // 商品报名
      joinOfferQqjx({ itemId: Number(_par.itemId) }).then((res) => {
        if (res && res.data.bizSuccess) {
          resultDialogCell(res.data?.data);
        }
      });
    }
  };

  const opeartionsMap = (action, itemId) => {
    switch (action) {
      case '退出全球严选':
      case '退出货通全球':
        return () => {
          const _par = {
            itemId,
            text: action,
          };
          return (
            <span
              className="action"
              data-channel-uni-logger-action-type={`CLK_货通全球已入驻列表_${action}`}
              onClick={() => setQuitDialogVisibleFunc(true, _par)}
            >
              {action}
            </span>
          );
        };
      default:
        break;
    }
  };

  const actionItemCell = (actionItem, _record) => {
    const { itemId, moreActionList } = _record;
    switch (actionItem) {
      case '加入全球严选':
        return (
          <span
            className="action action-quit action-join-qqjx relative"
            data-channel-uni-logger-action-type={'CLK_货通全球已入驻列表_加入全球严选'}
            onClick={() => setJoinDialogVisibleFunc(true, { itemId, text: actionItem }, qqjxSellerStatus)}
          >
            加入全球严选
            <img
              className="absolute top-[-6px] right-[-28px]"
              src="https://img.alicdn.com/imgextra/i4/O1CN01jBw9Af1nKZLrnicxi_!!6000000005071-2-tps-60-28.png"
            />
          </span>
        );
      case '更多':
        return (
          <Balloon
            className="more-balloon"
            v2
            trigger={<div style={{ marginTop: '6px', color: '#999', cursor: 'pointer' }}>更多</div>}
            closable={false}
            align="r"
          >
            {moreActionList?.map((moreAction) => {
              const operation = opeartionsMap(moreAction, itemId);

              return operation?.();
            })}
          </Balloon>
        );
      default:
        return null;
    }
  };
  function navigateWithQueryParams({ itemId }) {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('itemId', itemId);
    const { origin, search } = currentUrl;
    window.location.href = `${origin}/app/channel-fe/chain-work/crossbordermaterials.html${search}`;
  }

  const actionCell = (v, i, record) => {
    const { action = [] } = record;
    // const action = ['退出入驻', '退出货通全球', '加入全球严选'];
    const moreActionList = [];
    if (action?.includes('退出入驻')) {
      moreActionList.push('退出货通全球');
    }
    if (action?.includes('退出全球严选')) {
      moreActionList.push('退出全球严选');
    }
    // if (action?.includes('诚邀加入全球严选')) {
    //   moreActionList.push('诚邀加入全球严选');
    // }
    const opeatorLsit = action.filter((itm) => itm !== '退出全球严选' && itm !== '退出入驻');
    if (moreActionList.length > 0) {
      opeatorLsit.push('更多');
    }
    return (
      <div className="actionCell flex flex-col items-start">
        <Button type="primary" text onClick={() => navigateWithQueryParams({ itemId: record.itemId })}>
          编辑跨境素材
        </Button>
        {opeatorLsit?.map((item) => {
          return actionItemCell(item, { ...record, moreActionList });
        })}
      </div>
    );
  };
  const renderHelpIcon = (desc) => {
    const indicator = <Icon type="d-help" size="small" />;
    return (
      <Tooltip
        v2
        trigger={indicator}
        align="t"
        arrowPointToCenter
        popupStyle={{ backgroundColor: '#333' }}
        popupClassName="products-business-tooltips"
      >
        {desc}
      </Tooltip>
    );
  };
  const columnConfigs = [
    {
      title: '商品信息',
      align: 'left',
      lock: 'left',
      // width: '420px',
      cell: baseInfoCell,
    },
    filterParams?.selectValue === '901094' && {
      title: <div>商机信息 {renderHelpIcon('商机信息')}</div>,
      align: 'isKjOpp',
      cell: (v, i, record) => {
        const { oppTextList, isKjOpp } = record;
        return (
          <div>
            {isKjOpp === 'true' ? (
              oppTextList?.map((ele) => <div key={ele}>{ele}</div>)
            ) : (
              <div className="text-[#999]">无命中商机，暂无</div>
            )}
          </div>
        );
      },
    },
    filterParams?.selectValue !== '901094' && {
      title: '加入时间',
      align: 'left',
      // width: '200px',
      cell: (v, i, record) => <div className="w-[130px]">{record?.joinedTime}</div>,
    },
    // filterParams?.selectValue !== '901094' && {
    //   title: (
    //     <div className="w-[100%] text-center">
    //       <span className="mr-[16px]">商品数据</span>
    //       {TIME_RANGE.map((ele) => (
    //         <span key={ele.key}>
    //           <span
    //             onClick={() => setActive(ele.key)}
    //             className={`text-[12px] ${active === ele.key ? 'text-[#0077FF]' : 'text-[#666]'} cursor-pointer`}
    //           >
    //             {ele.title}
    //           </span>
    //           {ele.key === 'last7Days' && <Divider direction="ver" />}
    //         </span>
    //       ))}
    //     </div>
    //   ),
    //   dataIndex: 'productData',
    //   width: '420px',
    //   align: 'center',
    //   children: [
    //     {
    //       title: '曝光次数',
    //       dataIndex: 'supplyGoodsId',
    //       alignHeader: 'center',
    //       width: 110,
    //       cell: (value, index, record) => {
    //         const { itemData = {} } = record;
    //         return (
    //           <div>{itemData[active]?.exposureTimes}</div>
    //         );
    //       },
    //     },
    //     {
    //       title: '累计成交订单',
    //       dataIndex: 'supplyGoodsId',
    //       alignHeader: 'center',
    //       width: 116,
    //       cell: (value, index, record) => {
    //         const { itemData = {} } = record;
    //         return (
    //           <div>{itemData[active]?.totalOrder}</div>
    //         );
    //       },
    //     },
    //     {
    //       title: '累计GMV（元）',
    //       dataIndex: 'supplyGoodsId',
    //       alignHeader: 'center',
    //       width: 134,
    //       cell: (value, index, record) => {
    //         const { itemData = {} } = record;
    //         return (
    //           <div>{itemData[active]?.totalAmount}</div>
    //         );
    //       },
    //     },
    //   ],
    // },
    {
      title: '操作',
      align: 'left',
      width: '140px',
      className: 'actionCell w-[140px]',
      cell: actionCell,
    },
  ].filter(Boolean);

  // 父组件控制展示：父级传 true 时打开弹窗
  useEffect(() => {
    if (parentJoinDialogVisible) {
      setJoinDialogVisible(true);
    }
  }, [parentJoinDialogVisible]);

  // 关闭时若当前是父级要求展示的，通知父级
  const setJoinDialogVisibleWithNotify = (visible) => {
    setJoinDialogVisible(visible);
    if (!visible && parentJoinDialogVisible) {
      onJoinDialogClose?.();
    }
  };

  useEffect(() => {
    getData({ pageNo: 1 });
  }, [filterParams]);
  const onBatchChange = () => {
    getData({ pageNo: 1 });
  };
  const renderColumns = (columns) => {
    return columns.map((col) => {
      if (col.children) {
        // 如果有子列，渲染子列
        return (
          <Table.ColumnGroup key={col.title} title={col.title}>
            {renderColumns(col.children)}
          </Table.ColumnGroup>
        );
      }
      return <Table.Column key={col.title || col.dataIndex} {...col} />;
    });
  };
  return (
    <div className="joined-offer-table">
      <div className="table-top">
        <div className="filter">
          <TableSearch
            setSelectValueCon={setSelectValueCon}
            selectValueCon={selectValueCon}
            searchOnChange={handleTanChange}
            filterParams={filterParams}
          />
        </div>
      </div>
      <div className="flex items-center mb-[12px] mt-[6px]">
        <OperationDropdown
          currentChecked={currentChecked}
          filterParams={filterParams}
          batchJoinOffer={batchJoinOffer}
          balloonVisible={balloonVisible}
          checkAndSetError={checkAndSetError}
          onBatchChange={onBatchChange}
          isFirstVisit={isFirstVisit}
          onBatchSetCrossBorderInfo={onBatchSetCrossBorderInfo}
        />
        {errParams?.visible && <span className="error-text">{errParams?.text}</span>}
      </div>
      <Table
        dataSource={list}
        rowSelection={{
          onChange: batchChange,
          selectedRowKeys: currentChecked?.map((item) => item),
        }}
        hasBorder={false}
        primaryKey="itemId"
        className="joined-offer-table"
      >
        {renderColumns(columnConfigs)}
      </Table>
      <div className="pagination-content">
        <Pagination
          pageSizeSelector={false}
          defaultCurrent={1}
          current={pageNo}
          onChange={onPaginationChange}
          total={total}
          pageSize={10}
        />
      </div>
      <QuitDialogComp
        visible={quitDialogVisible}
        setQuitDialogVisibleFunc={setQuitDialogVisibleFunc}
        updateTableData={() => getData({ pageNo })}
        quitDialogParams={quitDialogParams}
      />
      <JoinDialogCell
        visible={joinDialogVisible}
        setJoinDialogParams={setJoinDialogParams}
        setJoinDialogVisible={setJoinDialogVisibleWithNotify}
        updateTableData={() => getData({ pageNo })}
        resultDialogCell={resultDialogCell}
        joinDialogParams={joinDialogParams}
        setJoinResultVisible={setJoinResultVisible}
        setQqjxSellerStatus={setQqjxSellerStatus}
        isBatch={isBatch}
        batchJoinService={batchJoinService}
      />
      <JoinResultDialog
        visible={joinResultVisible}
        setJoinResultVisible={setJoinResultVisible}
        updateTableData={() => getData({ pageNo })}
        resultParams={resultParams}
      />
      <BatchResultDialogCell
        visible={batchJoinResultParams.visible}
        _status={batchJoinResultParams.status}
        _msg={batchJoinResultParams.msg}
        updateTableData={() => getData({ pageNo })}
        setBatchJoinResultParams={setBatchJoinResultParams}
      />
      {/* 跨境信息弹窗 */}
      <BatchCrossBorderInfoDialog
        count={batchCrossBorderInfoParams.count}
        offerIds={batchCrossBorderInfoParams.offerIds}
        centered
        visible={batchCrossBorderInfoDialogVisible}
        onConfirm={(success) => {
          setBatchCrossBorderInfoDialogVisible(false);
          if (success) {
            // 接口成功后清空勾选的商品
            setCurrentChecked([]);
            // 刷新跨境信息完善待办事项
            onRefreshBusinessBacklog?.();
          }
        }}
        onClose={() => {
          setBatchCrossBorderInfoDialogVisible(false);
        }}
        pointText="批量设置生效后会覆盖已设置的信息，请谨慎操作"
      />
    </div>
  );
};

export default JoinedOfferTable;
