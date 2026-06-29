import React, { useState } from 'react';
import styles from './footer.module.scss';
import { Modal } from 'antd';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import ContactService from '../../api-list/components/APIPackage/ContactService';
import handleScrollToTop from '@/utils/scrollToTop';
import { $t } from '@/i18n';
import Copyright from './Copyright';
import { appVersionType, AppVersionType } from '@/utils/env';

const productItem = appVersionType === AppVersionType.CN ? [
  {
    title: $t("global-1688-ai-app.seller-center.home.Layout.Footer.APIservice", "API服务"),
    path: '/seller-center/home/api-list',
  },
  {
    title: $t("global-1688-ai-app.seller-center.home.Layout.Footer.MCPservice", "MCP服务"),
    path: '/seller-center/home/mcp-list',
  },
] : [];
const isGlobal = appVersionType === AppVersionType.GLOBAL;

interface LandingPageProps {
  id?: string;
}

const MENU_LIST = [
  {
    title: $t("global-1688-ai-app.seller-center.home.Layout.Footer.cp", "产品"),
    items: [
      ...productItem,
      {
        title: $t("global-1688-ai-app.seller-center.home.Layout.Footer.xpAgent", "选品Agent"),
        path: '/insight',
      },
      {
        title: $t("global-1688-ai-app.seller-center.home.Layout.Footer.xpAgent.2", "询盘Agent"),
        path: '/inquiry',
      },
      {
        title: $t("global-1688-ai-app.seller-center.home.Layout.Footer.1ye", "1688寻源找商Agent"),
        path: '/sourcing',
      },
      {
        title: $t("global-1688-ai-app.seller-center.home.Layout.Footer.Aht", "AI素材优化Agent"),
        path: '/design',
      },
    ],
  },

  {
    title: $t("global-1688-ai-app.seller-center.home.Layout.Footer.support", "支持"),
    items: [
      {
        title: $t("global-1688-ai-app.seller-center.home.Layout.Footer.document", "文档"),
        path: 'https://alidocs.dingtalk.com/i/nodes/KGZLxjv9VGkoG9YwH0Py1kezV6EDybno?corpId=dingd8e1123006514592&utm_medium=im_card&iframeQuery=utm_medium%3Dim_card%26utm_source%3Dim&utm_scene=team_space&utm_source=im',
        type: 'link',
      },
      {
        title: $t("global-1688-ai-app.seller-center.home.Layout.Footer.contactwm", "联系我们"),
        path: '/seller-center/home/contact-list',
        type: 'qrcode',
      },
    ],
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ id }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigateWithScroll();
  const style = isGlobal ? { fontFamily: 'Poppins' } : {};
  const handleMenuItemClick = (item: any) => {
    if (item.type === 'link') {
      window.open(item.path, '_blank');
    } else if (item.type === 'qrcode') {
      setIsModalOpen(true);
    } else {
      navigate(item.path);
    }
  };
  return (
    <div id={id} className={styles.container}>
      <div className={styles.mobileFooterBackground}>
        <img src="https://img.alicdn.com/imgextra/i2/O1CN01bNC7zC1Rx7KMTUzhA_!!6000000002177-2-tps-1517-300.png" className={styles.mobileFooterBackgroundImage} />
      </div>
      <div className={styles.content}>
        <div className={styles.brandSection}>
          <img
            className={isGlobal ? styles.globalLogo : styles.logo}
            src={
              isGlobal ? "https://img.alicdn.com/imgextra/i4/O1CN01VCiBGo1ZZm5XuzybT_!!6000000003209-2-tps-527-72.png" : "https://img.alicdn.com/imgextra/i2/O1CN01YMqWtU1rp2MZYSQSH_!!6000000005679-2-tps-528-144.png"
            }
            alt={$t("global-1688-ai-app.seller-center.home.Layout.Footer.axlogo", "遨虾logo")}
          />
          <span className={styles.description} style={style}>
            {$t("global-1688-ai-app.seller-center.home.Layout.Footer.wdyjsqytz", "为跨境电商打造的AI引擎，通过先进的AI技术帮助企业突破语言文化壁垒，提升全球竞争力。")}</span>
        </div>

        {MENU_LIST.map((item) => (
          <div className={styles.navigation}>
            <span className={styles.navItem} style={style}>{item.title}</span>
            <div className={styles.productMenu}>
              {item.items.map((item) => (
                <span className={styles.menuItem} style={style} onClick={() => handleMenuItemClick(item)}>{item.title}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.mobileFooterMenu}>
        <span onClick={() => handleScrollToTop()}>{$t("global-1688-ai-app.seller-center.home.Layout.Footer.jrsymd", "加入试用名单")}</span>
        <span onClick={() => window.open('https://alidocs.dingtalk.com/i/nodes/KGZLxjv9VGkoG9YwH0Py1kezV6EDybno?corpId=dingd8e1123006514592&utm_medium=im_card&iframeQuery=utm_medium%3Dim_card%26utm_source%3Dim&utm_scene=team_space&utm_source=im', '_blank')}>{$t("global-1688-ai-app.seller-center.home.Layout.Footer.jsdocument", "技术文档")}</span>
        <span onClick={() => setIsModalOpen(true)}>{$t("global-1688-ai-app.seller-center.home.Layout.Footer.contactwm", "联系我们")}</span>
      </div>
      <div className={styles.mobileCopyright}>
        <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank">{$t("global-1688-ai-app.seller-center.home.Layout.Footer.z300", "浙公网安备 33010002000121号")}</a>
        <div>
          <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">{$t("global-1688-ai-app.seller-center.home.Layout.Footer.z11", "ICP备2026014275号-1")}</a>
          &nbsp;
          <a href="https://terms.alicdn.com/legal-agreement/terms/privacy/20221101140343728/20221101140343728.html" target="_blank">{$t("global-1688-ai-app.seller-center.home.Layout.Footer.snadw", "算法备案信息：点击查看")}</a>
        </div>
      </div>
      <Copyright />
      {/* <div className={styles.copyright}>
        <div className={styles.copyrightImage}>
          <img src="https://img.alicdn.com/imgextra/i4/O1CN010Mk3Bf1SVT2tX3uft_!!6000000002252-2-tps-583-40.png" />
        </div>
        <div className={styles.copyrightText}>
          <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank">{$t("global-1688-ai-app.seller-center.home.Layout.Footer.z300", "浙公网安备 33010002000121号")}</a>
          <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">{$t("global-1688-ai-app.seller-center.home.Layout.Footer.z11", "ICP备2026014275号-1")}</a>
          <a href="https://terms.alicdn.com/legal-agreement/terms/privacy/20221101140343728/20221101140343728.html" target="_blank">{$t("global-1688-ai-app.seller-center.home.Layout.Footer.snadw", "算法备案信息：点击查看")}</a>
        </div>
      </div> */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={false}
        closable={false}
        title={null}
        centered
        width={474}
        styles={{
          content: {
            background: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <ContactService onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div >
  );
};

export default LandingPage;
