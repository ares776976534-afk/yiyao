import React from 'react';
import { AgentType } from '../../enum';
import SelectProduct from './SelectProduct';
import SelectSeller from './SelectSeller';
import Material from './Material';
import Inquiry from './Inquiry';
import CommonChat from './CommonChat';
import createChatCache from '@/services/studio/createChatCache';

export const BASE_PC_URL = 'https://www.alphashop.cn/app';

export const AgentLink = {
  [AgentType.SELECT_PRODUCT]: '/insight',
  [AgentType.SELECT_SELLER]: '/sourcing',
  [AgentType.INQUIRY]: '/inquiry',
  [AgentType.COMMON_CHAT]: '/chat',
};

export const createLink = async (type, value) => {
  const cacheId = await createChatCache(value);
  const agentUrl = `${BASE_PC_URL}${AgentLink[type] || AgentLink[AgentType.SELECT_PRODUCT]}`;
  if (cacheId) {
    return `${agentUrl}?__chat_input_cache_id__=${cacheId}`;
  }
  return agentUrl;
};

export default ({ type, ...props }: { type: AgentType;[key: string]: any }) => {
  const component = {
    [AgentType.SELECT_PRODUCT]: <SelectProduct {...props} />,
    [AgentType.SELECT_SELLER]: <SelectSeller {...props} />,
    [AgentType.MATERIAL]: <Material {...props} />,
    [AgentType.INQUIRY]: <Inquiry {...props} />,
    [AgentType.COMMON_CHAT]: <CommonChat {...props} />,
  };

  return component[type as AgentType] || null;
};