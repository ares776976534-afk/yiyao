import React, { useEffect, useState } from 'react';
import { Tab, Icon, Balloon } from '@alifd/next';
import classnames from 'classnames';
import './index.scss';

const { Tooltip } = Balloon;

function StatusFilter({
  onChange = () => {},
  reload = false,
  statusFilterType,
  getStatusFnOrStatusList,
  labelMap = {
    name: "name",
    code: "code",
    subStatusList: "subStatusList",
    quantity: "quantity",
  },
  extra,
  tableChange,
}) {
  const [list, setList] = useState([]);
  const [active, setActive] = useState(null);
  const name = labelMap["name"];
  const code = labelMap["code"];
  const quantity = labelMap["quantity"];
  const subStatusList = labelMap["subStatusList"];
  useEffect(() => {
    getData().then((data) => {
      if (statusFilterType.type === 2) {
        handleChange(null, data[0]?.[subStatusList][0]);
      } else {
        handleChange(null, data[0]);
      }
    });
    tableChange(handleChange);
  }, []);

  const handleChange = (e, data) => {
    e && e.stopPropagation();
    if (active === data?.code) return;
    setActive(data?.code);
    onChange(data?.code);
  };

  const handleClickStatusBlock = (e, data) => {
    e.stopPropagation();
    handleChange(null, data[subStatusList][0]);
  };

  const getData = () => {
    let fnOrList = getStatusFnOrStatusList;
    if (typeof getStatusFnOrStatusList !== "function") {
      fnOrList = () => Promise.resolve(getStatusFnOrStatusList);
    }
    return fnOrList().then((data) => {
      // data = [
      //   {
      //     name: '待确认',
      //     code: 'BH_PENDING_CONFIRM',
      //     quantity: 271,
      //   },
      //   {
      //     name: '发货确认',
      //     code: 'CO_CONFIRMED',
      //     quantity: 54,
      //   }
      // ];
      setList(data);
      // 根据code在getStatusFnOrStatusList找到logName
      const logName =
        data.find((item) => item.code === active)?.logName || null;
      if (logName) {
        window["globalLogger"]?.mainData?.set({ b: logName });
      }
      return data;
    });
  };

  useEffect(() => {
    if (reload) getData();
  }, [reload]);
  const genTitle = (item) => {
    if (typeof getStatusFnOrStatusList !== "function") {
      // 如果是静态status 则不渲染数量
      return item[name];
    } else {
      return `${item[name]}(${item[quantity] || 0})`;
    }
  };
  const renderDoubleStatus = () => {
    return list?.map((item) => {
      const isActive =
        item[subStatusList].findIndex((sub) => sub.code === active) > -1;
      return (
        <div
          key={item[name]}
          className={`statusFilter-item ${isActive ? "active" : ""}`}
          onClick={(e) => handleClickStatusBlock(e, item)}
        >
          <div className="statusFilter-item-name">
            <span className="mr-[4px]">{item[name]}</span>
            {item?.desc && (
              <Tooltip
                v2
                trigger={<Icon type="d-help" style={{ color: '#BBB' }} />}
                align="t"
                arrowPointToCenter
                popupStyle={{ backgroundColor: '#333' }}
                popupClassName="products-business-tooltips"
              >
                {item?.desc}
              </Tooltip>
            )}
          </div>
          <div className="statusFilter-item-status">
            {item[subStatusList].map((subStatus) => {
              const isSubActive = subStatus[code] === active;
              return (
                <span
                  key={subStatus[code]}
                  className={`statusFilter-item-status-text ${
                    isSubActive ? "active" : ""
                  }`}
                  onClick={(e) => handleChange(e, subStatus)}
                >
                  {subStatus[name]}&nbsp;
                  <span className="statusFilter-item-status-text-num">{subStatus[quantity] || 0}</span>
                </span>
              );
            })}
          </div>
        </div>
      );
    });
  };
  return (
    <div className="statusFilter">
      {statusFilterType.type === 2 ? (
        <div className="statusFilter-wrap">{renderDoubleStatus()}</div>
      ) : (
        <Tab
          activeKey={active}
          tabPosition="top"
          shape={statusFilterType.shape || "pure"}
          contentClassName="custom-tab-content"
          onChange={(_code) => {
            onChange(_code);
            setActive(_code);
          }}
          extra={extra}
          unmountInactiveTabs
        >
          {list.map((item) => {
            return <Tab.Item title={genTitle(item)} key={item.code} />;
          })}
        </Tab>
      )}
    </div>
  );
}

export default StatusFilter;
