import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FolderGit2, 
  GitBranch, 
  GitCommit, 
  Plus, 
  Terminal, 
  Settings as SettingsIcon,
  Activity, 
  Server, 
  Search,
  BookOpen, 
  ShieldCheck, 
  X,
  AlertTriangle,
  FolderOpen,
  Trash2
} from "lucide-react";
import { Button, Card } from "@remotefix/ui";
import { api } from "../services/api.js";
import { SEO } from "../components/SEO.js";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // Register form state
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch projects list
  const { data: projectsData, isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.getProjects(),
  });

  const projects = projectsData?.projects || [];

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (body: { name: string; path: string; description?: string }) => api.createProject(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsRegisterOpen(false);
      setName("");
      setPath("");
      setDescription("");
      setErrorMsg("");
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to register project repository.");
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim()) {
      setErrorMsg("Project name and local directory path are required.");
      return;
    }
    registerMutation.mutate({ name, path, description });
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO title="Developer Dashboard - RemoteFix Console" />

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            AI Developer Console
          </h1>
          <p className="text-gray-400 text-sm">
            Configure local workspace repositories and orchestrate complete AI reasoning and execution workflows.
          </p>
        </div>
        <Button 
          variant="primary" 
          className="flex items-center gap-2 self-start md:self-auto cursor-pointer"
          onClick={() => setIsRegisterOpen(true)}
        >
          <Plus size={16} />
          Register Project
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm font-medium">Registered Repos</span>
            <div className="p-2 bg-[#00E5FF]/10 text-[#00E5FF] rounded-lg border border-[#00E5FF]/20">
              <FolderGit2 size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{projects.length}</h3>
            <p className="text-xs text-gray-500 mt-1">Active workspaces ready</p>
          </div>
        </Card>

        <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm font-medium">Execution Engine</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-emerald-400">Isolated</h3>
            <p className="text-xs text-gray-500 mt-1">Git Worktree active</p>
          </div>
        </Card>

        <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm font-medium">System Health</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Server size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-emerald-400">Green</h3>
            <p className="text-xs text-gray-500 mt-1">API endpoints fully online</p>
          </div>
        </Card>

        <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm font-medium">Recent Activity</span>
            <div className="p-2 bg-[#00E5FF]/10 text-[#00E5FF] rounded-lg border border-[#00E5FF]/20">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">None</h3>
            <p className="text-xs text-gray-500 mt-1">Ready for orchestration</p>
          </div>
        </Card>
      </div>

      {/* Repository search and filter */}
      <div className="flex items-center gap-3 bg-[#111827]/40 border border-[#374151]/40 rounded-xl px-4 py-3 mb-8 backdrop-blur-md">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Filter registered repositories by name or path..." 
          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Projects list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Querying active projects from SQL Registry...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#374151]/60 rounded-2xl bg-[#111827]/10 backdrop-blur-md">
          <FolderOpen size={48} className="text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Projects Found</h3>
          <p className="text-gray-400 text-sm max-w-md text-center mb-6">
            Register a local workspace folder containing a git repository to start planning, coding, and testing using AI.
          </p>
          <Button variant="outline" onClick={() => setIsRegisterOpen(true)} className="cursor-pointer">
            Register First Workspace
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <Card key={p.id} className="relative group overflow-hidden border border-[#374151]/40 bg-[#111827]/30 hover:border-[#00E5FF]/40 hover:bg-[#111827]/50 transition-all duration-300 rounded-xl flex flex-col justify-between">
              
              {/* Header card border glow */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF]/0 to-transparent group-hover:via-[#00E5FF]/40 transition-all duration-500" />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gray-800/60 rounded-xl border border-gray-700/50 group-hover:border-[#00E5FF]/30 transition-all">
                    <FolderGit2 size={24} className="text-[#00E5FF]" />
                  </div>
                  
                  {/* Delete project button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to remove this project registration? The files on disk will NOT be touched.")) {
                        deleteMutation.mutate(p.id);
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#00E5FF] transition-colors">
                  {p.name}
                </h3>
                <p className="text-gray-400 text-xs font-mono mb-4 truncate" title={p.path}>
                  {p.path}
                </p>
                <p className="text-gray-400 text-sm line-clamp-2 min-h-10">
                  {p.description || "No description provided."}
                </p>
              </div>

              <div className="p-6 pt-0 border-t border-[#374151]/30 mt-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                  <GitBranch size={14} />
                  <span>main</span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="group-hover:bg-[#00E5FF] group-hover:text-black group-hover:border-[#00E5FF] transition-all cursor-pointer"
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  Open Workspace
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Register Project Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0F172A] border border-[#374151]/70 rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => { setIsRegisterOpen(false); setErrorMsg(""); }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-2">Register Local Repository</h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter the details of a local folder containing a valid Git workspace repository.
            </p>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Project Name *
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., RemoteFix Backend" 
                  className="w-full bg-[#1E293B] border border-[#475569] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00E5FF]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Absolute Folder Path *
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., e:\SURAJ\REMOTEFIX-" 
                  className="w-full bg-[#1E293B] border border-[#475569] text-white rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-[#00E5FF]"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  required
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Must point to a local directory with a .git repository.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea 
                  rows={3}
                  placeholder="Summarize features or architecture scope..." 
                  className="w-full bg-[#1E293B] border border-[#475569] text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00E5FF] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#374151]/30">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { setIsRegisterOpen(false); setErrorMsg(""); }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex items-center gap-1.5 cursor-pointer"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Registering..." : "Save Workspace"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
