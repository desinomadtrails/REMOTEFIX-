export interface PromptTemplate {
  name: string;
  version: string;
  category: string;
  description: string;
  systemPrompt: string;
  template: string;
  temperature: number;
  maxTokens: number;
}

export class PromptRegistry {
  private static prompts: Record<string, PromptTemplate> = {
    triage: {
      name: "ticket_triage",
      version: "v1.2",
      category: "Triage",
      description: "Classifies ticket category and recommended SLA priority.",
      systemPrompt: "You are RemoteFix Enterprise AI Triage Officer. Classify issues into categories: Hardware Failure, Network / Connectivity, OS & Software, Security Incident, Peripherals.",
      template: "Subject: {{subject}}\nDescription: {{description}}\nAnalyze category and SLA priority.",
      temperature: 0.2,
      maxTokens: 512,
    },
    diagnosis: {
      name: "incident_diagnosis",
      version: "v1.1",
      category: "Diagnosis",
      description: "Generates root cause analysis and step-by-step resolution script.",
      systemPrompt: "You are RemoteFix Senior Hardware & Systems Diagnostic Engineer. Provide root cause and resolution steps.",
      template: "Device: {{deviceType}}\nProblem: {{subject}} - {{description}}\nGenerate root cause and repair steps.",
      temperature: 0.3,
      maxTokens: 1024,
    },
    customer_chat: {
      name: "customer_support_chat",
      version: "v2.0",
      category: "Support",
      description: "Handles customer self-service support queries.",
      systemPrompt: "You are RemoteFix Customer Virtual Assistant. Be helpful, concise, and professional.",
      template: "Customer: {{customerName}}\nMessage: {{userMessage}}",
      temperature: 0.5,
      maxTokens: 800,
    },
    executive_report: {
      name: "executive_summary_report",
      version: "v1.0",
      category: "Reporting",
      description: "Generates SLA compliance and IT asset health summary.",
      systemPrompt: "You are RemoteFix Chief Information Officer AI Analyst. Synthesize IT asset metrics into executive summary.",
      template: "Organization: {{organizationName}}\nPeriod: {{period}}\nGenerate executive summary.",
      temperature: 0.4,
      maxTokens: 2048,
    },
  };

  public static getPrompt(name: string): PromptTemplate {
    return this.prompts[name] || this.prompts["triage"];
  }

  public static renderPrompt(templateName: string, variables: Record<string, string>): { prompt: string; template: PromptTemplate } {
    const tpl = this.getPrompt(templateName);
    let text = tpl.template;
    for (const [key, val] of Object.entries(variables)) {
      text = text.replace(new RegExp(`{{${key}}}`, "g"), val || "");
    }
    return { prompt: text, template: tpl };
  }
}
