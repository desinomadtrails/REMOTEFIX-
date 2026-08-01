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

    // Lean Code validation checks
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

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
