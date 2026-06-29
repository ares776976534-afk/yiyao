import styles from "./index.module.scss";

export default function HearBeatIcon(props: { text?: string }) {
  const { text } = props;

  return (
    <div className={styles.heartbeatIcon}>
      <img className={styles.heartbeatImg} src="https://img.alicdn.com/imgextra/i3/O1CN0170bAlo1ugk2KhUU5V_!!6000000006067-54-tps-80-64.apng" alt="heartbeat" />
      <div className={styles.heartbeatText}>
        {text || '思考中...'}
      </div>
    </div>
  );
}