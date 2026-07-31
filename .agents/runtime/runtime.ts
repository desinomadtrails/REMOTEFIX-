// RemoteFix AI Runtime - Main Unified Engine Entry
import { TaskRouter } from "./task_router";
import { PlanGenerator } from "./planner";
import { WorkflowEngine } from "./workflow_engine";
import { Executor } from "./executor";
import { StructuredLogger } from "./logger";
import { MetricsCollector } from "./metrics";
import { defaultConfig, RuntimeConfig } from "./config";

export class RuntimeEngine {
  private router = new TaskRouter();
  private planner = new PlanGenerator();
  private logger = new StructuredLogger("run-100");
  private metrics = new MetricsCollector();
  private workflow = new WorkflowEngine(this.logger);
  private executor = new Executor(this.logger);
  private config: RuntimeConfig;

  constructor(config = defaultConfig) {
    this.config = config;
  }

  async run(taskInput: string): Promise<boolean> {
    this.logger.info(`Starting execution of task input: "${taskInput}"`);
    this.metrics.trackRouting(taskInput);

    const task = this.router.route(taskInput);
    this.logger.info(`Routed task to: ${task.category}`);

    const plan = this.planner.generate(task);
    this.logger.info(`Execution plan generated with ${plan.steps.length} steps.`);

    const success = await this.workflow.runWorkflow(plan, async (skill, action) => {
      this.metrics.trackSkill(skill);
      // Run execution action
      return await this.executor.execute(plan);
    });

    if (!success) {
      this.executor.rollback(plan);
      return false;
    }

    this.logger.info("Task completed successfully.");
    return true;
  }
}
