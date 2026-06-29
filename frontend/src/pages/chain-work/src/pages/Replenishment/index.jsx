import React, { useState, useEffect } from 'react';
import { Button, Dialog, Icon, Message } from '@alifd/next';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import CrossBorderOfferlistDialog from '@/pages/CrossBorderOfferlist/components/Dialog';
import { querySellerType } from '@/pages/CrossBorderOfferlist/api';
import logger from '@alife/channel-uni-event-logger';
// import StatusFilter from './components/StatusFilter';
// import SearchFilter from './components/SearchFilter';
// import DataTable from './components/DataTable';
import CommonTable from '@/components/CommonTable';
import { listQuery } from '@/pages/Replenishment/services/search';
import schema from './schema';
// import MessageBar from './components/MessageBar';
// import messageSchema from './components/MessageBar/messageSchema';
// import TempSignAgreement from './components/TempSignAgreement';
import ConsignmentAgreement from './components/ConsignmentAgreement';
import { queryUserAgreementService, querySignHuoTongQuanQiu } from './api';
import { getDingTalkId } from './services/action';
import { getStatus } from '@/pages/Replenishment/services/status';

import {
  ACTION_RLENISHMENT_PALN_CONFIRM_MSG,
  ACTION_BATCH_CONSIGNMENT_SUBMIT_MSG,
  ACTION_BATCH_RLENISHMENT_PALN_CONFIRM_MSG,
  ACTION_CONSIGNMENT_SUBMIT_MSG,
  ACTION_BATCH_RESERVATION_ORDER_SUBMIT_MSG,
  ACTION_RESERVATION_ORDER_SUBMIT_MSG,
} from '@/constant';

import './index.scss';

const reportData = {
  actionType: 'chain-work/crossborderofferlist@入驻弹窗',
};

// const Block = ({ children, border = false, show = true }) => {
//   return show ? <div className={`c-itemBlock ${border ? 'hasBorder' : ''}`}>{children}</div> : null;
// };

function Replenishment() {
  const [statusReload, setStatusReload] = useState(false);
  // const [tableChange, setTableChange] = useState(null);
  // useEffect(() => {
  //   tableChange && tableChange('BH_PENDING_CONFIRM')
  // },[tableChange])

  useEffect(() => {
    openCrossBorderDialog();
  }, []);

  /**
   * 是否打开跨境货通全球弹窗
   */
  const openCrossBorderDialog = () => {
    querySignHuoTongQuanQiu()
      .then((res) => {
        if (res?.data?.model === 'true') {
          return Promise.all([querySellerType(5117249), querySellerType(5117313)]);
        }

        return Promise.reject();
      })
      .then((res) => {
        if (res[0]?.data?.data === 'true' && res[1]?.data?.data === 'false') {
          CrossBorderOfferlistDialog.open(openConsignmentAgreement);
          logger.report(reportData);
        } else {
          openConsignmentAgreement();
        }
      })
      .catch(() => {
        openConsignmentAgreement();
      });
  };
  /**
   * 是否打开-非洲寄售模式协议弹窗
   */
  const openConsignmentAgreement = () => {
    queryUserAgreementService()
      .then((res) => {
        if (res?.data?.model === 'true') {
          ConsignmentAgreement.open();
        }
      })
      .catch(() => {});
  };

  /**
   * 打开寄售模式通知弹窗
   */
  // const openTempSignAgreementDialog = () => {
  //   TempSignAgreement.open();
  // };

  const dingTalkSend = () => {
    Dialog.notice({
      title: '是否已下载钉钉',
      footerAlign: 'center',
      footerActions: ['ok', 'cancel'],
      onCancel: () => {
        getDingTalkId().then((id) => {
          if (id) {
            window.open(`dingtalk://dingtalkclient/action/sendmsg?dingtalk_id=${id.split(':')[1]}`, '_self');
          } else {
            Message.error('请稍后再试');
          }
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

  const playOperationVideo = () => {
    Dialog.show({
      title: '操作视频',
      footerActions: ['cancel'],
      footerAlign: 'center',
      cancelProps: {
        children: '知道了',
      },
      content: (
        <video
          src="https://cloud.video.taobao.com/play/u/null/p/1/e/6/t/1/441456453114.mp4"
          controls
          style={{ width: '100%', height: '100%' }}
        />
      ),
    });
  };

  const handleAcitioncomplete = (type, reoloadFn = () => Promise.resolve()) => {
    switch (type) {
      case ACTION_RLENISHMENT_PALN_CONFIRM_MSG:
      case ACTION_BATCH_CONSIGNMENT_SUBMIT_MSG:
      case ACTION_BATCH_RLENISHMENT_PALN_CONFIRM_MSG:
      case ACTION_CONSIGNMENT_SUBMIT_MSG:
      case ACTION_BATCH_RESERVATION_ORDER_SUBMIT_MSG:
      case ACTION_RESERVATION_ORDER_SUBMIT_MSG:
        reoloadFn().then(() => {
          setStatusReload(new Date().valueOf());
        });
        break;
      default:
        break;
    }
  };
  return (
    <NewWorkLayout
      title={
        <span>
          补货管理
          <Button text type="primary" onClick={dingTalkSend} style={{ marginLeft: '12px' }}>
            <Icon type="dingding-2" />
            联系小二
          </Button>
          <Button text type="primary" onClick={playOperationVideo} style={{ marginLeft: '12px' }}>
            <Icon type="ic_play1" />
            操作视频
          </Button>
        </span>
      }
      subTitle={
        <img
          src="https://img.alicdn.com/imgextra/i4/O1CN014KzJ3k24yH9y3bmMy_!!6000000007459-2-tps-1318-48.png"
          width="659px"
          height="24px"
        />
      }
    >
      <div className="replenishment">
        <CommonTable
          schema={schema}
          SlotOrShowStatusFilter
          SlotOrShowMsgBar
          // tableChange={setTableChange}
          statusReload={statusReload}
          getStatusFnOrStatusList={getStatus}
          pageSize={20}
          listQueryFn={listQuery}
          statusFilterType={{ type: 2 }}
          onActionComplete={handleAcitioncomplete}
        />
      </div>
    </NewWorkLayout>
  );
}

Replenishment.pageConfig = {
  title: '补货管理',
};

export default Replenishment;
