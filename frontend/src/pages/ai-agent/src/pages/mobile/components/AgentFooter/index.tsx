import styles from './index.module.scss';

export const AgentFooter = () => {
  return (
    <div className={styles.agentFooter}>
      <div className={styles.agentFooterPartner}>
        <img src="https://img.alicdn.com/imgextra/i4/O1CN01ytSDui29im1wk0D73_!!6000000008102-2-tps-583-40.png" alt="" srcSet="" />
      </div>
      <div className={styles.agentFooterText}>
        <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank">浙公网安备 33010002000121号</a>
        <div className={styles.point} />
        <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">ICP备2026014275号-1</a>
        <div className={styles.point} />
        <a href="https://terms.alicdn.com/legal-agreement/terms/privacy/20221101140343728/20221101140343728.html" target="_blank">算法备案信息：点击查看</a>
      </div>
    </div>
  )
}

export default AgentFooter;