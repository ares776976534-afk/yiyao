/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import { Dropdown, Menu, Icon, Balloon, Button } from '@alifd/next';
import CommonDialog from '@/components/FormDialog';
import operationSchema from './operationSchema';
import { batchSetProhibitedArea } from '@/pages/CrossBorderOfferlist/api';
import { batchSetManufacturers } from '@/service/common';
import LeadBalloon from '@/components/LeadBalloon';
import { MessageError, MessageSuccess } from '@/utlis';
import './OperationDropdown.scss';

function OperationDropdown({
  currentChecked,
  filterParams,
  batchJoinOffer,
  balloonVisible,
  checkAndSetError,
  onBatchChange,
  isFirstVisit,
  onBatchSetCrossBorderInfo,
}) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showBalloonTip, setShowBalloonTip] = useState(false);

  // 监听 isFirstVisit 变化，控制 Dropdown 展开
  useEffect(() => {
    if (isFirstVisit) {
      // 额外延迟一下，确保 Dropdown 组件已经完全渲染并计算好位置
      const openTimer = setTimeout(() => {
        setDropdownVisible(true);
        setShowBalloonTip(true);
      }, 200);

      return () => {
        clearTimeout(openTimer);
      };
    }
  }, [isFirstVisit]);

  // 用户点击"我知道了"后关闭 Dropdown
  const handleBalloonClose = () => {
    setDropdownVisible(false);
    // 稍后移除 Balloon 提示，恢复为普通 Dropdown
    setTimeout(() => {
      setShowBalloonTip(false);
    }, 300);
  };
  const getBatchSetProhibitedArea = (values) => {
    batchSetProhibitedArea({
      offerIdList: currentChecked,
      prohibitedAreaList: values.prohibitedAreaList,
      offerCount: currentChecked?.length,
    }).then((res) => {
      const { content } = res;
      const { success, Msg } = content;
      if (success) {
        MessageSuccess(Msg);
        onBatchChange();
      } else {
        MessageError(Msg || '系统异常');
      }
    });
  };
  const getBatchSetManufacturers = (values) => {
    batchSetManufacturers({
      itemIdList: currentChecked,
      manufacturerId: values.manufacturerId,
      offerCount: currentChecked?.length,
    }).then((res) => {
      const { content } = res;
      const { errorMsg, success } = content;
      if (success) {
        MessageSuccess(errorMsg);
        onBatchChange();
      } else {
        MessageError(errorMsg || '系统异常');
      }
    });
  };
  // 批量设置跨境信息
  const onBatchSetCrossBorderInformation = () => {
    handleBalloonClose();
    if (!checkAndSetError()) {
      return;
    }
    onBatchSetCrossBorderInfo();
  };
  // 批量设置禁售国家/地区
  const onBatchSetProhibitedArea = () => {
    handleBalloonClose();
    if (!checkAndSetError()) {
      return;
    }
    CommonDialog.open({
      title: '批量设置禁售国家/地区',
      onSubmit: (value) => getBatchSetProhibitedArea(value),
      schema: () => operationSchema('country', currentChecked),
      labelAlign: 'top',
    });
  };
  // 批量设置制造商
  const onBatchSetManufacturers = () => {
    handleBalloonClose();
    if (!checkAndSetError()) {
      return;
    }
    CommonDialog.open({
      title: '批量设置制造商信息',
      onSubmit: (value) => getBatchSetManufacturers(value),
      schema: () => operationSchema('info', currentChecked),
      labelAlign: 'top',
    });
  };
  const mainTargetCell = () => {
    return (
      <Menu.Item
        data-channel-uni-logger-action-type={'CLK_货通全球_批量加入全球严选'}
        onClick={() => {
          batchJoinOffer();
          handleBalloonClose();
        }}
      >
        批量加入全球严选
      </Menu.Item>
    );
  };
  const menu = (
    <Menu style={{ zIndex: '99' }}>
      <Menu.Item onClick={onBatchSetCrossBorderInformation}>批量设置跨境信息</Menu.Item>
      {!filterParams?.selectValue ||
      filterParams?.selectValue === '777570' ||
      filterParams?.selectValue === '901094' ? (
          balloonVisible ? (
            <LeadBalloon
              v2
              triggerType="focus"
              visible={false}
              title="批量入驻操作说明"
              trigger={mainTargetCell()}
              align="r"
              className="lead-balloon"
              childrenCell="勾选符合条件的商品后，点击批量加入全球严选，即可完成入驻"
            />
          ) : (
            mainTargetCell()
          )
        ) : null}
      <Menu.Item onClick={onBatchSetProhibitedArea}>批量设置禁售国家/地区</Menu.Item>
      <Menu.Item onClick={onBatchSetManufacturers}>批量设置制造商</Menu.Item>
    </Menu>
  );
  const triggerButton = (
    <div className="flex flex-row items-center w-[124px] h-[32px] bg-[#0077FF] text-[#fff] text-[14px] rounded-[6px] cursor-pointer">
      <div className="relative flex flex-row justify-center items-center p-[10px_16px] gap-[8px] w-[88px] h-[32px] rounded-tl-[3px] rounded-bl-[3px] self-stretch z-1">
        批量操作
      </div>
      <div className="relative flex flex-col justify-center items-center p-[16px] w-[36px] h-[32px] rounded-tl-[3px] rounded-bl-[3px] border-l border-solid border-[rgba(255,255,255,0.3)] self-stretch box-border z-0">
        <Icon type="arrow-down" style={{ color: '#fff' }} />
      </div>
    </div>
  );

  const dropdownProps = {
    trigger: triggerButton,
    triggerType: ['hover'],
    // 只在第一次访问时才传递 visible 属性进行受控
    ...(showBalloonTip && { visible: dropdownVisible }),
  };

  return (
    <Dropdown {...dropdownProps}>
      {showBalloonTip ? (
        <Balloon
          v2
          type="normal"
          triggerType="click"
          // eslint-disable-next-line react/no-unescaped-entities
          title={<div className="text-[16px] leading-[19px]">"批量设置跨境信息"功能上线</div>}
          visible={dropdownVisible}
          trigger={menu}
          align="r"
          closable={false}
          followTrigger
          offset={[4, -60]}
          popupStyle={{ backgroundColor: '#0077FF' }}
          popupClassName="custom-balloon-tip p-[20px]"
        >
          <p className="text-[14px] leading-[22px] mt-[8px]">
            您可勾选多个商品后批量进行跨境信息设置，有机会得到跨境流量扶持。
          </p>
          <p className="flex justify-end mt-[20px]">
            <Button
              style={{
                width: '76px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #0077ff',
                color: '#0077ff',
                background: '#fff',
              }}
              onClick={handleBalloonClose}
            >
              我知道了
            </Button>
          </p>
        </Balloon>
      ) : (
        menu
      )}
    </Dropdown>
  );
}

export default OperationDropdown;
