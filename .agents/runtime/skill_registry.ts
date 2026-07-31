// RemoteFix AI Runtime - Skill Registry Module
export interface SkillDescriptor {
  name: string;
  dependencies: string[];
  capabilities: string[];
}

export class SkillRegistry {
  private registry = new Map<string, SkillDescriptor>();

  constructor() {
    this.register("architect", { name: "Architect", dependencies: ["database"], capabilities: ["design", "adr"] });
    this.register("planner", { name: "Planner", dependencies: [], capabilities: ["planning", "risk"] });
    this.register("implementer", { name: "Implementer", dependencies: ["architect"], capabilities: ["code"] });
    this.register("reviewer", { name: "Reviewer", dependencies: [], capabilities: ["lint", "audit"] });
    this.register("debugger", { name: "Debugger", dependencies: ["testing"], capabilities: ["diagnostic"] });
    this.register("database", { name: "Database", dependencies: ["architect"], capabilities: ["migration"] });
    this.register("testing", { name: "Testing", dependencies: [], capabilities: ["unit-test"] });
  }

  register(name: string, descriptor: SkillDescriptor) {
    this.registry.set(name, descriptor);
  }

  lookup(name: string): SkillDescriptor | undefined {
    return this.registry.get(name);
  }

  dependencies(name: string): string[] {
    return this.registry.get(name)?.dependencies || [];
  }

  capabilities(name: string): string[] {
    return this.registry.get(name)?.capabilities || [];
  }
}
