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
    ? 'bg-white border border-[#0077FF] text-[#0077FF]'
    : 'border border-[#f2f2f2] bg-[#f2f2f2] text-[#333]';

  return (
    <div
      className={`
        rounded-[6px] box-border p-3 cursor-pointer
        text-sm font-medium leading-[1.4] select-none
        transition-all duration-200 ease hover:text-[#0077FF]
        ${checkedClass}
      `}
      onClick={() => handleChange(value)}
      {...props}
    >
      {children}
    </div>
  );
};

export class CustomRadioGroup extends React.Component {
  render() {
    const { value, onChange, children, field, name, ...props } = this.props;
    return (
      <div className="flex gap-2" {...props}>
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
  }
}
