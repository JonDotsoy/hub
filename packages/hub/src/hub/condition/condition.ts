import { get } from "@jondotsoy/utils-js/get";
import type { ConditionDTO } from "../dtos/condition.dto.js";

const split = (value: string, delimiter: string) => {
  return value.split(delimiter);
};

const g = (...args: Parameters<typeof get>) => {
  const v = get(...args);
  if (typeof v === "string") return v;
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v;
  return null;
};

/** @deprecated prefer "@jondotsoy/condition" module */
export const evaluateCondition = (
  condition: ConditionDTO,
  context: unknown,
): boolean => {
  if ("equal" in condition) {
    const [field, value] = condition.equal;
    const fieldValue = get(context, ...split(field, "."));
    return fieldValue === value;
  }
  if ("or" in condition) {
    for (const subCondition of condition.or) {
      if (evaluateCondition(subCondition, context)) return true;
    }
    return false;
  }
  if ("and" in condition) {
    for (const subCondition of condition.and) {
      if (!evaluateCondition(subCondition, context)) return false;
    }
    return true;
  }

  if ("not" in condition) {
    return !evaluateCondition(condition.not, context);
  }

  if ("greaterThan" in condition) {
    const [field, value] = condition.greaterThan;
    const v = g(context, ...split(field, "."));
    if (v === null) return false;
    return v > value;
  }

  if ("lessThan" in condition) {
    const [field, value] = condition.lessThan;
    const v = g(context, ...split(field, "."));
    if (v === null) return false;
    return v < value;
  }

  if ("greaterThanOrEqual" in condition) {
    const [field, value] = condition.greaterThanOrEqual;
    const v = g(context, ...split(field, "."));
    if (v === null) return false;
    return v >= value;
  }

  if ("lessThanOrEqual" in condition) {
    const [field, value] = condition.lessThanOrEqual;
    const v = g(context, ...split(field, "."));
    if (v === null) return false;
    return v <= value;
  }

  throw new Error("Invalid condition");
};
