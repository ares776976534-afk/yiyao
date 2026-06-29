import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "ice";
import { Form, FormInstance, Select } from "antd";
import { imgIcon } from "@/components/ChatFlow/imgIcon";
import MerchantsUpload from "../BusinessComponents/MerchantsUpload";
import {
  PlatformFormItem,
  ProductKeywordsFormItem,
  RangeFormItem,
} from "@/components/ChatFlow/RequirementFormCard";
import style from "@/components/ChatFlow/RequirementFormCard/index.module.css";
import { AdvancedOptions } from "@/components/ChatFlow/AdvancedOptions";
import { PLATFORM_MAP } from "@/types/country";
import { PanelIcon } from "@/components/Icons";
import { InfoCircleOutlined } from "@ant-design/icons";
import { RiskControlTips } from "@/components/ChatFlow/RiskControlTips";
import useChatQuery from "../../hooks/useChatQuery";
import { useSelectProductStore } from "@/stores/select-product";
import { $t } from "@/i18n";
import { MainBtn } from "@/components/ChatFlow/Btn";

// 根据平台定义支持的国家
const PLATFORM_COUNTRIES = {
  amazon: [
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.beautifulg",
        "美国"
      ),
      value: "US",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.yg",
        "英国"
      ),
      value: "GB",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.xby",
        "西班牙"
      ),
      value: "ES",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.fg",
        "法国"
      ),
      value: "FR",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.dg",
        "德国"
      ),
      value: "DE",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.ylargel",
        "意大利"
      ),
      value: "IT",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.jnlarge",
        "加拿大"
      ),
      value: "CA",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.dayb",
        "日本"
      ),
      value: "JP",
    },
  ],
  tiktok: [
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.ydnxy",
        "印度尼西亚"
      ),
      value: "ID",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.yn",
        "越南"
      ),
      value: "VN",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.mlxy",
        "马来西亚"
      ),
      value: "MY",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.tg",
        "泰国"
      ),
      value: "TH",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.flb",
        "菲律宾"
      ),
      value: "PH",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.beautifulg",
        "美国"
      ),
      value: "US",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.newjp",
        "新加坡"
      ),
      value: "SG",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.bx",
        "巴西"
      ),
      value: "BR",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.mxg",
        "墨西哥"
      ),
      value: "MX",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.yg",
        "英国"
      ),
      value: "GB",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.xby",
        "西班牙"
      ),
      value: "ES",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.fg",
        "法国"
      ),
      value: "FR",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.dg",
        "德国"
      ),
      value: "DE",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.ylargel",
        "意大利"
      ),
      value: "IT",
    },
    {
      label: $t(
        "global-1688-ai-app.select-product.CountryComponents.Form.dayb",
        "日本"
      ),
      value: "JP",
    },
  ],
};

