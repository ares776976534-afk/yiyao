/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Tab, ConfigProvider } from '@alifd/next';
import Drawer from '../widges/drawer';
import constants, { TARGET } from '../constants';
// import { FileContainer, TodoContainer } from '../packages';
import FileContainer from '../packages/file';
import TodoContainer from '../packages/todo';
import NotificationContainer from '../style/notification';
import Locale from '../locale';

const { config } = ConfigProvider;

class Notification extends React.Component {
  listenClickOther=() => {
    this.props.onChange({ visible: false });
  };

  componentDidMount() {
    document.getElementById('notification-center-mask').addEventListener('click', this.listenClickOther);
  }

  componentWillUnmount() {
    document.getElementById('notification-center-mask').removeEventListener('click', this.listenClickOther);
  }


  render() {
    const { activeKey, onChange, visible, className, style, counts, locale } = this.props;
    console.log(this.props);
    return (
      <NotificationContainer id="notification-center" className={`ascp-notification-center ${className}`} style={{ position: "relative", ...style }}>
        <Drawer
          className={'notification-drawer-container'}
          hasMask={false}
          visible={visible}
          placement={'top'}
          onClose={() => {
            onChange({ visible: false });
          }}
        >
          <Tab
            lazyLoad={false}
            shape="text"
            activeKey={activeKey}
            onChange={(value) => {
              this.props.onChange({
                activeKey: value,
              });
            }}
          >
            {/* <Tab.Item key={TARGET.TODO} title={`${locale[TARGET.TODO]} ${counts[TARGET.TODO] || ''}`}>
              <TodoContainer {...this.props} />
            </Tab.Item> */}
            <Tab.Item key={TARGET.FILE} title={`${locale[TARGET.FILE]} ${counts[TARGET.FILE] || ''}`}>
              <FileContainer {...this.props} />
            </Tab.Item>
          </Tab>
        </Drawer>
        <div id="notification-center-mask" className={`notification-center-mask ${visible ? 'show' : ''}`} />
      </NotificationContainer>
    );
  }
}

Notification.displayName = 'AscpNotificationCenter';
Notification.defaultProps = {
  activeKey: constants.DATASOURCE.Target[0].value,
  onChange: () => {},
  counts: {},
  onCountChange: () => {},
  visible: false,
  className: '',
  style: {},
  pageManager: window.pageManager,
  locale: Locale['zh-cn'],
  isMock: false,
};

Notification.propTypes = {
  activeKey: PropTypes.oneOf(constants.DATASOURCE.Target.map(i => (i.value))),
  onChange: PropTypes.func,
  visible: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  onCountChange: PropTypes.func,
  counts: PropTypes.object,
  pageManager: PropTypes.object,
  locale: PropTypes.object,
  isMock: PropTypes.bool,
};

const LocaleNotification = config(Notification);

export default LocaleNotification;
