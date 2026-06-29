/* eslint-disable react/forbid-prop-types */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { ConfigProvider } from '@alifd/next';
import Drawer from '../widges/drawer';
import FileContainer from '../packages/file';
import NotificationContainer from '../style/notification';
import Locale from '../locale';

import { inAscpPortal } from '../utils';

const { config } = ConfigProvider;


class FileCenter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

    onChange = (state) => {
      if (!inAscpPortal()) {
        this.setState({
          ...state,
        });
      }
    };


    render() {
      const { className, style, locale } = this.props;
      const { visible } = this.state;
      if (inAscpPortal()) {
        return null;
      }
      return (
        <NotificationContainer className={`ascp-notification-center ${className}`} style={style}>
          <Drawer
            className={'notification-drawer-container'}
            hasMask={false}
            visible={visible}
            placement="right"
            onClose={() => {
              this.onChange({ visible: false });
            }}
          >
            <FileContainer locale={locale} visible={visible} onChange={this.onChange} />
          </Drawer>
        </NotificationContainer>

      );
    }
}

FileCenter.defaultProps = {
  className: '',
  style: {},
  locale: Locale['zh-cn'],
};

FileCenter.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  locale: PropTypes.object,
};


if (!inAscpPortal()) {
  const ASCP_NOTIFICATION_CONTAINER = 'ascp_file_center_notify';
  if (!document.getElementById(ASCP_NOTIFICATION_CONTAINER)) {
    const notifyContainer = document.createElement('div');
    notifyContainer.id = ASCP_NOTIFICATION_CONTAINER;
    document.body.appendChild(notifyContainer);
    FileCenter.displayName = 'AscpNotificationCenter';
    const LocaleFileCenter = config(FileCenter);
    ReactDOM.render(<LocaleFileCenter />, notifyContainer);
  }
}
