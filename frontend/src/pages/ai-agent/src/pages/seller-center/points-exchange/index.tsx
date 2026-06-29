import Framework from '@/components/BaseFramework';
import theme from '@/theme/seller-center.json';
import { InfoIcon, ErrorIcon } from '@/components/Icon';
import { Button, Form, InputNumber, Select, Table } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { SuccessModal } from './components/SuccessModal';
import { useEffect, useState, useRef } from 'react';
import { getBalanceStatistics } from '../services';
import { CreditData } from '../credit-management/types';
import { calculateExchangePoint, queryExchangeUnit, exchangeTokenQuery, queryExchangeRecord } from './services';
import { FailModal } from './components/FailModal';
import { columns } from './components/columns';
import { useNavigate } from 'ice';
import styles from './index.module.css';
import { $t } from '@/i18n';

const SCENE = 'marco';

export default function PointsExchange() {
  const [creditData, setCreditData] = useState<CreditData>({
    total: 0,
    used: 0,
    using: 0,
    remaining: 0,
  });
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [failModalOpen, setFailModalOpen] = useState(false);
  const [failMessage, setFailMessage] = useState('');
  const [state, setState] = useState<boolean | undefined>(undefined);
  const [options, setOptions] = useState<any[]>([]);
  const [recordList, setRecordList] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [exchangePoint, setExchangePoint] = useState<number>(0);

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const inputNumberRef = useRef<any>(null);

  const exchangeToken = Form.useWatch('exchangeToken', form);
  const unitType = Form.useWatch('unitType', form);

  const { remaining } = creditData;

  const loadExchangeRecord = (pageIndex = 1, pageSize = 10) => {
    queryExchangeRecord({
      scene: SCENE,
      pageSize,
      pageIndex,
    })
      .then((res) => {
        const { success, data } = res;
        if (success) {
          setRecordList(data?.data || []);
          setPagination((prev) => ({
            ...prev,
            total: data?.totalRecords || 0,
            current: pageIndex,
            pageSize,
          }));
        }
      });
  };

  // 监听两个字段，任何一个变化时都检查两个字段是否都有值
  useEffect(() => {
    // 检查两个字段是否都有值
    if (exchangeToken !== undefined && exchangeToken !== null &&
      unitType !== undefined && unitType !== null) {
      calculateExchangePoint({
        scene: SCENE,
        exchangeToken,
        unitType,
      })
        .then((res) => {
          const { success, data } = res;
          if (success) {
            setExchangePoint(data);
            setState(data <= remaining);
          } else {
            setExchangePoint(0);
            setState(false);
          }
        })
        .catch((err) => {
          console.log(err);
          setExchangePoint(0);
          setState(false);
        });
    } else {
      setExchangePoint(0);
      setState(undefined);
    }
  }, [exchangeToken, unitType, remaining]);

  const checkExchangeToken = () => {
    getBalanceStatistics()
      .then((res) => {
        const { success, data } = res;
        if (success) {
          setCreditData({
            total: data.totalObtainPoint,
            used: data.costPoint,
            using: data.remainUnavailablePoint,
            remaining: data.remainAvailablePoint,
          });
        } else {
          setCreditData({
            total: 0,
            used: 0,
            using: 0,
            remaining: 0,
          });
        }
      })
      .catch((err) => {
        setCreditData({
          total: 0,
          used: 0,
          using: 0,
          remaining: 0,
        });
      });
  };

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let inputElement: HTMLInputElement | null = null;
    let checkInterval: NodeJS.Timeout | null = null;
    let observer: MutationObserver | null = null;

    const findInputElement = (): HTMLInputElement | null => {
      if (!inputNumberRef.current) return null;

      const ref = inputNumberRef.current;
      let element = ref.input ||
        ref.inputNumber?.input ||
        (ref as any).inputElement ||
        null;

      if (!element && ref) {
        const container = typeof ref === 'object' && 'querySelector' in ref
          ? ref as HTMLElement
          : null;
        if (container) {
          element = container.querySelector('input') || null;
        }
      }

      if (!element) {
        const allInputs = document.querySelectorAll('input');
        for (const input of allInputs) {
          // 检查是否是 InputNumber 的 input（通过查找最近的 ant-input-number 类）
          const parent = input.closest('.ant-input-number');
          if (parent && inputNumberRef.current) {
            const refContainer = typeof inputNumberRef.current === 'object' && 'contains' in inputNumberRef.current
              ? inputNumberRef.current as HTMLElement
              : null;
            if (refContainer && (refContainer.contains(input) || refContainer === parent)) {
              element = input;
              break;
            }
          }
        }
      }

      return element;
    };

    const setupEventListeners = (element: HTMLInputElement) => {
      if (cleanup) {
        cleanup();
      }

      element.setAttribute('inputmode', 'numeric');
      element.setAttribute('pattern', '[0-9]*');
      element.setAttribute('type', 'text');

      const handleInput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const currentValue = target.value || '';

        // 只保留数字
        const cleanedValue = currentValue.replace(/[^\d]/g, '');

        if (currentValue !== cleanedValue) {
          // 阻止默认行为
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          const intValue = cleanedValue ? parseInt(cleanedValue, 10) : null;
          if (!Number.isNaN(intValue) && intValue !== null && intValue >= 1) {
            // 立即更新，不使用 setTimeout
            target.value = cleanedValue;
            form.setFieldValue('exchangeToken', intValue);
          } else {
            target.value = '';
            form.setFieldValue('exchangeToken', null);
          }
        }
      };

      const handleCompositionStart = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        const target = event.target as HTMLInputElement;
        if (target) {
          const currentValue = target.value || '';
          const cleanedValue = currentValue.replace(/[^\d]/g, '');
          target.value = cleanedValue || '';
          form.setFieldValue('exchangeToken', cleanedValue ? parseInt(cleanedValue, 10) : null);
        }
      };

      const handleCompositionUpdate = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      };

      const handleCompositionEnd = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        const target = event.target as HTMLInputElement;
        const currentValue = target.value || '';
        const cleanedValue = currentValue.replace(/[^\d]/g, '');
        const intValue = cleanedValue ? parseInt(cleanedValue, 10) : null;
        if (!Number.isNaN(intValue) && intValue !== null && intValue >= 1) {
          target.value = cleanedValue;
          form.setFieldValue('exchangeToken', intValue);
        } else {
          target.value = '';
          form.setFieldValue('exchangeToken', null);
        }
      };

      const handleBeforeInput = (event: any) => {
        const inputType = event.inputType || '';
        const data = event.data || '';

        if (inputType === 'insertText' || inputType === 'insertCompositionText') {
          if (data && !/^\d+$/.test(data)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
          }
        }
      };

      // 使用 capture 阶段捕获事件，确保优先处理
      element.addEventListener('input', handleInput, { capture: true, passive: false });
      element.addEventListener('beforeinput', handleBeforeInput, { capture: true, passive: false });
      element.addEventListener('compositionstart', handleCompositionStart, { capture: true, passive: false });
      element.addEventListener('compositionupdate', handleCompositionUpdate, { capture: true, passive: false });
      element.addEventListener('compositionend', handleCompositionEnd, { capture: true, passive: false });

      // 保存清理函数
      cleanup = () => {
        element.removeEventListener('input', handleInput, { capture: true } as any);
        element.removeEventListener('beforeinput', handleBeforeInput, { capture: true } as any);
        element.removeEventListener('compositionstart', handleCompositionStart, { capture: true } as any);
        element.removeEventListener('compositionupdate', handleCompositionUpdate, { capture: true } as any);
        element.removeEventListener('compositionend', handleCompositionEnd, { capture: true } as any);
      };
    };

    // 延迟查找，确保 DOM 已渲染
    const timer = setTimeout(() => {
      inputElement = findInputElement();

      if (!inputElement) {
        // 如果找不到，尝试再次查找
        setTimeout(() => {
          inputElement = findInputElement();
          if (inputElement) {
            setupEventListeners(inputElement);
          }
        }, 200);
        return;
      }

      setupEventListeners(inputElement);

      // 额外的定期检查，确保值始终是数字（防止某些输入法绕过事件）
      checkInterval = setInterval(() => {
        // 重新查找 input 元素（可能被重新创建）
        const currentElement = findInputElement();
        if (currentElement && currentElement !== inputElement) {
          inputElement = currentElement;
          setupEventListeners(currentElement);
        }

        if (inputElement) {
          const currentValue = inputElement.value || '';
          const cleanedValue = currentValue.replace(/[^\d]/g, '');
          if (currentValue !== cleanedValue) {
            const intValue = cleanedValue ? parseInt(cleanedValue, 10) : null;
            if (!Number.isNaN(intValue) && intValue !== null && intValue >= 1) {
              inputElement.value = cleanedValue;
              form.setFieldValue('exchangeToken', intValue);
            } else {
              inputElement.value = '';
              form.setFieldValue('exchangeToken', null);
            }
          }
          // 确保属性始终存在
          if (inputElement.getAttribute('inputmode') !== 'numeric') {
            inputElement.setAttribute('inputmode', 'numeric');
          }
          if (inputElement.getAttribute('pattern') !== '[0-9]*') {
            inputElement.setAttribute('pattern', '[0-9]*');
          }
        }
      }, 50); // 每 50ms 检查一次

      // 使用 MutationObserver 监听 DOM 变化
      observer = new MutationObserver(() => {
        // 重新查找 input 元素
        const newElement = findInputElement();
        if (newElement && newElement !== inputElement) {
          inputElement = newElement;
          setupEventListeners(newElement);
        }
      });

      // 监听整个文档的变化（如果 inputNumberRef 有容器元素）
      if (inputNumberRef.current) {
        const container = typeof inputNumberRef.current === 'object' && 'querySelector' in inputNumberRef.current
          ? inputNumberRef.current as HTMLElement
          : document.body;
        observer.observe(container, {
          attributes: false,
          childList: true,
          subtree: true,
          characterData: false,
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (observer) {
        observer.disconnect();
      }
      if (cleanup) {
        cleanup();
      }
    };
  }, [form]);

  useEffect(() => {
    checkExchangeToken();

    queryExchangeUnit({
      scene: SCENE,
    })
      .then((res) => {
        const { success, data } = res;
        if (success) {
          setOptions(data?.map((item: any) => {
            return {
              label: item?.name,
              value: item?.unitType
              ,
            };
          }));

          form.setFieldsValue({
            unitType: data?.[0]?.unitType,
          });
        }
      });

    loadExchangeRecord(1, 10);
  }, []);

  const onSubmit = () => {
    exchangeTokenQuery({
      scene: SCENE,
      exchangeToken,
      unitType,
    }).then((res) => {
      const { success, retMsg } = res;
      if (success) {
        setSuccessModalOpen(true);
        checkExchangeToken();
        loadExchangeRecord(1, 10);
      } else {
        setFailMessage(retMsg);
        setFailModalOpen(true);
      }
    }).catch((err) => {
      console.log(err);
      setFailModalOpen(true);
    });
  };

  return (
    <Framework
      title={$t("global-1688-ai-app.seller-center.points-exchange.exchangerk", "兑换入口")}
      theme={theme}
    >
      <div>
        <div className="flex justify-between">
          <div>
            <span className="text-base font-semibold leading-[26px] text-black/87">{$t("global-1688-ai-app.seller-center.points-exchange.Mlmsa", "Marco大模型翻译 专属兑换")}</span>
            <span
              className="text-xs font-normal leading-[18px] text-[#6150FF] ml-3"
            >{$t("global-1688-ai-app.seller-center.points-exchange.rnvbi", `剩余可用积分：${remaining}`, [remaining])}</span>
          </div>
          <div className="flex items-start gap-1 text-xs font-normal text-[#CCCCD4]">
            <InfoIcon className="flex-shrink-0" style={{ color: '#CCCCD4' }} />
            <span>{$t("global-1688-ai-app.seller-center.points-exchange.gineecebq", "该部分积分仅能用于此服务，一经兑换即被冻结，不可退换或迁移")}</span>
          </div>
        </div>

        <div className="border-t border-[rgba(0,0,0,0.04)] w-full mt-[18px]" />

        <div className="mt-[102px] flex flex-col items-center">
          <div className="flex items-center gap-3 text-sm font-normal leading-5 text-[#1D2129]">
            <span>{$t("global-1688-ai-app.seller-center.points-exchange.zfs", "字符数")}</span>
            <Form
              form={form}
            >
              <Form.Item noStyle name="exchangeToken">
                <InputNumber
                  ref={inputNumberRef}
                  min={1}
                  precision={0}
                  step={1}
                  onKeyDown={(event) => {
                    // 允许的控制键
                    const controlKeys = [
                      'Backspace', 'Delete', 'Tab', 'Enter',
                      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                      'Home', 'End',
                      'Control', 'Meta', 'Alt', 'Shift',
                    ];

                    // 如果按下了 Ctrl/Cmd，允许（用于快捷键）
                    if (event.ctrlKey || event.metaKey) {
                      const allowedKeys = ['a', 'A', 'c', 'C', 'v', 'V', 'x', 'X'];
                      if (allowedKeys.includes(event.key)) {
                        return;
                      }
                    }

                    // 阻止所有非数字字符
                    if (!/[1-9]/.test(event.key) && !controlKeys.includes(event.key)) {
                      event.preventDefault();
                      event.stopPropagation();
                    }

                    // 额外阻止小数点、逗号、负号、加号、科学计数法
                    if (['.', ',', '-', '+', 'e', 'E'].includes(event.key)) {
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }}
                  onCompositionStart={(event) => {
                    // 阻止输入法输入（中文输入法可能会绕过 InputNumber 的限制）
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onCompositionUpdate={(event) => {
                    // 阻止输入法更新
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onCompositionEnd={(event) => {
                    // 阻止输入法完成输入，并清理值
                    event.preventDefault();
                    event.stopPropagation();
                    // 立即清理，防止输入法输入的非数字字符
                    const currentValue = form.getFieldValue('exchangeToken');
                    if (currentValue != null) {
                      const cleanedValue = String(currentValue).replace(/[^\d]/g, '');
                      const intValue = cleanedValue ? parseInt(cleanedValue, 10) : 1;
                      if (!Number.isNaN(intValue) && intValue >= 1) {
                        form.setFieldValue('exchangeToken', intValue);
                      } else {
                        form.setFieldValue('exchangeToken', 1);
                      }
                    }
                  }}
                  onPaste={(event) => {
                    // 阻止粘贴，手动处理粘贴内容
                    event.preventDefault();
                    const paste = (event.clipboardData || (window as any).clipboardData).getData('text');
                    if (paste) {
                      // 只提取数字部分
                      const cleanedValue = paste.replace(/[^\d]/g, '');
                      const intValue = cleanedValue ? parseInt(cleanedValue, 10) : null;
                      if (!Number.isNaN(intValue) && intValue !== null && intValue >= 1) {
                        form.setFieldValue('exchangeToken', intValue);
                      }
                    }
                  }}
                  onChange={(value) => {
                    // 如果值不是数字，替换为空
                    if (value == null) {
                      form.setFieldValue('exchangeToken', null);
                      return;
                    }

                    // 清理所有非数字字符
                    const cleanedValue = String(value).replace(/[^\d]/g, '');

                    // 如果清理后为空，说明不是数字，设为空
                    if (!cleanedValue) {
                      form.setFieldValue('exchangeToken', null);
                      return;
                    }

                    // 转换为整数
                    const intValue = parseInt(cleanedValue, 10);

                    // 如果转换后不是有效数字，设为空
                    if (Number.isNaN(intValue)) {
                      form.setFieldValue('exchangeToken', null);
                      return;
                    }

                    // 确保最小值是1
                    if (intValue < 1) {
                      form.setFieldValue('exchangeToken', null);
                      return;
                    }

                    // 如果值被修改了，更新为清理后的数字
                    if (value !== intValue || cleanedValue !== String(value)) {
                      form.setFieldValue('exchangeToken', intValue);
                    }
                  }}
                />
              </Form.Item>
              <span className="ml-3 mr-3">*</span>
              <Form.Item noStyle name="unitType">
                <Select
                  options={options}
                />
              </Form.Item>
            </Form>
            <SwapOutlined className="text-[#6150FF] text-[30px] ml-6 mr-6" />
            <span className="text-[32px] font-bold leading-[32px] text-black/87 m-1">
              {exchangePoint}
            </span>
            <span>{$t("global-1688-ai-app.seller-center.points-exchange.points", "积分")}</span>
          </div>

          <div
            className={`flex items-start gap-[7px] mt-[34px] text-xs font-normal text-[#FF0000] justify-center ${state === false ? 'visible' : 'invisible'}`}
          >
            <ErrorIcon className="flex-shrink-0" />
            <span>{$t("global-1688-ai-app.seller-center.points-exchange.psetaut", "积分不足，请重新输入兑换数量")}</span>
          </div>

          <Button
            disabled={state !== true}
            style={{
              background: '#6150FF',
              color: '#FFFFFF',
              opacity: state === true ? 1 : 0.3,
            }}
            className="w-[280px] h-[46px] rounded-md mt-[10px] text-base font-semibold text-white border-0 hover:bg-[#6150FF] hover:!text-white disabled:cursor-not-allowed disabled:!text-white"
            onClick={onSubmit}
          >{$t("global-1688-ai-app.seller-center.points-exchange.confirmExchange", "确认兑换")}</Button>

          <div className="text-[13px] text-[#7B7B8D] mt-[22px]">
            <span>{$t("global-1688-ai-app.seller-center.points-exchange.m570points", "(每570 积分")}</span>
            <span className="ml-[14px] mr-[14px]">=</span>
            <span>{$t("global-1688-ai-app.seller-center.points-exchange.bwzfs", "百万字符数")}</span>)
          </div>
        </div>

        <div className="flex items-center justify-between mt-[26px] mb-[26px]">
          <span className="font-[PingFang_SC] text-xl font-semibold leading-[30px] text-black/87">{$t("global-1688-ai-app.seller-center.points-exchange.yal", "已兑换记录")}</span>
          <span
            className="flex h-6 w-[116px] items-center gap-1 p-0 z-[2]
            cursor-pointer
            "
            onClick={() => {
              navigate('/seller-center/credit-management?tab=2');
            }}
          >{$t("global-1688-ai-app.seller-center.points-exchange.vxg", "查看兑换额度 >")}</span>
        </div>

        <Table
          className={styles.exchangeTable}
          columns={columns}
          dataSource={recordList}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => $t("global-1688-ai-app.seller-center.points-exchange.gtjl", `共 ${pagination.total} 条记录`, [pagination.total]),
            onChange: (page, pageSize) => {
              loadExchangeRecord(page, pageSize);
            },
            onShowSizeChange: (current, size) => {
              loadExchangeRecord(current, size);
            },
          }}
        />

        <SuccessModal
          open={successModalOpen}
          onClose={() => { setSuccessModalOpen(false); }}
          remaining={remaining}
          exchangeToken={exchangeToken}
          unitName={options.find(opt => opt.value === unitType)?.label || ''}
        />

        <FailModal
          failMessage={failMessage}
          open={failModalOpen}
          onClose={() => { setFailModalOpen(false); }}
        />
      </div>
    </Framework>
  );
}