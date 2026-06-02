import { useSisyphusScope } from '../access/useSisyphusScope';
import type { AtomicRuleViewProperties } from './protocol';

/** 原子规则编辑组件 */
export function AtomicRuleView(props: AtomicRuleViewProperties): React.ReactElement {
  const scope = useSisyphusScope();
  return scope.renderer().render(props);
}
