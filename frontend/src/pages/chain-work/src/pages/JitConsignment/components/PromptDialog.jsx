import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Dialog, Icon, Button } from '@alifd/next';
import Message from '@/components/UI/Message';
import { cancelFPOrder } from '@/pages/JitPerformance/services';
import PrintPreviewDialog from '@/pages/AeOrder/components/PrintPreviewDialog';

const container = document.createElement('div');

const type = {
  error: (
    <div>
      <Icon type="d-cancel" className="text-[#FB3B20] mr-[8px]" />
      <span className="font-medium text-[16px] text-[#333]">发货失败</span>
    </div>
  ),
  success: (
    <div>
      <Icon type="success" className="text-[#3BB347] mr-[8px]" />
      <span className="font-medium text-[16px] text-[#333]">发货成功</span>
    </div>
  ),
  other: (
    <div>
      <span className="font-medium text-[16px] text-[#333]">确定取消揽收吗？</span>
    </div>
  ),
};
const PromptDialog = ({ props }) => {
  const printDialog = useRef(null);
  const dialogRef = React.createRef();
  const { state, content, consignOrderId = '', getData = () => {}, pickupOrderNumber = '', selectedKey = '' } = props;
  const [visible, setVisible] = useState(true);
  const onCancelFPOrder = () => {
    cancelFPOrder({ consignOrderId }).then((res) => {
      const { success, model, msg } = res;
      if (success && model) {
        setVisible(false);
        Message._show({ content: '取消揽收成功', type: 'success' });
        getData();
      } else {
        Message._show({ content: msg || '取消揽收失败', type: 'error' });
      }
    });
  };
  // 打印揽收单
  const printWayBill = () => {
    printDialog.current.onOpen({
      type: 'jitPrintWayBill',
      pickupOrderNumber,
    });
  };
  const typeBtn = {
    error: <Button type="primary" onClick={() => setVisible(false)} style={{ borderRadius: '6px' }}>我知道了</Button>,
    success: (
      <div>
        {selectedKey === 'DOOR_2_DOOR_PICK_UP' && <Button type="primary" onClick={printWayBill} style={{ borderRadius: '6px' }}>打印揽收单</Button>}
        {selectedKey === 'SUPPLIER_OFFLINE_SEND' && (
          <Button
            type="primary"
            onClick={() => {
              setVisible(false);
              navigateWithQueryParams();
            }}
            style={{ borderRadius: '6px' }}
          >
            继续发货
          </Button>
        )}
      </div>
    ),
    other: (
      <div>
        <Button type="primary" onClick={onCancelFPOrder} style={{ borderRadius: '6px', marginRight: '12px' }}>确定</Button>
        {/* <Button type="normal" onClick={() => setVisible(false)} style={{ borderRadius: '6px' }}>取消</Button> */}
      </div>
    ),
  };
  const navigateWithQueryParams = () => {
    // const currentUrl = new URL(window.location.href);
    // const { origin } = currentUrl;
    window.open('https://work.1688.com/?_path_=gonghuotuoguan/cross_boarder_2/jit', '_blank');
  };
  const onClose = () => {
    if (pickupOrderNumber) {
      navigateWithQueryParams();
    }
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };
  return (
    <>
      <Dialog
        ref={dialogRef}
        v2
        title={type[state]}
        visible={visible}
        footerAlign="center"
        style={{ width: '400px' }}
        footer={typeBtn[state]}
        closeIcon={selectedKey === 'SUPPLIER_OFFLINE_SEND' && <div className="cursor-auto w-[20px] h-[20px]" />}
        onClose={selectedKey === 'SUPPLIER_OFFLINE_SEND' ? null : onClose}
      >
        <div className="text-[#333] text-[14px]">
          {content}
        </div>
      </Dialog>
      <PrintPreviewDialog ref={printDialog} />
    </>
  );
};

PromptDialog.open = (props) => {
  ReactDOM.render(<PromptDialog props={props} />, document.createElement('div'));
};

export default PromptDialog;
