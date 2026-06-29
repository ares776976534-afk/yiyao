import React, { useState, useEffect } from 'react';
import { Dialog, Pagination, Grid, Balloon } from '@alifd/next';
const { Row, Col } = Grid;

function SkuCard({ skus, onClose }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const handleChange = (page) => {
    setCurrentPage(page);
  };

  const currentPageItems = skus?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const CardContent = ({ sku }) => {
    const { skuImg, skuName, price } = sku;

    return (
      <div className="flex w-[276px] h-[80px] border border-[#E5E5E5] mb-[20px] p-[12px]">
        <img src={skuImg} alt="skuImg" className="w-[56px] h-[56px] mr-[12px]" />
        <div className="flex text-[13px]" style={{ flexDirection: 'column' }}>
          {skuName?.length < 13 ? (
            <div> {skuName}</div>
          ) : (
            <Balloon.Tooltip trigger={<div>{`${skuName?.slice(0, 13)}...`}</div>} align="t">
              {skuName}
            </Balloon.Tooltip>
          )}
          <div>提报价格：{price}</div>
          <div className="text-[#999]">提报库存：不限库存</div>
        </div>
      </div>
    );
  };

  return (
    <Dialog
      title="其它SKU"
      visible
      footerAlign="center"
      onClose={onClose}
      style={{ width: '892px', '--dialog-content-padding-top': '10px' }}
      footer={false}
    >
      <div className="flex items-center bg-[#e6f2ff] text-[13px] text-[#333] rounded-[3px] py-[12px] mb-[20px]">
        <img
          src="https://Img.alicdn.com/skuImgextra/i4/O1CN01iqqGSl1wOXNSy9FV6_!!6000000006298-55-tps-16-16.svg"
          alt="icon"
          className="mr-[8px] ml-[12px]"
        />
        <span>以下 {skus?.length || 0} 个 SKU 都将通往速卖通渠道销售。</span>
      </div>
      <Row gutter="20" wrap>
        {currentPageItems?.length > 0 ? (
          currentPageItems?.map((sku) => (
            <Col key={sku?.skuId} span="8">
              <CardContent sku={sku} />
            </Col>
          ))
        ) : (
          <div style={{ width: '100%', textAlign: 'center', padding: '20px 0' }}>暂无数据</div>
        )}
      </Row>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={currentPage}
          onChange={handleChange}
          total={skus?.length}
          pageSize={itemsPerPage}
          shape="no-border"
          type="simple"
        />
      </div>
    </Dialog>
  );
}

export default SkuCard;
