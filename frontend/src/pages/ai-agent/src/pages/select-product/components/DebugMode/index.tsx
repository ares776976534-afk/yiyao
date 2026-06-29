import React, { useState } from "react";
import { FloatButton, Modal, Form, Input, message } from 'antd';
import { RocketOutlined, CodeOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { $t } from '@/i18n';

const PushBlock = ({ onClose, onOk, open }: { onClose: () => void, onOk: (values: any) => void, open: boolean }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(values => {
      onOk(values);
      form.resetFields();
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      title="Push Block"
    >
      <Form form={form}>
        <Form.Item name="block" label="Block" initialValue={$t("global-1688-ai-app.select-product.DebugMode.cyEUosfdlatvyEUwfrt1Tnts", `{
          "cardType": "USER_REQUEST",
          "collapsible": false,
          "defaultExpanded": true,
          "eventType": "USER_INPUT",
          "showIcon": false,
          "rawData": "1111",
          "textType": "info",
          "title": "结果输出"
        }`)}>
          <Input.TextArea rows={20} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
export default ({ pushBlock }: { pushBlock: (block: any) => void }) => {
  const [openPushBlockModal, setOpenPushBlockModal] = useState(false);

  const handlePushBlock = (data: any) => {
    try {
      const _block = JSON.parse(data.block);
      _block.cardId = `user_input_${uuidv4()}`;
      _block.timestamp = new Date().getTime();
      _block.sessionId = `session_${uuidv4()}`;
      pushBlock(_block);
      setOpenPushBlockModal(false);
    } catch (error) {
      message.error($t("global-1688-ai-app.select-product.DebugMode.Bftr", "Block 格式错误: ") + error);
    }
  };

  const handleClose = () => {
    setOpenPushBlockModal(false);
  };

  return (
    <>
      <FloatButton.Group
        trigger="click"
        icon={<RocketOutlined />}
      >
        <FloatButton icon={<CodeOutlined />} onClick={() => setOpenPushBlockModal(true)} />
      </FloatButton.Group>
      <PushBlock
        open={openPushBlockModal}
        onClose={handleClose}
        onOk={handlePushBlock}
      />
    </>
  );
};