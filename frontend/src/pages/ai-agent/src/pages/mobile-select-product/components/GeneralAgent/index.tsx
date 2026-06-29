import React from 'react';
import { Markdown } from '@/components/MobileMarkdown';

import styles from './index.module.css';

const GeneralAgent = ({ text }: { text: string }) => {
  return (
    <div className={styles.mobileCommonChatContainer}>
      <Markdown text={text} />
    </div>
  );
};

export default GeneralAgent;
