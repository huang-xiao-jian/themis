import type { ReactElement } from 'react';
import { useSisyphusScope } from '../access/useSisyphusScope';
import type { AtomicRuleViewProperties } from './protocol';

/** 原子规则编辑组件 */
export function AtomicRuleView(props: AtomicRuleViewProperties): ReactElement {
  const scope = useSisyphusScope();
  return scope.renderer().render(props);
}
