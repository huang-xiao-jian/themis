import { observer, ReactFC, useForm } from '@formily/react';
import { Select as AntdSelect } from 'antd';
import { SelectProps } from 'antd/lib/select';

/**
 * formily/react 不支持 react 19 版本，只能使用 formily/core 核心
 */
export const RuleOperatorSelect: ReactFC<SelectProps<any, any>> = observer((props) => {
  const form = useForm();
  const field = form.getFieldState('operator');

  return <AntdSelect {...props} options={field.dataSource} />;
});
