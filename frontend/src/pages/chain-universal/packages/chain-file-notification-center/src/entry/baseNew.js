/* eslint-disable react/forbid-prop-types */
import React from "react";
import PropTypes, { string } from "prop-types";
import { Tab, ConfigProvider } from "@alifd/next";
import Drawer from "../widges/drawer";
import constants, { TARGET } from "../constants";
// import { FileContainer, TodoContainer } from '../packages';
import FileContainer from "../packages/fileNew";
import TodoContainer from "../packages/todo";
import NotificationContainer from "../style/notification";
import Locale from "../locale";

const { config } = ConfigProvider;

class Notification extends React.Component {
  listenClickOther = () => {
    this.props.onChange({ visible: false });
  };

  componentDidMount() {
    document
      .getElementById("notification-center-mask")
      .addEventListener("click", this.listenClickOther);
  }

  componentWillUnmount() {
    document
      .getElementById("notification-center-mask")
      .removeEventListener("click", this.listenClickOther);
  }

  render() {
    const { activeKey, onChange, visible, className, style, counts, locale } =
      this.props;
    // console.log(this.props);
    return (
      <NotificationContainer
        id="notification-center"
        className={`ascp-notification-center ${className}`}
        style={{ position: "relative", ...style }}
      >
        <Drawer
          className={"notification-drawer-container"}
          hasMask={true}
          visible={visible}
          placement={"top"}
          onClose={() => {
            onChange({ visible: false });
          }}
        >
          <Tab
            // lazyLoad={false}
            shape="text"
            activeKey={activeKey}
            unmountInactiveTabs
            onChange={(value) => {
              this.props.onChange({
                visible: true,
                activeKey: value,
                needReload: false
              });
            }}
          >
            <Tab.Item key={"import"} title={`导入`}>
              <FileContainer {...this.props} query={{ type: "import" }} />
            </Tab.Item>
            <Tab.Item key={"export"} title={"导出"}>
              <FileContainer {...this.props} query={{ type: "export" }} />
            </Tab.Item>
          </Tab>
        </Drawer>
        <div
          id="notification-center-mask"
          className={`notification-center-mask ${visible ? "show" : ""}`}
        />
      </NotificationContainer>
    );
  }
}

Notification.displayName = "AscpNotificationCenter";
Notification.defaultProps = {
  activeKey: "import",
  onChange: () => {},
  counts: {},
  onCountChange: () => {},
  visible: false,
  className: "",
  style: {},
  pageManager: window.pageManager,
  locale: Locale["zh-cn"],
  isMock: false,
};

Notification.propTypes = {
  activeKey: PropTypes.string,
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
