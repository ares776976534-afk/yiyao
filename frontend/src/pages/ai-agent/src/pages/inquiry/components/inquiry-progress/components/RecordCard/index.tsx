import React, { useEffect, useRef } from 'react';
import styles from './index.module.scss';
import { Start2Icon, WantWantIcon, InfoIcon2, CopyIcon } from '@/components/Icon';
import { Tooltip, Popover } from 'antd';
import classNames from 'classnames';
import * as clipboard from "clipboard-polyfill";
import InquiryProgressPopover from './InquiryProgressPopover';
import { InquiryConversationData } from '../../types';
import useToast from '@/components/Toast';
import ConditionalTooltip from '../../../ConditionalTooltip';
import { $t } from '@/i18n';

const copyToClipboard = (text: string) => {
  return new Promise((resolve, reject) => {
    clipboard.writeText(text).then(() => {
      resolve(true);
    }).catch(() => {
      reject(false);
    });
  });
};
// 检测是否是图片URL
const isImageUrl = (url: string): boolean => {
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
  return imageExtensions.test(url);
};
const handleToWangwang = (wangwangId) => {
  window.open(`https://air.1688.com/app/ocms-fusion-components-1688/def_cbu_web_im/index.html?touid=cnalichn${encodeURIComponent(wangwangId)}&siteid=cnalichn&status=2&portalId=&gid=&offerId=&itemsId#/`, '_blank');
};
// URL检测和渲染函数
const renderContentWithUrl = (content: string) => {
  // Twitter/GitHub的成熟方案：
  // 1. URL正则直接排除末尾的标点符号
  // 2. 使用负向后瞻或者更精确的字符类
  const urlRegex = /https?:\/\/[^\s，。！？；：""''、（）《》【】<>]+/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // 重置正则表达式的lastIndex
  urlRegex.lastIndex = 0;

  while ((match = urlRegex.exec(content)) !== null) {
    const originalUrl = match[0];
    const matchStart = match.index;
    const matchEnd = matchStart + originalUrl.length;

    // 添加URL前的文本
    if (matchStart > lastIndex) {
      parts.push(content.substring(lastIndex, matchStart));
    }

    // 清理URL末尾可能的英文标点符号
    // 这是Twitter的做法：从末尾移除标点，直到遇到字母数字或/
    let cleanedUrl = originalUrl.replace(/[.,;:!?'")\]}>]+$/, '');

    // 计算被移除的标点符号
    const removedChars = originalUrl.substring(cleanedUrl.length);

    // 检测是否是图片URL
    if (isImageUrl(cleanedUrl)) {
      parts.push(
        <img
          key={`img-${matchStart}`}
          src={cleanedUrl}
          alt={$t("global-1688-ai-app.inquiry.inquiry-progress.RecordCard.image", "图片")}
          onClick={() => {
            window.open(cleanedUrl, '_blank');
          }}
          className={styles.messageImage}
        />,
      );
    } else {
      // 普通URL链接
      parts.push(
        <a
          key={`link-${matchStart}`}
          href={cleanedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.urlLink}
        >
          {cleanedUrl}
        </a>,
      );
    }

    // 如果有被移除的标点，把它们作为普通文本添加
    if (removedChars) {
      parts.push(removedChars);
    }

    lastIndex = matchEnd;
  }

  // 添加剩余的文本
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  // 如果没有匹配到任何URL，返回原文本
  if (parts.length === 0) {
    return content;
  }

  return parts.map((part, index) => (
    <React.Fragment key={index}>{part}</React.Fragment>
  ));
};

interface TypeRecordCardProps {
  data: InquiryConversationData;
  isTranslated?: boolean;
}

const RecordCard: React.FC<TypeRecordCardProps> = (props) => {
  const { data, isTranslated = false } = props;
  const toast = useToast();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef<number>(0);
  const animatedMessageIndicesRef = useRef<Set<number>>(new Set());
  const messageAnimationDelayRef = useRef<Map<number, number>>(new Map());
  const isFirstRenderRef = useRef<boolean>(true);

  useEffect(() => {
    if (data?.messages?.length > 0) {
      if (messageContainerRef?.current) {
        messageContainerRef.current.scrollTop = Number.MAX_SAFE_INTEGER;
      }
    }
  }, [data?.messages?.length]);

  // 检测新增消息并标记需要动画的消息
  useEffect(() => {
    const currentMessageCount = data?.messages?.length || 0;
    const previousCount = previousMessageCountRef.current;

    // 如果是首次渲染，初始化 previousCount，但不添加动画
    if (isFirstRenderRef.current) {
      previousMessageCountRef.current = currentMessageCount;
      isFirstRenderRef.current = false;
      return;
    }

    // 如果是新增的消息（数量增加），标记新增的消息索引需要动画
    if (currentMessageCount > previousCount) {
      for (let messageIndex = previousCount; messageIndex < currentMessageCount; messageIndex++) {
        animatedMessageIndicesRef.current.add(messageIndex);
        // 记录相对于新增消息起始位置的延迟偏移量
        messageAnimationDelayRef.current.set(messageIndex, messageIndex - previousCount);
      }
    } else if (currentMessageCount < previousCount) {
      // 如果消息数量减少（可能是重新加载），清空动画标记
      animatedMessageIndicesRef.current.clear();
      messageAnimationDelayRef.current.clear();
      previousMessageCountRef.current = 0;
      isFirstRenderRef.current = true;
    }

    // 更新上一次的消息数量
    previousMessageCountRef.current = currentMessageCount;
  }, [data?.messages?.length]);

  return (
    <div className={styles.recordCardContainer}>
      <div className={styles.chatHeaderWrapper}>
        <div className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.companyName}>{data.companyName}</span>
            <Tooltip
              // overlayClassName={styles.copyTooltip}
              rootClassName={styles.copyTooltipRoot}
              title={
                <div className={styles.copyTooltipContent}>
                  <span>{$t("global-1688-ai-app.inquiry.inquiry-progress.RecordCard.dhid", "对话id")}</span>
                  <span
                    onClick={() => {
                      copyToClipboard(data.conversationId).then(() => {
                        toast.success($t("global-1688-ai-app.inquiry.inquiry-progress.RecordCard.copySuccess", "复制成功"));
                      }).catch(() => {
                        toast.error('复制失败');
                      });
                    }}
                    className={styles.copyIcon}
                  >
                    <CopyIcon fill="currentColor" />
                  </span>
                </div>
              }
              placement="bottom"
            >

              <span className={styles.headerIcon}>
                <InfoIcon2 />
              </span>
            </Tooltip>
          </div>

          <span onClick={() => handleToWangwang(data.wangwangId)} className={styles.headerWantWantIcon}>
            <WantWantIcon fill="currentColor" />
          </span>
        </div>
      </div>


      <div ref={messageContainerRef} className={styles.messageContainer}>
        {
          (data.messages || []).map((item, index) => {
            // 检查是否是商品消息
            const isItemMessage = item.meta?.type === 'item' && item.meta?.data;
            const itemData = isItemMessage && item.meta?.data ? item.meta.data : null;

            return (
              <div
                key={index + item.content}
                className={classNames(styles.messageWithAvatar,
                  {
                    [styles.messageSeller]: item.role === 'seller',
                  },
                )}
              >
                {isItemMessage && itemData ? (
                  // 商品卡片
                  <div
                    className={classNames(styles.itemCard, {
                      [styles.itemCardAnimated]: animatedMessageIndicesRef.current.has(index),
                    })}
                    style={
                      animatedMessageIndicesRef.current.has(index)
                        ? {
                            animationDelay: `${(messageAnimationDelayRef.current.get(index) || 0) * 0.1}s`,
                          }
                        : undefined
                    }
                    onClick={() => {
                      if (itemData.link) {
                        window.open(itemData.link, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <img
                      src={itemData.img}
                      alt={itemData.title || $t("global-1688-ai-app.inquiry.inquiry-progress.RecordCard.productImage", "商品图片")}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitle}>{itemData.title || $t("global-1688-ai-app.inquiry.inquiry-progress.RecordCard.cpmc", "产品名称")}</div>
                      <div className={styles.itemPrice}>{itemData.price || '¥0.00'}</div>
                    </div>
                  </div>
                ) : (
                  // 普通文本消息
                  <div
                    className={classNames(styles.messageText, {
                      [styles.messageTextAnimated]: animatedMessageIndicesRef.current.has(index),
                    })}
                    style={
                      animatedMessageIndicesRef.current.has(index)
                        ? {
                            animationDelay: `${(messageAnimationDelayRef.current.get(index) || 0) * 0.1}s`,
                          }
                        : undefined
                    }
                  >
                    {renderContentWithUrl(
                    isTranslated && item.meta?.muliLanInfo?.lanContent
                      ? item.meta.muliLanInfo.lanContent
                      : item.content
                  )}
                  </div>
                )}
                <div className={styles.avatar} >
                  {
                    item.role === 'buyerAssistant' ? (
                      <div className={styles.avatarAi}>
                        AI
                      </div>
                    ) : null
                  }
                  <img src={item.role === 'seller' ? data.sellerHeadImg : data.buyerHeadImg} alt="avatar" />
                </div>
              </div>
            );
          })
        }
        {/* <div className={styles.messageWithAvatar}>

          <div className={styles.messageText}>
            {data.messages[0].content}
          </div>
          <div className={styles.avatar} />
        </div>

        <div className={classNames(styles.messageWithAvatar, styles.messageSeller)}>

          <div className={styles.messageText}>
            {data.messages[1].content}
          </div>
          <div className={styles.avatar} />
        </div>

        <div className={styles.messageWithAvatar}>
          <div className={styles.messageText}>
            这是某某的AI问题，这是某某的AI问题，这是某某的AI问题
          </div>
          <div className={styles.avatar} />
        </div>
        <div className={styles.messageWithAvatar}>
          <div className={styles.messageText}>
            这是某某的AI问题，这是某某的AI问题，这是某某的AI问题
          </div>
          <div className={styles.avatar} />
        </div>
        <div className={classNames(styles.messageWithAvatar, styles.messageSeller)}>

          <div className={styles.messageText}>
            这是商家的回复
          </div>
          <div className={styles.avatar} />
        </div>
        <div className={styles.messageWithAvatar}>
          <div className={styles.messageText}>
            这是某某的AI问题，这是某某的AI问题，这是某某的AI问题
          </div>
          <div className={styles.avatar} />
        </div> */}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerWrapper}>
          <div className={styles.footerContent}>
            <div className={styles.footerTitle}>
              <span className={styles.aiIcon}>
                <Start2Icon stopColor="currentColor" />
              </span>
              <span className={styles.aiText}>{$t("global-1688-ai-app.inquiry.inquiry-progress.RecordCard.Alz", "AI实时总结")}</span>
            </div>
            <ConditionalTooltip title={data.aiSummary} placement="top" >
              <div className={styles.footerSummary}>
                {data.aiSummary}
              </div>
            </ConditionalTooltip>
            {/* <Popover
              content={
                <div className={styles.summaryPopoverContent}>
                  {data.aiSummary}
                </div>
              }
              trigger="hover"
              arrow={false}
              placement="top"
              overlayClassName={styles.summaryPopover}
            >
              <div className={styles.footerSummary}>
                {data.aiSummary}
              </div>
            </Popover> */}
          </div>
          <Popover
            content={<InquiryProgressPopover items={data.questionProgress || []} />}
            trigger="hover"
            arrow={false}
            placement="topRight"
            overlayClassName={styles.inquiryPopover}
          >
            <div className={styles.footerProgress}>
              <div className={styles.percentage}>{data.progress}</div>
              <div className={styles.status}>
                <span className={styles.statusText}>
                  {$t("global-1688-ai-app.inquiry.inquiry-progress.RecordCard.xpjd", "询盘进度")}
                </span>
                <img className={styles.statusIcon} src="https://img.alicdn.com/imgextra/i2/O1CN01YS4KHi1RIM5i8qmef_!!6000000002088-2-tps-48-48.png" alt="" />
              </div>
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default RecordCard;

