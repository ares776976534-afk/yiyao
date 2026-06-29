import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Dialog, Checkbox, Input, Button, Icon } from '@alifd/next';
import { quitOfferHtqq, quitOfferQqjx } from '@/pages/CrossBorderOfferlist/api';
import '@/pages/CrossBorderOfferlist/components/Tab/index.scss';
import '@/pages/CrossBorderOfferlist/components/Tab/compontents/quitDialogCell.scss';
import logger from '@alife/channel-uni-event-logger';
import {
  Htqq_QY,
  Why_Pay,
  How_Get_More_Kj,
  Qqjx_Qy,
  Why_Pay_Qqjx,
  How_Get_More_Order,
} from '@/pages/CrossBorderOfferlist/variables';

const container = document.createElement('div');
function QuitDialogCell({ props }) {
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [otherChacked, setOtherChacked] = useState(false);
  const dialogRef = React.createRef();
  const { records, onActionOk } = props;
  const { text = '退出货通全球', itemId } = records;
  const textParams = {
    退出货通全球: {
      title: '退出货通全球',
      subTitle: (
        <p className="sub-title">
          商品退出1688跨境货通全球，将无法出现在寻源通API、全球直采、寻源换供等上千个跨境渠道，无法获取跨境流量，建议您继续保留在货通全球中，有机会获得跨境订单。
          <br />
          <p>温馨提示：商品退出后，如老客户通过站外跨境渠道产生订单仍将收取技术服务费。</p>
        </p>
      ),
      checkboxList: [
        {
          valueText: '对货通全球规则不理解',
          linkText: '了解货通全球权益',
          linkUrl: Htqq_QY,
        },
        {
          valueText: '不能接受千分之六技术服务费',
          linkText: '为什么收费',
          linkUrl: Why_Pay,
        },
        {
          valueText: '订单量未达预期',
          linkText: '查看如何获取更多订单',
          linkUrl: How_Get_More_Kj,
        },
        {
          valueText: '和海外售价冲突',
        },
      ],
    },
    退出全球严选: {
      title: '退出全球严选',
      subTitle: (
        <p className="sub-title">
          该商品信息已智能翻译为多语言，正在站内跨境专供和全球超170个国家/地区大力推广中，
          <span style={{ color: 'red' }}>退出将造成商品曝光量急剧下滑，损失跨境订单</span>，请谨慎考虑。
        </p>
      ),
      checkboxList: [
        {
          valueText: '对全球严选规则不理解',
          linkText: '了解全球严选权益',
          linkUrl: Qqjx_Qy,
        },
        {
          valueText: '不能接受5%技术服务费',
          linkText: '为什么收费',
          linkUrl: Why_Pay_Qqjx,
        },
        {
          valueText: '订单量未达预期',
          linkText: '全球严选如何帮助商家获得跨境订单？',
          linkUrl: How_Get_More_Order,
        },
        {
          valueText: '和海外售价冲突',
        },
      ],
    },
  };
  const onChange = (_val) => {
    setValue(_val);
  };
  const inputChange = (_v) => {
    setInputValue(_v);
    if (_v) {
      setOtherChacked(true);
    } else {
      setOtherChacked(false);
    }
  };
  const actionQuitClick = (_visible) => {
    // 关闭弹窗，清空选项
    if (!_visible) {
      setValue(null);
      setInputValue('');
      setOtherChacked(false);
    }
    ReactDOM.unmountComponentAtNode(container);
  };
  const resultDialogCell = (_type, _success, _msg) => {
    let titleCell = '';
    let content = '';
    switch (_success) {
      case 'true':
        titleCell =
          _type === '全球严选' ? (
            <div className="title">
              <Icon type="success" style={{ color: '#25BE13', marginRight: '4px' }} size="medium" />
              您已退出全球严选
            </div>
          ) : (
            <div className="title">
              <Icon type="success" style={{ color: '#25BE13', marginRight: '4px' }} size="medium" />
              您已退出货通全球
            </div>
          );
        content =
          _type === '全球严选'
            ? '退出后商品将不再参与全球严选，已产生的跨境订单仍需正常履约。'
            : '退出后商品将不再参与货通全球，已产生的跨境订单仍需正常履约。';
        break;
      case 'false':
        titleCell = (
          <div className="title">
            <img
              className="error-img"
              src="https://img.alicdn.com/imgextra/i2/O1CN01VYEQTv1hVfH4aHFi4_!!6000000004283-2-tps-40-40.png"
            />
            退出失败
          </div>
        );
        content = _msg;
        break;
      default:
        break;
    }
    logger.report({
      actionType: `EXP_${text}结果弹窗_${_success === 'true' ? 'SUCCESS' : 'FAIL'}`,
      actionDesc: content,
    });
    return Dialog.show({
      title: titleCell,
      footerActions: ['ok'],
      className: 'dialog-result',
      footerAlign: 'center',
      onOk: () => {
        ReactDOM.unmountComponentAtNode(container);
        onActionOk();
      },
      okProps: {
        children: '我知道了',
      },
      content: <div>{content}</div>,
    });
  };
  // 商品退出货通全球
  const quitHtqqService = () => {
    setButtonLoading(true); // 打开loading
    const resaonList = value || [];
    if (otherChacked && inputValue) {
      resaonList?.push(inputValue);
    }
    const _params = { offerId: Number(itemId), quitMsg: resaonList?.join('###') };
    quitOfferHtqq(_params).then((res) => {
      const result = res.data;
      if (result) {
        actionQuitClick(false); // 关闭当前确认弹窗
        setButtonLoading(false); // 关闭loading
        resultDialogCell('htqq', result.bizSuccess, result.bizMsg); // 根据退出成功失败返回不同状态-调出结果弹窗
      }
    });
  };
  // 商品退出全球严选
  const quitQqjxService = () => {
    setButtonLoading(true); // 打开loading
    const resaonList = value || [];
    if (otherChacked && inputValue) {
      resaonList?.push(inputValue);
    }
    const _params = { itemId: Number(itemId), quitMsg: resaonList?.join('###') };
    quitOfferQqjx(_params)
      .then((res) => {
        const result = res.data;
        if (result) {
          actionQuitClick(false); // 关闭当前确认弹窗
          setButtonLoading(false); // 关闭loading
          resultDialogCell('全球严选', result?.bizSuccess, result?.bizMsg); // 根据退出成功失败返回不同状态-调出结果弹窗
        }
      })
      .catch((err) => {
        console.log(err);
        // actionQuitClick(false); // 关闭当前确认弹窗
        // setButtonLoading(false); // 关闭loading
        // const result = err.data;
        // resultDialogCell('全球严选', result.data, result.errorInfo); // 根据退出成功失败返回不同状态-调出结果弹窗
      });
  };
  const quitClick = () => {
    switch (text) {
      case '退出货通全球':
        quitHtqqService();
        break;
      case '退出全球严选':
        quitQqjxService();
        break;

      default:
        break;
    }
  };
  useEffect(() => {
    // console.log('disabled', { value, otherChacked, inputValue });
    // if (inputValue) {
    //   setOtherChacked(true);
    // }
    // if (value && value.length) {
    //   setQuitDisabled(false);
    // }
  }, [value, inputValue, otherChacked]);

  const checkQuitDisabled = (_disableParams) => {
    let _disabled_ = false;
    if (_disableParams.otherChacked) {
      // 其他原因勾选,需要保证原因已经填写，至少有其他原因，不需要检验checkbox组是否勾选
      _disabled_ = _disableParams.inputValue?.length > 0;
    } else if (_disableParams.value?.length > 0) {
      // 其他原因未勾选，需校验checkbox组是否勾选
      _disabled_ = true;
    } else {
      // 均否
      _disabled_ = false;
    }
    return !_disabled_;
    // const _disabled_ = _disableParams.value?.length > 0 || (otherChacked ? inputValue.length > 0 : false);
    // console.log('disabled', { _disableParams, _disabled_ });
    // return !_disabled_;
  };

  return (
    <div className="action-quit-box">
      <Dialog
        ref={dialogRef}
        title={textParams[text].title}
        className="quit-dialog"
        visible
        onClose={() => {
          actionQuitClick(false);
          logger.report({
            actionType: `CLK_${text}弹窗_关闭`,
          });
        }}
        style={{ width: 640 }}
        footer={
          <div className="footer-cell">
            <Button
              data-channel-uni-logger-action-type={`CLK_${text}弹窗_确认退出`}
              onClick={quitClick}
              loading={buttonLoading}
              disabled={checkQuitDisabled({ value, otherChacked, inputValue })}
              // disabled={quitDisabled}
            >
              确认退出
            </Button>
            <Button
              data-channel-uni-logger-action-type={`CLK_${text}弹窗_关闭`}
              type="primary"
              className="close"
              onClick={() => actionQuitClick(false)}
            >
              我再想想
            </Button>
          </div>
        }
      >
        <div className="content-1">
          {textParams[text].subTitle}
          <div className="reason">
            <p className="title">请选择退出理由（必填）</p>
            <Checkbox.Group value={value} onChange={onChange} direction="ver" className="quit-checkbox-name">
              {textParams[text]?.checkboxList?.map((valueItem) => {
                const { valueText, linkText, linkUrl } = valueItem;
                return (
                  <Checkbox id={valueText} value={valueText} key={valueText}>
                    <span>
                      {valueText}
                      {linkUrl && linkText && (
                        <a
                          data-channel-uni-logger-action-type={`CLK_${text}_Reason_Url_${linkText}`}
                          href={linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ marginLeft: '4px' }}
                        >
                          {linkText}
                        </a>
                      )}
                    </span>
                  </Checkbox>
                );
              })}
            </Checkbox.Group>
            <Checkbox id="c1" value="other" checked={otherChacked} onChange={(v) => setOtherChacked(v)}>
              <span className="other-reason">其他原因</span>
              <Input maxLength={50} showLimitHint placeholder="请输入" value={inputValue} onChange={inputChange} />
            </Checkbox>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

QuitDialogCell.open = (props) => {
  ReactDOM.render(<QuitDialogCell props={props} />, container);
};

export default QuitDialogCell;
