import { it, describe, expect } from "bun:test";
import type { ConditionDTO } from "../dtos/condition.dto.js";
import { evaluateCondition } from "./condition.js";

describe("evaluateCondition", () => {
  it("should evaluate a simple equal condition", () => {
    const condition: ConditionDTO = {
      equal: ["name", "lol"],
    };

    const context = {
      name: "lol",
    };

    expect(evaluateCondition(condition, context)).toBeTrue();
  });

  it("should evaluate an or condition", () => {
    const condition: ConditionDTO = {
      or: [
        {
          equal: ["name", "lol"],
        },
      ],
    };

    const context = {
      name: "lol",
    };

    expect(evaluateCondition(condition, context)).toBeTrue();
  });
  it("should evaluate an and condition", () => {
    const condition: ConditionDTO = {
      and: [
        {
          equal: ["name", "lol"],
        },
        {
          equal: ["age", "32"],
        },
      ],
    };

    const context = {
      name: "lol",
      age: "32",
    };

    expect(evaluateCondition(condition, context)).toBeTrue();
  });

  it("should evaluate a not condition", () => {
    const condition: ConditionDTO = {
      not: {
        equal: ["name", "lol"],
      },
    };

    const context = {
      name: "lola",
      age: "32",
    };

    expect(evaluateCondition(condition, context)).toBeTrue();
  });

  it("should evaluate a greaterThan condition", () => {
    const condition: ConditionDTO = {
      greaterThan: ["age", 30],
    };

    const context = {
      name: "lola",
      age: 32,
    };

    expect(evaluateCondition(condition, context)).toBeTrue();
  });

  it("should evaluate a lessThan condition", () => {
    const condition: ConditionDTO = {
      lessThan: ["age", 30],
    };

    const context = {
      name: "lola",
      age: 20,
    };

    expect(evaluateCondition(condition, context)).toBeTrue();
  });

  it("should evaluate a lessThanOrEqual condition", () => {
    const condition: ConditionDTO = {
      lessThanOrEqual: ["age", 30],
    };

    const context = {
      name: "lola",
      age: 30,
    };

    expect(evaluateCondition(condition, context)).toBeTrue();
  });

  it("should evaluate a greaterThanOrEqual condition", () => {
    const condition: ConditionDTO = {
      greaterThanOrEqual: ["age", 30],
    };

    const context = {
      name: "lola",
      age: 30,
    };

    expect(evaluateCondition(condition, context)).toBeTrue();
  });
});
