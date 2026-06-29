import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "ice";
import MerchantsUpload from "../BusinessComponents/MerchantsUpload";
// import { ImgIcon } from '@/components/Icon';
import { Form, FormInstance, Select, Button } from "antd";
import { imgIcon } from "@/components/ChatFlow/imgIcon";
import { PLATFORM_COUNTRIES } from "@/types/country";
import {
  CountryFormItem,
  ProductKeywordsFormItem,
  RangeFormItem,
} from "@/components/ChatFlow/RequirementFormCard";
import style from "@/components/ChatFlow/RequirementFormCard/index.module.css";
import { AdvancedOptions } from "@/components/ChatFlow/AdvancedOptions";
import FollowedCategoriesItem from "@/components/ChatFlow/RequirementFormCard/components/FollowedCategoriesItem";
import { PanelIcon } from "@/components/Icons";
import { RiskControlTips } from "@/components/ChatFlow/RiskControlTips";
import useChatQuery from "../../hooks/useChatQuery";
import { useSelectProductStore } from "@/stores/select-product";
import { $t } from "@/i18n";
import { MainBtn } from "@/components/ChatFlow/Btn";

const countryList = PLATFORM_COUNTRIES;

const platformOptions = [
  { label: "Amazon", value: "amazon" },
  { label: "TikTok", value: "tiktok" },
];

