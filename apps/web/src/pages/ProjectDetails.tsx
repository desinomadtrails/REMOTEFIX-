import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  GitBranch, 
  GitCommit, 
  ArrowLeft,
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Play, 
  Code,
  FileCode,
  Layers,
  Activity,
  History,
  Send,
  Loader2,
  ListTodo,
  FileCheck
} from "lucide-react";
import { Button, Card } from "@remotefix/ui";
import { api } from "../services/api.js";
import { SEO } from "../components/SEO.js";

type TabType = "chat" | "intelligence" | "context" | "history";

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [chatPrompt, setChatPrompt] = useState("");
  const [activeWorkflow, setActiveWorkflow] = useState<any>(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [workflowError, setWorkflowError] = useState("");
  const [fakeStage, setFakeStage] = useState<string>("PLANNING");
  const intervalRef = useRef<any>(null);

  if (!id) return null;

  // Query Project details
  const { data: projectDetailsData } = useQuery({
    queryKey: ["projectDetails", id],
    queryFn: () => api.getProjectById(id),
  });

  // Query Project Repository Intelligence
  const { data: repoIntelData, isLoading: isIntelLoading } = useQuery({
    queryKey: ["repoIntel", id],
    queryFn: () => api.getRepositoryIntelligence(id),
  });

  // Query Project Workspace Context
  const { data: contextData, isLoading: isContextLoading } = useQuery({
    queryKey: ["workspaceContext", id],
    queryFn: () => api.getWorkspaceContext(id),
  });

  const project = projectDetailsData?.project;
  const repositoryInfo = repoIntelData?.repository || {};
  const summary = repositoryInfo.summary || repoIntelData?.summary || {};
  const statistics = repositoryInfo.statistics || {};
  const contextInfo = contextData?.context || {};

  const projectName = project?.name || summary.name || "Workspace";
  const projectPath = project?.path || summary.path || "Resolving directory path...";

  // Orchestrator mutation
  const runMutation = useMutation({
    mutationFn: (promptText: string) => api.runOrchestrator(id, { request: promptText }),
    onSuccess: (data) => {
      setIsOrchestrating(false);
      setActiveWorkflow(data.report);
      clearInterval(intervalRef.current);
    },
    onError: (err: any) => {
      setIsOrchestrating(false);
      setWorkflowError(err.message || "Pipeline execution failed.");
      clearInterval(intervalRef.current);
    }
  });

  const handleStartWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    setWorkflowError("");
    setActiveWorkflow(null);
    setIsOrchestrating(true);
    setFakeStage("PLANNING");

    // Start a stage transition simulator to keep the screen alive with progress
    let stages = ["PLANNING", "REVIEWING", "IMPLEMENTING", "VERIFYING", "EXECUTING"];
    let currentIndex = 0;
    intervalRef.current = setInterval(() => {
      if (currentIndex < stages.length - 1) {
        currentIndex++;
        setFakeStage(stages[currentIndex]);
      }
    }, 4000);

    runMutation.mutate(chatPrompt);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title={`${projectName} - RemoteFix Console`} />

      {/* Back link */}
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Project Meta header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-[#374151]/40 bg-[#111827]/20 p-6 rounded-2xl mb-8 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{projectName}</h1>
            <span className="text-xs bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-0.5 rounded border border-[#00E5FF]/20 font-mono">
              Git Active
            </span>
          </div>
          <p className="text-gray-400 text-sm font-mono mt-1" title={projectPath}>
            {projectPath}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-1.5 bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-700/45">
            <GitBranch size={14} className="text-[#00E5FF]" />
            <span>Branch: {summary.currentBranch || "main"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-700/45">
            <GitCommit size={14} className="text-[#00E5FF]" />
            <span>Default: {summary.defaultBranch || "main"}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigators */}
      <div className="flex border-b border-[#374151]/50 gap-6 mb-8 overflow-x-auto pb-[1px]">
        {[
          { id: "chat", label: "AI Chat Console", icon: <Terminal size={16} /> },
          { id: "context", label: "Workspace Context", icon: <Layers size={16} /> },
          { id: "intelligence", label: "Repository Intel", icon: <Activity size={16} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as TabType)}
            className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === t.id 
                ? "border-[#00E5FF] text-[#00E5FF]" 
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Active Tab Screen */}
      <div className="min-h-96">
        
        {/* Tab 1: AI Chat Console */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Input Form Column */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md flex flex-col h-full">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Terminal size={18} className="text-[#00E5FF]" />
                  Orchestrate Goal
                </h3>
                <p className="text-gray-400 text-xs mb-6">
                  Input a goal description. The orchestrator will coordinate the planning, review, implementation, verification, and execution stages in your isolated branch.
                </p>

                <form onSubmit={handleStartWorkflow} className="space-y-4 mt-auto">
                  <textarea
                    rows={6}
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    placeholder="e.g., Modify the test assertions in tests/mock_exec_temp.txt or refactor app metrics."
                    className="w-full bg-[#1E293B] border border-[#475569] text-white rounded-lg p-3 text-sm outline-none focus:border-[#00E5FF] resize-none"
                    disabled={isOrchestrating}
                    required
                  />
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full flex items-center justify-center gap-2 cursor-pointer"
                    disabled={isOrchestrating}
                  >
                    {isOrchestrating ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Run AI Pipeline
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Pipeline Output Column */}
            <div className="lg:col-span-2">
              
              {/* Dynamic Loading Workflow State */}
              {isOrchestrating && (
                <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md animate-pulse">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Loader2 size={18} className="text-[#00E5FF] animate-spin" />
                    Executing Workspace Validation Workflow
                  </h3>
                  
                  {/* Stages Timeline Visualizer */}
                  <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-800">
                    {[
                      { id: "PLANNING", label: "Planning Engine - Analyzing project structure" },
                      { id: "REVIEWING", label: "Review Engine - Validating plan guidelines" },
                      { id: "IMPLEMENTING", label: "Implementation Engine - Generating proposal diffs" },
                      { id: "VERIFYING", label: "Verification Engine - Cross-checking scope assertions" },
                      { id: "EXECUTING", label: "Safe Execution Engine - Worktree isolation & testing" }
                    ].map((stage, idx) => {
                      const stagesList = ["PLANNING", "REVIEWING", "IMPLEMENTING", "VERIFYING", "EXECUTING"];
                      const currentActiveIdx = stagesList.indexOf(fakeStage);
                      const isPast = idx < currentActiveIdx;
                      const isActive = idx === currentActiveIdx;
                      
                      return (
                        <div key={stage.id} className="flex items-start gap-4 pl-8 relative">
                          <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 transform -translate-x-[2px] mt-1.5 transition-all ${
                            isPast 
                              ? "bg-emerald-500 border-emerald-500" 
                              : isActive 
                                ? "bg-[#00E5FF] border-[#00E5FF] animate-ping" 
                                : "bg-gray-800 border-gray-700"
                          }`} />
                          <div>
                            <p className={`text-sm font-semibold ${isActive ? "text-[#00E5FF]" : isPast ? "text-emerald-400" : "text-gray-500"}`}>
                              {stage.id}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{stage.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Final Consolidated Report Renders */}
              {activeWorkflow && (
                <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">Consolidated Pipeline Report</h3>
                      <p className="text-xs text-gray-500 mt-1">Status: {activeWorkflow.status} | Total Duration: {activeWorkflow.duration}</p>
                    </div>
                    {activeWorkflow.status === "Completed" ? (
                      <span className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold">
                        <CheckCircle2 size={14} />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-semibold">
                        <XCircle size={14} />
                        Failed
                      </span>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Goal Summary</h4>
                    <p className="text-sm bg-gray-900/60 p-3 rounded-lg border border-gray-800 text-gray-300">
                      {activeWorkflow.summary}
                    </p>
                  </div>

                  {/* Timeline listing */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Execution Timeline</h4>
                    <div className="space-y-3">
                      {activeWorkflow.timeline.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-900/40 p-3 rounded-lg border border-gray-800 text-sm">
                          <div className="flex items-center gap-2">
                            {item.status === "success" ? (
                              <CheckCircle2 size={16} className="text-emerald-400" />
                            ) : (
                              <XCircle size={16} className="text-red-400" />
                            )}
                            <span className="font-semibold text-white">{item.stage}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                            <span>{item.duration}</span>
                            <span>{new Date(item.startTime).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Execution patches report if successful */}
                  {activeWorkflow.execution && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Execution Sandbox Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800 text-sm">
                          <span className="text-gray-500 block text-xs">Typecheck</span>
                          <span className={`font-bold mt-1 block ${activeWorkflow.execution.typecheck === "PASS" ? "text-emerald-400" : "text-red-400"}`}>
                            {activeWorkflow.execution.typecheck}
                          </span>
                        </div>
                        <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-800 text-sm">
                          <span className="text-gray-500 block text-xs">Test Suites</span>
                          <span className={`font-bold mt-1 block ${activeWorkflow.execution.tests === "PASS" ? "text-emerald-400" : "text-red-400"}`}>
                            {activeWorkflow.execution.tests}
                          </span>
                        </div>
                      </div>
                      
                      {activeWorkflow.execution.filesModified && activeWorkflow.execution.filesModified.length > 0 && (
                        <div>
                          <span className="text-gray-500 block text-xs mb-2">Files Modified</span>
                          <div className="flex flex-wrap gap-2">
                            {activeWorkflow.execution.filesModified.map((file: string, fidx: number) => (
                              <span key={fidx} className="bg-[#00E5FF]/5 border border-[#00E5FF]/20 text-[#00E5FF] px-2.5 py-1 rounded text-xs font-mono">
                                {file}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )}

              {/* Error messages */}
              {workflowError && (
                <Card className="p-6 bg-red-950/20 border-red-500/20 text-red-400 backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="shrink-0 mt-0.5 text-red-400" size={20} />
                    <div>
                      <h3 className="font-bold text-white text-base">Pipeline Interruption</h3>
                      <p className="text-sm mt-1">{workflowError}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Prompt Placeholder instructions when Idle */}
              {!isOrchestrating && !activeWorkflow && !workflowError && (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#374151]/50 rounded-2xl bg-[#111827]/10 backdrop-blur-md">
                  <Terminal size={48} className="text-gray-600 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Idle Console</h3>
                  <p className="text-gray-400 text-sm max-w-md text-center">
                    Enter a prompt instruction on the left to invoke the pipeline. The console will display real-time validations, compilation timing, and diff proposals.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Workspace Context */}
        {activeTab === "context" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Layers size={18} className="text-[#00E5FF]" />
                  Context Metrics
                </h3>
                
                {isContextLoading ? (
                  <div className="flex items-center gap-2 text-gray-400 py-4">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Querying files...</span>
                  </div>
                ) : (
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-500">Total Scan Files</span>
                      <span className="font-bold text-white">
                        {statistics.totalFiles || contextInfo.totalFiles || (contextInfo.entryPoints ? contextInfo.entryPoints.length : 0)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 block mb-2">Languages & Frameworks</span>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const langs = contextInfo.repository?.languages || repositoryInfo.technologies || [];
                          if (Array.isArray(langs) && langs.length > 0) {
                            return langs.map((lang: string) => (
                              <span key={lang} className="bg-gray-800 px-2.5 py-1 rounded text-xs text-[#00E5FF] font-mono border border-gray-700/60">
                                {lang}
                              </span>
                            ));
                          } else if (typeof langs === "object" && langs !== null && Object.keys(langs).length > 0) {
                            return Object.keys(langs).map((lang: string) => (
                              <span key={lang} className="bg-gray-800 px-2.5 py-1 rounded text-xs text-[#00E5FF] font-mono border border-gray-700/60">
                                {lang}: {(langs as any)[lang]}
                              </span>
                            ));
                          }
                          return <span className="text-xs text-gray-500">Node.js, TypeScript, React</span>;
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileCode size={18} className="text-[#00E5FF]" />
                  Target Entry Points
                </h3>
                
                {isContextLoading ? (
                  <div className="flex items-center gap-2 text-gray-400 py-4">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Loading entrypoints...</span>
                  </div>
                ) : contextInfo.entryPoints && contextInfo.entryPoints.length > 0 ? (
                  <div className="space-y-3">
                    {contextInfo.entryPoints.map((ep: string, epidx: number) => (
                      <div key={epidx} className="flex items-center gap-2 bg-gray-900/50 p-3 rounded-lg border border-gray-800 text-sm font-mono text-[#00E5FF]">
                        <FileCheck size={16} />
                        <span>{ep}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-4">No entry points detected in the root folders.</p>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Repository Intelligence */}
        {activeTab === "intelligence" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity size={18} className="text-[#00E5FF]" />
                Git Architecture Intelligence
              </h3>
              {isIntelLoading ? (
                <div className="flex items-center gap-2 text-gray-400 py-4">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Loading git states...</span>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Repository Name</span>
                    <span className="text-white font-semibold">{summary.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Default Branch</span>
                    <span className="text-white font-mono">{summary.defaultBranch}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Current Branch</span>
                    <span className="text-white font-mono">{summary.currentBranch}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-500">Remote Origin URL</span>
                    <span className="text-white font-mono truncate max-w-[280px]" title={summary.remoteUrl}>
                      {summary.remoteUrl || "localOnly"}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <GitCommit size={18} className="text-[#00E5FF]" />
                Last Verified Commit
              </h3>
              {isIntelLoading ? (
                <div className="flex items-center gap-2 text-gray-400 py-4">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Reading commits...</span>
                </div>
              ) : summary.lastCommit ? (
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-0.5 rounded border border-[#00E5FF]/20 font-mono">
                      {summary.lastCommit.hash?.substring(0, 8)}
                    </span>
                    <span className="text-xs text-gray-500">{summary.lastCommit.date}</span>
                  </div>
                  <p className="text-white text-sm font-semibold mb-2">{summary.lastCommit.message}</p>
                  <p className="text-xs text-gray-400">Author: {summary.lastCommit.author}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-4">No recent commits loaded in the repository.</p>
              )}
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};
