import React from 'react';
import TableItem from './TableItem';
import styles from './table.module.css';

interface WebSearchTableProps {
  webSearchToolModelList?: any[];
}

const WebSearchTable: React.FC<WebSearchTableProps> = ({ webSearchToolModelList = [], ...props }) => {
  return (
    <div className={styles.container}>
      {webSearchToolModelList.map((item, index) => (
        <TableItem
          key={index}
          title={item.title}
          description={item.snippet}
          url={item.url}
          isFirst={index === 0}
          icon={item.hostLogo}
        />
      ))}
    </div>
  );
};

export default WebSearchTable;
