import { z } from "zod";
import type { ConditionDTO, conditions } from "../../hub/dtos/condition.dto";

namespace conditionsSchemas {
  export const ResourceField = z.string();
  export const CompareSchema = z.union([z.string(), z.number(), z.boolean()]);

  export const equalSchema: z.ZodType<conditions.equal> = z.object({
    equal: z.tuple([ResourceField, CompareSchema]),
  });

  export const greaterThanSchema: z.ZodType<conditions.greaterThan> = z.object({
    greaterThan: z.tuple([ResourceField, CompareSchema]),
  });

  export const lessThanSchema: z.ZodType<conditions.lessThan> = z.object({
    lessThan: z.tuple([ResourceField, CompareSchema]),
  });
  export const greaterThanOrEqualSchema: z.ZodType<conditions.greaterThanOrEqual> =
    z.object({
      greaterThanOrEqual: z.tuple([ResourceField, CompareSchema]),
    });
  export const lessThanOrEqualSchema: z.ZodType<conditions.lessThanOrEqual> =
    z.object({
      lessThanOrEqual: z.tuple([ResourceField, CompareSchema]),
    });
  export const andSchema: z.ZodType<conditions.and> = z.object({
    and: z.array(z.lazy(() => ConditionSchema)),
  });
  export const orSchema: z.ZodType<conditions.or> = z.object({
    or: z.array(z.lazy(() => ConditionSchema)),
  });
  export const notSchema: z.ZodType<conditions.not> = z.object({
    not: z.lazy(() => ConditionSchema),
  });
  export const ConditionSchema: z.ZodType<ConditionDTO> = z.union([
    equalSchema,
    greaterThanSchema,
    lessThanSchema,
    greaterThanOrEqualSchema,
    lessThanOrEqualSchema,
    andSchema,
    orSchema,
    notSchema,
  ]);
}

export const ConditionSchema: z.ZodType<ConditionDTO> =
  conditionsSchemas.ConditionSchema;
