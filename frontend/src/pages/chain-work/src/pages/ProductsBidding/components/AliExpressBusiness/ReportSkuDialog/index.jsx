import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, Radio, Button, Message, Loading, Balloon } from '@alifd/next';
import { getSku } from '@/pages/ProductsBidding/api';
import ProgressiveImage from '@/components/ProgressiveImage';
import { defaultImg } from '@/pages/ProductsBidding/utils';
import './index.scss';

const RadioGroup = Radio.Group;

export default (props) => {
  const {
    trigger,
    operationType,
    handleChangeSKu,
    match_item_id,
    item_name,
    defaultSkuValue,
    publishLink,
    matchSku,
    skuOppInfo,
  } = props;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSku, setSelectedSku] = useState(defaultSkuValue);
  const [dataSource, setDataSource] = useState([]);
  const { img_url, goal_price, target_product_counts, opp_title, property } = skuOppInfo;
  const isModify = operationType === 'modify';
  const matchSkuValues = Object.values(matchSku);
  const [allDisabled, setAllDisabled] = useState(false);
  const serializedMatchSkuValues = useMemo(() => {
    return matchSkuValues?.map((_item) => JSON.stringify(_item));
  }, [matchSkuValues]);

  // 判断是否所有SKU都已经被选
  useEffect(() => {
    const checkAllDisabled = () => {
      const _allDisabled = (dataSource || []).every((item) => {
        const selectedSkuValue = JSON.stringify({
          sku_id: item?.skuId,
          sku_img: item?.skuImg,
          sku_name: item?.skuName,
        });
        return serializedMatchSkuValues?.includes(selectedSkuValue);
      });
      setAllDisabled(_allDisabled);
    };

    checkAllDisabled();
  }, [dataSource, serializedMatchSkuValues]);

  const handleOpen = () => {
    handleGetSkuInfo();
    setOpen(true);
  };

  const handleGetSkuInfo = () => {
    setLoading(true);
    getSku(match_item_id)
      .then((res) => {
        setDataSource(
          (res?.data || []).map((item) => {
            return {
              ...item,
              skuId: String(item.skuId),
            };
          }),
        );
      })
      .catch((err) => {
        Message.error(err?.errorMessage || 'sku获取异常');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClose = () => {
    setSelectedSku({});
    setOpen(false);
  };
  const handleRenderFooter = () => {
    return (
      <div className="footer">
        <Button
          type="primary"
          disabled={!selectedSku}
          onClick={() => {
            handleChangeSKu(JSON.parse(selectedSku));
            handleClose();
            Message.success(isModify ? '修改SKU成功' : '关联SKU成功');
          }}
        >
          确认
        </Button>
        <Button onClick={handleClose}>取消</Button>
      </div>
    );
  };
  return (
    <div className="report-dialog-container">
      <div onClick={handleOpen}>{trigger}</div>
      <Dialog
        v2
        title={isModify ? '修改SKU' : '提报SKU'}
        visible={open}
        width={835}
        height={855}
        onClose={handleClose}
        footer={handleRenderFooter()}
        className="report-dialog"
      >
        {allDisabled ? (
          <div className="flex items-center bg-[#FFEFE5] text-[13px] text-[#333] rounded-[3px] py-[12px] mb-[20px] h-[42px]">
            <img
              src="https://img.alicdn.com/imgextra/i3/O1CN01HBf9mt1K85kyp66Xp_!!6000000001118-55-tps-16-16.svg"
              alt="icon"
              className="mr-[8px] ml-[12px]"
              style={{ width: '16px', height: '16px' }}
            />
            <div>您的所有SKU都已经提报，请发布新SKU后再进行关联.</div>
          </div>
        ) : null}
        <div className="content">
          <div className="offer-card">
            <div className="offer-image">
              <ProgressiveImage src={img_url || defaultImg} />
            </div>
            <div className="offer-content">
              <div className="offer-header">
                <div className="left-part">
                  <span className="offer-tag">速卖通爆品</span>
                  <span className="offer-title" title={opp_title}>
                    {opp_title}
                  </span>
                </div>
              </div>
              <div className="desc">
                <div>
                  <span>预计采购量：</span>
                  <span>{parseInt(target_product_counts || 0)}</span>
                </div>
                {goal_price && (
                  <div>
                    <span>竞价不高于：</span>
                    <span>&yen;{goal_price}</span>
                  </div>
                )}
              </div>
              <div className="sku-info">
                <span>sku信息：</span>
                <span>{property || '-'}</span>
              </div>
            </div>
          </div>
          <div className="sku-info-container">
            <div className="sku-title">
              <div>我的SKU</div>
              <div>
                <span>没有同款SKU？</span>
                <span className="publish">
                  <span>
                    <a href={publishLink} target="_blank" rel="noreferrer">
                      去发布
                    </a>
                  </span>
                  <img src="https://img.alicdn.com/imgextra/i2/O1CN01HizpNy1uj1sQysrOM_!!6000000006072-2-tps-16-24.png" />
                </span>
              </div>
            </div>
            <Loading visible={loading} style={{ width: '100%' }}>
              <RadioGroup
                className="sku-radio-group"
                defaultValue={defaultSkuValue}
                onChange={(sku) => setSelectedSku(sku)}
              >
                <div className="sku-list-container">
                  {(dataSource || []).map((item) => {
                    const { skuId, skuImg, skuName } = item;
                    const selectedSkuValue = JSON.stringify({
                      sku_id: skuId,
                      sku_img: skuImg,
                      sku_name: skuName,
                    });

                    const isDisabled = (() => {
                      if (defaultSkuValue === selectedSkuValue) {
                        return false;
                      }
                      return matchSkuValues.some((_item) => JSON.stringify(_item) === selectedSkuValue);
                    })();

                    const radioElement = (
                      <Radio disabled={isDisabled} value={selectedSkuValue}>
                        <div className="sku-image">
                          <ProgressiveImage src={skuImg} />
                        </div>
                        <div className="sku-info">
                          <div className="title">{item_name}</div>
                          <div className="sku">{skuName}</div>
                        </div>
                      </Radio>
                    );

                    return (
                      <div className="sku-list-item" key={skuId}>
                        {isDisabled ? (
                          <Balloon.Tooltip
                            trigger={<div>{radioElement}</div>}
                            align="t"
                            popupClassName="tooltip-top"
                            popupStyle={{
                              backgroundColor: '#333',
                              marginLeft: '-350px',
                              marginTop: '34px',
                            }}
                          >
                            该 SKU 已选中
                          </Balloon.Tooltip>
                        ) : (
                          radioElement
                        )}
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </Loading>
            <div className="unmatch-sku">
              <div>没有同款SKU？</div>
              <Button component="a" href={publishLink} target="_blank">
                去发布
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
