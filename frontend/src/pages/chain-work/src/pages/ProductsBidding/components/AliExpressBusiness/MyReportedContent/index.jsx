import React, { useState, useEffect } from 'react';
import { Table, Pagination, Button, Field, Form, Select, Input, Grid, Message, Balloon, Icon } from '@alifd/next';
import moment from 'moment';
import { getRecordsList, queryOtherSku } from '@/pages/ProductsBidding/api';
import ProgressiveImage from '@/components/ProgressiveImage';
import SubmitBusinessDialog from '@/pages/ProductsBidding/components/AliExpressBusiness/SubmitBusinessDialog';
import FailureDialog from '@/pages/ProductsBidding/components/ToolTipDialog/FailureDialog';
import SuccessDialog from '@/pages/ProductsBidding/components/ToolTipDialog/SuccessDialog';
import columns from './clumns';
import { BidStatus, StatusColors, StatusTextMap, ProductStatusColors } from '@/pages/ProductsBidding/enums';
import { sendLogger, aeJingjiaType } from '@/pages/ProductsBidding/utils';
import SkuCard from '@/pages/ProductsBidding/components/AliExpressBusiness/MyReportedContent/components/SkuCard';
import './index.scss';

const { Row, Col } = Grid;
const formItemLayout = {
  labelCol: { fixSpaned: 3 },
};

