import { useState } from "react";
import { Modal, Button, Input, Space } from "antd";
import useToast from "@/components/Toast";
import styles from "./index.module.scss";
import { $t } from '@/i18n';

export default function Header(props) {
  const { changeProjectName = () => {}, backHome = () => {}, title } = props;

  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState(title);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onOk = () => {
    if (!inputValue) {
      toast.error("请输入项目名称");
      return;
    }
    setLoading(true);
    // 调用接口修改会话名称
    changeProjectName(inputValue).then((res) => {
      setLoading(false);
      if (res) {
        setIsModalOpen(false);
      } else {
        toast.error("修改失败");
      }
    });
  };

  // 返回首页
  const handleBack = () => {
    backHome();
  };

  return (
    <div className={styles.popoverContent}>
      <div className={styles.actionItem} onClick={() => setIsModalOpen(true)}>
        <div className={`${styles.icon} ${styles.editIcon}`} />
        <div className={styles.actionText}>{$t("global-1688-ai-app.ChatContent.header.popoverContent.modifyxmmc", "修改会话名称")}</div>
      </div>
      {/* <div className={styles.actionItem} onClick={handleBack}>
        <div className={`${styles.icon} ${styles.backIcon}`} />
        <div className={styles.actionText}>返回首页</div>
      </div> */}
      <Modal
        classNames={{
          header: styles.modalHeader,
          footer: styles.modalFooter,
        }}
        style={{ top: 174 }}
        title={$t("global-1688-ai-app.ChatContent.header.popoverContent.modifyxmmc", "修改会话名称")}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={
          <Space size={8}>
            <Button onClick={handleCancel}>{$t("global-1688-ai-app.ChatContent.header.popoverContent.cancel", "取消")}</Button>
            <Button
              loading={loading}
              type="primary"
              onClick={onOk}
              disabled={inputValue === title}
            >{$t("global-1688-ai-app.ChatContent.header.popoverContent.qdmodify", "确定修改")}</Button>
          </Space>
        }
      >
        <Input
          placeholder={$t("global-1688-ai-app.ChatContent.header.popoverContent.qinputxmmc", "请输入项目名称")}
          value={inputValue}
          onChange={handleInputChange}
        />
      </Modal>
    </div>
  );
}
