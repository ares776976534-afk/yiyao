import React, { useEffect, useRef } from "react";
import styles from "./followUpQuestions.module.css";
import jumpTo from "@/utils/jumpTo";
import log from "@/utils/log";
import { LOG_KEYS } from "@/utils/logConfig";

interface FollowUpItem {
  text: string;
  jumpPath?: string;
}

interface FollowUpQuestionsProps {
  cardId?: string;
  title?: string;
  followUps?: FollowUpItem[];
  onChatSubmit?: (data: { query: string }) => void;
  isStreaming?: boolean;
  logKey?: string;
  cardType?: string;
  cardSubType?: string;
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({
  cardId,
  title = "追问问题",
  followUps = [],
  onChatSubmit,
  isStreaming = false,
  logKey,
  cardType,
  cardSubType,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasExpRef = useRef(false);
  const logParamsRef = useRef({ cardType, cardSubType });
  logParamsRef.current = { cardType, cardSubType };

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !followUps.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasExpRef.current) {
          hasExpRef.current = true;
          log.record(logKey || LOG_KEYS.GENERAL_AGENT.LP.FOLLOW_UP, 'EXP', {
            count: followUps.length,
            cardType: logParamsRef.current.cardType || '',
            cardSubType: logParamsRef.current.cardSubType || '',
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [logKey, followUps.length]);

  const handleQuestionClick = (item: FollowUpItem) => {
    if (isStreaming) return;

    // 埋点：记录追问问题点击
    log.record(logKey || LOG_KEYS.GENERAL_AGENT.LP.FOLLOW_UP, 'CLK', {
      question: item.text,
      jumpPath: item.jumpPath || '',
    });

    if (item.jumpPath) {
      jumpTo(item.jumpPath);
    } else if (onChatSubmit) {
      onChatSubmit({ query: item.text });
    }
  };

  if (!followUps || followUps.length === 0) {
    return null;
  }

  return (
    <div ref={wrapperRef} id={cardId} className={styles.container}>
      <span className={styles.title}>{title}</span>
      {followUps.map((item, index) => (
        <div
          key={index}
          className={`${styles.questionItem} ${isStreaming ? styles.disabled : ""}`}
          style={{
            opacity: 0,
            animation: `fadeInUp 260ms ease-out ${index * 80}ms both`,
          }}
          onClick={() => handleQuestionClick(item)}
        >
          <img
            className={styles.icon}
            src="https://img.alicdn.com/imgextra/i4/6000000006678/O1CN01FgUe401zCa3VaG6XH_!!6000000006678-2-gg_dtc.png"
            alt=""
          />
          <span className={styles.questionText}>{item.text}</span>
        </div>
      ))}
    </div>
  );
};

export default FollowUpQuestions;
