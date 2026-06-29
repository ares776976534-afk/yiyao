import styles from './dropDownContent.module.css';
import { AccountIcon, ThinkIcon, ExitIcon, SettingsIcon, OpenPlatformIcon, ArrowIcon } from '@/components/Icon';
import { defaultUserImg } from '@/utils/env';
import { $t } from '@/i18n';

const DropDownContent = ({ type, userInfo, itemClick }: { type: string; userInfo: any; itemClick: (key: string, menuInfo: any) => void }) => {
  const headerItems = [
    {
      key: 'account',
      icon: <AccountIcon />,
      label: $t("global-1688-ai-app.AgentLayout.DropDownContent.zh", "账号"),
    },
  ];
  const settingsItems = [
    {
      key: 'settings',
      icon: <SettingsIcon width={16} height={16} />,
      label: $t("global-1688-ai-app.AgentLayout.DropDownContent.settings", "设置"),
    },
    // {
    //   key: 'personalized',
    //   icon: <ThinkIcon />,
    //   label: $t("global-1688-ai-app.AgentLayout.DropDownContent.gxh", "个性化"),
    //   path: '/app/personalized-settings',
    //   target: '_self',
    // },
  ];
  const items = [
    {
      key: 'openPlatform',
      icon: <OpenPlatformIcon width={16} height={16} />,
      label: $t("global-1688-ai-app.AgentLayout.DropDownContent.kfpt", "开放平台"),
      path: '/app/seller-center/home',
      target: '_blank',
    },
    // {
    //   key: 'newUserGuide',
    //   icon: <GuidanceIcon width={16} height={16} />,
    //   label: '新手指引',
    // },
    // {
    //   key: 'contact',
    //   icon: <MessageContactIcon />,
    //   label: '联系我们',
    // },
    // {
    //   key: 'platform',
    //   icon: <QuestionMarkIcon />,
    //   label: (
    //     <div className={styles.dropDownItemLabel}>
    //       <span>帮助中心</span>
    //       <span className={styles.dropDownItemArrow}><ArrowIcon color="#CCCCD4" /></span>
    //     </div>
    //   ),
    //   data: {
    //     path: 'https://alidocs.dingtalk.com/i/nodes/KGZLxjv9VGkoG9YwH0Py1kezV6EDybno?corpId=dingd8e1123006514592&utm_medium=im_card&iframeQuery=utm_medium%3Dim_card%26utm_source%3Dim&utm_scene=team_space&utm_source=im',
    //     target: '_blank',
    //   }
    // },
  ];
  const footerItems = [
    {
      key: 'logout',
      icon: <ExitIcon />,
      label: $t("global-1688-ai-app.AgentLayout.DropDownContent.exitLogin", "退出登录"),
    },
  ];
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
    }}
      className={styles.dropDownContent}
    >
      <div className={styles.dropDownContentHeader}>
        <img src={userInfo?.avatar || defaultUserImg} width={42} height={42} alt="" srcSet="" style={{ borderRadius: '50%' }} />
        <div className={styles.dropDownContentHeaderName}>
          <span>{decodeURIComponent(userInfo?.loginId) || $t("global-1688-ai-app.AgentLayout.DropDownContent.login", "登录")}</span>
        </div>
      </div>
      {headerItems.map((item) => (
        <div className={styles.dropDownContentItem} key={item.key} onClick={() => itemClick(item.key, item)}>
          {item.icon}
          {item.label}
        </div>
      ))}
      {/* <div className={styles.dropDownContentDivider} /> */}
      {/* {settingsItems.map((item) => (
        <div className={styles.dropDownContentItem} key={item.key} onClick={() => itemClick(item.key, { data: { path: item.path, target: item.target } })}>
          {item.icon}
          {item.label}
        </div>
      ))} */}
      {/* <div className={styles.dropDownContentDivider} /> */}
      {type === 'mobile' ? null : (items || []).map((item) => (
        <div
          className={styles.dropDownContentItemContent}
          key={item.key}
          onClick={() => itemClick(item.key, { data: { path: item.path, target: item.target } })}
        >
          <div className={styles.dropDownContentItemContentItem}>
            {item.icon}
            {item.label}
          </div>
          <span className={styles.dropDownContentItemArrow}>
            <ArrowIcon color="#BBBDCA" />
          </span>
        </div>
      ))}
      <div className={styles.dropDownContentDivider} />
      {footerItems.map((item) => (
        <div className={`${styles.dropDownContentItem} ${styles.dropDownContentItemExit}`} key={item.key} onClick={() => itemClick(item.key, item)}>
          {item.icon}
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default DropDownContent;