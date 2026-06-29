import React from 'react';
import { isInIframe } from '@/utlis';
import WorkSkin from '../WorkSkin';
import './index.scss';

const iframeStyle = {
  paddingLeft: 0,
};

function NewWorkLayout(props) {
  const { title, children, subTitle, style = {}, width = '100%', showNav = false } = props;
  const _style = isInIframe() ? iframeStyle : {};
  return (
    <>
      {showNav && <WorkSkin />}
      <div className="newWorkLayout" style={{ ...style, ..._style }}>
        {title ? (
          <div className="newWorkLayout-header" style={{ width }}>
            <div className="newWorkLayout-title">{title}</div>
            <div className="newWorkLayout-subTitle">{subTitle}</div>
          </div>
        ) : null}
        <div className="newWorkLayout-content" style={{ width }}>
          {children}
        </div>
      </div>
    </>
  );
}

export default NewWorkLayout;
