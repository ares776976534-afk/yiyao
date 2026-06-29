import React, { useState, useEffect } from "react";
import { Form, Input, Radio, InputNumber, FormInstance } from "antd";
import { observer } from "mobx-react-lite";
import style from "./index.module.css";
import { imgIcon } from "../imgIcon";
import { PLATFORM_MAP } from "@/types/country";
import { TiktokIcon, FormFailureIcon } from "@/components/Icon";
import { AdvancedOptions } from "../AdvancedOptions";
import { PanelIcon } from "@/components/Icons";
import { RiskControlTips } from "../RiskControlTips";
import useChatQuery from "@/pages/select-product/hooks/useChatQuery";
import dayjs from "dayjs";
import { useSelectProductStore } from "@/stores/select-product";
import { $t } from "@/i18n";
import { MainBtn } from "../Btn";
import { useSearchParams } from 'ice';

interface RequirementFormCardProps {
  title?: React.ReactNode | string;
  onFinish?: () => void;
  form?: FormInstance;
  disabled?: boolean;
  platform?: string;
  isFormValids?: boolean;
  btnText?: string;
  selectedCountryCode?: string;
  type?: string;
  isRiskContent?: boolean;
  onFormChange?: () => void;
  userRequest?: any;
  isDisabled?: boolean;
  riskMessage?: string;
}

interface ProductKeywordsFormItemProps {
  isRequired?: boolean,
  isRiskContent?: boolean,
  label?: boolean,
  isDisabled?: boolean,
}

export const ProductKeywordsFormItem = ({
  isRequired = false,
  isRiskContent = false,
  label = true,
  isDisabled,
}: ProductKeywordsFormItemProps) => (
  <Form.Item
    label={
      label && (
        <div className={style.requirementFormCardLabel}>
          <img className={style.imgIcon} src={imgIcon[2]} alt="" srcSet="" />
          <div className={style.requirementFormCardLabelText}>
            {$t(
              "global-1688-ai-app.ChatFlow.RequirementFormCard.keyword",
              "关键词"
            )}
          </div>
          {isRequired && (
            <div className={style.requirementFormCardLabelRequired}>*</div>
          )}
        </div>
      )
    }
    name="productKeyword"
    rules={
      isRequired
        ? [
          {
            validator: (_, value) => {
              if (!value || value.trim() === "") {
                return Promise.reject(
                  new Error(
                    $t(
                      "global-1688-ai-app.ChatFlow.RequirementFormCard.qto",
                      "请输入关键词"
                    )
                  )
                );
              }
              return Promise.resolve();
            },
          },
        ]
        : undefined
    }
  >
    <Input
      placeholder={$t(
        "global-1688-ai-app.ChatFlow.RequirementFormCard.qtopz",
        "可以输入需要搜索的商品关键词，支持中文/英文"
      )}
      className={`${isRiskContent ? style.riskInput : ""} ${style.keyInput}`}
      disabled={isDisabled}
    />
  </Form.Item>
);

export const CountryFormItem = ({
  countryList,
  selectedPlatform,
  selectedCountry,
  isDisabled,
}: {
  countryList: { code: string; name: string }[];
  selectedPlatform?: string;
  selectedCountry?: string;
  isDisabled?: boolean;
}) => {
  const tiktokSpecialCountries = ["DE", "IT", "FR", "JP", "MX", "BR", "ES"];
  const shouldShowTiktokWarning =
    selectedPlatform === "tiktok" &&
    selectedCountry &&
    tiktokSpecialCountries.includes(selectedCountry);
  return (
    <Form.Item
      label={
        <div className={style.requirementFormCardLabel}>
          <img className={style.imgIcon} src={imgIcon[1]} alt="" srcSet="" />
          <div className={style.requirementFormCardLabelText}>
            {$t(
              "global-1688-ai-app.ChatFlow.RequirementFormCard.fwe",
              "关注的国家/地区"
            )}
          </div>
          <div className={style.requirementFormCardLabelRequired}>*</div>
        </div>
      }
      name="targetCountry"
      rules={[
        {
          required: true,
          message: $t(
            "global-1688-ai-app.ChatFlow.RequirementFormCard.qcljo",
            "请选择关注的国家/地区"
          ),
        },
      ]}
      extra={
        shouldShowTiktokWarning && (
          <div className={style.requirementFormCardLabelInfo}>
            <FormFailureIcon />
            <div className={style.requirementFormCardLabelInfoText}>
              {$t(
                "global-1688-ai-app.ChatFlow.RequirementFormCard.Tktjdjlxx",
                "Tiktok该站点开通时间较短商品量较少，对选品效果会有影响"
              )}
            </div>
          </div>
        )
      }
    >
      <Radio.Group
        size="large"
        className={style.radioGroup}
        disabled={isDisabled}
      >
        {countryList.map((country) => (
          <Radio.Button key={country.code} value={country.code}>
            {country.name}
          </Radio.Button>
        ))}
      </Radio.Group>
    </Form.Item>
  );
};

