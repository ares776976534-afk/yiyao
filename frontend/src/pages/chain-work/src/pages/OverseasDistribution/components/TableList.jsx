import React, { useEffect, useState, useRef } from 'react';
import CommonTable from '@/components/CommonTable';
import schema from './schema';
import { pageOffer } from '@/pages/OverseasDistribution/services';
import Message from '@/components/UI/Message';
import { queryCommissionAgreement, joinOfferQqjx } from '@/pages/CrossBorderOfferlist/api';
import JoinDialogCell from '@/pages/CrossBorderOfferlist/components/Tab/compontents/joinDialogCell';
import JoinResultDialog from '@/pages/CrossBorderOfferlist/components/Tab/compontents/joinResultDialog';
import { Dialog, Icon } from '@alifd/next';

const TableList = ({ productsList, getFatigue }) => {
  const [qqjxSellerStatus, setQqjxSellerStatus] = useState('');
  const [joinDialogVisible, setJoinDialogVisible] = useState(false);
  const [joinDialogParams, setJoinDialogParams] = useState({});
  const [isBatch, setIsBatch] = useState(false);
  const [joinResultVisible, setJoinResultVisible] = useState(false);
  const getData = useRef(null);
  const [data, setData] = useState([]);
  const [resultParams, setResultParams] = useState({
    _status: false,
    _msg: '',
  });
  const listQueryFn = (values) => {
    return new Promise((resolve) => {
      pageOffer({
        request: {
          ...values,
          pageNum: values.pageNo,
          offerType: values.currentStatus,
        },
      }).then((res) => {
        const { success = false, list = [], msg = '数据加载失败，请稍后重试', total = 0 } = res;
        setData(res?.list || []);
        if (success) {
          resolve({ model: list, total });
        } else {
          Message._show({ content: msg, type: 'error' });
        }
      }).catch((err) => {
        Message._show({ content: err.errMsg || '系统异常', type: 'error' });
      });
    });
  };
  useEffect(() => {
    // 查询商家是否加入全球严选
    queryCommissionAgreement().then((res) => {
      const { success, msg, model } = res?.content;
      if (success) {
        setQqjxSellerStatus(model);
        setJoinDialogVisible(!model);
      } else {
        Message._show({ content: msg || '系统异常', type: 'error' });
      }
    }).catch((err) => {
      Message._show({ content: err?.message || '系统异常', type: 'error' });
    });
  }, []);
  const setJoinDialogVisibleFunc = (_visible, _par = {}) => {
    if (!qqjxSellerStatus) {
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
  const resultDialogCell = (_success, _msg = '') => {
    let titleCell = '';
    let contentCell = '';
    let childrenCell = '';
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
        getData.current();
      },
      onOk: () => {
        getData.current();
      },
      okProps: {
        children: childrenCell,
      },
      content: <div>{contentCell}</div>,
    });
    return dialogJoinResult;
  };
  const handleActionClick = ({ type, record }, fn) => {
    switch (type) {
      case 'reload':
        fn();
        break;
      case 'JOIN_QQYX':
        setJoinDialogVisibleFunc(true, { itemId: record?.itemId, text: '加入全球严选' });
        getData.current = fn;
        break;
      case 'EDIT_CROSS_DISTRIBUTION_PRICE':
        getFatigue(record?.itemId);
        break;
      case 'EDIT_CROSS_DISTRIBUTION':
        window.open(`https://air.1688.com/app/channel-fe/channel-work/productmanager.html?editMode=overseaEdit&editOffer=${record?.itemId}`);
        break;
      default:
        break;
    }
  };
  return (
    <div className="mt-[16px] overseasDistributionTable">
      <CommonTable
        statusFilterType={{ type: 2 }}
        getStatusFnOrStatusList={productsList}
        className="commonTable"
        schema={schema}
        SlotOrShowStatusFilter
        onActionComplete={handleActionClick}
        searchFilterType="4"
        listQueryFn={listQueryFn}
        showPagination={data?.length > 0}
        pageSize={10}
      />
      {/* <JoinDialogCell
        visible={joinDialogVisible}
        setJoinDialogParams={setJoinDialogParams}
        setJoinDialogVisible={setJoinDialogVisible}
        resultDialogCell={resultDialogCell}
        joinDialogParams={joinDialogParams}
        setJoinResultVisible={setJoinResultVisible}
        setQqjxSellerStatus={setQqjxSellerStatus}
        isBatch={isBatch}
      /> */}
      <JoinResultDialog
        visible={joinResultVisible}
        setJoinResultVisible={setJoinResultVisible}
        updateTableData={() => getData.current()}
        resultParams={resultParams}
      />
    </div>
  );
};

export default TableList;
