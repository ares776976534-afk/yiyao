import React from 'react';
import SelectProduct from './SelectProduct';
import SelectSeller from '../SelectSeller';
import Material from './Material';
import Inquiry from './Inquiry';
import CommonChat from './CommonChat';
import SendButton from '../SendButton';

export enum AgentType {
  SELECT_PRODUCT = 'selectProduct',
  SELECT_SELLER = 'selectSeller',
  MATERIAL = 'material',
  INQUIRY = 'inquiry',
  COMMON_CHAT = 'commonChat',
}

export default ({ type, ...props }: { type: AgentType;[key: string]: any }) => {
  const component = {
    [AgentType.SELECT_PRODUCT]: <SelectProduct {...props} />,
    [AgentType.SELECT_SELLER]: <SelectSeller {...props} />,
    [AgentType.MATERIAL]: <Material
      {...props}
      showPromptList={false}
      showOnlyInput
      sendButton={<SendButton />}
    />,
    [AgentType.INQUIRY]: <Inquiry {...props} />,
    [AgentType.COMMON_CHAT]: <CommonChat {...props} />,
  };

  return component[type as AgentType] || null;
};