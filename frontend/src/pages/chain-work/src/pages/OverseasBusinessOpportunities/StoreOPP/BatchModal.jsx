import React, { useState, useEffect } from 'react';
import { Dialog, Checkbox, Message } from '@alifd/next';
import { QQJX_XIEYI } from '@/constant';
import { signUp, queryIsShopAutoJoin, openShopAutoJoin } from '../api';

export const BatchModal = ({
  isSelectAll = false,
  field,
  visible,
  onClose,
  count,
  excludeList = [],
  selectedList = [],
}) => {
  const [checked, setChecked] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [shouldJoin, setShouldJoin] = useState(false);

  const signUpFn = () => {
    signUp({
      signUpParam: {
        categoryId: field?.getValue('categoryId'),
        strategyId: field?.getValue('strategyId'),
        keyword: field?.getValue('oppKeyword'),
        isSelectAll,
        filterOppMatchIds: excludeList,
        selectOppMatchIds: selectedList,
        isAutoJoinQqyx: checked,
      },
    }).then((res) => {
      if (res.content.success === true) {
        Message.success('报名成功');
        onClose();
      } else {
        Message.error(`报名失败${res.content.message}`);
      }
    }).catch((err) => {
      Message.error(err.message);
    });
  };

  const onOk = () => {
    if (shouldJoin) {
      openShopAutoJoin().then((res) => {
        if (res.content.model) {
          signUpFn();
        } else {
          Message.error('报名失败，无法开启全店自动加入全球严选');
        }
      });
    } else {
      signUpFn();
    }
  };

  useEffect(() => {
    if (visible) {
      queryIsShopAutoJoin().then((res) => {
        if (res.content.model) {
          setChecked(true);
          setDisabled(true);
        } else {
          setShouldJoin(true);
        }
      });
    }
  }, [visible]);

  return (
    <Dialog
      width={400}
      height={171}
      visible={visible}
      onClose={() => {
        onClose();
      }}
      onCancel={() => {
        onClose();
      }}
      title={count === 1 ? '报名' : '批量报名'}
      onOk={onOk}
      okProps={{
        disabled: !checked,
      }}
    >
      <div style={{ color: '#333', fontSize: '14px' }}>
        <div>你已勾选<span style={{ color: '#FF8B00' }}>{count}</span>个商机，确定进行批量报名吗？</div>
        <Checkbox
          checked={checked}
          disabled={disabled}
          onChange={(e) => {
            setChecked(e);
          }}
        >
          我已阅读并同意
          <a target="_blank" href={QQJX_XIEYI} rel="noreferrer">
            《大严选帮卖协议》
          </a>
        </Checkbox>
      </div>
    </Dialog>
  );
};
