import React from 'react';
import { Popup, SafeArea } from 'antd-mobile';
import OfferLinkAnalysis from '@/components/OfferLinkAnalysis';
import type { TypeOfferMaterialResult } from '@/services/studio/queryOfferBy';
import styles from './index.module.scss';

interface Props {
  offerLinkAnalysisShow: boolean;
  handleCloseOfferLinkAnalysis: () => void;
  onImport: (result: TypeOfferMaterialResult[]) => void;
}

const MobileOfferLinkAnalysis = (props: Props) => {
  const { offerLinkAnalysisShow, handleCloseOfferLinkAnalysis, onImport } =
    props;
  return (
    <Popup
      className={styles.mobileOfferLinkAnalysisPopup}
      visible={offerLinkAnalysisShow}
      onClose={handleCloseOfferLinkAnalysis}
    >
      <OfferLinkAnalysis
        classNames={{
          root: styles.customOfferLinkRoot,
          content: styles.customOfferLinkContent,
          title: styles.customOfferLinkTitle,
          input: styles.customOfferLinkInput,
          textArea: styles.customOfferLinkTextArea,
          footer: styles.customOfferLinkFooter,
        }}
        onImport={(result) => {
          onImport?.(result);
          handleCloseOfferLinkAnalysis();
        }}
        onClose={handleCloseOfferLinkAnalysis}
      />
      <SafeArea position="bottom" />
    </Popup>
  );
};

export default MobileOfferLinkAnalysis;
