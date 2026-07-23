import fs from "fs";
import path from "path";

const SEARCH_DIR = "e:/SURAJ/REMOTEFIX-";

async function runSecurityAudit() {
  console.log("🛡️  Starting Security Audit Static Code Analysis...");
  
  const issues: string[] = [];
  
  function scanDir(dir: string) {
    if (dir.includes("node_modules") || dir.includes(".git") || dir.includes("dist")) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (stat.isFile() && (file.endsWith(".ts") || file.endsWith(".tsx"))) {
        const content = fs.readFileSync(fullPath, "utf-8");
        
        // 1. Raw SQL Injection check
        if (content.includes("sql`") && content.includes("+")) {
          issues.push(`⚠️  Potential SQL Concatenation Injection in: ${fullPath}`);
        }
        
        // 2. Hardcoded secrets check
        if (content.includes("JWT_SECRET =") || content.includes("PASSWORD =")) {
          if (!fullPath.includes("client.ts") && !fullPath.includes("api-test.ts") && !fullPath.includes("env.ts") && !fullPath.includes(".env")) {
            issues.push(`⚠️  Potential Hardcoded Secret found in: ${fullPath}`);
          }
        }
        
        // 3. CORS Check (wildcards)
        if (file.includes("index.ts") && content.includes("origin: \"*\"")) {
          issues.push(`💡 CORS Config allows wildcard "*" origin in: ${fullPath} (Recommend restricting for Production)`);
        }
      }
    }
  }
  
  scanDir(SEARCH_DIR);
  
  console.log("\n====================================================");
  console.log("🛡️  SECURITY AUDIT FINDINGS");
  console.log("====================================================");
  if (issues.length === 0) {
    console.log("✅ No immediate security concerns found.");
  } else {
    issues.forEach(issue => console.log(issue));
  }
  console.log("====================================================\n");
  
  process.exit(0);
}

runSecurityAudit();
