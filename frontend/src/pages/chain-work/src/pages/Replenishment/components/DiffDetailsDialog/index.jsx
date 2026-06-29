import React, { useState, useEffect } from 'react';
import { Button, Dialog, Table, Loading, Message } from '@alifd/next';
import ReactDOM from 'react-dom';
import { Image } from 'antd';
import './index.scss';
import { getTallySheetQuery, getTallySheetOperate, getEngineeringCode } from '../../api';

const classNa = 'diff-dialog';
const DINGTALK_URL = 'dingtalk://dingtalkclient/action/sendmsg?spm=a2638g.u_0_1001.wkservicer.1.62171768dvFjAZ&dingtalk_id=';

const STATE_MAP = {
  processing: '处理中',
  finish: '已确认',
  cancel: '已拒绝',
};

const DiffDetailsDialog = ({ onClose, warehouseBizId }) => {
  const [visible, setVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState();
  useEffect(() => {
    // 差异单明细
    getTallySheetQuery(warehouseBizId).then((res) => {
      setData(res.data.model);
      setIsLoading(false);
    });
  }, []);

  const handleClose = () => {
    onClose && onClose();
    setVisible(false);
  };

  const btnClick = () => {
    const params = {
      tallySheetId: data?.id,
      bizType: data?.bizType, // 增加差异单取消的入参类型
    };
    // 拒绝 直接唤起钉钉
    if (data?.status === 'cancel') {
      requestDingDingEngineeringCode();
      return;
    }
    getTallySheetOperate(params).then((res) => {
      if (res?.data?.succeed === 'false') {
        Message.show({
          type: 'error',
          title: '错误',
          content: '系统异常，请重新点击',
          hasMask: true,
        });
      } else {
        requestDingDingEngineeringCode();
      }
    });
  };


  // 获取工号 唤起钉钉
  const requestDingDingEngineeringCode = () => {
    Dialog.notice({
      title: '是否已下载钉钉',
      footerAlign: 'center',
      footerActions: ['ok', 'cancel'],
      onCancel: () => {
        getEngineeringCode({ productType: 1118 }).then((res) => {
          if (res?.data?.result) {
            window.location.href = `${DINGTALK_URL}${res.data.result.split(':')[1]}`;
          }
          // else {
          //     // 是否展示兜底message
          // }
        });
      },
      onOk: () => {
        window.open('https://page.dingtalk.com/wow/z/dingtalk/simple/ddhomedownload#/', '_blank');
      },
      okProps: {
        children: '下载钉钉',
      },
      cancelProps: {
        children: '打开钉钉',
      },
    });
  };

  const TableColumn = [
    {
      title: '货品ID',
      dataIndex: 'itemId',

    },
    {
      title: '货品名称',
      dataIndex: 'attributes',
      width: 400,
      cell: (text) => {
        return (
          <>
            {text?.itemName}
          </>
        );
      },
    },
    {
      title: '异常类型',
      dataIndex: 'reason',
    },
    {
      title: '异常数量',
      dataIndex: 'varianceCount',
    },
    {
      title: '预约送货数量',
      dataIndex: 'inboundCount',
    },
    {
      title: '图片',
      dataIndex: 'voucher',
      width: 150,
      cell: (text) => {
        if (!text) return <></>;
        return (
          <div>
            <Image.PreviewGroup
              items={text}
            >
              <Image
                width={30}
                src={text ? text[0] : ''}
              />
            </Image.PreviewGroup>

            <span className={`${classNa}-img-text`}>共{text?.length}张</span>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Dialog v2 width={1200} visible={visible} onClose={handleClose} footer={false}>
        <Loading visible={isLoading}>
          <div className={`${classNa}-header`}>差异单明细</div>
          <div className={`${classNa}-stateText`}>
            <div>理货报告单号：{data?.id}</div>
            <div>
              {' '}
              理货单状态：<span className={`${classNa}-color-333`}>{STATE_MAP[data?.status]}</span>
            </div>
          </div>
          <div className={`${classNa}-tabelTitle`}>异常货品明细</div>

          <Table dataSource={data?.tallySheetDetailList}>
            {
              TableColumn.map((column) => {
                return <Table.Column {...column} />;
              })
            }
          </Table>
          <div className={`${classNa}-btnBox`}>
            {
              data?.status === 'processing' && <Button type="primary" onClick={btnClick}> 请联系客服小二解决</Button>
            }
          </div>
        </Loading>
      </Dialog>
    </div>
  );
};


DiffDetailsDialog.open = ({ onClose, warehouseBizId } = {}) => {
  ReactDOM.render(
    <DiffDetailsDialog onClose={onClose} warehouseBizId={warehouseBizId} />,
    document.createElement('div'),
  );
};

export default DiffDetailsDialog;
