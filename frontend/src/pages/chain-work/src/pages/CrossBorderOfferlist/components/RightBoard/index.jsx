import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/UI/Button';
import { Divider, Icon, Balloon } from '@alifd/next';
import { queryCommissionAgreement, openAutoInvite, closeAutoInvite, queryIsAutoInvite, queryIsShopAutoJoin, openShopAutoJoin, closeShopAutoJoin } from '@/pages/CrossBorderOfferlist/api';
import Message from '@/components/UI/Message';
import QqyxDialog from '@/pages/CrossBorderOfferlist/components/businessComp/QqyxDialog';

const describe = 'https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/XPwkYGxZV3RX2pNNSAnGX0ZZWAgozOKL';

const { Tooltip } = Balloon;

function RightBoard({ dataRight, setIsBusinessComp }) {
  const [checked, setChecked] = useState(false);
  const [visible, setVisible] = useState(false);
  const [wholeStore, setWholeStore] = useState(false);
  const [business, setBusiness] = useState(false);

  // 通用API调用处理
  const handleApiCall = useCallback(async (apiCall, onSuccess, type = '', errorMsg = '系统异常') => {
    try {
      const res = await apiCall();
      const { success = false, msg, model } = res?.content || {};
      if (success) {
        onSuccess?.(model);
        console.log('type', type, model);
        type === 'all' && setIsBusinessComp(!model);
      } else {
        Message._show({ content: msg || errorMsg, type: 'error' });
      }
    } catch (err) {
      Message._show({ content: err.message || errorMsg, type: 'error' });
    }
  }, []);

  // 通用按钮组件
  // const ActionButton = ({ isActive, children }) => (
  //   isActive ? (
  //     <div className="bg-[#ECF7EC] rounded-[3px] px-[4px] py-[1px] flex justify-center items-center cursor-pointer">
  //       <span className="text-[#3BB347] text-[12px]">
  //         {children}
  //       </span>
  //     </div>
  //   ) : (
  //     <Button
  //       type="primary"
  //       style={{ borderRadius: '6px', width: '48px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  //     >
  //       {children}
  //     </Button>
  //   )
  // );

  // 确认按钮组件
  const ConfirmButton = ({ onClick, children }) => (
    <div className="flex justify-end">
      <div
        className="w-[72px] h-[24px] text-[#fff] bg-[#07f] text-[12px] cursor-pointer rounded-[4px] px-[12px] py-[10px] flex justify-center items-center"
        onClick={onClick}
      >
        {children}
      </div>
    </div>
  );
  const checkedChange = useCallback((key, showMessage = true) => {
    setChecked(key);

    const apiCall = key ? openAutoInvite : closeAutoInvite;
    const successMsg = key ? '商机品自动加入全球严选已开启' : '商机品自动加入全球严选已关闭';

    handleApiCall(apiCall, (model) => {
      if (model && showMessage) {
        Message._show({ content: successMsg, type: 'success' });
      }
    });
  }, [handleApiCall]);

  useEffect(() => {
    handleApiCall(queryIsAutoInvite, setChecked);
    handleApiCall(queryIsShopAutoJoin, setWholeStore, 'all');
  }, [handleApiCall]);

  const openShopAutoJoinFunc = useCallback(() => {
    handleApiCall(openShopAutoJoin, (model) => {
      setWholeStore(model);
      if (model) {
        setVisible(false);
        setIsBusinessComp(false);
        // 判断是否需要同时开启商机品
        const needsToOpenChecked = !checked;

        if (needsToOpenChecked) {
          // 同时开启两个功能时，显示统一提示
          Message._show({ content: '功能已全部开启', type: 'success' });
          checkedChange(true, false); // 不显示单独的商机品提示
        } else {
          // 只开启全店时，显示单独提示
          Message._show({ content: '全店加入全球严选已开启', type: 'success' });
        }
      }
    });
  }, [checked, handleApiCall, checkedChange]);

  const closeShopAutoJoinFunc = useCallback(() => {
    handleApiCall(closeShopAutoJoin, (model) => {
      // 关闭操作成功，无论model值如何都显示关闭提示
      setWholeStore(false);
      Message._show({ content: '全店加入全球严选已关闭', type: 'success' });
      setIsBusinessComp(true);
      if (checked) {
        // 使用checkedChange来确保状态一致性，但显示自定义提示
        checkedChange(true, false); // 不显示默认提示
        Message._show({ content: '商机品自动加入全球严选已同时关闭', type: 'success' });
      }
    });
  }, [checked, handleApiCall]);

  const onSwitchChange = useCallback((key) => {
    handleApiCall(queryCommissionAgreement, (model) => {
      if (model) {
        checkedChange(!key);
      } else {
        QqyxDialog.open({ onOk: (k) => checkedChange(!k) });
      }
    });
  }, [handleApiCall, checkedChange]);

  const renderHelpIcon = (rightDesc, acquireRightWay) => (
    acquireRightWay ? (
      <Tooltip
        v2
        trigger={rightDesc}
        align="b"
        arrowPointToCenter
        popupStyle={{ backgroundColor: '#333' }}
        popupClassName="products-business-tooltips"
      >
        {acquireRightWay}
      </Tooltip>
    ) : (
      <div>{rightDesc}</div>
    )
  );

  // 通用Balloon组件
  const CustomBalloon = ({
    title,
    isActive,
    balloonVisible,
    onVisibleChange,
    onToggle,
    onConfirm,
    closeText = '关闭',
    openText = '开启',
    description,
  }) => (
    <div className="py-[13.5px] flex justify-center items-center flex-col">
      <div className="text-[#333] leading-[19px] text-[14px] font-medium mb-[12px]">{title}</div>
      <Balloon
        v2
        trigger={
          <div>{isActive ? (
            <div className="bg-[#ECF7EC] rounded-[3px] px-[4px] py-[1px] flex justify-center items-center cursor-pointer">
              <span className="text-[#3BB347] text-[12px]">
                开启中
              </span>
            </div>
          ) : (
            <Button
              type="primary"
              style={{ borderRadius: '6px', width: '48px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {openText}
            </Button>
          )}
          </div>
        }
        triggerType="hover"
        closable={false}
        // visible={balloonVisible}
        // onVisibleChange={onVisibleChange}
        className="p-[12px] w-[244px]"
        align="b"
      >
        <div>
          <div className="text-[#333] leading-[22px] text-[14px] mb-[8px]">
            {description}
          </div>
          {onConfirm && (
            <ConfirmButton onClick={onConfirm}>
              确认{isActive ? closeText : openText}
            </ConfirmButton>
          )}
        </div>
      </Balloon>
    </div>
  );
  return (
    <div className="w-[372px]">
      <div className="bg-[#fff] rounded-[6px] p-[16px] h-[129px]">
        <div className="flex items-center justify-between">
          <div className="text-[#333] leading-[19px] text-[16px] font-medium">全球严选商品权益</div>
          <div className="text-[#07f] leading-[17px] text-[14px] cursor-pointer" onClick={() => window.open(describe, '_blank')}>权益说明</div>
        </div>
        <div className="p-[12px] h-[66px] rounded-[4px] mt-[12px]" style={{ background: 'linear-gradient(94deg, rgba(255, 243, 235, 0.8) -70%, rgba(255, 243, 235, 0) 86%)', backdropFilter: 'blur(6px)' }}>
          <div className="grid grid-cols-2">
            {dataRight?.memberRightResults?.map(({ rightDesc = '', isPass = false, acquireRightWay = '' }, index) => (
              <div key={index} className="leading-[17px] flex items-center mb-[8px]">
                <Icon type={isPass ? 'ic_check' : 'close'} size="small" className="mr-1" style={{ color: isPass ? '#3BB347' : '#BBB' }} />
                <span className="text-[14px] text-[#333]">{renderHelpIcon(rightDesc, acquireRightWay)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#fff] rounded-[6px] p-[16px] mt-[16px] flex items-center h-[112px]">
        <CustomBalloon
          title="商机品自动加入全球严选"
          isActive={checked || wholeStore}
          balloonVisible={visible && !wholeStore}
          onVisibleChange={(v) => setVisible(v && !wholeStore)}
          onToggle={() => {
            if (!wholeStore) {
              setVisible(true);
              setBusiness(false);
            }
          }}
          onConfirm={!wholeStore ? () => {
            onSwitchChange(checked);
            setVisible(false);
          } : null}
          description={(checked || wholeStore) ?
            '关闭后商机品无法自动加入全球严选获取流量权益，请慎重考虑。' :
            '开启后，商机品将自动加入全球严选。'
          }
        />

        <Divider direction="ver" className="h-[50px] mx-[13px]" />

        <div className="px-[21px]">
          <CustomBalloon
            title="全店加入全球严选"
            isActive={wholeStore}
            balloonVisible={business}
            onVisibleChange={setBusiness}
            onToggle={() => {
              setBusiness(true);
              setVisible(false);
            }}
            onConfirm={() => {
              if (wholeStore) {
                closeShopAutoJoinFunc();
              } else {
                openShopAutoJoinFunc();
              }
              setBusiness(false);
            }}
            description={wholeStore ?
              '关闭后店铺新增商品无法自动加入全球严选获取流量权益，请慎重考虑。' :
              '开启后，后续新品、商机品也将自动加入全球严选。'
            }
          />
        </div>
      </div>
    </div>
  )
}

export default RightBoard;