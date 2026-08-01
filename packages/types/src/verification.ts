export interface VerificationResult {
  summary: string;
  passed: boolean;
  durationMs: number;
  assertionsCount: number;
  failures: string[];
  coverageSummary?: string;
}
