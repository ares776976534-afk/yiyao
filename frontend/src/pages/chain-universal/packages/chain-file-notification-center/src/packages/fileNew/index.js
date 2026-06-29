/* eslint-disable react/prop-types */
import React from "react";
import PropTypes from "prop-types";
import { Progress, Notification, Message, Button } from "@alifd/next";
import { TASK_STATUS, TASK_TYPE } from "./constants";
import { FILE_CENTER_START_POLL, TARGET } from "../../constants";
import locale from "../../locale";
import {
  fileTaskSuccess,
  fileTaskError,
  FeedListener,
  exportFileUrl,
  getImportErrorFileUrl,
  getExportUrl,
  getUrlParam,
} from "../../utils";
import service from "../../service";
import { downloadByIframe, record } from "./utils";
import Socket from "./utils/socket";
// import FormattedDateTime from "@alife/ascp-formatted-date-time";
import Reason from "./widges/reason";
// import StyleUL from './style';
import UlContainer from "../../widges/list";
import styled from "styled-components";
import { mockData } from "../../service/mock";
import { throttle } from "../todo/utils";
import { http } from "@alife/ascp-base";
const { fetch } = http;

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
    this.pollData = throttle(this.poll, 1000);
  }

  listener = () => {
    this.onPollListener = new FeedListener(
      FILE_CENTER_START_POLL,
      (p) => {
        console.log("poll", this.props, p);
        let type = "import";
        if (
          p.taskId &&
          (p.taskId.includes("export") || p.taskId.includes("EXPORT"))
        ) {
          type = "export";
        }
        this.getDataSource({...this.props.query, type});
        this.show(type);
      },
      "parent"
    );
  };

  show = (type) => {
    Notification.destroy();
    this.props.onChange({
      activeKey: type || "import",
      visible: true,
      needReload: true,
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
    this.props.reloadFn(this.getDataSource);
    this.getDataSource(this.props.query);
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
  isSomeSuccess = (status) =>
    status === TASK_STATUS.FINISHED || status === TASK_STATUS.PART_FAILED;

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

  getDataSource = (query = {}) => {
    if (getUrlParam("ismock") === "1") {
      console.log("mockDataqqq", query);
      this.checkList(mockData);
      this.setState({
        dataSource: mockData,
      });
      return;
    }
    service
      .getFileList(query)
      .then((res) => {
        if (res.success && res.data) {
          const list = res.data.dataSource || [];
          this.checkList(list);
          this.setState({
            dataSource: list,
          });
        }
      })
      .catch((err) => {
        Message.error("获取列表失败：" + err);
      });
  };
  startRetry = async (item) => {
    if (this.props.retryGei && typeof this.props.retryGei === "function") {
      const data = await this.props.retryGei(item.batchId);
      if (data.success) {
        Message.success("发起重试成功");
      } else {
        Message.error(data.msg);
      }
    } else {
      Message.error("没有 retryGei 方法");
    }
  };
  createExport = (item) => {
    const { taskCode, params } = item;
    // 创建导出任务
    const options = {
      method: "PUT",
      credentials: "include",
      headers: {
        source: "ascp",
      },
    };
    options.data = {
      query: params,
      _scm_token_: window._scm_token_ || "",
    };
    const _taskCode = taskCode.replace("IMPORT", "EXPORT");
    fetch(getExportUrl(_taskCode), options)
      .then((res) => {
        if (res.success) {
          Message.success("发起导出成功, 2秒后刷新【导出】列表");
          setTimeout(() => {
            // 刷新列表
            this.props.onChange({
              activeKey: "export",
              visible: true,
            });
          }, 2000);
        }
      })
      .catch((err) => {
        Message.error("发起导出失败：" + err);
      });
  };
  renderOperation = (item) => {
    const { locale } = this.props;
    // if (this.isError(item.taskStatus)) {
    //   return null;
    // }
    return (
      <>
        {/* {this.isSomeSuccess(item.taskStatus) && */}
        {item.distributionStatus === "DONE" &&
          item.taskType === TASK_TYPE.IMPORT && (
            <a
              onClick={() => {
                this.createExport(item);
              }}
            >
              导出铺货结果
            </a>
          )}
        {item.distributionErrorCount > 0 && (
          <div style={{ height: "20px", lineHeight: "20px" }}>
            <span>铺货失败{item.distributionErrorCount}条</span>
            <a
              onClick={() => {
                const { taskId, taskCode } = item;
                this.startRetry(item);
              }}
              style={{ paddingLeft: "2px" }}
            >
              重试
            </a>
          </div>
        )}
        {this.isSomeSuccess(item.taskStatus) &&
          item.taskType === TASK_TYPE.EXPORT && (
            <a
              onClick={() => {
                const { taskId, batchId } = item;
                downloadByIframe(exportFileUrl(taskId), {});
              }}
            >
              下载铺货结果
            </a>
          )}
      </>
    );
  };

  renderProgress = (item) => {
    return (
      <div className="file-item-progress">
        <Progress percent={item.percent} hasBorder size="medium" />
      </div>
    );
  };

  renderErrorMessage = (item) => {
    const { locale, type } = this.props;
    if (this.isDone(item.taskStatus)) {
      return (
        <>
          <Reason
            locale={locale}
            status={item.taskStatus}
            successCount={item.successCount}
            failCount={item.failCount}
            text={this.isError(item.taskStatus) ? item.errorMessage : null}
            typeText={item.taskType === "IMPORT" ? "导入" : "导出"}
          />
          {item.taskType === TASK_TYPE.IMPORT && this.renderImport(item)}
        </>
      );
    }
    return null;
  };
  judgeStatus = (item) => {
    const status = item.distributionStatus;
    if (item.taskCode === "SUPPLY_PRODUCT_DISTRIBUTION_IMPORT") {
      switch (status) {
        case "DONE":
          return "铺货执行完毕";
        case "INIT":
          return "铺货执行中";
        case "NOT_START":
          return "铺货未开始";
        default:
          return status;
      }
    } else {
      return item.taskCode.replace("SUPPLY_PRODUCT_", "");
    }
  };
  renderImport = (item) => {
    const { locale } = this.props;
    return (
      <>
        {this.isFaild(item.taskStatus) && (
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
            下载导入失败原因
          </a>
        )}
      </>
    );
  };
  getTitle = (item) => {
    const getBatchId = () => {
      const { batchId, params } = item;
      if (batchId) {
        return batchId;
      }
      try {
        return JSON.parse(params).batchId;
      } catch (error) {
        return null;
      }
    }
    const batchId = getBatchId(item);
    if(batchId) {
      return `batchId-${batchId}`;
    }else{
      return `taskName-${item.taskName || themeText}`;
    }
  };
  renderItem = (item) => {
    const { locale } = this.props;
    const themeText = item.taskType === TASK_TYPE.EXPORT ? "导出" : "导入";
    const title = this.getTitle(item);
    return (
      <UlContainer.Item
        className="file-item-container"
        key={item.taskId}
        id={`fileTask-${item.taskId}`}
        icon={item.taskType === TASK_TYPE.IMPORT ? "upload" : "download"}
      >
        <DIV>
          <UlContainer.ItemTitle className="file-item-top">
            <div
              title={`${item.taskName || themeText}`}
            >{title}</div>
          </UlContainer.ItemTitle>
          <div className="file-item-operation">
            <div
              className="file-item-operation-single"
              style={{ textAlign: "left" }}
            >
              {this.renderErrorMessage(item)}
              {this.isPadding(item.taskStatus) ? (
                this.renderProgress(item)
              ) : (
                <time className="file-item-time">
                  {/* <FormattedDateTime relative value={item.startTime} /> */}
                  <div>
                    {themeText}时间：{item.startTime}
                  </div>
                </time>
              )}
            </div>
            <div
              className="file-item-operation-single"
              style={{ textAlign: "right" }}
            >
              <span style={{ paddingBottom: "3px", lineHeight: "20px" }}>
                {this.judgeStatus(item)}
              </span>
              {this.renderOperation(item)}
            </div>
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
    // this.read();
    return (
      <UlContainer
        className="notification-file-container"
        style={{ backgroundColor: "#fff" }}
        emptyTip={locale.fileEmptyTip}
      >
        {/* <Button
          style={{
            position: "fixed",
            top: "12px",
            right: "50px",
            height: "20px",
          }}
          onClick={() => {
            this.getDataSource(this.props.query);
          }}
        >
          刷新当前列表
        </Button> */}
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
    width: 280px;
    .next-progress-line-text {
      color: #000;
    }
  }
  .file-item-time {
    color: #999999;
    font-size: 12px;
    height: 20px;
    line-height: 20px;
  }
  .file-item-operation-single {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .file-item-operation {
    display: flex;
    justify-content: space-between;
    a {
      cursor: pointer;
      color: rgba(47, 136, 245, 1);
      line-height: 22px;
      height: 22px;
    }
  }
`;

FileContainer.defaultProps = {
  onChange: () => {},
  visible: false,
};

FileContainer.propTypes = {
  onChange: PropTypes.func,
  visible: PropTypes.bool,
};