function MyReportedContent({ loadData, handleTanChange, configurationData, sellerTypeChecked, setSellerTypeChecked }) {
  const [currentPage, setCurrentPage] = useState(1); // 当前页
  const [pageSize, setPageSize] = useState(10); // 假设默认每页显示10条记录
  const [total, setTotal] = useState(0); // 总条目数量
  const [biddingList, setBiddingList] = useState([]); // 提报列表数据存储
  const [loading, setLoading] = useState(false); // 加载
  const [params, setParams] = useState({});
  const field = Field.useField();
  const [toolTipState, setToolTipState] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 获取提报数据
  const getData = () => {
    setLoading(true);

    const _params = {
      pageNum: currentPage,
      pageSize,
      jingjiaType: aeJingjiaType,
      ...params,
    };

    getRecordsList(_params)
      .then((res) => {
        if (res?.data) {
          const _biddingList = (res.data || []).map((item, index) => {
            const { skuRecord, oppMsg } = item;
            let oppMsgObj = {};
            try {
              oppMsgObj = JSON.parse(oppMsg);
            } catch (error) {
              console.log(error);
            }

            let _skuRecord = [
              {
                skuId: String(item.skuId),
                price: item.price,
                stock: item.stock,
                skuOpp: {
                  ...oppMsgObj,
                  opp_property: oppMsgObj.property,
                  goal_price: oppMsgObj.goal_price ? (Number(oppMsgObj.goal_price) / 100).toFixed(2) : '',
                  img_url: oppMsgObj.img_url,
                },
              },
            ];
            try {
              _skuRecord = JSON.parse(skuRecord);
            } catch (error) {
              console.log(error);
            }
            return {
              ...item,
              ...oppMsgObj,
              children: _skuRecord.map((skuInfo) => {
                return {
                  ...skuInfo,
                  itemName: item.itemName,
                  itemId: item.itemId,
                };
              }),
            };
          });
          setBiddingList(_biddingList);
          setTotal(Number(res?.total));
        }
      })
      .catch((error) => {
        Message.error(error?.errorMessage || '服务异常');
      })
      .finally(() => {
        setLoading(false);
      });
    sendLogger('search');
  };

  const handleRefresh = () => {
    currentPage === 1 ? getData() : setCurrentPage(1);
  };
  const getStatusInfo = (status, distributeHistoryFailStatus) => {
    if (distributeHistoryFailStatus) {
      return {
        statusText: StatusTextMap['AUDIT_FAILED'],
        dotColorClass: StatusColors[BidStatus['AUDIT_FAILED']],
      };
    }
    const statusKey = Object.keys(BidStatus).find((key) => BidStatus[key] === status);
    if (statusKey) {
      return {
        statusText: StatusTextMap[statusKey],
        dotColorClass: StatusColors[BidStatus[statusKey]],
      };
    }
    return {
      statusText: '',
      dotColorClass: '',
    };
  };

  const openDialog = async (record) => {
    try {
      // 调用接口查询其他 SKU
      const res = await queryOtherSku({
        request: { itemId: String(record?.itemId), skuRecord: record?.skuRecord },
      });

      setDialogVisible(true);
      setSelectedRecord(res);
    } catch (error) {
      Message.error(error?.msg || '服务异常');
    }
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setSelectedRecord(null);
  };

  const groupHeaderRender = (record) => {
    const {
      imgUrl,
      itemName,
      itemId,
      status,
      id,
      gmtCreate,
      oppMsg,
      children,
      aeItemStatus,
      distributeHistoryFailStatus,
      distributeUpdateFailedStatus,
    } = record;
    const { statusText, dotColorClass } = getStatusInfo(status, distributeHistoryFailStatus);
    // const statusValue = Object.keys(BidStatus)?.find((key) => BidStatus[key] === status);
    // const statusText = statusText = StatusTextMap[statusValue];
    // const dotColorClass = dotColorClass = StatusColors[BidStatus[statusValue]];
    const linkUrl = `https://detail.1688.com/offer/${itemId}.html`;
    const dateTimeStr = moment(gmtCreate).format('YYYY-MM-DD HH:mm');
    let oppMsgObj = {};
    try {
      oppMsgObj = JSON.parse(oppMsg);
    } catch (error) {
      console.log(error);
    }
    const modifyReportingButton = (
      <SubmitBusinessDialog
        trigger={
          <div className="operator-btn" key="modifyReporting">
            修改提报
          </div>
        }
        operationType="modify"
        record={{
          ...record,
          item_name: itemName,
          sku_img: imgUrl,
          target_product_counts: oppMsgObj.target_product_counts,
          sku_map_json: children.map((item) => {
            const { skuOpp, skuId, price, stock } = item;
            return {
              ...skuOpp,
              sku_id: skuId,
              price: (Number(price) / 100).toFixed(2),
              stock,
            };
          }),
        }}
        configurationData={configurationData}
        updateParentState={updateParentState}
        sellerTypeChecked={sellerTypeChecked}
        setSellerTypeChecked={setSellerTypeChecked}
        getData={handleRefresh}
      />
    );
    const replenishButton =
      status === 'active' ? (
        <>
          <div className="operator-btn" onClick={handleJump}>
            去补货
          </div>
          <div className="operator-btn" onClick={() => openDialog(record)}>
            其他sku
          </div>
        </>
      ) : null;

    return (
      <table className="next-table-row multiple-sku-table" key={id}>
        <colgroup>
          {columns.map((item) => (
            <col style={{ width: item.width }} />
          ))}
        </colgroup>
        <tbody>
          <tr>
            <td colSpan={columns.length - 4}>
              <div className="next-table-cell-wrapper">
                <div className="group-opportunity-header">
                  <a href={linkUrl} target="_blank" rel="noreferrer">
                    <div className="opportunity-img">
                      <ProgressiveImage src={imgUrl} />
                    </div>
                  </a>
                  <div className="opportunity-content">
                    <div className="opportunity-title-container">
                      <div className="opportunity-tag">速卖通爆品</div>
                      <div className="opportunity-title" title={itemName}>
                        {itemName}
                      </div>
                    </div>
                    <div className="opportunity-desc">
                      <div>
                        <span>ID：</span>
                        <span>{itemId}</span>
                      </div>
                      <div>
                        <span>平台发货</span>
                        <span className="divider" />
                        <span>平台上门揽</span>
                      </div>
                      <div>
                        <span>提报时间：</span>
                        <span>{dateTimeStr}</span>
                      </div>
                      <div>
                        <span>提报ID：</span>
                        <span>{id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td colSpan={2}>
              <div className="next-table-cell-wrapper text-[#ff7300]">
                <div className="submit-result-cell textInfo pl-[11%]">
                  {aeItemStatus && '修改已提交，请稍后查看提报结果'}
                  {distributeUpdateFailedStatus && StatusTextMap['Modification_FAILED']}
                </div>
              </div>
            </td>
            <td>
              <div className="next-table-cell-wrapper">
                <div className="submit-result-cell">
                  <span className={`result-cell ${dotColorClass}`} />
                  {statusText}
                </div>
              </div>
            </td>
            <td>
              <div className="next-table-cell-wrapper">
                {replenishButton}
                {modifyReportingButton}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const handleJump = () => {
    window.open('https://work.1688.com/?_path_=gonghuotuoguan/cross_boarder_2/bh_management');
  };

  const onPaginationChange = (_current) => {
    setCurrentPage(_current);
  };

  const onPageSizeChange = (_pageSize) => {
    setPageSize(_pageSize);
  };

  const handleReset = () => {
    field.resetToDefault();
    setParams({});
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setParams(field.getValues());
  };

  const updateParentState = (newState) => {
    setToolTipState(newState);
  };

  const handleSuccessRedirect = () => {
    handleTanChange('subtab1');
  };

  useEffect(() => {
    if (loadData === 'subtab2') {
      getData();
    }
  }, [loadData, params, currentPage, pageSize]);

  return (
    <div className="aeproducts-reported-container">
      <div className="table-top">
        <div className="filter">
          <div className="searchFilter">
            <Form inline field={field} {...formItemLayout}>
              <Row>
                <Col span={8}>
                  <Form.Item label="提报结果" name="status">
                    <Select
                      dataSource={[
                        { value: 'checking', label: '竞价中' },
                        { value: 'active', label: '报名成功' },
                        { value: 'refused', label: '竞价失败' },
                      ]}
                      hasClear
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="商品名称" name="itemName">
                    <Input placeholder="请输入商品名称" hasClear />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="商品ID" name="itemId">
                    <Input placeholder="请输入商品ID" hasClear />
                  </Form.Item>
                </Col>
              </Row>
              <Row className="searchButtonRow">
                <Form.Item className="searchButtons">
                  <Button type="primary" onClick={handleSearch}>
                    查询
                  </Button>
                  <Button className="Btn" onClick={handleReset}>
                    重置
                  </Button>
                </Form.Item>
              </Row>
            </Form>
          </div>
        </div>
      </div>
      <Table
        dataSource={biddingList}
        hasBorder={false}
        columns={columns}
        className="bidding-table"
        loading={loading}
        emptyContent={<div className="bidding-table-empty">暂无数据</div>}
        primaryKey={biddingList?.itemId}
      >
        <Table.GroupHeader cell={groupHeaderRender} />
      </Table>
      <div className="pagination-content">
        <Pagination
          pageSizeSelector="dropdown"
          current={currentPage}
          total={total || 0}
          onChange={onPaginationChange}
          onPageSizeChange={onPageSizeChange}
          pageSize={pageSize}
          hideOnlyOnePage
        />
      </div>
      <FailureDialog
        visible={toolTipState.failureOpen}
        setVisible={toolTipState.setFailureOpen}
        operationType={'modify'}
        failureReason={toolTipState.failureReason}
        callbackFn={handleRefresh}
      />
      <SuccessDialog
        visible={toolTipState.successOpen}
        setVisible={toolTipState.setSuccessOpen}
        operationType={'modify'}
        onRedirect={handleSuccessRedirect}
        callbackFn={handleRefresh}
      />
      {dialogVisible && <SkuCard skus={selectedRecord} onClose={closeDialog} />}
    </div>
  );
}

export default MyReportedContent;
