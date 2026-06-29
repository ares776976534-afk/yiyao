/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { ConfigProvider } from '@alifd/next';
import Locale from './locale';
import { http } from '@alife/ascp-base';
import { record } from './utils';
// import '@alife/ascp-notification-center/lib/entry/filecenter';
// import { startPoll, FeedListener, getExportUrl } from '@alife/ascp-notification-center/lib/utils/index';
// import { FILE_CENTER_ON_SUCCESS, FILE_CENTER_ON_ERROR } from '@alife/ascp-notification-center/lib/constants/index';
import '@alife/1688-chain-file-notification-center/esm/entry/filecenter.js';
import { startPoll, FeedListener, getExportUrl } from '@alife/1688-chain-file-notification-center/esm/utils/index';
import { FILE_CENTER_ON_SUCCESS, FILE_CENTER_ON_ERROR } from '@alife/1688-chain-file-notification-center/esm/constants/index';

const { fetch } = http;

const { config } = ConfigProvider;

class FileExport extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.successFeed = new FeedListener(`${FILE_CENTER_ON_SUCCESS}_${props.code}`, this.onSuccess, 'children');
    this.faildFeed = new FeedListener(`${FILE_CENTER_ON_ERROR}_${props.code}`, this.onError, 'children');
  }

  onPollNotify=(data) => {
    const { code } = this.props;
    const { taskId } = data;
    startPoll(code, taskId);
    record('EXPORT_TASK_SUCCESS', {
      taskCode: code,
      taskId,
    });
  }

  componentWillUnmount() {
    if (this.successFeed && this.faildFeed) {
      this.successFeed.destroy();
      this.faildFeed.destroy();
    }
  }

onSuccess=(data) => {
  const { onSuccess } = this.props;
  if (onSuccess && typeof onSuccess === 'function') {
    onSuccess({
      success: true,
      data,
    });
  }
}

onError=(data) => {
  const { onError } = this.props;
  if (onError && typeof onError === 'function') {
    onError({
      success: false,
      errorMessage: data.errorMessage || '',
      errorCode: data.errorCode || '',
      data,
    });
  }
}


onClick(e) {
  if (this.doning) {
    return;
  }
  this.doning = true;
  e.preventDefault();
  const { getData, code } = this.props;
  const options = {
    method: 'PUT',
    credentials: 'include',
    headers: {
      source: 'ascp',
    },
  };
  options.data = {
    query: JSON.stringify({ ...getData() }),
    _scm_token_: window._scm_token_ || '',
  };
  fetch(getExportUrl(code), options).then((res) => {
    if (res.success) {
      this.onPollNotify(res.data);
    } else {
      this.onError({ errorMessage: res.errorMessage, errorCode: res.errorCode });
    }
  }).catch((error) => {
    this.onError(error);
  }).finally(() => {
    this.doning = false;
  });
}

render() {
  const { children, style, className } = this.props;

  !style.display && (style.display = 'inline-block');
  if (!children) {
    console && console.error('AscpDownload should have children as UI component');
    return null;
  }
  return (
    <>
      <span style={style} className={className} onClick={this.onClick}>
        {children}
      </span>
    </>
  );
}
}

FileExport.displayName = 'AscpFileExport';
FileExport.defaultProps = {
  locale: Locale['zh-cn'],
  code: '',
  getData: () => ({}),
  style: {},
  className: '',
  children: null,
  onSuccess: null,
  onError: null,
};
FileExport.propTypes = {
  /**
   * GEI 根据业务场景定义的code
   */
  code: PropTypes.string,
  /**
   * 在发起请求前内部主动从组件外拉取请求参数的方法
   */
  getData: PropTypes.func,
  /**
   * 国际化locale
   */
  locale: PropTypes.object,
  /**
   * 样式
   */
  style: PropTypes.object,
  /**
   * className
   */
  className: PropTypes.string,
  /**
   * 子元素
   */
  children: PropTypes.any,
  onError: PropTypes.func,
  onSuccess: PropTypes.func,
};

const LocaleComponent = config(FileExport);

export default LocaleComponent;

