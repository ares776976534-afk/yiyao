import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Upload, ConfigProvider, Icon, Dialog } from '@alifd/next';
import Locale from './locale';
// import variables from '@alife/theme-ascp/variables';
import variables from './scss/variables.js';
import { downloadByIframe, record } from './utils';
// import '@alife/ascp-notification-center/lib/entry/filecenter';
// import { FILE_CENTER_ON_SUCCESS, FILE_CENTER_ON_ERROR } from '@alife/ascp-notification-center/lib/constants/index';
// import { startPoll, FeedListener, getImportUrl, getImportTemplateUrl } from '@alife/ascp-notification-center/lib/utils/index';
import '@alife/1688-chain-file-notification-center/esm/entry/filecenter.js';
import { FILE_CENTER_ON_SUCCESS, FILE_CENTER_ON_ERROR } from '@alife/1688-chain-file-notification-center/esm/constants/index';
import { startPoll, FeedListener, getImportUrl, getImportTemplateUrl} from '@alife/1688-chain-file-notification-center/esm/utils/index';


const DIV = styled.div`
padding: 0 4px;
.next-upload-inner.next-hidden{
  display: none;
}

.template-wrapper{
  font-size: ${variables['$font-size-body-1']};
  padding-bottom: 10px;
  .template-tip{
    line-height: ${variables['$font-lineheight-2']};
    color: ${variables['$color-text1-3']};
  }
  a{
    color: ${variables['$color-link-1']};
    line-height: ${variables['$font-lineheight-2']};
    cursor: pointer;
  }
}

.upload-title{
   line-height: 20px;
   height: 20px;
   color:${variables['$color-text1-3']};
   margin-bottom:3px;
}
.next-upload{
  height: 122px;
}
`;
const TipContainer = styled.div`
  padding:14px 0;
  color: #AAA;
`;


const { config } = ConfigProvider;

const getTitle = (children) => {
  if (typeof children === 'string') {
    return children;
  }
  if (children && children.props && children.props.children) {
    return getTitle(children.props.children);
  }
  return '导入';
};

class FileImport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    this.successFeed = new FeedListener(`${FILE_CENTER_ON_SUCCESS}_${props.code}`, this.onSuccess, 'children');
    this.faildFeed = new FeedListener(`${FILE_CENTER_ON_ERROR}_${props.code}`, this.onError, 'children');
  }

  componentWillUnmount() {
    if (this.successFeed && this.faildFeed) {
      this.successFeed.destroy();
      this.faildFeed.destroy();
    }
  }

saveUploaderRef = (ref) => {
  this.uploaderRef = ref ? ref.getInstance() : null;
};

beforeUpload(info, options) {
  return options;

}

toggleUploadDialog=() => {
  this.setState({
    visible: !this.state.visible,
  });
}

submit=() => {
  console.log(this.uploaderRef);
  if (this.uploaderRef) {
    this.uploaderRef.startUpload();
  }
}

onFileUploadSuccess=(res) => {
  if (res.response && res.response.success) {
    const { code } = this.props;
    startPoll(code, res.response.data.taskId);
    record('IMPORT_TASK_SUCCESS', {
      taskCode: code,
      taskId: res.response.data.taskId,
    });
    this.toggleUploadDialog();
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

downloadTemplate=() => {
  const { code, templateUrl, getData } = this.props;
  record('IMPORT_TEMPLATE_DOWNLOAD', {
    taskCode: code,
    templateUrl,
  });
  downloadByIframe(templateUrl || getImportTemplateUrl(code), getData());
}

render() {
  const { code, children, style, className, getData, locale, tip } = this.props;
  const { visible } = this.state;
  !style.display && (style.display = 'inline-block');
  if (!children) {
    console && console.error('AscpUpload should have children as UI component');
    return null;
  }


  return (
    <>
      <span style={style} className={className} onClick={this.toggleUploadDialog}>{children}</span>
      <Dialog style={{ width: '540px' }} title={getTitle(children)} visible={visible} onOk={this.submit} onCancel={this.toggleUploadDialog} onClose={this.toggleUploadDialog}>
        <DIV>
          <div className="template-wrapper">
            <span className="template-tip">{locale.templateTip}</span>
            <a onClick={this.downloadTemplate}>{locale.downloadTemplate}</a>
          </div>
          <div className="upload-title">{locale.upload}</div>
          <Upload
            action={getImportUrl(code)}
            autoUpload={false}
            ref={this.saveUploaderRef}
            beforeUpload={this.beforeUpload}
            listType="text"
            limit={1}
            headers={{
              source: 'ascp',
            }}
            method="put"
            name="file"
            dragable
            onError={this.onError}
            onSuccess={this.onFileUploadSuccess}
            data={{
              query: JSON.stringify({ ...getData() }),
              _scm_token_: window._scm_token_ || '',
            }}
          >
            <div className="next-upload-drag">
              <p className="next-upload-drag-icon"><Icon type="upload" /></p>
              <p className="next-upload-drag-text">{locale.uploadTip}</p>
              <p className="next-upload-drag-hint">{locale.uploadHint}</p>
            </div>
          </Upload>
          {tip ?
            <TipContainer>
              {tip}
            </TipContainer> : null}
        </DIV>
      </Dialog>
    </>
  );
}
}


FileImport.displayName = 'AscpFileImport';
FileImport.defaultProps = {
  locale: Locale['zh-cn'],
  code: '',
  getData: () => ({}),
  style: {},
  className: '',
  children: null,
  onSuccess: () => {},
  onError: () => {},
  templateUrl: null,
  tip: null,
};
FileImport.propTypes = {
  /**
   * GEI 根据业务场景定义的code
   */
  code: PropTypes.string,
  /**
   * 在发起请求前内部主动从组件外拉取请求参数的方法
   */
  getData: PropTypes.func,
  /**
   * 模板地址
   */
  templateUrl: PropTypes.string,
  /**
   * tip
   */
  tip: PropTypes.any,
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
  /**
   * 上传成功的回调函数
   */
  onError: PropTypes.func,
  /**
   * 上传失败的回调函数
   */
  onSuccess: PropTypes.func,
};

const LocaleComponent = config(FileImport);

export default LocaleComponent;

