/* eslint-disable react/prop-types */
/* eslint-disable no-nested-ternary */
import React from 'react';

export default class Drawer extends React.Component {
  render() {
    const { children, visible, className, onClose, placement, style } = this.props;
    let animateClass = visible ? 'notification-expand' : '';
    if (placement === 'right') {
      animateClass = visible ? 'animate__fadeInLeftBig' : '';
    }
    return (
      <div className={`ascp-drawer animate__animated ${animateClass} ${className} ${placement}-container`} style={style}>
        <a className={`ascp-drawer-header  ${placement}`}>
          <i className={'next-icon next-icon-close next-medium ascp-drawer-close-icon'} onClick={onClose} />
        </a>
        {children}
      </div>
    );
  }
}
