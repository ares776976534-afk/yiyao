import { Form } from 'antd';
import RequirementFormCard from '@/components/ChatFlow/RequirementFormCard';
import { useEffect, useCallback, useState } from 'react'
import style from './modifyFormCard.module.css';
import { PanelIcon } from '@/components/Icons';
import { FastForwardDownIcon } from '@/components/Icon';
import ImproveForm from '../ImproveComponents/Form';
import { formatRequirementData as formatImproveRequirementData } from '../ImproveComponents/ImproveRequirement';
import PlatformForm from '../PlatformComponents/Form';
import { formatRequirementData as formatPlatformRequirementData } from '../PlatformComponents/PlatformRequirement';
import CountryForm from '../CountryComponents/Form';
import { formatRequirementData as formatCountryRequirementData } from '../CountryComponents/CountryRequirement';
import { transformRawData } from '../LeftComponents/UserInputText';
import { $t } from '@/i18n';

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
      contentType: 'text',
      productKeyword: productKeyword,
    });
  }
  return {
    ...otherValues,
    listingTime: listingTime ? {
      startTime: startTime.toISOString().split('T')[0],
      endTime: now.toISOString().split('T')[0],
    } : {},
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
      // cateLev1Id
    }
  };
};

export const ModifyFormCard = (props) => {
  const { productDescRequestDTO, onMoreClick, taskId, type, userRequest = {} } = props;
  const _userRequest = transformRawData(userRequest);
  const _userRequestRawData = transformRawData(_userRequest?.rawData);
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

    form?.setFieldsValue({
      targetPlatform: productDescRequestDTO?.targetPlatform,
      sourcePlatform: productDescRequestDTO?.sourcePlatform,
      listingTime: calculatedPeriod, // 使用计算出的天数选项或默认180天
      productKeyword: productDescRequestDTO?.searchContexts[0]?.productKeyword,
      targetCountry: productDescRequestDTO?.targetCountry,
      // cateLev1Id: productDescRequestDTO?.extInfos?.cateLev1Id,
      // cateLev2Id: productDescRequestDTO?.extInfos?.cateLev2Id,
      sourceCountry: productDescRequestDTO?.sourceCountry,
      image: productDescRequestDTO?.productImageUrl || productDescRequestDTO?.searchContexts[1]?.imageUrl,
    });
  }, []);
  // 统一提交处理
  const handleSubmit = useCallback((formatFn, extraData = {}) => {
    setIsExpanded(true);
    setIsOpen(true);
    const values = form.getFieldsValue();
    const formattedPayload = formatFn({ ...values, ...extraData });
    console.log('formattedPayload', formattedPayload);
    onMoreClick('MODIFYFROM_CARD', { ...formattedPayload, taskId });
  }, [onMoreClick, form, taskId]);

  const handleToggleExpanded = () => setIsExpanded(!isExpanded);
  // 公共配置
  const commonProps = {
    form,
    btnText: $t("global-1688-ai-app.select-product.RightComponents.ModifyFormCard.confirmModify", "确认修改"),
    disabled: isOpen,
    selectedCountryCode: productDescRequestDTO?.targetCountry,
    imageUrl: productDescRequestDTO?.productImageUrl || productDescRequestDTO?.searchContexts[1]?.imageUrl,
    userRequest: _userRequestRawData,
    isDisabled: true,
  };

  const TYPE_MAP = {
    NEW: (
      <RequirementFormCard
        title=""
        onFinish={() => handleSubmit(formatRequirementData, {
          productKeyword: productDescRequestDTO?.searchContexts[0]?.productKeyword
        })}
        platform={productDescRequestDTO?.targetPlatform}
        isFormValids={true}
        {...commonProps}
      />
    ),
    IMPROVE: (
      <ImproveForm
        onFinish={() => handleSubmit(formatImproveRequirementData, {
          productKeyword: productDescRequestDTO?.searchContexts[0]?.productKeyword
        })}
        platform={productDescRequestDTO?.targetPlatform}
        {...commonProps}
      />
    ),
    cross_platform: (
      <PlatformForm
        title=""
        onFinish={() => handleSubmit(formatPlatformRequirementData, {
          productKeyword: productDescRequestDTO?.searchContexts[0]?.productKeyword
        })}
        targetPlatform={productDescRequestDTO?.targetPlatform}
        sourcePlatform={productDescRequestDTO?.sourcePlatform}
        {...commonProps}
      />
    ),
    cross_country: (
      <CountryForm
        title=""
        onFinish={() => handleSubmit(formatCountryRequirementData, {
          productKeyword: productDescRequestDTO?.searchContexts[0]?.productKeyword
        })}
        sourceCountry={productDescRequestDTO?.sourceCountry}
        targetCountry={productDescRequestDTO?.targetCountry}
        targetPlatform={productDescRequestDTO?.targetPlatform}
        {...commonProps}
      />
    )
  }
  const TITLE_CONFIG = {
    cross_platform: [$t("global-1688-ai-app.select-product.RightComponents.ModifyFormCard.qiq", "请确认平台迁移要求"), $t("global-1688-ai-app.select-product.RightComponents.ModifyFormCard.niq", "您已修改平台迁移要求")],
    cross_country: [$t("global-1688-ai-app.select-product.RightComponents.ModifyFormCard.qiq.2", "请确认国家迁移要求"), $t("global-1688-ai-app.select-product.RightComponents.ModifyFormCard.niq.2", "您已修改国家迁移要求")],
    IMPROVE: [$t("global-1688-ai-app.select-product.RightComponents.ModifyFormCard.qiy", "请确认改进要求"), $t("global-1688-ai-app.select-product.RightComponents.ModifyFormCard.niy", "您已修改改进要求")],
    NEW: [$t("global-1688-ai-app.select-product.RightComponents.ModifyFormCard.qiy.2", "请确认选品要求"), $t("global-1688-ai-app.select-product.RightComponents.ModifyFormCard.niy.2", "您已修改选品要求")],
  };

  return (
    <div className={style.modifyFormCard}>
      <div className={style.modifyFormCardContent}>
        <div className={style.modifyFormCardTitle}>
          <PanelIcon style={{ width: 16, height: 16 }} />
          {TITLE_CONFIG[type][isOpen ? 1 : 0]}
        </div>
        {isOpen && (
          <div className={style.modifyFormCardTitleExpand} onClick={handleToggleExpanded}>
            {isExpanded ? $t("global-1688-ai-app.select-product.RightComponents.ModifyFormCard.zkview", "展开查看") : $t("global-1688-ai-app.select-product.RightComponents.ModifyFormCard.sq", "收起")}
            <FastForwardDownIcon
              className={isExpanded ? style.fastForwardIconRotated : style.fastForwardIcon}
            />
          </div>
        )}
      </div>
      {!isExpanded && (
        <div style={{ marginTop: '20px' }}>
          {TYPE_MAP[type]}
        </div>
      )}
    </div>
  )
};