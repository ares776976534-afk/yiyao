import React, { useState, useEffect, useRef } from "react";
import {
  Select,
  DatePicker2,
  Input,
  Search,
  Button,
  Checkbox,
  TreeSelect,
  Dialog,
  Radio,
  CascaderSelect,
  NumberPicker,
} from "@alifd/next";
import JsBarcode from "jsbarcode";
import BarcodePreviewModal from "./BarcodePreviewModal";
import SelectCards from "./SelectCards";
import {
  SCHEMA_INPUT,
  SCHEMA_SELECT,
  SCHEMA_RANGE_PICKER,
  SCHEMA_DATE_PICKER,
  SCHEMA_SEARCH,
  SCHEMA_BARCODE,
  SCHEMA_CHECKBOX,
  SCHEMA_TREE_SELECT,
  SCHEMA_TEXTAREA,
  SCHEMA_SELECT_CARDS,
  SCHEMA_CHECKBOX_GROUP,
  SCHEMA_INPUT_CASCADER,
  SCHEMA_RADIO_GROUP,
  SCHEMA_CASCADER_SELECT,
  SCHEMA_NUMBER_RANGE,
} from "./contanst";

const { RangePicker } = DatePicker2;

export default (props) => {
  const {
    fieldInit = () => {},
    type,
    opt,
    values,
    fieldKey: key,
    name,
    fetchData,
    fieldInitOptions = {},
    field,
    cardsData = [],
    onSearch,
    resetTrigger,
    ...otherProps
  } = props;
  const [filterFetchData, setFilterFetchData] = useState({});
  const [barcodeImageUrl, setBarcodeImageUrl] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  const numberRangeMin = opt?.min;
  const numberRangeMax = opt?.max;
  const numberRangeMinKey = `${key}.min`;
  const numberRangeMaxKey = `${key}.max`;

  function textToBase64Barcode(text) {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, text, { format: "CODE128" });
    return canvas.toDataURL("image/png");
  }

  const generateBarcodeImage = async () => {
    try {
      const barcodeDataUrl = await textToBase64Barcode(field?.getValue(key));
      const barcodeImg = new Image();
      barcodeImg.src = barcodeDataUrl;
      setBarcodeImageUrl(barcodeImg.src);
      setShowBarcodeModal(true);
    } catch (error) {
      console.error("Error generating barcode image:", error);
    }
  };

  const ensureArray = (data) => {
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  };
  const textAreaRefs = useRef(null);
  const [textAreaValue, setTextAreaValue] = useState("");

  const handleFocus = (e) => {
    setTextAreaValue(e?.target?.value.replace(/,/g, "\n"));
    textAreaRefs.current?.focus();
  };
  const handleTextAreaChange = (value, fieldKeys) => {
    const updatedValue = value.replace(/([ ,])$/, "\n");
    const newLines = updatedValue.split("\n").filter(Boolean);
    setTextAreaValue(updatedValue);
    field?.setValues({
      [fieldKeys]: newLines,
    });
  };
  const typeMap = {
    [SCHEMA_SELECT]: (
      <Select
        {...fieldInit(key, fieldInitOptions)}
        dataSource={ensureArray(values || filterFetchData)}
        style={{
          minWidth: opt?.width || "200px",
          borderRadius: "6px",
          "--form-element-medium-corner": "6px",
        }}
        {...opt}
        {...otherProps}
      />
    ),
    [SCHEMA_TREE_SELECT]: (
      <TreeSelect
        {...fieldInit(key, fieldInitOptions)}
        dataSource={ensureArray(values || filterFetchData)}
        style={{
          minWidth: opt?.width || "200px",
          borderRadius: "6px",
          "--form-element-medium-corner": "6px",
        }}
        {...opt}
        {...otherProps}
      />
    ),
    [SCHEMA_RANGE_PICKER]: (
      <RangePicker
        {...fieldInit(key, fieldInitOptions)}
        style={{ minWidth: opt?.width || "200px", borderRadius: "6px" }}
        {...opt}
        {...otherProps}
      />
    ),
    [SCHEMA_INPUT]: (
      <Input
        {...fieldInit(key, fieldInitOptions)}
        placeholder={`请输入${name}`}
        size="medium"
        style={{ width: opt?.width || "200px", borderRadius: "6px" }}
        {...opt}
        {...otherProps}
      />
    ),
    [SCHEMA_DATE_PICKER]: (
      <DatePicker2
        {...fieldInit(key, fieldInitOptions)}
        style={{ minWidth: opt?.width || "200px", borderRadius: "6px" }}
        {...opt}
        {...otherProps}
      />
    ),
    [SCHEMA_SEARCH]: (
      <Search
        shape="simple"
        {...fieldInit(key, fieldInitOptions)}
        style={{ width: opt?.width || "200px", borderRadius: "6px" }}
        {...opt}
        {...otherProps}
      />
    ),
    [SCHEMA_BARCODE]: (
      <div className="flex flex-row" id="barCodeBtn">
        <Input
          trim
          {...fieldInit(key, fieldInitOptions)}
          {...props}
          placeholder="请输入1-13位数字"
          style={{ width: opt?.width || "200px", borderRadius: "6px" }}
        />
        <BarcodePreviewModal
          barcodeValue={field?.getValue(key)}
          visible={showBarcodeModal}
          imageUrl={barcodeImageUrl}
          onClose={() => setShowBarcodeModal(false)}
          popupContainer={document.getElementById("barCodeBtn")}
        >
          <Button onClick={generateBarcodeImage} className="mx-[8px]">
            生成条码图片
          </Button>
        </BarcodePreviewModal>
      </div>
    ),
    [SCHEMA_TEXTAREA]: (
      <Input.TextArea
        shape="simple"
        {...fieldInit(key)}
        style={{ minWidth: "200px" }}
        {...opt}
        {...otherProps}
      />
    ),
    [SCHEMA_CHECKBOX]: (
      <Checkbox
        {...fieldInit(key, { ...fieldInitOptions, valueName: "checked" })}
        {...opt}
        {...otherProps}
      >
        {name}
      </Checkbox>
    ),
    [SCHEMA_CHECKBOX_GROUP]: (
      <Checkbox.Group
        {...fieldInit(key, { ...fieldInitOptions })}
        {...opt}
        {...otherProps}
        dataSource={ensureArray(values || filterFetchData)}
      />
    ),
    [SCHEMA_RADIO_GROUP]: (
      <Radio.Group
        {...fieldInit(key, { ...fieldInitOptions })}
        {...opt}
        {...otherProps}
        dataSource={ensureArray(values || filterFetchData)}
      />
    ),
    [SCHEMA_INPUT_CASCADER]: (
      <div className="relative group">
        <Input
          {...fieldInit(key, fieldInitOptions)}
          placeholder={`请输入${name}`}
          size="medium"
          style={{ width: opt?.width || "200px", borderRadius: "6px" }}
          {...opt}
          {...otherProps}
          onFocus={handleFocus}
        />
        <div className="hidden absolute top-[32px] left-0 w-[200px] bg-[#fff] z-[2] p-[10px] rounded-[6px] shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)] group-focus-within:block">
          <div className="text-[#ccc] text-[14px] w-[160px] mb-[8px] text-left">
            多项输入用逗号“,”或换行分隔
          </div>
          <Input.TextArea
            ref={textAreaRefs}
            composition
            {...opt?.arrayFieldProps}
            showLimitHint
            value={textAreaValue}
            autoFocus
            onChange={(value) => handleTextAreaChange(value, key)}
          />
        </div>
      </div>
    ),
    [SCHEMA_SELECT_CARDS]: (
      <SelectCards
        {...fieldInit(key, fieldInitOptions)}
        value={ensureArray(cardsData || filterFetchData)}
        resetTrigger={resetTrigger}
        opt={opt}
      />
    ),
    [SCHEMA_CASCADER_SELECT]: (
      <CascaderSelect
        dataSource={ensureArray(values || filterFetchData)}
        {...fieldInit(key, { ...fieldInitOptions })}
        style={{ width: opt?.width || "200px", borderRadius: "6px" }}
        {...opt}
        {...otherProps}
      />
    ),
    [SCHEMA_NUMBER_RANGE]: () => {
      return (
        <div className="flex flex-row items-center">
          <NumberPicker
            {...fieldInit(`${key}Min`, fieldInitOptions)}
            hasTrigger={false}
            min={numberRangeMin}
          />{" "}
          -{" "}
          <NumberPicker
            {...fieldInit(`${key}Max`, fieldInitOptions)}
            hasTrigger={false}
            max={numberRangeMax}
          />
        </div>
      );
    },
  };
  useEffect(() => {
    if (fetchData) {
      fetchData().then((res) => {
        setFilterFetchData(res);
      });
    }
  }, []);

  return typeMap[type] || null;
};
