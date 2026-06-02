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
}

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
} satisfies SisyphusAntdConfig;
