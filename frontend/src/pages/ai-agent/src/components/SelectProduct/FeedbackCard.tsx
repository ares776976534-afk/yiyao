import React, { useState, useEffect } from 'react';
import styles from './feedbackCard.module.css';
import { UpvoteDownvoteIcon, FeedbackCloseIcon, FeedbackCheckHeartIcon } from '@/components/Icon';
import { Input, Form, Checkbox } from 'antd';
import { MainBtn } from '../ChatFlow/Btn';
import { CloseIcon } from '@/components/Icons';
import reportFeedback from '@/services/studio/reportFeedback';
import { $t } from '@/i18n';

const { TextArea } = Input;

const feedbackOptions = [
  {
    label: $t('global-1688-ai-app.SelectProduct.FeedPopover.bgxg', '报告效果'),
    value: 'report_effectiveness',
  },
  {
    label: $t('global-1688-ai-app.SelectProduct.FeedPopover.cpfunction', '产品功能'),
    value: 'product_feature',
  },
  {
    label: $t('global-1688-ai-app.SelectProduct.FeedPopover.ggo', '改进建议'),
    value: 'improvement_suggestion',
  },
  {
    label: $t('global-1688-ai-app.SelectProduct.FeedPopover.dataError', '数据错误'),
    value: 'data_error',
  },
  {
    label: $t('global-1688-ai-app.SelectProduct.FeedPopover.qt', '其他'),
    value: 'others',
  },
];

interface FeedbackCardProps {
  sessionId?: string;
  taskId?: string;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({
  sessionId,
  taskId
}) => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [form] = Form.useForm();
  const [showModal, setShowModal] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [visible, setVisible] = useState(false);

  // 3秒后显示反馈卡片
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // 感谢反馈后3秒关闭整个卡片
  useEffect(() => {
    if (!feedbackOpen) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [feedbackOpen]);

  // 监听表单值变化
  const handleFormChange = () => {
    const selectedOptions = form.getFieldValue('selectedOptions');
    const feedbackText = form.getFieldValue('feedbackText');
    const hasOptions = selectedOptions && selectedOptions.length > 0;
    const hasText = feedbackText && feedbackText.trim().length > 0;
    setCanSubmit(hasOptions && hasText);
  };

  const handleSubmit = (values: any) => {
    const { selectedOptions: selectedValues, feedbackText } = values;
    const selectedOptions = feedbackOptions.filter((item) => selectedValues.includes(item.value));
    reportFeedback({
      selectedOptions,
      feedbackText,
      sessionId,
      taskId,
      source: window.location.pathname,
    });
    form.resetFields();
    setShowModal(false);
    setCanSubmit(false);
    setFeedbackOpen(true);
  };

  const onClose = () => {
    form.resetFields();
    setShowModal(false);
    setCanSubmit(false);
  };

  // 点击喜欢
  const onLike = () => {
    reportFeedback({
      like: true,
      sessionId,
      taskId,
      source: window.location.pathname,
    })
    setFeedbackOpen(true);
  };

  // 点击不喜欢
  const onDislike = () => {
    setShowModal(true);
  };

  // 关闭整个反馈卡片
  const onCloseFeedbackCard = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={`${styles.feedbackCardContainer} ${styles.slideIn}`}>
      {!showModal ? (
        <div className={styles.container}>
          <div className={styles.feedbackCloseIcon} onClick={onCloseFeedbackCard}>
            <FeedbackCloseIcon />
          </div>
          {feedbackOpen ? (
            <div className={styles.feedbackCheckHeartContainer}>
              <FeedbackCheckHeartIcon />
              <div className={styles.feedbackCheckHeartText}>{$t('global-1688-ai-app.SelectProduct.FeedbackCard.thankYouForYourFeedback', '感谢你的反馈！')}</div>
            </div>
          ) : (
            <div className={styles.default}>
              <span className={styles.title}>{$t('global-1688-ai-app.SelectProduct.FeedbackCard.howDoYouFeel', '您觉得这个结果如何？')}</span>
              <div className={styles.actions}>
                <div className={styles.actionItem} onClick={onLike}>
                  <UpvoteDownvoteIcon />
                  <span className={styles.actionText}>{$t('global-1688-ai-app.SelectProduct.FeedbackCard.like', '喜欢')}</span>
                </div>
                <div className={styles.divider}/>
                <div className={styles.actionItem} onClick={onDislike}>
                  <UpvoteDownvoteIcon style={{ transform: 'rotate(180deg)' }} />
                  <span className={styles.actionText}>{$t('global-1688-ai-app.SelectProduct.FeedbackCard.dislike', '不喜欢')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.feedModal}>
          <div className={styles.feedPopoverTitleContainer}>
            <div className={styles.feedPopoverTitle}>{$t('global-1688-ai-app.SelectProduct.FeedPopover.submitFeedback', '提交反馈')}</div>
            <div className={styles.closeIcon} onClick={onClose}>
              <CloseIcon />
            </div>
          </div>
          <Form className={styles.feedbackForm} layout="vertical" form={form} onFinish={handleSubmit} onValuesChange={handleFormChange}>
            <Form.Item
              label={
                <div className={styles.label}>
                  <div className={styles.text}>{$t('global-1688-ai-app.SelectProduct.FeedPopover.ilh', '问题类型（多选）')}</div>
                  <div className={styles.required}>*</div>
                </div>
              }
              name="selectedOptions"
              rules={[{ required: true, message: $t('global-1688-ai-app.SelectProduct.FeedPopover.qcu', '请选择问题类型')}]}
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
                  <div className={styles.text}>{$t('global-1688-ai-app.SelectProduct.FeedPopover.feedbackContent', '反馈内容')}</div>
                  <div className={styles.required}>*</div>
                </div>
              }
              name="feedbackText"
              rules={[
                {
                  required: true,
                  message: $t('global-1688-ai-app.SelectProduct.FeedPopover.qtbot', '请输入反馈内容'),
                },
              ]}
              className={styles.feedbackFormItem}
            >
              <TextArea
                autoSize={{
                  minRows: 5,
                  maxRows: 5,
                }}
                className={styles.feedbackFormInputTextarea}
                placeholder={$t('global-1688-ai-app.SelectProduct.FeedbackCard.pleaseSubmitFeedback', '请进一步提交反馈，帮助我们更好地改进。')}
              />
            </Form.Item>
            <div className={styles.footerBtn}>
              <MainBtn
                text={$t('global-1688-ai-app.SelectProduct.FeedPopover.submitFeedback', '提交反馈')}
                handleBtn={form.submit}
                other={{ disabled: !canSubmit }}
                style={{
                  width: 96,
                  height: 36,
                }}
              />
            </div>
          </Form>
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;