export const PlatformFormItem = ({
  platformList,
  isDisabled,
}: {
  isDisabled?: boolean;
  platformList: { code: string; name: string }[];
  form?: FormInstance;
}) => {
  const platform_map = {
    amazon: (
      <img
        style={{ width: "16px", height: "16px" }}
        src={imgIcon[21]}
        alt=""
        srcSet=""
      />
    ),
    tiktok: <TiktokIcon width={16} height={16} />,
  };
  return (
    <Form.Item
      label={
        <div className={style.requirementFormCardLabel}>
          <img className={style.imgIcon} src={imgIcon[3]} alt="" srcSet="" />
          <div className={style.requirementFormCardLabelText}>
            {$t(
              "global-1688-ai-app.ChatFlow.RequirementFormCard.followdpt",
              "关注的平台"
            )}
          </div>
          <div className={style.requirementFormCardLabelRequired}>*</div>
        </div>
      }
      name="targetPlatform"
      rules={[
        {
          required: true,
          message: $t(
            "global-1688-ai-app.ChatFlow.RequirementFormCard.qclt",
            "请选择关注的平台"
          ),
        },
      ]}
    >
      <Radio.Group
        size="large"
        className={style.radioGroup}
        disabled={isDisabled}
      >
        {platformList.map((platform) => (
          <Radio.Button key={platform.code} value={platform.code}>
            <div className={style.platformRadioGroup}>
              {platform_map[platform.code]}
              {platform.name}
            </div>
          </Radio.Button>
        ))}
      </Radio.Group>
    </Form.Item>
  );
};

