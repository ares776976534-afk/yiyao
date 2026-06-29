import React from 'react';

export const CustomRadio = ({ value, checked, onChange, children, field, name, ...props }) => {
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
  const checkedClass = isChecked
    ? 'border border-[#07f] text-[#07f] bg-white'
    : 'border border-[#f2f2f2] bg-[#f2f2f2] text-[#333]';

  return (
    <div
      className={`
        rounded-[6px] box-border py-[7.5px] px-3 cursor-pointer 
        text-sm font-medium leading-[1.4] select-none 
        transition-all duration-200 ease hover:text-[#07f]
        ${checkedClass}
      `}
      onClick={() => handleChange(value)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CustomRadioGroup = React.forwardRef(({ value, onChange, children, field, name, ...props }, ref) => {
  return (
    <div className="flex gap-3" ref={ref} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === CustomRadio) {
          return React.cloneElement(child, {
            field,
            name,
            checked: child.props.value === value,
            onChange,
          });
        }
        return child;
      })}
    </div>
  );
});
