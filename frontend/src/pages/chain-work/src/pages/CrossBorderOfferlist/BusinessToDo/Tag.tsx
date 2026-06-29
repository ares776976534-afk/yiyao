import React from 'react';

export type TagState = 'new' | 'audit_success' | 'audit_fail' | 'auditing' | 'to_be_added';

interface TagProps {
  state: TagState;
}

const stateConfig: Record<TagState, { text: string; bgColor: string; textColor: string }> = {
  new: {
    text: '待提交',
    bgColor: '#FFF9EB',
    textColor: '#FF8B00',
  },
  auditing: {
    text: '待审核',
    bgColor: '#EBF6FF',
    textColor: 'rgba(0, 119, 255, 0.9)',
  },
  audit_success: {
    text: '审核通过',
    bgColor: '#ECF7EC',
    textColor: '#3BB347',
  },
  audit_fail: {
    text: '审核未通过',
    bgColor: '#FFF2ED',
    textColor: '#FB3B20',
  },
  to_be_added: {
    text: '待补充',
    bgColor: '#FFF9EB',
    textColor: '#FF8B00',
  },
};

export const Tag = ({ state }: TagProps) => {
  const config = stateConfig[state];

  return (
    <div
      className="flex items-center py-[1px] px-1 rounded-sm"
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      {config.text}
    </div>
  );
};

export default Tag;
