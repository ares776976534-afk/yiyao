import React, { useState, useEffect } from 'react';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import Send from './Send';
import Preview from './Preview';
import { getSearchParams } from 'ice';
import { getSampleInfo } from '../../service';
import { STATUS_WAITING } from '../../constants';

import './index.scss';

const TYPE_EDIT = 'edit';
const TYPE_PREVIEW = 'preview';

const transformSampleData = (data = {}) => {
  const { itemInfos = [] } = data;
  const _itemInfos = [];
  itemInfos.forEach((item) => {
    const { skus, itemId, itemName, price, picture, status, measureStatus } = item;
    const table = [
      {
        id: -1,
        itemId,
        itemName,
        price,
        picture,
        status,
        measureStatus,
        type: 'item',
      },
    ];

    skus.forEach((sku) => {
      const exisitIndex = table.findIndex((_item) => _item.id === sku.barCode);
      const skuData = {
        skuId: sku.skuId,
        skuName: sku.skuName?.split(';'),
        barCode: sku.barCode,
        status: sku.status,
        measureResult: sku.measureResult,
        measureInfo: sku.measureInfo,
        itemId: item.itemId,
        itemName: item.itemName,
        price: item.price,
      };

      if (exisitIndex > -1) {
        table[exisitIndex].dataList.push(skuData);
      } else {
        table.push({
          type: 'sku',
          id: sku.barCode,
          measureStatus,
          status,
          dataList: [
            skuData,
          ],
        });
      }
    });
    _itemInfos.push(table);
  });

  return {
    ...data,
    itemInfos: _itemInfos,
  };
};

export default () => {
  const params = getSearchParams();
  const { sampleIds } = params;
  const [sampleType, setSampleType] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [title, setTitle] = useState('寄样信息');
  const sampleIdList = sampleIds.split(',');

  const Comp = (type) => {
    switch (type) {
      case TYPE_EDIT:
        return <Send {...sampleData} />;
      case TYPE_PREVIEW:
        return <Preview {...sampleData} />;
      default:
        return null;
    }
  };

  const init = () => {
    getSampleInfo(sampleIdList).then(({ data }) => {
      const status = data?.itemInfos[0]?.status;
      const _sampleType = status === STATUS_WAITING ? TYPE_EDIT : TYPE_PREVIEW;
      const _sampleData = transformSampleData(data);
      setSampleData(_sampleData);
      setSampleType(_sampleType);
      if (_sampleType === TYPE_EDIT) {
        setTitle(sampleIdList.length > 1 ? '批量寄样' : '样品寄出');
      }
    });
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="pwc-send-sample-detail">
      <NewWorkLayout
        title={title}
      >
        {
          (sampleType && sampleData) && (
            (Comp(sampleType))
          )
        }
      </NewWorkLayout>
    </div>
  );
};
