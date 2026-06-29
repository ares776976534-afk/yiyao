/**
 * 仅图搜表格组件 - 使用示例
 */

import React from 'react';
import ImageSearchTable from '../src/pages/select-business/components/ImageSearchTable';
import { mockProductData } from '../src/pages/select-business/components/ImageSearchTable/mock';

const ImageSearchTableExample: React.FC = () => {
  const handleRowClick = (record: any) => {
    console.log('点击了商品:', record);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>仅图搜表格示例</h1>

      {/* 基础使用 */}
      <ImageSearchTable
        dataSource={mockProductData}
        onRowClick={handleRowClick}
      />

      {/* 带分页 */}
      <div style={{ marginTop: '48px' }}>
        <h2 style={{ marginBottom: '24px' }}>带分页的表格</h2>
        <ImageSearchTable
          dataSource={mockProductData}
          pagination={{
            pageSize: 5,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onRowClick={handleRowClick}
        />
      </div>

      {/* 加载状态 */}
      <div style={{ marginTop: '48px' }}>
        <h2 style={{ marginBottom: '24px' }}>加载状态</h2>
        <ImageSearchTable
          dataSource={[]}
          loading
        />
      </div>
    </div>
  );
};

export default ImageSearchTableExample;

