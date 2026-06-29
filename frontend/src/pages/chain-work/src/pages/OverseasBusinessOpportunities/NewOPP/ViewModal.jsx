import React, { useState, useEffect } from 'react';
import { Dialog, Pagination } from '@alifd/next';
import { ItemCard } from './ItemCard';
import { queryMatchItemAISummary, queryMatchItemList } from '../api';

const PAGE_SIZE = 12;

export const ViewModal = ({ visible, onClose, oppMatchId }) => {
  const [list, setList] = useState([]);
  const [AIText, setAIText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);

  const loadList = (pageNum = current) => {
    if (!visible || !oppMatchId) return;
    queryMatchItemList({
      request: {
        oppMatchId,
        pageNum,
        pageSize: PAGE_SIZE,
      },
    }).then((res) => {
      console.log(res);
      const content = res?.content || {};
      const dataList = content.list || [];
      setList(dataList);
      setTotal(content.total || 0);
      setCurrent(pageNum);
    });
  };

  useEffect(() => {
    if (!visible || !oppMatchId) return;
    setAiLoading(true);
    queryMatchItemAISummary({
      request: {
        oppMatchId,
      },
    })
      .then((res) => {
        setAIText(res.content.model);
      })
      .finally(() => setAiLoading(false));

    // 初次加载第一页
    setCurrent(1);
    loadList(1);
  }, [oppMatchId, visible]);

  return (
    <Dialog
      title="站内同款"
      footer={false}
      style={{
        height: 620,
      }}
      visible={visible}
      onClose={() => {
        onClose();
        setList([]);
        setAIText('');
        setAiLoading(false);
        setCurrent(1);
        setTotal(0);
      }}
    >
      <div style={{ width: 828 }}>
        <div
          style={{
            display: 'flex',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            borderRadius: 6,
            boxSizing: 'border-box',
            width: '100%',
            minHeight: 68,
            padding: 12,
            background: 'linear-gradient(to right, #FFFFFF, #F7FBFF)',
          }}
        >
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            background: 'linear-gradient(139deg, #457FF6 9%, #7FCFFA 123%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            whiteSpace: 'nowrap',
          }}
          >
            AI总结：
          </span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {aiLoading ? '加载中...' : (AIText || '')}
          </span>
        </div>

        <div style={{ height: 380 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 20,
              width: 828,
            }}
          >
            {
              list.map((item, index) => (
                <ItemCard key={index} data={item} />
              ))
            }
          </div>
        </div>

        <Pagination
          current={current}
          pageSize={PAGE_SIZE}
          total={total}
          type="simple"
          shape="no-border"
          style={{
            marginTop: 12,
          }}
          onChange={(val) => {
            setCurrent(val);
            loadList(val);
          }}
        />
      </div>
    </Dialog >
  );
};