export default function ({
  title,
  form,
  onFinish,
  disabled,
  imageUrl,
  btnText = $t(
    "global-1688-ai-app.select-product.PlatformComponents.Form.confirmxq",
    "确认需求"
  ),
  selectedCountryCode = "",
  targetPlatform = "",
  sourcePlatform = "",
  userRequest,
  isRiskContent,
  onFormChange,
  isDisabled,
  riskMessage,
}: {
  title?: string;
  form: FormInstance;
  onFinish: (values: any) => void;
  disabled?: boolean;
  imageUrl?: string;
  btnText?: string;
  selectedCountryCode?: string;
  targetPlatform?: string;
  sourcePlatform?: string;
  isRiskContent?: boolean;
  onFormChange?: () => void;
  userRequest?: any;
  isDisabled?: boolean;
  riskMessage?: string;
}) {
  const [sourcePlatformValue, setSourcePlatform] = useState<string>(
    sourcePlatform || "amazon"
  ); // 默认选择amazon
  const [targetPlatformValue, setTargetPlatform] =
    useState<string>(targetPlatform);
  const [selectedCountry, setSelectedCountry] =
    useState<string>(selectedCountryCode);
  const [isOpenOption, setIsOpenOption] = useState(disabled);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showRiskTips, setShowRiskTips] = useState(false);
  const { chatInput, isMakeSimilar } = useChatQuery();
  const selectProductStore = useSelectProductStore();

  // URL参数处理
  const [searchParams] = useSearchParams();
  const urlFromPlatform = searchParams.get('fromPlatform');
  const urlToPlatform = searchParams.get('toPlatform');
  const urlKeyword = searchParams.get('keyword');
  const urlCountry = searchParams.get('country');
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  // 监听方式1（关键词）和方式2（图片）的值
  const productKeyword = Form.useWatch("productKeyword", form);
  const image = Form.useWatch("image", form);
  const hasMethod1 = !!productKeyword; // 方式1有值
  const hasMethod2 = !!image?.previewUrl; // 方式2有值
  // 验证表单是否有效
  const checkFormValid = useCallback(() => {
    try {
      const sourceValue = form.getFieldValue("sourcePlatform");
      const targetValue = form.getFieldValue("targetPlatform");
      const countryValue = form.getFieldValue("targetCountry");
      const imageValid = form.getFieldValue("image");
      const productKeywordValid = form.getFieldValue("productKeyword");
      const basicFieldsValid = countryValue && sourceValue && targetValue;
      const contentValid = !!(productKeywordValid || imageValid?.previewUrl);
      const finalValid = Boolean(basicFieldsValid && contentValid);
      setIsFormValid(finalValid);
    } catch (error) {
      setIsFormValid(false);
    }
  }, [form, selectedCountry, sourcePlatformValue, targetPlatformValue]);

  // 初始化时同步表单值到状态（只执行一次）
  useEffect(() => {
    if (!disabled) {
      // 设置默认源平台，优先使用URL参数
      const defaultSourcePlatform = urlFromPlatform || sourcePlatform || "amazon";
      form.setFieldsValue({ sourcePlatform: defaultSourcePlatform });
      setSourcePlatform(defaultSourcePlatform);

      // 设置目标平台（如果URL参数中有）
      if (urlToPlatform) {
        form.setFieldsValue({ targetPlatform: urlToPlatform });
        setTargetPlatform(urlToPlatform);
      }

      // 设置关键词（如果URL参数中有）
      if (urlKeyword) {
        form.setFieldsValue({ productKeyword: urlKeyword });
      }

      // 设置国家，优先使用URL参数
      const targetCountry = urlCountry && countryList.find(c => c.code === urlCountry)
        ? urlCountry
        : countryList[0]?.code;
      if (targetCountry) {
        form.setFieldsValue({ targetCountry });
        setSelectedCountry(targetCountry);
      }
    } else {
      // disabled状态下同步现有表单值
      const sourceValue = form.getFieldValue("sourcePlatform");
      const targetValue = form.getFieldValue("targetPlatform");
      const countryValue = form.getFieldValue("targetCountry");
      if (sourceValue !== undefined) setSourcePlatform(sourceValue || "");
      if (targetValue !== undefined) setTargetPlatform(targetValue || "");
      if (countryValue !== undefined) setSelectedCountry(countryValue || "");
    }

    // 初始化后进行一次验证
    setTimeout(() => {
      checkFormValid();
    }, 100);
  }, [disabled, form, sourcePlatform]); // 依赖disabled状态和form实例

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
  // 监听isRiskContent变化，显示风险提示
  useEffect(() => {
    if (isRiskContent) {
      setShowRiskTips(true);
    }
  }, [isRiskContent]);

  // 监听平台变化，重新验证表单
  useEffect(() => {
    if (form) {
      setTimeout(() => {
        checkFormValid();
      }, 100);
    }
  }, [sourcePlatformValue, targetPlatformValue, checkFormValid]);
  const handleFormChange = (changedValues: any) => {
    // 表单变化时重置风险状态
    onFormChange?.();
    if (changedValues.sourcePlatform !== undefined) {
      const newValue = changedValues.sourcePlatform || "";
      setSourcePlatform(newValue);

      // sourcePlatform变化时清空相应字段
      if (form) {
        if (newValue === "tiktok") {
          // TikTok平台清空关键词
          form.setFieldsValue({ productKeyword: undefined });
        } else if (newValue === "amazon") {
          // Amazon平台清空类目
          form.setFieldsValue({
            followedCategories: undefined,
            followedCategoriesMax: undefined,
          });
        }
      }
    }

    if (changedValues.targetPlatform !== undefined) {
      const newValue = changedValues.targetPlatform || "";
      setTargetPlatform(newValue);
    }

    if (changedValues.targetCountry !== undefined) {
      const newValue = changedValues.targetCountry || "";
      setSelectedCountry(newValue);
    }
    setTimeout(() => {
      checkFormValid();
    }, 50);
  };
  // 获取源平台选项（排除目标平台已选择的）
  const getSourcePlatformOptions = () => {
    return platformOptions.filter(
      (option) => option.value !== targetPlatformValue
    );
  };

  // 获取目标平台选项（排除源平台已选择的）
  const getTargetPlatformOptions = () => {
    return platformOptions.filter(
      (option) => option.value !== sourcePlatformValue
    );
  };

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
      handleFormChange(chatInputData);
      selectProductStore.setFormattedPayload(chatInputData);
    }
  }, [chatInput, form, userRequest]);

  // URL参数自动提交
  useEffect(() => {
    if (
      !disabled &&
      !hasAutoSubmitted &&
      (urlFromPlatform || urlToPlatform || urlKeyword || urlCountry) &&
      form &&
      onFinish &&
      isFormValid
    ) {
      const timer = setTimeout(() => {
        setHasAutoSubmitted(true);
        onFinish(form.getFieldsValue());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [urlFromPlatform, urlToPlatform, urlKeyword, urlCountry, form, onFinish, disabled, hasAutoSubmitted, isFormValid]);

  return (
    <div
      className={style.requirementFormCard}
      style={title ? {} : { marginTop: "20px" }}
    >
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
        onValuesChange={handleFormChange}
      >
        <div className={style.countryStyle}>
          <Form.Item
            label={
              <div className="flex items-center">
                <img className="w-4 h-4" src={imgIcon[1]} alt="" srcSet="" />
                <div className="ml-1.5 text-sm font-bold leading-5 text-[#1B1C1D]">
                  {$t(
                    "global-1688-ai-app.select-product.PlatformComponents.Form.ptqyfx",
                    "平台迁移方向"
                  )}
                </div>
                <div className="ml-0.5 text-[#FF4D4F] text-sm font-normal leading-5">
                  *
                </div>
              </div>
            }
            name=""
          >
            <div className="flex items-center text-[#4D4D5F]">
              {$t(
                "global-1688-ai-app.select-product.PlatformComponents.Form.viewc",
                "查看从"
              )}
              <Form.Item name="sourcePlatform" noStyle>
                <Select
                  style={{ width: "221px", margin: "0 12px" }}
                  options={getSourcePlatformOptions()}
                  allowClear
                  placeholder={$t(
                    "global-1688-ai-app.select-product.PlatformComponents.Form.qselectypt",
                    "请选择源平台"
                  )}
                  onChange={(value) => {
                    if (value === targetPlatformValue) {
                      form.setFieldValue("targetPlatform", undefined);
                    }
                    if (!value) {
                      setSourcePlatform("");
                      setTimeout(() => {
                        setTargetPlatform(targetPlatformValue);
                      }, 0);
                    }
                  }}
                  disabled={isDisabled}
                />
              </Form.Item>
            </div>
            <div className="flex items-center text-[#4D4D5F]">
              {$t(
                "global-1688-ai-app.select-product.PlatformComponents.Form.qyd",
                "迁移到"
              )}
              <Form.Item name="targetPlatform" noStyle>
                <Select
                  style={{ width: "221px", margin: "0 12px" }}
                  options={getTargetPlatformOptions()}
                  allowClear
                  placeholder={$t(
                    "global-1688-ai-app.select-product.PlatformComponents.Form.qct",
                    "请选择目标平台"
                  )}
                  onChange={(value) => {
                    if (value === sourcePlatformValue) {
                      form.setFieldValue("sourcePlatform", undefined);
                    }
                    if (!value) {
                      setTargetPlatform("");
                      setTimeout(() => {
                        setSourcePlatform(sourcePlatformValue);
                      }, 0);
                    }
                  }}
                  disabled={isDisabled}
                />
              </Form.Item>
            </div>
            <div>
              {$t(
                "global-1688-ai-app.select-product.PlatformComponents.Form.dscjh",
                "的市场机会"
              )}
            </div>
          </Form.Item>
        </div>
        <CountryFormItem
          countryList={countryList}
          selectedPlatform={sourcePlatformValue}
          selectedCountry={selectedCountry}
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
                  "global-1688-ai-app.select-product.PlatformComponents.Form.iKroi",
                  "输入关键词或商品图片（以下2选1）"
                )}
              </div>
              <div className={style.requirementFormCardLabelRequired}>*</div>
            </div>
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
                  "global-1688-ai-app.select-product.PlatformComponents.Form.fpy",
                  "方式1：输入关键词"
                )}
              </div>
              {isRiskContent && (
                <div className={style.method1TitleText}>
                  {$t(
                    "global-1688-ai-app.select-product.PlatformComponents.Form.qyy",
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
            handleBtn={() => onFinish(form.getFieldsValue())}
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
