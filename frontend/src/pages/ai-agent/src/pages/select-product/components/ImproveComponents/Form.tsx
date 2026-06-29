import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "ice";
import MerchantsUpload from "../BusinessComponents/MerchantsUpload";
import { Form, FormInstance } from "antd";
import { PLATFORM_MAP } from "@/types/country";
import {
  CountryFormItem,
  PlatformFormItem,
  ProductKeywordsFormItem,
  RangeFormItem,
} from "@/components/ChatFlow/RequirementFormCard";
import style from "@/components/ChatFlow/RequirementFormCard/index.module.css";
import { AdvancedOptions } from "@/components/ChatFlow/AdvancedOptions";
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
  platform = "amazon",
  btnText = $t(
    "global-1688-ai-app.select-product.ImproveComponents.Form.confirmxq",
    "确认需求"
  ),
  title,
  selectedCountryCode = "",
  userRequest,
  isDisabled,
  riskMessage,
}: {
  form: FormInstance;
  onFinish: (values: any) => void;
  disabled?: boolean;
  imageUrl?: string;
  platform?: string;
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
  const [selectedCountry, setSelectedCountry] =
    useState<string>(selectedCountryCode);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(platform);
  const [countryList, setCountryList] = useState<
    { code: string; name: string; currency: string }[]
  >([]);
  const [isOpenOption, setIsOpenOption] = useState(disabled);
  const [showRiskTips, setShowRiskTips] = useState(false);
  const { isMakeSimilar, chatInput } = useChatQuery();
  const selectProductStore = useSelectProductStore();

  // URL参数处理
  const [searchParams] = useSearchParams();
  const urlKeyword = searchParams.get('keyword');
  const urlPlatform = searchParams.get('platform');
  const urlCountry = searchParams.get('country');
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  // 监听方式1（关键词）和方式2（图片）的值
  const productKeyword = Form.useWatch("productKeyword", form);
  const image = Form.useWatch("image", form);
  const hasMethod1 = !!productKeyword; // 方式1有值
  const hasMethod2 = !!image?.previewUrl; // 方式2有值

  // 默认选择亚马逊
  const defaultPlatform = platform;
  const checkFormValid = useCallback(async () => {
    try {
      await form.validateFields({ validateOnly: true });
      if (
        !form.getFieldValue("productKeyword") &&
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
    // 处理平台选择变化
    if (changedValues.targetPlatform) {
      setSelectedPlatform(changedValues.targetPlatform);
      const selectedPlatformData = PLATFORM_MAP.find(
        (platform) => platform.code === changedValues.targetPlatform
      );
      if (selectedPlatformData) {
        const newCountryList = selectedPlatformData.platforms || [];
        setCountryList(newCountryList);
        // 如果国家列表有值且当前没有选中国家，则默认选中第一个
        if (newCountryList.length > 0 && form) {
          const currentCountry = form.getFieldValue("targetCountry");
          if (!currentCountry) {
            form.setFieldsValue({
              targetCountry: newCountryList[0].code,
            });
            setSelectedCountry(newCountryList[0].code);
          }
        }
      }
      if (form) {
        if (changedValues.targetPlatform !== "amazon") {
          form.setFieldsValue({ productKeyword: undefined });
        }
        if (changedValues.targetPlatform !== "tiktok") {
          form.setFieldsValue({
            followedCategories: undefined,
            followedCategoriesMax: undefined,
          });
        }
      }
    }

    // 处理国家选择变化
    if (changedValues.targetCountry) {
      setSelectedCountry(changedValues.targetCountry);
    }

    setTimeout(() => {
      checkFormValid();
    }, 50);
  };

  const handleSubmit = async () => {
    onFinish && onFinish(form.getFieldsValue());
  };

  useEffect(() => {
    if (disabled && form?.getFieldValue("targetCountry")) {
      const countryValue = form?.getFieldValue("targetCountry");
      const platformValue = form?.getFieldValue("targetPlatform");
      setSelectedCountry(countryValue);
      // 设置当前平台
      if (platformValue) {
        setSelectedPlatform(platformValue);
        const selectedPlatformData = PLATFORM_MAP.find(
          (platform) => platform.code === platformValue
        );
        if (selectedPlatformData) {
          setCountryList(selectedPlatformData.platforms || []);
        }
      }
    }
  }, [disabled, form]);

  // 初始化时检查表单状态
  useEffect(() => {
    const timer = setTimeout(() => {
      checkFormValid();
    }, 100);
    return () => clearTimeout(timer);
  }, [checkFormValid]);
  // 初始化默认选择亚马逊
  useEffect(() => {
    if (!disabled && form) {
      // 设置默认平台，优先使用URL参数
      const initPlatform = urlPlatform || defaultPlatform;
      form.setFieldsValue({ targetPlatform: initPlatform });
      setSelectedPlatform(initPlatform);
      // 设置对应的国家列表
      const platformData = PLATFORM_MAP.find(
        (platform) => platform.code === initPlatform
      );
      if (platformData) {
        const newCountryList = platformData.platforms || [];
        setCountryList(newCountryList);
        // 设置国家，优先使用URL参数
        const targetCountry = urlCountry && newCountryList.find(c => c.code === urlCountry)
          ? urlCountry
          : newCountryList[0]?.code;
        if (targetCountry) {
          form.setFieldsValue({ targetCountry });
          setSelectedCountry(targetCountry);
        }
      }
      // 设置关键词（如果URL参数中有）
      if (urlKeyword) {
        form.setFieldsValue({ productKeyword: urlKeyword });
      }
    }
  }, [form, disabled]);

  // 监听 countryList 变化，自动设置默认值
  useEffect(() => {
    if (countryList && countryList.length > 0 && form && !disabled) {
      const currentCountry = form.getFieldValue("targetCountry");
      // 如果当前没有选中国家，则设置默认值为第一个国家
      if (!currentCountry) {
        form.setFieldsValue({
          targetCountry: countryList[0].code,
        });
        setSelectedCountry(countryList[0].code);
      }
    }
  }, [countryList, form, disabled]);
  useEffect(() => {
    if (
      (chatInput && isMakeSimilar) ||
      (userRequest && Object.keys(userRequest).length > 0)
    ) {
      const chatInputData = chatInput || userRequest;
      const { searchContexts = [] } = chatInputData;
      const imgContent = searchContexts.find(
        (item: any) => item.contentType === "image_url"
      );
      const textContent = searchContexts.find(
        (item: any) => item.contentType === "text"
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

  // URL参数自动提交
  useEffect(() => {
    if (
      !disabled &&
      !hasAutoSubmitted &&
      (urlKeyword || urlPlatform || urlCountry) &&
      form &&
      onFinish &&
      isFormValid &&
      countryList.length > 0
    ) {
      const timer = setTimeout(() => {
        setHasAutoSubmitted(true);
        onFinish(form.getFieldsValue());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [urlKeyword, urlPlatform, urlCountry, form, onFinish, disabled, hasAutoSubmitted, isFormValid, countryList]);

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
        <PlatformFormItem platformList={PLATFORM_MAP} isDisabled={isDisabled} />
        <CountryFormItem
          countryList={countryList}
          selectedPlatform={selectedPlatform}
          selectedCountry={selectedCountry}
          isDisabled={isDisabled}
        />
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
                {$t(
                  "global-1688-ai-app.select-product.ImproveComponents.Form.iKroi",
                  "输入关键词或商品图片（以下2选1）"
                )}
              </div>
              <div className={style.requirementFormCardLabelRequired}>*</div>
            </div>
            {/* <div className={style.copywriting}>{$t("global-1688-ai-app.select-product.ImproveComponents.Form.yx2x1", "以下2选1")}</div> */}
          </div>
          {/* 方式1 */}
          <div
            className={`${style.method1} ${hasMethod2 ? style.methodMasked : ""
              }`}
          >
            {hasMethod2 && <div className={style.methodMask} />}
            <div className={style.method1TitleContainer}>
              <div className={style.method1Title}>
                {$t(
                  "global-1688-ai-app.select-product.ImproveComponents.Form.fpy",
                  "方式1：输入关键词"
                )}
              </div>
              {isRiskContent && (
                <div className={style.method1TitleText}>
                  {$t(
                    "global-1688-ai-app.select-product.ImproveComponents.Form.qyy",
                    "请重试其他关键词"
                  )}
                </div>
              )}
            </div>
            <ProductKeywordsFormItem
              label={false}
              isRiskContent={isRiskContent}
              isDisabled={isDisabled}
            />
          </div>
          {/* 方式2 */}
          <div
            className={`${hasMethod1 ? style.methodMasked : ""}`}
            style={{ position: "relative" }}
          >
            {hasMethod1 && <div className={style.methodMask} />}
            <Form.Item name="image" label="">
              <MerchantsUpload
                disabled={isDisabled || disabled}
                imageUrl={imageUrl}
                isMethod={true}
              />
            </Form.Item>
          </div>
        </div>
        {isOpenOption && (
          <RangeFormItem
            isOpenOption={isOpenOption}
            form={form}
            selectedCountry={selectedCountry}
            countryList={countryList}
          />
        )}
        {!disabled && (
          <AdvancedOptions
            isOpenOption={isOpenOption}
            onOpen={setIsOpenOption}
          />
        )}
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
              lineHeight: '24px'
            }}
            other={{
              disabled: !isFormValid
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
