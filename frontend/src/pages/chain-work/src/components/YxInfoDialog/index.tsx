import { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import './index.scss';

const container = document.createElement('div');

interface YxInfoDialogProps {
  visible?: boolean;
  onClose?: () => void;
  url?: string;
}

function YxInfoDialog(props: YxInfoDialogProps) {
  const {
    visible: propVisible,
    onClose: propOnClose,
    url = 'https://air.1688.com/kapp/yanxuan-fe/workbench/yx-dialog?modal_type=kuajing',
  } = props;

  // 如果传入了 visible prop，使用它；否则使用内部状态（.open() 模式）
  const isOpenMode = propVisible === undefined;
  const [internalVisible, setInternalVisible] = useState(true);
  const visible = propVisible !== undefined ? propVisible : internalVisible;

  const handleClose = useCallback(() => {
    if (isOpenMode) {
      ReactDOM.unmountComponentAtNode(container);
      setInternalVisible(false);
    }
    propOnClose?.();
  }, [isOpenMode, propOnClose]);

  // 监听 iframe 发送的事件
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { actionType } = event.data || {};

      // 监听关闭事件
      if (actionType === 'YX_MODAL_CLOSE') {
        handleClose();
      }

      // 监听签约成功事件
      if (actionType === 'YX_MODAL_SUCCESS') {
        handleClose();
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className="yx-info-dialog-content" onClick={(e) => e.stopPropagation()}>
      <iframe
        src={url}
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          display: 'block',
        }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
      />
    </div>
  );
}

YxInfoDialog.open = (props: YxInfoDialogProps) => {
  if (!document.body.contains(container)) {
    document.body.appendChild(container);
  }
  ReactDOM.render(<YxInfoDialog {...props} />, container);
};

export default YxInfoDialog;
