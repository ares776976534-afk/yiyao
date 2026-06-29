import styles from './index.module.css';
import Cards from '../Cards';
import { CustomChatInput } from '@/pages/select-product/general-agent/components/ReqComponent';
import { useNavigateWithScroll } from '@/hooks/useNavigateWithScroll';
import useChatQuery from '@/pages/select-product/hooks/useChatQuery';
import DemoList from '@/pages/agent-home/components/DemoList';
import { checkAuthAndLogin } from '@/utils/login';
import { $t } from '@/i18n';
import RankingTabs from '../RankingTabs';

type TypeChatboxLogKeys = {
  INSIGHT_CLICK?: string;
  INSIGHT_CHANNEL?: string;
  INSIGHT_COUNTRY?: string;
};

type TypeCardLogKeys = {
  IMG_SEARCH?: string;
  INSIGHT_NEW?: string;
  INSIGHT_IMPROVE?: string;
  INSIGHT_PLATFORM?: string;
  INSIGHT_COUNTRY?: string;
};

type TypeShowcaseLogKeys = {
  VIEW?: string;
  SAME?: string;
};

interface ContentProps {
  logKeys?: TypeChatboxLogKeys;
  cardLogKeys?: TypeCardLogKeys;
  showcaseLogKeys?: TypeShowcaseLogKeys;
}

export default ({ logKeys, cardLogKeys, showcaseLogKeys }: ContentProps = {}) => {
  const navigate = useNavigateWithScroll();
  const { navigateByCache } = useChatQuery();
  const cardItems = [
    {
      id: 'imagesearch',
      icon: 'https://gw.alicdn.com/imgextra/i3/O1CN01pMkcW329iJeDaqRfL_!!6000000008101-2-tps-32-32.png',
      description: $t('global-1688-ai-app.select-product.ImageSearchComponents.ImageSearchForm.uploadProductImage', '上传图片一键分析全球16个国家的相似款商品商机'),
      link: '/select-product/image-search-agent',
      key: $t('global-1688-ai-app.select-product.image-search-agent.title', '图搜全球商机'),
      title: $t('global-1688-ai-app.select-product.image-search-agent.title', '图搜全球商机'),
      isHot: true,
      logKey: cardLogKeys?.IMG_SEARCH,
    },
    {
      id: 'opportunity',
      icon: 'https://img.alicdn.com/imgextra/i2/6000000005509/O1CN012aFAZd1qZB1i2cGYY_!!6000000005509-2-gg_dtc.png',
      title: $t("global-1688-ai-app.select-product.home.Content.nrj", "新品机会分析"),
      description: $t("global-1688-ai-app.select-product.home.Content.jzkjucdei", "基于Amazon、TikTok亿级商品，秒级对比百款新品"),
      link: '/select-product',
      key: $t("global-1688-ai-app.select-product.home.Content.xaa", "选品新品"),
      isHot: true,
      logKey: cardLogKeys?.INSIGHT_NEW,
    },
    {
      id: 'improvement',
      icon: 'https://img.alicdn.com/imgextra/i3/6000000004007/O1CN01mYfYII1fTG8TSRFiW_!!6000000004007-2-gg_dtc.png',
      title: $t("global-1688-ai-app.select-product.home.Content.bpgjjhfx", "爆品改进机会发现"),
      description: $t("global-1688-ai-app.select-product.home.Content.Axvnua", "AI精准分析海量评价、智能输出解决方案"),
      link: '/select-product/improve-agent',
      key: $t("global-1688-ai-app.select-product.home.Content.xpgj", "选品改进"),
      logKey: cardLogKeys?.INSIGHT_IMPROVE,
    },
    {
      id: 'platform-migration',
      icon: 'https://img.alicdn.com/imgextra/i3/6000000001083/O1CN01jWV4O71Js42VVr9wD_!!6000000001083-2-gg_dtc.png',
      title: $t("global-1688-ai-app.select-product.home.Content.ptjqyjhfx", "平台间迁移机会发现"),
      description: $t("global-1688-ai-app.select-product.home.Content.uekuulw", "动态识别同款商品在多平台流向 ，提早把握机会"),
      link: '/select-product/platform-agent',
      key: $t("global-1688-ai-app.select-product.home.Content.xppt", "选品平台"),
      logKey: cardLogKeys?.INSIGHT_PLATFORM,
    },
    {
      id: 'country-migration',
      icon: 'https://img.alicdn.com/imgextra/i2/6000000004083/O1CN01pYVayo1g24EjhMX3w_!!6000000004083-2-gg_dtc.png',
      title: $t("global-1688-ai-app.select-product.home.Content.gjjqyjhfx", "国家间迁移机会发现"),
      description: $t("global-1688-ai-app.select-product.home.Content.drtNc", "洞悉全球商品流动，抢占新兴市场"),
      link: '/select-product/country-agent',
      key: $t("global-1688-ai-app.select-product.home.Content.xpgj.2", "选品国家"),
      logKey: cardLogKeys?.INSIGHT_COUNTRY,
    },
  ];

  const handleSubmit = async (data: any) => {
    checkAuthAndLogin({
      onSuccess: () => {
        navigateByCache({ chatInput: data, url: '/select-product/general-agent' });
      },
    })
      .then((loginSuccess) => {
        if (loginSuccess) {
          navigateByCache({ chatInput: data, url: '/select-product/general-agent' });
        }
      });
  };

  const handleCardClick = (id: string) => {
    const link = cardItems.find((card) => card.id === id)?.link || '';
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className={styles.selectProduct}>
      <CustomChatInput
        onSubmit={handleSubmit}
        logKeys={logKeys}
      />
      <RankingTabs />
      <Cards
        containerStyle={{ width: '1003px', transform: 'translateX(-101px)' }}
        cards={cardItems}
        onCardClick={handleCardClick}
      />
      <div className={styles.demoList}>
        <DemoList scene="FIND_PRODUCT" showcaseLogKeys={showcaseLogKeys} />
      </div>
    </div>
  );
};