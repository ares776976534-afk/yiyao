import React, { useState, useEffect, useCallback } from 'react';
import styles from './index.module.css';
import SelectTag from '../SelectTag';
import ExamplesSection from '../ExamplesSection';
import { StatusEnum } from '@/pages/select-product/config';
import ChatInput from '@/pages/select-product/components/ChatInput';
import { PLATFORM_MAP } from '@/types/country';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import { $t } from '@/i18n';
import log, { googleRecord } from '@/utils/log';

interface ReqComponentProps {
  onSubmit: (formattedPayload: any) => void;
  status: StatusEnum;
}

type TypeChatboxLogKeys = {
  INSIGHT_CLICK?: string;
  INSIGHT_CHANNEL?: string;
  INSIGHT_COUNTRY?: string;
};

export const CustomChatInput = ({
  onSubmit,
  sendButton,
  logKeys,
}: {
  onSubmit: (formattedPayload: any) => void;
  sendButton?: React.ReactNode;
  logKeys?: TypeChatboxLogKeys;
}) => {
  const [countryOptions, setCountryOptions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');

  const handlePlatformChange = (platform: string) => {
    if (logKeys?.INSIGHT_CHANNEL) {
      log.record(logKeys.INSIGHT_CHANNEL as `/${string}.${string}.${string}`, 'CLK', { channel: platform });
    }
    setSelectedPlatform(platform);
    const _countryOptions = PLATFORM_MAP?.find((p) => p.name === platform)?.platforms || [];
    setCountryOptions(_countryOptions.map((c) => ({ name: c.name })) as any);
    setSelectedCountry(_countryOptions[0].name);
  };

  const handleCountryChange = (country: string) => {
    if (logKeys?.INSIGHT_COUNTRY) {
      log.record(logKeys.INSIGHT_COUNTRY as `/${string}.${string}.${string}`, 'CLK', { country });
    }
    setSelectedCountry(country);
  };

  const handleSend = (data: any) => {
    const { inputValue } = data;
    if (inputValue.trim()) {
      if (logKeys?.INSIGHT_CLICK) {
        log.record(logKeys.INSIGHT_CLICK as `/${string}.${string}.${string}`, 'CLK', { query: inputValue.trim() });
      }
      googleRecord('insight_submit', {}, '/');
      onSubmit({
        query: $t("global-1688-ai-app.select-product.general-agent.ReqComponent.wfollowds", `我关注的是${selectedCountry}${selectedPlatform}。${inputValue.trim()}`, [selectedCountry, selectedPlatform, inputValue.trim()]),
        __submit_type__: 'user_input',
      });
    }
  };

  const handleInputFocus = () => {
    // 发送自定义事件，通知输入框已激活
    const event = new CustomEvent('chatInputFocus', {
      detail: {},
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    setPlatformOptions(PLATFORM_MAP.map((p) => ({ name: p.name })) as any);
    handlePlatformChange(PLATFORM_MAP[0].name);
  }, []);

  return (
    <ChatInput
      fancy
      prefix={<>
        <div className={styles.label}>
          <span className={styles.labelText}>{$t("global-1688-ai-app.select-product.general-agent.ReqComponent.wfollowds.2", "我关注的是")}</span>
        </div>
        <SelectTag
          value={selectedPlatform}
          options={platformOptions}
          onChange={handlePlatformChange}
        />
        <SelectTag
          value={selectedCountry}
          options={countryOptions}
          onChange={handleCountryChange}
        />
        <span className={styles.punctuation}>。</span>
      </>}
      onSubmit={handleSend}
      isStreaming={false}
      placeholder="如：瑜伽裤有哪些蓝海细分市场？帮我推荐些热销商品跟卖"
      sendButton={sendButton}
      onFocus={handleInputFocus}
    />
  );
};

const ReqComponent: React.FC<ReqComponentProps> = ({ onSubmit, status }) => {
  const { chatInput, isMakeSimilar } = useChatQuery();

  const handleSubmit = useCallback((formattedPayload: any) => {
    onSubmit(formattedPayload);
  }, [onSubmit]);

  useEffect(() => {
    if (chatInput && !isMakeSimilar) {
      handleSubmit(chatInput);
    }
  }, [chatInput, isMakeSimilar, handleSubmit]);


  const handleExampleClick = (example: any) => {
    onSubmit({
      query: example.text,
      __submit_type__: 'user_input',
    });
  };

  return status === StatusEnum.RUNNING ? null : (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          className={styles.icon}
          src="https://img.alicdn.com/imgextra/i4/6000000008181/O1CN01yT8dlE2AIxJJ9PPnM_!!6000000008181-2-gg_dtc.png"
          alt="icon"
        />
        <div className={styles.titleSection}>
          <span className={styles.title}>{$t("global-1688-ai-app.select-product.general-agent.ReqComponent.tyxp", "通用选品")}</span>
          <span className={styles.subtitle}>{$t("global-1688-ai-app.select-product.general-agent.ReqComponent.fodxnjhj", "覆盖蓝海、热点、改款等任意选品需求，AI智能生成专家级报告，即刻获取决策依据")}</span>
        </div>
      </div>
      <CustomChatInput onSubmit={handleSubmit} />
      <ExamplesSection onClick={handleExampleClick} />
    </div>
  );
};

export default ReqComponent;
