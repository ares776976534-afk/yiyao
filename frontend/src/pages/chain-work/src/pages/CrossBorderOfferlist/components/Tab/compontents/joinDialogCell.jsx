import React, { useState, useEffect } from 'react';
import { Dialog, Checkbox, Icon, Button } from '@alifd/next';
import { qqjx_agreement_text_cell } from '@/pages/CrossBorderOfferlist/utils';
import { joinOfferQqjx, openAutoInvite, queryIsAutoInvite, queryCommissionAgreement, signAgreement } from '@/pages/CrossBorderOfferlist/api';
import { Qqjx_Qy } from '@/pages/CrossBorderOfferlist/variables';
import '../index.scss';
import './joinDialogCell.scss';
import Message from '@/components/UI/Message';

const JoinDialogComp = (props) => {
  const { updateTableData,
    isBatch, batchJoinService,
    visible, setQqjxSellerStatus, joinDialogParams, setJoinDialogVisible, resultDialogCell } = props;
  const { itemId } = joinDialogParams;
  const [value, setValue] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [joinDisabled, setJoinDisabled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [hasQueryChecked, setHasQueryChecked] = useState(false);

  const actionClick = (_visible) => {
    setJoinDialogVisible(_visible);
    // 关闭弹窗，清空选项
    setValue(null);
  };
  const joinClick = (_itemId = '') => {
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
    setButtonLoading(true);
    signAgreement({
      request: {
        openAutoInvite: true,
      },
    }).then((res) => {
      const { success, msg, model } = res?.content;
      if (success && model) {
        Message._show({ content: '1688大严选帮卖技术服务协议,签署成功', type: 'success' });
        setButtonLoading(false); // 关闭loading
        setJoinDialogVisible(false); // 关闭当前弹窗
        setQqjxSellerStatus(model); // 更新商家状态

        if (isBatch) {
          // 批量报名
          batchJoinService();
        } else {
          // 商品报名
          _itemId.length > 0 && joinOfferQqjx({ itemId: Number(_itemId) }).then((r) => {
            if (r && r.data) {
              resultDialogCell(String(r.data?.data)); // 根据退出成功失败返回不同状态-调出结果弹窗
            }
          });
        }
      } else {
        setButtonLoading(false);
        Message._show({ content: msg || '系统异常', type: 'error' });
      }
    }).catch((err) => {
      setButtonLoading(false);
      Message._show({ content: err.message || '系统异常', type: 'error' });
    });

    // 商家打标
    // submitShopEnrollInfo(4502657).then((_res) => {
    //   if (_res.data) {
    //     setButtonLoading(false); // 关闭loading
    //     setJoinDialogVisible(false); // 关闭当前弹窗
    //     setQqjxSellerStatus(_res.data.data); // 更新商家状态

    //     if (isBatch) {
    //       // 批量报名
    //       batchJoinService();
    //     } else {
    //       // 商品报名
    //       _itemId.length > 0 && joinOfferQqjx({ itemId: Number(_itemId) }).then((res) => {
    //         if (res && res.data) {
    //           resultDialogCell(String(res.data?.data)); // 根据退出成功失败返回不同状态-调出结果弹窗
    //         }
    //       });
    //     }
    //   }
    // });
  };
  useEffect(() => {
    setJoinDisabled(!value);
  }, [value]);
  useEffect(() => {
    if (visible) {
      queryIsAutoInvite().then((res) => {
        const { success, msg, model } = res?.content;
        if (success) {
          setChecked(model);
          // setHasQueryChecked(model);
        } else {
          Message._show({ content: msg || '系统异常', type: 'error' });
        }
      }).catch((err) => { Message._show({ content: err.message || '系统异常', type: 'error' }); });
      queryCommissionAgreement().then((res) => {
        const { success, msg, model } = res?.content;
        if (success) {
          setValue(model);
          setHasQueryChecked(model);
        } else {
          Message._show({ content: msg || '系统异常', type: 'error' });
        }
      }).catch((err) => {
        Message._show({ content: err.message || '系统异常', type: 'error' });
      });
    }
  }, [visible]);
  return (
    <div>
      <Dialog
        title={'加入全球严选，享受核心资源'}
        className="join-dialog"
        visible={visible}
        onClose={() => actionClick(false)}
        style={{ width: '800px' }}
        footer={
          <div className="footer-cell">
            <Button type="primary" onClick={() => joinClick(itemId)} loading={buttonLoading} disabled={joinDisabled}>立即加入</Button>
            {/* <Button className="close" onClick={() => actionClick(false)}>取消</Button> */}
          </div>
        }
      >
        <div className="text-[#333] text-[14px]">
          商品将获得标题、主图、详情页AI智能多语言翻译和卖点提炼，更可在跨境专供频道、寻源通API、全球直采、寻源换供等跨境渠道获得核心资源扶持，请您立即将全量被选中商品加入“全球严选”，获取跨境订单！
          {
            Qqjx_Qy &&
            <a href={Qqjx_Qy} target="_blank" rel="noreferrer" data-channel-uni-logger-action-type={'CLK_全球严选入驻弹窗_链接_了解更多权益'}>了解更多权益</a>
          }
        </div>
        {!checked && (
          <div className="mt-[16px] flex">
            <Checkbox
              onChange={(v) => setChecked(v)}
            />
            <div className="ml-[8px] text-[#333]">商机品自动加入全球严选</div>
          </div>
        )}
        <div className="mt-[8px] flex">
          <Checkbox checked={value} onChange={(v) => { setValue(v); }} disabled={hasQueryChecked} />
          <div className="ml-[8px]">{qqjx_agreement_text_cell}</div>
        </div>
      </Dialog>
    </div>
  );
};

export default JoinDialogComp;
