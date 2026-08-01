import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { WorkspaceContext, ImplementationPlan, ReviewResult, ImplementationProposal, VerificationResult } from "@remotefix/types";

export interface ExecutionReport {
  status: "success" | "failure";
  workspace: string;
  patchesApplied: number;
  filesModified: string[];
  typecheck: "PASS" | "FAIL";
  tests: "PASS" | "FAIL";
  duration: string;
  errors: string[];
  warnings: string[];
  nextStep: string;
}

export class ExecutionEngine {
  public static async executeProposal(
    context: WorkspaceContext,
    userRequest: string,
    plan: ImplementationPlan,
    review: ReviewResult,
    implementation: ImplementationProposal,
    verification: VerificationResult,
    repoPath: string
  ): Promise<ExecutionReport> {
    const startTime = Date.now();
    const branchName = `feature/remotefix-execution-${Date.now()}`;
    const tempWorktreePath = path.join(repoPath, "tmp", `worktree-${Date.now()}`);
    const report: ExecutionReport = {
      status: "failure",
      workspace: branchName,
      patchesApplied: 0,
      filesModified: [],
      typecheck: "FAIL",
      tests: "FAIL",
      duration: "0s",
      errors: [],
      warnings: [],
      nextStep: "Verification Failed",
    };

    // 1. Verify Verification Result is Proceed and verified/passed
    const isVerified = verification.passed === true || (verification as any).verified === true;
    const isProceed = (verification as any).recommendation === "Proceed";
    if (!isVerified || !isProceed) {
      report.errors.push("Execution blocked: VerificationResult is not verified or recommendation is not Proceed.");
      return report;
    }

    try {
      // Create isolated branch
      execSync(`git branch ${branchName}`, { cwd: repoPath, stdio: "ignore" });
      
      // Ensure temp/tmp directory exists
      fs.mkdirSync(path.dirname(tempWorktreePath), { recursive: true });

      // Create Git Worktree
      execSync(`git worktree add "${tempWorktreePath}" ${branchName}`, { cwd: repoPath, stdio: "ignore" });

      // Link node_modules so compilation tools and packages resolve dependencies
      this.symlinkWorkspaceNodeModules(repoPath, tempWorktreePath);
    } catch (err: any) {
      report.errors.push(`Workspace creation failed: ${err.message || err}`);
      report.nextStep = "Manual intervention required: failed to establish git worktree.";
      return report;
    }

    let patchesApplied = 0;
    const filesModified: string[] = [];

    try {
      // 2. Create proposed new files
      for (const file of implementation.filesToCreate || []) {
        const filePath = path.join(tempWorktreePath, file);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, "/* Created by RemoteFix Safe Execution Engine */\n", "utf8");
        filesModified.push(file);
      }

      // 3. Apply patches / diffs
      for (const diffText of implementation.diffs || []) {
        const applied = this.applyUnifiedDiff(tempWorktreePath, diffText);
        if (applied) {
          patchesApplied++;
        }
      }

      // Record modified files list
      for (const file of implementation.filesToModify || []) {
        if (!filesModified.includes(file)) {
          filesModified.push(file);
        }
      }

      report.patchesApplied = patchesApplied;
      report.filesModified = filesModified;

      // 4. Run typecheck validation
      try {
        execSync("npm run typecheck", { cwd: tempWorktreePath });
        report.typecheck = "PASS";
      } catch (err: any) {
        report.typecheck = "FAIL";
        const errMsg = err.stdout?.toString() || err.stderr?.toString() || err.message || err;
        report.errors.push(`Typecheck validation failed: ${errMsg}`);
        throw new Error("Validation step failed: typecheck");
      }

      // 5. Run test validation
      try {
        execSync("npm run test", { cwd: tempWorktreePath });
        report.tests = "PASS";
      } catch (err: any) {
        report.tests = "FAIL";
        const errMsg = err.stdout?.toString() || err.stderr?.toString() || err.message || err;
        report.errors.push(`Test validation failed: ${errMsg}`);
        throw new Error("Validation step failed: test suite");
      }

      // SUCCESS
      report.status = "success";
      report.nextStep = "Ready for Commit";
    } catch (err: any) {
      report.status = "failure";
      if (report.errors.length === 0) {
        report.errors.push(err.message || "Failed to apply changes or validate.");
      }
      report.nextStep = "Check failures and revise implementation proposal.";
    } finally {
      // Clean up the temporary worktree safely without modifying the user's original files
      try {
        execSync(`git worktree remove --force "${tempWorktreePath}"`, { cwd: repoPath, stdio: "ignore" });
      } catch (cleanErr) {
        console.warn("[Execution Engine] Failed to remove git worktree via git command:", cleanErr);
      }

      // Delete the directory if it still exists
      if (fs.existsSync(tempWorktreePath)) {
        try {
          fs.rmSync(tempWorktreePath, { recursive: true, force: true });
        } catch (rmErr) {
          console.warn("[Execution Engine] Failed to rm directory:", rmErr);
        }
      }

      // Delete the temporary branch if execution failed (so we don't pollute the repository)
      if (report.status === "failure") {
        try {
          execSync(`git branch -D ${branchName}`, { cwd: repoPath, stdio: "ignore" });
        } catch (branchErr) {
          console.warn("[Execution Engine] Failed to delete temporary branch:", branchErr);
        }
      }
    }

