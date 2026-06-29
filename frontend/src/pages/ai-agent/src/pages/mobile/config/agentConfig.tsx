import type { TypeAgentHeaderProps } from '../components/AgentHeader';
import { InquiryLineIcon, ConsultLineIcon, SourcingLineIcon, MobileInsightIcon, DesignLineIcon } from '@/components/Icon';

export const MOBILE_AGENT_CONFIG: Record<string, TypeAgentHeaderProps> = {
  inquiry: {
    title: '询盘 Agent',
    icon: <InquiryLineIcon width="4.266666vw" height="4.266666vw" fontColor="#7C7F9A" />,
    tags: ['智能询盘', 'AI议价'],
    subtitle: '货比多家不费力',
  },
  chat: {
    title: '咨询 Agent',
    icon: <ConsultLineIcon width="4.266666vw" height="4.266666vw" fill="#7C7F9A" />,
    tags: ['政策', '经营', '百科'],
    subtitle: '咨询 Agent 全解答',
  },
  sourcing: {
    title: '找商 Agent',
    icon: <SourcingLineIcon width="4.266666vw" height="4.266666vw" fill="#7C7F9A" />,
    tags: ['识图', '找款', '搜厂'],
    subtitle: '直达 1688 源头好商',
  },
  insight: {
    title: '选品 Agent',
    icon: <MobileInsightIcon width="4.266666vw" height="4.266666vw" fill="#7C7F9A" />,
    tags: ['蓝海', '热点', '改款'],
    subtitle: '直出专家选品',
  },
  studio: {
    title: '素材 Agent',
    icon: <DesignLineIcon width="4.266666vw" height="4.266666vw" fill="#7C7F9A" />,
    tags: ['做图', '改图', '铺货'],
    subtitle: '一张画布全搞定',
  },
};

