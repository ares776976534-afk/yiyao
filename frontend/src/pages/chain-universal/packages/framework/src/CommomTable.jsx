import React, { useState, useRef, useEffect } from "react";
import DataTable from "./DataTable";
import MessageBar from "./MessageBar";
import SearchFilter from "./SearchFilter";

import StatusFilter from "./StatusFilter";
import "./index.scss";
import { Message } from "@alifd/next";
import contanst from "./contanst";

const Block = ({ children, border = false, show = true }) => {
  return show ? (
    <div className={`c-itemBlock ${border ? "hasBorder" : ""}`}>{children}</div>
  ) : null;
};

/**
 *
 * @param {object} [pageSize=10]
 * @param {function} listQueryFn table数据的查询接口，入参是query，返回值需包含{ model, total }
 * @param {object} schema 配置项
 * @param {function} [tableChange=() => { }]  可选。给父组件传递tableChange事件
 * @param {function} [onActionComplete=() => { }] 可选。用于接收点击事件的回调，会有两个入参，一个是type代表当前点击事件的类型。另一个是reloadFn，用于reload整个table数据
 * @param {function | array} [getStatusFnOrStatusList=[{ name: '待提报商机', code: '1'},{ name: '我的提报', code: '2'}]] 可选。用于接收tab项
 * @param {boolean} [statusReload=false] 可选。用于配置StatusFilter组件，根据statusReload判断是否需要刷新所有的状态
 * @param {boolean | React.ReactNode} [SlotOrShowStatusFilter=true] 可选。支持传入slot或者boolean。布尔值表示是否需要默认状态栏，默认true
 * @param {boolean | React.ReactNode} [SlotOrShowMsgBar=false] 可选。支持传入slot或者boolean。布尔值表示是否需要默认信息栏，默认false
 * @param {boolean | React.ReactNode} [ShowDataTable=true] 可选。boolean。表示是否需要默认表单，默认true
 * @param {object} [statusFilterType={[shape: 'pure|wrapped|text|capsule'], [type: 1|2]}] 可选。用于配置StatusFilter组件，type表示状态筛选的嵌套层级，shape支持 'pure,wrapped,text,capsule'
 * @param {object} [statusFilterLabelMap] 可选。用于配置StatusFilter组件，处理字段映射关系，默认是name,code,subStatusList,quantity。也可以在接口处理
 * @param {string} [searchFilterType='1'|'2'|'3'] 可选。用于配置SearchFilter组件样式，默认为'1', 内置了三套样式
 * @param {boolean | React.ReactNode} [showSearchAction=true] 可选。表示是否需要默认查询，默认true
 * @param {React.ReactNode} [statusFilterExtra=<></>] 可选。表示是否需要默认查询，默认true
 * @param {string} [pageSizeSelector='dropdown'] 可选。用于配置分页pageSizeSelector，默认为'dropdown'
 * @param {object} [otherAttributes={}] 可选。用于配置Table的属性
 * @param {object} [otherPagination={}] 可选。用于配置分页的属性
 * @param {React.ReactNode} [searchActionSlot=<></>] 可选。表示是否需要样式，默认空标签
 * tableStyle
 *
 */
