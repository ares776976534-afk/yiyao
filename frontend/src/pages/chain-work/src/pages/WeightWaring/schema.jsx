import React from 'react';
import { Balloon, Button } from '@alifd/next';
import PieceWeightDialog from '@/pages/Select/components/PieceWeightDialog';
import BallonTooltip from '@/pages/ManufacturerInfoManagement/components/BallonTooltip';

// 商品信息
const PRODUCT_INFO = {
  title: '商品信息',
  dataIndex: 'skuId',
  cell: (value, index, record) => {
    const { itemId, title, imageUrl } = record;
    const hasImage = !!imageUrl; // 是否有图片
    return (
      <div className="flex p-[16px]">
        {hasImage && (
        <a
          href={`https://detail.1688.com/offer/${itemId}.html`}
          target="_blank"
          rel="noreferrer"
          style={{ cursor: 'pointer' }}
        >
          <div className="rounded-[6px] w-[60px] h-[60px] mr-[8px]">
            <img className="rounded-[6px]" src={imageUrl} alt="img" />
          </div>
        </a>
        )}
        <div className="flex justify-between w-full">
          <div className="flex flex-col justify-between">
            {title?.length < 8 ? (
              <span className="text-[14px] text-[#333] text-ellipsis line-clamp-2"> {title}</span>
            ) : (
              <Balloon.Tooltip
                trigger={<div className="text-[14px] text-[#333] text-ellipsis line-clamp-2">{title}</div>}
                align="t"
                popupStyle={{ backgroundColor: '#333' }}
                popupClassName="products-business-tooltips"
              >
                <span className="">{title}</span>
              </Balloon.Tooltip>
            )}
            <div className="text-[#999] text-[13px] mt-[4px]">ID：{itemId}</div>
          </div>
        </div>
      </div>
    );
  },
};
// SKU信息
const SKU_INFO = {
  title: 'SKU信息',
  dataIndex: 'skuLabels',
  cell: (value, index, record) => {
    const { attributes = [] } = record;
    return (
      <div className="p-[16px]">
        {attributes?.length > 0 ? (
          <div>
            {attributes[0]?.text && (<BallonTooltip trigger={<div className="text-[14px] text-[#333] text-ellipsis line-clamp-1 cursor-pointer">{attributes[0]?.label}: {attributes[0]?.text}</div>} content={`${attributes[0]?.label}: ${attributes[0]?.text}`} />)}
            {attributes[1]?.text && (<BallonTooltip trigger={<div className="text-[14px] text-[#333] text-ellipsis line-clamp-1 cursor-pointer">{attributes[1]?.label}: {attributes[1]?.text}</div>} content={`${attributes[1]?.label}: ${attributes[1]?.text}`} />)}
          </div>
        ) : '-'}
      </div>
    );
  },
};

