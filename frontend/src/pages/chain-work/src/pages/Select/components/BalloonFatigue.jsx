import React, { useEffect, useState } from 'react';
import { Button, Balloon } from '@alifd/next';
import fatigue from '@alife/1688-chain-fatigue';
import './balloonFatigue.scss';

export default function BalloonFatigue({ fatigueKey = '', trigger = null, title = '', content = '', align = 't' }) {
  const [visible, setVisible] = useState(false);
  const handleToggle = () => {
    fatigue.set(fatigueKey, {
      rule: '* 9 * * * * 1', // 年 月 日 时 分 秒 周 重复次数
    }, { mtop: false })
      .then((res) => {
        const { success } = res;
        if (success) {
          setVisible(false);
        }
      });
  };
  useEffect(() => {
    fatigue.get(fatigueKey, { mtop: false })
      .then((res) => {
        const { success, result } = res;
        if (success && result) {
          if (result?.expire < Date.now()) {
            setVisible(false);
          } else {
            setVisible(false);
          }
        } else {
          setVisible(true);
        }
      });
  }, []);
  return (
    <Balloon
      trigger={trigger}
      title={<div className="text-[16px] font-medium">{title}</div>}
      align={align}
      visible={visible}
      closable={false}
      className="single-product-recruitment-balloon"
      popupStyle={{ padding: '20px', width: '320px', maxWidth: '320px', backgroundColor: '#0077FF', color: '#fff' }}
    >
      <div>
        <div className="text-[14px]">{content}</div>
        <div className="flex justify-end mt-[20px]">
          <div className="rounded-[6px] bg-[#fff] w-[90px] h-[32px] flex items-center justify-center">
            <Button text type="primary" onClick={handleToggle}>我知道了</Button>
          </div>
        </div>
      </div>
    </Balloon>
  );
}
