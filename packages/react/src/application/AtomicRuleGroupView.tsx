import { useSisyphusScope } from '../access/useSisyphusScope';
import type { AtomicRuleGroupViewProperties } from './protocol';

/** 规则组编辑组件 */
export function AtomicRuleGroupView(props: AtomicRuleGroupViewProperties): React.ReactElement {
  const scope = useSisyphusScope();
  return scope.renderer().render(props);
}
