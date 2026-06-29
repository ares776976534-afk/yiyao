import { FeedbackIcon } from '@/components/Icon';
import { Popover, Input, Form, Checkbox } from "antd";
import { MainBtn } from '../ChatFlow/Btn';
import styles from './feedPopover.module.css';
import { FeedbackProps } from './HeaderActions';
import { useState } from 'react';
import { CloseIcon } from '@/components/Icons';
import { $t } from '@/i18n';

const { TextArea } = Input;

const feedbackOptions = [
  {
    label: $t("global-1688-ai-app.SelectProduct.FeedPopover.bgxg", "报告效果"),
    value: "report_effectiveness",
  },
  {
    label: $t("global-1688-ai-app.SelectProduct.FeedPopover.cpfunction", "产品功能"),
    value: "product_feature",
  },
  {
    label: $t("global-1688-ai-app.SelectProduct.FeedPopover.ggo", "改进建议"),
    value: "improvement_suggestion",
  },
  {
    label: $t("global-1688-ai-app.SelectProduct.FeedPopover.dataError", "数据错误"),
    value: "data_error",
  },
  {
    label: $t("global-1688-ai-app.SelectProduct.FeedPopover.qt", "其他"),
    value: "others",
  },
];

export const FeedPopover = ({ onFeedback }: { onFeedback?: (values: FeedbackProps) => void }) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const handleSubmit = (values: any) => {
    const { selectedOptions: selectedValues, feedbackText } = values;
    const selectedOptions = feedbackOptions.filter((item) => selectedValues.includes(item.value));
    onFeedback?.({
      selectedOptions,
      feedbackText,
    });
    setOpen(false);
    form.resetFields();
  }
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.resetFields();
    }
  }
  const onClose = () => {
    setOpen(false);
    form.resetFields();
  }
  return (
    <Popover
      open={open}
      title={
        <div className={styles.feedPopoverTitleContainer}>
          <div className={styles.feedPopoverTitle}>{$t("global-1688-ai-app.SelectProduct.FeedPopover.submitFeedback", "提交反馈")}</div>
          <div className={styles.closeIcon} onClick={onClose}>
            <CloseIcon />
          </div>
        </div>
      }
      rootClassName={styles.feedPopover}
      arrow={false}
      destroyOnHidden
      onOpenChange={handleOpenChange}
      trigger="click"
      align={{
        offset: [-40, 0]
      }}
      content={
        <Form className={styles.feedbackForm} layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label={
              <div className={styles.label}>
                <div className={styles.text}>{$t("global-1688-ai-app.SelectProduct.FeedPopover.ilh", "问题类型（多选）")}</div>
                <div className={styles.required}>*</div>
              </div>
            }
            name="selectedOptions"
            rules={[{ required: true, message: $t("global-1688-ai-app.SelectProduct.FeedPopover.qcu", "请选择问题类型")}]}
          >
            <Checkbox.Group
              className={styles.radioGroup}
            >
              {feedbackOptions.map((item) => (
                <Checkbox key={item.value} value={item.value}>
                  {item.label}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            label={
              <div className={styles.label}>
                <div className={styles.text}>{$t("global-1688-ai-app.SelectProduct.FeedPopover.feedbackContent", "反馈内容")}</div>
                <div className={styles.required}>*</div>
              </div>
            }
            name="feedbackText"
            rules={[
              {
                required: true,
                message: $t("global-1688-ai-app.SelectProduct.FeedPopover.qtbot", "请输入反馈内容"),
              },
            ]}
            className={styles.feedbackFormItem}
          >
            <TextArea
              autoSize={{
                minRows: 6,
                maxRows: 6,
              }}
              className={styles.feedbackFormInputTextarea}
              placeholder={$t("global-1688-ai-app.SelectProduct.FeedPopover.qtecscnyciqwj", "请输入您想要反馈的问题，推荐15字以上，描述得越清晰越方便我们进行改进优化")}
            />
          </Form.Item>
          <div className={styles.footerBtn}>
            <MainBtn
              text={$t("global-1688-ai-app.SelectProduct.FeedPopover.submitFeedback", "提交反馈")}
              handleBtn={form.submit}
              style={{
                width: 96,
                height: 36,
              }}
            />
          </div>
        </Form>
      }
      
    >
      <div className={styles.commonStyle}>
        <FeedbackIcon  />
      </div>
    </Popover>
  )
};