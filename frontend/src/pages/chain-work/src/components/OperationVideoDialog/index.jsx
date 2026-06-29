import React, { useEffect, useState } from 'react';
import { Dialog } from '@alifd/next';
import ReactDOM from 'react-dom';
import Videox from '@ali/videox';

const container = document.createElement('div');

function OperationVideoDialog({ props }) {
  const { title = '操作视频', video = '', content = <></> } = props || {};
  const [visible, setVisible] = useState(true);
  const dialogRef = React.createRef();
  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
  };
  const showVideoDialog = (videoSrc) => {
    localStorage.setItem('smt-leading-video', 'true');

    setTimeout(() => {
      const divEl = document.getElementById('videx-container');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const videox = new Videox({
        container: divEl,
        controls: true,
        volumeControls: true,
        playbackRateControls: true,
        src: videoSrc,
      });
    }, 100);
  };
  useEffect(() => {
    showVideoDialog(video);
  }, []);
  return (
    <Dialog
      ref={dialogRef}
      v2
      title={title}
      visible={visible}
      footerActions={['cancel']}
      onCancel={onClose}
      onClose={onClose}
      cancelProps={{ children: '知道了' }}
      footerAlign={'center'}
      style={{ width: 948 }}
    >
      {content}
      <div id="videx-container" style={{ width: 900, height: 506 }} />
    </Dialog>
  );
}

OperationVideoDialog.open = (props) => {
  ReactDOM.render(<OperationVideoDialog props={props} />, container);
};

export default OperationVideoDialog;
