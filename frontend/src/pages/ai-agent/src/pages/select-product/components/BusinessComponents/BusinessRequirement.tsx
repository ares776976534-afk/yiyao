import { useState, useEffect } from 'react';
import MerchantsFrom from './MerchantsFrom';
import { Form } from 'antd';
import { StatusEnum } from '@/pages/select-product/config';
import TitleCard from '@/components/ChatFlow/TitleCard';
import { $t } from '@/i18n';

export const BusinessRequirement = ({ status, onSubmit, values, imageUrl }: { status: StatusEnum; onSubmit: (values: any) => void; values?: any; imageUrl?: string }) => {
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState(false);

  const onFinish = (values: any) => {
    const { providerPreferenceList, image } = values;
    onSubmit({
      searchImageReq: {
        imageUrl: image?.previewUrl,
        currentRegion: image?.currentRegion,
      },
      preferenceReq: {
        providerPreferenceList,
      },
    });
  };

  useEffect(() => {
    if (status === StatusEnum.RUNNING && isOpen) {
      setTimeout(() => {
        form.setFieldsValue({
          providerPreferenceList: values?.preferenceReq?.providerPreferenceList,
          image: {
            previewUrl: values?.searchImageReq?.imageUrl,
            currentRegion: values?.searchImageReq?.currentRegion,  // 添加 currentRegion
            imgFileKey: values?.searchImageReq?.imgFileKey,
            offerId: values?.searchImageReq?.offerId,
            type: values?.searchImageReq?.type,
            yoloCropRegion: values?.searchImageReq?.yoloCropRegion,
          }
        });
      }, 100);
    }
    if (status === StatusEnum.INIT && imageUrl) {
      setTimeout(() => {
        form.setFieldsValue({
          image: {
            previewUrl: values?.searchImageReq?.imageUrl,
            currentRegion: values?.searchImageReq?.currentRegion,  // 添加 currentRegion
            imgFileKey: values?.searchImageReq?.imgFileKey,
            offerId: values?.searchImageReq?.offerId,
            type: values?.searchImageReq?.type,
            yoloCropRegion: values?.searchImageReq?.yoloCropRegion,
          }
        });
      }, 100);
    }
  }, [status, isOpen]);


  return status === StatusEnum.INIT ? (
    <div className="flex flex-col">
      <div className="text-[16px] text-[#1D2129] mb-[16px]">{$t("global-1688-ai-app.select-product.BusinessComponents.BusinessRequirement.ztzwxy", "在开始找供应商之前，首先让我了解您的需求和关键要素。")}</div>
      <div className="rounded-[16px] border-[1px] border-[#E7E8EE] p-[16px]">
        <MerchantsFrom form={form} onFinish={onFinish} imageUrl={imageUrl} />
      </div>
    </div>
  ) : (
    <TitleCard
      isOpen={isOpen}
      handleClick={() => setIsOpen(!isOpen)}
      title={$t("global-1688-ai-app.select-product.BusinessComponents.BusinessRequirement.nyo", "您已补充供应商偏好")}
      children={<MerchantsFrom onFinish={onFinish} disabled form={form} imageUrl={imageUrl} />}
    />
  );
};