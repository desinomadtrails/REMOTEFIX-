export interface ChangeItem {
  file: string;
  reason: string;
  changeType: "modify" | "create" | "delete";
  description: string;
}

export interface ImplementationProposal {
  summary: string;
  status: "proposed";
  filesToModify: string[];
  filesToCreate: string[];
  filesToDelete: string[];
  implementationOrder: string[];
  changes: ChangeItem[];
  diffs: string[];
  estimatedImpact: string;
  validationChecklist: string[];
}
