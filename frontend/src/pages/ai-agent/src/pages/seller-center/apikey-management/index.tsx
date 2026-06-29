import React, { useState, useEffect } from 'react';
import { Button, Table, Tag, Space, Modal, Input, message } from 'antd';
import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import * as clipboard from "clipboard-polyfill";
import Framework from '@/components/BaseFramework';
import { getApiKey, createApiKey, deleteApiKey } from '../services';
import dayjs from 'dayjs';
import Clipboard from '@/components/ClipBoard';
import theme from '@/theme/seller-center.json';
import styles from './index.module.css';
import { definePageConfig } from 'ice';
import { $t } from '@/i18n';

const ApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [open, setOpen] = useState(false);

  const handleCopyKey = (key) => {
    clipboard.writeText(key);
  };

  const handleInputChange = (e) => {
    setNewApiKeyName(e.target.value);
  };

  const handleOpenCreateNew = () => {
    setOpen(true);
  };

  const handleGetApiKey = () => {
    getApiKey().then((res) => {
      if (res.success) {
        setApiKeys(res.data);
      }
    });
  };

  const handleCreateNew = () => {
    if (!newApiKeyName) {
      message.error('请输入API密钥名称');
      return;
    }
    createApiKey({
      name: newApiKeyName,
    }).then((res) => {
      if (res.success) {
        setNewApiKeyName('');
        handleGetApiKey();
        setOpen(false);
        Modal.success({
          title: $t("global-1688-ai-app.seller-center.apikey-management.ndAPImyycj", "您的API密钥已创建"),
          icon: null,
          width: 700,
          content: (<div data-clipboard-text={`Access Key: ${res.data.accessKey}\nSecret Key: ${res.data.secretKey}`} className={styles.createApiKeyModalContent}>
            <span className={styles.createApiKeyModalContentTip}>{$t("global-1688-ai-app.seller-center.apikey-management.AsStnAetcwhlCmmzrywb", "Access Key 和 Secret Key 是您访问遨虾API的安全凭证，请勿将其共享或暴露在浏览器和其它客户端代码中。请特别注意，Secret Key仅显示一次，请务必妥善保管！")}</span>
            <div className={styles.createApiKeyModalContentKeys}>
              <div className={styles.createApiKeyModalContentKey}>
                <span className={styles.createApiKeyModalContentKeyLabel}>Access Key:</span>
                <span className={styles.createApiKeyModalContentKeyValue}>{res.data.accessKey}</span>
              </div>
              <div className={styles.createApiKeyModalContentKey}>
                <span className={styles.createApiKeyModalContentKeyLabel}>Secret Key:</span>
                <span className={styles.createApiKeyModalContentKeyValue}>{res.data.secretKey}</span>
              </div>
            </div>
          </div>),
          closable: true,
          footer: (
            <div className={styles.createApiKeyModalContentFooter}>
              <Clipboard text={`Access Key: ${res.data.accessKey}\nSecret Key: ${res.data.secretKey}`} onSuccess={() => {
                message.success($t("global-1688-ai-app.seller-center.apikey-management.mpb", "密钥已复制到剪贴板"));
              }} onError={() => {
                message.error('复制失败');
              }}>
                <Button type="primary" className={styles.createApiKeyModalButton}>{$t("global-1688-ai-app.seller-center.apikey-management.copyqb", "复制全部")}</Button>
              </Clipboard>
            </div>
          ),
        });
      } else {
        message.error('新建API密钥失败');
      }
    }).catch(() => {
      message.error('新建API密钥失败');
    });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleDeleteApiKey = (ak) => {
    deleteApiKey({
      ak,
    }).then((res) => {
      if (res.success && res.data) {
        message.success($t("global-1688-ai-app.seller-center.apikey-management.deye", "删除API密钥成功"));
        handleGetApiKey();
      } else {
        message.error(res.retMsg || '删除API密钥失败');
      }
    }).catch(() => {
      message.error('删除API密钥失败');
    });
  };

  const columns: any[] = [
    {
      title: $t("global-1688-ai-app.seller-center.apikey-management.mc", "名称"),
      dataIndex: 'name',
      key: 'name',
      width: 122,
      align: 'center',
      fixed: 'left',
    },
    {
      title: $t("global-1688-ai-app.seller-center.apikey-management.my", "密钥"),
      dataIndex: 'keys',
      key: 'keys',
      align: 'center',
      render: (_, record) => (
        <div className={styles.keyContainer}>
          <div className={styles.keyRow}>
            <span className={styles.keyLabel}>Access Key:</span>
            <span className={styles.keyValue}>{record?.accessKey}</span>
            <Clipboard text={record?.accessKey} onSuccess={() => {
              message.success($t("global-1688-ai-app.seller-center.apikey-management.mpb", "密钥已复制到剪贴板"));
            }} onError={() => {
              message.error('复制失败');
            }}>
              <CopyOutlined className={styles.copyIcon} />
            </Clipboard>
          </div>
          <div className={styles.keyRow}>
            <span className={styles.keyLabel}>Secret Key:</span>
            <span className={styles.keyValue}>{record?.secretKey}</span>
          </div>
        </div>
      ),
    },
    {
      title: $t("global-1688-ai-app.seller-center.apikey-management.createdTime", "创建时间"),
      dataIndex: 'createTime',
      key: 'createTime',
      width: 122,
      align: 'center',
      render: (_, record) => dayjs(record?.createTime).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: $t("global-1688-ai-app.seller-center.apikey-management.zt", "状态"),
      dataIndex: 'status',
      key: 'status',
      width: 157,
      align: 'center',
      render: (status) => (
        <Tag className={styles.statusTag}>
          {status}
        </Tag>
      ),
    },
    {
      title: $t("global-1688-ai-app.seller-center.apikey-management.expirationTime", "过期时间"),
      dataIndex: 'expireTime',
      key: 'expireTime',
      width: 178,
      align: 'center',
    },
    {
      title: $t("global-1688-ai-app.seller-center.apikey-management.cz", "操作"),
      key: 'action',
      width: 178,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          {/* <span className={styles.actionItem} onClick={() => handleEdit(record?.id)}>
            <EditOutlined className={styles.actionIcon} />
            <span className={styles.editText}>编辑</span>
          </span> */}
          <span className={styles.actionItem} onClick={() => handleDeleteApiKey(record?.accessKey)}>
            <DeleteOutlined className={styles.actionIcon} />
            <span className={styles.deleteText}>{$t("global-1688-ai-app.seller-center.apikey-management.delete", "删除")}</span>
          </span>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    handleGetApiKey();
  }, []);

  return (
    <Framework
      title={$t("global-1688-ai-app.seller-center.apikey-management.APImygl", "API密钥管理")}
      right={
        <Button
          type="primary"
          className={styles.createButton}
          onClick={handleOpenCreateNew}
          icon={<PlusOutlined />}
        >{$t("global-1688-ai-app.seller-center.apikey-management.newjAPImy", "新建API密钥")}</Button>
      }
      theme={theme}
    >
      <div className={styles.container}>
        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            dataSource={apiKeys}
            rowKey="id"
            pagination={false}
            className={styles.customTable}
            size="middle"
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>
      <Modal
        title={$t("global-1688-ai-app.seller-center.apikey-management.newjAPImy", "新建API密钥")}
        open={open}
        onCancel={handleCancel}
        footer={
          <div>
            <Button
              onClick={handleCreateNew}
              type="primary"
              className={styles.createApiKeyModalButton}
              autoInsertSpace={false}
            >{$t("global-1688-ai-app.seller-center.apikey-management.qd", "确定")}</Button>
          </div>
        }
        centered
        width={700}
      >
        <div className={styles.createApiKeyModal}>
          <span className={styles.createApiKeyModalTitle}>{$t("global-1688-ai-app.seller-center.apikey-management.mymc", "密钥名称")}</span>
          <Input className={styles.createApiKeyModalInput} placeholder={$t("global-1688-ai-app.seller-center.apikey-management.qty", "请输入API密钥名称")} onChange={handleInputChange} value={newApiKeyName} style={{ width: 574 }} required />
        </div>
      </Modal>
    </Framework>
  );
};

export const pageConfig = definePageConfig({
  title: $t("global-1688-ai-app.seller-center.apikey-management.APImygl", "API密钥管理"),
  spm: {
    spmB: 'seller-center-apikey-management',
  },
});

export default ApiKeyManagement;