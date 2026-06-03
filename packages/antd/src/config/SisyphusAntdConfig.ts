/** AtomicRule 行布局配置 */
export interface AtomicRuleLayout {
  /** name 列 flex 值，默认 '180px' */
  readonly name?: string;
  /** operator 列 flex 值，默认 '140px' */
  readonly operator?: string;
  /** threshold 列 flex 值，默认 'auto' */
  readonly threshold?: string;
  /** action 列 flex 值，默认 'none' */
  readonly action?: string;
  /** 列间距，默认 8 */
  readonly gutter?: number;
}

/**
 * antd 适配器配置
 *
 * 对于无法从表单组件属性推断的配置（如尺寸策略、placeholder 模板等），
 * 通过此配置对象集中管理，由 SisyphusAntdProvider 注入
 */
export interface SisyphusAntdConfig {
  /** 尺寸策略，默认 'middle' */
  readonly size?: 'small' | 'middle' | 'large';
  /** placeholder 模板 */
  readonly placeholderTemplate?: {
    readonly input?: string;
    readonly select?: string;
  };
  /** Switch 的 checked/unChecked 内容 */
  readonly switchLabels?: {
    readonly checked?: string;
    readonly unChecked?: string;
  };
  /** AtomicRule 行布局配置 */
  readonly atomicRuleLayout?: AtomicRuleLayout;
}

/** 默认 AtomicRule 行布局 */
export const DEFAULT_ATOMIC_RULE_LAYOUT = {
  name: '180px',
  operator: '140px',
  threshold: 'auto',
  action: 'none',
  gutter: 8,
} as const satisfies Required<AtomicRuleLayout>;

/** 默认配置 */
export const DEFAULT_SISYPHUS_ANTD_CONFIG = {
  size: 'middle' as const,
  placeholderTemplate: {
    input: '请输入',
    select: '请选择',
  },
  switchLabels: {
    checked: '是',
    unChecked: '否',
  },
  atomicRuleLayout: DEFAULT_ATOMIC_RULE_LAYOUT,
} satisfies SisyphusAntdConfig;
