// RemoteFix AI Engine - Skill Loader
import * as fs from "fs";
import * as path from "path";

export interface SkillDetails {
  name: string;
  purpose: string;
  checksRequired: string[];
}

export class SkillLoader {
  public static load(skillName: string): SkillDetails {
    const skillPath = path.resolve(process.cwd(), ".agents", "skills", skillName, "SKILL.md");
    if (!fs.existsSync(skillPath)) {
      throw new Error(`Skill ${skillName} not found in the frozen skills layer.`);
    }

    const content = fs.readFileSync(skillPath, "utf-8");
    const nameMatch = content.match(/name:\s*(.*)/);
    const purposeMatch = content.match(/## Purpose\s*([\s\S]*?)\n##/);

    return {
      name: nameMatch ? nameMatch[1].trim() : skillName,
      purpose: purposeMatch ? purposeMatch[1].trim() : "",
      checksRequired: [],
    };
  }
}
