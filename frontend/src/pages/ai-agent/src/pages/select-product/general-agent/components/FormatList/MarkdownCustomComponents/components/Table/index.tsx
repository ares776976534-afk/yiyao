import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from './index.module.css';
import FrostedGlass from '@/components/ChatFlow/FrostedGlass';
import { LOG_KEYS } from '@/utils/logConfig';

interface extProps {
  riskStatus: string;
}
interface TypeRichContent {
  alt: string;
  content: string;
  ext?: extProps;
  type: string;
  url: string;
  linkUrl: string;
}

interface TypeCell {
  renderType: string;
  value?: string;
  richContent?: TypeRichContent[];
}

interface TypeRow {
  cells: Record<string, TypeCell>;
  rowId: string;
}

interface TypeHeader {
  align: string;
  key: string;
  title: string;
  width?: string;
}

interface TypeTableData {
  headers: TypeHeader[];
  rows: TypeRow[];
}

interface TableComponentProps {
  id?: string;
  data?: string;
}

const extractProductId = (linkUrl: string): string => {
  if (!linkUrl) return '';
  try {
    const url = new URL(linkUrl);
    // TikTok/Tokopedia: /pdp/{productId}
    const pdpMatch = url.pathname.match(/\/pdp\/(\d+)/);
    if (pdpMatch) return pdpMatch[1];
    // Amazon: /dp/{productId}
    const dpMatch = url.pathname.match(/\/dp\/([A-Z0-9]+)/i);
    if (dpMatch) return dpMatch[1];
  } catch {
    // ignore invalid URL
  }
  return '';
};

const TableComponent: React.FC<TableComponentProps> = ({
  id,
  data,
}) => {
  // const _data: TypeTableData = JSON.parse(data || '{}');
  let _data = {};
  try {
    _data = JSON.parse(data || '{}');
  } catch (error) {
    console.warn('error', data);
    _data = {};
  }
  const { headers: _headers = [], rows: _rows = [] } = _data;
  // 渲染单元格内容
  const renderCell = (cell: TypeCell) => {
    if (!cell) return null;
    
    switch (cell.renderType) {
      case 'text':
        return <span>{cell.value}</span>;
      
      case 'image':
      case 'rich':
        if (!cell.richContent || cell.richContent.length === 0) return null;
        return (
          <>
            {cell.richContent.map((item, index) => {
              switch (item.type) {
                case 'image':
                  return (
                    <FrostedGlass
                      key={index}
                      style={{ width: 80, height: 80 }}
                      riskStatus={item.ext?.riskStatus}
                      productUrl={item?.linkUrl || ''}
                      imageUrl={item.url}
                      logKey={LOG_KEYS.GENERAL_AGENT.LP.ITEMLIST_IMGCLICK}
                      logParams={{
                        productId: extractProductId(item?.linkUrl || ''),
                        title: item?.alt || '',
                      }}
                    />
                  );
                default:
                  return null;
              }
            })}
          </>
        );
      
      default:
        return null;
    }
  };

  // 转换列配置
  const columns: ColumnsType<any> = (_headers || []).map((header) => ({
    title: header.title,
    dataIndex: header.key,
    key: header.key,
    width: header?.width || 200,
    align: (header.align as 'left' | 'right' | 'center') || 'left',
    render: (cell: TypeCell) => renderCell(cell),
  }));

  // 转换行数据：将 cells 对象转换为 antd Table 需要的格式
  const dataSource = (_rows || []).map((row) => ({
    key: row.rowId,
    ...row.cells,
  }));

  return (
    <div className={styles.tableWrapper}>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        className={styles.antdTable}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default TableComponent;
