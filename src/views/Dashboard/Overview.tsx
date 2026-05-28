import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  Layers, 
  Sparkles,
  Activity,
  ArrowRight
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { type BenchmarkRun } from '../../utils/mockData';

interface OverviewProps {
  activeRun: BenchmarkRun;
  onNavigateToTab: (tab: any) => void;
}

export const Overview: React.FC<OverviewProps> = ({ activeRun, onNavigateToTab }) => {
  // Sparkline data mapping
  const sparklineData = {
    mrr: 'M 0 30 Q 15 10 30 25 T 60 5 T 90 20 T 120 10',
    latency: 'M 0 10 Q 15 25 30 8 T 60 28 T 90 12 T 120 22',
    throughput: 'M 0 25 Q 15 5 30 22 T 60 10 T 90 28 T 120 8',
  };

  const renderSparkline = (path: string, color: string) => (
    <svg className="w-24 h-10 shrink-0" viewBox="0 0 120 40" fill="none">
      <path d={path} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dynamic Runway status bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/35">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">ACTIVE AUDIT CONFIGURATION</h4>
            <p className="text-[10px] text-cyan-400 font-mono tracking-wide">
              {activeRun.name} ({activeRun.id})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-mono text-[10px] text-slate-400">
          <div>MODEL: <span className="text-white font-bold">{activeRun.embeddingModel.split(' ')[0]}</span></div>
          <div>CORPUS: <span className="text-white font-bold">{activeRun.corpusSize.toLocaleString()} documents</span></div>
          <div>INDEX: <span className="text-purple-400 font-bold uppercase">{activeRun.indexType}</span></div>
        </div>
      </div>

      {/* KPI METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* MRR@10 Metric */}
        <GlassCard glowColor="cyan" className="flex flex-col justify-between h-44">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">MRR@10 Accuracy</span>
              <span className="text-3xl font-extrabold text-white">{activeRun.hybrid.mrr10}</span>
            </div>
            {renderSparkline(sparklineData.mrr, '#06b6d4')}
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              +5.4% improvement
            </span>
            <span className="text-[9px] text-slate-500 font-mono">DENSE: {activeRun.dense.mrr10}</span>
          </div>
        </GlassCard>

        {/* Avg Latency Metric */}
        <GlassCard glowColor="purple" className="flex flex-col justify-between h-44">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">P95 LATENCY</span>
              <span className="text-3xl font-extrabold text-white">{activeRun.hybrid.p95LatencyMs} ms</span>
            </div>
            {renderSparkline(sparklineData.latency, '#8b5cf6')}
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              Hybrid computation overhead
            </span>
            <span className="text-[9px] text-slate-500 font-mono">SPARSE: {activeRun.sparse.p95LatencyMs}ms</span>
          </div>
        </GlassCard>

        {/* Recall@10 Metric */}
        <GlassCard glowColor="blue" className="flex flex-col justify-between h-44">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">RECALL@10 LIMIT</span>
              <span className="text-3xl font-extrabold text-white">{(activeRun.hybrid.recall10 * 100).toFixed(1)}%</span>
            </div>
            {renderSparkline(sparklineData.mrr, '#3b82f6')}
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              97.6% of gold retrieval
            </span>
            <span className="text-[9px] text-slate-500 font-mono">RECALL@5: {activeRun.hybrid.recall5}</span>
          </div>
        </GlassCard>
      </div>

      {/* DETAILED STATS SECOND ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Comparison Breakdown */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Retrieval Engine Breakdown</h3>
            </div>
            <button 
              onClick={() => onNavigateToTab('metrics')}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Analyze in Deep Charts <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Dense Strategy */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-cyan-400 font-bold uppercase font-mono">DENSE EMBEDDINGS</span>
                <span className="text-xs text-slate-300 font-mono">MRR@10: <b className="text-white font-bold">{activeRun.dense.mrr10}</b></span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                <div>Latency: <span className="text-white font-bold">{activeRun.dense.avgLatencyMs}ms</span></div>
                <div>Throughput: <span className="text-white font-bold">{activeRun.dense.throughputQps} QPS</span></div>
                <div>Index size: <span className="text-white font-bold">{activeRun.dense.indexSizeMb} MB</span></div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${activeRun.dense.mrr10 * 100}%` }} />
              </div>
            </div>

            {/* Sparse Strategy */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-400 font-bold uppercase font-mono">SPARSE KEYWORD</span>
                <span className="text-xs text-slate-300 font-mono">MRR@10: <b className="text-white font-bold">{activeRun.sparse.mrr10}</b></span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                <div>Latency: <span className="text-white font-bold">{activeRun.sparse.avgLatencyMs}ms</span></div>
                <div>Throughput: <span className="text-white font-bold">{activeRun.sparse.throughputQps} QPS</span></div>
                <div>Index size: <span className="text-white font-bold">{activeRun.sparse.indexSizeMb} MB</span></div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${activeRun.sparse.mrr10 * 100}%` }} />
              </div>
            </div>

            {/* Hybrid Strategy */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-400 font-bold uppercase font-mono">HYBRID FUSION (RRF)</span>
                <span className="text-xs text-slate-300 font-mono">MRR@10: <b className="text-white font-bold">{activeRun.hybrid.mrr10}</b></span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                <div>Latency: <span className="text-white font-bold">{activeRun.hybrid.avgLatencyMs}ms</span></div>
                <div>Throughput: <span className="text-white font-bold">{activeRun.hybrid.throughputQps} QPS</span></div>
                <div>Index size: <span className="text-white font-bold">{activeRun.hybrid.indexSizeMb} MB</span></div>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: `${activeRun.hybrid.mrr10 * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Live System Activity Feed */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
            <h3 className="font-bold text-sm text-white">Live Indexing Stream</h3>
          </div>

          <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 font-mono text-[10px] leading-relaxed text-slate-400">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 shrink-0">11:24</span>
              <span>[🐘 PGVECTOR] Preloaded HNSW graphs into shared memory cache buffers.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 shrink-0">11:20</span>
              <span>[⚙️ SYSTEM] active connection pool: 8/16 connections verified.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 shrink-0">11:15</span>
              <span>[🎯 AUDIT] Completed benchmark run evaluations for query cluster #4.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 shrink-0">11:02</span>
              <span>[📖 PIPELINE] Successfully ingested "vector_indexing_parameters.pdf".</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-slate-500 shrink-0">10:55</span>
              <span>[⚡ SYSTEM] Memory pool cleanup triggered ... 142MB released.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
