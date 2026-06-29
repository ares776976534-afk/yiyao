import React, { useState, useRef, useEffect } from 'react';
import { Table, Button, Balloon, Divider, Pagination, Icon, Loading } from '@alifd/next';
import { TIME_RANGE, itemMap, videoIntro } from '@/pages/AliExpress/enums';
import SearchFilter from './SearchFilter';
import filterSchema from './filterSchema';
import QualificationsDialog from '@/pages/Select/components/QualificationsDialog';
import { querySignAgreement } from '@/pages/CrossBorderOfferlist/api';
import AeJitDialog from '@/pages/CrossBorderOfferlist/components/AeJitDialog';
import './itemTable.scss';
import { queryAeOnSaleItems, queryNotAeOnSaleItems, signUp, canSellerSelfApply } from '../services';
import Message from '@/components/UI/Message';
import PieceWeightDialog from '@/pages/Select/components/PieceWeightDialog';
import ListingReminder from './ListingReminder';
import fatigue from '@alife/1688-chain-fatigue';
import OperationVideoDialog from '@/components/OperationVideoDialog';
import DescribeDom from '@/pages/AliExpress/components/DescribeDom';

const openUrl = (itemId) => {
  window.open(`https://offer-new.1688.com/page/publish.html?offerId=${itemId}`);
};
const successImg = 'https://img.alicdn.com/imgextra/i1/O1CN01HbJC6W1ihrZXhgOXQ_!!6000000004445-2-tps-32-32.png';
const errorImg = 'https://img.alicdn.com/imgextra/i2/O1CN01LGq2TY1mt5kHWKCy7_!!6000000005011-2-tps-32-32.png';

