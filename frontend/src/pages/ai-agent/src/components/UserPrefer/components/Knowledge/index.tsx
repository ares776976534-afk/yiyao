import React, { useState, useEffect } from "react";
import { Button } from "antd";
import Toast from "@/components/Toast";
import KnowledgeItem from "./KnowledgeItem";
import { getKnowledgeList } from "@/services/studioKnowledge";
import { TypeKnowledgeItem, EnumKnowledgeStatus } from "./types";
import { $t } from "@/i18n";
import styles from "./index.module.scss";

// Mock data
const MOCK_KNOWLEDGE_LIST: TypeKnowledgeItem[] = [
  {
    kbId: "1",
    kbName: "黑色星期五电商海报",
    kbType: "image",
    createTime: Date.now(),
    status: EnumKnowledgeStatus.Parsing,
    enable: false,
  },
  {
    kbId: "2",
    kbName: "黑色星期五电商海报",
    kbType: "text",
    createTime: Date.now(),
    kbDesc:
      "知识库内容知识库内容知识库内容知识库内容知识库内容知识库内容知识库内容识库内容",
    status: EnumKnowledgeStatus.Success,
    enable: true,
  },
  {
    kbId: "3",
    kbName: "黑色星期五电商海报",
    kbType: "image",
    createTime: Date.now(),
    kbDesc:
      "知识库内容知识库内容知识库内容知识库内容知识库内容知识库内容知识库内容识库内容",
    status: EnumKnowledgeStatus.Success,
    enable: true,
  },
  {
    kbId: "4",
    kbName: "黑色星期五电商海报",
    kbType: "image",
    createTime: Date.now(),
    kbDesc:
      "知识库内容知识库内容知识库内容知识库内容知识库内容知识库内容知识库内容识库内容",
    status: EnumKnowledgeStatus.Success,
    enable: true,
  },
  {
    kbId: "5",
    kbName: "黑色星期五电商海报",
    kbType: "image",
    createTime: Date.now(),
    kbDesc:
      "知识库内容知识库内容知识库内容知识库内容知识库内容知识库内容知识库内容识库内容",
    status: EnumKnowledgeStatus.Success,
    enable: true,
  },
  {
    kbId: "6",
    kbName: "黑色星期五电商海报",
    kbType: "image",
    createTime: Date.now(),
    kbDesc:
      "知识库内容知识库内容知识库内容知识库内容知识库内容知识库内容知识库内容识库内容",
    status: EnumKnowledgeStatus.Success,
    enable: true,
  },
];

interface TypeKnowledgeListProps {
  containerContext: any;
}

const KnowledgeList: React.FC<TypeKnowledgeListProps> = (props) => {
  const { containerContext } = props;
  const [list, setList] = useState<TypeKnowledgeItem[]>([]);
  const toast = Toast();

  const fetchKnowledgeList = async () => {
    try {
      const res = await getKnowledgeList();
      setList(res);
    } catch (err) {
      toast.error(
        err.message ||
          $t(
            "global-1688-ai-app.UserPrefer.Knowledge.getKnowledgeListFailed",
            "获取知识库列表失败",
          ),
      );
    }
  };

  const handleDataChange = (id: string, data: any) => {
    const item = list.find((item) => item.kbId === id);

    if (item) {
      Object.assign(item, data);
      setList([...list]);
    }
  };

  const handleAddKnowledge = () => {
    containerContext.setActiveTab("knowledgeEdit");
  };

  const handleDelete = async () => {
    fetchKnowledgeList();
  };

  useEffect(() => {
    fetchKnowledgeList();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.listContainer}>
        {list.length ? (
          list.map((item) => (
            <div key={item.kbId} className={styles.item}>
              <KnowledgeItem
                containerContext={containerContext}
                item={item}
                onDataChange={handleDataChange}
                onDelete={handleDelete}
              />
            </div>
          ))
        ) : (
          <div className={styles.emptyContent}>
            <img
              className={styles.emptyImage}
              src="https://img.alicdn.com/imgextra/i3/O1CN016BRrUq28xbFXiRhVy_!!6000000007999-55-tps-80-80.svg"
            />
            <div>
              {$t(
                "global-1688-ai-app.UserPrefer.knowledgeBase.empty",
                "暂无知识库 请立刻去添加吧",
              )}
            </div>
            <Button
              type="primary"
              className={styles.addBtn}
              onClick={handleAddKnowledge}
            >
              <img
                className={styles.addIcon}
                src="https://img.alicdn.com/imgextra/i2/6000000007172/O1CN01prO8bG22qphbgYPz8_!!6000000007172-2-gg_dtc.png"
                alt="add"
              />
              <span className={styles.addBtnText}>
                {$t(
                  "global-1688-ai-app.UserPrefer.knowledgeBase.add",
                  "添加知识",
                )}
              </span>
            </Button>
          </div>
        )}
      </div>
      {!!list.length && (
        <div className={styles.maskLayer}>
          <Button
            type="primary"
            className={styles.addBtn}
            onClick={handleAddKnowledge}
          >
            <img
              className={styles.addIcon}
              src="https://img.alicdn.com/imgextra/i2/6000000007172/O1CN01prO8bG22qphbgYPz8_!!6000000007172-2-gg_dtc.png"
              alt="add"
            />
            <span className={styles.addBtnText}>
              {$t(
                "global-1688-ai-app.UserPrefer.knowledgeBase.add",
                "添加知识",
              )}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default function Knowledge(props: { containerContext: any }) {
  return <KnowledgeList containerContext={props.containerContext} />;
}
