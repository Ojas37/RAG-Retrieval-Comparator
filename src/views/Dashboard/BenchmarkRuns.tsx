import React, { useState } from 'react';
import { 
  Play, 
  Download, 
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Terminal } from '../../components/Terminal';
import { type BenchmarkRun, MOCK_RUNS } from '../../utils/mockData';
import confetti from 'canvas-confetti';

interface BenchmarkRunsProps {
  activeRun: BenchmarkRun;
  onSelectRun: (run: BenchmarkRun) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  runProgress: number;
  setRunProgress: React.Dispatch<React.SetStateAction<number>>;
}

export const BenchmarkRuns: React.FC<BenchmarkRunsProps> = ({
  activeRun,
  onSelectRun,
  isRunning,
  setIsRunning,
  runProgress,
  setRunProgress,
}) => {
  const [runs] = useState<BenchmarkRun[]>(MOCK_RUNS);

  const startEvaluationRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setRunProgress(0);

    const interval = setInterval(() => {
      setRunProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          
          // Trigger confetti on successful compilation
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#8b5cf6', '#3b82f6'],
          });
          
          return 100;
        }
        return prev + 5; // Simulating fast progress
      });
    }, 800);
  };

  const stopEvaluationRun = () => {
    setIsRunning(false);
    setRunProgress(0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Simulation trigger banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
        <div className="lg:col-span-2 space-y-2 text-left">
          <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Benchmarking simulator
          </span>
          <h2 className="text-xl font-bold text-white">Execute a New RAG Benchmarking Run</h2>
          <p className="text-slate-400 text-xs leading-relaxed font-light">
            Triggering a new evaluation compiles document chunks, requests embeddings from OpenAI, loads them into postgres, constructs the pgvector HNSW index, and evaluates MRR recall bounds against 500 gold queries.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={startEvaluationRun}
            disabled={isRunning}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-blue-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] disabled:opacity-40 disabled:hover:shadow-none transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-4 h-4 text-white fill-white shrink-0 animate-pulse" />
            Trigger Evaluation Run
          </button>
        </div>
      </div>

      {/* Terminal log panel */}
      <Terminal
        isRunning={isRunning}
        onStopRun={stopEvaluationRun}
        runProgress={runProgress}
      />

      {/* Historical Runs Table */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Benchmarking Evaluation History
          </h3>

          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/5 text-[10px] text-slate-400 hover:text-white font-semibold transition-all">
              <Download className="w-3.5 h-3.5" />
              Export JSON Report
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 uppercase font-mono text-[9px]">
                <th className="py-3 px-4">Evaluation Run</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Corpus</th>
                <th className="py-3 px-4 font-mono text-center">MRR@10</th>
                <th className="py-3 px-4">Embedding Model</th>
                <th className="py-3 px-4">Index Type</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const isActive = run.id === activeRun.id;
                return (
                  <tr
                    key={run.id}
                    className={`border-b border-white/5 transition-colors cursor-pointer group ${
                      isActive 
                        ? 'bg-white/[0.03] border-l-2 border-l-cyan-400' 
                        : 'hover:bg-white/[0.01]'
                    }`}
                    onClick={() => onSelectRun(run)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {run.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{run.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold font-mono">
                        COMPLETED
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {run.corpusSize.toLocaleString()} doc-chunks
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white font-mono">
                      {run.hybrid.mrr10}
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[200px]">
                      {run.embeddingModel.split(' ')[0]}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold font-mono ${
                        run.indexType === 'HNSW' 
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                          : run.indexType === 'IVFFlat' 
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {run.indexType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRun(run);
                        }}
                        className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-[10px] text-cyan-400 font-bold transition-all"
                      >
                        LOAD RUN
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
