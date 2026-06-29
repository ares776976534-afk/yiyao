import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Dialog, Form, Field, Input, Button } from '@alifd/next';
import diorRequest from '@/service/diorRequest';

import './index.scss';

// 发送邮件验证码
const sendEmailVerifyCode = ({ sceneCode, email }) => {
  return new Promise((resolve) => {
    diorRequest('CDT_4ekkJC', 'sendEmailVerifyCode', {
      sceneCode,
      email,
    })
      .then(({ model, success }) => {
        const { isSuccess, msg } = model;
        if (success && isSuccess) {
          resolve({
            success: isSuccess,
            msg,
          });
        } else {
          resolve({
            success: isSuccess,
            msg,
          });
        }
      });
  });
};

// 验证邮件验证码
const verifyEmailVerifyCode = ({ sceneCode, email, verifyCode }) => {
  return new Promise((resolve) => {
    diorRequest('CDT_4ekkJC', 'verifyEmailVerifyCode', {
      sceneCode,
      email,
      verifyCode,
    })
      .then(({ model, success }) => {
        const { isSuccess, msg } = model;
        if (success && isSuccess) {
          resolve({
            success: isSuccess,
            msg,
          });
        } else {
          resolve({
            success: isSuccess,
            msg,
          });
        }
      });
  });
};

const verifyEmailIsVerified = ({ sceneCode, email }) => {
  return new Promise((resolve) => {
    diorRequest('CDT_4ekkJC', 'verifyEmailIsVerified', {
      sceneCode,
      email,
    })
      .then(({ model }) => {
        const { isSuccess } = model;
        resolve({
          success: isSuccess,
        });
      });
  });
};

const verifyCodeCount = 6;
const countDownLimit = 60 * 1000;

const App = ({ sceneCode, email, onSuccess }) => {
  const [error, setError] = useState('');
  const [countDown, setCountDown] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isVerifyCodeError, setIsVerifyCodeError] = useState(false);

  const field = Field.useField({
    parseName: true,
    onChange: (name, value) => {
      setIsVerifyCodeError(false);
      setError('');
      const values = field.getValues();
      const { verifyCode = [] } = values;

      // 提取当前索引并计算下一个索引
      const currentIndex = parseInt(name.match(/\d+/)[0]); // 提取[]中的数字
      const nextIndex = Math.min(currentIndex + 1, verifyCodeCount - 1); // 限制最大索引

      if (verifyCode.filter(Boolean).length === verifyCodeCount) {
        handleVerifyCode();
      } else if (value) { // 仅在输入值时跳转焦点
        document.getElementById(`verifyCode[${nextIndex}]`).focus();
      }
    },
  });

  const handleCountDown = () => {
    setTimeout(() => {
      if (countDown === 0) return;
      setCountDown(countDown - 1000);
    }, 1000);
  };

  const handleSendVerifyCode = () => {
    sendEmailVerifyCode({
      sceneCode,
      email,
    })
      .then(({ success, msg }) => {
        if (success) {
          setCountDown(countDownLimit);
        } else {
          setError(msg);
        }
      });
  };

  const handleVerifyCode = () => {
    const values = field.getValues();
    const { verifyCode = [] } = values;
    verifyEmailVerifyCode({
      sceneCode,
      email,
      verifyCode: verifyCode.join(''),
    })
      .then(({ success, msg }) => {
        if (success) {
          handleSuccess();
        } else {
          setError(msg);
          setIsVerifyCodeError(true);
        }
      });
  };

  const handleSuccess = () => {
    onSuccess({
      email,
      sceneCode,
    });
    setVisible(false);
  };

  const isSending = countDown > 0;

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    if (countDown === countDownLimit || (countDown > 0 && countDown < countDownLimit)) {
      handleCountDown();
    }
  }, [countDown]);

  return (
    <Dialog
      v2
      visible={visible}
      title="邮箱验证"
      footer={false}
      className="emailotp-dialog"
      onClose={() => setVisible(false)}
      width={'440px'}
    >
      <div className="flex flex-col gap-[20px]">
        <span className="text-[14px] text-[#333] text-left">此邮箱将用于账户的登录和资金的提取，请确保邮箱真实有效。</span>
        <div className="flex flex-row items-center gap-[12px] justify-center">
          <span className="text-[14px] text-[#333]">验证码将发送到：{email}</span>
        </div>
        <div className="flex flex-col gap-[12px] items-center">
          <span className="text-[14px] text-[#333]">请在此处输入发送到上方邮箱的验证码：</span>
          <div className="emailotp-dialog-code-input">
            <Form
              field={field}
              className="flex flex-row justify-between gap-[16px]"
            >
              {
                Array(verifyCodeCount).fill(0).map((_, index) => {
                  return (
                    <Form.Item key={index} name={`verifyCode[${index}]`}>
                      <Input maxLength="1" state={isVerifyCodeError ? 'error' : ''} />
                    </Form.Item>
                  );
                })
              }
            </Form>
          </div>
          {error && <span className="text-[12px] text-[#FB3B20]">{error}</span>}
        </div>
        <div className="flex flex-row justify-center">
          <Button type="primary" disabled={isSending} onClick={handleSendVerifyCode}>{isSending ? `重新发送${countDown / 1000}s` : '发送验证码'}</Button>
        </div>
      </div>
    </Dialog>
  );
};


App.open = (props) => {
  const { email, sceneCode, onSuccess } = props;
  verifyEmailIsVerified({
    sceneCode,
    email,
  })
    .then(({ success }) => {
      if (success) {
        onSuccess();
      } else {
        ReactDOM.render(<App {...props} />, document.createElement('div'));
      }
    });
};


export default App;
