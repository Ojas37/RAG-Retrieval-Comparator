import React, { useState } from 'react';
import { 
  Database, 
  HelpCircle, 
  Sliders, 
  Check,
  Cpu
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export const Settings: React.FC = () => {
  const [hnswM, setHnswM] = useState(16);
  const [hnswEfConst, setHnswEfConst] = useState(64);
  const [hnswEfSearch, setHnswEfSearch] = useState(40);
  
  const [dbHost, setDbHost] = useState('postgresql://localhost:5432/rag_bench');
  const [apiKey, setApiKey] = useState('sk-proj-....................');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in pr-2 text-left font-sans text-xs">
      
      {/* Left Column: pgvector tuning parameters */}
      <div className="lg:col-span-3 space-y-6">
        <form onSubmit={handleSave} className="glass-panel p-6 rounded-xl space-y-6">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            pgvector Index Parameter Tuning
          </h3>

          <div className="space-y-6">
            {/* HNSW M Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-slate-400 font-semibold uppercase flex items-center gap-1">
                  HNSW connection limit (M) 
                  <span title="Max links per index node. High values improve recall but increase build time.">
                    <HelpCircle className="w-3 h-3 text-slate-600" />
                  </span>
                </span>
                <span className="text-cyan-400 font-bold">{hnswM} links</span>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                step="4"
                value={hnswM}
                onChange={(e) => setHnswM(Number(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* HNSW ef_construction Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-slate-400 font-semibold uppercase flex items-center gap-1">
                  ef_construction
                  <span title="Candidate list size during HNSW graph creation. High values boost recall but expand compiler time.">
                    <HelpCircle className="w-3 h-3 text-slate-600" />
                  </span>
                </span>
                <span className="text-cyan-400 font-bold">{hnswEfConst} candidates</span>
              </div>
              <input
                type="range"
                min="32"
                max="256"
                step="8"
                value={hnswEfConst}
                onChange={(e) => setHnswEfConst(Number(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* HNSW ef_search Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-slate-400 font-semibold uppercase flex items-center gap-1">
                  ef_search
                  <span title="Candidate list size during queries. Elevating ef_search improves accuracy at a marginal latency penalty.">
                    <HelpCircle className="w-3 h-3 text-slate-600" />
                  </span>
                </span>
                <span className="text-cyan-400 font-bold">{hnswEfSearch} candidates</span>
              </div>
              <input
                type="range"
                min="16"
                max="128"
                step="8"
                value={hnswEfSearch}
                onChange={(e) => setHnswEfSearch(Number(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                Index parameters apply to subsequent compile runs.
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    SAVED!
                  </>
                ) : (
                  'Save Parameters'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Right Column: Connection settings & key managers */}
      <div className="lg:col-span-2 space-y-6">
        <GlassCard interactive={false} className="space-y-4 border-l-2 border-l-purple-400">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Database className="w-4 h-4 text-purple-400" />
            Active Data Source
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold block uppercase font-mono text-[9px]">Postgresql Connection string</label>
              <input
                type="text"
                value={dbHost}
                onChange={(e) => setDbHost(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 font-semibold block uppercase font-mono text-[9px]">OpenAI API Key credential</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none font-mono"
              />
            </div>
          </div>
        </GlassCard>

        {/* PostgreSQL cache parameters stats */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5 font-mono">
            <Cpu className="w-4 h-4 text-purple-400 animate-pulse" />
            Elephant Cache Metrics
          </h3>

          <div className="space-y-3 font-mono text-[10px] text-slate-400">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>shared_buffers:</span>
              <span className="text-white font-bold">1024 MB</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>maintenance_work_mem:</span>
              <span className="text-white font-bold">512 MB</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>work_mem:</span>
              <span className="text-white font-bold">64 MB</span>
            </div>
            <div className="flex justify-between">
              <span>pgvector version:</span>
              <span className="text-emerald-400 font-bold">0.5.1 compiled</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
