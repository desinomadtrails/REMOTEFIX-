export interface ReviewResult {
  overallAssessment: string;
  approved: boolean;
  confidence: "Low" | "Medium" | "High";
  leanCompliance: string;
  architectureReview: string;
  affectedAreasReview: string[];
  missingFiles: string[];
  unnecessaryFiles: string[];
  riskAssessment: string[];
  alternativeApproaches: string[];
  verificationChecklist: string[];
  recommendation: "Approve" | "Revise" | "Reject";
}
