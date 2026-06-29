---
title: 简介
sidebar_position: 1
---

### Install

```tsx
$ npm i @alife/1688-chain-dialog-provider --save
```

### Usage

```tsx
import { useModal, DialogProvider } from "@alife/1688-chain-dialog-provider";
const { showModal, pauseQueue, resumeQueue, clearQueue, isPaused } = useModal();

// 展示高优先级弹窗
showModal({
  priority: 1,
  title: "高优先级弹窗",
  content: "这是一个高优先级弹窗示例",
  onOk: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("高优先级弹窗确认");
  },
});
// 展示中优先级弹窗
showModal({
  priority: 2,
  title: "中优先级弹窗",
  content: "这是一个中优先级弹窗示例",
  onOk: () => console.log("中优先级弹窗确认"),
});
const App = () => {
  return (
    <DialogProvider
      dialogRender={({ currentModal, handleOk, handleCancel }) => {
        return (
          <Modal
            {...currentModal}
            open={!!currentModal}
            onOk={handleOk}
            onCancel={handleCancel}
            destroyOnClose
          />
        );
      }}
    ></DialogProvider>
  );
};
```

## 示例

```tsx preview
import { useState, useEffect } from "react";
import { useModal, DialogProvider } from "@alife/1688-chain-dialog-provider";
import { Modal, Button, Space, message, Checkbox } from "antd";

const DemoContent = () => {
  const { showModal, pauseQueue, resumeQueue, clearQueue, isPaused } =
    useModal();
  const [checked, setChecked] = useState(false);

  // useEffect(() => {
  //   showModal({
  //     priority: 1,
  //     joinQueue: true,
  //     title: "高优先级弹窗",
  //     content: "这是一个高优先级弹窗示例",
  //     onOk: async () => {
  //       console.log("高优先级弹窗确认");
  //     },
  //   });
  //   console.log("showModal", showModal);
  // }, []);
  const onChange = (e) => {
    console.log(`checked = ${e.target.checked}`);
    setChecked(e.target.checked);
  };
  const handleShowModals = () => {
    // 展示高优先级弹窗
    showModal({
      priority: 1,
      joinQueue: true,
      title: <div><Button onClick={pauseQueue}>pauseQueue</Button></div>,
      content: (
        <>
          这是一个高优先级弹窗示例qqq
          <Checkbox onChange={onChange} checked={checked}>
            Checkbox
          </Checkbox>
        </>
      ),
      onOk: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("高优先级弹窗确认");
      },
    });

    // 展示中优先级弹窗
    showModal({
      priority: 2,
      joinQueue: false,
      title: "中优先级弹窗",
      content: "这是一个中优先级弹窗示例",
      onOk: () => console.log("中优先级弹窗确认"),
    });

    // 展示低优先级弹窗
    showModal({
      priority: 3,
      joinQueue: true,
      title: "低优先级弹窗",
      content: "这是一个低优先级弹窗示例",
      onOk: () => console.log("低优先级弹窗确认"),
    });
  };

  const handleShowCustomModal = () => {
    showModal({
      title: "自定义弹窗",
      content: (
        <div>
          <h3>自定义内容</h3>
          <p>这是一个自定义内容的弹窗</p>
        </div>
      ),
      width: 500,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("自定义弹窗确认");
      },
    });
  };

  const handleShowImmediate = () => {
    showModal({
      title: "紧急弹窗",
      content: "这是一个需要立即显示的紧急弹窗",
      immediate: true,
      okText: "知道了",
      onOk: () => message.success("紧急弹窗已确认"),
    });
  };

  const handleQueueControl = () => {
    if (isPaused) {
      resumeQueue();
      message.success("弹窗队列已恢复");
    } else {
      pauseQueue();
      message.success("弹窗队列已暂停");
    }
  };

  return (
    <Space direction="vertical" size="middle">
      <Space>
        <Button onClick={handleShowModals}>显示多个弹窗</Button>
        <Button onClick={handleShowCustomModal}>显示自定义弹窗</Button>
      </Space>
      <Space>
        <Button type="primary" onClick={handleShowImmediate}>
          插入紧急弹窗
        </Button>
        <Button
          type={isPaused ? "primary" : "default"}
          onClick={handleQueueControl}
        >
          {isPaused ? "恢复弹窗队列" : "暂停弹窗队列"}
        </Button>
        <Button danger onClick={clearQueue}>
          清空弹窗队列
        </Button>
      </Space>
    </Space>
  );
};

const App = () => {
  return (
    <DialogProvider
      dialogRender={({ currentModal, handleOk, handleCancel }) => {
        return (
          <Modal
            {...currentModal}
            open={!!currentModal}
            onOk={handleOk}
            onCancel={handleCancel}
            destroyOnClose
          />
        );
      }}
    >
      <div style={{ padding: 20 }}>
        <h1>配置化弹窗示例</h1>
        <DemoContent />
      </div>
    </DialogProvider>
  );
};

export default App;
```
