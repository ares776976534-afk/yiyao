import React, { useState, useRef } from 'react';
import { Button, Space, Toast } from 'antd-mobile';
import showTaskLinkModal, {
  TaskLinkModal,
} from '../src/components/TaskLinkModel';

/**
 * TaskLinkModal 弹窗组件使用示例
 */
const TaskLinkCardExample: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const handlerRef = useRef<any>();

  // 受控组件 - 基本用法
  const handleControlledShow = () => {
    setVisible(true);
  };

  // 受控组件 - 自定义文案
  const [visibleCustom, setVisibleCustom] = useState(false);
  const handleControlledCustomShow = () => {
    setVisibleCustom(true);
  };

  // 命令式调用 - 基本用法
  const handleImperativeShow = () => {
    handlerRef.current = showTaskLinkModal({
      onClose: () => {
        console.log('弹窗已关闭');
      },
    });
  };

  // 命令式调用 - 自定义文案
  const handleImperativeCustomShow = () => {
    showTaskLinkModal({
      title: '复制链接到浏览器访问',
      buttonText: '立即复制',
      titleAfterClick: '链接已复制成功！',
      onButtonClick: () => {
        Toast.show({
          content: '链接已复制',
          icon: 'success',
        });
      },
    });
  };

  // 命令式调用 - 手动关闭
  const handleImperativeClose = () => {
    if (handlerRef.current) {
      handlerRef.current.close();
      handlerRef.current = null;
    }
  };

  // 命令式调用 - 不可点击遮罩关闭
  const handleImperativeShowNoMaskClose = () => {
    showTaskLinkModal({
      onClose: () => {
        console.log('通过关闭按钮关闭');
      },
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>TaskLinkModal 弹窗示例</h2>

      <div style={{ marginTop: '20px' }}>
        <h3>方式一：使用 visible 控制（受控组件）</h3>
        <Space direction="vertical">
          <Button
            color="primary"
            onClick={handleControlledShow}
          >
            打开弹窗（默认文案）
          </Button>

          <Button
            color="primary"
            onClick={handleControlledCustomShow}
          >
            打开弹窗（自定义文案）
          </Button>
        </Space>

        {/* 默认文案弹窗 */}
        <TaskLinkModal
          visible={visible}
          onClose={() => setVisible(false)}
          onButtonClick={() => {
            Toast.show('按钮被点击');
          }}
        />

        {/* 自定义文案弹窗 */}
        <TaskLinkModal
          visible={visibleCustom}
          onClose={() => setVisibleCustom(false)}
          title="请在PC浏览器中打开"
          titleAfterClick="复制成功！\n请粘贴到浏览器访问"
          buttonText="确认复制"
          onButtonClick={() => {
            Toast.show({
              content: '复制成功',
              icon: 'success',
            });
          }}
        />
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>方式二：命令式调用（非受控）⭐ 推荐</h3>
        <Space direction="vertical">
          <Button
            color="success"
            onClick={handleImperativeShow}
          >
            命令式打开弹窗（默认文案）
          </Button>

          <Button
            color="success"
            onClick={handleImperativeCustomShow}
          >
            命令式打开弹窗（自定义文案）
          </Button>

          <Button
            color="danger"
            onClick={handleImperativeClose}
          >
            手动关闭弹窗
          </Button>

          <Button
            color="warning"
            onClick={handleImperativeShowNoMaskClose}
          >
            打开弹窗（不可点击遮罩关闭）
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default TaskLinkCardExample;
