import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, Input, Form, Button, Radio, Checkbox, Field, Message, Icon, Balloon } from '@alifd/next';
import './index.scss';
import { CountDown } from '@/pages/ProductsBidding/components/CountDown';
import { BidStatus, StatusTextMap } from '@/pages/ProductsBidding/enums';
import {
  submitOppSku,
  modifyOppSku,
  querySellerType,
  submitShopEnrollInfo,
  logisiticsAgreement,
} from '@/pages/ProductsBidding/api';
import { sendLogger } from '@/pages/ProductsBidding/utils';

const RadioGroup = Radio.Group;
const formNameItemLayout = {
  labelCol: { fixedSpan: 4 },
  wrapperCol: { span: 22 },
};

const SubmitBusinessDialog = (props) => {
  const { visible, setVisible, biddingEditData, operationType, getData, updateParentState } = props;
  const [updatedData, setUpdatedData] = useState([]); // 更新后的数据
  const [disable, setDisable] = useState(true);
  const field = Field.useField();
  const [checkboxChecked, setCheckboxChecked] = useState(false); // 协议checked
  const [successOpen, setSuccessOpen] = useState(false); // 成功提示弹窗
  const [failureOpen, setFailureOpen] = useState(false); // 失败提示弹窗
  const [failureReason, setFailureReason] = useState(''); // 失败原因
  // const [isCustomStock, setIsCustomStock] = useState(false); // 本期不需要
  const [globalState, setGlobalState] = useState({
    stock: '',
    price: '',
  });
  // const [stockValue, setStockValue] = useState('');// 本期不需要
  const [sellerTypeData, setSellerTypeData] = useState(null);
  const performanceMethod = updatedData?.sale_type || updatedData?.parsedOppMsg?.sale_type; // 履约方式
  const goalPriceInYuan = Number(updatedData?.goal_price || updatedData?.parsedOppMsg?.goal_price) / 100; // 商机下发价格
  const targetCounts = Number(updatedData?.target_product_counts || updatedData?.parsedOppMsg?.target_product_counts); // 商机下发库存
  const PriceInYuan = Number(updatedData?.price) / 100; // 上次提报价格
  const targetProductCounts = Number(updatedData?.stock); // 上次提报库存
  const hasImage = !!updatedData?.parsedOppMsg?.img_url || !!updatedData?.img_url; // 是否有图片
  const endTimestamp = updatedData?.strategy_end_time / 1000;
  const isSubmit = operationType === 'submit';
  const isModify = operationType === 'modify';

  // 合并原始数据和解析后的oppMsg
  const mergeOppMsg = useCallback(() => {
    if (biddingEditData?.oppMsg) {
      const parsedOppMsg = JSON.parse(biddingEditData.oppMsg);
      return { ...biddingEditData, parsedOppMsg };
    } else {
      return biddingEditData;
    }
  }, [biddingEditData]);

  const validatePrice = async (rule, value) => {
    try {
      if (!value) {
        throw new Error('提报价格不能为空');
      }
      if (Number(value) <= 0) {
        throw new Error('提报价格不能为0');
      }
      if (Number(value) > 999999) {
        throw new Error('提报价格不能超过999999');
      }
      const numericWithDecimalRegex = /^\d+(\.\d{1,2})?$/;
      if (!numericWithDecimalRegex.test(Number(value))) {
        throw new Error('提报价格必须是数字，且最多输入小数点后两位');
      }
      if (Number(value) > goalPriceInYuan) {
        throw new Error(`提报价格不可高于¥${goalPriceInYuan?.toFixed(2)}`);
      }
      if (Number(value) > PriceInYuan) {
        throw new Error(`价格不可高于上次提报价格¥${PriceInYuan?.toFixed(2)}`);
      }
      setGlobalState((prevState) => ({ ...prevState, price: Number(value) }));
      return Promise.resolve();
    } catch (error) {
      setDisable(true);
      throw error;
    }
  };

  const validateAgreement = async (rule, value) => {
    if (!value) {
      return Promise.reject(new Error('请阅读并同意协议'));
    }
    return Promise.resolve();
  };

  const checkIfUnchanged = () => {
    const { stock, price } = globalState;
    const isStockUnchanged = stock === targetProductCounts || stock === targetCounts;
    const isPriceUnchanged = isModify ? price === PriceInYuan || price === goalPriceInYuan : price === PriceInYuan;
    const isBothUnchanged = isStockUnchanged && isPriceUnchanged;
    if (isBothUnchanged) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  };

  const handleCloseModal = () => {
    setVisible(false);
    // setIsCustomStock(false);// 本期不需要
    field.setValue('stock', '-1');
  };

  const successMessage = (type) => ({
    title: `${type === 'submit' ? '提报成功！' : '修改提报成功！'}`,
    duration: 3000,
    content: '您已成功提报，请关注其他商机，欢迎继续提报',
  });

  const getButtonTitle = () => {
    return isModify ? '修改提报' : '确认提报';
  };

  const getTitle = () => {
    return isModify ? '修改提报' : '商机提报';
  };

  const CustomFooter = () => (
    <div className="submit-bcproducts-footer-content">
      <Form.Submit
        validate
        type="primary"
        className="submit-bcproducts-footer-button"
        onClick={handleSubmit}
        disabled={disable}
      >
        {getButtonTitle()}
      </Form.Submit>
      <Button onClick={handleCloseModal}>取消</Button>
    </div>
  );

  // 提报库存
  const renderStockInput = () => {
    // const handleInputChange = (e) => {
    //   field.setValue('stock', e);
    // };
    return (
      <Form.Item label="提报库存:" name="stock" className="submit-bcproducts-form-radio">
        <RadioGroup name="stockType" defaultValue="不限库存">
          <Radio
            value="不限库存"
            defaultChecked
          // onClick={() => setIsCustomStock(false)}// 本期不需要
          >
            不限库存
          </Radio>
          {/* <Radio value="自定义库存" onClick={() => setIsCustomStock(true)}>
              自定义库存
            </Radio> */}
        </RadioGroup>
        {/* {isCustomStock && (
            <Form.Item validator={validateStock}>
              <Input placeholder="请输入库存" className="submit-bcproducts-form-price" onChange={handleInputChange} />
              <span style={{ color: '#FF7300' }}>请填写1个月内能保证的真实库存</span>
            </Form.Item>
          )} */}
      </Form.Item>
    );
  };

  const getStatusValue = (reportResults) => {
    const statusValue = Object.keys(BidStatus).find((key) => BidStatus[key] === reportResults);
    return StatusTextMap[statusValue];
  };

  const prepareSubmitData = (values) => {
    const biddingEditDataCopy = { ...biddingEditData };
    if ('jingjia_type' in biddingEditDataCopy) {
      biddingEditDataCopy.jingjia_type = '跨境工作台-大客'; // 如果存在，替换 jingjia_type 的值
    } else {
      biddingEditDataCopy.jingjia_type = '跨境工作台-大客'; // 如果不存在，新增 jingjia_type 字段
    }
    // 兼容处理价格 100 倍问题 @跳凯
    // try {
    //   biddingEditDataCopy.goal_price = biddingEditDataCopy.goal_price;
    // } catch (e) {}
    const oppMsg = JSON.stringify(biddingEditDataCopy);
    const flooredPrice = Math.round(parseFloat(values?.price) * 100);
    return { price: flooredPrice, oppMsg, stock: values?.stock };
  };

  const prepareModifyData = (id, values) => {
    const flooredPrice = Math.round(parseFloat(values?.price) * 100);
    if (performanceMethod !== '商家发货') {
      return { id, price: flooredPrice, stock: -1 };
    } else {
      return { id, price: flooredPrice, stock: values?.stock || -1 };
    }
  };

  // 查询协议是否签署
  const fetchSellerType = async () => {
    try {
      const sellerTypeRes = await querySellerType(659523);
      const type = `${sellerTypeRes?.data?.data}`;
      const isSellerTypeFalse = Boolean(type === 'false');
      setCheckboxChecked(!isSellerTypeFalse);
      setSellerTypeData(sellerTypeRes?.data?.data);
    } catch (error) {
      setCheckboxChecked(false); // 默认情况下，如果查询失败，设置为 false
      setSellerTypeData(false);
    }
  };

  useEffect(() => {
    fetchSellerType();
  }, []);

  const handleSubmit = async () => {
    try {
      await field.validate(async (errors, values) => {
        if (!errors) {
          if (sellerTypeData === false) {
            const [enrollInfoRes1, enrollInfoRes2, enrollInfoRes3] = await Promise.all([
              submitShopEnrollInfo(659523),
              submitShopEnrollInfo(5117313),
              logisiticsAgreement(),
            ]);
            // 检查协议是否签署成功
            if (!enrollInfoRes1?.data?.data || !enrollInfoRes2?.data?.data || !enrollInfoRes3?.data?.success) {
              setVisible(false);
              setFailureOpen(true);
              setFailureReason('协议签署失败！');
              return;
            } else {
              fetchSellerType();
            }
          }
          const submitFunction = isSubmit ? submitOppSku : modifyOppSku;
          try {
            const res = await submitFunction(
              isSubmit ? prepareSubmitData(values) : prepareModifyData(biddingEditData?.id, values),
            );
            if (res && res?.data) {
              setVisible(false);
              // 判断是否勾选下次不再提醒
              const handleSuccessNotification = (checked) => {
                checked ? Message.success(successMessage(operationType)) : setSuccessOpen(true);
              };
              if (isSubmit) {
                const submitChecked = localStorage.getItem('submitChecked');
                handleSuccessNotification(submitChecked);
              } else {
                const modifyChecked = localStorage.getItem('modifyChecked');
                handleSuccessNotification(modifyChecked);
              }
              getData();
            }
          } catch (error) {
            setVisible(false);
            setFailureOpen(true);
            setFailureReason(error?.errorMessage || '提报失败！');
          }
        } else {
          console.error('表单验证错误');
        }
      });
    } catch (errors) {
      console.error('Validation errors:', errors);
    }
    sendLogger('submit');
  };

  useEffect(() => {
    checkIfUnchanged();
  }, [globalState]);

  // 设置初始值和禁用状态
  useEffect(() => {
    setUpdatedData(mergeOppMsg());
    if (isModify) {
      field.setValue('price', (mergeOppMsg()?.price / 100)?.toFixed(2));
    }
    if (visible) {
      setDisable(true);
      // getAddress();// 本期不需要
    }
    field.setValue('stock', mergeOppMsg()?.target_product_counts || mergeOppMsg()?.stock);
  }, [visible, operationType, field]);

  useEffect(() => {
    setGlobalState({
      stock: targetProductCounts || targetCounts,
      price: goalPriceInYuan || PriceInYuan,
    });
  }, [updatedData, targetProductCounts, targetCounts, goalPriceInYuan, PriceInYuan]);

  useEffect(() => {
    updateParentState({ failureOpen, setFailureOpen, failureReason, successOpen, setSuccessOpen });
  }, [failureOpen, failureReason, successOpen]);

  return (
    <Dialog
      visible={visible}
      title={getTitle()}
      footer={false}
      onClose={handleCloseModal}
      className="submit-bcproducts-modal"
    >
      <div className="bcproducts-bidding-modal-container">
        {/* 商机需求 */}
        <div className="bcproducts-business-top">
          <div className="bcproducts-business-describe-color">
            <span className="bcproducts-card-tag">大客爆品</span>
            商机需求
          </div>
          {isSubmit && (
            <div className="bcproducts-card-rest-time">
              <CountDown endTime={endTimestamp} />
            </div>
          )}
        </div>
        <div className="bcproducts-business">
          {hasImage && (
            <img
              src={updatedData?.parsedOppMsg?.img_url || updatedData?.img_url}
              alt="img"
              className="bcproducts-business-img"
            />
          )}
          <div className="bcproducts-card-describe-content">
            <div className="bcproducts-card-describe-title">
              <div className="bcproducts-card-describe-bottom">预计采购量：</div>
              <span className="bcproducts-business-describe-color">
                {updatedData?.target_product_counts || updatedData?.parsedOppMsg?.target_product_counts}
              </span>
            </div>
            <div className="bcproducts-card-describe-title">
              <div className="bcproducts-card-describe-bottom">竞价不高于：</div>
              <span className="bcproducts-business-describe-color">¥{goalPriceInYuan?.toFixed(2)}</span>
            </div>
            <div className="bcproducts-card-describe-title">
              <div>履约方式：</div>
              <span className="bcproducts-business-describe-color">平台发货</span>
            </div>
          </div>
        </div>
        {/* 命中商品 */}
        <div className="bcproducts-business-top">
          <div className="bcproducts-business-describe-color">命中商品</div>
        </div>
        <div className="bcproducts-business">
          <img src={updatedData?.imgUrl || updatedData?.sku_img} alt="" className="bcproducts-business-img-1" />
          <div className="bcproducts-business-describe">
            <div className="bcproducts-business-describe-color">{updatedData?.itemName || updatedData?.item_name}</div>
            <div>ID：{updatedData?.itemId || updatedData?.item_id}</div>
            <div style={{ display: 'flex' }}>
              SKU信息：
              <div className="bcproducts-business-describe-color">{updatedData?.skuName || updatedData?.sku_name}</div>
            </div>
          </div>
        </div>
        {/* 提报信息 */}
        <div className="bcproducts-business-top">
          <div className="bcproducts-business-describe-color">填写提报信息</div>
        </div>
        <Form field={field} className="submit-bcproducts-form" {...formNameItemLayout}>
          <div className="submit-bcproducts-form-input-box">
            <div style={{ backgroundColor: '#f8f8f8', padding: '9px 0 0 0 ' }}>
              {isModify && (
                <Form.Item label="提报结果:" name="reportResults" className="submit-bcproducts-form-input1">
                  <div>{getStatusValue(updatedData?.status)}</div>
                </Form.Item>
              )}
              <div className="submit-bcproducts-form-box">
                <Form.Item
                  label="提报价格:"
                  name="price"
                  validator={validatePrice}
                  className="submit-bcproducts-form-input"
                >
                  <Input label="¥" className="submit-bcproducts-form-price" placeholder="请输入价格" />
                  <span className="submit-bcproducts-box-tips">
                    填入较低的价格（不含运费），有利于提高竞价成功率，请勿恶意竞价！
                  </span>
                </Form.Item>
              </div>
              {renderStockInput()}
            </div>
          </div>
          <div className="submit-bcproducts-footerBox">
            <Form.Item name="agreement" validator={validateAgreement} style={{ marginTop: '16px' }}>
              <Checkbox
                name="baseAgreement"
                className="submit-bcproducts-form-agreement"
                defaultChecked={checkboxChecked}
                disabled={checkboxChecked}
              >
                <div style={{ color: '#333', fontSize: '13px' }}>
                  我同意开通
                  <a
                    href="https://work.1688.com/?spm=a2638g.u_7_1029.0.du_2_1017.7bb517683zRqcO&_path_=gonghuotuoguan/2017sellerbase_trade/
                    KJBFinancingApply"
                    rel="noreferrer"
                    target="_blank"
                    className="submit-bcproducts-a"
                  >
                    {' '}
                    跨境宝，
                  </a>
                  <a
                    href="https://terms.alicdn.com/legal-agreement/terms/b_platform_service_agreement/20231215171709856/20231215171709856.html"
                    rel="noreferrer"
                    target="_blank"
                    className="submit-bcproducts-a"
                  >
                    《1688跨境货通全球入驻协议》
                  </a>
                  <a
                    href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20231215164403513/20231215164403513.html"
                    rel="noreferrer"
                    target="_blank"
                    className="submit-bcproducts-a"
                  >
                    《中国商家个人信息跨境传输同意函》
                  </a>
                  <a
                    href="https://terms.alicdn.com/legal-agreement/terms/b_end_product_protocol/20240204160013754/20240204160013754.html"
                    rel="noreferrer"
                    target="_blank"
                    className="submit-bcproducts-a"
                  >
                    《1688全球精选入驻服务协议》
                  </a>
                  <a
                    href="https://render.alipay.com/p/yuyan/180020010001196791/preview.html?agreementId=AG00000051"
                    rel="noreferrer"
                    target="_blank"
                    className="submit-bcproducts-a"
                  >
                    《支付宝付款授权服务协议》
                  </a>
                  ，知晓该商品站外渠道最多抽取5%的技术服务费
                </div>
              </Checkbox>
            </Form.Item>
            <Form.Item className="submit-bcproducts-form-footer">
              <CustomFooter />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Dialog>
  );
};

export default SubmitBusinessDialog;
