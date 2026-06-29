# @alife/1688-chain-fatigue

可配置的弹窗优先级队列

## Install

```bash
$ npm i @alife/1688-chain-dialog-provider --save
```

## Usage

```js
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
    >
    </DialogProvider>
  );
};
```
