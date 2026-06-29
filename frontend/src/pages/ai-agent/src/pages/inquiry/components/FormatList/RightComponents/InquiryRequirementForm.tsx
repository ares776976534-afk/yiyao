import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Button, message } from 'antd';
import { useSearchParams } from 'ice';
import { observer } from 'mobx-react-lite';
import ChooseSuppliers from '../../ChooseSuppliers';
import AddInquiryOffer from '../../AddInquiryOffer';
import InquiryQuestions, { QuestionType } from '../../InquiryQuestions';
import AutoOrderSettings from '../../AutoOrderSettings';
import BasicInfor from '../../BasicInfor';
import { DisableItem } from '../../../types';
import { receiveAddressList, getQuestionList, copyTask } from '@/pages/inquiry/services';
import handleFromPage from '../../../new/handleFromPage';
import OfferAndSupplierList from '../../OfferAndSupplierList';
import request from '@/services/httpRequest';
import { serviceBaseUrl, inquiryApiBaseUrl } from '@/utils/env';
import { useSelectProductStore } from '@/stores/select-product';
import styles from './InquiryRequirementForm.module.css';
import { $t } from '@/i18n';
import { defaultNumberMapping, offerAndSupplierListNumberMapping } from './numberIconConfig';

interface TypeInquiryRequirementFormProps {
  onActionClick?: (action: string, data: any) => void;
  initialData?: any;
  readonly?: boolean; // 只读模式
  detail?: any; // 回填数据
  onProgressChange?: (progress: number) => void; // 进度变化回调
}

interface TypePostData {
  supplierInfo: {
    memberId: string;
    companyName: string;
    headImg: string;
    wangwangId: string;
  }[];
  type: string;
  itemInfo: {
    imgFileKey?: string;
    offerId?: string;
    offerImg?: string;
  };
  requirement?: {
    content: string; // 询盘需求内容
    isOriginal: boolean; // 是否原文发送
  };
  inquiryQuestions: {
    prebuild?: string[];
    custom?: string[];
  };
  config: {
    reportFinishTimeMinute?: number;
    autoOrderConfig: {
      enable: boolean;
      conditions: {
        key: string;
        value: string;
      }[];
      offerInfos?: Array<{
        offerId: string;
        memberId: string;
      }>;
    };
    source?: string;
    custom?: {
      expectedOrderQuantity?: number;
      address?: {
        code: string;
        text: string;
      };
    };
  };
}

// 表单验证规则
const validationRules = {
  supplierInfo: [
    {
      required: true,
      validator: (_: any, value: any) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return Promise.reject(new Error($t("global-1688-ai-app.inquiry.FormatList.RightComponents.InquiryRequirementForm.qtlg", "请至少选择一个供应商")));
        }
        return Promise.resolve();
      },
    },
  ],
  itemInfo: [
    {
      required: true,
      validator: (_: any, value: any) => {
        if (!value) {
          return Promise.reject(new Error($t("global-1688-ai-app.inquiry.FormatList.RightComponents.InquiryRequirementForm.qcdUde", "请选择商品或上传图片")));
        }
        if (!value.imgFileKey && !value.offerId) {
          return Promise.reject(new Error($t("global-1688-ai-app.inquiry.FormatList.RightComponents.InquiryRequirementForm.qcdUde", "请选择商品或上传图片")));
        }
        if (!value.type) {
          return Promise.reject(new Error($t("global-1688-ai-app.inquiry.FormatList.RightComponents.InquiryRequirementForm.qcdUde", "请选择商品或上传图片")));
        }
        return Promise.resolve();
      },
    },
  ],
  inquiryQuestions: [
    {
      required: true,
      validator: (_: any, value: any) => {
        if (!value || value.length === 0) {
          return Promise.reject(new Error($t("global-1688-ai-app.inquiry.FormatList.RightComponents.InquiryRequirementForm.qtds", "请至少添加一个问题")));
        }
        return Promise.resolve();
      },
    },
  ],
  reportFinishTimeMinute: [
    {
      required: true,
      validator: (_: any, value: number) => {
        if (!value || value <= 0) {
          return Promise.reject(new Error($t("global-1688-ai-app.inquiry.FormatList.RightComponents.InquiryRequirementForm.qcote", "请选择报告完成时间")));
        }
        return Promise.resolve();
      },
    },
  ],
};

