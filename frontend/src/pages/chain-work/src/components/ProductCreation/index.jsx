import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Grid, Field, Icon, Select, Checkbox, NumberPicker } from '@alifd/next';
import BarcodeGenerator from './components/BarcodeGenerator';
import BatchEdit from '../BatchEdit/index.jsx';
import ChangeProductName from './components/ChangeProductName';
import { judgeIsFirst } from './utils';
import './index.scss';

const { Row, Col } = Grid;

/**
 * 产品创建组件
 * @param {Object} props - 组件属性对象
 * @param {Object} props.data - 数据对象
 * @param {Object} props.creationSchema - 创建模式配置
 * @param {string} props.title - 标题文本
 * @param {string} [props.cardTitle] - 卡片标题，默认为空字符串
 * @param {boolean} [props.showBasicInfo=false] - 是否显示基本信息
 * @param {Function} props.fieldInstance - 字段实例化函数
 * @param {React.ReactNode} props.children - 子节点
 * @param {string} props.dialogTitle - 对话框标题
 * @param {React.ComponentType} props.SubTitleSlot - 副标题插槽组件类型
 * @param {Object} [props.itemLabelMap] - 项目标签映射，默认包含 SKU ID 等字段
 * @param {Function} props.handleCount - 处理计数的回调函数
 * @param {Object} [props.dialogStyle] - 对话框样式
 * @param {number} [props.ifToggleAtFirst=0] - 初始折叠状态的数量，默认为零（完全展开）
 */
