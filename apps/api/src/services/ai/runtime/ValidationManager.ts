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
      if (rule === "lean-code") {
        if (code.includes("todo") || code.includes("TODO") || code.includes("FIXME")) {
          errors.push("Lean Code violation: code contains placeholders, TODOs, or dead code markers.");
        }
        if (code.includes("Wrapper") || code.includes("PassThrough") || code.includes("Delegator")) {
          errors.push("Lean Code violation: suspected unnecessary wrapper or pass-through class detected.");
        }
        if (code.includes("for future use") || code.includes("futureUse") || code.includes("placeholder")) {
          errors.push("Lean Code violation: code contains abstractions created 'for future use'.");
        }
        // Check for duplicate imports
        const importLines = code.match(/import\s+.*\s+from\s+['"].*['"]/g) || [];
        const importSources = importLines.map(line => {
          const match = line.match(/from\s+['"](.*)['"]/);
          return match ? match[1] : "";
        }).filter(Boolean);
        const uniqueSources = new Set(importSources);
        if (uniqueSources.size < importSources.length) {
          errors.push("Lean Code violation: duplicate module imports detected.");
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
