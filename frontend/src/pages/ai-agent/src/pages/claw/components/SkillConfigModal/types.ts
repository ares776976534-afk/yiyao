/** 技能配置弹窗相关类型 */

import type { TypeClawSkillCard } from '../stores/types';

export interface TypeSkillConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export interface TypeSkillConfigMenuItem {
  id: string;
  label: string;
  active?: boolean;
}

export type TypeSkillConfigCard = TypeClawSkillCard;
