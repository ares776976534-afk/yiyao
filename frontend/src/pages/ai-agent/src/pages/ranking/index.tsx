import styles from './index.module.css';
import Header from './components/Header';
import RankingTabs from './components/RankingTabs';
import MenuNavigation from './components/MenuNavigation';
import OpportunityCard from './components/OpportunityCard';
import CommodityCard from './components/CommodityCard';
import { useState, useEffect, useRef } from 'react';
import type { listProps, rankingListProps, platformCountryMappingProps } from './interface';
import { queryList, queryProductCategoryList, queryOpportunityKeywordCategoryList } from './services';
import { message } from 'antd';
import { useSearchParams, definePageConfig } from 'ice';
import log from '@/utils/log';
import { LOG_KEYS } from '@/utils/logConfig';
import { getUserInfo } from '@/utils/login';
import { $t } from "@/i18n";

const tabsMap = {
  机会赛道榜: 'opportunity',
  全网商品榜: 'product',
}

export default () => {
  const [activeKey, setActiveKey] = useState('product');
  const [showBackTop, setShowBackTop] = useState(false);
  const [tabs, setTabs] = useState<{ key: string; label: string; tip: string }[]>([]);
  const [categoryData, setCategoryData] = useState<any>([]);
  const [platformCountryMapping, setPlatformCountryMapping] = useState<platformCountryMappingProps[]>([]);
  const [rankingList, setRankingList] = useState<rankingListProps[]>([]);
  const [list, setList] = useState<listProps[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const isFirstLoadRef = useRef(true);
  const [searchParams] = useSearchParams();
  const [cateLevel, setCateLevel] = useState<string>('');
  const [cateId, setCateId] = useState<string>('');
  const _activeKey = searchParams.get('activeKey');
  const [userInfo, setUserInfo] = useState<any>(null);
  const queryUserInfo = () => {
    getUserInfo().then((user) => {
      setUserInfo(user);
    });
  }
  // 禁用浏览器自动恢复滚动位置
  useEffect(() => {
    queryUserInfo();
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // 立即滚动到顶部
    window.scrollTo(0, 0);
    
    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    queryList({}).then((res) => {
      const { data, success, mesg = '系统异常' } = res;
      if (success) {
        setList(data);
        
        // 根据 URL 参数设置 activeKey，有效值为 product/opportunity，无值默认展示全网商品榜
        const validKeys = Object.values(tabsMap);
        const initialKey = _activeKey && validKeys.includes(_activeKey) ? _activeKey : 'product';
        setActiveKey(initialKey);
        
        setTabs(data?.map((item) => {
          const key = tabsMap[item?.listTitle];
          return { 
            key, 
            label: item?.listTitle, 
            tip: item?.hoverText,
          };
        }));
        
        // 根据 initialKey 找到对应的数据
        const currentData = data.find((item) => tabsMap[item?.listTitle] === initialKey) || data[0];
        setPlatformCountryMapping(currentData?.platformCountryMapping);
        setRankingList(currentData?.rankingList);
        
        // 数据加载完成后确保在顶部
        window.scrollTo(0, 0);
      } else {
        message.error(mesg)
      }
    })
  }, []); // 只在组件挂载时执行一次

  // 切换tab
  useEffect(() => {
    if (!list?.length) return;
    
    // 首次加载时跳过，因为数据已经在初始化时设置过了
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }
    
    // 更新新 tab 的数据（类目状态已在 handleClick 中清空，platform/country 保留以便触发类目接口）
    const _list = list?.find((item) => tabsMap[item?.listTitle] === activeKey)
    setPlatformCountryMapping(_list?.platformCountryMapping || []);
    setRankingList(_list?.rankingList || []);
    
    // 切换 tab 时滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeKey, list]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabExposedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!tabs.length || !activeKey) return;
    if (tabExposedRef.current.has(activeKey)) return;
    tabExposedRef.current.add(activeKey);
    const logKey = activeKey === 'opportunity'
      ? LOG_KEYS.RANKINGLIST.LIST_CLICK.OPPORTUNITY
      : LOG_KEYS.RANKINGLIST.LIST_CLICK.ALLITEM;
    log.record(logKey, 'EXP');
  }, [activeKey, tabs]);

  const handleClick = (key: string) => {
    if (key === activeKey) return;
    const logKey = key === 'opportunity'
      ? LOG_KEYS.RANKINGLIST.LIST_CLICK.OPPORTUNITY
      : LOG_KEYS.RANKINGLIST.LIST_CLICK.ALLITEM;
    log.record(logKey, 'CLK');
    setCateLevel('');
    setCateId('');
    setCategoryData([]);
    setActiveKey(key);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (level: string, id: string) => {
    setCateId(id);
    setCateLevel(level);
  };

  const handleSiteCountryChange = (platform: string, country: string) => {
    setSelectedPlatform(platform);
    setSelectedCountry(country);
  };
  // 切换 tab 或 站点/国家变化时，调用对应的类目接口
  useEffect(() => {
    if (!selectedPlatform || !selectedCountry) return;
    
    // 先清空类目数据，避免显示旧数据
    setCategoryData([]);
    
    if (activeKey === 'product') {
      // 全网商品榜类目检索
      queryProductCategoryList({
        platform: selectedPlatform,
        country: selectedCountry,
      }).then((res) => {
        const { data, success, mesg = $t('global-1688-ai-app.F0001', '系统异常') } = res;
        if (success) {
          setCategoryData(data?.categories || []);
        } else {
          message.error(mesg);
          setCategoryData([]);
        }
      }).catch((err) => {
        message.error(err?.errorMessage || $t('global-1688-ai-app.userinfo.exp.system_error', '请求失败，请稍后重试'));
        setCategoryData([]);
      });
    } else if (activeKey === 'opportunity') {
      // 机会赛道榜类目检索
      queryOpportunityKeywordCategoryList({
        platform: selectedPlatform,
        country: selectedCountry,
      }).then((res) => {
        const { data, success, mesg = $t('global-1688-ai-app.F0001', '系统异常') } = res;
        if (success) {
          setCategoryData(data?.categories || []);
        } else {
          message.error(mesg);
          setCategoryData([]);
        }
      }).catch((err) => {
        message.error(err?.errorMessage || $t('global-1688-ai-app.userinfo.exp.system_error', '请求失败，请稍后重试'));
        setCategoryData([]);
      });
    }
  }, [activeKey, selectedPlatform, selectedCountry]);
  return (
    <div className={styles.ranking}>
      <Header />
      <div className={styles.rankingContent}>
        <div className={styles.topBgContainer}>
          <img className={styles.topBg} src="https://img.alicdn.com/imgextra/i1/O1CN01pTA99y1rFlsVGCXJi_!!6000000005602-2-tps-3840-974.png" />
          <div className={styles.mainBodyContainer} />
          <div className={styles.topBgContent} />
        </div>
        <div className={styles.mainBody}>
          <img className={styles.titleImg} src="https://img.alicdn.com/imgextra/i2/O1CN01uwEIyE1TC3tMo31jT_!!6000000002345-2-tps-1014-432.png" alt="" srcSet="" />
          <div className={styles.mainBodyContent}>
            <RankingTabs tabs={tabs} activeKey={activeKey} handleClick={handleClick} />
            <div className={styles.menuNavigation}>
              <MenuNavigation 
                categoryData={categoryData} 
                platformCountryMapping={platformCountryMapping}
                onCategoryChange={handleCategoryChange}
                onSiteCountryChange={handleSiteCountryChange}
                activeKey={activeKey}
              />
              <div className={styles.menuNavigationRight}>
                {activeKey === 'opportunity' && (
                  <OpportunityCard 
                    key="opportunity"
                    rankingList={rankingList}
                    cateLevel={cateLevel}
                    cateId={cateId}
                    country={selectedCountry}
                    platform={selectedPlatform}
                    userInfo={userInfo}
                    queryUserInfo={queryUserInfo}
                  />
                )}
                {activeKey === 'product' && (
                  <CommodityCard 
                    key="product"
                    rankingList={rankingList}
                    cateLevel={cateLevel}
                    cateId={cateId}
                    country={selectedCountry}
                    platform={selectedPlatform}
                    userInfo={userInfo}
                    queryUserInfo={queryUserInfo}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showBackTop && (
        <img className={styles.backTop} onClick={scrollToTop} src="https://img.alicdn.com/imgextra/i2/O1CN01q9dvzn1UTkoDSnV34_!!6000000002519-2-tps-80-80.png" alt="" srcSet="" />
      )}
    </div>
  )
}

export const pageConfig = definePageConfig({
  title: '遨虾-选品热榜',
  spm: {
    spmB: 'rankinglist',
  },
});
