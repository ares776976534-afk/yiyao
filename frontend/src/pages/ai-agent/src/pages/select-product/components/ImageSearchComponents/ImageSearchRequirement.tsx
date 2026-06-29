import { useState, useEffect } from "react";
import { Form, message } from "antd";
import { StatusEnum } from "@/pages/select-product/config";
// import ImproveForm from "./Form";
import ImageSearchForm from "./ImageSearchForm";
import FormCard from "../FormCard";
import { riskCheck } from "@/pages/select-product/services";
import { $t } from "@/i18n";
import { useSearchParams } from 'ice';
import { useChatHistory } from "../ChatHistory/useChatHistory";

// 格式化表单数据
export const ImageSearchformatRequirementData = (values: any) => {
  const {
    image = {},
    // productKeyword = "",
    // targetCountry = "",
    // targetPlatform = "",
    // minPrice,
    // maxPrice,
    // minSalesVolume,
    // maxSalesVolume,
    // minF,
    // maxF,
    // cateLev2Id,
    // cateLev1Id,
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
  // if (productKeyword) {
  //   searchContexts.push({
  //     contentType: "text",
  //     productKeyword: productKeyword,
  //   });
  // }
  return {
    ...otherValues,
    searchContexts,
    // targetPlatform: targetPlatform,
    // targetCountry: targetCountry,
    // selectionCriteria: {
    //   productRequirement: {
    //     priceRange: {
    //       minPrice: minPrice,
    //       maxPrice: maxPrice,
    //     },
    //     salesVolumeRange: {
    //       minVolume: minSalesVolume,
    //       maxVolume: maxSalesVolume,
    //     },
    //     ratingRange: {
    //       minRating: minF,
    //       maxRating: maxF,
    //     },
    //   },
    // },
    extInfos: {
      executeStatus: "new",
      // cateLev2Id,
      // cateLev1Id
    },
  };
};

export const ImageSearchRequirement = ({
  status,
  onSubmit,
  values,
  userRequest,
}: {
  status: StatusEnum;
  onSubmit: (values: any) => void;
  values?: any;
  userRequest?: any;
}) => {
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [storeFormValues, setStoreFormValues] = useState<any>(null);
  const [isRiskContent, setIsRiskContent] = useState<boolean>(false);
  const [riskMessage, setRiskMessage] = useState<string>('');
  const [searchParams] = useSearchParams();
  const urlImageUrl = searchParams.get('imageUrl');
  const biId = searchParams.get('biId');
  const { chatHistorySessionId, shareCode } = useChatHistory();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const onFinish = () => {
    const formValues = form.getFieldsValue();
    setStoreFormValues(formValues);
    const formattedPayload = ImageSearchformatRequirementData(formValues);
    
    setIsRiskContent(false);
    if (formValues?.productKeyword) {
      riskCheck({
        queryKeyword: formValues?.productKeyword,
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
                  "global-1688-ai-app.select-product.ImproveComponents.ImproveRequirement.systemError",
                  "系统错误",
                ),
            );
          }
        })
        .catch((err: any) => {
          setIsRiskContent(false);
          message.error(
            err.message ||
              $t(
                "global-1688-ai-app.select-product.ImproveComponents.ImproveRequirement.systemError",
                "系统错误",
              ),
          );
        });
    } else {
      onSubmit(formattedPayload);
    }
  };

  useEffect(() => {
    if (status === StatusEnum.RUNNING && isOpen) {
      setTimeout(() => {
        if (storeFormValues) {
          form.setFieldsValue(storeFormValues);
        }
      }, 100);
    }
    // if (status === StatusEnum.INIT && imageUrl) {
    //   setTimeout(() => {
    //     form.setFieldsValue({
    //       image: {
    //         previewUrl: imageUrl,
    //         type: "ITEM_IMG",
    //       },
    //     });
    //   }, 100);
    // } else
    if (status === StatusEnum.INIT && urlImageUrl &&
      !chatHistorySessionId && !shareCode
    ) {
      setImageUrl(urlImageUrl);
      // setTimeout(() => {
      //   form.setFieldsValue({
      //     image: {
      //       previewUrl: urlImageUrl,
      //       type: "ITEM_IMG",
      //     },
      //   });
      // }, 100);
    }
  }, [status, isOpen]);
  // 监听表单变化，重置风险状态
  const handleFormChange = () => {
    if (isRiskContent) {
      setIsRiskContent(false);
    }
  };
  return (
    biId?.trim() ? null : <FormCard
      status={status}
      isOpen={isOpen}
      handleClick={() => setIsOpen(!isOpen)}
      children={
        <ImageSearchForm
          isRiskContent={isRiskContent}
          title={$t("global-1688-ai-app.select-product.PlatformComponents.PlatformRequirement.xpyqbc", "选品要求补充")}
          form={form}
          onFinish={onFinish}
          imageUrl={imageUrl}
          onFormChange={handleFormChange}
          userRequest={userRequest}
          isDisabled={status === StatusEnum.RUNNING}
          riskMessage={riskMessage}
        />
      }
      titleCardChildren={
        <ImageSearchForm
          isDisabled={status === StatusEnum.RUNNING}
          onFinish={onFinish}
          disabled
          form={form}
          imageUrl={imageUrl || values?.searchImageReq?.imageUrl}
          userRequest={userRequest}
          riskMessage={riskMessage}
        />
      }
      type="imageSearch"
    />
  );
};
