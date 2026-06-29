import classNames from "classnames";
import { IconCheck, IconLoadingCard } from "../Icons";
import styles from "./index.module.scss";
import CascadeCard, { EnumStackRotateDirection, EnumStackEmergeFrom } from "@/components/CascadeCard";

interface LoadingProps {
  platformLabel: string;
}

const STEPS = [
  { getText: (platform: string) => `基于${platform}风格进行翻译`, done: true },
  { getText: () => "基于睿观数据进行合规检测", done: true },
  { getText: () => "标题优化完成", done: true },
  { getText: () => "属性优化", done: true },
  { getText: () => "图片优化", done: true },
];

const cards = new Array(3).fill(<IconLoadingCard className={styles.loadingCardSvg} />);

const Loading = ({ platformLabel }: LoadingProps) => {

  return (
    <div className={styles.loading}>
      <div className={styles.carousel} aria-hidden>
        <CascadeCard
          dataSource={cards}
          stackRotateDirection={EnumStackRotateDirection.FRONT_TO_BACK}
          stackEmergeFrom={EnumStackEmergeFrom.BOTTOM}
        />
      </div>
      <div className={styles.tip}>预计需要 20-30s 完成</div>
      <div className={styles.steps}>
        {STEPS.map((step, index) => (
          <div key={index} className={styles.step}>
            <IconCheck
              className={classNames(
                styles.checkIcon,
                step.done ? styles.checkDone : styles.checkPending,
              )}
            />
            <span className={styles.stepText}>
              {step.getText(platformLabel)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
