import { makeAutoObservable } from 'mobx';
import getSkillList from '@/services/claw/getSkillList';
import type { TypeClawSkillCard } from './types';

/**
 * 对话页技能角标与技能配置弹窗共用同一份列表，避免重复请求 getSkillList。
 */
export class ClawSkillListStore {
  skills: TypeClawSkillCard[] = [];
  loading = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get enabledSkillCount(): number {
    return this.skills.filter((s) => s.enabled).length;
  }

  async fetchSkillList(): Promise<void> {
    this.loading = true;
    try {
      const res = await getSkillList();
      this.skills = Array.isArray(res) ? res : [];
    } catch {
      this.skills = [];
    } finally {
      this.loading = false;
    }
  }

  patchSkillEnabled(skillId: string, enabled: boolean): void {
    this.skills = this.skills.map((c) =>
      c.skillId === skillId ? { ...c, enabled } : c,
    );
  }
}

export const clawSkillListStore = new ClawSkillListStore();
