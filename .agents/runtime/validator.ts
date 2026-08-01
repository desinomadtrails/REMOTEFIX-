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

      // Wrapper Justification Validation
      const wrapperRegex = /\bclass\s+(\w*(?:Wrapper|Adapter|Facade|Manager|Helper|Repository|Provider|Utility|Service|Abstraction))\b/g;
      let match;
      let totalWrappers = 0;
      const unjustified: string[] = [];

      while ((match = wrapperRegex.exec(code)) !== null) {
        const className = match[1];
        totalWrappers++;
        // Check if there is a documented Wrapper Justification in the code for this class
        const hasJustification = code.includes("Wrapper Justification:") || 
                                  code.includes(`Wrapper Justification for ${className}`) || 
                                  (code.includes("1. What existing API") && code.includes("2. Why can't"));
        if (!hasJustification) {
          unjustified.push(className);
        }
      }

      if (totalWrappers > 0) {
        const justificationStatus = unjustified.length === 0 ? "PASSED" : "FAILED";
        if (justificationStatus === "FAILED") {
          errors.push(`Wrapper Justification Validation Status: FAILED`);
          errors.push(`  - Total wrappers found: ${totalWrappers}`);
          errors.push(`  - Unjustified wrappers: [${unjustified.join(", ")}]`);
          unjustified.forEach(name => {
            errors.push(`  - Lean Code violation: Wrapper '${name}' has no documented engineering value justification.`);
            errors.push(`    Recommended removal: Delete '${name}' or replace it with a direct function call.`);
          });
        } else {
          // If all justified, we can still report it in validation errors or log it. But errors list is for failing checks, so we don't block.
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
