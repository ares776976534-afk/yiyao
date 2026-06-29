import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { message, Button, Radio } from 'antd';
import { getPermissionPackageList, postApiPay } from '../../../services';
import { useSearchParams } from 'ice';
import { checkAuthAndLogin } from '@/utils/login';
import styles from './index.module.scss';
import { $t } from '@/i18n';
import { MainBtn } from '@/components/ChatFlow/Btn';

interface OrderPageProps {
  id?: string;
}

interface Package {
  packageId: number;
  packageName: string;
  actualFee: number;
  pointValidDays: string;
  selected: boolean;
  totalPoint: number;
  packageResourceModelList: any
}

const OrderPage: React.FC<OrderPageProps> = ({ id }) => {
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('packageId');
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  // 修改为单选逻辑
  const handlePackageSelect = (packageId: number) => {
    if (selectedPackages.length) {
      if (selectedPackages.includes(packageId)) {
        setSelectedPackages([]);
      } else {
        setSelectedPackages([packageId]);
      }
    } else {
      setSelectedPackages([packageId]);
    }
    // const newSelectedPackages = selectedPackages.includes(packageId) ? selectedPackages?.filter(pkg => pkg !== packageId) : [...selectedPackages, packageId];
    // setSelectedPackages(newSelectedPackages);
  };

  const handleSelectAll = () => {
    const newSelectState = !isAllSelected;
    if (newSelectState) {
      setSelectedPackages(() => packages.map(pkg => pkg.packageId));
    } else {
      setSelectedPackages([]);
    }
  };

  const handleConfirmOrder = () => {
    if (selectedPackages.length === 0) {
      return;
    }
    if (!isAgreed) {
      message.warning($t("global-1688-ai-app.seller-center.home.api-list.api-pay.qtg", "请先阅读并同意产品订购协议"));
      return;
    }
    setLoading(true);
    postApiPay({
      packageId: selectedPackages[0],
    }).then((res) => {
      if (res.success) {
        window.open(`https://air.1688.com/app/ctf-page/payment-cashier-pc-air/cashier.html?alipayAction=single_trade_payment&fromType=make_order&orderId=${res.data}&userType=buyer&tradeType=50060`, '_self');
      } else {
        message.error(res.retMsg || $t("global-1688-ai-app.seller-center.home.api-list.api-pay.qshzs", "请稍后再试"));
      }
    }).finally(() => {
      setLoading(false);
    });
  };

  const totalPrice = selectedPackages.reduce((sum, pkg) => Number(sum) + Number(packages.find(p => p.packageId === pkg)?.actualFee), 0) || 0;

  useEffect(() => {
    getPermissionPackageList().then((res) => {
      if (res.success) {
        setPackages(res.data.filter((pkg: any) => !!pkg));
      }
    });
  }, []);

  useEffect(() => {
    if (packageId && !selectedPackages.includes(Number(packageId)) && packages.length > 0) {
      setPackages(packages.filter((pkg: any) => pkg.packageId === Number(packageId)));
      handlePackageSelect(Number(packageId));
    }
    const selectedCount = packages.filter(pkg => pkg?.selected).length;
    setIsAllSelected(selectedCount === packages.length && packages.length > 0);
  }, [packages]);
  const handleProtocol = () => {
    window.open('https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20251114191924932/20251114191924932.html', '_blank');
  };

  return (
    <Layout type="simple" layoutStyle={{ backgroundColor: '#F5F5F5' }} hiddenFooter>
      <div id={id} className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <span className={styles.title}>{$t("global-1688-ai-app.seller-center.home.api-list.api-pay.cjorder", "创建订单")}</span>
              <span className={styles.subtitle}>{$t("global-1688-ai-app.seller-center.home.api-list.api-pay.qcdnOImnat", "请选择您需要的套餐，确认订单信息后进行支付")}</span>
            </div>
            <img
              src="https://img.alicdn.com/imgextra/i2/6000000006599/O1CN011RRVWm1ycOjGElaxI_!!6000000006599-2-gg_dtc.png"
              className={styles.divider}
              alt=""
            />
          </div>

          <div className={styles.packagesSection}>
            {packages.map((pkg, index) => (
              <div key={pkg.packageId} className={styles.packageCard} onClick={() => handlePackageSelect(pkg.packageId)}>
                <div className={styles.packageContent}>
                  <div className={styles.packageHeader}>
                    <div className={styles.packageTitleSection}>
                      {selectedPackages.includes(pkg?.packageId) ? (
                        <img
                          src="https://img.alicdn.com/imgextra/i4/6000000000646/O1CN01x1rWT91GduwvyjM8z_!!6000000000646-2-gg_dtc.png"
                          className={styles.checkIcon}
                          alt=""
                          style={{ cursor: 'pointer' }}
                        />
                      ) : (
                        <div
                          className={styles.uncheckedBox}
                          style={{ cursor: 'pointer' }}
                        ></div>
                      )}
                      <span className={styles.packageTitle}>{pkg.packageName}</span>
                    </div>
                    <div className={styles.priceSection}>
                      <span className={styles.currency}>￥</span>
                      <span className={styles.price}>{Math.floor(pkg.actualFee)}</span>
                      <span className={styles.decimal}>.{(pkg.actualFee % 1).toFixed(2).slice(2)}</span>
                    </div>
                  </div>

                  <div className={styles.packageDetails}>
                    {
                      pkg.packageResourceModelList && pkg.packageResourceModelList.length > 0 && (
                        pkg.packageResourceModelList.map((item: any) => (
                          <div className={styles.detailRowBottom}>
                            <div className={styles.detailLabel}>
                              <span>{item.resourceName}</span>
                            </div>
                            <div className={styles.detailValue}>
                              <span>{item.resourceValue}</span>
                            </div>
                          </div>
                        ))
                      )
                    }
                    <div className={styles.detailRowBottom}>
                      <div className={styles.detailLabel}>
                        <span>{$t("global-1688-ai-app.seller-center.home.api-list.api-pay.validityPeriod", "有效期")}</span>
                      </div>
                      <div className={styles.detailValue}>
                        <span>{$t("global-1688-ai-app.seller-center.home.api-list.api-pay.day", `${pkg.pointValidDays}天`, [pkg.pointValidDays])}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottomSection}>
          {/* <div className={styles.noticeBar}>
            <div className={styles.noticeContent}>
              <img
                src="https://img.alicdn.com/imgextra/i3/6000000001601/O1CN01XVOxIg1NhJByRMLzA_!!6000000001601-2-gg_dtc.png"
                className={styles.noticeIcon}
                alt=""
              />
              <span className={styles.noticeText}>请在9月8日前（7天内）完成下单支付，否则链接将失效！</span>
            </div>
            <img
              src="https://img.alicdn.com/imgextra/i2/6000000000246/O1CN01nRHGIo1DgiWTnrdO1_!!6000000000246-2-gg_dtc.png"
              className={styles.closeIcon}
              alt=""
            />
          </div> */}

          <div className={styles.orderSummary}>
            {/* <div className={styles.selectAll} onClick={handleSelectAll} style={{ cursor: 'pointer' }}>
              {isAllSelected ? (
                <img
                  src="https://img.alicdn.com/imgextra/i4/6000000000646/O1CN01x1rWT91GduwvyjM8z_!!6000000000646-2-gg_dtc.png"
                  className={styles.checkIcon}
                  alt=""
                />
              ) : (
                <div className={styles.uncheckedBox}></div>
              )}
              <span className={styles.selectAllText}>全选</span>
            </div> */}
            <div className={styles.radioIcon}>
              <Radio 
                className={styles.customRadio}
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
              >
                <div className={styles.radioText}>{$t("global-1688-ai-app.seller-center.home.api-list.api-pay.yydbty", "已阅读并同意")}</div>
              </Radio>
              <div className={styles.radioTextSub} onClick={handleProtocol}>{$t("global-1688-ai-app.seller-center.home.api-list.api-pay.cpdgxy", "产品订购协议")}</div>
            </div>
            <div className={styles.orderSummaryContent}>
              <div className={styles.orderSummaryLeft}>
                <div className={styles.orderCount}>{$t("global-1688-ai-app.seller-center.home.api-list.api-pay.ggorder", `共${selectedPackages.length}个订单`, [selectedPackages.length])}</div>
                <div className={styles.totalSection}>
                  <span className={styles.totalLabel}>{$t("global-1688-ai-app.seller-center.home.api-list.api-pay.total", "总计")}</span>
                  <div className={styles.totalPrice}>
                    <span className={styles.totalCurrency}>￥</span>
                    <span className={styles.totalAmount}>{Math.floor(totalPrice)}</span>
                    <span className={styles.totalDecimal}>.{(totalPrice % 1).toFixed(2).slice(2)}</span>
                  </div>
                </div>
              </div>
              <MainBtn
                text={$t("global-1688-ai-app.seller-center.home.api-list.api-pay.confirmOrder", "确认订单")}
                handleBtn={handleConfirmOrder}
                style={{
                  width: 184,
                  height: 48,
                  padding: '14px 60px'
                }}
                other={{
                  disabled: !isAgreed || selectedPackages.length === 0,
                  loading: loading
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderPage;
