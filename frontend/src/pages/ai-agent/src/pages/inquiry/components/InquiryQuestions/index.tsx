import React, { useState, useEffect } from "react";
import { Input, Switch, Popover, message } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import CustomQuestions from "./CustomQuestions";
import { getQuestionList } from "@/pages/inquiry/services";
import {
    DoubleRightArrowIcon,
    InquiryQuestionIcon,
    InquiryHelpIcon,
} from "@/components/Icon";
import { getNumberIcon } from '../FormatList/RightComponents/numberIconConfig';

import styles from "./index.module.css";
import { $t } from '@/i18n';

const { TextArea } = Input;

export enum QuestionType {
    PREBUILD = "prebuild",
    CUSTOM = "custom",
}

interface QuestionSelectorProps {
    onChange?: (questions: Question[]) => void;
    value?: Question[];
    disabled?: boolean; // 是否禁用
    onRequirementChange?: (requirement: string, sendOriginal: boolean) => void; // 询盘需求变化回调
    requirement?: string; // 询盘需求内容
    sendOriginal?: boolean; // 是否原文发送
    errorMessage?: string; // 错误信息
    number?: number; // 数字序号
}
interface Question {
    q: string;
    key: string;
    type?: string;
}

const InquiryQuestions: React.FC<QuestionSelectorProps> = ({
    onChange,
    value,
    disabled = false,
    onRequirementChange,
    requirement = "",
    sendOriginal = true,
    errorMessage,
    number = 3,
}) => {
    const NumberIcon = getNumberIcon(number);
    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
    const [isCustomQuestionsOpen, setIsCustomQuestionsOpen] = useState(false);
    const [question, setQuestion] = useState<Question[]>([]);
    const [requirementText, setRequirementText] = useState(requirement);
    const [isSendOriginal, setIsSendOriginal] = useState(sendOriginal);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(
        null
    ); // 正在编辑的问题
    const maxSelectedQuestions = 6;

    const handleQuestionClick = (questionItem: Question) => {
        if (disabled) return; // 禁用状态下不允许点击

        let newSelectedQuestions: Question[];
        if (selectedQuestions.some((q) => q.key === questionItem.key)) {
            newSelectedQuestions = selectedQuestions.filter(
                (q) => q.key !== questionItem.key
            );
        } else {
            if (selectedQuestions.length < maxSelectedQuestions) {
                newSelectedQuestions = [...selectedQuestions, questionItem];
            } else {
                return;
            }
        }
        setSelectedQuestions(newSelectedQuestions);
        // 直接触发onChange，避免useEffect死循环
        onChange?.(newSelectedQuestions);
    };

    const handleCustomQuestionSubmit = (newQuestion: string): boolean => {
        // 检查是否已存在相同内容的自定义问题
        const isDuplicate = question.some(
            (q) => q.type === QuestionType.CUSTOM && q.q === newQuestion,
        );

        if (isDuplicate) {
            message.warning($t("global-1688-ai-app.inquiry.InquiryQuestions.duplicateQuestion", "该问题已存在，请勿重复创建"));
            return false;
        }

        const newQuestionObject = {
            q: newQuestion,
            key: newQuestion,
            type: QuestionType.CUSTOM,
        };
        setQuestion([...question, newQuestionObject]);
        // 如果已选中的问题数量未达到上限，自动选中新创建的自定义问题
        if (selectedQuestions.length < maxSelectedQuestions) {
            handleQuestionClick(newQuestionObject);
        }
        return true;
    };

    // 处理编辑自定义问题
    const handleEditQuestion = (
        questionItem: Question,
        e: React.MouseEvent
    ) => {
        e.stopPropagation(); // 阻止事件冒泡，避免触发选择
        if (disabled) return;
        setEditingQuestion(questionItem);
        setIsCustomQuestionsOpen(true);
    };

    // 处理更新自定义问题
    const handleUpdateQuestion = (updatedText: string) => {
        if (!editingQuestion) return;

        const oldKey = editingQuestion.key;
        const newQuestionObject = {
            q: updatedText,
            key: updatedText,
            type: QuestionType.CUSTOM,
        };

        // 更新问题列表
        setQuestion((prevQuestions) => {
            return prevQuestions.map((q) =>
                q.key === oldKey ? newQuestionObject : q
            );
        });

        // 如果该问题已被选中，更新选中列表并触发 onChange
        setSelectedQuestions((prevSelected) => {
            const isSelected = prevSelected.some((q) => q.key === oldKey);
            if (isSelected) {
                const updatedSelected = prevSelected.map((q) =>
                    q.key === oldKey ? newQuestionObject : q
                );
                // 在状态更新后触发 onChange
                setTimeout(() => {
                    onChange?.(updatedSelected);
                }, 0);
                return updatedSelected;
            }
            return prevSelected;
        });

        setEditingQuestion(null);
    };

    // 处理删除自定义问题（从编辑窗口调用）
    const handleDeleteQuestion = () => {
        if (!editingQuestion || disabled) return;

        const questionItem = editingQuestion;

        // 从问题列表中删除
        setQuestion((prevQuestions) =>
            prevQuestions.filter((q) => q.key !== questionItem.key)
        );

        // 如果该问题已被选中，从选中列表中移除
        const isSelected = selectedQuestions.some(
            (q) => q.key === questionItem.key
        );
        if (isSelected) {
            const newSelectedQuestions = selectedQuestions.filter(
                (q) => q.key !== questionItem.key
            );
            setSelectedQuestions(newSelectedQuestions);
            onChange?.(newSelectedQuestions);
        }

        setEditingQuestion(null);
    };

    // 获取预定义问题列表
    useEffect(() => {
        getQuestionList().then((res: any) => {
            const questionData =
                res?.data.map((item: any) => ({
                    ...item,
                    type: QuestionType.PREBUILD,
                })) || [];
            setQuestion(questionData);
        });
    }, []);

    // 监听外部value变化，将自定义问题添加到question数组中
    useEffect(() => {
        if (value && value.length > 0) {
            const customQuestions = value.filter(
                (q: Question) => q.type === QuestionType.CUSTOM
            );
            if (customQuestions.length > 0) {
                setQuestion((prevQuestions) => {
                    // 检查是否已经存在，避免重复添加
                    const existingKeys = prevQuestions.map((q) => q.key);
                    const newCustomQuestions = customQuestions.filter(
                        (q: Question) => !existingKeys.includes(q.key)
                    );
                    return [...prevQuestions, ...newCustomQuestions];
                });
            }
        }
    }, [value]);

    // 监听外部value变化 - 不触发onChange避免循环
    useEffect(() => {
        if (question.length > 0) {
            if (value) {
                const allInitialQuestionKeys = value.map((q) => q.key);
                const initialSelectedQuestions = question.filter((q) =>
                    allInitialQuestionKeys.includes(q.key)
                );
                setSelectedQuestions(initialSelectedQuestions);
            } else {
                setSelectedQuestions([]);
            }
        }
    }, [value, question]);

    // 组件挂载后初始化报告当前值 - 延迟执行避免循环
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange?.(selectedQuestions);
        }, 0);
        return () => clearTimeout(timer);
    }, []); // 只在组件挂载时执行一次

    const handleRequirementChange = (text: string) => {
        setRequirementText(text);
        onRequirementChange?.(text, isSendOriginal);
    };

    const handleSendOriginalChange = (checked: boolean) => {
        setIsSendOriginal(checked);
        onRequirementChange?.(requirementText, checked);
    };

    // 监听外部 requirement 和 sendOriginal 变化
    useEffect(() => {
        setRequirementText(requirement);
        setIsSendOriginal(sendOriginal);
    }, [requirement, sendOriginal]);

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div
                    className={styles.sectionTitle}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    <NumberIcon />
                    <span>{$t("global-1688-ai-app.inquiry.InquiryQuestions.sts", "选择询盘问题")}</span>
                    {/* 快捷选择询盘问题 */}
                    <span className={styles.questionsPrompt}>{$t("global-1688-ai-app.inquiry.InquiryQuestions.ibcg", "(问题必选，最多可选6个)")}</span>
                </div>
            </div>

            <div className={styles.questionsContainer}>
                {question.map((questionItem, index) => {
                    const isCustom = questionItem.type === QuestionType.CUSTOM;
                    const isSelected = selectedQuestions.some(
                        (q) => q.key === questionItem.key
                    );
                    return (
                        <div
                            key={index}
                            className={`${styles.questionItem} ${
                                isSelected ? styles.selected : ""
                            } ${
                                (!isSelected &&
                                    selectedQuestions.length >=
                                        maxSelectedQuestions) ||
                                disabled
                                    ? styles.disabled
                                    : ""
                            } ${isCustom ? styles.customQuestionItem : ""}`}
                            onClick={() => handleQuestionClick(questionItem)}
                        >
                            <span className={styles.questionText}>
                                {questionItem.q}
                            </span>
                            {isCustom && !disabled && (
                                <div
                                    className={styles.questionActions}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <img  
                                    onClick={(e) =>
                                            handleEditQuestion(questionItem, e)
                                        } 
                                        className={styles.questionActionsIcon} 
                                        src="https://img.alicdn.com/imgextra/i3/O1CN01spjHEA22bGDrxI9WL_!!6000000007138-2-tps-64-64.png" alt="" />
                                </div>
                            )}
                        </div>
                    );
                })}
                {!disabled && (
                    <div
                        className={styles.customQuestionButton}
                        onClick={() => setIsCustomQuestionsOpen(true)}
                    >
                        <PlusOutlined />
                        <span className={styles.customQuestionButtonText}>{$t("global-1688-ai-app.inquiry.InquiryQuestions.zdyissue", "自定义问题")}</span>
                    </div>
                )}
            </div>
            <CustomQuestions
                open={isCustomQuestionsOpen}
                onClose={() => {
                    setIsCustomQuestionsOpen(false);
                    setEditingQuestion(null);
                }}
                onSubmit={handleCustomQuestionSubmit}
                initialValue={editingQuestion?.q || ""}
                onUpdate={handleUpdateQuestion}
                onDelete={editingQuestion ? handleDeleteQuestion : undefined}
            />
            <div className={styles.moreText}>{$t("global-1688-ai-app.inquiry.InquiryQuestions.yfx", "也可以在下方补充你的询盘需求：")}</div>
            {/* 询盘需求输入区域 */}
            <div className={styles.requirementContainer}>
                <div className={styles.textAreaWrapper}>
                    <TextArea
                        className={styles.requirementTextArea}
                        placeholder={$t("global-1688-ai-app.inquiry.InquiryQuestions.qtxBzdmLzSrspbxxIrg", `请输入你的询盘需求，如：我想批量定制100件带自己公司LOGO的紫色帆布包……
--> 支持原文发送，固定的询盘文案
--> 也可不填写询盘需求，直接勾选上方询盘问题，让AI帮你沟通～`)}
                        value={requirementText}
                        onChange={(event) =>
                            handleRequirementChange(event.target.value)
                        }
                        disabled={disabled}
                        rows={6}
                        autoSize={{ minRows: 6, maxRows: 100 }}
                    />
                    <div className={styles.sendOriginalSwitch}>
                        <Popover
                            overlayClassName={styles.customPopover}
                            content={
                                <div className={styles.popoverContent}>
                                    <div className={styles.popoverTitle}>{$t("global-1688-ai-app.inquiry.InquiryQuestions.xpxqtx", "询盘需求填写")}</div>
                                    <div className={styles.popoverContentText}>{$t("global-1688-ai-app.inquiry.InquiryQuestions.nwoyxgzyPgbmmdcr5Psinpth", "你好，我是xx公司的业务员，需要大批定制折叠款黑色雨伞，雨伞外包装或者伞柄上想印我们自己公司的logo，采购量大致在500左右，价格上能否有优惠，发货最快是什么时候？")}</div>
                                    <div className={styles.iconWrapper}>
                                        <DoubleRightArrowIcon />
                                    </div>
                                    <div className={styles.popoverTitle}>{$t("global-1688-ai-app.inquiry.InquiryQuestions.xpxgsy", "询盘效果示意")}</div>
                                    <div className={styles.popoverCoreWrapper}>
                                        <div className={styles.popoverCoreItem}>
                                            <div
                                                className={styles.popoverTitle}
                                            >{$t("global-1688-ai-app.inquiry.InquiryQuestions.onywfs", "开启原文发送")}</div>
                                            <div
                                                className={
                                                    styles.popoverCoreDes
                                                }
                                            >{$t("global-1688-ai-app.inquiry.InquiryQuestions.AtxffrtMg", "AI将把你填写的询盘需求文案，原封不动直接发送给商家，自动进行多轮沟通")}</div>
                                            <img
                                                className={
                                                    styles.popoverCoreImg
                                                }
                                                src="https://img.alicdn.com/imgextra/i4/O1CN01KANFCy1tfzlzT6BEA_!!6000000005930-2-tps-882-552.png"
                                            />
                                        </div>
                                        <div className={styles.popoverCoreItem}>
                                            <div
                                                className={styles.popoverTitle}
                                            >{$t("global-1688-ai-app.inquiry.InquiryQuestions.offywfs", "关闭原文发送")}</div>
                                            <div
                                                className={
                                                    styles.popoverCoreDes
                                                }
                                            >{$t("global-1688-ai-app.inquiry.InquiryQuestions.AnqwynrtImn", "AI会理解你的询盘需求，根据上下文改变问法，以此更加智能地与商家沟通收集信息")}</div>
                                            <img
                                                className={
                                                    styles.popoverCoreImg
                                                }
                                                src="https://img.alicdn.com/imgextra/i3/O1CN012Pdyf81dI9IWG5KDm_!!6000000003712-2-tps-882-552.png"
                                            />
                                        </div>
                                    </div>
                                </div>
                            }
                            placement="topLeft"
                            trigger="hover"
                            arrow={false}
                        >
                            <div className={styles.tooltipTrigger}>
                                <InquiryHelpIcon />
                            </div>
                        </Popover>
                        <span className={styles.switchLabel}>{$t("global-1688-ai-app.inquiry.InquiryQuestions.ywfs", "原文发送")}</span>
                        <div className={styles.customSwitch}>
                            <Switch
                                checked={isSendOriginal}
                                onChange={handleSendOriginalChange}
                                disabled={disabled}
                            />
                        </div>
                    </div>
                </div>
                {errorMessage && (
                    <div className={styles.errorMessage}>
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InquiryQuestions;
