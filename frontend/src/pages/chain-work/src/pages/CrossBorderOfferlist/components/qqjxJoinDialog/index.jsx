import React, { useState, useEffect } from 'react';
import { Dialog, Checkbox, Button, Pagination, Icon } from '@alifd/next';
import './index.scss';
import { mockData, mockDataTotal } from './mock';
import { queryOfferModelList, batchItemEnroll, setAp, queryIsAutoInvite, openAutoInvite, signAgreement, queryCommissionAgreement, submitShopEnrollInfo } from '../../api';
import logger from '@alife/channel-uni-event-logger';
import Message from '@/components/UI/Message';

const QqjxJoinDialog = (props) => {
  const { visible, type, updateDialogFunc, dialogParams, setBatchJoinResultParams, updateCount, from, businessParams, onOk, onClose, onCancel } = props;
  const EXP_TEXT = (from === 'default' ? '默认弹窗' : '一键报名');
  const dialogParams1 = type === '全球严选' ? dialogParams : businessParams;
  const [data, setData] = useState([]); // mockData
  const [dataTotal, setDataTotal] = useState(0); // mockData
  // const [disabled, setDisabled] = useState(false); // 我已知晓勾选框disabled- 若已经签署过，禁用或者移出元素display
  const [checkboxValue, setCheckboxValue] = useState(false); // 我已知晓勾选框value
  const [values, setValues] = useState([]); // 选中的列表
  const [checkAllTotal, setCheckAllTotal] = useState(0); // 已选数量--展示
  const [removeOfferIds, setRemoveOfferIds] = useState([]); // 接口参数-移出列表
  const [memoOfferIds, setMemoOfferIds] = useState([]); // 选中列表
  const [currentPage, setCurrentPage] = useState(1);
  const [sellerStatus, setSellerStatus] = useState(false);
  const [checked, setChecked] = useState(false);
  const [hasQueryChecked, setHasQueryChecked] = useState(false);
  const reset = () => {
    setRemoveOfferIds([]);
    setMemoOfferIds([]);
    setCheckboxValue(false);
    setValues([]);
    setCurrentPage(1);
    setCheckAllTotal(0);
  };
  const closeDialog = () => {
    onClose && onClose();
    updateDialogFunc(false); // 关闭弹窗
  };
  const joinClick = () => {
    if (!hasQueryChecked && checked) {
      openAutoInvite().then((res) => {
        const { success, msg, model } = res?.content;
        if (success && model) {
          Message._show({ content: '已开启自动加入全球严选', type: 'success' });
        } else {
          Message._show({ content: msg || '系统异常', type: 'error' });
        }
      }).catch((err) => { Message._show({ content: err.message || '系统异常', type: 'error' }); });
    }
    if (checkboxValue) {
      signAgreement({
        request: {
          openAutoInvite: true,
        },
      }).then((res) => {
        const { success, msg, model } = res?.content;
        if (success && model) {
          Message._show({ content: '1688大严选帮卖技术服务协议,签署成功', type: 'success' });
        } else {
          Message._show({ content: msg || '系统异常', type: 'error' });
        }
      }).catch((err) => {
        Message._show({ content: err.message || '系统异常', type: 'error' });
      });
    }
    const _params = {
      offerIds: memoOfferIds?.join(),
      removeOfferIds: removeOfferIds?.join(),
      resource: 'fxHome',
      ruleId: 901094,
      oppTag: type === '全球严选' ? '' : type,
      filterTag: '415426,575939',
    };
    // return;
    batchItemEnroll(_params).then((res) => {
      const _result = res.data;
      if (_result.bizSuccess === 'true') {
        closeDialog(); // 关闭弹窗
        reset(); // 完成后重制默认值
        // 结果弹窗
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
              clearInterval(timer);
            }
            batchItemEnroll().then((_timeRes) => {
              const _status = _timeRes.data?.data?.status;
              setBatchJoinResultParams({
                visible: true,
                status: _status,
                msg: _timeRes.data?.data,
              });
              logger.report({
                actionType: `EXP_${EXP_TEXT}加入全球严选结果弹窗_${_status === 'success' ? 'SUCCESS' : 'FAIL'}`,
              });
              if (_timeRes.data.data.status !== 'doing') {
                clearInterval(timer);
              }
              onOk && onOk();
            });
          }, 3000);
        }
      }
    });
  };
  const itemClick = (_offerId) => {
    // setOfferIds([...offerIds, _offerId]);
    const inList = values?.indexOf(_offerId) !== -1; // 当前 offerId 已被选中
    // 更新checkboxGroup列表
    setValues(inList ? values.filter((i) => i !== _offerId) : [...values, _offerId]);
    // 更新已选数量
    setCheckAllTotal(inList ? Number(checkAllTotal) - 1 : Number(checkAllTotal) + 1);
    // 更新记忆选中list
    setMemoOfferIds(inList ? memoOfferIds.filter((i) => i !== _offerId) : [...memoOfferIds, _offerId]); // 判断是否在list中，在则删除，否则加入
    // 更新移除list
    setRemoveOfferIds(inList ? [...removeOfferIds, _offerId] : removeOfferIds.filter((i) => i !== _offerId)); // 判断是否在list中，在则删除，否则加入
    const _list = inList ? values.filter((i) => i !== _offerId) : [...values, _offerId];
  };
  const checkboxGroupOnChange = (_values) => {
    setValues(_values);
  };
  const setAllCheckboxValueFunc = (_allChecked) => {
    if (_allChecked) {
      // 全选状态为true
      setValues(getOfferIds(data)); // 勾
      setCheckAllTotal(dataTotal); // 设置已选为全量
      setRemoveOfferIds([]);
      setMemoOfferIds([]);
    } else {
      setValues([]);
      setCheckAllTotal(0); // 设置已选为0
    }
  };
  const getOfferIds = (_list = []) => {
    const newList = [];
    if (_list) {
      _list.forEach((itm) => newList.push(itm.itemId));
    }
    return newList;
  };
  const paginationChange = (_currentPage) => {
    setCurrentPage(_currentPage);
  };

  const getData = (_params) => {
    queryOfferModelList(_params).then((res) => {
      if (res.data) {
        setData(res.data.data);
        setDataTotal(Number(res.data.total));
        setCheckAllTotal(Number(res.data.total));
        dialogParams1.subtitle =
        `您有${res.data.total}款商品被跨境买家选中，商品将获得标题、主图、详情页AI智能多语言翻译和卖点提炼，更可在跨境专供频道、寻源通API、全球直采、寻源换供等跨境渠道获得核心资源扶持，请您立即将全量被选中商品加入“全球严选”，获取跨境订单！`;
        // 全选状态下，所有的均勾选
        setValues(getOfferIds(res.data.data));
      }
    }).catch((e) => {
      console.log(e);
    });
  };


  useEffect(() => {
    queryCommissionAgreement().then((res) => {
      const { success, msg, model } = res?.content;
      if (success) {
        setSellerStatus(model);
        setCheckboxValue(model);
      } else {
        Message._show({ content: msg || '系统异常', type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err.message || '系统异常', type: 'error' });
    });
    // querySellerType(4502657).then((res) => {
    //   setSellerStatus(res.data?.data === 'true');
    // });
  }, [checkAllTotal]);
  useEffect(() => {
    if (checkAllTotal === Number(dataTotal)) {
      setMemoOfferIds([]); // 全选状态下，设置memo为空
    }
  }, [checkAllTotal]);

  useEffect(() => {
    setData([]);
    const oppTag = type === '全球严选' ? '' : type;
    const params = {
      pageNo: currentPage,
      pageSize: 9,
      ruleId: '901094',
      filterTag: '415426,575939',
      filterParams: { selectValue: '901094' },
      oppTag,
    };
    getData(params);
  }, [currentPage, updateCount, type]);

  useEffect(() => {
    // 打点
    logger.report({
      actionType: `EXP_${EXP_TEXT}全球严选报名弹窗`,
    });
    if (visible) {
      queryIsAutoInvite().then((res) => {
        const { success, msg, model } = res?.content;
        if (success) {
          setChecked(model);
          setHasQueryChecked(model);
        } else {
          Message._show({ content: msg || '系统异常', type: 'error' });
        }
      }).catch((err) => { Message._show({ content: err.message || '系统异常', type: 'error' }); });
    }
  }, [visible]);

  return (
    dialogParams1?.title ?
      <Dialog
        title={dialogParams1?.title}
        className={`qqjx-join-dialog ${type}-type-dialog`}
        visible={visible}
        onClose={() => { reset(); closeDialog(); }}
        style={{ width: '800px' }}
        footer={
        (
          <div className="footer-cell">
            {
              dialogParams1?.content ?
                <Button
                  className="close"
                  type="primary"
                  data-channel-uni-logger-action-type={`CLK_全球严选${EXP_TEXT}_关闭`}
                  onClick={() => closeDialog()}
                >关闭
                </Button> :
                <Button
                  type="primary"
                  onClick={joinClick}
                  data-channel-uni-logger-action-type={`CLK_全球严选${EXP_TEXT}_立即加入`}
                  disabled={!((sellerStatus ? true : checkboxValue) && checkAllTotal > 0)}
                >立即加入
                </Button>
            }
          </div>
        )
        }
      >
        {
        dialogParams1?.content ||
        <div>
          <p className="text-[14px] text-[#333] mb-[16px]">
            {dialogParams1?.subtitle}
            <a
              href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/XPwkYGxZV3RX2pNNSAnGX0ZZWAgozOKL"
              target="_blank"
              rel="noreferrer"
            >了解更多权益
            </a>
          </p>
          <Checkbox.Group
            value={values}
            onChange={checkboxGroupOnChange}
            aria-labelledby="groupId"
          >
            <div className="table-list">
              {
            data?.map((item) => {
              const { picUrl, title, total, price, itemId } = item;
              return (
                <div onClick={() => itemClick(itemId)} className="item">
                  <Checkbox className="checkbox" value={itemId} />
                  <img src={picUrl} />
                  <div className="msg">
                    <p className="title">{title}</p>
                    <p className="price"> ¥{price}</p>
                    {/* <p className="total">库存：{total}</p> */}
                  </div>
                </div>
              );
            })
          }
            </div>
          </Checkbox.Group>
          <div className="number-checked-total">
            <Checkbox
            // indeterminate={checkAllTotal > 0 ? checkAllTotal < dataTotal : false}// 中间状态
              checked={checkAllTotal === Number(dataTotal)}
              onChange={(v) => setAllCheckboxValueFunc(v)}
            >
              全选
              <span className="checked-number">已选{checkAllTotal}/{dataTotal}</span>
            </Checkbox>
            <Pagination pageSize={9} total={dataTotal} current={currentPage} onChange={paginationChange} shape="arrow-only" type="simple" />
          </div>
          {!hasQueryChecked && (
            <div className="mt-[16px] flex">
              <Checkbox
                onChange={(v) => setChecked(v)}
              />
              <div className="ml-[8px] text-[#333]">商机品自动加入全球严选</div>
            </div>
          )}
          <div className="mt-[8px] flex">
            <Checkbox
              disabled={sellerStatus}
              checked={checkboxValue}
              onChange={(v) => setCheckboxValue(v)}
            />
            <div className="ml-[8px]">{dialogParams1?.agreementCellLabel}</div>
          </div>
        </div>
      }
      </Dialog> : <span />
  );
};

export default QqjxJoinDialog;
