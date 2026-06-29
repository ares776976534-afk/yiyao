import React, { useState, useRef, useEffect } from 'react';
import NewWorkLayout from '@/layouts/NewWorkLayout';
import Tab from './components/Tab';
import Button from '@/components/UI/Button';
import Block from './components/Block';
import SubBlock from './components/Block/SubBlock';
import { Field, Loading } from '@alifd/next';
import FieldBlock from './components/FieldBlock';
import { tabData, Mode } from './enums';
import schema from './schema';
import { querySupplierInfoService, editSupplierInfoService } from './service';
import SupplyChainDialog from './components/SupplyChainDialog';
import { Logger } from '@/utlis';
import './index.scss';

Logger.init({ a: '供应商信息录入', b: '工厂供应链' }, { pageKey: 'supplierinformation' });

export const MODE_PREVIEW = 'preview';
export const MODE_EDIT = 'edit';

export default () => {
  const [mode, setMode] = useState(MODE_PREVIEW);
  const [fieldInstanceValue, setFieldInstanceValue] = useState(null);
  const field = Field.useField();
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);
  const [activeTab, setActiveTab] = useState(tabData[0].key);
  const fieldInstance = (f, newValue) => {
    setFieldInstanceValue({
      field: f,
      newValue,
    });
  };
  const onOK = () => {
    setMode(MODE_EDIT);
  };
  useEffect(() => {
    querySupplierInfoService().then((res) => {
      if (res?.success) {
        setLoading(false);
        const { model } = res;
        if (Object.values(model).some((item) => item.pre === true)) {
          SupplyChainDialog.open({ onOK });
        }
        const _values = {};
        // eslint-disable-next-line no-return-assign
        Object.keys(model).forEach((key) => _values[key] = model[key]?.value);
        field.setValues(_values);
      }
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = tabData.map(item => document.getElementById(item.key));
      const scrollPosition = contentRef.current.scrollTop + 133; // Adjust for the offset

      let newActiveTab = activeTab;
      sections.forEach(section => {
        if (section && section.offsetTop <= scrollPosition) {
          newActiveTab = section.id;
        }
      });

      setActiveTab(newActiveTab);
    };

    const currentContentRef = contentRef.current;
    currentContentRef.addEventListener('scroll', handleScroll);

    return () => {
      currentContentRef.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab]);

  const handleToggleAction = () => {
    if (mode === MODE_EDIT) {
      field.validate((errors, value) => {
        // 将字段名映射到对象中
        const params = Object.keys(value).map((key) => ({ fieldName: key, value: value[key] }));
        if (errors) {
          return null;
        }
        let hasError = false;
        fieldInstanceValue?.newValue.forEach((item, index) => {
          if (!item?.mainCategory) {
            fieldInstanceValue?.field.setErrors({ [`mainCategory.${index}`]: '主营类目不能为空' });
            hasError = true;
          }
        });
        if (hasError) {
          fieldInstanceValue?.field.validate((e, v) => {
            if (e) {
              return null;
            }
          });
        } else {
          editSupplierInfoService(params).then((res) => {
            if (res?.success) {
              setMode(MODE_PREVIEW);
            }
          });
        }
      });
    } else {
      setMode(MODE_EDIT);
    }
  };

  const handleClickTab = (item) => {
    setActiveTab(item.key);
    const targetElement = document.getElementById(item.key);
    if (targetElement && contentRef.current) {
      const offset = 133;
      const targetPosition = targetElement.offsetTop - offset;
      contentRef.current.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  };

  return (
    <NewWorkLayout
      title={
        <div>
          工厂供应链
          <span className="text-[#FB3B20] text-[12px] ml-[8px]">系统已根据您在找工厂和深度认证填写的信息进行表单预填，请注意信息的准确性</span>
        </div>
      }
    >
      <div className="sticky top-0 left-0 right-0 z-10">
        <Tab
          onClick={handleClickTab}
          data={tabData}
          active={activeTab}
          rightPanel={<Button type="primary" onClick={handleToggleAction} style={{ borderRadius: '6px' }}>{Mode[mode]}</Button>}
        />
      </div>
      <Loading tip="加载中..." visible={loading}>
        <div ref={contentRef} className="h-[calc(100vh_-_157px)] overflow-y-auto mt-[16px]">
          {schema(mode, field, fieldInstance).map((block) => (
            <Block id={block?.id} title={block?.title} subTitle={block?.subTitle}>
              {block?.subBlocks.map((ele) => (
                <SubBlock title={<div>{ele?.title}{ele?.btn}</div>}>
                  {Array.isArray(ele?.fields) ? <FieldBlock mode={mode} field={field} fields={ele?.fields} className={block?.id === 'informationLevel' && 'informationLevel'} fieldClassName={block?.id === 'informationLevel' && 'fieldClassNameinformationLevel'} /> : ele?.fields}
                </SubBlock>
              ))}
            </Block>
          ))}
        </div>
      </Loading>
    </NewWorkLayout>
  );
};
