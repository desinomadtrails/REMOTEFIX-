// RemoteFix AI Engine - Validation Manager
export interface ValidationReport {
  valid: boolean;
  errors: string[];
  rulesApplied: string[];
}

export class ValidationManager {
  public static validate(code: string, ruleSet: string[]): ValidationReport {
    const errors: string[] = [];

    for (const rule of ruleSet) {
      if (rule === "typescript") {
        if (code.includes("any")) {
          errors.push("TS Violation: use of implicit or explicit 'any' is forbidden.");
        }
      }
      if (rule === "database") {
        if (code.includes("rawSQL")) {
          errors.push("DB Violation: raw sql queries bypass Drizzle ORM schemas.");
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      rulesApplied: ruleSet,
    };
  }
}
