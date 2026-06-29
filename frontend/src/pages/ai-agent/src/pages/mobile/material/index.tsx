import React from 'react';
import AgentHeader from '../components/AgentHeader';
import { MOBILE_AGENT_CONFIG } from '../config/agentConfig';
import Framework from '../components/framework';
import Agents from '@/pages/mobile-agent-home/components/Agents';
import { AgentType } from '@/pages/mobile-agent-home/enum';

function Material() {
  return (
    <Framework
      children={
        <AgentHeader
          {...MOBILE_AGENT_CONFIG.studio}
          children={
            <div>
              <Agents type={AgentType.MATERIAL} />
            </div>
          }
        />
      }
    />
  );
}

export default Material;
