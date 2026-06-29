import React, { useState, useEffect } from 'react';
import { Field, Dialog } from '@alifd/next';
import FieldBlock from '../FieldBlock';
import { contanst } from '@alife/1688-chain-renderfield';
import nzh from 'nzh';
import Button from '@/components/UI/Button';
import { dataList } from '../../service';

const fetchData = async (id) => {
  return new Promise((resolve) => {
    dataList({ categoryId: id, needChildren: true, needPathList: false }).then((res) => {
      resolve(res);
    });
  });
};
const updateChildren = (dataSource, value, newChildren) => {
  const updateNode = (node) => {
    if (node.value === value) {
      return { ...node, children: newChildren };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: node.children.map((child) => updateNode(child)) };
    }
    return node;
  };
  return dataSource.map((node) => updateNode(node));
};
const updateChildrenIndex = (dataSource, value, newChildren, index) => {
  const updateNode = (node, currentIndex) => {
    if (currentIndex === index && node.value === value) {
      return { ...node, children: newChildren };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: node.children.map((child) => updateNode(child, currentIndex + 1)) };
    }
    return node;
  };
  return dataSource.map((node, i) => updateNode(node, i));
};

const nzhcn = nzh.cn;

const CommonDialog = ({
  visible,
  onOk = () => { },
  onClose = () => { },
  onCancel = () => { },
  value = {},
  fields = [],
  title = '',
  fieldKey = '',
  Index = -1,
  mode = '',
}) => {
  const field = Field.useField();

  const handleOnOk = () => {
    field.validate((errors, fieldValue) => {
      if (errors) {
        return;
      }
      onOk({ [fieldKey]: fieldValue, Index });
    });
  };

  useEffect(() => {
    if (visible) {
      field.setValues(value);
    }
  }, [visible, value]);

  return (
    <Dialog
      v2
      title={title}
      visible={visible}
      onCancel={onCancel}
      onClose={onClose}
      onOk={handleOnOk}
      footerActions={['ok']}
      footerAlign="center"
      style={{ width: '400px' }}
      className="common-dialog"
    >
      {mode === 'preview' ? (
        <div className="flex flex-row flex-wrap gap-[12px]">
          {fields.map((item) => {
            return (
              <div className="mr-[20px] flex">
                <div className="mr-[12px] w-[56px] text-right">{item.title}</div>
                <div>{value[item.fieldKey]}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <FieldBlock
          field={field}
          fields={fields}
          mode={mode}
        />
      )}
    </Dialog>
  );
};

const hxyclcgField = {
  title: '核心原材料采购',
  fieldKey: 'coreMaterialPurchase',
  fields: [
    {
      fieldKey: 'model',
      title: '型号',
      type: contanst.SCHEMA_INPUT,
      display: 'block',
    },
    {
      fieldKey: 'name',
      title: '名称',
      type: contanst.SCHEMA_INPUT,
      display: 'block',
    },
  ],
};

const yclField = {
  title: '原材料',
  fieldKey: 'rawMaterial',
  fields: [
    {
      fieldKey: 'classification',
      title: '分类',
      type: contanst.SCHEMA_INPUT,
      display: 'block',
    },
    {
      fieldKey: 'model',
      title: '型号',
      type: contanst.SCHEMA_INPUT,
      display: 'block',
    },
    {
      fieldKey: 'name',
      title: '名称',
      type: contanst.SCHEMA_INPUT,
      display: 'block',
    },
    {
      fieldKey: 'stockUpScale',
      title: '备货规模',
      type: contanst.SCHEMA_SELECT,
      display: 'block',
      values: [
        { label: '分原材料', value: '分原材料' },
        { label: '备品备件', value: '备品备件' },
        { label: '半成品', value: '半成品' },
      ],
    },
  ],
};

const bmbField = {
  title: '备品备件备货',
  fieldKey: 'rawMaterialSpare',
  fields: [
    {
      fieldKey: 'classification',
      title: '分类',
      type: contanst.SCHEMA_INPUT,
      display: 'block',
    },
    {
      fieldKey: 'model',
      title: '型号',
      type: contanst.SCHEMA_INPUT,
      display: 'block',
    },
    {
      fieldKey: 'name',
      title: '名称',
      type: contanst.SCHEMA_INPUT,
      display: 'block',
    },
    {
      fieldKey: 'stockUpScale',
      title: '备货规模',
      type: contanst.SCHEMA_SELECT,
      display: 'block',
      values: [
        { label: '分原材料', value: '分原材料' },
        { label: '备品备件', value: '备品备件' },
        { label: '半成品', value: '半成品' },
      ],
    },
  ],
};

const dialogObj = {
  hxyclcg: hxyclcgField,
  ycl: yclField,
  bmb: bmbField,
};

const modeText = {
  edit: '填写明细',
  preview: '查看明细',
};

export default ({ onChange = () => { }, value = [{}], mode, fieldInstance = () => {} }) => {
  const field = Field.useField();
  const [newValue, setNewValue] = useState(value);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogFields, setDialogFields] = useState([]);
  const [dialogValues, setDialogValues] = useState({});
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [dataSource, setDataSource] = useState([]);
  const [isMainCategoryChange, setIsMainCategoryChange] = useState(true);
  useEffect(() => {
    if (value[0]?.mainCategory) {
      setNewValue(value); // 确保初始值被正确设置
    }
    if (isMainCategoryChange) {
      const promises = value
        .filter((item) => item?.mainCategory)
        .flatMap((item) => {
          const mainCategoryList = Object.keys(JSON.parse(item.mainCategory)).map((key) => JSON.parse(item.mainCategory)[key].categoryId);
          return mainCategoryList.map((categoryId) => {
            return fetchData(categoryId).then((res) => {
              const newChildren = res?.children?.map((i) => ({ ...i, label: i.name, value: i.id, children: i.hasChild ? [{}] : [] }));
              setDataSource((prevDataSource) => updateChildren(prevDataSource, categoryId, newChildren));
            });
          });
        });

      Promise.all(promises).then(() => {
        // All requests have completed
      });
    }
  }, [value]);

  const handleAddCol = () => {
    setNewValue([...newValue, {}]);
    onChange(newValue);
  };

  const handleOpenDialog = (type, index) => {
    setDialogVisible(true);
    setDialogFields(dialogObj[type]);
    setDialogValues(newValue[index][dialogObj[type].fieldKey] || {});
    setCurrentIndex(index);
  };

  const handleCloseDialog = () => {
    setDialogVisible(false);
  };

  const handleSetDetail = (values) => {
    const { Index, [dialogFields.fieldKey]: fieldValue } = values;
    const newValues = [...newValue];
    newValues[Index][dialogFields.fieldKey] = fieldValue;
    setNewValue(newValues);
    onChange(newValues);
    handleCloseDialog();
  };
  const onDataSourceChange = (v, index) => {
    fetchData(v).then((res) => {
      const newChildren = res?.children?.map((i) => ({ ...i, label: i.name, value: i.id, children: i.hasChild ? [{}] : [] }));
      setDataSource(updateChildrenIndex(dataSource, v, newChildren, index));
    });
  };
  const handleChange = (index, key, v) => {
    const newValues = [...newValue];
    newValues[index][key] = v;
    setNewValue(newValues);
    onChange(newValues);
  };
  const mainCategoryChange = (index, key, v, extra) => {
    setIsMainCategoryChange(false);
    const newValues = [...newValue];
    if (key === 'mainCategory') {
      const _values = extra.selectedPath.reduce((acc, item, i) => {
        acc[`level${i + 1}`] = {
          categoryId: item.id,
          name: item.name,
        };
        return acc;
      }, {});
      newValues[index][key] = JSON.stringify(_values);
    } else {
      newValues[index][key] = v;
    }
    setNewValue(newValues);
    onChange(newValues);
    onDataSourceChange(v, index);
  };

  useEffect(() => {
    fetchData(0).then((res) => {
      setDataSource(res?.children?.map((item) => ({ ...item, label: item.name, value: item.id, children: item.hasChild ? [{}] : [] })));
    });
    fieldInstance(field, newValue);
    setNewValue(value);
  }, []);

  useEffect(() => {
    fieldInstance(field, newValue);
  }, [newValue]);
  return (
    <div className="flex flex-col gap-y-[16px]">
      {newValue.map((item, index) => {
        return (
          <div className="flex flex-col p-[16px] rounded-[6px] bg-[#F8F8F8]">
            <div className="text-[14px] text-[#333] font-bold mb-[12px] h-[17px]">主营类目{nzhcn.encodeS(index + 1)}</div>
            <div>
              <FieldBlock
                mode={mode}
                field={field}
                fields={[
                  {
                    fieldKey: 'mainCategory',
                    title: '主营类目',
                    type: contanst.SCHEMA_CASCADER_SELECT,
                    opt: {
                      width: '156px',
                      onChange: (v, data, extra) => mainCategoryChange(index, 'mainCategory', v, extra),
                      value: item?.mainCategory ? Object.keys(JSON.parse(item.mainCategory)).map((key) => JSON.parse(item.mainCategory)[key].categoryId).pop() : '',
                      changeOnSelect: true,
                    },
                    values: dataSource,
                    fieldInitOptions: {
                      rules: [{ required: true }],
                    },
                  },
                  {
                    fieldKey: 'dailyCapacity',
                    title: '日产能(件)',
                    type: contanst.SCHEMA_INPUT,
                    opt: {
                      width: '156px',
                      onChange: (v) => handleChange(index, 'dailyCapacity', v),
                      value: item?.dailyCapacity,
                    },
                  },
                  {
                    fieldKey: 'coreMaterialPurchasePeriod',
                    title: '核心原材料采购周期',
                    type: contanst.SCHEMA_INPUT,
                    opt: {
                      width: '156px',
                      onChange: (v) => handleChange(index, 'coreMaterialPurchasePeriod', v),
                      value: item?.coreMaterialPurchasePeriod,
                    },
                  },
                  {
                    fieldKey: 'openModelMinOrderQuantity',
                    title: '开模产品最小起订量',
                    type: contanst.SCHEMA_INPUT,
                    opt: {
                      width: '156px',
                      onChange: (v) => handleChange(index, 'openModelMinOrderQuantity', v),
                      value: item?.openModelMinOrderQuantity,
                    },
                  },
                  {
                    fieldKey: 'rawMaterial',
                    title: '原材料',
                    type: 'custom',
                    customComponent: () => {
                      return (
                        <div className="w-[156px] flex flex-row items-center">
                          <Button text type="primary" onClick={() => handleOpenDialog('ycl', index)}>
                            {modeText[mode]}
                          </Button>
                        </div>
                      );
                    },
                    opt: {
                      width: '156px',
                    },
                  },
                  {
                    fieldKey: 'rawMaterialSpare',
                    title: '备品备件备货',
                    type: 'custom',
                    customComponent: () => {
                      return (
                        <div className="w-[156px] flex flex-row items-center">
                          <Button text type="primary" onClick={() => handleOpenDialog('bmb', index)}>
                            {modeText[mode]}
                          </Button>
                        </div>
                      );
                    },
                    opt: {
                      width: '156px',
                    },
                  },
                  {
                    fieldKey: 'coreMaterialPurchase',
                    title: '核心原材料采购',
                    type: 'custom',
                    customComponent: () => {
                      return (
                        <div className="w-[156px] flex flex-row items-center">
                          <Button text type="primary" onClick={() => handleOpenDialog('hxyclcg', index)}>
                            {modeText[mode]}
                          </Button>
                        </div>
                      );
                    },
                    opt: {
                      width: '156px',
                    },
                  },
                ]}
              />
            </div>
          </div>
        );
      })}
      {
        mode !== 'preview' && (
          <div className="flex flex-row">
            <Button type="normal:primary-ghost" onClick={handleAddCol} style={{ height: '24px' }}>
              新增类目
            </Button>
          </div>
        )
      }
      <CommonDialog
        visible={dialogVisible}
        value={dialogValues}
        fields={dialogFields?.fields}
        title={dialogFields?.title}
        fieldKey={dialogFields?.fieldKey}
        Index={currentIndex}
        onCancel={handleCloseDialog}
        onClose={handleCloseDialog}
        onOk={handleSetDetail}
        mode={mode}
      />
    </div>
  );
};
