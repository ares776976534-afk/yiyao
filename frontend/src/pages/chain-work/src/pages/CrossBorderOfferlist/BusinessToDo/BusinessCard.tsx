import React from 'react';
import Tag, { TagState } from './Tag';
import { Button, Balloon } from '@alifd/next';
import './BusinessCard.scss';

// const Tooltip = Balloon.Tooltip;

interface BusinessCardProps {
  state?: TagState;
  title: string;
  content: string | React.ReactNode;
  btnText: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  tooltipText?: string;
}

export const BusinessCard = ({ state, title,
  content,
  btnText,
  className,
  style,
  onClick,
  tooltipText,
}: BusinessCardProps) => {
  return (
    <div
      className={`w-[320px]
        p-4 rounded-xl bg-white border border-[#E5E5E5]
        box-border ${className}`}
      style={style}
    >
      <div className="flex items-center mb-[12px]">
        <span
          className="font-pingfang text-sm font-medium
          leading-[17px] text-[#333] mr-2"
        >
          {title}
        </span>
        {state && <Tag state={state} />}
      </div>
      {tooltipText ?
        <Balloon
          followTrigger
          className="business-to-do-tip p-[12px]"
          popupStyle={{ backgroundColor: '#333' }}
          v2
          trigger={
            <p
              dangerouslySetInnerHTML={{ __html: content }}
              className="font-pingfang
          text-[14px] text-[#666] truncate leading-[20px] cursor-pointer"
            />}
          align="t"
        >
          <p
            dangerouslySetInnerHTML={{ __html: tooltipText }}
            className="font-pingfang
          text-[14px] text-[#fff]"
          />
        </Balloon> :
        <p
          className="font-pingfang
          text-[14px] text-[#666] truncate"
        >
          {content}
        </p>
      }

      <Button
        style={{
          width: '74px',
          height: '32px',
          borderRadius: '6px',
          fontSize: '14px',
          marginTop: '12px',
        }}
        type="primary"
        onClick={onClick}
      >
        {btnText}
      </Button>
    </div >
  );
};

export default BusinessCard;
