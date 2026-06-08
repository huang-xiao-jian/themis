import { createForm, onFieldValueChange, onFormReact, type Form } from '@formily/core';
import { AtomicRule } from '../dsl';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import type { OperatorInferrer } from '../inferrer/OperatorInferrer';
import type { ThresholderInferrer } from '../inferrer/ThresholderInferrer';

/**
 * 原子规则表单 = Formily Form
 *
 * **设计原则**：Form 内部不接触 Signal，仅使用 Formily 自有响应式机制。
 * 编辑态数据与外部隔离，推断结果留在 Form 字段内部，不进行数据传输。
 *
 * 创建阶段通过有限接口与外部通讯：
 * - 输入：`factors`（纯数据）、`inferrers`（推断器）、`initialValues`
 * - 输出：无（Form 完全自治）
 *
 * **状态约束**：表单 pattern 由所属 AtomicRuleScheduler 控制
 * - EDITING → `pattern = 'editable'`
 * - LOCKED → `pattern = 'disabled'`
 *
 * 三个核心字段（由 createField 创建）：
 * - name：规则因子（Select，dataSource 来源于 Group 级 factors）
 * - operator：操作符（Select，dataSource 来源于推断结果）
 * - threshold：阈值（动态组件，组件类型来源于推断结果）
 */
export type AtomicRuleForm = Form;

/** 推断器组合 */
export interface Inferrers {
  readonly operator: OperatorInferrer;
  readonly thresholder: ThresholderInferrer;
}

/** createAtomicRuleForm 的配置选项 */
export interface CreateAtomicRuleFormOptions {
  /** 可用规则因子定义列表（纯数据） */
  readonly factors: readonly RuleFactorDefinition[];
  /** 推断器（operator + thresholder） */
  readonly inferrers: Inferrers;
  /** 编辑场景初始值（直接传入 createForm，字段创建时自动消费） */
  readonly initialValues?: Partial<AtomicRule>;
}

/**
 * 创建 AtomicRuleForm 实例
 *
 * effects 中：
 * - name 变化时重置 operator / threshold
 * - name 变化时推断 operators / thresholder
 */
export function createAtomicRuleForm(options: CreateAtomicRuleFormOptions): AtomicRuleForm {
  const { factors, inferrers, initialValues } = options;

  const form = createForm<AtomicRule>({
    initialValues,
    effects() {
      // name 变化时推断 operators / thresholder
      onFormReact((form: Form<AtomicRule>) => {
        const name = form.values.name;
        const factor = name ? (factors.find((f) => f.name === name) ?? null) : null;

        if (factor) {
          form.setFieldState('operator', {
            dataSource: Array.from(inferrers.operator.infer(factor)),
          });

          const $threshold = form.query('threshold').take();

          if ($threshold) {
            $threshold.setComponentProps({
              properties: inferrers.thresholder.infer(factor),
            });
          }
        }
      });

      // name 变化时重置 operator / threshold
      onFieldValueChange('name', (field, form: Form<AtomicRule>) => {
        form.setFieldState('operator', { value: undefined });
        form.setFieldState('threshold', { value: undefined });
      });
    },
  });

  // explicitly create fields to activate reactions
  form.createField({ name: 'name' });
  form.createField({ name: 'operator' });
  form.createField({ name: 'threshold' });

  return form;
}
