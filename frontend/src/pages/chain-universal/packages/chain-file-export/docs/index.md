---
title: chain-file-export
sidebar_position: 1
---

## @alife/1688-chain-file-export

组件功能描述

### Install

```tsx
$ npm i @alife/1688-chain-file-export --save
```

### Usage

```tsx
import FileExport from "@alife/1688-chain-file-export";
```

## 示例

```tsx preview
import React from "react";
import FileExport from "@alife/1688-chain-file-export";
import { Button } from "@alifd/next";

export default () => {

  return (
    <FileExport
      code="SUPPLY_PRODUCT_TEST"
      getData={() => {
        return {
          queryParams: {
            "java.util.Date": 1591718400000,
          },
        };
      }}
    >
      <Button>导出(带参数)</Button>
    </FileExport>
  );
};
```