export const RangeFormItem = ({
  form,
  selectedCountry,
  countryList,
  isOpenOption,
}: {
  isOpenOption?: boolean;
  form?: FormInstance;
  selectedCountry?: string;
  countryList?: { code: string; name: string; currency: string }[];
}) => {
  // 根据选中国家获取币种
  const getCurrency = () => {
    if (!selectedCountry) return "$";
    const countryData = countryList?.find(
      (countryItem) => countryItem.code === selectedCountry
    );
    return countryData?.currency || "$";
  };

  const currency = getCurrency();
  useEffect(() => {
    if (!isOpenOption) {
      form?.setFieldsValue({
        minPrice: undefined,
        maxPrice: undefined,
        minF: undefined,
        maxF: undefined,
        minSalesVolume: undefined,
        maxSalesVolume: undefined,
      });
    }
  }, [isOpenOption]);
  return (
    <div className={style.newStyle}>
      <div className={style.requirementFormCardLabel}>
        <img className={style.imgIcon} src={imgIcon[8]} alt="" srcSet="" />
        <div className={style.requirementFormCardLabelText}>
          {$t(
            "global-1688-ai-app.ChatFlow.RequirementFormCard.drl",
            "对新品的要求"
          )}
        </div>
      </div>
      <div className={style.requirementFormCardLabelContainer}>
        <div className={style.priceRangeContainer}>
          <Form.Item
            label={
              <div className={style.itemLabel}>
                {$t(
                  "global-1688-ai-app.ChatFlow.RequirementFormCard.xrq",
                  "下游平台价格要求"
                )}
              </div>
            }
          >
            <Form.Item
              name="minPrice"
              dependencies={["maxPrice"]}
              rules={[
                {
                  validator: (rule, value) => {
                    if (value != null && value !== "" && form) {
                      const numValue = parseFloat(value);
                      const maxValue = form.getFieldValue("maxPrice");
                      const maxNumValue = maxValue
                        ? parseFloat(maxValue)
                        : null;
                      if (maxNumValue != null && numValue > maxNumValue) {
                        return Promise.reject(
                          new Error(
                            $t(
                              "global-1688-ai-app.ChatFlow.RequirementFormCard.zlely",
                              `最小价格需小于或等于${currency}${maxValue}`,
                              [currency, maxValue]
                            )
                          )
                        );
                      }
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              noStyle
            >
              <Input
                className={style.currencyInput}
                prefix={<div style={{ color: 'var(--text-primary)' }}>{currency}</div>}
                placeholder={$t(
                  "global-1688-ai-app.ChatFlow.RequirementFormCard.zsmallz",
                  "最小值"
                )}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value
                    .replace(/[^\d.]/g, "")
                    .replace(/^\./, "")
                    .replace(/\.{2,}/g, ".")
                    .replace(/^(\d+\.\d*)\..*$/, "$1");
                }}
              />
            </Form.Item>
            ～
            <Form.Item
              name="maxPrice"
              dependencies={["minPrice"]}
              rules={[
                {
                  validator: (rule, value) => {
                    if (value != null && value !== "" && form) {
                      const numValue = parseFloat(value);
                      const minValue = form.getFieldValue("minPrice");
                      const minNumValue = minValue
                        ? parseFloat(minValue)
                        : null;
                      if (minNumValue != null && numValue < minNumValue) {
                        return Promise.reject(
                          new Error(
                            $t(
                              "global-1688-ai-app.ChatFlow.RequirementFormCard.zeegy",
                              `最大价格需大于或等于${currency}${minValue}`,
                              [currency, minValue]
                            )
                          )
                        );
                      }
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              noStyle
            >
              <Input
                className={style.currencyInput}
                prefix={<div style={{ color: 'var(--text-primary)' }}>{currency}</div>}
                placeholder={$t(
                  "global-1688-ai-app.ChatFlow.RequirementFormCard.zlargez",
                  "最大值"
                )}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  // 只允许数字和一个小数点
                  target.value = target.value
                    .replace(/[^\d.]/g, "")
                    .replace(/^\./, "")
                    .replace(/\.{2,}/g, ".")
                    .replace(/^(\d+\.\d*)\..*$/, "$1");
                }}
              />
            </Form.Item>
          </Form.Item>
        </div>
        <div className={style.priceRangeContainer}>
          <Form.Item
            label={
              <div className={style.itemLabel}>
                {$t(
                  "global-1688-ai-app.ChatFlow.RequirementFormCard.rgf",
                  "评分星级（0-5分）"
                )}
              </div>
            }
          >
            <Form.Item
              name="minF"
              dependencies={["maxF"]}
              rules={[
                {
                  validator: (rule, value) => {
                    if (value != null && form) {
                      const maxValue = form.getFieldValue("maxF");
                      if (maxValue != null && value > maxValue) {
                        return Promise.reject(
                          new Error(
                            $t(
                              "global-1688-ai-app.ChatFlow.RequirementFormCard.zlnad",
                              `最小评分需小于或等于${maxValue}分`,
                              [maxValue]
                            )
                          )
                        );
                      }
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              noStyle
            >
              <InputNumber<number>
                min={0}
                placeholder={$t(
                  "global-1688-ai-app.ChatFlow.RequirementFormCard.zsmallz",
                  "最小值"
                )}
                suffix={
                  <div style={{ color: 'var(--text-primary)' }}>
                    {$t(
                      "global-1688-ai-app.ChatFlow.RequirementFormCard.f",
                      "分"
                    )}
                  </div>
                }
                precision={1}
                decimalSeparator="."
                controls={false}
                max={5}
              />
            </Form.Item>
            ～
            <Form.Item
              name="maxF"
              dependencies={["minF"]}
              rules={[
                {
                  validator: (rule, value) => {
                    if (value != null && form) {
                      const minValue = form.getFieldValue("minF");
                      if (minValue != null && value < minValue) {
                        return Promise.reject(
                          new Error(
                            $t(
                              "global-1688-ai-app.ChatFlow.RequirementFormCard.zenrd",
                              `最大评分需大于或等于${minValue}分`,
                              [minValue]
                            )
                          )
                        );
                      }
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              noStyle
            >
              <InputNumber<number>
                min={0}
                placeholder={$t(
                  "global-1688-ai-app.ChatFlow.RequirementFormCard.zlargez",
                  "最大值"
                )}
                suffix={
                  <div style={{ color: 'var(--text-primary)' }}>
                    {$t(
                      "global-1688-ai-app.ChatFlow.RequirementFormCard.f",
                      "分"
                    )}
                  </div>
                }
                precision={1}
                decimalSeparator="."
                controls={false}
                max={5}
              />
            </Form.Item>
          </Form.Item>
        </div>
      </div>
      <div className={style.monthlySalesRangeContainer}>
        <Form.Item
          label={
            <div className={style.itemLabel}>
              {$t(
                "global-1688-ai-app.ChatFlow.RequirementFormCard.mSf",
                "月销量范围"
              )}
            </div>
          }
        >
          <Form.Item
            name="minSalesVolume"
            dependencies={["maxSalesVolume"]}
            rules={[
              {
                validator: (rule, value) => {
                  if (value != null && value !== "" && form) {
                    const numValue = parseFloat(value);
                    const maxValue = form.getFieldValue("maxSalesVolume");
                    const maxNumValue = maxValue ? parseFloat(maxValue) : null;
                    if (maxNumValue != null && numValue > maxNumValue) {
                      return Promise.reject(
                        new Error(
                          $t(
                            "global-1688-ai-app.ChatFlow.RequirementFormCard.zlsly",
                            `最小销量需小于或等于${maxValue}`,
                            [maxValue]
                          )
                        )
                      );
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
            noStyle
          >
            <Input
              placeholder={$t(
                "global-1688-ai-app.ChatFlow.RequirementFormCard.zlt1",
                "最小值（至少为1）"
              )}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                // 只允许正整数
                target.value = target.value.replace(/[^\d]/g, "");
              }}
            />
          </Form.Item>
          ～
          <Form.Item
            name="maxSalesVolume"
            dependencies={["minSalesVolume"]}
            rules={[
              {
                validator: (rule, value) => {
                  if (value != null && value !== "" && form) {
                    const numValue = parseFloat(value);
                    const minValue = form.getFieldValue("minSalesVolume");
                    const minNumValue = minValue ? parseFloat(minValue) : null;
                    if (minNumValue != null && numValue < minNumValue) {
                      return Promise.reject(
                        new Error(
                          $t(
                            "global-1688-ai-app.ChatFlow.RequirementFormCard.zesgy",
                            `最大销量需大于或等于${minValue}`,
                            [minValue]
                          )
                        )
                      );
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
            noStyle
          >
            <Input
              placeholder={$t(
                "global-1688-ai-app.ChatFlow.RequirementFormCard.zlargez",
                "最大值"
              )}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                // 只允许正整数
                target.value = target.value.replace(/[^\d]/g, "");
              }}
            />
          </Form.Item>
        </Form.Item>
      </div>
    </div>
  );
};

export const MobileRequirementFormCard = ({
  selectedListingTime,
}: {
  selectedListingTime?: string;
}) => {
  return (
  <Form.Item
    label={
      <div className={style.requirementFormCardLabel}>
        <img
          className={style.imgIcon}
          src={imgIcon[7]}
          alt=""
          srcSet=""
        />
        <div className={style.requirementFormCardLabelText}>
          {$t(
            "global-1688-ai-app.ChatFlow.RequirementFormCard.pci",
            "商品上架时间"
          )}
        </div>
        <div className={style.requirementFormCardLabelRequired}>*</div>
      </div>
    }
    name="listingTime"
    rules={[
      {
        required: true,
        message: $t(
          "global-1688-ai-app.ChatFlow.RequirementFormCard.qcdj",
          "请选择商品上架时间"
        ),
      },
    ]}
    extra={
      selectedListingTime &&
      ["90"].includes(selectedListingTime) && (
        <div className={style.requirementFormCardLabelInfo}>
          <FormFailureIcon />
          <div className={style.requirementFormCardLabelInfoText}>
            {$t(
              "global-1688-ai-app.ChatFlow.RequirementFormCard.gfaaLexgo1y",
              "该时间范围新品可能较少，影响选品效果，建议延长至180天"
            )}
          </div>
        </div>
      )
    }
  >
    <Radio.Group size="large" className={style.radioGroup}>
      <Radio.Button value="90">
        {$t(
          "global-1688-ai-app.ChatFlow.RequirementFormCard.j90day",
          "近90天"
        )}
      </Radio.Button>
      <Radio.Button value="180">
        {$t(
          "global-1688-ai-app.ChatFlow.RequirementFormCard.j180day",
          "近180天"
        )}
      </Radio.Button>
    </Radio.Group>
  </Form.Item>
  )
}

const RequirementFormCard: React.FC<RequirementFormCardProps> = observer(
  (props) => {
    const {
      title,
      onFinish,
      form,
      disabled = false,
      platform = "amazon",
      isFormValids = false,
      btnText = $t(
        "global-1688-ai-app.ChatFlow.RequirementFormCard.confirmxq",
        "确认需求"
      ),
      selectedCountryCode = "",
      isRiskContent = false,
      onFormChange,
      userRequest,
      isDisabled = false,
      riskMessage = '',
    } = props;
    const [isFormValid, setIsFormValid] = useState(isFormValids);
    const [countryList, setCountryList] = useState<
      { code: string; name: string; currency: string }[]
    >([]);
    const [selectedCountry, setSelectedCountry] =
      useState<string>(selectedCountryCode);
    const [selectedPlatform, setSelectedPlatform] = useState<string>(platform);
    const [isOpenOption, setIsOpenOption] = useState(disabled);
    const [selectedListingTime, setSelectedListingTime] = useState<string>("");
    const [showRiskTips, setShowRiskTips] = useState(false);
    const { isMakeSimilar, chatInput } = useChatQuery();
    const selectProductStore = useSelectProductStore();
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get('keyword');
    const _platform = searchParams.get('platform'); 
    const _country = searchParams.get('country');
    const defaultPlatform = _platform || platform;
    const defaultCountry = _country || selectedCountryCode;
    const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
    const checkFormValid = async () => {
      try {
        await form?.validateFields({ validateOnly: true });
        setIsFormValid(true);
      } catch (error) {
        setIsFormValid(false);
      }
    };

    const handleValuesChange = (changedValues: any) => {
      // 表单变化时重置风险状态
      onFormChange?.();

      if (changedValues.targetPlatform) {
        setSelectedPlatform(changedValues.targetPlatform);
        const selectedPlatformData = PLATFORM_MAP.find(
          (platform) => platform.code === changedValues.targetPlatform
        );
        if (selectedPlatformData) {
          const newCountryList = selectedPlatformData.platforms || [];
          setCountryList(newCountryList);
          // 如果国家列表有值且当前没有选中国家，则默认选中
          if (newCountryList.length > 0 && form) {
            const currentCountry = form.getFieldValue("targetCountry");
            if (!currentCountry) {
              // 优先使用 URL 参数中的 country，如果在新列表中存在
              const targetCountry = defaultCountry && newCountryList.find(c => c.code === defaultCountry) 
                ? defaultCountry 
                : newCountryList[0].code;
              form.setFieldsValue({
                targetCountry: targetCountry,
              });
              setSelectedCountry(targetCountry);
            }
          }
        }
      }
      if (changedValues.targetCountry) {
        setSelectedCountry(changedValues.targetCountry);
      }

      // 处理上架时间选择变化
      if (changedValues.listingTime) {
        setSelectedListingTime(changedValues.listingTime);
      }

      setTimeout(() => {
        checkFormValid();
      }, 50);
    };

    // 初始化默认选择
    useEffect(() => {
      if (!disabled && form) {
        form.setFieldsValue({
          targetPlatform: defaultPlatform,
          listingTime: "180",
          productKeyword: keyword,
        });
        setSelectedPlatform(defaultPlatform);
        setSelectedListingTime("180");

        const platformData = PLATFORM_MAP.find(
          (p) => p.code === defaultPlatform
        );
        if (platformData) {
          const newCountryList = platformData.platforms || [];
          setCountryList(newCountryList);
          if (newCountryList.length > 0) {
            // 优先使用 URL 参数中的 country，如果 URL 中的 country 在列表中存在则使用，否则使用第一个
            const targetCountry = defaultCountry && newCountryList.find(c => c.code === defaultCountry) 
              ? defaultCountry 
              : newCountryList[0].code;
            form.setFieldsValue({
              targetCountry: targetCountry,
            });
            setSelectedCountry(targetCountry);
          }
        }
      }
    }, [form, disabled]);

    // 监听 countryList 变化，自动设置默认值
    useEffect(() => {
      if (countryList && countryList.length > 0 && form && !disabled) {
        const currentCountry = form.getFieldValue("targetCountry");
        // 如果当前没有选中国家，则设置默认值
        if (!currentCountry) {
          // 优先使用 URL 参数中的 country，如果在列表中存在
          const targetCountry = defaultCountry && countryList.find(c => c.code === defaultCountry) 
            ? defaultCountry 
            : countryList[0].code;
          form.setFieldsValue({
            targetCountry: targetCountry,
          });
          setSelectedCountry(targetCountry);
        }
      }
    }, [countryList, form, disabled]);

    useEffect(() => {
      if (disabled && form?.getFieldValue("targetCountry")) {
        const countryValue = form?.getFieldValue("targetCountry");
        const platformValue = form?.getFieldValue("targetPlatform");
        const listingTimeValue = form?.getFieldValue("listingTime");
        setSelectedCountry(countryValue);
        if (platformValue) {
          setSelectedPlatform(platformValue);
          const selectedPlatformData = PLATFORM_MAP.find(
            (platform) => platform.code === platformValue
          );
          if (selectedPlatformData) {
            setCountryList(selectedPlatformData.platforms || []);
          }
        }
        if (listingTimeValue) {
          setSelectedListingTime(listingTimeValue);
        }
      }
    }, [disabled, form]);

    useEffect(() => {
      if (form) {
        setTimeout(() => {
          checkFormValid();
        }, 100);
      }
    }, [selectedPlatform]);

    // 监听isRiskContent变化，显示风险提示
    useEffect(() => {
      if (isRiskContent) {
        setShowRiskTips(true);
      }
    }, [isRiskContent]);

    useEffect(() => {
      if (
        (chatInput && isMakeSimilar) ||
        (userRequest && Object.keys(userRequest).length > 0)
      ) {
        const chatInputData = chatInput || userRequest;
        const { searchContexts = [] } = chatInputData;
        const listingTime = chatInputData?.listingTime?.endTime
          ? dayjs(chatInputData?.listingTime?.endTime).diff(
            dayjs(chatInputData?.listingTime?.startTime),
            "day"
          )
          : "";
        const textContent = searchContexts.find(
          (item: any) => item.contentType === "text"
        );
        form?.setFieldsValue({
          ...chatInputData,
          listingTime: `${listingTime}`,
          productKeyword: textContent?.productKeyword,
        });
        handleValuesChange(chatInputData);
        selectProductStore.setFormattedPayload(chatInputData);
      }
    }, [chatInput, form, userRequest]);

    // 自动提交逻辑：当 URL 参数有 keyword、platform 或 country 时自动执行 onFinish
    useEffect(() => {
      if (
        !disabled &&
        !hasAutoSubmitted &&
        (keyword || _platform || _country) &&
        form &&
        onFinish &&
        isFormValid &&
        countryList.length > 0
      ) {
        // 延迟执行，确保表单值都已设置
        const timer = setTimeout(() => {
          setHasAutoSubmitted(true);
          onFinish();
        }, 300);
        
        return () => clearTimeout(timer);
      }
    }, [keyword, _platform, _country, form, onFinish, disabled, hasAutoSubmitted, isFormValid, countryList]);

    return (
      <div className={style.requirementFormCard}>
        {title && (
          <div className={style.requirementFormCardTitle}>
            <PanelIcon style={{ width: 20, height: 20 }} />
            {title}
          </div>
        )}
        <Form
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          autoComplete="off"
          layout="vertical"
          form={form}
          disabled={disabled}
          onValuesChange={handleValuesChange}
        >
          <PlatformFormItem
            isDisabled={isDisabled}
            platformList={PLATFORM_MAP}
          />
          <CountryFormItem
            countryList={countryList}
            selectedPlatform={selectedPlatform}
            selectedCountry={selectedCountry}
            isDisabled={isDisabled}
          />
          <ProductKeywordsFormItem
            isRequired
            isRiskContent={isRiskContent}
            isDisabled={isDisabled}
          />
          <MobileRequirementFormCard />
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
              handleBtn={onFinish}
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
);

export default RequirementFormCard;
