import React, { useState, useEffect } from 'react';
import { Table, Pagination, Button, Field, Form, Select, Input, Grid, Message } from '@alifd/next';
import './index.scss';
import { columnConfigs } from './clumns';
import SubmitBusinessDialog from '../SubmitBusinessDialog';
import { getRecordsList } from '@/pages/ProductsBidding/api';
import FailureDialog from '@/pages/ProductsBidding/components/ToolTipDialog/FailureDialog';
import SuccessDialog from '@/pages/ProductsBidding/components/ToolTipDialog/SuccessDialog';
import { sendLogger } from '@/pages/ProductsBidding/utils';

const { Row, Col } = Grid;

const formItemLayout = {
  labelCol: { fixSpaned: 3 },
};

function MyReportedContent({ loadData, handleTanChange }) {
  const [pageSize, setPageSize] = useState(10); // 假设默认每页显示10条记录
  const [currentPage, setCurrentPage] = useState(1); // 当前页
  const [total, setTotal] = useState(0); // 总条目数量
  const [biddingList, setBiddingList] = useState([]); // 提报列表数据存储
  const [biddingEditData, setBiddingEditData] = useState([]); // 提报弹窗数据
  const [tableLoading, setTableLoading] = useState(false); // 加载
  const field = Field.useField();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toolTipState, setToolTipState] = useState({});

  const showModal = (props) => {
    setBiddingEditData(props); // 弹窗数据
    setIsModalVisible(true);
  };

  // 获取提报数据
  const getData = async (resetPage = false) => {
    if (resetPage) {
      setCurrentPage(1);
    }
    setTableLoading(true);
    try {
      const values = field.getValues();
      const params = {
        pageNum: resetPage ? 1 : currentPage,
        pageSize,
        jingjiaType: '跨境工作台-大客',
      };
      const additionalParams = {
        ...(values?.status && { status: values?.status }),
        ...(values?.itemName && { itemName: values?.itemName }),
        ...(values?.itemId && { itemId: values?.itemId }),
      };
      const res = await getRecordsList({ ...params, ...additionalParams });
      if (res && res?.data) {
        setBiddingList(res?.data);
        setTotal(Number(res?.total));
      }
      setTableLoading(false);
    } catch (error) {
      Message.error(error?.errorMessage);
    }
    sendLogger('search');
  };

  const onPaginationChange = (_current) => {
    setCurrentPage(_current);
  };

  const onPageSizeChange = (_pageSize) => {
    setPageSize(_pageSize);
  };

  const handleReset = () => {
    field.reset();
  };

  const handleSearch = () => {
    getData(true);
  };

  const updateParentState = (newState) => {
    setToolTipState(newState);
  };

  const handleSuccessRedirect = () => {
    handleTanChange('subtab3');
  };

  useEffect(() => {
    const fetchData = () => {
      setTableLoading(true);
      if (loadData === 'subtab4') {
        getData();
      }
    };
    fetchData();
    return () => {
      setTableLoading(false);
    };
  }, [loadData, currentPage, pageSize]);

  return (
    <div className="joined-bcproducts-table">
      <div className="table-top">
        <div className="filter">
          <div className="searchFilter">
            <Form inline field={field} {...formItemLayout}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label="提报结果"
                    name="status"
                  >
                    <Select
                      placeholder="请选择"
                      style={{ width: '100%' }}
                      dataSource={[
                        { value: 'checking', label: '竞价中' },
                        { value: 'active', label: '竞价成功' },
                        { value: 'refused', label: '竞价失败' },
                      ]}
                      hasClear
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="商品名称"
                    name="itemName"
                  >
                    <Input className="searchInput" placeholder="请输入商品名称" hasClear />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="商品ID"
                    name="itemId"
                  >
                    <Input className="searchInput" placeholder="请输入商品ID" hasClear />
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
        columns={columnConfigs(showModal)}
        className="bidding-table"
        loading={tableLoading}
        emptyContent={<div className="bidding-table-empty">暂无数据</div>}
        primaryKey={biddingList?.itemId}
      />
      <div className="pagination-content">
        <Pagination
          pageSizeSelector="dropdown"
          current={currentPage}
          total={total || 0}
          onChange={onPaginationChange}
          onPageSizeChange={onPageSizeChange}
          pageSize={pageSize}
        />
      </div>
      <SubmitBusinessDialog
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        biddingEditData={biddingEditData}
        operationType={'modify'}
        getData={getData}
        updateParentState={updateParentState}
      />
      <FailureDialog
        visible={toolTipState.failureOpen}
        setVisible={toolTipState.setFailureOpen}
        operationType={'modify'}
        failureReason={toolTipState.failureReason}
      />
      <SuccessDialog
        visible={toolTipState.successOpen}
        setVisible={toolTipState.setSuccessOpen}
        operationType={'modify'}
        onRedirect={handleSuccessRedirect}
      />
    </div>
  );
}

export default MyReportedContent;
