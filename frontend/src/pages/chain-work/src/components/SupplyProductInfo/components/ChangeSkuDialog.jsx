import React, { useEffect, useState } from 'react';
import { Dialog, Button, Form, Message, Balloon } from '@alifd/next';
import CommonTable from '@/components/CommonTable';
import { mockData } from '../mock';
import { queryCompanySku, reMatchOppSku } from '../api';
import { formatNumber } from '../utils';
import './index.scss';

function ChangeSkuDialog({ visible, setVisible, onSuccess, dialogStyle = {}, recordData, getParam, logisticsIdRef }) {
  const dealFieldData = async (skuDataSource, { clickSkuId, oldSkuId }) => {
    // clickSkuId要替换为的sku, oldSkuId曾经的sku
    const skuParamList = [];
    const tableData = skuDataSource;
    // console.log('--------');
    // console.log('tableData',tableData);
    tableData.forEach((item) => {
      const skuId = item.supplySkuId;
      switch (String(skuId)) {
        case String(oldSkuId):
          skuParamList.push({ oppSkuId: item.oppSkuId, supplySkuId: clickSkuId });
          break;
        case String(clickSkuId):
          skuParamList.push({ oppSkuId: item.oppSkuId, supplySkuId: oldSkuId });
          break;
        default:
          skuParamList.push({ oppSkuId: item.oppSkuId, supplySkuId: skuId });
      }
    });
    // 交换
    // console.log('skuParamList',skuParamList);
    return skuParamList;
  };
  const onOk = (data) => {
    onSuccess && onSuccess(data);
    setVisible(false);
  };
  const schema = {
    colSchema: () => [
      {
        title: '商品规格',
        align: 'left',
        width: '400px',
        dataIndex: 'price',
        cell: (value, index, item) => {
          const hasImage = !!item?.['skuPic']; // 是否有图片
          return (
            <div className="flex">
              {hasImage && (
                <a
                  href={`https://detail.1688.com/offer/${item?.skuId}.html`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ cursor: 'pointer' }}
                  className="mr-[12px]"
                >
                  <img src={item?.['skuPic']} alt="imgUrl" className="w-[60px] h-[60px] rounded-[6px]" />
                </a>
              )}
              <div className="relative">
                <>
                  {String(item?.['skuName'])?.length < 21 ? (
                    <div className="w-[163px]">
                      <span className="products-card-text !text-[14px]">{item?.['skuName']}</span>
                    </div>
                  ) : (
                    <Balloon.Tooltip
                      trigger={
                        <div className="w-[163px]">
                          <span className="products-card-text !text-[14px]">
                            {' '}
                            {`${String(item?.['skuName'])?.slice(0, 21)}...`}
                          </span>
                        </div>
                      }
                      align="t"
                      popupStyle={{ backgroundColor: '#333', '--balloon-tooltip-color-bg': '#333' }}
                    >
                      {item?.['skuName']}
                    </Balloon.Tooltip>
                  )}
                </>
                {item?.skuId && !item.canSignup && (
                  <div style={{ color: 'red' }} className="absolute top-[45px] text-[12px]">
                    {item.errorMsg ? item.errorMsg : '规格名称存在风险，请更换'}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: '操作',
        align: 'center',
        width: '163px',
        dataIndex: 'price',
        cell: (value, index, clickRecord) => (
          <Button
            type="primary"
            disabled={!clickRecord.canSignup}
            onClick={async () => {
              // 原来的规格放回去 与更换的规格互换
              const clickSkuId = String(clickRecord.skuId);
              const oldSkuId = recordData.baseSkuInfo?.skuId || null;
              const list = await dealFieldData(recordData.skuDataSource, { clickSkuId, oldSkuId });
              reMatchOppSku({
                itemId: getParam('itemId'),
                oppId: getParam('oppId'),
                postageType: recordData?.postageType,
                postage: recordData?.postage,
                skuMatchList: list,
                logisticsId: logisticsIdRef.current,
                hasAlreadyDiscount: recordData?.hasAlreadyDiscount,
                supplyProductId: getParam('supplyProductId'),
              }).then((res) => {
                if (res && res.success) {
                  onOk(res.model);
                  Message.success({
                    content: '更换规格成功',
                  });
                } else {
                  Message.error(res.msg || '系统异常');
                }
              });
            }}
          >
            更换
          </Button>
        ),
      },
    ],
    batchActionSchema: () => [],
    filterSchema: () => [],
    // componentSchema,
  };

  const getData = (params) => {
    return new Promise((resolve, reject) => {
      // console.log('[ params ] >', params);
      // resolve({ model: [recordData], total: 1 })
      queryCompanySku({
        ...params,
        getSkuList: true,
        itemId: getParam('itemId'),
        oppId: getParam('oppId'),
        supplyProductId: getParam('supplyProductId'),
        logisticsId: logisticsIdRef.current,
      }).then((res) => {
        // console.log('[ res-Dialog ] >', res);
        if (res && res.success) {
          resolve(res.data || []);
        } else {
          Message.error(res.msg || '系统异常');
        }
      });
    });
  };
  const fullDialogStyle = {
    ...dialogStyle,
    '--dialog-content-padding-top': '20px',
    '--dialog-content-padding-left': '20px',
    '--dialog-content-padding-right': '20px',
    '--dialog-content-padding-bottom': '20px',
    '--dialog-title-font-size': '16px',
    lineHeight: '19px',
    '--dialog-title-font-weight': '500',
    '--dialog-close-size': '20px',
    '--dialog-title-padding-top': '20px',
    '--dialog-title-padding-left-right': '20px',
    '--dialog-close-top': '20px',
    '--dialog-close-right': '20px',
    width: '640px',
  };

  return (
    <Dialog
      v2
      title={'更换规格'}
      visible={visible}
      onClose={() => setVisible(false)}
      footerActions={[]}
      // footerAlign="center"
      style={fullDialogStyle}
    >
      <div className="changeSkuDialogTable">
        <CommonTable
          schema={schema}
          SlotOrShowStatusFilter={false}
          SlotOrShowMsgBar={false}
          pageSize={10}
          listQueryFn={getData}
          searchFilterType={'3'}
          blockBorder={false}
          showPagination={false}
        />
      </div>
    </Dialog>
  );
}

export default ChangeSkuDialog;
