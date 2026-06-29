/** claw/chat 技能列表 store 相关类型 */

export interface TypeClawSkillCard {
  skillId: string;
  skillName: string;
  description: string;
  isOfficial?: boolean;
  enabled: boolean;
  tags?: string[];
  source?: string;
  version?: string;
  configured?: boolean;
}
