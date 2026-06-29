import React, { useEffect, useState } from "react";
import { Field, Grid, Message } from "@alifd/next";
import {
  SCHEMA_SEARCH,
  SCHEMA_CHECKBOX,
  SCHEMA_SELECT_CARDS,
} from "../contanst";
import RenderField from "@alife/1688-chain-renderfield";
import { Button } from "@alife/1688-chain-ui";
import "./index.scss";

const { Row, Col } = Grid;
export default (props) => {
  const {
    status = null,
    showSearchAction,
    onSearch = () => {},
    fieldOpt = {},
    schema,
    searchFilterType = "1",
    searchActionSlot,
    extraButtons,
    resetTrigger,
    setResetTrigger,
    isDisabled,
    searchInstance,
  } = props;
  const filters = schema["filterSchema"](status);
  // 根据schema中的opt.searchImmediate找到需要实时搜索的key
  const searchImmediateKeys =
    filters
      .filter((item) => item.opt?.searchImmediate)
      .map((item) => item.key) || [];
  const dealErrorBeforeSearch = (_field) => {
    _field.validate((err, values) => {
      if (err) {
        let errList = [];
        Object.values(err).forEach((item) => {
          item.errors.forEach((errstr) => {
            errList.push(errstr);
          });
        });
        Message.error(errList.join(";"));
        return;
      }
      onSearch(values);
    });
  };
  const field = Field.useField({
    onChange: (name, value) => {
      // console.log("onChange", name, value);
      // 实时更新实例
      searchInstance(field);
      // 默认showSearchAction为true不立即搜索 只有主动设置为false或者searchImmediateKeys有值时才立即搜索
      // searchImmediate优先
      if (searchImmediateKeys.length > 0) {
        if (searchImmediateKeys.includes(name)) {
          dealErrorBeforeSearch(field);
        }
      } else if (!showSearchAction) {
        dealErrorBeforeSearch(field);
      }
    },
  });

  const { init } = field;

  const renderField = ({
    key,
    type,
    opt,
    values,
    name,
    fetchData,
    cardsData,
    fieldInitOptions = {},
  }) => {
    let otherProps = {};

    if (type === SCHEMA_SEARCH) {
      otherProps = {
        onSearch: (val) => {
          field.setValue(key, val);
          opt?.onSearch && dealErrorBeforeSearch(field);
        },
      };
    }

    return (
      <div
        key={name}
        className={`field-block ${
          type === SCHEMA_SELECT_CARDS ? "w-[100%] block" : ""
        }`}
      >
        {type !== SCHEMA_CHECKBOX && (
          <span className={`${searchFilterType === "2" ? "" : "label"}`}>
            {name}
          </span>
        )}
        <span
          className={`options ${type === SCHEMA_SELECT_CARDS ? "flex" : ""}`}
        >
          <RenderField
            fieldKey={key}
            type={type}
            opt={{ ...opt, ...fieldOpt[key] }}
            values={values}
            name={name}
            fetchData={fetchData}
            fieldInit={init}
            field={field}
            cardsData={cardsData}
            onSearch={onSearch}
            resetTrigger={resetTrigger}
            fieldInitOptions={fieldInitOptions}
            {...otherProps}
          />
        </span>
      </div>
    );
  };

  const renderButtons = (buttonType) => {
    const searchButtonStyle =
      buttonType === "searchBtnsCol"
        ? { marginLeft: "20px", borderRadius: "6px", width: "62px" }
        : { borderRadius: "6px", width: "62px" };
    return (
      <div>
        <Button
          style={searchButtonStyle}
          // type="normal:primary-ghost"
          type="primary"
          onClick={handleSearch}
          disabled={isDisabled}
        >
          筛选
        </Button>
        <Button
          style={{ marginLeft: "12px", borderRadius: "6px", width: "62px" }}
          onClick={handleReset}
          className="rounded-[6px]"
          disabled={isDisabled}
        >
          清空
        </Button>
      </div>
    );
  };

  const handleSearch = () => {
    // onSearch(field.getValues());
    dealErrorBeforeSearch(field);
  };

  const handleReset = () => {
    field.reset();
    setResetTrigger((prev) => !prev);
    onSearch(field.getValues());
  };

  const handleSetValue = (values) => {
    field.setValues(values);
    onSearch(field.getValues());
  };

  useEffect(() => {
    const { fieldInstance = () => {} } = props;
    field._setValue = handleSetValue;
    fieldInstance(field);
  }, []);

  const renderFilter = (type) => {
    switch (type) {
      case "1":
        return (
          <Row gutter={16} justify="start" wrap>
            {filters?.map((filter) => {
              return (
                <Col l={8} xl={6} key={filter.name}>
                  {renderField(filter)}
                </Col>
              );
            })}
            {showSearchAction ? (
              <Col
                l={{ span: 8, offset: (3 - (filters?.length % 3) - 1) * 8 }}
                xl={{ span: 6, offset: (4 - (filters?.length % 4) - 1) * 6 }}
              >
                <div className="searchBtnsCol">
                  {renderButtons("searchBtnsCol")}
                </div>
              </Col>
            ) : null}
          </Row>
        );
      case "2":
        return (
          <div className="flex flex-wrap gap-[20px]">
            {filters?.map((filter) => {
              return <div key={filter.name}>{renderField(filter)}</div>;
            })}
            <div>{renderButtons()}</div>
          </div>
        );
      case "3":
        if (extraButtons) {
          return (
            <div className="flex justify-between">
              <div className="flex gap-[20px]">
                {filters?.map((filter) => (
                  <div key={filter.name}>{renderField(filter)}</div>
                ))}
                <div>{renderButtons()}</div>
              </div>
              {extraButtons}
            </div>
          );
        }
        return (
          <div className="flex justify-between flex-wrap gap-[10px]">
            <div className="flex flex-wrap gap-[10px]">
              {filters?.map((filter) => (
                <div
                  key={filter.name}
                  className={`mr-[20px] flex items-center ${
                    filter?.type === SCHEMA_SELECT_CARDS ? "w-[100%]" : ""
                  }`}
                >
                  {renderField(filter)}
                </div>
              ))}
            </div>
            <div className="ml-auto">
              {filters?.length > 0 && showSearchAction
                ? renderButtons(null, extraButtons)
                : searchActionSlot}
            </div>
          </div>
        );
      case "4":
        return (
          <div
            className={`flex flex-wrap justify-start ${
              filters.some((f) => f.type === SCHEMA_SELECT_CARDS)
                ? "gap-[16px]"
                : "gap-[20px]"
            }`}
          >
            {filters?.map((filter) => (
              <div
                key={filter.name}
                className={`${
                  filter?.type === SCHEMA_SELECT_CARDS ? "w-[100%]" : "flex"
                }`}
              >
                {renderField(filter)}
              </div>
            ))}
            {filters.some((f) => f.type === SCHEMA_SELECT_CARDS) ? (
              <div>{renderButtons()}</div>
            ) : (
              <div className="flex-1 text-right">{renderButtons()}</div>
            )}
          </div>
        );
      default:
        break;
    }
  };
  return <div className="searchFilter">{renderFilter(searchFilterType)}</div>;
};
