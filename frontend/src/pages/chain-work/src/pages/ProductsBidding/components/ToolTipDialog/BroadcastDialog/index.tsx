import React from 'react';
import { Loading, Dialog, Balloon } from '@alifd/next';
import './index.scss';

function BroadcastDialog({ visible, setVisible, successData, cardLoading }) {
  const cardList = () =>
    successData?.data?.map((item) => {
      const hasImage = !!item?.imgUrl; // 是否有图片
      return (
        <div className="products-dialog-content" key={item?.id}>
          <div style={{ margin: 12 }}>
            <div className="products-dialog-top">
              {hasImage && (
                <div className="products-dialog-top-left">
                  <img src={item?.imgUrl} alt="img_url" className="products-dialog-img" />
                </div>
              )}
              <div className="products-dialog-top-right">
                <div className="products-dialog-center-title">
                  <div style={{ display: 'flex' }}>
                    {item?.itemName?.length < 32 ? (
                      <div className="products-dialog-title">
                        <span className="products-dialog-tag">速卖通爆品</span>
                        <span className="products-dialog-text"> {item?.itemName}</span>
                      </div>
                    ) : (
                      <Balloon.Tooltip
                        trigger={
                          <div className="products-dialog-title">
                            <span className="products-dialog-tag">速卖通爆品</span>
                            <span className="products-dialog-text"> {`${item?.itemName?.slice(0, 32)}...`}</span>
                          </div>
                        }
                        align="t"
                        popupStyle={{ backgroundColor: '#333' }}
                        popupClassName="products-business-tooltips"
                      >
                        {item?.itemName}
                      </Balloon.Tooltip>
                    )}
                  </div>
                  <div className="products-dialog-describe-content">
                    <div className="products-dialog-describe">sku信息</div>
                    <div>{item?.skuName}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });

  const handleCloseModal = () => {
    setVisible(false);
  };

  const handleJump = () => {
    const params = new URLSearchParams(location.search);
    if (params.toString() !== '') {
      window.open(`https://work.1688.com/?${params}&_path_=gonghuotuoguan/cross_boarder_2/bh_management`);
    } else {
      window.open('https://work.1688.com/?_path_=gonghuotuoguan/cross_boarder_2/bh_management');
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={handleCloseModal}
      title={<div className="failureDialog-title" />}
      footer={<div className="failureDialog-footer" />}
      className="broadcastDialog"
    >
      <div className="broadcastDialog-content">
        <img
          src="https://img.alicdn.com/imgextra/i3/O1CN01Bf0x0d1Zx887B4Og0_!!6000000003260-2-tps-445-445.png"
          alt=""
          className="broadcastDialog-445img"
        />
        <img
          src="https://img.alicdn.com/imgextra/i4/O1CN0166uxeh1f3boMg9fJH_!!6000000003951-55-tps-268-267.svg"
          alt=""
          className="broadcastDialog-267img"
        />
        <Loading tip="加载中..." visible={cardLoading} style={{ width: '100%', height: '100%' }}>
          <div className="products-list-title">
            <div className="products-list-title-text">恭喜您</div>
            <div>{successData?.total || 0}个商品竞价成功！</div>
          </div>
          <div className="products-list">{cardList()}</div>
        </Loading>
        <div className="broadcastDialog-content-footer">
          <div className="broadcastDialog-button1" onClick={handleJump}>
            立刻去补货
          </div>
          <div className="broadcastDialog-button2" onClick={handleCloseModal}>
            继续提报商机
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default BroadcastDialog;
