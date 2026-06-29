import React, { useState, useEffect } from 'react';
import { Grid, Input, Button, Message, Divider } from '@alifd/next';
import queryString from 'query-string';
import ClipboardJS from 'clipboard';
import SampleBasicLayout from '@/layouts/SampleBasicLayout';
import { printSampleBarcode, submitMailNo } from '../../services';
import { UNSAMPLED, DEFAULTCHAR } from '@/constant';
import { INVALID } from '@/pages/SampleCenter/constant';
import './index.scss';

const { Row, Col } = Grid;

const mockDescription = ['测试1', '测试2'];
const mockDescribeImg = [
  'https://img.alicdn.com/imgextra/i2/O1CN01jI2mGd1HYhruB6796_!!6000000000770-2-tps-194-200.png',
  'https://img.alicdn.com/imgextra/i4/O1CN01HDQMtD1KnJL7TyJDX_!!6000000001208-2-tps-120-120.png'];

function SampleInfo(props) {
  const isTagai = window.location.href.indexOf('tagai.alibaba-inc.com') > 0;
  const { channelSampleId,
    sampleQuantity,
    recipientInfo,
    mailNo,
    comments = [],
    sampleResultImgUrls = [],
    status,
    statusStr,
    description = [],
    describeImg = [],
    suggest = '',
  } = props;
  let _recipientInfo = {};
  try {
    _recipientInfo = JSON.parse(recipientInfo);
    // eslint-disable-next-line no-empty
  } catch (error) { }

  const { address, phoneNo, receiverName } = _recipientInfo;
  const [expressNo, setExpressNo] = useState('');
  const query = queryString.parse(window.location.search);
  const { sampleId = '' } = query;
  const unsampled = !mailNo && status !== INVALID;

  const handlePrint = () => {
    printSampleBarcode({
      data: {
        sheetIds: JSON.stringify([channelSampleId]),
      },
    }).then((res) => {
      const { url } = res;
      window.open(url);
    }).catch((err) => {
      Message.error(err.errorMessage);
    });
  };

  const handleSubmit = () => {
    submitMailNo({
      data: {
        sampleId,
        mailNo: expressNo,
      },
    }).then((res) => {
      const { result } = res;
      if (result) {
        Message.success('提交成功');
        window.location.reload();
      } else {
        Message.error('提交失败');
      }
    }).catch((err) => {
      Message.error(err.errorMessage);
    });
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

  const _sampleId = `YP${sampleId.padStart('8', '0')}`;
  return (
    <div className={`sample-info-container ${unsampled ? `${UNSAMPLED}` : ''}`}>
      <Row className="sample-id-status">
        <Col span="16" className="sample-id">
          <span> 寄样单ID：</span>
          <span>{_sampleId || DEFAULTCHAR}</span>
          <img
            className="copy"
            src="https://img.alicdn.com/imgextra/i3/O1CN01SmuMY11QlplSih1JE_!!6000000002017-2-tps-32-32.png"
            data-clipboard-text={_sampleId}
          />
        </Col>
        <Col span="8" className="sample-status">
          <span>状态：</span>
          {status && statusStr ? (
            <span className={`status-container ${status}`}>
              <span className="dot" />
              <span>{statusStr}</span>
            </span>
          ) : <span className="empty">——</span>}

        </Col>
      </Row>
      <SampleBasicLayout className="sample-content">
        <div className="title">寄样信息</div>
        <Row className="sample-content-item">
          <Col span="8">
            <span>样品条码：</span>
            {/* <span className="sample-content-item-bold">746575936454</span> */}
            {
              !isTagai && // tagai页面隐藏可操作按钮
              <span className="print" onClick={handlePrint}>打印</span>
            }
            {
              !isTagai && // tagai页面隐藏
              <div className="hint">
                *请务必打印样品条码（样签）随箱寄出，否则将导致样品审核失败！
              </div>
            }
          </Col>
          <Col span="8">
            <span>寄样数量：</span>
            <span className="sample-content-item-bold">{sampleQuantity || DEFAULTCHAR}</span>
          </Col>
          <Col span="8">
            <span>是否退回：</span>
            <span className="sample-content-item-bold">否</span>
          </Col>
        </Row>
        <Row className="sample-content-item">
          <Col span="8">
            <span>收件人：</span>
            <span className="sample-content-item-bold">{receiverName || DEFAULTCHAR}</span>
          </Col>
          <Col span="8">
            <span>收件地址：</span>
            <span className="sample-content-item-bold">{address || DEFAULTCHAR}</span>
          </Col>
          <Col span="8">
            <span>联系电话：</span>
            <span className="sample-content-item-bold">{phoneNo || DEFAULTCHAR}</span>
          </Col>
        </Row>
        {/* <Row className="sample-content-item">
          <Col span="8">
            <span>关联订单数：</span>
            <span className="sample-content-item-bold">200</span>
          </Col>
          <Col span="8">
            <span>关联销售数：</span>
            <span className="sample-content-item-bold">130</span>
          </Col>
        </Row> */}
        {
          !unsampled && (
            <>
              <Row className="sample-content-item">
                <Col span="8">
                  <span>物流单号：</span>
                  <span className="sample-content-item-bold">{mailNo || DEFAULTCHAR}</span>
                </Col>
              </Row>
              <Row className="sample-content-item">
                <Col span="8">
                  <div className="sample-comments-container">
                    <span>备注信息：</span>
                    {
                      (Array.isArray(comments) && comments?.length > 0) ? (
                        <div className="comments-content">
                          {
                            comments?.map((comment) => {
                              return (
                                <span key={comment} className="sample-content-item-bold comments-content-item">{comment}</span>
                              );
                            })
                          }
                        </div>
                      ) : <span className="sample-content-item-bold">{DEFAULTCHAR}</span>
                    }
                  </div>
                </Col>
              </Row>
              <Row className="sample-content-item">
                <Col span="8" className="sample-imgs">
                  <span>验样图片：</span>
                  {
                    (Array.isArray(sampleResultImgUrls) && sampleResultImgUrls?.length > 0) ? (
                      <div className="img-container">
                        {
                          sampleResultImgUrls?.map((imgUrl) => {
                            return (
                              <a href={imgUrl} target="_blank" rel="noreferrer">
                                <img key={imgUrl} src={imgUrl} />
                              </a>
                            );
                          })
                        }
                      </div>
                    ) : <span className="sample-content-item-bold">{DEFAULTCHAR}</span>
                  }
                </Col>
              </Row>
            </>
          )
        }
        <Divider dashed />
        { (description || describeImg) && (
          <div className="sample-description">
            <span className="title">寄样说明：</span>
            <div className="description-content">
              <div className="description-text-box text-content">
                {
                  description?.map((text) => {
                    return <span key={text} className="sample-content-item-bold comments-content-item">{text}</span>;
                  })
                }
              </div>
              <div className="description-img-box img-content">
                {
                  describeImg?.map((imgUrl) => {
                    return (
                      <a href={imgUrl} target="_blank" rel="noreferrer">
                        <img key={imgUrl} src={imgUrl} />
                      </a>
                    );
                  })
                }
              </div>
            </div>
          </div>
        )
        }
      </SampleBasicLayout>
      {
        unsampled && JSON.stringify(props) !== '{}' && (
          <div className="express-no-container">
            <img src="https://img.alicdn.com/imgextra/i4/O1CN01o231bk25HVmqHmd3x_!!6000000007501-2-tps-32-32.png" />
            <span>请填写物流单号：</span>
            <Input placeholder="请输入" value={expressNo} onChange={(value) => setExpressNo(value)} />
            {
              !isTagai && // tagai页面隐藏可操作按钮
              <Button type="primary" disabled={!expressNo} className="submit-btn" onClick={handleSubmit}>提交</Button>
            }
          </div>
        )
      }
    </div>
  );
}

export default SampleInfo;
