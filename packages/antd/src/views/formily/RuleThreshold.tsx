import { isField } from '@formily/core';
import { observer, ReactFC, useForm } from '@formily/react';
import { ThresholdRenderer, ThresholdRendererProps } from '../../components/ThresholdRenderer';

/**
 * formily/react 不支持 react 19 版本，只能使用 formily/core 核心
 */
export const RuleThresholdRenderer: ReactFC<any> = observer((props) => {
  const form = useForm();
  const field = form.fields['threshold'];

  if (!isField(field)) {
    return null;
  }

  const value = field.value;
  const onChange = (...args: any[]) => {
    field.onInput(...args);
  };
  const componentProps = field.componentProps;

  if ('properties' in componentProps) {
    return (
      <ThresholdRenderer
        {...(componentProps as ThresholdRendererProps)}
        value={value}
        onChange={onChange}
      />
    );
  }
});
