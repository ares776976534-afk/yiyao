import React, { useState } from 'react';
import { Dialog, Button } from '@alifd/next';
import ReactDOM from 'react-dom';
import schema from './qualificationsSchema';
import CommonTable from '@/components/CommonTable';
import './QualificationsDialog.scss';
import CategoryProductsDialog from './CategoryProductsDialog';
import { fetchPageQueryCertInfo, fetchRelateCertificate, fetchCancelRelateCertificate } from '@/pages/Select/services';
import { Logger, MessageError, MessageSuccess } from '@/utlis';

const container = document.createElement('div');

function QualificationsDialog(props) {
  const { records, onActionOk } = props.callback;
  const [visible, setVisible] = useState(true);
  const [isFetch, setIsFetch] = useState(false);
  const [categoryProductsVisible, setCategoryProductsVisible] = useState(false);
  const dialogRef = React.createRef();
  const [newRecords, setNewRecords] = useState({});

  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    setVisible(false);
    isFetch && onActionOk();
  };
  const fetchListData = (value) => {
    return new Promise((resolve) => {
      fetchPageQueryCertInfo({
        ...value,
        certificateNameOrNumber: value?.certificateNameOrNumber || undefined,
        certCountryAbbrNames: value?.certCountryAbbrNames || undefined,
        itemId: records?.itemId,
        isRelated: value?.currentStatus,
        categories: value?.categories ? JSON.parse(value?.categories || '[]') : undefined,
      }).then((res) => {
        resolve(res);
      });
    });
  };
  const onReviewProgress = () => {
    window.open(
      'https://work.1688.com/?spm=a2638g.u_4_1016.0.d80lj1nlfy.1a6f1768vNkHII&_path_=gonghuotuoguan/2017sellerbase_winport/member_infopage_manage',
      '_blank',
    );
  };
  const onUploadCertificate = () => {
    window.open('https://work.1688.com/?_path_=gonghuotuoguan/2017sellerbase_winport/zhengshubianji&type=add&category=offer', '_blank');
  };
  const statusFilterExtra = (
    <div>
      <Button type="primary" text className="mr-[12px]" onClick={onReviewProgress}>查看证书审核进度</Button>
      <Button type="primary" text onClick={onUploadCertificate}>上传证书</Button>
    </div>
  );
  const onBindClick = (text, f) => {
    return Logger.report({ c: records?.itemId, d: 'OTHER', e: `@source_3去优化提交@divert_${text}@funnel_优化任务`, f });
  };
  // 解绑
  const onUnbindClick = (record, fn) => {
    fetchCancelRelateCertificate({
      itemId: records?.itemId,
      certificateInfoIds: [record.certificateInfoId],
    }).then((res) => {
      const { model } = res;
      if (model) {
        onBindClick('解绑', '成功');
        setIsFetch(true);
        MessageSuccess('解绑成功');
        return new Promise(() => {
          fn();
        });
      }
    }).catch((err) => {
      onBindClick('解绑失败', '失败');
      MessageError(err.message);
    });
  };
  const queryRelateCertificate = (itemId, certificateInfoIds, itermIdType, text, fn) => {
    fetchRelateCertificate({
      itemId,
      itermIdType,
      certificateInfoIds,
    }).then((res) => {
      const { model } = res;
      if (model) {
        onBindClick(text, '成功');
        setIsFetch(true);
        MessageSuccess(`${text}成功`);
        return new Promise(() => {
          fn();
        });
      }
    }).catch((err) => {
      onBindClick(text, '失败');
      MessageError(err.message);
    });
  };
  // 关联该商品
  const onCurrentProductClick = (record, fn) => {
    queryRelateCertificate(records?.itemId, [record?.certificateInfoId], 1, '关联该商品', fn);
  };
  // 关联类目商品确认
  const onCategoryProductsOk = (config) => {
    const { record, fn } = config;
    queryRelateCertificate(records?.offerCategory?.categoryId, [record?.certificateInfoId], 2, '关联类目商品', fn);
    setCategoryProductsVisible(false);
  };
  // 关联类目商品打开
  const onCategoryProductsClick = (record, fn) => {
    setNewRecords({
      record,
      fn,
    });
    setCategoryProductsVisible(true);
  };
  const handleActionClick = ({ type, record }, fn) => {
    switch (type) {
      case 'unbind':
        onUnbindClick(record, fn);
        break;
      case 'currentProduct':
        onCurrentProductClick(record, fn);
        break;
      case 'categoryProducts':
        onCategoryProductsClick(record, fn);
        break;
      default:
        break;
    }
  };

  // 类目
  const buildCategoryPath = (category) => {
    const path = [];
    let currentCategory = category;
    while (currentCategory && currentCategory.parentCategory) {
      if (currentCategory.parentCategory.categoryId !== undefined) {
        path.push(currentCategory.categoryName);
        currentCategory = currentCategory.parentCategory;
      } else {
        break;
      }
    }
    if (currentCategory) {
      path.push(currentCategory.categoryName);
    }
    return path.reverse().filter(Boolean).join('>');
  };

  return (
    <Dialog
      ref={dialogRef}
      v2
      title="资质证书管理"
      onClose={onClose}
      visible={visible}
      footer={false}
      style={{ height: '640px', width: '1000px', maxHeight: 'none' }}
      className="qualificationsDialog"
    >
      <div className="mt-[12px] mb-[16px] text-[14px] text-[#3D3D3D]">
        <span className="mr-[16px]">商品名称：{records?.title || '-'}</span>
        <span className="mr-[16px]">商品ID：{records?.itemId || '-'}</span>
        <span>类目：{buildCategoryPath(records?.offerCategory) || '-'}</span>
      </div>
      <CommonTable
        schema={schema}
        searchFilterType="3"
        listQueryFn={fetchListData}
        getStatusFnOrStatusList={[
          { name: '已关联证书', code: '1' },
          { name: '未关联证书', code: '2' },
        ]}
        statusFilterType={{ shape: 'wrapped', type: 1 }}
        showSearchAction={false}
        statusFilterExtra={statusFilterExtra}
        onActionComplete={handleActionClick}
        otherPagination={{
          type: 'simple',
          shape: 'arrow-only',
        }}
        pageSizeSelector={false}
        otherAttributes={
          {
            useVirtual: true,
            maxBodyHeight: 312,
          }
        }
      />
      <CategoryProductsDialog
        visible={categoryProductsVisible}
        onClose={() => setCategoryProductsVisible(false)}
        onOk={() => onCategoryProductsOk(newRecords)}
        name={buildCategoryPath(records?.offerCategory) || '-'}
      />
    </Dialog>
  );
}

QualificationsDialog.open = (callback) => {
  ReactDOM.render(<QualificationsDialog callback={callback} />, container);
};

export default QualificationsDialog;
