import React from "react";
import { Modal } from "antd";
import OfferLinkAnalysis from "@/components/OfferLinkAnalysis";
import type { TypeOfferMaterialResult } from "@/services/studio/queryOfferBy";
import styles from "./index.module.scss";

interface Props {
  open: boolean;
  logKey?: string;
  onImport?: (result: TypeOfferMaterialResult[]) => void;
  onClose?: () => void;
}

const OfferModal = (props: Props) => {
  const { open, logKey, onImport, onClose } = props;

  const handleImport = (...args: Parameters<NonNullable<typeof onImport>>) => {
    onImport?.(...args);
    onClose?.();
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Modal
      wrapClassName={styles["offer-modal"]}
      width={600}
      centered
      destroyOnHidden
      maskClosable={false}
      open={open}
      closeIcon={null}
      footer={null}
    >
      <OfferLinkAnalysis
        logKey={logKey}
        onImport={handleImport}
        onClose={handleClose}
      />
    </Modal>
  );
};

OfferModal.displayName = "OfferModal";

export default OfferModal;
