import React, { useState, useEffect } from 'react';
import { Dialog, Checkbox, Icon, Button } from '@alifd/next';
import '../index.scss';

const ResultDialogCell = (props) => {
  const { visible, resultParams = {}, updateTableData, setJoinResultVisible } = props;
  const { _status, _msg } = resultParams;
  const titleCell = (status) => {
    let _titleCell = '';
    switch (status) {
      case 'true':
        _titleCell = <div className="title"><Icon type="success" style={{ color: '#25BE13', marginRight: '4px' }} size="medium" />恭喜，已经成功加入全球严选</div>;
        break;
      case 'false':
        _titleCell = <div className="title"><Icon type="error" style={{ color: '#FF0000', marginRight: '4px' }} size="medium" />加入失败，请重新提交</div>;
        break;
      default:
        break;
    }
    return _titleCell;
  };
  const contentCell = (status, msg) => {
    if (status === 'true') {
      return '成功文案-';
    } else {
      return msg;
    }
  };
  return (
    <>
      <Dialog
        visible={visible}
        title={titleCell(_status)}
        footerActions={['ok']}
        className="dialog-result"
        footerAlign="center"
        onClose={() => { updateTableData(); setJoinResultVisible(false); }}
        onOk={() => { updateTableData(); setJoinResultVisible(false); }}
        okProps={{
          children: '我知道了',
        }}
      >
        <div>{contentCell(_status, _msg)}</div>
      </Dialog>
    </>);
};

export default ResultDialogCell;
