import MainHeader from '@/pages/mobile/components/mainHeader';
import Card from '@/pages/mobile/components/Card';
import { Form, message } from 'antd';
import { PlatformFormItem, CountryFormItem, ProductKeywordsFormItem, MobileRequirementFormCard } from '@/components/ChatFlow/RequirementFormCard';
import { PLATFORM_MAP } from '@/types/country';
import styles from './product.module.scss';
import { useState, useEffect } from 'react';
import { MainBtn } from '@/components/ChatFlow/Btn';
import { formatRequirementData } from '@/pages/select-product/components/LeftComponents/Requirement';
import { riskCheck } from "@/pages/select-product/services";
import { RiskControlTips } from '@/components/ChatFlow/RiskControlTips';
import { DownArrowIcon } from '@/components/Icon';
import { StatusEnum } from "@/pages/select-product/config";
import dayjs from "dayjs";
import { useSelectProductStore } from "@/stores/select-product";
import { useSearchParams } from 'ice';

const Product = ({
  onSubmit,
  status,
  userRequest,
}: {
  status: StatusEnum;
  onSubmit: (formattedPayload: any) => void;
  userRequest?: any;
}) => {
  const [form] = Form.useForm();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("amazon");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isRiskContent, setIsRiskContent] = useState(false);
  const [selectedListingTime, setSelectedListingTime] = useState<string>("180");
  const [isFormValid, setIsFormValid] = useState(false);
  const [riskMessage, setRiskMessage] = useState<string>('');
  const [isFormHidden, setIsFormHidden] = useState(false);
  const [isArrowRotated, setIsArrowRotated] = useState(false);
  const btnText = '确认需求';
  const isDisabled = status === StatusEnum.RUNNING || status !== StatusEnum.INIT;
  const selectProductStore = useSelectProductStore();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');
  const [countryList, setCountryList] = useState<
      { code: string; name: string; currency: string }[]
    >([]);
  const defaultPlatform = "amazon";
  const handleValuesChange = (changedValues: any) => {

    if (changedValues.targetPlatform) {
      setSelectedPlatform(changedValues.targetPlatform);
      const selectedPlatformData = PLATFORM_MAP.find(
        (platform) => platform.code === changedValues.targetPlatform
      );
      if (selectedPlatformData) {
        const newCountryList = selectedPlatformData.platforms || [];
        setCountryList(newCountryList);
        // 切换平台时，永远选择第一个国家
        if (newCountryList.length > 0 && form) {
          form.setFieldsValue({
            targetCountry: newCountryList[0].code,
          });
          setSelectedCountry(newCountryList[0].code);
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
  useEffect(() => {
    form.setFieldsValue({
      targetPlatform: defaultPlatform,
      listingTime: "180",
      productKeyword: keyword,
    });

    // 设置亚马逊对应的国家列表
    const amazonPlatformData = PLATFORM_MAP.find(
      (platform) => platform.code === defaultPlatform
    );
    if (amazonPlatformData) {
      const newCountryList = amazonPlatformData.platforms || [];
      setCountryList(newCountryList);
      // 默认选中第一个国家
      if (newCountryList.length > 0) {
        form.setFieldsValue({
          targetCountry: newCountryList[0].code,
        });
        setSelectedCountry(newCountryList[0].code);
      }
    }
  }, []);
  const onFinish = () => {
    const values = form.getFieldsValue();
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
              setIsFormHidden(true);
              onSubmit(formattedPayload);
            } else {
              setIsRiskContent(true);
              setRiskMessage(msg);
            }
          } else {
            setIsRiskContent(false);
            message.error(msg || '系统错误');
          }
        })
        .catch((err: any) => {
          setIsRiskContent(false);
          message.error(err.message || '系统错误');
        });
    } else {
      setIsFormHidden(true);
      onSubmit(formattedPayload);
    }
  }
  useEffect(() => {
    if (form) {
      setTimeout(() => {
        checkFormValid();
      }, 100);
    }
  }, [selectedPlatform]);
  useEffect(() => {
    if (userRequest && Object.keys(userRequest).length > 0) {
      const chatInputData = userRequest;
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
      setIsFormHidden(true);
      selectProductStore.setFormattedPayload(chatInputData);
    }
  }, [userRequest]);

  const checkFormValid = async () => {
    try {
      await form?.validateFields({ validateOnly: true });
      setIsFormValid(true);
    } catch (error) {
      setIsFormValid(false);
    }
  };
  const onDownArrow = () => {
    setIsFormHidden(!isFormHidden);
    setIsArrowRotated(!isArrowRotated);
  }
  return (
    <div className={styles.form_content}>
      <MainHeader />
      <Card
        title={!isDisabled ? "机会新品选品" : '您已补充选品要求'}
        rightContent={
          isDisabled ? <div onClick={onDownArrow} className={isArrowRotated ? styles.arrowIconRotated : styles.arrowIcon}>
            <DownArrowIcon width="14px" height="14px"/>
          </div> : ''
        }
      >
        {!isFormHidden && (
          <div className={`${styles.formWrapper} ${isDisabled ? styles.formWrapperWithBtn : ''}`}>
            <Form
              layout='vertical'
              autoComplete="off"
              form={form}
              disabled={isDisabled}
              onValuesChange={handleValuesChange}
            >
              <PlatformFormItem
                platformList={PLATFORM_MAP}
              />
              <CountryFormItem
                countryList={countryList}
                selectedPlatform={selectedPlatform}
                selectedCountry={selectedCountry}
              />
              <ProductKeywordsFormItem
                isRequired
                isRiskContent={isRiskContent}
              />
              <MobileRequirementFormCard
                selectedListingTime={selectedListingTime}
              />
            </Form>
            {!isDisabled && (<div className={styles.footerBtn}>
              <MainBtn
                handleBtn={onFinish}
                text={btnText}
                style={{
                  height: 40,
                  width: 128,
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: '24px'
                }}
                other={{
                  disabled: !isFormValid
                }}
              />
            </div>)}
          </div>
        )}
      </Card>
      <RiskControlTips
        visible={isRiskContent}
        onClose={() => setIsRiskContent(false)}
        riskMessage={riskMessage}
      />
    </div>
  )
};

export default Product;