function OrderTable() {
  const allSelectedRowKeysRef = useRef([]);
  const [selectedRowKey, setSelectedRowKey] = useState([]);
  const [params, setParams] = useState({});
  const [pageNum, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalNum, setTotalNum] = useState(1);
  const [notAeOnSaleItems, setNotAeOnSaleItems] = useState([]);
  const [aeOnSaleItems, setAeOnSaleItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('notOnSale');
  const [active, setActive] = useState('data7d');
  const isTable = activeTab === 'notOnSale';
  const isOrderCnt7d = active === 'data7d';
  const isGmv7d = active === 'data7d';
  const [visible, setVisible] = useState(false);
  const [isBtn, setIsBtn] = useState(true);
  // 商品信息
  const orderInfoRender = (value, index, record) => {
    const { picUrl = '', title = '', itemId = '', tag = '' } = record;
    const hasImage = !!picUrl; // 是否有图片
    return (
      <div className="flex">
        {hasImage && (<img className="rounded-[6px] w-[60px] h-[60px] mr-[8px] " src={picUrl} alt="img" />)}
        <div>
          {title.length < 12 ? (
            <div className={'w-[260px] text-[14px] text-[#333] text-ellipsis line-clamp-1'}>{title}</div>
          ) : (
            <Balloon.Tooltip
              trigger={<div className="w-[260px] text-[14px] text-[#333] text-ellipsis line-clamp-1">{title}</div>}
              align="t"
              popupStyle={{ backgroundColor: '#333' }}
              popupClassName="products-business-tooltips"
            >
              <span className="text-[14px] text-[#fff]">{title}</span>
            </Balloon.Tooltip>
          )}
          <div className="text-[#999] text-[13px] mt-[4px]">ID：{itemId}</div>
          {tag && <div className="py-[2px] px-[4px] rounded-[4px] bg-[#fff] text-[10px] text-[#999] leading-[12px] inline-table" style={{ border: '1px solid #E5E5E5' }}>{tag}</div>}
        </div>
      </div>
    );
  };
  // 速卖通上架条件
  const listingConditionsRender = (value, index, record) => {
    const { conditionList = [], itemId = '' } = record;
    const groupedItems = [];
    for (let i = 0; i < conditionList.length; i += 2) {
      groupedItems.push(conditionList.slice(i, i + 2));
    }
    const handleAction = (actionCode) => {
      switch (actionCode) {
        case 'FULL_LV4_ADDRESS':
        case 'SUPPORT_SML':
        case 'SUPPORT_YJQP':
        case 'SELLABLE_STOCK':
          openUrl(itemId);
          break;
        case 'PWS_DEMAND':
          PieceWeightDialog.open({ records: { imageUrl: record?.picUrl, ...record }, onActionOk: () => getData() });
          break;
        default:
          break;
      }
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {groupedItems.map((group, i) => (
          <div key={i} style={{ display: 'flex', gap: 0 }}>
            {group.map(({ isPass = false, desc = '', actionDesc = '', code = '', detailDesc = '' }, idx) => (
              <div key={idx} className="leading-[17px] text-[14px] flex items-center ae-listing-conditions" style={{ flexBasis: '50%', ...(idx === 1 && { marginLeft: '40px' }) }}>
                <img src={isPass ? successImg : errorImg} className="w-[16px] h-[16px] mr-[4px]" alt="" srcSet="" />
                <div className="mr-[4px]">{desc}</div>
                {detailDesc && (
                  <Balloon.Tooltip
                    trigger={<Icon type="help" className="text-[#BBB]" />}
                    align="t"
                    popupStyle={{ backgroundColor: '#333' }}
                    popupClassName="products-business-tooltips"
                  >
                    {detailDesc}
                  </Balloon.Tooltip>
                )}
                {actionDesc && (
                  <Button
                    text
                    type="primary"
                    className="ml-[4px]"
                    onClick={() => handleAction(code)}
                  >
                    {actionDesc}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  // 库存
  const inventoryRender = (value, index, record) => {
    const { isLowStock, itemId = '' } = record;
    return (
      <div className="text-center">
        <div className="text-[#333] text-[14px] mb-[4px]">
          {value}
        </div>
        {isLowStock && (
          <>
            <div className="text-[#FF7300] text-[14px] mb-[4px]">库存即将售空，请补充库存</div>
            <div className="text-[#0077FF] teext-[14px] cursor-pointer" onClick={() => openUrl(itemId)}>去补充</div>
          </>
        )}
      </div>
    );
  };
  // 商品成交订单
  const orderDealRender = (value, index, record) => {
    return (
      <div className="text-[#333] text-[14px]">
        {isOrderCnt7d ? record?.orderCnt7d : record?.orderCnt30d}
      </div>
    );
  };
  // 商品成交GMV
  const orderGmvRender = (value, index, record) => {
    return (
      <div className="text-[#333] text-[14px]">
        {isGmv7d ? record?.gmv7d : record?.gmv30d}
      </div>
    );
  };
  const navigateWithQueryParams = ({ itemId }) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('itemId', itemId);
    const { origin, search } = currentUrl;
    window.location.href = `${origin}/app/channel-fe/chain-work/crossbordermaterials.html${search}`;
  };
  useEffect(() => {
    fatigue.get('Listing-supply-balloon-fatigue', { mtop: false })
      .then((res) => {
        const { success, result } = res;
        if (success && result) {
          setVisible(result?.expire < Date.now());
        } else {
          setVisible(true);
        }
      });
  }, [visible]);
  const onDialog = () => {
    setVisible(false);
  };
  // 操作
  const operationRender = (value, index, record) => {
    const { itemId } = record;
    function actionHandleClick(actionCode) {
      switch (actionCode) {
        case 'EDIT_KJSC': // 编辑跨境素材
          navigateWithQueryParams({ itemId });
          break;
        case 'MANAGE_CERT': // 管理资质证书
          QualificationsDialog.open({
            records: record,
            onActionOk: () => getData(),
          });
          break;
        case 'SIGN_UP': // 申请上架
          querySignAgreement({ agreementEnum: 'AE' }).then((res) => {
            if (!res?.content?.data) {
              AeJitDialog.open({ callback: () => {
                getData();
                ListingReminder.open({
                  fn: () => {
                    OperationVideoDialog.open({ video: videoIntro, content: <DescribeDom /> });
                    getData();
                  },
                  offerIds: [itemId],
                  onDialog,
                });
              } });
            } else if (visible) {
              ListingReminder.open({ fn: () => getData(), offerIds: [itemId], onDialog });
            } else {
              signUp(JSON.stringify({ offerIds: [itemId], signUpSource: 'SELF_APPLY' })).then((r) => {
                if (r?.success) {
                  Message._show({ content: '申请成功', type: 'success' });
                  getData();
                } else {
                  Message._show({ content: r?.msg || '请求失败' || r?.errorInfo, type: 'error' });
                }
              }).catch((err) => {
                Message._show({ content: err.errorMessage || '请求失败', type: 'error' });
              });
            }
          });
          break;
        default:
          console.log('未知操作', actionCode);
          break;
      }
    }
    return (
      <div className="flex flex-col items-start">
        {record?.action?.map(({ code, name, isActive }) => {
          return (
            <Button
              type="primary"
              onClick={() => actionHandleClick(code)}
              text
              key={code}
              style={{ marginBottom: 8 }}
              disabled={!isActive}
            >
              {name}
            </Button>
          );
        })}
      </div>
    );
  };
  const handleRowSelectionChange = (selectedRowKeys) => {
    allSelectedRowKeysRef.current = selectedRowKeys;
    setSelectedRowKey([...new Set([...selectedRowKeys, ...allSelectedRowKeysRef.current])]);
  };
  const hanldeSetParams = (_params) => {
    setParams(_params);
    setPageNo(1);
  };
  const onTabFilter = (key) => {
    setActiveTab(key);
  };
  const handlePageNoChange = (_current) => {
    setPageNo(_current);
  };
  const getData = () => {
    setLoading(true);
    if (isTable) {
      queryNotAeOnSaleItems({ ...params, pageNum, pageSize }).then((res) => {
        const { msg = '数据加载失败', list = [], success = false, total = 0 } = res;
        if (success) {
          setTotalNum(total);
          setLoading(false);
          setPageNo(res?.pageNum);
          setNotAeOnSaleItems(list);
        } else {
          setLoading(false);
          Message._show({ content: msg, type: 'error' });
        }
      });
    } else {
      queryAeOnSaleItems({ ...params, pageNum, pageSize }).then((res) => {
        const { msg = '数据加载失败', list = [], success = false, total = 0 } = res;
        if (success) {
          setTotalNum(total);
          setLoading(false);
          setPageNo(res?.pageNum);
          setAeOnSaleItems(list);
        } else {
          setLoading(false);
          Message._show({ content: msg, type: 'error' });
        }
      });
    }
  };
  useEffect(() => {
    getData();
  }, [pageNum, params, pageSize]);
  // 批量操作
  const handleBatchOperation = () => {
    querySignAgreement({ agreementEnum: 'AE' }).then((res) => {
      if (!res?.content?.data) {
        AeJitDialog.open({ callback: () => {
          OperationVideoDialog.open({ video: videoIntro, content: <DescribeDom /> });
          getData();
        } });
      } else if (visible) {
        ListingReminder.open({ fn: () => getData(), offerIds: allSelectedRowKeysRef.current, onDialog });
      } else {
        signUp(JSON.stringify({ offerIds: allSelectedRowKeysRef.current, signUpSource: 'SELF_APPLY' })).then((r) => {
          if (r?.success) {
            Message._show({ content: '申请成功', type: 'success' });
            getData();
          } else {
            Message._show({ content: r?.msg || '请求失败' || r?.errorInfo, type: 'error' });
          }
        }).catch((err) => {
          Message._show({ content: err.errorMessage || '请求失败', type: 'error' });
        });
      }
    });
  };
  const hasActiveSignUp = (model) => {
    return model.some((modelItem) =>
      modelItem.action.some((actionItem) =>
        actionItem.code === 'SIGN_UP' && actionItem.isActive === true));
  };
  useEffect(() => {
    canSellerSelfApply().then((res) => {
      const { success, msg, model } = res;
      if (success) {
        setIsBtn(model);
      } else {
        Message._show({ content: msg, type: 'error' });
      }
    });
  }, []);
  return (
    <>
      <SearchFilter filters={filterSchema()} activeTab={activeTab} hanldeSetParams={hanldeSetParams} tabItem={itemMap} onTabFilter={onTabFilter} />
      <div className="p-[20px] bg-[#fff] rounded-[6px] mt-[16px]">
        <div className="item-list">
          {isTable && isBtn && (<Button type="primary" disabled={!selectedRowKey?.length} style={{ marginBottom: '16px' }} onClick={handleBatchOperation}>批量上架速卖通</Button>)}
          <Loading tip="加载中..." visible={loading}>
            <Table
              dataSource={isTable ? notAeOnSaleItems : aeOnSaleItems}
              tableLayout="fixed"
              primaryKey="itemId"
              rowSelection={isTable && {
                onChange: handleRowSelectionChange,
                selectedRowKeys: selectedRowKey,
                columnProps: () => {
                  return {
                    width: 34,
                  };
                },
                getProps: (record) => {
                  return {
                    disabled: !record?.action?.some((item) => item?.code === 'SIGN_UP' && item?.isActive === true),
                  };
                },
                titleProps: () => {
                  return {
                    disabled: !hasActiveSignUp(isTable ? notAeOnSaleItems : aeOnSaleItems),
                  };
                },
              }}
            >
              <Table.Column title="商品信息" width={270} cell={orderInfoRender} />
              {isTable && <Table.Column title="速卖通上架条件" dataIndex="specInfo" width={572} cell={listingConditionsRender} />}
              {!isTable && <Table.Column title="库存" dataIndex="stock" align="center" width={200} cell={inventoryRender} />}
              {!isTable && (
              <Table.ColumnGroup
                title={
                  <div className="w-[100%] text-center">
                    <span className="mr-[16px] text-[14px] text-[#333] font-medium">AE渠道销量信息</span>
                    {TIME_RANGE.map((ele, i) => (
                      <span key={ele.key}>
                        <span
                          onClick={() => setActive(ele.key)}
                          className={`text-[12px] ${active === ele.key ? 'text-[#0077FF]' : 'text-[#666]'} cursor-pointer`}
                        >
                          {ele.title}
                        </span>
                        {TIME_RANGE.length - 1 !== i && <Divider direction="ver" className="h-[16px] mx-[16px]" />}
                      </span>
                    ))}
                  </div>
        }
                dataIndex="productData"
                width="420px"
                align="center"
              >
                <Table.Column title="商品成交订单" dataIndex="orderDeal" align="center" width={200} cell={orderDealRender} />
                <Table.Column title="商品成交GMV（元）" dataIndex="orderGmv" align="center" width={220} cell={orderGmvRender} />
              </Table.ColumnGroup>
              )}
              <Table.Column title="操作" dataIndex="operation" width={120} cell={operationRender} />
            </Table>
          </Loading>
        </div>
        <div className="mt-[32px] flex justify-end">
          <Pagination
            current={pageNum}
            pageSize={pageSize}
            total={totalNum}
            onChange={handlePageNoChange}
          />
        </div>
      </div>
    </>
  );
}

export default OrderTable;
