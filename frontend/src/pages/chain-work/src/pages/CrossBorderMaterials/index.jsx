import React, { useEffect, useState } from 'react';
import { Button, Card, Field } from '@alifd/next';
import './index.scss';
import {
  queryCrossBorderComponentByItemId,
  updateMaterialInfo,
  queryMaterialInfo,
  updateProductMaterials,
} from './service';
import {
  getManufacturerCountByUserId,
  submitCrossBorderComponent,
  queryAllManufacturerDetailsByUserId,
  alterManufacturerInfo,
} from '@/service/common';
import BallonTooltip from '@/pages/ManufacturerInfoManagement/components/BallonTooltip';
import { getQueryParams, MessageError, MessageSuccess, Logger, fromEntries } from '@/utlis';
import PieceWeightScaleCard from './components/PieceWeightScaleCard';
import { submitSkuFeatures, officialSkuFeaturesData, queryItemPws } from '@/pages/Select/services';
import schema from './schema';
import RenderFieldExt from './components/RenderFieldExt';
import MultiLanguageProductMaterials from './components/MultiLanguageProductMaterials';

Logger.init({ a: '编辑跨境素材', b: '编辑跨境素材' }, { pageKey: '编辑跨境素材' });

export default () => {
  const [manufacturerList, setManufacturerList] = useState([]);
  const [offerInfo, setOfferInfo] = useState({});
  const [manuCount, setManuCount] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const field = Field.useField({ parseName: true });
  const [dataSource, setDataSource] = useState([]);
  const [radioValue, setRadioValue] = useState('sku');
  const [tableLoading, setTableLoading] = useState(false);
  const channel = getQueryParams('channel');
  const [dataObj, setData] = useState({});
  const { validate, reset } = field;
  const qurey = () => {
    queryAllManufacturerDetailsByUserId().then((res) => {
      setManufacturerList(res);
    });
    getManufacturerCountByUserId().then((res) => {
      setManuCount(Number(res) === 100);
    });
  };
  useEffect(() => {
    getData();
    if (channel) {
      queryMaterialInfo({
        itemId: getQueryParams('itemId'),
      }).then((res) => {
        console.info('res=======================>', res);
        const { content = {} } = res;
        const { success = false, msg = '系统异常', model = {} } = content;
        if (success) {
          setOfferInfo(model?.offerInfo);
          // 将后端返回的 crossBorderModel 对象转换为数组格式供 Checkbox.Group 使用
          const crossBorderModelArray = [];
          if (model?.crossBorderModel && typeof model.crossBorderModel === 'object') {
            Object.keys(model.crossBorderModel).forEach((key) => {
              if (key !== 'class' && key !== 'foreignPackageImageList' && model.crossBorderModel[key] === true) {
                crossBorderModelArray.push(key);
              }
            });
          }

          field.setValues({
            ...model,
            manufacturerId: model?.mfrInfoModel?.manufacturerId,
            crossBorderModel: crossBorderModelArray,
            foreignPackageImageList: model?.crossBorderModel?.foreignPackageImageList,
          });
        } else {
          MessageError(msg);
        }
      });
    } else {
      queryCrossBorderComponentByItemId({
        itemId: getQueryParams('itemId'),
      }).then((res) => {
        const { content = {} } = res;
        const { success = false, msg = '系统异常', data = {} } = content;
        if (success) {
          setOfferInfo(data?.offerInfo);
          field.setValues({
            ...data,
            dimensionImageList: [],
            shootImageList: [],
          });
        } else {
          MessageError(msg);
        }
      });
    }
    qurey();
  }, []);
  const handleCancel = () => {
    window.history.back();
  };
  const processChildren = (children) => {
    const rowSpanMap = new Map();
    // 计算每一行的 rowSpan
    children.forEach((child) => {
      const id = child?.itemId;
      if (!id) return; // 如果 id 不存在，跳过该子项
      if (!rowSpanMap.has(id)) {
        rowSpanMap.set(id, 1);
      } else {
        rowSpanMap.set(id, rowSpanMap.get(id) + 1);
      }
    });
    // 添加 rowSpan 属性到每个子项
    return children.map((child) => {
      const id = child?.itemId;
      return {
        ...child,
        rowSpan: id ? rowSpanMap.get(id) : 1, // 如果 id 不存在，默认 rowSpan 为 1
      };
    });
  };
  const getData = async () => {
    queryItemPws({
      itemId: getQueryParams('itemId'),
    })
      .then((res) => {
        const { success = false, msg = '系统错误，请稍后再试', model = {} } = res?.content || {};
        setTableLoading(false);
        if (success) {
          const newModel = {
            ...model,
            itemPwsModel: [model?.itemPwsModel],
          };
          setData(newModel);
          setRadioValue(newModel?.showType);
          if (newModel?.showType === 'sku') {
            const newList = [newModel].flatMap((item) => {
              return item?.skuPwsModels?.map((ele) => ({
                ...ele,
                ...item,
                children: ele?.skuPwsModels,
              }));
            });
            setDataSource(processChildren(newList));
          } else {
            setDataSource(newModel?.itemPwsModel);
          }
        } else {
          MessageError(msg || '系统错误，请稍后再试');
        }
      })
      .catch((error) => {
        setTableLoading(false);
        MessageError(error?.errMsg || '系统错误，请稍后再试');
      });
  };
  // 更新数据源的方法
  const updateDataSource = (rowIndex, dataIndex, newValue) => {
    setDataSource((prevDataSource) => {
      const updatedDataSource = [...prevDataSource];
      updatedDataSource[rowIndex][dataIndex] = newValue;
      return updatedDataSource;
    });
  };
  // 更新数据源的回调函数
  const handleDataSourceUpdate = (newDataSource) => {
    // 过滤没有设置的值
    // eslint-disable-next-line @iceworks/best-practices/recommend-polyfill
    const _newDataSource = fromEntries(Object.entries(newDataSource).filter(([value]) => value !== undefined));
    const keysToUpdate = Object.keys(_newDataSource);
    setDataSource((prevState) =>
      prevState.map((item) => ({
        ...item,
        ...keysToUpdate.reduce((acc, key) => ({ ...acc, [key]: _newDataSource[key] }), {}),
      })));
  };
  const onChange = (value) => {
    setRadioValue(value);
    reset();
    if (value === 'sku') {
      const newList = [dataObj].flatMap((item) => {
        return item?.skuPwsModels?.map((ele) => ({
          ...ele,
          ...item,
          children: ele?.skuPwsModels,
        }));
      });
      setDataSource(processChildren(newList));
    } else {
      setDataSource(dataObj?.itemPwsModel);
    }
  };
  const onBindClick = (text, f) => {
    return Logger.report({
      c: getQueryParams('itemId'),
      d: 'OTHER',
      e: `@source_3去优化提交@divert_${text}@funnel_优化任务`,
      f,
    });
  };
  const handleCreate = () => {
    if (channel) {
      const { dimensionImageList = [], shootImageList = [] } = field.getValues();
      // if (!dimensionImageList?.length) {
      //   field?.setError('dimensionImageList', '尺寸图不能为空');
      // }
      // if (!shootImageList?.length) {
      //   field?.setError('shootImageList', '实拍图不能为空');
      // }
      validate((errors, values) => {
        const newList = dataSource.map((ele) => ({
          attributes: ele?.attributes,
          weight: ele?.weight || ele?.currentPws?.weight || '',
          width: ele?.width || ele?.currentPws?.width || '',
          height: ele?.height || ele?.currentPws?.height || '',
          length: ele?.length || ele?.currentPws?.length || '',
          skuId: ele?.skuId,
        }));
        // 将 crossBorderModel 数组转换为对象格式，只包含值为true的服务字段
        const crossBorderModelObj = {};

        if (values?.crossBorderModel && Array.isArray(values.crossBorderModel)) {
          values.crossBorderModel.forEach((service) => {
            crossBorderModelObj[service] = true;
          });
        }

        Promise.all([
          submitSkuFeatures({
            offerId: getQueryParams('itemId'),
            list: JSON.stringify(newList),
            showLogisticsCategory: radioValue,
          }),
          updateMaterialInfo({
            itemId: getQueryParams('itemId'),
            // materialUpdateModel先保留
            param: {
              emptyIsDelete: true,
              manufacturerId: values?.manufacturerId, // 商品 ID
              prohibitedAreas: values?.prohibitedAreas, // 更新的跨境素材信息
              packageImageList: values?.packageImageList, // 外包装参考图
              crossBorderModel: {
                dimensionImageList, // 尺寸图信息
                shootImageList, // 实拍图信息
                foreignPackageImageList: values?.foreignPackageImageList, // 外包装参考图
                ...crossBorderModelObj,
              },
              packageLanguage: values?.packageLanguage, // 外包装语言
            },
          }),
          values?.titleEn &&
            updateProductMaterials({
              offerId: getQueryParams('itemId'),
              language: 'en',
              title: values?.titleEn,
            }),
        ])
          .then((res) => {
            const hasTitleEn = values?.titleEn;
            const isSuccess = hasTitleEn
              ? res[0]?.model && res[1]?.success && res[2]?.success
              : res[0]?.model && res[1]?.success;

            if (isSuccess) {
              onBindClick('件重尺填写', '成功');
              MessageSuccess('提交成功');
              window.history.back();
            } else if (!res[0]?.success) {
              MessageError(res[0]?.msg || '系统异常');
            } else if (!res[1]?.success) {
              MessageError(res[1]?.msg || '系统异常');
            } else if (hasTitleEn && !res[2]?.success) {
              MessageError(res[2]?.msg || '系统异常');
            }
          })
          .catch((error) => {
            onBindClick('件重尺填写', '失败');
            MessageError(error?.errorMessage);
          });
      });
    } else {
      validate((errors, values) => {
        if (errors) {
          return;
        }
        const newList = dataSource.map((ele) => ({
          attributes: ele?.attributes,
          skuId: ele?.skuId,
          isOfficial: ele?.isOfficial,
          weight: ele?.weight || ele?.currentPws?.weight || '',
          width: ele?.width || ele?.currentPws?.width || '',
          height: ele?.height || ele?.currentPws?.height || '',
          length: ele?.length || ele?.currentPws?.length || '',
        }));
        Promise.all([
          submitSkuFeatures({
            offerId: getQueryParams('itemId'),
            list: JSON.stringify(newList),
            showLogisticsCategory: radioValue,
          }),
          submitCrossBorderComponent({
            crossBorderComponent: {
              itemId: getQueryParams('itemId'),
              prohibitedAreas: values?.prohibitedAreas,
              manufacturerId: values?.manufacturerId,
            },
          }),
          values?.titleEn &&
            updateProductMaterials({
              offerId: getQueryParams('itemId'),
              language: 'en',
              title: values?.titleEn,
            }),
        ])
          .then((res) => {
            const hasTitleEn = values?.titleEn;
            const isSuccess = hasTitleEn
              ? res[0]?.model && res[1]?.success && res[2]?.success
              : res[0]?.model && res[1]?.success;

            if (isSuccess) {
              onBindClick('件重尺填写', '成功');
              MessageSuccess('提交成功');
              window.history.back();
            } else if (!res[0]?.success) {
              MessageError(res[0]?.msg || '系统异常');
            } else if (!res[1]?.success) {
              MessageError(res[1]?.msg || '系统异常');
            } else if (hasTitleEn && !res[2]?.success) {
              MessageError(res[2]?.msg || '系统异常');
            }
          })
          .catch((error) => {
            onBindClick('件重尺填写', '失败');
            MessageError(error?.errorMessage);
          });
      });
    }
  };
  // 添加制造商信息
  const addManufacturerInfo = (values) => {
    alterManufacturerInfo({
      action: 0,
      manufacturerModel: {
        ...values,
        type: 'MANUAL',
      },
    })
      .then((res) => {
        const { content } = res;
        const { success, msg, data } = content;
        if (success) {
          qurey(data);
          field.setValues({
            manufacturerId: data,
          });
          MessageSuccess(msg);
        } else {
          MessageError(msg || '系统异常');
        }
      })
      .catch((err) => {
        MessageError(err.errMsg || '系统异常');
      });
  };
  return (
    <div className="ae-order-container">
      <div className="pl-[120px] pr-[120px] bg-[#f9f9f9] h-full pb-[20px]">
        <div className="w-full h-[18px] font-PingFangSC font-medium text-[18px] text-[#333] leading-[18px] pt-[24px] box-content">
          编辑跨境素材
        </div>
        <Card free className="mt-[20px] rounded-[6px]">
          <Card.Header title={<div className="text-[16px] font-semibold">商品信息</div>} />
          <Card.Divider inset />
          <Card.Content>
            <div className="mt-[4px] mb-[4px] ml-[4px] flex items-center">
              {offerInfo?.picUrl && (
                <a target="_blank" rel="noreferrer" style={{ cursor: 'pointer' }}>
                  <div className="w-[56px] h-[56px] mr-[12px] ">
                    <img className="rounded-[6px]" src={offerInfo?.picUrl} alt="img" />
                  </div>
                </a>
              )}
              <div className="h-[62px] flex justify-between w-full">
                <div className="flex flex-col justify-between">
                  <BallonTooltip
                    trigger={
                      <span className="w-full text-sm text-[#333] text-ellipsis line-clamp-1">{offerInfo?.title}</span>
                    }
                    content={offerInfo?.title}
                  />
                  <div className="text-[#999] text-[13px] mt-[4px]">ID：{offerInfo?.itemId}</div>
                </div>
              </div>
            </div>
            <div className="text-[13px] text-[#666] mt-[20px]">
              <span className="font-medium text-[#333] mr-[20px]">商品类目信息</span>
              {offerInfo?.cateLevel1Name && (
                <span className="mr-[20px]">
                  一级类目：<span className="text-[#333]">{offerInfo?.cateLevel1Name}</span>
                </span>
              )}
              {offerInfo?.cateLevel2Name && (
                <span className="mr-[20px]">
                  二级类目：<span className="text-[#333]">{offerInfo?.cateLevel2Name}</span>
                </span>
              )}
              {offerInfo?.cateLevel3Name && (
                <span>
                  三级类目：<span className="text-[#333]">{offerInfo?.cateLevel3Name}</span>
                </span>
              )}
            </div>
          </Card.Content>
        </Card>
        <PieceWeightScaleCard
          itemId={getQueryParams('itemId')}
          radioValue={radioValue}
          onChange={onChange}
          dataSource={dataSource}
          field={field}
          tableLoading={tableLoading}
          handleDataSourceUpdate={handleDataSourceUpdate}
          updateDataSource={updateDataSource}
          dataObj={dataObj}
        />
        <MultiLanguageProductMaterials field={field} />
        <Card free className="mt-[20px] rounded-[6px]">
          <Card.Header
            title={
              <div className="text-[16px] font-semibold">{channel ? '基础信息' : '设置禁售国家地区与制造商信息'}</div>
            }
          />
          <Card.Divider inset />
          <Card.Content>
            {/* refreshKey用于触发表单重新渲染，当crossBorderModel变化时更新 */}
            {schema({
              manufacturerList,
              manuCount,
              addManufacturerInfo,
              state: channel ? 'channelService' : undefined,
              field,
              refreshKey, // 添加refreshKey以消除lint警告，虽然不直接使用但会触发重新渲染
            }).map((item) => {
              return (
                <RenderFieldExt
                  key={item.fieldKey}
                  {...item}
                  field={field}
                  onCrossBorderModelChange={item.fieldKey === 'crossBorderModel' ? () => setRefreshKey((prev) => prev + 1) : undefined}
                />
              );
            })}
          </Card.Content>
        </Card>
      </div>
      <div className="ae-order-opeations">
        <Button type="primary" onClick={handleCreate}>
          确认
        </Button>
        <Button onClick={handleCancel}>返回</Button>
      </div>
    </div>
  );
};
