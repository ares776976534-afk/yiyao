import React, { useState, useEffect } from 'react';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import { Tab, Icon, Dialog, Divider, Checkbox } from '@alifd/next';
import ContentRender from './component/ContentRender';
import Videox from '@ali/videox';
import { queryFcOrder } from './services';
import fatigue from '@alife/1688-chain-fatigue';
import HeaderNotice from '../Select/components/HeaderNotice';
import './index.scss';

const videoIntro = 'https://cloud.video.taobao.com/vod/4MNmI67BogYcVqgREjY3x_wk2w7O0Of7jWalgJt_xd4.mp4';
const fatigueKey = 'Jit-single-balloon-fatigue';
const dingTalkSend = () => {
  window.open('https://qr.dingtalk.com/action/joingroup?code=v1,k1,m8aV9LiuXaeDUNCXhBzQbm/iZ+0JMBLl3Poc5UcNjMc=&_dt_no_comment=1&origin=11', '_blank');
};
function JitPerformance() {
  const [activeKey, setActiveKey] = useState('all');
  const [videoDialogVisible, setVideoDialogVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [tabs, setTabs] = useState([
    { tab: '全部', key: 'all', content: 'This is home page' },
    { tab: '上门揽', key: 'DOOR_2_DOOR_PICK_UP', content: 'This is api page' },
    { tab: '自寄', key: 'SUPPLIER_OFFLINE_SEND', content: 'This is api page' },
  ]);
  useEffect(() => {
    queryFcOrder({
      pageStart: 1,
      pageSize: 10,
      statusSet: ['WAIT_DELIVERY'], // 发货类型
    }).then((res) => {
      if (res?.model?.length > 0) {
        setActiveKey('WAIT_DELIVERY');
        setTabs([
          { tab: '全部', key: 'all', content: 'This is home page' },
          { tab: '待发货', key: 'WAIT_DELIVERY', content: 'This is document page' },
          { tab: '上门揽', key: 'DOOR_2_DOOR_PICK_UP', content: 'This is api page' },
          { tab: '自寄', key: 'SUPPLIER_OFFLINE_SEND', content: 'This is api page' },
        ]);
      }
    });
  }, []);
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
  const handleToggle = () => {
    fatigue.set(fatigueKey, {
      rule: '* 9 * * * * 1', // 年 月 日 时 分 秒 周 重复次数
      // rule: '* * * 1 * * 1', // 年 月 日 时 分 秒 周 重复次数
    }, { mtop: false })
      .then((res) => {
        const { success } = res;
        if (success) {
          setVideoDialogVisible(false);
        }
      });
  };
  useEffect(() => {
    fatigue.get(fatigueKey, { mtop: false })
      .then((res) => {
        const { success, result } = res;
        if (success && result) {
          if (result?.expire < Date.now()) {
            setVideoDialogVisible(false);
          } else {
            setVideoDialogVisible(false);
          }
        } else {
          localStorage.setItem('smt-leading-video', 'true');
          setTimeout(() => {
            const divEl = document.getElementById('videx-container');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const videox = new Videox({
              container: divEl,
              controls: true,
              volumeControls: true,
              playbackRateControls: true,
              src: videoIntro,
            });
          }, 100);
          setVideoDialogVisible(true);
        }
      });
  }, []);
  return (
    <NewWorkLayout
      title={
        <div className="main-title">
          JIT履约
          <a
            className="link ml12"
            onClick={() => {
              showVideoDialog(videoIntro);
            }}
          >
            <Icon type="ic_play1" size="small" style={{ marginRight: 2 }} />
            <span className="cursor-pointer text-[14px] font-normal">JIT PO单发货操作教程</span>
          </a>
          <Divider direction="ver" />
          <a
            className="link text-[14px] font-normal"
            target="_blank"
            href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/N7dx2rn0JbZ9pAeeivQAYXyLJMGjLRb3"
            rel="noreferrer"
          >
            JIT订单发货说明
          </a>
        </div>
      }
      subTitle={(() => {
        return (
          <div className="flex items-center leading-[14px] h-full cursor-pointer">
            <div className="flex items-center" onClick={dingTalkSend}>
              <div className="flex items-center mr-[4px]">
                <Icon type="dingding-2" style={{ color: '#07f', marginTop: -1 }} size="small" />
              </div>
              <span>联系专属小二</span>
            </div>
          </div>
        );
      })()}
    >
      <div className="mb-[12px]">
        <HeaderNotice
          data={
            [
              '1. 揽收时效要求：北京时间14点前的订单，商家应该在当天15:00前在系统上前完成预约揽收并准备好足量准确的商品，操作发货时间在当天15点前的订单，司机将在北京时间当天晚上23:59前完成上门揽收；北京时间14点后到23:59的订单，商家应该在付款第二天15点前在系统上完成预约揽收并准备好足量准确的商品，司机将在北京时间第二天晚上23:59前完成上门揽收',
              <span>
                2. 1688 Choice JIT履约链路商家操作手册
                <a
                  className="link text-[14px] font-normal"
                  target="_blank"
                  href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/N7dx2rn0JbZ9pAeeivQAYXyLJMGjLRb3"
                  rel="noreferrer"
                >
                  {'点击这里>>'}
                </a>
              </span>,
              <span>
                3. 1688跨境JIT上门揽收范围
                <a
                  className="link text-[14px] font-normal"
                  target="_blank"
                  href="https://peixun.1688.com/space/l2AmoZ7J1vJjlXdb/detail/kDnRL6jAJM3Ao7eeTk3bxqPNWyMoPYe1"
                  rel="noreferrer"
                >
                  {'点击这里>>'}
                </a>
              </span>,
            ]
          }
        />
      </div>
      <Tab shape="wrapped" activeKey={activeKey} onChange={(key) => setActiveKey(key)} unmountInactiveTabs >
        {tabs.map((item) => (
          <Tab.Item key={item.key} title={item.tab}>
            <ContentRender type={activeKey} />
          </Tab.Item>
        ))}
      </Tab>
      <Dialog
        title="JIT PO单发货操作教程"
        visible={videoDialogVisible}
        footerActions={[]}
        onCancel={() => {
          setVideoDialogVisible(false);
        }}
        onClose={() => {
          setVideoDialogVisible(false);
          if (checked) {
            handleToggle();
          }
        }}
        footer={<Checkbox onChange={(v) => setChecked(v)}>下次不再提醒我</Checkbox>}
        footerAlign="center"
      >
        <div id="videx-container" style={{ width: 900, height: 506 }} />
      </Dialog>
    </NewWorkLayout>
  );
}

export default JitPerformance;
