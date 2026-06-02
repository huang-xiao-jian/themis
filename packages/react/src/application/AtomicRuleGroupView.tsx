import type { ReactElement } from 'react';
import { useSisyphusScope } from '../access/useSisyphusScope';
import type { AtomicRuleGroupViewProperties } from './protocol';

/** 规则组编辑组件 */
export function AtomicRuleGroupView(props: AtomicRuleGroupViewProperties): ReactElement {
  const scope = useSisyphusScope();
  return scope.renderer().render(props);
}
