import React, { useEffect } from 'react';
import { Table, Pagination, Message } from '@alifd/next';
import SampleBasicLayout from '@/layouts/SampleBasicLayout';
import ClipboardJS from 'clipboard';
import { DEFAULTCHAR } from '@/constant';
import { INVALID } from '../../constant';
import './index.scss';

function SampleList(props) {
  const { dataSource, current, total, setCurrent } = props;
  const handleRenderId = (value, index, record) => {
    const { sampleInfo: { sampleId = '' } = {} } = record;
    const _sampleId = `YP${sampleId.padStart('8', '0')}`;
    return (
      <div className="sampleId-container">
        <span>{_sampleId}</span>
        <img
          className="copy"
          src="https://img.alicdn.com/imgextra/i3/O1CN01SmuMY11QlplSih1JE_!!6000000002017-2-tps-32-32.png"
          data-clipboard-text={_sampleId}
        />
      </div>
    );
  };

  const handleRenderOfferInfo = (value, index, record) => {
    const { offerInfo: { mainPic = '', title = '', skuName = '' } = {}, sampleInfo: { offerId } = {} } = record;
    return (
      <div className="offer-info-container">
        <img src={mainPic} />
        <div className="offer-info">
          <span className="title" title={title}>
            <a href={`https://detail.1688.com/offer/${offerId}.html`} target="_blank" rel="noreferrer">
              {title}
            </a>
          </span>
          <span className="sku">{skuName}</span>
        </div>
      </div>
    );
  };

  const handleRenderSampleQuantity = (value, index, record) => {
    const { sampleInfo: { sampleQuantity = '' } = {} } = record;

    if (!sampleQuantity) {
      return <div>{DEFAULTCHAR}</div>;
    }

    return (
      <div>{sampleQuantity}</div>
    );
  };

  const handleRenderClientName = (value, index, record) => {
    const { sampleInfo: { clientName = '' } = {} } = record;

    if (!clientName) {
      return <div>{DEFAULTCHAR}</div>;
    }

    return (
      <div>{clientName}</div>
    );
  };

  const handleRenderTime = (value, index, record) => {
    const { sampleInfo: { gmtCreate = '', gmtModified = '' } = {} } = record;

    return (
      <div>
        <div>{gmtCreate}</div>
        {
          gmtModified && <div style={{ marginTop: 4 }}>{gmtModified}</div>
        }
      </div>
    );
  };

  const handleRenderStatus = (value, index, record) => {
    const { sampleInfo: { status = '', statusStr = '' } = {} } = record;

    if (!status || !statusStr) {
      return <div>{DEFAULTCHAR}</div>;
    }

    return (
      <div className={`status-container ${status}`}>
        <span className="dot" />
        <span>{statusStr}</span>
      </div>
    );
  };

  const handleRenderOperator = (value, index, record) => {
    const { sampleInfo: { mailNo = '', sampleId = '', status = '', offerId = '', skuId = '' } = {} } = record;
    let text = '';
    if (status === INVALID) {
      text = '查看';
    } else if (mailNo) {
      text = '查看';
    } else {
      text = '去寄样';
    }

    const detailPage = 'https://work.1688.com/?spm=a2638g.u_0_1001.0.du_487b9.44f51768YVRRTX&_path_=gonghuotuoguan/2017sellerbase_fenxiao/sampledetail';

    return (
      <a
        href={`${detailPage}&_hex_sampleId=${sampleId}&_hex_offerId=${offerId}&_hex_skuId=${skuId}`}
        className="view-btn"
        target="_blank"
        rel="noreferrer"
      >
        {text}
      </a>
    );
  };

  useEffect(() => {
    const clipboard = new ClipboardJS('.copy');
    clipboard.on('success', (e) => {
      e.clearSelection();
      Message.success('复制成功');
    });

    clipboard.on('error', () => {
      Message.error('复制失败');
    });
  }, []);

  return (
    <SampleBasicLayout className="sample-list-container">
      {/* <div className="selected-text-container">
        <span>已选<span className="hightlight">10</span>个商品</span>
        <span className="line" />
        <Button disabled type="primary">批量改价</Button>
      </div> */}
      <div className="table-container">
        <Table
          dataSource={dataSource}
        // rowSelection={{
        //   onChange: handleChange,
        //   columnProps: () => {
        //     return {
        //       width: 40,
        //     };
        //   },
        // }}
        >
          <Table.Column title="寄样单ID" width={200} cell={handleRenderId} />
          <Table.Column title="商品信息" width={224} cell={handleRenderOfferInfo} />
          <Table.Column title="寄样数量" align="center" width={120} cell={handleRenderSampleQuantity} />
          <Table.Column title="客户信息" align="center" width={150} cell={handleRenderClientName} />
          <Table.Column title="创建/更新时间" align="center" width={200} cell={handleRenderTime} />
          <Table.Column title="状态" dataIndex="status" align="center" width={140} cell={handleRenderStatus} />
          {/* <Table.Column title="关联数据" dataIndex="status" align="center" width={152} /> */}
          {/* <Table.Column title="操作" dataIndex="status" align="center" width={112} /> */}
          <Table.Column title="操作" dataIndex="status" align="center" cell={handleRenderOperator} width={120} />
        </Table>
      </div>
      <div className="pagination-container">
        <Pagination current={current} pageSize={10} total={total} onChange={(_current) => setCurrent(_current)} />
      </div>
    </SampleBasicLayout>
  );
}

export default SampleList;
