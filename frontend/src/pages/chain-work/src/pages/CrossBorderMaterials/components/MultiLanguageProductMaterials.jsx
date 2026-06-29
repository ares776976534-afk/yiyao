import React, { useEffect, useState, useCallback } from 'react';
import Button from '@/components/UI/Button';
import { Tab, Balloon } from '@alifd/next';
import multiLanguage from './multiLanguage';
import RenderFieldExt from './RenderFieldExt';
import { getQueryParams } from '@/utlis';
import { queryCrossAIProductMaterials, downloadCrossAIProductMaterials } from '../service';
import Message from '@/components/UI/Message';

const { Tooltip } = Balloon;

// 常量配置
const TAB_CONFIG = [
  { title: '中文原素材', key: 'Zh' },
  { title: '英语', key: 'En' },
];

const EMPTY_IMAGE = 'https://img.alicdn.com/imgextra/i4/O1CN01HFkyhC1DwkNTM4P0B_!!6000000000281-2-tps-88-88.png';

// 空状态组件
const EmptyImageState = () => (
  <div className="pt-[20px] flex items-center justify-center flex-col">
    <img className="w-[88px] h-[88px]" src={EMPTY_IMAGE} alt="" />
    <div className="text-[14px] text-[#999] mt-[12px]">暂无图片翻译</div>
  </div>
);

// 渲染字段列表
const FieldList = ({ list, field }) => (
  <>
    {list.map((ele, index) => (
      <RenderFieldExt key={index} {...ele} field={field} />
    ))}
  </>
);

export default ({ field }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dataEn, setDataEn] = useState({});
  const [isShow, setIsShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const offerId = getQueryParams('itemId');

  // 统一错误处理
  const showError = useCallback((error) => {
    Message._show({
      type: 'error',
      content: error?.msg || error?.errorCode || error?.message || '系统异常',
    });
  }, []);

  // 统一成功提示
  const showSuccess = useCallback((content) => {
    Message._show({ type: 'success', content });
  }, []);

  // 设置表单数据
  const setFormData = useCallback((cn, en) => {
    field.setValues({
      titleZh: cn?.transTitle,
      productMainImageZh: cn?.transMainPics,
      skuImageZh: cn?.transSkuPics,
      productDetailImageListZh: cn?.transDetailPics,
      titleEn: en?.transTitle,
      productMainImageEn: en?.transMainPics,
      skuImageEn: en?.transSkuPics,
      productDetailImageListEn: en?.transDetailPics,
    });
  }, [field]);

  // 下载多语言素材
  const downloadMultiLanguageMaterials = useCallback(() => {
    setLoading(true);
    downloadCrossAIProductMaterials({ offerId })
      .then((res) => {
        const { model } = res || {};
        if (model) {
          setLoading(false);
          showSuccess('下载成功');
          window.open(model);
        } else {
          setLoading(false);
          showError({ msg: '下载失败' });
        }
      })
      .catch((err) => {
        setLoading(false);
        showError(err);
      });
  }, [offerId, showSuccess, showError]);

  // 渲染Tab内容
  const renderTabContent = useCallback((item) => {
    const list = multiLanguage({ state: item.key, field });
    const isTransTitle = 'transTitle' in dataEn;

    // 英文Tab的特殊逻辑
    if (item.key === 'En') {
      // 有翻译标题但不可见 - 只显示第一个字段 + 空状态
      if (!isVisible && isTransTitle) {
        return (
          <div className="mt-[20px] mb-[40px]">
            <FieldList list={list.slice(0, 1)} field={field} />
            <EmptyImageState />
          </div>
        );
      }

      // 可见但无翻译标题 - 显示除第一个外的所有字段
      if (!isTransTitle && isVisible) {
        return (
          <div className="mt-[20px]">
            <FieldList list={list.slice(1)} field={field} />
          </div>
        );
      }

      // 不可见且无翻译标题 - 只显示空状态
      if (!isVisible && !isTransTitle) {
        return (
          <div className="mt-[20px] mb-[60px]">
            <div className="pt-[40px]">
              <EmptyImageState />
            </div>
          </div>
        );
      }
    }

    // 默认情况 - 显示所有字段
    return (
      <div className="mt-[20px]">
        <FieldList list={list} field={field} />
      </div>
    );
  }, [field, dataEn, isVisible]);

  // 获取数据
  useEffect(() => {
    queryCrossAIProductMaterials({ offerId })
      .then((res) => {
        if (res?.success) {
          const { multiLangInfo, isTranslate, isQqyx } = res?.model || {};
          const { cn = {}, en = {} } = multiLangInfo || {};
          setIsVisible(isTranslate);
          setIsShow(isQqyx);
          setDataEn(en);
          setFormData(cn, en);
        } else {
          showError(res);
        }
      })
      .catch(showError);
  }, [offerId, setFormData, showError]);

  return (
    <div className="p-[20px] bg-[#fff] rounded-[6px] mt-[16px] pb-0">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-[16px]">
        <div className="text-[16px] font-semibold">多语言商品素材</div>
        <Button loading={loading} type="normal:primary-ghost" onClick={downloadMultiLanguageMaterials} disabled={!isShow}>
          下载多语言素材
        </Button>
      </div>

      {/* 提示横幅 */}
      {!(isShow && !isVisible) && (
        <div className="px-[12px] py-[9px] bg-[#EBF6FF] rounded-[6px] flex items-center mb-[16px]">
          <img src="https://img.alicdn.com/imgextra/i1/O1CN01Tn8wje1ov2d9pO62z_!!6000000005286-2-tps-16-16.png" alt="" />
          <span className="text-[14px] text-[#666] ml-[8px]">
            {isShow && isVisible
              ? '此商品为跨境渠道机会商品，平台已经帮你进行过AI多语言素材翻译，将会展示给跨境买家，提升在跨境渠道的商品转化率，你也可以进行下载或编辑。'
              : '您可以参加全球严选跨境商机提报，提报后的商品平台将免费帮你进行英文素材翻译。'
            }
          </span>
          <Tooltip
            popupClassName="products-business-tooltip"
            popupStyle={{
              width: '416px !important',
              minWidth: '416px',
              maxWidth: '416px',
              height: '264px',
              backgroundColor: '#fff',
              border: '1px solid #E5E5E5',
              boxShadow: 'var(--balloon-primary-shadow, 0px 20px 30px 0px rgba(0, 0, 0, 0.15))',
              borderRadius: '6px',
              padding: '8px',
            }}
            v2
            popupProps={{ cache: true }}
            trigger={<span className="text-[14px] text-[#07f] cursor-pointer ml-[8px]">查看案例</span>}
            align="b"
          >
            <img
              src="https://img.alicdn.com/imgextra/i1/O1CN01qbilEI1VckA7uieSR_!!6000000002674-2-tps-416-248.png"
              alt=""
              style={{ width: '416px', height: '248px', display: 'block' }}
            />
          </Tooltip>
        </div>
      )}

      {/* Tab内容 */}
      <Tab defaultActiveKey="En">
        {TAB_CONFIG.map((item) => (
          <Tab.Item title={item.title} key={item.key}>
            {renderTabContent(item)}
          </Tab.Item>
        ))}
      </Tab>
    </div>
  );
};