import React from 'react';

const formatDate = (value) => {
  if (!value) return '';
  const input = value instanceof Date ? value : new Date(String(value).replace(' ', 'T'));
  const time = input.getTime();
  if (!Number.isFinite(time)) {
    const str = String(value);
    return (str.split(' ')[0] || str.split('T')[0] || '').trim();
  }
  const year = input.getFullYear();
  const month = (`0${input.getMonth() + 1}`).slice(-2);
  const day = (`0${input.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
};

const diff = (endTime, currentTime) => {
  const toDate = (v) => (v instanceof Date ? v : new Date(String(v).replace(' ', 'T')));
  const end = toDate(endTime);
  const cur = toDate(currentTime ?? new Date());

  let total = Math.floor((end - cur) / 1000);
  if (!Number.isFinite(total) || total <= 0) return '00:00:00';

  const hours = Math.floor(total / 3600);
  total -= hours * 3600;
  const minutes = Math.floor(total / 60);
  const seconds = total - minutes * 60;

  const pad = (n) => (`0${n}`).slice(-2);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`; // 小时可>24
};

export const CardRadio = ({ value, checked, onChange, children, field, name, data, renderContent, ...props }) => {
  // 如果传入了field和name，说明要在Form中使用
  const isFormMode = field && name;

  const handleChange = (newValue) => {
    if (isFormMode) {
      // 使用field.setValue来设置值
      field.setValue(name, newValue);
      // 触发Form的onChange事件，传递完整的表单值
      const formValues = field.getValues();
      // 模拟Form的onChange事件
      if (field.onChange) {
        field.onChange(formValues);
      }
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  const isChecked = isFormMode ? field.getValue(name) === value : checked;

  const renderDefaultContent = () => {
    const title = data.oppName;
    const updatedAt = data?.updateTime ? formatDate(data?.updateTime) : diff(data.endTime, data.currentTime);

    return (
      <>
        {title && (
          <p
            className={`text-[14px] truncate ${isChecked ? 'text-[#0077FF]' : 'text-[#333]'}`}
            style={{ lineHeight: '19px' }}
          >
            {title}
          </p>
        )}
        {(updatedAt) && (
          <div className="flex mt-[6px]">
            <span className=" text-[#666666] text-[12px]">
              {data?.updateTime ? '商机更新日期' : '倒计时'}
            </span>
            <span className="text-[#FF8B00] text-[12px] ml-[4px] flex-shrink-0">{updatedAt}</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className={`
        rounded-[6px] bg-white box-border p-3 gap-2 cursor-pointer w-[200px] min-w-0 overflow-hidden
        ${isChecked ? 'border border-[#0077FF]' : 'border border-[#CCCCCC]'}
      `}
      onClick={() => handleChange(value)}
      {...props}
    >
      {(() => {
        if (renderContent) {
          return renderContent({ isChecked, data });
        }
        if (data) {
          return renderDefaultContent();
        }
        return children;
      })()}
    </div>
  );
};

export const CardRadioGroup = React.forwardRef(({ value, onChange, children, field, name, dataSource, ...props }, ref) => {
  const shouldRenderFromData = Array.isArray(dataSource) && dataSource.length > 0;

  return (
    <div className="flex gap-3" ref={ref} {...props}>
      {shouldRenderFromData
        ? dataSource.map((item) => (
          <CardRadio
            key={item.strategyId}
            value={item.strategyId}
            field={field}
            name={name}
            checked={value ? item.value === value : undefined}
            onChange={onChange}
            data={item}
          />
        ))
        : React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === CardRadio) {
            return React.cloneElement(child, {
              field,
              name,
              checked: value ? child.props.value === value : child.props.checked,
              onChange,
            });
          }
          return child;
        })}
    </div>
  );
});
