import { isField } from '@formily/core';
import { observer, ReactFC, useForm } from '@formily/react';
import { Select as AntdSelect } from 'antd';
import { SelectProps } from 'antd/lib/select';

/**
 * formily/react 不支持 react 19 版本，只能使用 formily/core 核心
 */
export const RuleOperatorSelect: ReactFC<SelectProps<any, any>> = observer((props) => {
  const form = useForm();
  const field = form.fields['operator'];

  if (!isField(field)) {
    return null;
  }

  const value = field.value;
  const options = field.dataSource;
  const disabled = field.pattern === 'disabled' || field.pattern === 'readPretty';
  const onChange = (...args: any[]) => {
    field.onInput(...args);
  };
  const onFocus = (...args: any[]) => {
    field.onFocus(...args);
  };
  const onBlur = (...args: any[]) => {
    field.onBlur(...args);
  };

  return (
    <AntdSelect
      {...props}
      value={value}
      disabled={disabled}
      options={options}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
});
