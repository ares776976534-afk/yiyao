import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import RequirementFormCard from "@/components/ChatFlow/RequirementFormCard";
import { Form, message } from "antd";
import { StatusEnum } from "@/pages/select-product/config";
import FormCard from "../FormCard";
import { riskCheck } from "@/pages/select-product/services";
import { $t } from "@/i18n";

// 格式化表单数据
export const formatRequirementData = (values: any) => {
  const {
    minPrice,
    maxPrice,
    minSalesVolume,
    maxSalesVolume,
    minF,
    maxF,
    productKeyword,
    listingTime,
    // cateLev2Id,
    // cateLev1Id,
    ...otherValues
  } = values;

  const days = parseInt(listingTime, 10);
  const now = new Date();
  const startTime = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const searchContexts: any[] = [];

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
    listingTime: {
      startTime: startTime.toISOString().split("T")[0],
      endTime: now.toISOString().split("T")[0],
    },
    searchContexts,
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
      // cateLev2Id,
      // cateLev1Id,
    },
  };
};

interface TypeRequirementProps {
  status: StatusEnum;
  onSubmit: (formattedPayload: any) => void;
  userRequest: any;
}

export const Requirement = observer(
  ({ status, onSubmit, userRequest }: TypeRequirementProps) => {
    const [form] = Form.useForm();
    const [isOpen, setIsOpen] = useState(false);
    const [storeFormValues, setStoreFormValues] = useState<any>(null);
    const [isRiskContent, setIsRiskContent] = useState<boolean>(false);
    const [riskMessage, setRiskMessage] = useState<string>('');
    const handleSubmit = () => {
      const values = form.getFieldsValue();
      setStoreFormValues(values);
      setIsRiskContent(false);
      const formattedPayload = formatRequirementData(values);
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
                    "global-1688-ai-app.select-product.LeftComponents.Requirement.systemError",
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
                  "global-1688-ai-app.select-product.LeftComponents.Requirement.systemError",
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
            ...storeFormValues,
          });
        }, 500);
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
          <RequirementFormCard
            isRiskContent={isRiskContent}
            riskMessage={riskMessage}
            title={$t("global-1688-ai-app.select-product.LeftComponents.Requirement.xpyqbc", "选品要求补充")}
            onFinish={handleSubmit}
            form={form}
            onFormChange={handleFormChange}
            userRequest={userRequest}
            isDisabled={status === StatusEnum.RUNNING}
          />
        }
        titleCardChildren={
          <RequirementFormCard
            isDisabled={status === StatusEnum.RUNNING}
            title=""
            onFinish={handleSubmit}
            disabled
            form={form}
            userRequest={userRequest}
            riskMessage={riskMessage}
          />
        }
        type="product"
      />
    );
  }
);
