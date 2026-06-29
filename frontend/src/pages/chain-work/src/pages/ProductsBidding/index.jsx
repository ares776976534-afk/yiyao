import React, { useEffect, useState } from 'react';
import { Message, Slider, Loading } from '@alifd/next';
import { getBusinessList, getAeRelationMsg, getJdata } from '@/pages/ProductsBidding/api';
import { sendLogger, aeJingjiaType } from '@/pages/ProductsBidding/utils';
import BroadcastDialog from '@/pages/ProductsBidding/components/ToolTipDialog/BroadcastDialog';
import ProductsBiddingTab from '@/pages/ProductsBidding/components/ProductsBiddingTab/index';
import './index.scss';

function ProductsBidding() {
  const [dialogVisible, setDialogVisible] = useState(false); // 弹窗显隐
  const [successData, setSuccessData] = useState([]); // 提报成功列表数据存储
  const [cardLoading, setCardLoading] = useState(false); // 加载
  const [configurationData, setConfigurationData] = useState([]); // 规则和banner数据
  const [rulesloading, setRulesLoading] = useState(false); //
  const [aeBusinessData, setAeBusinessData] = useState([]); // AE待提报商机
  const [bcBusinessData, setBcBusinessData] = useState([]); // BC待提报商机
  const currentTime = Date.now();
  const EXPIRATION_SECONDS = 86400000; // 一天的毫秒数
  const [initialTab, setInitialTab] = useState(null);
  const [tabLoading, setTabLoading] = useState(false); // 加载

  const speakMessage = async (text) => {
    return new Promise((resolve) => {
      const message = new SpeechSynthesisUtterance(text);
      message.lang = 'zh-CN';
      message.onend = resolve;
      window.speechSynthesis.speak(message);
    });
  };

  // 检查提报成功的疲劳度过期时间
  const checkExpirationTime = () => {
    const storedExpiryTimestamp = localStorage.getItem('chainWorkSuccessExpiry');
    if (storedExpiryTimestamp) {
      if (currentTime < storedExpiryTimestamp) {
        // 过期时间未到，不需要调用接口
        return false;
      }
    }
    return true; // 过期时间不存在或已过期，需要调用接口
  };

  // 获取竞价成功的数据
  const getSuccessData = async () => {
    const shouldSkipCall = checkExpirationTime(); // 检查疲劳度
    if (shouldSkipCall) {
      try {
        setCardLoading(true);
        const res = await getAeRelationMsg();
        if (res?.data && res?.data?.total > 0) {
          setSuccessData(res?.data);
          // 显示弹框
          setDialogVisible(true);
          setCardLoading(false);
          // 设置疲劳度过期时间
          const expiryTimestamp = currentTime + EXPIRATION_SECONDS; // 24小时后过期
          localStorage.setItem('chainWorkSuccessExpiry', String(expiryTimestamp));
          // 第一段播报
          await speakMessage(`您的商品${res?.data?.data[0]?.itemName}参与竞价成功，请尽快备货，及时处理补货单`);
        }
      } catch (error) {
        Message.error(error?.errorMessage);
      }
    }
    sendLogger('search');
  };

  // 检查新的速卖通商机播报次数是否达到三次上限
  function checkBroadcastLimit() {
    // 获取上次播报的时间戳
    const lastBroadcastTimestampStr = localStorage.getItem('lastBroadcastTimestamp');
    const lastBroadcastTimestamp = parseInt(lastBroadcastTimestampStr, 10);

    // 如果超过24小时，重置播报次数
    if (currentTime >= lastBroadcastTimestamp) {
      localStorage.setItem('broadcastCount', '0');
      localStorage.removeItem('lastBroadcastTimestamp');
    }

    if (localStorage.getItem('broadcastCount') >= 3) {
      return false; // 达到上限，不再播报
    }
    return true; // 未达到上限，可以播报
  }

  // 获取速卖通待提报商机数据
  const getAEData = async () => {
    const canBroadcast = checkBroadcastLimit();
    try {
      const res = await getBusinessList({
        pageNum: 1,
        pageSize: 10,
        jingjiaType: aeJingjiaType,
      });
      if (res && res?.data) {
        setAeBusinessData(res);
        if (canBroadcast && res?.data?.length > 0) {
          let currentIndex = 0;
          while (currentIndex < res?.data?.length) {
            const item = res?.data[currentIndex];
            const now = new Date();
            // 检查策略是否过期或缺少必要字段
            const isExpiredOrInvalid =
              now > new Date(+item?.strategy_end_time) || !item?.goal_price || !item?.sku_name || !item?.item_name;
            // 如果是失效状态，跳过当前策略
            if (!isExpiredOrInvalid) {
              break;
            } else {
              currentIndex++;
            }
          }
          if (currentIndex < res?.data?.length) {
            const strategyDate = new Date(+res?.data[currentIndex]?.strategy_end_time);
            const strategyMonth = `${strategyDate.getMonth() + 1}`.slice(-2);
            const strategyDay = `${strategyDate.getDate()}`.slice(-2);
            // 更新播报次数和时间戳
            const currentBroadcastCount = parseInt(localStorage.getItem('broadcastCount'), 10) || 0;
            const expiryTimestamp = currentTime + EXPIRATION_SECONDS;
            localStorage.setItem('broadcastCount', String(currentBroadcastCount + 1));
            localStorage.setItem('lastBroadcastTimestamp', expiryTimestamp);
            // 等待第一段播报完成
            await getSuccessData();
            // 第二段播报
            speakMessage(`您有新的速卖通商机，请在${strategyMonth}月${strategyDay}日前提报！`);
          } else {
            console.warn('本页策略都已过期，找不到有效的策略');
          }
        } else {
          // 第一段播报
          await getSuccessData();
        }
        return res;
      }
      return res;
    } catch (error) {
      Message.error(error?.errorMessage);
    }
    sendLogger('searchData');
  };

  const getBCData = async () => {
    try {
      const res = await getBusinessList({
        pageNum: 1,
        pageSize: 10,
        jingjiaType: '跨境工作台-大客',
      });
      if (res && res?.data) {
        setBcBusinessData(res);
        return res;
      }
    } catch (error) {
      Message.error(error?.errorMessage);
    }
    sendLogger('searchData');
  };

  // 获取规则和banner
  const getConfigurationData = async () => {
    try {
      setRulesLoading(true);
      const res = await getJdata(3272001);
      if (res) {
        setConfigurationData(res);
        setRulesLoading(false);
      }
    } catch (error) {
      const errorMessage = error?.data?.errorInfo || error?.ret[0]?.split('::')[1] || '系统繁忙，请稍后再试。';
      Message.error(errorMessage);
      setRulesLoading(false);
    }
  };

  const rulesList = () => {
    if (rulesloading) {
      return <div>暂无数据</div>;
    }
    if (!configurationData.rules || configurationData.rules.length === 0) {
      return <div style={{ textAlign: 'center' }}>暂无规则</div>;
    }
    return (
      <>
        {configurationData?.rules?.map((item) => {
          const hasRules = !!item?.href;
          return (
            <div key={item?.text} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ marginRight: '10px' }}>
                {item?.text}
                {hasRules && (
                  <a href={item?.href} style={{ color: '#0077FF', cursor: 'pointer' }} rel="noreferrer" target="_blank">
                    点击查看详情
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const initializePageData = async () => {
    try {
      setTabLoading(true);
      const [bcPromise, aePromise] = await Promise.all([getBCData(), getAEData()]);
      // 处理请求结果
      handlePromisesResults(bcPromise, aePromise);
      setTabLoading(false);
    } catch (error) {
      setInitialTab('tab1');
      setTabLoading(false);
    }
  };

  const handlePromisesResults = (bcPromise, aePromise) => {
    const isEmptyAeData = aePromise?.total === 0;
    const isEmptyBcData = bcPromise?.total === 0;
    if (isEmptyAeData && !isEmptyBcData) {
      setInitialTab('tab2'); // 只有aeBusinessData有零数据，显示BigCustomerBusiness
    } else {
      setInitialTab('tab1'); // 其他情况下，显示AliExpressBusiness
    }
    // 默认显示第一个标签页
    if (!bcPromise || !aePromise) {
      setInitialTab('tab1');
    }
  };

  useEffect(() => {
    initializePageData();
    getConfigurationData();
  }, []);

  return (
    <div className="products-bidding">
      <div className="products-bidding-title">大客爆品竞价</div>
      <div className="products-bidding-banner">
        {configurationData?.banners && configurationData?.banners?.length > 0 ? (
          <div className="products-bidding-banner-content">
            <Slider autoplay autoplaySpeed={3000} dots={false}>
              {configurationData?.banners?.map((item, index) => {
                return item?.href?.length ? (
                  <a
                    key={index}
                    href={item?.href}
                    target="_blank"
                    className="banner-a"
                    rel="noreferrer"
                    data-channel-uni-logger-action-type={`CLK_Banner_Url_${item?.href}`}
                  >
                    <img src={item?.img} className="banner-img" />
                  </a>
                ) : (
                  <img src={item?.img} className="banner-img" />
                );
              })}
            </Slider>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }} className="banner-noData">
            暂无数据
          </div>
        )}
      </div>
      <div className="products-bidding-message">
        <img
          src="https://img.alicdn.com/imgextra/i4/O1CN01iqqGSl1wOXNSy9FV6_!!6000000006298-55-tps-16-16.svg"
          alt="icon"
          className="products-bidding-messageIcon"
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>{rulesList()}</div>
      </div>
      <Loading visible={tabLoading} style={{ width: '100%', height: '100%' }}>
        {initialTab && (
          <ProductsBiddingTab
            aeSuccessData={aeBusinessData}
            setAeBusinessData={setAeBusinessData}
            setBcBusinessData={setBcBusinessData}
            bcSuccessData={bcBusinessData}
            getBCData={getBCData}
            initialTab={initialTab}
            configurationData={configurationData}
          />
        )}
      </Loading>
      <BroadcastDialog
        visible={dialogVisible}
        setVisible={setDialogVisible}
        successData={successData}
        cardLoading={cardLoading}
      />
    </div>
  );
}

export default ProductsBidding;
