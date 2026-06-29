import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Message, Balloon, Icon, Input, Field, Radio, Button, Checkbox } from '@alifd/next';
import './index.scss';
import { CountDown } from '@/pages/ProductsBidding/components/CountDown';
import { dataList, tooltipList } from '@/pages/ProductsBidding/enums';
import {
  submitMultipleSku,
  modifyMultipleSku,
  submitShopEnrollInfo,
  logisiticsAgreement,
  getSendAddress,
  queryOtherSku,
} from '@/pages/ProductsBidding/api';
import ReportSkuDialog from '@/pages/ProductsBidding/components/AliExpressBusiness/ReportSkuDialog';
import ProgressiveImage from '@/components/ProgressiveImage';
import { sendLogger, defaultImg, aeJingjiaType } from '@/pages/ProductsBidding/utils';
import ShippingInfo from './ShippingInfo';
import ManufacturerInfo from './ManufacturerInfo';
import SkuCard from '@/pages/ProductsBidding/components/AliExpressBusiness/MyReportedContent/components/SkuCard';
import { MessageError } from '@/utlis';
import ManufacturerInfoCard from '@/pages/ManufacturerInfoCard';

const filedRowName = 'field_row';

export default (props) => {
  const {
    trigger,
    operationType,
    record,
    configurationData,
    updateParentState,
    sellerTypeChecked,
    setSellerTypeChecked,
    getData,
  } = props;
  const [open, setOpen] = useState(false);
  const [matchSku, setMatchSku] = useState({});
  const [checkboxChecked, setCheckboxChecked] = useState(sellerTypeChecked); // 协议checked
  const [sendAddress, setSendAddress] = useState('');
  const [successOpen, setSuccessOpen] = useState(false); // 成功提示弹窗
  const [failureOpen, setFailureOpen] = useState(false); // 失败提示弹窗
  const [failureReason, setFailureReason] = useState(''); // 失败原因
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitBtnDisabled, setSubmitBtnDisabled] = useState(true);
  const [showManufacturer, setShowManufacturer] = useState(true);
  const [isOnChange, setIsOnChange] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null); // sku总数
  const [unreportedSkuCount, setUnreportedSkuCount] = useState(0); // 未报名的sku数量
  const {
    id,
    match_item_id,
    sku_img,
    item_name,
    target_product_counts,
    endTime,
    status,
    sku_map_json,
    oppMsg,
    item_id,
  } = record;
  const isModify = operationType === 'modify';
  const isActive = status === 'active';
  const publishLink = `https://offer-new.1688.com/popular/publish.htm?id=${match_item_id}&operator=edit`;
  let hasUnmatchedOpportunity = false;

  const field = Field.useField({
    parseName: true,
    onChange: () => {
      setIsOnChange(() => {
        return {};
      });
    },
  });

  const validatorInput = () => {
    return new Promise((resolve) => {
      field.validate((errors, values) => {
        if (!errors) {
          resolve({ errors: null, values, result: true });
        } else {
          resolve({ errors, values, result: false });
        }
      });
    });
  };

  const checkedSubmtBtn = useCallback(() => {
    validatorInput().then(({ errors, values, result }) => {
      let unreportedCount;
      if (errors !== null) {
        const errorsCount = Object.keys(errors)?.filter((key) => key.startsWith('field_row')).length;
        unreportedCount = sku_map_json?.length - (values?.field_row?.length - errorsCount || 0);
      } else {
        unreportedCount = sku_map_json?.length - (values?.[filedRowName]?.length || 0);
      }
      setUnreportedSkuCount(unreportedCount);
      if (!result || !checkboxChecked || values?.[filedRowName]?.length !== sku_map_json?.length) {
        setSubmitBtnDisabled(true);
      } else {
        setSubmitBtnDisabled(false);
        setUnreportedSkuCount(0);
      }
    });
  }, [filedRowName, sku_map_json, checkboxChecked]);
  useEffect(() => {
    checkedSubmtBtn();
  }, [checkedSubmtBtn]);

  const { init } = field;

  const OpportunityItem = useCallback((_props) => {
    const { img_url, opp_title, target_product_counts: _target_product_counts, goal_price, property } = _props;
    return (
      <div className="opportunity-item-container">
        <div className="opportunity-title">
          <span>商机需求</span>
        </div>
        <div className="opportunity-info">
          <div className="opportunity-img">
            <ProgressiveImage className="small-img" src={img_url || defaultImg} />
            <img className="big-img" src={img_url || defaultImg} />
          </div>
          <div className="opportunity-content">
            <div className="title" title={opp_title}>
              {opp_title}
            </div>
            <div className="desc">
              <div>
                <span>预计采购量：</span>
                <span>{parseInt(_target_product_counts || 0)}</span>
              </div>
              <div>
                <span>竞价不高于：</span>
                <span>&yen;{goal_price}</span>
              </div>
            </div>
            <div className="sku-info">
              <span>sku信息：</span>
              <span>{property || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }, []);

  const SkuItem = useCallback(
    (_props) => {
      const { index, sku_id, sku_img: propSkuImg, sku_name } = _props;
      return (
        <div className="opportunity-item-container">
          <div className="opportunity-title">
            <span>我的SKU</span>
            {!isActive && (
              <ReportSkuDialog
                trigger={<span className="change-sku">修改SKU</span>}
                operationType="modify"
                defaultSkuValue={JSON.stringify({
                  sku_id,
                  sku_img: propSkuImg,
                  sku_name,
                })}
                matchSku={matchSku}
                publishLink={publishLink}
                skuOppInfo={sku_map_json[index]}
                {...record}
                handleChangeSKu={(_selectedSku) => handleChangeSKu(index, _selectedSku)}
              />
            )}
          </div>
          <div className="opportunity-info">
            <div className="opportunity-img">
              <ProgressiveImage className="small-img" src={propSkuImg} />
              <img className="big-img" src={propSkuImg} />
            </div>
            <div className="opportunity-content">
              <div className="title" title={item_name}>
                {item_name}
              </div>
              <div className="sku-info">
                <span>sku信息：</span>
                <span>{sku_name}</span>
              </div>
            </div>
          </div>
        </div>
      );
    },
    [matchSku],
  );

  const UnmatchOpportunity = useCallback(
    (_props) => {
      const { index } = _props;
      return (
        <div className="opportunity-item-container unmatch">
          <div className="opportunity-title">
            <span>请提报同款SKU</span>
            <Balloon.Tooltip
              v2
              arrowPointToCenter
              closable={false}
              trigger={<Icon type="help" size="small" />}
              align="b"
              className="bussiness-balloon"
            >
              如果目前没有同款SKU但您有此类商品， 请发布一个新的同款SKU后再做提报
            </Balloon.Tooltip>
          </div>
          <div className="opportunity-info">
            <div className="opportunity-img">
              <ProgressiveImage src={defaultImg} />
            </div>
            <div className="opportunity-content">
              <div className="content-item">
                <span>如果有同款SKU，请提报</span>
                <ReportSkuDialog
                  trigger={<Button>去提报</Button>}
                  matchSku={matchSku}
                  publishLink={publishLink}
                  skuOppInfo={sku_map_json[index]}
                  {...record}
                  handleChangeSKu={(_selectedSku) => handleChangeSKu(index, _selectedSku)}
                />
              </div>
              <div className="content-item">
                <span>如果没有同款SKU，请发布</span>
                <Button component="a" href={publishLink} target="blank">
                  去发布
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    },
    [matchSku],
  );

  const handleChangeSKu = (skuIndex, skuValue) => {
    const fieldIndex = `${filedRowName}.${skuIndex}`;
    setMatchSku((preState) => ({
      ...preState,
      [skuIndex]: skuValue,
    }));
    const prevValue = field.getValue(fieldIndex);
    field.resetToDefault(`${fieldIndex}.price`);
    field.setValue(fieldIndex, {
      ...prevValue,
      skuId: skuValue.sku_id,
      price: '',
    });
  };

  // 地址
  const getAddress = async () => {
    try {
      const sendAddressRes = await getSendAddress(match_item_id);
      if (sendAddressRes?.data) {
        setSendAddress(sendAddressRes?.data);
      }
    } catch (error) {
      console.error(error, '获取地址时发生错误');
    }
  };

  const handleOpen = () => {
    handleSetValue();
    getAddress();
    if (isModify) {
      sendLogger('modifyReporting');
      // sku_map_json.forEach((item, index) => {
      //   field.setValue(`${filedRowName}.${index}.price`, item.price);
      // });
    } else {
      sendLogger('submitReporting');
    }
    setOpen(true);
  };

  const handleClose = () => {
    handleClearValue();
    setOpen(false);
  };

  const handleSetValue = () => {
    const _matchSku = sku_map_json.reduce((accumulator, currentValue, index) => {
      const { sku_id, sku_img: img, sku_name } = currentValue;
      if (sku_id) {
        accumulator[index] = {
          sku_id,
          sku_img: img,
          sku_name,
        };
      }
      return accumulator;
    }, {});

    setMatchSku(_matchSku);
  };
  const handleClearValue = () => {
    setMatchSku({});
    field.setValue(`${filedRowName}`, []);
  };

  const priceValidator = (goalPrice, price, rule, value, callback) => {
    if (!value) {
      callback('提报价格不能为空');
    } else if (isNaN(value)) {
      callback('不是合法的数字');
    } else {
      const [, f] = value.split('.');
      const _value = Number(value);
      if (_value <= 0) {
        callback('请输入大于0的数字');
      } else if (f && f.length > 2) {
        callback('最多输入2位小数');
      } else if (isActive && _value > Number(price)) {
        callback(`价格不可高于上次提报价格¥${price}`);
      } else if (_value > Number(goalPrice)) {
        callback(`提报价格不可高于¥${goalPrice}`);
      } else {
        callback();
      }
    }
  };

  const showSuccessMessage = (title, getItemKey) => {
    const memoryPrompt = localStorage.getItem(getItemKey());
    const handleSuccessNotification = (checked) => {
      if (checked) {
        Message.success({
          title,
          duration: 3000,
          content: '您已成功提报，请关注其他商机，欢迎继续提报',
        });
        getData();
      } else {
        setSuccessOpen(true);
      }
    };
    handleSuccessNotification(memoryPrompt);
  };
  const showManufacturerInfo = (v) => {
    setShowManufacturer(v);
  };
  const handleSubmit = async () => {
    if (showManufacturer) {
      return MessageError('请先填写制造商信息');
    }
    setSubmitLoading(true);
    if (!sellerTypeChecked) {
      try {
        const [enrollInfoRes1, enrollInfoRes2, enrollInfoRes3] = await Promise.all([
          submitShopEnrollInfo(577987),
          submitShopEnrollInfo(5117313),
          logisiticsAgreement(),
        ]);
        setSubmitLoading(false);
        // 检查协议是否签署成功
        if (
          String(enrollInfoRes1?.data?.data) !== 'true' ||
          String(enrollInfoRes2?.data?.data) !== 'true' ||
          String(enrollInfoRes3?.data?.success) !== 'true'
        ) {
          handleClose();
          setFailureOpen(true);
          setFailureReason('协议签署失败！');
          return false;
        } else {
          setSellerTypeChecked(true);
        }
      } catch (error) {
        handleClose();
        setFailureOpen(true);
        setFailureReason('协议签署失败！');
        setSubmitLoading(false);
      }
    }

    setSubmitLoading(true);
    const submitFunction = isModify ? modifyMultipleSku : submitMultipleSku;
    const fieldValues = (field.getValue(filedRowName) || []).filter((item) => item);
    const params = {
      oppMsg,
      skuRecord: JSON.stringify(
        fieldValues.map((item, index) => {
          return {
            ...item,
            price: Math.round(parseFloat(item.price) * 100),
            skuOpp: {
              ...sku_map_json[index],
              sku_img: matchSku[index].sku_img,
              sku_name: matchSku[index].sku_name,
            },
          };
        }),
      ),
      jingjiaType: aeJingjiaType,
    };

    if (isModify) {
      params.id = id;
    }

    submitFunction(params)
      .then((res) => {
        if (isModify) {
          if (res?.data && res.data.success) {
            res.data.aeItemStatus && Message.success('修改已成功提交，请稍后查看修改结果');
            showSuccessMessage('修改提报成功！', () => 'modifyChecked');
          }
        } else if (res && res.data) {
          showSuccessMessage('提报成功！', () => 'submitChecked');
        }
      })
      .catch((error) => {
        setSubmitLoading(false);
        setFailureOpen(true);
        setFailureReason(error?.errorMessage || '提报失败！');
      })
      .finally(() => {
        setSubmitLoading(false);
        handleClose();
      });
  };

  const handleCheckAgreement = (value) => {
    setCheckboxChecked(value);
  };

  // 打开其他sku弹窗
  const openDialog = () => {
    setDialogVisible(true);
  };

  const getOtherSku = async () => {
    try {
      const skuRecord = JSON.stringify(
        field.getValue(filedRowName)?.map((item, index) => ({
          ...item,
          price: Math.round(parseFloat(item?.price) * 100),
          skuOpp: {
            ...sku_map_json[index],
            sku_img: matchSku[index].sku_img,
            sku_name: matchSku[index].sku_name,
          },
        })),
      );

      // 调用接口查询其他 SKU
      const res = await queryOtherSku({
        request: {
          itemId: record?.item_id,
          skuRecord,
        },
      });
      setSelectedRecord(res);
    } catch (error) {
      Message.error(error?.msg || '服务异常');
    }
  };

  useEffect(() => {
    const compareSkuAndCount = () => {
      const fieldValues = (field.getValue(filedRowName) || []).filter((item) => item);
      const fieldSkuIds = fieldValues?.map((item) => item.skuId);
      const selectedSkuIds = selectedRecord?.map((item) => item.skuId);

      const count = fieldSkuIds?.reduce((_count, skuId) => {
        return selectedSkuIds?.includes(skuId) ? _count : _count + 1;
      }, 0);
    };

    compareSkuAndCount();
  }, [field.getValues(), selectedRecord]);

  const closeDialog = () => {
    setDialogVisible(false);
  };

  useEffect(() => {
    updateParentState({ failureOpen, setFailureOpen, failureReason, successOpen, setSuccessOpen });
  }, [failureOpen, failureReason, successOpen]);

  useEffect(() => {
    if (open) {
      checkedSubmtBtn();
      getOtherSku(); // 查询其他SKU
    }
  }, [open, matchSku, checkboxChecked, isOnChange]);

  return (
    <div className="submit-aeproducts-modal-container">
      <div onClick={handleOpen}>{trigger}</div>
      {open && (
        <Drawer
          visible={open}
          width={835}
          title={isModify ? '修改提报' : '商机提报'}
          className="submit-aeproducts-modal"
          onClose={handleClose}
        >
          <div className="content">
            {configurationData && (
              <Message type="notice" className="message-prompt notice">
                <div>
                  <span>{configurationData?.modalNotice} </span>
                  <a href={configurationData?.modalNoticeLink} rel="noreferrer" target="_blank">
                    点击查看详情
                  </a>
                </div>
              </Message>
            )}
            <Message type="warning" className="message-prompt warning">
              承诺商品重量体积：重量不超2kg，单边不超60cm，三边加总不超90cm，否则速卖通仓库拒收
            </Message>
            <div className="offer-card">
              <div className="offer-image">
                <ProgressiveImage src={sku_img} />
              </div>
              <div className="offer-content">
                <div className="offer-header">
                  <div className="left-part">
                    <span className="offer-tag">速卖通爆品</span>
                    <span className="offer-title" title={item_name}>
                      {item_name}
                    </span>
                  </div>
                  {!isModify && endTime && (
                    <div className="aeproducts-card-rest-time">
                      <CountDown endTime={endTime / 1000} />
                    </div>
                  )}
                </div>
                <div className="offer-id">
                  <span>ID：</span>
                  <span>{match_item_id}</span>
                </div>
                <div className="offer-desc">
                  <div>
                    <span>预计采购量：</span>
                    <span>{parseInt(target_product_counts || 0)}</span>
                  </div>
                  {tooltipList?.map((ele, index) => (
                    <div key={index}>
                      <span>{ele.label}</span>
                      <span>{ele.value}</span>
                      <Balloon.Tooltip
                        v2
                        arrowPointToCenter
                        closable={false}
                        trigger={<Icon type="help" size="small" />}
                        align="t"
                        className="bussiness-balloon"
                      >
                        {ele.content}
                      </Balloon.Tooltip>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {sku_map_json &&
              sku_map_json.length !== 0 &&
              (() => {
                const items = sku_map_json.map((item, index) => {
                  const fieldRowSkuId = `${filedRowName}.${index}.skuId`;
                  const fieldRowPrice = `${filedRowName}.${index}.price`;
                  const fieldRowStock = `${filedRowName}.${index}.stock`;
                  const errorMsg = field.getError(fieldRowPrice)?.[0] || '';
                  const hasMatchSku = matchSku[index];

                  if (!hasMatchSku) {
                    hasUnmatchedOpportunity = true;
                  }

                  return (
                    <div key={index}>
                      <div className="business-opportunity-item">
                        <div className="top-part">
                          <OpportunityItem {...item} />
                          {hasMatchSku ? (
                            <SkuItem index={index} {...hasMatchSku} />
                          ) : (
                            <UnmatchOpportunity index={index} {...item} />
                          )}
                        </div>
                        {hasMatchSku && (
                          <div className="bottom-part">
                            <div className="bottom-part-item">
                              <div>
                                <span>提报价格：</span>
                                <Input
                                  style={{ display: 'none' }}
                                  {...init(fieldRowSkuId, {
                                    initValue: hasMatchSku.sku_id,
                                  })}
                                />
                                <Input
                                  placeholder="请输入价格"
                                  label="¥"
                                  {...init(fieldRowPrice, {
                                    initValue: item.price,
                                    rules: [
                                      {
                                        required: true,
                                        validator: (...args) =>
                                          priceValidator(item.goal_price, item.price || 0, ...args),
                                      },
                                    ],
                                  })}
                                />
                              </div>
                              <span className="tip-info">
                                填入较低价格，有利于竞价成功，请勿恶意竞价！注意该价格不包含运费
                              </span>
                            </div>
                            <div className="bottom-part-item">
                              <div>
                                <span>提报库存：</span>
                                <Radio
                                  checked
                                  {...init(fieldRowStock, {
                                    initValue: '-1',
                                  })}
                                >
                                  不限库存
                                </Radio>
                              </div>
                              <span className="error-info">{errorMsg}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="divider" />
                    </div>
                  );
                });

                return (
                  <>
                    <div className="business-opportunity-container">{items}</div>
                    {!hasUnmatchedOpportunity && (
                      <div className="w-[100%] h-[64px] rounded-[6px] flex border-[1px] border-[#E5E5E5] px-[20px] justify-between mt-[16px] items-center">
                        <div className="flex text-[#333] font-medium">
                          另有其它
                          <span className="font-medium text-[#FF7300]">{selectedRecord?.length || 0}</span>
                          个SKU会被一同提报
                        </div>
                        <button
                          className="flex flex-row justify-center items-center p-[10px_12px] text-[#0077FF] h-[32px] w-[119px] rounded-[6px] border-[1px] border-[#0077FF]"
                          onClick={() => openDialog(record)}
                        >
                          查看其它SKU
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            <ShippingInfo sendAddress={sendAddress} publishLink={publishLink} />
            {/* <ManufacturerInfo itemId={match_item_id} showManufacturerInfo={showManufacturerInfo} /> */}
            <ManufacturerInfoCard itemId={match_item_id} showManufacturerInfo={showManufacturerInfo} type="productsbidding" />
          </div>
          <div className="footer">
            <div className="agreement">
              <Checkbox
                defaultChecked={sellerTypeChecked}
                disabled={sellerTypeChecked}
                onChange={handleCheckAgreement}
                value={checkboxChecked}
              >
                我已阅读并同意
                {dataList.map((ele) => (
                  <a href={ele.url} rel="noreferrer" target="_blank" className="submit-aeproducts-a" key={ele.title}>
                    {ele.title}
                  </a>
                ))}
              </Checkbox>
            </div>
            <div className="submit-btns-container">
              {submitBtnDisabled ? (
                <Balloon.Tooltip
                  trigger={
                    <div>
                      <Button
                        type="primary"
                        disabled={submitBtnDisabled}
                        onClick={handleSubmit}
                        loading={submitLoading}
                      >
                        确认提报
                      </Button>
                    </div>
                  }
                  align="t"
                  popupStyle={{
                    backgroundColor: '#333',
                  }}
                  popupClassName="tooltip-submit"
                >
                  {/* {`未提报 SKU 数量: ${selectedRecord?.length}`} */}
                  您还有
                  <span className="text-[#FF7300]">{unreportedSkuCount}</span>
                  个SKU未提报
                </Balloon.Tooltip>
              ) : (
                <Button type="primary" disabled={submitBtnDisabled} onClick={handleSubmit} loading={submitLoading}>
                  确认提报
                </Button>
              )}

              <Button onClick={handleClose}>取消</Button>
            </div>
          </div>
        </Drawer>
      )}
      {dialogVisible && <SkuCard skus={selectedRecord} onClose={closeDialog} />}
    </div>
  );
};
