import React, { useState, useEffect, useRef } from 'react';
import { Button, Message } from '@alifd/next';
import Block from './components/Block';
import SendInfoTable from './components/SendInfoTable';
import HandlingMethod from './components/HandlingMethod';
import LogicInfo from './components/LogicInfo';
import sendTableSchema from './components/schema/sendTable';
import Agreement from './components/Agreement';
import Auth from './components/Agreement/Auth';
import { postSample, getLogicToken } from '../../service';
import { getUmidToken } from '@/utlis';
import { submitTagId } from '@/service/common';
import { SETTLED_TAG } from '../../constants';

const transformItemInfos = (data) => {
  return data.map((items) => {
    let _item = { skuInfos: [] };
    items.forEach((item) => {
      if (item.type === 'item') {
        _item = {
          ..._item,
          itemId: item.itemId,
          itemName: item.itemName,
          price: item.price,
        };
      } else {
        item.dataList.forEach((sku) => {
          _item.skuInfos.push({
            skuId: sku.skuId,
            skuName: sku?.skuName?.join(';'),
            barCode: item?.dataList[0]?.barCode,
          });
        });
      }
    });
    return _item;
  });
};

const StepOneTitle = () => {
  return (
    <div className="flex flex-row items-center">
      <span>第一步：生成样品条码</span>
      <span className="text-[#FF7300] text-[12px] ml-[12px]">* 请务必打印条码并张贴到样品上，生成条码后不要删改SKU，否则将导致样品认证失败</span>
    </div>
  );
};

export default ({ itemInfos = [] }) => {
  const [tableData, setTableData] = useState([]);
  const [submitBtnDisable, setSubmitBtnDisable] = useState(true);
  const [signVisible, setSignVisible] = useState(false);
  const [needSignLogic, setNeedSignLogic] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [submitBtnLoading, setSubmitBtnLoading] = useState(false);
  const handlingMethodField = useRef(null);
  const logicInfoField = useRef(null);

  const handleTableDataChange = (data) => {
    setTableData(data);
  };

  const setHandlingMethodField = (field) => {
    handlingMethodField.current = field;
  };

  const setLogicInfoField = (field) => {
    logicInfoField.current = field;
  };

  const getFormValues = (fields = []) => {
    let _fields = [];
    _fields = fields.map((field) => {
      return new Promise((resolve, reject) => {
        field.validate((errors, values) => {
          if (!errors) {
            resolve(values);
          } else {
            reject(errors);
          }
        });
      });
    });
    return Promise.all(_fields);
  };

  const handlePost = (data) => {
    setSubmitBtnLoading(true);
    submitTagId(SETTLED_TAG);
    postSample(data)
      .then(({ success, msg }) => {
        if (success) {
          Message.success('提交成功');
          window.location.reload();
        } else {
          Message.error(msg || '提交失败');
        }
        setSubmitBtnLoading(false);
      });
  };

  const handleSignLogic = () => {
    setSubmitBtnLoading(true);
    getUmidToken()
      .then((umiToken) => {
        getLogicToken(umiToken)
          .then(({ token, msg }) => {
            if (token) {
              setAuthToken(token);
              setSignVisible(true);
            } else {
              Message.error(msg || '获取物流协议签署token失败');
            }
            setSubmitBtnLoading(false);
          });
      });
  };

  const handleSubmit = () => {
    getFormValues([handlingMethodField.current, logicInfoField.current])
      .then((values) => {
        const postData = {
          dealInfo: values[0],
          sendInfo: values[1],
          itemInfos: transformItemInfos(tableData),
        };
        if (needSignLogic) {
          handleSignLogic();
        } else {
          handlePost(postData);
        }
      });
  };

  const handleAgreementChange = ({ isChecked, isLogicSettled }) => {
    setSubmitBtnDisable(!isChecked);
    setNeedSignLogic(isChecked && !isLogicSettled);
  };

  // 官方物流协议签署成功
  const handleSignAuthSuccess = () => {
    setNeedSignLogic(false);
    // handleSubmit();
    setSignVisible(false);
  };

  // 官方物流协议签署失败
  const handleSignAuthFail = () => {

  };

  useEffect(() => {
    if (itemInfos.length > 0) {
      setTableData(() => {
        return itemInfos;
      });
    }
  }, [itemInfos]);

  return (
    <div className="pb-[100px]">
      <Block
        title={<StepOneTitle />}
      >
        <SendInfoTable tableData={tableData} onChange={handleTableDataChange} schema={sendTableSchema} />
      </Block>
      <Block
        title="第二步：选择样品处理方式"
      >
        <HandlingMethod getFieldInstance={setHandlingMethodField} tableData={tableData} />
      </Block>
      <Block
        title="第三步：填写寄样物流信息"
      >
        <LogicInfo getFieldInstance={setLogicInfoField} />
      </Block>
      <div className="flex flex-col fixed bottom-0 left-0 right-0 bg-[#fff] justify-center shadow-[0px_-1px_6px_0px_rgba(0,0,0,0.05)] px-[20px] py-[12px] z-[99]">
        <Agreement onChange={handleAgreementChange} />
        <div className="flex flex-col items-center ">
          <Button type="primary" onClick={handleSubmit} disabled={submitBtnDisable} loading={submitBtnLoading}>确认寄样</Button>
        </div>
      </div>
      <Auth
        visible={signVisible}
        authToken={authToken}
        onClose={() => setSignVisible(false)}
        onSuccess={handleSignAuthSuccess}
        onFail={handleSignAuthFail}
      />
    </div>
  );
};
