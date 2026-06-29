import React, { useEffect, useState } from 'react';
import Block from '@/layouts/Block';
import RenderFieldExt from './RenderFieldExt';
import { Icon, Button } from '@alifd/next';
import { SCHEMA_UPLOAD, SCHEMA_NUMBER_PICKER } from '../contanst';
import { SCHEMA_RADIO_GROUP, SCHEMA_INPUT } from '@/components/CommonTable/contanst';

function EnterpriseShareholdingInfor({ view, field, hasEquityStructureDiagram, companyShareHoldingList, companyShareHoldingInfoEquityStructureDiagramUrl }) {
  const [hasInfo, setHasInfo] = useState(false);
  const [diagrams, setDiagrams] = useState([]);
  const [items, setItems] = useState([{ key: '1' }]);
  const [hasAdd, setHasAdd] = useState(false); // 是否显示➕按钮

  // 初始化逻辑
  useEffect(() => {
    setDiagrams(companyShareHoldingInfoEquityStructureDiagramUrl);
    if (hasEquityStructureDiagram && companyShareHoldingList) {
      setHasInfo(true);
      setItems(companyShareHoldingList.map((_, i) => ({ key: i })));
    }
  }, [companyShareHoldingInfoEquityStructureDiagramUrl, hasEquityStructureDiagram, companyShareHoldingList]);

  // 是否有股权架构图
  const IS_SHAREHOLDING_LEVEL_GE_4 = {
    name: '是否有股权架构图',
    fieldKey: 'CompanyShareHoldingInfo_hasEquityStructureDiagram',
    type: SCHEMA_RADIO_GROUP,
    opt: {
      value: hasInfo,
      style: { width: 320 },
      disabled: view,
      onChange: (value) => {
        field.setErrors({
          CompanyShareHoldingInfo_hasEquityStructureDiagram: null,
        });
        setHasInfo(value);
        field.remove('CompanyShareHoldingInfo_equityStructureDiagramUrl');
        field.setValue('CompanyShareHoldingInfo_hasEquityStructureDiagram', value);
      },
    },
    values: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  };

  // 营业执照彩色影像件
  const EQUITY_STRUCTURE_DIAGRAM = {
    name: '股权架构图',
    fieldKey: 'CompanyShareHoldingInfo_equityStructureDiagramUrl',
    type: SCHEMA_UPLOAD,
    opt: {
      listType: 'picture-card',
      action: 'https://crossborder.1688.com/choice/upload',
      accept: '.jpg,.jpeg,.png,.pdf',
      rules: [
        {
          validator: (rule, value, callback) => {
            if (value?.length > 0) {
              callback();
            } else {
              callback('请上传股权架构图');
            }
          },
        },
      ],
      disabled: view,
      className: 'products-business-upload',
      fileList: diagrams,
      onRemove: () => {
        setDiagrams([]);
      },
      onChange: ({ file, fileList }) => {
        setDiagrams(fileList);
        if (fileList.filter((item) => item.response && !item.response.success)?.length) {
          field.setErrors({
            CompanyShareHoldingInfo_equityStructureDiagramUrl: file?.response?.retMsg,
          });
          return false;
        } else {
          field.setErrors({
            CompanyShareHoldingInfo_equityStructureDiagramUrl: null,
          });
        }
        const { status } = file;
        if (status === 'done') {
          field.setValue('CompanyShareHoldingInfo_equityStructureDiagramKey', fileList[0].response?.result);
          field.setValue('CompanyShareHoldingInfo_equityStructureDiagramUrl', fileList[0].response?.result);
        }
      },
      children: (
        diagrams.length >= 1 ? null : (
          <div className="products-business-upload-text">
            <Icon type="add" />
            <div>上传</div>
          </div>
        )
      ),
      balloon: (
        <div className="text-[12px] text-[#999] flex mt-[4px]">
          股权架构图请参考说明：股权架构图
          <Button type="primary" text style={{ fontSize: 12, marginLeft: 8 }} onClick={() => window.open('https://global-pdf-cdn.1688.com/template/%E8%82%A1%E6%9D%83%E6%9E%B6%E6%9E%84%E5%9B%BE%E6%A8%A1%E7%89%88.pdf')}>
            示例
          </Button>
        </div>
      ),
    },
  };
  const addItem = () => setItems([...items, { key: items.length + 1 }]);
  // const total = (obj) => {
  //   let sum = 0;
  //   for (const key in obj) {
  //     if (key.includes('CompanyShareHoldingInfo_shareHoldingRatio')) {
  //       sum += obj[key];
  //     }
  //   }
  //   return sum;
  // };
  // const removeTabpane = (targetKey) => {
  //   setItems((prevPanes) => {
  //     const newPanes = prevPanes.filter((pane) => pane.key !== targetKey);
  //     return newPanes;
  //   });
  //   field.remove(`${targetKey}_CompanyShareHoldingInfo_companyName`);
  //   field.remove(`${targetKey}_CompanyShareHoldingInfo_shareHoldingRatio`);
  //   if (total(field.getValues()) > 100) {
  //     setHasAdd(true);
  //   } else {
  //     setHasAdd(false);
  //   }
  // };
  return (
    <Block
      title={
        <div>
          <span className="text-[#FB3B20]">* </span>
          <span className="text-[16px]">企业持股信息</span>
        </div>
      }
    >
      <div className="alipay-international-edd-info">
        {[IS_SHAREHOLDING_LEVEL_GE_4].map((ele) => (
          <RenderFieldExt {...ele} field={field} />
        ))}
        {/* {hasInfo && items.map((ele, index) => {
          return (
            <div className="flex items-center" key={ele.key}>
              <RenderFieldExt
                field={field}
                name={`持股企业名称${index + 1}`}
                fieldKey={`${ele.key}_CompanyShareHoldingInfo_companyName`}
                type={SCHEMA_INPUT}
                opt={{
                  placeholder: '请输入',
                  hasClear: true,
                  disabled: view,
                  style: { width: 320, marginRight: '20px' },
                  rules: [{ required: true, message: '请输入持股企业名称' }],
                }}
              />
              <RenderFieldExt
                field={field}
                title_style="w-[84px]"
                name="持股企业比例"
                fieldKey={`${ele.key}_CompanyShareHoldingInfo_shareHoldingRatio`}
                type={SCHEMA_NUMBER_PICKER}
                opt={{
                  placeholder: '请输入',
                  hasClear: true,
                  style: { width: 320 },
                  disabled: view,
                  hasTrigger: false,
                  innerAfter: <span style={{ color: '#999', margin: '0 12px 0 8px' }}>%</span>,
                  rules: [
                    { required: true, message: '请输入持股企业比例' },
                    {
                      validator: (rule, value, callback) => {
                        if (value > 100) {
                          callback('持股比例不能大于100');
                        } else {
                          callback();
                        }
                      },
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (total(field.getValues()) > 100) {
                          setHasAdd(true);
                          callback('持股比例总和不能大于100');
                        } else if (total(field.getValues()) === 100) {
                          setHasAdd(true);
                          callback();
                        } else {
                          setHasAdd(false);
                          callback();
                        }
                      },
                    },
                  ],
                  onChange: (value) => {
                    field.setValues({
                      [`${ele.key}_CompanyShareHoldingInfo_shareHoldingRatio`]: value,
                    });
                    if (value > 100) {
                      field.setErrors({
                        [`${ele.key}_CompanyShareHoldingInfo_shareHoldingRatio`]: '持股企业比例不能大于100',
                      });
                    } else {
                      field.setErrors({
                        [`${ele.key}_CompanyShareHoldingInfo_shareHoldingRatio`]: '',
                      });
                    }
                    const regex = /^(\d+)_CompanyShareHoldingInfo_shareHoldingRatio/;
                    let sum = 0;
                    for (const key in field.getValues()) {
                      if (regex.test(key)) {
                        sum += field.getValues()[key];
                      }
                    }
                    setHasAdd(sum > 100);
                  },
                }}
              />
              {index !== 0 && <Icon type="ashbin" className={`${field.getError(`${ele.key}_CompanyShareHoldingInfo_shareHoldingRatio`) ? '' : 'mt-[20px]'} ml-[10px] cursor-pointer hover:text-[#FF3B30] text-[#BBB]`} onClick={() => removeTabpane(ele.key)} />}
            </div>
          );
        })} */}
        {/* {hasInfo && (
          !hasAdd && !view && (
            <div
              className="ml-[194px] text-[#0077FF] mt-[20px] h-[34px] w-[755px] flex flex-row justify-center items-center p-[16px] border border-dashed border-[#CCCCCC] rounded-[6px] opacity-100 box-border cursor-pointer"
              onClick={addItem}
            >
              <Icon type="add" className="mr-[10px]" />
              新增持股企业
            </div>
          )
        )} */}
        {hasInfo && [EQUITY_STRUCTURE_DIAGRAM].map((ele) => (
          <RenderFieldExt {...ele} field={field} />
        ))}
      </div>
    </Block>
  );
}

export default EnterpriseShareholdingInfor;