    report.duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
    return report;
  }

  private static applyUnifiedDiff(worktreePath: string, diffText: string): boolean {
    const lines = diffText.split("\n");
    let fileToPatch = "";
    const oldLines: string[] = [];
    const newLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith("--- ")) {
        // old file
      } else if (line.startsWith("+++ ")) {
        fileToPatch = line.substring(4).replace(/^new\//, "").replace(/^a\//, "").replace(/^b\//, "").trim();
      } else if (line.startsWith("- ")) {
        oldLines.push(line.substring(2));
      } else if (line.startsWith("+ ")) {
        newLines.push(line.substring(2));
      }
    }

    if (!fileToPatch) return false;
    const filePath = path.join(worktreePath, fileToPatch);
    if (!fs.existsSync(filePath)) {
      // Create empty file if modifying a file that doesn't exist
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, "", "utf8");
    }

    let content = fs.readFileSync(filePath, "utf8");
    if (oldLines.length > 0) {
      const oldBlock = oldLines.join("\n");
      const newBlock = newLines.join("\n");
      if (content.includes(oldBlock)) {
        content = content.replace(oldBlock, newBlock);
      } else {
        // Fallback: append changes if exact match not found
        content += (content.endsWith("\n") ? "" : "\n") + newBlock;
      }
    } else {
      content += (content.endsWith("\n") ? "" : "\n") + newLines.join("\n");
    }

    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }

  private static symlinkWorkspaceNodeModules(srcRoot: string, destRoot: string) {
    this.symlinkJunction(path.join(srcRoot, "node_modules"), path.join(destRoot, "node_modules"));

    const pathsToLink = [
      "apps/api",
      "apps/admin",
      "apps/web",
      "packages/auth",
      "packages/database",
      "packages/types",
      "packages/ui",
      "packages/utils",
    ];

    for (const subPath of pathsToLink) {
      const srcSubNodeModules = path.join(srcRoot, subPath, "node_modules");
      const destSubNodeModules = path.join(destRoot, subPath, "node_modules");
      if (fs.existsSync(srcSubNodeModules)) {
        fs.mkdirSync(path.dirname(destSubNodeModules), { recursive: true });
        this.symlinkJunction(srcSubNodeModules, destSubNodeModules);
      }
    }
  }

  private static symlinkJunction(src: string, dest: string) {
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      try {
        fs.symlinkSync(src, dest, "junction");
      } catch (err) {
        console.warn(`[Execution Engine] Failed to symlink junction from ${src} to ${dest}:`, err);
      }
    }
  }
}
