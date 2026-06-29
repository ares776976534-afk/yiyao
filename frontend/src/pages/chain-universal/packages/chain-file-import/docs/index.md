---
title: chain-file-import
sidebar_position: 1
---

## @alife/1688-chain-file-import

组件功能描述

### Install

```tsx
$ npm i @alife/1688-chain-file-import --save
```

### Usage

```tsx
import FileImport from "@alife/1688-chain-file-import";
```

## 示例

```tsx preview
import React from "react";
import FileImport from "@alife/1688-chain-file-import";
import { Button } from "@alifd/next";
import "@alife/theme-103433/variables.css";
import "@alife/theme-103433/dist/next.var.css";

export default () => {
  return (
    <FileImport
      code="SUPPLY_PRODUCT_TEST"
      tip="TEST TIP"
      getData={{
        test: 111
      }}
    >
      <Button>导入数据</Button>
    </FileImport>
  );
};
```
