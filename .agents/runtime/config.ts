// RemoteFix AI Runtime - Config Module
export interface RuntimeConfig {
  tokenLimit: number;
  timeoutMs: number;
  parallelExecution: boolean;
  approvalPolicy: "auto" | "explicit";
  azureSqlTlsEnforced: boolean;
}

export const defaultConfig: RuntimeConfig = {
  tokenLimit: 12000,
  timeoutMs: 30000,
  parallelExecution: false,
  approvalPolicy: "explicit",
  azureSqlTlsEnforced: true,
};