// 件重尺信息
const PWS_INFO = {
  title: '件重尺信息',
  dataIndex: 'pwsModels',
  width: 152,
  align: 'center',
  children: [
    {
      title: '数据类型',
      dataIndex: 'dataType',
      alignHeader: 'center',
      width: 98,
      cell: (value, index, record) => (
        <div>
          <div className="p-[16px] text-center">
            <div className="h-[17px]">当前数据</div>
          </div>
          {record?.suggestPws && (
            <div className="p-[16px] bg-[#F5FAFF] text-center">
              <div className="h-[17px]">建议数据</div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '长',
      dataIndex: 'length',
      alignHeader: 'center',
      width: 86,
      cell: (value, index, record) => {
        const { currentPws = {}, suggestPws = {} } = record;
        return (
          <div>
            <div className="p-[16px] text-center">
              <div className="h-[17px]">{currentPws?.length}</div>
            </div>
            {record?.suggestPws && (
            <div className="p-[16px] bg-[#F5FAFF] text-center">
              <div className="h-[17px]">{suggestPws?.length || '-'}</div>
            </div>
            )}
          </div>
        );
      },
    },
    {
      title: '宽',
      dataIndex: 'width',
      alignHeader: 'center',
      width: 86,
      cell: (value, index, record) => {
        const { currentPws = {}, suggestPws = {} } = record;
        return (
          <div>
            <div className="p-[16px] text-center">
              <div className="h-[17px]">{currentPws?.width}</div>
            </div>
            {record?.suggestPws && (
              <div className="p-[16px] bg-[#F5FAFF] text-center">
                <div className="h-[17px]">{suggestPws?.width || '-'}</div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '高',
      dataIndex: 'height',
      alignHeader: 'center',
      width: 86,
      cell: (value, index, record) => {
        const { currentPws = {}, suggestPws = {} } = record;
        return (
          <div>
            <div className="p-[16px] text-center">
              <div className="h-[17px]">{currentPws?.height}</div>
            </div>
            {record?.suggestPws && (
              <div className="p-[16px] bg-[#F5FAFF] text-center">
                <div className="h-[17px]">{suggestPws?.height || '-'}</div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '重量',
      dataIndex: 'weight',
      alignHeader: 'center',
      width: 88,
      cell: (value, index, record) => {
        const { currentPws = {}, suggestPws = {} } = record;
        return (
          <div>
            <div className="p-[16px] text-center">
              <div className="h-[17px]">{currentPws?.weight}</div>
            </div>
            {record?.suggestPws && (
            <div className="p-[16px] bg-[#F5FAFF] text-center">
              <div className="h-[17px]">{suggestPws?.weight || '-'}</div>
            </div>
            )}
          </div>
        );
      },
    },
  ],
};

// 建议数据来源
const SUGGEST_INFO = {
  title: '建议数据来源',
  dataIndex: 'suggestInfo',
  align: 'center',
  width: 116,
  cell: (value, index, record) => {
    const { suggestInfo = null } = record;
    const { dataSourceDesc = '', tips = '' } = suggestInfo || {};
    return (
      <div className="p-[16px] text-center min-w-[116px]">
        {suggestInfo ? (
          <>
            <div>{dataSourceDesc}</div>
            <div className="text-[#999]">{tips}</div>
          </>
        ) : '-'}
      </div>
    );
  },
};
// 操作
const OPERATION = {
  title: '操作',
  dataIndex: 'operation',
  width: 130,
  lock: 'right',
  cell: (value, index, record, { onActionClick = () => { } } = {}) => {
    const onClick = (type) => {
      switch (type) {
        case 'ACCEPT_SUGGEST':
          onActionClick({ type: 'accept', record });
          break;
        case 'IGNORE_SUGGEST':
          onActionClick({ type: 'ignore', record });
          break;
        case 'MANUAL_UPDATE':
          PieceWeightDialog.open({ records: record, onActionOk: () => onActionClick({ type: 'reload', record }) });
          break;
        default:
          break;
      }
    };
    return (
      <div className="px-[16px] py-[12px]">
        {record?.actionList?.map(({ actionDesc = '', actionCode = '' }, i) => (
          <div key={actionCode} className={`${record?.actionList?.length - 1 === i ? '' : 'mb-[8px]'} flex justify-center`}>
            <Button
              {...actionCode === 'ACCEPT_SUGGEST' ? {} : { text: true }}
              key={actionCode}
              type="primary"
              style={actionCode === 'ACCEPT_SUGGEST' ? { fontSize: '12px', height: '24px' } : { fontSize: '14px', height: '17px' }}
              onClick={() => onClick(actionCode)}
            >
              {actionDesc}
            </Button>
          </div>
        ))}
      </div>
    );
  },
};

export default (state) => {
  switch (state) {
    case 'edit-cross-border-materials':
      return [PRODUCT_INFO, SKU_INFO, PWS_INFO, SUGGEST_INFO];
    default:
      return [PRODUCT_INFO, SKU_INFO, PWS_INFO, SUGGEST_INFO, OPERATION];
  }
};
