import React, { useState } from "react";
import { Segmented } from "antd";
import styles from "./index.module.scss";

type TypePurchaseSegment = "subscription" | "purchase";

const PURCHASE_SEGMENT_OPTIONS: {
  label: string;
  value: TypePurchaseSegment;
}[] = [
  { label: "订阅套餐", value: "subscription" },
  { label: "购买积分", value: "purchase" },
];

const SEGMENT_ICON_MAP: Record<TypePurchaseSegment, string> = {
  subscription:
    "https://img.alicdn.com/imgextra/i3/O1CN01gR2oQ11Gzu08wTX94_!!6000000000694-55-tps-16-16.svg",
  purchase:
    "https://img.alicdn.com/imgextra/i2/O1CN01hu9jPK1PYj2dlZr3Q_!!6000000001853-55-tps-16-16.svg",
};

const FEATURE_LIST = ["部署 24/7 在线的云端 AlphaClaw", "内置 1311 积分"];
const PURCHASE_PACKAGE_LIST = [
  {
    key: "basic",
    title: "基础补给包",
    desc: "快速获取基础积分，极速就绪",
    price: "¥30",
    credits: "300",
  },
  {
    key: "standard",
    title: "标准增值包",
    desc: "更久的云端AlphaClaw部署支持",
    price: "¥100",
    credits: "1,000",
  },
  {
    key: "pro",
    title: "高频开发者包",
    desc: "专为高频使用设计的顶级算力包",
    price: "¥300",
    credits: "3,000",
  },
];

const CreditsPurchaseTab: React.FC = () => {
  const [activeSegment, setActiveSegment] =
    useState<TypePurchaseSegment>("subscription");

  return (
    <div className={styles.creditsPurchaseTabWrap}>
      <div className={styles.creditsPurchaseHeader}>
        <div className={styles.creditsPurchaseUserInfo}>
          <img
            className={styles.creditsPurchaseAvatar}
            src="https://img.alicdn.com/imgextra/i1/6000000003293/O1CN01iDRsCs1aCFNORinw9_!!6000000003293-2-gg_dtc.png"
            alt=""
          />
          <div className={styles.creditsPurchaseUserMeta}>
            <div className={styles.creditsPurchaseUserName}>Jinji</div>
            <div className={styles.creditsPurchaseInfoRow}>
              <div className={styles.creditsPurchaseInfoPair}>
                <span className={styles.creditsPurchaseInfoLabel}>免费版</span>
                <span className={styles.creditsPurchaseInfoValue}>
                  有效期至 2026.12.31 13:48
                </span>
              </div>
              <div className={styles.creditsPurchaseInfoPair}>
                <span className={styles.creditsPurchaseInfoLabel}>
                  当前积分
                </span>
                <span className={styles.creditsPurchasePointsValue}>1,100</span>
                <img
                  className={styles.creditsPurchaseInfoIcon}
                  src="https://img.alicdn.com/imgextra/i4/O1CN01jyD9C029pdzv133sM_!!6000000008117-55-tps-14-14.svg"
                />
              </div>
            </div>
          </div>
        </div>
        <button type="button" className={styles.creditsPurchaseOrderButton}>
          订单详情
        </button>
      </div>

      <div className={styles.creditsPurchaseDivider} />

      <div className={styles.creditsPurchaseSegmentWrap}>
        <Segmented
          block
          className={`${styles.creditsFilterSegmented} ${styles.creditsPurchaseSegmented}`}
          options={PURCHASE_SEGMENT_OPTIONS.map((item) => ({
            value: item.value,
            label: (
              <div className={styles.creditsPurchaseSegmentOption}>
                <div
                  className={styles.creditsPurchaseSegmentIcon}
                  style={{ maskImage: `url(${SEGMENT_ICON_MAP[item.value]})` }}
                />
                <span>{item.label}</span>
              </div>
            ),
          }))}
          value={activeSegment}
          onChange={(value) => setActiveSegment(value as TypePurchaseSegment)}
        />
      </div>

      {activeSegment === "subscription" ? (
        <div className={styles.creditsPurchaseCard}>
          <img
            className={styles.creditsPurchaseCardBgTop}
            src="https://img.alicdn.com/imgextra/i1/O1CN01sZGeyj1IFIw85QXQZ_!!6000000000863-55-tps-540-200.svg"
          />
          <img
            className={styles.creditsPurchaseCardBgRight}
            src="https://img.alicdn.com/imgextra/i3/O1CN01J7sPQP1Nhld4DqdfD_!!6000000001602-55-tps-370-200.svg"
          />
          <div className={styles.creditsPurchaseCardContent}>
            <div className={styles.creditsPurchaseTitleBlock}>
              <div className={styles.creditsPurchaseCardTitle}>
                AlphaClaw 专业版月度套餐
              </div>
              <div className={styles.creditsPurchasePriceRow}>
                <span className={styles.creditsPurchasePrice}>¥199</span>
                <span className={styles.creditsPurchasePriceSuffix}>/月</span>
              </div>
            </div>
            <div className={styles.creditsPurchaseFeatureList}>
              {FEATURE_LIST.map((item) => (
                <div key={item} className={styles.creditsPurchaseFeatureItem}>
                  <img
                    className={styles.creditsPurchaseFeatureIcon}
                    src="https://img.alicdn.com/imgextra/i3/6000000003418/O1CN01XoF2961b7UstyYQ49_!!6000000003418-2-gg_dtc.png"
                    alt=""
                  />
                  <span className={styles.creditsPurchaseFeatureText}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.creditsPurchaseSubmitButton}
            >
              订阅
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.creditsPurchasePackageGrid}>
          {PURCHASE_PACKAGE_LIST.map((item) => (
            <div key={item.key} className={styles.creditsPurchasePackageCard}>
              <div className={styles.creditsPurchasePackageMain}>
                <div className={styles.creditsPurchasePackageTitleBlock}>
                  <div className={styles.creditsPurchasePackageTitle}>
                    {item.title}
                  </div>
                  <div className={styles.creditsPurchasePackageDesc}>
                    {item.desc}
                  </div>
                </div>
                <div className={styles.creditsPurchasePriceRow}>
                  <span className={styles.creditsPurchasePrice}>
                    {item.price}
                  </span>
                  <span className={styles.creditsPurchasePriceSuffix}>/次</span>
                </div>
              </div>
              <div className={styles.creditsPurchasePackageBenefit}>
                <img
                  className={styles.creditsPurchaseFeatureIcon}
                  src="https://img.alicdn.com/imgextra/i3/6000000003418/O1CN01XoF2961b7UstyYQ49_!!6000000003418-2-gg_dtc.png"
                  alt=""
                />
                <span className={styles.creditsPurchaseFeatureText}>
                  内置 {item.credits} 积分
                </span>
              </div>
              <button
                type="button"
                className={styles.creditsPurchasePackageButton}
              >
                购买
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.creditsPurchaseTips}>
        <span className={styles.creditsPurchaseTipText}>
          当前服务属于虚拟商品，已经支付无法退款，请您谅解，文案文案文案
        </span>
        <span className={styles.creditsPurchaseTipAgreement}>
          点击订阅即表示您已阅读并同意
          <span className={styles.creditsPurchaseAgreementLink}>
            遨虾产品订购协议
          </span>
        </span>
      </div>
    </div>
  );
};

export default CreditsPurchaseTab;
