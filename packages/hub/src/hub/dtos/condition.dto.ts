export namespace conditions {
  export type ResourceField = string;
  export type Compare = string | number | boolean;

  export type equal = {
    equal: [ResourceField: ResourceField, compare: Compare];
  };
  export type greaterThan = {
    greaterThan: [ResourceField: ResourceField, compare: Compare];
  };
  export type lessThan = {
    lessThan: [ResourceField: ResourceField, compare: Compare];
  };
  export type greaterThanOrEqual = {
    greaterThanOrEqual: [ResourceField: ResourceField, compare: Compare];
  };
  export type lessThanOrEqual = {
    lessThanOrEqual: [ResourceField: ResourceField, compare: Compare];
  };
  export type and = { and: ConditionDTO[] };
  export type or = { or: ConditionDTO[] };
  export type not = { not: ConditionDTO };
}

export type ConditionDTO =
  | conditions.equal
  | conditions.greaterThan
  | conditions.lessThan
  | conditions.greaterThanOrEqual
  | conditions.lessThanOrEqual
  | conditions.and
  | conditions.or
  | conditions.not;
