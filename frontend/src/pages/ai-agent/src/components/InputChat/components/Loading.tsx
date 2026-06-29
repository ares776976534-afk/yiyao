import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "var(--file-box-width)",
        height: "var(--file-box-height)",
        background: "var(--file-box-background)",
        borderRadius: "var(--file-box-border-radius)",
      }}
    >
      <Spin
        indicator={
          <LoadingOutlined spin style={{ color: "var(--block-color)" }} />
        }
      />
    </div>
  );
};
