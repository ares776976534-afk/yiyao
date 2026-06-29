import styles from './index.module.css';
import { Form, Select, Input, Space, Button, Divider, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { $t } from '@/i18n';
import { getNumberIcon } from '../FormatList/RightComponents/numberIconConfig';
import { DownArrowIcon } from '@/components/Icon';
import { useEffect, useState } from 'react';
import { showToolTip } from '../ToolTip';
import { getAuthInfo } from '../../services';
import { isPre } from '@/utils/env';

// 消息类型常量
const AUTH_MSG_KEY = 'alphashop.ai.1688auth';

const BasicInfor = ({ list, disabled = false, number = 4 }: { list: any[]; disabled?: boolean; number?: number }) => {
  const [isAuthorization, setIsAuthorization] = useState(true);
  const NumberIcon = getNumberIcon(number);

  const addItem = () => {
    window.open('https://wuliu.1688.com/foundation/receive_address_manager.htm', '_blank');
  };

  // 检查授权状态
  const checkAuthStatus = async (showTip = false) => {
    try {
      const res = await getAuthInfo({});
      const { success, msg = '系统异常', result } = res;
      const isAuthed = success && result?.existBind;

      setIsAuthorization(isAuthed);

      if (showTip) {
        showToolTip({
          type: isAuthed ? 'success' : 'error',
          message: isAuthed ? '授权成功，请选择收货地址' : (msg || '授权失败，请稍后重试'),
        });
      } else if (!success) {
        message.error(msg);
      }
    } catch (error) {
      setIsAuthorization(false);
      if (showTip) {
        showToolTip({
          type: 'error',
          message: '授权状态查询失败',
        });
      }
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const listenAuthMsg = () => {
    window.addEventListener('message', async (event) => {
      if (event.data.type === AUTH_MSG_KEY) {
        const data = event.data.data;
        if (data?.close === 'true' || data?.bindCode === 'true') {
          await checkAuthStatus(true);
        }
      }
    });
  };
  // 点击授权按钮
  const onAuthorization = () => {
    const url = isPre ? 'https://pre-air.1688.com' : 'https://air.1688.com'
    const authWindow = window.open(`${url}/kapp/1688-global-fe-ai/alphashop-common-app/loginAuthCbu`);
    setTimeout(() => {
      authWindow?.postMessage({
        type: AUTH_MSG_KEY,
        data: {
          init: 'true',
        },
      }, '*');
    }, 1000);
    listenAuthMsg();
  };
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <NumberIcon />
        <span>{$t("global-1688-ai-app.inquiry.BasicInfor.joi", "基本信息")}</span>
        {/* <span className={styles.optionalLabel}>{$t("global-1688-ai-app.inquiry.BasicInfor.fbt", "（非必填）")}</span> */}
      </div>
      <div className={styles.questionsContainer}>
        <div className={styles.questionsItem}>
          <div className={styles.questionsLabel}>{$t("global-1688-ai-app.inquiry.BasicInfor.qwdgl", "期望订购量")}</div>
          <Form.Item
            name="expectedOrderQuantity"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject(new Error($t("global-1688-ai-app.inquiry.BasicInfor.qtes", "请输入大于0的整数")));
                  }
                  const num = Number(value);
                  if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
                    return Promise.reject(new Error($t("global-1688-ai-app.inquiry.BasicInfor.qtes", "请输入大于0的整数")));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              className={styles.questionsInput}
              placeholder={$t("global-1688-ai-app.inquiry.BasicInfor.qtes", "请输入大于0的整数")}
              disabled={disabled}
              onKeyPress={(e) => {
                // 只允许输入数字
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                // 过滤非数字字符
                const value = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = value;
              }}
            />
          </Form.Item>
        </div>
        <div className={styles.divider} />
        <div className={styles.questionsItem}>
          <div className={styles.questionsLabel}>{$t("global-1688-ai-app.inquiry.BasicInfor.receivingAddress", "收货地址")}</div>
          {isAuthorization ? (
            <Form.Item
              name="address"
              rules={[{ required: true, message: $t("global-1688-ai-app.inquiry.BasicInfor.qselectAddress", "请选择收货地址") }]}
            >
              <Select
                listHeight={212}
                placeholder={$t("global-1688-ai-app.inquiry.BasicInfor.qselect", "请选择")}
                className={`${styles.questionsSelect} basic-infor-select`}
                disabled={disabled}
                popupClassName="basicInforDropdown"
                suffixIcon={<DownArrowIcon />}
                popupRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Space style={{ padding: '0 8px 4px' }}>
                      <Button className={styles.add} type="text" icon={<PlusOutlined />} onClick={addItem}>{$t("global-1688-ai-app.inquiry.BasicInfor.neid", "新增收货地址")}</Button>
                    </Space>
                  </>
                )}
                options={list.map((item) => ({
                  label: item.text,
                  value: item.code,
                }))}
              />
            </Form.Item>
          ) : (
            <div className={styles.authorization} onClick={onAuthorization}>点击授权1688账户收货地址</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInfor;