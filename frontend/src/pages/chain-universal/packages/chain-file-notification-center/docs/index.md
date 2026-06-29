---
title: Framework
sidebar_position: 1
---

## @alife/1688-chain-file-notification-center

组件功能描述

### Install

```tsx
$ npm i @alife/1688-chain-file-notification-center --save
```

### Usage

```tsx
import NotificationCenter from "@alife/1688-chain-file-notification-center";
```

## 示例

```tsx preview
import React, { useState, useRef } from "react";
import NotificationCenter, {
  setHostMap,
} from "@alife/1688-chain-file-notification-center";
// import FileExport from "@alife/1688-chain-file-export";
// import FileImport from "@alife/1688-chain-file-import";
import { Button } from "@alifd/next";
import "@alife/theme-103433/variables.css";
import "@alife/theme-103433/dist/next.var.css";

export default () => {
  const [visible, setVisible] = useState(false);
  const [activeKey, setActiveKey] = useState('import');
  const reloadFnRef = useRef(null);

  // const [refresh, setRefresh] = useState(true);
  setHostMap({
    geiseller: {
      daily: "pre-supplychain.1688.com",
      pre: "pre-supplychain.1688.com",
      prod: "pre-supplychain.1688.com",
    },
  });

  return (
    <div>
      {/* <FileExport
        code="SUPPLY_PRODUCT_TEST_EXPORT"
        getData={() => {
          return {
            queryParams: {
              "java.util.Date": 1591718400000,
            },
          };
        }}
      >
        <Button>导出(带参数)</Button>
      </FileExport> */}
      <Button
        onClick={() => {
          setVisible(true);
          reloadFnRef.current && reloadFnRef.current({ type: activeKey });
        }}
        style={{ float: "right" }}
      >
        打开任务中心
      </Button>
      <NotificationCenter
        activeKey={activeKey}
        visible={visible}
        onChange={(data) => {
          if(data.visible !== null) {
            setVisible(data.visible);
          }
          data.activeKey && setActiveKey(data.activeKey);
          data.needReload && reloadFnRef.current({ type: data.activeKey });
        }}
        // onCountChange={this.onCountChange}
        counts={{}}
        showTodo={true}
        refresh={true}
        reloadFn={(fn) => {
          reloadFnRef.current = fn;
        }}
      />
    </div>
  );
};
```
