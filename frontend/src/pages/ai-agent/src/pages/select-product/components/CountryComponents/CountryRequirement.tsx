import { useState, useEffect } from "react";
import { Form, message } from "antd";
import { StatusEnum } from "@/pages/select-product/config";
import CountryForm from "./Form";
import FormCard from "../FormCard";
import { riskCheck } from "@/pages/select-product/services";
import { $t } from "@/i18n";

// 格式化表单数据
export const formatRequirementData = (values: any) => {
  const {
    image = {},
    productKeyword = "",
    targetCountry,
    sourceCountry,
    targetPlatform = "",
    minPrice,
    maxPrice,
    minSalesVolume,
    maxSalesVolume,
    minF,
    maxF,
    // cateLev1Id,
    // cateLev2Id,
    ...otherValues
  } = values;

  const searchContexts: any[] = [];

  if (image.previewUrl) {
    searchContexts.push({
      contentType: "image_url",
      imageUrl: image.previewUrl,
      cropRegion: image.currentRegion,
    });
  }

  // if (cateLev2Id || productKeyword) {
  //   searchContexts.push({
  //     contentType: 'text',
  //     productKeyword: productKeyword || cateLev2Id,
  //   });
  // }
  if (productKeyword) {
    searchContexts.push({
      contentType: "text",
      productKeyword: productKeyword,
    });
  }

  return {
    ...otherValues,
    migrationType: "cross_country",
    searchContexts,
    sourcePlatform: targetPlatform,
    targetPlatform: targetPlatform,
    sourceCountry: sourceCountry,
    targetCountry: targetCountry,
    selectionCriteria: {
      productRequirement: {
        priceRange: {
          minPrice: minPrice,
          maxPrice: maxPrice,
        },
        salesVolumeRange: {
          minVolume: minSalesVolume,
          maxVolume: maxSalesVolume,
        },
        ratingRange: {
          minRating: minF,
          maxRating: maxF,
        },
      },
    },
    extInfos: {
      executeStatus: "new",
    },
  };
};

export const CountryRequirement = ({
  status,
  onSubmit,
  values,
  imageUrl,
  userRequest,
}: {
  status: StatusEnum;
  onSubmit: (values: any) => void;
  values?: any;
  imageUrl?: string;
  userRequest?: any;
}) => {
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [isRiskContent, setIsRiskContent] = useState<boolean>(false);
  const [riskMessage, setRiskMessage] = useState<string>('');
  const onFinish = (values: any) => {
    const formattedPayload = formatRequirementData(values);
    setIsRiskContent(false);
    if (values?.productKeyword) {
      riskCheck({
        queryKeyword: values?.productKeyword,
      })
        .then((res: any) => {
          const { success, msg, riskStatus } = res;
          if (success) {
            if (riskStatus === "pass") {
              setIsRiskContent(false);
              onSubmit(formattedPayload);
            } else {
              setIsRiskContent(true);
              setRiskMessage(msg);
            }
          } else {
            setIsRiskContent(false);
            message.error(
              msg ||
                $t(
                  "global-1688-ai-app.select-product.CountryComponents.CountryRequirement.systemError",
                  "系统错误"
                )
            );
          }
        })
        .catch((err: any) => {
          setIsRiskContent(false);
          message.error(
            err.message ||
              $t(
                "global-1688-ai-app.select-product.CountryComponents.CountryRequirement.systemError",
                "系统错误"
              )
          );
        });
    } else {
      onSubmit(formattedPayload);
    }
  };
  useEffect(() => {
    if (status === StatusEnum.RUNNING && isOpen) {
      setTimeout(() => {
        form.setFieldsValue({
          providerPreferenceList: values?.preferenceReq?.providerPreferenceList,
          image: values?.searchImageReq?.imageUrl || imageUrl,
        });
      }, 100);
    }
    if (status === StatusEnum.INIT && imageUrl) {
      setTimeout(() => {
        form.setFieldsValue({
          image: imageUrl || values?.searchImageReq?.imageUrl,
        });
      }, 100);
    }
  }, [status, isOpen]);

  // 监听表单变化，重置风险状态
  const handleFormChange = () => {
    if (isRiskContent) {
      setIsRiskContent(false);
    }
  };
  return (
    <FormCard
      status={status}
      isOpen={isOpen}
      handleClick={() => setIsOpen(!isOpen)}
      children={
        <CountryForm
          title={$t("global-1688-ai-app.select-product.CountryComponents.CountryRequirement.xpyqbc", "选品要求补充")}
          form={form}
          onFinish={onFinish}
          imageUrl={values?.searchImageReq?.imageUrl || imageUrl}
          userRequest={userRequest}
          isRiskContent={isRiskContent}
          onFormChange={handleFormChange}
          isDisabled={status === StatusEnum.RUNNING}
          riskMessage={riskMessage}
        />
      }
      titleCardChildren={
        <CountryForm
          isDisabled={status === StatusEnum.RUNNING}
          onFinish={onFinish}
          disabled
          form={form}
          imageUrl={values?.searchImageReq?.imageUrl || imageUrl}
          userRequest={userRequest}
          riskMessage={riskMessage}
        />
      }
      type="country"
    />
  );
};