function ProductCreation({
  data,
  setData,
  creationSchema,
  title,
  cardTitle = '',
  showBasicInfo = false,
  fieldInstance,
  children,
  dialogTitle,
  SubTitleSlot,
  itemLabelMap = { skuId: 'skuId', skuTitle: 'skuTitle', img: 'img', Category: 'Category', itemTitle: 'title' },
  handleCount = () => { },
  dialogStyle = { '--dialog-content-padding-top': '8px' },
  ifToggleAtFirst = 0, // 默认展开几项
  cateIds,
}) {
  const { skuId, skuTitle, img, Category, itemTitle } = itemLabelMap;
  const [expandedSkuIds, setExpandedSkuIds] = useState([]);
  const [allExpanded, setAllExpanded] = useState(true); // 展开全部状态
  // const allSkuIdList = [...data?.items?.map((item) => item?.[skuId])];
  // const [checkedList, setCheckedList] = useState(allSkuIdList);
  // const [indeterminate, setIndeterminate] = useState(false);
  // const [checkAll, setCheckAll] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showChangeProductName, setShowChangeProductName] = useState(false);
  const [productNameChangeId, setProductNameChangeId] = useState('');
  const [productName, setProductName] = useState('');
  const isFirst = judgeIsFirst();

  const field = Field.useField({ parseName: true });
  const { init } = field;

  const toggleExpand = (id) => {
    if (expandedSkuIds.includes(id)) {
      setExpandedSkuIds(expandedSkuIds.filter((itemId) => itemId !== id));
    } else {
      setExpandedSkuIds([...expandedSkuIds, id]);
    }
  };

  const handleToggleAll = () => {
    setAllExpanded(!allExpanded);
    if (allExpanded) {
      setExpandedSkuIds(data?.items?.map((box) => box?.[skuId]));
    } else {
      setExpandedSkuIds([]);
    }
  };

  const handleInitialExpand = () => {
    if (!isNaN(ifToggleAtFirst) && ifToggleAtFirst > 0) {
      // 根据ifToggleAtFirst的值来展开对应数量的项
      setExpandedSkuIds(data?.items?.slice(0, ifToggleAtFirst)?.map((item) => item?.[skuId]));
    }
  };

  useEffect(() => {
    fieldInstance && fieldInstance(field);
    if (!showBasicInfo) {
      adjustMarginBottom();
    }
    handleInitialExpand(); // 处理首次加载时的展开逻辑
  }, []);
  const flattenShelfLifeInfo = (obj) => {
    for (const key in obj) {
      const subObject = obj[key];
      if (subObject.shelfLifeInfo) {
        obj[key] = {
          ...subObject,
          ...subObject.shelfLifeInfo,
        };
        delete obj[key].shelfLifeInfo;
      }
    }
    return obj;
  };
  // 状态计数
  const updateNonEmptyFieldCount = (values) => {
    const info = flattenShelfLifeInfo(values);
    let nonEmptyCount = 0;
    for (const id of Object.keys(info)) {
      const entry = values[id];
      const allValuesNonEmpty = Object.values(entry).every((value) => value !== undefined && value !== '');
      // 如果所有值都不为空，加一
      if (allValuesNonEmpty) {
        nonEmptyCount += 1;
      }
    }
    handleCount && handleCount(nonEmptyCount);
  };
  const createProductAttributeFormItem = (_field, _item = { skuId: 'dialog' }) => {
    // 给特殊的批量填写保留了一个dialog的关键字，用来标识不同的校验情况+展示样式
    const _skuId = _item[skuId] || _item.skuId;
    const isTransformableSelected = _field?.values?.[_skuId]?.hasVariable === 'DEFORMABLE';
    const isShelflifeSelected = _field?.values?.[_skuId]?.shelfLifeInfo?.isShelflife;
    const schema = typeof creationSchema === 'function' ? creationSchema({ field: _field, _item, categoryId: cateIds, updateNonEmptyFieldCount }) : creationSchema;
    return schema
      .filter((attribute) => {
        // 过滤出需要显示的属性
        if (['variableLength', 'variableWidth', 'variableHeight'].includes(attribute.name)) {
          return isTransformableSelected; // 当选择了“可变形”，才显示这三个属性
        }
        if (['shelfLifeInfo.lifecycle', 'shelfLifeInfo.rejectLifecycle', 'shelfLifeInfo.lockupLifecycle', 'shelfLifeInfo.adventLifecycle'].includes(attribute?.name)) {
          return isShelflifeSelected;
        }
        // else if (attribute.name === 'barcode' && showBasicInfo) {
        //   return _item.skuId === 'dialog';
        // }
        return true; // 其他属性始终显示
      })
      .map((attribute) => {
        // dialog 不校验必填项
        const rules = _skuId === 'dialog' ? attribute.rules.filter((rule) => !rule.required) : attribute.rules;
        rules.forEach((rule) => {
          if (rule.validator) {
            rule.data = _item;
          }
        });
        const _defaultValue =
          typeof attribute.defaultValue === 'function' ? attribute.defaultValue(_item) || '' : attribute.defaultValue;
        // const _defaultValue = ''
        let inputComponent;
        switch (attribute.inputType) {
          case 'input':
            inputComponent = (
              <Input
                {..._field.init(`${_skuId}.${attribute.name}`, {
                  initValue: _defaultValue || '',
                  rules: rules || [],
                })}
                {...attribute.attr}
                innerAfter={attribute?.suffix}
                style={{ width: '92%', '--input-label-color': '#999' }}
                hasClear
                disabled={attribute?.disabled}
              />
            );
            break;

          case 'select':
            inputComponent = (
              <Select
                placeholder={attribute?.placeholder}
                {..._field.init(`${_skuId}.${attribute?.name}`, {
                  initValue: _defaultValue || 'NORMAL',
                  rules: rules || [],
                })}
                {...attribute?.attr}
                style={{ width: '92%' }}
                hasClear
                dataSource={attribute?.selectOptions}
                disabled={attribute?.disabled}
              />
            );
            break;
          case 'numberPicker':
            inputComponent = (
              <NumberPicker
                placeholder={attribute?.placeholder}
                {..._field.init(`${_skuId}.${attribute?.name}`, {
                  initValue: _defaultValue || '',
                  rules: rules || [],
                })}
                {...attribute?.attr}
                style={{ width: '92%' }}
                hasClear
                dataSource={attribute?.selectOptions}
                disabled={attribute?.disabled}
              />
            );
            break;
          default:
            break;
        }
        const dialogFormItem = () => {
          return (
            <Form.Item
              label={attribute.label}
              required={false}
              key={attribute?.name}
              className={`${showBasicInfo ? 'labelColor' : ''}`}
            >
              {inputComponent}
            </Form.Item>
          );
        };
        const renderFormItem = () => {
          return (
            <Col span={6} key={attribute?.name}>
              <Form.Item
                label={attribute.label}
                required={attribute.required}
                className={`${showBasicInfo ? 'labelColor' : ''}`}
              >
                {inputComponent}
              </Form.Item>
            </Col>
          );
        };
        if (_skuId === 'dialog') {
          if (isTransformableSelected || !['variableLength', 'variableWidth', 'variableHeight'].includes(attribute?.name)) {
            return dialogFormItem();
          } else if (isShelflifeSelected || !['shelfLifeInfo.lifecycle', 'shelfLifeInfo.rejectLifecycle', 'shelfLifeInfo.lockupLifecycle', 'shelfLifeInfo.adventLifecycle'].includes(attribute?.name)) {
            return dialogFormItem();
          } else {
            return null;
          }
        } else if (isTransformableSelected || !['variableLength', 'variableWidth', 'variableHeight'].includes(attribute?.name)) {
          return renderFormItem();
        } else if (isShelflifeSelected || !['shelfLifeInfo.lifecycle', 'shelfLifeInfo.rejectLifecycle', 'shelfLifeInfo.lockupLifecycle', 'shelfLifeInfo.adventLifecycle'].includes(attribute?.name)) {
          return renderFormItem();
        } else {
          return null;
        }
      })
      .filter(Boolean);
  };

  // const onChange = (list) => {
  //   setCheckedList(list); // [item?.[skuId]]
  //   setIndeterminate(!!list.length && list.length < data?.items.length);
  //   setCheckAll(list.length === data?.items?.length);
  // };

  // const onCheckAllChange = (checked, e) => {
  //   setCheckedList(checked ? allSkuIdList : []);
  //   setIndeterminate(false);
  //   setCheckAll(checked);
  // };

  // const handleBatchSetting = () => {
  //   setShowDialog(true);
  // };

  // const filterEmptyValues = (obj) => {
  //   return Object.fromEntries(
  //     Object.entries(obj).filter(([key, value]) => value !== '' && value !== null && value !== undefined),
  //   );
  // };

  const onSubmitBatchEdit = (_data) => {
    // 把不为空的data覆盖到表单数据skuid在checkedList中的sku
    // const dialogData = filterEmptyValues(_data['dialog']);
    const fieldData = field.getValues();
    const newFieldData = {};
    // checkedList.forEach((_skuId) => {
    //   const skuInfo = fieldData[_skuId];
    //   const newSkuInfo = Object.assign(skuInfo, dialogData);
    //   newFieldData[_skuId] = newSkuInfo;
    // });
    const _newFieldData = Object.assign(fieldData, newFieldData);
    field.setValues(_newFieldData);
    window.globalLogger?.reportByManual({
      d: 'OTHER',
      e: '批量填写@funnel_批量功能',
      f: '成功',
    });
    updateNonEmptyFieldCount(_newFieldData);
  };

  const handleProductClick = (id, itemName) => {
    setShowChangeProductName(true);
    setProductNameChangeId(id);
    setProductName(itemName);
  };

  const handleProductUpdate = (newName, _skuId) => {
    if (isFirst) {
      setData((prevData) => {
        return {
          ...prevData,
          items: prevData?.items?.map((item) => (item?.skuId === _skuId ? { ...item, itemName: newName } : item)),
        };
      });
    } else {
      setData((prevData) => {
        return {
          ...prevData,
          items: prevData?.items?.map((item) => {
            if (item?.skuId === _skuId && item?.scItemRecordDTOList && item?.scItemRecordDTOList.length > 0) {
              return {
                ...item,
                scItemRecordDTOList: [
                  {
                    ...item?.scItemRecordDTOList?.[0],
                    itemName: newName,
                  },
                  ...item?.scItemRecordDTOList?.slice(1),
                ],
              };
            }
            return item;
          }),
        };
      });
    }
    const updatedValues = {
      ...field.values[_skuId],
      itemName: newName,
    };
    const _newFieldData = {
      ...field.values,
      [_skuId]: updatedValues,
    };
    field.setValues(_newFieldData);
  };

  // 动态调整 margin-bottom
  function adjustMarginBottom() {
    const fixedBox = document.querySelector('.fixed-footer');
    const content = document.querySelector('.base-content');
    const fixedBoxHeight = fixedBox?.offsetHeight - 28;
    content.style.marginBottom = `${fixedBoxHeight}px`;
  }
  return (
    <>
      <div className={`w-[100%] h-[100%] bg-white mb-[16px] p-[20px] ${showBasicInfo ? 'rounded-[6px]' : ''}`}>
        {/* 货品信息 */}
        <div className="mb-[20px] flex items-center ">
          <div className="w-[70px] text-[16px] font-semibold text-[#333]">{title}</div>
          <div className="w-[100%] flex justify-between items-center">
            <div className="text-[12px] text-[#333] ml-[8px]">
              该商品下您有
              <span className="text-[#0077FF] ">{data?.items?.length}</span>
              个SKU{title?.startsWith('SKU') ? '' : '需要创建入仓货品'}
            </div>
            <button onClick={() => handleToggleAll()}>
              {allExpanded ? (
                <div className="flex items-center">
                  <div className="text-[#0077FF] text-[14px]">全部展开</div>
                  <Icon type="d-arrow-down" style={{ color: '#0077FF' }} />
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="text-[#0077FF] text-[14px]">全部收起</div>
                  <Icon type="arrow-up" style={{ color: '#0077FF' }} />
                </div>
              )}
            </button>
          </div>
        </div>
        <div className="base-content">
          {data?.items?.map((item) => (
            <div
              key={item?.[skuId]}
              className="checkboxStyle"
              style={{
                ...(showBasicInfo ? { borderRadius: '6px' } : {}),
              }}
            >
              <div className="w-[100%] h-[60px] flex column ">
                {item?.skuImage && (
                  <img
                    className="w-[60px] h-[60px] bg-white mr-[16px] rounded-[3px]"
                    src={item?.skuImage}
                    alt="icon"
                  />
                )}
                <div className="flex justify-between w-[100%] items-start">
                  <div>
                    <div className="text-sm font-medium text-[#333]">{item?.[skuTitle]}</div>
                    <div className="flex gap-4 mt-[8px]">
                      {SubTitleSlot ? (
                        <SubTitleSlot item={item} />
                      ) : (
                        <div className="text-[#999]">
                          SKU ID <span className="text-[#333]">{item?.[skuId]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => toggleExpand(item?.[skuId])}>
                    {expandedSkuIds.includes(item?.[skuId]) ? (
                      <div className="flex items-center">
                        <div className="text-[#0077FF] text-[14px]">收起</div>
                        <Icon type="arrow-up" style={{ color: '#0077FF' }} />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="text-[#0077FF] text-[14px]">展开</div>
                        <Icon type="d-arrow-down" style={{ color: '#0077FF' }} />
                      </div>
                    )}
                  </button>
                </div>
              </div>
              <div
                className={`bg-[#fff] py-[20px] pl-[20px] ml-[77px] mt-[12px] ${showBasicInfo ? 'rounded-[6px]' : 'rounded-[0px]'
                }`}
                style={{
                  display: expandedSkuIds.includes(item?.[skuId]) ? 'block' : 'none',
                }}
              >
                <Form layout="vertical" field={field} onChange={updateNonEmptyFieldCount}>
                  {showBasicInfo && (
                    <div>
                      <div className="text-[#333] text-[16px] font-semibold">基础信息</div>
                      <div className="flex my-[20px] ">
                        <div className="text-[#999] mr-[100px] text-[14px]">
                          <span className="mr-[12px]">货品名称</span>
                          {isFirst ? (
                            <span className="text-[#333] ">{item?.itemName}</span>
                          ) : (
                            <span className="text-[#333] ">
                              {item?.scItemRecordDTOList?.[0]?.itemName || item?.itemName}
                            </span>
                          )}
                          <span
                            className="text-[#0077FF]"
                            onClick={() =>
                              handleProductClick(
                                item?.skuId,
                                isFirst
                                  ? item?.itemName
                                  : item?.scItemRecordDTOList?.[0]?.itemName || item?.itemName,
                              )
                            }
                          >
                            修改
                          </span>
                        </div>
                        <div className="text-[#999] mr-[12px] text-[14px]">
                          <span className="mr-[12px]">类目</span>
                          <span className="text-[#333]">{data?.category}</span>
                        </div>
                      </div>
                      <div>
                        <BarcodeGenerator
                          {...init(`${item.skuId}.barcode`, {
                            initValue: item?.scItemRecordDTOList?.[0]?.barcode || '',
                            rules: [
                              { required: true, message: '条形码是必填项' },
                              {
                                validator: (_, value, callback) => {
                                  if (!/^[a-zA-Z0-9]*$/.test(value)) {
                                    return callback(new Error('条形码只能包含数字或字母'));
                                  }
                                  const containsLowerCase = /[a-z]/.test(value);
                                  const containsUpperCase = /[A-Z]/.test(value);
                                  if (containsLowerCase && containsUpperCase) {
                                    return callback(new Error('条形码中的字母必须全部大写或全部小写'));
                                  }
                                  if (value.length < 1 || value.length > 13) {
                                    return callback(new Error('条形码长度必须在1到13位之间'));
                                  }
                                  callback();
                                },
                              },
                            ],
                          })}
                        />
                      </div>
                      {/* 存储信息 */}
                      <div className="text-[#333] text-[16px] my-[20px] font-semibold">{cardTitle}</div>
                    </div>
                  )}
                  <Row wrap>{createProductAttributeFormItem(field, item)}</Row>
                </Form>
              </div>
            </div>
          ))}
        </div>
        <div className="fixed left-[-16px] bottom-0 bg-[#fff] p-[12px] pt-[12px] z-10 fixed-footer mr-[16px] footer w-[100%]">
          {children}
        </div>
      </div>
      <BatchEdit
        visible={showDialog}
        setVisible={setShowDialog}
        onSubmitBatchEdit={onSubmitBatchEdit}
        title={dialogTitle}
        creationFn={createProductAttributeFormItem}
        dialogStyle={dialogStyle}
      />
      <ChangeProductName
        visible={showChangeProductName}
        setVisible={setShowChangeProductName}
        onProductUpdate={handleProductUpdate}
        skuId={productNameChangeId}
        value={productName}
      />
    </>
  );
}

export default ProductCreation;
