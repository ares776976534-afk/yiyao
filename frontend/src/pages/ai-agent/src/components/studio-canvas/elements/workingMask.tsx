import PortalContainer from "./portalContainer";
import styles from "./element.module.scss";

export default function LoadingMask({ className, ...props }: any = {}) {
  return (
    <PortalContainer
      {...props}
      className={`${styles.workingMask}${className ? ` ${className}` : ''}`}
      transformFunc={(points) => {
        return {
          left: points.lt.x + 'px',
          top: points.lt.y + 'px',
          width: (points.rt.x - points.lt.x) + 'px',
          height: (points.lb.y - points.lt.y) + 'px',
        };
      }}
    />
  );
};
