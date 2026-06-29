import React from 'react';
import { Message } from '@alifd/next';
import styles from './index.module.scss';
import { IconError, IconSuccessCircle } from '@/components/Icons';
import { TagState } from '@/pages/CrossBorderOfferlist/BusinessToDo/Tag';

export interface MessageCardProps {
  state: TagState | '';
  content: string;
}

export const MessageCard = ({ state, content }: MessageCardProps) => {
  const messageStyle: React.CSSProperties & Record<string, string> = {
    borderRadius: '3px',
    background: '#E6F2FF',
    border: 'none',
    '--message-notice-color-icon-inline': '#0077ff',
    fontSize: '14px',
    color: '#666666',
    width: '100%',
  };

  return (
    <div>
      <Message
        type="notice"
        closeable
        visible={state === 'new'}
        style={messageStyle}
      >
        <p
          className={styles['message-title']}
          style={{ fontFamily: 'PingFang SC' }}
        >平台正在对跨境商家收集跨境资质相关信息，请提交以下信息供小二审核，审核通过后：
        </p>
        <p className="text-[13px] text-[#666666]">1.您的跨境经营实力信息将有机会展示给更多全球买家，提升店铺曝光度；</p>
        <p className="text-[13px] text-[#666666]">2.对于具备海外头部实力的企业，我们将有专属的1688国家战队主动联系，提供深度合作机会；</p>
        <p className="text-[13px] text-[#666666]">3.对于海外非头部企业，我们将对符合要求的商品通过系统算法加权推流，助力您快速触达目标市场。</p>
      </Message>

      <Message
        type="notice"
        closeable
        visible={state === 'auditing'}
        style={messageStyle}
      >
        跨境资质审核中。
      </Message>

      <Message
        type="success"
        closeable
        iconType={false}
        style={{
          borderRadius: '6px',
          background: '#ECF7EC',
          border: 'none',
        }}
        visible={state === 'audit_success'}
      >
        <div className="flex items-start gap-[8px]">
          <IconSuccessCircle className="flex-shrink-0 mt-[2px]" />
          <span className="text-[14px] font-normal leading-[22px] text-[#666666]">跨境资质审核通过。</span>
        </div>
      </Message>

      <Message
        type="error"
        closeable
        iconType={false}
        style={{
          border: 'none',
          borderRadius: '6px',
          background: '#FFF2ED',
        }}
        visible={state === 'audit_fail'}
      >
        <div className="flex items-start gap-[8px]">
          <IconError className="flex-shrink-0 mt-[2px]" />
          <div>
            <p
              className={styles['message-title']}
            >
              跨境资质审核未通过。
            </p>
            <p
              className="text-[14px] font-normal leading-[22px] text-[#666666]"
              style={{ fontFamily: 'PingFang SC' }}
            >
              {content}
            </p>
          </div>
        </div>
      </Message>

    </div>
  );
};
