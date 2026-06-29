import React, { useState, useEffect } from 'react';
import { Input, message } from 'antd';
import getPersonalConfig from '@/services/claw/getPersonalConfig';
import savePersonalConfig from '@/services/claw/savePersonalConfig';
import type { TypePersonalConfig } from './types';
import styles from './index.module.scss';

const DEFAULT_FORM: TypePersonalConfig = {
  soul: '',
};

const PersonalTab: React.FC = () => {
  const [form, setForm] = useState<TypePersonalConfig>({ ...DEFAULT_FORM });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await getPersonalConfig();

      if (res && typeof res === 'object') {
        const soulRaw = res.soul;
        setForm((prev) => ({
          ...prev,
          soul: soulRaw != null ? String(soulRaw) : prev.soul ?? '',
        }));
      }
    } catch {
      message.error('加载个性化配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePersonalConfig({
        soul: form.soul ?? '',
      });
      message.success('配置已保存');
    } catch (e) {
      message.error(e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.personalContentWrap}>
      <div className={styles.formContainer}>
        <div className={styles.formItem}>
        <span className={styles.formLabel}>soul（全局人格）</span>
        <span className={styles.subFormLabel}>用于定义长期角色定义和表达风格，每次对话都会优先生效</span>
          <Input.TextArea
            className={styles.textareaContent}
            value={form.soul ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, soul: e.target.value }))}
            placeholder="例如：简洁、直接、结论先行；默认中文；遇到不确定先说明假设"
            autoSize={{ minRows: 12 }}
            disabled={loading || saving}
          />
        </div>
      </div>
      <div className={styles.formFooter}>
        <div
          className={styles.btnPrimary}
          role="button"
          tabIndex={0}
          aria-disabled={(loading || saving) || undefined}
          onClick={loading || saving ? undefined : handleSave}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !loading && !saving && handleSave()}
        >
          <span className={styles.btnPrimaryText}>{saving ? '正在保存' : '保存配置'}</span>
        </div>
      </div>
    </div>
  );
};

export default PersonalTab;
