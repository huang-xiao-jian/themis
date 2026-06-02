import { useSisyphusScope } from '../access/useSisyphusScope';
import type { RuleWorkspaceViewProperties } from './protocol';

/** 工作空间编辑组件 */
export function RuleWorkspaceView(props: RuleWorkspaceViewProperties): React.ReactElement {
  const scope = useSisyphusScope();
  return scope.renderer().render(props);
}
