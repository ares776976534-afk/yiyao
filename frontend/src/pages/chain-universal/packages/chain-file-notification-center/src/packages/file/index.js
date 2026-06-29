/* eslint-disable react/prop-types */
import React from "react";
import PropTypes from "prop-types";
import { Progress, Notification } from "@alifd/next";
import { TASK_STATUS, TASK_TYPE } from "./constants";
import { FILE_CENTER_START_POLL, TARGET } from "../../constants";
import locale from '../../locale';
import {
  fileTaskSuccess,
  fileTaskError,
  FeedListener,
  exportFileUrl,
  getImportErrorFileUrl,
} from "../../utils";
import service from "../../service";
import { downloadByIframe, record } from "./utils";
import Socket from "./utils/socket";
// import FormattedDateTime from "@alife/ascp-formatted-date-time";

import Reason from "./widges/reason";
// import StyleUL from './style';
import UlContainer from "../../widges/list";
import styled from "styled-components";
// // import variables from '@alife/theme-ascp/variables';
// import variables from '../../style/variables.js';

Notification.config({
  offset: [0, 0],
});

export default class FileContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    };
    this.progressMap = {};
    this.listener();
    // this.pollData = throttle(this.poll, 1000);
  }

  listener = () => {
    this.onPollListener = new FeedListener(
      FILE_CENTER_START_POLL,
      () => {
        this.getDataSource();
        this.show();
      },
      "parent"
    );
  };

  show = () => {
    Notification.destroy();
    this.props.onChange({
      activeKey: "import",
      visible: true,
    });
  };

  showAndPosition = (item) => {
    this.show();
    this.time = setTimeout(() => {
      const element = document.getElementById(`fileTask-${item.taskId}`);
      element.scrollIntoView({
        block: "start",
        inline: "nearest",
        behavior: "smooth",
      });
      element.className = `${element.className} animate__animated animate__pulse`;
      clearTimeout(this.time);
    }, 500);
  };

  componentWillUnmount() {
    this.onPollListener.destroy();
  }

  componentDidMount() {
    this.getDataSource();
  }

  poll = (taskId, res = {}) => {
    const { data } = res;
    if (data) {
      const { dataSource } = this.state;
      const item = dataSource.find((i) => i.taskId === taskId);
      const newItem = { ...item, ...data };
      this.progressMap[taskId].percent = newItem.percent;

      const newDataSource = dataSource.map((i) => {
        if (i.taskId === taskId) {
          return newItem;
        }
        return i;
      });

      this.setState(
        {
          dataSource: newDataSource,
        },
        () => {
          if (
            newItem.taskStatus !== item.taskStatus &&
            this.isDone(newItem.taskStatus)
          ) {
            this.progressMap[taskId].socket.close();
            delete this.progressMap[taskId];
            this.notify(newItem);
          }
        }
      );
    }
  };

  isPadding = (status) => !this.isDone(status);

  isDone = (status) =>
    status === TASK_STATUS.FINISHED ||
    status === TASK_STATUS.ERROR ||
    status === TASK_STATUS.PART_FAILED;

  isError = (status) => status === TASK_STATUS.ERROR;

  isFaild = (status) => status === TASK_STATUS.PART_FAILED;

  checkList = (newList) => {
    newList.forEach((item) => {
      if (this.isPadding(item.taskStatus)) {
        const { taskId } = item;
        if (this.progressMap[taskId]) {
          item.percent = this.progressMap[taskId].percent || item.percent;
        } else {
          this.progressMap[taskId] = {
            socket: new Socket(taskId, (res) => this.poll(taskId, res)),
          };
        }
      }
    });
  };

  openWebexcel = (item) => {
    const { pageManager = window.pageManager, appendBizTypeInfo } = this.props;
    let url = `/pages/ascm/common_import_fix?taskId=${item.taskId}&taskCode=${
      item.taskCode
    }&params=${encodeURIComponent(encodeURIComponent(item.params))}`;
    if (appendBizTypeInfo && typeof appendBizTypeInfo === "function") {
      url = appendBizTypeInfo(url);
    }
    pageManager.openSingleton(url);
  };

  notify = (item) => {
    const { locale } = this.props;
    const name = `${item.taskName}`;
    if (item.taskStatus === TASK_STATUS.FINISHED) {
      const title =
        item.taskType === TASK_TYPE.IMPORT
          ? locale.importSuccess
          : locale.exportSuccess;
      fileTaskSuccess(item);
      if (!this.props.visible) {
        Notification.success({
          title,
          content: `${name}${title}`,
          onClick: () => this.showAndPosition(item),
          onClose: () => {
            Notification.destroy();
          },
        });
      }
    } else {
      const title =
        item.taskType === TASK_TYPE.IMPORT
          ? locale.importError
          : locale.exportError;
      fileTaskError(item);
      if (!this.props.visible) {
        Notification.error({
          title,
          content: `${name}${title}，${item.errorMessage}`,
          onClick: () => this.showAndPosition(item),
          onClose: (e) => {
            Notification.destroy();
            return false;
          },
        });
      }
    }
  };

  getDataSource = () => {
    service.getFileList({}).then((res) => {
      if (res.success && res.data) {
        const list = res.data.dataSource || [];
        this.checkList(list);
        this.setState({
          dataSource: list,
        });
      }
    }).catch((err) => {
      console.log('222',err);
    });
  };

  renderOperation = (item) => {
    const { locale } = this.props;
    if (this.isError(item.taskStatus)) {
      return null;
    }
    if (this.isFaild(item.taskStatus)) {
      return (
        <div className="file-item-operation">
          <a
            onClick={() => {
              const { taskId, taskCode } = item;
              downloadByIframe(getImportErrorFileUrl(taskId), {});
              record("IMPORT_DOWNLOAD_ERROR_FILE", {
                taskId,
                taskCode,
              });
            }}
          >
            {locale.downloadReason}
          </a>
          <a
            onClick={() => {
              const { taskId, taskCode } = item;
              this.openWebexcel(item);
              record("IMPORT_FIX_BY_WEBEXCEL", {
                taskId,
                taskCode,
              });
            }}
          >
            {locale.onlineEdit}
          </a>
        </div>
      );
    }

    if (item.taskStatus === TASK_STATUS.FINISHED) {
      if (item.taskType === TASK_TYPE.EXPORT) {
        return (
          <div className="file-item-operation">
            <a
              onClick={() => {
                const { taskId } = item;
                console.log('taskId',taskId,exportFileUrl(taskId));
                downloadByIframe(exportFileUrl(taskId), {});
              }}
            >
              {locale.download}
            </a>
          </div>
        );
      }
    }
    return <div className="file-item-operation" />;
  };

  renderProgress = (item) => (
    <div className="file-item-progress">
      <Progress percent={item.percent} />
    </div>
  );

  renderErrorMessage = (item) => {
    const { locale } = this.props;

    if (this.isDone(item.taskStatus)) {
      return (
        <div className="file-item-operation">
          <Reason
            locale={locale}
            status={item.taskStatus}
            successCount={item.successCount}
            failCount={item.failCount}
            text={this.isError(item.taskStatus) ? item.errorMessage : null}
          />
        </div>
      );
    }
    return null;
  };

  renderItem = (item) => {
    const { locale } = this.props;
    return (
      <UlContainer.Item
        className="file-item-container"
        key={item.taskId}
        id={`fileTask-${item.taskId}`}
        icon={item.taskType === TASK_TYPE.IMPORT ? "daoru" : "daochu"}
      >
        <DIV>
          <UlContainer.ItemTitle className="file-item-top">
            <div title={`${item.taskName}-${item.taskId}`}>{`${
              item.taskName ||
              (item.taskType === TASK_TYPE.EXPORT
                ? locale.exportTask
                : locale.importTask)
            }`}</div>
          </UlContainer.ItemTitle>
          <div className="file-item-errorMessage">
            {this.renderErrorMessage(item)}
          </div>
          <div className="file-item-bottom">
            {this.isPadding(item.taskStatus) ? (
              this.renderProgress(item)
            ) : (
              <time className="file-item-time">
                {/* <FormattedDateTime relative value={item.startTime} /> */}
                <div>{item.startTime}</div>
              </time>
            )}
            {this.renderOperation(item)}
          </div>
        </DIV>
      </UlContainer.Item>
    );
  };

  read = () => {
    const { dataSource } = this.state;
    const { visible, counts = [], onCountChange } = this.props;
    const oldCount = counts[TARGET.FILE] || 0;
    let count = 0;
    let lastReadTime = window.localStorage.getItem(
      "notification-file-doneTime"
    );
    if (visible) {
      lastReadTime = new Date().getTime();
      window.localStorage.setItem("notification-file-doneTime", lastReadTime);
    }
    dataSource.forEach((item) => {
      if (
        this.isDone(item.taskStatus) &&
        new Date(item.doneTime).getTime() > lastReadTime
      ) {
        count++;
      }
    });
    if (count !== oldCount && typeof onCountChange === "function") {
      onCountChange({ [TARGET.FILE]: count });
    }
  };

  render() {
    const { locale } = this.props;
    const { dataSource } = this.state;
    this.read();
    return (
      <UlContainer
        className="notification-file-container"
        emptyTip={locale.fileEmptyTip}
      >
        {dataSource.map((item) => this.renderItem(item))}
      </UlContainer>
    );
  }
}

const DIV = styled.div`
  .file-item-content {
    padding-left: 12px;
    flex-grow: 1;
  }
  .file-item-top {
    display: flex;
    line-height: 1.2;
    height: 30px;
  }
  .file-item-bottom {
    display: flex;
    height: 22px;
    line-height: 22px;
  }
  .file-item-name {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    font-size: 14px;
    font-weight: normal;
    color: #666666;
    &.read {
      font-weight: 600;
    }
  }
  .file-item-status {
    dis &.finished {
      color: rgba(15, 161, 118, 1);
    }
    &.error {
      color: #d13921;
    }
  }
  .file-item-progress {
    width: 100%;
    .next-progress-line-text {
      color: #000;
    }
  }
  .file-item-time {
    color: #999999;
    font-size: 12px;
  }
  .file-item-operation {
    flex-grow: 1;
    text-align: right;
    cursor: pointer;
    a {
      color: rgba(47, 136, 245, 1);
      padding-left: 16px;
    }
  }
`;

FileContainer.defaultProps = {
  onChange: () => {},
  visible: false,
};

FileContainer.propTypes = {
  onChange: PropTypes.func,
  visible: false,
};
