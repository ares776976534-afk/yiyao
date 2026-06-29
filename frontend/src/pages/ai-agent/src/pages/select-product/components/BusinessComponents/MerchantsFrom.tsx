import { useEffect, useState } from 'react';
import styles from './merchantsFrom.module.css';
import MerchantsUpload from './MerchantsUpload';
import { ImgIcon, SupplierIcon } from '@/components/Icon';
import { Form, Checkbox, Tooltip, FormInstance, message } from 'antd';
import { ColorfulBtn } from '@/components/ChatFlow/ColorfulBtn';
import { getSupplierPreferenceEnum } from './services';
import { $t } from '@/i18n';

export default function ({ form, onFinish, disabled, imageUrl }: { form: FormInstance; onFinish: (values: any) => void; disabled?: boolean; imageUrl?: string }) {
  const [groupList, setGroupList] = useState<any[]>([]);
  const [isFormValid, setIsFormValid] = useState(true);
  useEffect(() => {
    getSupplierPreferenceEnum(JSON.stringify({}))
      .then((res: any) => {
        const { success, data, mesg } = res;
        if (!success) {
          message.error(mesg || $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsFrom.hpFd", "获取供应商偏好失败"));
        }
        form.setFieldsValue({
          providerPreferenceList: data?.providerPreferenceList.filter(item => item.isSelected)
            .map(item => item.code) || [],
        });
        return setGroupList(data?.providerPreferenceList || []);
      }).catch((err: any) => {
        message.error(err.message || $t("global-1688-ai-app.select-product.BusinessComponents.MerchantsFrom.hpFd", "获取供应商偏好失败"));
      });
  }, []);
  const handleValuesChange = () => {
    setIsFormValid(!!form?.getFieldValue('image')?.previewUrl);
  };
  return (
    <div className={styles.selectMerchantsContent}>
      {!disabled && <div className={styles.selectMerchantsContentTitle}>{$t("global-1688-ai-app.select-product.BusinessComponents.MerchantsFrom.nqagtsG", "您好，请上传图片并设置供应商偏好～")}</div>}
      <div style={{ marginTop: '20px' }}>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 24 }}
          autoComplete="off"
          layout="vertical"
          form={form}
          disabled={disabled}
          onValuesChange={handleValuesChange}
        >
          <Form.Item name="image" label="">
            <MerchantsUpload
              title={
                <div className={styles.selectMerchantsContentTitleIcon}>
                  <ImgIcon />
                  <div className={styles.selectMerchantsContentTitleIconText}>{$t("global-1688-ai-app.select-product.BusinessComponents.MerchantsFrom.uploadImage", "上传图片")}</div>
                  <div className={styles.selectMerchantsContentTitleIconTextRequired}>*</div>
                </div>
              }
              disabled={disabled}
              imageUrl={imageUrl}
            />
          </Form.Item>
          <Form.Item
            name="providerPreferenceList"
            className={styles.selectMerchantsCheckboxGroup}
            label={
              <div className={styles.selectMerchantsContentTitleIcon}>
                <SupplierIcon fill={'#1D2129'} />
                <div className={styles.selectMerchantsContentTitleIconText}>{$t("global-1688-ai-app.select-product.BusinessComponents.MerchantsFrom.gots", "供应商偏好设置")}</div>
              </div>
            }
          >
            <Checkbox.Group>
              {groupList.map((item) => (
                <Checkbox key={item.code} value={item.code} style={{ lineHeight: '32px' }}>
                  {item?.desc ? (
                    <Tooltip placement="top" title={item.desc} arrow>
                      {item.name}
                    </Tooltip>
                  ) : (item.name)}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
        <div className={styles.selectMerchantsBtn}>
          <ColorfulBtn disabled={!isFormValid} title={$t("global-1688-ai-app.select-product.BusinessComponents.MerchantsFrom.qdxq", "确定需求")} onClick={() => onFinish(form.getFieldsValue())} />
        </div>
      </div>
    </div>
  );
}