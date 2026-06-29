import React, { useState } from "react";
import { Popover, Input, Button } from "antd";
import useToast from "@/components/Toast";
import reportFeedback from "@/services/studio/reportFeedback";
import styles from "./index.module.scss";
import { $t } from '@/i18n';

interface FeedbackOption {
  label: string;
  value: string;
}

export default function Feedback(props) {
  const { sessionId, taskId, media_url, media_type, media_id } = props;
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<FeedbackOption[]>([]);

  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedbackText(e.target.value);
  };

  const feedbackOptions: FeedbackOption[] = [
    {
      label: $t("global-1688-ai-app.ChatContent.content.bubbles.feedback.scxg", "生成效果"),
      value: "generation_effect",
    },
    {
      label: $t("global-1688-ai-app.ChatContent.content.bubbles.feedback.functionbk", "功能崩溃"),
      value: "function_crash",
    },
    {
      label: $t("global-1688-ai-app.ChatContent.content.bubbles.feedback.cpfunction", "产品功能"),
      value: "product_feature",
    },
    {
      label: $t("global-1688-ai-app.ChatContent.content.bubbles.feedback.ggo", "改进建议"),
      value: "improvement_suggestion",
    },
    {
      label: $t("global-1688-ai-app.ChatContent.content.bubbles.feedback.qqcontent", "侵权内容"),
      value: "copyright_infringement",
    },
    {
      label: $t("global-1688-ai-app.ChatContent.content.bubbles.feedback.qt", "其他"),
      value: "others",
    },
  ];

  const handleOptionClick = (option: FeedbackOption) => {
    setSelectedOptions((prev) => {
      const isSelected = prev.some((item) => item.value === option.value);
      if (isSelected) {
        return prev.filter((item) => item.value !== option.value);
      } else {
        return [...prev, option];
      }
    });
  };

  const isOptionSelected = (value: string) => {
    return selectedOptions.some((item) => item.value === value);
  };

  const hide = () => {
    setFeedbackOpen(false);
    // 重置状态
    setFeedbackText("");
    setSelectedOptions([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setFeedbackOpen(newOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    reportFeedback({
      selectedOptions, // [{ label: "生成效果", value: "generation_effect" }, ...] 反馈选项
      feedbackText: feedbackText.trim(), // 反馈文本
      sessionId, // 会话id
      taskId, //
      media_url, // 资源链接
      media_type, // 资源类型
      media_id, // 资源id
    });
    toast.success($t("global-1688-ai-app.ChatContent.content.bubbles.feedback.ggen", "感谢您的宝贵建议！"));
    hide();
  };

  // 判断是否可以提交：有选中选项或有文本输入
  const canSubmit =
    selectedOptions.length > 0 && feedbackText.trim().length > 0;

  return (
    <Popover
      open={feedbackOpen}
      destroyOnHidden
      arrow={false}
      content={
        <form className={styles.feedbackForm} onSubmit={handleSubmit}>
          <div className={styles.feedbackFormItemGroup}>
            <div className={styles.feedbackFormTitle}>
              <span className={styles.feedbackFormTitleText}>{$t("global-1688-ai-app.ChatContent.content.bubbles.feedback.issuelx", "问题类型")}</span>
              <span className={styles.feedbackFormRequired}>*</span>
            </div>
            <div className={styles.feedbackFormContent}>
              {feedbackOptions.map((item) => (
                <div
                  key={item.value}
                  className={`${styles.feedbackFormItem} ${
                    isOptionSelected(item.value) ? styles.active : ""
                  }`}
                  onClick={() => handleOptionClick(item)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.feedbackFormItemGroup}>
            <div className={styles.feedbackFormTitle}>
              <span className={styles.feedbackFormTitleText}>{$t("global-1688-ai-app.ChatContent.content.bubbles.feedback.feedbackContent", "反馈内容")}</span>
              <span className={styles.feedbackFormRequired}>*</span>
            </div>
            <Input.TextArea
              autoSize={{
                minRows: 4,
                maxRows: 4,
              }}
              value={feedbackText}
              className={styles.feedbackFormInputTextarea}
              placeholder={$t("global-1688-ai-app.ChatContent.content.bubbles.feedback.qtIRm5epdfh", "请输入您碰见的问题，推荐15字以上，描述得越清晰，越方便我们进行改进优化～")}
              onChange={handleInputChange}
            />
          </div>

          <Button
            className={styles.feedbackFormButton}
            type="primary"
            htmlType="submit"
            disabled={!canSubmit}
          >{$t("global-1688-ai-app.ChatContent.content.bubbles.feedback.submitFeedback", "提交反馈")}</Button>
        </form>
      }
      title={$t("global-1688-ai-app.ChatContent.content.bubbles.feedback.submitFeedback", "提交反馈")}
      trigger="click"
      placement="rightTop"
      rootClassName={styles.feedbackPopover}
      onOpenChange={handleOpenChange}
    >
      {/* 反馈按钮 */}
      <div className={styles.feedbackWrap}>{$t("global-1688-ai-app.ChatContent.content.bubbles.feedback.feedback", "反馈")}</div>
    </Popover>
  );
}
