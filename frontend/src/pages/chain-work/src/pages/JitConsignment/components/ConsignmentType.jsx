import React, { useEffect, useState } from 'react';
import { Icon, Input, Select, NumberPicker } from '@alifd/next';
import './consignmentType.scss';
import { getQueryParams } from '@/utlis';
import moment from 'moment';
import Message from '@/components/UI/Message';
import { checkSupplierOfflineSend } from '../services';
import { useDebounceFn } from 'ahooks';

function ConsignmentType({ door2doorQuantity, selectedKey, onTab, field, disabled, list, gmtExpectPickUpTime }) {
  const [items, setItems] = useState([{ key: '1', closeable: false }]);
  const [hasAdd, setHasAdd] = useState(false); // 是否显示➕按钮
  const { init, getError } = field;
  const data = [
    {
      title: '上门揽',
      key: 'DOOR_2_DOOR_PICK_UP',
      disabled,
    },
    {
      title: '自寄',
      key: 'SUPPLIER_OFFLINE_SEND',
    },
  ];
  useEffect(() => {
    if (selectedKey === 'DOOR_2_DOOR_PICK_UP') {
      setItems([{ key: '1', closeable: false }]);
      setHasAdd(false);
    }
  }, [selectedKey]);
  // 删除
  const removeTabpane = (targetKey) => {
    setItems((prevPanes) => {
      const newPanes = prevPanes.filter((pane) => pane.key !== targetKey);
      return newPanes;
    });
  };
  // 添加
  const add = () => {
    if (items?.length >= door2doorQuantity && getQueryParams('type') === 'shipments') {
      return Message._show({
        type: 'error',
        title: '包裹数量必须<=发货件数',
      });
    }
    setItems((e) => [
      ...e,
      { tab: `items ${items.length + 1}`, key: `${items.length + 1}`, closeable: true },
    ]);
  };
  const findDuplicates = (arr) => {
    const seen = new Set();
    const duplicates = new Set();
    arr.forEach((item) => {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    });
    return Array.from(duplicates);
  };
  const extractMailNValues = (obj) => {
    return Object.keys(obj)
      .filter(key => key.endsWith('.mailN')) // 筛选出以 '.mailN' 结尾的键
      .map(key => obj[key]); // 获取对应的值
  };
  const cpListData = (mailNo, key) => {
    const cpList = extractMailNValues(field.getValues());
    const duplicates = findDuplicates(cpList);
    if (duplicates.includes(mailNo)) {
      field.setError(`${key}.mailN`, '运单号已重复');
    }
  };
  const { run: onChange } = useDebounceFn(
    (mailNo, key) => {
      checkSupplierOfflineSend({
        fcId: getQueryParams('fcId'),
        mailNo,
      }).then((res) => {
        const { errorMsg } = res;
        if (errorMsg) {
          field.setError(`${key}.mailN`, errorMsg);
        } else {
          field.setError(`${key}.mailN`, '');
          cpListData(mailNo, key);
        }
      });
    },
    { wait: 300 },
  );
  return (
    <div className="w-[100%] h-[100%] bg-white mb-[16px] rounded-[6px] p-[20px]">
      <span className="text-[16px] font-semibold text-[#333]">
        请选择发货方式
        {disabled && <span className="ml-[12px] text-[#FF8B00] text-[12px]">当前发货地址不支持上门揽，如果希望使用上门揽服务，请修改地址</span>}
      </span>
      <div className="flex mt-[12px]">
        {data.map((item) => {
          const isSelected = selectedKey === item.key;
          return (
            <div
              key={item.title}
              onClick={item?.disabled ? () => {} : () => onTab(item.key)}
              className={`w-[240px] p-[15px] border rounded-[6px] ${isSelected ? 'border-blue-500' : 'border-[#E5E5E5]'} cursor-pointer mr-[16px] relative iconSelected`}
            >
              <div className={`${item?.disabled ? 'text-[#999]' : 'text-[#333]'} text-[14px] leading-[17px]`}>{item.title}</div>
              {isSelected && (
              <div className="iconStyle absolute bottom-0 right-0 h-0 w-0 rounded-br-[6px] border-[12px] border-solid border-b-blue-500 border-r-blue-500 border-l-transparent border-t-transparent" >
                <Icon type="select" className="text-white absolute bottom-[-17px] right-[-13px]" />
              </div>
              )}
            </div>
          );
        })}
      </div>
      {selectedKey === 'DOOR_2_DOOR_PICK_UP' ? (
        <div>
          <div className="text-[14px] text-[#333] mt-[11px]">
            选择上门揽方式，
            <span className="text-[#FF8B00]">
              {moment(JSON.parse(getQueryParams('gmtCreate'))).hour() <= 14 ? (
                <span>
                  此单为
                  <span className="font-bold">14点前</span>
                  下单的订单，需在当日
                  <span className="font-bold">15点前</span>
                  完成预约揽收
                </span>
              ) : (
                <span>
                  此单为
                  <span className="font-bold">14点后</span>
                  下单的订单，需在次日
                  <span className="font-bold">15点前</span>
                  完成预约揽收
                </span>
              )}
            </span>
          </div>
          <div className="text-[#333] text-[14px] mt-[40px]">
            <div className="font-medium">请确认揽收信息</div>
            <div className="mt-[16px]">预计上门时间：{gmtExpectPickUpTime || '-'}前</div>
            <div className="flex mt-[16px]">
              <span className="mr-[12px] mt-[6px]">箱数</span>
              <div>
                <NumberPicker
                  innerAfter="箱"
                  placeholder="请输入"
                  {...init('packageQuantity', {
                    initValue: getQueryParams('type') === 'shipmentshb' ? 1 : undefined,
                    rules: [
                      { required: true, message: '箱数不能为空' },
                      { validator: (rule, v, callback) => {
                        if (v <= 99) {
                          callback('');
                        } else {
                          callback('箱数不能大于99');
                        }
                      } },
                      { validator: (rule, v, callback) => {
                        if (v <= door2doorQuantity) {
                          callback('');
                        } else {
                          callback('包裹数量必须<=发货件数');
                        }
                      } },
                    ],
                  })}
                  precision={0}
                  min={1}
                  disabled={getQueryParams('type') === 'shipmentshb'}
                  hasTrigger={false}
                  style={{ width: '200px', borderRadius: '6px' }}
                />
                {getError('packageQuantity') ? (
                  <div style={{ color: 'red' }}>
                    {getError('packageQuantity').join(',')}
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
            {getQueryParams('type') === 'shipmentshb' ? (
              <div className="text-[#999] text-[14px] mt-[8px] ml-[40px]">合并发货只支持发1箱，如果要分多箱发货，请对操作单独发货</div>
            ) : (
              <div className="text-[#999] text-[14px] mt-[8px] ml-[40px]">请预估采购单中的货品需要分几箱发货，系统将根据你填写的数量，生成对应数量的揽收单。</div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="text-[14px] text-[#333] mt-[11px]">
            选择自寄方式，最晚到仓时间为：<span className="text-[#FF8B00]">{moment(JSON.parse(getQueryParams('gmtCreate'))).add(72, 'hours').format('YYYY/MM/DD HH:mm:ss')}</span>
          </div>
          <div className="text-[#333] text-[14px] mt-[40px]">
            <div className="font-medium">
              请填写自寄信息
              {getQueryParams('type') === 'shipmentshb' && <span className="ml-[12px] text-[12px] text-[#999]">合并发货，只支持填写一个运单</span>}
            </div>
            <div>
              {items.map((ele, index) => {
                return (
                  <div className="flex items-center mt-[16px]" key={ele.key}>
                    <div className="flex select-rounded mr-[24px]">
                      <span className="mr-[4px] text-[14px] text-[#333] mt-[6px]">物流公司</span>
                      <div>
                        <Select
                          {...init(`${ele.key}.cpCode`, {}, {
                            rules: [{ required: true, message: '物流公司不能为空' }],
                          })}
                          placeholder="请选择"
                          style={{ width: 332, borderRadius: 6 }}
                          hasClear
                          showSearch
                        >
                          {list?.map(({ label, value, key }) => <Select.Option value={value} key={key}>{label}</Select.Option>)}
                        </Select>
                        {getError(`${ele.key}.cpCode`) ? (
                          <div style={{ color: 'red' }}>
                            {getError(`${ele.key}.cpCode`).join(',')}
                          </div>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                    <div className="flex ">
                      <span className="mr-[12px] mt-[6px]">运单号</span>
                      <div>
                        <Input
                          {...init(`${ele.key}.mailN`, {
                            rules: [
                              { required: true, message: '运单号不能为空' },
                              {
                                validator: (rule, v, callback) => {
                                  // eslint-disable-next-line no-useless-escape
                                  const isValidFormat = /^[a-zA-Z0-9\-]*$/.test(v);

                                  // 校验是否包含所有三种字符类型
                                  const hasDigit = /[0-9]/.test(v); // 包含数字
                                  const hasLetter = /[a-zA-Z]/.test(v); // 包含字母
                                  const hasDash = /[-]/.test(v); // 包含 "-"
                                  if (
                                    isValidFormat &&
                                    v.length <= 32
                                  ) {
                                    callback();
                                  } else {
                                    callback('运单号由数字、字母和-组成，不超过32位');
                                  }
                                },
                              },
                            ],
                          })}
                          onChange={(v) => {
                            onChange(v, ele.key);
                            field.setValue(`${ele.key}.mailN`, v);
                          }}
                          value={field.getValue(`${ele.key}.mailN`)}
                          placeholder="运单号由数字、字母和-组成，不超过32位"
                          style={{ width: '346px', borderRadius: '6px' }}
                        />
                        {getError(`${ele.key}.mailN`) ? (
                          <div style={{ color: 'red' }}>
                            {getError(`${ele.key}.mailN`).join(',')}
                          </div>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                    {index !== 0 && <Icon type="ashbin" className="ml-[10px] cursor-pointer hover:text-[#FF3B30] text-[#BBB]" onClick={() => removeTabpane(ele.key)} />}
                  </div>
                );
              })}
            </div>
            {!hasAdd && getQueryParams('type') === 'shipments' && items.length < 100 && (
              <div
                className="text-[#0077FF] mt-[20px] h-[32px] w-[824px] flex flex-row justify-center items-center p-[16px] border border-dashed border-[#CCCCCC] rounded-[6px] opacity-100 box-border cursor-pointer"
                onClick={add}
              >
                <Icon type="add" className="mr-[10px]" />
                添加运单
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConsignmentType;
