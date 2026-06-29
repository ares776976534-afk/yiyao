import React, { useEffect, useState, useRef } from 'react';
import { Dialog, Icon, Balloon } from '@alifd/next';
import ReactDOM from 'react-dom';
import './index.scss';
import './SelectCommoditySub.scss';
import CommonTable from '@/components/CommonTable';
import schema from './selsectSubSchema';
import { fetchIsSeller, fetchSellerItemSubmit, fetchSellerItemCancel } from '@/pages/Select/services';
import { MessageError, MessageSuccess } from '@/utlis';

const container = document.createElement('div');

function RenderBallon(config) {
  const { trigger, content } = config;
  return (
    <Balloon
      v2
      align="t"
      trigger={trigger}
      triggerType="hover"
      closable={false}
      offset={[0, 18]}
      className="bg-[#333] text-[#FFF] text-[14px] p-[12px]"
      popupClassName="products-business-tooltips"
    >
      {content}
    </Balloon>
  );
}
function SelectCommoditySub(props) {
  const { tableQuery } = props.callback;
  const manualRequest = useRef(null);
  const dialogRef = React.createRef();
  const [isSeller, setIsSeller] = useState({});
  const [isV, setIsV] = useState(false);
  const [visible, setVisible] = useState(true);
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
    tableQuery.current();
  };
  const RenderSpan = (config) => {
    const { value } = config;
    return (
      <span className="text-[#FF7300]">{value}</span>
    );
  };
  const shouldReturnTrue = (model) => {
    if (model.identities.length === 0 || model.toSubmitItemNumber === 0) {
      return false;
    } else {
      return true;
    }
  };
  // 商家身份校验 & 商家可提报商品数量
  const queryIsSeller = () => {
    fetchIsSeller().then((res) => {
      const { success, msg, model } = res;
      if (success) {
        setIsSeller(model);
        setIsV(shouldReturnTrue(model));
        manualRequest.current({
          pageIndex: 1,
        });
      } else {
        MessageError(msg);
      }
    });
  };

  useEffect(() => {
    queryIsSeller(() => {});
  }, []);

  // 商家选择提报商品提交
  const onSubmitSellerItem = (record) => {
    fetchSellerItemSubmit({
      itemId: record.itemId,
    }).then((res) => {
      if (res.success) {
        queryIsSeller();
        MessageSuccess('提报成功，您可以在已提报商品或Select商机管理中查看');
      } else {
        MessageError(res?.msg);
      }
    }).catch(() => {
      MessageError('系统繁忙，请稍后再试');
    });
  };

  // 商家撤销已提报商品
  const onCancelSellerItem = (record) => {
    fetchSellerItemCancel({
      itemId: record?.itemId,
    }).then((res) => {
      if (res.success) {
        queryIsSeller();
        MessageSuccess('撤销成功，您可以在已提报商品或Select商机管理中查看');
      } else {
        MessageError(res?.msg);
      }
    }).catch(() => {
      MessageError('系统繁忙，请稍后再试');
    });
  };

  const handleActionClick = ({ type, record }, fn) => {
    manualRequest.current = fn;
    switch (type) {
      case 'currentSubmit':
        onSubmitSellerItem(record);
        break;
      case 'currentCancel':
        onCancelSellerItem(record);
        break;
      default:
        break;
    }
  };

  return (
    <Dialog
      ref={dialogRef}
      v2
      title={
        <div>
          <div className="icon-info flex items-baseline">
            <div className="mr-[5px] text-[16px] font-medium text-[#333]">Select商品自主提报</div>
            {isV && <RenderBallon
              trigger={<Icon type="ic_question" className="text-[#BBB] cursor-pointer" />}
              content={
                <div>
                  <div>根据您的身份，可提报商品数量不同：</div>
                  <div>实力商家+3；超级工厂+5；</div>
                  <div>SKA商家+3；提报数量支持叠加。</div>
                </div>
              }
            />}
          </div>
          {isV && (
            <div
              className="text-[14px] text-[#666] mt-[8px]"
            >
              <span>自主提报的商品，商机的展示类型为“自主提报”。当前的您的身份为</span>
              <RenderSpan value={isSeller?.identities?.join('、') || '-'} />
              <span>，可提报商品数: <RenderSpan value={isSeller?.toSubmitItemNumber} /></span>
              <span>，已提报商品数: <RenderSpan value={isSeller?.alreadySubmitItemNumber} />。</span>
            </div>
          )}
        </div>
      }
      onClose={onClose}
      visible={visible}
      footer={false}
      style={{ height: '640px', width: '1000px', maxHeight: 'none', borderRadius: '12px' }}
      className="dialogInfo"
    >
      {!isV ? (
        <div className="flex justify-center items-center h-[556px] flex-col">
          <img className="w-[130px] h-[117px] mb-[16px]" src="https://img.alicdn.com/imgextra/i3/O1CN01cj0QH01TB8xa4A7jB_!!6000000002343-2-tps-130-117.png" alt="" />
          <div className="text-center">
            <div className="text-[14px] text-[#333] font-medium mb-[8px]">你暂时没有能够自主提报的商品</div>
            <div className="text-[12px] text-[#999] font-normal">成为以下身份，能够进行自主提报。实力商家+3；超级</div>
            <div className="text-[12px] text-[#999] font-normal">工厂+5；ska商家+3；提报数量支持叠加。</div>
          </div>
        </div>
      ) : (
        <CommonTable
          schema={schema}
          getStatusFnOrStatusList={[
            {
              name: (
                <span>
                  符合提报要求商品
                  <RenderBallon
                    trigger={<Icon type="ic_question" className="text-[#BBB] cursor-pointer ml-[8px]" />}
                    content={
                      <div>
                        <div>满足以下所有条件的商品，都将加入到【可提报商品】中：</div>
                        <div>1.Select门槛要求</div>
                        <div>2.近30天GMV≥5000</div>
                        <div>3.已完成“按规格填写件重尺”</div>
                        <div>4.已关联至少1个跨境资质证书（部分类目）</div>
                      </div>
                    }
                  />
                </span>
              ),
              code: '0',
              logName: '可提报商品1',
            },
            { name: '已提报商品', code: '1', logName: '已提报商品1' },
          ]}
          pageSizeSelector={false}
          onActionComplete={handleActionClick}
          searchFilterType="3"
          statusFilterType={{ shape: 'wrapped', type: 1 }}
          otherPagination={{
            type: 'simple',
            shape: 'arrow-only',
          }}
          pageSize="6"
        />
      )}
    </Dialog>
  );
}

SelectCommoditySub.open = (callback) => {
  ReactDOM.render(<SelectCommoditySub callback={callback} />, container);
};

export default SelectCommoditySub;
