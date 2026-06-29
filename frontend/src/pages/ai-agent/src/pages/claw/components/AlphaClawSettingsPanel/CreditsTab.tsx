import React, { useMemo, useState } from "react";
import { Segmented } from "antd";
import classNames from "classnames";
import type {
  TypeCreditsFilter,
  TypeCreditsRecordItem,
  TypeCreditsSummary,
} from "./types";
import styles from "./index.module.scss";

const FILTER_OPTIONS: { value: TypeCreditsFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "consume", label: "消耗" },
  { value: "earn", label: "获得" },
];

const CREDITS_SUMMARY_MOCK: TypeCreditsSummary = {
  currentCredits: 1100,
  freeCredits: 100,
  freeCreditsTotal: 500,
  purchasedCredits: 1000,
};

const CREDITS_RECORD_LIST_MOCK: TypeCreditsRecordItem[] = [
  {
    id: "record-1",
    category: "earn",
    title: "购买积分",
    happenedAt: "2025/01/25 18:00:00",
    amount: 1000,
    expireAt: "2026/02/25 18:00:00",
  },
  {
    id: "record-2",
    category: "consume",
    title: "免费积分过期清零",
    happenedAt: "2026/01/25 18:00:00",
    amount: -100,
  },
  {
    id: "record-3",
    category: "consume",
    title: "Kimi-2.5",
    happenedAt: "2025/12/25 18:00:00",
    amount: -1000,
  },
  {
    id: "record-4",
    category: "consume",
    title: "Kimi-2.5",
    happenedAt: "2025/12/25 18:00:00",
    amount: -500,
  },
  {
    id: "record-5",
    category: "earn",
    title: "免费积分发放",
    happenedAt: "2025/12/25 18:00:00",
    amount: 500,
    expireAt: "2026/01/25 18:00:00",
  },
  {
    id: "record-6",
    category: "consume",
    title: "Kimi-2.5",
    happenedAt: "2025/12/25 18:00:00",
    amount: -500,
  },
  {
    id: "record-7",
    category: "consume",
    title: "Kimi-2.5",
    happenedAt: "2025/12/25 18:00:00",
    amount: -500,
  },
  {
    id: "record-8",
    category: "consume",
    title: "Kimi-2.5",
    happenedAt: "2025/12/25 18:00:00",
    amount: -500,
  },
];

const CreditsTab: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<TypeCreditsFilter>("all");
  const handlePurchaseCredits = () => {
    window.open(
      "https://www.alphashop.cn/seller-center/credit-management?tab=3",
      "_blank",
    );
  };

  const displayRecords = useMemo(() => {
    if (activeFilter === "all") {
      return CREDITS_RECORD_LIST_MOCK;
    }
    return CREDITS_RECORD_LIST_MOCK.filter(
      (item) => item.category === activeFilter,
    );
  }, [activeFilter]);

  const freeProgressWidth = useMemo(() => {
    const total = CREDITS_SUMMARY_MOCK.freeCreditsTotal ?? 0;
    if (total <= 0) {
      return 0;
    }
    const value = Math.min(CREDITS_SUMMARY_MOCK.freeCredits ?? 0, total);
    return Math.round((value / total) * 100);
  }, []);

  return (
    <div className={styles.creditsTabWrap}>
      <div className={styles.creditsSummaryCard}>
        <div className={styles.creditsSummaryHeader}>
          <span className={styles.creditsSummaryHeaderLabel}>当前积分</span>
          <span className={styles.creditsSummaryHeaderValue}>
            {(CREDITS_SUMMARY_MOCK.currentCredits ?? 0).toLocaleString()}
          </span>
        </div>
        <div className={styles.creditsSummaryBody}>
          <div
            className={classNames(
              styles.creditsSummaryItem,
              styles.creditsSummaryItemVertical,
            )}
          >
            <div className={styles.creditsSummaryItemMain}>
              <span className={styles.creditsSummaryBlockLabel}>
                免费积分{" "}
                <span className={styles.creditsSummaryHint}>(优先扣除)</span>
              </span>
              <div className={styles.creditsSummaryFreeValueWrapper}>
                <div className={styles.creditsSummaryFreeValueRow}>
                  <span className={styles.creditsSummaryBlockValue}>
                    {(CREDITS_SUMMARY_MOCK.freeCredits ?? 0).toLocaleString()}
                  </span>
                  <span className={styles.creditsSummarySlash}>
                    /
                    {(
                      CREDITS_SUMMARY_MOCK.freeCreditsTotal ?? 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className={styles.creditsSummaryProgressTrack}>
                  <div
                    className={styles.creditsSummaryProgressFill}
                    style={{ width: `${freeProgressWidth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className={classNames(
              styles.creditsSummaryItem,
              styles.creditsSummaryItemHorizontal,
            )}
          >
            <div className={styles.creditsSummaryItemMain}>
              <span className={styles.creditsSummaryBlockLabel}>
                剩余已购积分
              </span>
              <div className={styles.creditsSummaryPurchasedRow}>
                <span className={styles.creditsSummaryBlockValue}>
                  {(
                    CREDITS_SUMMARY_MOCK.purchasedCredits ?? 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={styles.creditsPurchaseButton}
              onClick={handlePurchaseCredits}
            >
              购买积分
            </button>
          </div>
        </div>
      </div>

      <div className={styles.creditsFilterWrap}>
        <Segmented
          block
          className={styles.creditsFilterSegmented}
          options={FILTER_OPTIONS}
          value={activeFilter}
          onChange={(value) => setActiveFilter(value as TypeCreditsFilter)}
        />
      </div>

      <div className={styles.creditsRecordList}>
        {displayRecords.map((item) => (
          <div key={item.id} className={styles.creditsRecordItem}>
            <div className={styles.creditsRecordLeft}>
              <div className={styles.creditsRecordTitle}>{item.title}</div>
              <div className={styles.creditsRecordTime}>{item.happenedAt}</div>
            </div>
            <div className={styles.creditsRecordRight}>
              <div
                className={
                  item.amount > 0
                    ? `${styles.creditsRecordAmount} ${styles.creditsRecordAmountPositive}`
                    : styles.creditsRecordAmount
                }
              >
                {item.amount > 0
                  ? `+${item.amount.toLocaleString()}`
                  : item.amount.toLocaleString()}
              </div>
              {item.expireAt && (
                <div className={styles.creditsRecordExpire}>
                  有效期至 {item.expireAt}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreditsTab;
