import React from "react";
import { App, Switch } from "antd";
import dayjs from "dayjs";
import DustbinIcon from "@/components/Icons/DustbinIcon";
import EditIcon from "@/components/Icons/PencilEdit";
import Spin from "@/components/Icons/Spin";
import NoteListIcon from "@/components/Icons/NoteList";
import Toast from "@/components/Toast";
import {
  enableKnowledge,
  disableKnowledge,
  deleteKnowledge,
} from "@/services/studioKnowledge";
import { TypeKnowledgeItem, EnumKnowledgeStatus } from "./types";
import { $t } from "@/i18n";
import styles from "./KnowledgeItem.module.scss";

interface TypeKnowledgeItemProps {
  containerContext: any;
  item: TypeKnowledgeItem;
  onDataChange?: (id: string, data: any) => void;
  onDelete?: () => void;
}

const KnowledgeItem: React.FC<TypeKnowledgeItemProps> = (props) => {
  const { containerContext, item, onDataChange, onDelete = () => {} } = props;
  const isSuccess = item.status === EnumKnowledgeStatus.Success;
  const isParsing = item.status === EnumKnowledgeStatus.Parsing;
  const isFailed = item.status === EnumKnowledgeStatus.Failed;

  const toast = Toast();
  const { modal } = App.useApp();

  const handleToggle = async (checked: boolean) => {
    onDataChange?.(item.kbId, { enable: checked });
    try {
      let res = false;
      if (checked) {
        res = await enableKnowledge(item.kbId);
        toast.success(
          $t(
            "global-1688-ai-app.UserPrefer.Knowledge.enableKnowledgeSuccess",
            "启用知识库成功",
          ),
        );
      } else {
        res = await disableKnowledge(item.kbId);
        toast.success(
          $t(
            "global-1688-ai-app.UserPrefer.Knowledge.disableKnowledgeSuccess",
            "关闭知识库成功",
          ),
        );
      }
    } catch (err) {
      toast.error(
        err.message ||
          $t(
            "global-1688-ai-app.UserPrefer.Knowledge.operationFailed",
            "操作失败，请稍后重试",
          ),
      );
      onDataChange?.(item.kbId, { enable: !checked });
    }
  };

  const handleDelete = async (id: string) => {
    modal.confirm({
      classNames: { content: styles.downloadModal },
      title: $t(
        "global-1688-ai-app.UserPrefer.Knowledge.deletingKnowledge",
        "正在删除知识库",
      ),
      icon: null,
      width: 400,
      centered: true,
      content: (
        <div>
          <span>
            {$t(
              "global-1688-ai-app.UserPrefer.Knowledge.deleteKnowledgeConfirm",
              "是否确定删除该知识库？",
            )}
          </span>
        </div>
      ),
      onOk: async () => {
        try {
          await deleteKnowledge(id);
          toast.success(
            $t(
              "global-1688-ai-app.UserPrefer.Knowledge.deleteKnowledgeSuccess",
              "删除知识库成功",
            ),
          );
          onDelete?.();
        } catch (err) {
          toast.error(
            err.message ||
              $t(
                "global-1688-ai-app.UserPrefer.Knowledge.deleteKnowledgeFailed",
                "删除知识库失败，请稍后重试",
              ),
          );
        }
      },
      cancelText: $t("global-1688-ai-app.common.cancel", "取消"),
      okText: $t("global-1688-ai-app.common.ok", "确定"),
    });
  };

  const handleEdit = (item: TypeKnowledgeItem) => {
    containerContext.setActiveTab("knowledgeEdit", item);
  };

  return (
    <div className={`${styles.card}`}>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleRow}>
            <div className={styles.cardTitleLeft}>
              {item.kbType === "image" ? (
                <i className={styles.imageIcon} />
              ) : (
                <NoteListIcon className={styles.iconSmall} />
              )}
              <span className={styles.cardTitleText}>{item.kbName}</span>
            </div>
            <Switch
              checked={item.enable}
              disabled={!isSuccess}
              onChange={(checked) => !isParsing && handleToggle(checked)}
            />
          </div>
          <span className={styles.dateText}>
            {dayjs(item.createTime).format("YYYY.MM.DD")}
          </span>
        </div>

        <div className={styles.descriptionRow}>
          {isParsing ? (
            <div className={styles.statusRow}>
              <Spin className={styles.spinIcon} />
              <span className={styles.description}>
                {$t(
                  "global-1688-ai-app.UserPrefer.Knowledge.knowledgeParsing",
                  "知识库解析中，暂时无法开启",
                )}
              </span>
            </div>
          ) : isFailed ? (
            <span className={styles.description}>
              {$t(
                "global-1688-ai-app.UserPrefer.Knowledge.knowledgeParsingFailed",
                "知识库解析失败",
              )}
            </span>
          ) : (
            !!item.kbDesc && (
              <div className={styles.description}>{item.kbDesc}</div>
            )
          )}
        </div>

        {!isParsing && (
          <div className={styles.actionRow}>
            {/* {
                  isFailed && (
                    <div className={styles.actionBtn} onClick={() => handleEdit(item.kbId)}>
                      <EditIcon
                        className={styles.actionIcon}
                      />
                      <span className={styles.actionText}>重试</span>
                    </div>
                  )
                } */}
            <div className={styles.actionBtn} onClick={() => handleEdit(item)}>
              <EditIcon className={styles.actionIcon} />
              <span className={styles.actionText}>
                {$t("global-1688-ai-app.UserPrefer.Knowledge.edit", "编辑")}
              </span>
            </div>
            <div
              className={styles.actionBtn}
              onClick={() => handleDelete(item.kbId)}
            >
              <DustbinIcon className={styles.actionIcon} />
              <span className={styles.actionText}>
                {$t("global-1688-ai-app.UserPrefer.Knowledge.delete", "删除")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeItem;
