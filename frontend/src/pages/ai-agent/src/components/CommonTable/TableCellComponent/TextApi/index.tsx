import React, { useRef, useState } from 'react';
import { TypeTableHeader } from '../../types';
import Text from '../Text';
import styles from './index.module.scss';

import { httpRequest } from '@/services/mtop';
import { baseUrl } from '@/utils/env';
import { message } from 'antd';
// import ApiModal from './ApiModal';
// import InfiniteScroll from 'react-infinite-scroll-component';
// import CommonTable from '@/components/ChatFlow/CommonTable';
// src/components/ChatFlow/SameNumModal
import SameNumModal from './SameNumModal';
export const getDetailData = async (apiName: string, params: any) => {
  const res = await httpRequest({
    url: `${baseUrl}${apiName}`,
    method: 'POST',
    body: JSON.stringify(params || {}),
  });
  return res;
};


interface TextApiProps {
  header: TypeTableHeader;
  value: {
    value?: string | number | boolean;
    requestBody?: any;
  };
}

const TextApi: React.FC<TextApiProps> = ({ value, header }) => {
  const [open, setOpen] = useState(false);
  const getDetailDataApi = async (params: { pageSize: number; pageNum: number }): Promise<{
    productList: any[];
    hasMore: boolean;
  }> => {
    const apiName = header.properties?.apiName;
    if (!apiName) {
      return Promise.reject(new Error('apiName is required'));
    }
    return getDetailData(apiName, {
      ...value?.requestBody,
      ...params,
    }).then((res) => {
      const productList = res?.sameStyleProductVO?.productList ?? [];
      const hasMore = res?.sameStyleProductVO?.hasMore ?? false;
      return {
        productList,
        hasMore,
      };
    }).catch((err) => {
      console.error('err', err);
      message.error(err?.message || '请求失败');
      return Promise.reject(err);
    });
  };
  const onDetailClick = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className={styles.textApiWrapper}>
        <Text
          value={value}
          header={header}
          isShowDetail
          onDetailClick={onDetailClick}
        />
      </div>
      <SameNumModal
        open={open}
        onClose={onClose}
        apiRequest={getDetailDataApi}
      />
      {/* <ApiModal
        open={open}
        onClose={onClose}
        renderSlot={() => {
          return (<div>
            <InfiniteScroll
              dataLength={tableData.length}
              next={loadMore}
              hasMore={hasMore}
              loader={
                <div style={{ textAlign: 'center', padding: 12, color: '#86909C' }}>{$t("global-1688-ai-app.ChatFlow.SameNumModal.loading", "加载中...")}</div>
              }
              endMessage={null}
              scrollThreshold={0.8}
            >
              <CommonTable data={tableData} columns={columns as any} />
            </InfiniteScroll>
          </div>);
        }}
      /> */}
    </>
  );
};

export default TextApi;
