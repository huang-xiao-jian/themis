import dayjs from 'dayjs';

/** 将原始值（timestamp / undefined / null）转为 dayjs 实例 */
export function toDayjs(value: unknown): dayjs.Dayjs | undefined {
  if (value == null) return undefined;
  if (dayjs.isDayjs(value)) return value as dayjs.Dayjs;
  return dayjs(value as dayjs.ConfigType);
}

/** 将区间值（timestamp 元组 / undefined）转为 dayjs 实例元组 */
export function toDayjsRange(value: unknown): [dayjs.Dayjs, dayjs.Dayjs] | undefined {
  if (!Array.isArray(value) || value.length !== 2) return undefined;
  const [start, end] = value;
  const s = toDayjs(start);
  const e = toDayjs(end);
  if (!s || !e) return undefined;
  return [s, e];
}

/** 从 dayjs 实例提取 timestamp（ms），非 dayjs 值原样返回 */
export function fromDayjs(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (dayjs.isDayjs(value)) return (value as dayjs.Dayjs).valueOf();
  return value as number;
}

/** 从 dayjs 元组提取 timestamp 元组 */
export function fromDayjsRange(value: unknown): [number, number] | undefined {
  if (!Array.isArray(value) || value.length !== 2) return undefined;
  const [start, end] = value;
  const s = fromDayjs(start);
  const e = fromDayjs(end);
  if (s == null || e == null) return undefined;
  return [s, e];
}
