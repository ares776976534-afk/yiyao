import React, { useState, useEffect } from 'react';
import { definePageConfig } from 'ice';
import View from "@alife/channel-fe-materials-react-appear";
import Layout from '@/pages/select-product/components/Layout';
import { Button, message, Popover } from 'antd';
import StudioRoot from "@/components/studio/root";
import ApplyPage from '@/pages/claw/components/apply';
import ChatInterface from '@/pages/claw/components/ChatInterface';
import DeployProgressOverlay from '@/pages/claw/components/DeployProgressOverlay';
import createClaw from '@/services/claw/createClaw';
import getWhiteState from '@/services/claw/getWhiteState';
import aplus from "@/utils/log";
import type { TypeAlphaClawLandingProps } from './components/clawPageTypes';
import styles from './index.module.scss';

const ICON_START = 'https://img.alicdn.com/imgextra/i3/6000000006290/O1CN01FXMpNj1wKsNb540vr_!!6000000006290-2-gg_dtc.png';

export const AlphaClawLanding: React.FC<TypeAlphaClawLandingProps> = ({ id }) => {
  // 申请状态
  const [applyState, setApplyState] = useState('');
  // 当前页面类型：home 首页，apply 申请体验
  const [pageType, setPageType] = useState('home');
  const [isInit, setIsInit] = useState(false);

  // 部署进度遮罩：是否显示、接口是否已成功
  const [deployVisible, setDeployVisible] = useState(false);
  const [deployApiSuccess, setDeployApiSuccess] = useState(false);

  const handleDeployComplete = () => {
    setDeployVisible(false);
    setDeployApiSuccess(false);
  };

  const isPassed = applyState === 'done';
  const isReviewing = applyState === 'doing';

  // 点击申请体验，跳转至申请体验页面
  const handleApplyClick = () => {
    setPageType('apply');
    // 打点
    aplus.record('/alphashop.clawapply.apply', "CLK");
  };

  // 点击立即开始，初始化Claw工作空间
  const handleStartClick = async () => {
    setDeployVisible(true);

    try {
      await createClaw();
    } catch (e) {
      message.error(e?.message || '部署失败，请稍后重试');
    }

    handleDeployComplete();
  };

  useEffect(() => {
    // 设置用户的白名单状态
    getWhiteState().then((state) => {
      setApplyState(state);
    }).catch(() => { }).finally(() => setIsInit(true));
  }, []);

  if (!isInit) {
    return null;
  }

  return (
    <Layout showUserInfo={applyState !== 'done'}>
      <StudioRoot theme="light" className={styles.root}>
        {
          applyState === 'done' ? (
            <ChatInterface />
          ) : pageType === 'apply' ? (
            <ApplyPage
              onBack={async () => {
                // 重新请求一次白名单状态
                try {
                  const state = await getWhiteState();
                  setApplyState(state);
                } catch (e) { }

                setPageType('home');
              }}
            />
          ) : (
            <>
              <DeployProgressOverlay
                visible={deployVisible}
                apiSuccess={deployApiSuccess}
                onComplete={handleDeployComplete}
                stages={[
                  { time: 5000, process: 30 },
                  { time: 10000, process: 70 },
                  { time: 10000, process: 90 },
                  { time: 20000, process: 99 },
                ]}
              />
              <div id={id} className={styles.container}>
                <div className={styles.contentWrapper}>
                  <section className={styles.heroSection}>
                    <div className={styles.heroLeft}>
                      <div className={styles.heroTextGroup}>
                        <h1 className={styles.heroTitle}>AlphaClaw：电商智能运营伙伴</h1>
                        <p className={styles.heroDesc}>
                          1688 官方推出，零门槛一键部署。只需绑定店铺账号，对话即可实现7x24小时电商生意自动化经营。限时开放若干个
                          <span className={styles.freeQuota}>免费名额</span>，点击立即申请！
                        </p>
                      </div>
                      <div className={styles.buttonGroup}>
                        {
                          isReviewing ? (
                            <Popover
                              trigger="click"
                              classNames={{
                                body: styles.applyPopoverRoot,
                              }}
                              content={
                                <View
                                  className={styles.applyPopoverContent}
                                  onFirstAppear={() => {
                                    aplus.record('/alphashop.clawapply.chatgroup', "EXP");
                                  }}
                                  onClick={() => {
                                    aplus.record('/alphashop.clawapply.chatgroup', "CLK");
                                  }}
                                >
                                  <img src="https://img.alicdn.com/imgextra/i4/O1CN01kiMSL71TCWJ9Ibnxq_!!6000000002346-2-tps-396-396.png" />
                                  <div>微信扫码加入</div>
                                </View>
                              }
                            >
                              <span
                                className={styles.applyBtn}
                              >
                                <img src="https://img.alicdn.com/imgextra/i4/O1CN01OwM9JK1p0zsaoxiuL_!!6000000005299-55-tps-16-16.svg" />
                                审核中，点击入群
                              </span>
                            </Popover>
                          ) : isPassed ? (
                            <Button
                              type="primary"
                              className={styles.primaryBtn}
                              onClick={handleStartClick}
                            >
                              <img
                                className={styles.btnIcon}
                                src={ICON_START}
                                alt=""
                              />
                              <span className={styles.primaryBtnText}>立即开始</span>
                              <span className={styles.badge}>
                                <span className={styles.badgeText}>限时免费</span>
                              </span>
                            </Button>
                          ) : (
                            <View
                              onFirstAppear={() => {
                                aplus.record('/alphashop.clawapply.apply', "EXP");
                              }}
                            >
                              <Button
                                type="primary"
                                className={styles.primaryBtn}
                                onClick={handleApplyClick}
                              >
                                <img
                                  className={styles.btnIcon}
                                  src={ICON_START}
                                  alt=""
                                />
                                <span className={styles.primaryBtnText}>申请体验</span>
                                <span className={styles.badge}>
                                  <span className={styles.badgeText}>限时免费</span>
                                </span>
                              </Button>
                            </View>
                          )
                        }

                        <View
                          onFirstAppear={() => {
                            aplus.record('/alphashop.clawapply.guide', "EXP");
                          }}
                        >
                          <Button className={styles.secondaryBtn} onClick={() => {
                            aplus.record('/alphashop.clawapply.guide', "CLK");
                            window.open('https://alidocs.dingtalk.com/i/nodes/oP0MALyR8kzGnoOwFQqbNwxdJ3bzYmDO', '_blank');
                          }}>
                            <img
                              className={styles.btnIcon}
                              src="https://img.alicdn.com/imgextra/i4/6000000004659/O1CN01rf6yjI1kHsOco97qo_!!6000000004659-2-gg_dtc.png"
                              alt=""
                            />
                            <span className={styles.secondaryBtnText}>使用指南</span>
                          </Button>
                        </View>
                      </div>
                    </div>
                    <img
                      className={styles.heroImage}
                      src="https://img.alicdn.com/imgextra/i3/O1CN01mJ8QeQ1f8BwYDiCSq_!!6000000003961-2-tps-780-584.png"
                      alt="AlphaClaw"
                    />
                  </section>

                  <section className={styles.featureSection}>
                    <h2 className={styles.featureTitle}>AlphaClaw的核心亮点</h2>
                    <div className={styles.featureList}>
                      <div className={styles.featureCard}>
                        <img
                          className={styles.cardIcon}
                          src="https://img.alicdn.com/imgextra/i4/O1CN019zeEWz1wJxaXIFNHv_!!6000000006288-55-tps-20-20.svg"
                          alt=""
                        />
                        <div className={styles.cardContent}>
                          <span className={styles.cardTitle}>电商专用</span>
                          <span className={styles.cardDesc}>
                            深度适配电商工作流全链路，打通1688、Ozon 等平台接口，最懂跨境的数字员工
                          </span>
                        </div>
                      </div>
                      <div className={styles.featureCard}>
                        <img
                          className={styles.cardIcon}
                          src="https://img.alicdn.com/imgextra/i1/O1CN01g08jfQ1mzxkm8O2yT_!!6000000005026-55-tps-20-20.svg"
                          alt=""
                        />
                        <div className={styles.cardContent}>
                          <span className={styles.cardTitle}>一键免费部署</span>
                          <span className={styles.cardDesc}>
                            无需技术背景，点击即刻完成云端初始化。限时免费认领，零成本开启智能经营
                          </span>
                        </div>
                      </div>
                      <div className={styles.featureCard}>
                        <img
                          className={styles.cardIcon}
                          src="https://img.alicdn.com/imgextra/i1/O1CN01WRbFtg1Q5F9mrlBsl_!!6000000001924-55-tps-16-16.svg"
                          alt=""
                        />
                        <div className={styles.cardContent}>
                          <span className={styles.cardTitle}>对话布置任务</span>
                          <span className={styles.cardDesc}>
                            像聊天一样指挥 AI 选品、上架、查库存、调价。7x24 小时在线，实时响应您的指令
                          </span>
                        </div>
                      </div>
                      <div className={styles.featureCard}>
                        <img
                          className={styles.cardIcon}
                          src="https://img.alicdn.com/imgextra/i4/O1CN01HRYpdN1JhzLnBpBne_!!6000000001061-55-tps-20-20.svg"
                          alt=""
                        />
                        <div className={styles.cardContent}>
                          <span className={styles.cardTitle}>内置精选技能</span>
                          <span className={styles.cardDesc}>
                            出厂自带选品、铺货、自动询盘等 50+ 验证有效的电商专用 Skill
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className={styles.supportPlatformSection}>
                    <label className={styles.supportPlatformTitle}>支持平台：</label>

                    <div className={styles.supportPlatformList}>
                      <div className={styles.supportPlatformItem}>
                        <img src="https://img.alicdn.com/imgextra/i1/O1CN017jidZ21L1Vqu5sN1S_!!6000000001239-55-tps-20-20.svg" alt="" />
                        <span>钉钉</span>
                      </div>

                      <div className={styles.supportPlatformItemDivider} />

                      <div className={styles.supportPlatformItem}>
                        <img src="https://img.alicdn.com/imgextra/i4/O1CN0109v12X1foKNhTk8cK_!!6000000004053-55-tps-20-20.svg" alt="" />
                        <span>飞书</span>
                      </div>

                      <div className={styles.supportPlatformItemDivider} />

                      <div className={styles.supportPlatformItem}>
                        <img src="https://img.alicdn.com/imgextra/i4/O1CN01yPJVvh1i4vyQ7CBns_!!6000000004360-55-tps-20-20.svg" alt="" />
                        <span>企业微信</span>
                      </div>

                      <div className={styles.supportPlatformItemDivider} />

                      <div className={styles.supportPlatformItem}>
                        <img src="https://img.alicdn.com/imgextra/i3/O1CN01iiW3061Yd9PDaFJ7S_!!6000000003081-55-tps-20-20.svg" alt="" />
                        <span>QQ</span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </>
          )
        }
      </StudioRoot>
    </Layout>
  );
};

export default AlphaClawLanding;

export const pageConfig = definePageConfig({
  title: 'Alphashop 电商智能运营伙伴',
  spm: {
    spmB: 'claw',
  },
});
