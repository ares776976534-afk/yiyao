import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import MerchantsTable from './MerchantsTable';
import { ColorfulBtn } from '@/components/ChatFlow/ColorfulBtn';
import jumpTo from '@/utils/jumpTo';
import styles from './initiateInquiryModal.module.css';
import { $t } from '@/i18n';

const InitiateInquiryModal = ({ isOpen = true, onClose, data }: { isOpen?: boolean, onClose?: () => void, data: any }) => {
  const [checkedRowKeys, setCheckedRowKeys] = useState<React.Key[]>([]);
  const handleInquiry = () => {
    jumpTo(`/inquiry/new?fromPage=ZS&offerIds=${checkedRowKeys.join(',')}`);
  };

  const onCheckChange = (selectedRowKey: any) => {
    const _checkedRowKeys = checkedRowKeys.includes(selectedRowKey) ? checkedRowKeys.filter(key => key !== selectedRowKey) : [...checkedRowKeys, selectedRowKey];
    setCheckedRowKeys(_checkedRowKeys);
  };

  useEffect(() => {
    if (data?.recommendedProvider?.recommendList?.length > 0) {
      setCheckedRowKeys(data?.recommendedProvider?.recommendList.map((item: any) => item.offerId));
    }
  }, [data?.recommendedProvider?.recommendList]);

  return (
    <Modal
      title={$t("global-1688-ai-app.select-product.BusinessComponents.InitiateInquiryModal.kcyp", "可选最多5个供应商，发起询盘")}
      open={isOpen}
      onCancel={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ColorfulBtn title={$t("global-1688-ai-app.select-product.BusinessComponents.InitiateInquiryModal.confirmSelect", "确认选择")} onClick={handleInquiry} disabled={checkedRowKeys?.length > 5 || checkedRowKeys?.length === 0} />
        </div>
      }
      className={styles.initiateInquiryModal}
      style={{
        minWidth: 'calc(100vw - 48px)',
        height: 'calc(100vh - 24px)',
        top: '24px',
      }}
    >
      <MerchantsTable
        data={data?.offerProviderDetail?.offerProviderDetailList}
        hasRowSelection={true}
        onCheckChange={onCheckChange}
        isCheckbox={true}
        recommendList={data?.recommendedProvider?.recommendList}
        checkedRowKeys={checkedRowKeys}
      />
    </Modal >
  );
};

export default InitiateInquiryModal;