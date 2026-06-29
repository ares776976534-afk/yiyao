import React from 'react';
import styles from './index.module.css';

interface UploadGuideProps {
  id?: string;
}

const UploadGuide: React.FC<UploadGuideProps> = ({ id }) => {
  return (
    <div id={id} className={styles.container}>
      <span className={styles.title}>可通过以下方式上传商品图</span>
      <span className={styles.description}>
        1. 点击按钮，从本地上传图片
        <br />
        2. 在当前页面 ctrl+v 粘贴图片或图片链接
      </span>
    </div>
  );
};

export default UploadGuide;
