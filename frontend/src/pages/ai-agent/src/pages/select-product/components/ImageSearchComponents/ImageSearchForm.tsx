import { useState, useEffect, useCallback } from "react";
import MerchantsUpload from "../BusinessComponents/MerchantsUpload";
import { Form, FormInstance } from "antd";
import style from "@/components/ChatFlow/RequirementFormCard/index.module.css";
import { PanelIcon } from "@/components/Icons";
import { RiskControlTips } from "@/components/ChatFlow/RiskControlTips";
import { imgIcon } from "@/components/ChatFlow/imgIcon";
import useChatQuery from "../../hooks/useChatQuery";
import { useSelectProductStore } from "@/stores/select-product";
import { $t } from "@/i18n";
import { MainBtn } from "@/components/ChatFlow/Btn";

export default function ({
  form,
  onFinish,
  disabled,
  isRiskContent,
  onFormChange,
  imageUrl,
  // platform = "amazon",
  btnText = $t(
    "global-1688-ai-app.select-product.ImproveComponents.Form.confirmxq",
    "确认需求",
  ),
  title,
  // selectedCountryCode = "",
  userRequest,
  isDisabled,
  riskMessage,
}: {
  form: FormInstance;
  onFinish: (values: any) => void;
  disabled?: boolean;
  imageUrl?: string;
  // platform?: string;
  btnText?: string;
  title?: React.ReactNode | string;
  selectedCountryCode?: string;
  isRiskContent?: boolean;
  onFormChange?: () => void;
  userRequest?: any;
  isDisabled?: boolean;
  riskMessage?: string;
}) {
  const [isFormValid, setIsFormValid] = useState(false);
  // const [selectedCountry, setSelectedCountry] =
  //   useState<string>(selectedCountryCode);
  // const [selectedPlatform, setSelectedPlatform] = useState<string>(platform);
  // const [countryList, setCountryList] = useState<
  //   { code: string; name: string; currency: string }[]
  // >([]);
  const [isOpenOption, setIsOpenOption] = useState(disabled);
  const [showRiskTips, setShowRiskTips] = useState(false);
  const { isMakeSimilar, chatInput } = useChatQuery();
  const selectProductStore = useSelectProductStore();

  // 监听方式1（关键词）和方式2（图片）的值
  // const productKeyword = Form.useWatch("productKeyword", form);
  // const image = Form.useWatch("image", form);
  // const hasMethod1 = !!productKeyword; // 方式1有值
  // const hasMethod2 = !!image?.previewUrl; // 方式2有值

  const checkFormValid = useCallback(async () => {
    try {
      await form.validateFields({ validateOnly: true });
      if (
        // !form.getFieldValue("productKeyword") &&
        !form.getFieldValue("image")?.previewUrl
      ) {
        setIsFormValid(false);
        return;
      }
      setIsFormValid(true);
    } catch (error) {
      setIsFormValid(false);
    }
  }, [form]);
  // 监听isRiskContent变化，显示风险提示
  useEffect(() => {
    if (isRiskContent) {
      setShowRiskTips(true);
    }
  }, [isRiskContent]);
  const handleValuesChange = (changedValues: any) => {
    // 表单变化时重置风险状态
    onFormChange?.();
    setTimeout(() => {
      checkFormValid();
    }, 50);
  };

  const handleSubmit = async () => {
    onFinish && onFinish(form.getFieldsValue());
  };

  // 初始化时检查表单状态
  useEffect(() => {
    const timer = setTimeout(() => {
      checkFormValid();
    }, 100);
    return () => clearTimeout(timer);
  }, [checkFormValid]);


  // useEffect(() => {
  //   checkFormValid();
  // }, [image]);

  useEffect(() => {
    if (
      (chatInput && isMakeSimilar) ||
      (userRequest && Object.keys(userRequest).length > 0)
    ) {
      const chatInputData = chatInput || userRequest;
      const { searchContexts = [] } = chatInputData;
      const imgContent = searchContexts.find(
        (item: any) => item.contentType === "image_url",
      );
      const textContent = searchContexts.find(
        (item: any) => item.contentType === "text",
      );
      const _image = imgContent
        ? {
          previewUrl: imgContent.imageUrl,
          type: "ITEM_IMG",
          currentRegion: imgContent.cropRegion,
        }
        : {};
      form?.setFieldsValue({
        ...chatInputData,
        image: _image,
        productKeyword: textContent?.productKeyword,
      });
      handleValuesChange(chatInputData);
      selectProductStore.setFormattedPayload(chatInputData);
    }
  }, [chatInput, form, userRequest]);

  return (
    <div className={style.requirementFormCard}>
      {title && (
        <div className={style.requirementFormCardTitle}>
          <PanelIcon style={{ width: 20, height: 20 }} />
          {title}
        </div>
      )}
      <Form
        name="basic"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        autoComplete="off"
        layout="vertical"
        form={form}
        disabled={disabled}
        onValuesChange={handleValuesChange}
      >
        <div className={style.methodContent}>
          <div className={style.methodContentTitle}>
            <div className={style.requirementFormCardLabel}>
              <img
                className={style.imgIcon}
                src={imgIcon[2]}
                alt=""
                srcSet=""
              />
              <div className={style.requirementFormCardLabelText}>
                {/* {$t(
                  "global-1688-ai-app.select-product.ImproveComponents.Form.iKroi",
                  "输入关键词或商品图片（以下2选1）",
                )} */}
                {$t('global-1688-ai-app.select-product.ImageSearchComponents.ImageSearchForm.pleaseInputProductImage', '请输入商品图片')}
              </div>
              <div className={style.requirementFormCardLabelRequired}>*</div>
            </div>
          </div>
          {/* 方式2 */}
          <div
            style={{ position: "relative" }}
          >
            <Form.Item name="image" label="">
              <MerchantsUpload
                disabled={isDisabled || disabled}
                imageUrl={imageUrl}
                // isMethod
              />
            </Form.Item>
          </div>
        </div>
        {/* {isOpenOption && (
          <RangeFormItem
            isOpenOption={isOpenOption}
            form={form}
            selectedCountry={selectedCountry}
            countryList={countryList}
          />
        )} */}
        {/* {!disabled && (
          <AdvancedOptions
            isOpenOption={isOpenOption}
            onOpen={setIsOpenOption}
          />
        )} */}
      </Form>
      {!disabled && (
        <div className="flex items-center justify-center">
          <MainBtn
            handleBtn={handleSubmit}
            text={btnText}
            style={{
              height: 40,
              width: 200,
              fontSize: 16,
              fontWeight: 500,
              lineHeight: '24px',
            }}
            other={{
              disabled: !isFormValid,
            }}
          />
        </div>
      )}
      <RiskControlTips
        visible={showRiskTips}
        onClose={() => setShowRiskTips(false)}
        riskMessage={riskMessage}
      />
    </div>
  );
}
