import React, { useState, useEffect, useCallback } from "react";
import { Form, Radio, FormInstance, Button } from "antd";
import { observer } from "mobx-react-lite";
import style from "./requirementFormCard.module.css";
import { imgIcon } from "@/components/ChatFlow/imgIcon";
import { COUNTRY_MAP } from "@/types/country";
import {
  RangeFormItem,
  PlatformFormItem,
  CountryFormItem,
} from "@/components/ChatFlow/RequirementFormCard";
import { FormFailureIcon } from "@/components/Icon";
import { $t } from "@/i18n";

const formatRequirementData = (values: any) => {
  const {
    minPrice,
    maxPrice,
    minSalesVolume,
    maxSalesVolume,
    minF,
    maxF,
    productKeyword,
    listingTime,
    ...otherValues
  } = values;

  const days = parseInt(listingTime, 10);
  const now = new Date();
  const startTime = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const searchContexts: any[] = [];

  if (productKeyword) {
    searchContexts.push({
      contentType: "text",
      productKeyword,
    });
  }
  return {
    ...otherValues,
    listingTime: listingTime
      ? {
          startTime: startTime.toISOString().split("T")[0],
          endTime: now.toISOString().split("T")[0],
        }
      : {},
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
    },
  };
};
interface RequirementFormCardProps {
  title?: React.ReactNode | string;
  onFinish?: () => void;
  productDescRequestDTO?: any;
  disabled?: boolean;
  onMoreClick?: (type: string, data: any) => void;
  taskId?: string;
}

const RequirementFormCard: React.FC<RequirementFormCardProps> = observer(
  (props) => {
    const {
      title,
      onFinish,
      productDescRequestDTO,
      disabled = false,
      onMoreClick,
      taskId,
    } = props;
    const [isFormValid, setIsFormValid] = useState(false);
    const [platformList, setPlatformList] = useState<
      { code: string; name: string }[]
    >([]);
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [form] = Form.useForm();
    const [selectedListingTime, setSelectedListingTime] = useState<string>("");
    // 计算天数差并选择对应的 listingTime 选项
    const calculateListingTimePeriod = (startTime: string, endTime: string) => {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // 根据天数差选择最接近的选项
      let selectedPeriod;
      if (diffDays <= 45) selectedPeriod = "30";
      else if (diffDays <= 75) selectedPeriod = "60";
      else if (diffDays <= 135) selectedPeriod = "90";
      else selectedPeriod = "180";
      return selectedPeriod;
    };
    useEffect(() => {
      const listingTimeData = productDescRequestDTO?.listingTime;
      let calculatedPeriod;
      if (listingTimeData?.startTime && listingTimeData?.endTime) {
        calculatedPeriod = calculateListingTimePeriod(
          listingTimeData.startTime,
          listingTimeData.endTime
        );
      }
      const targetCountryValue = productDescRequestDTO?.targetCountry || (countryList && countryList.length > 0 ? countryList[0].code : '');
      form?.setFieldsValue({
        targetPlatform: productDescRequestDTO?.targetPlatform,
        listingTime: calculatedPeriod, // 使用计算出的天数选项或默认180天
        productKeyword: productDescRequestDTO?.searchContexts?.[0]?.productKeyword,
        targetCountry: targetCountryValue,
      });
      setSelectedCountry(targetCountryValue);
      setPlatformList(
        countryList.find(
          (country) => country.code === targetCountryValue
        )?.platforms || []
      );
      setIsFormValid(true);
    }, []);
    const handleSubmit = useCallback(() => {
      onFinish && onFinish();
      const values = form.getFieldsValue();
      const formattedPayload = formatRequirementData(values);
      onMoreClick &&
        onMoreClick("MODIFYFROM_CARD", {
          ...formattedPayload,
          taskId,
        });
    }, [onMoreClick, props]);
    // 获取国家列表
    const countryList = COUNTRY_MAP;

    const checkFormValid = async () => {
      try {
        await form?.validateFields({ validateOnly: true });
        setIsFormValid(true);
      } catch (error) {
        setIsFormValid(false);
      }
    };

    const handleValuesChange = (changedValues: any) => {
      if (changedValues.targetCountry) {
        setSelectedCountry(changedValues.targetCountry);
        setPlatformList(
          countryList.find(
            (country) => country.code === changedValues.targetCountry
          )?.platforms || []
        );
      }
      setTimeout(() => {
        checkFormValid();
      }, 50);
    };

    return (
      <div className={style.requirementFormCard}>
        <div className={style.requirementFormCardTitle}>{title}</div>
        <Form
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 24 }}
          layout="vertical"
          form={form}
          disabled={disabled}
          onValuesChange={handleValuesChange}
        >
          {form?.getFieldValue("listingTime") && (
            <Form.Item
              label={
                <div className={style.requirementFormCardLabel}>
                  <img
                    className={style.imgIcon}
                    src={imgIcon[7]}
                    alt=""
                    srcSet=""
                  />
                  <div className={style.requirementFormCardLabelText}>{$t("global-1688-ai-app.select-product.RightComponents.RequirementFormCard.pci", "商品上架时间")}</div>
                  <div className={style.requirementFormCardLabelRequired}>
                    *
                  </div>
                  <img
                    className={style.imgIcon}
                    src={imgIcon[7]}
                    alt=""
                    srcSet=""
                  />
                  <div className={style.requirementFormCardLabelText}>
                    {$t(
                      "global-1688-ai-app.select-product.RightComponents.RequirementFormCard.pci",
                      "商品上架时间"
                    )}
                  </div>
                  <div className={style.requirementFormCardLabelRequired}>
                    *
                  </div>
                </div>
              }
              name="listingTime"
              rules={[
                {
                  required: true,
                  message: $t(
                    "global-1688-ai-app.select-product.RightComponents.RequirementFormCard.qcdj",
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
                        "global-1688-ai-app.select-product.RightComponents.RequirementFormCard.gfaaLexgo1y",
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
                    "global-1688-ai-app.select-product.RightComponents.RequirementFormCard.j90day",
                    "近90天"
                  )}
                </Radio.Button>
                <Radio.Button value="180">
                  {$t(
                    "global-1688-ai-app.select-product.RightComponents.RequirementFormCard.j180day",
                    "近180天"
                  )}
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          )}

          <CountryFormItem countryList={countryList} />

          {/* <div className={isTargetCountryValid ? '' : 'h-0 overflow-hidden'}> */}
          <PlatformFormItem platformList={platformList} />
          <RangeFormItem
            form={form}
            selectedCountry={selectedCountry}
            countryList={COUNTRY_MAP}
          />
          {/* </div> */}
        </Form>
        {!disabled && (
          <div className="flex items-center justify-center">
            <Button
              onClick={handleSubmit}
              type="primary"
              className={style.confirmBtn}
              disabled={!isFormValid}
            >{$t("global-1688-ai-app.select-product.RightComponents.RequirementFormCard.confirmModify", "确认修改")}</Button>
          </div>
        )}
        {!disabled && (
          <div className="flex items-center justify-center">
            <Button
              onClick={handleSubmit}
              type="primary"
              className={style.confirmBtn}
              disabled={!isFormValid}
            >
              {$t(
                "global-1688-ai-app.select-product.RightComponents.RequirementFormCard.confirmModify",
                "确认修改"
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }
);

export default RequirementFormCard;
