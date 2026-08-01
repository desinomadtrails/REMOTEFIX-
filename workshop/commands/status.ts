import { GitService } from "../services/GitService.js";
import { ProjectService } from "../services/ProjectService.js";

export async function handleStatus(): Promise<void> {
  const meta = ProjectService.getMetadata();
  const branch = GitService.getBranch();
  const status = GitService.getStatus();

  console.log(`==================================================`);
  console.log(`RemoteFix Project Status`);
  console.log(`==================================================`);
  console.log(`Project:        ${meta.projectName} (v${meta.projectVersion})`);
  console.log(`AI OS Version:  ${meta.aiOsVersion}`);
  console.log(`Branch:         ${branch}`);
  console.log(`Workspaces:     ${meta.structure.apps.length} Apps, ${meta.structure.packages.length} Packages`);
  console.log(`\nGit Status:`);
  console.log(status);
  console.log(`==================================================`);
}