export default ({
  pageSize = 10,
  listQueryFn,
  schema,
  tableChange = () => {}, // 外部父组件可以在这里拿到改变status变量方法的回调
  onActionComplete = () => {},
  getStatusFnOrStatusList = [
    { name: "待提报商机", code: "1" },
    { name: "我的提报", code: "2" },
  ],
  statusReload = false,
  SlotOrShowStatusFilter = true,
  SlotOrShowMsgBar = false,
  ShowDataTable = true,
  statusFilterType = { shape: "pure", type: 1 },
  statusFilterLabelMap = {
    name: "name",
    code: "code",
    subStatusList: "subStatusList",
    quantity: "quantity",
  },
  searchFilterType = "1",
  tableStyle = {},
  searchChangeFn = () => {}, // 外部父组件可以在这里拿到改变search变量方法的回调
  tableProps = {},
  showSearchAction = true,
  statusFilterExtra,
  pageSizeSelector = "dropdown",
  otherAttributes = {},
  showPagination = true,
  blockBorder = true,
  otherPagination = {}, // 分页组件的属性
  reloadTable = () => {},
  searchInstance = () => {},
  extraButtons, // 筛选项右侧额外功能
  searchActionSlot = <></>,
  tableCellProps,
  changeTabWithoutReload = false, // tab切换是否需要刷新数据
  isDisabled = false, // 全局功能禁用
}) => {
  const [search, setSearch] = useState({});
  const [status, setStatus] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false); // 重置样式
  const [mainStatusFilter, setMainStatusFilter] = useState({
    type: "default",
    render: null,
  });

  const [showType, setShowType] = useState({
    messageBar: SlotOrShowMsgBar,
    subStatusFilter: {
      type: false,
    },
  });

  const searchField = useRef(null);
  const fullTableStyle = {
    "--table-th-color": "#333",
    "--table-th-font-size": "13px",
    "--table-th-font-weight": 500,
    border: "1px solid #F2F2F2",
    borderRadius: "6px",
    borderBottom: "none",
    background: "#F8F8F8",
    "--table-size-s-header-padding-left": "16px",
    "--table-size-s-cell-padding-left": "16px",
    ...tableStyle,
  };
  const { componentSchema, filterSchema = () => {} } = schema;
  // 给 StatusFilter 组件回调的 change 方法
  const handleChangeStatus = (value, ifNeedReloadSearch = true) => {
    if (ifNeedReloadSearch && !changeTabWithoutReload) {
      searchField.current?.reset();
      setSearch(
        Object.assign({}, { currentStatus: value, pageNo: 1, pageSize })
      ); // 这里search写死了查询接口的入参，建议去mtop配置的地方统一修改。
      setStatus(value);
    } else {
      setSearch((oldV) => {
        return {
          ...oldV,
          currentStatus: value,
          pageNo: 1,
          pageSize,
        };
      });
      setStatus(value);
    }
  };
  useEffect(() => {
    // 若不渲染状态栏，则设置tab状态为默认
    if (SlotOrShowStatusFilter === false) {
      handleChangeStatus("default");
    }
    // 也可以只传change方法出去
    // tableChange(handleChangeStatus);

    searchInstance(searchField?.current);

    setMainStatusFilter(
      getRenderParams("subStatusFilter", SlotOrShowStatusFilter)
    );
    try {
      if (filterSchema(status)?.length === 0) {
        searchChangeFn((params) => {
          handleSearch({
            ...(searchField?.current?.getValues() || {}),
            ...params,
          });
        });
      }
    } catch (e) {}
  }, []);
  useEffect(() => {
    if (searchField.current) {
      // 调用传入的searchChangeFn
      searchChangeFn((params) => {
        searchField.current.setValues(params);
        handleSearch({
          ...searchField.current.getValues(),
          ...params,
        });
      });
    }
  }, [searchField.current]);
  // 给 SearchFilter 组件回调的 search 方法
  const handleSearch = (values) => {
    const { createTime = [], ...otherValues } = values;
    const startTime =
      createTime[0] &&
      createTime[0].startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const endTime =
      createTime[1] && createTime[1].endOf("day").format("YYYY-MM-DD HH:mm:ss");
    const reservationTime =
      otherValues.reservationTime &&
      otherValues.reservationTime.endOf("day").format("YYYY-MM-DD HH:mm:ss");

    // 如果需要在搜索时更新实例，在这里再次调用
    if (searchInstance && searchField.current) {
      searchInstance(searchField.current);
    }
    setSearch((preState) => {
      return Object.assign(
        {},
        preState,
        {
          startTime,
          endTime,
          pageNo: 1,
          pageSize,
        },
        otherValues,
        { reservationTime }
      );
    });
  };
  const getRenderParams = (componentType, SlotCom) => {
    let renderType = null;
    let renderParams = { type: "default", render: renderType };
    // 没有传入slot的话，则先去componentSchema里查询是否有配置（由配置状态显示slot false default）。
    if (
      typeof SlotCom === "boolean" &&
      componentSchema &&
      componentSchema(status) &&
      componentSchema(status)[componentType]
    ) {
      const { type, render } = componentSchema(status)[componentType];
      renderType = judgeRenderType({ type, SlotCom: render, componentType });
      renderParams = Object.assign(
        renderParams,
        componentSchema(status)[componentType],
        {
          type,
          render: renderType,
        }
      );
    } else if (typeof SlotCom === "boolean" || SlotCom === "default") {
      // 显示默认组件或直接不显示
      const defaultCom = judgeRenderType({ type: SlotCom, componentType });
      renderParams = Object.assign(renderParams, {
        type: "default",
        render: defaultCom,
      });
    } else {
      // 否则认为是slot
      renderParams = Object.assign(renderParams, {
        type: "slot",
        render: SlotCom,
      });
    }
    return renderParams;
  };
  const judgeRenderType = ({ type, SlotCom, componentType }) => {
    switch (type) {
      case "slot":
        return SlotCom;
      case true:
      case "default": {
        const defaultCom = getDefaultComponent(componentType);
        return typeof defaultCom === "function" ? defaultCom : () => defaultCom;
      }
      case false:
        return null;
      default:
        break;
    }
  };
  const getDefaultComponent = (componentType) => {
    switch (componentType) {
      case "subStatusFilter":
        return (
          <StatusFilter
            onChange={handleChangeStatus}
            reload={statusReload}
            statusFilterType={statusFilterType}
            labelMap={statusFilterLabelMap}
            getStatusFnOrStatusList={getStatusFnOrStatusList}
            extra={statusFilterExtra}
            tableChange={tableChange}
          />
        );
      case "messageBar":
        return ({ data: { msg, link, type = "warning", getIsShow } }) => (
          <MessageBar msg={msg} link={link} type={type} getIsShow={getIsShow} />
        );
      default:
        break;
    }
  };
  useEffect(() => {
    if (status) {
      const subStatusFilter = getRenderParams("subStatusFilter");
      const messageBarType = getRenderParams("messageBar", SlotOrShowMsgBar);
      setShowType({
        messageBar: messageBarType,
        subStatusFilter,
      });
    }
  }, [status]);
  return (
    <div className={`commonTable`}>
      <Block show={SlotOrShowStatusFilter} border={blockBorder && statusFilterType.type === 1}>
        {mainStatusFilter &&
          mainStatusFilter.render &&
          mainStatusFilter.render({
            onChange: handleChangeStatus,
            reload: statusReload,
          })}
      </Block>
      <Block
        border={blockBorder}
        show={schema["filterSchema"](status)?.length > 0}
      >
        <SearchFilter
          status={status}
          onSearch={handleSearch}
          fieldInstance={(instance) => {
            searchField.current = instance;
          }}
          schema={schema}
          searchFilterType={searchFilterType}
          showSearchAction={showSearchAction}
          searchActionSlot={searchActionSlot}
          extraButtons={extraButtons}
          resetTrigger={resetTrigger}
          setResetTrigger={setResetTrigger}
          isDisabled={isDisabled}
          searchInstance={searchInstance}
        />
      </Block>
      <Block show={!!showType.messageBar.render}>
        {/* {judgeRenderType(showType['messageBar'], SlotOrShowMsgBar, <MessageBar status={status} schema={schema} />)} */}
        {showType.messageBar.render &&
          showType.messageBar.render({
            status,
            data: showType.messageBar.data,
          })}
      </Block>
      <Block
        style={showType.subStatusFilter?.wrapStyle || {}}
        show={!!showType.subStatusFilter?.render}
      >
        {showType.subStatusFilter.render &&
          showType.subStatusFilter.render({
            status,
            onChange: handleChangeStatus,
          })}
      </Block>
      <Block border={blockBorder} show={ShowDataTable}>
        {/* query参数为提交给接口查询的params */}
        <DataTable
          query={search}
          listQueryFn={listQueryFn}
          onActionComplete={onActionComplete}
          currentStatus={status}
          schema={schema}
          tableProps={tableProps}
          tableStyle={fullTableStyle}
          pageSizeSelector={pageSizeSelector}
          otherAttributes={otherAttributes}
          otherPagination={otherPagination}
          showPagination={showPagination}
          reloadTable={reloadTable}
          tableCellProps={tableCellProps}
          isDisabled={isDisabled}
        />
      </Block>
    </div>
  );
};