const InquiryRequirementForm: React.FC<TypeInquiryRequirementFormProps> = observer(({
  onActionClick,
  initialData,
  readonly = false,
  detail,
  onProgressChange,
}) => {
  const [form] = Form.useForm<TypePostData>();
  const [isFormValid, setIsFormValid] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [initStatus, setInitStatus] = useState<any>({});
  const [searchParams] = useSearchParams();
  const fromPage = searchParams.get('fromPage');
  const offerIds = searchParams.get('offerIds');
  const memberIds = searchParams.get('memberIds');
  const taskId = searchParams.get('taskId');
  const [, setFormProgress] = useState(0);
  const [requirement, setRequirement] = useState('');
  const [sendOriginal, setSendOriginal] = useState(true);
  const [hasItemInfo, setHasItemInfo] = useState(false); // 询盘商品是否有内容
  const [submitLoading, setSubmitLoading] = useState(false); // 提交按钮loading状态
  const [hasRecommendSelected, setHasRecommendSelected] = useState(false); // 是否通过智能推荐选择了供应商
  const [recommendSuppliers, setRecommendSuppliers] = useState<any[]>([]); // 通过智能推荐选择的供应商列表
  // 智能推荐时的供应商-商品对应关系
  const [recommendSupplierItemPairs, setRecommendSupplierItemPairs] = useState<Array<{ memberId: string; itemId?: string }>>([]);
  // 从ext中读取的autoOrderVisible（用于回显时控制显示）
  const [extAutoOrderVisible, setExtAutoOrderVisible] = useState<boolean | undefined>(undefined);
  const selectProductStore = useSelectProductStore();
  const blockDataLengthRef = useRef<number>(0); // 记录提交前的blockData长度
  const isInitializedRef = useRef<boolean>(false); // 防止重复初始化
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 存储 setTimeout 引用

  // 获取地址列表
  useEffect(() => {
    receiveAddressList({}).then((res) => {
      const { msg, data, success } = res || {};
      if (!success) {
        message.error(msg || $t("global-1688-ai-app.inquiry.FormatList.RightComponents.InquiryRequirementForm.hraqy", "获取地址失败，请重试"));
      }
      setList(data || []);
    }).catch((err) => {
      setList([]);
      message.error(err.message || $t("global-1688-ai-app.inquiry.FormatList.RightComponents.InquiryRequirementForm.hraqy", "获取地址失败，请重试"));
    });
  }, []);

  // 静默校验表单（不显示错误提示，只用于判断按钮是否可用）
  const checkFormValidationSilently = useCallback(async () => {
    try {
      // 使用 validateOnly: true 进行静默校验，不会显示错误提示
      await form.validateFields({ validateOnly: true });
      setIsFormValid(true);
    } catch (error) {
      setIsFormValid(false);
    }
  }, [form]);

  // 检查 itemInfo 是否有内容
  const checkItemInfo = useCallback(() => {
    const fields: any = form.getFieldsValue();
    const { itemInfo } = fields;
    const hasContent = itemInfo && (itemInfo.imgFileKey || itemInfo.offerId);
    setHasItemInfo(!!hasContent);
  }, [form]);

  // 计算表单填写进度
  const calculateProgress = useCallback(() => {
    const fields: any = form.getFieldsValue();
    let completedFields = 0;

    // 检查是否存在 OfferAndSupplierList（内联逻辑，避免函数调用顺序问题）
    const { offerAndSupplierList } = initStatus;
    const hasOfferAndSupplierList = offerAndSupplierList &&
      Array.isArray(offerAndSupplierList) &&
      offerAndSupplierList.length > 0 &&
      offerAndSupplierList.some((item: any) => item?.offerInfo && item?.supplierInfo);

    // 根据是否存在 OfferAndSupplierList 确定总必填项数量
    // 必填项包括：商品和供应商信息（合并或分开）、询盘问题、期望订购量、收货地址
    // 注意：
    // 1. 报告完成时间字段已被注释掉，不在表单中显示，不应计入进度
    // 2. 自动下单不是必填项，不应计入进度
    // 如果存在 OfferAndSupplierList，则商品和供应商信息合并为一个必填项，总共4个必填项
    // 如果不存在，则商品和供应商信息分别计算，总共5个必填项
    const totalFields = hasOfferAndSupplierList ? 4 : 5;

    if (hasOfferAndSupplierList) {
      // 存在 OfferAndSupplierList 时，将其作为一个必填项
      completedFields++;
    } else {
      // 不存在 OfferAndSupplierList 时，分别计算商品信息和供应商信息
      // 1. 商品信息
      if (fields.itemInfo && (fields.itemInfo.imgFileKey || fields.itemInfo.offerId)) {
        completedFields++;
      }

      // 2. 供应商信息
      if (fields.supplierInfo && Array.isArray(fields.supplierInfo) && fields.supplierInfo.length > 0) {
        completedFields++;
      }
    }

    // 3. 询盘问题
    if (fields.inquiryQuestions && Array.isArray(fields.inquiryQuestions) && fields.inquiryQuestions.length > 0) {
      completedFields++;
    }

    // 4. 期望订购量
    if (fields.expectedOrderQuantity) {
      completedFields++;
    }

    // 5. 收货地址
    if (fields.address) {
      completedFields++;
    }

    const progress = Math.round((completedFields / totalFields) * 100);
    setFormProgress(progress);
    // 通知父组件进度变化
    onProgressChange?.(progress);
  }, [form, onProgressChange, initStatus]);

  // 初始化时计算进度并静默校验
  useEffect(() => {
    setTimeout(() => {
      calculateProgress();
      checkFormValidationSilently();
      checkItemInfo();
    }, 200);
  }, [calculateProgress, checkFormValidationSilently, checkItemInfo]);

  // 获取商品和供应商详细信息
  const getSupplierAndOffer = async (params: any) => {
    try {
      const res = await request({
        url: `${inquiryApiBaseUrl}/api/inquiry/supplier/query`,
        method: 'POST',
        body: JSON.stringify(params),
      });
      if (res.success) {
        return res?.data || [];
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  // 初始化表单数据（只读模式下回填数据）
  useEffect(() => {
    // 如果有 taskId，跳过这里的初始化，由 taskId 的 useEffect 处理
    if (taskId) {
      return;
    }

    // 清除之前的 timeout，防止多次执行
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }

    if (readonly && detail) {
      // 只读模式，回填数据
      isInitializedRef.current = true;
      initFormData(detail);
    } else {
      // 正常模式，从 URL 参数初始化
      const init = async () => {
        // 如果已经通过 taskId 初始化过，跳过
        if (isInitializedRef.current) {
          return;
        }

        const handleResult = await handleFromPage(fromPage || '', offerIds || '', memberIds || '') as any;
        
        // 再次检查，防止在异步过程中被其他初始化覆盖
        if (isInitializedRef.current) {
          return;
        }

        // 使用展开运算符确保所有属性都被正确复制
        const newInitStatus = {
          ...handleResult,
          offerAndSupplierList: handleResult?.offerAndSupplierList || [],
        };
        setInitStatus(newInitStatus);
        if (handleResult?.supplierInfo) {
          form.setFieldValue('supplierInfo', handleResult?.supplierInfo || []);
        }
        // 如果有商品信息，设置到表单中
        if (handleResult?.offerAndSupplierList && handleResult.offerAndSupplierList.length > 0) {
          const firstOffer = handleResult.offerAndSupplierList[0];
          if (firstOffer?.offerInfo) {
            form.setFieldValue('itemInfo', {
              offerId: firstOffer.offerInfo.offerId,
              offerImg: firstOffer.offerInfo.img,
              type: 'ITEM_LINK',
            });
          }
        }

        // 初始化后静默校验
        setTimeout(() => {
          checkFormValidationSilently();
          checkItemInfo();
        }, 100);
      };

      initTimeoutRef.current = setTimeout(() => {
        init();
      }, 100);
    }

    // 清理函数
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromPage, offerIds, memberIds, readonly, detail, taskId]);

  // 表单值变化时计算进度并静默校验
  const handleValuesChange = () => {
    setTimeout(() => {
      calculateProgress();
      checkFormValidationSilently();
      checkItemInfo();
    }, 50);
  };

  const handleSubmit = async () => {
    try {
      // 检查是否有 offerAndSupplierList（新组件的数据）
      // 使用和渲染阶段相同的判断逻辑：必须同时有 offerInfo 和 supplierInfo
      const offerAndSupplierList = initStatus.offerAndSupplierList;
      const hasOfferAndSupplierList = offerAndSupplierList &&
        Array.isArray(offerAndSupplierList) &&
        offerAndSupplierList.length > 0 &&
        offerAndSupplierList.some((item: any) => item?.offerInfo && item?.supplierInfo);

      // 如果有新组件数据，需要手动设置表单值以通过验证
      if (hasOfferAndSupplierList) {
        // 提取供应商信息
        const supplierMap = new Map();
        offerAndSupplierList.forEach((item: any) => {
          const memberId = item.supplierInfo.memberId;
          if (!supplierMap.has(memberId)) {
            supplierMap.set(memberId, {
              memberId: item.supplierInfo.memberId,
              headImg: item.supplierInfo.headImg,
              companyName: item.supplierInfo.companyName,
              wangwangId: item.supplierInfo.wangwangId,
            });
          }
        });
        const supplierInfoArray = Array.from(supplierMap.values());

        // 从第一个商品中获取 itemInfo
        const firstOffer = offerAndSupplierList[0];
        const itemInfoValue = firstOffer?.offerInfo ? {
          offerId: firstOffer.offerInfo.offerId,
          offerImg: firstOffer.offerInfo.img,
          type: 'ITEM_LINK',
        } : null;

        // 手动设置表单值，确保验证通过
        if (supplierInfoArray.length > 0) {
          form.setFieldValue('supplierInfo', supplierInfoArray);
        }
        if (itemInfoValue) {
          form.setFieldValue('itemInfo', itemInfoValue);
        }
      }

      // 在提交时手动触发校验
      await form.validateFields();

      const values: any = form.getFieldsValue();
      const address = list.find(item => item.code === values.address);

      const itemInfoWithType = values.itemInfo as any;
      const autoOrderEnabled = values?.config?.autoOrderConfig?.enable ?? false;

      let supplierInfoList: any[] = [];
      let offerInfosList: any[] = [];
      let itemInfoData: any = {};

      if (hasOfferAndSupplierList) {
        // 从 offerAndSupplierList 中提取 supplierInfo（包含 memberId, headImg, companyName, wangwangId）
        // 需要去重，因为同一个供应商可能对应多个商品
        const supplierMap = new Map();
        offerAndSupplierList.forEach((item: any) => {
          const memberId = item.supplierInfo.memberId;
          if (!supplierMap.has(memberId)) {
            supplierMap.set(memberId, {
              memberId: item.supplierInfo.memberId,
              headImg: item.supplierInfo.headImg,
              companyName: item.supplierInfo.companyName,
              wangwangId: item.supplierInfo.wangwangId,
            });
          }
        });
        supplierInfoList = Array.from(supplierMap.values());

        // 从 offerAndSupplierList 中提取 offerInfos（memberId 和 offerId 的组合）
        // 只处理有 offerInfo 的项
        offerInfosList = offerAndSupplierList
          .filter((item: any) => item?.offerInfo) // 过滤掉没有 offerInfo 的项
          .map((item: any) => ({
            memberId: item.supplierInfo.memberId,
            offerId: item.offerInfo.offerId,
          }));

        // 从第一个商品中获取 itemInfo
        const firstOffer = offerAndSupplierList[0];
        if (firstOffer?.offerInfo) {
          itemInfoData = {
            offerId: firstOffer.offerInfo.offerId,
            offerImg: firstOffer.offerInfo.img,
          };
        }
      } else {
        // 使用原来的逻辑
        supplierInfoList = values.supplierInfo.map((supplier: any) => ({
          memberId: supplier.memberId,
          companyName: supplier.companyName,
          headImg: supplier.headImg,
          wangwangId: supplier.wangwangId,
        }));

        offerInfosList = initialData?.offerIds ? values.supplierInfo.map((supplier: any) => ({
          offerId: supplier.offerId,
          memberId: supplier.memberId,
        })) : [];

        itemInfoData = {
          imgFileKey: itemInfoWithType.imgFileKey,
          offerId: itemInfoWithType.offerId,
          offerImg: itemInfoWithType.offerImg,
        };
      }

      // 如果用户通过智能推荐选择了供应商，且启用了自动下单，需要构建 offerInfos
      if (hasRecommendSelected && autoOrderEnabled && !hasOfferAndSupplierList) {
        // 基于当前表单中的实际供应商来构建 offerInfos（而不是使用保存的历史数据）
        const currentSupplierMemberIds = new Set(supplierInfoList.map((s: any) => s.memberId));

        // 创建供应商-商品ID的映射表（只包含当前表单中存在的供应商）
        const supplierItemMap = new Map<string, string>();
        if (recommendSupplierItemPairs.length > 0) {
          recommendSupplierItemPairs.forEach((pair) => {
            if (pair.itemId && currentSupplierMemberIds.has(pair.memberId)) {
              supplierItemMap.set(pair.memberId, pair.itemId);
            }
          });
        }

        // 获取商品ID（优先使用对应关系中的，否则使用表单中的）
        const defaultOfferId = itemInfoWithType?.offerId;

        // 为当前表单中的每个供应商构建 offerInfo
        offerInfosList = supplierInfoList
          .map((supplier: any) => {
            const offerId = supplierItemMap.get(supplier.memberId) || defaultOfferId;
            return {
              memberId: supplier.memberId,
              offerId: offerId,
            };
          })
          .filter((item: any) => item.offerId); // 过滤掉没有商品ID的项
      }

      // 计算自动下单组件是否展示（与渲染条件保持一致）
      const isAutoOrderVisible = !initStatus[DisableItem.DISABLE_AUTO_ORDER] &&
        ((fromPage === 'ZS' && !!offerIds) || hasRecommendSelected);

      // 构建新的接口格式
      // 注意：onActionClick 会在 SelectContainer 中再次包装到 params.data 中，所以这里直接传递 data 部分
      const transformedData = {
        supplierInfo: supplierInfoList,
        type: hasOfferAndSupplierList ? 'BATCH_ITEM' : (itemInfoWithType?.type || (itemInfoData.offerId ? 'ITEM_LINK' : 'ITEM_IMG')),
        itemInfo: itemInfoData,
        inquiryQuestions: {
          prebuild: (values.inquiryQuestions || [])
            .map((question: any) => (question.type === QuestionType.PREBUILD ? question.key : null))
            .filter((key: string | null): key is string => key !== null),
          custom: (values.inquiryQuestions || [])
            .map((question: any) => (question.type === QuestionType.CUSTOM ? question.key : null))
            .filter((key: string | null): key is string => key !== null),
        },
        config: {
          reportFinishTimeMinute: values?.config?.reportFinishTimeMinute || 20,
          autoOrderConfig: {
            enable: autoOrderEnabled,
            conditions: values?.config?.autoOrderConfig?.conditions || [],
            offerInfos: offerInfosList,
          },
          custom: {
            expectedOrderQuantity: values.expectedOrderQuantity,
            address: address ? {
              code: address.code,
              text: address.text || address.name,
            } : undefined,
          },
          source: initialData?.fromPage || fromPage || '',
        },
        requirement: {
          content: requirement,
          isOriginal: sendOriginal,
        },
        ext: {
          autoOrderVisible: isAutoOrderVisible, // 自动下单组件是否展示
          autoOrderEnabled: autoOrderEnabled, // 自动下单开关是否开启
        },
      };

      // 记录提交前的blockData长度，并设置loading状态
      blockDataLengthRef.current = selectProductStore.getBlockData().length;
      setSubmitLoading(true);

      // 通过 onActionClick 提交数据，触发后续流程
      onActionClick?.('SUBMIT_INQUIRY_REQUIREMENT', transformedData);
    } catch (errorInfo) {
      setSubmitLoading(false);
      // 显示错误提示
      if (errorInfo?.errorFields) {
        const firstError = errorInfo.errorFields[0];
        message.error(firstError?.errors?.[0] || $t("global-1688-ai-app.inquiry.FormatList.RightComponents.InquiryRequirementForm.fecneI", "表单验证失败，请检查输入"));
      } else {
        message.error('提交失败，请重试');
      }
    }
  };

  const [errorMessage, setErrorMessage] = useState<string>(''); // 错误信息状态

  // 监听blockData变化，当收到新的SSE消息时关闭loading
  useEffect(() => {
    if (submitLoading) {
      const { blockData, lastError } = selectProductStore;
      const currentLength = blockData.length;
      // 如果blockData长度增加，说明收到了新的SSE消息
      if (currentLength > blockDataLengthRef.current) {
        setSubmitLoading(false);
      }
      // 如果收到 ERROR 状态的 MODULE_HEADER，也关闭 loading 并显示错误信息
      if (lastError && lastError.cardType === 'MODULE_HEADER' && lastError.status === 'ERROR') {
        setSubmitLoading(false);
        // 显示错误信息
        setErrorMessage(lastError.error || '');
        // 清除错误标志，避免重复触发
        selectProductStore.clearLastError();
      }
    }
  }, [selectProductStore.blockData.length, selectProductStore.lastError, submitLoading, selectProductStore]);

  // 当用户修改询盘需求时，清除错误信息
  const handleRequirementChangeWithErrorClear = (text: string, sendOriginalFlag: boolean) => {
    if (errorMessage) {
      setErrorMessage('');
    }
    setRequirement(text);
    setSendOriginal(sendOriginalFlag);
  };

  // 检查是否有OfferAndSupplierList
  const checkHasOfferAndSupplierList = () => {
    const { offerAndSupplierList } = initStatus;
    return offerAndSupplierList &&
      Array.isArray(offerAndSupplierList) &&
      offerAndSupplierList.length > 0 &&
      offerAndSupplierList.some((item: any) => item?.offerInfo && item?.supplierInfo);
  };
  const initFormData = async (dataFillData: any) => {
    // 处理 BATCH_ITEM 类型：需要构建 offerAndSupplierList
    let offerAndSupplierList: any[] = [];
    if (dataFillData.type === 'BATCH_ITEM' && dataFillData.config?.autoOrderConfig?.offerInfos) {
      const offerInfos = dataFillData.config.autoOrderConfig.offerInfos || [];
      if (offerInfos.length > 0) {
        // 提取 offerIds 和 memberIds
        const offerIds = offerInfos.map((item: any) => Number(item.offerId)).filter((id: number) => !isNaN(id));
        const memberIds = offerInfos.map((item: any) => item.memberId).filter(Boolean);

        // 获取商品和供应商详细信息
        offerAndSupplierList = await getSupplierAndOffer({
          offerIds,
          memberIds,
        });

        // 设置到 initStatus
        setInitStatus({
          offerAndSupplierList: offerAndSupplierList || [],
          [DisableItem.DISABLE_SELECT_SUPPLIER]: true,
          [DisableItem.DISABLE_AUTO_ORDER]: false, // 允许显示自动下单组件
        });
      }
    }

    // 处理 itemInfo
    let itemInfo: any = {};
    if (dataFillData.itemInfo?.imgFileKey) {
      itemInfo = {
        imgFileKey: dataFillData.itemInfo.imgFileKey,
        type: dataFillData.type || 'ITEM_IMG',
        previewUrl: dataFillData.itemInfo.imgFileKey, // 使用 imgFileKey 作为预览URL
        offerImg: dataFillData.itemInfo.offerImg,
      };
    } else if (dataFillData.itemInfo?.offerId) {
      itemInfo = {
        offerId: dataFillData.itemInfo.offerId,
        type: dataFillData.type || 'ITEM_LINK',
        previewUrl: dataFillData.itemInfo.offerImg || dataFillData.itemInfo.imgFileKey, // 优先使用offerImg作为预览URL
        offerImg: dataFillData.itemInfo.offerImg,
      };
    } else if (dataFillData.imgUrl) {
      itemInfo = {
        imgFileKey: dataFillData.imgUrl,
        type: 'ITEM_IMG',
        previewUrl: dataFillData.imgUrl,
        offerImg: dataFillData.itemInfo?.offerImg,
      };
    }

    // 处理 inquiryQuestions：将对象格式转换为数组格式
    let inquiryQuestionsArray: any[] = [];
    if (dataFillData.inquiryQuestions) {
      // 如果已经是数组格式，直接使用
      if (Array.isArray(dataFillData.inquiryQuestions)) {
        inquiryQuestionsArray = dataFillData.inquiryQuestions;
      } else {
        // 如果是对象格式 {custom: [], prebuild: []}
        try {
          // 获取预定义问题列表
          const questionListRes = await getQuestionList();
          const prebuildQuestions = questionListRes?.data || [];

          // 处理预定义问题
          const prebuildKeys = dataFillData.inquiryQuestions.prebuild || [];
          const prebuildArray = prebuildKeys.map((key: string) => {
            const question = prebuildQuestions.find((q: any) => q.key === key);
            return question ? { ...question, type: QuestionType.PREBUILD } : null;
          }).filter((q: any) => q !== null);

          // 处理自定义问题
          const customKeys = dataFillData.inquiryQuestions.custom || [];
          const customArray = customKeys.map((key: string) => ({
            q: key,
            key: key,
            type: QuestionType.CUSTOM,
          }));

          inquiryQuestionsArray = [...prebuildArray, ...customArray];
        } catch (error) {
          inquiryQuestionsArray = [];
        }
      }
    }

    // 处理期望订购量和收货地址 - 从 dataFillData.config.custom 获取
    const expectedOrderQuantity = dataFillData.config?.custom?.expectedOrderQuantity || dataFillData.custom?.expectedOrderQuantity;
    const addressCode = dataFillData.config?.custom?.address?.code || dataFillData.custom?.address?.code;

    // 处理询盘需求和原文发送
    const requirementText = typeof dataFillData.requirement === 'object' && dataFillData.requirement !== null
      ? (dataFillData.requirement.content || '')
      : (dataFillData.requirement || '');
    const sendOriginalFlag = typeof dataFillData.requirement === 'object' && dataFillData.requirement !== null
      ? (dataFillData.requirement.isOriginal !== undefined ? dataFillData.requirement.isOriginal : true)
      : (dataFillData.sendOriginal !== undefined ? dataFillData.sendOriginal : true);

    // 对于 BATCH_ITEM 类型，从 offerAndSupplierList 中提取 supplierInfo 和 itemInfo
    let finalSupplierInfo = dataFillData.supplierInfo || [];
    let finalItemInfo = itemInfo;

    if (dataFillData.type === 'BATCH_ITEM' && offerAndSupplierList.length > 0) {
      // 从 offerAndSupplierList 中提取供应商信息（去重）
      const supplierMap = new Map();
      offerAndSupplierList.forEach((item: any) => {
        const memberId = item.supplierInfo.memberId;
        if (!supplierMap.has(memberId)) {
          supplierMap.set(memberId, {
            memberId: item.supplierInfo.memberId,
            headImg: item.supplierInfo.headImg,
            companyName: item.supplierInfo.companyName,
            wangwangId: item.supplierInfo.wangwangId,
          });
        }
      });
      finalSupplierInfo = Array.from(supplierMap.values());

      // 从第一个商品中获取 itemInfo
      const firstOffer = offerAndSupplierList[0];
      if (firstOffer?.offerInfo) {
        finalItemInfo = {
          offerId: firstOffer.offerInfo.offerId,
          offerImg: firstOffer.offerInfo.img,
          type: 'ITEM_LINK',
        };
      }
    }
    
    const formData: any = {
      supplierInfo: finalSupplierInfo,
      itemInfo: finalItemInfo,
      inquiryQuestions: inquiryQuestionsArray,
      requirement: requirementText,
      sendOriginal: sendOriginalFlag,
      expectedOrderQuantity,
      address: addressCode,
      config: {
        reportFinishTimeMinute: dataFillData.config?.reportFinishTimeMinute,
        autoOrderConfig: dataFillData.config?.autoOrderConfig ? {
          enable: dataFillData.config.autoOrderConfig.enable ?? false,
          conditions: dataFillData.config.autoOrderConfig.conditions || [],
        } : (dataFillData.enableAutoOrderConfig ? {
          enable: dataFillData.showAutoOrder || false,
          conditions: [],
        } : {
          enable: false,
          conditions: [],
        }),
        custom: dataFillData.config?.custom || dataFillData.custom,
      },
    };

    // 设置表单值
    form.setFieldsValue(formData);
    // 设置询盘需求和原文发送状态
    setRequirement(requirementText);
    setSendOriginal(sendOriginalFlag);

    // 从 ext 中读取 autoOrderVisible（用于回显时控制显示）
    if (dataFillData.ext?.autoOrderVisible !== undefined) {
      setExtAutoOrderVisible(dataFillData.ext.autoOrderVisible);
    }

    // 初始化后静默校验
    setTimeout(() => {
      checkFormValidationSilently();
      checkItemInfo();
    }, 100);
  };
  useEffect(() => {
    if (taskId) {
      // 清除之前的 timeout，防止默认初始化覆盖 copyTask 的数据
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }

      // 标记为正在初始化，防止其他 useEffect 覆盖
      isInitializedRef.current = true;

      copyTask({
        taskId,
      }).then((res) => {
        const { data, success, msg = '系统异常' } = res;
        if (success) {
          initFormData(JSON.parse(data));
        } else {
          message.error(msg);
          // 初始化失败，重置标记
          isInitializedRef.current = false;
        }
      }).catch((err) => {
        message.error(err?.message || '请求失败，请稍后重试');
        // 初始化失败，重置标记
        isInitializedRef.current = false;
      });
    }
  }, [taskId]);
  return (
    <div className={styles.inquiryRequirementForm}>
      <Form
        form={form}
        layout="vertical"
        className={styles.inquiryContent}
        onValuesChange={readonly ? undefined : handleValuesChange}
        disabled={readonly} // 只读模式下禁用表单
      >
        {(() => {
          // 检查是否有商品和供应商列表数据
          const { offerAndSupplierList } = initStatus;
          const hasOfferAndSupplierList = checkHasOfferAndSupplierList();

          if (hasOfferAndSupplierList) {
            // 处理删除商品和供应商
            const handleDeleteOfferAndSupplier = (item: any) => {
              const currentList = initStatus.offerAndSupplierList || [];
              const newList = currentList.filter((listItem: any) =>
                !(listItem.offerInfo.offerId === item.offerInfo.offerId &&
                  listItem.supplierInfo.memberId === item.supplierInfo.memberId),
              );

              // 更新状态
              setInitStatus({
                ...initStatus,
                offerAndSupplierList: newList,
              });

              // 更新表单中的供应商信息（去重，因为同一个供应商可能对应多个商品）
              const supplierMap = new Map();
              newList.forEach((listItem: any) => {
                const memberId = listItem.supplierInfo.memberId;
                if (!supplierMap.has(memberId)) {
                  supplierMap.set(memberId, {
                    memberId: listItem.supplierInfo.memberId,
                    headImg: listItem.supplierInfo.headImg,
                    companyName: listItem.supplierInfo.companyName,
                    wangwangId: listItem.supplierInfo.wangwangId,
                  });
                }
              });
              const newSupplierInfo = Array.from(supplierMap.values());
              form.setFieldValue('supplierInfo', newSupplierInfo);

              // 更新商品信息
              if (newList.length === 0) {
                // 如果删除后没有数据了，清空商品信息
                form.setFieldValue('itemInfo', undefined);
              } else {
                // 如果还有数据，更新为剩余数据中的第一个商品
                const firstOffer = newList[0];
                if (firstOffer?.offerInfo) {
                  form.setFieldValue('itemInfo', {
                    offerId: firstOffer.offerInfo.offerId,
                    offerImg: firstOffer.offerInfo.img,
                    type: 'ITEM_LINK',
                  });
                }
              }
            };

            return (
              <OfferAndSupplierList
                data={offerAndSupplierList}
                onDelete={handleDeleteOfferAndSupplier}
                disabled={readonly}
                number={offerAndSupplierListNumberMapping.offerAndSupplierList}
              />
            );
          }

          return (
            <>
              <Form.Item
                name="itemInfo"
                rules={readonly ? [] : validationRules.itemInfo}
                validateTrigger={[]}
                preserve={true}
              >
                <AddInquiryOffer
                  offerIdLink={initStatus.offerIdLink || []}
                  disabled={readonly}
                  showFindSupplierTip={hasItemInfo}
                  number={defaultNumberMapping.itemInfo}
                />
              </Form.Item>

              <Form.Item
                name="supplierInfo"
                rules={readonly ? [] : validationRules.supplierInfo}
                validateTrigger={[]}
                preserve={true}
              >
                <ChooseSuppliers
                  disabled={readonly || initStatus[DisableItem.DISABLE_SELECT_SUPPLIER]}
                  showFindSupplierTip={hasItemInfo}
                  number={defaultNumberMapping.supplierInfo}
                  onRecommendSelect={(suppliers, supplierItemPairs) => {
                    setHasRecommendSelected(true);
                    setRecommendSuppliers(suppliers);
                    setRecommendSupplierItemPairs(supplierItemPairs || []);
                  }}
                />
              </Form.Item>
            </>
          );
        })()}

        <Form.Item
          name="inquiryQuestions"
          rules={readonly ? [] : validationRules.inquiryQuestions}
          validateTrigger={[]}
        >
          <InquiryQuestions
            disabled={readonly}
            requirement={requirement}
            sendOriginal={sendOriginal}
            errorMessage={errorMessage}
            number={checkHasOfferAndSupplierList()
              ? offerAndSupplierListNumberMapping.inquiryQuestions
              : defaultNumberMapping.inquiryQuestions}
            onRequirementChange={(text, sendOriginalFlag) => {
              handleRequirementChangeWithErrorClear(text, sendOriginalFlag);
              form.setFieldsValue({
                requirement: text as any,
                sendOriginal: sendOriginalFlag,
              } as any);
            }}
          />
        </Form.Item>

        <BasicInfor
          list={list}
          disabled={readonly}
          number={checkHasOfferAndSupplierList()
            ? offerAndSupplierListNumberMapping.basicInfo
            : defaultNumberMapping.basicInfo}
        />

        {/* <Form.Item
          name={['config', 'reportFinishTimeMinute']}
          rules={readonly ? [] : validationRules.reportFinishTimeMinute}
        >
          <TimeSelector />
        </Form.Item> */}

        {/* 设置自动下单 */}
        {/* 只有在 (fromPage=ZS 且 offerIds 有值) 或用户通过智能推荐选择了供应商时才显示 */}
        {/* 回显模式下，根据 ext.autoOrderVisible 决定是否显示 */}
        {(() => {
          // 回显模式：使用 ext.autoOrderVisible
          if (readonly && extAutoOrderVisible !== undefined) {
            return extAutoOrderVisible;
          }
          // 正常模式：使用原来的逻辑
          return !initStatus[DisableItem.DISABLE_AUTO_ORDER] &&
            ((fromPage === 'ZS' && !!offerIds) || hasRecommendSelected);
        })() && (
            <Form.Item
              name={['config', 'autoOrderConfig']}
            >
              <AutoOrderSettings
                number={checkHasOfferAndSupplierList()
                  ? offerAndSupplierListNumberMapping.autoOrderSettings
                  : defaultNumberMapping.autoOrderSettings}
              />
            </Form.Item>
          )}
      </Form>
      <div className={styles.blc} />
      {!readonly && (
        <div className={styles.footer}>
          <Button
            type="primary"
            className={styles.submitButton}
            disabled={!isFormValid || submitLoading}
            loading={submitLoading}
            onClick={handleSubmit}
          >
            {submitLoading ? $t("global-1688-ai-app.inquiry.FormatList.RightComponents.InquiryRequirementForm.submitting", "提交中") : $t("global-1688-ai-app.inquiry.FormatList.RightComponents.InquiryRequirementForm.qdxpxq", "确定询盘需求")}
          </Button>
        </div>
      )}
    </div>
  );
});

export default InquiryRequirementForm;