export default function ({
  title,
  form,
  onFinish,
  disabled,
  isRiskContent,
  onFormChange,
  isDisabled,
  imageUrl,
  btnText = $t(
    "global-1688-ai-app.select-product.CountryComponents.Form.confirmxq",
    "确认需求"
  ),
  sourceCountry = "",
  targetCountry = "",
  targetPlatform = "",
  userRequest,
  riskMessage,
}: {
  title?: string;
  form: FormInstance;
  onFinish: (values: any) => void;
  disabled?: boolean;
  imageUrl?: string;
  btnText?: string;
  sourceCountry?: string;
  targetCountry?: string;
  targetPlatform?: string;
  isRiskContent?: boolean;
  onFormChange?: () => void;
  userRequest?: any;
  isDisabled?: boolean;
  riskMessage?: string;
}) {

  const [sourceCountryValue, setSourceCountry] =
    useState<string>(sourceCountry);
  const [targetCountryValue, setTargetCountry] =
    useState<string>(targetCountry);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    targetPlatform || "amazon"
  ); // 默认选择amazon
  const [isOpenOption, setIsOpenOption] = useState(disabled);
  const [countryList, setCountryList] = useState<
    { code: string; name: string; currency: string }[]
  >([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showRiskTips, setShowRiskTips] = useState(false);
  const selectProductStore = useSelectProductStore();
  // TikTok特殊提示的国家列表
  const tiktokSpecialCountries = ["DE", "IT", "FR", "JP", "MX", "BR", "ES"];
  const { chatInput, isMakeSimilar } = useChatQuery();

  // URL参数处理
  const [searchParams] = useSearchParams();
  const urlFromCountry = searchParams.get('fromCountry');
  const urlToCountry = searchParams.get('toCountry');
  const urlPlatform = searchParams.get('platform');
  const urlKeyword = searchParams.get('keyword');
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  // 监听方式1（关键词）和方式2（图片）的值
  const productKeyword = Form.useWatch("productKeyword", form);
  const image = Form.useWatch("image", form);
  const hasMethod1 = !!productKeyword; // 方式1有值
  const hasMethod2 = !!image?.previewUrl; // 方式2有值

  // 判断是否显示TikTok特殊提示
  const shouldShowTiktokWarning =
    selectedPlatform === "tiktok" &&
    sourceCountryValue &&
    tiktokSpecialCountries.includes(sourceCountryValue);

  const checkFormValid = useCallback(async () => {
    try {
      const sourceValue = form.getFieldValue("sourceCountry");
      const targetValue = form.getFieldValue("targetCountry");
      const platformValue = form.getFieldValue("targetPlatform");
      const imageValid = form.getFieldValue("image");
      const productKeywordValid = form.getFieldValue("productKeyword");
      const basicFieldsValid = platformValue && sourceValue && targetValue;
      const contentValid = !!(productKeywordValid || imageValid?.previewUrl);
      const finalValid = Boolean(basicFieldsValid && contentValid);
      setIsFormValid(finalValid);
    } catch (error) {
      setIsFormValid(false);
    }
  }, [form, selectedPlatform, sourceCountryValue, targetCountryValue]);
  // 初始化时同步表单值到状态（只执行一次）
  useEffect(() => {
    if (!disabled) {
      // 设置默认平台，优先使用URL参数
      const defaultPlatform = urlPlatform || targetPlatform || "amazon";
      form.setFieldsValue({ targetPlatform: defaultPlatform });
      setSelectedPlatform(defaultPlatform);

      // 设置对应的国家列表
      const platformData = PLATFORM_MAP.find(
        (platform) => platform.code === defaultPlatform
      );
      if (platformData) {
        setCountryList(platformData.platforms || []);
      }

      // 设置源国家（如果URL参数中有）
      if (urlFromCountry) {
        form.setFieldsValue({ sourceCountry: urlFromCountry });
        setSourceCountry(urlFromCountry);
      }

      // 设置目标国家（如果URL参数中有）
      if (urlToCountry) {
        form.setFieldsValue({ targetCountry: urlToCountry });
        setTargetCountry(urlToCountry);
      }

      // 设置关键词（如果URL参数中有）
      if (urlKeyword) {
        form.setFieldsValue({ productKeyword: urlKeyword });
      }
    } else {
      // disabled状态下同步现有表单值
      const sourceValue = form.getFieldValue("sourceCountry");
      const targetValue = form.getFieldValue("targetCountry");
      const platformValue = form.getFieldValue("targetPlatform");
      if (sourceValue !== undefined) setSourceCountry(sourceValue || "");
      if (targetValue !== undefined) setTargetCountry(targetValue || "");
      if (platformValue !== undefined) setSelectedPlatform(platformValue || "");
    }

    // 初始化后进行一次验证
    setTimeout(() => {
      checkFormValid();
    }, 100);
  }, [disabled, form, targetPlatform]); // 依赖disabled状态和form实例
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
  }, [selectedPlatform, checkFormValid]);
  // 处理表单值变化
  const handleFormChange = (changedValues: any) => {
    // 表单变化时重置风险状态
    onFormChange?.();
    if (changedValues.sourceCountry !== undefined) {
      const newValue = changedValues.sourceCountry || "";
      setSourceCountry(newValue);
    }

    if (changedValues.targetCountry !== undefined) {
      const newValue = changedValues.targetCountry || "";
      setTargetCountry(newValue);
    }

    if (changedValues.targetPlatform !== undefined) {
      const newPlatform = changedValues.targetPlatform || "";
      setSelectedPlatform(newPlatform);

      const selectedPlatformData = PLATFORM_MAP.find(
        (platform) => platform.code === changedValues.targetPlatform
      );
      if (selectedPlatformData) {
        setCountryList(selectedPlatformData.platforms || []);
      }
      if (newPlatform !== selectedPlatform) {
        form.setFieldValue("sourceCountry", undefined);
        form.setFieldValue("targetCountry", undefined);
        form.setFieldValue("productKeyword", undefined);
        setTimeout(() => {
          setSourceCountry("");
          setTargetCountry("");
        }, 0);
      }
    }
    setTimeout(() => {
      checkFormValid();
    }, 50);
  };
  // 获取源国家选项（根据平台和排除目标国家已选择的）
  const getSourceCountryOptions = () => {
    const platformCountries =
      PLATFORM_COUNTRIES[selectedPlatform as keyof typeof PLATFORM_COUNTRIES] ||
      [];
    return platformCountries.filter(
      (option) => option.value !== targetCountryValue
    );
  };

  // 获取目标国家选项（根据平台和排除源国家已选择的）
  const getTargetCountryOptions = () => {
    const platformCountries =
      PLATFORM_COUNTRIES[selectedPlatform as keyof typeof PLATFORM_COUNTRIES] ||
      [];
    return platformCountries.filter(
      (option) => option.value !== sourceCountryValue
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
      (urlFromCountry || urlToCountry || urlPlatform || urlKeyword) &&
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
  }, [urlFromCountry, urlToCountry, urlPlatform, urlKeyword, form, onFinish, disabled, hasAutoSubmitted, isFormValid, countryList]);

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
        <PlatformFormItem platformList={PLATFORM_MAP} isDisabled={isDisabled} />
        <div className={style.countryStyle}>
          <Form.Item
            label={
              <div className="flex items-center">
                <img className="w-4 h-4" src={imgIcon[1]} alt="" srcSet="" />
                <div className="ml-1.5 text-sm font-bold leading-5 text-[#1B1C1D] ">
                  {$t(
                    "global-1688-ai-app.select-product.CountryComponents.Form.gjqyfx",
                    "国家迁移方向"
                  )}
                </div>
                <div className="ml-0.5 text-[#FF4D4F] text-sm font-normal leading-5">
                  *
                </div>
              </div>
            }
            name=""
            extra={
              shouldShowTiktokWarning && (
                <div className={style.requirementFormCardLabelInfo}>
                  <InfoCircleOutlined />
                  <div className={style.requirementFormCardLabelInfoText}>
                    {$t(
                      "global-1688-ai-app.select-product.CountryComponents.Form.Tktjdjlxx",
                      "Tiktok该站点开通时间较短商品量较少，对选品效果会有影响"
                    )}
                  </div>
                </div>
              )
            }
          >
            <div className="flex items-center text-[#4D4D5F]">
              {$t(
                "global-1688-ai-app.select-product.CountryComponents.Form.viewc",
                "查看从"
              )}
              <Form.Item name="sourceCountry" noStyle>
                <Select
                  style={{ width: "221px", margin: "0 12px" }}
                  options={getSourceCountryOptions()}
                  allowClear
                  placeholder={$t(
                    "global-1688-ai-app.select-product.CountryComponents.Form.qselectygj",
                    "请选择源国家"
                  )}
                  onChange={(value) => {
                    if (value === targetCountryValue) {
                      form.setFieldValue("targetCountry", undefined);
                    }
                  }}
                  disabled={isDisabled}
                />
              </Form.Item>
            </div>
            <div className="flex items-center text-[#4D4D5F]">
              {$t(
                "global-1688-ai-app.select-product.CountryComponents.Form.qyd",
                "迁移到"
              )}
              <Form.Item name="targetCountry" noStyle>
                <Select
                  style={{ width: "221px", margin: "0 12px" }}
                  options={getTargetCountryOptions()}
                  allowClear
                  placeholder={$t(
                    "global-1688-ai-app.select-product.CountryComponents.Form.qcj",
                    "请选择目标国家"
                  )}
                  onChange={(value) => {
                    if (value === sourceCountryValue) {
                      form.setFieldValue("sourceCountry", undefined);
                    }
                  }}
                  disabled={isDisabled}
                />
              </Form.Item>
            </div>
            <div className="text-[#4d4d5f]">
              {$t(
                "global-1688-ai-app.select-product.CountryComponents.Form.dscjh",
                "的市场机会"
              )}
            </div>
          </Form.Item>
        </div>
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
                  "global-1688-ai-app.select-product.CountryComponents.Form.iKroi",
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
                  "global-1688-ai-app.select-product.CountryComponents.Form.fpy",
                  "方式1：输入关键词"
                )}
              </div>
              {isRiskContent && (
                <div className={style.method1TitleText}>
                  {$t(
                    "global-1688-ai-app.select-product.CountryComponents.Form.qyy",
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
            selectedCountry={sourceCountryValue}
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
