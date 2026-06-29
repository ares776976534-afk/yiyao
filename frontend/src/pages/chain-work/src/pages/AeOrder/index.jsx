import React, { useState, useEffect } from 'react';
import { Dialog, Icon } from '@alifd/next';
import Videox from '@ali/videox';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import AeTab from './components/AeTab';
import './index.scss';
import AeManufacturerDialog from './components/AeManufacturerDialog';
import SmlTipsDialog from './components/SmlTipsDialog';
import { videoIntro } from '@/pages/AliExpress/enums';
import { getResourceById } from '@/utlis';

const goldlog = window.goldlog || {};

const videoHugeOrder = 'https://cloud.video.taobao.com/vod/OtJXTsfP1WAygaUf9-toOhiirrW2KFGZsHE8p4F0WKk.mp4';

const AeOrder = () => {
  const [videoDialogVisible, setVideoDialogVisible] = useState(false);
  const [noticeData, setNoticeData] = useState([]);
  const dingTalkSend = () => {
    // window.open('https://qr.dingtalk.com/action/joingroup?code=v1,k1,Y8Nz0TL9IicYQAkKq57Ug/Y4/g5DurwciEHkN0n1GGqdR7ksupjDEA==&_dt_no_comment=1&origin=1', '_blank');
    noticeData.forEach((item) => {
      if (item.link) {
        window.open(item.link, '_blank');
      }
    });
    goldlog?.record('/global.seller-smt.contact-btn', 'CLK', '');
  };

  const showVideoDialog = (videoSrc) => {
    setVideoDialogVisible(true);
    localStorage.setItem('smt-leading-video', 'true');

    setTimeout(() => {
      const divEl = document.getElementById('videx-container');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const videox = new Videox({
        container: divEl,
        controls: true,
        volumeControls: true,
        playbackRateControls: true,
        src: videoSrc,
      });
    }, 100);
  };
  useEffect(() => {
    const hasView = localStorage.getItem('smt-leading-video');

    if (!hasView) {
      showVideoDialog(videoIntro);
    }
    AeManufacturerDialog.open({
      onOk: () => {
        SmlTipsDialog();
      },
      onClose: () => {
        SmlTipsDialog();
      },
    });
    // 是否签署AE协议
    // querySignAgreement({
    //   agreementEnum: 'AE',
    // }).then((res) => {
    //   if (!res?.content?.data) {
    //     AeJitDialog.open();
    //     logger.report({
    //       actionType: 'chain-work/aeorder@跨境速卖通协议弹窗',
    //     });
    //   }
    // });
    getResourceById(48064038)
      .then((res) => {
        setNoticeData(res);
      });
  }, []);
  const PromptMessage = ({ className, children }) => {
    return (
      <div className={className} >
        <Icon type="prompt" style={{ color: '#07f', marginRight: 4 }} />
        {children}
      </div>
    );
  };
  return (
    <NewWorkLayout
      title={(() => {
        return (
          <div className="main-title">
            速卖通订单
            <a
              className="link ml12"
              target="_blank"
              href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/dQPGYqjpJYg0vYGGcl6ap4BDWakx1Z5N"
              onClick={() => {
                goldlog.record('/global.seller-smt.lead-btn', 'CLK', '');
              }}
              rel="noreferrer"
            >
              操作指引
            </a>
            <a
              className="link ml12"
              onClick={() => {
                showVideoDialog(videoIntro);
                goldlog.record('/global.seller-smt.video-lead-btn', 'CLK', '');
              }}
            >
              <Icon type="ic_play1" size="small" style={{ marginRight: 2 }} />
              <span>操作视频</span>
            </a>
          </div>
        );
      })()}
      subTitle={(() => {
        return (
          <div className="base-operations">
            <div className="wangwang-ui-container" onClick={dingTalkSend}>
              <div className="wangwang-ui">
                <Icon type="dingding-2" style={{ color: '#07f', marginTop: -1 }} size="small" />
              </div>
              <span>联系专属小二</span>
            </div>
          </div>
        );
      })()}
    >
      <div className="ae-order-container">
        <div className="flex flex-col bg-[#e6f2ff] p-[16px] mb-[16px] leading-[16px] text-[#666] text-[13px] gap-y-[8px]">
          <PromptMessage>
            速卖通订单只展示近三个月订单；对于三个月以前的订单，可前往“
            <a className="link" href="https://work.1688.com/?_path_=gonghuotuoguan/2017sellerbase_trade/saleList" target="_blank" rel="noreferrer">
              已卖出的货品
            </a>
            ”进行查看。
          </PromptMessage>
          <PromptMessage>
            商家您好，根据速卖通平台发货时效要求，昨日14:00至今日14:00产生的采购订单，须在今日15:00前预约上门揽，并在今日24:00前完成揽收。请您尽快发货。
          </PromptMessage>
          <PromptMessage>
            为保障您持续获得速卖通渠道订单，建议您在速卖通渠道已动销的商品保持在架可售状态。如您确需下架或删除商品的，请您点击<a className="link cursor-pointer text-[13px] ml-[2px]" href="https://survey.1688.com/apps/zhiliao/DBau6KyIC" target="_blank" rel="noreferrer">《商品下架申请》</a>提交需求，提交后我们会为您配置权限，5个工作日后您可操作下架或删除1688商品。
          </PromptMessage>
          <PromptMessage>
            针对速卖通上门揽订单，如您的订单在被揽收后接到“仅退款”申请的，在平台另行公告前，您可拒绝“仅退款”申请，平台会根据速卖通是否收到您的包裹判定“仅退款”或“退货退款”。
          </PromptMessage>
          <PromptMessage>
            速卖通优选”订单工具上线啦，一键打单更轻松！
            <a href="https://peixun.1688.com/space/l2AmoY1414wvQzdb/detail/gvNG4YZ7JneM3OddIRPpkDeqV2LD0oRE" target="_blank" rel="noreferrer">点击查看</a>
          </PromptMessage>
        </div>
        <AeTab />
      </div>
      <Dialog
        title="操作视频"
        visible={videoDialogVisible}
        footerActions={['cancel']}
        onCancel={() => {
          setVideoDialogVisible(false);
        }}
        onClose={() => {
          setVideoDialogVisible(false);
        }}
        cancelProps={{ children: '知道了' }}
        footerAlign={'center'}
      >
        <div id="videx-container" style={{ width: 900, height: 506 }} />
      </Dialog>
    </NewWorkLayout>
  );
};

AeOrder.pageConfig = {
  title: '速卖通订单',
};

export default AeOrder;
