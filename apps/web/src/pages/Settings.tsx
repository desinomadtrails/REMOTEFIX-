import React, { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Database, 
  Network, 
  Check, 
  RefreshCw,
  SunMoon,
  Info
} from "lucide-react";
import { Button, Card } from "@remotefix/ui";
import { SEO } from "../components/SEO.js";

export const Settings: React.FC = () => {
  const [apiHost, setApiHost] = useState(localStorage.getItem("rf_api_host") || "http://localhost:8787");
  const [provider, setProvider] = useState(localStorage.getItem("rf_ai_provider") || "TokenRouter");
  const [isSaved, setIsSaved] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("rf_api_host", apiHost);
    localStorage.setItem("rf_ai_provider", provider);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedSuccess(false);
    try {
      const response = await fetch(`${apiHost}/api/seed`, { method: "POST" });
      if (response.ok) {
        setSeedSuccess(true);
      }
    } catch (err) {
      console.error("Failed to seed database:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO title="System Settings - RemoteFix Console" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <SettingsIcon size={28} className="text-[#00E5FF]" />
          System Settings
        </h1>
        <p className="text-gray-400 text-sm">
          Configure API endpoints, choose primary reasoning models, and access developer utilities.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: API configuration */}
        <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
            <Network size={18} className="text-[#00E5FF]" />
            API Connection Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                Backend API Host Address
              </label>
              <input 
                type="text" 
                value={apiHost}
                onChange={(e) => setApiHost(e.target.value)}
                className="w-full bg-[#1E293B] border border-[#475569] text-white rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-[#00E5FF]"
                required
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                The endpoint address of the running RemoteFix api server. Defaults to http://localhost:8787.
              </span>
            </div>
          </div>
        </Card>

        {/* Card 2: AI Provider Settings */}
        <Card className="p-6 bg-[#111827]/40 border-[#374151]/40 backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
            <Cpu size={18} className="text-[#00E5FF]" />
            Primary AI Provider
          </h3>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Model Endpoint Provider
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "TokenRouter", title: "TokenRouter (Failover)", desc: "Auto-routes between OpenRouter, Gemini, and Claude fallbacks." },
                { id: "Claude", title: "Anthropic Claude", desc: "Utilizes sonnet-3.5 directly via local API keys." },
                { id: "Gemini", title: "Google Gemini", desc: "Utilizes gemini-2.5-pro model directly." },
                { id: "OpenAI", title: "OpenAI GPT-4", desc: "Utilizes gpt-4o for code generation." }
              ].map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => setProvider(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    provider === opt.id 
                      ? "border-[#00E5FF] bg-[#00E5FF]/5" 
                      : "border-[#374151]/40 bg-[#111827]/20 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{opt.title}</span>
                    {provider === opt.id && <Check size={16} className="text-[#00E5FF]" />}
                  </div>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Save bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {isSaved && (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check size={16} />
                Settings saved successfully!
              </span>
            )}
          </div>
          <Button type="submit" variant="primary" className="cursor-pointer">
            Save Configuration
          </Button>
        </div>

      </form>

      {/* Developer Utilities Section */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Database size={20} className="text-[#00E5FF]" />
          Developer Utilities
        </h2>
        
        <Card className="p-6 bg-red-950/5 border-red-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Seed Local Database</h3>
              <p className="text-gray-400 text-xs">
                Populates your local SQLite/Azure SQL database with default mock projects, tickets, and metrics data.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer self-start sm:self-auto"
              onClick={handleSeed}
              disabled={isSeeding}
            >
              {isSeeding ? <RefreshCw className="animate-spin" size={16} /> : <Database size={16} />}
              {isSeeding ? "Seeding..." : "Execute Seeding"}
            </Button>
          </div>
          {seedSuccess && (
            <p className="text-emerald-400 text-xs mt-3 flex items-center gap-1">
              <Check size={14} />
              Database successfully seeded with default schemas.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
