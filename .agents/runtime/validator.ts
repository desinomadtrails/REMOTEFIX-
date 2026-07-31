// RemoteFix AI Runtime - Validator Module
export class OutputValidator {
  validate(code: string, rule: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // TypeScript strict validation rules checks
    if (rule === "typescript") {
      if (code.includes("any")) {
        errors.push("Type safety violation: use of 'any' type is forbidden.");
      }
      if (code.includes("!")) {
        errors.push("Type safety violation: non-null assertions are forbidden.");
      }
    }

    // Database rules validation checks
    if (rule === "database") {
      if (code.includes("rawSQL")) {
        errors.push("Database violation: raw SQL strings are forbidden.");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
